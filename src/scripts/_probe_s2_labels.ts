import sharp from 'sharp';
const R = '.visual_runs/pure_rolling/20260806-024318';
(async () => {
  for (const [f, box] of [
    ['STATE_2__frozen', { left: 540, top: 300, width: 260, height: 110 }],
    ['STATE_8__frozen', { left: 540, top: 300, width: 260, height: 110 }],
  ] as const) {
    await sharp(`${R}/${f}.png`).extract(box)
      .resize({ width: 1040, kernel: 'nearest' }).png()
      .toFile(`.visual_runs/_e3_probe/lbl_${f}.png`);
  }
  console.log('ok');
})();
