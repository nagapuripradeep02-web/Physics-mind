import sharp from 'sharp';
(async () => {
  for (const [f, box, o] of [
    ['STATE_1__dense_t04000', { left: 480, top: 280, width: 360, height: 170 }, 'roi_S1_finish'],
    ['STATE_5__frozen',       { left: 480, top: 280, width: 360, height: 170 }, 'roi_S5_finish'],
  ] as const) {
    await sharp(`.visual_runs/rolling_on_incline/20260813-233854/${f}.png`).extract(box)
      .resize({ width: 1080, kernel: 'nearest' }).png().toFile(`.visual_runs/_e3_probe/${o}.png`);
  }
  console.log('ok');
})();
