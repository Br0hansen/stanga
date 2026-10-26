# Trene sammen – design

Dato: 2026-10-24 · Status: bygget (APP_VERSION 29). Jonas ga klarsignal til å bygge uten egen godkjenningsrunde av dokumentet.

## Hva og hvorfor

Stanga er en treningsapp på hjemskjermen der alt i dag ligger lokalt på telefonen. Avtaler om å trene sammen med bekjente skjer nå på SMS og telefon, med forslag fram og tilbake. «Trene sammen» skal erstatte det: du legger ut at du skal trene, og vennene dine kan bli med.

Det er to grunner til å trene sammen, og begge skal støttes: noen ganger er det bare sosialt å være på samme sted samtidig, og andre ganger vil dere kjøre akkurat samme økt.

## Mål

- Du kan legge ut en **time** på to måter:
  - **Fast tid:** «I dag kl. 17.» Venner melder seg på.
  - **Tidsvindu:** «I dag mellom 16 og 18.» Venner foreslår et tidspunkt innenfor vinduet, eventuelt med en kort kommentar. Når du velger et forslag, blir timen fast, og de som foreslo det tidspunktet, står som påmeldt. De kan melde seg av igjen.
- En time har dag, tid, sted (fritekst) og en valgfri økt: «Bare trene samtidig», «Metcon fra øktbanken» eller «Skriv selv» (fritekst).
- Timer er **bare synlige for venner**. Venner legges til ved å søke på **brukernavn**. Den andre må godta forespørselen før dere er venner.
- Når appen åpnes, viser **Sammen-fanen et tall** for det som er nytt siden sist: forslag og påmeldinger på dine timer, nye timer fra venner, og venneforespørsler. Øverst i fanen står en «Nytt»-liste.
- Du kan endre og avlyse egne timer, og melde deg av andres.
- **Konto er valgfritt.** Sammen-fanen vises for alle. Uten konto viser den en side for å lage konto eller logge inn. Med konto vises den slik skissene viser.

## Ikke mål

- Push-varsler. Det holder med tallet i fanen når appen åpnes.
- Innsamling av bruksdata eller analyse.
- Å dele treningslogg, vekter eller historikk med andre. Loggen forblir lokal.
- Å synkronisere programmer og logg til skyen.
- Åpen oversikt over alle brukere eller offentlige timer.
- Chat. Den korte kommentaren på et tidsforslag er det eneste fritekst-sporet mellom brukere.

## Anti-mål (dette ville vært feil selv om det virker)

- At noen må lage konto for å bruke appen som i dag.
- At timer, brukernavn eller venneliste kan leses av andre enn de som skal se dem. Tilgangsreglene i databasen er den viktigste delen av jobben.
- At appen slutter å virke uten nett. Alt utenfor Sammen-fanen skal virke som før, også offline.
- At Sammen-delen gjør resten av appen tregere å starte.

## Rammer

- **Appen er en statisk PWA på GitHub Pages:** én `index.html` med all CSS og JS, ingen byggesteg, `sw.js` for offline. Slik skal det fortsatt være. Supabase-klienten lastes fra CDN med låst versjon, på samme måte som skriftene.
- **Supabase-prosjekt finnes allerede:** «stanga» (ref `ueqteavqpityrmuczkoc`), region `eu-west-1` (Irland), tomt. Gratisnivået brukes. Gratisprosjekter settes på pause etter en uke uten trafikk og må startes manuelt. Det er akseptert for nå.
- **iPhone-hjemskjermapper har egen lagring, atskilt fra Safari.** En innloggingslenke på e-post åpner seg i Safari og logger inn der, ikke i hjemskjermappen. Derfor må innloggingen skje med en **engangskode på e-post** (6 sifre) som skrives inn i appen.
- All tekst i appen er på norsk (bokmål), i samme tone som resten av appen.
- Designet følger skissene «Trene sammen – utkast» (Sammen, Ny time, Din time med forslag, Venner) og den nye økt-designen: mørk flate, Barlow/Barlow Condensed, blå aksent, minst 44 px trykkflater.
- `APP_VERSION` økes ved endring, som beskrevet i README.

## Bestemt av Jonas

- Konto er valgfritt. Sammen-fanen vises for alle og viser kontoopprettelse når man ikke har konto.
- Venner legges til med brukernavn.
- Ingen push-varsler, bare tall i fanen ved åpning.
- Timer er bare synlige for venner.
- To typer timer, fast tid og tidsvindu med forslag, som beskrevet over.
- Økt på timen er valgfritt og kan være bare samvær eller samme økt.
- Supabase brukes som database og innlogging.
- Skissene er godkjent som retning («ser veldig bra ut»).

## Mine valg (kan overstyres)

- **Innlogging:** ~~Engangskode på e-post~~. Endret til e-post og passord uten e-postbekreftelse, med «glemt passord» via e-post (Jonas sitt valg, se under). Google- og Apple-innlogging kan komme senere. Ved første innlogging velger du brukernavn (unikt, små bokstaver, tall, punktum og understrek, 3–20 tegn) og eventuelt et visningsnavn.
- **Gjensidige venneforespørsler** (vises i skissen): Forespørsel, så godta eller avslå. Avslag er stille, og avsenderen ser bare «Sendt». Du kan fjerne en venn.
- **Nye ting hentes når Sammen-fanen åpnes og når appen våkner,** ikke i sanntid. Tallet i fanen beregnes ved oppstart når det er nett. Sist sett-tidspunktet lagres på kontoen, så tallet stemmer på tvers av enheter.
- **Fanerekkefølge:** Økt, Programmer, Sammen, Logg, Mer.
- **Gamle timer** forsvinner fra oversikten når sluttiden er passert. Fast tid regnes som to timer lang. Avlyste timer vises overstrøket for de påmeldte til tidspunktet er passert.
- **Metcon fra øktbanken** lagres som økt-ID og navn. Alle har samme `okter.json`, så teksten vises lokalt hos hver enkelt.
- **Tidssone:** Europe/Oslo i visning, `timestamptz` i databasen.
- **Personvern:** Under Mer kommer en kort personvernerklæring (hva lagres, hvor, og hvorfor), utlogging og «Slett konto», som sletter alt om deg i databasen.

## Hvordan dataene henger sammen (forslag)

Tabellene under er en skisse. Byggeren bestemmer endelig form.

- `profiles` – én per konto: `id` (= auth-bruker), `username` (unik), `display_name`, `last_seen_at`.
- `friendships` – `requester`, `addressee`, `status` (`pending` / `accepted`), `created_at`.
- `sessions` – timer: `owner`, `kind` (`fixed` / `window`), `starts_at`, `ends_at` (bare for vindu), `place`, `workout_kind` (`none` / `bank` / `text`), `workout_ref`, `workout_text`, `cancelled_at`, `created_at`.
- `participants` – `session_id`, `user_id`, `created_at`. Eieren regnes alltid som med.
- `proposals` – `session_id`, `user_id`, `proposed_at` (tid), `comment` (kort), `created_at`.

**Tilgangsregler (må stemme):**
- En profil kan søkes opp på brukernavn av innloggede, men bare brukernavn og visningsnavn er synlig. E-post ligger aldri i `profiles`.
- En time kan leses av eieren og av godtatte venner av eieren. Bare eieren kan endre eller avlyse den.
- Påmeldinger og forslag kan leses av alle som kan se timen. Du kan bare legge inn og fjerne dine egne. Forslag går bare på timer med tidsvindu som ikke er avlyst.
- Venneforespørsler kan leses av de to involverte. Bare mottakeren kan godta.
- Alt annet er stengt.

## Ferdig når

- En person uten konto merker ingen forskjell utenom at Sammen-fanen finnes og inviterer til konto.
- To testbrukere kan bli venner, legge ut begge typer timer, foreslå, velge, melde seg på og av, og se tallet i fanen.
- En tredje testbruker som ikke er venn, kan verken se timene eller påmeldingene, verken i appen eller ved å spørre databasen direkte med den offentlige nøkkelen.
- Appen starter og virker offline som før. Sammen-fanen sier tydelig fra når den ikke har nett.

## Slik ble det bygget

- **Klient:** En liten egen klient med `fetch` mot Supabase sine REST- og auth-endepunkter, i stedet for Supabase-biblioteket. Da trengs ingen ekstra nedlasting ved oppstart, og appen starter offline som før. Innloggingen lagres i `localStorage` under `stanga.auth`, atskilt fra treningsdataene.
- **Database:** `supabase/migrations/`. Hjelpefunksjonene for tilgang ligger i skjemaet `private`, som ikke er eksponert i API-et. Søk på brukernavn går gjennom `search_profiles` (minst to tegn, maks ti treff), så hele brukerlisten ikke kan hentes ut. Å velge et forslag skjer i `pick_proposal`, og å slette kontoen i `delete_account`.
- **Sist sett** ligger i en egen tabell `seen`, så tidspunktet ikke er synlig for andre.
- **Service worker:** Svar fra `*.supabase.co` mellomlagres aldri (`SHELL` er økt til `stanga-shell-2`).
- **Testet:** Tilgangsreglene med tre testbrukere (24 sjekker, inkludert forsøk på å utgi seg for andre og lesing som anonym), og hele flyten i appen mot den ekte databasen: konto, brukernavn, venner, begge typer timer, forslag, påmelding, valg av forslag, endring, avlysning og sletting av konto. Testdataene er slettet.
- **Endret innlogging (APP_VERSION 28):** Supabase krever nå egen SMTP for å endre e-postmalene, og standardmalen sender bare en lenke. Jonas valgte derfor e-post og passord uten e-postbekreftelse. «Glemt passord» bruker standard e-post med lenke til Site URL. Appen leser nøkkelen fra adressen etter `#`, viser en side for nytt passord og rydder adressen. Testet: lag konto, dobbel registrering, feil passord, innlogging, nytt passord og utløpt lenke. Selve e-posten for glemt passord er ikke testet, fordi den krever en ekte adresse.
- **Glemt passord med kode (APP_VERSION 29):** Brevo er satt opp som SMTP i Supabase, og malen *Reset password* sender en sekssifret kode på norsk. Appen tar koden og det nye passordet i samme skjerm: `verify` med `type: recovery` gir en innlogging, og så lagres passordet med `PUT /auth/v1/user`. Lenkehåndteringen etter `#` er beholdt for eldre e-poster. Testet lokalt: sending (til en adresse uten konto, så ingen e-post ble sendt), for kort kode, for kort passord og feil kode. En ekte e-post med kode er ikke testet.

- **Pushvarsler (APP_VERSION 34):** Jonas ombestemte seg 26.10.2026 og ville ha varsel når noen melder seg på timene hans. Ikke-målet om push-varsler gjelder derfor ikke lenger. Slik virker det:
  - Appen ber om lov fra et trykk (iPhone krever det), abonnerer med den offentlige VAPID-nøkkelen (`push_public_key`) og lagrer abonnementet med `push_register`. Ved utlogging fjernes abonnementet.
  - Triggere på `participants` og `proposals` legger varselet i `push_outbox` og vekker edge-funksjonen `push` med `pg_net`. Påmeldinger som skjer når eieren velger et tidsforslag, gir ikke varsel, fordi det er eieren selv som gjør det.
  - Funksjonen henter og merker varslene som sendt i ett steg (`push_claim`), krypterer dem etter RFC 8291 med WebCrypto og sender. Abonnementer som er borte (404/410), slettes. Kallet trenger ingen nøkkel, fordi funksjonen bare sender det som allerede ligger i utboksen.
  - VAPID-nøklene lages av funksjonen første gang og ligger i Vault (`push_vapid`), aldri i koden.
  - Utboksen er stengt for alle utenom funksjonen (`service_role`). Varsler eldre enn sju dager slettes.
  - Testet: krypteringen og VAPID-signaturen mot referanseimplementasjonen `http_ece` (11 sjekker). Triggere og tilgang i databasen med tre testbrukere i en transaksjon som ble rullet tilbake (14 sjekker). Den utlagte funksjonen mot Apple, Google og Mozilla med falske abonnementer: Apple godtar signaturen og avviser bare det falske abonnementet, og Google og Mozilla svarer at abonnementene er borte, så funksjonen sletter dem. Testdataene er slettet. Et ekte varsel på telefon er ikke testet.

## Overlatt til byggeren

- Endelig databaseskjema, indekser og om noe løses med databasefunksjoner.
- Hvordan Supabase-klienten lastes og bufres uten å bryte offline-oppstart.
- Detaljer i skjermene utover skissene: tomtilstander, feilmeldinger og lastetilstander.
- Hvordan testbrukerne og verifiseringen av tilgangsreglene settes opp.
