#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

# Skip check for main
if [ "$branch" = "main" ]; then
  exit 0
fi

# Allowed prefixes: feat/, fix/, refactor/, chore/, docs/, test/, ci/
valid_pattern="^(feat|fix|refactor|chore|docs|test|ci)/.+"

if ! printf '%s' "$branch" | grep -qE "$valid_pattern"; then
  printf "\n❌ Branch name '%s' does not follow the convention.\n" "$branch"
  printf "   Use one of: feat/, fix/, refactor/, chore/, docs/, test/, ci/\n"
  printf "   Example: feat/add-new-rule\n\n"
  exit 1
fi
