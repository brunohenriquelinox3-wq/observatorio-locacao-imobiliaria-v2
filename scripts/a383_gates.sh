#!/usr/bin/env bash
set -euo pipefail
project=/home/ubuntu/observatorio-locacao-imobiliaria-v2
logs=/tmp/a383-gates
rm -rf "$logs"
mkdir -p "$logs"
cd "$project"
run() {
  local name="$1"; shift
  printf '== %s ==\n' "$name"
  "$@" >"$logs/$name.log" 2>&1
  tail -20 "$logs/$name.log"
  printf 'RESULT %s PASS\n' "$name"
}
rm -rf dist .netlify
run test pnpm test
run check pnpm check
run build pnpm build
run build_netlify pnpm build:netlify
printf '== artifacts ==\n'
test -f dist/public/index.html
test -f dist/netlify-functions-check/api.js
echo 'RESULT artifacts PASS'
printf '== skill ==\n'
python3 /home/ubuntu/skills/skill-creator/scripts/quick_validate.py subdivision-client-loteadora-release-qa
printf '== hygiene ==\n'
git diff --check
! test -d .netlify
! test -d dist/.netlify
echo 'RESULT hygiene PASS'
printf '== contract scan ==\n'
scan=$(mktemp)
{ git diff --unified=0 -- client/src server shared supabase/migrations; git ls-files --others --exclude-standard -- client/src server shared supabase/migrations -z | xargs -0 -r -n1 sed -n '1,99999p'; } >"$scan"
! rg -n -i 'payment_status|paid_at|settled_at|received_cents|bank_transfer|payment_intent' "$scan"
rm -f "$scan"
echo 'RESULT contract_scan PASS'
echo 'A383_GATES=PASS'
