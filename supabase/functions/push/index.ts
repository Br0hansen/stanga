// Edge-funksjonen «push»: sender det som ligger i utboksen (push_outbox) som pushvarsler.
// Databasen kaller den når noe nytt er lagt i utboksen (se migrasjonen pushvarsler).
// Kallet trenger ingen nøkkel (verify_jwt er av): funksjonen sender bare det som allerede ligger klart,
// og hvert varsel merkes som sendt idet det hentes, så det aldri sendes to ganger.
import { newVapid, send, type Vapid } from './webpush.ts';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const KEY = (() => { try { return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default; } catch { return null; } })()
  || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CONTACT = 'https://br0hansen.github.io/stanga/';

async function rest(path: string, init: RequestInit = {}){
  const h: Record<string, string> = {apikey: KEY, 'Content-Type': 'application/json'};
  if (!KEY.startsWith('sb_')) h.Authorization = 'Bearer ' + KEY;
  const res = await fetch(SB_URL + '/rest/v1/' + path, {...init, headers: h});
  const txt = await res.text();
  if (!res.ok) throw new Error(path + ': ' + res.status + ' ' + txt);
  return txt ? JSON.parse(txt) : null;
}
const rpc = (fn: string, body: unknown = {}) => rest('rpc/' + fn, {method: 'POST', body: JSON.stringify(body)});

// VAPID-nøklene ligger i Vault. Første gang lages de her og lagres.
let vapid: Vapid | null = null;
async function keys(){
  if (!vapid) vapid = (await rpc('push_vapid')) || (await rpc('push_vapid_set', {v: await newVapid()}));
  return vapid!;
}

Deno.serve(async () => {
  try {
    const v = await keys();
    const jobs: {id: number; endpoint: string; p256dh: string; auth: string; payload: unknown}[] = await rpc('push_claim');
    let sent = 0, gone = 0, failed = 0;
    await Promise.all(jobs.map(async j => {
      try {
        const status = await send(j, j.payload, v, CONTACT);
        if (status === 404 || status === 410) {
          gone++; await rest('push_subscriptions?endpoint=eq.' + encodeURIComponent(j.endpoint), {method: 'DELETE'});
        } else if (status >= 200 && status < 300) sent++;
        else { failed++; console.log('push avvist', status, new URL(j.endpoint).host); }
      } catch (e) { failed++; console.log('push feilet', new URL(j.endpoint).host, String(e)); }
    }));
    return Response.json({sent, gone, failed});
  } catch (e) {
    console.error(String(e));
    return Response.json({error: 'Noe gikk galt'}, {status: 500});
  }
});
