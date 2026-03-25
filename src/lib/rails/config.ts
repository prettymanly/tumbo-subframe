// ── Rail definitions for /classes page ──
// 7 editorial rails + browse-all. Order matters.
// HARD CAP: max 7 rails before Browse All. No infinite stacking.
//
// GOLD-ONLY MODE (2026-03-14): Rails redesigned for 57 curated listings.
// Each rail is an editorial angle, not a category bucket.
// Cross-category connections create unexpected but compelling groupings.

import type { RailConfig } from "./types";

export const MAX_RAILS = 7;

export const RAILS: RailConfig[] = [
  // ── Rail 1: Editor's Picks (featured — pinned editorial picks) ──
  {
    railId: "recommended",
    header: "Editor\u2019s picks",
    subheader: "Three handpicked classes to begin with",
    weights: { quality: 0.35, freshness: 0.25, proximity: 0.00, intent: 0.00, weekend: 0.00, diversity: 0.40 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 2,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0,
    },
    intentSignals: [],
    categorySignals: [],
    fetchCount: 0,
    renderCount: { desktop: 3, mobile: 3 },
    density: "featured",
    pinnedIds: [
      "5b8c7b46-ed8d-4ec1-940e-9591be498a96", // Gosh! Kids
      "dd5ea47b-1ccf-4899-aa29-acd548280b44", // Your Prologue
      "78b5ef49-2082-435e-8f47-5d01ff905312", // Mini Monsters
    ],
  },

  // ── Rail 2: Taught by someone who still does it ──
  // Practitioners who teach from active practice, not just pedagogy.
  // Bianka Panova (world champion), Kickmatics (national athletes),
  // Gosh Kids (working photographers), Emerge Arts (working performers),
  // Apple Pie (children's author), Curious Makers (maker), Bishan Chess (FIDE rated)
  {
    railId: "practitioner-teacher",
    header: "Taught by someone who still does it",
    subheader: "The instructor is a working practitioner, not just a teacher",
    weights: { quality: 0.30, freshness: 0.15, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.20,
    },
    intentSignals: [
      // Signals that appear in practitioner-led class descriptions
      "world champion", "national athlete", "working photographer",
      "founder", "former national", "practitioner", "professional",
      "performer", "author", "coach", "FIDE",
    ],
    categorySignals: ["Gymnastics", "Martial Arts", "Art", "Drama", "Coding", "Chess", "Football"],
    fetchCount: 10,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 3: For the child who needs a gentle push ──
  // The fear-to-confidence arc: nervous arrival → patient coaching → visible confidence.
  // Verticlimb, Emerge Arts, Little Cookhouse, Yogali, yoga classes, drama
  {
    railId: "gentle-push",
    header: "For the child who needs a gentle push",
    subheader: "Patient classes where hesitant children find their footing",
    weights: { quality: 0.25, freshness: 0.15, proximity: 0.00, intent: 0.45, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.25,
    },
    intentSignals: [
      "shy", "hesitant", "confidence", "gentle", "patient",
      "safe space", "supportive", "low-pressure", "nurturing",
      "find their voice", "fear", "nervous", "anxious",
    ],
    categorySignals: ["Drama", "Rock Climbing", "Cooking", "Yoga", "Art"],
    fetchCount: 10,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 4: Hands dirty, something built ──
  // Builder-debugger mindset: process over product, learn by making + failing.
  // Curious Makers, Little Cookhouse, ArtZ Baking, coding classes, Gosh Kids
  {
    railId: "hands-dirty",
    header: "Hands dirty, something built",
    subheader: "Classes where children make things and learn by doing",
    weights: { quality: 0.25, freshness: 0.15, proximity: 0.00, intent: 0.45, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.25,
    },
    intentSignals: [
      "hands-on", "build", "make", "create", "project",
      "process over product", "tinkerer", "experiment",
      "robot", "code", "bake", "cook", "craft",
    ],
    categorySignals: ["Coding", "Cooking", "Art", "Holiday Camp"],
    fetchCount: 10,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 5: Keep the language alive ──
  // Heritage language transmission for English-dominant households.
  // Mini Monsters (Malay), Apple Pie (Mandarin), Islamic Studies cluster,
  // Tamil, Chinese, Edufront (Malay)
  {
    railId: "language-alive",
    header: "Keep the language alive",
    subheader: "Heritage language classes for families where English leads at home",
    weights: { quality: 0.25, freshness: 0.15, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.20 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.20,
    },
    intentSignals: [
      "language", "Malay", "Mandarin", "Tamil", "Arabic", "Quran",
      "heritage", "bilingual", "mother tongue",
    ],
    categorySignals: ["Malay Language", "Malay", "Chinese", "Islamic Studies", "Languages", "Drama"],
    fetchCount: 12,
    renderCount: { desktop: 6, mobile: 3 },
    density: "standard",
  },

  // ── Rail 6: Where the teacher knows your child ──
  // Intimate one-person studios: small groups, owner-operated, no franchise.
  // Bishan Chess, Yogali, Your Prologue, Little Cookhouse, Curious Makers
  {
    railId: "teacher-knows-you",
    header: "Where the teacher knows your child",
    subheader: "Small studios, solo instructors, and classes that stay personal",
    weights: { quality: 0.25, freshness: 0.15, proximity: 0.00, intent: 0.45, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.20,
    },
    intentSignals: [
      "small group", "one-on-one", "personal", "intimate",
      "individual attention", "small class", "boutique",
      "knows every child", "knows your child",
    ],
    categorySignals: ["Chess", "Yoga", "English", "Cooking", "Coding", "Art"],
    fetchCount: 10,
    renderCount: { desktop: 6, mobile: 3 },
    density: "compact",
  },

  // ── Rail 7: Start at four, still growing at fourteen ──
  // Structured pathways from beginner to advanced: belt systems, levels, diplomas.
  // Bianka Panova, Asia Music, Kickmatics, Titan Tech, The Writer's Place
  {
    railId: "long-arc",
    header: "Start at four, still growing at fourteen",
    subheader: "Structured programmes with clear pathways from beginner to advanced",
    weights: { quality: 0.30, freshness: 0.15, proximity: 0.00, intent: 0.40, weekend: 0.00, diversity: 0.15 },
    diversity: {
      maxPerProvider: 1,
      minCategories: 3,
      minOutcomeTypes: 2,
      preventBackToBackTags: true,
      freshnessReserve: 0.20,
    },
    intentSignals: [
      "level", "pathway", "progression", "belt", "grade",
      "diploma", "curriculum", "structured", "DSA", "competition",
      "beginner to advanced", "foundation",
    ],
    categorySignals: ["Gymnastics", "Music", "Martial Arts", "Coding", "English", "Football"],
    fetchCount: 10,
    renderCount: { desktop: 6, mobile: 3 },
    density: "airy",
  },
];

// Quick lookup by railId
export const RAIL_MAP = Object.fromEntries(RAILS.map((r) => [r.railId, r])) as Record<string, RailConfig>;

// Ordered list of railIds (what the page renders)
export const RAIL_ORDER = RAILS.map((r) => r.railId);

// ── Intent chips ──
// Chips are a toggle. Selecting one applies a global intentBoost to scoring
// across ALL rails (not just the matching one). Rails stay in place — items re-rank.
// Updated for Gold-only mode to match new editorial rail angles.
export const INTENT_CHIPS = [
  {
    id: "gentle-push",
    label: "Gentle Push",
    boostSignals: [
      "shy", "hesitant", "confidence", "gentle", "patient",
      "supportive", "nurturing", "find their voice",
    ],
    boostCategories: ["Drama", "Rock Climbing", "Cooking", "Yoga"],
  },
  {
    id: "hands-dirty",
    label: "Hands Dirty",
    boostSignals: [
      "hands-on", "build", "make", "create", "project",
      "tinkerer", "experiment", "process over product",
    ],
    boostCategories: ["Coding", "Cooking", "Art", "Holiday Camp"],
  },
  {
    id: "language-alive",
    label: "Language & Heritage",
    boostSignals: [
      "language", "Malay", "Mandarin", "Tamil", "Arabic",
      "heritage", "bilingual", "mother tongue",
    ],
    boostCategories: ["Malay Language", "Malay", "Chinese", "Islamic Studies", "Languages"],
  },
  {
    id: "long-arc",
    label: "Long-Term Path",
    boostSignals: [
      "level", "pathway", "progression", "belt", "grade",
      "diploma", "structured", "competition",
    ],
    boostCategories: ["Gymnastics", "Music", "Martial Arts", "Coding", "Football"],
  },
] as const;

export type IntentChipId = (typeof INTENT_CHIPS)[number]["id"];

// Quick lookup
export const CHIP_MAP = Object.fromEntries(
  INTENT_CHIPS.map((c) => [c.id, c])
) as Record<IntentChipId, (typeof INTENT_CHIPS)[number]>;
