const test=require('node:test');
const assert=require('node:assert/strict');
const {fixture}=require('./helpers/app-fixture.cjs');

test('drag input and effort persist in drafts, calculated result and history, with apparatus isolation',()=>{
  const f=fixture();f.run("pbState('row').idx=1;petePick('session')");
  f.click('pp:resultmode:session:reps');f.click('pp:effort:session:controlled');
  ['1:47','1:47','1:47','1:47','1:47','1:47'].forEach((v,i)=>f.input({pbrep:'session:'+i},v));
  f.run('S=load()');
  assert.equal(f.state('peteResultSec(pbSession(1,"row"),S.draft.pete)'),107);
  f.click('finish');
  assert.equal(f.state('S.history[0].pete.effort'),'controlled');
  assert.deepEqual(f.state('S.history[0].pete.paces'),Array(6).fill(107));
  assert.equal(f.state('pbState("ski").idx'),0);
  assert.match(f.run('pbHistory(S.history[0].pete)'),/Kontrollert.*Drag:/s);
});
test('partial or invalid drag input cannot silently use the old average',()=>{
  const f=fixture();f.run("petePick('free',1);ui.freePete.split='1:47';ui.freePete.resultMode='reps';ui.freePete.paces=['1:47']");
  f.click('freesave');assert.equal(f.state('S.history.length'),0);
  f.run("ui.freePete.paces=Array(6).fill('1:99')");f.click('freesave');assert.equal(f.state('S.history.length'),0);
  f.click('pp:resultmode:free:average');f.click('freesave');assert.equal(f.state('S.history[0].pete.split'),107);
});
test('equal-time intervals use total time divided by total distance on each apparatus',()=>{
  const f=fixture();
  for(const mach of ['row','ski','bike']){
    const sec=f.state(`pbRepResult(pbSession(4,'${mach}'),{paces:['2:00','2:30']}).sec`);
    assert.ok(Math.abs(sec*(mach==='bike'?2:1)-2/(1/120+1/150))<1e-9);
  }
});
test('hard effort blocks a faster goal; maximal effort and fading ease it, never across apparatus',()=>{
  for(const [effort,paces,expected] of [
    ['controlled',Array(6).fill('1:47'),106],
    ['hard',Array(6).fill('1:47'),107],
    ['max',Array(6).fill('1:47'),109],
    ['controlled',['1:43','1:43','1:43','1:51','1:51','1:51'],109]
  ]){
    const f=fixture();
    f.run(`S.settings.pete.startPaceByKind={row:{speed:107},ski:{speed:150}};pbDone({idx:1,mach:'row',effort:'${effort}',resultMode:'reps',paces:${JSON.stringify(paces)}})`);
    assert.equal(f.state('pbTarget(pbSession(31,"row"),"row").sec'),expected);
    assert.equal(f.state('pbTarget(pbSession(31,"ski"),"ski").sec'),150);
  }
});
test('newer difficult intervals override an old fast reference and bike margins use displayed seconds',()=>{
  const f=fixture();
  f.run("S.settings.pete.startPaceByKind={bike:{speed:53.5}};pbDone({idx:1,mach:'bike',split:'1:47',effort:'controlled'});pbDone({idx:6,mach:'bike',split:'1:49',effort:'max'})");
  assert.equal(f.state('pbTarget(pbSession(16,"bike"),"bike").sec*2'),111);
});
test('switching apparatus clears effort and drag inputs and average mode ignores hidden drag data',()=>{
  const f=fixture();f.run("petePick('session',1);S.draft.pete.effort='max';S.draft.pete.paces=Array(6).fill('1:47');S.draft.pete.resultMode='reps'");
  f.click('pp:mach:ski:session');
  assert.equal(f.state('S.draft.pete.effort||null'),null);
  assert.equal(f.state('S.draft.pete.paces||null'),null);
  f.run("S.draft.pete.split='2:30';S.draft.pete.paces=['1:00'];S.draft.pete.resultMode='average'");
  assert.equal(f.state('peteResultSec(pbSession(0,"ski"),S.draft.pete)'),150);
});
test('deleting the last recorded session restores its effort, drag data and next target',()=>{
  const f=fixture();f.run("S.settings.pete.startPaceByKind={row:{speed:107}};pbState('row').idx=1;petePick('free');ui.freePete.split='1:47';ui.freePete.effort='max'");
  f.click('freesave');assert.equal(f.state('pbTarget(pbSession(6,"row"),"row").sec'),109);
  f.run('logDelete(S.history[0].date)');
  assert.equal(f.state('pbTarget(pbSession(6,"row"),"row").sec'),107);
  assert.equal(f.state('pbState("row").idx'),1);
});

test('all 24 weeks simulate with independent inputs, stalls and fading on all apparatus',()=>{
  const {allRuns}=require('../scripts/simulate-pete.cjs');
  const runs=allRuns();assert.equal(runs.length,24);
  assert.equal(runs.reduce((sum,r)=>sum+r.rows.length,0),2304);
  const row=runs.find(r=>r.profile==='controlled'&&r.mach==='row'&&!r.optional);
  assert.equal(row.rows.find(r=>r.week===1&&r.day===2).actual,107);
  assert.equal(row.rows.find(r=>r.week===2&&r.day===2).target,107);
  assert.ok(row.rows.find(r=>r.week===3&&r.day===2).target>120,'Long intervals must not inherit the 500m pace');
  const plateau=runs.find(r=>r.profile==='plateau'&&r.mach==='row'&&!r.optional);
  assert.ok(plateau.rows.filter(r=>r.kind==='speed').every(r=>r.target>=106),'No runaway acceleration when results stay at 1:47');
  for(const profile of ['difficult','fade'])for(const mach of ['row','ski','bike']){
    const run=runs.find(r=>r.profile===profile&&r.mach===mach&&!r.optional);
    assert.ok(run.rows.some(r=>r.adjusted));
    const afterHardWeek=run.rows.find(r=>r.week===4&&r.day===2);
    assert.ok(afterHardWeek.target>afterHardWeek.program,'An old fast reference must not override recent difficulty');
  }
});
