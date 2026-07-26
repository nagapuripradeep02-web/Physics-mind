# ch7_loop.ps1 - outer wrapper for the Ch.7 chapter loop (Amendment 4, founder-approved 2026-07-24)
#
# One concept per SESSION: each iteration launches a brand-new headless `claude -p` session that
# completes exactly ONE concept (resuming any in_flight one from disk), seals/parks it, updates the
# state file, and exits. Fresh session = empty context window = no growing cache-read tax.
#
# NOTE: this file must stay PURE ASCII - PowerShell 5.1 reads BOM-less files as ANSI and UTF-8
# punctuation (em-dash etc.) decodes into smart-quote bytes that break string parsing.
#
# Safety:
#   - Pre-loop QUIESCENCE GATE: waits until the previous interactive loop session (if any) has been
#     quiet for >= 3 minutes before iteration 1 - safe to start this wrapper while the old session
#     is still running; it simply waits its turn. (Only gates iteration 1: later iterations' writes
#     are the wrapper's own children.)
#   - STALL GUARD: if an iteration ends with the state file unchanged (no seal, no park), that is a
#     stall; 2 consecutive stalls stop the wrapper - it never burns tokens in a retry loop.
#   - MAX 6 iterations (2 concepts remain + headroom for fix cycles).
#   - DONE CHECK: exits when lc_oscillations AND transformer are each sealed-or-parked.
#
# Run detached:  Start-Process powershell -ArgumentList '-ExecutionPolicy','Bypass','-NoProfile','-File','scripts\ch7_loop.ps1' -WorkingDirectory 'C:\Tutor\physics-mind-ch7' -WindowStyle Hidden

$ErrorActionPreference = 'Continue'

$Repo         = 'C:\Tutor\physics-mind-ch7'
$StateFile    = Join-Path $Repo 'docs\loop_runs\ch7_state.md'
$WrapDir      = Join-Path $Repo 'docs\loop_runs\wrapper'
$ProjectsDir  = 'C:\Users\PRADEEEP\.claude\projects\C--Tutor-physics-mind-ch7'
$MaxIter      = 6
$QuietSeconds = 180
# Optional: set to 'high' etc. to tier the session effort down from the account default.
# Left EMPTY deliberately (quality directive: founder's default effort applies).
$Effort       = ''

$RemainingConcepts = @('lc_oscillations', 'transformer')

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
    # True when the newest session transcript has not been written for $QuietSeconds.
    $newest = Get-ChildItem -Path $ProjectsDir -Filter '*.jsonl' -File -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($null -eq $newest) { return $true }
    $age = (New-TimeSpan -Start $newest.LastWriteTime -End (Get-Date)).TotalSeconds
    return ($age -ge $QuietSeconds)
}

Log "=== ch7_loop wrapper starting (max $MaxIter iterations) ==="

# ---- Pre-loop quiescence gate (iteration 1 only) ----
$waited = 0
while (-not (Test-Quiescent)) {
    if ($waited % 600 -eq 0) { Log "waiting for previous session to go quiet (checking every 60s)..." }
    Start-Sleep -Seconds 60
    $waited += 60
}
Log "quiescence confirmed (no transcript writes for >= $QuietSeconds s)"

if (Test-ChapterDone) {
    Log "chapter already done per state file - nothing to do. Exiting."
    exit 0
}

$Prompt = 'Read docs/CHAPTER_LOOP.md and docs/loop_runs/ch7_state.md. Complete exactly ONE concept: if the state file or working tree shows an in-flight concept (uncommitted artifacts under docs/loop_runs/ch7/<concept>/ or an uncommitted src/data/concepts/<concept>.json), RESUME it from its furthest disk artifact - do not re-run completed pipeline stages. Otherwise start the next concept in the chapter map. Follow the protocol fully including Amendment 4: engine dispatches are ONE bug_class each, field_3d engine work goes to the field3d-surgeon agent, and when the concept is SEALED or PARKED and the state file is updated, EXIT the session. Do not start another concept. Trial constraints hold: no DB writes, no visual:approve, no tts, no deploy, no master.'

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
    Log "=== ch7 chapter COMPLETE per state file. Wrapper exiting. ==="
} else {
    Log "=== wrapper exiting WITHOUT chapter completion (iteration cap or stall guard). ==="
}
