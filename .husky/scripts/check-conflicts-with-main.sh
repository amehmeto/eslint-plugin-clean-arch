#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

# Skip check for main
if [ "$branch" = "main" ]; then
  exit 0
fi

# Fetch latest main silently
git fetch origin main --quiet 2>/dev/null

# Check if branch is behind main
behind="$(git rev-list --count HEAD..origin/main 2>/dev/null)"
if [ "$behind" -gt 0 ] 2>/dev/null; then
  printf "\n⚠️  Your branch is %s commit(s) behind main.\n" "$behind"
  printf "   Consider rebasing: git rebase origin/main\n\n"
fi

# Check for merge conflicts using merge-tree (requires Git 2.38+)
merge_base="$(git merge-base HEAD origin/main 2>/dev/null)"
if [ -n "$merge_base" ]; then
  # Requires Git 2.38+ for --write-tree/--no-messages flags
  git merge-tree --write-tree --no-messages HEAD origin/main >/dev/null 2>&1 || {
    printf "\n❌ Your branch has merge conflicts with main.\n"
    printf "   Please rebase and resolve conflicts before pushing:\n"
    printf "   git rebase origin/main\n\n"
    exit 1
  }
fi
