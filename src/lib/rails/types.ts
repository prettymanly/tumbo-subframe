// ── Rail system types ──
// All shared types for the /classes editorial discovery page

import type { DBClass } from "@/lib/types/tags";

// ── Tag dimension for warm display tags ──
export type TagDimension = "content" | "philosophy" | "experience" | "child";

export interface WarmTag {
  label: string;
  dimension: TagDimension;
}

// ── Scored class (DBClass + computed score) ──
export interface ScoredClass extends DBClass {
  _score: number;
  _warmTags?: WarmTag[];
  /** Primary tag label for back-to-back dedup (e.g. category or first warm tag) */
  _primaryTag?: string;
  /** Extracted outcome type for outcome diversity checks */
  _outcomeType?: string;
}

// ── Rail card item (what the frontend renders) ──
export interface RailCardItem {
  id: string;
  title: string;
  providerName?: string;
  summary: string;
  image: string;
  tags: WarmTag[];
  href: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
  vibeLine?: string;
}

// ── Scoring weights for a rail ──
export interface ScoringWeights {
  quality: number;
  freshness: number;
  proximity: number;
  intent: number;
  weekend: number;
  diversity: number;
}

// ── Diversity constraints ──
export interface DiversityConstraints {
  maxPerProvider: number;
  minCategories: number;
  /**
   * Minimum distinct outcome types in the rail.
   * Uses outcome_expectations field. Best-effort — never blocks items.
   * Default: 2
   */
  minOutcomeTypes?: number;
  /**
   * When true, reorder final items to prevent consecutive classes
   * sharing the same primary tag (first warm tag / category).
   * Default: true
   */
  preventBackToBackTags?: boolean;
  /**
   * Fraction of rail slots reserved for exploration / under-exposed content.
   * 0 = all slots scored normally. 0.20 = 20% reserved for exploration.
   * Applied after scoring: the top (1 - reserve) are score-ranked,
   * the remaining slots are filled from freshness/under-exposed pool.
   * Logged-in default: 0.20. Logged-out default: 0.30 (freshness blend).
   */
  freshnessReserve?: number;
}

// ── Rail visual density ──
// Controls card sizing and render counts per rail to avoid uniform Netflix feel.
//   featured  — "Start Here" rail: larger cards, highest visual weight
//   compact   — "Near You" rail: tighter, utility tone
//   airy      — "Try Something New": lighter density, fewer cards
//   standard  — all other rails: default 6/3
export type RailDensity = "featured" | "compact" | "airy" | "standard";

// ── Rail definition ──
export interface RailConfig {
  railId: string;
  header: string;
  subheader: string;
  /** Alternate subheader (e.g. weekend variant) */
  subheaderAlt?: string;
  weights: ScoringWeights;
  diversity: DiversityConstraints;
  /** Tag signals that define this rail's intent. Empty = no intent filtering. */
  intentSignals: string[];
  /** Category signals (content-type categories like "Sports", "Dance") */
  categorySignals: string[];
  /** How many items to fetch server-side */
  fetchCount: number;
  /** How many to render initially (desktop / mobile) */
  renderCount: { desktop: number; mobile: number };
  /** Visual density — controls card size and rail spacing */
  density: RailDensity;
  /** Is this the serendipity rail? Special mixture rules apply. */
  isSerendipity?: boolean;
}

// ── Scoring context (per-request) ──
export interface ScoringContext {
  sessionSeed: number;
  userLocation?: { lat: number; lng: number };
  isWeekend: boolean;
  /** Class IDs already shown in prior rails this session */
  excludeIds: Set<string>;
  /** Active intent chip id (e.g. "build-confidence"). Applies global re-rank boost. */
  activeChipId?: string;
  /** Logged-in user: tags from recent interactions */
  userTags?: string[];
}

// ── API response ──
export interface RailApiResponse {
  railId: string;
  header: string;
  subheader: string;
  items: RailCardItem[];
  nextCursor: string | null;
  totalAvailable: number;
}

// ── Session meta (returned by /api/rails/meta) ──
export interface RailsMeta {
  sessionSeed: number;
  isWeekend: boolean;
  railOrder: string[];
  totalClasses: number;
}
