import { chromium } from 'playwright';

const URL = 'http://localhost:8089/block_on_incline/sim.html';
const b = await chromium.launch();
const pg = await b.newPage();
const logs = [];
pg.on('console', m => { if (m.type()==='error') logs.push('CONSOLEERR: '+m.text()); });
pg.on('pageerror', e => logs.push('PAGEERR: '+e.message));
await pg.goto(URL, { waitUntil: 'load' });
// wait for engine machinery
await pg.waitForFunction(() => window.PM_nlbEngine !== undefined || (window.SIM_CONFIG||window.config), null, { timeout: 15000 }).catch(()=>{});
await pg.waitForTimeout(500);

async function setState(s){ await pg.evaluate(st => window.postMessage({type:'SET_STATE', state:st},'*'), s); await pg.waitForTimeout(150); }
async function reset(){ await pg.evaluate(()=> window.postMessage({type:'RESET_TRAJECTORY'},'*')); await pg.waitForTimeout(120); }
async function snap(){ return await pg.evaluate(()=>{ const e=window.PM_nlbEngine; if(!e) return null; const o={t_ms:e.t_ms, theta:e.theta_deg, mode:e.mode, coupled:e.coupled}; o.bodies={}; for(const id of e.order){const x=e.bodies[id]; o.bodies[id]={s:+x.s.toFixed(4),v:+x.v.toFixed(4),a:+x.a.toFixed(4),N:+x.N.toFixed(3),f:+x.f.toFixed(3),Fnet:+x.F_net.toFixed(3),T:+x.T.toFixed(4),stuck:!!x._stuck};} return o; }); }
// read HUD readout DOM text for a body/key
async function hud(){ return await pg.evaluate(()=>{ const out={}; document.querySelectorAll('[id^="nlb_ro_"]').forEach(el=>{ if(el.id.endsWith('_val')){ const lbl=document.getElementById(el.id.replace('_val','_lbl')); out[el.id.replace('nlb_ro_','').replace('_val','')]=(lbl?lbl.textContent:'')+'='+el.textContent; } }); return out; }); }

const R = {};

// ---- STATE_3: the central beat. Sample densely across the ramp. ----
await setState('STATE_3');
await reset();
const trace3=[];
const t0=Date.now();
// let it run in real time up to ~13s, sampling
while(Date.now()-t0 < 13500){
  const sn=await snap();
  if(sn) trace3.push({wall:Date.now()-t0, t:Math.round(sn.t_ms), th:+sn.theta.toFixed(2), s:sn.bodies.A.s, v:sn.bodies.A.v, N:sn.bodies.A.N, f:sn.bodies.A.f, a:sn.bodies.A.a, stuck:sn.bodies.A.stuck});
  await pg.waitForTimeout(250);
}
R.state3_trace = trace3;
R.state3_hud_late = await hud();

// ---- STATE_3 RESET mid-run test ----
// currently body has moved; reset and check rebase
const beforeReset = await snap();
await reset();
await pg.waitForTimeout(60);
const afterReset = await snap();
R.reset_test = { before:{t:Math.round(beforeReset.t_ms), s:beforeReset.bodies.A.s, v:beforeReset.bodies.A.v, th:+beforeReset.theta.toFixed(2)},
                 after:{t:Math.round(afterReset.t_ms), s:afterReset.bodies.A.s, v:afterReset.bodies.A.v, th:+afterReset.theta.toFixed(2)} };

// ---- STATE_2: ramp holds, block never moves, Fnet ~0 ----
await setState('STATE_2');
await reset();
const trace2=[];
const t2=Date.now();
while(Date.now()-t2 < 9500){
  const sn=await snap();
  if(sn) trace2.push({t:Math.round(sn.t_ms), th:+sn.theta.toFixed(2), s:sn.bodies.A.s, v:sn.bodies.A.v, f:sn.bodies.A.f, Fnet:sn.bodies.A.Fnet, stuck:sn.bodies.A.stuck});
  await pg.waitForTimeout(400);
}
R.state2_trace=trace2;
R.state2_hud_late=await hud();

// ---- STATE_4: two bodies, A holds, B accelerates ----
await setState('STATE_4');
await reset();
const trace4=[];
const t4=Date.now();
while(Date.now()-t4 < 9000){
  const sn=await snap();
  if(sn) trace4.push({t:Math.round(sn.t_ms), A:{s:sn.bodies.A.s,v:sn.bodies.A.v,f:sn.bodies.A.f,stuck:sn.bodies.A.stuck}, B:{s:sn.bodies.B.s,v:sn.bodies.B.v,f:sn.bodies.B.f,a:sn.bodies.B.a,stuck:sn.bodies.B.stuck}});
  await pg.waitForTimeout(500);
}
R.state4_trace=trace4;
R.state4_hud_late=await hud();
// HUD rect collision check S4 (Rule 34d)
R.state4_rects = await pg.evaluate(()=>{ const g=id=>{const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect(); return e.style.display==='none'?null:{t:Math.round(r.top),l:Math.round(r.left),b:Math.round(r.bottom),ri:Math.round(r.right)};}; const panel=document.querySelector('#nlb_sliders'); const pr=panel?panel.getBoundingClientRect():null; return {formula:g('nlb_formula'), readout:g('nlb_readout'), sliders:pr?{t:Math.round(pr.top),l:Math.round(pr.left),b:Math.round(pr.bottom),ri:Math.round(pr.right)}:null}; });

// ---- STATE_1 static, ---- 
await setState('STATE_1');
await pg.waitForTimeout(1500);
R.state1_snap = await snap();
R.state1_hud = await hud();

// ---- STATE_5 sandbox: param_ramp must be INERT ----
await setState('STATE_5');
const s5a=await snap();
await pg.waitForTimeout(2500);
const s5b=await snap();
R.state5 = { theta_start:s5a?+s5a.theta.toFixed(2):null, theta_later:s5b?+s5b.theta.toFixed(2):null, moved: s5a&&s5b? Math.abs(s5b.theta-s5a.theta)>0.01 : null };

R.console = logs;
console.log(JSON.stringify(R));
await b.close();
