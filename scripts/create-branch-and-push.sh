#!/usr/bin/env bash
# Run this from your terminal (e.g. ./scripts/create-branch-and-push.sh) to create
# feat/console-log-cleanup, commit, push, create PR, and merge into main.

set -e
cd "$(dirname "$0")/.."

echo "=== Frontend: feat/console-log-cleanup ==="
git checkout -b feat/console-log-cleanup 2>/dev/null || git checkout feat/console-log-cleanup
git add -A
git status
if git diff --staged --quiet; then
  echo "Nothing to commit."
else
  git commit -m "chore(logging): remove console.log from app code

- Remove console.log from TrailmapPersonasDisplay, PageDetailPage, projectStore
- Remove console.log from AuthContext and dataForSEOService
- Keep console.warn and console.error for real errors"
fi
git push -u origin feat/console-log-cleanup

echo ""
echo "=== Creating PR and merging ==="
gh pr create --base main --head feat/console-log-cleanup \
  --title "chore(logging): remove console.log from app code" \
  --body "Removes console.log from frontend app code. Keeps console.warn and console.error for real errors."
gh pr merge feat/console-log-cleanup --merge

echo ""
echo "=== Updating local main ==="
git checkout main
git pull origin main
echo "Done. Frontend PR merged into main."
