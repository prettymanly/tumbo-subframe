# Image Sourcing Strategy — Plan

## Current setup (summary)

- **Listings:** Supabase `classes` table; each class has `photo_url`, `provider_id`, and `discovered_from` (JSON).
- **Providers:** `providers` table with `website`, `street_address`, `classes_scrape_source` (JSON containing `google_place_id`, `google_photos[]`, `google_website`, etc.).
- **Where images are set today:**
  - Seed/import scripts set `photo_url` manually or from Unsplash.
  - `google-places-fetch.js` (Node, run on demand) overwrites `photo_url` with a Google Places photo **only when** the current URL is Unsplash — no quality checks, no verification metadata.
- **Where it runs:** Build-time and client do **not** fetch images; all sourcing is in **Node scripts** in `scripts/`, run manually or via cron.
- **Rendering:** Class detail and cards use `cls.photo_url` with fallback to category placeholder or Unsplash default.

So: image sourcing is **server-side / script-time only**, and currently has no quality gate or verification trail.

---

## Proposed approach

### Where it runs

- **Same as today:** a Node script in `scripts/`, run on demand (e.g. `node scripts/source-class-images.js`) or scheduled. No build-time or client-side image discovery.

### Source order (cascade)

1. **Provider’s official website**
   - Prefer `og:image` / `twitter:image`.
   - If missing or failed quality check, scan the page for likely hero images (e.g. first large `<img>` in main content, or images in common hero selectors).
2. **Google Places (existing)**
   - Use photos already in `provider.classes_scrape_source.google_photos` (from `google-places-fetch.js`). No extra API call if we already have Place Details.
3. **Instagram (optional / later)**
   - Only if we have an official account (e.g. from `discovered_from` or a future `instagram_handle`). Requires third-party or manual integration; can be a follow-up.
4. **Google Image Search (last resort)**
   - Only accept a result if we can **verify** it belongs to this provider (e.g. result page domain matches provider website, or page text contains provider name/address). Not in minimal first version to reduce complexity and API cost.

### Quality gate (reject unless all pass)

- **Reachability:** URL returns 200 and `Content-Type: image/*`.
- **Size:** Minimum dimensions (e.g. 400×300 effective pixels); reject tiny or placeholder images.
- **Aspect ratio:** Within a sane range (e.g. 0.5–2.5) to avoid strips or vertical banners.
- **Not logo/favicon:** Reject if filename/path suggests favicon, logo, or icon (e.g. `favicon.ico`, `logo.png`, small file size).
- **No broken URLs:** HEAD or GET confirms image loads (with timeout and size limit for safety).

### Verification (never accept without evidence)

- **Website:** Image URL’s domain matches provider’s official domain (from `website` or `classes_scrape_source.google_website`).
- **Google Places:** Photo comes from our stored `google_photos` for this provider’s `google_place_id` (already tied to the place).
- **Instagram:** Only if we can match to an official handle we store (future).
- **Google Image Search:** Only if result page domain or visible text matches provider (future).

### Data to store per listing (class)

- **Keep:** `photo_url` (single primary image for display).
- **In `discovered_from` (no new columns):**
  - `photo`: continue to list source labels (e.g. `["abrakadoodle.com.sg"]` or `["Google"]`) for attribution.
  - **New:** `photo_metadata`: optional object when we run the new pipeline:
    - `source_type`: `"website"` | `"google_places"` | `"instagram"` | `"manual"`.
    - `verified`: boolean.
    - `verification_reason`: short string (e.g. `"domain_match"`, `"google_place_id"`).
    - `rejected_candidates`: array of `{ url, reason }` for auditing (optional, can be truncated).
- **Curation:** Support manual override so featured listings are not overwritten:
  - In `discovered_from`, set `photo_override: true` for classes where you’ve manually set the image; the script will skip updating `photo_url` and `photo_metadata` for those.

### APIs / tools

| Source           | How | Notes |
|------------------|-----|--------|
| Provider website | Fetch HTML (existing `fetch` + cheerio), parse OG/Twitter meta and hero-like images | No new API. |
| Google Places     | Use existing `google_photos` in `classes_scrape_source` | No extra call; reuse data from `google-places-fetch.js`. |
| Instagram         | Optional later; would need provider handle + third-party or manual process | Defer in MVP. |
| Google Image Search | Optional later; Custom Search JSON API or SerpApi + verification step | Defer in MVP. |

### Rate limits and politeness

- Reuse existing pattern: delay between provider website fetches (e.g. 1–2 s).
- Do not re-call Google Places API in this script; only read stored `google_photos`.
- If we add Google Image Search later, use a conservative delay and quota.

---

## Minimal working version (scope)

- Implement **website (OG + hero scan)** and **Google Places** only.
- Apply **quality gate** and **verification** for both.
- **Log clearly** for each class: accepted image + reason, or rejected candidates + reasons.
- **Store** `photo_url`, `discovered_from.photo`, and `discovered_from.photo_metadata` (and respect `photo_override`).
- **Run:** e.g. `node scripts/source-class-images.js` with optional `--limit N` or `--dry-run` to try a few listings and see logs without writing.

Instagram and Google Image Search remain out of scope for the first version and can be added later with the same quality and verification rules.

---

## How to run and see results

From the project root (`tumbo-subframe/`):

```bash
# Try a few listings (no DB writes)
npm run source-images -- --limit 5 --dry-run
# or: node scripts/source-class-images.js --limit 5 --dry-run

# Run for 5 listings and write to DB
npm run source-images -- --limit 5

# Single class by ID (for debugging)
npm run source-images -- --class-id <class-uuid> --dry-run

# Full run (all classes; respects photo_override)
npm run source-images
```

**Logs:** For each class the script prints:

- **Accepted:** `[website] ACCEPTED <url> (WxH, domain_match)` or `[google_places] using stored photo (place_id verified)`.
- **Rejected:** `[website] rejected N candidate(s): reason1; reason2` (e.g. dimensions too small, domain mismatch, logo/favicon path).
- **No source:** `no accepted source; leaving photo_url unchanged`.

**Manual override:** Set `discovered_from.photo_override = true` for a class (e.g. via Supabase or a small script) so the pipeline never overwrites that listing’s image.
