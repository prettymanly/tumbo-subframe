# Class detail page — data flow audit

Factual, human-readable explanation of current data flow for the class detail page. No guesses; NOT FOUND where applicable with locations searched.

---

## 1) One-paragraph overview (plain English)

**Ingest:** New class/location records are created by scripts that insert into `providers` and `classes` (e.g. `targeted-gap-scraper.js`, `google-places-expansion.js`, `singapore-directories-scraper.js`, `insert-curated-listings.js`). Reviews are collected at provider level via Outscraper (Google), then assigned to classes by `review-assign.js`, which writes `classes.raw_reviews`. **Enrich:** Provider-level Google data (address, rating, website, phone) is fetched by `google-places-fetch.js` and stored in `providers.classes_scrape_source`; class-level enrichment (description, photo, etc.) is updated by various scripts. **GPT:** The main editorial pipeline is `full-enrich.js` (and optionally `enrich-curated-42.js`, `ai-enrich.js`): it reads class + provider + website + `raw_reviews`, calls OpenAI with the prompt in `scripts/prompts/synthesis-system.md`, and writes `description`, `summary` (review_synthesis), `vibe_line`, `typical_child_profile` (who_thrives), `outcome_expectations` (what_to_expect), and `discovered_from` (including `content_tags`, `neighbourhood_note`). Neighbourhood POIs (F&B, cafes, transit, etc.) are fetched by `nearby-places-fetch.js` and stored in `providers.nearby_places`. **Render:** The class detail page is a client component at `src/app/classes/[id]/page.tsx`. It loads one row from `classes` and one from `providers` via Supabase client (no API route, no server loader). It parses JSON fields (`raw_reviews`, `discovered_from`, `classes_scrape_source`), derives display address/phone/website and contextual tags, and renders sections that consume those props; no GPT is called at render time.

---

## 2) Diagram-style flow (ASCII)

```
[SCRAPE / INGEST]
  targeted-gap-scraper.js, google-places-expansion.js, singapore-directories-scraper.js, insert-curated-listings.js
    → providers.insert(), classes.insert()
  review-collect.js (Outscraper) → data/outscraper/*.json
  review-assign.js → classes.raw_reviews (per-class assigned reviews)

[RAW DB]
  tables: classes, providers
  classes: id, name, provider_id, description, summary, vibe_line, typical_child_profile, outcome_expectations,
           raw_reviews, discovered_from, category, age_min, age_max, location, price, schedule, photo_url, ...
  providers: id, name, website, phone, street_address, classes_scrape_source, nearby_places, ...

[ENRICHMENT — no GPT]
  google-places-fetch.js     → providers.classes_scrape_source (Google data), classes.raw_reviews, classes.*
  pipeline-prep-new-providers.js → classes_scrape_source (place_id), classes_scrape_source on classes
  nearby-places-fetch.js     → providers.nearby_places (F&B, cafes, transit, etc.)
  scrape-websites.js, source-class-images.js, update-sources.js, etc. → description, photo_url, discovered_from

[GPT LAYER]
  full-enrich.js (canonical), enrich-curated-42.js, ai-enrich.js
  prompt: scripts/prompts/synthesis-system.md (or inline fallback in script)
  input: class metadata, provider website (scraped), raw_reviews
  output JSON keys: content_tags, description, review_synthesis, who_thrives, what_to_expect, neighbourhood, vibe_line
  writes: classes.description, classes.summary (= review_synthesis), classes.vibe_line, classes.typical_child_profile
          classes.outcome_expectations, classes.not_ideal_for=null, classes.discovered_from (content_tags, neighbourhood_note, etc.)

[ENRICHED DB]
  Same tables; columns above populated/updated.

[QUERIES / LOADERS]
  Route: src/app/classes/[id]/page.tsx (client component)
  Loader: none (no getServerSideProps, no route handler). Data fetched in useEffect:
    supabase.from("classes").select("*").eq("id", classId).single()
    supabase.from("providers").select("*").eq("id", classData.provider_id).single()

[FRONTEND COMPUTE]
  parseReviews(cls.raw_reviews)           → Review[]
  parseContentSources(cls.discovered_from) → ContentSources (description[], content_tags, neighbourhood_note, ...)
  deriveContextualTags(cls)               → { label, category }[] (keyword-based)
  parseGooglePlaces(provider.classes_scrape_source) → GooglePlacesData
  displayAddress = cls.location || googleData.google_address || provider.street_address
  displayPhone = provider.phone || googleData.google_phone
  displayWebsite = googleWebsite || provWebsite (Skoolopedia filtered out)

[COMPONENTS / SECTIONS]
  Header identity, Tag pills, About this class, What parents say, Who thrives, What to expect,
  In the neighbourhood, Right-side info panel (see SECTION MAP below).
```

---

## 3) Class detail page: SECTION MAP

**Route:** `/classes/[id]`  
**File:** `src/app/classes/[id]/page.tsx`  
**Component:** `ClassDetailPage` (default export).  
**Query:** Client-side in `useEffect`: `supabase.from("classes").select("*").eq("id", classId).single()` then `supabase.from("providers").select("*").eq("id", classData.provider_id).single()`. No loader file; no server-side fetch.

---

### A) Header identity block

| Item | Source |
|------|--------|
| **Section name** | Header identity block (name + vibe line) |
| **Component file path** | `src/app/classes/[id]/page.tsx` (inline JSX, no separate component) |
| **Component name** | N/A (div with provider link, h1, paragraph) |

**Props / data:**

| Prop / element | Where it comes from | Type |
|----------------|---------------------|------|
| Provider name (link) | `provider.name` | Supabase `providers.name` |
| Class name (h1) | `cls.name` | Supabase `classes.name` |
| Vibe line (short punchy line under name) | `cls.vibe_line` | Supabase `classes.vibe_line` (GPT output key: `vibe_line`, written by full-enrich.js) |

**Section-specific logic:** Vibe line is capitalized for display: `cls.vibe_line.charAt(0).toUpperCase() + cls.vibe_line.slice(1)`. Presentation-only.  
**Shared vs unique:** Unique to this page (inline in same file).

---

### B) Tag pills block

**Section name:** Tag pills block (grouped headings Subject/Philosophy/Experience/Child + colored pills).

There are **two distinct UI elements** in this area:

**B1) Content tags (Subject / Philosophy / Experience / Child as labels + text)**

| Item | Value |
|------|--------|
| **Component file path** | `src/app/classes/[id]/page.tsx` |
| **Component name** | Inline JSX (div with `contentSources?.content_tags`) |
| **Props** | `contentSources.content_tags` (object with optional keys `subject`, `philosophy`, `experience`, `child`) |
| **Where props come from** | `contentSources` = `parseContentSources(cls.discovered_from)`. So **Supabase `classes.discovered_from`** (JSON). The values inside `content_tags` are **generated by GPT** and stored in that JSON by enrichment scripts. |

- **Are these tags stored in Supabase or generated?**  
  **Generated by GPT**, then **stored** in Supabase in `classes.discovered_from` under the key `content_tags`.

- **Which GPT prompt/script generates them?**  
  **Script:** `scripts/full-enrich.js` (and `scripts/enrich-curated-42.js` uses same shape).  
  **Prompt:** `scripts/prompts/synthesis-system.md` (canonical). Prompt is loaded in full-enrich.js via `loadSystemPrompt()` from `PROMPT_PATH` = `scripts/prompts/synthesis-system.md`; fallback inline string in full-enrich.js line 58.

- **Output schema (keys):**  
  `content_tags: { subject: string, philosophy: string, experience: string, child: string }` (each 3–8 words per prompt). Stored in `discovered_from.content_tags` and written by full-enrich.js: `if (result.content_tags) srcObj.content_tags = result.content_tags`.

- **How are colors decided for this block?**  
  **No colors.** This block is plain text with small uppercase labels ("Subject:", "Philosophy:", etc.); it does **not** use TagPill or any color mapping.

**B2) Colored pills (category, age, contextual tags, rating)**

| Item | Value |
|------|--------|
| **Component file path** | `src/components/ui/tag-pill.tsx` |
| **Component name** | `TagPill` |
| **Props** | `label`, `category?`, `size="md"` |
| **Where props come from** | `cls.category` (Supabase `classes.category`); `formatAgeRange(cls.age_min, cls.age_max)` (Supabase `classes.age_min`, `classes.age_max` + frontend helper); `contextualTags` from `deriveContextualTags(cls)` (frontend); `googleRating` (derived from provider/class). |

- **Are these tags stored or generated?**  
  **Category and age:** stored in Supabase (`classes.category`, `classes.age_min`, `classes.age_max`).  
  **Contextual pills (e.g. "Hands-On", "Builds Confidence"):** **generated in the frontend** by `deriveContextualTags(cls)` in `src/lib/types/tags.ts` (keyword matching on `description`, `typical_child_profile`, `outcome_expectations`, `vibe_line` + category fallbacks). **Not** from GPT for this page; GPT produces `content_tags` (B1), not the pill labels from `deriveContextualTags`.

- **How are colors decided?**  
  **File:** `src/components/ui/tag-pill.tsx`.  
  **Mapping:** `TAG_COLORS`: `content` → `var(--tumbo-tag-content)`, `philosophy` → `var(--tumbo-tag-philosophy)`, `experience` → `var(--tumbo-tag-experience)`, `child` → `var(--tumbo-tag-child)`.  
  **Category for a given label:** `classifyTag(label)` in the same file (keyword lists for philosophy / experience / child; else "content").  
  **CSS variables:** Defined in `src/app/globals.css`: `--tumbo-tag-content: #7E401A`, `--tumbo-tag-philosophy: #FF3C00`, `--tumbo-tag-experience: #F1B313`, `--tumbo-tag-child: #FF6966`.

**Section-specific logic:** Category pill is forced `category="content"`; age pill is `category="child"`; contextual tags pass `tag.category` from `deriveContextualTags`. Rating is not a TagPill; it’s a custom rounded div.  
**Shared vs unique:** TagPill is shared; the composition (what to show) is unique to this page.

---

### C) About This Class section

| Item | Value |
|------|--------|
| **Section name** | About this class |
| **Component file path** | `src/app/classes/[id]/page.tsx` |
| **Component name** | Inline: `FadeInUp` wrapper, then div with `cls.description` and `SourceNote`. |

**Props:**  
- `cls.description` — rendered in a `<div className="text-body ... whitespace-pre-line">`.  
- `contentSources?.description` — passed to `<SourceNote sources={contentSources.description} />` for attribution pills.

**Identity of the copy:**  
- **Not** raw scrape only. It is **written or rewritten by enrichment**.  
- **Primary source for enriched classes:** GPT via `full-enrich.js` (prompt in `scripts/prompts/synthesis-system.md`, key `description`). Other scripts (e.g. `ai-enrich.js`, `batch-enrich.js`, `google-places-fetch.js`, `scrape-websites.js`) can also set or update `description` and `discovered_from`.  
- So: **either cleaned/rewritten by enrichment or rewritten/summarized by GPT**; for most “editorial” listings it is GPT output from full-enrich.

**Exact input/output for rendering:**  
- **Input (used by GPT in full-enrich):** class metadata (name, category, age, price, location, schedule, google_rating, review_count), provider name, provider website (scraped body/meta), and `raw_reviews` (from `classes.raw_reviews`).  
- **Output field used for rendering:** **Supabase `classes.description`**. No extra transformation beyond `whitespace-pre-line` in the frontend.

**Section-specific logic:** Only render block if `cls.description` is truthy. Source pills only if `contentSources?.description` exists.  
**Shared vs unique:** `FadeInUp` and `SourceNote` are shared; layout and data binding are page-specific.

---

### D) What Parents Say section

| Item | Value |
|------|--------|
| **Section name** | What parents say |
| **Component file path** | `src/app/classes/[id]/page.tsx` |
| **Component name** | Inline: `FadeInUp`, `StarRating`, `EditorialBlocks`, and a block that shows one review quote. |

**Where reviews come from:**  
- **Supabase:** `classes.raw_reviews` (JSON string of array of `{ author, text, rating, time? }`).  
- **Origin of data:** Reviews are collected at **provider** level via **Outscraper** (Google) in `scripts/review-collect.js`; then **assigned to classes** by `scripts/review-assign.js`, which writes `classes.raw_reviews` per class. So: **external API (Outscraper/Google) → review-assign → DB**.

**How quotes/snippets are chosen:**  
- **Frontend only.** No GPT selection.  
- **Code (same file):**  
  `reviews.filter(r => r.text.length > 50).sort((a, b) => b.text.length - a.text.length).slice(0, 1)`  
  So: **one quote**, the **longest** among reviews with text length > 50.  
- **Display:** That one review’s `text` is shown (trimmed to 250 chars if longer), plus `author` and star count. No keyword filter, no recency sort, no “top-rated” logic.

**GPT summary of reviews:**  
- **Yes.** GPT is used to summarize reviews into editorial prose.  
- **Prompt/script:** `scripts/full-enrich.js`; system prompt from `scripts/prompts/synthesis-system.md`.  
- **GPT output key:** `review_synthesis`.  
- **Stored as:** Supabase `classes.summary`.  
- **Rendered as:** `cls.summary` passed to `<EditorialBlocks text={cls.summary} />` when `reviews.length >= 10` or `googleReviewCount >= 10`.  
- **Output schema:** Single string with subheads and `\n\n`-separated blocks (per prompt). Failure / null: if &lt;10 reviews, full-enrich sets `result.review_synthesis = null` and `updates.summary = null`.

**Section-specific logic:**  
- Star rating from `googleRating` / `googleReviewCount` (derived from provider/class).  
- If &lt;10 reviews and &lt;10 Google count: show message “We need more reviews to share our editorial synthesis. Here’s what’s on Google.” and do **not** render `EditorialBlocks` for summary.  
- One representative quote as above.  
**Shared vs unique:** `EditorialBlocks` and `StarRating` are used only on this page (defined in same file); logic is unique to this section.

---

### E) In the Neighbourhood section

| Item | Value |
|------|--------|
| **Section name** | In the neighbourhood |
| **Component file path** | `src/app/classes/[id]/page.tsx` |
| **Component name** | `NeighbourhoodSection` (function in same file, lines 284–369) |

**Props:**  
- `displayAddress` (string | null)  
- `nearbyPlaces` (record of category key → array of `{ name, placeId?, distanceMeters?, formattedAddress?, googleMapsUri? }`)  
- `neighbourhoodNote` (string | null)

**Where props come from:**  
- `displayAddress`: **Computed** in page: `cls.location || googleData?.google_address || provider?.street_address`. So Supabase `classes.location`, or `providers.classes_scrape_source` (Google address), or `providers.street_address`.  
- `nearbyPlaces`: **Supabase `providers.nearby_places`** (JSONB). Passed as `provider?.nearby_places`.  
- `neighbourhoodNote`: **Computed** from `contentSources?.neighbourhood_note` which comes from `parseContentSources(cls.discovered_from)`. That value is **GPT output** (`neighbourhood`) written into `discovered_from.neighbourhood_note` by full-enrich.js.

**Logic that selects “neighbourhood” items:**  
- **Not** a recommender. Items are **precomputed per provider** and stored in `providers.nearby_places`.  
- **Selector:** No separate selector function. The **frontend** uses a fixed tab list `NEIGHBOURHOOD_TABS` (keys: food, cafes, remote_working, groceries, parking, transit). For the active tab, it shows `nearbyPlaces[activeTab]` — i.e. the array already stored under that key.  
- **Who fills `nearby_places`:** **Script** `scripts/nearby-places-fetch.js`. It gets provider lat/lng from Google Place Details (using `classes_scrape_source.google_place_id`), then calls Google Places API (New) **searchNearby** for each of 6 type sets (restaurant; cafe/coffee_shop; cafe/library/coworking_space; grocery; parking; transit). **Selection logic:** `rankPreference: "DISTANCE"`, `radius: 500` m, `maxResultCount: 15` per category. So **by distance** (and type), not by tags, cluster, or popularity.  
- **Distance:** Computed in the script with **haversine** in `scripts/nearby-places-fetch.js` (function `haversineMeters`). Each place’s `distanceMeters` is stored in `nearby_places` and displayed by `formatDistance(place.distanceMeters)` in the UI.  
- **File path for “selector”:** The only place that *selects* which POIs exist is **`scripts/nearby-places-fetch.js`** (Google API + haversine). The page only filters by tab and renders the precomputed list; there is no separate selector function file for “recommender” logic.

**Generic vs custom:** Custom to this product (neighbourhood lifestyle context). Not a generic related-items recommender.

---

### F) Right-side logistical info panel

All fields are in `src/app/classes/[id]/page.tsx` in the right column (info card). For each:

| Field displayed | Supabase source column(s) | Normalization / enrichment | Fallback if missing |
|-----------------|----------------------------|----------------------------|----------------------|
| Provider name (link) | `providers.name` | None | Section not rendered if no provider |
| Category | `classes.category` | None | Row not shown if falsy |
| Address | `classes.location` OR `providers.classes_scrape_source` (Google) OR `providers.street_address` | **Computed:** `displayAddress = cls.location \|\| googleData?.google_address \|\| provider?.street_address`. No phone/address formatting in code. | Row not shown if `displayAddress` null |
| Age group | `classes.age_min`, `classes.age_max` | **Presentation:** `formatAgeRange(cls.age_min, cls.age_max)` in `src/lib/types/tags.ts` (e.g. "3–6 years", "Up to 5 years"). | Row not shown if `age_min` null |
| Price | `classes.price` | **Presentation:** `formatPrice(cls.price)` in `src/lib/types/tags.ts` → "$X/session" or "Contact for pricing". | Row not shown if null |
| Schedule | `classes.schedule` | None (whitespace-pre-line for display). No parsing. | Row not shown if falsy |
| Google rating | `providers.classes_scrape_source` (parsed) OR `classes.google_rating` | **Computed:** `googleRating = googleData?.google_rating ?? cls.google_rating`. Display: `toFixed(1)`. | Row not shown if null |
| Reviews (count) | `classes.raw_reviews` | **Computed:** `reviews.length` from `parseReviews(cls.raw_reviews)`. | Row not shown if no reviews |
| Contact (phone) | `providers.phone` OR `providers.classes_scrape_source` (Google phone) | **Computed:** `displayPhone = provider?.phone \|\| googleData?.google_phone`. Rendered as `<a href={tel:...}>`. No formatting/normalization. | Row not shown if null |
| Website | `providers.classes_scrape_source` (Google website) OR `providers.website` | **Computed:** `displayWebsite`: prefer Google website, then provider website; **exclude** URLs containing "skoolopedia". Display: domain only (strip protocol and trailing slash). | Row not shown if null |

**Other:** “Directions” and “Visit website” buttons use `displayAddress` and `displayWebsite`. No duration or trial info fields found in this panel (NOT FOUND in `src/app/classes/[id]/page.tsx`).

---

## 4) Ingestion + enrichment (DB update paths)

### A. New locations / class records

| Script | Path | Command | Tables/columns written |
|--------|------|--------|------------------------|
| targeted-gap-scraper.js | `tumbo-subframe/scripts/targeted-gap-scraper.js` | `node scripts/targeted-gap-scraper.js` | `providers.insert(provRow)`; `classes.insert(classRow)` (name, provider_id, category, is_placeholder, discovered_from, raw_reviews, etc.) |
| google-places-expansion.js | `tumbo-subframe/scripts/google-places-expansion.js` | `node scripts/google-places-expansion.js` | `providers.insert(providerData)`; `classes.insert(classData)` |
| singapore-directories-scraper.js | `tumbo-subframe/scripts/singapore-directories-scraper.js` | (run as needed) | `providers.insert(providerData)`; `classes.insert(classData)` |
| insert-curated-listings.js | `tumbo-subframe/scripts/insert-curated-listings.js` | `node scripts/insert-curated-listings.js` | `providers.insert(...)`; `classes.insert(...)` |

**NOT FOUND:** No single “master” script that creates all locations; the above are the entry points found. pipeline-prep-new-providers.js **updates** existing providers/classes (classes_scrape_source, is_placeholder); it does not insert new class rows.

### B. Enrichment scripts

| Script | Path | What it adds/changes | Accuracy / dedupe / validation |
|--------|------|----------------------|----------------------------------|
| full-enrich.js | `tumbo-subframe/scripts/full-enrich.js` | Reads class + provider + website + raw_reviews; calls OpenAI; writes `classes.description`, `classes.summary`, `classes.vibe_line`, `classes.typical_child_profile`, `classes.outcome_expectations`, `classes.not_ideal_for`, `classes.discovered_from` (content_tags, neighbourhood_note, description[], reviews[], etc.). | Uses `needsEnrichment()` to skip already-good rows. Min 10 reviews for synthesis; nulls synthesis/who_thrives/what_to_expect if &lt;10. Excludes flagged class IDs from `docs/FLAGGED_CLASS_IDS.json`. No dedupe of content; overwrites. |
| enrich-curated-42.js | `tumbo-subframe/scripts/enrich-curated-42.js` | Same GPT shape; updates same class fields for a curated set. | Curated list; same prompt. |
| ai-enrich.js | `tumbo-subframe/scripts/ai-enrich.js` | GPT description only (no content_tags, no review_synthesis); updates `classes.description`, `discovered_from`. | Targets classes with template/generic description. |
| google-places-fetch.js | `tumbo-subframe/scripts/google-places-fetch.js` | Fetches Google Places (Text Search + Place Details); updates classes with address, rating, review_count, photo, and can set raw_reviews, description, discovered_from. | Per-class API calls; overwrites. |
| review-assign.js | `tumbo-subframe/scripts/review-assign.js` | Assigns provider-level reviews to classes; writes `classes.raw_reviews`. | Keyword/age matching; single-class vs multi-class logic. |
| nearby-places-fetch.js | `tumbo-subframe/scripts/nearby-places-fetch.js` | Fetches nearby POIs per provider; writes `providers.nearby_places`. | One run per provider; overwrites. |
| pipeline-prep-new-providers.js | `tumbo-subframe/scripts/pipeline-prep-new-providers.js` | Finds place ID, builds classes_scrape_source, flips is_placeholder. | Only updates providers/classes added by scripts (source/provider_type). |

---

## 5) GPT layer inventory

| Purpose | Prompt / template location | Input payload | Output schema | Where stored | When executed | Failure handling |
|---------|----------------------------|---------------|---------------|--------------|---------------|------------------|
| Tags (content_tags: subject, philosophy, experience, child) | `scripts/prompts/synthesis-system.md` (§ content_tags) | Class metadata, provider website, parent reviews (from buildUserPrompt in full-enrich.js) | `{ subject, philosophy, experience, child }` (3–8 words each) | `classes.discovered_from` (JSON key `content_tags`) | When full-enrich.js or enrich-curated-42.js runs | Parse error → skip row; null/empty not written |
| Vibe line | Same prompt (§ vibe_line) | Same | String, &lt;12 words, lowercase | `classes.vibe_line` | Same | Same |
| About (description) | Same prompt (§ description) | Same | String (2–3 paragraphs) | `classes.description` | Same | Same |
| Parents say (review_synthesis) | Same prompt (§ review_synthesis) | Same | String (subheads + \\n\\n + paragraphs) | `classes.summary` | Same | If &lt;10 reviews, output set to null; `classes.summary` cleared |
| Who thrives (who_thrives) | Same prompt (§ who_thrives) | Same | String (subheads + \\n\\n) | `classes.typical_child_profile` | Same | If &lt;10 reviews, null; column cleared |
| What to expect (what_to_expect) | Same prompt (§ what_to_expect) | Same | String (subheads + \\n\\n) | `classes.outcome_expectations` | Same | If &lt;10 reviews, null; column cleared |
| Neighbourhood (area note) | Same prompt (§ neighbourhood) | Same | String (1–2 sentences) or null | `classes.discovered_from.neighbourhood_note` | Same | Null if no parent mention |

**Other GPT:** ai-enrich.js uses its own inline system/user prompt for description only (no content_tags or synthesis). Script path: `tumbo-subframe/scripts/ai-enrich.js`. Output stored in `classes.description` and `classes.discovered_from`.

---

## 6) “What do I edit if I want to change X?”

| Goal | File path(s) |
|------|----------------|
| Change vibe line behavior (length, tone, when shown) | **GPT:** `tumbo-subframe/scripts/prompts/synthesis-system.md` (§ vibe_line). **Stored:** full-enrich.js writes `classes.vibe_line`. **UI:** `tumbo-subframe/src/app/classes/[id]/page.tsx` (capitalization, conditional render). |
| Change tag grouping or label taxonomy (Subject/Philosophy/Experience/Child) | **GPT output schema:** `tumbo-subframe/scripts/prompts/synthesis-system.md` (§ content_tags). **Stored:** full-enrich.js `result.content_tags` → `discovered_from`. **UI:** `tumbo-subframe/src/app/classes/[id]/page.tsx` (contentSources.content_tags block). **Contextual pills:** `tumbo-subframe/src/lib/types/tags.ts` (`deriveContextualTags`, PHILOSOPHY_SIGNALS, EXPERIENCE_SIGNALS, CHILD_SIGNALS, CATEGORY_DEFAULTS). |
| Change pill colors | **Mapping and CSS:** `tumbo-subframe/src/components/ui/tag-pill.tsx` (`TAG_COLORS`); `tumbo-subframe/src/app/globals.css` (`--tumbo-tag-content`, `--tumbo-tag-philosophy`, `--tumbo-tag-experience`, `--tumbo-tag-child`). **Category for a label:** `classifyTag()` in tag-pill.tsx. |
| Change About This Class copy | **GPT:** `tumbo-subframe/scripts/prompts/synthesis-system.md` (§ description). **Script:** full-enrich.js (and any other script that writes description). **UI:** `tumbo-subframe/src/app/classes/[id]/page.tsx` (renders `cls.description`). |
| Change Parents Say summary logic (when to show, structure) | **GPT:** `tumbo-subframe/scripts/prompts/synthesis-system.md` (§ review_synthesis). **Script:** full-enrich.js (min 10 reviews, null handling). **UI:** `tumbo-subframe/src/app/classes/[id]/page.tsx` (EditorialBlocks for `cls.summary`, 10-review gate, single-quote selection: filter length &gt; 50, sort by length, slice(0,1)). |
| Change In the Neighbourhood recommender | **Data source:** `tumbo-subframe/scripts/nearby-places-fetch.js` (categories, radius, max results, distance). **UI:** `tumbo-subframe/src/app/classes/[id]/page.tsx` (`NeighbourhoodSection`, `NEIGHBOURHOOD_TABS`, `displayAddress`, `provider?.nearby_places`). No separate recommender file; “selection” is the script + tab filter. |
| Change right-side logistics formatting | **Address/phone/website derivation:** `tumbo-subframe/src/app/classes/[id]/page.tsx` (displayAddress, displayPhone, displayWebsite). **Price/age formatting:** `tumbo-subframe/src/lib/types/tags.ts` (`formatPrice`, `formatAgeRange`). **Layout/labels:** same page (right column info rows). |

---

## 7) Safety notes (fragile couplings)

- **GPT JSON keys ↔ DB and UI:** The prompt in `synthesis-system.md` defines keys `content_tags`, `review_synthesis`, `who_thrives`, `what_to_expect`, `neighbourhood`, `vibe_line`. full-enrich.js maps these to `discovered_from.content_tags`, `classes.summary`, `classes.typical_child_profile`, `classes.outcome_expectations`, `discovered_from.neighbourhood_note`, `classes.vibe_line`. The detail page expects `contentSources.content_tags` (subject/philosophy/experience/child), `cls.summary`, `cls.typical_child_profile`, `cls.outcome_expectations`, `contentSources.neighbourhood_note`, `cls.vibe_line`. Renaming or changing shape in the prompt or script without updating the other will break display or storage.

- **EditorialBlocks and `\n\n`:** The page and prompt assume subhead + body blocks separated by `\n\n`. EditorialBlocks normalizes literal `\n` and splits on `\n\n+`. Changing the prompt to use a different delimiter without updating EditorialBlocks will break layout.

- **Review count gate:** “What parents say” and “Who thrives” / “What to expect” only show GPT content when `reviews.length >= 10` or `googleReviewCount >= 10`. Changing that threshold in the page without aligning full-enrich.js (which nulls synthesis when &lt;10) is consistent; changing it only in one place will create mismatch (e.g. summary in DB but not shown, or vice versa).

- **discovered_from shape:** The frontend assumes `discovered_from` is a JSON object with optional keys `description`, `reviews`, `child_profile`, `outcomes`, `vibe_line`, `content_tags`, `neighbourhood_note`, `price`, `age_range`, `photo`. Scripts that write different keys or nest differently can break SourceNote or content_tags display.

- **TagPill category:** `classifyTag(label)` in tag-pill.tsx maps label substrings to philosophy/experience/child/content. Adding new GPT or contextual tag labels that don’t match those lists will fall back to "content" (brown). Changing the taxonomy in the prompt without updating `classifyTag` (or the explicit `category` prop at call site) can change pill colors.

- **Neighbourhood tabs:** `NEIGHBOURHOOD_TABS` in the page must match the keys written by `nearby-places-fetch.js` (food, cafes, remote_working, groceries, parking, transit). Changing script keys without updating the page (or vice versa) will leave tabs empty or unused.

---

**End of audit.** All file paths, function names, and table/column names above are from the codebase as of the audit; NOT FOUND is stated where something was not found and the search location is listed.
