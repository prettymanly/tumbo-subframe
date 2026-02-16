// ── Rail builder — orchestrates scoring, shuffle, blending, and diversity ──
// This is the main function the API route calls.
//
// Pipeline for regular rails:
//   1. Filter pool (exclude IDs, hidden, intent pre-filter)
//   2. Score every class (with chip boost if active)
//   3. Enrich with _primaryTag + _outcomeType (for diversity)
//   4. Freshness blend: 70% top-scored + 30% freshness-rotated
//   5. Stratified shuffle (within score tiers — not global)
//   6. Diversity constraints (provider cap, outcome variety, back-to-back)
//   7. Convert to RailCardItem

import type { DBClass } from "@/lib/types/tags";
import type { RailConfig, ScoredClass, ScoringContext, RailCardItem } from "./types";
import { computeRailScore, freshnessScore } from "./scoring";
import {
  stratifiedShuffle,
  seededShuffle,
  applyDiversityConstraints,
  blendWithFreshness,
  extractOutcomeType,
  extractPrimaryTag,
} from "./diversity";
import { selectDisplayTags } from "./warm-tags";
import { CHIP_MAP } from "./config";
import type { IntentChipId } from "./config";

// ── Deduplicate classes by provider_id ──
// Many providers have multiple class rows (category splits from ingestion).
// Keep the best representative per provider: prefer the row with the longest
// description, highest rating, and most complete data.
export function deduplicateByProvider(classes: DBClass[]): DBClass[] {
  const bestByProvider = new Map<string, DBClass>();

  for (const cls of classes) {
    const pid = cls.provider_id;
    if (!pid) {
      // No provider — keep as-is (keyed by class id)
      bestByProvider.set(`__no_provider_${cls.id}`, cls);
      continue;
    }
    const existing = bestByProvider.get(pid);
    if (!existing || classQuality(cls) > classQuality(existing)) {
      bestByProvider.set(pid, cls);
    }
  }

  return Array.from(bestByProvider.values());
}

function classQuality(cls: DBClass): number {
  let score = 0;
  if (cls.description) score += Math.min(cls.description.length, 500);
  if (cls.summary) score += 100;
  if (cls.vibe_line) score += 50;
  if (cls.google_rating) score += cls.google_rating * 20;
  if (cls.review_count) score += Math.min(cls.review_count, 50);
  if (cls.age_min != null) score += 30;
  if (cls.photo_url) score += 40;
  return score;
}

// ── Resolve chip signals from context ──
function resolveChipSignals(ctx: ScoringContext): { chipSignals: string[]; chipCategories: string[] } {
  if (!ctx.activeChipId) return { chipSignals: [], chipCategories: [] };
  const chip = CHIP_MAP[ctx.activeChipId as IntentChipId];
  if (!chip) return { chipSignals: [], chipCategories: [] };
  return {
    chipSignals: [...chip.boostSignals],
    chipCategories: [...chip.boostCategories],
  };
}

// ── Category images (fallbacks when class has no photo) ──
const CATEGORY_IMAGES: Record<string, string> = {
  Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=70",
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=70",
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70",
  Swimming: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=400&q=70",
  Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=70",
  Chinese: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70",
  Mathematics: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&q=70",
  English: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=70",
  Piano: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=400&q=70",
  Sports: "https://images.unsplash.com/photo-1461896836934-ber8cd65804?w=400&q=70",
  Drama: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&q=70",
  Science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=70",
  Chess: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&q=70",
};

function getClassImage(cls: DBClass): string {
  return cls.photo_url || CATEGORY_IMAGES[cls.category || ""] || CATEGORY_IMAGES.Art;
}

// ── Convert DBClass → RailCardItem ──
function toCardItem(
  cls: DBClass,
  providerMap: Record<string, { name: string }>
): RailCardItem {
  const tags = selectDisplayTags(cls);
  const providerName = cls.provider_id ? providerMap[cls.provider_id]?.name : undefined;

  return {
    id: cls.id,
    title: cls.name,
    providerName,
    summary: cls.summary || cls.vibe_line || cls.description || "",
    image: getClassImage(cls),
    tags,
    href: `/classes/${cls.id}`,
    category: cls.category ?? undefined,
    ageMin: cls.age_min ?? undefined,
    ageMax: cls.age_max ?? undefined,
    vibeLine: cls.vibe_line ?? undefined,
  };
}

// ── Enrich scored classes with _primaryTag and _outcomeType ──
function enrichForDiversity(scored: ScoredClass[]): ScoredClass[] {
  return scored.map((cls) => ({
    ...cls,
    _primaryTag: extractPrimaryTag(cls),
    _outcomeType: extractOutcomeType(cls),
  }));
}

// ── Freshness comparator (sort descending by freshness) ──
function freshnessSorter(a: ScoredClass, b: ScoredClass): number {
  return freshnessScore(b) - freshnessScore(a);
}

// ── Build a single rail ──
export function buildRail(
  allClasses: DBClass[],
  rail: RailConfig,
  ctx: ScoringContext,
  providerMap: Record<string, { name: string }>
): { items: RailCardItem[]; shownIds: string[] } {
  // 1. Filter out excluded IDs + hidden/placeholder classes
  //    Belt-and-suspenders: the API layer should already enforce visibility,
  //    but we double-check here to prevent leaks if called from a new context.
  //    Then deduplicate by provider to collapse category-split ingestion artifacts.
  let pool = deduplicateByProvider(
    allClasses.filter(
      (c) => !ctx.excludeIds.has(c.id) && !c.is_placeholder && c.hidden_from_directory !== true
    )
  );

  // 2. For intent rails, pre-filter to classes with at least *some* signal match
  if (rail.intentSignals.length > 0 || rail.categorySignals.length > 0) {
    pool = pool.filter((c) => {
      const cat = (c.category ?? "").toLowerCase();
      const hasCategoryMatch = rail.categorySignals.some((s) => s.toLowerCase() === cat);
      if (hasCategoryMatch) return true;

      const corpus = [c.description, c.typical_child_profile, c.outcome_expectations, c.vibe_line]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return rail.intentSignals.some(
        (signal) => corpus.includes(signal.toLowerCase())
      );
    });
  }

  // 3. Score every class in the pool (with chip boost if active)
  const { chipSignals, chipCategories } = resolveChipSignals(ctx);
  const scored: ScoredClass[] = pool.map((cls) => ({
    ...cls,
    _score: computeRailScore(
      cls,
      rail.weights,
      rail.intentSignals,
      rail.categorySignals,
      ctx.isWeekend,
      ctx.userLocation,
      chipSignals,
      chipCategories
    ),
  }));

  // 4. Sort by score descending
  scored.sort((a, b) => b._score - a._score);

  // 5. Enrich top pool with _primaryTag + _outcomeType for diversity checks
  const topPool = enrichForDiversity(scored.slice(0, rail.fetchCount * 3));

  // 6. Freshness blend: 70% top-scored + 30% freshness-rotated
  //    The freshnessReserve from config controls the split ratio.
  const freshnessReserve = rail.diversity.freshnessReserve ?? 0.30;
  const blendTarget = rail.fetchCount * 2; // over-fetch for diversity filtering room
  const blended = blendWithFreshness(topPool, blendTarget, freshnessReserve, freshnessSorter);

  // 7. Stratified shuffle (within score tiers, not global)
  //    Shuffles within groups of 6, preserving rough quality ordering.
  //    Session seed ensures stability within a session.
  const shuffled = stratifiedShuffle(
    blended,
    ctx.sessionSeed + railSeedOffset(rail.railId),
    6 // tier size = one desktop render count
  );

  // 8. Apply diversity constraints (provider cap, outcome variety, back-to-back)
  const diverse = applyDiversityConstraints(
    shuffled,
    rail.diversity,
    rail.fetchCount
  );

  // 9. Convert to card items
  const items = diverse.map((cls) => toCardItem(cls, providerMap));
  const shownIds = diverse.map((cls) => cls.id);

  return { items, shownIds };
}

// ── Build the serendipity rail with mixture rules ──
// Mixture: 40% under-exposed high quality, 30% new, 20% niche, 10% random
export function buildSerendipityRail(
  allClasses: DBClass[],
  rail: RailConfig,
  ctx: ScoringContext,
  providerMap: Record<string, { name: string }>
): { items: RailCardItem[]; shownIds: string[] } {
  const pool = deduplicateByProvider(
    allClasses.filter(
      (c) => !ctx.excludeIds.has(c.id) && !c.is_placeholder && c.hidden_from_directory !== true
    )
  );

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Score for quality (with chip boost if active)
  const { chipSignals, chipCategories } = resolveChipSignals(ctx);
  let scored: ScoredClass[] = pool.map((cls) => ({
    ...cls,
    _score: computeRailScore(cls, rail.weights, [], [], ctx.isWeekend, ctx.userLocation, chipSignals, chipCategories),
  }));
  scored.sort((a, b) => b._score - a._score);

  // Enrich for diversity
  scored = enrichForDiversity(scored);

  const target = rail.fetchCount;

  // ── Buckets (40/30/20/10) ──
  const highQualityUnderExposed = scored
    .filter((c) => c._score >= 0.5)
    .slice(0, Math.ceil(target * 0.4));

  const newListings = scored
    .filter((c) => new Date(c.created_at) >= thirtyDaysAgo)
    .slice(0, Math.ceil(target * 0.3));

  const randomLongTail = seededShuffle(scored, ctx.sessionSeed + 9999)
    .slice(0, Math.ceil(target * 0.1));

  // Niche: classes from less common categories
  const categoryCounts: Record<string, number> = {};
  for (const c of allClasses) {
    const cat = c.category ?? "Other";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }
  const nicheCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count <= 5)
    .map(([cat]) => cat);
  const nichePicks = scored
    .filter((c) => nicheCategories.includes(c.category ?? ""))
    .slice(0, Math.ceil(target * 0.2));

  // Merge and deduplicate
  const seen = new Set<string>();
  const merged: ScoredClass[] = [];
  for (const bucket of [highQualityUnderExposed, newListings, nichePicks, randomLongTail]) {
    for (const item of bucket) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }

  // Stratified shuffle (within tiers of 4 for serendipity's smaller render count)
  const shuffled = stratifiedShuffle(
    merged,
    ctx.sessionSeed + railSeedOffset("serendipity"),
    4 // smaller tier for airy density
  );

  // Apply strict diversity (max 1 per provider, min 5 categories, back-to-back prevention)
  const diverse = applyDiversityConstraints(
    shuffled,
    rail.diversity,
    target
  );

  const items = diverse.map((cls) => toCardItem(cls, providerMap));
  const shownIds = diverse.map((cls) => cls.id);

  return { items, shownIds };
}

// ── Deterministic per-rail seed offset ──
function railSeedOffset(railId: string): number {
  let hash = 0;
  for (let i = 0; i < railId.length; i++) {
    hash = (hash * 31 + railId.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}
