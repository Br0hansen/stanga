// Web push uten eksterne pakker, bare WebCrypto (virker likt i Deno og Node).
// Innholdet krypteres etter RFC 8291 (aes128gcm), og avsenderen identifiseres med VAPID (RFC 8292).

export type Sub = { endpoint: string; p256dh: string; auth: string };
export type Vapid = { publicKey: string; privateJwk: JsonWebKey };

const te = new TextEncoder();
const b64u = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
const cat = (...a: Uint8Array[]) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, bytes: number){
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name: 'HKDF', hash: 'SHA-256', salt, info}, k, bytes * 8));
}

// Nytt VAPID-nøkkelpar. Den offentlige nøkkelen gis til nettleseren når den abonnerer.
export async function newVapid(): Promise<Vapid> {
  const k = await crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']) as CryptoKeyPair;
  return {publicKey: b64u(new Uint8Array(await crypto.subtle.exportKey('raw', k.publicKey))), privateJwk: await crypto.subtle.exportKey('jwk', k.privateKey)};
}

// Krypter innholdet til én mottaker: én post med salt, postlengde og avsenderens engangsnøkkel først
export async function encrypt(sub: Sub, text: string, salt = crypto.getRandomValues(new Uint8Array(16))){
  const ua = unb64u(sub.p256dh), secret = unb64u(sub.auth);
  const eph = await crypto.subtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveBits']) as CryptoKeyPair;
  const as = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', ua, {name: 'ECDH', namedCurve: 'P-256'}, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({name: 'ECDH', public: uaKey}, eph.privateKey, 256));
  const ikm = await hkdf(secret, shared, cat(te.encode('WebPush: info\0'), ua, as), 32);
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv: nonce}, key, cat(te.encode(text), new Uint8Array([2]))));
  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096);
  return cat(salt, rs, new Uint8Array([as.length]), as, ct);
}

// VAPID: en signert lapp som sier hvem som sender, gyldig i 12 timer, for push-tjenesten til mottakeren
export async function vapidHeader(endpoint: string, v: Vapid, sub: string){
  const enc = (o: unknown) => b64u(te.encode(JSON.stringify(o)));
  const body = enc({typ: 'JWT', alg: 'ES256'}) + '.' + enc({aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub});
  const key = await crypto.subtle.importKey('jwk', v.privateJwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, key, te.encode(body)));
  return `vapid t=${body}.${b64u(sig)}, k=${v.publicKey}`;
}

// Send ett varsel. Svarer med statuskoden fra push-tjenesten (201 er sendt, 404 og 410 betyr at abonnementet er borte).
export async function send(sub: Sub, payload: unknown, v: Vapid, contact: string){
  const res = await fetch(sub.endpoint, {method: 'POST', headers: {
    Authorization: await vapidHeader(sub.endpoint, v, contact),
    'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'high',
  }, body: await encrypt(sub, JSON.stringify(payload))});
  await res.body?.cancel();
  return res.status;
}
