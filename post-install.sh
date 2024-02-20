#!/usr/bin/env bash

if [[ -d "/home/ubuntu/" ]]; then
  exit 0
fi

EXISTS=

if [[ -f "./.husky/pre-commit" ]]; then
  EXISTS=`cat ./.husky/pre-commit | grep "npm run lint"`
fi

if [[ "$EXISTS" == "" ]]; then
  npm run prepare
  npx husky-init
  npx husky set .husky/pre-commit "# to skip it call git commit with HUSKY=0 git commit ...
if [[ \"\$HUSKY\" != \"0\" ]]; then
 npm run lint && git add -A && npm run test
fi
"
fi
