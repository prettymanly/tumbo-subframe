// ── Rail system barrel export ──
// Import from "@/lib/rails" to access all rail logic.

export type {
  WarmTag,
  TagDimension,
  ScoredClass,
  RailCardItem,
  ScoringWeights,
  DiversityConstraints,
  RailDensity,
  RailConfig,
  ScoringContext,
  RailApiResponse,
  RailsMeta,
} from "./types";

export { RAILS, RAIL_MAP, RAIL_ORDER, INTENT_CHIPS, CHIP_MAP, MAX_RAILS } from "./config";
export type { IntentChipId } from "./config";
export { qualityScore, freshnessScore, proximityScore, intentMatchScore, weekendScore, chipBoostScore, computeRailScore } from "./scoring";
export { selectDisplayTags, WARM_TAG_MAP, WARM_CONTENT_MAP } from "./warm-tags";
export {
  seededShuffle,
  stratifiedShuffle,
  applyDiversityConstraints,
  blendWithFreshness,
  checkPriceBandSpread,
  extractOutcomeType,
  extractPrimaryTag,
} from "./diversity";
export { buildRail, buildSerendipityRail } from "./build-rail";
