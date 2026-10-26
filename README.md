# Stanga – treningsapp på hjemskjermen

Styrkeprogrammer (StrongLifts 5×5, Starting Strength, GZCLP, 5/3/1 FSL og BBB, Juggernaut, Cube Method og Strength & Power), øktbank med metcons og treningslogg. Alle data lagres lokalt på telefonen.

## I økta

- **Øktoversikten** har en fremdriftslinje med én bit per øvelse. Øvelsen du holder på med har blå ramme. Det store tallet i kortet er alltid neste sett, med skivene rett under: først oppvarmingssettene, så arbeidsvekten. Ferdige øvelser blir én linje når du begynner på neste. Øvelser du ikke har begynt på, står som én linje med navn og vekt. Trykk på en linje for å åpne den.
- **Fullfør økt** spør først hvis noen sett ikke er logget, og sier hvilke løft som regnes som bom og hvilke som står på samme vekt.
- **Under settene** står «Trykk = gjort · trykk igjen = én rep mindre» så lenge øvelsen er i gang.
- **Etter styrken** er én rad med «+ Kondisjon» (når Pete Plan er på), «+ Metcon» og «+ Notat». Trykk for å åpne en del. En del med innhold, for eksempel en valgt Pete Plan-økt eller et notat, står åpen. Metcon-budsjettet ligger under «+ Metcon».
- **Under «Fullfør økt»** står «Se planen», «Logg fri økt» og «Hopp over økta».
- **Hopp over økta** Du får en bekreftelse som sier hvilke løft som ikke får økning den gangen. Økta står som «Hoppet over» i loggen og i hele planen, men teller ikke som treningsdag.
- **Oppvarming** er en rad med små sett over arbeidssettene, med vekten under hvert sett. Neste oppvarmingssett står som det store tallet i kortet, med skiver per side. Raden blir stående når oppvarmingen er gjort, så arbeidssettene ikke flytter seg. Hovedløft får full oppvarming, sekundærøvelser to korte sett. Settene kan trykkes som gjort og gir 60 sekunders pause, men teller ikke som arbeidssett og lagres ikke i loggen.
- **Pauser etter type sett**, slik forskningen anbefaler: tunge sett 3 min, volumsett 2 min og lette hjelpeøvelser 90 s. Strength & Power, Cube og Juggernaut har egne pauser. Oppvarming gir 60 s, og 2 min etter siste oppvarmingssett. Under Mer kan alle pauser skaleres til Kortere (75 %) eller Lengre (125 %).
- **Pausen vises over hele skjermen.** Et svakt farget lag synker nedover mens pausen går: blått først, gult de siste 10 sekundene. Tiden står stort i linjen nederst, sammen med neste sett og knappene «+30 s» og «Start nå». Et lite merke følger også kanten av laget når den er nede på skjermen. Ved null blinker skjermen grønt én gang, laget forsvinner, og linjen sier «Klar for neste sett». Går du over, teller tiden oppover i grønt (+0:12). Lyd ved slutten kan slås på under Mer.
- **Skiver per side** regnes ut med 20 kg stang og skivene 20, 15, 10, 5, 2,5 og 1,25 kg. 25 kg er bevisst utelatt.
- **Hele planen** vises på programsiden før du aktiverer, og via «Se planen» under økta. Planen viser vektene hvis alt går som planlagt, fullførte økter viser det du faktisk løftet, og resten oppdateres etter hver økt. Programmer uten fast slutt vises 12 uker fram.

## Sammen (trene med venner)

En egen fane der du legger ut når du skal trene, og vennene dine kan bli med. Konto er valgfritt. Uten konto virker appen akkurat som før, og Sammen-fanen viser bare en side for å lage konto.

- **Innlogging** skjer med e-post og passord rett i appen. Det er ingen e-postbekreftelse, så du er innlogget med en gang. **Glemt passord?** sender en sekssifret kode på e-post. Koden og det nye passordet skrives inn rett i appen.
- **Brukernavn** velges første gang. Venner legges til ved å søke på brukernavn, og den andre må godta.
- **To typer timer:** fast tid (andre melder seg på) og tidsvindu (andre foreslår et tidspunkt). Når du velger et forslag, blir timen fast, og de som foreslo det, står som påmeldt.
- **Økt på timen** er valgfritt: bare trene samtidig, en metcon fra øktbanken eller fritekst.
- **Nytt:** Fanen viser et tall for nye forslag, påmeldinger, timer og venneforespørsler når appen åpnes.
- **Chat:** Øverst i Sammen velger du **Timer** eller **Chat**. Under Chat kan du skrive til én venn eller lage en gruppe med venner. Alle i en gruppe kan legge til vennene sine, og de nye ser hele samtalen. Hver time har sin egen chat for eieren og alle som er påmeldt, og den finnes også som knapp på timen. Nye meldinger hentes hvert fjerde sekund mens samtalen er åpen. Bare de som er med i en samtale, kan lese den.
- **Varsler:** Slå på under **Mer → Varsler** eller fra kortet øverst i Sammen. Da får du pushvarsel når noen blir med på eller foreslår tid på timene dine, og når noen skriver i en samtale du er med i. Et trykk på varselet åpner timen eller samtalen. Fra en samtale får du ett varsel til du har lest den, uansett hvor mange meldinger som kommer. Har du samtalen åpen på skjermen, kommer det ikke varsel fra den. Ikonet på Hjem-skjermen viser samme tall som Sammen-fanen. Mens appen er lukket, følger tallet med varselet: samtaler med uleste meldinger og nye påmeldinger og forslag. Merker kan slås av i Innstillinger → Varslinger → Stanga. Hver telefon slår det på selv. På iPhone virker det bare når appen er åpnet fra Hjem-skjermen (iOS 16.4 eller nyere). Samme varsel fra samme person sendes høyst én gang per ti minutter. Når du logger ut, slås varslene av på telefonen.
- **Bare dette lagres i skyen** (Supabase, EU): e-post, brukernavn, navn, venner, timer, påmeldinger, forslag, chatmeldinger og adressen for varsler hvis du har slått dem på. Treningsloggen blir på telefonen. Under **Mer → Konto for Sammen** kan du logge ut eller slette kontoen.
- **Tilgang:** Reglene i databasen sørger for at bare venner ser timene dine. SQL-en ligger i `supabase/migrations/`.

**Oppsett i Supabase (gjort):** *Confirm email* er slått av under *Authentication → Sign In / Providers*. E-post sendes gjennom Brevo (*Authentication → Emails → SMTP Settings*, `smtp-relay.brevo.com`, port 587), og malen *Reset password* er på norsk med `{{ .Token }}`. Avsender er foreløpig en gmail-adresse, som Brevo ikke anbefaler. Med eget domene kommer e-postene sikrere fram. *Site URL* er `https://br0hansen.github.io/stanga/`. Gratisprosjekter settes på pause etter en uke uten bruk og må da startes igjen i dashbordet.

## Pete Plan

Et fast kondisjonsvalg ved siden av øktbanken, på romaskin, ski eller sykkel. Kan slås av og på under **Mer → Pete Plan**.

- Planen er Pete Marstons tre-ukers rotasjon med seks økter per uke, kontrollert mot hans egen tabell. Appen husker hvor du er og går videre én økt om gangen.
- Målfarten regnes ut fra referansetiden din: 2000 m på romaskin og ski, 4000 m på sykkel.
- Appen regner også baklengs: snittfarten fra intervalløkter og hard distanse, minus tillegget for økta, gir et anslag på 2K-tiden din nå. Medianen av de tre siste anslagene fra seks uker brukes, så de rolige øktene følger utviklingen din. En ny testet tid går foran til nyere økter gir et nytt anslag.
- Resultatet kan skrives inn som snittfart eller som tid per drag (total tid for ett drag). Kortet viser målet på begge måter.
- Progresjon fra planen: snittfarten fra en intervalløkt blir målet neste gang samme økt kommer. Hard distanse viser din beste tid.
- På sykkel dobles distansen, og farten vises per 1000 m.
- **Tilpasset styrke** er vår egen tilpasning, ikke en del av Pete Plan: samme intervaller, men rolige økter på 6 km og hard distanse på 5 km. **Original** har 15 km og 8 km rolig og 10 km hardt.
- Økta teller som kondisjon i metcon-budsjettet, med beregnede minutter som forslag.

## Programguide

Under **Programmer → Programguide** står det hva hvert program fokuserer på, hvem det passer for, hva forskningen sier og hva man realistisk kan forvente. Hver påstand har et evidensnivå (A, B, C eller H) og lenke til kilden. Teksten ligger i `GUIDE`, `GUIDE_GENERAL` og `REFS` i `index.html`. Kildene ble slått opp i PubMed i oktober 2026.

## Strength & Power

- Ett hovedløft per økt: benk på dag 1, knebøy på dag 2 og power clean på dag 3.
- Sekundærøvelser: pausebenk eller smal benk på knebøydagen, clean pull og frontbøy på clean-dagen. Vekten styres av RPE med mål 6–7,5.
- Uke 4 og 8 er lette uker. Appen viser RPE og 1RM-trend, og du kan hoppe over uka hvis tallene er gode.
- Uke 11 er taper med halvert volum. Uke 12 er test.

## ATHX i øktbanken

17 økter for ATHX Games 2027 ligger først i øktbanken med typen **ATHX**: Strength, Endurance og Metcon X slik de er på stevnet (individuelt og for par, med vektene for PRO og LITE), og treningsøktene fra planen: mini-Metcon X, Metcon X i deler, løp rett på ski, ski-intervaller og generalprøven. Under «Tilfeldig temaøkt» finnes en egen ATHX-knapp. Øktene er laget av oss, ikke hentet fra Sarpsborg, og har derfor ingen dato eller antall kjøringer. Hele planen, med faser og anslag, står i `docs/superpowers/specs/2026-10-26-athx-2027-treningsplan.md`. Den er ennå ikke et program i appen.

## Metcon-budsjett

Når du merker «Metcon i dag», velger en økt fra øktbanken eller logger en fri økt, kan du legge inn type, minutter og RPE. Fra øktbanken foreslår appen type og minutter ut fra økta. Appen viser minutter og belastning (minutter × RPE) for de siste sju dagene. I Strength & Power vises også budsjettet for fasen, og appen varsler når en metcon ligger for nær knebøy, clean eller benk.

## Filene

| Fil | Hva den gjør |
|---|---|
| `index.html` | Hele appen: utseende, programmer og logikk |
| `manifest.json` | Navn, ikon og at appen skal åpne i fullskjerm |
| `sw.js` | Service worker: lagrer filene så appen virker uten nett. Svar fra Supabase lagres aldri. |
| `supabase/migrations/` | Databasen for Sammen: tabeller, tilgangsregler og funksjoner |
| `supabase/functions/push/` | Edge-funksjonen som sender pushvarsler fra utboksen i databasen |
| `okter.json` | Øktbanken: metcons fra Functional Fitness Sarpsborg og ATHX-øktene |
| `docs/superpowers/specs/` | Designdokumentet for Sammen og treningsplanen for ATHX |
| `icon-*.png` | Ikoner til hjemskjermen |

## Slik får du den på iPhone (GitHub Pages, gratis)

1. Lag en konto på github.com og trykk **New repository**. Kall det for eksempel `stanga` og velg **Public**.
2. Trykk **uploading an existing file** og last opp alle filene i denne mappen (ikke selve mappen).
3. Gå til **Settings → Pages**. Under *Branch* velger du `main` og `/ (root)`, og trykker **Save**.
4. Etter et minutt får du en adresse, som `https://dittnavn.github.io/stanga/`.
5. Åpne adressen i **Safari** på iPhone, trykk **Del-knappen** og velg **Legg til på Hjem-skjerm**.
6. Åpne appen fra ikonet. Fra nå av virker den uten nett.

## Viktig om dataene

- Dataene ligger i appen på hjemskjermen, ikke i Safari. Sletter du ikonet, forsvinner dataene.
- Bruk **Mer → Lag eksport** av og til, og lagre teksten i Notater. Med **Importer** henter du alt tilbake.

## Når du endrer koden

1. Endre `index.html` og øk `APP_VERSION` øverst i skriptet med 1.
2. Last opp `index.html`. Du trenger ikke endre `sw.js`.
3. Appen henter nyeste versjon hver gang den åpnes med nett, og sjekker også når den vekkes fra bakgrunnen. Ingen trenger å skrive versjon i adressen. Versjonsnummeret står nederst under Mer.

`sw.js` endres bare hvis selve offline-logikken eller listen over filer skal endres. Øk da `SHELL` i `sw.js`.

## Slik legger andre appen til på hjemskjermen

- **iPhone:** Åpne https://br0hansen.github.io/stanga/ i Safari, trykk Del-knappen og velg **Legg til på Hjem-skjerm**.
- **Android:** Åpne adressen i Chrome, trykk menyen med tre prikker og velg **Installer app** eller **Legg til på startskjermen**.

Hver person får sine egne data på sin egen telefon. Sletter man ikonet, forsvinner dataene, så bruk **Mer → Lag eksport** av og til.

## Hvordan koden henger sammen

Koden har tre lag, samme idé som vi snakket om:

1. **Maler** (`PROGRAMS`) – programmene slik de er skrevet. Endres aldri.
2. **Instans** (`S.active`) – din kopi: vekter, trinn og hvor langt du har kommet.
3. **Logg** (`S.history`) – det du faktisk løftet.

To funksjoner gjør jobben:

- `buildSession(mal, instans)` lager dagens økt.
- `progress(mal, instans, økt)` oppdaterer instansen etter økta. Hvert program har sin egen regel (`linear`, `gzclp`, `531`).

Vil du legge til et nytt program som bruker en eksisterende regel, holder det å legge til et objekt i `PROGRAMS`.
