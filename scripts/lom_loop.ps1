# lom_loop.ps1 - outer wrapper for the Laws of Motion chapter loop (worktree B, feat/lom-b)
#
# One concept per SESSION: each iteration launches a brand-new headless `claude -p` session that
# completes exactly ONE concept (resuming any in_flight one from disk), seals/parks it, updates the
# state file, and exits. Fresh session = empty context window = no growing cache-read tax.
#
# NOTE: this file must stay PURE ASCII - PowerShell 5.1 reads BOM-less files as ANSI and UTF-8
# punctuation (em-dash etc.) decodes into smart-quote bytes that break string parsing.
#
# Safety:
#   - ENGINE GATE: iteration 1 does not start until the newtons_laws_body engine is committed
#     (docs/loop_runs/phase0_engine_report.md exists AND engine_commits: in the state file is not
#     "(none yet)"). Authoring a concept before the engine exists would be wasted tokens.
#   - QUIESCENCE GATE: waits until this worktree's transcripts have been quiet for >= 3 minutes
#     before iteration 1, so it is safe to start while the Phase 0 session is still finishing.
#   - STALL GUARD: an iteration that ends with the state file unchanged is a stall; 2 consecutive
#     stalls stop the wrapper - it never burns tokens in a retry loop.
#   - MAX 5 iterations (3 concepts + headroom for fix cycles).
#
# Run detached:  Start-Process powershell -ArgumentList '-ExecutionPolicy','Bypass','-NoProfile','-File','scripts\lom_loop.ps1' -WorkingDirectory 'C:\Tutor\physics-mind-lom-b' -WindowStyle Hidden

$ErrorActionPreference = 'Continue'

$Repo         = 'C:\Tutor\physics-mind-lom-b'
$StateFile    = Join-Path $Repo 'docs\loop_runs\lom_b_state.md'
$EngineReport = Join-Path $Repo 'docs\loop_runs\phase0_engine_report.md'
$WrapDir      = Join-Path $Repo 'docs\loop_runs\wrapper'
$ProjectsDir  = 'C:\Users\PRADEEEP\.claude\projects\C--Tutor-physics-mind-lom-b'
$MaxIter      = 5
$QuietSeconds = 180
# Quota-conservation directive (founder 2026-07-25): medium effort for the authoring loop.
# The expensive engine work is already done in Phase 0; these iterations are JSON authoring.
$Effort       = 'medium'

$RemainingConcepts = @('newton_first_law', 'newton_second_law', 'newton_third_law')

if (-not (Test-Path $WrapDir)) { New-Item -ItemType Directory -Force $WrapDir | Out-Null }
$MainLog = Join-Path $WrapDir 'wrapper.log'

function Log([string]$msg) {
    $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
    Add-Content -Path $MainLog -Value $line -Encoding utf8
}

function Get-StateText {
    if (Test-Path $StateFile) { return (Get-Content $StateFile -Raw) }
    return ''
}

function Test-EngineReady {
    # This branch INHERITS the newtons_laws_body engine from feat/lom-a rather than building it,
    # so the gate is a DIRECT check that the scenario is present in the renderer - not a
    # state-file naming convention. Always true in practice, kept as a cheap guard against
    # someone creating this worktree from the wrong base commit.
    $renderer = Join-Path $Repo 'src\lib\renderers\field_3d_renderer.ts'
    if (-not (Test-Path $renderer)) { return $false }
    return [bool](Select-String -Path $renderer -Pattern 'newtons_laws_body' -SimpleMatch -Quiet)
}

function Test-ChapterDone {
    $state = Get-StateText
    if (-not $state) { return $false }
    $doneLine   = ($state -split "`n" | Where-Object { $_ -match '^done:' }) -join ' '
    $parkedLine = ($state -split "`n" | Where-Object { $_ -match '^parked:' }) -join ' '
    foreach ($c in $RemainingConcepts) {
        $sealed = $doneLine -match [regex]::Escape($c)
        $parked = $parkedLine -match [regex]::Escape($c)
        if (-not ($sealed -or $parked)) { return $false }
    }
    return $true
}

function Test-Quiescent {
    $newest = Get-ChildItem -Path $ProjectsDir -Filter '*.jsonl' -File -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($null -eq $newest) { return $true }
    $age = (New-TimeSpan -Start $newest.LastWriteTime -End (Get-Date)).TotalSeconds
    return ($age -ge $QuietSeconds)
}

Log "=== lom_loop (worktree B) starting (max $MaxIter iterations, effort=$Effort) ==="

# ---- Engine gate ----
$waitedEngine = 0
while (-not (Test-EngineReady)) {
    if ($waitedEngine % 600 -eq 0) { Log "waiting for the Phase 0 newtons_laws_body engine commit..." }
    Start-Sleep -Seconds 60
    $waitedEngine += 60
    if ($waitedEngine -ge 14400) { Log "engine gate timed out after 4h - STOPPING. Founder attention needed."; exit 1 }
}
Log "engine gate cleared - newtons_laws_body is committed."

# ---- Quiescence gate (iteration 1 only) ----
$waited = 0
while (-not (Test-Quiescent)) {
    if ($waited % 600 -eq 0) { Log "waiting for the previous session to go quiet (checking every 60s)..." }
    Start-Sleep -Seconds 60
    $waited += 60
}
Log "quiescence confirmed (no transcript writes for >= $QuietSeconds s)"

if (Test-ChapterDone) {
    Log "chapter already done per state file - nothing to do. Exiting."
    exit 0
}

$Prompt = 'Read docs/CHAPTER_LOOP.md and docs/loop_runs/lom_b_state.md. Complete exactly ONE concept: if the state file or working tree shows an in-flight concept (uncommitted artifacts under docs/loop_runs/lom/<concept>/ or an uncommitted src/data/concepts/<concept>.json), RESUME it from its furthest disk artifact - do not re-run completed pipeline stages. Otherwise start the next concept in the chapter map. The newtons_laws_body engine is ALREADY BUILT - every concept is pure JSON configuration per docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md section 6; if a concept appears to need a renderer change, STOP and park it with an engine_gap.md rather than extending the engine. Follow the protocol fully including Amendment 4 (ONE bug_class per engine dispatch, field_3d engine work goes to the field3d-surgeon agent) and Amendment 6 (no founder-proxy; quality-auditor PASS plus eye-walker clean auto-triggers visual:approve). Dispatch quality-auditor and eye-walker IN PARALLEL and never load frame PNGs into your own context. When the concept is SEALED or PARKED and the state file is updated, EXIT the session. Do not start another concept. Constraints: no tts, no PILOT_CONCEPTS, no build:pilot, no deploy, no master merge, no engine_bug_queue DB writes, no paid smoke:visual-validator.'

$stalls = 0
for ($i = 1; $i -le $MaxIter; $i++) {
    if (Test-ChapterDone) { Log "chapter done - stopping after $($i-1) iteration(s)."; break }

    $before = Get-StateText
    $iterLog = Join-Path $WrapDir ("iter_{0}.log" -f $i)
    Log "iteration $i starting -> $iterLog"

    $effortArg = ''
    if ($Effort -ne '') { $effortArg = " --effort $Effort" }
    $cmdLine = "cd /d `"$Repo`" && claude -p `"$Prompt`" --dangerously-skip-permissions$effortArg > `"$iterLog`" 2>&1"
    $proc = Start-Process cmd.exe -ArgumentList '/c', $cmdLine -WorkingDirectory $Repo -Wait -PassThru -WindowStyle Hidden
    Log ("iteration $i finished (exit code {0})" -f $proc.ExitCode)

    $after = Get-StateText
    if ($after -eq $before) {
        $stalls++
        Log "STALL: state file unchanged after iteration $i (consecutive stalls: $stalls)"
        if ($stalls -ge 2) {
            Log "2 consecutive stalls - STOPPING the wrapper. Founder attention needed; see iter logs."
            break
        }
    } else {
        $stalls = 0
    }
}

if (Test-ChapterDone) {
    Log "=== lom-b COMPLETE per state file. Wrapper exiting. ==="
} else {
    Log "=== wrapper exiting WITHOUT completion (iteration cap or stall guard). ==="
}
