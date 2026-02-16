#!/usr/bin/env bash
# Run the full pipeline in order: collect → assign → enrich.
# Full enrich runs automatically after collect finishes. One command, walk away.
# Usage: cd tumbo-subframe && bash scripts/run-full-pipeline.sh

set -e
cd "$(dirname "$0")/.."

echo "════════════════════════════════════════════════════════"
echo "  STEP 1/3: Review collection (Outscraper)"
echo "════════════════════════════════════════════════════════"
node scripts/review-collect.js

echo ""
echo "════════════════════════════════════════════════════════"
echo "  STEP 2/3: Assign reviews to classes"
echo "════════════════════════════════════════════════════════"
node scripts/review-assign.js

echo ""
echo "════════════════════════════════════════════════════════"
echo "  STEP 3/3: Full enrichment (GPT synthesis)"
echo "════════════════════════════════════════════════════════"
node scripts/full-enrich.js

echo ""
echo "════════════════════════════════════════════════════════"
echo "  PIPELINE COMPLETE"
echo "════════════════════════════════════════════════════════"
