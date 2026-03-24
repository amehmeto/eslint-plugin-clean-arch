#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

# Skip check for main
if [ "$branch" = "main" ]; then
  exit 0
fi

# Check if a PR exists and is already merged
pr_state="$(gh pr view "$branch" --json state --jq '.state' 2>/dev/null)"

if [ "$pr_state" = "MERGED" ]; then
  printf "\n❌ This branch's PR has already been merged.\n"
  printf "   Create a new branch for further changes:\n"
  printf "   git checkout main && git pull && git checkout -b feat/new-branch\n\n"
  exit 1
fi
