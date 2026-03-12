// ══════════════════════════════════════════════════════════════════════
// CENTRALIZED EXCLUSION LOGIC — single source of truth for ALL surfaces
// (rails, browse grid, search results, similar classes, etc.)
//
// Import `shouldExclude` from here. Do NOT maintain separate lists elsewhere.
// ══════════════════════════════════════════════════════════════════════

import type { DBClass } from "@/lib/types/tags";

// ── Category exclusions (case-insensitive match) ──
const EXCLUDE_CATEGORIES = new Set([
  // Photography / media
  "Photography service", "Photography studio", "Photography class",
  "Portrait studio", "Photographer", "Video production service",
  "Animation studio",
  // Adult / higher education
  "Junior college", "University", "Adult education school",
  "Vocational school", "Distance learning center", "Computer training school",
  "Academic department", "Christian college", "International school",
  "Educational institution",
  // Generic Google Places types (auto-generated, not real class providers)
  "Education center", "Training centre", "Training center",
  "Training provider", "Learning center", "Tutoring service",
  "Coaching center", "School",
  // Religious (temples/churches — not children's classes)
  "Buddhist temple", "Hindu temple", "Church", "Mosque",
  "Non-profit organization", "Meditation center",
  // Therapy / medical
  "Speech pathologist", "Occupational therapist", "Psychotherapist",
  "Hospital", "Clinic", "Doctor", "Dentist", "Physiotherapist",
  "Pharmacy", "Veterinary care", "Animal hospital",
  // Non-class services
  "Bicycle rental service", "Greengrocer", "Government office",
  "Tourist attraction", "Animal shelter", "Pet store",
  "Pet boarding service", "Dog day care center", "Veterinarian",
  "Internet cafe", "Event management company",
  "Non-governmental organization", "Association / Organization",
  "Corporate office", "Farm", "Garden center", "Garden",
  // Beauty / wellness
  "Beauty salon", "Hair salon", "Spa", "Laundry service", "Car wash",
  // Professional services
  "Moving company", "Real estate agency", "Insurance agency",
  "Accounting firm", "Law firm", "Tax preparation", "Financial planner",
  "Consultant", "Contractor", "Electrician", "Plumber", "Painter", "Locksmith",
  // Food / retail
  "Restaurant", "Cafe", "Bar", "Bakery", "Supermarket", "Grocery store",
  "Convenience store", "Liquor store", "Shopping mall", "Department store",
  "Clothing store", "Shoe store", "Jewelry store", "Electronics store",
  "Hardware store", "Book store", "Toy store", "Furniture store",
  "Home goods store", "Florist",
  // Transport
  "Bus station", "Train station", "Taxi stand", "Car rental", "Parking",
  // Other
  "Water park", "Archery range",
]);
const EXCLUDE_CATEGORIES_LOWER = new Set([...EXCLUDE_CATEGORIES].map(c => c.toLowerCase()));

// ── Name-pattern exclusions ──
const EXCLUDE_NAME_PATTERNS: RegExp[] = [
  // Photography / photo studios
  /\bphotography\s*(studio|service|class)?\b/i,
  /\bphoto\s*studio\b/i,
  /\bphoto(graphy)?\s+(pte|ltd|inc)\b/i,
  // Junior colleges
  /\bjunior\s+college\b/i,
  // Medical / dental / healthcare
  /\bmedical[,\s].*dental\b/i,
  /\bhealthcare\s+courses?\b/i,
  /\bdental\b/i,
  // Higher ed
  /\bpolytechnic\b/i,
  /\buniversity\b/i,
  /\bSIM\s+Global\b/i,
  // Corporate / adult
  /\bcorporate\b/i,
  /\bMBA\b/,
  /\bA[\s-]?level\b/i,
  /\bO[\s-]?level\b/i,
  // Religious (non-children)
  /\bbible\s+(college|school|class)\b/i,
  // Other non-enrichment
  /\bwedding\b/i,
  /\bdriving\b/i,
  /\bmaid\b/i,
  /\breal\s+estate\b/i,
  /\binsurance\b/i,
  /\besports?\b/i,
  /\bLAN\s+shop\b/i,
  /\bcyber\s+cafe\b/i,
  /\bdistributor\b/i,
  /\bchildren'?s?\s+home\b/i,
  // Google Places auto-prefixed names ("Education center at X")
  /^(Education center|Training centre|Training center|Learning center|Training provider|Tutoring service|Coaching center|Meditation center|Speech pathologist|Occupational therapist|Educational institution|Animation studio|Archery range|Internet cafe|Water park|Christian college|Preschool|School|Garden|Life Skills|Children's camp)\s+at\s+/i,
  // Temples (in name, without "class"/"school"/"academy" context)
  /\btemple\b(?!.*(?:class|school|academy|lesson|student|programme|program))/i,
  // Mosques (in name, without class context)
  /\b(masjid|mosque)\b(?!.*(?:class|school|academy|lesson|student|programme|program))/i,
];

// Categories where name-pattern kills should NOT apply (legit children's enrichment)
const SAFE_CATEGORIES = new Set([
  "Sports", "Art", "Music", "Dance", "Swimming", "Martial Arts",
  "Drama", "Coding", "Cooking", "Yoga", "Gymnastics", "Football",
  "Science", "Rock Climbing", "Chess", "Water Sports", "STEM",
  "Special Needs", "Chinese", "English", "Languages", "Malay",
  "Mathematics", "Holiday Camp", "Play",
]);

/**
 * Returns true if this class should be excluded from ALL user-facing surfaces.
 * This is the single source of truth — import this instead of maintaining
 * duplicate exclusion lists.
 */
export function shouldExclude(cls: DBClass): boolean {
  const cat = (cls.category ?? "").trim();

  // 1. Category kill (case-insensitive)
  if (cat && EXCLUDE_CATEGORIES_LOWER.has(cat.toLowerCase())) return true;

  const name = cls.name ?? "";

  // 2. Name-pattern kill (skip for safe categories with good content)
  const isSafe = SAFE_CATEGORIES.has(cat) &&
    ((cls.description ?? "").length > 100 || (cls.summary ?? "").length > 50);

  if (!isSafe) {
    if (EXCLUDE_NAME_PATTERNS.some((rx) => rx.test(name))) return true;
  }

  return false;
}
