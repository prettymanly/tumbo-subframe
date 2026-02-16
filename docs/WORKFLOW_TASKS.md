# Workflow & task tracking

**Single place for: what’s running, what’s next, what’s queued.**  
**Agent:** When the user asks about progress, tasks, or “what’s next”, read this file (and RESUME_HERE.md if resuming the pipeline).

---

## 1. Current pipeline (content)

| Step | Status | How to track |
|------|--------|----------------|
| **Review collection** | Running or pending | Count files: `data/outscraper/*.json` (target 986). Or terminal: look for `DONE:` and "Next step: node scripts/review-assign.js". |
| **Review assign** | After collect done | Run `bash scripts/run-assign-then-enrich.sh` (does assign + enrich), or `node scripts/review-assign.js`. |
| **Full enrich** | After assign done | Part of `run-assign-then-enrich.sh`, or `node scripts/full-enrich.js`. Terminal: `[N/1270]` then "DONE: X enriched". |

**One-shot (next time):** `bash scripts/run-full-pipeline.sh` = collect → assign → enrich in order.

**Resume / commands:** See `docs/RESUME_HERE.md`.

**Close the 852→986 gap:** To get reviews (and then assign + enrich) for the ~134 providers that have Place IDs but no Outscraper JSON yet: run `node scripts/review-collect.js` (no `--limit`). It skips already-collected providers and only fetches the remainder. When it prints `DONE:`, run `bash scripts/run-assign-then-enrich.sh` to assign and enrich the new reviews.

---

## 2. Queued after enrichment (security & resilience)

**These tasks are queued to run after full enrichment is complete.** Agent: when user says “continue” or “next phase” after enrich is done, work through this list.

- [ ] **Backups:** Confirm Supabase automated daily backups are on; note retention (e.g. 7–30 days). If not, enable. Optional: document how to restore.
- [ ] **Least privilege:** Ensure app/scripts use a DB role that cannot run `TRUNCATE`, `DROP`, or unrestricted `DELETE FROM` on critical tables. Document which role is used where.
- [ ] **Script discipline:** Add a short `docs/SCRIPT_RULES.md` (or section in ENGINE.md): no bulk delete/truncate in scripts without an explicit flag or separate “dangerous ops” path; no raw SQL from prompts that can nuke tables.
- [ ] **Secrets:** Confirm DB URL and keys are only in env / server-side; not in frontend or repo. Document where secrets live and rotation if exposed.
- [ ] **Validation (optional):** Script or checklist that validates DB state (e.g. required fields, no duplicate place_id) and reports only — no auto-fix that deletes data.

---

## 3. Where things live

| What | Where |
|------|--------|
| **This task list** | `tumbo-subframe/docs/WORKFLOW_TASKS.md` |
| Resume pipeline | `tumbo-subframe/docs/RESUME_HERE.md` |
| Pipeline status / cost | `tumbo-subframe/docs/PIPELINE_STATUS.md` |
| Engine rules | `tumbo-subframe/scripts/ENGINE.md` |
| Collected reviews | `tumbo-subframe/data/outscraper/*.json` |

---

## 4. Snapshot (update when you run or resume)

- **Outscraper files:** 1237+ JSON files on disk (past 986). Gap 852→986 closed via collect (this or other run).
- **Assign + enrich:** Assign completed (25,852 reviews → classes). Full enrich run started (446 classes); check terminal for `DONE: X enriched` when it finishes. Re-run `bash scripts/run-assign-then-enrich.sh` anytime after new review-collect to refresh.
- **Neighbourhood (In the neighbourhood):** UI and pipeline done. To populate tabs: run `node scripts/nearby-places-fetch.js` (needs `GOOGLE_PLACES_API_KEY`).
- **After enrich:** Start security phase (Section 2 above).
