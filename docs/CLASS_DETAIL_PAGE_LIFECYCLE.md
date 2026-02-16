# Class detail page — full lifecycle (Supabase → rendered UI)

Trace of one class record from database to `/classes/[id]` UI.

---

## 1. Where it is fetched

- **Page:** `src/app/classes/[id]/page.tsx` (client component: `"use client"`).
- **Fetch:** **Client-side only**, inside a `useEffect` that runs when `classId` (from `useParams().id`) is set.
- **API:** Direct Supabase client via `supabaseBrowser()` from `@/lib/supabase/client` (no Next.js API route, no server component fetch).

**Code (lines 312–343):**

```ts
const supabase = supabaseBrowser();

const { data: classData, error } = await supabase
  .from("classes")
  .select("*")
  .eq("id", classId)
  .single();
```

Then, if `classData.provider_id` is set, a second query:

```ts
const { data: providerData } = await supabase
  .from("providers")
  .select("*")
  .eq("id", classData.provider_id)
  .single();
```

So: **one row from `classes`** (by `id`) and **one row from `providers`** (by `provider_id`). No server-side data fetching and no `hidden_from_directory` filter here (direct links to hidden classes can still load; listing pages filter them out).

---

## 2. What scripts process it

- **No build-time or server scripts** run for the class detail page. No Node/CLI scripts are involved when a user opens `/classes/[id]`.
- **Runtime processing** happens only in the browser, in the same page and in shared type/parser code:

| Where | What |
|-------|------|
| `src/app/classes/[id]/page.tsx` | `parseContentSources(cls.discovered_from)` → `ContentSources` for attribution pills. Enrichment of `contentSources` with "Google" when provider has `google_place_id`. Derivation of `displayAddress`, `displayPhone`, `displayWebsite` from class + provider + Google. |
| `@/lib/types/tags.ts` | `parseReviews(cls.raw_reviews)` → `Review[]`. `parseGooglePlaces(provider?.classes_scrape_source)` → `GooglePlacesData`. `deriveContextualTags(cls)` → tags for philosophy/experience/child. `formatPrice`, `formatAgeRange`. |

So the only “processing” is: **parse JSON fields** (`raw_reviews`, `discovered_from`, `classes_scrape_source`) and **derive display values and tags** from the class and provider rows. No ETL, no background jobs, no server middleware.

---

## 3. Whether GPT transforms it

- **No.** The class detail page **does not call GPT** (or any LLM). It only reads from Supabase.
- **GPT runs offline** in Node scripts (e.g. `full-enrich.js`, `enrich-curated-42.js`, `ai-enrich.js`), which write into `classes`: `description`, `summary`, `vibe_line`, `typical_child_profile`, `outcome_expectations`, and into `discovered_from` (e.g. `"Tumbo editorial"`). By the time a user opens the detail page, that content is already in the DB; the page just renders it.

---

## 4. What schema is returned

**From Supabase:**

- **`classes`:** One row, effectively the full table row (`.select("*")`). Typed as `DBClass` in `@/lib/types/tags.ts`.
- **`providers`:** One row, full table row. Typed as `Provider` in `@/lib/types/tags.ts`.

**`DBClass` (abridged):**

| Field | Type | Origin / note |
|-------|------|----------------|
| id | string | PK |
| name | string | |
| provider_id | string? | FK to providers |
| description | string? | Enriched (website + GPT) |
| summary | string? | “What parents say” (GPT synthesis) |
| vibe_line | string? | One-liner (GPT) |
| typical_child_profile | string? | “Who thrives” (GPT) |
| not_ideal_for | string? | (GPT) |
| outcome_expectations | string? | “What to expect” (GPT) |
| raw_reviews | string? | JSON array of reviews (assigned to this class) |
| discovered_from | string? | JSON: source attribution (description, reviews, vibe_line, etc.) |
| category, age_min, age_max, location, price, schedule | various | |
| photo_url | string? | |
| google_rating, review_count | number? | Can be denormalized from provider/Google |
| is_placeholder, hidden_from_directory | boolean | |
| created_at, updated_at | string | |

**`Provider` (abridged):**

| Field | Type | Note |
|-------|------|------|
| id, name, website, phone, street_address | … | |
| classes_scrape_source | string? | JSON: Google Places data (rating, address, website, phone, etc.) and/or pipeline metadata |
| nearby_places | (not in Provider type in tags.ts but used in page) | JSONB: F&B, cafes, transit, etc. from Google Nearby |

**Derived on the client (not stored as-is):**

- `contentSources`: from `parseContentSources(cls.discovered_from)` (+ optional “Google” when provider has Google data).
- `googleData`: from `parseGooglePlaces(provider?.classes_scrape_source)`.
- `googleRating` / `googleReviewCount`: `googleData` or `cls` fallback.
- `displayAddress`, `displayPhone`, `displayWebsite`: from class + provider + `googleData` (with Skoolopedia filtered out for website).
- `reviews`: from `parseReviews(cls.raw_reviews)`.
- `contextualTags`: from `deriveContextualTags(cls)`.

---

## 5. Which frontend components consume which fields

All of these live inside `src/app/classes/[id]/page.tsx` unless noted.

| Component / block | Class fields | Provider fields | Derived / parsed |
|-------------------|-------------|-----------------|-------------------|
| **Hero image** | `photo_url`, `name` (alt) | — | `heroImage` = `photo_url` or Unsplash fallback |
| **Provider link** | `provider_id` | `id`, `name` | — |
| **Title** | `name` | — | — |
| **Vibe line** | `vibe_line` | — | — |
| **Content tags** | — | — | `contentSources.content_tags` (subject, philosophy, experience, child) |
| **Pills (category, age, etc.)** | `category`, `age_min`, `age_max` | — | `contextualTags` from `deriveContextualTags(cls)`; `formatAgeRange`; `googleRating` |
| **About this class** | `description` | — | `contentSources.description` (source pills) |
| **What parents say** | `summary`, `raw_reviews` | — | `reviews` from `parseReviews`; `contentSources.reviews`; `googleRating` / `googleReviewCount` |
| **Who thrives here** | `typical_child_profile`, `not_ideal_for` | — | `contentSources.child_profile`; gated by review count ≥10 |
| **What to expect** | `outcome_expectations` | — | `contentSources.outcomes`; gated by review count ≥10 |
| **In the neighbourhood** | `location` | `nearby_places` | `displayAddress`; `contentSources.neighbourhood_note` |
| **Right column (info card)** | `category`, `age_min`, `age_max`, `location`, `price`, `schedule` | `name`, `phone`, `website` | `displayAddress`, `displayPhone`, `displayWebsite`; `googleRating`, `googleReviewCount`; `reviews.length` |
| **Claim / Report modals** | `name` (class title) | — | — |
| **EditorialBlocks** (shared helper) | — | — | Receives `summary`, `typical_child_profile`, `outcome_expectations` (subhead + body parsing, `\n\n` blocks) |
| **SourceNote** | — | — | `contentSources.description`, `.reviews`, `.child_profile`, `.outcomes` (pill links) |
| **StarRating** | — | — | `googleRating`, `googleReviewCount` |
| **NeighbourhoodSection** | — | `nearby_places` | `displayAddress`; `contentSources.neighbourhood_note`; tab labels from `NEIGHBOURHOOD_TABS` |

**Shared UI (from `@/components/ui`):**

- `ModernPageLayout`, `FadeInUp`, `TagPill`, `Modal` — layout and UI only; they don’t read class/provider fields directly. Data is passed in as props (e.g. `cls.name` to modals, tag labels from `cls` / `contextualTags`).

---

## Summary flow

```
Supabase (classes row + providers row)
  → Client fetch in useEffect (classes/[id]/page.tsx)
  → setState(cls, provider)
  → parseReviews(raw_reviews), parseContentSources(discovered_from), parseGooglePlaces(provider.classes_scrape_source)
  → deriveContextualTags(cls), displayAddress / displayPhone / displayWebsite
  → React render: hero, title, vibe_line, tags, description, summary, typical_child_profile, outcome_expectations, neighbourhood, info card, modals
```

**GPT** is not in this path; it only appears in the offline enrichment scripts that write the fields the page reads.
