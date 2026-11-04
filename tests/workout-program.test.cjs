const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const app = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1].split('\nrender();\nckRender();')[0];

// Run the real app and click handler; only browser services are replaced.
function fixture(program = 'sl5x5') {
  const listeners = {}, storage = new Map(), nodes = new Map(), followed = [];
  function node(selector) {
    return {dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},
      hidden:false,textContent:'',innerHTML:'',tagName:'SECTION',
      querySelector:()=>null,hasAttribute:()=>false,focus(){},
      scrollIntoView(){followed.push(selector);}};
  }
  for (const id of ['.stage','#rest','#restB','#restL','#restFlash','#toast','#exercise-0','#exercise-1','#exercise-2','#today-after']) nodes.set(id,node(id));
  const c = vm.createContext({console,URL,URLSearchParams,Map,Set,Date,JSON,Math,Number,String,Promise,
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
  return {run,click,state,warm,followed,storage,nodes};
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
