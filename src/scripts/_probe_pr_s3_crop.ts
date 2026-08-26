import sharp from 'sharp';
import { readdirSync } from 'node:fs';
const base = '.visual_runs/pure_rolling';
const runs = readdirSync(base).sort();
const run = `${base}/${runs[runs.length - 1]}`;
(async () => {
  console.log('run:', run);
  for (const f of ['dense_t00000', 'dense_t02000', 'frozen']) {
    await sharp(`${run}/STATE_3__${f}.png`)
      .extract({ left: 440, top: 300, width: 400, height: 140 })
      .resize({ width: 1000, kernel: 'nearest' }).png()
      .toFile(`.visual_runs/_e3_probe/roi_pr_S3_${f}.png`);
  }
  console.log('ok');
})();
