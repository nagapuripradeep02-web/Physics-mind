import sharp from 'sharp';
import { readdirSync } from 'node:fs';
const base = '.visual_runs/rolling_on_incline';
const runs = readdirSync(base).sort();
const run = `${base}/${runs[runs.length - 1]}`;
(async () => {
  console.log('run:', run);
  for (const f of ['dense_t00000', 'dense_t02000']) {
    await sharp(`${run}/STATE_1__${f}.png`)
      .extract({ left: 500, top: 300, width: 300, height: 130 })
      .resize({ width: 1050, kernel: 'nearest' }).png()
      .toFile(`.visual_runs/_e3_probe/e11_S1_${f}.png`);
  }
  console.log('ok');
})();
