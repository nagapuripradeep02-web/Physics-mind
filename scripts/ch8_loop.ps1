# ch8_loop.ps1 - outer wrapper for the Ch.8 (EM Waves) chapter loop
# Replicated from ch7_loop.ps1 (Amendment 4) + Amendment 5 parallel-safety start gate.
#
# One concept per SESSION: each iteration launches a fresh headless `claude -p` session that
# completes exactly ONE concept, seals/parks it, updates ch8_state.md, and exits.
#
# PURE ASCII only (PowerShell 5.1 reads BOM-less files as ANSI; UTF-8 punctuation breaks parsing).
#
# Safety:
#   - CH7-READY GATE (Amendment 5): iteration 1 does NOT launch until ch7_state.md shows
#     lc_oscillations on its done: line. That guarantees the next ch7 session has already read
#     Amendment 5 and switched to SCOPED cache-clears, so no ch8 concept overlaps a ch7 session
#     doing unconditional full-table wipes of the shared dev Supabase.
#   - QUIESCENCE GATE: also waits until ch8's own project transcript dir is quiet (trivially true
#     at first start; guards a manual restart).
#   - STALL GUARD: 2 consecutive iterations with no state-file advance stop the wrapper.
#   - MAX 5 iterations (3 concepts + headroom for fix cycles).
#   - DONE CHECK: exits when all 3 concepts are sealed-or-parked.
#
# Run detached: Start-Process powershell -ArgumentList '-ExecutionPolicy','Bypass','-NoProfile','-File','scripts\ch8_loop.ps1' -WorkingDirectory 'C:\Tutor\physics-mind-ch8' -WindowStyle Hidden

$ErrorActionPreference = 'Continue'

$Repo         = 'C:\Tutor\physics-mind-ch8'
$StateFile    = Join-Path $Repo 'docs\loop_runs\ch8_state.md'
$Ch7StateFile = 'C:\Tutor\physics-mind-ch7\docs\loop_runs\ch7_state.md'
$WrapDir      = Join-Path $Repo 'docs\loop_runs\wrapper'
$ProjectsDir  = 'C:\Users\PRADEEEP\.claude\projects\C--Tutor-physics-mind-ch8'
$MaxIter      = 5
$QuietSeconds = 180
$Ch7Gate      = 'lc_oscillations'   # ch8 iter 1 waits until this appears on ch7_state.md done:
$Effort       = ''

$RemainingConcepts = @('displacement_current', 'em_wave_propagation', 'electromagnetic_spectrum')

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

function Test-Ch7Ready {
    # True once ch7's currently-running concept has sealed (its next session is Amendment-5-aware).
    if (-not (Test-Path $Ch7StateFile)) { return $true }   # ch7 gone/renamed -> no gate needed
    $txt = Get-Content $Ch7StateFile -Raw
    $doneLine = ($txt -split "`n" | Where-Object { $_ -match '^done:' }) -join ' '
    return ($doneLine -match [regex]::Escape($Ch7Gate))
}

function Test-Quiescent {
    $newest = Get-ChildItem -Path $ProjectsDir -Filter '*.jsonl' -File -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($null -eq $newest) { return $true }
    $age = (New-TimeSpan -Start $newest.LastWriteTime -End (Get-Date)).TotalSeconds
    return ($age -ge $QuietSeconds)
}

Log "=== ch8_loop wrapper starting (max $MaxIter iterations) ==="

# ---- Ch7-ready gate + quiescence gate (before iteration 1) ----
$waited = 0
while (-not (Test-Ch7Ready)) {
    if ($waited % 600 -eq 0) { Log "gate: waiting for ch7 '$Ch7Gate' to seal before starting ch8..." }
    Start-Sleep -Seconds 60
    $waited += 60
}
Log "gate: ch7 '$Ch7Gate' sealed -> ch7 is Amendment-5-aware, safe to run in parallel"

$waited = 0
while (-not (Test-Quiescent)) {
    if ($waited % 600 -eq 0) { Log "gate: waiting for ch8 project dir to go quiet..." }
    Start-Sleep -Seconds 60
    $waited += 60
}
Log "gate: ch8 quiescence confirmed"

if (Test-ChapterDone) {
    Log "chapter already done per state file - nothing to do. Exiting."
    exit 0
}

$Prompt = 'Read docs/CHAPTER_LOOP.md and docs/loop_runs/ch8_state.md. Complete exactly ONE concept: if the state file or working tree shows an in-flight concept (uncommitted artifacts under docs/loop_runs/ch8/<concept>/ or an uncommitted src/data/concepts/<concept>.json), RESUME it from its furthest disk artifact - do not re-run completed pipeline stages. Otherwise start the next concept in the chapter map. Follow the protocol fully including Amendment 4 (ONE bug_class per engine dispatch, field_3d engine work goes to the field3d-surgeon agent, one concept per session then EXIT) and Amendment 5 (use `npm run cache:clear:scoped -- <id>` NOT the unconditional wipe; field_3d regression sample = the state file regression_sample line = magnetisation_and_intensity + bar_magnet_as_dipole; review port 8088). When the concept is SEALED or PARKED and the state file is updated, EXIT the session. Do not start another concept. Trial constraints hold: no DB writes, no visual:approve, no tts, no deploy, no master.'

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
    Log "=== ch8 chapter COMPLETE per state file. Wrapper exiting. ==="
} else {
    Log "=== wrapper exiting WITHOUT chapter completion (iteration cap or stall guard). ==="
}
