# Resume pipeline — reference for when you're back

**When you return, say to the agent:** “Revisit the RESUME_HERE reference” or “Check docs/RESUME_HERE.md and continue the pipeline.”

---

## Snapshot (last updated)

- **Outscraper files:** **834** provider JSONs in `data/outscraper/`. Review collection may still be running in another terminal to reach 986.
- **Review assign:** **Done** (831 files → 20,395 reviews assigned to classes). Run via `run-assign-then-enrich.sh` or `node scripts/review-assign.js`.
- **Full enrich:** **In progress** — 89 classes need enrichment; running in terminal (e.g. `run-assign-then-enrich.sh`). Let it finish (~1–2 min per class). When done you’ll see `DONE: X enriched`.

## When you're back — do this in order

1. **Finish review collection** (picks up where it left off; skips already-collected providers):
   ```bash
   cd tumbo-subframe
   node scripts/review-collect.js
   ```
   Wait until it prints `DONE:` and "Next step: node scripts/review-assign.js". No `--limit`.

2. **Assign + enrich in one go** (runs automatically in sequence):
   ```bash
   bash scripts/run-assign-then-enrich.sh
   ```
   Or run separately: `node scripts/review-assign.js` then `node scripts/full-enrich.js`.

**Next time:** To run collect → assign → enrich in one shot (full enrich auto after collect), use:
   ```bash
   bash scripts/run-full-pipeline.sh
   ```

**Task tracking:** See **`docs/WORKFLOW_TASKS.md`** — single place for current task, next task, how to track progress, and **queued security phase** (runs after enrichment).

## Rules (unchanged)

- **ENGINE.md** = source of truth. Input order: (1) provider website, (2) solid Google reviews (≥10 for synthesis), (3) forums later.
- **Prompt:** `scripts/prompts/synthesis-system.md`. About section: no full address, no Google rating (those stay in info card + neighbourhood).
- **Outscraper:** Stratified 10 + 15 + 15. Retries on empty. Run fails (exit 1) if >10% of providers return no reviews.

## File locations

| What | Where |
|------|--------|
| Collected review JSONs | `tumbo-subframe/data/outscraper/{provider_id}.json` |
| This resume note | `tumbo-subframe/docs/RESUME_HERE.md` |
| **Task tracking (current / next / queued)** | **`tumbo-subframe/docs/WORKFLOW_TASKS.md`** |
| Full pipeline doc | `tumbo-subframe/docs/PIPELINE_STATUS.md` |
| Engine rules | `tumbo-subframe/scripts/ENGINE.md` |

---

*Revisit this file when you're back and ask the agent to continue from here.*
