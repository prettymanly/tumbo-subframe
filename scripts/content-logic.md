# Tumbo Content Generation Logic

> Framework for transforming raw scraped provider data into enriched class listings.
> Every field has a **source**, a **rule**, and an **example**.

---

## Data Sources (per class)

| Source | Where it comes from |
|--------|-------------------|
| `provider_website` | Scraped HTML from the provider's own site |
| `skoolopedia` | Listing on skoolopedia.com |
| `google_places` | Google Places API (photos, rating, reviews) |
| `manual_research` | Verified by checking the site + socials |

---

## Field Generation Rules

### `name` — Class Name
- **Source:** provider_website or skoolopedia
- **Rule:** Use the ACTUAL class/programme name from the website. If a provider offers multiple tiers (e.g. "Twoosy Doodlers", "Mini Doodlers", "Doodlers"), create separate class entries for each tier. Never invent class names.
- **Format:** Title Case, max 60 chars
- **Example:** "Twoosy Doodlers" (not "Abrakadoodle Creative Art for Toddlers")

### `summary` — One-Sentence Summary
- **Source:** Derived from description
- **Rule:** Compress the class description into a single sentence (max 150 chars). Focus on WHAT the class teaches and WHO it's for. Use factual language, no marketing fluff.
- **Format:** "[Activity type] class for [age group] focusing on [core skill/technique]."
- **Example:** "Sensory-focused art class for toddlers aged 20 months to 3 years, developing fine and gross motor skills through colour, texture, and materials."

### `vibe_line` — Tagline / Hook
- **Source:** Derived from description + teaching philosophy
- **Rule:** A short, punchy line that captures the FEEL of the class. Should answer "what's the vibe?" not "what do they learn?" Max 80 chars. Written in Tumbo's voice — warm, direct, slightly opinionated.
- **Tone rules:**
  - Use lowercase or sentence case (not ALL CAPS)
  - No exclamation marks
  - No corporate speak ("unlock potential", "empower your child")
  - Allowed: metaphor, sensory language, gentle humour
- **Formula:** [Sensory/emotional hook] + [what makes this class different]
- **Examples:**
  - "Messy hands, proud faces — art that lets toddlers be toddlers"
  - "Where quiet kids find their voice through rhythm"
  - "Proper technique, zero pressure — swimming at their own pace"
- **Anti-examples (never write these):**
  - "Unleash your child's creative potential!" (corporate)
  - "The best art class in Singapore!" (superlative)
  - "Fun and engaging classes for all ages!" (generic)

### `description` — Full Description
- **Source:** provider_website (primary), enhanced with scraped details
- **Rule:** 2-3 paragraphs. First paragraph: what happens in a typical session. Second: teaching approach/philosophy. Third (optional): practical details (class size, materials, what to bring).
- **Tone:** Informative, parent-facing. Write as if explaining to a friend what their kid will experience. Use "your child" not "students". Use present tense.
- **Length:** 150-300 words
- **Must include (if available from scrape):**
  - What actually happens in class (activities, format)
  - Teaching methodology or approach
  - Class size / student-teacher ratio
  - Materials provided vs bring-your-own
- **Must NOT include:**
  - Pricing (separate field)
  - Scheduling details (separate field)
  - Marketing superlatives
  - Claims we can't verify ("best in Singapore", "award-winning" unless we have proof)

### `age_min` / `age_max` — Age Range
- **Source:** provider_website, skoolopedia
- **Rule:** Use the EXACT age range stated on the provider's website. Convert months to decimals if needed (20 months = 1.5 rounded to 2). If the site says "3-5 years", use age_min=3, age_max=5.
- **If not stated:** Leave null. Never guess.

### `price` — Price Per Session (numeric)
- **Source:** provider_website
- **Rule:** The price for a SINGLE session/class in SGD, as a number (no $ sign). If the site shows package pricing (e.g. "$240/term for 8 sessions"), divide to get per-session ($30). If trial pricing differs, use the regular session price.
- **If not available:** Leave null. Never guess.

### `schedule` — Class Schedule
- **Source:** provider_website
- **Rule:** The actual schedule from the website. Format: "[Day(s)] [Time]". Use 12-hour format with AM/PM.
- **Format:** "Saturdays 10:00 AM – 12:00 PM" or "Mon/Wed/Fri 3:30 PM – 5:00 PM"
- **If not available or varies:** "Contact provider for schedule"

### `photo_url` — Primary Image
- **Source:** provider_website (preferred) > google_places > unsplash fallback
- **Rule:** Use an actual photo from the provider's website — their classroom, students at work, artwork, etc. If the site uses lazy loading or CDN URLs, capture the actual image URL. Only use Unsplash as a last resort with a category-appropriate search.
- **Priority order:**
  1. Provider's own class photos
  2. Google Places photos
  3. Unsplash fallback (search: "[category] children class singapore")

### `category` — Class Category
- **Source:** manual_research, provider_website
- **Rule:** Use one of the standard Tumbo categories. Match to what the class actually teaches, not what the provider calls themselves.
- **Standard categories:** Art, Dance, Music, Swimming, Cooking, Chinese, Mathematics, English, Piano, Science, Sports, Drama, Coding
- **Example:** A provider called "Rhythm Academy" that teaches drumming → category "Music" (not "Rhythm")

### `google_rating` / `review_count` — Google Business Rating
- **Source:** google_places API
- **Rule:** The actual Google Business rating (1.0-5.0) and total review count for the provider's location. If the provider has multiple locations, use the rating for the specific branch this class is at.
- **If not available:** Leave null. Never fabricate ratings.

### `raw_reviews` — Customer Reviews (JSON string)
- **Source:** provider_website testimonials, google_places reviews
- **Rule:** Capture REAL reviews/testimonials from the website. Store as JSON array of `{author, text, rating}`. Include the actual reviewer name (or initial if privacy needed). Include the actual review text. For Google reviews, use the actual rating. For website testimonials without stars, default rating to 5.
- **Format:** `[{"author": "Parent Name", "text": "Actual review text...", "rating": 5}]`
- **Minimum:** 2 reviews if available. Max 5.
- **If none available:** Set to null, not empty array.

### `typical_child_profile` — "Who Thrives Here"
- **Source:** Derived from description + age range + teaching style + real reviews
- **Rule:** Describe the TYPE of child who would love this class. Be specific and observational, not generic. Reference actual aspects of the class (e.g. if the class involves gallery time where kids present, mention that public speaking element).
- **Tone:** Warm, specific, non-judgmental. Like a teacher describing which kids light up in their class.
- **Length:** 2-3 sentences, max 200 chars
- **Formula:** "[Type of child] + [why this class suits them] + [specific class element that helps]"
- **Example (real, from Abrakadoodle data):** "Curious kids who love getting messy with paint and glue. Children who enjoy sharing what they've made — the gallery time at the end of each session builds real confidence in speaking up."
- **Anti-example:** "Perfect for all children who enjoy art!" (too generic)

### `not_ideal_for` — "Might Not Be the Best Fit"
- **Source:** Derived from class format + age range + activity type
- **Rule:** Honestly describe which children might not enjoy this class. This builds trust with parents and saves everyone time. Be kind but direct.
- **Tone:** Supportive, not negative. Frame as "fit" not "flaw".
- **Length:** 1-2 sentences, max 150 chars
- **Formula:** "[Specific child trait] + [aspect of class that might clash]"
- **Example:** "Kids who need lots of movement breaks might find the 90-minute seated sessions challenging. Very shy children may feel uncomfortable during gallery presentation time."
- **Anti-example:** "Not for children who don't like art" (obvious, unhelpful)

### `outcome_expectations` — "What to Expect After a Term"
- **Source:** Derived from description + class structure + provider claims (verified)
- **Rule:** Describe tangible, observable outcomes a parent can expect after one term (typically 8-12 weeks). Be specific about skills, not vague about "growth". Only claim what the class structure supports.
- **Tone:** Honest, grounded. Under-promise, over-deliver.
- **Length:** 2-3 sentences, max 250 chars
- **Formula:** "After [timeframe], your child will [specific observable skill/behavior]. [Additional outcome]. [Caveat if needed]."
- **Example:** "After a 10-week term, your child will be comfortable holding a pencil with a proper grip and mixing primary colours intentionally. They'll have a small portfolio of 8-10 original pieces to bring home."
- **Anti-example:** "Your child will develop creativity and confidence!" (unmeasurable)

---

## Content Quality Checklist

Before any enriched entry goes live, check:

- [ ] **Name** is the actual class name from the website (not invented)
- [ ] **Description** reflects what actually happens in the class (not imagined)
- [ ] **Age range** matches the website exactly
- [ ] **Price** is real and current (or null)
- [ ] **Reviews** are real testimonials from the site (or null)
- [ ] **Google rating** is from Google (or null)
- [ ] **Photo** is from the provider's site (or properly attributed stock)
- [ ] **Vibe line** follows tone rules (no corporate speak, no superlatives)
- [ ] **Child profile** references specific class elements (not generic)
- [ ] **Not ideal for** is honest and kind (not dismissive)
- [ ] **Outcomes** are specific and achievable (not vague promises)
- [ ] **Provider actually offers children's classes** (verified)

---

## Disqualification Criteria

A provider/class should be REMOVED from enrichment if:

1. **No children's classes:** Provider only serves adults (e.g. professional diploma schools)
2. **No web presence:** No working website, no social media, no directory listings
3. **Ceased operations:** Website down, phone disconnected, Google shows "permanently closed"
4. **Irrelevant category:** Not an enrichment/extracurricular class (e.g. tuition centre doing exam prep only)

---

## Tone Guide — Tumbo Voice

Tumbo writes like a well-informed friend who happens to know every kids' class in Singapore.

| Do | Don't |
|----|-------|
| "Your kid will love the messy paint sessions" | "Children will enjoy creative exploration" |
| "Small class — 6 kids max, so your child gets proper attention" | "Optimal student-teacher ratios ensure personalised learning" |
| "They learn to swim properly, not just splash around" | "Comprehensive aquatic curriculum" |
| "Honestly, it's pricey — but the materials are premium" | "Investment in your child's future" |
| "The teacher has 15 years of experience and it shows" | "Our qualified instructors" |

### Voice attributes:
- **Warm** — we like kids and respect parents
- **Direct** — no filler, no corporate speak
- **Specific** — concrete details, not vague promises
- **Honest** — includes trade-offs, not just positives
- **Slightly opinionated** — we have taste and standards
