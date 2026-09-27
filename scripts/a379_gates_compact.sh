#!/usr/bin/env bash
set -u
project=/home/ubuntu/observatorio-locacao-imobiliaria-v2
logdir=/tmp/a379-gates
rm -rf "$logdir"
mkdir -p "$logdir"
cd "$project" || exit 2
rm -rf dist .netlify
run_step() {
  name="$1"
  shift
  printf 'START %s\n' "$name"
  "$@" >"$logdir/$name.log" 2>&1
  code=$?
  printf 'END %s code=%s\n' "$name" "$code"
  if [ "$code" -ne 0 ]; then
    tail -80 "$logdir/$name.log"
    exit "$code"
  fi
}
run_step test pnpm test
run_step check pnpm check
run_step build pnpm build
run_step build_netlify pnpm build:netlify
test -f dist/public/index.html || { echo 'artifact public index missing'; exit 1; }
test -f dist/netlify-functions-check/api.js || { echo 'artifact function missing'; exit 1; }
printf 'ARTIFACTS public_index=present function_bundle=present\n'
if git diff --unified=0 -- . ':!pnpm-lock.yaml' | rg -n '^\+.*(paymentStatus|paidAt|settledAt|receivedCents|sk_live_|AKIA[0-9A-Z]{10,}|-----BEGIN|postgres://|mysql://)' >"$logdir/scan.log" 2>&1; then
  echo 'SAFETY_SCAN forbidden_added_marker=found'
  cat "$logdir/scan.log"
  exit 1
else
  echo 'SAFETY_SCAN forbidden_added_marker=none'
fi
git diff --check || exit 1
rm -rf .netlify dist/.netlify
test ! -d .netlify && test ! -d dist/.netlify || exit 1
printf 'HYGIENE diff_check=pass netlify_residue=absent\n'
printf 'FINAL_STATUS\n'
git status -sb
