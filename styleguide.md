# Tumbo Style Guide

> How it looks. Design tokens, colors, typography, component patterns. Reference this before building any UI.

---

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Orange | `#FF4400` | CTAs, primary buttons, accent highlights |
| Background | `#FDFBF7` | Page background (warm off-white) |
| Text Primary | `#1c1917` | Headings, body text (neutral-900) |
| Text Subtext | `#78716c` | Secondary text, captions (neutral-500) |
| Text Muted | `#99A1AF` | Placeholder text, disabled states |
| Search Bar BG | `#F3F1ED` | Search input background |
| Hover State | `#E2D6C7` | Interactive element hover |
| Border | `#e7e5e4` | Card borders, dividers (neutral-200) |
| Brand Primary | `#262626` | Navbar, dark UI elements (brand-600) |

### Semantic Colors

| Category | Light (50) | Default (500) | Dark (700) |
|----------|-----------|---------------|------------|
| Error | `#fef2f2` | `#ef4444` | `#b91c1c` |
| Warning | `#fffbeb` | `#f59e0b` | `#b45309` |
| Success | `#f0fdf4` | `#22c55e` | `#15803d` |

### Tag Colors

| Tag Type | Theme | Usage |
|----------|-------|-------|
| Content | Blue | What classes teach |
| Experience | Amber | How it's taught |
| Philosophy | Green | Provider's approach |
| Child | Red | Child characteristics |

---

## Typography

**Font Family:** Lexend (all weights) — `var(--font-lexend)`
**Monospace:** IBM Plex Mono (code blocks only)

| Token | Size | Line Height | Weight | CSS Class |
|-------|------|-------------|--------|-----------|
| Heading 1 | 40px | 48px | 700 (Bold) | `.text-heading-1` |
| Heading 2 | 28px | 36px | 600 (SemiBold) | `.text-heading-2` |
| Heading 3 | 20px | 28px | 600 (SemiBold) | `.text-heading-3` |
| Body | 16px | 24px | 300 (Light) | `.text-body` |
| Body Bold | 16px | 24px | 600 (SemiBold) | `.text-body-bold` |
| Caption | 12px | 16px | 400 (Regular) | `.text-caption` |
| Caption Bold | 12px | 16px | 600 (SemiBold) | `.text-caption-bold` |

---

## Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radii.sm` | 8px | Small elements (badges, chips) |
| `radii.md` / `radii.DEFAULT` | 16px | Cards, inputs, containers |
| `radii.lg` | 24px | Large containers, modals |
| `radii.full` | 9999px | Avatars, pills |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `sm` / `default` | `0px 1px 2px rgba(0,0,0,0.05)` | Subtle card elevation |
| `md` | `0px 4px 16px rgba(0,0,0,0.08)` | Elevated cards, dropdowns |
| `lg` | `0px 12px 32px rgba(0,0,0,0.08)` | Modals, popovers |

---

## Component Libraries

### Two systems in use:

**Subframe** (`src/components/subframe/ui/`) — 62 prebuilt components
- Primary design system, imported from Subframe tool
- Includes: Button, ClassCard, TextField, Dialog, Drawer, Tabs, Badge, Avatar, Select, etc.
- Has its own Tailwind preset (`subframe/ui/tailwind.config.js`)
- Layouts: DefaultPageLayout, DialogLayout, DrawerLayout

**shadcn/ui** (`src/components/ui/`) — custom + adapted components
- Used for components not in Subframe or needing customization
- Includes: auth-modal, class-filter-sidebar, tumbo-navbar, bookmark-button, tag-badge, text-loop, etc.
- Built with Radix UI primitives underneath

### When to use which:
- **Subframe first** — if a Subframe component exists for the job, use it
- **shadcn/ui** — for custom Tumbo-specific components or when Subframe lacks the pattern
- **Never duplicate** — don't build a shadcn version of something Subframe already has

---

## Layout Patterns

### Page Structure
```
DefaultPageLayout (Subframe)
  └── TumboNavbar (custom, sticky top)
  └── Main content area
       └── max-w container with responsive padding
  └── Footer (TBD)
```

### Sidebar Width
- Default: `320px` (`--sidebar-width`)
- Collapsed: `3rem` (`--sidebar-width-icon`)

### Responsive Breakpoints
- Mobile: `< 768px` (Subframe `mobile` breakpoint)
- Tablet: `768px – 1024px`
- Desktop: `> 1024px`

---

## Interaction Patterns

### Scrollable Sections
- Hide scrollbars (`.scrollbar-hide`)
- Smooth scroll behavior
- Show scroll arrows on hover
- Prevent horizontal page overflow

### Animations
- Framer Motion for complex animations (`text-loop.tsx` pattern)
- Tailwind `animate-in` / `animate-out` (via `tw-animate-css`) for simple transitions
- Navigation menu uses Tailwind animations, not framer-motion

### Loading States
- Use Subframe `SkeletonText` and `SkeletonCircle` components
- Every data-driven component needs a loading skeleton defined

### Error States
- Every page needs an error boundary
- Empty states designed for lists with no results

---

## Design Principles

1. **Mobile-first** — design for mobile viewport, then scale up
2. **Trust signals** — verification badges wherever provider info appears
3. **Data-ready** — every component knows exactly what Supabase fields it needs
4. **Semantic HTML** — proper headings (one H1 per page), ARIA labels, form labels
5. **Warm, approachable** — the warm off-white background and Lexend font set the tone; this is a platform parents trust with their kids
6. **Fast** — lazy load below-fold content, optimize images, code-split aggressively
