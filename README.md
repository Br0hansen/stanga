# Stanga – treningsapp på hjemskjermen

Styrkeprogrammer (StrongLifts 5×5, Starting Strength, GZCLP, 5/3/1 FSL og BBB, Juggernaut, Cube Method og Strength & Power), et konkurranseprogram for ATHX 2027, øktbank med metcons og treningslogg. Alle data lagres lokalt på telefonen.

## Utseende: Treningsboka

Appen ser ut som en treningsbok. Programmet står trykt på et ark over bildet av treningsrommet. Fargene betyr én ting hver:

- **Blyant (grått og svart):** planen og det som venter. Neste sett og neste økt i planen har en tykk strek i tekstfargen.
- **Blå penn:** det du har gjort. Det gjelder avkryssede sett, løftet vekt, økning i vekt og egne meldinger. En ny rekord ringes rundt, med ordet «Rekord» og anslått 1RM.
- **Rød penn:** avvik. Det gjelder bom, hoppede økter (strøket over i loggen og planen), de siste sekundene av pausen og varsler om noe nytt.
- **Kondisjon** har en egen farge i kalenderen under Fremgang.
- **Skivefargene** brukes i skivetegningen.

Skriften er Archivo, en familie i flere bredder.

**Tema** velges under **Innstillinger → Utseende**. Arket er mørkt som standard:

| Tema | Gjort | Rekord | Kondisjon |
|---|---|---|---|
| **Kveldsark** (standard) | Blå penn | Blå ring | Grønnblå |
| **Dommerlys** | Fylt hvit rute, som et godkjent løft | Hvit ring | Rav |
| **Skivefarger** | Blå (20 kg-skiva) | Gul (15 kg) | Grønn (10 kg) |
| **Monokrom blå** | Lys blå, hovedknappene i gull | Gull ring | Isblå |
| **Grønn ro** | Grønn, arkene går svakt fra grønt til blått | Blågrønn ring | Blå |
| **Lyst ark** | Blå penn på lyst papir | Blå ring | Mørk grønnblå |

All tekst har minst 4,5:1 i kontrast mot arket, og kanten på settrutene minst 3:1. Fargene står som `:root[data-theme="…"]` øverst i CSS-en, og listen over temaer er `LOOKS` i skriptet. Valget lagres i `S.settings.theme` og følger med i skybackup. En kopi i `stanga.theme` leses i `<head>`, så riktig tema vises før resten av appen er lastet.

Appen har fire faner: **I dag** (dagens økt), **Program**, **Fremgang** og **Sammen**. **Innstillinger** åpnes med tannhjulet øverst til høyre på I dag.

## I økta

- **Øktoversikten** har en fremdriftslinje med én bit per øvelse. Øvelsen du holder på med, ligger på et eget ark. Det store tallet er alltid neste sett, med skivene rett under: først oppvarmingssettene, så arbeidsvekten. **Trykk på tallet**, eller hvor som helst øverst på arket, for å føre inn neste sett med målet som reps. Pausen starter med en gang. Rutene under brukes til å rette opp. Ferdige øvelser blir én linje når du begynner på neste. Øvelser du ikke har begynt på, står som én linje med navn og vekt. Trykk på en linje for å åpne den.
- **Fullfør økt** spør først hvis noen sett ikke er logget, og sier hvilke løft som regnes som bom og hvilke som står på samme vekt.
- **Under settene** står «Trykk på tallet = gjort · trykk på et sett igjen = én rep mindre» de tre første øktene.
- **Etter styrken** er én rad med «+ Kondisjon» (når Pete Plan er på), «+ Metcon» og «+ Notat». Trykk for å åpne en del. En del med innhold, for eksempel en valgt Pete Plan-økt eller et notat, står åpen. Metcon-budsjettet ligger under «+ Metcon».
- **Under «Fullfør økt»** står bare «Hopp over økta». Planen ligger under Program, og fri økt logges fra Fremgang.
- **Hopp over økta** Du får en bekreftelse som sier hvilke løft som ikke får økning den gangen. Økta står som «Hoppet over» i loggen og i hele planen, men teller ikke som treningsdag.
- **Oppvarming** står først i samme rekke som arbeidssettene. Oppvarmingssettene er mindre og grå, med vekten under hvert sett. Neste oppvarmingssett står som det store tallet i kortet, med skiver per side. Rutene blir stående når oppvarmingen er gjort, så arbeidssettene ikke flytter seg. Hovedløft får full oppvarming, sekundærøvelser to korte sett. Settene kan trykkes som gjort og gir 60 sekunders pause, men teller ikke som arbeidssett og lagres ikke i loggen.
- **Pauser etter type sett**, slik forskningen anbefaler: tunge sett 3 min, volumsett 2 min og lette hjelpeøvelser 90 s. Strength & Power, Cube og Juggernaut har egne pauser. Oppvarming gir 60 s, og 2 min etter siste oppvarmingssett. Under **Program → Maksløft, pauser og Pete Plan** kan alle pauser skaleres til Kortere (75 %) eller Lengre (125 %).
- **Pausen står i arket.** Mens pausen går, er det store tallet tiden som er igjen, med neste vekt ved siden av og en tykk strek under som brukes opp. Skivene for neste sett står rett under, så du kan laste stanga. De siste 10 sekundene blir tiden og streken røde. Ved null blinker skjermen lyst én gang, og tallet blir vekten igjen. Linjen nederst har knappene «+30 s» og «Start nå», og viser tiden når du er på en annen fane. Går du over, teller tiden oppover der (+0:12). Lyd ved slutten kan slås på under **Innstillinger**.
- **Skiver per side** regnes ut med 20 kg stang og skivene 20, 15, 10, 5, 2,5 og 1,25 kg. 25 kg er bevisst utelatt. Under **Innstillinger → Stang** kan du velge 15 kg stang. Da regnes skivene, oppvarmingen og laveste vekt på stangøvelser ut fra 15 kg. Arbeidsvektene i programmet endres ikke.
- **Hele planen** vises på programsiden før du aktiverer, og rett i **Program**-fanen for det aktive programmet. Fullførte økter står i blått. Planen viser vektene hvis alt går som planlagt, fullførte økter viser det du faktisk løftet, og resten oppdateres etter hver økt. Programmer uten fast slutt vises 12 uker fram.

## Endre og slette økter i loggen

Trykk på en økt under **Fremgang** for å åpne den. Nederst står **Endre** og **Slett**.

- **Endre** gir et skjema med dato, kg og reps for hvert sett, resultatet på en metcon, minutter på metcon eller kondisjon og notatet. Minuttene teller i metcon-budsjettet. Tomt felt for minutter betyr ukjent lengde. Tomt felt for reps betyr at settet ikke ble tatt. Endringene gjelder loggen, kurvene og rekordene, men flytter ikke vektene i programmet.
- **Slett** spør først. Den nyeste programøkta kan angres helt: programmet går tilbake til der det var før økta, med samme vekter og samme neste økt. Det gjelder også en økt som er hoppet over. Eldre økter slettes bare fra loggen, og vektene i programmet står som de er.
- Teknisk: Den nyeste økta i `S.history` har en kopi av programmet fra før økta (`undo`). Kopien fjernes fra den forrige økta når en ny lagres, så bare én kopi finnes om gangen.

## Skybackup

Valgfritt og gratis for alle med konto. Slå på under **Innstillinger → Skybackup**.

- Hele appen (det samme som **Lag eksport**) lagres i én rad i tabellen `backups` i Supabase, noen sekunder etter hver endring, og før appen legges i bakgrunnen. Bare eieren kan lese og skrive raden.
- **Ny telefon:** Logg inn under Sammen. Er telefonen tom, hentes loggen med en gang. Har telefonen en logg fra før, sier appen fra, og du slår på skybackup under Innstillinger.
- **Flere telefoner:** Når appen åpnes eller vekkes, ser den etter endringer fra andre telefoner. Har denne telefonen ingen nye endringer, hentes skyen. Er begge endret, viser appen et kort med antall økter begge steder, og du velger **Bruk skyen** eller **Bruk denne telefonen**. Ingenting skrives over før du har valgt.
- **Slik hindres overskriving:** Raden har et versjonsnummer (`rev`) som databasen øker ved hver lagring. Appen lagrer bare hvis `rev` i skyen er det samme som sist den så.
- **Slå av** beholder kopien i skyen. **Slett kopien i skyen** fjerner den. **Slett alle data** sletter bare telefonen og slår av skybackup, så kopien i skyen ikke blir overskrevet av en tom logg. Sletter du kontoen, slettes backupen også.
- Hvor appen sist lagret (`rev`, tidspunkt, om noe venter), ligger i `stanga.sync` i telefonen, ikke i selve dataene.

## Sammen (trene med venner)

En egen fane der du legger ut når du skal trene, og vennene dine kan bli med. Konto er valgfritt. Uten konto virker appen akkurat som før, og Sammen-fanen viser bare en side for å lage konto.

- **Innlogging** skjer med e-post og passord rett i appen. Det er ingen e-postbekreftelse, så du er innlogget med en gang. **Glemt passord?** sender en sekssifret kode på e-post. Koden og det nye passordet skrives inn rett i appen.
- **Brukernavn** velges første gang. Venner legges til ved å søke på brukernavn, og den andre må godta.
- **To typer timer:** fast tid (andre melder seg på) og tidsvindu (andre foreslår et tidspunkt). Når du velger et forslag, blir timen fast, og de som foreslo det, står som påmeldt.
- **Økt på timen** er valgfritt: bare trene samtidig, en metcon fra øktbanken eller fritekst.
- **Din økt:** Timene du skal på, dine egne og de du er med på, får hver sin økt fra programmet i rekkefølge. Den første timen viser neste økt med løft og vekt, og det du har lagt til på økta: metcon, Pete Plan, kondisjonsdelen i ATHX og notat. Timene etter viser øktene etter det, med vektene planen viser hvis du klarer øktene før. På timen står hele økta med sett og reps. Bare du ser dette. Vennene ser ikke vektene dine.
- **Nytt:** Fanen viser et tall for nye forslag, påmeldinger, timer og venneforespørsler. Mens Sammen står åpen på oversikten eller Venner, hentes det nytt hvert halve minutt, og Venner henter nytt hver gang den åpnes.
- **Chat:** Øverst i Sammen velger du **Timer** eller **Chat**. Under Chat kan du skrive til én venn eller lage en gruppe med venner. Alle i en gruppe kan legge til vennene sine, og de nye ser hele samtalen. Hver time har sin egen chat for eieren og alle som er påmeldt, og den finnes også som knapp på timen. Nye meldinger hentes hvert fjerde sekund mens samtalen er åpen. Bare de som er med i en samtale, kan lese den.
- **Varsler:** Slå på under **Innstillinger** eller fra kortet øverst i Sammen. Da får du pushvarsel når noen blir med på eller foreslår tid på timene dine, når noen skriver i en samtale du er med i, når noen vil legge deg til som venn, og når noen godtar forespørselen din. Et trykk på varselet åpner timen, samtalen eller Venner. Fra en samtale får du ett varsel til du har lest den, uansett hvor mange meldinger som kommer. Har du samtalen åpen på skjermen, kommer det ikke varsel fra den. Ikonet på Hjem-skjermen viser samme tall som Sammen-fanen. Mens appen er lukket, følger tallet med varselet: samtaler med uleste meldinger, nye påmeldinger og forslag, venneforespørsler du ikke har svart på og nye venner. Merker kan slås av i Innstillinger → Varslinger → Stanga. Hver telefon slår det på selv. På iPhone virker det bare når appen er åpnet fra Hjem-skjermen (iOS 16.4 eller nyere). Samme varsel fra samme person sendes høyst én gang per ti minutter. Når du logger ut, slås varslene av på telefonen.
- **Bare dette lagres i skyen** (Supabase, EU): e-post, brukernavn, navn, venner, timer, påmeldinger, forslag, chatmeldinger og adressen for varsler hvis du har slått dem på. Treningsloggen blir på telefonen, med mindre du slår på skybackup (se under). Under **Innstillinger** kan du logge ut eller slette kontoen.
- **Tilgang:** Reglene i databasen sørger for at bare venner ser timene dine. SQL-en ligger i `supabase/migrations/`.

**Oppsett i Supabase (gjort):** *Confirm email* er slått av under *Authentication → Sign In / Providers*. E-post sendes gjennom Brevo (*Authentication → Emails → SMTP Settings*, `smtp-relay.brevo.com`, port 587), og malen *Reset password* er på norsk med `{{ .Token }}`. Avsender er foreløpig en gmail-adresse, som Brevo ikke anbefaler. Med eget domene kommer e-postene sikrere fram. *Site URL* er `https://br0hansen.github.io/stanga/`. Gratisprosjekter settes på pause etter en uke uten bruk og må da startes igjen i dashbordet.

## Pete Plan

Et fast kondisjonsvalg ved siden av øktbanken, på romaskin, ski eller sykkel. Kan slås av og på under **Program → Maksløft, pauser og Pete Plan**.

- Planen er Pete Marstons tre-ukers rotasjon med seks økter per uke, kontrollert mot hans egen tabell. Appen husker hvor du er og går videre én økt om gangen.
- Målfarten regnes ut fra referansetiden din: 2000 m på romaskin og ski, 4000 m på sykkel.
- Appen regner også baklengs: snittfarten fra intervalløkter og hard distanse, minus tillegget for økta, gir et anslag på 2K-tiden din nå. Medianen av de tre siste anslagene fra seks uker brukes, så de rolige øktene følger utviklingen din. En ny testet tid går foran til nyere økter gir et nytt anslag.
- Resultatet kan skrives inn som snittfart eller som tid per drag (total tid for ett drag). Kortet viser målet på begge måter.
- Progresjon fra planen: snittfarten fra en intervalløkt blir målet neste gang samme økt kommer. Hard distanse viser din beste tid.
- På sykkel dobles distansen, og farten vises per 1000 m.
- **Tilpasset styrke** er vår egen tilpasning, ikke en del av Pete Plan: samme intervaller, men rolige økter på 6 km og hard distanse på 5 km. **Original** har 15 km og 8 km rolig og 10 km hardt.
- Økta teller som kondisjon i metcon-budsjettet, med beregnede minutter som forslag.

## Programguide

Under **Program → Bytt program → Programguide** står det hva hvert program fokuserer på, hvem det passer for, hva forskningen sier og hva man realistisk kan forvente. Hver påstand har et evidensnivå (A, B, C eller H) og lenke til kilden. Teksten ligger i `GUIDE`, `GUIDE_GENERAL` og `REFS` i `index.html`. Kildene ble slått opp i PubMed i oktober 2026.

## Strength & Power

- Ett hovedløft per økt: benk på dag 1, knebøy på dag 2 og power clean på dag 3.
- Sekundærøvelser: pausebenk eller smal benk på knebøydagen, clean pull og frontbøy på clean-dagen. Vekten styres av RPE med mål 6–7,5.
- Uke 4 og 8 er lette uker. Appen viser RPE og 1RM-trend, og du kan hoppe over uka hvis tallene er gode.
- Uke 11 er taper med halvert volum. Uke 12 er test.

## ATHX 2027

**Program under Program → Bytt program.** Planen fra `docs/superpowers/specs/2026-10-26-athx-2027-treningsplan.md` er et eget program:

- **Oppsett:** Brukeren velger stevne fra lista over 2027-stevner, eller en egen dato. Videre velges klasse (LITE, ATHX, PRO), form (individuell eller par), divisjon og 4 (anbefalt) eller 3 økter i uka. I mixed velger hver utøver vektene for sitt kjønn. LITE og mixed finnes bare for par.
- **Startverdier:** Feltene fylles med det brukeren vet fra før: et tungt sett som vekt × reps i S2OH, knebøy og markløft, en løpstid på en annen distanse og 2K-tid på ski. Alt er valgfritt. Står et løft tomt, gjetter appen og sier fra i økta. Det er ingen testuke.
- **Faser:** Lengden regnes baklengs fra stevnet. Grunn går i blokker på fire uker, Bygg er åtte uker, Spesifikk seks uker med generalprøve, og Taper to uker. Er tiden kortere, kuttes fasene som beskrevet i planen.
- **Kalenderen:** Uka følger kalenderen. Henger brukeren etter, hopper planen til første økt i denne uka, så taperen treffer stevnet.
- **Øktene:** Økt 1 er S2OH og knebøy med ski. Økt 2 er løp rett over på ski. Økt 3 er markløft, DB-benk og Metcon X-trening. Økt 4 er rolig løp og S2OH-teknikk. Med tre økter faller økt 4 bort, og teknikken flyttes til markløftdagen. Kondisjonsdelen står i et eget kort med fart, vekter for klassen og felt for resultatet. Den teller i metcon-budsjettet.
- **Arbeidsmaks:** RPE på siste sett mot målet justerer arbeidsmaksen: +2,5 %, +1 %, −1 % eller −2,5 %. Bom gir −2,5 %. Tunge sett (RPE 8 eller mer, 5 reps eller færre) kan heve den til medianen av de tre siste anslagene fra seks uker. De senker den aldri, fordi siste sett etter flere sett er preget av tretthet. Én økt flytter arbeidsmaksen høyst +2,5 % eller −5 %. To tunge økter på rad flytter den lette uka fram.
- **Løp og ski:** Snittfarten fra intervallene, minus et fast tillegg per økttype, gir et anslag på 3 km-farten og skifarten. Appen bruker medianen av de tre siste fra seks uker, slik Pete Plan gjør. Tre rolige turer på rad gjør de rolige turene 5 minutter lengre, opp til 45.
- **Metcon X:** Den tregeste stasjonen brukeren markerer, får dobbelt så mange reps i mini-Metcon X.
- **Hele planen:** Visningen viser en anslått stevnescore: kilo i Strength, meter ski etter løpet og siste tid på hele Metcon X.

Prioritering etter plasseringer på leaderboardet er ikke bygd ennå, fordi det ikke finnes resultater for 2027-øktene.

**I øktbanken.** 17 økter ligger først i øktbanken med typen **ATHX**: Strength, Endurance og Metcon X slik de er på stevnet (individuelt og for par, med vektene for PRO og LITE), og treningsøktene fra planen. Under «Tilfeldig temaøkt» finnes en egen ATHX-knapp. Øktene er laget av oss, ikke hentet fra Sarpsborg, og har derfor ingen dato eller antall kjøringer.

## Øktbanken

Lista viser hele økta for hver metcon, så du kan lese den uten å åpne den. Trykk på en økt for å velge den, se tidligere resultater eller merke den som favoritt.

## Metcon-budsjett

Når du merker «Metcon i dag», velger en økt fra øktbanken eller logger en fri økt, kan du legge inn type, minutter og RPE. Fra øktbanken foreslår appen type og minutter ut fra økta. Appen viser minutter og belastning (minutter × RPE) for de siste sju dagene. I Strength & Power vises også budsjettet for fasen, og appen varsler når en metcon ligger for nær knebøy, clean eller benk.

## Filene

| Fil | Hva den gjør |
|---|---|
| `index.html` | Hele appen: utseende, programmer og logikk |
| `manifest.json` | Navn, ikon og at appen skal åpne i fullskjerm |
| `sw.js` | Service worker: lagrer filene så appen virker uten nett. Svar fra Supabase lagres aldri. |
| `supabase/migrations/` | Databasen for Sammen og skybackup: tabeller, tilgangsregler og funksjoner |
| `supabase/functions/push/` | Edge-funksjonen som sender pushvarsler fra utboksen i databasen |
| `okter.json` | Øktbanken: metcons fra Functional Fitness Sarpsborg og ATHX-øktene |
| `docs/superpowers/specs/` | Designdokumentet for Sammen, treningsplanen for ATHX, og trendanalysen og UX-analysen som grunnlag for redesign |
| `icon-*.png` | Ikoner til hjemskjermen |

## Slik får du den på iPhone (GitHub Pages, gratis)

1. Lag en konto på github.com og trykk **New repository**. Kall det for eksempel `stanga` og velg **Public**.
2. Trykk **uploading an existing file** og last opp alle filene i denne mappen (ikke selve mappen).
3. Gå til **Settings → Pages**. Under *Branch* velger du `main` og `/ (root)`, og trykker **Save**.
4. Etter et minutt får du en adresse, som `https://dittnavn.github.io/stanga/`.
5. Åpne adressen i **Safari** på iPhone, trykk **Del-knappen** og velg **Legg til på Hjem-skjerm**.
6. Åpne appen fra ikonet. Fra nå av virker den uten nett.

## Viktig om dataene

- Dataene ligger i appen på hjemskjermen, ikke i Safari. Sletter du ikonet, forsvinner dataene, med mindre skybackup er på.
- Med konto kan du slå på **Innstillinger → Skybackup**. Da hentes alt tilbake når du logger inn på nytt.
- Uten konto: Bruk **Innstillinger → Lag eksport** av og til, og lagre teksten i Notater. Med **Importer** henter du alt tilbake.

## Når du endrer koden

1. Endre `index.html` og øk `APP_VERSION` øverst i skriptet med 1.
2. Last opp `index.html`. Du trenger ikke endre `sw.js`.
3. Appen henter nyeste versjon hver gang den åpnes med nett, og sjekker også når den vekkes fra bakgrunnen. Ingen trenger å skrive versjon i adressen. Versjonsnummeret står nederst under Innstillinger.

`sw.js` endres bare hvis selve offline-logikken eller listen over filer skal endres. Øk da `SHELL` i `sw.js`.

## Slik legger andre appen til på hjemskjermen

- **iPhone:** Åpne https://br0hansen.github.io/stanga/ i Safari, trykk Del-knappen og velg **Legg til på Hjem-skjerm**.
- **Android:** Åpne adressen i Chrome, trykk menyen med tre prikker og velg **Installer app** eller **Legg til på startskjermen**.

Hver person får sine egne data på sin egen telefon. Sletter man ikonet, forsvinner dataene, så slå på skybackup eller bruk **Innstillinger → Lag eksport** av og til.

## Hvordan koden henger sammen

Koden har tre lag, samme idé som vi snakket om:

1. **Maler** (`PROGRAMS`) – programmene slik de er skrevet. Endres aldri.
2. **Instans** (`S.active`) – din kopi: vekter, trinn og hvor langt du har kommet.
3. **Logg** (`S.history`) – det du faktisk løftet.

To funksjoner gjør jobben:

- `buildSession(mal, instans)` lager dagens økt.
- `progress(mal, instans, økt)` oppdaterer instansen etter økta. Hvert program har sin egen regel (`linear`, `gzclp`, `531`).

Vil du legge til et nytt program som bruker en eksisterende regel, holder det å legge til et objekt i `PROGRAMS`.
