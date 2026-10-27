# Trendanalyse: treningslogger og helseapper på mobil

Dato: 2026-10-27 · Status: analyse, grunnlag for redesign. Ingen kode er endret. Neste steg er et utkast til redesign som bygger på punktene under «Hva vi tar med inn i redesignet».

## Hvorfor og hvordan

Stanga har vokst fra en StrongLifts-logg til et verktøy med ni styrkeprogrammer, ATHX, Pete Plan, øktbank, metcon-budsjett, skybackup og en sosial fane med timer og chat. Hver del er gjennomtenkt, men de er lagt til én om gangen. Før vi tegner appen på nytt i sin helhet, vil vi vite hvor resten av markedet er på vei, og hva Stanga bør ta med, gjøre på sin egen måte eller la være.

**Slik er analysen laget:**

1. Gjennomgang av Stanga i dag: README, koden i `index.html` og skjermbilder av alle fire faner på en telefon (390 × 844).
2. Søk etter omtaler, sammenligninger og pressemeldinger fra 2025–2026 om de største treningsloggene (Strong, Hevy, Fitbod, Jefit, Boostcamp) og helse- og treningsplattformene (Strava, Runna, WHOOP, Apple, Google).
3. Søk i PubMed etter forskning på atferdsendring i apper og på autoregulering i styrketrening.

**Forbehold:** Mange av kildene om markedet er blogger fra apputviklere eller konkurrenter, og noen tjener penger på lenker. De er brukt for å se *hva* appene gjør, ikke som bevis for at det virker. Påstander om effekt bygger på forskningen i kildelista, og der den er tynn, står det.

## Stanga i dag, kort fortalt

**Det Stanga allerede gjør godt:**

- **Logging med ett trykk.** Det store tallet er neste sett. Ett trykk fører det inn og starter pausen. Det er samme idé som de raskeste appene i markedet (Strong) bygger på.
- **Skiver per side** og stangvalg (15/20 kg) rett under tallet.
- **Ekte programlogikk.** Ni programmer med egne regler for progresjon, bom og nedtrapping, pluss ATHX med arbeidsmaks som justeres etter RPE. De fleste loggeappene lar brukeren styre progresjonen selv.
- **Styrke og kondisjon i samme app:** metcon-budsjett, Pete Plan og ATHX. Det er nettopp det markedet nå beveger seg mot (se trend 4).
- **Lokalt først.** Alt virker uten nett og uten konto. Skyen er valgfri.
- **En tydelig identitet:** treningsboka med blyant, blå penn og rød penn. Det skiller Stanga fra alle andre.
- **Programguide med evidensnivå** og kilder.

**Det som skaper friksjon (sett fra skjermbildene og koden):**

| Område | Hva vi ser | Hvorfor det betyr noe |
|---|---|---|
| Første møte | Økt-fanen sier «Ingen program ennå» med to knapper. Plan-fanen er en liste med ni programnavn. | En ny bruker må vite hva StrongLifts eller GZCLP er for å velge. Programguiden finnes, men ligger som ett kort blant mange. |
| Plan-fanen | Rommer aktivt program, hele planen, bytte av program, maksløft, pauser, Pete Plan og alle innstillinger (tannhjulet). | Én fane gjør fem jobber. Innstillinger som skybackup og varsler ligger langt fra der de brukes. |
| Logg-fanen | Bra innhold (oppsummering, kalender, sparklines, liste), men tom og mørk før første økt. | Fremgangen er hovedbelønningen i en treningslogg. Den bør synes allerede fra første økt. |
| Lesbarhet | Lyse ark oppå et mørkt bilde av treningsrommet. Tekst rett på bildet (ingresser, overskrifter) får lav kontrast. | Treningsrommet er lyst og fullt av gjenskinn. Telefonen holdes på armlengdes avstand. |
| Økt-skjermen | Aktiv økt er en fane blant fire. Pauselinja nederst ligger over innholdet. | Under en økt trenger du bare økta. Fanelinja tar plass og kan trykkes på ved et uhell. |
| Rød penn | «Hoppet over» og bom står i rødt. | Rødt leses som feil. En hoppet økt er ofte et riktig valg (syk, sliten). Se trend 7. |

## Landskapet: hvem gjør hva

| App | Hva den er | Det som er verdt å merke seg |
|---|---|---|
| **Strong** | Den raskeste rene loggen | Forrige vekt er fylt inn, automatisk pausetimer og skivekalkulator med ett trykk. Lite annet. |
| **Hevy** | Logg + sosialt nettverk | Følg venner og kopier øktene deres. Apple Watch-app, Live Activity på låseskjermen og Dynamic Island, widgets. Siden september 2026 kan en ferdig økt sendes til ChatGPT eller Claude fra avslutningsskjermen. |
| **Fitbod** | Automatisk generert trening | Lager hver økt ut fra hvor utmattet hver muskelgruppe er. Viser trender per muskel og øvelse. Ingen gratisversjon. |
| **Jefit / Boostcamp** | Programbibliotek | Ferdige programmer over mange uker, analyse per muskel. Nærmest Stanga i tankegang. |
| **Strava** | Sosial plattform for utholdenhet | Fikk egen styrkelogg i mai 2026: sett, reps og vekt, muskelkart etter økta og 14 integrasjoner (blant annet Hevy, Fitbod, Garmin og WHOOP). Kjøpte Runna i 2025. |
| **Runna** | Løpeplaner som tilpasser seg | Styrke- og mobilitetsøkter ligger inne i løpeplanen. |
| **WHOOP** | Armbånd + app for belastning og restitusjon | I 2026: AI-genererte styrkeøkter, automatisk anslag på muskulær belastning, og en fordeling mellom kondisjons- og muskelbelastning etter hver økt. Ukesmål for styrketid. |
| **Apple (watchOS 26 / iOS 26)** | Plattform | Workout Buddy gir talt oppmuntring basert på historikk og puls. Nytt visuelt språk (Liquid Glass). HealthKit lagrer rådata, men lager ikke selv en «readiness»-score. |
| **Google Health** | Plattform | Ny helseapp med en AI-coach (Gemini) som bruker data fra klokka og helsejournal, åpnet også for Apple Watch-brukere i mai 2026. |

Mønsteret er tydelig: **logging er blitt en selvfølge**. Konkurransen står nå om tre ting: hvor godt appen *forklarer og tilpasser* treningen, hvor godt den samler *styrke og kondisjon* i ett bilde, og hvor *lite friksjon* det er å bruke den hver dag.

## Tolv trender, og hva de betyr for Stanga

Hver trend har en vurdering:

- **Behold:** Stanga gjør det allerede godt.
- **Forsterk:** Stanga har grunnlaget, men det bør bli tydeligere.
- **Nytt:** Noe Stanga ikke har, og som bør inn.
- **Avstå:** Noe vi bevisst ikke gjør.

### 1. Logging med færrest mulig trykk — *Behold*

**Hva skjer:** Strong, Hevy og de andre konkurrerer på hvor få trykk et sett tar. Forrige vekt er fylt inn, pausen starter av seg selv, og skivene regnes ut.

**Stanga:** Allerede i toppklassen. Ett trykk på tallet fører inn settet, starter pausen og viser skivene for neste sett.

**For redesignet:** Ikke rør selve mekanikken. Gjør den heller større og mer robust: større trykkflate, tydelig «angre» på siste sett, og lyd eller vibrasjon som kvittering der telefonen støtter det.

### 2. Fra logg til coach: tilpasning og forklaring — *Forsterk*

**Hva skjer:** Fitbod, Runna og WHOOP lager eller justerer øktene for deg. Apple og Google har bygd AI-coacher inn i plattformene. Hevy sender økta til en chatbot.

**Hva sier forskningen:** En metaanalyse av 15 randomiserte studier fant at selvregistrering i en app hadde liten effekt alene, men tydelig større effekt når den ble kombinert med *tilpasset råd* (Kassavou mfl. 2022). En oversikt over kontekstbevisste apper fant at tilbakemelding og overvåking, mål og planlegging var de vanligste virkemidlene i apper som endret atferd (Thomas Craig mfl. 2021).

**Stanga:** Har allerede mer ekte tilpasning enn de fleste: ATHX justerer arbeidsmaks etter RPE, Pete Plan regner ut 2K-tiden baklengs, programmene trapper ned etter bom. Men det skjer i det stille. Brukeren ser et nytt tall, ikke *hvorfor*.

**For redesignet:** Gjør coachen synlig. Etter hver økt: én eller to setninger på vanlig norsk om hva som endret seg og hvorfor («Knebøy går opp 2,5 kg. Alle sett var i mål.» / «Markløft står stille. Siste sett var RPE 9,5, over målet på 8.»). Det er regler som allerede finnes i koden, bare skrevet ut. En språkmodell trengs ikke for dette. En AI-coach kan vurderes senere, men da som valgfritt tillegg, siden det krever nett og sender treningsdata ut av telefonen.

### 3. Autoregulering (RPE og reps i reserve) — *Forsterk, med forsiktighet*

**Hva er det?** I stedet for å løfte en fast prosent av maks, justerer du vekten etter hvordan dagen er. RPE er en skala fra 1 til 10 for hvor tungt et sett var. RPE 8 betyr omtrent «to reps igjen».

**Hva sier forskningen:** Samlet ser autoregulering ut til å gi litt mer styrke enn faste prosenter (Zhang mfl. 2021; Huang mfl. 2025). Men en nettverksmetaanalyse fra 2026 fant at nettopp RPE-styrt trening *ikke* var signifikant bedre enn faste prosenter for knebøy, mens andre former (APRE, fartsbasert) var det (Bao mfl. 2026). Bildet er altså blandet.

**Stanga:** Bruker RPE i Strength & Power og ATHX, men ikke i de klassiske programmene.

**For redesignet:** Ett felles, raskt RPE-valg etter siste arbeidssett (for eksempel fem knapper: 6 · 7 · 8 · 9 · 10), valgfritt i alle programmer. Brukes til å forklare (trend 2) og til å oppdage tretthet over tid, ikke til å overstyre programmer som ikke er laget for det.

### 4. Hybrid trening: styrke og kondisjon i ett bilde — *Forsterk (her ligger Stanga foran)*

**Hva skjer:** Strava, som har vært en app for løp og sykkel, bygde inn styrkelogg i 2026. Runna legger styrke inn i løpeplaner. WHOOP viser hvor stor del av belastningen som var muskulær og hvor stor som var kondisjon. Konkurranser som HYROX og ATHX har gjort hybrid trening til en egen sjanger.

**Stanga:** Har metcon-budsjett (minutter × RPE siste sju dager), Pete Plan og et fullt ATHX-program. Det er sjelden i en styrkeapp.

**For redesignet:** Samle det som i dag er spredt (metcon-budsjett, Pete Plan-kort, ATHX-kondisjonskort, kondisjonsminutter i Logg) i én visning av ukas belastning: styrke og kondisjon side om side, med samme skala. Det gjør hybridprofilen til et kjennetegn, ikke en rekke tillegg.

### 5. Restitusjon og «readiness» — *Nytt, i enkel form*

**Hva er det?** Readiness er et anslag på hvor klar kroppen er for å trene i dag, vanligvis regnet ut fra puls, pulsvariasjon og søvn fra en klokke.

**Hva skjer:** WHOOP, Garmin, Apple og Google viser alle en form for restitusjon eller beredskap.

**Begrensning:** Stanga er en webapp (PWA). En webapp får ikke lese Apple Helse (HealthKit) eller Health Connect på Android. Det kan bare en app fra App Store eller Google Play.

**For redesignet:** En valgfri sjekk før økta med tre trykk: søvn, energi og stølhet (for eksempel tre knapper hver). Det virker uten nett og uten klokke. Lagres sammen med økta, så Logg kan vise sammenhengen over tid («Øktene etter dårlig søvn hadde høyere RPE»). Svaret skal ikke endre programmet av seg selv, bare gi et forslag, som «lett dag?».

### 6. Fremgang du kan se — *Forsterk*

**Hva skjer:** Fitbod og Jefit viser fremgang per muskel. Strava lager et muskelkart etter hver økt. WHOOP viser trender per uke, måned og seks måneder. Totalvolum (tonnasje) og rekorder vises tydelig.

**Stanga:** Logg har oppsummering for fire uker, kalender, sparklines for toppvekt og en liste. Rekorder ringes rundt i blått under økta.

**For redesignet:**

- Gi Logg et nytt navn, for eksempel **Fremgang**, og løft fram det som viser utvikling: anslått 1RM per hovedløft over tid, rekorder, ukevolum.
- En **oppsummering etter økta**: tid, sett, totalvekt, rekorder og coach-setningen fra trend 2. Det er øyeblikket der motivasjonen er størst.
- Et **ukeskort**: «3 av 3 økter · 42 min kondisjon · 2 rekorder».
- Muskelkart er populært, men krever at hver øvelse er merket med muskler. Det kan komme senere.

### 7. Snillere motivasjon: bort fra harde rekker — *Nytt*

**Hva skjer:** Rekker (streaks) har vært standard, men kritikken har vokst: en rekke straffer sykdom og hviledager like hardt som å droppe trening. Flere apper har gått over til ukesmål, «frysedager» og rekker som tåler en pause. Forskningen på dette er tynn. Mye av det som skrives, kommer fra apputviklere.

**Stanga:** Har ingen rekker, og det er bra. Men hoppede økter står i rødt og strøket over i loggen.

**For redesignet:** Bruk **ukesmål** som tar utgangspunkt i programmet («3 økter i uka»). En hoppet økt markeres nøytralt (grå blyant, ikke rød penn) med en kort grunn hvis brukeren vil. Rød penn spares til det som faktisk krever handling, som bom tre ganger på rad.

### 8. Sosialt, men i små grupper — *Behold retningen, forsterk litt*

**Hva skjer:** Hevy og Strava har åpne strømmer der alle ser alt. Det gir engasjement, men også press og sammenligning. En anmelder av Hevy klager på at strømmen ikke kan slås av.

**Stanga:** Sammen er bygd rundt å *avtale* trening med venner (timer, tidsvinduer, chat). Det er uvanlig og nyttig. Loggen er privat.

**For redesignet:** Behold avtaler som kjernen. Vurder ett lite tillegg: muligheten til å **dele én ferdig økt** med en venn eller en gruppe, som et kort i chatten, når man selv vil. Ingen offentlig strøm, ingen rangeringer. Uten konto viser Sammen i dag to setninger og et innloggingsskjema. Vis heller hva du får (et eksempel på en time og en chat) før skjemaet.

### 9. Appen utenfor appen: låseskjerm, klokke, widgets — *Avstå foreløpig (teknisk grense)*

**Hva skjer:** Hevy viser pausen på låseskjermen og i Dynamic Island, har klokkeapp og widgets. Det betyr at man ikke må låse opp telefonen mellom settene.

**Begrensning:** Ingenting av dette er mulig for en webapp på iPhone. Webapper har fått pushvarsler og tall på ikonet (siden iOS 16.4), og Stanga bruker begge.

**For redesignet:** Bruk det webapper *kan*: hold skjermen våken under økta (Stanga gjør dette allerede), vis tydelig pause rett etter opplåsing, og bruk varsel når pausen er over. Om en «ekte» app (for eksempel via en innpakning som Capacitor) er verdt det, er et strategisk valg, se åpne spørsmål.

### 10. Visuelt språk: store tall, mørkt, taktilt — *Behold identiteten, rydd i gjennomføringen*

**Hva skjer:** Apple innførte Liquid Glass (gjennomsiktige, glassaktige lag) i iOS 26. Google har Material 3 Expressive med mer farge og form. Treningsapper bruker svært store tall, mørk bakgrunn og tydelige farger for status. Flere designbyråer peker på «emosjonell design»: hvordan appen får deg til å føle deg om deg selv, ikke bare hvor mye data den viser.

**Stanga:** Treningsboka er en sterk og egen idé, og det store tallet i økta er helt i tråd med trenden.

**For redesignet:**

- **Behold:** treningsboka, fargespråket (blyant, blå penn, rød penn) og Archivo.
- **Rydd:** bakgrunnsbildet bør tones mer ned eller bare brukes i tomme flater, slik at all tekst står på papir eller på en rolig flate. Det gir bedre kontrast i et lyst treningsrom.
- **Ikke kopier** Liquid Glass. Det passer ikke med papir, og gjennomsiktighet gir dårligere lesbarhet, som er det vi vil bort fra.

### 11. Personvern og eierskap til egne data — *Behold, gjør det til et salgsargument*

**Hva skjer:** De store plattformene kobler treningsdata mot helsejournaler og AI-coacher. Det gir mer innsikt, men også mer data i skyen hos store selskaper.

**Stanga:** Lokalt først, ingen konto nødvendig, skyen i EU og bare når du slår den på. Eksport og import som tekst.

**For redesignet:** Si det tydelig ett sted («Loggen din er på telefonen din»), heller enn i små forklaringstekster på flere sider. Vurder eksport til vanlige formater (CSV) og deling til Strava, siden Strava nå tar imot styrkeøkter. Det er det brukere spør etter når de vurderer å bytte app.

### 12. Første møte: fra programliste til mål — *Nytt*

**Hva skjer:** De fleste nye apper starter med noen få spørsmål om mål, erfaring, dager i uka og utstyr, og foreslår så en plan. Fitbod og Runna gjør dette godt.

**Stanga:** Har all kunnskapen i Programguiden, men starter med en liste over programnavn.

**For redesignet:** En kort start med fire spørsmål:

1. Hva vil du mest? (Bli sterk · Styrke + kondisjon · Konkurranse (ATHX) · Bare logge)
2. Hvor lenge har du trent styrke? (Nytt · Under 1 år · Over 1 år)
3. Hvor mange dager i uka? (2 · 3 · 4)
4. Hvilken stang? (20 kg · 15 kg)

Appen foreslår ett program med en setning om hvorfor, og lenke til hele Programguiden. «Bare logge» gir fri økt uten program.

## Oppsummering: hvor står Stanga?

| Trend | Markedet | Stanga i dag | Vurdering |
|---|---|---|---|
| 1. Rask logging | Selvfølge | Svært god | Behold |
| 2. Coach som forklarer | Hovedtrenden | Logikken finnes, men er usynlig | Forsterk |
| 3. Autoregulering | Vanlig i nyere apper | Bare i to programmer | Forsterk, valgfritt |
| 4. Hybrid styrke + kondisjon | Raskt voksende | Uvanlig sterk, men spredt | Forsterk, samle |
| 5. Readiness | Fra klokker | Mangler | Nytt, enkel egenvurdering |
| 6. Synlig fremgang | Selvfølge | Finnes, men gjemt | Forsterk |
| 7. Snill motivasjon | Økende | Ingen rekker, men rødt for hopp | Nytt: ukesmål |
| 8. Sosialt i små grupper | Blandet | Avtaler og chat | Behold, legg til deling |
| 9. Låseskjerm og klokke | Vanlig i native apper | Ikke mulig som webapp | Avstå foreløpig |
| 10. Visuelt språk | Store tall, mørkt | Egen identitet, litt lav kontrast | Behold, rydd |
| 11. Personvern | Blandet | Svært god | Behold, si det tydelig |
| 12. Målbasert start | Vanlig | Programliste | Nytt |

## Hva vi tar med inn i redesignet

### Designprinsipper

1. **Økta først.** Under en økt finnes bare økta. Alt annet venter.
2. **Ett trykk per sett.** Mekanikken som virker, skal ikke bli tregere.
3. **Forklar tallene.** Hver endring i vekt eller plan får én setning om hvorfor.
4. **Én uke, ett bilde.** Styrke og kondisjon vises sammen, med samme mål for belastning.
5. **Snill, men ærlig.** Hvile er ikke feil. Rødt brukes bare når noe trenger handling.
6. **Lesbart på armlengdes avstand.** Tekst står aldri rett på bildet.
7. **Lokalt først.** Alt virker uten nett og uten konto, som i dag.

### Foreslått struktur (utkast, til diskusjon)

| I dag | Forslag | Hva endres |
|---|---|---|
| **Økt** | **I dag** | Hjemskjerm: dagens økt med én stor startknapp, ukesmål, valgfri sjekk av søvn/energi/stølhet. Uten program: målbasert start (trend 12). |
| *(del av Økt)* | **Aktiv økt** (fullskjerm) | Egen modus uten fanelinje. Store tall, pause i arket, «Fullfør» nederst. Oppsummering med coach-setning etterpå. |
| **Plan** | **Program** | Aktivt program, hele planen og bytte av program. Maksløft og pauser her. Innstillinger flyttes ut. |
| **Logg** | **Fremgang** | Ukeskort, belastning (styrke + kondisjon), 1RM-kurver, rekorder, så listen over økter. |
| **Sammen** | **Sammen** | Som i dag, med en forklarende side uten konto og deling av ferdige økter. |
| *(tannhjul i Plan)* | **Profil/innstillinger** | Ikon øverst på I dag: konto, skybackup, varsler, stang, lyd, eksport. |

### Prioritering

**Nå (største effekt, lite ny logikk):**

- Aktiv økt som egen fullskjermmodus.
- Oppsummering etter økta med coach-setning (bygger på reglene som finnes).
- Logg → Fremgang, med ukeskort øverst.
- Innstillinger ut av Plan.
- Bedre kontrast: ingen tekst direkte på bildet.

**Neste:**

- Målbasert start for nye brukere.
- Ukesmål og nøytral markering av hoppede økter.
- Felles belastningsvisning for styrke og kondisjon.
- Valgfri RPE etter siste sett i alle programmer.

**Senere / avhengig av valg:**

- Sjekk av søvn, energi og stølhet med sammenheng i Fremgang.
- Deling av ferdig økt i Sammen.
- Eksport til CSV og deling til Strava.
- Muskelkart.
- Native innpakning for låseskjerm, klokke og Apple Helse.
- AI-coach som valgfritt tillegg.

## Åpne spørsmål (Jonas bestemmer)

1. **Hvem er appen for?** Deg og vennene dine, eller skal den kunne brukes av hvem som helst? Svaret avgjør hvor mye vekt målbasert start og forklaringer skal ha.
2. **Webapp eller app i App Store?** Webapp er gratis, uten byggesteg og oppdateres med en gang. En innpakning gir låseskjerm, klokke og Apple Helse, men krever utviklerkonto (99 USD i året hos Apple), byggesteg og godkjenning for hver versjon.
3. **Treningsboka:** Skal bakgrunnsbildet beholdes som i dag, tones ned eller fjernes?
4. **AI-coach:** Ønsket i det hele tatt? I så fall må treningsdata sendes til en tjeneste utenfor telefonen, noe som bryter med «lokalt først» med mindre det er tydelig valgfritt.
5. **Navn på fanene:** «I dag / Program / Fremgang / Sammen», eller beholde «Økt / Plan / Logg / Sammen»?

## Kilder

### Forskning (PubMed)

- Kassavou A, Wang M, Mirzaei V, Shpendi S, Hasan R. The Association Between Smartphone App-Based Self-monitoring of Hypertension-Related Behaviors and Reductions in High Blood Pressure: Systematic Review and Meta-analysis. *JMIR mHealth uHealth* 2022;10(7):e34767. [doi:10.2196/34767](https://doi.org/10.2196/34767)
- Thomas Craig KJ, Morgan LC, Chen CH, Michie S mfl. Systematic review of context-aware digital behavior change interventions to improve health. *Transl Behav Med* 2021;11(5):1037–1048. [doi:10.1093/tbm/ibaa099](https://doi.org/10.1093/tbm/ibaa099)
- Kheirdoust A mfl. Investigating the approach of using behavior change techniques in the field of mobile applications: a systematic review. *BMC Health Serv Res* 2025;25:1347. [doi:10.1186/s12913-025-13534-7](https://doi.org/10.1186/s12913-025-13534-7)
- Zhang X, Li H, Bi S mfl. Auto-Regulation Method vs. Fixed-Loading Method in Maximum Strength Training for Athletes: A Systematic Review and Meta-Analysis. *Front Physiol* 2021;12:651112. [doi:10.3389/fphys.2021.651112](https://doi.org/10.3389/fphys.2021.651112)
- Huang Z, Sun J, Li D mfl. Autoregulated resistance training for maximal strength enhancement: A systematic review and network meta-analysis. *J Exerc Sci Fit* 2025;23(4):360–369. [doi:10.1016/j.jesf.2025.07.006](https://doi.org/10.1016/j.jesf.2025.07.006)
- Bao J, Liu X, Huang Y mfl. Relative effectiveness of different resistance training modalities on lower-body strength and explosive power: a systematic review and network meta-analysis. *Front Physiol* 2026;17:1823323. [doi:10.3389/fphys.2026.1823323](https://doi.org/10.3389/fphys.2026.1823323)

### Markedet (retningsgivende, mange er partsinnlegg)

- Strava om styrke, mai 2026: [9to5mac](https://9to5mac.com/2026/05/21/strava-adds-dedicated-strength-training-support-for-sets-reps-weight-and-muscle-groups/), [Wareable](https://www.wareable.com/sport/strava-strength-training-update-muscle-maps-integrations), [T3](https://www.t3.com/active/strava-strength-training-update-0526), [pressemelding via WHOOP](https://www.whoop.com/us/en/press-center/strava-overhauls-strength-experience-with-expanded-partner-ecosystem-new-workout-log-and-muscle-maps/)
- Strava og Runna: [DC Rainmaker](https://dcrainmaker.com/2025/04/strava-acquires-runna-thoughts-forward.html), [the5krunner](https://the5krunner.com/runna/), [T3 om Strava 2026](https://www.t3.com/active/strava-2026-future-and-challenges)
- WHOOP 2026: [WHOOP – What's new](https://www.whoop.com/us/en/thelocker/2026-whats-new/), [Wareable – beste treningsarmbånd](https://www.wareable.com/sport/the-best-gym-fitness-tracker-band-weights-wearables)
- Sammenligning av loggeapper (konkurrenter/affiliate): [Jefit](https://www.jefit.com/blog/fitbod-vs-strong-vs-jefit-vs-hevy), [Boostcamp](https://www.boostcamp.app/best/workout-apps), [RepReturn](https://repreturn.com/strong-app-vs-hevy/), [Fitbod](https://fitbod.me/blog/best-workout-tracker-apps-for-2026/)
- Hevy: [App Store-oppføring](https://apps.apple.com/us/app/hevy-%D1%82%D1%80%D0%B5%D0%BA%D0%B5%D1%80-%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D0%BA-%D0%B2-%D0%B7%D0%B0%D0%BB%D0%B5/id1458862350?l=ar), [Hevy-anmeldelse 2026](https://aitoolsbakery.com/blog/hevy-review/), [AppPricingLab](https://apppricinglab.com/app/apple/1458862350)
- Apple watchOS 26 og Workout Buddy: [Apple Newsroom](https://www.apple.com/newsroom/2025/06/watchos-26-delivers-more-personalized-ways-to-stay-active-and-connected/)
- Apple Health og readiness: [Sahha om WWDC 2026](https://sahha.ai/blog/wwdc-2026-apple-health-developers/)
- Google Health og AI-coach: [NBC Palm Springs](https://www.nbcpalmsprings.com/2026/05/07/google-health-app-will-soon-welcome-apple-watch-users-as-ai-race-intensifies)
- Rekker og motivasjon: [Mind the Product](https://www.mindtheproduct.com/designing-streaks-for-long-term-user-growth/), [Six Colors](https://sixcolors.com/link/2023/06/apples-fitness-streaks-need-more-humanity/), [Yu-kai Chou](https://yukaichou.com/?p=38981), [Sahha om gamification](https://sahha.ai/blog/gamification-behavioral-nudges-health-apps/)
- Generelle trender (byrå- og leverandørblogger): [Affective](https://weareaffective.com/learning-centre/fitness-app-trends-2026-what-users-really-want-from-their-workout-apps), [Feed.fm](https://blog.feed.fm/digital-fitness-in-2026-workout-and-wellness-trend-report), [Hyscaler](https://www.hyscaler.com/insights/guide-to-fitness-app-development/)
- Webapper på iOS: [MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide), [Webscraft](https://webscraft.org/blog/pwa-pushspovischennya-na-ios-u-2026-scho-realno-pratsyuye?lang=en)
