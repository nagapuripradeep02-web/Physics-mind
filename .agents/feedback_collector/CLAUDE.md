# FEEDBACK_COLLECTOR — Agent Spec (Tier 8 quartet wrapper)

Orthogonal to the authoring pipeline. Runs nightly (offline). Never touches live serving paths.

## Role

Close the learning loop. This single Alex spec covers the **Tier 8 quartet** (CLAUDE_ENGINES.md: E38, E39, E40, E41) because they're offline, share the `proposal_queue` output table, and logically belong together. When Phase I builds the runtime implementations, they may ship as 4 separate services or one orchestrated pipeline; this spec documents the CONTRACT, not the process boundary.

| Engine | Role | Status |
|---|---|---|
| **E38 PYQ Ingester** (decision role) | Nightly scan of PYQ feedback for negative-sentiment flags → proposes concept phase jumps. Distinct from E33 PYQ Card Ingester (data intake). | PARTIAL |
| **E39 Feedback Collector + Clusterer** | Aggregates `session_feedback` across students; embeds + clusters unclustered confusion phrases. | PARTIAL |
| **E40 Change Proposer** | Reads clustered feedback → proposes JSON edits (scene_composition, epic_c rewording, physics_engine tuning) → writes to `proposal_queue`. | PARTIAL |
| **E41 Auto-Promoter** | Promotes pending_review cache rows → verified when ≥20 positive + 0 negative + E42 passes 3/3. | NOT_STARTED |

Engines stay fixed. JSONs learn every week. Humans approve everything. (CLAUDE.md Rule 17.)

## Input contract

Five Supabase tables, all read-only from this agent's perspective:

| Table | Why read |
|---|---|
| `chat_feedback` | Student thumbs-up / thumbs-down on lesson responses. |
| `variant_feedback` | Type A / Type B variant preference + comments. |
| `simulation_feedback` | Emoji rating on a specific sim state. |
| `student_confusion_log` | 159+ rows (as of session 31) of raw confusion phrases typed into drill-down. The canonical source. |
| `drill_down_cache` | `served_count` + `status` + `review_notes` per cluster. Low ratings + high served_count = promotion candidate for auditor re-review. |

Also reads `confusion_cluster_registry` (12 active rows as of session 31 after Phase E seed) to dedupe against existing clusters.

## Output contract

Nightly report + proposals written to a `proposal_queue` table (**schema design below — Phase I work, not Phase E**):

```sql
CREATE TABLE proposal_queue (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind           TEXT NOT NULL,  -- 'new_cluster' | 'archive_cluster' | 'flag_sub_sim'
    concept_id     TEXT NOT NULL,
    state_id       TEXT,
    payload        JSONB NOT NULL, -- proposed row or action
    evidence       JSONB NOT NULL, -- raw phrases, rating trends, sample session_ids
    confidence     NUMERIC,        -- 0..1
    status         TEXT DEFAULT 'pending',
    reviewer       TEXT,
    decided_at     TIMESTAMPTZ,
    decision_notes TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);
```

Three proposal kinds:

1. **`new_cluster`** — unclustered confusion phrases in `student_confusion_log` form a semantic group ≥5 phrases, ≥3 distinct sessions, over ≥7 days. Propose `{cluster_id, concept_id, state_id, label, description, trigger_examples}`.
2. **`archive_cluster`** — an existing cluster has been served ≥20 times and negative feedback ≥40%. Flag for re-author or retire.
3. **`flag_sub_sim`** — a `drill_down_cache` row has `status: 'pending_review'` for >7 days. Queue for quality_auditor review.

## Tools allowed

- Supabase MCP `execute_sql` (**SELECT-only**) on the 5 input tables + `confusion_cluster_registry`.
- Supabase MCP `apply_migration` ONLY on the `proposal_queue` table when the schema itself evolves (rare, and Pradeep approves the migration text first).
- LLM calls to Haiku (via `confusionClassifier.ts`'s pattern) for clustering unclustered phrases.

## Tools forbidden

- `execute_sql` writes on **any** table other than `proposal_queue`. This agent NEVER mutates content Supabase sees on the hot serving path.
- `Edit` / `Write` on any concept JSON or source code.
- Auto-applying proposals. Every proposal waits for Pradeep's explicit approval via an admin UI (Phase I) or manual SQL.

## Rule 18 — the auto-promotion threshold

Sonnet-generated cache rows (`deep_dive_cache`, `drill_down_cache`, `simulation_cache` — any `status: 'pending_review'`) may be auto-promoted to `'verified'` ONLY after:

- **20 positive feedback ratings** (thumbs-up on the served sub-sim).
- **0 negative ratings** in that same window.
- **Zero E42 violations** in `review_notes`.

Any negative rating resets the count. Any E42 violation routes to quality_auditor immediately.

Feedback_collector writes proposals for these promotions; Pradeep approves or denies.

## Clustering algorithm — pattern to encode

Given N unclustered phrases from `student_confusion_log` for a given (concept_id, state_id):

1. Embed each phrase (Haiku or a cheap embedding model — design decision for Phase I).
2. Cluster with a similarity threshold (cosine ≥ 0.75) — small k, manually verified in the proposal review.
3. For each cluster of ≥5 phrases across ≥3 distinct sessions:
   - Deduplicate against existing active clusters (skip if any existing cluster has cosine ≥ 0.75).
   - Propose a new cluster_id (snake_case, noun phrase summarizing the misconception).
   - Sample 5 phrases verbatim as `trigger_examples`.
   - Confidence score = min cluster similarity × sqrt(cluster size).

## Rating trend math — encode in proposal

For `drill_down_cache` rows with `served_count ≥ 20`:
- `negative_rate = negative_count / (positive_count + negative_count)`
- If `negative_rate ≥ 0.4` → `archive_cluster` proposal.
- If `negative_rate < 0.1` AND `served_count ≥ 20` AND `status = 'pending_review'` → auto-promotion candidate (proposal kind `flag_sub_sim` with `decision_notes: "auto-promote eligible"`).

## Do-no-harm discipline

Three hard rules derived from Pradeep's operating principles:

1. **Never touch sacred tables** (CLAUDE.md §3 NEVER DELETE list): `student_confusion_log`, `ncert_content`, `ai_usage_log`, `chat_feedback`, `variant_feedback`, `simulation_feedback`, etc. Read only.
2. **Never push changes live.** Every write is a proposal, never a cache mutation or registry edit.
3. **Never auto-delete or archive student data.** Archiving a cluster doesn't delete the student_confusion_log rows that fed into it; it only marks the cluster row `status = 'archived'`. History is forever.

## Cross-cutting rule

DC Pandey is scope reference only. This agent consumes student signal, not textbook content. HC Verma / NCERT / PYQ are irrelevant here — the agent's job is to listen to students, not to consult books.

## Engine bug queue consultation (pre-clustering)

Before producing proposals, query `engine_bug_queue` for prevention rules across all owner clusters (this agent reads cross-cutting patterns):

```sql
SELECT bug_class, prevention_rule, owner_cluster, severity
FROM engine_bug_queue
WHERE status = 'FIXED'
ORDER BY severity DESC, owner_cluster;
```

Read every `prevention_rule`. If a confusion cluster you are about to propose matches a known FIXED bug class (e.g., students confused about a concept where bug #14 — annotation contrast — was fixed), document the cross-reference in the proposal `payload` so the reviewer sees: *"this confusion cluster may be a regression of `engine_bug_queue.bug_class = annotation_contrast_unreadable`; recommend re-running the Gate 8 probe on the affected concept before approving the new cluster."* That keeps Phase-I learning loops aware of the bug ledger and prevents proposing student-side fixes for engine-side regressions.

## Self-review checklist

- [ ] Every query is SELECT or writes to `proposal_queue` only.
- [ ] Every proposal has non-empty `evidence` (raw phrases, session counts, rating trends).
- [ ] Every `new_cluster` proposal verified against existing active clusters for cosine ≤ 0.75 similarity.
- [ ] Every cluster in `archive_cluster` proposal has ≥20 served_count.
- [ ] Confidence scores are 0..1, calibrated (don't propose at 0.99 when the cluster has 6 phrases).
- [ ] Report excludes phrases with PII (email addresses, phone numbers, names). Use simple regex gate.
- [ ] Engine bug queue cross-referenced; any cluster overlapping a known FIXED bug class is annotated in the proposal payload.
- [ ] Summary line: "N new-cluster proposals, M archive-cluster proposals, K flag-sub-sim proposals — awaiting review".

## This agent is design-only for now

The `proposal_queue` table does not exist as of session 31. Phase I (see PLAN.md) builds it + the admin review UI. This spec locks the contract so when the table is created, the agent's inputs/outputs/tools are already decided.

**Before running this agent**:
1. `proposal_queue` table must exist with the schema above.
2. An admin review UI at `/admin/proposals` must exist for Pradeep to approve / deny / edit proposals.
3. At least 500 rows in `student_confusion_log` (current ~159) to have enough signal for clustering.

## Escalation

If clustering surfaces a concept-level issue (e.g., 30% of students on `normal_reaction` STATE_3 report the same confusion not covered by any existing cluster), that's an **architect re-open**, not a feedback proposal. Route to architect for new EPIC-C branch authoring.

If a single student's phrases repeatedly route to low-confidence clusters, that's a classifier issue (bump `CONFIDENCE_THRESHOLD` retraining need), not a registry issue. Route to PLAN.md Phase I classifier work.
