// ── Scoring functions for rail ranking ──

import type { DBClass } from "@/lib/types/tags";
import { deriveContextualTags } from "@/lib/types/tags";

// ── Helpers ──

function daysBetween(a: Date, b: Date): number {
  return Math.abs(Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function buildCorpus(cls: DBClass): string {
  return [
    cls.description,
    cls.typical_child_profile,
    cls.not_ideal_for,
    cls.outcome_expectations,
    cls.vibe_line,
    cls.summary,
    cls.category,
  ]
    .filter(Boolean)
    .join(" ");
}

// ── Quality Score (0–1) ──
// Blends Google rating, review count, and editorial richness.
export function qualityScore(cls: DBClass): number {
  const ratingNorm = Math.min((cls.google_rating ?? 0) / 5, 1);
  const reviewNorm = Math.min((cls.review_count ?? 0) / 50, 1);
  const richness =
    [cls.summary, cls.vibe_line, cls.description, cls.typical_child_profile, cls.outcome_expectations].filter(Boolean)
      .length / 5;

  return 0.5 * ratingNorm + 0.3 * reviewNorm + 0.2 * richness;
}

// ── Freshness Score (0–1) ──
// Rewards recently updated or newly added classes.
export function freshnessScore(cls: DBClass): number {
  const days = daysBetween(new Date(cls.updated_at), new Date());
  if (days <= 7) return 1.0;
  if (days <= 30) return 0.7;
  if (days <= 90) return 0.4;
  return 0.1;
}

// ── Proximity Score (0–1) ──
// Rough distance bucket. Falls back to 0.5 (neutral) if no user location.
export function proximityScore(
  cls: DBClass,
  userLocation?: { lat: number; lng: number }
): number {
  if (!userLocation) return 0.5;
  const loc = (cls.location ?? "").toLowerCase();
  // TODO: When geocoded coords are added to classes, use haversine.
  if (loc) return 0.6;
  return 0.3;
}

// ── Intent Match Score (0–1) ──
// How well a class matches the tag signals for an intent rail.
export function intentMatchScore(cls: DBClass, signals: string[], categorySignals: string[]): number {
  if (signals.length === 0 && categorySignals.length === 0) return 0;

  const derived = deriveContextualTags(cls);
  const corpus = buildCorpus(cls).toLowerCase();
  let matches = 0;
  const totalSignals = signals.length + (categorySignals.length > 0 ? 1 : 0);

  for (const signal of signals) {
    if (derived.some((t) => t.label === signal)) {
      matches += 1;
    } else if (corpus.includes(signal.toLowerCase())) {
      matches += 0.5;
    }
  }

  if (categorySignals.length > 0) {
    const cat = (cls.category ?? "").toLowerCase();
    if (categorySignals.some((s) => s.toLowerCase() === cat)) {
      matches += 1;
    }
  }

  return Math.min(matches / Math.max(totalSignals, 1), 1);
}

// ── Chip Boost Score (0–1) ──
// Applied globally when a user selects an intent chip.
// This re-ranks ALL rails toward the selected intent without changing rail order.
// Weight: 0.20 added on top of the rail's normal score.
export function chipBoostScore(
  cls: DBClass,
  chipSignals: string[],
  chipCategories: string[]
): number {
  if (chipSignals.length === 0 && chipCategories.length === 0) return 0;
  // Reuse intentMatchScore logic — same signal matching approach
  return intentMatchScore(cls, chipSignals, chipCategories);
}

// ── Weekend Score (0–1) ──
export function weekendScore(cls: DBClass, isWeekend: boolean): number {
  if (!isWeekend) return 0;
  const sched = (cls.schedule ?? "").toLowerCase();
  if (sched.includes("sat") || sched.includes("sun") || sched.includes("weekend")) return 1.0;
  return 0.2;
}

// ── Stale penalty multiplier ──
export function stalePenalty(cls: DBClass): number {
  const days = daysBetween(new Date(cls.updated_at), new Date());
  if (days > 180) return 0.5;
  return 1.0;
}

// ── Combined score for a class in a rail ──
// When a chip is active, chipBoost adds +0.20 weight on top of normal scoring.
export function computeRailScore(
  cls: DBClass,
  weights: { quality: number; freshness: number; proximity: number; intent: number; weekend: number },
  intentSignals: string[],
  categorySignals: string[],
  isWeekend: boolean,
  userLocation?: { lat: number; lng: number },
  chipSignals?: string[],
  chipCategories?: string[]
): number {
  const raw =
    weights.quality * qualityScore(cls) +
    weights.freshness * freshnessScore(cls) +
    weights.proximity * proximityScore(cls, userLocation) +
    weights.intent * intentMatchScore(cls, intentSignals, categorySignals) +
    weights.weekend * weekendScore(cls, isWeekend);

  // Chip boost: additive 0.20 weight when a chip is selected.
  // This re-ranks items within each rail toward the intent without disrupting layout.
  const boost =
    chipSignals && chipSignals.length > 0
      ? 0.20 * chipBoostScore(cls, chipSignals, chipCategories ?? [])
      : 0;

  return (raw + boost) * stalePenalty(cls);
}
