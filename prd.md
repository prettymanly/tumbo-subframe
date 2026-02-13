# Tumbo PRD

> Single source of truth for what we're building. Every task traces back to a requirement here.

## Product

Tumbo is a public-facing class directory for children's activities in Singapore. Parents search, filter, and discover quality classes. Providers get discoverable, verified listings. The platform is fast, trustworthy, and SEO-optimized — built to become the default place parents go to find kids' activities.

**Target:** Parents in Singapore seeking children's classes and activities.

## Success Metrics

- Landing to first class view: < 20 seconds
- 100+ quality class listings in database
- 10+ organic leads to providers within 1 month of launch
- Lighthouse mobile score: > 90
- Page load: < 3s on 3G

---

## Pages

Each page has an ID for tracking in progress.md.

### Designed (needs review/polish)

| ID | Route | Purpose | Status |
|----|-------|---------|--------|
| P01 | `/` | Homepage (logged out) — hero, search, categories, featured classes | Designed |
| P02 | `/classes` | Class directory — grid/list views, search, tag-based filtering | Designed |
| P03 | `/classes/[slug]` | Class detail — rich info, schedule, provider, reviews, CTA | Designed, info card complete |
| P04 | `/collections` | Curated collections listing | Designed |
| P05 | `/collections/[slug]` | Individual collection page | Designed |
| P06 | `/userdashboard` | User dashboard (logged in home) | Designed |

### Needs Design

| ID | Route | Purpose |
|----|-------|---------|
| P07 | `/providers` | Provider directory | Designed |
| P08 | `/providers/[slug]` | Provider profile page |
| P09 | `/search` | Advanced search with filters |
| P10 | `/user/profile` | User profile management |
| P11 | `/user/children` | Manage children profiles |
| P12 | `/user/bookmarks` | Saved/bookmarked classes |
| P13 | `/user/reviews` | User's reviews |
| P14 | `/auth/signin` | Sign in page |
| P15 | `/auth/register` | Registration page |
| P16 | `/about` | About Tumbo |
| P17 | `/contact` | Contact/support |
| P18 | `/404` | Not found page |

### Future (post-launch)

| ID | Route | Purpose |
|----|-------|---------|
| P19 | `/compare` | Compare multiple classes |
| P20 | `/providers/onboarding` | Provider signup flow |
| P21 | `/admin` | Content management |
| P22 | `/blog` or `/guides` | SEO content |

---

## Features

### F01 — Search & Discovery
- Full-text search across classes, providers, tags
- Tag-based filtering (4 tag types: content, experience, philosophy, child)
- Filter by location, age range, price range, schedule
- Sort by relevance, price, rating, distance
- Search suggestions / autocomplete

### F02 — Class Listings
- Grid and list view toggle
- Class cards with image, title, provider, price, age range, tags
- Pagination or infinite scroll
- Category tab navigation

### F03 — Class Detail
- Rich class information (description, schedule, pricing, age range, class size)
- Provider info card with verification badge
- Session schedule display
- Tag display (color-coded by type)
- Share/save/bookmark actions
- Sticky info card on desktop
- "Claim this page" CTA for providers
- Mobile-optimized layout

### F04 — Provider Profiles
- Provider info, logo, verification status
- List of classes offered
- Contact information (protected, no direct exposure)
- Website link

### F05 — User Authentication
- Supabase Auth (email/password, social login)
- Session management with secure cookies
- Protected routes for user-specific pages

### F06 — User Features
- Bookmark/save classes
- Child profiles (age, interests for recommendations)
- Review submission
- Dashboard with saved classes and recommendations

### F07 — Tag System
- 200+ tags across 4 categories (content, experience, philosophy, child)
- Hierarchical tag structure
- Color-coded tag badges (blue/green/amber/red)
- Tag-based search and filtering
- Tooltip descriptions on hover

### F08 — Collections
- Curated class groupings (e.g., "Best Art Classes for Toddlers")
- Collection pages with themed hero images
- Editorial descriptions

### F09 — SEO & Performance
- Server-side rendering for all public pages
- Proper meta titles, descriptions, Open Graph tags
- Structured data (JSON-LD): Organization, Course, LocalBusiness, BreadcrumbList, Review
- XML sitemap, robots.txt, canonical URLs
- Next.js Image component for all images
- Code splitting and lazy loading

### F10 — Data Pipeline
- Node.js scraping scripts for class data ingestion
- Data validation and sanitization
- Automated weekly data refresh (cron)
- Admin review queue for scraped content

---

## Data Model

### Core Tables (Supabase/PostgreSQL)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `providers` | Class providers/orgs | name, slug, logo, website, verified_status, description |
| `classes` | Individual class offerings | title, slug, description, price, age_min, age_max, duration, class_size, provider_id |
| `tags` | Multi-dimensional categorization | name, type (content/experience/philosophy/child), description, parent_id |
| `class_tags` | Many-to-many join | class_id, tag_id |
| `sessions` | Class schedules | class_id, weekday, start_time, end_time, frequency |
| `collections` | Curated groupings | title, slug, description, image |
| `collection_classes` | Many-to-many join | collection_id, class_id |
| `reviews` | User reviews (future) | class_id, user_id, rating, content |
| `user_profiles` | Extended user data | user_id, display_name, children |
| `bookmarks` | Saved classes | user_id, class_id |

### Security
- Row Level Security (RLS) on all tables
- Anonymous read access for public content
- Authenticated access for user-specific data
- No direct exposure of personal contact info

---

## Phases

### Step 1 — Frontend Prototype with Real Data (current)
Polish every page with real-enough data until the frontend feels proud-worthy.
- [x] All core pages designed (P01–P07)
- [x] Motion & interaction pass (FadeInUp, scroll effects, hover states)
- [x] Frontend polish pass (navbar redesign, card fixes, globals cleanup)
- [ ] Filter Supabase providers to children's enrichment (remove noise from 4,160)
- [ ] Seed 200+ tags into Supabase
- [ ] Wire `/providers` to real Supabase data
- [ ] Generate rich content for 10-15 real classes → insert into Supabase
- [ ] Wire `/classes` directory + `/classes/[slug]` to Supabase
- [ ] Iterate on design with real data until satisfied

**Stay here as long as needed. No backend complexity, no auth, no scraping.**

### Step 2 — Backend + Enriched Data + Auth ($2-10)
Once frontend is locked, connect real backend and scale data.

**2A — Data enrichment:**
- [ ] Batch GPT script to enrich 100-500 classes (descriptions, vibe lines, tags)
- [ ] Process provider websites for teaching philosophy, class details
- [ ] Test directory at scale — does UI hold with 200+ real classes?
- [ ] Handle edge cases (no photo, no reviews, incomplete data)

**2B — Auth + user features:**
- [ ] Supabase Auth (sign up, sign in, password reset)
- [ ] User profiles + child profiles
- [ ] Bookmarks / favourites (persist across sessions)
- [ ] "Claim this listing" provider flow
- [ ] Full user journey: landing → browse → bookmark → sign up → dashboard

### Step 3 — Full Pipeline + Editorial ($50-100)
Dynamic content, personalisation, editorial.
- [ ] Google Places API (`scout-placesapi`) for photos, ratings, reviews
- [ ] GPT processes reviews into "Overheard Online" summaries
- [ ] Neighbourhood venues auto-populated from Places nearby search
- [ ] Curated collections with editorial copy
- [ ] Tumbo Chat connected to real recommendation engine (SCOUTS framework)
- [ ] Content refresh pipeline (monthly batch processing)

---

## Infrastructure

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Database, Auth, Storage | Connected (`eygsipxgzszwyzemevji`) |
| Google Cloud | Places API for enrichment | Project `scout-placesapi` (762112651943) |
| Vercel | Hosting + edge caching | Configured |
| OpenAI/Anthropic | GPT processing for content | Needs API key (Step 2) |

---

## Launch Requirements

### Must-Have (legal minimum)
- [ ] PDPA compliance (Singapore Personal Data Protection Act)
- [ ] Privacy Policy (explicit about children's data)
- [ ] Terms of Service (separate for users and providers)
- [ ] Basic provider verification (ACRA business registration)
- [ ] Content moderation queue
- [ ] Contact system without exposing personal info
- [ ] Cookie consent

### Should-Have (for growth)
- [ ] Provider analytics dashboard
- [ ] Email marketing system (SendGrid/Postmark)
- [ ] Review authenticity checks
- [ ] SEO content strategy (guides, location pages)
- [ ] Social sharing optimization
- [ ] Referral program infrastructure

### Nice-to-Have (for scale)
- [ ] Multi-language support (i18n)
- [ ] Payment processing (Stripe/PayNow)
- [ ] Native app / PWA
- [ ] AI-powered recommendations (GPT-4)
- [ ] Advanced analytics and A/B testing
- [ ] WhatsApp Business API

---

## Quality Targets

| Category | Target |
|----------|--------|
| Lighthouse (mobile) | 90+ all categories |
| PageSpeed | 90+ mobile, 95+ desktop |
| Load time | < 3s on 3G |
| SEO score | 95+ (Ahrefs) |
| Accessibility | 0 critical errors (WAVE) |
| Security headers | A+ (SecurityHeaders.com) |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| Initial bundle | < 200KB |
