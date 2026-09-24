/**
 * record_reel.ts — turn the Answer Book into a 1080×1920 Instagram Reel.
 *
 *   npm run reel -- --q ts_ipe_p1_mp_projectile_motion
 *   npm run reel -- --q <id> --shot answer --out answer-book/tools/out/insta/p1.mp4
 *   npm run reel -- --shot door            # the door + group pick, no question
 *   npm run reel -- --q <id> --speed 4     # 52s of real writing -> a 13s Reel
 *   npm run reel -- --q <id> --shot figure --hold-ms 2000 --instant-scroll --hide ".btn-next,.vidi-fab,#questionMeta>.chip.asked"
 *                                          # a PHASED figure: every tap lands at a pause, then Restart;
 *                                          # --instant-scroll = no frame taken around a product scroll
 *                                          #   (the sticky header composited 100-240 px low for ~160 ms)
 *   npm run reel -- --q <maths id> --shot ask_line --line "PQ = OQ - OP" --ask "Why do we subtract OP here?" \
 *                   --dir answer-book/dist-mpc --hide "#btnAccount,.vidi-fab,#questionMeta>.chip.asked"
 *                                          # hold ONE written line, Ask Vidi about this, the real reply
 *                                          # (the build needs ANSWER_BOOK_VIDI_BASE, see `ask_line`)
 *   npm run reel -- --q <id> --shot revise_loop --day 1 --dir answer-book/dist-mpc --track mpc/first_year/mpc \
 *                   --subject mathematics --unit mathematics-6 --section VSAQ --instant-scroll --hide ".vidi-fab"
 *                                          # the understood → revised loop; --day 2 is the next calendar date
 *
 * SPEED IS A POST STEP, NEVER A SHORTER SHOT. The answer writes itself at the
 * pace a STUDENT reads along with, and each step's marks land in the margin only
 * when its writing finishes — so the recorder waits for that (waitWritten) and a
 * full LAQ runs ~50s. Cutting steps to fit Instagram would film a different,
 * lesser product. Instead the whole thing is captured and time-lapsed in ffmpeg:
 * every step still lands, it just lands fast, which is the energy the shot wants
 * anyway. --speed 1 keeps the real pace for a website loop or a teacher demo.
 *
 * WHY THIS EXISTS. A screen recording of Chrome's device-mode frame captures
 * only 360×640 REAL pixels on a 1080p monitor; blown up to Instagram's 1080×1920
 * it goes soft, and on a product made of text that reads as cheap. Here the page
 * is rendered at deviceScaleFactor 3 — 360×640 CSS px × 3 = 1080×1920 exactly —
 * and every frame is captured at that native size. No upscaling anywhere in the
 * chain, and the script refuses to mux if that ever stops being true.
 *
 * NOT `Page.startScreencast`. That was the first implementation and it is a trap:
 * the screencast delivers frames at the CSS viewport size (measured: 360×640)
 * regardless of deviceScaleFactor, so muxing it up to 1080×1920 is a 3× upscale
 * wearing a native-resolution label. `page.screenshot()` DOES honour the device
 * scale factor, so it is what runs here — slower per frame, but every pixel real.
 * The frame size is ASSERTED below, not assumed, because this is precisely the
 * kind of mistake that ships looking fine and reads as cheap on a phone.
 *
 * THE DEVICE IS MARKED TEAM BEFORE THE FIRST BYTE LOADS. `pm_internal` is set in
 * an init script, which is the ONE reliable path (docs/notes/
 * ANSWER_BOOK_ANALYTICS_RUNBOOK.md — the bot user-agent net misses modern headless
 * Chrome). Recording a Reel must never land in the student numbers; 45 of the
 * first 80 ledger rows were exactly this mistake made by hand. Recording the LOCAL
 * build (the default) is belt AND braces: a localhost origin is independently
 * classified `answerbook_local` server-side.
 *
 * TIMING IS REAL, NOT ASSUMED. Frames come back whenever screenshot() returns,
 * which is not a steady rate, so each is stamped and they are muxed through
 * ffmpeg's concat demuxer with per-frame durations before being resampled to a
 * constant output rate. Numbering the frames and declaring them 30fps would slew
 * the shot against the step reveals, which are the whole point of it.
 */
import { chromium, type Browser, type Page } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/** 360×640 at DPR 3 is 1080×1920 — the Reels/Stories canvas, to the pixel. It is
    also a real budget-Android size, which is what most IPE students hold. */
// 360x640 (x3 = 1080x1920) is the Reel default; --viewport WxH overrides it for a
// film plate whose drawn phone is a different shape (e.g. 360x878 for a 19.5:9
// screen — still x3, still asserted below, still no upscaling anywhere).
const VIEWPORT = (() => {
    const v = process.argv.find((a) => a.startsWith('--viewport='))?.slice('--viewport='.length)
        ?? (process.argv.includes('--viewport') ? process.argv[process.argv.indexOf('--viewport') + 1] : '');
    const m = /^(\d+)x(\d+)$/.exec(v ?? '');
    return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 360, height: 640 };
})();
const DPR = 3;
/** --instant-scroll: how long the page must have been still after a product
    scroll before the next frame is taken. The displaced-header frames lasted
    2 captures ≈ 160 ms (V06_HEART); 220 ms clears them with one capture to spare. */
const SCROLL_SETTLE_MS = 220;

/** Port 8100 is not arbitrary: it is in every Edge Function's AB_ALLOWED_ORIGINS
    and in the LOCAL_ORIGINS subset that classifies the ledger row as
    `answerbook_local`. Serving on another port silently leaves that allowlist. */
const PORT = 8100;
const LIVE_URL = 'https://answers.viditra.co';
/** The UNGATED artifact, deliberately. In a gated build every question carries
    `gated: true`, so `loadQuestion` returns early into `Gate.showLockFlow`, which
    fetches the answer bundle from a Supabase Edge Function — and `openQuestion`'s
    `syncHash()` then writes a hash built from the STALE boot question, whose
    hashchange re-routes. Net effect: whether the page ever renders depends on a
    live network round-trip, so a recording either times out after 30 s or flashes
    a paywall sheet into frame. Both were observed. `answer-book/dist` ships every
    answer body in the artifact (`gated: 0`, `PM_SYNC_BASE: ""`), so a shot is
    deterministic and offline. `--dir` still overrides for a gate-flow demo. */
const DEFAULT_DIR = 'answer-book/dist';

type Beat =
    | { do: 'wait'; ms: number }
    | { do: 'openQuestion'; id: string }
    | { do: 'revealNext' }
    // A tap sent WHILE the step is still writing. The button reads "Finish this
    // step now" during a write, so this is the product's own shortcut, not a
    // race: `afterMs` is how long the strokes are allowed to be watched first.
    | { do: 'tapWhileWriting'; afterMs: number }
    | { do: 'click'; selector: string }
    // Vidi's chips and the triage links carry no ids — they are built from text,
    // so text is how a shot names them.
    | { do: 'clickText'; selector: string; text: string }
    | { do: 'select'; selector: string; value: string }
    | { do: 'type'; selector: string; text: string; perCharMs?: number }
    // A filmable scroll. `scrollTo` hands the browser a ~300 ms smooth scroll,
    // which at this capture rate is two or three frames — a jump cut, not a pan.
    | { do: 'pan'; to: number; ms: number }
    | { do: 'scrollTo'; y: number }
    | { do: 'openVidi' }
    | { do: 'waitWritten'; maxMs?: number }
    | { do: 'waitFor'; selector: string; maxMs?: number }
    | { do: 'waitReply'; maxMs?: number }
    // ── the phased-figure beats (--shot figure) ──────────────────────────────
    // Reveal N steps OFF camera, instantly: the e2e's own trick — revealNext()
    // starts a step, a second revealNext() 60 ms later is "Finish this step now"
    // (typeLines.finish is synchronous), and `pm:step-revealed` says it landed.
    // Default N = every step before the first `kind: 'diagram'` step.
    | { do: 'revealInstant'; count?: number }
    // Block until the figure sits at its k-th `pause` (0-based) with every
    // element before it fully drawn. `playFigure` writes the pause's caption in
    // the same synchronous call that sets `waiting = true`, so the caption text
    // is a truthful outside read of "at pause k" — and a tap sent any earlier
    // would complete the phase instantly (the impatience path), which is the
    // one thing this shot must never film.
    | { do: 'waitPhase'; pause: number; maxMs?: number }
    // The tap that starts the next phase — the same code path as a thumb on the
    // page (advance() → finishCurrent() → resume), stamped where the thumb lands.
    | { do: 'tapFigure' }
    // Bring an element back into frame with the eased pan, or do nothing if it
    // already is. Used before Restart: completing the answer scrolls the Total
    // block into view, which may leave the figure off-screen.
    | { do: 'panTo'; selector: string; ms: number }
    // A thumb held on a written line (`--shot ask_line`). DragAsk's touch route
    // is a pointerdown that stays put for 450 ms (notebook.js `pressTimer`);
    // Playwright's `tap()` lifts at once, so this is a CDP touchStart, a real
    // hold, then touchEnd. The line is named by its TEXT (dashes normalised),
    // panned into frame first so the thumb lands where a student's would.
    | { do: 'longPress'; text: string; holdMs?: number }
    // Ease the page so that line sits `frac` of the viewport down (setup use).
    | { do: 'panToLine'; text: string; frac: number; ms: number }
    // The bar's `Ask Vidi about this` — the product's own button, a real click.
    | { do: 'tapBarAsk' }
    // Ease the Vidi thread so the reply's sentence containing `text` is in
    // view. The thread is its own scroll box, so `pan` (window scroll) cannot.
    | { do: 'scrollThread'; text: string; ms: number }
    // ── the revise-loop beats (--shot revise_loop) ───────────────────────────
    // A catalog card, by its question id: the REAL click on the card (it is an
    // <a href="#/q/...">, the router's own path), then the same two-condition
    // wait as `openQuestion`. Only after `panTo` has put the card in frame, so
    // the click never scroll-jerks the picture.
    | { do: 'tapCard'; id: string }
    // The leave-question sheet (notebook.js `showAsk`): wait for it, let it be
    // read for `readMs`, tap its Yes, stamp the confirmation line the sheet
    // swaps in, and wait out the app's own 1.1 s close. Never `Not yet` — the
    // reel does not film it (script §Product frames).
    | { do: 'answerAsk'; readMs: number }
    // Bring an element to the middle of the viewport in ONE step (or to the
    // top with `top: true`). Unlike `pan`/`panTo` it does not set
    // `__pmPanning`, so under --instant-scroll the settle guard takes no frame
    // around it: the sticky header drifts 76–82 px during an eased window
    // scroll (V08_REVISE v1 review, measured on every app frame), and a pan
    // is exempt from the guard by design. On camera it reads as a cut.
    | { do: 'jumpTo'; selector: string; top?: boolean };

/** What a shot may be pointed at. Everything is a flag with a default, so a shot
    stays data and the film's beats are recorded by name rather than by hand. */
interface ShotOpts {
    questionId: string;
    reveals: number;
    /** 1-based reveal index to interrupt mid-write (0 = let every step finish). */
    midwrite: number;
    /** `#subjectSelect` value — a SUBJ_LABEL key, e.g. `physics_2`. */
    subject: string;
    /** `#unitSelect` value — a unitKey, e.g. `physics_2-1`. */
    unit: string;
    /** The free-text question typed into Vidi (`--shot vidi_ask`, needs --live). */
    ask: string;
    /** The chip to tap by its label (`--shot vidi_chip`). */
    chip: string;
    /** `--shot figure`: how long the drawn phase is held on screen before the
        tap that starts the next one — the pause a student uses to copy it. */
    holdMs: number;
    /** `--shot figure`: the number of `pause` elements in the card's first
        diagram step, read from the artifact (0 when the card has no phased figure). */
    phases: number;
    /** `--shot ask_line`: the written line the thumb holds, by a fragment of its
        text (`--line "PQ = OQ - OP"`; any dash matches the page's minus sign). */
    line: string;
    /** `--shot revise_loop`: which day of the loop (`--day 1|2`). */
    day: number;
    /** `--shot revise_loop`: the card's paper section chip (`--section VSAQ`). */
    section: string;
    /** The number of steps in the card's answer, read from the artifact — how
        many reveals complete it (0 when the card is not in the build). */
    steps: number;
}

interface Shot {
    describe: string;
    beats: (opts: ShotOpts) => Beat[];
    /** Beats that run BEFORE the first frame is captured and are never stamped
        into the sidecar — how a shot arrives at its starting state (a card read
        up to its figure) without filming the walk there. */
    setup?: (opts: ShotOpts) => Beat[];
    /** The route to LOAD, when the shot does not start at the door/catalog.
        A shot that opens in the notebook navigates straight to `#/q/<id>` — the
        deep-link path a forwarded answer arrives on, which the router lets
        through ahead of the door. It also keeps the gate's bundle fetch off the
        clock: writing the hash in-page after boot means competing with the
        capture loop for the main thread, which on the LIVE (gated) build left
        `.page` hidden past a 30 s timeout. Measured — the same sequence without
        capture running resolves in ~2 s. */
    startAt?: (opts: ShotOpts) => string;
    /** localStorage keys written before the FIRST byte loads (an init script,
        like `pm_internal`) — how a shot starts on a device that already has a
        history, e.g. a question ticked yesterday. */
    storage?: (opts: ShotOpts) => Record<string, string>;
}

/** A calendar date `days` from today, in the app's own `todayStr()` shape. */
function ymd(days: number): string {
    const d = new Date(Date.now() + days * 86_400_000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** Shots are DATA, so a month of Reels is a loop over ids rather than a month of
    hand-recording. Each beat is one thing a student does. */
const SHOTS: Record<string, Shot> = {
    answer: {
        startAt: ({ questionId }) => '#/q/' + encodeURIComponent(questionId),
        describe: 'open a question and let the answer write itself, step by step',
        beats: ({ questionId, reveals, midwrite }) => [
            { do: 'wait', ms: 900 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 1800 },              // the question card reads first
            // Each step is allowed to finish writing before the next tap — the
            // marks ticking in the margin ARE the shot, and they land at the end
            // of a step, so cutting a step short cuts the beat. --reveals N
            // (default 4) reaches a later step — a card's figure is often the
            // fifth or sixth.
            ...Array.from({ length: reveals }, (_, i): Beat[] => (
                // --midwrite N interrupts the Nth reveal instead of waiting it
                // out: the strokes are watched for 2.6 s, then the product's own
                // "Finish this step now" ends the step at once. One flag, because
                // it is the same shot — a student in a hurry.
                i + 1 === midwrite
                    ? [{ do: 'tapWhileWriting', afterMs: 2600 }, { do: 'wait', ms: 1500 }]
                    // diagram steps draw for longer than 20 s at real pace: give them 45
                    : [{ do: 'revealNext' }, { do: 'waitWritten', maxMs: 45_000 }, { do: 'wait', ms: i === reveals - 1 ? 1600 : 700 }]
            )).flat(),
        ],
    },
    /** The walkthrough's beat 3 — how a student FINDS an answer. The marks tag on
        every card is the point of the pan, so both scrolls are slow enough to
        read at ~8 fps rather than the browser's own 300 ms smooth scroll. */
    catalog: {
        describe: 'pick a subject, pick a chapter, read the marks down the question list, open one',
        beats: ({ questionId, subject, unit }) => [
            { do: 'wait', ms: 1200 },
            { do: 'select', selector: '#subjectSelect', value: subject },
            { do: 'wait', ms: 1200 },
            { do: 'pan', to: 900, ms: 3200 },      // the chapters, in order
            { do: 'wait', ms: 500 },
            // Back to the top BEFORE touching the chapter select. Changing a
            // control that is 900 px off-screen films a list that reorders for
            // no visible reason — and stamps the sidecar with a negative y, so
            // the edit's tap ripple would land outside the frame.
            { do: 'pan', to: 0, ms: 1100 },
            { do: 'wait', ms: 600 },
            { do: 'select', selector: '#unitSelect', value: unit },
            { do: 'wait', ms: 1600 },
            { do: 'pan', to: 1150, ms: 4200 },     // down the question list: LAQ · 8 marks, SAQ · 4, VSAQ · 2
            { do: 'wait', ms: 1200 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 2200 },
        ],
    },
    vidi: {
        startAt: ({ questionId }) => '#/q/' + encodeURIComponent(questionId),
        describe: 'the answer, then Vidi opened from the pill',
        beats: ({ questionId }) => [
            { do: 'wait', ms: 800 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 1800 },
            { do: 'revealNext' }, { do: 'waitWritten' }, { do: 'wait', ms: 600 },
            { do: 'openVidi' }, { do: 'wait', ms: 2600 },
        ],
    },
    /** Beat 7 — a chip. `How to remember?` is rendered only when the step on
        screen HAS a memory_tip, so the shot reveals a step first; and the answer
        is the bank's own deterministic tip, so this shot needs no network. */
    vidi_chip: {
        startAt: ({ questionId }) => '#/q/' + encodeURIComponent(questionId),
        describe: 'open Vidi on a step and tap a suggestion chip',
        beats: ({ questionId, reveals, chip }) => [
            { do: 'wait', ms: 800 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 1600 },
            ...Array.from({ length: reveals }, (): Beat[] => [
                { do: 'revealNext' }, { do: 'waitWritten', maxMs: 45_000 }, { do: 'wait', ms: 500 },
            ]).flat(),
            { do: 'openVidi' }, { do: 'wait', ms: 1600 },
            { do: 'waitFor', selector: '#vidiChips .vidi-chip' },
            { do: 'clickText', selector: '#vidiChips .vidi-chip', text: chip },
            { do: 'wait', ms: 3600 },              // the student's bubble, then the tip
        ],
    },
    /** Beat 8 — a question in the student's own words, answered by the real
        model. `vidiAsk` is inert without VIDI_BASE, so this shot only says
        anything on the hosted build: run it with --live. */
    vidi_ask: {
        startAt: ({ questionId }) => '#/q/' + encodeURIComponent(questionId),
        describe: 'type a question into Vidi and wait for the real reply',
        beats: ({ questionId, reveals, ask }) => [
            { do: 'wait', ms: 800 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 1400 },
            ...Array.from({ length: reveals }, (): Beat[] => [
                { do: 'revealNext' }, { do: 'waitWritten', maxMs: 45_000 }, { do: 'wait', ms: 400 },
            ]).flat(),
            { do: 'openVidi' }, { do: 'wait', ms: 1400 },
            // Typed a character at a time: a filled field pops in, and watching
            // the words appear is what says "in your own words".
            { do: 'type', selector: '#vidiInput', text: ask, perCharMs: 55 },
            { do: 'wait', ms: 700 },
            { do: 'click', selector: '#vidiSend' },
            { do: 'waitReply', maxMs: 45_000 },
            { do: 'wait', ms: 3000 },              // the reply reads
        ],
    },
    /** A PHASED figure, drawn phase by phase — the "watch it drawn" contract
        (docs/ZOOLOGY_START_HERE.md §6). Phase 1 draws on its own once the figure
        step is revealed; every later phase WAITS for a tap, and this shot only
        ever taps at a pause, after `--hold-ms` of the drawn phase on screen. The
        text steps before the figure are revealed off camera (`setup`), so frame 0
        is the ruled page with the figure block centred — the product's own
        `scrollIntoView` on the reveal frames it. Then the labels land, the answer
        completes, and Restart is tapped on camera so the figure clears. Recorded
        at speed 1: the sidecar's phase/tap times are real seconds for an edit
        that time-lapses the drawing but keeps the pauses. The `answer` shot's
        waitWritten cannot do this — `.btn-next` reads "Finish this step now"
        through every pause, so it times out at each boundary. */
    figure: {
        startAt: ({ questionId }) => '#/q/' + encodeURIComponent(questionId),
        describe: 'a phased figure drawn phase by phase — every tap lands at a pause, then Restart',
        setup: ({ questionId }) => [
            { do: 'wait', ms: 600 },
            { do: 'openQuestion', id: questionId },
            { do: 'revealInstant' },                 // the text steps before the figure, off camera
            { do: 'wait', ms: 700 },                 // the last off-camera smooth scroll settles
        ],
        beats: ({ phases, holdMs }) => [
            { do: 'wait', ms: 800 },
            { do: 'revealNext' },                    // the figure step; phase 1 draws by itself
            { do: 'waitPhase', pause: 0, maxMs: 5_000 },
            ...Array.from({ length: Math.max(0, phases - 1) }, (_, k): Beat[] => [
                // phase k+1's strokes landed and the engine is waiting: hold, then tap
                { do: 'waitPhase', pause: k + 1, maxMs: 60_000 },
                { do: 'wait', ms: holdMs },
                { do: 'tapFigure' },
            ]).flat(),
            { do: 'waitWritten', maxMs: 60_000 },    // the last phase (labels) lands: "Answer complete"
            { do: 'wait', ms: holdMs },
            { do: 'panTo', selector: '.step-block[data-kind="diagram"]', ms: 1200 },
            { do: 'wait', ms: 500 },
            { do: 'click', selector: '#btnRestart' },
            { do: 'wait', ms: 1500 },
        ],
    },
    /** Hold ONE written line and ask about it — the drag-to-ask feature on the
        maths papers (DragAsk, touch route). The whole answer is written off
        camera so frame 0 is the finished page; on camera: the line is panned
        under the thumb, held (the clay box draws, the bar `1 part · Ask Vidi
        about this · ×` rises), the bar's button is tapped (the Vidi sheet with
        the line quoted as a card, the input reading `Ask about this part…`),
        the doubt is typed a character at a time, sent, and the REAL reply is
        waited for — then the thread is eased to the reply's rule sentence.
        Needs a build whose PM_VIDI_BASE is set (ANSWER_BOOK_VIDI_BASE at build
        time, or --live): without it `VidiPanel.canQuote()` is false and no box
        ever draws — the shot refuses rather than film a page that ignores the
        thumb. Recorded at speed 1; the sidecar stamps press / bar / tap / ask /
        reply so the edit can cut the model's wait. */
    ask_line: {
        startAt: ({ questionId }) => '#/q/' + encodeURIComponent(questionId),
        describe: 'hold one written line, tap Ask Vidi about this, type the doubt, the real reply',
        setup: ({ questionId, reveals, line }) => [
            { do: 'wait', ms: 600 },
            { do: 'openQuestion', id: questionId },
            { do: 'revealInstant', count: reveals },  // the whole answer, off camera
            { do: 'waitWritten', maxMs: 30_000 },
            { do: 'wait', ms: 900 },                  // the last off-camera scroll settles
            // Completing the answer leaves the page at its Total; frame 0 must
            // be the written lines, so settle just below the line off camera —
            // the on-camera press then pans it a short way up under the thumb.
            { do: 'panToLine', text: line, frac: 0.58, ms: 300 },
            { do: 'wait', ms: 400 },
        ],
        beats: ({ line, ask }) => [
            { do: 'wait', ms: 1200 },                 // the finished page, read
            { do: 'longPress', text: line, holdMs: 750 },
            { do: 'wait', ms: 1600 },                 // the box + the bar, read
            { do: 'tapBarAsk' },
            { do: 'wait', ms: 1600 },                 // the sheet with the quote card
            { do: 'type', selector: '#vidiInput', text: ask, perCharMs: 55 },
            { do: 'wait', ms: 700 },
            { do: 'click', selector: '#vidiSend' },
            { do: 'waitReply', maxMs: 150_000 },      // the model; the edit cuts the wait
            { do: 'wait', ms: 2500 },                 // the reply's first lines read
            { do: 'scrollThread', text: 'rule', ms: 1200 },   // the reply varies; matched case-blind
            { do: 'wait', ms: 3000 },
            { do: 'scrollThread', text: 'earns', ms: 900 },
            { do: 'wait', ms: 3000 },
        ],
    },
    /** The understood → revised loop, as TWO shots of one device (V08_REVISE).
        Day 1 (`--day 1`): the finished answer, `← All questions`, the sheet
        `Did you understand and practice this answer?`, Yes, `Marked in yellow
        — we will revise this one tomorrow.`, and the card's `✓ revise
        tomorrow` pill in the list. Day 2 (`--day 2`): the device already holds
        yesterday's tick (`pm_stage_v1`) and it is the next CALENDAR date — the
        app's own test-only `pm_today_override` key, since a stage tick is a
        date, not a clock (notebook.js `todayStr`). On camera: the `✓ Revise 1`
        chip, tapped, the card's `✓ revise today` pill, the card opened and
        written through, `← All questions`, `Did you revise this answer once
        more?`, `Yes — revised`, `Full green tick — this one is done.`, and the
        list's `✓ done` pill. The catalog is scoped off camera (the subject,
        the chapter, and on day 1 the card's section) so the card sits near the
        top of the list, and every move to it is a one-step `jumpTo` that the
        --instant-scroll settle guard covers (an eased pan filmed the sticky
        header 76–82 px low — V08_REVISE v1). Needs --instant-scroll and a
        multi-stream build's door already chosen: `--track mpc/first_year/mpc`,
        plus `--subject`, `--unit` and `--section` for the card. Recorded at speed 1 — the
        sidecar stamps every tap, the sheet, and its confirmation line, so the
        edit can time-lapse the writing and hold the lines. */
    revise_loop: {
        describe: 'the revise loop — day 1: Yes → yellow tick; day 2: ✓ Revise chip → revised → green tick',
        storage: ({ questionId, day }): Record<string, string> => day === 2
            ? { pm_stage_v1: JSON.stringify({ [questionId]: { u: ymd(0), p: '', r: '' } }), pm_today_override: ymd(1) }
            : {},
        setup: ({ questionId, subject, unit, section, day, steps }) => [
            { do: 'wait', ms: 800 },
            { do: 'select', selector: '#subjectSelect', value: subject },
            { do: 'wait', ms: 500 },
            { do: 'select', selector: '#unitSelect', value: unit },
            { do: 'wait', ms: 500 },
            ...(day === 2 ? [] : [
                // the card's own section, so the list the student returns to
                // opens on it (the filter is kept in memory across the visit)
                { do: 'click', selector: `#qtypeChips [data-qtype="${section}"]` } as Beat,
                { do: 'wait', ms: 400 } as Beat,
                { do: 'openQuestion', id: questionId } as Beat,
                { do: 'revealInstant', count: steps } as Beat,   // the whole answer, off camera
                { do: 'waitWritten', maxMs: 30_000 } as Beat,
                { do: 'wait', ms: 700 } as Beat,
                { do: 'jumpTo', selector: 'body', top: true } as Beat,   // the page from its top: the back button in frame
            ]),
            { do: 'wait', ms: 600 },
        ],
        beats: ({ questionId, section, day, steps }) => {
            const card = `a.cat-card[href="#/q/${encodeURIComponent(questionId)}"]`;
            if (day !== 2) {
                return [
                    { do: 'wait', ms: 1500 },               // the finished answer: `Answer complete — 2 / 2 marks`
                    { do: 'click', selector: '#btnCatalog' },
                    { do: 'answerAsk', readMs: 1800 },      // the sheet, Yes, `Marked in yellow …`
                    { do: 'wait', ms: 700 },
                    { do: 'jumpTo', selector: card },
                    { do: 'wait', ms: 2400 },               // the `✓ revise tomorrow` pill
                ];
            }
            return [
                { do: 'wait', ms: 1500 },                   // the chip row: `✓ Revise 1`
                { do: 'click', selector: '#reviseChip' },
                { do: 'wait', ms: 900 },
                { do: 'jumpTo', selector: card },
                { do: 'wait', ms: 2000 },                   // the `✓ revise today` pill
                { do: 'tapCard', id: questionId },
                { do: 'wait', ms: 1400 },                   // the question card reads
                ...Array.from({ length: steps }, (): Beat[] => [
                    { do: 'revealNext' }, { do: 'waitWritten', maxMs: 45_000 }, { do: 'wait', ms: 600 },
                ]).flat(),
                { do: 'wait', ms: 1000 },                   // `Answer complete`
                { do: 'jumpTo', selector: 'body', top: true },
                { do: 'wait', ms: 400 },
                { do: 'click', selector: '#btnCatalog' },
                { do: 'answerAsk', readMs: 1800 },          // `Did you revise …`, Yes — revised, green tick
                { do: 'wait', ms: 1100 },                   // the list: `✓ Revise 0`, nothing left to revise
                { do: 'click', selector: '#reviseChip' },   // the filter off …
                { do: 'wait', ms: 500 },
                { do: 'click', selector: `#qtypeChips [data-qtype="${section}"]` },   // … and the card's section
                { do: 'wait', ms: 700 },
                { do: 'jumpTo', selector: card },
                { do: 'wait', ms: 2400 },                   // the `✓ done` pill
            ];
        },
    },
    // NO exam-eve shot, deliberately. Both the exam-eve list and Vidi's catalog
    // triage box gate on questions with stars >= 2, and only MATHS units carry
    // any — so on a physics chapter the view renders "Nothing to list yet."
    // A shot that films an empty state is worse than no shot.
    door: {
        describe: 'the door — pick your group, both years',
        beats: () => [
            { do: 'wait', ms: 1400 },
            { do: 'scrollTo', y: 260 }, { do: 'wait', ms: 1400 },
            { do: 'scrollTo', y: 0 }, { do: 'wait', ms: 900 },
        ],
    },
};

function arg(name: string, fallback = ''): string {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
        ? process.argv[i + 1] : fallback;
}
const flag = (name: string): boolean => process.argv.includes('--' + name);

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

/** Serve the built dist ourselves rather than lean on `serve:answers`: that
    script points at a DIFFERENT directory (the offline build), and a recorder
    that silently films the wrong artifact is the same class of mistake as a
    deploy that ships a stale one. */
function serveDist(dir: string): Promise<Server> {
    const root = path.resolve(dir);
    if (!fs.existsSync(path.join(root, 'index.html'))) {
        throw new Error(`no index.html in ${root} — build it first (npm run build:answers:gated:mpc-both)`);
    }
    // A gated artifact is filmable but NOT deterministic (see DEFAULT_DIR). Say
    // so once, loudly, rather than let a 30 s timeout or a paywall in frame be
    // the way it gets discovered.
    if (fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('"gated":true')) {
        console.warn(`  ! ${dir} is a GATED build: answers arrive over the network and a lock\n`
            + '    sheet can appear mid-shot. For film plates use the ungated answer-book/dist.');
    }
    const server = createServer(async (req, res) => {
        const url = (req.url || '/').split('?')[0];
        const rel = url === '/' ? 'index.html' : decodeURIComponent(url).replace(/^\/+/, '');
        const file = path.join(root, rel);
        if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
        try {
            const body = await readFile(file);
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(body);
        } catch { res.writeHead(404).end('not found'); }
    });
    return new Promise((ok) => server.listen(PORT, () => ok(server)));
}

/** Everything a beat did, stamped on the capture clock — written next to the
    mp4 as `<out>.taps.json` so an edit can put a tap ripple exactly where the
    finger would be, cut to a named step, and tick when marks land. Always on:
    it is free and it is data. */
type TakeKind = 'open' | 'tap' | 'written' | 'vidi' | 'pick' | 'chip' | 'ask' | 'reply' | 'nav' | 'phase'
    | 'press' | 'bar' | 'sheet';
type TakeEvent = {
    t: number; kind: TakeKind; label?: string; x?: number | null; y?: number | null;
    /** `jumpTo`: the window scrollY it landed on — the sidecar re-times the
        event to the first FILMED frame at that offset (see the sidecar write). */
    scroll_y?: number;
};
interface Take { t0: number; events: TakeEvent[] }
const stamp = (take: Take) => (Date.now() - take.t0) / 1000;

/** Where a thumb would land on an element, in FRAME pixels. boundingBox is
    viewport-relative and the capture IS the viewport, so ×DPR is direct. */
async function boxOf(page: Page, selector: string): Promise<{ x: number | null; y: number | null }> {
    const box = await (await page.$(selector))?.boundingBox();
    return box ? { x: (box.x + box.width / 2) * DPR, y: (box.y + box.height / 2) * DPR } : { x: null, y: null };
}

/** The element under `selector` whose text contains `text`. Chips and triage
    links are built from strings, so this is the only stable handle they have. */
function byText(page: Page, selector: string, text: string) {
    return page.locator(selector).filter({ hasText: text }).first();
}

async function runBeat(page: Page, b: Beat, take: Take): Promise<void> {
    switch (b.do) {
        case 'wait': await page.waitForTimeout(b.ms); return;
        case 'openQuestion':
            // Through the HASH, which is the router's own path and exactly what
            // tapping a catalog card does (the cards are <a href="#/q/...">).
            // NOT PM_ANSWER.openQuestion(): on a gated build `loadQuestion`
            // returns early into Gate.showLockFlow's async fetch, so the
            // `syncHash()` that follows writes a hash built from the STALE boot
            // question — whose hashchange re-routes to that question instead.
            // Measured: `.page` stayed hidden until a 30 s timeout, twice, and
            // the live site behaves the same way. Routing by hash lets the gate
            // flow complete properly and works on gated and ungated builds alike.
            await page.evaluate((id) => {
                const want = '#/q/' + encodeURIComponent(id);
                if (location.hash !== want) location.hash = want;
            }, b.id);
            // Both conditions, because either alone lies: a stale `.page` from a
            // previous question is visible, and the right question id can be set
            // while its pages are still hidden.
            await page.waitForFunction((id) => {
                const pg = document.querySelector('.page');
                const r = pg?.getBoundingClientRect();
                const q = (window as any).PM_ANSWER?.question;
                return !!r && r.width > 0 && r.height > 0 && q?.question_id === id;
            }, b.id, { timeout: 30_000 });
            take.events.push({ t: stamp(take), kind: 'open', label: b.id });
            return;
        case 'revealNext': {
            // The button's text and box BEFORE the advance: the label names the
            // step this tap opens ("Next: Draw the figure · +1 mark"), the box is
            // where a thumb would land. The advance itself stays a page-API call
            // (advance() never scrolls; a real click could scroll-into-view and
            // jerk the frame). boundingBox is viewport-relative and the capture
            // is the viewport, so ×DPR is frame pixels directly.
            const btn = await page.$('.btn-next');
            const label = ((await btn?.textContent()) ?? '').trim();
            const box = await btn?.boundingBox();
            await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
            take.events.push({
                t: stamp(take), kind: 'tap', label,
                x: box ? (box.x + box.width / 2) * DPR : null,
                y: box ? (box.y + box.height / 2) * DPR : null,
            });
            return;
        }
        case 'tapWhileWriting': {
            // The reveal itself, stamped like any other tap so it ripples.
            const btn = await page.$('.btn-next');
            const label = ((await btn?.textContent()) ?? '').trim();
            const box = await boxOf(page, '.btn-next');
            await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
            take.events.push({ t: stamp(take), kind: 'tap', label, ...box });
            // Watch the strokes for a beat, then use the product's own shortcut.
            await page.waitForTimeout(b.afterMs);
            const still = await page.evaluate(
                () => /^Finish/.test((document.querySelector('.btn-next')?.textContent ?? '').trim()));
            if (!still) {
                // The step finished on its own inside afterMs, so there is nothing
                // to interrupt and the shot did NOT film what it claims to. Say so
                // rather than write a sidecar with a tap that changed nothing.
                console.warn(`  ! tapWhileWriting: the step finished within ${b.afterMs}ms — `
                    + 'nothing to interrupt. Lower --midwrite\'s afterMs or pick a longer step.');
                return;
            }
            // A REAL click here, not revealNext(): "Finish this step now" is a
            // different action from advancing, and it lives on the button.
            const fin = await boxOf(page, '.btn-next');
            await page.click('.btn-next');
            take.events.push({ t: stamp(take), kind: 'tap', label: 'Finish this step now', ...fin });
            await page.waitForFunction(
                () => !/^Finish/.test((document.querySelector('.btn-next')?.textContent ?? '').trim()),
                undefined, { timeout: 20_000 },
            ).catch(() => { /* leave the shot running rather than abort it */ });
            take.events.push({ t: stamp(take), kind: 'written' });
            return;
        }
        case 'click': {
            const box = await boxOf(page, b.selector);
            await page.click(b.selector);
            take.events.push({ t: stamp(take), kind: 'tap', label: b.selector, ...box });
            return;
        }
        case 'clickText': {
            const el = byText(page, b.selector, b.text);
            const bb = await el.boundingBox();
            await el.click();
            take.events.push({
                t: stamp(take), kind: 'chip', label: b.text,
                x: bb ? (bb.x + bb.width / 2) * DPR : null,
                y: bb ? (bb.y + bb.height / 2) * DPR : null,
            });
            return;
        }
        case 'select': {
            const box = await boxOf(page, b.selector);
            await page.selectOption(b.selector, b.value);
            take.events.push({ t: stamp(take), kind: 'pick', label: b.value, ...box });
            return;
        }
        case 'type': {
            const box = await boxOf(page, b.selector);
            await page.click(b.selector);
            // A character at a time: `fill` pops the whole sentence in, and
            // watching the words appear is what says "in your own words".
            await page.type(b.selector, b.text, { delay: b.perCharMs ?? 55 });
            take.events.push({ t: stamp(take), kind: 'ask', label: b.text, ...box });
            return;
        }
        case 'pan': {
            // An eased scroll driven from here, in ~60 steps. `scrollTo`'s smooth
            // behaviour is a ~300 ms browser animation = 2-3 frames at this
            // capture rate, which reads as a jump cut rather than a pan.
            // The easing is INLINE, not a named const: tsx/esbuild annotates a
            // function assigned to a name with its `__name()` helper, which does
            // not exist inside the page — `ReferenceError: __name is not defined`
            // at runtime, invisible at compile time.
            // `__pmPanning` tells the --instant-scroll settle guard that these
            // scrolls are the shot's own and must be filmed, not waited out.
            await page.evaluate(async ({ to, ms }) => {
                const from = window.scrollY;
                const steps = 60;
                (window as any).__pmPanning = true;
                for (let i = 1; i <= steps; i++) {
                    const p = i / steps;
                    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                    window.scrollTo(0, from + (to - from) * e);
                    await new Promise((r) => setTimeout(r, ms / steps));
                }
                (window as any).__pmPanning = false;
            }, { to: b.to, ms: b.ms });
            return;
        }
        case 'scrollTo': await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), b.y); return;
        case 'waitFor': await page.waitForSelector(b.selector, { timeout: b.maxMs ?? 15_000 }); return;
        case 'waitReply': {
            // Vidi's GREETING has already put tutor bubbles in the thread, so
            // waiting for one to exist returns instantly. Count them, then wait
            // for the count to grow with no typing placeholder left.
            const before = await page.evaluate(
                () => document.querySelectorAll('#vidiThread .vidi-msg.tutor:not(.vidi-typing)').length);
            await page.waitForFunction(
                (n) => document.querySelectorAll('#vidiThread .vidi-msg.tutor:not(.vidi-typing)').length > n
                    && !document.querySelector('#vidiThread .vidi-typing'),
                before, { timeout: b.maxMs ?? 45_000 },
            ).catch(() => {
                // The model timed out or the endpoint is unreachable. The shot
                // keeps its frames, but it did not film a reply — say so.
                console.warn('  ! waitReply: no reply arrived. Was this run with --live?');
            });
            const said = await page.evaluate(() => {
                const ms = document.querySelectorAll('#vidiThread .vidi-msg.tutor:not(.vidi-typing)');
                const last = ms[ms.length - 1] as HTMLElement | undefined;
                return last ? (last.innerText ?? last.textContent ?? '').trim() : '';
            }).catch(() => '');
            take.events.push({ t: stamp(take), kind: 'reply', label: said });
            return;
        }
        case 'waitWritten':
            // The answer writes itself line by line; a revealNext() sent while a
            // step is still being written is swallowed, so a fixed 1.5s cadence
            // recorded ONE step and three lost taps. While writing, the advance
            // button reads "Finish this step now"; wait until it does not.
            await page.waitForFunction(
                () => !/^Finish/.test((document.querySelector('.btn-next')?.textContent ?? '').trim()),
                undefined, { timeout: b.maxMs ?? 20_000 },
            ).catch(() => { /* a very long step: move on rather than abort the shot */ });
            take.events.push({ t: stamp(take), kind: 'written' });
            return;
        case 'openVidi':
            // Since 2026-09-02 the panel starts minimised, so the pill is the
            // real way in — film what a student actually taps.
            if (await page.evaluate(() => document.getElementById('pm-assistant-slot')!.hidden)) {
                await page.click('#vidiFab');
            }
            take.events.push({ t: stamp(take), kind: 'vidi' });
            return;
        case 'revealInstant': {
            // How many: every step before the first diagram step, unless told.
            const n = b.count ?? await page.evaluate(() => {
                const api = (window as any).PM_ANSWER;
                const ids: string[] = api.getState().stepIds;
                const steps: any[] = api.question.answer.steps;
                const di = ids.findIndex((id) => steps.find((s) => s.id === id)?.kind === 'diagram');
                return di < 0 ? ids.length - 1 : di;
            });
            for (let i = 0; i < n; i++) {
                // Inline, not a named helper: see `pan` (the __name trap).
                await page.evaluate(() => new Promise<void>((resolve) => {
                    document.addEventListener('pm:step-revealed', () => resolve(), { once: true });
                    (window as any).PM_ANSWER.revealNext();
                    setTimeout(() => (window as any).PM_ANSWER.revealNext(), 60);
                }));
            }
            return;
        }
        case 'waitPhase': {
            // The probe returns the pause's caption (truthy) only when the
            // figure shows it AND every element before that pause is at its
            // final value by COMPUTED style — the inline value is set at the
            // rAF while the transition is still running, the computed one is
            // what is painted. Labels: opacity 1. Ink strokes: dashoffset ~0.
            // Pencil strokes (clip-rect wipe): the rect at its full size.
            const caption = await page.waitForFunction((k: number) => {
                const wrap = document.querySelector('.step-block[data-kind="diagram"] .figure-wrap') as any;
                const fig = wrap?._fig;
                if (!fig) return null;
                const els: any[] = fig.elements;
                let at = -1, seen = -1;
                for (let i = 0; i < els.length; i++) {
                    if (els[i].type === 'pause' && ++seen === k) { at = i; break; }
                }
                if (at < 0) return null;
                const cap = document.querySelector('.figure-caption')?.textContent ?? '';
                if (cap !== (els[at].caption || '')) return null;
                for (let i = 0; i < at; i++) {
                    const e = els[i];
                    if (e.type === 'pause') continue;
                    const n = e._node;
                    if (!n) return null;
                    const cs = getComputedStyle(n);
                    if (e.type === 'label') { if (cs.opacity !== '1') return null; continue; }
                    if (e._clipRect) {
                        const rc = getComputedStyle(e._clipRect);
                        const bb = e._bb || { width: 0, height: 0 };
                        if (parseFloat(rc.width) < bb.width + 7 || parseFloat(rc.height) < bb.height + 7) return null;
                        continue;
                    }
                    if (parseFloat(cs.strokeDashoffset) >= 0.5) return null;
                }
                return cap || ' ';
            }, b.pause, { timeout: b.maxMs ?? 60_000, polling: 100 })
                .then((h) => h.jsonValue() as Promise<string>)
                .catch(() => {
                    // Keep the frames; say the sidecar cannot vouch for this pause.
                    console.warn(`  ! waitPhase ${b.pause}: the figure did not reach that pause in time`);
                    return '';
                });
            take.events.push({ t: stamp(take), kind: 'phase', label: String(caption).trim() });
            return;
        }
        case 'tapFigure': {
            // Where the thumb lands: the figure itself. The advance is the page
            // API (same path as a tap on the notebook: advance → finishCurrent),
            // never page.click — an actionability scroll would jerk the frame.
            const box = await boxOf(page, '.step-block[data-kind="diagram"] .figure-wrap svg');
            const label = await page.evaluate(
                () => (document.querySelector('.figure-caption')?.textContent ?? '').trim());
            await page.evaluate(() => (window as any).PM_ANSWER.revealNext());
            take.events.push({ t: stamp(take), kind: 'tap', label, ...box });
            return;
        }
        case 'panTo': {
            const to = await page.evaluate((sel: string) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                const r = el.getBoundingClientRect();
                // in frame already (below the sticky topbar, above the fold): no pan
                if (r.top >= 110 && r.bottom <= window.innerHeight) return null;
                return window.scrollY + r.top + r.height / 2 - window.innerHeight / 2;
            }, b.selector);
            if (to === null) return;
            await runBeat(page, { do: 'pan', to: Math.max(0, to), ms: b.ms }, take);
            take.events.push({ t: stamp(take), kind: 'nav', label: b.selector });
            return;
        }
        case 'panToLine': {
            // No inner named helper (the __name trap, see `pan`).
            const needle = b.text.replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
            const at = await page.evaluate((n: string) => {
                const lines = Array.from(document.querySelectorAll('.line[data-line-index]')) as HTMLElement[];
                const el = lines.find((l) => (l.textContent ?? '').replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim().includes(n));
                if (!el) return null;
                return { top: el.getBoundingClientRect().top, y: window.scrollY, h: window.innerHeight };
            }, needle);
            if (!at) throw new Error(`panToLine: no written line contains "${b.text}"`);
            const target = at.y + at.top - at.h * b.frac;
            if (Math.abs(target - at.y) > 4) await runBeat(page, { do: 'pan', to: Math.max(0, target), ms: b.ms }, take);
            return;
        }
        case 'longPress': {
            // Refuse, rather than hold a thumb on a page that will ignore it:
            // the boxes exist only when Vidi can take a quote (a chat base is
            // baked in, the page is online, the card is a maths paper).
            // `#notebook.dq-on` is DragAsk.sync()'s own flag, set on every load.
            const can = await page.evaluate(() => document.querySelector('#notebook.dq-on') !== null);
            if (!can) {
                throw new Error('longPress: DragAsk is off on this page — build with '
                    + 'ANSWER_BOOK_VIDI_BASE set (or run --live), and use a maths card');
            }
            // The line, by text. The page writes a real minus sign (U+2212) and
            // the flag is typed on a keyboard, so every dash is folded to '-'.
            const want = b.text.replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim();
            // No inner named helper here or below: see `pan` (the __name trap).
            const found = await page.evaluate((needle: string) => {
                const lines = Array.from(document.querySelectorAll('.line[data-line-index]')) as HTMLElement[];
                const el = lines.find((l) => (l.textContent ?? '').replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim().includes(needle));
                if (!el) return null;
                const r = el.getBoundingClientRect();
                return { text: (el.textContent ?? '').replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim(), top: r.top, bottom: r.bottom, h: r.height };
            }, want);
            if (!found) throw new Error(`longPress: no written line contains "${b.text}"`);
            // Under the thumb: the line a third of the way down the viewport,
            // clear of the sticky topbar and of where the bar will rise.
            await runBeat(page, { do: 'panToLine', text: b.text, frac: 0.38, ms: 900 }, take);
            await page.waitForTimeout(250);
            // The thumb: a CDP touch that stays down. Coordinates are CSS px on
            // the viewport (CDP's frame), the sidecar carries frame px (×DPR).
            const box = await page.evaluate((needle: string) => {
                const lines = Array.from(document.querySelectorAll('.line[data-line-index]')) as HTMLElement[];
                const el = lines.find((l) => (l.textContent ?? '').replace(/[−–—]/g, '-').replace(/\s+/g, ' ').trim().includes(needle))!;
                const r = el.getBoundingClientRect();
                // on the ink, not the margin: 40 % across the line's own width
                return { x: r.left + r.width * 0.4, y: r.top + r.height / 2 };
            }, want);
            const cdp = await page.context().newCDPSession(page);
            const pt = { x: Math.round(box.x), y: Math.round(box.y), radiusX: 6, radiusY: 6, force: 1 };
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
            take.events.push({ t: stamp(take), kind: 'press', label: found.text, x: box.x * DPR, y: box.y * DPR });
            await page.waitForTimeout(b.holdMs ?? 750);
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            await cdp.detach();
            // The bar is the proof the hold landed. Its label is what the sidecar keeps.
            const bar = await page.waitForFunction(() => {
                const el = document.querySelector('.dq-bar') as HTMLElement | null;
                return el && !el.hidden
                    ? Array.from(el.children).map((c) => (c.textContent ?? '').trim()).filter(Boolean).join(' · ')
                    : null;
            }, undefined, { timeout: 4_000 })
                .then((h) => h.jsonValue() as Promise<string>)
                .catch(() => null);
            if (!bar) throw new Error('longPress: the hold did not select the line (no .dq-bar shown)');
            take.events.push({ t: stamp(take), kind: 'bar', label: bar, ...(await boxOf(page, '.dq-bar')) });
            return;
        }
        case 'tapBarAsk': {
            const box = await boxOf(page, '.dq-bar-ask');
            await page.click('.dq-bar-ask');
            take.events.push({ t: stamp(take), kind: 'tap', label: 'Ask Vidi about this', ...box });
            // The sheet with the quote card is the proof the tap landed.
            await page.waitForSelector('.vidi-quote', { timeout: 6_000 });
            take.events.push({ t: stamp(take), kind: 'vidi', label: 'quote' });
            return;
        }
        case 'jumpTo': {
            const to = await page.evaluate(({ sel, top }) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                if (top) return 0;
                const r = el.getBoundingClientRect();
                return Math.max(0, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
            }, { sel: b.selector, top: !!b.top });
            if (to === null) throw new Error(`jumpTo: nothing matches ${b.selector}`);
            // The cut IS the event — but under --instant-scroll the settle
            // guard films no frame for >= SCROLL_SETTLE_MS after it, so the
            // card reaches the mp4 0.31–0.35 s after this moment (V08_REVISE v2
            // review: day 1 +5.3 f, day 2 +7 f on her words). The stamp keeps
            // the offset it landed on; the sidecar write moves it to the first
            // frame actually captured there.
            const landed = await page.evaluate((y) => { window.scrollTo(0, y); return window.scrollY; }, to);
            take.events.push({ t: stamp(take), kind: 'nav', label: b.top ? 'top' : b.selector, scroll_y: landed });
            return;
        }
        case 'tapCard': {
            const sel = `a.cat-card[href="#/q/${encodeURIComponent(b.id)}"]`;
            const box = await boxOf(page, sel);
            if (box.y === null) throw new Error(`tapCard: no catalog card for ${b.id} on screen`);
            await page.click(sel);
            take.events.push({ t: stamp(take), kind: 'tap', label: b.id, ...box });
            // Both conditions, as in `openQuestion`: a stale `.page` can be
            // visible, and the id can be set while its pages are still hidden.
            await page.waitForFunction((id) => {
                const pg = document.querySelector('.page');
                const r = pg?.getBoundingClientRect();
                const q = (window as any).PM_ANSWER?.question;
                return !!r && r.width > 0 && r.height > 0 && q?.question_id === id;
            }, b.id, { timeout: 30_000 });
            take.events.push({ t: stamp(take), kind: 'open', label: b.id });
            return;
        }
        case 'answerAsk': {
            // The sheet is shown by un-hiding #askOverlay (notebook.js showAsk).
            // Refuse rather than film a list: no sheet means the app did not
            // think this answer was due an ask (not complete, or already ticked).
            const asked = await page.waitForFunction(() => {
                const ov = document.getElementById('askOverlay');
                return ov && !ov.hidden ? (document.getElementById('askText')?.textContent ?? '').trim() : null;
            }, undefined, { timeout: 6_000 })
                .then((h) => h.jsonValue() as Promise<string>)
                .catch(() => null);
            if (!asked) throw new Error('answerAsk: the leave-question sheet never opened');
            take.events.push({ t: stamp(take), kind: 'sheet', label: asked, ...(await boxOf(page, '#askText')) });
            await page.waitForTimeout(b.readMs);
            const yes = await boxOf(page, '#askYes');
            const yesLabel = await page.evaluate(() => (document.getElementById('askYes')?.textContent ?? '').trim());
            await page.click('#askYes');
            take.events.push({ t: stamp(take), kind: 'tap', label: yesLabel, ...yes });
            // Yes swaps the question for its confirmation line in the same call.
            const said = await page.waitForFunction((q: string) => {
                const t = (document.getElementById('askText')?.textContent ?? '').trim();
                return t && t !== q ? t : null;
            }, asked, { timeout: 3_000 })
                .then((h) => h.jsonValue() as Promise<string>)
                .catch(() => '');
            take.events.push({ t: stamp(take), kind: 'reply', label: said });
            // The app closes the sheet itself after 1.1 s and routes on.
            await page.waitForFunction(() => document.getElementById('askOverlay')?.hidden === true,
                undefined, { timeout: 5_000 }).catch(() => { /* keep the frames */ });
            take.events.push({ t: stamp(take), kind: 'nav', label: 'sheet closed' });
            return;
        }
        case 'scrollThread': {
            // Ease the nearest scroll box around the LAST tutor bubble so the
            // element whose text carries `text` sits a third of the way down.
            // Inline easing again (the __name trap, see `pan`). Two calls: the
            // first only measures (so the `nav` is stamped at the START of the
            // motion, and only when there IS motion — V05_ASK's edit found a
            // stamp 3.1 s after the picture moved and one for a scroll that
            // never happened); the second performs the eased scroll.
            const plan = await page.evaluate(({ text }) => {
                const msgs = Array.from(document.querySelectorAll('#vidiThread .vidi-msg.tutor:not(.vidi-typing)'));
                const last = msgs[msgs.length - 1] as HTMLElement | undefined;
                if (!last) return null;
                const walker = document.createTreeWalker(last, NodeFilter.SHOW_TEXT);
                let hit: HTMLElement | null = null;
                for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                    if ((n.textContent ?? '').toLowerCase().includes(text.toLowerCase())) { hit = n.parentElement; break; }
                }
                if (!hit) return null;
                let sc: HTMLElement | null = hit;
                while (sc && !(sc.scrollHeight > sc.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
                if (!sc) return { from: 0, to: 0 };
                const rs = sc.getBoundingClientRect(), rh = hit.getBoundingClientRect();
                const from = sc.scrollTop;
                const to = Math.max(0, Math.min(sc.scrollHeight - sc.clientHeight, from + (rh.top - rs.top) - rs.height * 0.33));
                // remember the box for the second call: a data attribute, no closure
                sc.setAttribute('data-reel-scroll', '1');
                return { from, to };
            }, { text: b.text });
            if (!plan) {
                console.warn(`  ! scrollThread: "${b.text}" is not in the reply — no scroll, no stamp`);
                return;
            }
            if (Math.abs(plan.to - plan.from) < 2) {
                console.warn(`  ! scrollThread: "${b.text}" is already in view — no scroll, no stamp`);
                return;
            }
            take.events.push({ t: stamp(take), kind: 'nav', label: `thread:${b.text}` });
            await page.evaluate(async ({ from, to, ms }) => {
                const sc = document.querySelector('[data-reel-scroll]') as HTMLElement | null;
                if (!sc) return;
                sc.removeAttribute('data-reel-scroll');
                const steps = 60;
                for (let i = 1; i <= steps; i++) {
                    const p = i / steps;
                    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                    sc.scrollTop = from + (to - from) * e;
                    await new Promise((r) => setTimeout(r, ms / steps));
                }
            }, { from: plan.from, to: plan.to, ms: b.ms });
            return;
        }
    }
}

/** Width/height straight out of a JPEG's SOF marker — so "1080×1920, no upscale"
    is something this script CHECKS rather than something it claims. */
function jpegSize(file: string): { w: number; h: number } {
    const b = fs.readFileSync(file);
    let i = 2;
    while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        // SOF0..SOF15 except the non-frame markers DHT(c4) JPGA(c8) DAC(cc)
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
            return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
        }
        i += 2 + b.readUInt16BE(i + 2);
    }
    throw new Error('could not read JPEG dimensions from ' + file);
}

function mux(listFile: string, out: string, fps: number, speed: number): Promise<void> {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    const args = [
        '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
        // CFR at the target rate: Instagram wants constant frame rate, and the
        // concat durations carry the real timing into the resample. `-vsync vfr`
        // WITH `-r` is contradictory and ffmpeg refuses it outright.
        '-fps_mode', 'cfr', '-r', String(fps),
        // setpts divides each frame's presentation time: 4 => four times faster.
        // Applied at mux so the CAPTURE stays honest and re-timing is one flag.
        ...(speed !== 1 ? ['-filter:v', `setpts=PTS/${speed}`] : []),
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
        // yuv420p or it will not play on a phone. NO scale filter: the frames
        // are already 1080×1920 and asserted so — adding one here would let a
        // wrong-sized capture pass silently, which is the bug this replaced.
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', out,
    ];
    return new Promise((ok, fail) => {
        const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '';
        p.stderr.on('data', (d) => { err += String(d); });
        p.on('close', (code) => code === 0 ? ok() : fail(new Error('ffmpeg failed:\n' + err.slice(-1500))));
    });
}

async function main(): Promise<void> {
    const shotName = arg('shot', 'answer');
    const shot = SHOTS[shotName];
    if (!shot) {
        console.error(`unknown --shot ${shotName}. Available: ${Object.keys(SHOTS).join(', ')}`);
        process.exit(1);
    }
    const questionId = arg('q', 'ts_ipe_p1_mp_projectile_motion');
    const fps = Number(arg('fps', '30'));
    const speed = Number(arg('speed', '1'));
    const reveals = Math.max(1, Number(arg('reveals', '4')) || 4);
    // 0 = let every step finish. N = interrupt the Nth reveal mid-write.
    const midwrite = Math.max(0, Number(arg('midwrite', '0')) || 0);
    if (midwrite > reveals) {
        throw new Error(`--midwrite ${midwrite} is past --reveals ${reveals}: that reveal never happens`);
    }
    if (!Number.isFinite(speed) || speed <= 0) throw new Error('--speed must be a positive number');
    const live = flag('live');
    const dir = arg('dir', DEFAULT_DIR);
    const out = arg('out', `answer-book/tools/out/insta/${shotName}_${questionId}.mp4`);

    let server: Server | null = null;
    const base = live ? LIVE_URL : `http://localhost:${PORT}`;
    if (!live) server = await serveDist(dir);

    const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
    let browser: Browser | null = null;

    try {
        browser = await chromium.launch();
        const context = await browser.newContext({
            viewport: VIEWPORT, deviceScaleFactor: DPR, isMobile: true, hasTouch: true,
        });
        // THE line that keeps a recording out of the student numbers. Before the
        // first page load, never after — a device is minted on first sync.
        // --hide <css selector>: keep a UI element out of a film plate (e.g. the
        // Ask Vidi pill while the answer writes itself). Injected as an init
        // script so it applies before first paint, never a flash.
        const hide = arg('hide', '');
        if (hide) {
            await context.addInitScript((sel: string) => {
                const st = document.createElement('style');
                st.textContent = `${sel}{display:none!important}`;
                (document.head || document.documentElement).appendChild(st);
            }, hide);
        }
        await context.addInitScript(() => {
            try { localStorage.setItem('pm_internal', '1'); } catch { /* blocked storage */ }
        });
        // --instant-scroll: no frame is taken while the product is scrolling.
        // The product scrolls a revealed block into view with `behavior:
        // 'smooth'`, and a screenshot taken around that scroll shows the sticky
        // header composited with the scroll delta — 100–240 px low, the page
        // already at its new offset (V06_HEART, measured on every frame with a
        // logo-row scan: 13 such frames with smooth scrolls; 5 with the scrolls
        // forced instant; 4 with the header made `position: fixed` on top of
        // that, so it is the capture's compositing, not the header's CSS). Two
        // halves, both opt-in under this flag so earlier shots keep their frames:
        // (1) every programmatic scroll lands in one step (no mid-scroll frame);
        // (2) the capture loop below holds its next screenshot until the page has
        // been still for SCROLL_SETTLE_MS after the last scroll event. A `pan`
        // beat scrolls from the recorder on purpose and is exempt (`__pmPanning`).
        if (flag('instant-scroll')) {
            await context.addInitScript(() => {
                const si = Element.prototype.scrollIntoView;
                Element.prototype.scrollIntoView = function (arg?: boolean | ScrollIntoViewOptions) {
                    const o = typeof arg === 'object' && arg ? { ...arg, behavior: 'auto' as ScrollBehavior } : arg;
                    return si.call(this, o);
                };
                const st = window.scrollTo.bind(window);
                (window as any).scrollTo = (...a: any[]) => {
                    if (a.length === 1 && a[0] && typeof a[0] === 'object') return st({ ...a[0], behavior: 'auto' });
                    return (st as any)(...a);
                };
                (window as any).__pmScrollAt = -1e9;
                addEventListener('scroll', () => { (window as any).__pmScrollAt = performance.now(); }, { capture: true, passive: true });
            });
        }
        // --track mpc/second_year/mpc_2 : start as a student who ALREADY chose at
        // the door. A multi-stream build shows the chooser on the bare landing
        // route, so without this the catalog never paints and #subjectSelect is
        // an empty, invisible <select> — which is a 30 s selectOption timeout,
        // not an obvious failure. The stored shape is Door.choose()'s own
        // (notebook.js:4113); the year decides WHICH subjects exist, so a
        // second-year question needs a second-year choice.
        const track = arg('track', '');
        if (track) {
            const [group, year, stream] = track.split('/');
            if (!group || !year) throw new Error('--track wants group/year[/stream], e.g. mpc/second_year/mpc_2');
            await context.addInitScript((t: { group: string; year: string; stream: string | null }) => {
                try {
                    localStorage.setItem('pm_track_v1', JSON.stringify({ ...t, at: new Date().toISOString() }));
                } catch { /* blocked storage */ }
            }, { group, year, stream: stream || null });
        }
        const opts: ShotOpts = {
            questionId, reveals, midwrite,
            subject: arg('subject', 'physics_2'),
            unit: arg('unit', 'physics_2-1'),
            ask: arg('ask', 'Can you explain step 3? I did not understand why the crest travels the full distance.'),
            chip: arg('chip', 'How to remember?'),
            holdMs: Math.max(0, Number(arg('hold-ms', '2000')) || 0),
            phases: 0,
            line: arg('line', 'PQ = OQ - OP'),
            day: Number(arg('day', '1')),
            section: arg('section', 'VSAQ'),
            steps: 0,
        };
        if (shotName === 'revise_loop' && !flag('instant-scroll')) {
            // Its list moves are `jumpTo` cuts; without the settle guard the
            // sticky header is filmed mid-composite on every one of them.
            throw new Error('--shot revise_loop needs --instant-scroll');
        }
        if (shotName === 'revise_loop' && opts.day !== 1 && opts.day !== 2) {
            throw new Error('--shot revise_loop wants --day 1 or --day 2');
        }
        // Before the first byte, like `pm_internal`: the device's history.
        const seed = shot.storage?.(opts) ?? {};
        if (Object.keys(seed).length) {
            await context.addInitScript((kv: Record<string, string>) => {
                try { for (const k of Object.keys(kv)) localStorage.setItem(k, kv[k]); } catch { /* blocked storage */ }
            }, seed);
        }

        const page = await context.newPage();

        await page.goto(base + '/' + (shot.startAt?.(opts) ?? ''), { waitUntil: 'domcontentloaded' });
        // the init-script <style> is discarded when the document parses (measured:
        // the pill survived it), so the hide is applied to the live document too.
        if (hide) await page.addStyleTag({ content: `${hide}{display:none!important}` });
        await page.waitForFunction(() => (window as any).PM_ANSWER, undefined, { timeout: 20_000 });

        // The figure shot is data-driven by the card: how many pauses its first
        // diagram step carries decides how many taps the shot makes. Read from
        // the artifact, not typed — a card with no phased figure is refused
        // rather than filmed as an empty walk.
        opts.phases = await page.evaluate((id: string) => {
            const qs: any[] = (window as any).PM_QUESTIONS || [];
            const q = qs.find((x) => x.question_id === id);
            const d = q?.answer?.steps?.find((s: any) => s.kind === 'diagram');
            return d?.figure?.elements ? d.figure.elements.filter((e: any) => e.type === 'pause').length : 0;
        }, questionId);
        opts.steps = await page.evaluate((id: string) => {
            const qs: any[] = (window as any).PM_QUESTIONS || [];
            return qs.find((x) => x.question_id === id)?.answer?.steps?.length ?? 0;
        }, questionId);
        if (shotName === 'revise_loop' && opts.steps < 1) {
            throw new Error(`--shot revise_loop: ${questionId} is not in this build (or has no answer steps)`);
        }
        if (shotName === 'figure' && opts.phases < 2) {
            throw new Error(`--shot figure: ${questionId} has no phased figure `
                + `(${opts.phases} pause element${opts.phases === 1 ? '' : 's'}) — nothing to tap through`);
        }

        // Arrive at the starting state OFF camera: these beats are stamped on a
        // scratch take that is thrown away, so t=0 stays the first frame.
        if (shot.setup) {
            const scratch: Take = { t0: Date.now(), events: [] };
            for (const beat of shot.setup(opts)) await runBeat(page, beat, scratch);
        }

        // Capture runs alongside the beats and takes frames as fast as
        // screenshot() returns; the real inter-frame gaps are what timing is
        // rebuilt from below, so an uneven rate costs nothing.
        // `y`: the window scrollY read right after the capture (settle mode only).
        const frames: { file: string; t: number; y?: number }[] = [];
        let capturing = true;
        let n = 0;
        const t0 = Date.now();
        const take: Take = { t0, events: [] };
        const settle = flag('instant-scroll');
        let lastY = -1;
        let retakes = 0;
        let pre: { y: number; at: number; still: number; panning: boolean } | null = null;
        const capture = (async () => {
            while (capturing) {
                const file = path.join(frameDir, `f${String(n).padStart(5, '0')}.jpg`);
                try {
                    // --instant-scroll half (2). Before: hold this frame until the
                    // page has been still for SCROLL_SETTLE_MS (a changed scrollY
                    // counts even before its scroll event has fired; capped, so a
                    // page that never settles still gets filmed). After: a scroll
                    // that landed DURING the ~80 ms capture is the frame this guard
                    // exists for (measured: holding only before turned one such
                    // frame into a 7-frame freeze) — the file is dropped and the
                    // frame re-taken once still. Up to 3 re-takes, then kept as is.
                    // One probe per frame: the read taken after frame k's capture is
                    // the read frame k+1 settles from (the probe costs a round trip,
                    // and the capture rate is the product's real-speed smoothness).
                    if (settle) {
                        for (let k = 0; k < 12; k++) {
                            if (!pre) {
                                pre = await page.evaluate(() => ({
                                    y: window.scrollY,
                                    at: (window as any).__pmScrollAt as number,
                                    still: performance.now() - (window as any).__pmScrollAt,
                                    panning: !!(window as any).__pmPanning,
                                }));
                            }
                            const moved = lastY >= 0 && pre.y !== lastY;
                            lastY = pre.y;
                            if (pre.panning || (!moved && pre.still > SCROLL_SETTLE_MS)) break;
                            pre = null;
                            await new Promise((r) => setTimeout(r, 50));
                        }
                    }
                    await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
                    const t = (Date.now() - t0) / 1000;
                    if (settle) {
                        const post = await page.evaluate(() => ({
                            y: window.scrollY,
                            at: (window as any).__pmScrollAt as number,
                            still: performance.now() - (window as any).__pmScrollAt,
                            panning: !!(window as any).__pmPanning,
                        }));
                        const dirty = !post.panning && !!pre && (post.y !== pre.y || post.at !== pre.at);
                        pre = post;
                        if (dirty && retakes < 3) { retakes++; fs.unlinkSync(file); continue; }
                    }
                    retakes = 0;
                    n++;
                    frames.push({ file, t, ...(settle && pre ? { y: pre.y } : {}) });
                } catch { break; }                   // page closed mid-shot
            }
        })();

        for (const beat of shot.beats(opts)) await runBeat(page, beat, take);

        capturing = false;
        await capture;
        await browser.close(); browser = null;

        if (frames.length < 2) throw new Error('capture produced no frames');

        // The claim this whole script rests on, verified against frame 1.
        const size = jpegSize(frames[0].file);
        const want = { w: VIEWPORT.width * DPR, h: VIEWPORT.height * DPR };
        if (size.w !== want.w || size.h !== want.h) {
            throw new Error(
                `frames are ${size.w}×${size.h}, expected ${want.w}×${want.h}. ` +
                'Refusing to mux — upscaling here is what makes a Reel look cheap.');
        }

        // Per-frame durations from Chrome's own timestamps; the last frame is
        // held for one output frame so ffmpeg does not drop it.
        const lines: string[] = [];
        for (let i = 0; i < frames.length; i++) {
            const dur = i < frames.length - 1
                ? Math.max(1 / 240, frames[i + 1].t - frames[i].t)
                : 1 / fps;
            lines.push(`file '${frames[i].file.replace(/\\/g, '/')}'`, `duration ${dur.toFixed(4)}`);
        }
        lines.push(`file '${frames[frames.length - 1].file.replace(/\\/g, '/')}'`);
        const listFile = path.join(frameDir, 'frames.txt');
        fs.writeFileSync(listFile, lines.join('\n'));

        await mux(listFile, out, fps, speed);

        // mp4 time 0 is the FIRST SCREENSHOT, not t0, and the mux divided time by
        // `speed` — the sidecar is written in the mp4's own seconds.
        const sidecar = out.replace(/\.mp4$/i, '.taps.json');
        fs.writeFileSync(sidecar, JSON.stringify({
            speed, fps, viewport: VIEWPORT, dpr: DPR,
            // A jump's stamp moves to the first frame FILMED at its offset (and
            // after it): that frame's t is when the mp4 shows the new place.
            // Only with the settle guard's per-frame reads; otherwise as stamped.
            events: take.events.map((e) => {
                let t = e.t;
                if (e.scroll_y !== undefined) {
                    const f = frames.find((fr) => fr.t >= e.t && fr.y === e.scroll_y);
                    if (f) t = f.t;
                    else console.warn(`  ! ${e.label}: no frame was filmed at scrollY ${e.scroll_y} — kept the jump's own stamp`);
                }
                return { ...e, t: Number(((t - frames[0].t) / speed).toFixed(3)) };
            }).sort((a, b) => a.t - b.t),
        }, null, 1));

        const secs = frames[frames.length - 1].t - frames[0].t;
        const kb = Math.round(fs.statSync(out).size / 1024);
        console.log(`\n✓ ${out}`);
        console.log(`  ${size.w}×${size.h} native · ${frames.length} frames captured at `
            + `${(frames.length / secs).toFixed(1)}/s · ${secs.toFixed(1)}s captured`
            + `${speed !== 1 ? ` -> ${(secs / speed).toFixed(1)}s at ${speed}x` : ''} · ${kb} KB · ${fps} fps out`);
        console.log(`  shot: ${shotName} — ${shot.describe}`);
        console.log(`  source: ${live ? LIVE_URL + '  (device marked team)' : dir + '  (localhost → answerbook_local)'}`);
    } finally {
        if (browser) await browser.close();
        if (server) server.close();
        fs.rmSync(frameDir, { recursive: true, force: true });
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
