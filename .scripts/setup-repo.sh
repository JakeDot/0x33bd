#!/bin/bash
# .scripts/setup-repo.sh

# 1. Safety Check
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ Error: Not a git repo." && exit 1
fi

echo "🚀 Starting Full Repo Setup..."

# 2. PR Ref Mapping (Android Studio Branch Explorer)
git config --add remote.origin.fetch "+refs/pull/*/head:refs/remotes/origin/pr/*"

# 3. Workflow Defaults (Rebase & Prune)
git config pull.rebase true
git config fetch.prune true

# 4. Shared Hooks Integration (The Industry Standard)
# This tells Git to look in our committed folder instead of the hidden .git/hooks
mkdir -p .githooks
git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true

# 5. Final Sync
git fetch origin

echo "--------------------------------------------------------"
echo "✅ Environment Configured!"
echo "📍 PRs: Check 'origin/pr/' in Android Studio."
echo "🔄 Strategy: Pull --rebase is now DEFAULT."
echo "🔗 Hooks: Using .githooks/ for shared automation."
echo "--------------------------------------------------------"
