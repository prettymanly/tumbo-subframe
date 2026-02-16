# Pipeline status

**Last updated:** 2025-02-14

## Input priority (canonical)

1. **Provider website first** — Factual only (description, format, pricing). Never for sentiment.
2. **Solid number of Google reviews** — Stratified collection (~30–40 per provider). Baseline for full synthesis: **≥10 assigned reviews**. Not 3.
3. **Forums etc.** — Future.

## 3 posts for approval (website + stratified reviews + full synthesis)

| Class | Reviews | Link |
|-------|---------|------|
| ABC Cooking Studio Funan | 33 | https://tumbo.vercel.app/classes/17759277-04ad-4f0c-a50b-3198bb660391 |
| Abrakadoodle | 23 | https://tumbo.vercel.app/classes/c6fa4033-d73b-408c-803d-386bc4e7d1d0 |
| Achievers Arts — Regular Art Classes | 25 | https://tumbo.vercel.app/classes/5b27dad3-88d0-4d97-ae90-8b81c64cc748 |

Approved. Full pipeline started.

**Prompt tweaks applied:** About no longer repeats full address or Google rating (those stay in info card + neighbourhood). Neighbourhood UI note: logos of nearby places with name + distance.

## Current status: partial

| Step | Done | Total | Notes |
|------|------|--------|--------|
| **Review collect** | 2 providers | ~986 | 35 reviews in `data/outscraper/`. Full run not started. |
| **Review assign** | 2 providers | — | 35 reviews → 2 classes. Re-run after full collect. |
| **Full enrich** | 5 classes | ~1,270 | Only 5 enriched so far. Rest need synthesis after assign. |

**When you can read “all” quality posts:** after you run the full pipeline below. Est. **9–15 hours** total runtime (see table).

## Outscraper — fixed

- **Issue:** API returned 200 but no reviews (wrong response shape + missing `limit=1`).
- **Fix:** Added `limit=1`; handle both `data[0][0]` and `data[0]`. Fetch timeout 60s.
- **Test:** `node scripts/review-collect.js --test-one` returns 5 reviews.

## Full run (in progress)

**Step 1 — review-collect** is running in the background (all providers, no limit). Est. 5–9 hours. When it finishes:

```bash
cd tumbo-subframe
node scripts/review-assign.js
node scripts/full-enrich.js
```

Step 2 (assign) ~2 min. Step 3 (full-enrich) 4–6 hours. Total cost: ~$78 Outscraper + OpenAI.

## Full directory run (reference)

Run in order. Est. time and cost:

| Step | Command | Est. time | Est. cost |
|------|---------|-----------|-----------|
| 1. Collect reviews | `node scripts/review-collect.js` | **5–9 h** | ~$78 (Outscraper) |
| 2. Assign to classes | `node scripts/review-assign.js` | **~2 min** | — |
| 3. Synthesise all | `node scripts/full-enrich.js` | **4–6 h** | OpenAI (varies) |

**Total until you can read all quality posts:** about **9–15 hours** of script runtime (run overnight or in background).  
**Cost:** ~**$78** (Outscraper only). Plus **OpenAI** for full-enrich (~1,000+ class synthesis calls — typically another $5–20 depending on model and length). So total about **$85–100** for the full pipeline.

```bash
cd tumbo-subframe
node scripts/review-collect.js
node scripts/review-assign.js
node scripts/full-enrich.js
```

Optional: `--limit=N` on collect and enrich for smaller test runs.
