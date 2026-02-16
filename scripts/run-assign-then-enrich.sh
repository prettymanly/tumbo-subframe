#!/usr/bin/env bash
# Run assign + enrich only. Use this when review-collect has already finished.
# Usage: cd tumbo-subframe && bash scripts/run-assign-then-enrich.sh

set -e
cd "$(dirname "$0")/.."

echo "════════════════════════════════════════════════════════"
echo "  STEP 1/2: Assign reviews to classes"
echo "════════════════════════════════════════════════════════"
node scripts/review-assign.js

echo ""
echo "════════════════════════════════════════════════════════"
echo "  STEP 2/2: Full enrichment (GPT synthesis)"
echo "════════════════════════════════════════════════════════"
node scripts/full-enrich.js

echo ""
echo "  DONE: assign + enrich complete."
