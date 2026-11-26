/* Run the real application logic with synthetic, independent result inputs.
   This audits software behavior, not the athlete's physiological capacity. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {fixture}=require('../tests/helpers/app-fixture.cjs');
const profiles={
  controlled:{label:'Jevn, kontrollert fremgang',gain:.1},
  plateau:{label:'Ingen formfremgang',gain:0},
  difficult:{label:'Tunge uker og maksimal innsats',gain:.1},
  fade:{label:'Fartsfall skjult av snittet',gain:.1}
};
const machines={row:{name:'Ro',speed:107,steady:125},ski:{name:'Ski',speed:127,steady:145},bike:{name:'Sykkel',speed:117,steady:135}};
const round=n=>Math.round(n*10)/10;
const pace=n=>Math.floor(n/60)+':'+(n%60).toFixed(1).padStart(4,'0');
function simulate(profile,mach,optional){
  const f=fixture(),cfg=profiles[profile],m=machines[mach],scale=mach==='bike'?2:1,rows=[];
  f.run(`S=fresh();S.settings.pete.startPaceByKind={${mach}:{steady:${m.steady/scale},speed:${m.speed/scale},endur:${(m.steady-2)/scale}}}`);
  for(let pos=0;pos<120;pos++){
    const ss=f.state(`pbSession(${pos},'${mach}')`);if(ss.optional&&!optional)continue;
    const t=f.state(`pbTarget(pbSession(${pos},'${mach}'),'${mach}')`);
    // Capacities are deliberately supplied independently of the app's target.
    // Endurance/steady start speeds are assumptions, not derived from the 500m result.
    const capacity=round((ss.kind==='speed'?m.speed:ss.kind==='endur'?m.steady-2:m.steady)-cfg.gain*ss.w);
    let actual=capacity,effort='controlled';
    if(t.sec*scale<capacity-.5)effort='hard';
    if(profile==='difficult'&&[1,7,13,19].includes(ss.w)) {actual+=2;effort='max';}
    if(profile==='difficult'&&[4,10,16,22].includes(ss.w))effort='hard';
    let paces=Array(ss.n).fill(pace(actual));
    if(profile==='fade'&&ss.n>1&&[1,7,13,19].includes(ss.w)){
      const half=Math.floor(ss.n/2);
      paces=paces.map((_,i)=>pace(actual+(i<half?-4:i>=ss.n-half?4:0)));
      effort='hard';
    }
    const pick={idx:pos,mach,ver:'beginner24',split:pace(actual),unit:'split',effort,
      ...(ss.n>1?{resultMode:'reps',paces}:{})};
    f.run(`globalThis.simPick=${JSON.stringify(pick)}`);
    assert.equal(f.state('pbValid(simPick)'),true);
    const result=f.state('pbDone(simPick)');
    const ref=t.refPos!=null?f.state(`pbSession(${t.refPos},'${mach}')`):null;
    const volumeUp=!!ref&&(ss.time&&ref.time?ss.minutes>ref.minutes:!ss.time&&!ref.time&&ss.meters>ref.meters);
    const longer=!!ref&&!ss.time&&!ref.time&&ss.d[0]>ref.d[0];
    const lessRest=!!ref&&ss.n>1&&ref.n>1&&ss.rests.reduce((a,b)=>a+b,0)<ref.rests.reduce((a,b)=>a+b,0);
    rows.push({week:ss.w+1,day:ss.day+1,name:ss.name,optional:ss.optional,kind:ss.kind,
      target:round(t.sec*scale),program:round((t.programSec??t.sec)*scale),actual:round(result.split*scale),effort,
      paces:ss.n>1?paces:[],fade:result.fade,adjusted:!!t.adjusted,source:t.src,
      meters:ss.meters,minutes:ss.minutes,rest:ss.rests.reduce((a,b)=>a+b,0),
      fasterThanAssumedCapacity:t.sec*scale<capacity-.5,volumeUp,longer,lessRest});
    assert.ok(Number.isFinite(t.sec)&&t.sec>0);
    if(t.refPos!=null)assert.ok(t.refPos<pos,'Never use future results');
    assert.ok(t.sec>=(t.programSec??t.sec),'Guard cannot accelerate a target');
    // Reload after every result: exercises the actual persisted schema too.
    f.run('save();S=load()');
    assert.equal(f.state(`pbState('${mach}').idx`),rows.filter(r=>!r.optional).length);
    for(const other of Object.keys(machines).filter(k=>k!==mach))assert.equal(f.state(`pbState('${other}').idx`),0);
  }
  assert.equal(f.state(`pbState('${mach}').idx`),72);
  assert.equal(rows.length,optional?120:72);
  return {profile,mach,optional,rows};
}
function allRuns(){return Object.keys(profiles).flatMap(p=>Object.keys(machines).flatMap(m=>[false,true].map(o=>simulate(p,m,o))));}
function report(runs){
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const effort={controlled:'Kontrollert',hard:'Hard',max:'Maksimal'};
  const tables=runs.map(run=>`<details ${run.profile==='controlled'&&run.mach==='row'&&!run.optional?'open':''}><summary>${profiles[run.profile].label} · ${machines[run.mach].name} · ${run.optional?'med alle ekstraøkter':'kun hovedøkter'}</summary><p>${run.rows.filter(r=>r.adjusted).length} roligere mål. ${run.rows.filter(r=>r.fasterThanAssumedCapacity).length} mål mer enn 0,5 s raskere enn antatt kapasitet. Disse er avvik som må vurderes, ikke bevis på at målet er umulig.</p><div class="scroll"><table><thead><tr><th>Uke/økt</th><th>Økt</th><th>Programmål</th><th>Stanga-mål</th><th>Input/resultat</th><th>Innsats</th><th>Belastning mot referanse</th></tr></thead><tbody>${run.rows.map(r=>`<tr class="${r.adjusted?'adjusted':''}"><td>${r.week}/${r.day}${r.optional?' *':''}</td><td>${r.name}</td><td>${pace(r.program)}</td><td>${pace(r.target)}</td><td>${pace(r.actual)}</td><td>${effort[r.effort]}${r.fade>=.03?' · fartsfall':''}</td><td>${[r.volumeUp?'Mer arbeid':'',r.longer?'Lengre drag':'',r.lessRest?'Mindre samlet pause':'',r.fasterThanAssumedCapacity?'Mål over antatt kapasitet':''].filter(Boolean).join(' · ')}<details><summary>Grunnlag og input</summary>${esc(r.source)}<br>${r.paces.length?'Drag: '+r.paces.join(' · '):'Sammenhengende økt'}<br>${r.minutes?r.minutes+' min':r.meters+' m'}, ${r.rest/60} min samlet pause</details></td></tr>`).join('')}</tbody></table></div></details>`).join('');
  return `<!doctype html><html lang="no"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pete Plan – simulering av 24 uker</title><style>body{font:16px/1.6 system-ui;max-width:1250px;margin:40px auto;padding:0 20px;color:#172c32;background:#f5f7f4}h1{line-height:1.2}summary{cursor:pointer;font-weight:650}body>details{background:white;border:1px solid #cdd6d2;border-radius:10px;padding:16px;margin:14px 0}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;padding:10px;border-bottom:1px solid #ddd;vertical-align:top}.adjusted{background:#fff5db}th{background:#e9efeb}p{max-width:900px}td details{font-size:12px;margin-top:5px}</style><h1>Pete Plan: alle 24 uker med resultatinput</h1><p><b>${runs.length} forløp · ${runs.reduce((s,r)=>s+r.rows.length,0)} økter.</b> Kjørt mot appens faktiske målfarts-, registrerings- og lagringsfunksjoner. Alle 72 hovedøkter, og separat alle 48 ekstraøkter, er testet per apparat og scenario.</p><p><b>Dette er en programvaretest, ikke en fysiologisk prognose.</b> Roing starter med kontrollert 6 × 500 m på 1:47/500 m. Kontrollert langkjøring settes til 2:05/500 m og lange intervaller til 2:03 som egne antakelser. De er ikke utledet fra 1:47. Ski bruker 2:07/2:25/2:23 per 500 m, sykkel 1:57/2:15/2:13 per 1000 m: kun uavhengige testverdier.</p><p>Kontrollert scenario antar 0,1 s raskere fart per uke. Platå antar ingen forbedring. Tunge uker legger til 2 s og maksimal innsats i uke 2, 8, 14 og 20. Fartsfall bruker første halvdel 4 s raskere og siste halvdel 4 s roligere de samme ukene. Målfart over antatt kapasitet registreres som hard. Resultatene følger disse antakelsene, ikke automatisk målet fra appen.</p><p>Originale økter følger <a href="https://thepeteplan.wordpress.com/beginner-training/">Pete Marstons nybegynnerprogram</a>. Stangas tillegg: hard innsats stanser neste fartsøkning fra dette grunnlaget; maksimal innsats eller minst 3 % økning i splittid fra første til siste halvdel gir minst 2 s roligere mål enn oppnådd snitt. Forrige mål beholdes dersom det allerede var roligere. Dette er forsiktige produktregler, ikke forskningsvaliderte terskler. Vurderingen kan fjernes ved å trykke valgt innsats igjen.</p><p><b>Hva testen ikke løser:</b> Treningsvolumet øker fortsatt etter originalplanen. Tidligere kontrollert 500 m-fart garanterer ikke at lengre drag går. Lavere fart reduserer ikke antall meter. Ved tunge uker må også mengde og ekstraøkter vurderes. Tidsstyrte økter bruker korrekt distansevektet gjennomsnitt. Gule rader viser roligere forslag; * betyr valgfri økt.</p>${tables}</html>`;
}
if(require.main===module){
  const runs=allRuns(),out=path.resolve(__dirname,'../output/pete-simulation');fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({assumptions:{profiles,machines},runs},null,2));
  fs.writeFileSync(path.join(out,'report.html'),report(runs));
  console.log(JSON.stringify({runs:runs.length,sessions:runs.reduce((s,r)=>s+r.rows.length,0),report:path.join(out,'report.html'),summaries:runs.filter(r=>r.mach==='row'&&!r.optional).map(r=>({profile:r.profile,adjusted:r.rows.filter(x=>x.adjusted).length,aboveAssumedCapacity:r.rows.filter(x=>x.fasterThanAssumedCapacity).length,intervals:r.rows.filter(x=>x.day===2).map(x=>({week:x.week,name:x.name,target:pace(x.target),input:pace(x.actual),effort:x.effort,adjusted:x.adjusted}))}))},null,2));
}
module.exports={simulate,allRuns};
