# Stanga – treningsapp på hjemskjermen

Styrkeprogrammer (StrongLifts 5×5, Starting Strength, GZCLP, 5/3/1 BBB) og treningslogg. Alle data lagres lokalt på telefonen.

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

1. Endre `index.html` og øk `APP_VERSION` øverst i skriptet.
2. Øk `CACHE = 'stanga-v11'` til neste nummer i `sw.js`.
3. Last opp begge filene. Neste gang du åpner appen med nett, får du den nye versjonen. Versjonsnummeret står nederst under Mer.

## Hvordan koden henger sammen

Koden har tre lag, samme idé som vi snakket om:

1. **Maler** (`PROGRAMS`) – programmene slik de er skrevet. Endres aldri.
2. **Instans** (`S.active`) – din kopi: vekter, trinn og hvor langt du har kommet.
3. **Logg** (`S.history`) – det du faktisk løftet.

To funksjoner gjør jobben:

- `buildSession(mal, instans)` lager dagens økt.
- `progress(mal, instans, økt)` oppdaterer instansen etter økta. Hvert program har sin egen regel (`linear`, `gzclp`, `531`).

Vil du legge til et nytt program som bruker en eksisterende regel, holder det å legge til et objekt i `PROGRAMS`.
