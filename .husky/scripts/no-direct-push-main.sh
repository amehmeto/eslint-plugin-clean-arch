#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "main" ]; then
  printf "\n❌ Direct pushes to main are not allowed.\n"
  printf "   Push to a feature branch and open a PR instead.\n\n"
  exit 1
fi
