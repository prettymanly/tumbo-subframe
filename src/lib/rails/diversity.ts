// ── Diversity constraints, seeded shuffle, and freshness blending ──
// Ensures no single provider dominates a rail, that category and outcome variety
// are maintained, and that consecutive items don't repeat primary tags.

import type { ScoredClass, DiversityConstraints } from "./types";

// ────────────────────────────────────────────────────────────────────────────
// Seeded shuffle (Fisher-Yates with LCG PRNG)
// ────────────────────────────────────────────────────────────────────────────
// Produces a deterministic permutation given the same seed.
// Rail stays stable within a session; changes across sessions/days.
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ────────────────────────────────────────────────────────────────────────────
// Stratified shuffle — shuffle within score tiers, not globally
// ────────────────────────────────────────────────────────────────────────────
// Items are pre-sorted by score descending. We split them into tiers of
// `tierSize` items and shuffle within each tier. This means:
//   - A top-6 item can move to positions 1–6 but never to position 12.
//   - Provides variety within quality bands while preserving quality ordering.
//   - Default tierSize = 6 (one desktop rail of cards).
export function stratifiedShuffle(
  sortedItems: ScoredClass[],
  seed: number,
  tierSize: number = 6
): ScoredClass[] {
  const result: ScoredClass[] = [];
  for (let i = 0; i < sortedItems.length; i += tierSize) {
    const tier = sortedItems.slice(i, i + tierSize);
    result.push(...seededShuffle(tier, seed + i));
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Apply diversity constraints to a ranked list (enhanced)
// ────────────────────────────────────────────────────────────────────────────
// Greedy pick with:
//   1. Provider cap: no provider appears more than maxPerProvider times
//   2. Category floor: result spans at least minCategories (best-effort)
//   3. Outcome type floor: at least minOutcomeTypes distinct outcomes (best-effort)
//   4. Back-to-back tag prevention: reorders so consecutive items don't share primaryTag
export function applyDiversityConstraints(
  ranked: ScoredClass[],
  constraints: DiversityConstraints,
  count: number
): ScoredClass[] {
  const {
    maxPerProvider,
    minOutcomeTypes = 2,
    preventBackToBackTags = true,
  } = constraints;

  // ── Phase 1: Provider-capped greedy pick ──
  const picked: ScoredClass[] = [];
  const providerCounts: Record<string, number> = {};
  const categories = new Set<string>();
  const outcomeTypes = new Set<string>();
  const deferred: ScoredClass[] = [];

  for (const item of ranked) {
    if (picked.length >= count) break;

    const pid = item.provider_id ?? "unknown";
    if ((providerCounts[pid] ?? 0) >= maxPerProvider) {
      deferred.push(item);
      continue;
    }

    picked.push(item);
    providerCounts[pid] = (providerCounts[pid] ?? 0) + 1;
    if (item.category) categories.add(item.category);
    if (item._outcomeType) outcomeTypes.add(item._outcomeType);
  }

  // ── Phase 2: Fill from deferred if under count ──
  // Prioritize items that add new categories or outcome types
  if (picked.length < count && deferred.length > 0) {
    // Sort deferred: items that add new category/outcome first
    const sortedDeferred = [...deferred].sort((a, b) => {
      const aNewCat = a.category && !categories.has(a.category) ? 1 : 0;
      const bNewCat = b.category && !categories.has(b.category) ? 1 : 0;
      const aNewOut = a._outcomeType && !outcomeTypes.has(a._outcomeType) ? 1 : 0;
      const bNewOut = b._outcomeType && !outcomeTypes.has(b._outcomeType) ? 1 : 0;
      return (bNewCat + bNewOut) - (aNewCat + aNewOut);
    });

    for (const item of sortedDeferred) {
      if (picked.length >= count) break;
      picked.push(item);
      if (item.category) categories.add(item.category);
      if (item._outcomeType) outcomeTypes.add(item._outcomeType);
    }
  }

  // ── Phase 3: Outcome type diversity boost (best-effort) ──
  // If we're under minOutcomeTypes and deferred items can help, swap in
  if (outcomeTypes.size < minOutcomeTypes && deferred.length > 0) {
    for (const candidate of deferred) {
      if (outcomeTypes.size >= minOutcomeTypes) break;
      if (!candidate._outcomeType || outcomeTypes.has(candidate._outcomeType)) continue;

      // Find the last picked item that shares an outcome type with another
      for (let i = picked.length - 1; i >= Math.floor(count * 0.7); i--) {
        const existing = picked[i];
        if (existing._outcomeType && outcomeTypes.has(existing._outcomeType)) {
          // Count how many share this outcome type
          const sameOutcome = picked.filter(
            (p) => p._outcomeType === existing._outcomeType
          ).length;
          if (sameOutcome > 1) {
            picked[i] = candidate;
            outcomeTypes.add(candidate._outcomeType);
            break;
          }
        }
      }
    }
  }

  // ── Phase 4: Back-to-back primary tag prevention ──
  if (preventBackToBackTags && picked.length > 2) {
    return preventBackToBack(picked);
  }

  return picked;
}

// ────────────────────────────────────────────────────────────────────────────
// Prevent back-to-back primary tag repetition
// ────────────────────────────────────────────────────────────────────────────
// Reorders the array so no two consecutive items share the same _primaryTag.
// Uses a greedy approach: for each position, pick the best item whose
// primaryTag differs from the previous one. If no swap is possible, leave it.
function preventBackToBack(items: ScoredClass[]): ScoredClass[] {
  const result = [...items];

  for (let i = 1; i < result.length; i++) {
    const prevTag = result[i - 1]._primaryTag;
    if (!prevTag || result[i]._primaryTag !== prevTag) continue;

    // Find the nearest non-duplicate to swap with
    let swapIdx = -1;
    // Look forward for the closest item with a different tag
    for (let j = i + 1; j < result.length; j++) {
      if (result[j]._primaryTag !== prevTag) {
        // Also check it won't create a new back-to-back at position j
        const beforeJ = j > 0 ? result[j - 1]._primaryTag : null;
        const afterJ = j + 1 < result.length ? result[j + 1]._primaryTag : null;
        // Swapping i and j: check that result[i]._primaryTag won't conflict at position j
        if (result[i]._primaryTag !== beforeJ || result[i]._primaryTag !== afterJ) {
          swapIdx = j;
          break;
        }
      }
    }

    if (swapIdx !== -1) {
      [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Freshness blending for regular rails
// ────────────────────────────────────────────────────────────────────────────
// Takes a score-sorted list and returns a blended list where:
//   - (1 - freshnessReserve) of items come from top-scored
//   - freshnessReserve of items come from high-freshness pool (not already in top)
// Items are interleaved: roughly 2 score items then 1 fresh item.
export function blendWithFreshness(
  scoreSorted: ScoredClass[],
  count: number,
  freshnessReserve: number,
  freshnessSorter: (a: ScoredClass, b: ScoredClass) => number
): ScoredClass[] {
  if (freshnessReserve <= 0 || scoreSorted.length <= count) {
    return scoreSorted.slice(0, count);
  }

  const scoreSlots = Math.ceil(count * (1 - freshnessReserve));
  const freshSlots = count - scoreSlots;

  // Top scored items
  const topByScore = scoreSorted.slice(0, scoreSlots);
  const topIds = new Set(topByScore.map((c) => c.id));

  // Fresh pool: remaining items sorted by freshness
  const freshPool = scoreSorted
    .filter((c) => !topIds.has(c.id))
    .sort(freshnessSorter);
  const freshPicks = freshPool.slice(0, freshSlots);

  // Interleave: 2 score items, then 1 fresh item
  const blended: ScoredClass[] = [];
  let si = 0;
  let fi = 0;

  while (blended.length < count && (si < topByScore.length || fi < freshPicks.length)) {
    // 2 scored items
    for (let k = 0; k < 2 && si < topByScore.length && blended.length < count; k++, si++) {
      blended.push(topByScore[si]);
    }
    // 1 fresh item
    if (fi < freshPicks.length && blended.length < count) {
      blended.push(freshPicks[fi++]);
    }
  }

  return blended;
}

// ────────────────────────────────────────────────────────────────────────────
// Price band distribution check
// ────────────────────────────────────────────────────────────────────────────
export function checkPriceBandSpread(items: ScoredClass[]): boolean {
  if (items.length < 4) return true;
  const bands = { low: 0, mid: 0, high: 0 };
  for (const item of items) {
    const p = item.price ?? 0;
    if (p <= 30) bands.low++;
    else if (p <= 80) bands.mid++;
    else bands.high++;
  }
  const max = Math.max(bands.low, bands.mid, bands.high);
  return max / items.length <= 0.6;
}

// ────────────────────────────────────────────────────────────────────────────
// Extract outcome type from a class
// ────────────────────────────────────────────────────────────────────────────
// Uses outcome_expectations field, extracting the first sentence/phrase
// as a rough "outcome type" for diversity checks.
export function extractOutcomeType(cls: ScoredClass): string {
  const raw = cls.outcome_expectations ?? "";
  if (!raw) return cls.category ?? "general";
  // Take first sentence or first 60 chars as the outcome fingerprint
  const firstSentence = raw.split(/[.!?]/)[0]?.trim() ?? "";
  return firstSentence.slice(0, 60).toLowerCase() || (cls.category ?? "general");
}

// ────────────────────────────────────────────────────────────────────────────
// Extract primary tag for back-to-back checks
// ────────────────────────────────────────────────────────────────────────────
// Uses category as the primary tag — this is what parents see first.
export function extractPrimaryTag(cls: ScoredClass): string {
  return cls.category ?? "general";
}
