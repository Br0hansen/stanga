# Stanga – treningsapp på hjemskjermen

Styrkeprogrammer (StrongLifts 5×5, Starting Strength, GZCLP, 5/3/1 FSL og BBB, Juggernaut, Cube Method og Strength & Power), Burgener 12 uker for olympisk vektløfting, Muscle MetCon 12 uker (styrke, metcon og finisher i hver økt, sekundærløft styrt av RPE), EMOM Capacity 12 uker (styrke som E2MOM og 4-stasjons EMOM-er), Circuit EMOM 12 uker (kretser med åtte stasjoner), Cube EMOM 12 uker (tre baseløft i E4MOM hver økt), RP Hypertrofi på 3 og 5 dager (13 uker i tre mesosykluser), Knebøy, benk og RP (en tung dag med knebøy og benk og to RP-dager), Brosesh (12 uker med tre helkroppsøkter, bygd på RP Strengths hypertrofiguide), et konkurranseprogram for ATHX 2027, øktbank med metcons, egne metcons, metcon-klokke og treningslogg. Alle data lagres lokalt på telefonen.

## Utseende: Treningsboka

Appen ser ut som en treningsbok. Programmet står trykt på et ark over bildet av treningsrommet. Fargene betyr én ting hver:

- **Blyant (grått og svart):** planen og det som venter. Neste sett og neste økt i planen har en tykk strek i tekstfargen.
- **Blå penn:** det du har gjort. Det gjelder avkryssede sett, løftet vekt, økning i vekt og egne meldinger. En ny rekord ringes rundt, med ordet «Rekord» og anslått 1RM.
- **Rød penn:** avvik. Det gjelder bom, de siste sekundene av pausen og varsler om noe nytt. Hoppede økter er et valg, ikke et avvik, og strykes over i grå blyant i loggen, planen og kalenderen.
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

**Tastatur og skjermleser:** Når en ny side åpnes, får overskriften fokus. Ellers blir fokus stående på knappen eller feltet du brukte, også når skjermen tegnes på nytt. Meldinger nederst på skjermen leses opp. Feil i et felt står rett under feltet og forsvinner når du skriver. Innlogging og nytt passord sendes med Enter eller «Gå» på tastaturet.

Appen har fire faner: **I dag** (dagens økt), **Program**, **Fremgang** og **Sammen**. **Innstillinger** åpnes med tannhjulet øverst til høyre på I dag.

**Program** er delt i **Plan**, **Oppsett** og **Bibliotek**. Plan viser det aktive opplegget, pågående økt med direktevei til I dag, og kommende uker. Oppsett samler arbeidsvekter, faste øvelsesbytter, Pete Plan, lagrede maksløft og avslutning. Bibliotek beholder alle ferdige og egne programmer, programguiden, startvekter, kopiering og deling.

## I økta

- **Øktoversikten** har en fremdriftslinje med én bit per øvelse. Øvelsen du holder på med, ligger på et eget ark. Vekt og reps for det aktive settet står samlet i én stor trykkflate, med skivene rett under. Settraden følger rett etter, med nummer på hvert sett. Pauseklokka har en egen fast rad under settene. **Trykk på den store registreringsflaten** for å føre inn neste sett med målet som reps, også mens pausen går. Pausen starter med en gang. Rutene under brukes til å rette opp. Ferdige øvelser blir én linje med en gang. Neste øvelse åpnes automatisk, og visningen følger med slik at pauseklokka, neste vekt og reps er synlige uten rulling. EMOM-løft følger rundene i programmet. Kort med RPE eller ekstra AMRAP-reps er fortsatt tilgjengelige. Øvelser du ikke har begynt på, står som én linje med navn og vekt. Trykk på en linje for å åpne den.
- **Angre** tar tilbake siste registrering med ett trykk, også etter overgangen til neste øvelse. Knappen har fast plass øverst i det aktive kortet. Forrige pause gjenopprettes. Nye endringer i øvelsene gjør at en gammel angring ikke kan overskrive dem.
- **Oppvarming** står alltid åpen, rett over arbeidssettene. Hver gruppe har en liten overskrift.
- **Fullfør økt** ligger etter øktinnholdet og spør først hvis noen sett ikke er logget, og sier hvilke løft som regnes som bom og hvilke som står på samme vekt.
- **Oppsummeringen** står i stedet for neste økt etter «Fullfør økt»: hva som skjer med hvert løft, rekorder, volumet som én linje, og neste økt med vekter. **Klar for neste økt** viser neste økt, så ingen sett kan trykkes i en økt du ikke har startet.
- **Registreringsflaten** viser vekt og reps uten ekstra hjelpetekst. Skjermleseren får fortsatt handlingen lest opp. Under settene forklares retting av reps de tre første øktene.
- **Etter styrken** er én rad med «+ Kondisjon» (når Pete Plan er på), «+ Metcon» og «+ Notat». Trykk for å åpne en del. En del med innhold, for eksempel en valgt Pete Plan-økt eller et notat, står åpen til du trykker på den. Slår du av Metcon eller Kondisjon, tas metconen eller Pete Plan-økta ut av økta. Den lagres ikke og teller ikke i budsjettet. Et nytt trykk henter den tilbake slik den var. Notatet skjules bare. Metcon-budsjettet ligger under «+ Metcon».
- **Under «Fullfør økt»** står bare «Hopp over økta». Planen ligger under Program, og fri økt logges fra Fremgang.
- **Legg til øvelse** står under øvelsene i dagens økt. Først kommer øvelsene du har logget sist (**Nylig brukt**), så et søk i øvelsesbiblioteket. Finnes ikke øvelsen, lager du den med navnet du skrev. Du velger sett, reps og vekt. Forslaget er det du gjorde sist, ellers 3 × 10 og tom stang. Øvelsen står med «Lagt til i dag» og gjelder bare dagens økt. Den logges, teller i rekorder og «sist brukt», men programmet ser den ikke, så ingen vekter i programmet flyttes. Fjernes den, forsvinner den helt.
- **Fjern med ett trykk:** Øvelser du ikke har begynt på, har **Fjern** på linjen sin. De havner under «Fjernet fra dagens økt» og kan tas tilbake. Øvelser med loggede sett fjernes under **Valg**, med en bekreftelse.
- **Valg** på hvert øvelseskort åpner et modalt panel nederst på skjermen med **Bytt i dag** og **Fjern fra dagens økt**. Øvelsesvalg, vekt og bekreftelser blir i panelet. Lukk, Escape eller trykk utenfor lukker det uten å endre økta, og gir fokus tilbake til Valg på samme sted i økta. Først kommer alternativene appen har for løftet (frontbøy for knebøy, med vekt regnet om), så inntil seks øvelser fra biblioteket med samme hovedmuskel, med samme utstyr først, og et søkefelt. Du velger øvelsen og bekrefter vekta: forslaget er omregnet vekt, ellers det du løftet sist. Innbytteren får samme sett og reps og står med «I stedet for …». **Tilbake til …** angrer. Originalen logges som urørt og «Byttet ut», så programmet ikke flytter vekta i den. Innbytteren logges med egen vekt og teller i rekorder. Bare dagens økt endres. Faste bytter gjøres under Program → Oppsett.
- **Hopp over økta** Du får en bekreftelse som sier hvilke løft som ikke får økning den gangen. Økta står som «Hoppet over» i loggen og i hele planen, men teller ikke som treningsdag.
- **Oppvarming** står alltid åpen, rett over arbeidssettene, så du ser hele øvelsen uten å trykke. Oppvarmingssettene er mindre og grå, med vekten under hvert sett. Det aktive oppvarmingssettet vises med både vekt og reps i den store trykkflaten, med skiver per side. Rutene blir stående når oppvarmingen er gjort, så arbeidssettene ikke flytter seg. Pausen har en egen rad med fast høyde, så vekt, reps og arbeidssett ikke flytter seg når pausen starter og slutter. Hovedløft får full oppvarming der siste sett er en single på ca. 90 % av arbeidsvekten (80 % under 60 kg), så hoppet til første arbeidssett er lite. Repsene synker mot toppen, så oppvarmingen ikke sliter deg ut. Oppvarmingsvektene rundes til nærmeste 5 kg per side (10 kg på stanga, for eksempel 50, 70, 80 og 90 kg), så du slipper småskiver. Arbeidsvektene rundes ikke. Sekundærøvelser får to korte sett, det siste på ca. 85 %. Settene kan trykkes som gjort og gir 60 sekunders pause, men teller ikke som arbeidssett og lagres ikke i loggen.
- **Pauser etter type sett**, slik forskningen anbefaler: tunge sett 3 min, volumsett 2 min og lette hjelpeøvelser 90 s. Strength & Power, Cube, Juggernaut og Burgener har egne pauser. Oppvarming gir 60 s, og 2 min etter siste oppvarmingssett. Under **Innstillinger → Pause mellom sett** kan alle pauser skaleres til Kortere (75 %) eller Lengre (125 %), ved siden av pauselyden. Pauselengden rundes deretter til nærmeste 10 sekunder: 150 s × 75 % blir 110 s (1:50). Etter siste sett i økta går det ingen pause. Å rette reps på et sett som er gjort, starter ikke pausen på nytt.
- **Pausen har en egen rad under settene.** Vekt og reps blir stående i den store trykkflaten mens klokka teller ned. Pauseknappene «+30 s» og «Avslutt pause» står til høyre, og en strek under viser tiden som gjenstår. Raden beholder høyden når pausen er over eller avsluttes. De siste 10 sekundene blir tiden og streken røde. Ved null blinker skjermen lyst én gang; overtid vises som +0:12. På andre faner står pausen fortsatt i linjen nederst. Lyd ved slutten kan slås på under **Innstillinger**.
- **Skiver per side** regnes ut med 20 kg stang og skivene 20, 15, 10, 5, 2,5 og 1,25 kg. 25 kg er bevisst utelatt. Under **Innstillinger → Stang** kan du velge 15 kg stang. Da regnes skivene, oppvarmingen og laveste vekt på stangøvelser ut fra 15 kg. Arbeidsvektene i programmet endres ikke.
- **Startvektene** velges på programsiden under «Hvor starter du?»: **Tom stang** (nybegynnerprogrammene, markløft med 10 kg per side), **Et sett jeg klarte nylig** (vekt × reps gir et anslag på 1RM, Epley, regnet opp til 12 reps) eller **Jeg vet maksløftene mine**. Feltene er tomme til du har valgt eller skrevet noe, eller fylt med maksløftene du har lagret fra før. «Første økt blir» står åpent rett over **Aktiver program**. Bakgrunnsstoffet om programmet ligger bak raden «Om programmet, forskningen og øktene».
- **Hele planen** vises på programsiden før du aktiverer. I **Program**-fanen står uka du er i og neste, og **Vis alle uker** viser resten. Hver økt viser alle løftene med vekt. Fullførte økter står i blått. Planen viser vektene hvis alt går som planlagt, fullførte økter viser det du faktisk løftet, og resten oppdateres etter hver økt. Programmer uten fast slutt vises 12 uker fram.

## Endre og slette økter i loggen

Trykk på en økt under **Fremgang** for å åpne den. Nederst står **Endre** og **Slett**.

- **Endre** gir et skjema med dato, kg og reps for hvert sett, RPE for hvert løft (vurdering for clean), resultatet på en metcon, minutter og RPE på metcon eller kondisjon og notatet. Trykk på valgt RPE en gang til for å fjerne den. Minuttene teller i metcon-budsjettet. Tomt felt for minutter betyr ukjent lengde. Tomt felt for reps betyr at settet ikke ble tatt. Endringene gjelder loggen, kurvene og rekordene. **Programmet regnes ut på nytt** når du endrer RPE, vurdering, kg eller reps på en av de siste 8 øktene i programmet. Appen spoler tilbake til før økta og spiller av øktene etter den med tallene du logget, én gang med de gamle og én gang med de nye tallene. Per løft: ville en senere økt fått andre vekter i løftet, er tallet brukt, og løftet står som før. Løft du ikke har tatt igjen siden, oppdateres. Loggen endres aldri, bortsett fra økta du retter. Hoppede økter flytter ingen vekter, og frie økter og venners økter teller ikke. Fremgang viser hva som endret seg, hvilken økt de nye vektene gjelder fra, og hvilke løft som står. De nye tallene gjelder alle økter du ikke har tatt, også neste økt på økt-siden (for eksempel en hjelpeøvelse som regnes fra 1RM). Er et løft ikke med i neste økt, ser du de nye tallene den dagen løftet kommer igjen. Er neste økt påbegynt, eller er programmet startet på nytt siden, flyttes ikke vektene. Bare den nyeste økta kan angres helt ved å slette den.
- **Slett** spør først. Den nyeste programøkta kan angres helt: programmet går tilbake til der det var før økta, med samme vekter og samme neste økt. Det gjelder også en økt som er hoppet over. Eldre økter slettes bare fra loggen, og vektene i programmet står som de er.
- Teknisk: Den nyeste økta i `S.history` har en kopi av programmet fra før økta (`undo`). Kopien fjernes fra den forrige økta når en ny lagres, så bare én kopi finnes om gangen.

## Skybackup

Valgfritt og gratis for alle med konto. Slå på under **Innstillinger → Konto og kopi**.

- Hele appen (det samme som **Lag eksport**) lagres i én rad i tabellen `backups` i Supabase, noen sekunder etter hver endring, og før appen legges i bakgrunnen. Bare eieren kan lese og skrive raden.
- **Ny telefon:** Logg inn under Sammen. Er telefonen tom, hentes loggen med en gang. Har telefonen en logg fra før, sier appen fra, og du slår på skybackup under Innstillinger.
- **Flere telefoner:** Når appen åpnes eller vekkes, ser den etter endringer fra andre telefoner. Har denne telefonen ingen nye endringer, hentes skyen. Er begge endret, viser appen et kort med antall økter begge steder, og du velger **Bruk skyen** eller **Bruk denne telefonen**. Ingenting skrives over før du har valgt.
- **Slik hindres overskriving:** Raden har et versjonsnummer (`rev`) som databasen øker ved hver lagring. Appen lagrer bare hvis `rev` i skyen er det samme som sist den så.
- **Slå av** beholder kopien i skyen. **Slett kopien i skyen** fjerner den. **Slett alle data** sletter bare telefonen og slår av skybackup, så kopien i skyen ikke blir overskrevet av en tom logg. Sletter du kontoen, slettes backupen også.
- Hvor appen sist lagret (`rev`, tidspunkt, om noe venter), ligger i `stanga.sync` i telefonen, ikke i selve dataene.

## Sammen (trene med venner)

En egen fane der du legger ut når du skal trene, og vennene dine kan bli med. Konto er valgfritt. Uten konto virker appen akkurat som før, og Sammen-fanen viser bare en side for å lage konto.

**Oppsettet i Sammen:**

- **Oversikt** viser hvor mange venner som har en time i dag, inkludert venner som er påmeldt andres timer. Hver venn telles én gang, avlyste timer utelates, og en time over midnatt hører til begge dagene. Også tidligere timer samme dag inngår i tellingen. Det er planlagte timer som telles; «Aktiv nå» og «Trener nå» er separate statuser.
- **I dag**, **Kommende** og **Mine** filtrerer timene. Dine egne og timene du er påmeldt vises først. Tidligere timer kan åpnes fra dagsoversikten, men påmelding og endring er stengt når timen er over.
- **Ny time**, timedetaljer og **Nytt siden sist** åpnes i et ark nederst. Lukk eller Escape tar deg tilbake til oversikten. Valg av samme økt eller egen økt, tidsforslag, endring, avlysning og timechat bruker de samme funksjonene som før. Øktbanken åpnes fra skjemaet, og Tilbake henter fram skjemaet igjen.
- **Chat** og **Venner** ligger ved siden av Oversikt. Venner samler søk, venneforespørsler og programmer du har mottatt eller delt. Originalens temaer og Archivo brukes også i det nye oppsettet.

- **Innlogging** skjer med e-post og passord rett i appen. Det er ingen e-postbekreftelse, så du er innlogget med en gang. **Glemt passord?** sender en sekssifret kode på e-post. Koden og det nye passordet skrives inn rett i appen.
- **Brukernavn** velges første gang. Venner legges til ved å søke på brukernavn, og den andre må godta.
- **To typer timer:** fast tid (andre melder seg på) og tidsvindu (andre foreslår et tidspunkt). Når du velger et forslag, blir timen fast, og de som foreslo det, står som påmeldt.
- **Økt på timen** er valgfritt: bare trene samtidig, en metcon fra øktbanken eller fritekst.
- **Din økt:** Timene du skal på, dine egne og de du er med på, får hver sin økt fra programmet i rekkefølge. Den første timen viser neste økt med løft og vekt, og det du har lagt til på økta: metcon, Pete Plan, kondisjonsdelen i ATHX og notat. Timene etter viser øktene etter det, med vektene planen viser hvis du klarer øktene før. På timen står hele økta med sett og reps. Bare du ser dette. Vennene ser ikke vektene dine.
- **Nytt:** Fanen viser et tall for nye forslag, påmeldinger, timer og venneforespørsler. Mens Sammen står åpen på oversikten eller Venner, hentes det nytt hvert halve minutt, og Venner henter nytt hver gang den åpnes.
- **Aktiv nå og Trener nå:** Mens en venn har Sammen åpen på skjermen, har vennen en grønn prikk på bildet sitt, og under Venner står «Aktiv nå». Har vennen en økt i gang, fra første avkryssede sett (også oppvarming) til økta er ferdig, hoppet over eller slettet, står det en manual som løftes i hjørnet av bildet, og «Trener nå». Manualen vinner over prikken, og står stille hvis telefonen har redusert bevegelse. Appen sier fra omtrent hvert minutt mens Sammen er åpen, og sier fra når du går ut av Sammen eller legger bort appen. Du regnes som aktiv i to minutter etter siste gang. Trener nå fornyes hvert 20. minutt mens du krysser av, og serveren glemmer det to timer etter siste gang, i tilfelle en økt blir liggende. Vennene ser bare status nå, aldri når du var der sist eller hva du trener. Ikke-venner ser ingenting. Bryteren **Vis vennene når jeg er i Sammen eller trener** under Innstillinger er på fra start, gjelder alle telefonene dine, og når den er av, lagres ingenting.
- **Chat:** Øverst i Sammen velger du **Oversikt**, **Chat** eller **Venner**. Under Chat kan du skrive til én venn eller lage en gruppe med venner. Alle i en gruppe kan legge til vennene sine, og de nye ser hele samtalen. Hver time har sin egen chat for eieren og alle som er påmeldt, og den finnes også som knapp på timen. «‹ Chat» og navnet på samtalen står fast øverst, og skrivefeltet står fast nederst, så du kommer tilbake uten å rulle helt opp. Det gjelder også med tastaturet oppe: da krymper appen til den synlige delen over tastaturet (`visualViewport`), og fanene skjules så lenge du skriver. Nye meldinger hentes hvert fjerde sekund mens samtalen er åpen. Bare de som er med i en samtale, kan lese den.
- **Varsler:** Slå på under **Innstillinger** eller fra kortet øverst i Sammen. Da får du pushvarsel når noen blir med på eller foreslår tid på timene dine, når noen skriver i en samtale du er med i, når noen vil legge deg til som venn, og når noen godtar forespørselen din. Et trykk på varselet åpner timen, samtalen eller Venner. Fra en samtale får du ett varsel til du har lest den, uansett hvor mange meldinger som kommer. Har du samtalen åpen på skjermen, kommer det ikke varsel fra den. Ikonet på Hjem-skjermen viser samme tall som Sammen-fanen. Mens appen er lukket, følger tallet med varselet: samtaler med uleste meldinger, nye påmeldinger og forslag, venneforespørsler du ikke har svart på og nye venner. Merker kan slås av i Innstillinger → Varslinger → Stanga. Hver telefon slår det på selv. På iPhone virker det bare når appen er åpnet fra Hjem-skjermen (iOS 16.4 eller nyere). Samme varsel fra samme person sendes høyst én gang per ti minutter. Når du logger ut, slås varslene av på telefonen.
- **Bare dette lagres i skyen** (Supabase, EU): e-post, brukernavn, navn, venner, timer, påmeldinger, forslag, chatmeldinger, programmer du deler med venner og adressen for varsler hvis du har slått dem på. Treningsloggen blir på telefonen, med mindre du slår på skybackup (se under). Under **Innstillinger** kan du logge ut eller slette kontoen.
- **Tilgang:** Reglene i databasen sørger for at bare venner ser timene dine. SQL-en ligger i `supabase/migrations/`.

**Oppsett i Supabase (gjort):** *Confirm email* er slått av under *Authentication → Sign In / Providers*. E-post sendes gjennom Brevo (*Authentication → Emails → SMTP Settings*, `smtp-relay.brevo.com`, port 587), og malen *Reset password* er på norsk med `{{ .Token }}`. Avsender er foreløpig en gmail-adresse, som Brevo ikke anbefaler. Med eget domene kommer e-postene sikrere fram. *Site URL* er `https://br0hansen.github.io/stanga/`. Gratisprosjekter settes på pause etter en uke uten bruk og må da startes igjen i dashbordet.

## Egne programmer

Under **Program → Bibliotek** står **Dine programmer** øverst, med **+ Lag eget program**. De ferdige programmene står under.

- **Øktene:** Gi økta et navn, og legg til øvelser fra øvelsesbiblioteket med søk. Finnes ikke øvelsen, lager du den selv med navnet du skrev. Per øvelse velger du sett, reps, pause og progresjon. Øvelser kan flyttes opp og ned og fjernes. Opptil sju økter.
- **Progresjon per øvelse:**
  - **Lineær:** Tar du alle reps i alle settene, går vekta opp med økningen du har valgt (1,25, 2,5 eller 5 kg). Bommer du tre økter på rad, går den ned 10 %. Samme regel som StrongLifts.
  - **Dobbel progresjon:** Du jobber i et spenn, for eksempel 8–12 reps. Tar du alle settene, går målet opp én rep neste gang. Når alle settene når toppen, går vekta opp, og du starter nederst igjen.
  - **Fast:** Vekta står til du endrer den med − og + i økta. Neste gang starter du på vekta du endte på.
- **Når du trener:** **Økter i rotasjon** (A, B, A …, når det passer deg) eller **Faste ukedager** (en økt eller hviledag for hver dag). På faste ukedager er neste økt den første treningsdagen fra i dag. På en hviledag står neste økt med datoen og «Hviledag i dag», og du kan ta den likevel. Da blir neste økt den som kommer etter i uka. En treningsdag du ikke trente, går ut.
- **Startvekter:** Forslaget er den tyngste vekta du brukte sist i øvelsen, ellers tom stang. Øvelser med kroppsvekt (pull-ups, dips) starter på 0 kg ekstra.
- **Kopiere:** **Kopier og lag ditt eget** står på StrongLifts, Starting Strength og GZCLP, og **Kopier** på dine egne programmer. StrongLifts og Starting Strength blir like som originalen. GZCLP blir T1 5×3 og T2 3×10 lineært og T3 3×15–25 med dobbel progresjon, men skifter ikke trinn ved bom slik GZCLP gjør. Er programmet du kopierer aktivt, følger byttene dine med. Programmer med prosenter og uker (5/3/1, Juggernaut, Cube og de andre) kan ikke kopieres ennå.
- **Endre:** Endringer gjelder fra neste økt du ikke har begynt på. Vekta ligger per øvelse og opplegg, så du mister ikke det du har bygd opp. Samme løft med samme regel og reps i flere økter deler vekt (knebøy i økt A og B). Bytter du reps eller regel, får opplegget sin egen vekt, med forslag fra det andre.
- **Slette:** Et aktivt program kan ikke slettes. Bytt til et annet først. Loggen beholder øktene.
- **Dele med en venn:** **Del med en venn** på programsiden. Begge må si ja: du velger vennen og bekrefter, og vennen får programmet under **Sammen → Venner → Programmer til deg**, der det kan ses og godtas eller avslås. Først når vennen godtar, havner en kopi under vennens Dine programmer. Vennen får øktene, øvelsene og reglene, ikke vektene eller loggen din. Du ser svaret under **Programmer du har delt**, og kan trekke tilbake det som venter. Begge får pushvarsel hvis det er slått på. Alt som kommer fra andre, sjekkes og vaskes før appen bruker det.
- **Teknisk:** `S.userProgs[id]` holder programmene. `userDef` gjør dem om til samme form som `PROGRAMS`, og `buildUser` og `progressUser` er motoren. Reglene ligger i `RULES`: en ny regel, for eksempel RPE-styrt, er ett nytt felt der, med navn, forklaring, hvilke felt den bruker og hva som skjer etter økta. Delingen ligger i tabellen `program_shares` (se `supabase/migrations/20261103180000_programdeling.sql`).

## Øvelsesbiblioteket

449 øvelser med norske navn, utstyr, kategori og hovedmuskler. 365 er valgt ut fra [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (Unlicense, fri bruk), og 84 som manglet er lagt til: wall balls, burpees, kettlebell swing, thruster, bokshopp, toes-to-bar, romaskin, SkiErg og flere, pluss 38 alternativer fra RP-arkene (for eksempel nedtrekk med bredt grep, lav skrå DB-benk, tricepspress over hodet med EZ-stang og foroverbøyd skuldertrekk) og 18 fra RP Strength sine muskelguider til Brosesh (for eksempel belt squat, seal row, sidehev i maskin og triceps pushdown i maskin). Øvelser appen har fra før, peker til sin egen versjon, så det blir ett navn og én vekt. Søket virker på norsk og engelsk, og på utstyr og muskler. Biblioteket brukes i **Lag eget program** og under **Program → Oppsett → Øvelser og bytter → + Egen øvelse**. Ligger i `EXLIB` i `index.html`.

## RP Hypertrofi 3 og 5 dager

**Program under Program → Bibliotek.** Lagt inn fra de to RP-arkene (Renaissance Periodization): *Male Physique Template 3x Week Full Body* og 5-dagersmalen (`N_F_5_1`). Prosentene og reglene er tatt fra formlene i arkene.

- **Tre mesosykluser, 13 uker:** Basis (4 uker + deload), Metabolitt (4 uker + deload, med supersett) og Resensitivisering (2 uker + deload). 3-dagersprogrammet har press, bein og trekk. 5-dagersprogrammet har bryst og rygg, forside lår, rygg og bryst, sete og baksida lår, og skuldre og armer.
- **Plasser med alternativer:** Hver plass i økta er en kategori fra arket, for eksempel flat press eller nedtrekk og pull-ups, med en standardøvelse. Standardøvelsene er valgene fra Meso 1 i Jonas sitt ark. Plasser uten valg har fått en vanlig basisøvelse. Alle alternativene i arket ligger i øvelsesbiblioteket og kan velges under **Program → Oppsett → Øvelser og bytter** for hele mesosyklusen, eller med **Valg → Bytt i dag** i økta.
- **Vekt:** prosent av 10RM i øvelsen. Uke 1 er 85 % (Basis), 75 % (Metabolitt) eller 100 % (Resensitivisering), og uke 2, 3 og 4 er 5 %, 7,5 % og 10 % over uke 1. Andre øvelse i et supersett starter på 60 %. 10RM skrives inn på programsiden. Står et felt tomt, finner du vekta i første økt med − og +, og appen anslår 10RM fra settene (Epley med reps + reps i reserve). Ved hver ny mesosyklus regnes 10RM ut fra settene dine. 10RM kan rettes under **Vekter i programmet**.
- **Reps i reserve:** 3, 3, 2 og 1. Målet for reps er regnet baklengs fra 10RM, for eksempel 14 reps i uke 1 av Basis.
- **Vurdering:** Etter hver øvelse svarer du hvor støl du var fra sist og hvor tunge repsene var. Lett gir ett sett mer neste uke, passe like mange og tungt ett mindre, som 1, 0 og −1 i arket. Vurderingen spørres ikke i uka før deload.
- **Deload:** 2 sett med halve reps fra uke 1. De siste dagene i uka er vekta også halvert, som i arket. Andre øvelse i et supersett står over.
- **Video:** Alle øvelsene fra arkene har en **Video**-knapp i øvelseskortet. Den åpner instruksjonsvideoen fra RP i et ark over økta, fra youtube-nocookie.com, så YouTube ikke setter sporingskaker før du spiller av. Lukk, Escape eller trykk utenfor stopper videoen. Under videoen står en lenke til YouTube, hvis den ikke kan spilles i appen. Lenkene ligger i `EXVID`, og knappen vises i alle programmer som bruker øvelsene, for eksempel benkpress i StrongLifts. Unntaket er Brosesh, som viser videoene fra RP-guidene (se under).
- **Teknisk:** `RP_CAT` (kategoriene med alternativer), `RP_DAYS` (øktene), `buildRp` og `progressRp` i `index.html`. Instansen har `rm` (10RM), `est` (siste anslag), `sets` (sett neste uke per plass), `r1` (reps i uke 1) og `swaps` (valgt øvelse per plass). En plass heter «meso.dag.rad».

## Brosesh

**Program under Program → Bibliotek.** Eget 12-ukersprogram med tre helkroppsøkter i uka (A, B og C), bygd på [RP Strengths hypertrofiguide](https://rpstrength.com/blogs/articles/complete-hypertrophy-training-guide). Samme økter hele veien, så det er lett å se fremgang.

- **Øktene:** A: beinpress, brystpress i maskin, bryststøttet roing, sittende lårcurl, sidehev, bicepscurl i kabel og stående tåhev. B: rumensk markløft med manualer, skrå DB-benk, nedtrekk, beinspark, lenende sidehev i kabel, vekslende bicepscurl og kabelcrunch. C: hack squat, sittende kabelroing, butterfly, sittende lårcurl, sidehev, triceps pushdown og stående tåhev. De store øvelsene har 3 × 8–12 og 2,5 min pause, de små 2 × 10–15 eller 12–20 og 90 s pause.
- **Uke for uke:** To blokker på fem uker pluss deload. Reps i reserve er 3, 3, 2, 2 og 1–2. I uke 5 og 11 holdes rumensk markløft og hack squat på 2, og isolasjonsøvelsene kan gå til 0–1.
- **Progresjon:** Målet er én rep mer enn sist i hvert sett, opp til toppen av repområdet. Når alle settene når toppen, går vekta opp 2,5 kg, og du starter to reps over bunnen. Første gang står det et forslag (vekta du brukte sist, ellers et forsiktig anslag), og du justerer med − og +.
- **Sett:** Etter hver øvelse svarer du lett, passe eller tungt. Tungt gir ett sett mindre neste gang, lett to uker på rad gir ett sett mer, mellom 1 og 4 sett. Vurderingen spørres ikke i uke 5 og 11. I uke 7 starter du med like mange sett som i uke 1.
- **Deload (uke 6 og 12):** 80 % av vekta rundet ned til nærmeste 2,5 kg, bunnen av repområdet, 2 sett der det står 3 og 1 der det står 2.
- **Bytter og video:** Hver plass har alternativene fra RP Strength sine muskelguider (bryst, rygg, forside lår, baksida lår, sideskulder, biceps, triceps, legger og mage), 122 øvelser i alt. De kan velges under **Program → Oppsett → Øvelser og bytter** eller med **Valg → Bytt i dag**. Hver øvelse har videoen fra guiden. Videoene vises bare i Brosesh, og de andre programmene beholder videoene fra arket.
- **Teknisk:** `BRO_CAT` (alternativene), `BRO_VID` (videoene), `BRO_DAYS` (øktene), `buildBro` og `progressBro` i `index.html`. Instansen har `bro` (vekt og reps per plass og øvelse), `sets` (sett neste gang), `lett` (lett på rad), `blk` (blokka) og `swaps`. En plass heter «dag.rad».

## Pete Plan

Et fast kondisjonsvalg ved siden av øktbanken, på romaskin, ski eller sykkel. Kan slås av og på under **Program → Oppsett → Kondisjon: Pete Plan**. Bytte av løft, avslutte programmet og lagrede maksløft ligger under **Program → Oppsett**.

**Vekter i programmet** (under Løft og vekter): tallene programmet du kjører regner vektene ut fra, som treningsmaks, 1RM, toppsett, backoff og arbeidsvekter, kan rettes for hånd. Appen prøver hvert tall og viser hvilke som styrer de neste øktene og fra hvilken økt ("Brukes i neste økt", "Brukes fra Dag 1 (uke 5 av 12)"). Tall som ikke brukes de neste 9 øktene, ligger under «Andre tall i programmet». Neste økt bygges på nytt med en gang, med mindre den er påbegynt. Programmet fortsetter med vanlig progresjon fra de nye tallene, og loggen endres ikke.

- Planen er Pete Marstons tre-ukers rotasjon med seks økter per uke, kontrollert mot hans egen tabell. Appen husker hvor du er og går videre én økt om gangen.
- Målfarten regnes ut fra referansetiden din: 2000 m på romaskin og ski, 4000 m på sykkel.
- **Testet tid** stilles på et hjul, som tiden på metcon-klokka: minutter og sekunder som rulles og snapper, og raden i midten er valgt. Hjulet starter på tiden som brukes nå og lagres når du trykker «Ferdig» eller utenfor. Lukker du uten å rulle, står tiden som før, også med tideler.
- Appen regner også baklengs: snittfarten fra intervalløkter og hard distanse, minus tillegget for økta, gir et anslag på 2K-tiden din nå. Medianen av de tre siste anslagene fra seks uker brukes, så de rolige øktene følger utviklingen din. En ny testet tid går foran til nyere økter gir et nytt anslag.
- Resultatet kan skrives inn som snittfart eller som tid per drag (total tid for ett drag). Kortet viser målet på begge måter.
- Progresjon fra planen: snittfarten fra en intervalløkt blir målet neste gang samme økt kommer. Hard distanse viser din beste tid.
- På sykkel dobles distansen, og farten vises per 1000 m.
- **Tilpasset styrke** er vår egen tilpasning, ikke en del av Pete Plan: samme intervaller, men rolige økter på 6 km og hard distanse på 5 km. **Original** har 15 km og 8 km rolig og 10 km hardt.
- Økta teller som kondisjon i metcon-budsjettet, med beregnede minutter som forslag.

## Programguide

Under **Program → Bibliotek → Programguide** står det hva hvert program fokuserer på, hvem det passer for, hva forskningen sier og hva man realistisk kan forvente. Hver påstand har et evidensnivå (A, B, C eller H) og lenke til kilden. Teksten ligger i `GUIDE`, `GUIDE_GENERAL` og `REFS` i `index.html`. Kildene ble slått opp i PubMed i oktober 2026.

## Strength & Power

- Ett hovedløft per økt: benk på dag 1, knebøy på dag 2 og power clean på dag 3.
- Sekundærøvelser: pausebenk eller smal benk på knebøydagen, clean pull og frontbøy på clean-dagen. Vekten styres av RPE med mål 6–7,5.
- Uke 4 og 8 er lette uker. Appen viser RPE og 1RM-trend, og du kan hoppe over uka hvis tallene er gode.
- Uke 11 er taper med halvert volum. Uke 12 er test.

## Burgener 12 uker

**Program under Program → Bibliotek.** Mike Burgeners 12-ukers program for olympisk vektløfting, hentet fra LiftVault-arket. Prosentene er tatt fra formlene i arket, ikke fra de ferdige kiloene.

- **Oppsett:** 1RM i snatch, clean & jerk, knebøy og frontbøy. Hver øvelse regnes ut fra maksen arket bruker (snatch-familien fra snatch, clean, jerk, trekk, shrugs og RDL fra clean & jerk). Trekk og shrugs ligger over 100 % med vilje.
- **Fire økter i uka i rekkefølge**, 48 i alt. Hvert sett er en egen rute med vekt og reps. Et kompleks som power snatch + overhead squat står som «1+3» i ruta.
- **Push press i uke 9–10** har bare reps i arket (5-4-3-2-1). Appen foreslår 50–70 % av clean & jerk, og vekta kan justeres med − og +.
- **Kroppsvektøvelsene** (rygghev, sit-ups, chin-ups, hengende beinløft, bokshopp) står som en linje nederst i økta og logges ikke.
- **Uke 12, dag 4 er max out:** 85, 90 og 95 %. Beste rene snatch og clean & jerk blir ny 1RM hvis det er høyere enn før. Komplekser gir ikke rekorder.

## ATHX 2027

**Program under Program → Bibliotek.** Planen fra `docs/superpowers/specs/2026-10-26-athx-2027-treningsplan.md` er et eget program:

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

## Metcon-klokke

Én klokke for **For Time**, **AMRAP**, **EMOM** og **Intervaller**.

- **Hvor:** Klokkeikonet ved tannhjulet på I dag åpner klokka, med eller uten økt. I «Dagens metcon» står **Start klokke**, fylt ut fra økta, og **Endre**. I Fri økt står **Klokke** ved siden av Øktbank. Under «+ Metcon» og på startskjermen brukes klokkeikonet øverst, så klokka ikke har to knapper.
- **Fylt ut fra øktbanken:** Appen leser teksten i økta: «20 min AMRAP», «EMOM 15 min» med stasjonene «1:», «2:», «E3MOM x 6», «For tid, 25 min tak», «3–4 runder, 3 min pause» og «2 min hvile mellom». Formatet og minuttene i banken brukes når teksten ikke sier nok. Det appen har forstått, står under knappen før du starter.
- **Oppsettet** har Sist brukt (de tre siste), hurtigvalg (Tabata, 40/20, 30/30, EMOM 10, AMRAP 12, For Time) og én eller flere blokker. **+ Legg til blokk** setter sammen for eksempel AMRAP 8 → pause 2 → AMRAP 8, og **Gjenta alt** kjører hele rekka flere ganger.
- **Tid og runder stilles med hjul**, som på iPhone: trykk på verdien, så kommer et ark med minutter og sekunder (eller runder) nederst. Hjulene følger fingeren fra første berøring, ruller videre etter et raskt sveip og snapper til nærmeste rad. Et trykk på en rad velger den. Klokka oppdateres mens du drar. «Ferdig» eller et trykk utenfor lukker arket. For kort tid rettes opp: arbeid minst 5 s, ny EMOM-runde minst 10 s, AMRAP minst 30 s. Tak 0:00 betyr uten tak.
- **Intervaller** kan ha fast arbeidstid (40/20) eller **åpent arbeid**: du trykker når draget er ferdig, for eksempel 1 km løp, og så starter pausen.
- **Trykk på den store flaten betyr «neste»:** +1 runde i AMRAP og For Time, og «draget er ferdig» ved åpent arbeid. −1 retter et feiltrykk.
- **Skjermen:** Store tall, pausen i kondisjonsfargen, rødt de siste 3 sekundene og runder du har gjort i blått. Tre korte pip før hver ny del og ett langt når den starter. Nedtelling før start (av, 5, 10 eller 15 s) og pip kan endres i oppsettet. Skjermen holdes på mens klokka går.
- **Skjul** legger klokka i linja nederst, der pauseklokka står. Mens metcon-klokka går, starter ikke pauseklokka. **Avslutt** må trykkes to ganger.
- **Ferdig:** Resultatet fylles ut (tid, runder pluss reps eller snitt per drag) sammen med minuttene. Med et program velger du **Legg inn i dagens økt**: resultatet går til dagens metcon, eller til notatet, og minuttene går til metcon-budsjettet. Uten program, eller fra Fri økt, blir det **Lagre som fri økt**.
- Klokka lagres i `stanga.v1.clock` og står riktig etter en omstart. Den følger ikke med i skybackup. En ny versjon av appen venter til klokka er lukket.
- **Begrensning på iPhone:** Med låst skjerm kjører ikke appen, så den piper ikke da.

## Egne metcons

Du kan lage så mange metcons du vil i tillegg til dem i øktbanken.

- **+ Lag egen metcon** øverst i Øktbank. Skriv navn og økta, og velg format, minutter (valgfritt) og alene eller lag.
- **Klokka** fylles ut fra teksten mens du skriver, for eksempel «For Time · tak 20 min». Med **Still inn klokka selv** lagrer du et eget oppsett, for eksempel blokker eller intervaller, sammen med metconen.
- **Fra Fri økt:** «+ Lagre som egen metcon i øktbanken» tar med det du skrev under «Hva gjorde du?» og gjetter formatet.
- Egne metcons står først i øktbanken med typen **Egen**. Filteret **Egne** viser bare dem. De kan velges, merkes som favoritt og vise tidligere resultater, som de andre øktene.
- **Endre** og **Slett** står på økta. Slett må trykkes to ganger. Loggen har sin egen kopi, så tidligere resultater står der fortsatt.
- Velger du en egen metcon til en time i Sammen, sendes den som tekst, fordi vennene dine ikke har den i øktbanken.
- De lagres i `S.mine` og følger med i skybackup og eksport.

## Metcon-budsjett

Når du slår på «Logg en metcon jeg tok», velger en økt fra øktbanken eller logger en fri økt, kan du legge inn type, minutter og RPE. Fra øktbanken foreslår appen type og minutter ut fra økta. Appen viser minutter og belastning (minutter × RPE) for de siste sju dagene. I Strength & Power vises også budsjettet for fasen, og appen varsler når en metcon ligger for nær knebøy, clean eller benk. I Burgener 12 uker er budsjettet per uke (40, 30, 20 og 10 minutter), og appen varsler når en beintung eller olympisk metcon ligger dagen før snatch eller clean & jerk.

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
- Med konto kan du slå på skybackup under **Innstillinger → Konto og kopi**. Da hentes alt tilbake når du logger inn på nytt.
- Uten konto: Bruk **Lag eksport** under **Innstillinger → Kopi uten konto** av og til, og lagre teksten i Notater. Med **Importer** henter du alt tilbake.

## Tester

Kjør regresjonstestene for Sammen med `node --test tests/sammen.test.cjs` (Node.js, ingen ekstra pakker). De dekker telling av venner, datogrenser og sommertid, filtrering, tekstescaping, privat øktinformasjon og navigasjon. Påmelding, tidsforslag, ny time, øktbanken, chat og mobilvisning er også kontrollert i nettleser med lokale testdata.

## Når du endrer koden

1. Endre `index.html` og øk `APP_VERSION` øverst i skriptet med 1.
2. Last opp `index.html`. Du trenger ikke endre `sw.js`.
3. Appen henter nyeste versjon hver gang den åpnes med nett, og sjekker også når den vekkes fra bakgrunnen. Ingen trenger å skrive versjon i adressen. Versjonsnummeret står nederst under Innstillinger.

`sw.js` endres bare hvis selve offline-logikken eller listen over filer skal endres. Øk da `SHELL` i `sw.js`.

## Slik legger andre appen til på hjemskjermen

- **iPhone:** Åpne https://br0hansen.github.io/stanga/ i Safari, trykk Del-knappen og velg **Legg til på Hjem-skjerm**.
- **Android:** Åpne adressen i Chrome, trykk menyen med tre prikker og velg **Installer app** eller **Legg til på startskjermen**.

## Knebøy, benk og RP

**Program under Program → Bibliotek.** Tre dager i uka i 13 uker, med samme mesosykluser, deload og vurderinger som RP Hypertrofi 3 dager.

- **Dag 1 · Knebøy og benk:** 3 tunge sett i hver, 5 reps i Basis og Metabolitt og 3 reps i Resensitivisering. Vekta regnes fra 10RM med Epley, så den passer med repsene og reps i reserve: 5 reps med 3 i reserve er 79 % av 1RM, og vekta går opp når reserven går ned (3, 3, 2, 1). Pausen er 3 minutter, og begge løftene får full oppvarming. Deloaduka har 2 sett med halve reps fra uke 1.
- **Dag 2 · Press og Dag 3 · Trekk** er Dag 1 og Dag 3 fra RP 3 dager. Benk er byttet til manualbenk og knebøy til beinpress, så de tunge løftene får hvile mellom dag 1-ene. Plassene kan byttes tilbake under **Program → Oppsett → Øvelser og bytter**.
- **Teknisk:** `RP_DAYS.rpkb` bygges fra `RP_DAYS.rp3`. Tunge plasser har flagget `T`, og repsene per mesosyklus står i `RP_STR`.

Hver person får sine egne data på sin egen telefon. Sletter man ikonet, forsvinner dataene, så slå på skybackup eller bruk **Lag eksport** under **Innstillinger → Kopi uten konto** av og til.

## Hvordan koden henger sammen

Koden har tre lag, samme idé som vi snakket om:

1. **Maler** (`PROGRAMS`) – programmene slik de er skrevet. Endres aldri.
2. **Instans** (`S.active`) – din kopi: vekter, trinn og hvor langt du har kommet.
3. **Logg** (`S.history`) – det du faktisk løftet.

To funksjoner gjør jobben:

- `buildSession(mal, instans)` lager dagens økt.
- `progress(mal, instans, økt)` oppdaterer instansen etter økta. Hvert program har sin egen regel (`linear`, `gzclp`, `531`). Egne programmer (`user`) har en regel per øvelse, fra `RULES`.

Vil du legge til et nytt program som bruker en eksisterende regel, holder det å legge til et objekt i `PROGRAMS`.

## Kontroll av endringer

Kjør `node --test tests/*.test.cjs`. Testene dekker Sammen, settlogging, automatisk overgang mellom øvelser og EMOM-runder, pause, angring, AMRAP/RPE, programnavigasjon og lagring/progresjon ved fullført økt. Versjon 95, 96 og 99 ble i tillegg kontrollert i nettleser ved 320 × 740 og 390 × 844 med lokale eksempeldata. Popupen for øvelsesvalg er kontrollert med bytte, retur til originalen, bekreftelse/avbryt, Escape og tilbakeført fokus.
