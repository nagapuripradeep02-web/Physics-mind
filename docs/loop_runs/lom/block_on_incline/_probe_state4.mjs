import { chromium } from 'playwright';
const URL='http://localhost:8089/block_on_incline/sim.html';
const b=await chromium.launch(); const pg=await b.newPage();
await pg.goto(URL,{waitUntil:'load'});
await pg.waitForFunction(()=>window.PM_nlbEngine!==undefined,null,{timeout:15000}).catch(()=>{});
await pg.waitForTimeout(500);
await pg.evaluate(()=>window.postMessage({type:'SET_STATE',state:'STATE_4'},'*'));
await pg.waitForTimeout(200);
await pg.evaluate(()=>window.postMessage({type:'RESET_TRAJECTORY'},'*'));
await pg.waitForTimeout(120);
const tr=[]; const t0=Date.now();
while(Date.now()-t0<13000){
  const sn=await pg.evaluate(()=>{const e=window.PM_nlbEngine;if(!e)return null;const o={t:Math.round(e.t_ms),th:+e.theta_deg.toFixed(2)};o.b={};
    for(const id of e.order){const x=e.bodies[id];o.b[id]={s:+x.s.toFixed(3),v:+x.v.toFixed(3),a:+x.a.toFixed(3),N:+x.N.toFixed(2),f:+x.f.toFixed(2),stuck:!!x._stuck};}
    const hud={};document.querySelectorAll('[id^="nlb_ro_"]').forEach(el=>{if(el.id.endsWith('_val'))hud[el.id.replace('nlb_ro_','').replace('_val','')]=el.textContent;});
    o.hud=hud;return o;});
  if(sn)tr.push(sn);
  await pg.waitForTimeout(500);
}
for(const r of tr) console.log(`t=${String(r.t).padStart(5)} A[s=${r.b.A.s} v=${r.b.A.v} f=${r.b.A.f} stuck=${r.b.A.stuck}] B[s=${r.b.B.s} v=${r.b.B.v} a=${r.b.B.a} f=${r.b.B.f} stuck=${r.b.B.stuck}]`);
console.log('HUD_LATE='+JSON.stringify(tr[tr.length-1].hud));
await b.close();
