#!/bin/sh

if [ -n "$(git status --porcelain)" ]; then
  printf "\n❌ You have uncommitted changes.\n"
  printf "   Please commit or stash them before pushing.\n\n"
  git status --short
  exit 1
fi
