/**
 * FLEET SAFETY — "is this new scenario_type additive?", asked in a way that
 * stays answerable after the scenario lands.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHY THIS IS SHARED CODE AND NOT A THIRD COPY. Two gates had grown their own
 * fleet-safety section and each rotted in its own way within days of its
 * scenario merging (bug_class engine_gate_fleet_safety_baseline_rots_the_
 * moment_its_own_scenario_merges). A third scenario would have copied
 * whichever version it found first. The mechanism lives here once, so the
 * NEXT scenario's gate inherits the fix instead of re-deriving the bug.
 *
 * ── THE TWO DEFECTS THIS REPLACES, both measured on master @ 3ae9047 ──
 *
 * (A) SELF-DELETION. check_solid_of_revolution.ts took its baseline as
 *     `merge-base(HEAD, origin/master)`. On a branch that is still unmerged
 *     that resolves to "master before me", which is right. The moment the
 *     scenario MERGES, HEAD is master, the merge-base IS HEAD, and the
 *     baseline therefore already contains the scenario — so subtracting the
 *     scenario's own block from one side of a comparison against itself
 *     reports the entire block as deleted. Measured: 1271 of 1271
 *     deleted-only lines were the SR block's own text; the gate was red by
 *     construction, permanently, from the hour it merged.
 *
 *     FIX: the baseline is DERIVED — the newest ancestor of HEAD whose
 *     renderer does not contain the scenario at all. That is "the fleet as it
 *     stood before this scenario existed", which is the only baseline the
 *     question has, and it is stable whether the desk is pre- or post-merge.
 *
 * (B) SIBLING DRIFT. Once (A) is fixed the baseline is a real point in the
 *     past, so EVERY change anyone has landed since — a sibling scenario's
 *     new region, a sibling surgeon's fix inside their own region — shows up
 *     in the diff with nothing to attribute it to, and is reported as this
 *     scenario's blast radius. check_vector_geometry_3d.ts was green only by
 *     accident of where its walk landed (a base that already carried
 *     solid_of_revolution, so SR's 1531 lines happened not to diff); had SR
 *     merged one day later that gate would have been red too. An
 *     accidentally-green gate is the next red one.
 *
 *     FIX: ATTRIBUTE BY AUTHORSHIP, not by time. A line that differs between
 *     the baseline and HEAD is this scenario's business only if one of THIS
 *     SCENARIO'S OWN COMMITS wrote it. The commits are partitioned by whether
 *     their patch to the renderer speaks the scenario's own vocabulary, and
 *     every line added or removed by somebody else's commit is exempt. This
 *     is immune to sibling work FOREVER — additions and modifications alike —
 *     because a sibling's lines are attributed to the sibling, not forgiven
 *     by a widened exemption.
 *
 * ── WHAT WAS CONSIDERED AND REJECTED ──
 *
 *   "Excise every scenario region introduced since the base" — rejected on
 *   measurement: only 14 of the renderer's 48 banner blocks name a
 *   scenario_type in their header, so there IS no derivable whole-file region
 *   partition to excise with. A gate resting on one would silently stop
 *   excising the day a scenario shipped without a conforming banner.
 *
 *   "Exempt anything inside some other scenario's region" — same missing
 *   partition, and it would ALSO forgive this scenario reaching into a
 *   sibling's internals, which is the sealed-sibling protection (DF1) the
 *   engine cluster relies on. Authorship keeps that protection: a line MY
 *   commit wrote inside a sibling's region is attributed to ME and fails.
 *
 *   "Deletion-only comparison" (immune to additions, so immune to new
 *   siblings) — genuinely simpler, and rejected on measurement: it is immune
 *   to a sibling's INSERTIONS but not to a sibling's MODIFICATIONS, and the
 *   modification is the common case (5 of the 8 surviving lines in the trial
 *   run were a sibling surgeon's in-place edits inside his own region).
 *
 * ── THE LIMIT, STATED RATHER THAN HIDDEN ──
 *
 *   Attribution reads COMMITTED history. An UNCOMMITTED working-tree edit
 *   belongs to no commit, so it is classified as somebody else's and exempt.
 *   That is the deliberate direction: a surgeon editing scenario X must not
 *   turn scenario Y's gate red, and the surgeon's own live instrument for
 *   uncommitted work is `git diff`. The claim this section makes is about
 *   what has LANDED, and it becomes exact the moment the work is committed.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export interface FleetSafetySpec {
  /** Path to the renderer, relative to the repo root. */
  renderer: string;
  /** The scenario_type string. Its absence defines "before this scenario". */
  sentinel: string;
  /** Extra sentinels that also mean "this scenario exists" (an old name). */
  altSentinels?: string[];
  /**
   * The scenario's own VOCABULARY, used to decide whether a commit is this
   * scenario's work. Its own type string plus its symbol prefix convention
   * (`srSomething`, `sr_something`) — derived from how the file already names
   * things, never a list of individual symbols that would need maintaining.
   */
  vocabulary: RegExp;
  /** Text that opens the scenario's own region in the template body. */
  regionStart: string;
  /** Text that opens whatever comes AFTER the scenario's region. */
  regionEnd: string;
  /** The enumerated shared-glue sites — the whole intended blast radius. */
  glue: string[];
  /** Remove this scenario's own insertions from a shared line, for matching. */
  stripOwn: (line: string) => string;
  /** Env var that pins the baseline, for a desk with unusual history. */
  baseEnv?: string;
}

export interface FleetSafetyResult {
  base: string | null;
  /** The template-body line span of the scenario's own region [start, end). */
  region: [number, number];
  /** HEAD's template body with the scenario's own region removed. */
  stripped: string[];
  /** The baseline's template body. */
  baseLines: string[];
  /** Commits since the baseline, split by whether they speak the vocabulary. */
  mineCommits: string[];
  othersCommits: string[];
  /** Lines somebody else's commits added / removed since the baseline. */
  othersAdded: Set<string>;
  othersRemoved: Set<string>;
  /** Lines THIS scenario's own commits added / removed since the baseline. */
  mineAdded: Set<string>;
  mineRemoved: Set<string>;
  /** Every enumerated glue site found in the stripped body. */
  glueHits: string[];
  /** Lines outside the region that speak the sentinel but are not glue. */
  unlistedReach: string[];
}

/** The template body — the emitted renderer source, both sides sliced the same way. */
export function templateBody(file: string, marker: string): string {
  const i = file.indexOf(marker);
  if (i < 0) throw new Error("renderer marker not found: " + marker);
  return file.slice(i);
}

const MARKER = "export const FIELD_3D_RENDERER_CODE = ";

export function runFleetSafety(spec: FleetSafetySpec): FleetSafetyResult {
  const R = spec.renderer;
  const git = (args: string[]) =>
    execFileSync("git", args, { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  const rawAt = (ref: string) => git(["show", `${ref}:${R}`]);
  const carries = (file: string) =>
    file.includes(spec.sentinel) || (spec.altSentinels ?? []).some((s) => file.includes(s));

  // ── THE BASELINE: the newest ancestor whose renderer predates this
  //    scenario. Walking from the merge-base with origin/master rather than
  //    from HEAD's own first parent, because a desk cut weeks ago would
  //    otherwise report master's progress as this dispatch's blast radius.
  let base: string | null = (spec.baseEnv && process.env[spec.baseEnv]) || null;
  if (!base) {
    try {
      const mb = git(["merge-base", "HEAD", "origin/master"]).trim();
      const cands = [mb, ...git(["rev-list", "--max-count=60", mb, "--", R])
        .split("\n").map((s) => s.trim()).filter(Boolean)];
      for (const c of cands) if (!carries(rawAt(c))) { base = c; break; }
    } catch { base = null; }
  }
  if (!base) {
    return {
      base: null, region: [0, 0], stripped: [], baseLines: [],
      mineCommits: [], othersCommits: [], othersAdded: new Set(), othersRemoved: new Set(),
      mineAdded: new Set(), mineRemoved: new Set(),
      glueHits: [], unlistedReach: [],
    };
  }

  const cur = templateBody(readFileSync(R, "utf-8"), MARKER).split("\n");
  const i0 = cur.findIndex((l) => l.includes(spec.regionStart));
  const i1 = cur.findIndex((l, i) => i0 >= 0 && i > i0 && l.includes(spec.regionEnd));
  // The banner rule line sits one above each banner title, and belongs to the
  // block it introduces.
  const rs = i0 > 0 ? i0 - 1 : -1;
  const re = i1 > i0 ? i1 - 1 : -1;
  const stripped = (rs < 0 || re < 0) ? cur : cur.filter((_, i) => i < rs || i >= re);
  const baseLines = templateBody(rawAt(base), MARKER).split("\n");

  // ── AUTHORSHIP. Every renderer commit since the baseline is either this
  //    scenario's work or somebody else's; a merge commit carries no patch of
  //    its own, so it contributes nothing either way and the commits it
  //    merged are in the range on their own account.
  const mineCommits: string[] = [], othersCommits: string[] = [];
  const othersAdded = new Set<string>(), othersRemoved = new Set<string>();
  const mineAdded = new Set<string>(), mineRemoved = new Set<string>();
  // A CITATION IS NOT AUTHORSHIP (2026-08-10). The vocabulary test decides
  // whose commit this is, so it must read only lines that could BE the
  // scenario's work: (1) a comment-only patch line that happens to cite this
  // scenario ("// ... vector_geometry_3d mechanism", the organic substrate
  // crediting a pattern it borrowed) must not claim the whole commit — the
  // measured failure was 754 of organic's lines strayed as vg's because of
  // ONE such comment; (2) an enumerated glue site is by definition SHARED
  // (the union terminator carries this scenario's type string in every
  // commit that appends a sibling), so touching one proves nothing about
  // authorship either. Everything the excluded lines actually add is still
  // diffed — exclusion here only affects whose bag the lines land in.
  const vocabLine = (l: string) => {
    if (!l.startsWith("+") && !l.startsWith("-")) return false;
    if (l.startsWith("+++") || l.startsWith("---")) return false;
    const body = l.slice(1).trim();
    if (body.startsWith("//")) return false;              // comment-only: a citation
    if (spec.glue.some((g) => body.includes(g))) return false; // shared glue site
    return spec.vocabulary.test(body);
  };
  for (const c of git(["rev-list", `${base}..HEAD`, "--", R]).split("\n").map((s) => s.trim()).filter(Boolean)) {
    const patch = git(["show", "--unified=0", "--format=", c, "--", R]);
    const mine = patch.split("\n").some(vocabLine);
    (mine ? mineCommits : othersCommits).push(c);
    const add = mine ? mineAdded : othersAdded, del = mine ? mineRemoved : othersRemoved;
    for (const l of patch.split("\n")) {
      if (l.startsWith("+++") || l.startsWith("---")) continue;
      if (l.startsWith("+")) add.add(l.slice(1));
      else if (l.startsWith("-")) del.add(l.slice(1));
    }
  }

  // ── THE STRUCTURAL HALF, which needs no history at all: with the region
  //    excised, every surviving mention of this scenario must be one of the
  //    enumerated glue sites. This catches reach the allowlist has never
  //    heard of, which a diff-only check cannot: an unlisted dispatch added
  //    in the same commit as the region simply looks like "the scenario
  //    landed".
  const isGlue = (l: string) => spec.glue.some((g) => l.includes(g));
  const glueHits = stripped.filter(isGlue);
  const unlistedReach = stripped.filter((l) => carries(l) && !isGlue(l));

  return { base, region: [rs, re], stripped, baseLines, mineCommits, othersCommits, othersAdded, othersRemoved, mineAdded, mineRemoved, glueHits, unlistedReach };
}

export interface Classified {
  changed: number;
  strayAdded: string[];
  strayRemoved: string[];
  exemptOthers: number;
  exemptNearGlue: number;
  exemptPunctuation: number;
}

/**
 * A glue insertion is never one line. `case "x": build(); break;` is three,
 * and each dispatch carries the comment block that explains why it exists —
 * which is most of the diff and mentions nothing greppable. The old
 * per-hunk rule covered them implicitly and broke the moment a hunk held two
 * unrelated changes; this covers them by INDEX instead: an added line within
 * GLUE_RADIUS of a named glue site belongs to that insertion, whatever it
 * says. Judged by distance rather than by content, because a content
 * allowlist has to grow a line per continuation comment and every growth is
 * a place a real fleet edit can hide.
 */
export const GLUE_RADIUS = 12;

/**
 * Structural punctuation: a bare closing brace, a `break;`, a `});`. A PURE
 * ADDITION of one of these cannot change fleet behaviour by itself — any
 * behavioural change needs a content line beside it, and that content line is
 * caught on its own account. They are exempted rather than covered by simply
 * widening GLUE_RADIUS, because a wider radius forgives CONTENT lines too and
 * that is the blanket widening this gate exists against. Note the asymmetry:
 * this applies to ADDITIONS only. A punctuation line that VANISHES from the
 * baseline is still a stray, because deleting a brace does change behaviour.
 */
const PUNCTUATION_ONLY = /^(?:[{}()\[\];,]|break;|\}\);|\}\s*else\s*\{)+$/;

/**
 * Classify the difference between the baseline and HEAD-minus-region.
 *
 * A line is STRAY unless it is (1) matched one-for-one across the diff after
 * this scenario's own insertions are stripped — i.e. a shared line the
 * scenario appended itself to and changed in no other way; (2) an enumerated
 * glue site; or (3) attributable to somebody else's commit.
 */
export function classify(spec: FleetSafetySpec, r: FleetSafetyResult, strippedOverride?: string[]): Classified {
  const cur = strippedOverride ?? r.stripped;
  const bag = new Map<string, number>();
  for (const l of r.baseLines) bag.set(l, (bag.get(l) || 0) + 1);
  // Positions are kept, because the glue-proximity rule below is an INDEX
  // test — a multiset diff that throws the index away cannot make it.
  const added: Array<{ line: string; idx: number }> = [];
  cur.forEach((l, idx) => { const n = bag.get(l) || 0; if (n > 0) bag.set(l, n - 1); else added.push({ line: l, idx }); });
  const glueAnchors: number[] = [];
  cur.forEach((l, idx) => { if (spec.glue.some((g) => l.includes(g))) glueAnchors.push(idx); });
  const nearGlue = (idx: number) => glueAnchors.some((a) => Math.abs(a - idx) <= GLUE_RADIUS);
  const removed = [...bag.entries()].filter(([, n]) => n > 0).flatMap(([l, n]) => Array(n).fill(l) as string[]);

  const isGlue = (l: string) => spec.glue.some((g) => l.includes(g));
  // THE NOT-LIST IS AN ACCUMULATOR, and every scenario that owns a slider
  // panel appends one `&& !isSomething` term to it — forever. Comparing that
  // one line literally means it differs from ANY baseline by however many
  // scenarios have landed since, and the difference is attributable to no
  // single one of them: with a baseline predating both this scenario and a
  // sibling, the line changed by both and no per-scenario strip can separate
  // them (measured: exactly one stray, and only under such a baseline).
  // Normalising the accumulator away on BOTH sides is the structural answer —
  // it is not a second hardcoded region, it is the one shared line in this
  // file whose CONTRACT is to grow one term per scenario. Everything else
  // about the line still has to match, so a tamper hidden beside the term is
  // still caught.
  const NOT_LIST_TERM = /\s*&&\s*!is[A-Z]\w*/g;
  const norm = (l: string) => spec.stripOwn(l).replace(NOT_LIST_TERM, "");
  // A shared line the scenario appended to: its NEW text, with the scenario's
  // own insertion stripped, equals the OLD text exactly.
  const strippedAdds = new Map<string, number>();
  for (const a of added) { const k = norm(a.line); strippedAdds.set(k, (strippedAdds.get(k) || 0) + 1); }

  // somebody else's removals, in the same normalised space as the pairing above
  const othersRemovedNorm = new Set<string>();
  for (const l of r.othersRemoved) othersRemovedNorm.add(norm(l));

  let exemptOthers = 0, exemptNearGlue = 0, exemptPunctuation = 0;
  const strayRemoved: string[] = [];
  for (const d of removed) {
    if (!d.trim()) continue;
    const key = norm(d);
    const n = strippedAdds.get(key) || 0;
    if (n > 0) { strippedAdds.set(key, n - 1); continue; }   // rewritten in place
    // PRECEDENCE, and it is load-bearing: a line at a site THIS SCENARIO
    // DECLARES IT MODIFIES (an enumerated glue site) is this scenario's to
    // explain, and only the strip-pairing above may explain it. Without the
    // precedence, a shared line that several scenarios have rewritten — the
    // #sliders NOT-list is rewritten by every scenario that owns a panel — is
    // exempted as "somebody else's", and a further edit by THIS scenario
    // hides inside that exemption. Measured: the glue-tamper control stopped
    // firing under an older baseline and only under an older one, which is
    // exactly the silent-failure shape this file is written against.
    //
    // The precedence is keyed on the DECLARED GLUE SITE, not on "any line my
    // commits also touched" — that first attempt vetoed the exemption for
    // ubiquitous text (a bare `//`, a bare `return {`) which every commit in
    // history adds, and turned 19 of somebody else's lines into strays. A
    // membership test on raw line text is only as specific as the text is.
    if (isGlue(d)) { strayRemoved.push(d); continue; }
    if (r.othersRemoved.has(d)) { exemptOthers++; continue; }
    // ── TWO COMMITS CAN EDIT ONE LINE, AND THE SECOND ONE HIDES THE FIRST.
    //   The raw membership test above compares somebody else's REMOVED text to
    //   the BASELINE text, which only matches when this scenario has not also
    //   touched that line. When a sibling lands AFTER this scenario on a line
    //   this scenario already appended to, the sibling's diff removes the
    //   SCENARIO-FLAVOURED line, not the baseline one — so the baseline line
    //   matches nothing and is reported as an unexplained removal forever.
    //   Measured on master before this fix: the two scenario_type accumulator
    //   lines (#formula_overlay and the SET_TIME_FREEZE snap list), each edited
    //   by solid_of_revolution and then by organic_structure a day later, giving
    //   a PERMANENTLY RED gate whose two strays were both fully attributable.
    //   A chronically red gate is worse than no gate: it is the one state in
    //   which a real stray arrives and nobody looks.
    //
    //   The comparison is therefore made in the SAME normalised space the
    //   rewritten-in-place pairing above already uses — this scenario's own
    //   insertion stripped from both sides — so the sibling's removal and the
    //   baseline line become the same key. It does NOT widen what is forgiven:
    //   the glue precedence still runs first and still claims every line at a
    //   site this scenario declares it modifies, which is what keeps the
    //   glue-tamper control firing.
    if (othersRemovedNorm.has(key)) { exemptOthers++; continue; }
    strayRemoved.push(d);
  }
  const strayAdded: string[] = [];
  for (const { line: a, idx } of added) {
    if (!a.trim()) continue;
    if (isGlue(a)) continue;
    if (spec.stripOwn(a) !== a) continue;                   // it IS the scenario's own insertion
    if (r.othersAdded.has(a)) { exemptOthers++; continue; }
    if (nearGlue(idx)) { exemptNearGlue++; continue; }
    if (PUNCTUATION_ONLY.test(a.trim().replace(/\s+/g, ""))) { exemptPunctuation++; continue; }
    strayAdded.push(a);
  }
  return {
    changed: added.filter((a) => a.line.trim()).length + removed.filter((l) => l.trim()).length,
    strayAdded, strayRemoved, exemptOthers, exemptNearGlue, exemptPunctuation,
  };
}
