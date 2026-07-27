import { chromium } from 'playwright';
const URL='http://localhost:8089/block_on_incline/sim.html';
const b=await chromium.launch(); const pg=await b.newPage();
const errs=[];
pg.on('console',m=>{if(m.type()==='error')errs.push('CERR:'+m.text());});
pg.on('pageerror',e=>errs.push('PERR:'+e.message));
await pg.goto(URL,{waitUntil:'load'});
await pg.waitForFunction(()=>window.PM_nlbEngine!==undefined,null,{timeout:15000}).catch(()=>{});
await pg.waitForTimeout(400);

const setState=async s=>{await pg.evaluate(st=>window.postMessage({type:'SET_STATE',state:st},'*'),s);await pg.waitForTimeout(180);};
const reset=async()=>{await pg.evaluate(()=>window.postMessage({type:'RESET_TRAJECTORY'},'*'));await pg.waitForTimeout(120);};
const freeze=async at=>{await pg.evaluate(a=>window.postMessage({type:'SET_TIME_FREEZE',at_ms:a},'*'),at);await pg.waitForTimeout(250);};
const unfreeze=async()=>{await pg.evaluate(()=>window.postMessage({type:'SET_TIME_FREEZE',frozen:false},'*'));await pg.waitForTimeout(120);};
// read engine + friction label glyph + HUD row text per body
const snap=async()=>await pg.evaluate(()=>{
  const e=window.PM_nlbEngine;if(!e)return null;
  const o={t:Math.round(e.t_ms),th:+e.theta_deg.toFixed(2),mode:e.mode,coupled:e.coupled,bodies:{}};
  for(const id of e.order){const x=e.bodies[id];
    const glyph=(document.getElementById('nlb_ro_'+id+'_f_lbl')||{}).textContent||null;
    const fval=(document.getElementById('nlb_ro_'+id+'_f_val')||{}).textContent||null;
    const aval=(document.getElementById('nlb_ro_'+id+'_a_val')||{}).textContent||null;
    const vval=(document.getElementById('nlb_ro_'+id+'_v_val')||{}).textContent||null;
    o.bodies[id]={s:+x.s.toFixed(3),v:+x.v.toFixed(3),a:+x.a.toFixed(3),N:+x.N.toFixed(2),f:+x.f.toFixed(2),stuck:!!x._stuck,bas:!!x._boundArrestedSliding,glyph,hud:`${glyph}=${fval} a=${aval} v=${vval}`};}
  return o;});

const R={};

// ===== (b) STATE_4 frozen pin at 7100ms — must be MID-SLIDE for B =====
await setState('STATE_4'); await reset();
await freeze(7100);
R.s4_pin7100=await snap();
await unfreeze();

// ===== (a) STATE_4 live: A holds fs; B slides fk then bound-halts, must NOT flip to fs =====
await setState('STATE_4'); await reset();
const tr4=[]; const t4=Date.now();
while(Date.now()-t4<12000){const sn=await snap();if(sn)tr4.push({t:sn.t,A:sn.bodies.A,B:sn.bodies.B});await pg.waitForTimeout(450);}
R.s4_trace=tr4;

// ===== (c) STATE_3 unregressed: theta 0->35 monotonic, stuck until tan=mu_s, then slide =====
await setState('STATE_3'); await reset();
const tr3=[]; const t3=Date.now();
while(Date.now()-t3<13000){const sn=await snap();if(sn){const A=sn.bodies.A;tr3.push({t:sn.t,th:sn.th,s:A.s,v:A.v,a:A.a,N:A.N,f:A.f,stuck:A.stuck,glyph:A.glyph});}await pg.waitForTimeout(400);}
R.s3_trace=tr3;

// ===== (d) STATE_5 sandbox at theta=35: check v=0 with nonzero-a symptom + latch =====
await setState('STATE_5');
// drive theta to 35 via param if slider exists; sample the resting body readouts
await pg.evaluate(()=>{const e=window.PM_nlbEngine;if(e){e.theta_deg=35;}});
await pg.waitForTimeout(200);
const s5=[]; const t5=Date.now();
while(Date.now()-t5<4000){const sn=await snap();if(sn)s5.push({t:sn.t,th:sn.th,bodies:sn.bodies});await pg.waitForTimeout(500);}
R.s5_trace=s5;

// ===== (e) STATE_1 / STATE_2 no regression =====
await setState('STATE_1'); await pg.waitForTimeout(1200); R.s1=await snap();
await setState('STATE_2'); await reset();
const tr2=[]; const t2=Date.now();
while(Date.now()-t2<9500){const sn=await snap();if(sn){const A=sn.bodies.A;tr2.push({t:sn.t,th:sn.th,s:A.s,v:A.v,f:A.f,stuck:A.stuck,glyph:A.glyph});}await pg.waitForTimeout(500);}
R.s2_trace=tr2;

R.errs=errs;
console.log(JSON.stringify(R));
await b.close();
