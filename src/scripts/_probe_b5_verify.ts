import sharp from 'sharp';
const R = '.visual_runs/pure_rolling/20260813-233552/'.replace(/\/$/, '');
// Track region crop — same box used for every prior S3 read.
const BOX = { left: 440, top: 300, width: 400, height: 140 };
async function ink(p: string) {
  const { data, info } = await sharp(p).extract(BOX).raw().toBuffer({ resolveWithObject: true });
  // count pixels that are NOT background(dark) and NOT the grey plank:
  // body meshes are saturated (blue wheel / colored). Saturation = max-min.
  let n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (sat > 60 && Math.max(r, g, b) > 90) n++;
  }
  return n;
}
(async () => {
  console.log('=== pure_rolling S3 — body-ink pixels in the track crop (dense frames) ===');
  console.log('windows: locked live [0,1500) | roll live [1500,inf)');
  for (const t of ['00000', '01000', '02000', '03000', '04000']) {
    const n = await ink(`${R}/STATE_3__dense_t${t}.png`);
    console.log(`  t=${t}  ink=${n}px`);
  }
  console.log('--- control: S1 (single body, always live) ---');
  for (const t of ['00000', '02000']) {
    const n = await ink(`${R}/STATE_1__dense_t${t}.png`);
    console.log(`  t=${t}  ink=${n}px`);
  }
})();
