#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "main" ]; then
  printf "\n❌ Direct commits to main are not allowed.\n"
  printf "   Create a feature branch instead:\n"
  printf "   git checkout -b feat/my-feature\n\n"
  exit 1
fi
