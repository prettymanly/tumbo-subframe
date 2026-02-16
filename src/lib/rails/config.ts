// ── Rail definitions for /classes page ──
// 7 editorial rails + browse-all. Order matters.
// HARD CAP: max 7 rails before Browse All. No infinite stacking.

import type { RailConfig } from "./types";

export const MAX_RAILS = 7;

export const RAILS: RailConfig[] = [
  // ── Rail 1: Start Here (featured density — larger cards, highest visual weight) ──
  {
    railId: "recommended",
    header: "Start here",
    subheader: "A fresh pick of classes worth exploring this week",
    subheaderAlt: "Great picks for the weekend ahead",
    weights: { quality: 0.35, freshness: 0.25, proximity: 0.10, intent: 0.00, weekend: 0.10, diversity: 0.20 },
    diversity: {
      maxPerProvider: 2,
      minCategories: 4,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.30,  // 70% scored + 30% fresh rotation
    },
    intentSignals: [],
    categorySignals: [],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "featured",
  },

  // ── Rail 2: Loved by parents nearby (compact density — tighter, utility) ──
  {
    railId: "popular-nearby",
    header: "Loved by parents nearby",
    subheader: "High-rated classes that families in your area keep coming back to",
    weights: { quality: 0.40, freshness: 0.10, proximity: 0.20, intent: 0.00, weekend: 0.00, diversity: 0.30 },
    diversity: {
      maxPerProvider: 2,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.20,  // popular rail is more score-biased
    },
    intentSignals: [],
    categorySignals: [],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "compact",
  },

  // ── Rail 3: Build their confidence ──
  {
    railId: "build-confidence",
    header: "Build their confidence",
    subheader: "Small-group classes that nurture shy kids and help them find their voice",
    weights: { quality: 0.25, freshness: 0.20, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 2,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.30,
    },
    intentSignals: [
      "Builds Confidence", "Self-Expression", "Communication & Speaking Up",
      "Performance", "Stage Ready", "Leadership",
    ],
    categorySignals: ["Drama", "Dance", "Music"],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 4: Burn that energy ──
  {
    railId: "burn-energy",
    header: "Burn that energy",
    subheader: "High-movement classes that tire them out in the best way",
    weights: { quality: 0.25, freshness: 0.20, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 2,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.30,
    },
    intentSignals: [
      "High Energy", "Gross Motor", "Restless / Needs Movement",
    ],
    categorySignals: ["Sports", "Gymnastics", "Dance", "Martial Arts", "Swimming", "Rock Climbing"],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 5: Quiet focus & mastery ──
  {
    railId: "quiet-focus",
    header: "Quiet focus & mastery",
    subheader: "Deep-skill classes for the child who loves to concentrate and create",
    weights: { quality: 0.25, freshness: 0.20, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 2,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.30,
    },
    intentSignals: [
      "Gentle Pace", "One-on-One", "Small Group",
      "Focus & Regulation", "Detail-Oriented", "Improves Focus & Self-Regulation",
      "Deep Focus",
    ],
    categorySignals: ["Chess", "Yoga", "Art", "Piano", "Music"],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 6: Creative explorers ──
  {
    railId: "creative-explorers",
    header: "Creative explorers",
    subheader: "Open-ended, artful, messy-hands kind of fun for curious minds",
    weights: { quality: 0.25, freshness: 0.20, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 2,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.30,
    },
    intentSignals: [
      "Creative Kids", "Imaginative Dreamer", "Self-Expression",
      "Hands-On", "Sensory", "Play-Based", "Process-Focused",
    ],
    categorySignals: ["Art", "Cooking", "Drama", "Crafts"],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 7: Try something new (airy density — lighter, fewer cards) ──
  {
    railId: "serendipity",
    header: "Try something new",
    subheader: "Hidden gems and fresh faces you might not have found on your own",
    weights: { quality: 0.30, freshness: 0.30, proximity: 0.00, intent: 0.00, weekend: 0.00, diversity: 0.40 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 5,
      minOutcomeTypes: 3,
      preventBackToBackTags: true,
      freshnessReserve: 0, // serendipity uses its own 40/30/20/10 mixture, not freshnessReserve
    },
    intentSignals: [],
    categorySignals: [],
    fetchCount: 12,
    renderCount: { desktop: 4, mobile: 2 },
    density: "airy",
    isSerendipity: true,
  },
];

// Quick lookup by railId
export const RAIL_MAP = Object.fromEntries(RAILS.map((r) => [r.railId, r])) as Record<string, RailConfig>;

// Ordered list of railIds (what the page renders)
export const RAIL_ORDER = RAILS.map((r) => r.railId);

// ── Intent chips ──
// Chips are a toggle. Selecting one applies a global intentBoost to scoring
// across ALL rails (not just the matching one). Rails stay in place — items re-rank.
export const INTENT_CHIPS = [
  {
    id: "build-confidence",
    label: "Build Confidence",
    /** Tag signals injected into every rail's scoring when this chip is active */
    boostSignals: [
      "Builds Confidence", "Self-Expression", "Communication & Speaking Up",
      "Performance", "Leadership",
    ],
    boostCategories: ["Drama", "Dance", "Music"],
  },
  {
    id: "burn-energy",
    label: "Burn Energy",
    boostSignals: [
      "High Energy", "Gross Motor", "Restless / Needs Movement",
    ],
    boostCategories: ["Sports", "Gymnastics", "Dance", "Martial Arts", "Swimming"],
  },
  {
    id: "quiet-focus",
    label: "Quiet Focus",
    boostSignals: [
      "Gentle Pace", "One-on-One", "Small Group",
      "Focus & Regulation", "Detail-Oriented", "Deep Focus",
    ],
    boostCategories: ["Chess", "Yoga", "Art", "Piano", "Music"],
  },
  {
    id: "creative-explorers",
    label: "Creative Explorers",
    boostSignals: [
      "Creative Kids", "Imaginative Dreamer", "Self-Expression",
      "Hands-On", "Sensory", "Play-Based", "Process-Focused",
    ],
    boostCategories: ["Art", "Cooking", "Drama", "Crafts"],
  },
] as const;

export type IntentChipId = (typeof INTENT_CHIPS)[number]["id"];

// Quick lookup
export const CHIP_MAP = Object.fromEntries(
  INTENT_CHIPS.map((c) => [c.id, c])
) as Record<IntentChipId, (typeof INTENT_CHIPS)[number]>;
