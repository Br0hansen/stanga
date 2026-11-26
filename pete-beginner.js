/* Pete Marston: https://thepeteplan.wordpress.com/beginner-training/
   Week rows: three core sessions, then two optional sessions. Negative lengths are minutes.
   Ski uses the rowing schedule; bike doubles meters, never time/rest. These are Stanga adaptations.
   Week 14 optional day 5 follows the summary table (7×500); the prose says 8×500. */
const PB_WEEKS = [
 [5000,[6,500,120],5000,-20,[2,-10,120]],
 [5500,[4,750,120],5500,-20,[3,-8,120]],
 [6000,[2,2000,240],6000,5000,[6,500,120]],
 [6500,[3,1000,180],6500,6000,[2,2500,120]],
 [7000,[4,800,120],7000,-20,[2,-10,120]],
 [7500,[3,2000,240],7500,5000,[6,500,120]],
 [8000,[7,500,120],8000,6000,[3,1500,180]],
 [8500,[4,1500,180],8000,-25,[3,1000,180]],
 [9000,[4,800,120],8000,8000,[2,-10,120]],
 [9500,[3,2000,240],8000,8000,[7,500,120]],
 [10000,[8,500,120],8000,-25,[4,1500,180]],
 [10000,[4,1500,180],[3,-10,120],8000,[4,800,120]],
 [10000,[4,1000,180],[2,-15,120],8000,[3,2000,240]],
 [10000,[3,2000,240],[4,-8,120],-30,[7,500,120]],
 [10000,[5,750,120],[3,-10,120],8000,[4,1500,180]],
 [10500,[5,1500,180],-30,10000,[4,1000,180]],
 [10500,[8,500,120],[2,-15,120],-30,[4,-8,120]],
 [11000,[4,2000,240],-30,10000,[4,1000,180]],
 [10000,[5,800,120],[3,-10,120],-30,[4,2000,240]],
 [12000,[5,1500,180],-30,10000,[8,500,120]],
 [10000,[4,1000,180],[4,-8,120],12000,[5,1500,180]],
 [12000,[4,2000,240],-30,[3,-10,120],[5,800,120]],
 [10000,[8,500,120],[2,-15,120],10000,[4,2000,240]],
 [12000,[5,1500,180],-30,[2,-15,120],[4,1000,180]]
];
const PB_VERSION = 'beginner24';
const PB_EFFORT = {controlled:'Kontrollert',hard:'Hard',max:'Maksimal'};
const PB_KIND = {speed:'fartsintervaller',endur:'lange intervaller',steady:'rolig og sammenhengende arbeid'};
// Stanga guardrails, not physiological predictions or rules from Marston.
const PB_FADE = .03, PB_EASE_SECONDS = 2;
function pbRepResult(ss,pick){
  const paces=(pick.paces||[]).map(parseSplit);
  if(paces.length!==ss.n || paces.some(s=>!s))return null;
  const normalized=paces.map(s=>s/(ss.bike?2:1));
  // Equal-distance reps: arithmetic mean. Equal-time reps: total time / total distance.
  const sec=ss.time ? ss.n/normalized.reduce((sum,s)=>sum+1/s,0) : normalized.reduce((a,b)=>a+b,0)/ss.n;
  const half=Math.floor(ss.n/2), avg=a=>a.reduce((a,b)=>a+b,0)/a.length;
  const fade=half ? avg(normalized.slice(-half))/avg(normalized.slice(0,half))-1 : 0;
  return {sec,paces:normalized,fade};
}
function pbGuardTarget(target,ref,ss,mach,entries){
  const latest=entries.filter(r=>pbSession(r.pos,mach).kind===ss.kind).sort((a,b)=>b.pos-a.pos)[0];
  const checks=[ref];
  if(latest && latest.pos>ref.pos)checks.push(latest);
  let sec=target.sec;const reasons=[];
  for(const r of checks){
    const fade=r.fade>=PB_FADE, max=r.effort==='max';
    if(r.effort!=='hard' && !max && !fade)continue;
    const floor=Math.max(r.sec+(max||fade?PB_EASE_SECONDS/(ss.bike?2:1):0),r.targetSec||0);
    if(floor>sec){sec=floor;reasons.push(fade?'fartsfall mellom dragene':max?'maksimal innsats':'hard innsats');}
  }
  return {...target,sec,programSec:target.sec,adjusted:sec>target.sec,
    src:target.src+(reasons.length?' · Stanga justerer roligere etter '+[...new Set(reasons)].join(' og '):'')};
}
function pbFeedback(ctx,pick,ss){
  const reps=pick.resultMode==='reps',result=reps?pbRepResult(ss,pick):null;
  return `<fieldset><legend class="small">Hvordan var økta? <span class="muted">Valgfritt</span></legend><div class="pp-mach" role="group" aria-label="Innsats">${Object.entries(PB_EFFORT).map(([key,label])=>`<button data-a="pp:effort:${ctx}:${key}" aria-pressed="${pick.effort===key}">${label}</button>`).join('')}</div><p class="small muted">Kontrollert: overskudd igjen. Hard: lite å gå på. Maksimal: helt på grensen. Hard innsats bremser neste fartsøkning; maksimal innsats eller tydelig fartsfall gir et roligere forslag.</p></fieldset>
    ${ss.n>1?`<div class="seg"><button data-a="pp:resultmode:${ctx}:average" aria-pressed="${!reps}">Ett snitt</button><button data-a="pp:resultmode:${ctx}:reps" aria-pressed="${reps}">Fart per drag</button></div>${reps?`<p class="small muted">Snittfart per ${ss.bike?1000:500} m for hvert drag, uten pause.</p>${Array.from({length:ss.n},(_,i)=>`<div class="field"><label for="pbRep-${ctx}-${i}">Drag ${i+1}</label><input class="txt" id="pbRep-${ctx}-${i}" data-pbrep="${ctx}:${i}" inputmode="decimal" placeholder="1:47" value="${esc((pick.paces||[])[i]||'')}"></div>`).join('')}<p id="pbRepSummary-${ctx}" class="small" aria-live="polite">${pbRepSummary(result,ss)}</p>`:''}`:''}`;
}
function pbRepSummary(result,ss){
  return result ? 'Beregnet snitt: '+paceTxt(result.sec,ss.bike)+(result.fade>=PB_FADE?' · Tydelig fartsfall mot slutten. Neste forslag justeres roligere.':'') : 'Fyll inn gyldig fart på alle dragene for å beregne snittet.';
}
function pbHistory(result){
  if(result.ver!==PB_VERSION)return '';
  return (PB_EFFORT[result.effort]?' · '+PB_EFFORT[result.effort]:'')+(result.paces?.length?'<br><span class="small">Drag: '+result.paces.map(s=>splitTxt(s*(result.bike?2:1))).join(' · ')+' /'+(result.bike?1000:500)+' m</span>':'')+(result.fade>=PB_FADE?' · Fartsfall mot slutten':'');
}
// A new, separate state preserves the old rotation and its history, including in-flight drafts.
function pbState(mach){
  S.pete = S.pete || {idx:0,targets:{},pb:{}};
  const all = S.pete.beginner = S.pete.beginner || {};
  return all[mach] || (all[mach] = {idx:0,results:{}});
}
function pbStartPace(mach,kind){
  const exact=((S.settings.pete.startPaceByKind||{})[mach]||{})[kind];
  if(exact>0)return exact;
  // An older single start pace is only safe as a starting point for steady work.
  const legacy=(S.settings.pete.startPace||{})[mach];
  return kind==='steady'&&legacy>0?legacy:null;
}
function pbSession(pos, mach){
  if (!Number.isInteger(pos) || pos < 0 || pos >= 120) return null;
  const w = Math.floor(pos/5), day = pos%5, raw = PB_WEEKS[w][day];
  const [n,len,rest] = Array.isArray(raw) ? raw : [1,raw,0], bike = mach === 'bike';
  const time = len < 0, distance = time ? 0 : len * (bike ? 2 : 1);
  const d = Array(n).fill(distance), minutes = time ? n * -len : null;
  const part = time ? -len + ' min' : distTxt(distance);
  return {pos,w,day,n,len,time,minutes,d,meters:distance*n,bike,ver:PB_VERSION,
    kind:day===1 || day===4 && !time ? (len<=1000?'speed':'endur') : 'steady',
    rests:Array(n-1).fill(rest),restTxt:rest ? mmss(rest)+' pause' : '',
    name:(n>1?n+' × ':'')+part, optional:day>2};
}
const pbCorePos = idx => Math.floor(idx/3)*5 + idx%3;
// Explicit references use [week, day, delta in displayed pace seconds].
// Where Marston leaves a choice, preserve the previous pace and describe the choice in the note.
const PB_INTERVAL_REF = [null,[1,2],[3,1,-2],[1,2],[4,2],[3,2],[1,2,-1],[6,2],[5,2],[6,2,-1],[7,2],[8,2],[9,2],[12,2],[13,2],[13,5],[11,2],[14,2],[15,2],[16,2],null,null,null,[20,2]];
function pbTarget(ss,mach){
  const results=pbState(mach).results, entries=Object.entries(results).map(([p,r])=>({...r,pos:+p})).filter(r=>r.sec>0 && r.pos<ss.pos);
  const get=(w,d)=>{const pos=(w-1)*5+d-1;return pos<ss.pos?results[pos]:null;};
  const last=filter=>entries.filter(filter).sort((a,b)=>b.pos-a.pos)[0];
  const same=last(r=>{const s=pbSession(r.pos,mach);return s.n===ss.n && s.len===ss.len;});
  const steady=last(r=>r.pos%5===0);
  let ref,delta=0,fallback=false;
  if(ss.day===0) {
    ref=steady;
    if(ss.w===18) ref=get(15,1)||ref;
    if(ss.w===19) {ref=get(19,1)||ref;delta=5;}
    if(ss.w===20 || ss.w===22) {
      ref=entries.filter(r=>pbSession(r.pos,mach).len===10000 && r.pos%5===0).sort((a,b)=>a.sec-b.sec)[0]||ref;
      delta=ss.w===20?2:0;
    }
    if(ss.w===21){ref=get(21,1)||ref;delta=2;}
  } else if(ss.day===1) {
    const rule=PB_INTERVAL_REF[ss.w];
    if(rule){ref=get(rule[0],rule[1]);delta=rule[2]||0;}
    if(ss.w===6 && get(6,5)){ref=get(6,5);delta=0;}
    if(ss.w===7 && get(7,5))ref=get(7,5);
    if(ss.w===11 && get(11,5))ref=get(11,5);
    if(ss.w===15)ref=get(15,5)||get(14,2)||ref;
    if(ss.w===19)ref=[get(16,2),get(18,2),get(19,5)].filter(r=>r&&r.sec>0).sort((a,b)=>a.sec-b.sec)[0];
    if(!ref){ref=same;delta=0;}
  } else if(ss.day===2) {
    if(ss.w<12)ref=get(ss.w+1,1);
    else if(ss.w===15)ref=get(15,1);
    else if(ss.w===17)ref=get(18,1);
    else if(ss.w===19)ref=entries.filter(r=>pbSession(r.pos,mach).len===10000 && r.pos%5===0).sort((a,b)=>a.sec-b.sec)[0];
    else if(ss.w===16)ref=get(15,3);
    else ref=get(ss.w,3)||steady;
  } else {
    // Optional distance/time work stays easy; interval references are separate from core advancement.
    const rules={ '0.4':[1,4], '1.4':[1,5], '2.4':[1,2,-1], '3.4':[4,4,-1],
      '6.4':[6,2,-1], '7.4':[7,2], '8.4':[9,3,-1], '9.4':[7,2],
      '10.4':[8,2], '11.4':[9,2], '12.4':[12,2], '13.4':[7,2],
      '14.4':[14,2], '15.4':[13,2], '16.4':[14,3], '17.4':[16,5],
      '18.4':[18,2], '19.4':[17,2], '20.4':[20,2], '21.4':[19,2], '22.4':[22,2], '23.4':[21,2] };
    const rule=rules[ss.w+'.'+ss.day];
    if(rule){ref=get(rule[0],rule[1]);delta=rule[2]||0;}
    ref=ref||same||steady;
    if(ss.w===0 && ss.day===3)delta=2; // conservative app suggestion, not a prescribed numeric offset
  }
  if(!ref && ss.kind!=='steady') {ref=last(r=>pbSession(r.pos,mach).kind===ss.kind);delta=0;fallback=!!ref;}
  if(ref && ref.sec>0) {
    const pos=ref.pos, source=pos!=null ? pbSession(pos,mach) : null;
    return pbGuardTarget({sec:Math.max(1,ref.sec+delta/(ss.bike?2:1)),refPos:pos,src:(fallback?'Stanga-startforslag fra ':'')+(source?'uke '+(source.w+1)+', økt '+(source.day+1):'tidligere økt')+' · '+PETE_MACH[mach]+(delta?' · '+Math.abs(delta)+' s '+(delta<0?'raskere':'roligere'):' · samme snittfart')},ref,ss,mach,entries);
  }
  const start=pbStartPace(mach,ss.kind);
  if(start>0)return {sec:start,src:'din valgte startfart for '+PB_KIND[ss.kind]+' · '+PETE_MACH[mach]};
  // Explicitly labelled fallback, not an automatic estimate of a new 2K personal best.
  const tested=(S.settings.pete.ref||{})[mach];
  return tested>0 ? {sec:tested/(ss.bike?8:4)+15/(ss.bike?2:1),src:'forsiktig Stanga-startanslag fra testtid + 15 s; juster etter følelse'} : {sec:null,src:'velg en rolig startfart nedenfor'};
}
function pbNote(ss){
  if(ss.day===0 && ss.w===19)return 'Start rolig. Øk gradvis mot snittfarten fra 10 km når omtrent 5 km gjenstår.';
  if(ss.day===0 && ss.w===20)return 'Start 2 sekunder roligere enn beste 10 km-fart. Øk gradvis mot den ved halvveis.';
  if(ss.day===0 && [11,12,13,14,18,22].includes(ss.w))return 'Begynn på målfarten. Øk forsiktig mot slutten hvis du har overskudd; snittet blir grunnlag videre.';
  if(ss.optional && ss.kind==='steady')return 'Valgfri økt. Prioriter rolig teknikkarbeid og tilpass farten etter overskuddet ditt.';
  if(ss.kind==='steady')return 'Hold en jevn, kontrollert fart. Når distansen øker, er samme snittfart også progresjon.';
  return ss.w<4 ? 'Hold målfarten jevnt på dragene. Ikke start for hardt; fullfør med god teknikk.' : 'Bruk målfarten på de første dragene. Øk på siste drag hvis du har overskudd. Registrer snittet fra hele arbeidsdelen, uten pausene.';
}
function pbBox(ctx,picked){
  const mach=picked?picked.mach:S.settings.pete.mach, state=pbState(mach);
  const machines=`<div class="pp-mach" role="group" aria-label="Apparat">${Object.entries(PETE_MACH).map(([k,v])=>`<button data-a="pp:mach:${k}:${ctx}" aria-pressed="${k===mach}">${v}</button>`).join('')}</div>`;
  if(!picked && state.idx>=72)return `<section class="box pp-card">${machines}<h2>24 uker fullført · ${PETE_MACH[mach]}</h2><p>Alle 72 hovedøktene er gjennomført.</p>${[118,119].map(p=>`<button class="btn ghost sm" data-a="pp:pick:${ctx}:${p}" ${state.results[p]?'disabled':''}>Valgfri: ${pbSession(p,mach).name}${state.results[p]?' · gjort':''}</button>`).join('')}<button class="link" data-a="go:pete">Se oppsettet</button></section>`;
  const pos=picked?picked.idx:pbCorePos(state.idx),ss=pbSession(pos,mach),t=pbTarget(ss,mach),min=peteWorkMin(ss,t);
  const unit=picked&&picked.unit==='drag'&&dragMeters(ss)?'drag':'split';
  const dt=dragTime(ss,t.sec),pace=t.sec?splitTxt(t.sec*(ss.bike?2:1)):'';
  let h=`<section class="box pp-card"><div class="pp-top"><span class="lbl">Pete Plan · nybegynner</span><span class="small muted">Uke ${ss.w+1} av 24 · ${ss.optional?'valgfri økt '+(ss.day-2):'økt '+(ss.day+1)+' av 3'}</span></div>${machines}
    ${mach!=='row'?'<p class="small muted">Stanga-tilpasning til '+PETE_MACH[mach].toLowerCase()+'. Egen progresjon for dette apparatet.</p>':''}
    <h2>${ss.name}</h2><p class="small muted">${ss.restTxt}</p>
    <div class="pp-facts"><div><span>Målfart</span><b>${pace||'–'}</b><span>per ${ss.bike?1000:500} m</span></div>
    ${dt?`<div><span>${ss.n===1?'Måltid':'Per drag'}</span><b>${splitTxt(dt)}</b></div>`:''}
    <div><span>Arbeid</span><b>${min!=null?min+' min':'–'}</b><span>uten pauser</span></div></div>
    <p class="small muted">Mål fra ${t.src}.</p>${t.adjusted?'<p class="small">Roligere forslag: hard innsats stopper fartsøkning. Maksimal innsats eller over 3 % fartsfall gir minst 2 sekunder roligere fart enn resultatet. Dette er Stangas forsiktige tilpasning, ikke en regel i originalprogrammet.</p>':''}<p class="small">${pbNote(ss)}</p>
    <details><summary class="small">${t.sec?'Juster startfart':'Velg startfart'}</summary><p class="small muted">Bruk en fart du kan holde kontrollert. ${PB_KIND[ss.kind][0].toUpperCase()+PB_KIND[ss.kind].slice(1)} har sin egen startfart. Resultater fra programmet tar over når de finnes.</p>
    <label for="pbStart-${ctx}" class="small">Startfart for ${PB_KIND[ss.kind]} per ${ss.bike?1000:500} m</label><input id="pbStart-${ctx}" class="txt" placeholder="2:20" value="${pbStartPace(mach,ss.kind)?splitTxt(pbStartPace(mach,ss.kind)*(ss.bike?2:1)):''}"><button class="btn ghost sm" data-a="pp:startpace:${ctx}:${mach}:${ss.kind}">Lagre startfart</button></details>`;
  if(picked)h+=pbFeedback(ctx,picked,ss)+(picked.resultMode==='reps'?'':`${dragMeters(ss)?`<div class="seg"><button data-a="pp:unit:${ctx}:split" aria-pressed="${unit==='split'}">Snittfart</button><button data-a="pp:unit:${ctx}:drag" aria-pressed="${unit==='drag'}">${dragLabel(ss)}</button></div>`:''}
    <div class="field"><label for="ppSplit-${ctx}">${unit==='drag'?dragLabel(ss)+' i dag':'Snittfart i dag'}<small class="muted">${unit==='drag'?'minutter:sekunder':'per '+(ss.bike?1000:500)+' m'} · uten pauser</small></label><span class="inp"><input id="ppSplit-${ctx}" data-ppsplit="${ctx}" type="text" inputmode="decimal" value="${esc(picked.split||'')}" placeholder="${unit==='drag'&&dt?splitTxt(dt):pace||'2:20'}"></span></div>
    `)+(ctx==='free'?'<button class="link" data-a="pp:rm:free">Fjern</button>':'');
  else {
    h+=`<button class="btn ghost" data-a="pp:pick:${ctx}">Velg denne økta</button>`;
    const weeks=[ss.w];if(state.idx>0&&state.idx%3===0)weeks.unshift(ss.w-1);
    h+=`<details><summary class="small">Valgfrie ekstraøkter</summary><p class="small muted">Flytter ikke hovedprogrammet. Gjennomfør hovedøktene på separate dager og velg ekstraøkter etter overskudd.</p>${weeks.flatMap(w=>[3,4].map(d=>{const p=w*5+d,s=pbSession(p,mach);return `<button class="btn ghost sm" data-a="pp:pick:${ctx}:${p}" ${state.results[p]?'disabled':''}>Uke ${w+1}: ${s.name}${state.results[p]?' · gjort':''}</button>`;})).join('')}</details>`;
  }
  return h+'</section>';
}
function pbPick(ctx,pos){
  const mach=S.settings.pete.mach,state=pbState(mach);
  pos=pos==null?pbCorePos(state.idx):Number(pos);
  const ss=pbSession(pos,mach);if(!ss)return;
  const t=pbTarget(ss,mach),pick={idx:pos,mach,ver:PB_VERSION,split:'',unit:'split'};
  const mc={type:'M',min:peteWorkMin(ss,t)||''};
  if(ctx==='session'&&S.draft){S.draft.pete=pick;S.draft.metcon=true;S.draft.mc=mc;save();}
  else{ui.free=true;ui.freePete=pick;ui.freeMc=true;ui.freeMcData=mc;}
}
function pbDone(pick){
  const ss=pbSession(pick.idx,pick.mach),sec=peteResultSec(ss,pick),state=pbState(pick.mach);
  if(!sec)return null;
  const before=clone(state);
  const target=pbTarget(ss,pick.mach),reps=pick.resultMode==='reps'?pbRepResult(ss,pick):null;
  const feedback={effort:PB_EFFORT[pick.effort]?pick.effort:null,paces:reps?.paces||[],fade:reps?.fade||0,targetSec:target.sec};
  state.results[ss.pos]={pos:ss.pos,sec,t:Date.now(),...feedback};
  if(!ss.optional && pbCorePos(state.idx)===ss.pos)state.idx++;
  return {name:ss.name,kind:ss.kind,mach:pick.mach,split:sec,bike:ss.bike,pos:ss.pos,ver:PB_VERSION,...feedback,before,after:clone(state)};
}
function pbValid(pick){
  if(!pick||pick.ver!==PB_VERSION)return true;
  if(peteResultSec(pbSession(pick.idx,pick.mach),pick)>0)return true;
  toast(pick.resultMode==='reps'?'Skriv gyldig fart på alle dragene før du lagrer.':'Skriv snittfarten du gjennomførte, eller fjern Pete-økta før du lagrer.');return false;
}
