import sharp from 'sharp';
const A = '.visual_runs/pure_rolling/20260806-023916';
const B = '.visual_runs/pure_rolling/20260806-024318';
const PRE = '.visual_runs/pure_rolling/20260806-012044';
async function diff(p1: string, p2: string) {
  const [a, b] = await Promise.all([
    sharp(p1).raw().toBuffer({ resolveWithObject: true }),
    sharp(p2).raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (a.data.length !== b.data.length) return -1;
  let n = 0;
  for (let i = 0; i < a.data.length; i += a.info.channels) {
    if (Math.abs(a.data[i] - b.data[i]) > 8 ||
        Math.abs(a.data[i + 1] - b.data[i + 1]) > 8 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 8) n++;
  }
  return (100 * n) / (a.info.width * a.info.height);
}
(async () => {
  console.log('--- pre-E11 vs post-E11 (did E11 change pure_rolling visibly?) ---');
  for (const s of [1, 4, 7]) {
    const fz = await diff(`${PRE}/STATE_${s}__frozen.png`, `${A}/STATE_${s}__frozen.png`);
    const d0 = await diff(`${PRE}/STATE_${s}__dense_t00000.png`, `${A}/STATE_${s}__dense_t00000.png`);
    console.log(`STATE_${s}: frozen ${fz.toFixed(3)}%  |  dense_t0 ${d0.toFixed(3)}%   (tolerance 2.0%)`);
  }
})();
