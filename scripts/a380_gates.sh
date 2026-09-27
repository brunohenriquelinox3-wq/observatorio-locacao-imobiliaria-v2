#!/usr/bin/env bash
set -euo pipefail

project=/home/ubuntu/observatorio-locacao-imobiliaria-v2
logdir=/tmp/a380-gates
rm -rf "$logdir"
mkdir -p "$logdir"
cd "$project"
rm -rf dist .netlify

run_gate() {
  local name="$1"
  shift
  printf '== %s ==\n' "$name"
  "$@" >"$logdir/$name.log" 2>&1
  tail -n 12 "$logdir/$name.log"
  printf 'PASS %s\n' "$name"
}

run_gate test pnpm test
run_gate check pnpm check
run_gate build pnpm build
run_gate build-netlify pnpm build:netlify
run_gate skill python3 /home/ubuntu/skills/skill-creator/scripts/quick_validate.py finance-internal-release-qa

test -f dist/public/index.html
test -f dist/netlify-functions-check/api.js
printf 'PASS artifacts\n'

git diff --check
! git diff --unified=0 | grep -E '^\+.*(paymentStatus|paidAt|settledAt|receivedCents|fetch\(|supabase\.rpc|Pix|transferência|split bancário|repasse)'
test ! -d .netlify
test ! -d dist/.netlify
printf 'PASS hygiene\n'
printf 'A380_GATES_PASS\n'
