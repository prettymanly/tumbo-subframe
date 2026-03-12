/**
 * Tumbo Search Engine — zero-dependency, client-side fuzzy search
 * ══════════════════════════════════════════════════════════════════
 *
 * Built once when allClasses loads. All subsequent queries run against
 * the pre-built index in <50ms. No external libraries required.
 *
 * Features:
 *   - Fuzzy name matching (Levenshtein-based)
 *   - Category matching with display counts
 *   - Tag matching via taxonomy labels
 *   - Synonym expansion (pottery→ceramics, coding→programming, etc.)
 *   - Age intent parsing ("classes for 5 year olds")
 *   - Multi-signal ranking (exact > category > tag > fuzzy > description)
 */

import type { DBClass } from "@/lib/types/tags";
import { TAXONOMY, type TaxonomyTag } from "@/lib/tags/taxonomy";

// ── Types ──

export interface SearchIndex {
  /** Pre-processed class entries for fast lookup */
  entries: IndexEntry[];
  /** Category → class count */
  categoryMap: Map<string, number>;
  /** Category name lowercase → canonical name */
  categoryCanonical: Map<string, string>;
  /** Tag slug → TaxonomyTag (from taxonomy) */
  tagBySlug: Map<string, TaxonomyTag>;
  /** Tag label lowercase → TaxonomyTag */
  tagByLabel: Map<string, TaxonomyTag>;
  /** All unique categories (sorted by count desc) */
  categories: CategoryEntry[];
  /** All taxonomy tags (content dimension, sorted by label) */
  searchableTags: TagEntry[];
}

interface IndexEntry {
  cls: DBClass;
  /** Lowercased name for fast comparison */
  nameLower: string;
  /** Lowercased category */
  categoryLower: string;
  /** Lowercased description + summary + vibe_line corpus */
  corpusLower: string;
  /** Provider name (if available) */
  providerName: string;
  providerNameLower: string;
  /** Pre-computed quality score for ranking */
  qualityScore: number;
}

export interface CategoryEntry {
  name: string;
  count: number;
}

export interface TagEntry {
  slug: string;
  label: string;
  dimension: string;
  group: string;
}

export interface SearchResult {
  cls: DBClass;
  score: number;
  matchType: "exact" | "category" | "tag" | "fuzzy" | "description" | "age";
}

export interface AutocompleteSuggestion {
  type: "category" | "tag" | "class";
  label: string;
  /** For category: number of classes */
  count?: number;
  /** For tag: dimension */
  dimension?: string;
  /** For class: the class ID */
  classId?: string;
  /** For class: category name */
  category?: string;
  /** For class: provider name */
  provider?: string;
}

export interface AutocompleteResult {
  categories: AutocompleteSuggestion[];
  tags: AutocompleteSuggestion[];
  classes: AutocompleteSuggestion[];
  /** Parsed age intent, if any */
  ageIntent?: number;
}

// ── Synonym map ──
// Each key is a search term; values are synonyms that should also match.
const SYNONYMS: Record<string, string[]> = {
  pottery: ["ceramics", "clay"],
  ceramics: ["pottery", "clay"],
  clay: ["pottery", "ceramics"],
  coding: ["programming", "computer science", "code"],
  programming: ["coding", "computer science", "code"],
  "martial arts": ["bjj", "muay thai", "karate", "taekwondo", "judo", "wushu", "silat"],
  bjj: ["martial arts", "brazilian jiu jitsu"],
  "muay thai": ["martial arts", "kickboxing"],
  karate: ["martial arts"],
  taekwondo: ["martial arts"],
  judo: ["martial arts"],
  wushu: ["martial arts"],
  silat: ["martial arts"],
  soccer: ["football"],
  football: ["soccer"],
  mandarin: ["chinese"],
  chinese: ["mandarin"],
  maths: ["math", "mathematics"],
  math: ["maths", "mathematics"],
  mathematics: ["math", "maths"],
  drawing: ["art", "sketching"],
  painting: ["art"],
  art: ["drawing", "painting", "crafts"],
  crafts: ["art"],
  ballet: ["dance"],
  dance: ["ballet", "hip-hop", "contemporary", "jazz", "k-pop"],
  "hip-hop": ["dance", "hip hop"],
  "hip hop": ["dance", "hip-hop"],
  kpop: ["k-pop", "dance"],
  "k-pop": ["kpop", "dance"],
  swimming: ["swim"],
  swim: ["swimming"],
  gymnastics: ["gym"],
  gym: ["gymnastics"],
  piano: ["keyboard", "music"],
  guitar: ["music"],
  violin: ["music"],
  drums: ["music", "percussion"],
  music: ["piano", "guitar", "violin", "drums"],
  chess: ["strategy", "board game"],
  yoga: ["mindfulness", "meditation"],
  cooking: ["baking", "culinary"],
  baking: ["cooking", "culinary"],
  climbing: ["rock climbing", "bouldering"],
  "rock climbing": ["climbing", "bouldering"],
  robotics: ["coding", "stem"],
  stem: ["science", "robotics", "coding", "engineering"],
  steam: ["stem", "art", "science"],
  drama: ["theatre", "theater", "acting"],
  theatre: ["drama", "theater", "acting"],
  theater: ["drama", "theatre", "acting"],
  acting: ["drama", "theatre"],
  badminton: ["racket", "shuttlecock"],
  tennis: ["racket"],
  phonics: ["reading", "literacy"],
  reading: ["phonics", "literacy", "english"],
  literacy: ["reading", "phonics", "english"],
  fencing: ["swordsmanship", "sword"],
  malay: ["bahasa melayu", "bahasa"],
  bahasa: ["malay", "bahasa melayu"],
  tamil: ["tamil language"],
  hindi: ["hindi language"],
};

// ── Age intent patterns ──
const AGE_PATTERNS: RegExp[] = [
  /(?:classes?\s+)?for\s+(\d{1,2})\s*(?:year|yr|y\.?o\.?)\s*(?:old)?s?/i,
  /(\d{1,2})\s*(?:year|yr|y\.?o\.?)\s*(?:old)?s?\s+(?:classes?|kids?|children)/i,
  /age(?:d?)?\s*(\d{1,2})/i,
  /(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*(?:year|yr|y\.?o\.?)/i,
  /toddler/i,
  /baby|babies|infant/i,
  /preschool|pre-school|kindergarten/i,
  /teen|teenager/i,
];

function parseAgeIntent(query: string): { age?: number; ageMin?: number; ageMax?: number } | null {
  const lower = query.toLowerCase();

  // Named age groups
  if (/toddler/.test(lower)) return { ageMin: 1, ageMax: 3 };
  if (/bab(?:y|ies)|infant/.test(lower)) return { ageMin: 0, ageMax: 2 };
  if (/preschool|pre-school|kindergarten/.test(lower)) return { ageMin: 3, ageMax: 6 };
  if (/teen(?:ager)?s?/.test(lower)) return { ageMin: 13, ageMax: 18 };

  // Range: "5 to 8 year olds"
  const rangeMatch = lower.match(/(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*(?:year|yr|y\.?o\.?)/);
  if (rangeMatch) {
    return { ageMin: parseInt(rangeMatch[1]), ageMax: parseInt(rangeMatch[2]) };
  }

  // Single age
  for (const pattern of AGE_PATTERNS) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1]);
      if (age >= 0 && age <= 18) return { age };
    }
  }

  return null;
}

/** Strip age intent text from the query so remaining tokens can be searched */
function stripAgeIntent(query: string): string {
  return query
    .replace(/(?:classes?\s+)?for\s+\d{1,2}\s*(?:year|yr|y\.?o\.?)\s*(?:old)?s?/gi, "")
    .replace(/\d{1,2}\s*(?:year|yr|y\.?o\.?)\s*(?:old)?s?\s+(?:classes?|kids?|children)/gi, "")
    .replace(/age(?:d?)?\s*\d{1,2}/gi, "")
    .replace(/\d{1,2}\s*(?:to|-)\s*\d{1,2}\s*(?:year|yr|y\.?o\.?)\s*(?:old)?s?/gi, "")
    .replace(/\b(?:toddler|bab(?:y|ies)|infant|preschool|pre-school|kindergarten|teen(?:ager)?s?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Levenshtein distance (bounded) ──
function levenshtein(a: string, b: string, maxDist: number = 3): number {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDist) return maxDist + 1;

  // Use single-row DP for memory efficiency
  const row = new Uint8Array(lb + 1);
  for (let j = 0; j <= lb; j++) row[j] = j;

  for (let i = 1; i <= la; i++) {
    let prev = row[0];
    row[0] = i;
    let minInRow = row[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[j] + 1,      // deletion
        row[j - 1] + 1,  // insertion
        prev + cost       // substitution
      );
      prev = row[j];
      row[j] = val;
      if (val < minInRow) minInRow = val;
    }
    // Early termination if minimum in row exceeds maxDist
    if (minInRow > maxDist) return maxDist + 1;
  }

  return row[lb];
}

/** Fuzzy match score: 0 = no match, higher = better match */
function fuzzyScore(query: string, target: string): number {
  if (!target) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (t === q) return 100;

  // Starts with
  if (t.startsWith(q)) return 90;

  // Contains
  if (t.includes(q)) return 70;

  // Word-boundary match (query matches start of any word in target)
  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 80;
  }

  // Levenshtein for short queries (typo correction)
  if (q.length >= 3 && q.length <= 15) {
    // Check each word in the target
    for (const word of words) {
      const dist = levenshtein(q, word, 2);
      if (dist <= 1) return 60;
      if (dist <= 2) return 40;
    }
    // Also check against the full target for multi-word matches
    if (t.length <= 30) {
      const dist = levenshtein(q, t, 3);
      if (dist <= 2) return 35;
    }
  }

  return 0;
}

/** Quality score for editorial ranking */
function computeQualityScore(cls: DBClass): number {
  let s = 0;
  if (cls.description) s += Math.min(cls.description.length / 500, 1) * 30;
  if (cls.summary) s += 15;
  if (cls.vibe_line) s += 10;
  if (cls.google_rating) s += cls.google_rating * 6; // up to 30
  if (cls.review_count) s += Math.min(cls.review_count / 50, 1) * 15; // up to 15
  if (cls.age_min != null) s += 5;
  if (cls.photo_url) s += 10;
  return s;
}

// ── Build Index ──

export function buildSearchIndex(
  classes: DBClass[],
  providerMap: Record<string, { name: string }>
): SearchIndex {
  // Category counts
  const catCounts = new Map<string, number>();
  const catCanonical = new Map<string, string>();

  for (const cls of classes) {
    if (cls.category) {
      catCounts.set(cls.category, (catCounts.get(cls.category) || 0) + 1);
      catCanonical.set(cls.category.toLowerCase(), cls.category);
    }
  }

  // Sorted categories
  const categories: CategoryEntry[] = [...catCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Taxonomy lookups
  const tagBySlug = new Map<string, TaxonomyTag>();
  const tagByLabel = new Map<string, TaxonomyTag>();
  for (const tag of TAXONOMY) {
    tagBySlug.set(tag.slug, tag);
    tagByLabel.set(tag.label.toLowerCase(), tag);
  }

  // Searchable tags (all taxonomy tags for autocomplete)
  const searchableTags: TagEntry[] = TAXONOMY.map((t) => ({
    slug: t.slug,
    label: t.label,
    dimension: t.dimension,
    group: t.group,
  }));

  // Index entries
  const entries: IndexEntry[] = classes.map((cls) => {
    const provName = cls.provider_id ? providerMap[cls.provider_id]?.name ?? "" : "";
    const corpus = [cls.description, cls.summary, cls.vibe_line, cls.typical_child_profile]
      .filter(Boolean)
      .join(" ");

    return {
      cls,
      nameLower: cls.name.toLowerCase(),
      categoryLower: (cls.category || "").toLowerCase(),
      corpusLower: corpus.toLowerCase(),
      providerName: provName,
      providerNameLower: provName.toLowerCase(),
      qualityScore: computeQualityScore(cls),
    };
  });

  return {
    entries,
    categoryMap: catCounts,
    categoryCanonical: catCanonical,
    categories,
    tagBySlug,
    tagByLabel,
    searchableTags,
  };
}

// ── Autocomplete (fast, for dropdown) ──

export function autocomplete(
  index: SearchIndex,
  query: string,
  maxCategories: number = 3,
  maxTags: number = 4,
  maxClasses: number = 5
): AutocompleteResult {
  const q = query.trim();
  if (!q) return { categories: [], tags: [], classes: [] };

  const qLower = q.toLowerCase();
  const tokens = qLower.split(/\s+/).filter(Boolean);

  // Parse age intent
  const ageResult = parseAgeIntent(q);
  const ageIntent = ageResult?.age;

  // Expand synonyms for all tokens
  const expandedTokens = new Set(tokens);
  for (const token of tokens) {
    const syns = SYNONYMS[token];
    if (syns) {
      for (const syn of syns) expandedTokens.add(syn);
    }
  }

  // 1. Category matches
  const categoryMatches: AutocompleteSuggestion[] = [];
  for (const cat of index.categories) {
    const catLower = cat.name.toLowerCase();
    let matched = false;

    // Direct match
    if (catLower.includes(qLower) || fuzzyScore(qLower, catLower) >= 60) {
      matched = true;
    }

    // Synonym match
    if (!matched) {
      for (const token of expandedTokens) {
        if (catLower.includes(token) || fuzzyScore(token, catLower) >= 60) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      categoryMatches.push({
        type: "category",
        label: cat.name,
        count: cat.count,
      });
    }
    if (categoryMatches.length >= maxCategories) break;
  }

  // 2. Tag matches (search taxonomy labels)
  const tagMatches: AutocompleteSuggestion[] = [];
  const tagScored: { tag: TagEntry; score: number }[] = [];

  for (const tag of index.searchableTags) {
    const labelLower = tag.label.toLowerCase();
    const groupLower = tag.group.toLowerCase();

    let bestScore = 0;

    // Direct label match
    const directScore = fuzzyScore(qLower, labelLower);
    if (directScore > bestScore) bestScore = directScore;

    // Token match against label or group
    for (const token of expandedTokens) {
      const tokenScore = fuzzyScore(token, labelLower);
      if (tokenScore > bestScore) bestScore = tokenScore;
      // Also match group name with lower weight
      const groupScore = fuzzyScore(token, groupLower) * 0.5;
      if (groupScore > bestScore) bestScore = groupScore;
    }

    if (bestScore >= 35) {
      tagScored.push({ tag, score: bestScore });
    }
  }

  tagScored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTags)
    .forEach(({ tag }) => {
      tagMatches.push({
        type: "tag",
        label: tag.label,
        dimension: tag.dimension,
      });
    });

  // 3. Class name matches
  const classScored: { entry: IndexEntry; score: number }[] = [];

  for (const entry of index.entries) {
    let bestScore = 0;

    // Name match (highest priority)
    const nameScore = fuzzyScore(qLower, entry.nameLower);
    if (nameScore > 0) bestScore = nameScore;

    // Provider name match
    const provScore = fuzzyScore(qLower, entry.providerNameLower) * 0.7;
    if (provScore > bestScore) bestScore = provScore;

    // Token-based matching for multi-word queries
    if (tokens.length > 1) {
      let allMatch = true;
      let tokenTotal = 0;
      for (const token of tokens) {
        const tNameScore = fuzzyScore(token, entry.nameLower);
        const tProvScore = fuzzyScore(token, entry.providerNameLower) * 0.7;
        const tCatScore = fuzzyScore(token, entry.categoryLower) * 0.5;
        const best = Math.max(tNameScore, tProvScore, tCatScore);
        if (best > 0) {
          tokenTotal += best;
        } else {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        const avgScore = tokenTotal / tokens.length;
        if (avgScore > bestScore) bestScore = avgScore;
      }
    }

    // Synonym expansion match (name/category only — never corpus)
    if (bestScore === 0) {
      for (const token of expandedTokens) {
        if (!tokens.includes(token)) {
          const synNameScore = fuzzyScore(token, entry.nameLower) * 0.6;
          const synCatScore = fuzzyScore(token, entry.categoryLower) * 0.4;
          const synScore = Math.max(synNameScore, synCatScore);
          if (synScore > bestScore) bestScore = synScore;
        }
      }
    }

    // Age filtering boost
    if (ageResult && bestScore > 0) {
      const age = ageResult.age ?? ageResult.ageMin;
      if (age != null) {
        const meetsAge =
          (entry.cls.age_min == null || entry.cls.age_min <= (ageResult.ageMax ?? age)) &&
          (entry.cls.age_max == null || entry.cls.age_max >= (ageResult.ageMin ?? age));
        if (!meetsAge) bestScore *= 0.1; // drastically lower non-matching
      }
    }

    if (bestScore >= 35) {
      // Add quality score bonus (small, just for tiebreaking)
      const totalScore = bestScore + entry.qualityScore * 0.05;
      classScored.push({ entry, score: totalScore });
    }
  }

  classScored.sort((a, b) => b.score - a.score);

  const classMatches: AutocompleteSuggestion[] = classScored
    .slice(0, maxClasses)
    .map(({ entry }) => ({
      type: "class" as const,
      label: entry.cls.name,
      classId: entry.cls.id,
      category: entry.cls.category ?? undefined,
      provider: entry.providerName || undefined,
    }));

  return {
    categories: categoryMatches,
    tags: tagMatches,
    classes: classMatches,
    ageIntent,
  };
}

// ── Full search (for filtered grid results) ──

export function fullSearch(
  index: SearchIndex,
  query: string,
): SearchResult[] {
  const q = query.trim();
  if (!q) return index.entries.map((e) => ({ cls: e.cls, score: e.qualityScore, matchType: "description" as const }));

  const qLower = q.toLowerCase();
  const tokens = qLower.split(/\s+/).filter(Boolean);

  // Parse and strip age intent
  const ageResult = parseAgeIntent(q);
  const strippedQuery = stripAgeIntent(q).toLowerCase();
  const strippedTokens = strippedQuery.split(/\s+/).filter(Boolean);

  // Expand synonyms
  const expandedTokens = new Set(strippedTokens);
  for (const token of strippedTokens) {
    const syns = SYNONYMS[token];
    if (syns) {
      for (const syn of syns) expandedTokens.add(syn);
    }
  }

  const results: SearchResult[] = [];

  for (const entry of index.entries) {
    let score = 0;
    let matchType: SearchResult["matchType"] = "description";

    // Skip if age doesn't match (when age intent is present)
    if (ageResult) {
      const targetAge = ageResult.age ?? ageResult.ageMin;
      const targetMax = ageResult.ageMax ?? ageResult.age;
      if (targetAge != null && targetMax != null) {
        const meetsAge =
          (entry.cls.age_min == null || entry.cls.age_min <= targetMax) &&
          (entry.cls.age_max == null || entry.cls.age_max >= targetAge);
        if (!meetsAge) continue;
        score += 5; // Small age match bonus
        matchType = "age";
      }
    }

    // If there are no text tokens after stripping age, score purely on quality
    if (strippedTokens.length === 0) {
      score += entry.qualityScore;
      results.push({ cls: entry.cls, score, matchType });
      continue;
    }

    // 1. Exact name match (highest weight: +200)
    const nameScore = fuzzyScore(strippedQuery, entry.nameLower);
    if (nameScore >= 90) {
      score += 200 + nameScore;
      matchType = "exact";
    } else if (nameScore >= 60) {
      score += 120 + nameScore;
      matchType = "fuzzy";
    } else if (nameScore >= 35) {
      score += 60 + nameScore;
      matchType = "fuzzy";
    }

    // 2. Category match (+100) — require strong match (>=60) to prevent
    //    false positives like "malay" → "play" (Levenshtein dist=2)
    for (const token of expandedTokens) {
      const catScore = fuzzyScore(token, entry.categoryLower);
      if (catScore >= 60) {
        score += 100 + catScore;
        if (matchType === "description") matchType = "category";
        break;
      }
    }

    // 3. Provider name match (+50)
    const provScore = fuzzyScore(strippedQuery, entry.providerNameLower);
    if (provScore >= 40) {
      score += 50 + provScore;
      if (matchType === "description" || matchType === "age") matchType = "fuzzy";
    }

    // 4. Corpus match — distinguish curated fields from raw description
    //    summary + vibe_line are editorial-curated: if a token appears there,
    //    the class is genuinely ABOUT that topic.
    //    Raw description often has incidental mentions ("near Malay Heritage Centre")
    //    that create false positives — so description-only matches don't surface.
    if (score < 30) {
      // No strong name/category/provider match yet
      let allOriginalFound = true;
      for (const token of strippedTokens) {
        if (!entry.corpusLower.includes(token)) {
          allOriginalFound = false;
          break;
        }
      }
      if (allOriginalFound && strippedTokens.length > 0) {
        const nameHasToken = strippedTokens.some(t => entry.nameLower.includes(t));
        const catHasToken = strippedTokens.some(t => entry.categoryLower.includes(t));

        if (nameHasToken || catHasToken) {
          // Name or category contains the token — confident match
          score += 30;
          matchType = "description";
        } else {
          // Check curated fields: summary + vibe_line
          const summaryLower = (entry.cls.summary || "").toLowerCase();
          const vibeLower = (entry.cls.vibe_line || "").toLowerCase();
          const inCurated = strippedTokens.every(
            t => summaryLower.includes(t) || vibeLower.includes(t)
          );
          if (inCurated) {
            score += 25;
            matchType = "description";
          }
          // Description-only mention: don't surface (too noisy)
        }
      }
    } else {
      // Already has a strong match — corpus match is a small bonus
      let allOriginalFound = true;
      for (const token of strippedTokens) {
        if (!entry.corpusLower.includes(token)) {
          allOriginalFound = false;
          break;
        }
      }
      if (allOriginalFound) score += 5;
    }

    // Quality tiebreaker
    score += entry.qualityScore * 0.1;

    // Minimum threshold: must have at least a name, category, or provider match
    if (score >= 25) {
      results.push({ cls: entry.cls, score, matchType });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ── Filter by category ──

export function filterByCategory(
  index: SearchIndex,
  category: string
): DBClass[] {
  return index.entries
    .filter((e) => e.cls.category === category)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .map((e) => e.cls);
}

// ── Filter by tag ──

export function filterByTag(
  index: SearchIndex,
  tagLabel: string
): DBClass[] {
  const labelLower = tagLabel.toLowerCase();
  return index.entries
    .filter((e) => {
      // Check category match
      if (e.categoryLower === labelLower) return true;
      // Check name match
      if (e.nameLower.includes(labelLower)) return true;
      // Check corpus match
      if (e.corpusLower.includes(labelLower)) return true;
      return false;
    })
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .map((e) => e.cls);
}
