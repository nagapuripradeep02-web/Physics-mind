import sharp from 'sharp';
(async () => {
  for (const [f, o] of [['STATE_3__dense_t01000', 'pr_S3_locked'], ['STATE_3__dense_t03000', 'pr_S3_roll']]) {
    await sharp(`.visual_runs/pure_rolling/20260813-233552/${f}.png`).extract({ left: 440, top: 300, width: 400, height: 140 })
      .resize({ width: 1000, kernel: 'nearest' }).png().toFile(`.visual_runs/_e3_probe/${o}.png`);
  }
  console.log('ok');
})();
