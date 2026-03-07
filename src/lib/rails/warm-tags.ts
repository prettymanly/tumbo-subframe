// ── Warm tag display logic ──
// Converts internal tag labels into warm, human-friendly display labels.
// Selects the 3–4 most "decision-useful" tags for card display.
//
// KEY DESIGN RULE: Tags must be INTENT-based, not TAXONOMY-based.
// Never show raw Google Places categories like "Education center",
// "Training provider", "Tutoring service" etc. on cards.

import type { DBClass } from "@/lib/types/tags";
import { deriveContextualTags } from "@/lib/types/tags";
import type { WarmTag, TagDimension } from "./types";

// ── Internal label → warm human label ──
export const WARM_TAG_MAP: Record<string, string> = {
  // Child dimension
  "Builds Confidence": "Confidence Builder",
  "Self-Expression": "Self-Expression",
  "Creative Kids": "Creative Spirit",
  "Focus & Regulation": "Deep Focus",
  "Shy-Friendly": "Good for Shy Kids",
  "Social Skills": "Social Spark",
  "Problem Solving": "Problem Solver",
  "Gross Motor": "Big Movers",
  "Fine Motor": "Hands & Fingers",
  "Leadership": "Little Leader",
  "Focus & Discipline": "Deep Focus",
  "Restless / Needs Movement": "Good for Restless Kids",

  // Experience dimension
  "High Energy": "High Energy",
  "Small Group": "Small Group",
  "One-on-One": "One-on-One",
  "Performance": "Stage Ready",
  "Hands-On": "Hands-On",
  "Gentle Pace": "Gentle Pace",
  "Outdoor": "Outdoor",
  "Sensory": "Sensory Play",

  // Philosophy dimension
  "Play-Based": "Play-Based",
  "Montessori": "Montessori",
  "Waldorf": "Waldorf / Steiner",
  "Reggio": "Reggio-Inspired",
  "STEM/STEAM": "STEM / STEAM",
  "Mindful": "Mindful",
  "Bilingual": "Bilingual",
  "Story-Driven": "Story-Driven",
  "Process-Focused": "Process Over Product",
  "Project-Based": "Project-Based",
  "Child-Led": "Child-Led",
};

// ── Category → warm content label ──
// ONLY categories that provide decision-useful context for parents.
// All unmapped categories are SUPPRESSED — they show nothing on the card
// rather than leaking Google Places taxonomy like "Education center".
export const WARM_CONTENT_MAP: Record<string, string> = {
  // Movement & body
  Art: "Art & Design",
  Dance: "Dance & Movement",
  Music: "Music",
  Swimming: "Swimming",
  Sports: "Active Sports",
  "Martial Arts": "Martial Arts",
  Gymnastics: "Gymnastics",
  "Rock Climbing": "Rock Climbing",
  Football: "Football",
  Yoga: "Yoga & Mindfulness",
  "Water Sports": "Water Sports",

  // Creative & expression
  Cooking: "Cooking",
  Drama: "Drama & Theatre",
  Play: "Play-Based Learning",
  "Holiday Camp": "Holiday Camp",
  Coding: "Coding & Tech",

  // Academic (reframed as intent, not subject)
  Chinese: "Mandarin",
  Malay: "Bahasa Melayu",
  English: "Language & Stories",
  Mathematics: "Problem-Solving",
  Science: "Young Experimenters",
  STEM: "STEM / STEAM",
  Languages: "Languages",
  "Financial Literacy": "Life Skills",
  "Life Skills": "Life Skills",

  // Religious / faith-based
  "Islamic Studies": "Islamic Studies",
  "Christian Education": "Christian Education",
  Chess: "Chess & Strategy",
  Piano: "Piano",

  // Inclusive
  "Special Needs": "Inclusive Learning",
};

// ── Categories to SUPPRESS entirely ──
// These are Google Places business types, not class descriptions.
// They add zero decision-useful information for a parent.
const SUPPRESS_CATEGORIES = new Set([
  "Education center",
  "Training provider",
  "Training centre",
  "Tutoring service",
  "Learning center",
  "Coaching center",
  "Preschool",
  "School",
  "Primary school",
  "International school",
  "Religious Education",
  "Religious school",
  "Religious institution",
  "Religious organization",
  "Buddhist temple",
  "Anglican church",
  "Christian church",
  "Christian college",
  "Psychotherapist",
  "Occupational therapist",
  "Speech pathologist",
  "Child psychologist",
  "Non-profit organization",
  "Non-governmental organization",
  "Association / Organization",
  "Corporate office",
  "Government office",
  "Pet boarding service",
  "Dog day care center",
  "Animal shelter",
  "Animal hospital",
  "Veterinarian",
  "Farm",
  "Garden center",
  "Library",
  "Art gallery",
  "Photography service",
  "Photography studio",
  "Photography class",
  "Portrait studio",
  "Photographer",
  "Video production service",
  "Event management company",
  "Internet cafe",
  "Skateboard shop",
  "Bicycle rental service",
  "Bicycle club",
  "Tourist attraction",
  "Water park",
  "Escape room center",
  "Nature preserve",
  "Swimming pool",
  "Performing arts group",
  "Softball club",
  "Animation studio",
  "Adult education school",
  "Distance learning center",
  "Computer training school",
  "Academic department",
  "Private tutor",
  "Meditation instructor",
  "Meditation center",
  "Horseback riding service",
  "Pottery store",
  "Pottery classes",
  "Children's club",
  "Children's camp",
  "Children's amusement center",
  "Youth club",
  "Archery range",
  "Archery store",
  "Physical fitness program",
  "Wellness program",
  "Educational institution",
  "Enrichment",
  "Tuition",
  "Brain Training",
  "Water skiing service",
]);

// ── Generic tags to skip (too vague to be decision-useful) ──
const GENERIC_TAGS = new Set(["Interactive", "Collaborative", "Immersive", "Discipline"]);

// ── Select the best 3–4 warm tags for a class card ──
// Priority order:
//   1. Child tags (most decision-useful — what outcome does this serve?)
//   2. Experience tags (what is the class like?)
//   3. Philosophy tags (what approach does the class use?)
//   4. Content tag (what subject — ONLY if mapped and not suppressed)
//
// This order ensures cards lead with INTENT, not TAXONOMY.
export function selectDisplayTags(cls: DBClass, maxTags: number = 4): WarmTag[] {
  const derived = deriveContextualTags(cls);
  const result: WarmTag[] = [];
  const seen = new Set<string>();

  // 1. Child tags first (most decision-useful for parents)
  for (const tag of derived.filter((t) => t.category === "child")) {
    if (result.length >= maxTags) break;
    const warm = WARM_TAG_MAP[tag.label] ?? tag.label;
    if (!seen.has(warm) && !GENERIC_TAGS.has(tag.label)) {
      result.push({ label: warm, dimension: "child" });
      seen.add(warm);
    }
  }

  // 2. Experience tags
  for (const tag of derived.filter((t) => t.category === "experience")) {
    if (result.length >= maxTags) break;
    if (GENERIC_TAGS.has(tag.label)) continue;
    const warm = WARM_TAG_MAP[tag.label] ?? tag.label;
    if (!seen.has(warm)) {
      result.push({ label: warm, dimension: "experience" });
      seen.add(warm);
    }
  }

  // 3. Philosophy tags
  for (const tag of derived.filter((t) => t.category === "philosophy")) {
    if (result.length >= maxTags) break;
    if (GENERIC_TAGS.has(tag.label)) continue;
    const warm = WARM_TAG_MAP[tag.label] ?? tag.label;
    if (!seen.has(warm)) {
      result.push({ label: warm, dimension: "philosophy" });
      seen.add(warm);
    }
  }

  // 4. Content tag LAST — only if mapped AND not suppressed
  //    This prevents Google taxonomy from leaking onto cards.
  if (result.length < maxTags && cls.category) {
    if (!SUPPRESS_CATEGORIES.has(cls.category)) {
      const warmLabel = WARM_CONTENT_MAP[cls.category];
      // Only show if we have an explicit mapping. No fallback to raw category.
      if (warmLabel && !seen.has(warmLabel)) {
        result.push({ label: warmLabel, dimension: "content" });
        seen.add(warmLabel);
      }
    }
  }

  return result;
}
