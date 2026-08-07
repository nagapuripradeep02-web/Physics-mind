#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# check-autopush-hook — regression gate for .githooks/post-commit
#
# WHY THIS EXISTS (the scar):
#   On 2026-08-07 the auto-push hook was failing on four of four worktrees
#   (11 FAILED/SKIP vs 6 ok). Two rounds of platform engine work on
#   feat/pcpl-readout-placement existed on exactly ONE disk because the hook
#   had never once succeeded there -- the precise failure the hook was written
#   to prevent, silently reintroduced. Nothing caught it: the hook is not
#   typechecked, not linted, not imported by anything, and it reports its own
#   failures into a log nobody reads.
#
#   Each case below is a defect that actually shipped. Each fails against the
#   pre-fix hook and passes against the current one -- verified both ways
#   before this gate was written, so a green run means something.
#
# CONTRACT: hermetic. Temp bare repos on local disk, isolated git config, no
#   network, no credentials, no reliance on the developer's own settings.
#   Tests the TRACKED SOURCE (.githooks/post-commit), never an installed copy.
#
# Usage: npm run check:autopush-hook
# ---------------------------------------------------------------------------
set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK="${1:-$REPO_ROOT/.githooks/post-commit}"

[ -f "$HOOK" ] || { echo "FAIL: hook not found at $HOOK"; exit 1; }

PASS=0; FAIL=0
_ok()   { printf '  PASS  %s\n' "$1"; PASS=$((PASS+1)); }
_bad()  { printf '  FAIL  %s\n' "$1"; FAIL=$((FAIL+1)); }

# Every sandbox git command runs with a scratch global config so a developer's
# push.default / autoSetupMerge cannot mask or fake a result.
_sandbox() {
  SB="$(mktemp -d)"
  export GIT_CONFIG_GLOBAL="$SB/gitconfig" GIT_CONFIG_NOSYSTEM=1
  export GIT_TERMINAL_PROMPT=0
  git config --global user.email hook-test@example.invalid
  git config --global user.name  "hook test"
  git config --global init.defaultBranch master
  # push.default is deliberately left at git's own default ('simple').
  # That default IS the trigger for case 1 -- pinning it here would erase the bug.
}
_cleanup() { [ -n "${SB:-}" ] && rm -rf "$SB"; }

# Poll until the remote branch reaches $1, or give up. The hook detaches its
# push, so there is nothing to wait on but the result.
_await_ref() {
  local want="$1" remote="$2" ref="$3" i
  for i in $(seq 1 40); do
    [ "$(git ls-remote "$remote" "$ref" 2>/dev/null | cut -f1)" = "$want" ] && return 0
    sleep 1
  done
  return 1
}

echo "check-autopush-hook — $HOOK"

# ---------------------------------------------------------------------------
# CASE 1 — upstream name != branch name  (shipped defect: rc=128)
#
# A worktree branched from a remote-tracking start point inherits upstream
# origin/master. The pre-fix hook only asked "does an upstream exist?", which
# is TRUE here, so it ran a bare `git push`; push.default=simple then fatals:
#   "The upstream branch of your current branch does not match the name of
#    your current branch."
# feat/pcpl-readout-placement: 0 successes, 2 failures, engine work stranded.
# ---------------------------------------------------------------------------
_sandbox
git init -q --bare "$SB/remote.git"
git clone -q "$SB/remote.git" "$SB/w" 2>/dev/null
(
  cd "$SB/w" || exit 1
  echo a > a.txt; git add .; git commit -qm init; git push -q origin master
  git checkout -qb feat/x
  git branch --set-upstream-to=origin/master feat/x >/dev/null 2>&1
  install -m 755 "$HOOK" .git/hooks/post-commit
  echo b > b.txt; git add .; git commit -qm case1 >/dev/null 2>&1
) >/dev/null 2>&1
TIP="$(git -C "$SB/w" rev-parse HEAD 2>/dev/null)"
if _await_ref "$TIP" "$SB/remote.git" refs/heads/feat/x; then
  _ok "upstream=origin/master still auto-pushes (no push.default dependency)"
else
  _bad "upstream=origin/master did NOT push -- bare-push/push.default regression"
fi
_cleanup

# ---------------------------------------------------------------------------
# CASE 2 — a transient rejection must be retried  (shipped defect: dead loop)
#
# `for attempt in 1 2 3` could never reach iteration 2 after a failure: the
# failure branch returned immediately, so only a SHA change re-looped. Every
# transient error was permanent. The remote below rejects attempt 1 and accepts
# the rest, so the branch lands ONLY if the hook genuinely retries.
# ---------------------------------------------------------------------------
_sandbox
git init -q --bare "$SB/remote.git"
cat > "$SB/remote.git/hooks/pre-receive" <<'PRE'
#!/usr/bin/env bash
C="$GIT_DIR/reject_count"
n=$(cat "$C" 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > "$C"
[ "$n" -le 1 ] && { echo "simulated transient failure" >&2; exit 1; }
exit 0
PRE
chmod +x "$SB/remote.git/hooks/pre-receive"
git clone -q "$SB/remote.git" "$SB/w" 2>/dev/null
(
  cd "$SB/w" || exit 1
  echo a > a.txt; git add .; git commit -qm init
  git push -q origin master 2>/dev/null   # consumes the first rejection
  git checkout -qb feat/x
  git push -q --set-upstream origin feat/x 2>/dev/null
  rm -f "$SB/remote.git/reject_count"     # re-arm: next push is rejected once
  install -m 755 "$HOOK" .git/hooks/post-commit
  echo d > d.txt; git add .; git commit -qm case2 >/dev/null 2>&1
) >/dev/null 2>&1
TIP="$(git -C "$SB/w" rev-parse HEAD 2>/dev/null)"
if _await_ref "$TIP" "$SB/remote.git" refs/heads/feat/x; then
  _ok "transient rejection is retried and recovers"
else
  _bad "transient rejection was NOT retried -- retry loop is dead again"
fi
_cleanup

# ---------------------------------------------------------------------------
# CASE 3 — a stale failure must not read as a live one  (shipped defect: UX)
#
# autopush.status is surfaced on the NEXT commit. Pre-fix it printed a bare
# "auto-push FAILED" after a commit whose own push then succeeded seconds
# later, so an operator debugged a working push. It must be framed as EARLIER.
# ---------------------------------------------------------------------------
_sandbox
git init -q --bare "$SB/remote.git"
cat > "$SB/remote.git/hooks/pre-receive" <<'PRE'
#!/usr/bin/env bash
[ -f "$GIT_DIR/allow" ] && exit 0
echo "rejected" >&2; exit 1
PRE
chmod +x "$SB/remote.git/hooks/pre-receive"
touch "$SB/remote.git/allow"
git clone -q "$SB/remote.git" "$SB/w" 2>/dev/null
(
  cd "$SB/w" || exit 1
  echo a > a.txt; git add .; git commit -qm init
  git push -q origin master 2>/dev/null
  git checkout -qb feat/x
  git push -q --set-upstream origin feat/x 2>/dev/null
  install -m 755 "$HOOK" .git/hooks/post-commit
  rm -f "$SB/remote.git/allow"            # every push now fails
  echo b > b.txt; git add .; git commit -qm will-fail >/dev/null 2>&1
) >/dev/null 2>&1
# Wait for the detached push to exhaust its retries and write the status file.
for _ in $(seq 1 40); do [ -f "$SB/w/.git/autopush.status" ] && break; sleep 1; done
if [ ! -f "$SB/w/.git/autopush.status" ]; then
  _bad "no autopush.status written after an unrecoverable failure"
else
  touch "$SB/remote.git/allow"            # pushes work again
  OUT="$(cd "$SB/w" && echo c > c.txt && git add . && git commit -m next 2>&1)"
  if printf '%s' "$OUT" | grep -qi 'EARLIER'; then
    _ok "stale failure is reported as EARLIER, not as this commit's"
  else
    _bad "stale failure surfaced without an EARLIER frame -- reads as a live failure"
  fi
fi
_cleanup

# ---------------------------------------------------------------------------
# CASE 5 — the per-worktree lock must not leak between pushes
#          (shipped defect: local var invisible to the EXIT trap)
#
# The hook serialized pushes with `mkdir "$LOCK"` and cleaned up via
# `trap 'rmdir "$LOCK"' EXIT`. Broken twice over, both verified empirically:
# LOCK was `local` so the trap's expansion was empty by fire time -- and
# deeper, bash does NOT run EXIT traps at all when the subshell is a
# backgrounded function call (`_pm_autopush ... &`), so no EXIT-trap variant
# can work in this hook's shape. The lock dir leaked on EVERY push; release
# must be explicit code on the push path, which is what this case pins.
# Any commit within the 10-minute stale-reclaim window then read the leaked
# lock as "a push is already in flight" and silently skipped. The hook's own
# comment claimed the next push is cumulative -- true within one branch,
# FALSE across `git checkout -b`, which is exactly how it was caught
# (observed 2026-08-07: a new branch's first commit never pushed).
#
# This case makes two commits back-to-back on the SAME branch and asserts
# BOTH land. The first push's leaked lock makes the second a silent no-op,
# so the pre-fix hook fails on the second assertion. Same-branch is the
# WEAKER form of the observed failure -- if even the cumulative-push
# argument's home turf drops the commit, the cross-branch case is a
# fortiori. Not time-dependent: the leak persists until reclaim, and the
# whole test runs well inside 10 minutes.
# ---------------------------------------------------------------------------
_sandbox
git init -q --bare "$SB/remote.git"
git clone -q "$SB/remote.git" "$SB/w" 2>/dev/null
(
  cd "$SB/w" || exit 1
  echo a > a.txt; git add .; git commit -qm init; git push -q origin master
  git checkout -qb feat/x
  git push -q --set-upstream origin feat/x 2>/dev/null
  install -m 755 "$HOOK" .git/hooks/post-commit
  echo b > b.txt; git add .; git commit -qm first >/dev/null 2>&1
) >/dev/null 2>&1
TIP1="$(git -C "$SB/w" rev-parse HEAD 2>/dev/null)"
if ! _await_ref "$TIP1" "$SB/remote.git" refs/heads/feat/x; then
  _bad "lock-leak setup: the FIRST push did not land (cannot exercise the leak)"
else
  (
    cd "$SB/w" || exit 1
    echo c > c.txt; git add .; git commit -qm second >/dev/null 2>&1
  ) >/dev/null 2>&1
  TIP2="$(git -C "$SB/w" rev-parse HEAD 2>/dev/null)"
  if _await_ref "$TIP2" "$SB/remote.git" refs/heads/feat/x; then
    _ok "back-to-back commits both push (lock released between pushes)"
  else
    _bad "second commit silently dropped -- the push lock leaked"
  fi
fi
_cleanup

# ---------------------------------------------------------------------------
# CASE 4 — the hook must never force-push. Static, but this is the one
# property whose violation is unrecoverable, so it is asserted directly.
# ---------------------------------------------------------------------------
if grep -Eq '(^|[^-])--force([^-]|$)|--force-with-lease' \
     <(grep -v '^[[:space:]]*#' "$HOOK" | grep -v 'printf'); then
  _bad "hook contains a force-push in executable code"
else
  _ok "no force-push anywhere in executable code"
fi

echo
if [ "$FAIL" -gt 0 ]; then
  echo "check-autopush-hook: $PASS passed, $FAIL FAILED"
  exit 1
fi
echo "check-autopush-hook: $PASS passed, 0 failed — ALL AUTOPUSH HOOK CHECKS PASS"
exit 0
