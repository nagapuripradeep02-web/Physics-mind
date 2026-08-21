import sharp from 'sharp';
const D = '.visual_runs/_e3_probe';
async function crop(src: string, out: string) {
  await sharp(src).extract({ left: 520, top: 320, width: 260, height: 90 })
    .resize({ width: 1040, kernel: 'nearest' }).png().toFile(out);
}
(async () => {
  await crop(`${D}/S1_before_R0.25.png`, `${D}/crop_before.png`);
  await crop(`${D}/S1_after_R0.5.png`, `${D}/crop_after.png`);
  console.log('cropped');
})();
