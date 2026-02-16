# Cost & API rules — avoid surprise bills

**Reference:** A ~$900 Google Cloud bill (CLOUD NWv9RK) occurred because Google Places API usage was not estimated or disclosed before large data pulls. This doc explains what likely caused it and enforces rules so it doesn’t happen again.

---

## What likely caused the ~$900 Google bill

All of these use **Google Places API** (or Places API New) with `GOOGLE_PLACES_API_KEY`:

| Script | What it does | Likely cost driver |
|--------|----------------|--------------------|
| **nearby-places-fetch.js** | For each provider with Place ID: 1× Place Details (location) + **6× Nearby Search** (food, cafes, remote, groceries, parking, transit). | **Main cause.** We ran it with **4,026 providers** → ~4,026 + (4,026 × 6) = **~28,000 API calls**. At Places (New) pricing (e.g. tens of dollars per 1k requests), this alone can reach **hundreds to ~$900**. |
| google-places-fetch.js | Place Details + Text Search per provider. | Large provider count = many calls. |
| pipeline-prep-new-providers.js | searchText (Places API New) per provider. | Scales with provider count. |
| google-places-expansion.js | Text Search + Place Details, 100+ keywords. | Many search + details calls. |
| targeted-gap-scraper.js | Places API (New) searchText. | Depends on run size. |

**Conclusion:** The **nearby-places-fetch.js** run over **4,026 providers** (no `--limit`) is the most plausible source of the ~$900 bill. There are **no recurring/scheduled data pulls** in this repo (no cron, no Vercel cron for these scripts); all runs are one-off from the terminal or CI.

---

## Red-flag rules (mandatory)

1. **Any new or existing script that calls a paid external API (Google, OpenAI, Outscraper, etc.) must:**
   - Document in the script header (or this doc): **which API**, **rough cost per unit** (e.g. per 1k requests), and **max scale** (e.g. “run over N providers”).
   - If the script can run over “all” rows (no limit), it must **require an explicit flag** (e.g. `--all`) or **require `--limit=N`** and refuse to run unbounded by default.

2. **Cost disclosure before large runs:**
   - **OpenAI:** Documented in `scripts/ENGINE.md` (~$5–10 for full enrich). No surprise.
   - **Outscraper:** Documented (~$78 for ~26k reviews). No surprise.
   - **Google Places:** Was **not** documented. Now documented here and in script headers; scripts must warn or require `--limit` / `--all`.

3. **No recurring expenses for data pulls:**
   - Do **not** add cron jobs, Vercel cron, or scheduled scripts that call paid APIs (Google, OpenAI, Outscraper) without **explicit written approval** and a **cost cap** (e.g. budget alert at $X/month).
   - One-off runs from the terminal are allowed; recurring automation is not unless approved.

4. **Where to document:**
   - Script header: `Requires: GOOGLE_PLACES_API_KEY. Cost: ~$X per 1k providers (see docs/COST_AND_API_RULES.md). Use --limit=N for testing.`
   - This file: keep the table above updated when adding or changing API usage.

---

## Safeguards added in code

- **nearby-places-fetch.js:** Requires `--limit=N` or `--all`. If run without either, it exits with a cost warning and instructs to pass `--limit` or `--all` explicitly. No unbounded run by default.
- **.cursorrules:** Require cost disclosure and no unbounded/recurring paid API runs without approval.

---

## Quick reference: approved cost ranges (documented)

| Service | Typical use | Approx cost (documented) |
|---------|-------------|--------------------------|
| OpenAI (GPT-4o-mini) | full-enrich.js | ~$5–15 per full run (~2.3k classes) |
| Outscraper | review-collect.js | ~$78 for ~26k reviews |
| **Google Places** | nearby-places-fetch, google-places-fetch, pipeline-prep, etc. | **High risk:** can be **hundreds to ~$900** if run over thousands of providers without limit. Always use `--limit=N` for testing; use `--all` only when cost is accepted. |

---

## If you get another unexpected bill

1. Check **Google Cloud Console → Billing → Reports** and filter by product (e.g. Places API).
2. Match to scripts in this repo that use `GOOGLE_PLACES_API_KEY`.
3. Add or tighten `--limit` and cost warnings in those scripts and in this doc.
