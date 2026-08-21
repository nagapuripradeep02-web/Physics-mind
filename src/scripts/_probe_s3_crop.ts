import sharp from 'sharp';
const O='.visual_runs/_e3_probe';
(async () => {
  await sharp('.visual_runs/rolling_on_incline/20260806-011600/STATE_3__frozen.png')
    .extract({ left: 555, top: 320, width: 200, height: 95 })
    .resize({ width: 1000, kernel: 'nearest' }).png().toFile(`${O}/roi_S3_frozen.png`);
  await sharp('.visual_runs/rolling_on_incline/20260806-011600/STATE_3__dense_t00000.png')
    .extract({ left: 555, top: 320, width: 200, height: 95 })
    .resize({ width: 1000, kernel: 'nearest' }).png().toFile(`${O}/roi_S3_t0.png`);
  console.log('ok');
})();
