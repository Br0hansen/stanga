# UX-trender for treningsapper: farger, elementer, sider og menyer

Dato: 2026-10-27 · Status: analyse med beslutninger og tre fargeforslag, grunnlag for redesign. Følger opp [trendanalysen av funksjoner](2026-10-27-trendanalyse-treningsapper.md), men handler om selve grensesnittet: hvordan appen ser ut, hvordan sidene er bygd opp og hvordan man finner fram.

## Slik er analysen laget

1. **Stanga i dag:** skjermbilder av alle faner, i lys og mørk modus, med to loggede økter (390 × 844, samme størrelse som en iPhone 15). Fargene i `:root` i `index.html` er målt mot kravene til kontrast i WCAG 2.2.
2. **Plattformene:** Apples nye designspråk i iOS 26 (Liquid Glass) og Googles Material 3 Expressive, fordi det er dem brukerne sammenligner med hver dag.
3. **Treningsappene:** Strava, Hevy, Strong, WHOOP og Apple Treningsapp.

**Forbehold:** Mye av det som skrives om designtrender, kommer fra byråer og leverandører. Det er brukt for å se hva som er vanlig, ikke som bevis for hva som virker. Tallene for kontrast og trykkflater er faste krav fra WCAG og plattformene.

## Ordliste

| Ord | Betyr |
|---|---|
| **Fanelinje** | Raden med ikoner nederst (Økt, Plan, Logg, Sammen). |
| **Bunnark** | Et panel som glir opp nedenfra og dekker deler av skjermen. Brukes til valg og detaljer uten å forlate siden. |
| **Tommelsonen** | Den nederste delen av skjermen, der tommelen når uten at du flytter grepet. |
| **Kontrastforhold** | Hvor mye lysere den lyse fargen er enn den mørke, fra 1:1 (lik) til 21:1 (svart på hvitt). Vanlig tekst skal ha minst 4,5:1. Kanter på knapper og felt skal ha minst 3:1. |
| **Bento** | Et rutenett av kort i ulike størrelser, som rommene i en japansk matboks. |
| **Token** | En navngitt designverdi, som `--pen` for blå penn. Endrer du tokenet, endres alle steder det brukes. |

---

## 1. Navigasjon og menyer

### Hva skjer i markedet

- **Fire til fem faner er standard.** Strava gikk i 2025 over til *Home, Maps, Record, Groups, You*. Én fane er hovedhandlingen (Record), og én er «deg» (You) med profil og innstillinger.
- **iOS 26: fanelinja flyter og krymper.** Den ligger som en pille i glass over innholdet og kan krympe når du scroller nedover. Apple har også innført en **bunnlinje over fanelinja** (*bottom accessory*), som minispilleren i Musikk: noe som pågår, vises der uansett hvilken fane du er på.
- **Android: kortere og mer fleksible linjer.** Material 3 Expressive har en lavere navigasjonslinje, flytende verktøylinjer og knappegrupper som former seg når de trykkes.
- **Aktiv økt er en egen modus.** Strava (Record), Apple Treningsapp og Hevy åpner økta over hele skjermen. Hos Hevy kan økta krympes til en linje nederst, slik at du kan se på noe annet og komme tilbake.
- **Profil og innstillinger samlet ett sted:** som egen fane (Strava *You*) eller som et rundt ikon øverst til høyre.
- **Bunnark i stedet for nye sider** for korte valg: bytte øvelse, velge vekt, bekrefte.

### Stanga i dag

```
Økt ─── økta (eller «Ingen program ennå»)
        └─ oppsummering etter økt (kort øverst på samme side)
Plan ── aktivt program, «Hele planen»
        ├─ ⚙ Innstillinger (pause, stang, skybackup, konto, varsler, eksport …)
        ├─ Maksløft, pauser og Pete Plan
        └─ Bytt program ─ Programguide ─ program ─ «Aktiver»
Logg ── oppsummering, kalender, kurver, økter ─ økt ─ Endre / Slett
Sammen ─ Timer | Chat (eller innlogging)
```

| Hva vi ser | Hvorfor det betyr noe |
|---|---|
| Pauselinja ligger nederst over innholdet og følger med når du bytter fane. | **Bra.** Det er akkurat det iOS 26 gjør med *bottom accessory*. Behold ideen. |
| Aktiv økt er en fane blant fire. Fanelinja synes hele økta. | Du kan trykke på feil fane med svette fingre. Fanelinja tar 50–60 px av en skjerm der hver centimeter trengs til tallet. |
| Plan gjør fem jobber: program, hele planen, maksløft, bytte program og innstillinger. | Innstillinger som skybackup og varsler har ingenting med planen å gjøre. Brukerne leter i feil fane. |
| Innstillinger ligger bak et tannhjul i Plan. Konto finnes både der og i Sammen. | To veier til det samme gjør det uklart hvor ting hører hjemme. |
| Tilbake er en tekstlenke «‹ Tilbake», ca. 34 px høy. | Under kravet på 44 px. Ingen sveip tilbake, slik iPhone-brukere er vant til. |
| Bytte av fane nullstiller hvor du var (du havner øverst i Plan igjen). | Det er riktig for en fane, men bør gjelde likt overalt og være bevisst. |

### Anbefaling

```
I dag ─── dagens økt (Start) · ukesmål · siste rekord      [● profil øverst til høyre]
          └─ Aktiv økt (fanelinja synes) ─ Oppsummering (egen skjerm)
Program ─ aktivt program · hele planen · maksløft og pauser
          └─ Bytt program (programguide er første kort)
Fremgang ─ ukeskort · kurver · rekorder · alle økter ─ økt (bunnark: Endre / Slett)
Sammen ── Timer | Chat
Profil (fra ikonet) ─ konto · skybackup · varsler · stang · lyd · eksport · om appen
```

- **Fire faner som i dag**, men hver med én jobb. Profil og innstillinger flyttes til et ikon øverst til høyre på I dag.
- **Aktiv økt med fanelinje** (bestemt 27. okt). Fanelinja synes hele økta, så du kan se på planen eller loggen midt i økta. Pauselinja ligger over fanelinja. Faren for feiltrykk på fanene løses med god avstand mellom pauselinja og fanelinja og at økta står uendret når du kommer tilbake.
- **Pauselinja blir en «pågår nå»-linje** over fanelinja: pause, eller «Økt pågår · 3 av 5 øvelser» når du er utenfor økta.
- **Bunnark** for: bekreft «Fullfør økt», endre et sett, velge metcon, økt-detaljer i Fremgang.
- **Tilbake-knapp** som ikon med 44 × 44 px trykkflate.

---

## 2. Hvordan sidene er bygd opp

### Hva skjer i markedet

- **«I dag» som startside.** WHOOP, Apple Helse og Strava starter med det som gjelder nå: én hovedhandling øverst, deretter status i kort.
- **Bento-rutenett** for status: små og store kort side om side (ukesmål, siste rekord, belastning), i stedet for en lang liste med like kort.
- **Én tydelig hovedhandling per side**, gjerne nederst der tommelen er.
- **Gradvis mer detaljer** (*progressive disclosure*): vis konklusjonen, gjem tallene bak et trykk.
- **Oppsummering som egen skjerm** etter økta, laget for å feire og dele (Hevy har medaljer for rekorder, Strava lager delbare kort).
- **Tomme sider som lærer bort.** I stedet for «Her kommer øktene dine» vises et eksempel på hvordan det blir.

### Stanga i dag

| Side | Bra | Kan bli bedre |
|---|---|---|
| **Økt** | Tydelig rekkefølge: tittel, fremdriftslinje, aktiv øvelse på eget ark, så neste og senere øvelser som én linje hver. | Oppsummeringen etter økta legger seg som et kort over neste økt, og lukkes med en liten tekstlenke («Lukk»). Rekorden ringes rundt, men øyeblikket feires ikke. |
| **Økt uten program** | Kort og tydelig. | To knapper uten hjelp til å velge. Det meste av skjermen er tomt bilde. |
| **Plan** | Aktivt program øverst med tre store tall. | Lang side. «Hele planen» med forklaringstekst kommer før ukene. |
| **Logg** | Tre nøkkeltall øverst. Kurve med endring (+2,5). | Kalenderen med fire uker prikker tar en halv skjerm og er mest tom. Kurvene er små og kan ikke trykkes på. |
| **Sammen uten konto** | Ærlig om hva som lagres. | Et innloggingsskjema er det første du ser. Ingenting viser hva du får. |
| **Innstillinger** | Gruppert i seksjoner med overskrift. | Hver innstilling har en forklaring på tre linjer. Siden blir lang og vanskelig å skumlese. |

### Anbefaling: én fast mal for alle sider

```
┌─────────────────────────────┐
│ Tittel             [ikon]   │  1. Hvor er jeg? (stor tittel, valgfritt ikon til høyre)
│ Undertittel / status        │  2. Hvordan står det til? (én linje)
├─────────────────────────────┤
│ ███ HOVEDKORT ███           │  3. Det viktigste (dagens økt, aktivt program, denne uka)
├──────────────┬──────────────┤
│ kort         │ kort         │  4. Status i bento (2 kolonner)
├──────────────┴──────────────┤
│ Liste …                     │  5. Resten (økter, ukene i planen)
│                             │
│ [   Hovedhandling   ]       │  6. Hovedknappen i tommelsonen når siden har én
└─────────────────────────────┘
```

- **Oppsummering etter økt** som egen fullskjerm: stort tall for totalvekt, rekorder med blå ring, de nye vektene, så «Ferdig» som stor knapp nederst.
- **Fremgang:** ukeskort (bento) øverst, kalenderen krympet til én rad per uke, større kurver som kan trykkes på.
- **Tomme sider** viser en grå blyantskisse av hvordan det blir, med én knapp.

---

## 3. Farger

### Hva skjer i markedet

- **Mørk modus er et eget system**, ikke et speilvendt lyst tema. Dybde vises med lysere flater (luminans), ikke med skygger, som ikke synes på mørkt. Bakgrunnen er nesten svart, ikke helt svart, og teksten er gråhvit.
- **Én sterk farge for handling** (Strava oransje, Hevy blå), og egne farger *bare* for status (puls-soner, belastning, rekord).
- **Farger som betyr én ting.** Grønn = ferdig, rød = varsel. Brukerne lærer det fort hvis det er konsekvent.
- **Varianter for lys, mørk og økt kontrast.** Apple ber om alle tre for farger som brukes i fanelinja og knapper.
- **Liquid Glass (iOS 26):** gjennomsiktige lag med uskarphet. Brukes til navigasjon som flyter over innholdet, ikke til innholdet selv.

### Stanga i dag

Stanga har et uvanlig tydelig fargespråk: **blyant** (grått og svart) for planen, **blå penn** for det du har gjort, **rød penn** for avvik. Det er helt i tråd med trenden om farger som betyr én ting. Problemene ligger i detaljene:

| Token | Brukes til | Kontrast | Krav | Vurdering |
|---|---|---|---|---|
| `--ink` på papir | Brødtekst | 14:1 | 4,5:1 | God |
| `--ink-2` på papir | Undertekst | 5,7:1 | 4,5:1 | God |
| `--pen` på papir | Blå penn | 7,0:1 | 4,5:1 | God |
| `--red` på papir | Rød penn | 4,8:1 | 4,5:1 | Akkurat godkjent |
| `--ink-3` på papir | Klokkeslett i chat, kilder, piler | **2,9:1** | 4,5:1 | **For svak** |
| `--ink-3` på kveldsark | Samme | **3,9:1** | 4,5:1 | **For svak** |
| `--rule` på papir | Kanten på settrutene | **1,3:1** | 3:1 | **For svak**. Rutene du skal trykke på, er nesten usynlige. |
| `--chalk-3` på mørk | Fanenavn | 5,2:1 | 4,5:1 | God, men teksten er bare 11 px |

**Blått betyr to ting.** Settet som er *neste* får blå kant og blå strek, men blått skal bety *gjort*. Når neste sett og ferdige sett har samme farge, må øyet lese hakene for å se forskjell.

**Rødt for hoppede økter.** Rød penn er avvik, men en hoppet økt er ofte et riktig valg. Det leses som en feil.

**Bakgrunnsbildet** er tonet godt ned. Det meste av flaten bak teksten er nesten svart (snitt rundt #0F161C), så teksten har stort sett god kontrast. Der bildet er lysest (rundt #305162), faller den grå teksten (`--chalk-2`) til 4,2:1, litt under kravet. Men bildet konkurrerer med innholdet på sider med lite innhold, og papirarkene får en skygge som ikke synes på mørkt.

### Anbefaling

- **Behold de tre pennene.** Det er Stangas identitet og helt i tråd med trenden.
- **Blå = bare gjort.** Neste sett markeres med tykk blyantstrek (svart), ikke blått.
- **Grå blyant for hoppet over.** Rødt spares til det som krever handling: bom tre ganger, tiden er ute, feil.
- **Mørkere grå:** `--ink-3` til ca. `#686D75` på papir (4,6:1). Kveldsarket trenger en egen, lysere verdi, ca. `#8F949C` (4,9:1).
- **Synlige kanter:** kanten på settrutene til minst 3:1, for eksempel `#878C94` på papir og `#6E737B` på kveldsark.
- **Én farge for kondisjon** (for eksempel en dempet grønnblå) som bare brukes i belastningsvisningen og kalenderen, ved siden av blått for styrke. I dag skilles de med fylt og åpen sirkel.
- **Ikke Liquid Glass på arkene.** Papir er ikke glass. Glass kan eventuelt brukes på fanelinja og pauselinja, som flyter over innholdet.

---

## 4. Typografi

### Hva skjer i markedet

- **Svært store tall** for det du skal se fra armlengdes avstand: vekt, tid, puls.
- **Smale tall med lik bredde** (*tabular*), så tallene ikke hopper når de teller ned.
- **Én skriftfamilie i flere bredder og tykkelser** (variable fonter) i stedet for to ulike skrifter.
- **Skalerbar tekst:** appen følger størrelsen brukeren har valgt på telefonen.

### Stanga i dag

Archivo i flere bredder, 104 px for neste vekt, tall med lik bredde: **helt i tråd med trenden.**

Svakheter:

- **Mye liten tekst:** fanenavn 11 px, vekt under settrutene 12 px, klokkeslett i chat 12 px, seksjonsoverskrifter 13 px i grått.
- **Seksjonsoverskrifter (h3) er svakere enn brødteksten**: 13 px grått mot 16 px svart. Det er vanskelig å se hvor en ny del starter.
- Teksten følger ikke tekststørrelsen på telefonen.

### Anbefaling: en fast skala

| Rolle | Størrelse | Eksempel |
|---|---|---|
| Hovedtall i økta | 104 px, smal | 77,5 |
| Store tall | 40 px, smal | 4 500 kg |
| Sidetittel | 32 px | Fremgang |
| Korttittel | 20 px | Knebøy |
| Brødtekst og knapper | 17 px | Fullfør økt |
| Seksjonsoverskrift | 15 px halvfet, svart | Denne uka |
| Metadata | 13 px, minst 4,5:1 | 27. okt · 52 min |

Ingen tekst under 13 px. Seksjonsoverskrifter i svart, ikke grått.

---

## 5. Elementer

| Element | Trenden | Stanga i dag | Anbefaling |
|---|---|---|---|
| **Hovedknapp** | Stor, full bredde, nederst i tommelsonen. | Stor og tydelig (16 px luft, 17 px tekst). Ligger ofte langt nede på siden. | Behold utseendet. Fest «Fullfør økt» og andre hovedhandlinger nederst. |
| **Av/på** | Bryter (switch) som viser tilstanden. | «Lyd når pausen er over» er en knapp. Man ser ikke om lyden er på. | Bryter med «På/Av». |
| **Valg mellom to–fire** | Segmentkontroll. | Brukes for stang (20/15 kg) og Logg inn/Lag konto. Bra. | Behold. Bruk også for Timer/Chat og filtre. |
| **Filter** | Chips i en rad. | Alle / Nybegynner / Middels / Erfaren. Bra. | Behold. |
| **Kort** | Flate flater med lysere farge i mørk modus, tynn kant, lite skygge. | Papirark med kraftig skygge (`--lift`). Skyggen forsvinner på mørk bakgrunn. | Papirfølelsen beholdes, men med flatere skygge og tydeligere skille mellom ark. |
| **Settruter** | Hevy og Strong: tabell med en hake per sett. | Ruter på 50 × 54 px. Ett trykk på tallet fører inn neste sett. Rask, men kanten er nesten usynlig. | Behold mekanikken. Kanten skal synes, og neste sett markeres med blyant, ikke blått. |
| **Fremdrift** | Ringer (Apple) eller segmentlinje. | Én bit per øvelse øverst. Bra og enkelt. | Behold. Kan også brukes på ukesmålet. |
| **Grafer** | Store, kan trykkes og dras for å lese av verdien. | Små sparklines uten akser. | Én stor graf per løft i Fremgang, der du kan dra fingeren langs kurven. Sparklines kan stå i oversikten. |
| **Bekreftelser** | Bunnark med tydelig hovedknapp og avbryt. | Egne kort i siden. | Bunnark. |
| **Tekstlenker** | Brukes sjelden til viktige handlinger. | «Lukk», «‹ Tilbake», «Glemt passord?», «Hopp over økta» er ca. 34 px høye. | Minst 44 px trykkflate. «Lukk» og «Tilbake» blir ikoner eller knapper. |
| **Ikoner** | Tynne strekikoner, samme tykkelse. | Egne strekikoner (1,7 px). Konsekvent. | Behold. Lag ikon for Profil og Fremgang i samme stil. |
| **Tilbakemelding** | Haptikk (vibrasjon) ved hvert sett. | iPhone lar ikke webapper vibrere. Haken «tegnes» med en kort animasjon. | Behold animasjonen. Gi også en kort visuell puls på tallet når settet føres inn. |

---

## 6. Treningsrommet som brukssituasjon

Treningsappen brukes under forhold som få andre apper: én hånd, svette fingre, pulsen høy, telefonen på benken eller gulvet, sterkt eller dårlig lys.

### Hva som er vanlig i markedet

- **Store trykkflater:** Apple krever minst 44 × 44 punkter, Google 48 × 48. Mange treningsapper går over dette for de viktigste knappene.
- **Viktige knapper nederst** der tommelen er.
- **Les det på avstand:** tall og status skal kunne leses med telefonen på benken.
- **Lett å angre:** et feiltrykk skal være enkelt å rette.

### Stanga i dag

- **Trykkflaten for neste sett er øverst på skjermen** (navnet, tallet og skivene). På en stor telefon må du flytte grepet eller bruke to hender. Resten av handlingene ligger lenger ned.
- **Store tall:** 104 px kan leses fra benken. Bra.
- **Angre:** et nytt trykk på et sett gir én rep mindre. Det er raskt, men ikke opplagt (derfor står det en forklaring under rutene de tre første øktene).

### Anbefaling

- Legg til en **stor «Sett ferdig»-knapp nederst** i aktiv økt, i tillegg til å kunne trykke på tallet. Det gir én trykkflate i tommelsonen.
- Etter hvert trykk: **«Angre»** i pauselinja i noen sekunder.
- Hold skjermen våken (gjøres allerede) og vis pausen stort rett etter at telefonen låses opp.

---

## 7. Oppsummering

| Område | Gjør (trenden passer) | Tilpass (på Stangas måte) | Unngå |
|---|---|---|---|
| **Menyer** | Fire faner med én jobb hver. Profil som ikon. Bunnark. | Pauselinja blir «pågår nå»-linje. | Femte fane bare for innstillinger. |
| **Sider** | Fast mal: tittel, status, hovedkort, bento, liste, hovedknapp. | Oppsummering etter økt som eget ark. | Lange forklaringer øverst på sider. |
| **Farger** | Én betydning per farge. Varianter for lys og mørk. | Tre penner + én dempet farge for kondisjon. | Liquid Glass på innhold. Mange aksentfarger. |
| **Typografi** | Store smale tall. Fast skala. | Archivo i flere bredder (finnes). | Tekst under 13 px. |
| **Elementer** | Brytere, segmentkontroll, store grafer. | Settruter med ett trykk. | Små tekstlenker til viktige handlinger. |
| **Treningsrommet** | Hovedhandling i tommelsonen. Angre. | Stort tall øverst, knapp nederst. | Alt øverst. |

## Neste steg

Et utkast til redesign med skisser av disse sidene, i denne rekkefølgen:

1. **Aktiv økt** (fanelinje, knapp i tommelsonen, pauselinje, neste sett i blyant)
2. **Oppsummering etter økt**
3. **I dag** (hjem, med og uten program)
4. **Fremgang**
5. **Program** og **Profil**
6. **Sammen**

## Beslutninger (27. okt)

Jonas bestemte:

1. **Bakgrunnsbildet** brukes på alle sider. Toningen over bildet gjøres litt kraftigere, fordi grå tekst faller til 4,2:1 der bildet er lysest.
2. **Mørkt er utgangspunktet.** Arket er mørkt (kveldsark) som standard.
3. **Fanene** blir *I dag · Program · Fremgang · Sammen*.
4. **Aktiv økt viser fanelinja.** Dette erstatter forslaget om fullskjerm.

## Tre fargeforslag

Vist på skissene Aktiv økt og Fremgang her: https://claude.ai/artifact/4KQcAsvyRFkmGCkmr7MfrP

Alle tre har de samme rollene: plan (grått), gjort, avvik, rekord og kondisjon. Neste sett markeres med tykk strek i tekstfargen. Kontrasten er målt mot arket.

| Rolle | 1. Kveldsark | 2. Dommerlys | 3. Skivefarger |
|---|---|---|---|
| Bakgrunn bak bildet | `#0E0F12` | `#0B0B0C` | `#0C0E14` |
| Ark | `#22252B` | `#1C1C1E` | `#1B1F2A` |
| Ark, trykket / pauselinje | `#2B2F36` | `#26262A` | `#242938` |
| Tekst | `#ECEBE6` · 12,9:1 | `#E6E4DE` · 13,4:1 | `#EEF0F4` · 14,4:1 |
| Tekst 2 | `#B3B7BE` · 7,6:1 | `#ABA9A3` · 7,2:1 | `#B0B6C3` · 8,1:1 |
| Tekst 3 | `#959AA3` · 5,4:1 | `#8F8D88` · 5,1:1 | `#9098A8` · 5,7:1 |
| Kant (settruter) | `#6E737B` · 3,2:1 | `#6E6C68` · 3,3:1 | `#687083` · 3,3:1 |
| Gjort | `#9AACFF` · 7,1:1 (blå penn) | `#FFFFFF` · 17,0:1 (fylt rute) | `#6AA5FF` · 6,6:1 (blå skive) |
| Avvik | `#FF6A55` · 5,4:1 | `#FF5B4A` · 5,6:1 | `#FF5E52` · 5,5:1 |
| Rekord | `#9AACFF` (blå ring) | `#FFFFFF` (hvit ring) | `#FFD23F` · 11,4:1 (gul skive) |
| Kondisjon | `#5CCFBE` · 8,1:1 | `#F0B13C` · 9,0:1 | `#41C985` · 7,8:1 (grønn skive) |
| Hovedknapp (tekst på knapp) | `#ECEBE6` / `#0E0F12` · 16,1:1 | `#FFFFFF` / `#111112` · 18,9:1 | `#EEF0F4` / `#0C0E14` · 16,9:1 |

- **Kveldsark** er treningsboka slik den er, mørk og ryddet. Minst endring.
- **Dommerlys** bygger på lysene i styrkeløft: hvitt er godkjent, rødt er underkjent. Ferdige sett lyser opp som fylte hvite ruter. Mest særegen, størst endring.
- **Skivefarger** bruker fargene på vektskivene. Rekorder får egen farge (gul). Mest farge, og skivetegningen deler farger med resten av appen.

**Anbefaling:** Kveldsark. Den retter det som ikke virker i dag uten å ta bort treningsboka, og gir kondisjon en egen farge.

**Bygget (versjon 43):** Alle tre ligger i appen som temaer under Plan → Innstillinger → Utseende, sammen med *Lyst ark* (det lyse arket fra før, med mørkere grå og synlige kanter). Kveldsark er standard.

## Kilder

- Apple, WWDC25 «Build a UIKit app with the new design» (fanelinje som flyter og krymper, *bottom accessory*, fargevarianter): [developer.apple.com](https://developer.apple.com/videos/play/wwdc2025/284/)
- Bunnlinje over fanelinja: [Create with Swift](https://www.createwithswift.com/enhancing-the-tab-bar-with-a-bottom-accessory/), [STRV om Liquid Glass](https://www.strv.com/blog/how-to-apply-liquid-glass-to-your-app)
- Material 3 Expressive (komponenter, fjærbevegelse, former): [pub.dev – material_3_expressive](https://pub.dev/packages/material_3_expressive), [material_expressive changelog](https://pub.dev/packages/material_expressive/changelog). Offisiell dokumentasjon: m3.material.io.
- Stravas nye faner (2025): [the5krunner](https://the5krunner.com/2025/07/16/strava-app-redesign/), [Quad Lock](https://www.quadlockcase.co.uk/blogs/news/new-strava-layout-preview), [Zeno Cycle Parts](https://zenocycleparts.com/blogs/cyclingtips/new-strava-update-makes-big-changes-to-layout-organization-and-navigation)
- Hevy, ny navigasjon med Liquid Glass og Material 3 (juli 2026): [Hevy Community Updates](https://www.hevyapp.com/community-updates/july-26/), [APKMirror 3.1.0](https://www.apkmirror.com/?p=14509700)
- Mørk modus, bento og typografi (byråblogger): [Moburst](https://www.moburst.com/blog/top-mobile-web-design-trends/), [Muzli](https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/), [Line25](https://line25.com/articles/web-design-trends-2026/), [Fuselab](https://fuselabcreative.com/mobile-app-design-trends/)
- Treningsrommet som brukssituasjon: [Made Good Designs](https://madegooddesigns.com/fitness-app-design/)
- Kontrastkrav: WCAG 2.2, suksesskriterium 1.4.3 (tekst 4,5:1) og 1.4.11 (kanter og ikoner 3:1). Trykkflater: Apple Human Interface Guidelines (44 × 44 pt) og Material Design (48 × 48 dp).
