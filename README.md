# Stanga – treningsapp på hjemskjermen

Styrkeprogrammer (StrongLifts 5×5, Starting Strength, GZCLP, 5/3/1 FSL og BBB, Juggernaut, Cube Method og Strength & Power), øktbank med metcons og treningslogg. Alle data lagres lokalt på telefonen.

## I økta

- **Oppvarming** vises som en egen bolk før hvert stangløft, med vekt og skiver per side. Hovedløft får full oppvarming, sekundærøvelser to korte sett. Settene kan trykkes som gjort og gir 60 sekunders pause, men teller ikke som arbeidssett og lagres ikke i loggen.
- **Skiver per side** regnes ut med 20 kg stang og skivene 20, 15, 10, 5, 2,5 og 1,25 kg. 25 kg er bevisst utelatt.
- **Hele planen** vises på programsiden før du aktiverer, og via «Se hele planen» i økta. Planen viser vektene hvis alt går som planlagt, fullførte økter viser det du faktisk løftet, og resten oppdateres etter hver økt. Programmer uten fast slutt vises 12 uker fram.

## Programguide

Under **Programmer → Programguide** står det hva hvert program fokuserer på, hvem det passer for, hva forskningen sier og hva man realistisk kan forvente. Hver påstand har et evidensnivå (A, B, C eller H) og lenke til kilden. Teksten ligger i `GUIDE`, `GUIDE_GENERAL` og `REFS` i `index.html`. Kildene ble slått opp i PubMed i oktober 2026.

## Strength & Power

- Ett hovedløft per økt: benk på dag 1, knebøy på dag 2 og power clean på dag 3.
- Sekundærøvelser: pausebenk eller smal benk på knebøydagen, clean pull og frontbøy på clean-dagen. Vekten styres av RPE med mål 6–7,5.
- Uke 4 og 8 er lette uker. Appen viser RPE og 1RM-trend, og du kan hoppe over uka hvis tallene er gode.
- Uke 11 er taper med halvert volum. Uke 12 er test.

## Metcon-budsjett

Når du merker «Metcon i dag», velger en økt fra øktbanken eller logger en fri økt, kan du legge inn type, minutter og RPE. Fra øktbanken foreslår appen type og minutter ut fra økta. Appen viser minutter og belastning (minutter × RPE) for de siste sju dagene. I Strength & Power vises også budsjettet for fasen, og appen varsler når en metcon ligger for nær knebøy, clean eller benk.

## Filene

| Fil | Hva den gjør |
|---|---|
| `index.html` | Hele appen: utseende, programmer og logikk |
| `manifest.json` | Navn, ikon og at appen skal åpne i fullskjerm |
| `sw.js` | Service worker: lagrer filene så appen virker uten nett |
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
