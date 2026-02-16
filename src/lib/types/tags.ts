// ── Database Types for Tümbo ──
// These match the actual Supabase schema

export interface Provider {
  id: string;
  name: string;
  bio?: string;
  website?: string;
  phone?: string;
  street_address?: string;
  google_maps_query?: string;
  teaching_philosophy?: string;
  claimed_by?: string;
  provider_type?: string;
  categories_offered?: string;
  actual_classes_offered?: string;
  classes_scrape_source?: string; // JSON string of GooglePlacesData
  created_at: string;
  updated_at: string;
}

// ── Google Places data (stored on provider, not class) ──
export interface GooglePlacesData {
  google_place_id?: string;
  google_rating?: number;       // Provider-level rating (e.g. 4.7)
  google_review_count?: number; // Total reviews on Google
  google_address?: string;      // Address from Google Places
  google_website?: string;      // Official website from Google Places
  google_phone?: string;        // Phone number from Google Places
  google_reviews_raw?: GoogleReview[]; // All reviews before class assignment
  google_photos?: string[];     // Photo URLs from Google
  fetched_at?: string;          // ISO timestamp of last fetch
}

export interface GoogleReview {
  author: string;
  text: string;
  rating: number;
  time?: string;             // When the review was posted
  assigned_class_id?: string; // Set by parsing logic — which class this review belongs to
  assignment_reason?: string; // Why it was assigned (e.g. "age mention: 3", "keyword: toddler")
}

// ── Parse Google Places data from provider ──
export function parseGooglePlaces(raw?: string | null): GooglePlacesData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export interface DBClass {
  id: string;
  name: string;
  provider_id?: string;
  summary?: string;
  vibe_line?: string;
  description?: string;
  age_min?: number;
  age_max?: number;
  location?: string;
  price?: number;
  schedule?: string;
  photo_url?: string;
  category?: string;
  google_rating?: number;
  review_count?: number;
  source?: string;
  raw_reviews?: string; // JSON string of Review[]
  typical_child_profile?: string;
  not_ideal_for?: string;
  outcome_expectations?: string;
  is_placeholder: boolean;
  hidden_from_directory?: boolean;
  discovered_from?: string;
  created_at: string;
  updated_at: string;

  // Joined relations
  provider?: Provider;
}

export interface Review {
  author: string;
  text: string;
  rating: number;
}

// ── Helper: parse raw_reviews JSON ──
export function parseReviews(raw?: string | null): Review[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ── Helper: format price display ──
export function formatPrice(price?: number | null): string {
  if (!price) return "Contact for pricing";
  return `$${price}/session`;
}

// ── Helper: format age range ──
export function formatAgeRange(min?: number | null, max?: number | null): string {
  if (min == null && max == null) return "All ages";
  if (min != null && max != null) {
    if (min === 0) return `Up to ${max} years`;
    return `${min}–${max} years`;
  }
  if (min != null) return `${min}+ years`;
  return `Up to ${max} years`;
}

// ── Derive contextual tags from class data ──
interface DerivedTag {
  label: string;
  category: "content" | "philosophy" | "experience" | "child";
}

const PHILOSOPHY_SIGNALS: [RegExp, string][] = [
  [/play[\s-]?based/i, "Play-Based"],
  [/project[\s-]?based/i, "Project-Based"],
  [/montessori/i, "Montessori"],
  [/reggio/i, "Reggio"],
  [/waldorf|steiner/i, "Waldorf"],
  [/story[\s-]?driven|storytelling/i, "Story-Driven"],
  [/bilingual/i, "Bilingual"],
  [/process[\s-]?focus/i, "Process-Focused"],
  [/child[\s-]?led/i, "Child-Led"],
  [/stem|steam/i, "STEM/STEAM"],
  [/mindful|meditation/i, "Mindful"],
];

const EXPERIENCE_SIGNALS: [RegExp, string][] = [
  [/hands[\s-]?on/i, "Hands-On"],
  [/small[\s-]?group/i, "Small Group"],
  [/one[\s-]?on[\s-]?one|1[\s-]?on[\s-]?1|individual/i, "One-on-One"],
  [/outdoor|nature[\s-]?based/i, "Outdoor"],
  [/messy|sensory/i, "Sensory"],
  [/high[\s-]?energy|active|movement/i, "High Energy"],
  [/collaborative|teamwork|group work/i, "Collaborative"],
  [/immersive/i, "Immersive"],
  [/perform|recital|stage|concert/i, "Performance"],
  [/gentle|calm|quiet/i, "Gentle Pace"],
];

const CHILD_SIGNALS: [RegExp, string][] = [
  [/shy|quiet\s+kid|introverted/i, "Shy-Friendly"],
  [/confidence|self[\s-]?confidence|self[\s-]?esteem/i, "Builds Confidence"],
  [/creative|creativity|imagination/i, "Creative Kids"],
  [/focus|attention|self[\s-]?regulation/i, "Focus & Regulation"],
  [/social[\s-]?skill|make\s+friends|peer/i, "Social Skills"],
  [/fine[\s-]?motor|hand[\s-]?eye/i, "Fine Motor"],
  [/gross[\s-]?motor|coordination|balance/i, "Gross Motor"],
  [/self[\s-]?expression|express/i, "Self-Expression"],
  [/problem[\s-]?solv/i, "Problem Solving"],
  [/leadership|lead/i, "Leadership"],
];

// ── Category-based default contextual tags ──
// When keyword detection doesn't find enough tags, fall back to these
// so every class shows at least 2 contextual tags.
const CATEGORY_DEFAULTS: Record<string, DerivedTag[]> = {
  Art: [
    { label: "Hands-On", category: "experience" },
    { label: "Creative Kids", category: "child" },
    { label: "Self-Expression", category: "child" },
  ],
  Music: [
    { label: "Performance", category: "experience" },
    { label: "Self-Expression", category: "child" },
    { label: "Focus & Discipline", category: "child" },
  ],
  Dance: [
    { label: "High Energy", category: "experience" },
    { label: "Builds Confidence", category: "child" },
    { label: "Self-Expression", category: "child" },
  ],
  Swimming: [
    { label: "Small Group", category: "experience" },
    { label: "Builds Confidence", category: "child" },
    { label: "Gross Motor", category: "child" },
  ],
  Cooking: [
    { label: "Hands-On", category: "experience" },
    { label: "Sensory", category: "experience" },
    { label: "Fine Motor", category: "child" },
  ],
  Chinese: [
    { label: "Immersive", category: "experience" },
    { label: "Bilingual", category: "philosophy" },
  ],
  English: [
    { label: "Interactive", category: "experience" },
    { label: "Builds Confidence", category: "child" },
  ],
  Mathematics: [
    { label: "Problem Solving", category: "child" },
    { label: "Interactive", category: "experience" },
  ],
  Science: [
    { label: "Hands-On", category: "experience" },
    { label: "STEM/STEAM", category: "philosophy" },
    { label: "Problem Solving", category: "child" },
  ],
  Sports: [
    { label: "High Energy", category: "experience" },
    { label: "Collaborative", category: "experience" },
    { label: "Gross Motor", category: "child" },
  ],
  "Martial Arts": [
    { label: "Discipline", category: "philosophy" },
    { label: "Builds Confidence", category: "child" },
    { label: "Focus & Discipline", category: "child" },
  ],
  Drama: [
    { label: "Performance", category: "experience" },
    { label: "Builds Confidence", category: "child" },
    { label: "Self-Expression", category: "child" },
  ],
  Gymnastics: [
    { label: "High Energy", category: "experience" },
    { label: "Gross Motor", category: "child" },
    { label: "Builds Confidence", category: "child" },
  ],
  Chess: [
    { label: "Problem Solving", category: "child" },
    { label: "Focus & Discipline", category: "child" },
  ],
  Yoga: [
    { label: "Mindful", category: "philosophy" },
    { label: "Gentle Pace", category: "experience" },
    { label: "Focus & Regulation", category: "child" },
  ],
  "Rock Climbing": [
    { label: "High Energy", category: "experience" },
    { label: "Problem Solving", category: "child" },
    { label: "Builds Confidence", category: "child" },
  ],
  Languages: [
    { label: "Immersive", category: "experience" },
    { label: "Bilingual", category: "philosophy" },
  ],
  "Holiday Camp": [
    { label: "Hands-On", category: "experience" },
    { label: "Collaborative", category: "experience" },
  ],
  Enrichment: [
    { label: "Interactive", category: "experience" },
    { label: "Builds Confidence", category: "child" },
  ],
  STEM: [
    { label: "Hands-On", category: "experience" },
    { label: "STEM/STEAM", category: "philosophy" },
    { label: "Problem Solving", category: "child" },
  ],
  Play: [
    { label: "Play-Based", category: "philosophy" },
    { label: "Social Skills", category: "child" },
  ],
  "Water Sports": [
    { label: "Outdoor", category: "experience" },
    { label: "Builds Confidence", category: "child" },
  ],
  "Special Needs": [
    { label: "Gentle Pace", category: "experience" },
    { label: "One-on-One", category: "experience" },
  ],
};

export function deriveContextualTags(cls: DBClass): DerivedTag[] {
  const tags: DerivedTag[] = [];
  const seen = new Set<string>();

  const addTag = (label: string, category: DerivedTag["category"]) => {
    if (!seen.has(label)) {
      seen.add(label);
      tags.push({ label, category });
    }
  };

  // 1. Keyword detection from actual content
  const corpus = [
    cls.description,
    cls.typical_child_profile,
    cls.not_ideal_for,
    cls.outcome_expectations,
    cls.vibe_line,
  ]
    .filter(Boolean)
    .join(" ");

  if (corpus) {
    for (const [pattern, label] of PHILOSOPHY_SIGNALS) {
      if (pattern.test(corpus)) addTag(label, "philosophy");
    }
    for (const [pattern, label] of EXPERIENCE_SIGNALS) {
      if (pattern.test(corpus)) addTag(label, "experience");
    }
    for (const [pattern, label] of CHILD_SIGNALS) {
      if (pattern.test(corpus)) addTag(label, "child");
    }
  }

  // 2. Fill with category-based defaults if we don't have enough
  if (tags.length < 2 && cls.category) {
    const defaults = CATEGORY_DEFAULTS[cls.category] || [];
    for (const d of defaults) {
      addTag(d.label, d.category);
    }
  }

  // Return top 3 contextual tags
  return tags.slice(0, 3);
}

// ── Top tags for the /classes tag row ──
// Derives frequency-ranked tags from the loaded dataset using the SAME
// selectDisplayTags pipeline that cards use. This ensures the tag row
// and the card badges are always in sync — one pipeline, one truth.
//
// INVARIANT: getTopTags counts ONLY what selectDisplayTags would emit.
//   It never injects labels that cards wouldn't show.
//   If a dimension has fewer than MIN_PER_GROUP tags in the dataset,
//   it gets fewer — no padding with hardcoded fallbacks.
//
// Sort order: dimension (child → experience → philosophy → content)
//   → frequency desc → label asc (deterministic across reloads).

export interface TopTag {
  label: string;
  dimension: "content" | "philosophy" | "experience" | "child";
  count: number;
}

const MAX_TAGS = 12;
const MIN_PER_GROUP: Record<string, number> = {
  child: 3, experience: 3, philosophy: 2, content: 2,
};

/** Explicit dimension ordering for the tag row. */
const DIMENSION_ORDER: TopTag["dimension"][] = [
  "child", "experience", "philosophy", "content",
];
const DIMENSION_RANK: Record<string, number> = Object.fromEntries(
  DIMENSION_ORDER.map((d, i) => [d, i])
);

/**
 * Deterministic sort comparator for TopTag[].
 * 1. Dimension order (child → experience → philosophy → content)
 * 2. Frequency desc
 * 3. Label asc (stable tie-break)
 */
function topTagSort(a: TopTag, b: TopTag): number {
  const dimDiff = (DIMENSION_RANK[a.dimension] ?? 99) - (DIMENSION_RANK[b.dimension] ?? 99);
  if (dimDiff !== 0) return dimDiff;
  const freqDiff = b.count - a.count;
  if (freqDiff !== 0) return freqDiff;
  return a.label.localeCompare(b.label);
}

/**
 * Compute the top N tags across a set of classes for the tag row.
 *
 * selectDisplayTagsFn MUST be the warm-tags selectDisplayTags function —
 * passed as a parameter to avoid a circular import (warm-tags imports
 * from this file). This ensures we count exactly what cards display:
 * warm-mapped labels, suppressed taxonomy stripped, same priority order.
 */
export function getTopTags(
  classes: DBClass[],
  selectDisplayTagsFn: (cls: DBClass) => { label: string; dimension: string }[]
): TopTag[] {
  // 1. Count frequency of each (label, dimension) pair across all classes.
  //    Each class contributes at most once per tag (dedup within class).
  const freq = new Map<string, TopTag>();
  for (const cls of classes) {
    const tags = selectDisplayTagsFn(cls);
    for (const t of tags) {
      const key = `${t.dimension}::${t.label}`;
      const existing = freq.get(key);
      if (existing) {
        existing.count++;
      } else {
        freq.set(key, {
          label: t.label,
          dimension: t.dimension as TopTag["dimension"],
          count: 1,
        });
      }
    }
  }

  // 2. Sort all candidates by the deterministic comparator.
  const allTags = [...freq.values()].sort(topTagSort);

  // 3. Guarantee MIN_PER_GROUP per dimension (take top-frequency within each).
  //    If a dimension has fewer than its minimum in the dataset,
  //    it simply gets fewer — no injection of labels cards wouldn't show.
  const picked = new Set<string>();
  for (const dim of DIMENSION_ORDER) {
    const min = MIN_PER_GROUP[dim] ?? 2;
    let count = 0;
    for (const t of allTags) {
      if (t.dimension !== dim) continue;
      if (count >= min) break;
      picked.add(`${t.dimension}::${t.label}`);
      count++;
    }
  }

  // 4. Fill remaining slots by global sort order (respects dimension grouping).
  for (const t of allTags) {
    if (picked.size >= MAX_TAGS) break;
    const key = `${t.dimension}::${t.label}`;
    if (!picked.has(key)) {
      picked.add(key);
    }
  }

  // 5. Build final array in deterministic order.
  const result: TopTag[] = allTags.filter(
    (t) => picked.has(`${t.dimension}::${t.label}`)
  );

  return result;
}

// ── Category colors for tags ──
export const CATEGORY_COLORS: Record<string, string> = {
  Art: "bg-tumbo-tag-content",
  Dance: "bg-tumbo-tag-experience",
  Music: "bg-tumbo-tag-content",
  Swimming: "bg-tumbo-tag-experience",
  Cooking: "bg-tumbo-tag-philosophy",
  Chinese: "bg-tumbo-tag-child",
  Mathematics: "bg-tumbo-tag-child",
  English: "bg-tumbo-tag-philosophy",
  Piano: "bg-tumbo-tag-content",
  "Art school": "bg-tumbo-tag-content",
  "Dance school": "bg-tumbo-tag-experience",
  "Cooking school": "bg-tumbo-tag-philosophy",
  "Piano instructor": "bg-tumbo-tag-content",
  "Swimming instructor": "bg-tumbo-tag-experience",
};

// ── Legacy Tag types (kept for backward compat, but tags table is empty) ──

export interface TagType {
  id: string;
  name: "content" | "philosophy" | "experience" | "child";
  display_name: string;
  description?: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  tag_type_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  level: number;
  path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tag_type?: TagType;
  children?: Tag[];
  parent?: Tag;
}

// Keep old Class interface as alias for backward compat
export type Class = DBClass;

export interface ClassTag {
  id: string;
  class_id: string;
  tag_id: string;
  created_at: string;
  tag?: Tag;
  class?: Class;
}

export interface ClassImage {
  id: string;
  class_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface SearchFilters {
  search_query?: string;
  tag_ids?: string[];
  tag_type_ids?: string[];
  age_min?: number;
  age_max?: number;
}

export interface SearchResult {
  class_id: string;
  title: string;
  description?: string;
  image_url?: string;
  age_range_min?: number;
  age_range_max?: number;
  relevance_score: number;
}

export interface TagHierarchy {
  id: string;
  name: string;
  description?: string;
  level: number;
  path: string;
  children?: TagHierarchy[];
}

export const TAG_TYPES = {
  CONTENT: "content",
  PHILOSOPHY: "philosophy",
  EXPERIENCE: "experience",
  CHILD: "child",
} as const;

export type TagTypeName = (typeof TAG_TYPES)[keyof typeof TAG_TYPES];

export const TAG_TYPE_COLORS: Record<TagTypeName, string> = {
  [TAG_TYPES.CONTENT]: "#3B82F6",
  [TAG_TYPES.PHILOSOPHY]: "#10B981",
  [TAG_TYPES.EXPERIENCE]: "#F59E0B",
  [TAG_TYPES.CHILD]: "#EF4444",
};

export function getTagColor(tag: Tag | TagType): string {
  if ("color" in tag) return tag.color;
  if (tag.tag_type?.color) return tag.tag_type.color;
  const tagType = tag.tag_type?.name as TagTypeName;
  if (tagType && TAG_TYPE_COLORS[tagType]) return TAG_TYPE_COLORS[tagType];
  return "#6B7280";
}

export function getTagDisplayName(tag: Tag | TagType): string {
  if ("display_name" in tag) return tag.display_name;
  if (tag.tag_type?.display_name) return tag.tag_type.display_name;
  return "Tag";
}

export function isTagType(tag: Tag, typeName: TagTypeName): boolean {
  return tag.tag_type?.name === typeName;
}

export function getTagPathSegments(tag: Tag): string[] {
  return tag.path.split(" > ");
}

export function getTagLevelDisplay(tag: Tag): string {
  const segments = getTagPathSegments(tag);
  if (segments.length === 1) return segments[0];
  return `${segments[0]} > ${segments[segments.length - 1]}`;
}
