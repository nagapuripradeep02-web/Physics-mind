// build_onboarding_audio.ts — renders the first-login tour's English narration
// clips (one per step) with Sarvam (bulbul:v3 / priya), reusing the exact client
// from generate_tts_audio.ts. Output: review-site/onboarding/step-NN.mp3.
//
// The pm-tour.js controller plays /onboarding/step-NN.mp3 as each spotlight opens.
// If SARVAM_API_KEY is absent (trial key unfunded), we write short SILENT mp3s so
// the whole tour flow is testable locally before Sarvam is funded — pm-tour.js
// tolerates missing/silent audio either way (play() failures are swallowed).
//
// Usage:
//   npx tsx --env-file=.env.local src/scripts/build_onboarding_audio.ts [--force]
//
// Rule 30: colour words stay English (this narration is English), symbols are
// spoken naturally. These are UI instructions, not physics — no symbol expansion.

import '@/lib/loadEnvLocal';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { sarvamTts, wavToMp3 } from './generate_tts_audio';

const OUT_DIR = join(process.cwd(), 'review-site', 'onboarding');
const MODEL = 'bulbul:v3';
const SPEAKER = 'priya';

// One spoken line per tour step, in the same order as STEPS in pm-tour.js.
const LINES: string[] = [
  "On the left is your state rail. Every card is one state of the lesson. Click any card to jump straight to that moment.",
  "Drag any card up or down to reorder the states, so the lesson flows the way you like to teach.",
  "Double-click a state's title to rename it in your own words.",
  "Every state has a three-dot menu. Open it and press Hide to skip a state you're not teaching today.",
  "The state you hid drops into this Hidden list at the bottom of the rail. Nothing is deleted, it is just tucked away.",
  "To bring it back, open the three-dot menu on the hidden state and press Unhide. Your states return whenever you want them.",
  "Happy with your layout? Press Save to keep your order, names, and hidden states for next time. Default puts everything back.",
  "Tap the simulation anytime to pause it in the middle of a motion, and tap again to resume. It is perfect for stopping on a key frame to explain.",
  "Switch to Draw to annotate right on the three-D picture. Move lets you rotate and zoom it, and Clear wipes your marks.",
  "Along the bottom you can play or replay the state, mute or unmute the narration, change the language, and adjust the speed.",
  "Scrub the timeline here, or use the arrows and your keyboard to step between the states.",
  "Open the whiteboard on the right to work through problems by hand. You get a pen, highlighter, eraser, and colours.",
  "That is the tour! You can reopen it anytime from the Tour link at the top right. Happy teaching!",
];

function stepFile(i: number): string {
  const n = (i + 1 < 10 ? '0' : '') + (i + 1);
  return join(OUT_DIR, `step-${n}.mp3`);
}

/** A short silent mp3 via ffmpeg (already required by wavToMp3), used as a
 *  placeholder until Sarvam is funded. */
function writeSilent(path: string, seconds = 1.2): void {
  const res = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-loglevel', 'error', '-y',
     '-f', 'lavfi', '-i', `anullsrc=r=22050:cl=mono`,
     '-t', String(seconds), '-codec:a', 'libmp3lame', '-q:a', '9', path],
    { maxBuffer: 8 * 1024 * 1024 },
  );
  if (res.status !== 0 || !existsSync(path)) {
    // Last-resort: an empty file. pm-tour.js swallows a failed play().
    writeFileSync(path, Buffer.alloc(0));
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  mkdirSync(OUT_DIR, { recursive: true });

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.warn('⚠  SARVAM_API_KEY not set — writing SILENT placeholder clips. Fund Sarvam then re-run to voice them.');
  }

  let voiced = 0, placeholder = 0, skipped = 0;
  for (let i = 0; i < LINES.length; i++) {
    const out = stepFile(i);
    if (existsSync(out) && !force) { skipped++; continue; }

    if (apiKey) {
      try {
        const wav = await sarvamTts(LINES[i], 'en-IN', apiKey, MODEL, SPEAKER);
        writeFileSync(out, wavToMp3(wav));
        voiced++;
        console.log(`  ✓ step-${(i + 1 < 10 ? '0' : '') + (i + 1)}.mp3 (voiced)`);
        continue;
      } catch (err) {
        console.error(`  ✗ Sarvam failed on step ${i + 1}: ${err instanceof Error ? err.message : err} — writing silent placeholder`);
      }
    }
    writeSilent(out);
    placeholder++;
  }

  console.log(`\n🔊 onboarding audio → ${OUT_DIR}`);
  console.log(`   ${voiced} voiced, ${placeholder} silent placeholder(s), ${skipped} skipped (use --force to re-render).`);
}

main().catch((err) => {
  console.error('💥 build_onboarding_audio failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
