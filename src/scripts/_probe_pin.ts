import '@/lib/loadEnvLocal';
import { chromium } from 'playwright';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function main() {
  const { data, error } = await supabaseAdmin.from('simulation_cache').select('sim_html').eq('concept_key','pure_rolling').single();
  if (error) throw new Error(error.message);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent((data as {sim_html:string}).sim_html, { waitUntil: 'load' });
  await page.waitForFunction(`!!window.PM_nlbEngine`, null, { timeout: 30000 });
  await page.evaluate(`window.postMessage({type:'SET_STATE',state:'STATE_1'},'*')`);
  await page.waitForTimeout(3500);           // let the clock run PAST 1500 first
  const beforeFreeze = await page.evaluate(`window.PM_simTimeMs`);
  await page.evaluate(`window.postMessage({type:'SET_TIME_FREEZE',ms:1500},'*')`);
  await page.waitForTimeout(1200);
  const afterFreeze = await page.evaluate(`window.PM_simTimeMs`);
  console.log('PM_simTimeMs before SET_TIME_FREEZE(1500):', beforeFreeze);
  console.log('PM_simTimeMs after  SET_TIME_FREEZE(1500):', afterFreeze);
  console.log(afterFreeze === 1500 ? 'HONOURED — pin lands at 1500' : 'NOT HONOURED');
  const VIS = `(function(){
    var out=[];
    document.querySelectorAll('div,span').forEach(function(e){
      var t=(e.textContent||'').trim();
      if (!t || t.length>40) return;
      if (/one turn|2.R|v\s*=\s*R/i.test(t)) {
        var cs=getComputedStyle(e);
        if (cs.display!=='none' && cs.visibility!=='hidden' && Number(cs.opacity)>0.01) out.push(t);
      }
    });
    return out.slice(0,6);
  })()`;
  console.log('formula-line text VISIBLE at the rewound t=1500 frame:', JSON.stringify(await page.evaluate(VIS)));
  console.log('(authored at_ms for these lines: 2300 and 2600)');
  await browser.close();
}
main().catch((e) => { console.error('FAILED:', e); process.exit(1); });
