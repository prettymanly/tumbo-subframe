# Tümbo Content Engine — Rules & Methodology

> Single source of truth for how data enters, enriches, and transforms
> into editorial content across the platform. Three stages, sequential.

**Last Updated:** 2026-02-14

---

## Overview

```
STAGE 1: SCRAPING        →  STAGE 2: ENRICHMENT      →  STAGE 3: TUMBO-FICATION
Get classes into the DB      Collect rich external data    Transform into editorial content
(discovery & ingestion)      (reviews, photos, metadata)  (synthesis & presentation)
```

Each stage has its own rules, sources, and quality gates.

---

## STAGE 1: DATABASE SCRAPING

### Purpose
Discover and ingest providers + their individual classes into Supabase.

### Current State
- 1,000 providers in database
- 1,270 enriched (non-placeholder) classes
- Sources used so far: Skoolopedia directory, Google Places API

### Known Gaps
- Classes missing that are known to exist in Singapore
- Some providers have placeholder data (no real class breakdown)
- New providers and classes launching regularly

### Discovery Sources (priority order)

| Source | What we get | Trust level | Method |
|--------|------------|-------------|--------|
| **Provider's own website** | Class names, formats, schedules, pricing, age ranges, photos | High (primary) | Web scraping (cheerio) |
| **Skoolopedia** | Provider listings, basic class info, categories | Medium (directory) | Already scraped |
| **Google Places** | Business verification, address, phone, photos, rating | High (Google-verified) | API (already connected) |
| **Instagram/Facebook** | Class evidence, visual content, parent comments | Medium (social) | Public post scraping (future) |
| **KiasuParents forum** | Provider mentions, parent discussions | Medium-low (forum) | Thread scraping (future) |

### Ingestion Rules

1. **Every class must trace to a real offering.** Never invent class names. Use the ACTUAL programme name from the provider's website.
2. **One class = one distinct offering.** If a provider offers "Beginner Swimming" and "Advanced Swimming," those are two separate class entries, not one.
3. **Provider verification:** Before ingesting, confirm the provider:
   - Actually offers children's classes (not adults-only)
   - Has a working web presence (website, social media, or directory listing)
   - Is not permanently closed (check Google Business status)
4. **Category assignment** uses Tümbo's standard categories: Art, Dance, Music, Swimming, Cooking, Chinese, Mathematics, English, Piano, Science, Sports, Drama, Coding, Holiday Camp, Special Needs, Malay, Guitar, Violin, Ballet
5. **Deduplication:** Check by provider name + class name + location before inserting. Fuzzy match to catch variants ("I Can Read @ Tampines" vs "I Can Read (Tampines)")

### Quality Gate: Stage 1 → Stage 2
A class is ready for enrichment when it has:
- [ ] Real class name (not auto-generated)
- [ ] Correct provider_id
- [ ] Category assigned
- [ ] is_placeholder = false

---

## STAGE 2: DATABASE ENRICHMENT

### Purpose
Collect rich, multi-source data to feed the synthesis engine.
Enrichment operates at the PROVIDER level (reviews are per-business on Google)
then assigns data down to CLASS level.

### The Stratified Sampling Method

For Google review collection, we do NOT take Google's default 5 "most relevant" reviews.
We use a **stratified sampling approach** to capture the full spectrum:

#### Phase 1: Stratified Collection (via Outscraper API)

For each provider, make 3 API calls:

| Call | Sort | Limit | Purpose |
|------|------|-------|---------|
| 1 | `lowest_rating` | 10 | Failure modes — 1-3 star reviews |
| 2 | `newest` | 15 | Current sentiment — recent changes |
| 3 | `most_relevant` | 15 | Google's pick — what most users see |

For providers with ≤40 total reviews: get ALL reviews in a single call.

This gives us ~30-40 reviews per provider, distributed across the rating spectrum.
Deduplicate across calls (same review may appear in multiple sort buckets).

**Why this works:** Captures the full spectrum without reading everything. The 1-star reviews show failure modes; the 5-stars show optimized experiences; the middle tiers show realistic variance.

#### Phase 2: Frequency + Semantic Clustering

As reviews are processed, track:

- **Word/phrase frequency** — What repeats across multiple reviews?
  - Positive: "patient," "energetic," "fun"
  - Negative: "boring," "repetitive," "money wasted"
- **Named entities** — Teacher names, specific events, locations mentioned repeatedly
- **Semantic clusters:**
  - Logistics: "easy to book," "convenient location," "traffic"
  - Instruction: "patient," "confusing," "technical," "beginner-friendly"
  - Social: "bonding," "included," "isolated," "group dynamics"
  - Experience: "time flew," "exhausting," "immersive," "boring"
  - Child outcomes: "wanted to return," "nervous," "gained confidence"
- **Temporal patterns** — Are old reviews systematically different from new ones?

#### Phase 3: Structural Signal Detection

Count and record:

- How many reviews mention instructors by name? (signals personalization matters)
- How many discuss technique/skill development vs. experience/fun? (signals philosophy)
- How many mention ongoing classes vs. one-off events? (signals data gap)
- How many include photos/evidence? (credibility signal)
- How many are owner-responded-to? (signals engagement level)

These ratios are metadata — stored on the provider, surfaced in synthesis.

### Data Sources for Enrichment

| Source | Use for | Trust for sentiment? |
|--------|---------|---------------------|
| **Google Reviews** (Outscraper) | Primary review evidence | YES — independent platform |
| **Provider website** | Factual details ONLY (class format, pricing, schedule, curriculum) | NO — conflict of interest |
| **Provider social media** | Visual evidence, parent comments on posts | PARTIAL — comments are real, captions are marketing |
| **KiasuParents / forums** | Supplementary parent opinions | YES — independent |

**Critical rule:** NEVER use testimonials or reviews from the provider's own website as parent sentiment. That is the provider speaking about themselves. Website content is ONLY used for factual operational details.

### Review-to-Class Assignment

Google reviews are collected at the PROVIDER level (one Google listing per business).
Reviews must be assigned to specific CLASSES within the provider.

| Provider type | Assignment method |
|--------------|-------------------|
| Single-class (88% of providers) | All reviews → that class |
| Multi-class (12%) | Keyword matching: category terms, class name mentions, age references |
| Ambiguous reviews | Tagged `general_provider_review` — available to all classes but flagged |

Assignment signals (in order of strength):
1. Category keyword match (review mentions "swimming" → Swimming class) — score +10
2. Class name keyword match — score +3 per word
3. Age range match (review mentions "my 3-year-old", class is ages 2-4) — score +2
4. Score ≥5 → assign to best match. Score 1-4 with unique winner → weak assign. Score 0 or tie → general provider review.

### Storage Architecture

| Where | What | Why |
|-------|------|-----|
| `data/outscraper/{provider_id}.json` | Full raw Outscraper corpus | Local backup, audit trail |
| `providers.classes_scrape_source` | Metadata: rating distribution, structural signals, collection timestamp | Provider page stats |
| `classes.raw_reviews` | Assigned review subset per class (10-40 reviews) | Class-level synthesis input |

### Class Page vs Provider Page Distinction

- **Class page:** Shows synthesized "What parents say" from class-assigned reviews. NO provider star rating. The synthesis reads like editorial analysis of THAT SPECIFIC CLASS experience.
- **Provider page:** Shows aggregate Google rating, total review count, rating distribution, all reviews. The school-level view.

### Quality Gate: Stage 2 → Stage 3
A class is ready for Tümbo-fication when it has:
- [ ] ≥5 assigned reviews (ideal: 15-40)
- [ ] Reviews span at least 2 rating tiers
- [ ] Review text is substantive (not just star-only reviews)
- [ ] OR: website content provides enough factual detail for a description

Classes with thin data (0 reviews, no website) get a minimal treatment:
description + vibe line from available metadata only. No synthesis sections.

---

## STAGE 3: DATABASE TUMBO-FICATION

### Purpose
Transform raw data into editorial content that helps parents understand
what a class actually is — based on what others have experienced.

### Core Philosophy

This is NOT marketing copy. This is **ethnographic synthesis**.
The voice is neutral, observational — translating parent experience, not endorsing.

Think: Jan Chipchase doing field research on children's enrichment in Singapore.

### The Synthesis Prompt

The AI receives ALL available data for one class in a single prompt and generates
all sections coherently. This ensures every section references the same evidence base.

### Input priority (order of use)

1. **Provider website first** — For factual context only: what the class is, format, schedule, pricing, location. Never for parent sentiment. Scraped and passed as "FACTUAL DATA" only.
2. **Solid number of Google reviews** — From stratified collection (Stage 2). This is the primary evidence for synthesis. We need a **solid baseline**, not a handful: stratified collection gives ~30–40 reviews per provider; classes get 10–40 assigned. Do not treat "3 reviews" as enough for full synthesis.
3. **Forums / other** — KiasuParents, social comments, etc. (future). Supplementary.

**Baseline for full synthesis:** A class gets "What parents say", "Who thrives", "What to expect" only when it has **≥10 assigned reviews** from stratified collection. Below that: description + vibe_line from metadata only. No overclaiming on thin data.

### Input Data Structure

```
══ FACTUAL DATA (for description only) ══
Class metadata + provider website content
→ Used ONLY for operational facts
→ NEVER used for parent sentiment

══ PARENT REVIEWS — PRIMARY EVIDENCE ══
Stratified Google reviews (from Stage 2) — solid volume per provider
→ Primary source for all experiential sections
→ Use parent language verbatim
```

### Output Sections

#### 1. Content Tags
Structured metadata derived from evidence:

```
Subject:     What is literally taught (e.g. "Bollywood Dance | Zumba Fitness")
Philosophy:  Teaching approach from REVIEWS, not website claims (e.g. "inclusive, celebration-focused")
Experience:  Sensory/emotional tone from parent language (e.g. "high-energy, celebratory")
Child:       Who fits based on evidence (e.g. "social learners, kids seeking group energy")
```

Tags are 3-8 words each. Philosophy and Experience must be derived from review evidence,
not website marketing language.

#### 2. About This Class (description)
2-3 short paragraphs. Factual and editorial.
- What the class is, formats offered, schedule, ages, price. Use website for operational details only.
- Do NOT repeat full address or "Located at [address]" — address is in the info card and neighbourhood.
- Do NOT repeat "Google rating of X from Y reviews" — rating is in the info card.
- No marketing language: no "Welcome to," "At [provider]," "holistic," "nurturing," "unlock potential"

#### 3. What Parents Say (review_synthesis) — THE CORE SECTION

This is what makes Tümbo different from every other directory.
This must read like a **field research synthesis**, not a summary.

**Mandatory approach:**

1. **Quote repeated adjectives verbatim** — in quotation marks:
   "described as 'energetic,' 'patient,' and 'encouraging'"

2. **Name specific instructors** if reviews mention them

3. **Identify the meta-pattern** — what do parents emphasize most? Name it explicitly:
   "The language parents use focuses on atmosphere and comfort rather than technical progression"

4. **Surface tensions** — contradictions between reviews, event vs. regular experiences:
   "great for birthday parties but unclear for ongoing enrollment"

5. **Flag what's NOT mentioned** — absence is data:
   "No reviews mention curriculum structure or progression milestones"

6. **Note temporal patterns** — old vs. recent reviews:
   "Critical reviews from 2018 mentioned X; recent feedback is overwhelmingly positive"

7. **Include critical feedback** — don't sanitize

4-6 sentences. Every claim must trace to actual review text.
If zero reviews: null (do not generate).

#### 4. Who Thrives Here (typical_child_profile)
Child personality types, group dynamics, confidence levels from review evidence.
Be specific: "Your 5-year-old who hides behind your leg at parties but lights up
when they hear music" — not "children who enjoy creative activities."
1-3 sentences. Null if insufficient evidence.

#### 5. What To Expect (outcome_expectations)
The actual experience from reviews, not website promises.
- Physical space, pace, structure
- Flag DATA GAPS: "Most reviews describe event experiences; regular class enrollment
  is underrepresented in available feedback"
- Booking/communication experience if mentioned
2-3 sentences. Null if insufficient evidence.

#### 6. In The Neighbourhood
- **Review synthesis (neighbourhood_note):** Logistics parents ACTUALLY mentioned in reviews: location convenience, parking, MRT access. ONLY include if parents mentioned it. 1-2 sentences. Null if no parent mentioned.
- **UI & data:** Section is lifestyle context for parents (what to do while kid is in class). Tabs: F&B, Cafes, Remote working, Groceries, Parking, Public transport. Data from Google Places Nearby Search; stored in `providers.nearby_places`. Presentation and categories defined in `docs/NEIGHBOURHOOD_ENGINE.md`. Run `nearby-places-fetch.js` when finessing new entries so this section is populated.

#### 7. Vibe Line
Under 12 words, lowercase, no period.
Must be specific to THIS class based on review evidence.

```
BAD:  "where every child blossoms"
BAD:  "fun and engaging classes"
BAD:  "quality education in a nurturing environment"
GOOD: "the birthday party energy your kid talks about for weeks"
GOOD: "serious technique, zero stuffiness"
GOOD: "gentle enough for the shy ones, fun enough they forget"
```

### Extraction Principles

- **Use parent language verbatim** where possible; don't interpret
- **Surface tensions** (e.g., "great for birthday parties but unclear for ongoing enrollment")
- **Flag what's NOT mentioned** (if no one discusses technique, that's information)
- **Note temporal patterns** (old reviews vs. recent; seasonal variations if visible)
- **Don't assume** — report what parents actually said
- **Let the patterns speak** — don't over-interpret

### Voice Guidelines

- Neutral, observational, ethnographic
- Avoid marketing language or value judgments
- Write as if **translating parent experience, not endorsing**
- Keep sentences clear and scannable
- Singapore English is fine: "enrichment centre," "programme," "mum"
- NO: "lah," "lor," "shiok" in editorial content

### Treatment Tiers (based on data richness)

| Data available | Sections generated |
|---------------|-------------------|
| Reviews (≥5) + website | Full treatment: all 7 sections |
| Reviews (1-4) + website | Description + review synthesis + vibe line |
| Website only (0 reviews) | Description + vibe line (factual only) |
| Nothing (metadata only) | Minimal: category + location + vibe line from metadata |

**Never fill with generic language.** If a section can't be specific and evidence-based,
set it to null rather than writing filler.

The canonical prompt in `scripts/prompts/synthesis-system.md` targets **editorial synthesis** (decision clarity, experiential framing, category fidelity): long-form review_synthesis (4–6 paragraphs, named staff, dominant narrative, affordability, facility, one constructive caveat); who_thrives and what_to_expect as **plain-text strings** with paragraph breaks (never nested JSON). Includes FORBIDDEN list and structural guidance. Keep ENGINE.md and that prompt in sync.

---

## Script compliance (mandatory)

Scripts MUST follow this doc. Do not change collection or synthesis behaviour without updating ENGINE.md and the canonical prompt.

| Script | Canonical rules | Enforced behaviour |
|--------|-----------------|---------------------|
| `review-collect.js` | § Stage 2 Phase 1 | Stratified: lowest_rating 10, newest 15, most_relevant 15. Retries on empty. Run exits 1 if >10% of providers return no reviews. |
| `full-enrich.js` | § Stage 3 + `scripts/prompts/synthesis-system.md` | System prompt from prompt file. 1+ reviews → description + review_synthesis + vibe_line; ≥5 → who_thrives, what_to_expect. No raw website body in description. |

## Scripts Reference

| Script | Stage | What it does |
|--------|-------|-------------|
| `review-collect.js` | 2 | Outscraper stratified review collection |
| `review-assign.js` | 2 | Assigns provider reviews → specific classes |
| `full-enrich.js` | 3 | GPT synthesis engine (ethnographic editorial) |
| `data-cleanup.js` | 1-2 | Fixes garbage descriptions, Skoolopedia links, missing phones |
| `google-places-fetch.js` | 2 | Google Places API data (photos, rating, address) |
| `nearby-places-fetch.js` | 2 | In the Neighbourhood: F&B, cafes, groceries, parking, transit via Places Nearby Search → `providers.nearby_places`. See `docs/NEIGHBOURHOOD_ENGINE.md`. Run after Place ID is set. |

---

## Costs

| Service | What | Estimated cost |
|---------|------|---------------|
| Outscraper | ~26K reviews (stratified) | ~$78 |
| OpenAI GPT-4o-mini | ~1,270 classes × synthesis | ~$5-10 |
| Google Places API | Already collected | Sunk cost |
| **Total** | Full pipeline | **~$85-90** |

---

## Open Questions

1. **Instagram scraping** — When do we add provider social media as an input source?
2. **KiasuParents threads** — Valuable signal but harder to scrape systematically. Priority?
3. **Review refresh cadence** — How often do we re-collect? Monthly? Quarterly?
4. **New provider discovery** — What's the process for adding providers not yet in the DB?
5. **Provider-submitted data** — When providers claim listings, how does their input flow into the engine?
