# /classes Page — Architecture & Spec (v2)

> Editorial discovery page for parents finding the right class for their child.
> Last updated: 2026-02-15

---

## 1. Design Principles

- **Warm editorial tone** — every heading must read like a parent speaking to another parent, not an industry taxonomy.
- **Not Netflix** — visual density varies per rail to break uniformity. No two consecutive rails should feel identical.
- **Intent over category** — labels like "Build Confidence" instead of "Drama". "Burn That Energy" instead of "Sports".
- **7-rail hard cap** before Browse All. No infinite vertical stacking.
- **Progressive loading** — first paint is hero + 1 rail. Everything else lazy-loads.
- **Chips re-rank, don't navigate** — selecting a chip adjusts scoring across all rails in place.

---

## 2. Information Architecture

### Page Structure (top → bottom)

| #  | Element          | Component              | Notes                                    |
|----|------------------|------------------------|------------------------------------------|
| A  | Hero             | `hero-section.tsx`     | Headline + subline + 4 intent chips      |
| B  | Rail 1           | Featured density       | "Start here" — largest cards             |
| C  | Rail 2           | Compact density        | "Loved by parents nearby"                |
| D  | Rail 3           | Standard density       | "Build their confidence"                 |
| E  | Rail 4           | Standard density       | "Burn that energy"                       |
| F  | Rail 5           | Standard density       | "Quiet focus & mastery"                  |
| G  | Rail 6           | Standard density       | "Creative explorers"                     |
| H  | Rail 7           | Airy density           | "Try something new" — fewer, spacious    |
| I  | Browse All       | Button + filter drawer | Not a rail. Entry point to full catalog. |

### Rail Details (headers + subheaders — REQUIRED for every rail)

| railId              | Header                      | Subheader                                                               | Density    |
|---------------------|-----------------------------|-------------------------------------------------------------------------|------------|
| `recommended`       | Start here                  | A fresh pick of classes worth exploring this week                       | `featured` |
| `popular-nearby`    | Loved by parents nearby     | High-rated classes that families in your area keep coming back to        | `compact`  |
| `build-confidence`  | Build their confidence      | Small-group classes that nurture shy kids and help them find their voice | `standard` |
| `burn-energy`       | Burn that energy            | High-movement classes that tire them out in the best way                | `standard` |
| `quiet-focus`       | Quiet focus & mastery       | Deep-skill classes for the child who loves to concentrate and create    | `standard` |
| `creative-explorers`| Creative explorers          | Open-ended, artful, messy-hands kind of fun for curious minds           | `standard` |
| `serendipity`       | Try something new           | Hidden gems and fresh faces you might not have found on your own        | `airy`     |

> **Weekend variant:** `recommended` subheader swaps to "Great picks for the weekend ahead" on Sat/Sun.
> **Location variant:** `popular-nearby` header becomes "Loved by parents near you" when user location is available.

---

## 3. Intent Chips (Interaction Layer)

### Chips

| id                  | Label              |
|---------------------|--------------------|
| `build-confidence`  | Build Confidence   |
| `burn-energy`       | Burn Energy        |
| `quiet-focus`       | Quiet Focus        |
| `creative-explorers`| Creative Explorers |

### Behaviour

1. Chips are **toggles** (on/off). Only one can be active at a time. Default = none.
2. Selecting a chip does **NOT navigate or scroll**. Layout stays stable.
3. Selecting a chip **re-fetches all loaded rails** from the API with a `chip` query parameter.
4. The `chip` param adds a **+0.20 chipBoostScore** to every class's total score across ALL rails.
5. This means items that match the selected intent surface higher within every rail.
6. The chip's matching rail (e.g. "build-confidence" rail) becomes even stronger because it already has `intentMatchScore` + the chip boost stacks.
7. Deselecting resets all rails to default scoring.
8. Active chip renders with `bg-tumbo-orange text-white`. Inactive = outlined.

### Scoring Adjustment When Chip Active

```
finalScore = (normalWeightedScore + 0.20 × chipBoostScore) × stalePenalty
```

Where `chipBoostScore` uses the same `intentMatchScore` logic but with the chip's boost signals.

---

## 4. Rail Density Variation

| Density    | Card Width (mobile)  | Card Width (desktop) | Render Count (desktop/mobile) | Visual Effect              |
|------------|----------------------|----------------------|-------------------------------|----------------------------|
| `featured` | `w-[85vw]`           | `w-80` (320px)       | 6 / 3                        | Largest cards, hero-like   |
| `compact`  | `w-[72vw]`           | `w-64` (256px)       | 6 / 3                        | Tighter, more items visible|
| `airy`     | `w-[85vw]`           | `w-80` (320px)       | **4** / **2**                 | Spacious, fewer items      |
| `standard` | `w-[78vw]`           | `w-72` (288px)       | 6 / 3                        | Default sizing             |

This prevents the "wall of identical rows" feeling. The page breathes.

---

## 5. Scoring Weights per Rail

| Rail               | quality | freshness | proximity | intent | weekend | diversity |
|--------------------|---------|-----------|-----------|--------|---------|-----------|
| recommended        | 0.35    | 0.25      | 0.10      | 0.00   | 0.10    | 0.20      |
| popular-nearby     | 0.40    | 0.10      | 0.20      | 0.00   | 0.00    | 0.30      |
| build-confidence   | 0.25    | 0.20      | 0.00      | 0.40   | 0.00    | 0.15      |
| burn-energy        | 0.25    | 0.20      | 0.00      | 0.40   | 0.00    | 0.15      |
| quiet-focus        | 0.25    | 0.20      | 0.00      | 0.40   | 0.00    | 0.15      |
| creative-explorers | 0.25    | 0.20      | 0.00      | 0.40   | 0.00    | 0.15      |
| serendipity        | 0.30    | 0.30      | 0.00      | 0.00   | 0.00    | 0.40      |

**When a chip is active:** +0.20 additive weight applied to `chipBoostScore` for ALL rails.

### Scoring Functions

| Function            | Range | Description                                                    |
|---------------------|-------|----------------------------------------------------------------|
| `qualityScore`      | 0–1   | 50% rating + 30% review count + 20% editorial richness        |
| `freshnessScore`    | 0–1   | ≤7d=1.0, ≤30d=0.7, ≤90d=0.4, else 0.1                        |
| `proximityScore`    | 0–1   | Location-based (TODO: haversine when coords added)             |
| `intentMatchScore`  | 0–1   | Tag signal matching (derived tags + corpus search)             |
| `weekendScore`      | 0–1   | Schedule includes Sat/Sun = 1.0, else 0.2 (only on weekends)  |
| `chipBoostScore`    | 0–1   | Same as intentMatchScore but uses chip's signals               |
| `stalePenalty`      | 0.5–1 | ×0.5 if >180 days stale                                       |

### Combined Formula

```
score = (Σ weight_i × score_i) + (chipActive ? 0.20 × chipBoostScore : 0)
final = score × stalePenalty
```

---

## 6. Progressive Loading

| Phase                | Trigger                                  | What Loads                          |
|----------------------|------------------------------------------|-------------------------------------|
| **First paint**      | Page mount                               | Hero + Intent Chips + Rail 1 only   |
| **Idle / scroll**    | 60% viewport past hero OR 1.2s idle      | Rail 2 (skeleton visible below hero)|
| **IntersectionObserver** | Rail enters 800px from viewport      | Next rail fetches independently     |
| **Show more**        | User clicks "Show more" within a rail    | Expands pre-fetched items (no API)  |

### Rules

- Each rail fetches independently via `GET /api/rails/:railId`.
- Do NOT fetch all rails in a single request.
- Hero + Rail 1 = first paint. Everything else is lazy.
- Skeleton placeholders render immediately for the next unfetched rail.
- IntersectionObserver fires once per rail, then disconnects.

### Per-Rail Fetch

- **Fetch:** 12 items server-side
- **Render:** Per density (see table above)
- **Show more:** Expands remaining pre-fetched items without re-fetch

---

## 7. API Shape

### `GET /api/rails/:railId`

| Param     | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| `seed`    | number | yes      | Session seed for deterministic shuffle   |
| `lat`     | float  | no       | User latitude                            |
| `lng`     | float  | no       | User longitude                           |
| `exclude` | string | no       | Comma-separated class IDs to exclude     |
| `cursor`  | number | no       | Pagination offset (default 0)            |
| `limit`   | number | no       | Items per page (default 12, max 24)      |
| `chip`    | string | no       | Active intent chip id for global re-rank |

**Response:**
```json
{
  "railId": "build-confidence",
  "header": "Build their confidence",
  "subheader": "Small-group classes that nurture shy kids and help them find their voice",
  "items": [ { "id", "title", "providerName", "summary", "image", "tags", "href", "category" } ],
  "nextCursor": "12",
  "totalAvailable": 24
}
```

### `GET /api/rails/meta`

Returns session metadata. No Supabase client needed on the frontend for initial load.

```json
{
  "sessionSeed": 12345,
  "isWeekend": false,
  "railOrder": ["recommended", "popular-nearby", ...],
  "totalClasses": 142
}
```

### Caching

| Scenario      | Cache-Control                                    |
|---------------|--------------------------------------------------|
| No chip       | `public, s-maxage=300, stale-while-revalidate=600` |
| Chip active   | `private, no-store` (personalized)               |
| Class pool    | In-memory 60s TTL (server-side)                  |
| Session seed  | `sessionStorage`, regenerated daily              |

---

## 8. Controlled Randomisation & Guardrails

### 8A. Session-Seeded Shuffle

- **Seed generation:** Hash of date (`YYYY-MM-DD`). Stored in `sessionStorage`.
- New session or new day → new seed → new page ordering.
- **Stratified shuffle:** Items are pre-sorted by score, then shuffled within tiers of 6 (one desktop rail). A top-6 item can move within positions 1–6 but never below 7. This preserves quality bands while adding variety.
- Seed is passed to every API call. Shuffle does NOT change on scroll or chip click — only on new session/day.

### 8B. Diversity Guardrails

| Constraint                  | recommended | popular-nearby | intent rails | serendipity |
|-----------------------------|-------------|----------------|--------------|-------------|
| Max per provider            | 2           | 2              | 2            | **1**       |
| Min categories              | 4           | 3              | 3            | **5**       |
| Min outcome types           | 2           | 2              | 2            | **3**       |
| Back-to-back tag prevention | Yes         | Yes            | Yes          | Yes         |
| Freshness reserve           | 30%         | 20%            | 30%          | N/A (mixture) |

**Implementation pipeline (in order):**

1. **Provider cap:** Greedy pick — skip items from providers already at cap. Deferred items fill gaps later, prioritising new categories/outcomes.
2. **Outcome type diversity:** At least `minOutcomeTypes` distinct outcome types in the rail. If under target, swap out duplicate-outcome items from the bottom 30% of the rail with deferred items that add a new outcome type.
3. **Back-to-back primary tag prevention:** After pick, reorder so no two consecutive cards share the same category. Greedy forward-scan: if `items[i]` and `items[i-1]` share a tag, find the nearest non-duplicate ahead and swap.

### 8C. Cross-Rail De-duplication

- Client accumulates `shownIds[]` as each rail loads.
- Every subsequent rail API call passes `exclude=id1,id2,...`.
- Server filters these out before scoring.
- **"Try Something New" (serendipity) must exclude ALL previously shown classes.** This is enforced because it loads last and receives the full exclude list.
- On chip toggle (re-fetch), exclude list resets to empty since all rails are re-ranked fresh.

### 8D. Freshness Blending

**Regular rails (70% scored / 30% fresh rotation):**

```
scored_sorted = sort_by_score(pool)
top_70       = scored_sorted[0 : ceil(fetchCount × 0.70)]
fresh_pool   = scored_sorted[ceil(fetchCount × 0.70) :].sort_by(freshnessScore desc)
fresh_30     = fresh_pool[0 : fetchCount - len(top_70)]

blended = interleave(top_70, fresh_30)  // pattern: 2 scored, 1 fresh, 2 scored, 1 fresh...
```

The `freshnessReserve` ratio is configurable per rail (see table above). `popular-nearby` uses 0.20 (more score-biased) while intent rails use 0.30.

**Serendipity rail (40/30/20/10 mixture):**

| Bucket                      | %   | Selection rule                                           |
|-----------------------------|-----|----------------------------------------------------------|
| High quality, under-exposed | 40% | Score ≥ 0.5 (top quality half), not shown in prior rails |
| New listings                | 30% | `created_at` within last 30 days                         |
| Niche categories            | 20% | Categories with ≤ 5 total classes in the database        |
| Random long tail            | 10% | Seeded random from entire pool                           |

Buckets are merged and deduplicated, then stratified-shuffled in tiers of 4 (matching airy density).

### 8E. Logged-In Stability

| Guardrail                   | Rule                                                                          |
|-----------------------------|-------------------------------------------------------------------------------|
| Exploration reserve         | Min **20% of each rail** reserved for non-profile content (anti-filter-bubble)|
| Diversity guardrails        | All guardrails above (provider cap, outcome diversity, back-to-back) still apply |
| Session-stable ordering     | Same session seed, same ordering. Personalisation only affects scoring weights |
| Personalisation weight      | +0.15 `personalRelevance` weight from user's recent tag interactions          |

---

## 9. Logged-in Delta

| Change                           | Description                                                           |
|----------------------------------|-----------------------------------------------------------------------|
| Rail 1 replacement               | "Start here" becomes **"For your child"** — personalised from recent views, saves, dwell signals |
| All rails: personal bias         | +0.15 personalRelevance weight from user tag history                  |
| Exploration floor                | Min **20% of each rail** reserved for non-profile classes (anti-bubble) |
| Chip pre-select                  | If user profile has a dominant age band/intent, pre-select matching chip |
| Scoring formula                  | `score = normalScore + 0.15 × personalRelevanceScore + chipBoost`    |
| Guardrails still apply           | Provider cap, outcome diversity, back-to-back tag prevention, session seed stability |

---

## 10. Editorial Language Rules

### Forbidden in UI

| Generic term       | Replace with                          |
|--------------------|---------------------------------------|
| Science            | Curious minds / Young experimenters   |
| Education Center   | *(never shown — provider name only)*  |
| Mathematics        | Problem-solving / Number play         |
| English            | Language & stories                    |
| Chinese            | Mandarin adventures                   |
| Enrichment         | *(never shown — too vague)*           |

### Warm Tag Examples

| Internal tag                   | Warm display tag         |
|-------------------------------|--------------------------|
| Builds Confidence             | Stage Ready              |
| High Energy                   | Burns Energy             |
| Focus & Regulation            | Deep Focus               |
| Creative Kids                 | Messy Hands Welcome      |
| Small Group                   | Small Group              |
| Gentle Pace                   | Gentle Pace              |
| Process-Focused               | Process Over Product     |
| Restless / Needs Movement     | Good for Restless Kids   |

---

## 11. File Map

```
src/
├── app/classes/
│   └── page.tsx                          # Page shell: hero + rail slots + progressive loader
│
├── lib/rails/
│   ├── types.ts                          # Rail types, RailDensity, ScoringContext, activeChipId
│   ├── config.ts                         # Rail definitions with density, INTENT_CHIPS with boostSignals
│   ├── scoring.ts                        # qualityScore, freshnessScore, chipBoostScore, computeRailScore
│   ├── warm-tags.ts                      # WARM_TAG_MAP, selectDisplayTags()
│   ├── diversity.ts                      # stratifiedShuffle, applyDiversityConstraints (provider cap,
│   │                                     #   outcome diversity, back-to-back), blendWithFreshness
│   └── build-rail.ts                     # buildRail() — full pipeline: score → blend → shuffle → diversity
│
├── components/ui/
│   ├── class-card.tsx                    # Card component (density-aware via parent width)
│   ├── hero-section.tsx                  # Hero + 4 toggle chips (activeChipId state)
│   ├── rail-section.tsx                  # Horizontal rail with density-based card sizing
│   ├── rail-loader.tsx                   # IntersectionObserver wrapper for lazy loading
│   └── browse-all-button.tsx             # "Browse all classes" CTA
│
├── api/rails/
│   └── [railId]/
│       └── route.ts                      # GET /api/rails/:railId — accepts ?chip= for re-ranking
│   └── meta/
│       └── route.ts                      # GET /api/rails/meta — session seed + totalClasses
│
└── lib/types/
    └── tags.ts                           # DBClass, deriveContextualTags(), TAG_TYPES
```

---

## 12. Key Decisions Log

| Decision                                        | Rationale                                                    |
|-------------------------------------------------|--------------------------------------------------------------|
| Chips toggle re-rank, don't navigate            | Layout stays stable; user doesn't lose scroll position       |
| Density varies per rail                         | Breaks Netflix uniformity; page breathes                     |
| 7-rail hard cap enforced in config              | Prevents scope creep and infinite stacking                   |
| Chip boost is additive (+0.20) not multiplicative | Prevents intent rail from monopolising all top slots        |
| Serendipity renders 4/2 (airy) not 6/3          | Creates visual punctuation before Browse All                 |
| "Start here" not "Recommended for today"        | More editorial, less algorithmic-sounding                    |
| "Loved by parents nearby" not "Popular in SG"   | Warm social proof vs. generic geo label                      |
| No CDN cache when chip is active                | Chip-active responses are personalised                       |
| Stratified shuffle (tier=6) not global shuffle  | Preserves quality bands — top items stay near top            |
| 70/30 freshness blend for regular rails         | Prevents stale-feeling page while keeping quality high       |
| Back-to-back tag prevention via greedy swap     | Adjacent cards never show same category — improves perceived variety |
| Outcome type diversity (min 2)                  | Rails show varied learning outcomes, not just category mix   |
| Cross-rail exclude resets on chip toggle        | Re-rank produces new orderings; old exclude list is stale    |
| 20% exploration reserve for logged-in           | Anti-filter-bubble — user always sees some non-profile content|
