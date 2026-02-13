# Tumbo Progress

> Living log of what's done, what's active, and what's next. Updated after every work session.

**Last Updated:** 2026-02-14
**Current Phase:** Phase 1 — Design Completion

---

## Completed

### Project Foundation
- [x] Next.js 15 + React 19 project bootstrapped with TypeScript and Tailwind CSS
- [x] shadcn/ui component library configured
- [x] Subframe design system imported (62 components)
- [x] Supabase client configuration (browser + server) in `src/lib/supabase/`
- [x] `.cursorrules` and `CLAUDE.md` configured
- [x] ESLint + Prettier configured
- [x] Path aliases set up (`@/*` → `src/*`, `@/ui/*` → Subframe)

### Database
- [x] Full Supabase schema designed (`scripts/schema.sql`)
- [x] RLS policies for anonymous read + user data protection
- [x] Seed data created (`scripts/seed-data.sql`)
- [x] Performance indexes for search and filtering
- [x] Tag system schema (`scripts/tag-system-schema.sql`)
- [x] 200+ tags inserted across 4 categories (`scripts/insert-all-tags.sql`)

### Pages Designed (P01–P06)
- [x] P01: Homepage — hero, search bar with animated placeholder, categories, featured
- [x] P02: `/classes` — directory with tag-based category tabs, search, filtering
- [x] P03: `/classes/[slug]` — class detail page (info card needs redesign)
- [x] P04: `/collections` — collection listing page
- [x] P05: `/collections/[slug]` — individual collection page
- [x] P06: `/userdashboard` — user dashboard
- [x] `/tumbo-chat` — chat interface page
- [x] `/design-system` — design system showcase page

### Components Built
- [x] TumboNavbar (navigation component)
- [x] AnimatedSearchPlaceholder / AnimatedTextField (TextLoop search bar)
- [x] TagBadge (color-coded by tag type)
- [x] ClassCard / SimpleClassCard
- [x] ClassFilterSidebar / ClassFilterModal
- [x] FilterChips / WarmFilterBadge
- [x] BookmarkButton / FavoritesButton
- [x] AuthModal
- [x] ModernPageLayout
- [x] TextLoop (framer-motion text animation)

### Tag System (F07)
- [x] 4 tag categories: content (blue), experience (amber), philosophy (green), child (red)
- [x] Tag-based category tabs on `/classes`
- [x] Dynamic tag filtering
- [x] Tooltip descriptions
- [x] Mock data fallback when Supabase not connected

### Design Decisions Made
- [x] Primary orange: `#FF4400` for CTAs
- [x] Search bar background: `#F3F1ED`
- [x] Removed paperclip icon, added orange button
- [x] Using Subframe + shadcn/ui hybrid component approach
- [x] Design-first strategy: all pages designed before infrastructure build

### Design System Token Cleanup (F09, Phase 2 prep)
- [x] Added semantic CSS variables to globals.css: `--tumbo-orange`, `--tumbo-cream`, `--tumbo-hover`, `--tumbo-label`, `--tumbo-muted`, plus tag category colors
- [x] Added Tailwind utility classes: `bg-tumbo-orange`, `bg-tumbo-cream`, `text-tumbo-orange`, `text-tumbo-label`, `hover:bg-tumbo-hover`, etc.
- [x] P01 homepage: replaced all inline `style={{}}` with Tailwind tokens, swapped 4 `<img>` to Next.js `<Image>` with alt text
- [x] P02 `/classes`: replaced inline styles on filter button, search bar, and all 18 category tag buttons with token classes; removed `onMouseEnter`/`onMouseLeave` JS handlers
- [x] P03 `/classes/[slug]`: replaced all hardcoded hex (`#FF4400`, `#B6AFA6`, `#F3F1ED`, `#E2D6C7`, `#1f2937`) with tokens; fixed duplicate price display (removed "PRICE PER CLASS"); added alt text to 7 images
- [x] Navbar: replaced inline hover styles on Explore dropdown with `hover:bg-tumbo-hover`

### P03 Info Card Redesign (F03) — Complete
- [x] Sticky behavior on desktop (`sticky top-6 self-start max-md:static`)
- [x] Orange hand PNG holding card (`<Image>` with absolute positioning, hidden on mobile)
- [x] Button hierarchy resolved (FavoritesButton replaces Follow; no Message button)
- [x] "Claim this listing" CTA for providers
- [x] Mobile repositioning (`mobile:order-first`, static on mobile)
- [x] Alignment offset via `mt-[118px]` (functional; refine when real content lands)

### P02 `/classes` Directory Polish
- [x] `CustomClassCard`: replaced `<img>` with Next.js `<Image>` for optimized loading
- [x] `CustomClassCard`: removed all inline `style={{}}` on tag badges, replaced hardcoded hex colors with `bg-tumbo-tag-*` CSS token classes
- [x] Search bar: replaced `focus:ring-blue-500` with brand `focus:ring-tumbo-orange` (added ring utility to globals.css using `color-mix`)
- [x] Removed redundant `mobile:text-heading-1 mobile:font-heading-1` on page title
- [x] Scroll arrows: changed from always-visible (`opacity-100`) to hover-reveal (`group-hover/scroll:opacity-100`) with named group
- [x] Added proper empty state for 0 filtered results with "Clear all filters" CTA button

### P07 `/providers` — Provider Directory (new page)
- [x] Created `src/app/providers/page.tsx` route
- [x] Page header: "Explore Providers" title + subtitle
- [x] Search bar with brand focus ring (`focus:ring-tumbo-orange`)
- [x] Custom `ProviderCard` component: Avatar (square, with fallback initial), provider name, verified shield icon (orange), location, short description, category badges (`bg-tumbo-cream`), class count, "View profile →" link
- [x] Responsive grid: 1 col mobile, 2 col desktop (`grid-cols-1 md:grid-cols-2`)
- [x] Empty state for 0 search results with clear button
- [x] Provider count indicator
- [x] "Are you a provider?" CTA section: Claim listing + Learn more buttons, 3 benefit icons (verified badge, visibility, connect with parents)
- [x] 5 mock providers matching seed data (Little Artists Studio, TechTots Academy, Dance Dreams, Mandarin Magic, Chess Champions)
- [x] All Tumbo design tokens used — no hardcoded hex, no new shadcn/subframe imports

### Motion & Interaction Pass (F09 — Modern Feel)
- [x] Created reusable `FadeInUp` component (`src/components/ui/fade-in-up.tsx`) — framer-motion `useInView` scroll-triggered fade + slide-up animation with configurable delay, duration, offset
- [x] Created `Stagger` wrapper component for automatic delay sequencing on children
- [x] Added global CSS utilities: `.card-hover` (translateY + scale + shadow on hover) and `.photo-hover` (scale zoom on hover)
- [x] **Homepage**: staggered hero entrance (headline → subtitle → search bar with increasing delays), all 5 below-fold sections wrapped in `FadeInUp` for scroll-triggered reveals, `card-hover` on all 7 FAQ accordion items
- [x] **Navbar**: sticky with scroll-aware backdrop blur (`bg-white/80 backdrop-blur-lg` after 20px scroll, transparent at top), smooth transition between states
- [x] **Class cards** (`CustomClassCard`): added `hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300`
- [x] **Provider cards**: added `group-hover:scale-[1.02] group-hover:-translate-y-1` lift effect
- [x] **Collections page**: `card-hover` + `photo-hover` on all 8 collection cards, z-index fix on bookmark buttons
- [x] **Class detail page**: `photo-hover` zoom on all 5 gallery images (with overflow-hidden wrappers), `FadeInUp` on 5 content sections (Overheard Online, Why Emma, What to Expect, Instructors, Neighbourhood, Curated Picks), `card-hover` on 4 neighbourhood venue cards
- [x] **Chat page**: staggered `FadeInUp` entrance on all 6 prompt cards (0.05s–0.3s delays), `card-hover` + cursor-pointer on prompt cards
- [x] **Providers page**: `FadeInUp` on header + CTA section
- [x] Fixed collections page `TextField.Input` crash (`value=""` → `defaultValue=""`)
- [x] Added `remotePatterns` for `res.cloudinary.com` and `images.unsplash.com` to `next.config.ts`

---

### Frontend Polish Pass (F10 — Design Critique)
- [x] **Navbar redesign**: stripped all shadcn component imports (NavigationMenu, Popover, DropdownMenu, Button, Badge). Rebuilt with clean semantic HTML + Tailwind. Custom Explore flyout with item descriptions, animated underlines on links, custom user menu dropdown. Removed debug panel from nav.
- [x] **Card interaction fix**: removed `hover:scale-[1.02] hover:-translate-y-1` from `CustomClassCard`, `ProviderCard`. Cards no longer jump/expand on hover — prevents bookmark click issues. Replaced with shadow-only lift + orange accent line that slides in on hover.
- [x] **Card uniformity**: badges capped to 3 visible (with "+N" overflow), `line-clamp-2` on descriptions, `h-full` on card wrappers for equal height in rows
- [x] **Neighbourhood cards** (class detail): removed `card-hover` float effect from all 4 venue cards. Replaced with subtle `hover:border-neutral-300` — informational cards shouldn't move.
- [x] **Curated picks** (class detail): wrapped in `<Link>`, added image scale + brightness shift on hover, gradient overlay with "View collection →" CTA, title turns orange on hover
- [x] **Directory sections**: added "See all →" link to each `ScrollableSection` header. Scroll arrows refined (smaller, white/blur instead of black/80). Edge gradients use brand background color.
- [x] **FAQ items** (homepage): removed `card-hover` scale effect, replaced with subtle border highlight
- [x] **globals.css cleanup**: removed 15+ dangerous global `!important` overrides (`.group { overflow: hidden !important }`, `.group:hover .opacity-0`, duplicated scroll rules). Scoped scroll styles to `.scroll-section` class. `card-hover` utility changed to shadow-only (no transform).
- [x] **Scroll arrow style**: changed from opaque black circles to semi-transparent white with backdrop blur and subtle ring

---

## In Progress

### Step 1 — Wire Frontend to Real Supabase Data
1. [x] Filter providers (removed 50+ non-children categories: vets, churches, farms, etc.)
2. [ ] Seed 200+ tags into Supabase — **BLOCKED**: need to run SQL scripts in Supabase dashboard
3. [x] Wire `/providers` page to real Supabase data (4,160 providers → filtered to enrichment only)
4. [x] Real-time stat counter on `/classes` directory (pulls class + provider counts from Supabase)
5. [ ] ~~Wire `/classes` directory to Supabase~~ — DEFERRED: placeholder data quality too low (no photos, no descriptions, auto-generated names). Needs Step 2 GPT enrichment first.
6. [ ] Iterate on design with real data

---

## Blocked

No active blockers.

### Resolved Blockers

| Item | Resolution | Date |
|------|-----------|------|
| Supabase connection | `.env.local` created with project URL + publishable key (new `sb_publishable_` format) | 2026-02-13 |
| Design system decision | **Hybrid freeze**: keep current Subframe + shadcn as-is; no new imports from either. All new components are custom Tumbo components. Archive existing into styleguide. Evolve over time. | 2026-02-13 |
| Provider verification flow | **Manual review**: provider submits claim request, Tumbo team approves. Automated screening (email domain, UEN) can layer on later as volume grows. | 2026-02-13 |

---

## Next Up

Priority order for remaining design work:

1. **P08 `/providers/[slug]`** — provider profile page design
4. **P11 `/user/children`** — child profiles design
5. **P14–P15 auth pages** — sign in / register
6. **P09 `/search`** — advanced search page
7. **P10, P12, P13** — user profile, bookmarks, reviews
8. **P16–P18** — about, contact, 404
9. **Legal pages** — terms of service, privacy policy, PDPA

After all designs complete → Phase 2 (Component Library extraction).

---

## Session Log

| Date | What was done |
|------|---------------|
| 2024-08-22 | Project kickoff, initial setup, homepage design, nav component, search animation |
| 2024-08-22 | Created approach docs, sprint tracking, design principles |
| 2024-08-22 | Tag system implementation (200+ tags, 4 categories, UI components) |
| 2024-08-22 | Class detail design doc created (info card redesign plan) |
| 2026-02-13 | Installed 8 agent skills (frontend-design, supabase, next, tailwind, etc.) |
| 2026-02-13 | Consolidated docs into 3-file Ralph Wiggum system (prd.md, progress.md, styleguide.md) |
| 2026-02-13 | Design system token cleanup: added CSS variables + Tailwind utilities, replaced all hardcoded hex values across P01/P02/P03/navbar, swapped `<img>` to `<Image>`, fixed duplicate price, added alt text |
| 2026-02-13 | P03 info card audit: verified 5/6 redesign items already implemented (sticky, hand, CTA, buttons, mobile). Marked complete. Updated PRD status. Advanced Next Up queue. |
| 2026-02-13 | P02 directory polish: CustomClassCard `<img>` → `<Image>`, removed inline badge styles → CSS tokens, fixed search focus ring to brand color, scroll arrows hover-only, added empty state with clear-filters CTA |
| 2026-02-13 | Resolved all 3 blockers: Supabase `.env.local` created (publishable key), design system frozen as hybrid (no new shadcn/subframe), provider verification = manual review |
| 2026-02-13 | P07 `/providers` designed: new page with search, custom ProviderCard (avatar, verified badge, categories, class count), responsive grid, empty state, "Are you a provider?" CTA. 5 mock providers matching seed data. |
| 2026-02-13 | Motion & interaction pass: created FadeInUp component, added scroll-triggered section reveals across homepage/class detail/providers, staggered hero entrance, navbar scroll blur, card-hover lift on all cards, photo-hover zoom on galleries, chat prompt stagger. Fixed collections crash + next.config image domains. |
| 2026-02-14 | Frontend polish pass (F10): navbar full redesign (removed all shadcn, custom flyout), card interaction fix (shadow-only, no scale), neighbourhood cards de-floated, curated picks hover added, directory "See all" links, FAQ hover fix, globals.css dangerous overrides removed, scroll arrows refined |
| 2026-02-14 | Supabase data audit: 4,160 providers, 2,470 placeholder classes, 158 categories. Created 3-step build plan. Wired `/providers` to real Supabase data with category filtering + search + pagination + skeleton loading. Added real-time stats to `/classes` directory header. Documented Google Cloud project (scout-placesapi). |
