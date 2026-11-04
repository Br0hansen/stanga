const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {readFileSync} = require('node:fs');
process.env.TZ = 'Europe/Oslo';
const source = readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const slice = (from, to) => source.slice(source.indexOf(from), source.indexOf(to, source.indexOf(from)));
const code = slice('const hm =', 'const AV =') + '\n' +
  source.match(/const sxFriendIds = .*?; };/)[0] + '\n' +
  slice('function sxDaySessions(', '// Timedetaljer og skjema') + '\n' +
  slice('function vSxSess(', 'function sxResHTML(') + '\n' +
  slice('function vTogether(){', 'function vSxSignup(){');
function fixture(time = '2026-11-04T12:00:00+01:00') {
  const now = Date.parse(time);
  class Clock extends Date { constructor(...a) { super(...(a.length ? a : [now])); } static now() { return now; } }
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ctx = vm.createContext({Date:Clock, Set, Map, auth:{user:{id:'me'}}, uid:()=> 'me', FIXED_LEN:7200000,
    pad:x=>String(x).padStart(2,'0'), esc, ui:{tab:'together',sxView:'list'}, S:{settings:{pushNo:true}},
    SX:{loaded:true,me:{id:'me'},fr:[{requester:'me',addressee:'a',status:'accepted'},{requester:'b',addressee:'me',status:'accepted'}],
      sess:[],part:[],prop:[],ps:[],ppl:{a:{username:'anna',display_name:'Anna'},b:{username:'emil',display_name:'Emil'}},live:new Map(),chats:[],seenAt:0,prev:0},
    av:id=>`<i>${esc(id)}</i>`, chatUnread:()=>2, sxNews:()=>[],
    sxWorkout:s=>({lbl:'Bare trene samtidig',txt:s.workout_text||'Bare trene samtidig',body:''}),
    mySessFor:()=>({day:'Privat økt'}), ownerBox:()=>'<div>Offentlige øvelser</div>', myBox:()=>'<div>Privat økt</div>', myPlan:()=> 'own',
    vSxFriends:()=>'<div>FRIENDS</div>',vSxChats:h=>h+'<div>CHATS</div>',vSxSignup:()=> 'SIGNUP',vSxNewPw:()=> 'PASSWORD',vSxUsername:()=> 'USERNAME',
    vBank:()=> 'BANK',vSxChat:()=> 'CONVERSATION',vSxPick:()=> 'PICK', DB_ICON:'<svg></svg>', BANK:[]});
  vm.runInContext(code,ctx);
  return ctx;
}
function session(id, owner, start, extra = {}) { return {id,owner,starts_at:start,kind:'fixed',workout_kind:'none',place:'Senteret',...extra}; }
const ids = xs => Array.from(xs, x => x.id);

test('counts each accepted friend once across ownership and participation',()=>{
  const c=fixture(); c.SX.sess=[session('one','a','2026-11-04T18:00:00+01:00'),session('two','a','2026-11-04T19:00:00+01:00'),session('mine','me','2026-11-04T20:00:00+01:00')];
  c.SX.part=[{session_id:'one',user_id:'b'},{session_id:'two',user_id:'b'},{session_id:'mine',user_id:'me'}];
  assert.deepEqual(ids(c.sxTodayFriends()),['a','b']);
});
test('excludes self, pending requests and non-friends from daily count',()=>{
  const c=fixture();c.SX.fr.push({requester:'me',addressee:'pending',status:'pending'});
  c.SX.sess=[session('one','pending','2026-11-04T18:00:00+01:00'),session('two','stranger','2026-11-04T19:00:00+01:00'),session('mine','me','2026-11-04T20:00:00+01:00')];
  assert.equal(c.sxTodayFriends().length,0);
});
test('includes earlier times today but excludes cancelled and future days',()=>{
  const c=fixture();c.SX.sess=[session('past','a','2026-11-04T07:00:00+01:00'),session('cancel','b','2026-11-04T18:00:00+01:00',{cancelled_at:'2026-11-03T12:00:00Z'}),session('later','b','2026-11-05T18:00:00+01:00')];
  assert.deepEqual(ids(c.sxTodayFriends()),['a']);assert.equal(c.sxListSessions('today').length,0);
});
test('includes an overnight window and excludes one ending exactly at midnight',()=>{
  const c=fixture();c.SX.sess=[session('overnight','a','2026-11-03T23:00:00+01:00',{kind:'window',ends_at:'2026-11-04T01:00:00+01:00'}),session('boundary','b','2026-11-03T22:00:00+01:00',{ends_at:'2026-11-04T00:00:00+01:00'})];
  assert.deepEqual(ids(c.sxDaySessions()),['overnight']);
});
test('uses local calendar day through the 25-hour daylight-saving transition',()=>{
  const c=fixture('2026-10-25T12:00:00+01:00');c.SX.sess=[session('late','a','2026-10-25T23:30:00+01:00'),session('tomorrow','b','2026-10-26T00:00:00+01:00')];
  assert.deepEqual(ids(c.sxDaySessions()),['late']);
});
test('today filter sorts active times and retains only relevant cancellations',()=>{
  const c=fixture();c.SX.sess=[session('late','b','2026-11-04T19:00:00+01:00'),session('cancel-friend','a','2026-11-04T17:00:00+01:00',{cancelled_at:'x'}),session('mine-cancel','me','2026-11-04T16:00:00+01:00',{cancelled_at:'x'}),session('early','a','2026-11-04T15:00:00+01:00')];
  assert.deepEqual(ids(c.sxListSessions('today')),['early','mine-cancel','late']);
});
test('mine filter includes owned and joined times, across days',()=>{
  const c=fixture();c.SX.sess=[session('own','me','2026-11-04T15:00:00+01:00'),session('joined','a','2026-11-05T16:00:00+01:00'),session('other','b','2026-11-04T18:00:00+01:00')];c.SX.part=[{session_id:'joined',user_id:'me'}];
  assert.deepEqual(ids(c.sxListSessions('mine')),['own','joined']);
});
test('upcoming filter excludes today and current overnight windows',()=>{
  const c=fixture();c.SX.sess=[session('today','a','2026-11-04T15:00:00+01:00'),session('overnight','a','2026-11-04T23:00:00+01:00',{kind:'window',ends_at:'2026-11-05T02:00:00+01:00'}),session('tomorrow','b','2026-11-05T16:00:00+01:00')];
  assert.deepEqual(ids(c.sxListSessions('upcoming')),['tomorrow']);
});
test('escapes user names and locations in new summary and cards',()=>{
  const c=fixture();c.SX.ppl.a.display_name='<img src=x onerror=alert(1)>';const s=session('one','a','2026-11-04T18:00:00+01:00',{place:'<script>alert(1)</script>'});c.SX.sess=[s];
  assert.match(c.vSxToday(),/&lt;img/);assert.doesNotMatch(c.vSxToday(),/<img/);assert.match(c.sxCard(s),/&lt;script&gt;/);
});
test('friend card opens detail first and never requests the private workout',()=>{
  const c=fixture();let calls=0;c.mySessFor=()=>{calls++;return{day:'SECRET'};};const s=session('one','a','2026-11-04T18:00:00+01:00',{plan:{}});const html=c.sxCard(s);
  assert.equal(calls,0);assert.doesNotMatch(html,/SECRET|sxjoin:/);assert.match(html,/data-a="sxopen:one"/);
});
test('expired detail is read-only, including no private start-workout action',()=>{
  const c=fixture();c.SX.sess=[session('old','a','2026-11-04T07:00:00+01:00',{plan:{}})];c.SX.part=[{session_id:'old',user_id:'me'}];
  const html=c.vSxSess('old',true);assert.match(html,/Timen er over/);assert.doesNotMatch(html,/sxjoin:|sxplan:|sxstart:|sxleave:|Privat økt/);
});
test('active shared workout retains same/own choices and joined switching',()=>{
  const c=fixture();c.SX.sess=[session('one','a','2026-11-04T18:00:00+01:00',{plan:{}})];
  assert.match(c.vSxSess('one',true),/sxjoin:one:same/);assert.match(c.vSxSess('one',true),/sxjoin:one:own/);
  c.SX.part=[{session_id:'one',user_id:'me',plan:'own'}];assert.match(c.vSxSess('one',true),/sxplan:one:same/);
});
test('friends badge counts incoming requests and pending received programs only',()=>{
  const c=fixture();c.SX.fr.push({requester:'pending',addressee:'me',status:'pending'},{requester:'me',addressee:'out',status:'pending'});
  c.SX.ps=[{recipient:'me',status:'pending'},{recipient:'other',status:'pending'},{recipient:'me',status:'accepted'}];
  assert.match(c.vSxHeader('friends'),/sxtab:friends" aria-pressed="true">Venner <span class="badge" aria-label="2 nye">2/);
});
test('legacy friend links and chat section retain their respective content',()=>{
  const c=fixture();c.ui.sxView='friends';assert.match(c.vTogether(),/FRIENDS/);
  c.ui.sxView='list';c.ui.sxTab='chat';assert.match(c.vTogether(),/CHATS/);
  c.auth=null;assert.equal(c.vTogether(),'SIGNUP');
});
test('no-friends state offers one entry point to adding friends',()=>{
  const c=fixture();c.SX.fr=[];const html=c.vSxList();assert.match(html,/Finn treningsvennene dine/);assert.equal((html.match(/>Finn venner</g)||[]).length,1);
});

test('compact preview keeps half-hour precision and leaves fixed times unchanged',()=>{
  const c=fixture();
  assert.equal(c.sxPreviewTime(session('one','a','2026-11-04T17:00:00+01:00',{kind:'window',ends_at:'2026-11-04T19:00:00+01:00'})),'17–19');
  assert.equal(c.sxPreviewTime(session('two','a','2026-11-04T17:30:00+01:00',{kind:'window',ends_at:'2026-11-04T19:00:00+01:00'})),'17:30–19');
  assert.equal(c.sxPreviewTime(session('three','a','2026-11-04T18:00:00+01:00')),'18:00');
});

test('daily friend preview prefers a current or upcoming time over an expired one',()=>{
  const c=fixture();c.SX.sess=[session('past','a','2026-11-04T07:00:00+01:00'),session('current','a','2026-11-04T11:00:00+01:00'),session('future','a','2026-11-04T18:00:00+01:00')];
  assert.equal(c.sxTodayFriends()[0].session.id,'current');
  c.SX.sess=c.SX.sess.filter(s=>s.id!=='current');assert.equal(c.sxTodayFriends()[0].session.id,'future');
  c.SX.sess=[session('first','a','2026-11-04T06:00:00+01:00'),session('last','a','2026-11-04T08:00:00+01:00')];assert.equal(c.sxTodayFriends()[0].session.id,'last');
});
