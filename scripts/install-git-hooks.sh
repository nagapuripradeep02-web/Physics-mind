#!/usr/bin/env bash
# install-git-hooks.sh
# Run ONCE from the repo root: bash scripts/install-git-hooks.sh
# Installs a pre-commit hook that blocks commits when agent emissions are stale.
#
# The git repo root IS physics-mind (verified: `git rev-parse --show-toplevel`
# returns C:/Tutor/physics-mind), so .agents/ and scripts/ live at the repo root.

set -euo pipefail

# Resolve repo root from this script's own location, robust to current directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
HOOK_DIR="$(git -C "$SCRIPT_DIR" rev-parse --absolute-git-dir)/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

mkdir -p "$HOOK_DIR"

cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env bash
# Pre-commit: block if any agent emission is stale vs its canonical.
# Repo root IS physics-mind — .agents/ and scripts/ live here.
REPO_ROOT="$(git rev-parse --show-toplevel)"

# Only run if the agent directory exists in this repo.
if [ ! -d "$REPO_ROOT/.agents" ]; then
  exit 0
fi

node "$REPO_ROOT/scripts/sync-agents.js" --check
if [ $? -ne 0 ]; then
  echo ""
  echo "  Fix: npm run sync:agents"
  echo "  Then re-stage the updated emission files and commit again."
  exit 1
fi
EOF

chmod +x "$HOOK_FILE"
echo "Installed pre-commit hook at: $HOOK_FILE"
echo "It will block commits when any agent emission is stale."
