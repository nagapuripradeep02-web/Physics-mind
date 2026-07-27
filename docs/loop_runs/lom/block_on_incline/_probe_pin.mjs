import { chromium } from 'playwright';
const URL='http://localhost:8089/block_on_incline/sim.html';
const b=await chromium.launch(); const pg=await b.newPage();
await pg.goto(URL,{waitUntil:'load'});
await pg.waitForFunction(()=>window.PM_nlbEngine!==undefined,null,{timeout:15000}).catch(()=>{});
await pg.waitForTimeout(400);
const snap=async()=>await pg.evaluate(()=>{const e=window.PM_nlbEngine;if(!e)return null;const o={t:Math.round(e.t_ms),th:+e.theta_deg.toFixed(2),bodies:{}};for(const id of e.order){const x=e.bodies[id];const g=(document.getElementById('nlb_ro_'+id+'_f_lbl')||{}).textContent||null;o.bodies[id]={s:+x.s.toFixed(3),v:+x.v.toFixed(3),a:+x.a.toFixed(3),f:+x.f.toFixed(2),stuck:!!x._stuck,bas:!!x._boundArrestedSliding,glyph:g};}return o;});
await pg.evaluate(()=>window.postMessage({type:'SET_STATE',state:'STATE_4'},'*'));
await pg.waitForTimeout(150);
await pg.evaluate(()=>window.postMessage({type:'RESET_TRAJECTORY'},'*'));
await pg.waitForTimeout(120);
await pg.evaluate(()=>window.postMessage({type:'SET_TIME_FREEZE',at_ms:7100},'*'));
// wait long enough for virtual time to reach 7100 and pin
await pg.waitForTimeout(9000);
const p1=await snap();
await pg.waitForTimeout(1500);
const p2=await snap();  // byte-stability check: p1 == p2 when pinned
console.log('PIN_reached='+JSON.stringify(p1));
console.log('PIN_stable_1.5s_later='+JSON.stringify(p2));
console.log('STABLE='+(JSON.stringify(p1.bodies)===JSON.stringify(p2.bodies)&&p1.t===p2.t));
await b.close();
