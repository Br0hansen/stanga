const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
// Git på Windows sjekker ut med CRLF. Uten dette finner ikke split under oppstarten, og hele appen kjører.
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const app = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1].split('\nrender();\nckRender();')[0];

// Run the real app and click handler; only browser services are replaced.
function fixture(program = 'sl5x5') {
  const listeners = {}, storage = new Map(), nodes = new Map(), followed = [];
  let now = Date.now();
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  function node(selector) {
    return {dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},
      hidden:false,textContent:'',innerHTML:'',tagName:'SECTION',
      querySelector:()=>null,hasAttribute:()=>false,focus(){},
      scrollIntoView(){followed.push(selector);}};
  }
  for (const id of ['.stage','#rest','#restB','#restL','#restFlash','#toast','#exercise-0','#exercise-1','#exercise-2','#today-after']) nodes.set(id,node(id));
  const c = vm.createContext({console,URL,URLSearchParams,Map,Set,Date:Clock,JSON,Math,Number,String,Promise,
    setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},addEventListener(){},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
    document:{querySelector:s=>nodes.get(s)||null,querySelectorAll:()=>[],
      addEventListener:(name,fn)=>(listeners[name] ||= []).push(fn),documentElement:{dataset:{},style:{setProperty(){}}}},
    navigator:{},location:{protocol:'http:',origin:'http://test.invalid',hash:'',search:''},
    matchMedia:()=>({matches:false}),CSS:{escape:s=>s},fetch:()=>{throw Error('Unexpected network call');}});
  c.window=c;
  vm.runInContext(app,c);
  const run = code => vm.runInContext(code,c);
  run(`render=()=>{};wake=()=>{};say=()=>{};toTop=()=>{};
    S=fresh(); S.settings.pete.on=false; S.active=newInstance(prog(${JSON.stringify(program)}));
    S.draft=buildSession(prog(S.active.programId),S.active);`);
  const click = action => {
    const b={dataset:{a:action},type:'button',disabled:false};
    for(const fn of listeners.click) fn({target:{closest:()=>b},preventDefault(){}});
  };
  const state = expression => JSON.parse(run(`JSON.stringify(${expression})`));
  const warm = () => run(`S.draft.ex.forEach((e,i)=>{const k=wuKind(S.draft,i);e.wuDone=k?warmups(e.slot,e.sets[0].w,e.sets[0].t,k).map(([w,r])=>w+'x'+r):[];});`);
  return {run,click,state,warm,followed,storage,nodes,advance:ms=>{now+=ms;}};
}

test('one tap logs a set, starts the real program pause and persists it',()=>{
  const f=fixture();f.warm();f.click('next:0');
  assert.equal(f.state('S.draft.ex[0].sets[0].d'),5);
  assert.equal(f.state('ui.rest.total'),180);
  assert.equal(JSON.parse(f.storage.get('stanga.v1')).draft.ex[0].sets[0].d,5);
  assert.deepEqual(f.followed,[]);
});
test('the same large action logs directly during an active pause',()=>{
  const f=fixture();f.warm();f.click('next:0');f.click('next:0');
  assert.deepEqual(f.state('S.draft.ex[0].sets.slice(0,2).map(x=>x.d)'),[5,5]);
  assert.deepEqual(f.followed,[]);
});
test('Strength & Power restarts the full backoff pause through both logging actions',()=>{
  for(const action of ['next:1','set:1:1']){
    const f=fixture('sp12');f.warm();
    f.run('S.draft.ex[0].sets.forEach(x=>x.d=x.t)');
    f.click('next:1');
    const duration=f.state('S.draft.ex[1].rest'), end=f.state('ui.rest.end');
    f.advance(45000);
    assert.equal(f.state('(ui.rest.end-Date.now())/1000'),duration-45);
    f.click(action);
    assert.equal(f.state('(ui.rest.end-Date.now())/1000'),duration);
    assert.equal(f.state('ui.rest.end'),end+45000);
    assert.equal(f.state('S.draft.ex[1].sets[1].d'),5);
  }
});
test('Strength & Power starts a fresh backoff pause after the previous pause expired',()=>{
  const f=fixture('sp12');f.warm();f.run('S.draft.ex[0].sets.forEach(x=>x.d=x.t)');
  f.click('next:1');f.advance(600000);f.click('next:1');
  assert.equal(f.state('(ui.rest.end-Date.now())/1000'),f.state('S.draft.ex[1].rest'));
});
test('rest duration rounds to the nearest ten seconds after applying the selected scale',()=>{
  const f=fixture();
  for(const [seconds,scale,expected] of [[150,.75,110],[210,.75,160],[90,1.25,110],[60,.75,50],[150,1,150],[210,1.25,260]]){
    f.run(`S.settings.restScale=${scale};startRest(${seconds})`);
    assert.equal(f.state('ui.rest.total'),expected,`${seconds} × ${scale}`);
    assert.equal(f.state('(ui.rest.end-Date.now())/1000'),expected);
  }
});
test('the inline pause updates independently of the displayed weight and reps',()=>{
  const f=fixture();
  for(const id of ['#todayRestControls','#todayRestAdd','#todayRestSkip','#todayRestLabel','#todayRestTime','#kgN','.current-reps'])f.nodes.set(id,{textContent:'',disabled:false});
  f.nodes.get('#kgN').textContent='100';f.nodes.get('.current-reps').textContent='5 reps';
  f.run('updateRest()');
  assert.equal(f.nodes.get('#todayRestTime').textContent,'—');
  assert.equal(f.nodes.get('#todayRestSkip').disabled,true);
  f.warm();f.click('next:0');assert.equal(f.nodes.get('#todayRestTime').textContent,'3:00');
  f.advance(45000);f.run('updateRest()');assert.equal(f.nodes.get('#todayRestTime').textContent,'2:15');
  f.click('next:0');assert.equal(f.nodes.get('#todayRestTime').textContent,'3:00');
  f.click('restadd:30');assert.equal(f.nodes.get('#todayRestTime').textContent,'3:30');
  f.click('skip');assert.equal(f.nodes.get('#todayRestTime').textContent,'—');
  assert.equal(f.nodes.get('#todayRestAdd').disabled,true);
  assert.equal(f.nodes.get('#kgN').textContent,'100');
  assert.equal(f.nodes.get('.current-reps').textContent,'5 reps');
});
test('the inline pause shows overtime after expiry and restarts on the next set',()=>{
  const f=fixture();
  for(const id of ['#todayRestControls','#todayRestAdd','#todayRestSkip','#todayRestLabel','#todayRestTime'])f.nodes.set(id,{textContent:'',disabled:false});
  f.warm();f.click('next:0');f.advance(185000);f.run('updateRest()');
  assert.equal(f.nodes.get('#todayRestLabel').textContent,'Klar');
  assert.equal(f.nodes.get('#todayRestTime').textContent,'+0:05');
  f.click('next:0');assert.equal(f.nodes.get('#todayRestLabel').textContent,'Pause');
  assert.equal(f.nodes.get('#todayRestTime').textContent,'3:00');
});
test('Strength & Power clean sets restart with a rounded shorter pause',()=>{
  const f=fixture('sp12');
  f.run("S.active.idx=2;S.draft=buildSession(prog('sp12'),S.active);S.settings.restScale=.75");f.warm();
  const current=f.state('todayCurrent(S.draft)');f.click('next:'+current);
  assert.equal(f.state('ui.rest.total'),110);f.advance(23000);
  f.click('next:'+f.state('todayCurrent(S.draft)'));
  assert.equal(f.state('(ui.rest.end-Date.now())/1000'),110);
});
test('last set follows the next exercise, preserving the pause from the finished lift',()=>{
  const f=fixture();f.warm();f.run('S.draft.ex[0].sets.slice(0,-1).forEach(x=>x.d=x.t)');
  f.click('next:0');
  assert.equal(f.state('todayCurrent(S.draft)'),1);
  assert.deepEqual(f.followed,['#exercise-1']);
  assert.equal(f.state('ui.rest.total'),180);
  const end=f.state('ui.rest.end');f.run('vToday()');assert.equal(f.state('ui.rest.end'),end);
});
test('one undo returns to the prior exercise and restores the exact prior pause',()=>{
  const f=fixture();f.warm();f.run('S.draft.ex[0].sets.slice(0,-1).forEach(x=>x.d=x.t);ui.rest={end:Date.now()+90000,total:90,done:false}');
  const before=f.state('ui.rest');f.click('next:0');f.click('undoset');
  assert.equal(f.state('S.draft.ex[0].sets.at(-1).d'),null);
  assert.equal(f.state('todayCurrent(S.draft)'),0);
  assert.deepEqual(f.state('ui.rest'),before);
  assert.deepEqual(f.followed,['#exercise-1','#exercise-0']);
  assert.equal(f.state('canUndoSet()'),false);
});
test('last set in the session follows the remaining content and does not start a pause',()=>{
  const f=fixture();f.warm();f.run('S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));S.draft.ex[2].sets.at(-1).d=null');
  f.click('next:2');
  assert.equal(f.state('ui.rest'),null);assert.deepEqual(f.followed,['#today-after']);
  assert.match(f.run('vToday()'),/Angre siste registrering/);
});
test('warmup logs separately, starts its own pause and can be undone',()=>{
  const f=fixture();f.run('S.draft.ex[0].sets.forEach(x=>x.w=100)');f.click('next:0');
  assert.equal(f.state('S.draft.ex[0].wuDone.length'),1);
  assert.equal(f.state('S.draft.ex[0].sets[0].d'),null);
  assert.equal(f.state('ui.rest.total'),60);
  f.click('undoset');assert.equal(f.state('(S.draft.ex[0].wuDone||[]).length'),0);
  assert.equal(f.state('ui.rest'),null);
});
test('correcting reps does not restart the timer, and correction can be undone',()=>{
  const f=fixture();f.warm();f.click('next:0');const rest=f.state('ui.rest');
  f.click('set:0:0');assert.equal(f.state('S.draft.ex[0].sets[0].d'),4);
  assert.deepEqual(f.state('ui.rest'),rest);
  f.click('undoset');assert.equal(f.state('S.draft.ex[0].sets[0].d'),5);
});
test('undo cannot overwrite later exercise edits or a different session',()=>{
  const f=fixture();f.warm();f.click('next:0');f.run('S.draft.ex[0].sets[0].w+=2.5');
  assert.equal(f.state('canUndoSet()'),false);f.click('undoset');
  assert.equal(f.state('S.draft.ex[0].sets[0].d'),5);
  f.click('next:0');f.run('S.draft.started+=1');assert.equal(f.state('canUndoSet()'),false);
});
test('undo cannot apply to a replacement draft with identical values',()=>{
  const f=fixture();f.warm();f.click('next:0');f.run('S.draft=clone(S.draft)');
  assert.equal(f.state('canUndoSet()'),false);
});
test('round-based programs follow the next lift each round rather than finishing one lift first',()=>{
  const f=fixture('cbe12');f.warm();f.click('next:0');
  assert.equal(f.state('todayCurrent(S.draft)'),1);assert.deepEqual(f.followed,['#exercise-1']);
  assert.equal(f.state('S.draft.ex[0].sets[1].d'),null);
});
test('AMRAP controls and RPE remain available after automatic advance',()=>{
  const f=fixture('gzclp');f.warm();f.run('S.draft.ex[0].sets.forEach(x=>x.d=x.t)');
  assert.match(f.run('vToday()'),/Én rep mer/);
  const g=fixture('sp12');g.warm();g.run('S.draft.ex[0].sets.forEach(x=>x.d=x.t)');
  assert.match(g.run('vToday()'),/data-a="rpe:0:/);
});
test('Plan, Oppsett and Bibliotek expose the existing full program flows',()=>{
  const f=fixture();let view=f.run('vPlanTab()');
  assert.match(view,/programsection:setup/);assert.match(view,/Gå til dagens økt/);
  f.click('programsection:setup');view=f.run('vPlanTab()');
  for(const action of ['trainingpart:weights','trainingpart:swaps','go:pete','trainingpart:maxes','open:sl5x5','confirm:quit']) assert.ok(view.includes(action),action);
  f.click('programsection:library');view=f.run('vPlanTab()');
  assert.match(view,/pe:new/);assert.match(view,/Programguide/);assert.match(view,/open:gzclp/);
  f.click('programsection:plan');f.warm();f.click('next:0');
  assert.match(f.run('vPlanTab()'),/Fortsett dagens økt/);
});
test('without an active program the library remains available',()=>{
  const f=fixture();f.run('S.active=null;S.draft=null');assert.match(f.run('vPlanTab()'),/pe:new/);
  f.click('programsection:setup');assert.match(f.run('vPlanTab()'),/Ingen aktivt program/);
});
test('plan navigation does not mutate the active program or its paused workout',()=>{
  const f=fixture();f.warm();f.click('next:0');const before=f.state('[S.active,S.draft,S.history]');const rest=f.state('ui.rest');
  for(const section of ['plan','setup','library','plan']){f.click('programsection:'+section);f.run('vPlanTab()');}
  assert.deepEqual(f.state('[S.active,S.draft,S.history]'),before);assert.deepEqual(f.state('ui.rest'),rest);
});
test('full completion still saves the workout and applies the original progression',()=>{
  const f=fixture();f.warm();f.run('S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t))');
  const squat=f.state('S.active.lifts.squat.w');f.click('finish');
  assert.equal(f.state('S.history.length'),1);assert.equal(f.state('S.active.idx'),1);
  assert.equal(f.state('S.active.lifts.squat.w'),squat+2.5);
  assert.equal(f.state('ui.summary.day'),'Økt A');
});
test('all standard strength programs render working sets and the new sections',()=>{
  const f=fixture();const programs=f.state("PROGRAMS.filter(p=>p.prog!=='athx').map(p=>p.id)");
  for(const id of programs){
    f.run(`S=fresh();S.settings.pete.on=false;S.active=newInstance(prog(${JSON.stringify(id)}));S.draft=buildSession(prog(S.active.programId),S.active);ui.summary=null;ui.detail=null;ui.setUndo=null;`);
    assert.match(f.run('vToday()'),/id="exercise-0"/,id);
    assert.match(f.run('vPlanTab()'),/programsection:setup/,id);
  }
});
test('ATHX keeps its conditioning content and calendar plan',()=>{
  const f=fixture();
  f.run(`S=fresh();ui.ax=axFormInit();ui.ax.date=new Date(Date.now()+84*86400000).toISOString().slice(0,10);S.active=newInstance(prog('athx27'));S.draft=buildSession(prog('athx27'),S.active);`);
  assert.match(f.run('vToday()'),/id="today-after"/);
  assert.match(f.run('vPlanTab()'),/programsection:setup/);
});
test('custom programs retain the editor, sharing actions and their generated sessions',()=>{
  const f=fixture();
  f.run(`const own=copyOf(prog('sl5x5'));S.userProgs={[own.id]:own};S.active=newInstance(userDef(own));S.draft=buildSession(userDef(own),S.active);`);
  assert.match(f.run('vToday()'),/id="exercise-0"/);
  assert.match(f.run('vDetail(prog(S.active.programId))'),/pe:edit:/);
  assert.match(f.run('vDetail(prog(S.active.programId))'),/ps:pick:/);
});
test('workout removes the visual registration and automatic-pause hints but keeps accessible logging',()=>{
  const f=fixture();f.warm();const view=f.run('vToday()');
  assert.doesNotMatch(view,/today-log-label|Pausen starter automatisk|todayRestHint/);
  assert.match(view,/aria-label="Registrer 5 reps/);
  assert.match(view,/aria-haspopup="dialog" aria-controls="exerciseSheet"/);
});
test('exercise actions live in the dialog rather than below the workout card',()=>{
  const f=fixture();f.click(f.run("'exmenu:'+S.draft.started+'-0'"));
  assert.equal(f.state('exerciseMenuIndex()'),0);
  assert.doesNotMatch(f.run('vToday()'),/data-a="exsw:|Fjern fra dagens økt/);
  const menu=f.run('vExerciseOptions(S.draft,S.draft.ex[0],0)');
  assert.match(menu,/Bytt i dag/);assert.match(menu,/Fjern fra dagens økt/);
});
test('removal confirmation stays in the exercise menu and cancel preserves all sets',()=>{
  const f=fixture();f.warm();f.click('next:0');const before=f.state('S.draft');
  f.click(f.run("'exmenu:'+S.draft.started+'-0'"));f.click('confirm:exrm:0');
  assert.match(f.run('vExerciseOptions(S.draft,S.draft.ex[0],0)'),/Ja, fjern/);
  f.click('cancel');assert.match(f.run('vExerciseOptions(S.draft,S.draft.ex[0],0)'),/Bytt i dag/);
  f.click('exmenuclose');assert.equal(f.state('exerciseMenuIndex()'),-1);
  assert.deepEqual(f.state('S.draft'),before);
});
test('closing the popup abandons an unconfirmed swap without changing the exercise',()=>{
  const f=fixture();const before=f.state('S.draft');
  f.click(f.run("'exmenu:'+S.draft.started+'-0'"));f.click('exsw:0');
  assert.match(f.run('vExerciseOptions(S.draft,S.draft.ex[0],0)'),/Søk i øvelsesbiblioteket/);
  f.click('exmenuclose');assert.equal(f.state('ui.exSw'),null);
  assert.deepEqual(f.state('S.draft'),before);
});
test('confirmed removal closes the menu and keeps the removed lift recoverable',()=>{
  const f=fixture();f.warm();f.click('next:0');
  f.click(f.run("'exmenu:'+S.draft.started+'-0'"));f.click('confirm:exrm:0');f.click('exrm:0');
  assert.equal(f.state('exerciseMenuIndex()'),-1);
  assert.equal(f.state('S.draft.rmEx[0].sets[0].d'),5);
  assert.equal(f.state('S.draft.ex.length'),2);
});
test('RP programs follow the sheet: 10RM percentages, reps in reserve, ratings and deload',()=>{
  const f=fixture('rp3');
  f.run(`S.active.rm={bench:80};S.draft=buildSession(prog('rp3'),S.active);`);
  // Uke 1 i Basis: 85 % av 10RM, 3 reps i reserve, og vurderingen spørres etter settene
  assert.equal(f.state('S.draft.ex[0].lift'),'bench');
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),67.5);
  assert.equal(f.state('S.draft.ex[0].tag'),'3 reps i reserve');
  assert.equal(f.state('S.draft.ex[0].rpAsk'),true);
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);
  assert.match(f.run('vToday()'),/Hvor støl var du fra sist/);
  f.click('q:0:lett');f.click('finish');
  // Lett gir ett sett mer neste uke, og vekta går 5 % opp fra uke 1
  f.run(`S.active.idx=3;S.draft=buildSession(prog('rp3'),S.active);`);
  assert.equal(f.state('S.draft.ex[0].sets.length'),4);
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),f.state('r25(S.active.rm.bench*.85*1.05)'));
  // Deload: 2 sett med halve reps fra uke 1, andre øvelse i supersett står over i Metabolitt
  f.run(`S.active.idx=12;S.draft=buildSession(prog('rp3'),S.active);`);
  assert.equal(f.state('S.draft.sub'),'Uke 5 av 13 · Basis, deload');
  assert.equal(f.state('S.draft.ex[0].sets.length'),2);
  // Halvparten av hvert sett fra uke 1, rundet ned (RP)
  assert.deepEqual(f.state('S.draft.ex[0].sets.map(x=>x.t)'),f.state('S.active.r1["0.0.0"]').slice(0,2).map(r=>Math.floor(r/2)));
  // Ny mesosyklus: 10RM fra settene dine, 75 % i uke 1
  f.run(`S.active.est.bench=90;S.active.idx=15;S.draft=buildSession(prog('rp3'),S.active);`);
  assert.equal(f.state('S.active.rm.bench'),90);
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),67.5);
  f.run(`S.active.idx=27;S.draft=buildSession(prog('rp3'),S.active);`);
  assert.equal(f.state('S.draft.ex.some(e=>e.ss2)'),false);
});
test('RP slots swap within the sheet categories, and the new exercises are in the library',()=>{
  const f=fixture('nf5');
  assert.equal(f.state("EXLIB.length"),449);
  assert.ok(f.state("RP_CAT.vtri.ex.every(l=>LIFTS[l])"));
  assert.ok(f.state("Object.values(RP_CAT).flatMap(c=>c.ex).every(l=>EXLIB.some(r=>libKey(r)===l))"));
  // Oppsett: plassen får en øvelse fra kategorien, og økta bygges på nytt
  assert.match(f.run('swapRows(prog("nf5"),S.active)'),/data-rpswap="0\.0\.0"/);
  f.run(`rpSwap('0.0.0','l_stanga_lav_skra_db_benk','inclinedb');`);
  assert.equal(f.state('buildSession(prog("nf5"),S.active).ex[0].lift'),'l_stanga_lav_skra_db_benk');
  // Bytt i dag: alternativene er lista fra arket
  f.run(`S.draft=buildSession(prog('nf5'),S.active);`);
  const c=f.state('swapCands(S.draft,S.draft.ex[0]).fam');
  assert.ok(c.includes('inclinedb')&&c.every(l=>f.state(`RP_CAT.ipush.ex.includes(${JSON.stringify(l)})`)));
});
test('exercises from the RP sheets have a video button, and other exercises do not',()=>{
  const f=fixture('rp3');
  assert.ok(f.state("Object.values(RP_CAT).flatMap(c=>c.ex).every(l=>/^[A-Za-z0-9_-]{11}$/.test(EXVID[l]))"));
  assert.match(f.run('vToday()'),/data-a="video:bench"/);
  f.run(`S.active=newInstance(prog('burg12'));S.draft=buildSession(prog('burg12'),S.active);`);
  assert.doesNotMatch(f.run('vToday()'),/data-a="video:snatch"/);
});
test('Brosesh: one more rep per set, heavier when every set reaches the top, sets follow the ratings',()=>{
  const f=fixture('bro');
  // Uke 1, økt A: forsiktig forslag, toppen av repområdet som mål, 3 reps i reserve
  assert.equal(f.state('S.draft.sub'),'Uke 1 av 12 · 3 reps i reserve');
  assert.equal(f.state('S.draft.ex.length'),7);
  assert.equal(f.state('S.draft.ex[0].lift'),'l_leg_press');
  assert.deepEqual(f.state('S.draft.ex[0].sets.map(x=>[x.t,x.w])'),[[12,60],[12,60],[12,60]]);
  assert.equal(f.state('S.draft.ex[0].tag'),'8–12 reps · 3 reps i reserve');
  assert.equal(f.state('S.draft.ex[0].rest'),150);
  assert.equal(f.state('S.draft.ex[3].rest'),90);
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));[12,10,9].forEach((d,i)=>S.draft.ex[0].sets[i].d=d);`);
  assert.match(f.run('vToday()'),/Lett to uker på rad gir ett sett mer/);
  f.click('q:0:lett');f.click('finish');
  // Uke 2: én rep mer i hvert sett, samme vekt. Brystpressen nådde toppen og går opp 2,5 kg.
  f.run(`S.active.idx=3;S.draft=buildSession(prog('bro'),S.active);`);
  assert.deepEqual(f.state('S.draft.ex[0].sets.map(x=>[x.t,x.w])'),[[12,60],[11,60],[10,60]]);
  assert.match(f.state('S.draft.ex[0].hint'),/Sist: 12, 10 og 9 reps på 60 kg/);
  assert.deepEqual(f.state('S.draft.ex[1].sets.map(x=>[x.t,x.w])'),[[10,32.5],[10,32.5],[10,32.5]]);
  // Lett to uker på rad gir fire sett, tungt tar ett bort igjen
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);f.click('q:0:lett');f.click('finish');
  f.run(`S.active.idx=6;S.draft=buildSession(prog('bro'),S.active);`);
  assert.equal(f.state('S.draft.ex[0].sets.length'),4);
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);f.click('q:0:tungt');f.click('finish');
  f.run(`S.active.idx=9;S.draft=buildSession(prog('bro'),S.active);`);
  assert.equal(f.state('S.draft.ex[0].sets.length'),3);
  // Uke 5, økt B: rumensk markløft holdes på 2, isolasjon kan gå til 0–1, og vurderingen spørres ikke
  f.run(`S.active.idx=13;S.draft=buildSession(prog('bro'),S.active);`);
  assert.deepEqual(f.state('S.draft.ex.map(e=>e.tag)').slice(0,4),['8–12 reps · 2 reps i reserve','8–12 reps · 1–2 reps i reserve','8–12 reps · 1–2 reps i reserve','10–15 reps · 0–1 reps i reserve']);
  assert.equal(f.state('S.draft.ex[0].rpAsk===undefined'),true);
  // Deload i uke 6: 80 % av vekta, 2 sett der det står 3, 1 der det står 2, bunnen av repområdet
  f.run(`S.active.idx=15;S.draft=buildSession(prog('bro'),S.active);`);
  assert.equal(f.state('S.draft.sub'),'Uke 6 av 12 · deload');
  assert.deepEqual(f.state('S.draft.ex[0].sets.map(x=>[x.t,x.w])'),[[8,47.5],[8,47.5]]);
  assert.equal(f.state('S.draft.ex[3].sets.length'),1);
  // Uke 7: ny blokk med like mange sett som i uke 1, vektene står
  f.run(`S.active.sets["0.0"]=4;S.active.idx=18;S.draft=buildSession(prog('bro'),S.active);`);
  assert.equal(f.state('S.draft.ex[0].sets.length'),3);
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),60);
  assert.equal(f.state('S.draft.sub'),'Uke 7 av 12 · 3 reps i reserve');
});
test('Brosesh swaps within the RP guide lists and shows the RP guide videos only in Brosesh',()=>{
  const f=fixture('bro');
  assert.ok(f.state("Object.values(BRO_CAT).flatMap(c=>c.ex).every(l=>LIFTS[l]&&/^[A-Za-z0-9_-]{11}$/.test(BRO_VID[l]))"));
  assert.ok(f.state("BRO_DAYS.flat().every(r=>BRO_CAT[r[0]].ex.includes(r[4]))"));
  // Oppsett: plassen får en øvelse fra lista, og økta bygges på nytt
  assert.match(f.run('swapRows(prog("bro"),S.active)'),/data-rpswap="0\.0"/);
  f.run(`rpSwap('0.0','l_hack_squat','l_leg_press');`);
  assert.equal(f.state('buildSession(prog("bro"),S.active).ex[0].lift'),'l_hack_squat');
  // Bytt i dag: alternativene er lista fra RP-guiden for muskelen
  f.run(`S.draft=buildSession(prog('bro'),S.active);`);
  const c=f.state('swapCands(S.draft,S.draft.ex[1]).fam');
  assert.ok(c.includes('dbbench')&&c.every(l=>f.state(`BRO_CAT.bro_hpress.ex.includes(${JSON.stringify(l)})`)));
  // Videoen er fra RP-guiden i Brosesh, og fra arket i RP-programmene
  assert.match(f.run('vToday()'),/data-a="video:l_hack_squat"/);
  assert.equal(f.state("vidOf('l_hack_squat')"),'rYgNArpwE7E');
  f.run(`S.active=newInstance(prog('rp3'));`);
  assert.equal(f.state("vidOf('l_hack_squat')"),f.state("EXVID.l_hack_squat"));
});
test('Knebøy, benk og RP: heavy squat and bench day, then the RP press and pull days',()=>{
  const f=fixture('rpkb');
  f.run(`S.active.rm={squat:120,bench:90};S.draft=buildSession(prog('rpkb'),S.active);`);
  // Dag 1: 3 × 5 med 3 reps i reserve. 10RM 120 gir 1RM 160, og 5 reps med 3 i reserve er 160 / (1 + 8/30).
  assert.equal(f.state('S.draft.day'),'Dag 1 · Knebøy og benk');
  assert.deepEqual(f.state('S.draft.ex.map(e=>[e.lift,e.sets.length,e.sets[0].t,e.sets[0].w,e.rest])'),[['squat',3,5,127.5,180],['bench',3,5,95,180]]);
  assert.equal(f.state('S.draft.ex[1].tag'),'Tungt · 3 reps i reserve');
  // Dag 2 og 3 er Press og Trekk fra RP 3 dager, med manualbenk og beinpress i stedet for benk og knebøy
  const d2=f.state('buildSession(prog("rpkb"),Object.assign(clone(S.active),{idx:1}))'), d3=f.state('buildSession(prog("rpkb"),Object.assign(clone(S.active),{idx:2}))');
  assert.equal(d2.day,'Dag 2 · Press');assert.equal(d3.day,'Dag 3 · Trekk');
  assert.ok(d2.ex.some(e=>e.lift==='dbbench')&&d2.ex.some(e=>e.lift==='l_leg_press'));
  assert.ok(![...d2.ex,...d3.ex].some(e=>e.lift==='bench'||e.lift==='squat'));
  // Uke 4: 1 rep i reserve gir tyngre vekt. Deload: 2 sett med halve reps fra uke 1.
  assert.equal(f.state('buildSession(prog("rpkb"),Object.assign(clone(S.active),{idx:9})).ex[0].sets[0].w'),132.5);
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);f.click('q:0:passe');f.click('q:1:passe');f.click('finish');
  assert.deepEqual(f.state('S.active.r1["0.0.0"]'),[5,5,5]);
  assert.deepEqual(f.state('buildSession(prog("rpkb"),Object.assign(clone(S.active),{idx:12})).ex[0].sets.map(x=>x.t)'),[3,3]);
  // Resensitivisering: 3 reps
  assert.equal(f.state('buildSession(prog("rpkb"),Object.assign(clone(S.active),{idx:30})).ex[0].sets[0].t'),3);
});
test('an exercise can be added to today only, logged, and removed again',()=>{
  const f=fixture();
  f.click('exadd');
  assert.match(f.run('vToday()'),/id="exAddQ"/);
  assert.match(f.run('exAddRes("face pull")'),/data-a="exaddpick:l_face_pull"/);
  f.click('exaddpick:l_face_pull');
  assert.match(f.run('vToday()'),/id="exAddW"/);
  f.run(`exAdd('l_face_pull',3,15,20)`);
  assert.deepEqual(f.state('S.draft.ex.at(-1)').sets.map(x=>[x.t,x.w]),[[15,20],[15,20],[15,20]]);
  assert.equal(f.state('S.draft.ex.at(-1).added'),true);
  assert.equal(f.state('ui.exAdd'),null);
  // Fjernes den, forsvinner den helt, og står ikke under «Fjernet fra dagens økt»
  f.run(`exRemove(S.draft.ex.length-1)`);
  assert.equal(f.state('S.draft.ex.some(e=>e.lift==="l_face_pull")'),false);
  assert.equal(f.state('(S.draft.rmEx||[]).length'),0);
  // Logget: med i loggen, men programmet ser den ikke
  f.run(`exAdd('l_face_pull',2,12,15)`);
  const before=f.state('S.active.lifts');
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);f.click('finish');
  const h=f.state('S.history[0]');
  assert.deepEqual(h.ex.at(-1),{lift:'l_face_pull',tag:'Lagt til i dag',sets:[{t:12,w:15,d:12},{t:12,w:15,d:12}],add:true});
  assert.equal(f.state('lastW("l_face_pull")'),15);
  assert.deepEqual(Object.keys(f.state('S.active.lifts')),Object.keys(before));
  // Neste økt foreslår den under «Nylig brukt», med sett og reps fra sist
  f.click('dismiss');f.run(`S.draft=buildSession(prog(S.active.programId),S.active);`);f.click('exadd');
  assert.match(f.run('vToday()'),/exaddpick:l_face_pull/);
  assert.deepEqual(f.state('exAddDef("l_face_pull")'),{n:2,r:12,w:15});
});
test('an exercise not started can be removed from today with one tap from its line',()=>{
  const f=fixture();f.click('next:0');
  const html=f.run('vToday()');
  assert.match(html,/data-a="exrm:1"/);
  f.click('exrm:1');
  assert.equal(f.state('S.draft.ex.length'),2);
  assert.equal(f.state('S.draft.rmEx.length'),1);
  // En øvelse med loggede sett får ikke ett-trykksknappen
  f.run(`S.draft.ex[1].sets[0].d=5`);
  assert.doesNotMatch(f.run('vToday()'),/data-a="exrm:1"/);
});
test('a time in Sammen can run the next program session or something else',()=>{
  const f=fixture();
  f.run(`auth={user:{id:'me'}};const t=h=>new Date(Date.now()+h*3600e3).toISOString();
    SX.sess=[{id:'A',owner:'me',kind:'fixed',starts_at:t(1),workout_kind:'none'},{id:'B',owner:'me',kind:'fixed',starts_at:t(26),workout_kind:'none'}];SX.part=[];`);
  // Hver time får neste økt i programmet, i rekkefølge
  assert.deepEqual(f.state('["A","B"].map(id=>mySessFor(SX.sess.find(s=>s.id===id)).day)'),['Økt A','Økt B']);
  // Noe annet: timen bruker ikke av programmet, og neste økt går til timen etter
  f.click('sxother:A:1');
  assert.deepEqual(f.state('myUpcoming()'),['B']);
  assert.equal(f.state('mySessFor(SX.sess[1]).day'),'Økt A');
  assert.match(f.run('myBox(SX.sess[0])'),/Noe annet[\s\S]*data-a="sxother:A:0"/);
  assert.match(f.run('myLine(SX.sess[0])'),/noe annet/);
  // Eieren deler ingen økt på timen med noe annet, og vennene ser neste økt på timen etter
  assert.equal(f.state('SX.sess[0].plan||null'),null);
  assert.equal(f.state('SX.sess[1].plan.day'),'Økt A');
  assert.deepEqual(f.state('S.sxOther'),{A:{t:''}});
  // Tilbake til neste økt i programmet
  f.click('sxother:A:0');
  assert.deepEqual(f.state('myUpcoming()'),['A','B']);
  assert.match(f.run('myBox(SX.sess[0])'),/data-a="sxother:A:1"/);
  // Skjemaet for ny time har valget, og en time med noe annet åpnes med det valgt
  f.run('sxFormInit()');
  assert.match(f.run('vSxForm()'),/name="sxmine" data-sxf="mine" value="next" checked/);
  f.run(`S.sxOther={B:true};sxFormInit(SX.sess[1])`);
  assert.equal(f.state('ui.sxForm.mine'),'other');
});
test('something else on a time has a private free-text field for what you will train',()=>{
  const f=fixture();
  f.run(`auth={user:{id:'me'}};SX.sess=[{id:'A',owner:'me',kind:'fixed',starts_at:new Date(Date.now()+3600e3).toISOString(),workout_kind:'none'}];SX.part=[];`);
  // Skjemaet: feltet kommer når du velger noe annet
  f.run('sxFormInit()');
  assert.doesNotMatch(f.run('vSxForm()'),/data-sxf="mineTxt"/);
  f.run(`ui.sxForm.mine='other';ui.sxForm.mineTxt='Metcon med Ola <b>';`);
  assert.match(f.run('vSxForm()'),/data-sxf="mineTxt"/);
  // Lagret på timen: teksten står i lista og på timen, og kan endres der
  f.run(`S.sxOther={A:{t:sxClean(ui.sxForm.mineTxt)}};`);
  assert.equal(f.state('sxOtherTxt(SX.sess[0])'),'Metcon med Ola b');
  assert.match(f.run('myLine(SX.sess[0])'),/Din økt: Metcon med Ola b/);
  assert.match(f.run('myBox(SX.sess[0])'),/data-sxother="A"[^>]*>Metcon med Ola b<\/textarea>/);
  assert.equal(f.state('(sxFormInit(SX.sess[0]),ui.sxForm.mineTxt)'),'Metcon med Ola b');
  // Tidligere valg uten tekst (true) virker fortsatt
  f.run(`S.sxOther={A:true};`);
  assert.equal(f.state('sxOtherTxt(SX.sess[0])'),'');
  assert.match(f.run('myLine(SX.sess[0])'),/Din økt: noe annet/);
  // Bytter du til noe annet på timen, beholdes teksten du skrev
  f.run(`S.sxOther={A:{t:'Lett jogg'}};sxSetOther('A',false);sxSetOther('A',true);`);
  assert.equal(f.state('sxOtherTxt(SX.sess[0])'),'');
  f.run(`sxSetOther('A',true,'Lett jogg');sxSetOther('A',true);`);
  assert.equal(f.state('sxOtherTxt(SX.sess[0])'),'Lett jogg');
});
test('RP reps follow the how-to: no target, the suggestion is the middle of the range and then your own reps',()=>{
  const f=fixture('rp3');
  f.run(`S.active.rm={bench:80};`);
  const b=i=>f.state(`buildSession(prog('rp3'),Object.assign(clone(S.active),{idx:${i}}))`);
  // Første gang: midt i RP sitt område for første sett i hver mesosyklus, og settene er frie (ingen mål)
  assert.deepEqual(b(0).ex[0].sets.map(x=>x.t),[13,13,13]);
  assert.equal(b(0).ex[0].rpFree,true);
  assert.deepEqual(b(0).ex[0].rpRange,[7,19]);
  assert.equal(b(15).ex[0].sets[0].t,20);assert.deepEqual(b(15).ex[0].rpRange,[11,29]);
  assert.equal(b(30).ex[0].sets[0].t,8);assert.deepEqual(b(30).ex[0].rpRange,[4,11]);
  // Uka etter foreslår det du tok, sett for sett
  f.run(`S.draft=buildSession(prog('rp3'),S.active);S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));const e=S.draft.ex[0];[17,15,12].forEach((d,i)=>e.sets[i].d=d);`);
  f.click('finish');
  assert.deepEqual(f.state('S.active.last["0.0.0"]'),[17,15,12]);
  assert.deepEqual(f.state('S.active.r1["0.0.0"]'),[17,15,12]);
  assert.deepEqual(b(3).ex[0].sets.map(x=>x.t),[17,15,12]);
  // Andre øvelse i et supersett har ikke kontrollområdet (forhåndsslitt)
  const m2=b(15).ex;
  assert.ok(m2.some(e=>e.ss2));
  assert.ok(m2.filter(e=>e.ss2).every(e=>e.rpFree&&e.rpRange===undefined));
});
test('RP deload is half of each week-1 set, rounded down, never zero',()=>{
  const f=fixture('rp3');
  f.run(`S.active.rm={bench:80};S.active.r1={"0.0.0":[9,8,7],"0.0.1":[1,1,1]};`);
  const dl=f.state(`buildSession(prog('rp3'),Object.assign(clone(S.active),{idx:12}))`);
  assert.equal(dl.sub,'Uke 5 av 13 · Basis, deload');
  assert.deepEqual(dl.ex[0].sets.map(x=>x.t),[4,4]);
  assert.deepEqual(dl.ex[1].sets.map(x=>x.t),[1,1]);
  assert.equal(dl.ex[0].rpFree,undefined);
  // Eldre programmer med bare første sett lagret som tall
  f.run(`S.active.r1={"0.0.0":7};`);
  assert.deepEqual(f.state(`buildSession(prog('rp3'),Object.assign(clone(S.active),{idx:12})).ex[0].sets.map(x=>x.t)`),[3,3]);
});
test('first-set check: outside the RP range, an accepted change moves 10RM 10 % from next time',()=>{
  const run=(d,cal)=>{
    const f=fixture('rp3');
    f.run(`S.active.rm={bench:35};S.draft=buildSession(prog('rp3'),S.active);S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));S.draft.ex[0].sets[0].d=${d};S.draft.ex[0].cal=${JSON.stringify(cal)};`);
    f.click('finish');return f;
  };
  // 22 reps er over 19: OK gir 10RM 35 → 38,5, og vekta neste uke følger (85 % × 1,05)
  let f=run(22,'up');
  assert.equal(f.state('S.active.rm.bench'),38.5);
  assert.ok(f.state('ui.summary.notes').some(n=>/35 → 38,5/.test(n.text)));
  assert.equal(f.state(`buildSession(prog('rp3'),Object.assign(clone(S.active),{idx:3})).ex[0].sets[0].w`),f.state('r25(38.5*.85*1.05)'));
  // 5 reps er under 7: ned 10 %
  f=run(5,'down');assert.equal(f.state('S.active.rm.bench'),31.5);
  // Ja sagt, men første sett er innenfor området: ingenting endres. Feil retning endrer heller ikke.
  f=run(15,'up');assert.equal(f.state('S.active.rm.bench'),35);
  f=run(22,'down');assert.equal(f.state('S.active.rm.bench'),35);
  // La være (eller ikke svart): ingenting endres
  f=run(22,'no');assert.equal(f.state('S.active.rm.bench'),35);
  f=run(22,null);assert.equal(f.state('S.active.rm.bench'),35);
});
test('the heavy squat and bench sets in Knebøy, benk og RP keep their fixed 5 reps',()=>{
  const f=fixture('rpkb');
  f.run(`S.active.rm={squat:120,bench:90};`);
  const d1=f.state(`buildSession(prog('rpkb'),S.active)`);
  assert.ok(d1.ex.every(e=>!e.rpFree&&e.rpRange===undefined));
  assert.deepEqual(d1.ex.map(e=>e.sets.map(x=>x.t)),[[5,5,5],[5,5,5]]);
  const d2=f.state(`buildSession(prog('rpkb'),Object.assign(clone(S.active),{idx:1}))`);
  assert.ok(d2.ex.every(e=>e.rpFree));
});
test('RP sets log the reps you took with + and −, never show a miss, and offer the first-set check',()=>{
  const f=fixture('rp3');
  f.run(`S.active.rm={bench:80};S.draft=buildSession(prog('rp3'),S.active);S.draft.ex[0].wuDone=warmups(S.draft.ex[0].slot,S.draft.ex[0].sets[0].w,S.draft.ex[0].sets[0].t,'full').map(([w,r])=>w+'x'+r);`);
  // Infofeltet om første sett og stepperen står i kortet
  const html=f.run('vToday()');
  assert.match(html,/Første sett: 7–19 reps/);
  assert.match(html,/data-a="rpp:0:1"/);
  assert.doesNotMatch(html,/3×13/);
  // Forslaget er 13 første gang. + ni ganger gir 22, og settet logges med det.
  for(let i=0;i<9;i++) f.click('rpp:0:1');
  f.click('next:0');
  assert.equal(f.state('S.draft.ex[0].sets[0].d'),22);
  assert.equal(f.state('S.draft.ex[0].pend===undefined'),true);
  // Neste sett foreslår det du nettopp tok. − to ganger gir 20.
  f.click('rpp:0:-1');f.click('rpp:0:-1');f.click('next:0');
  assert.equal(f.state('S.draft.ex[0].sets[1].d'),20);
  // Færre reps i et senere sett er ikke bom
  f.click('rpp:0:-1');f.click('rpp:0:-1');f.click('rpp:0:-1');f.click('rpp:0:-1');f.click('rpp:0:-1');f.click('next:0');
  assert.equal(f.state('S.draft.ex[0].sets[2].d'),15);
  assert.doesNotMatch(f.run('vToday()'),/chip miss/);
  // 22 er over 19: appen foreslår 10 % opp, og OK gir høyere 10RM fra neste gang
  assert.match(f.run('vToday()'),/data-a="rpcal:0:up"/);
  f.click('rpcal:0:up');
  assert.match(f.run('vToday()'),/Vektene går opp 10 %/);
  f.run(`S.draft.ex.slice(1).forEach(e=>e.sets.forEach(x=>x.d=x.t));`);
  f.click('finish');
  assert.equal(f.state('S.active.rm.bench'),88);
  assert.equal(f.state('S.history[0].ex[0].cal'),'up');
  assert.deepEqual(f.state('S.active.last["0.0.0"]'),[22,20,15]);
});
test('dumbbells round to 1 kg up to 12 kg, then 12.5 kg and 2.5 kg steps',()=>{
  const f=fixture('rp3');
  assert.equal(f.state('LIFTS.dbbench.db'),1);
  assert.equal(f.state('LIFTS.l_side_lateral_raise.db'),1);
  assert.equal(f.state('!!LIFTS.bench.db'),false);
  assert.deepEqual(f.state('[10.4,10.7,12.2,12.3,13.6,14,33.7].map(rDB)'),[10,11,12,12.5,12.5,15,32.5]);
  assert.deepEqual(f.state('[[11,1],[12,1],[12.5,1],[15,1],[15,-1],[12.5,-1],[12,-1],[1,-1]].map(([w,d])=>dbStep(w,d))'),[12,12.5,15,17.5,12.5,12,11,1]);
  // RP: sidehev med 10RM 14 gir 12 / 12,5 / 12,5 / 12,5 kg i Basis, ikke 12,5 / 12,5 / 12,5 / 12,5
  f.run(`S.active.rm={l_side_lateral_raise:14};`);
  assert.deepEqual(f.state(`[0,3,6,9].map(i=>buildSession(prog('rp3'),Object.assign(clone(S.active),{idx:i})).ex[3].sets[0].w)`),[12,12.5,12.5,12.5]);
  // Juster vekt går til neste manual
  f.run(`S.draft=buildSession(prog('rp3'),S.active);`);
  f.click('w:3:1');assert.equal(f.state('S.draft.ex[3].sets[0].w'),12.5);
  f.click('w:3:1');assert.equal(f.state('S.draft.ex[3].sets[0].w'),15);
  f.click('w:3:-1');f.click('w:3:-1');assert.equal(f.state('S.draft.ex[3].sets[0].w'),12);
});
test('changing the weight with − and + keeps the warmup sets you have done',()=>{
  const f=fixture('rpkb');
  f.run(`S.active.rm={squat:120,bench:90};S.draft=buildSession(prog('rpkb'),S.active);`);
  const wu=f.state('warmups(S.draft.ex[0].slot,S.draft.ex[0].sets[0].w,S.draft.ex[0].sets[0].t,wuKind(S.draft,0))');
  f.click('next:0');f.click('next:0');
  assert.equal(f.state('S.draft.ex[0].wuDone.length'),2);
  f.click('w:0:1');
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),130);
  assert.equal(f.state('S.draft.ex[0].wuDone.length'),2);
  // Ferdig oppvarming står som ferdig, også om den nye vekta gir et sett mer
  f.run('S.draft.ex[0].wuDone=warmups(S.draft.ex[0].slot,S.draft.ex[0].sets[0].w,S.draft.ex[0].sets[0].t,"full").map(([w,r])=>w+"x"+r)');
  for(let i=0;i<4;i++) f.click('w:0:1');
  const left=f.state('warmups(S.draft.ex[0].slot,S.draft.ex[0].sets[0].w,S.draft.ex[0].sets[0].t,"full").filter(([w,r])=>!S.draft.ex[0].wuDone.includes(w+"x"+r)).length');
  assert.equal(left,0);
  assert.ok(wu.length>0);
});
test('RP: a weight changed in the session carries over to the next session',()=>{
  const f=fixture('rp3');
  f.run(`S.active.rm={bench:80};S.draft=buildSession(prog('rp3'),S.active);`);
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),67.5);
  f.click('w:0:1');f.click('w:0:1');
  assert.equal(f.state('S.draft.ex[0].sets[0].w'),72.5);
  f.run(`S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);f.click('q:0:passe');f.click('finish');
  // 72,5 kg er 85 % av 10RM, så 10RM blir 85,5 kg
  assert.equal(f.state('S.active.rm.bench'),85.5);
  assert.equal(f.state('buildSession(prog("rp3"),Object.assign(clone(S.active),{idx:3})).ex[0].sets[0].w'),f.state('r25(85.5*.85*1.05)'));
  // Uten endring står 10RM
  f.run(`S.active.rm={bench:80};S.active.idx=0;S.draft=buildSession(prog('rp3'),S.active);S.draft.ex.forEach(e=>e.sets.forEach(x=>x.d=x.t));`);
  f.click('q:0:passe');f.click('finish');
  assert.equal(f.state('S.active.rm.bench'),80);
});
