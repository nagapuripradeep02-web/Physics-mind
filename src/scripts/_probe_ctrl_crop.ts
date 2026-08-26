import sharp from 'sharp';
import { readdirSync } from 'node:fs';
const base = '.visual_runs/rolling_friction';
const runs = readdirSync(base).sort();
const run = `${base}/${runs[runs.length - 1]}`;
(async () => {
  console.log('run:', run);
  await sharp(`${run}/STATE_1__frozen.png`)
    .extract({ left: 440, top: 300, width: 400, height: 140 })
    .resize({ width: 1000, kernel: 'nearest' }).png()
    .toFile('.visual_runs/_e3_probe/roi_ctrl_rf_S1.png');
  console.log('ok');
})();
