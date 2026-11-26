const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
// Git på Windows sjekker ut med CRLF. Uten dette finner ikke split under oppstarten, og hele appen kjører.
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const burgenerHq = fs.readFileSync(path.join(__dirname, '..', '..', 'burgener-hq.js'), 'utf8');
const peteBeginner = fs.readFileSync(path.join(__dirname, '..', '..', 'pete-beginner.js'), 'utf8');
const app = burgenerHq + '\n' + peteBeginner + '\n' + [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1].split('\nrender();\nckRender();')[0];

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
    S.draft=buildSession(prog(S.active.programId),S.active);S.draft.go=Date.now();`);
  const click = action => {
    const b={dataset:{a:action},type:'button',disabled:false};
    for(const fn of listeners.click) fn({target:{closest:()=>b},preventDefault(){}});
  };
  const state = expression => JSON.parse(run(`JSON.stringify(${expression})`));
  const warm = () => run(`S.draft.ex.forEach((e,i)=>{const k=wuKind(S.draft,i);e.wuDone=k?warmups(e.slot,e.sets[0].w,e.sets[0].t,k).map(([w,r])=>w+'x'+r):[];});`);
  const input = (dataset,value) => {for(const fn of listeners.input||[])fn({target:{dataset,value}});};
  return {run,click,input,state,warm,followed,storage,nodes,advance:ms=>{now+=ms;}};
}


module.exports={fixture};
