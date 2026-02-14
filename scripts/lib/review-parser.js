/**
 * Review Parser — assigns provider-level Google reviews to specific classes
 *
 * Strategy:
 * 1. Check for explicit class name mentions in review text
 * 2. Check for age mentions and match to class age ranges
 * 3. Check for activity/keyword mentions that map to specific classes
 * 4. If no match → review stays at provider level (unassigned)
 *
 * Used by: scripts/google-places-fetch.js
 */

// ── Age extraction from review text ──
function extractAges(text) {
  const ages = [];
  const lower = text.toLowerCase();

  // Pattern: "my X-year-old", "my X year old", "X yr old", "age X", "aged X"
  const patterns = [
    /my\s+(\d{1,2})[\s-]*(?:year|yr)[\s-]*old/gi,
    /(?:age|aged)\s+(\d{1,2})/gi,
    /(\d{1,2})[\s-]*(?:year|yr)[\s-]*old/gi,
    /(\d{1,2})[\s-]*(?:month)[\s-]*old/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      const age = parseInt(match[1], 10);
      // Month pattern → convert to years
      if (pattern.source.includes("month")) {
        ages.push(Math.round(age / 12));
      } else if (age >= 1 && age <= 18) {
        ages.push(age);
      }
    }
  }

  // Pattern: "toddler" → age ~2, "baby/infant" → age ~1, "teen" → age ~13
  if (lower.includes("toddler")) ages.push(2);
  if (lower.includes("baby") || lower.includes("infant")) ages.push(1);
  if (lower.includes("teenager") || lower.includes("teen")) ages.push(13);
  if (lower.includes("preschool") || lower.includes("pre-school")) ages.push(4);
  if (lower.includes("kindergarten")) ages.push(5);

  return [...new Set(ages)];
}

// ── Keyword extraction from review text ──
const KEYWORD_MAP = {
  // Art keywords
  paint: "Art",
  painting: "Art",
  drawing: "Art",
  sketch: "Art",
  sculpture: "Art",
  clay: "Art",
  pottery: "Art",
  watercolour: "Art",
  watercolor: "Art",
  canvas: "Art",
  crayon: "Art",
  "art class": "Art",
  "art lesson": "Art",
  messy: "Art",
  doodle: "Art",
  manga: "Art",
  "digital art": "Art",

  // Dance keywords
  dance: "Dance",
  ballet: "Dance",
  "hip hop": "Dance",
  "hip-hop": "Dance",
  kpop: "Dance",
  "k-pop": "Dance",
  choreography: "Dance",
  "belly dance": "Dance",
  contemporary: "Dance",

  // Music keywords
  guitar: "Music",
  drum: "Music",
  drums: "Music",
  piano: "Piano",
  keyboard: "Piano",
  singing: "Music",
  vocal: "Music",
  band: "Music",
  ensemble: "Music",
  rock: "Music",
  "music lesson": "Music",
  "music class": "Music",
  rhythm: "Music",

  // Swimming keywords
  swim: "Swimming",
  swimming: "Swimming",
  pool: "Swimming",
  "water safety": "Swimming",
  stroke: "Swimming",
  float: "Swimming",
  "swim class": "Swimming",
  "swim lesson": "Swimming",
  aqua: "Swimming",

  // Cooking keywords
  cook: "Cooking",
  cooking: "Cooking",
  baking: "Cooking",
  bake: "Cooking",
  kitchen: "Cooking",
  recipe: "Cooking",
  chef: "Cooking",

  // Language keywords
  chinese: "Chinese",
  mandarin: "Chinese",
  "chinese class": "Chinese",
  english: "English",
  "creative writing": "English",
  composition: "Chinese",
  comprehension: "English",

  // Math keywords
  math: "Mathematics",
  maths: "Mathematics",
  mathematics: "Mathematics",
  "problem solving": "Mathematics",
  olympiad: "Mathematics",

  // Montessori
  montessori: "Piano", // In our data, Montessori classes are BrightNotes (Piano category)
  suzuki: "Piano",
};

function extractKeywords(text) {
  const lower = text.toLowerCase();
  const matches = [];

  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      matches.push({ keyword, category });
    }
  }

  return matches;
}

// ── Check for explicit class name mentions ──
function findClassNameMention(text, classes) {
  const lower = text.toLowerCase();

  for (const cls of classes) {
    const className = cls.name.toLowerCase();
    // Check if the review mentions the class name directly
    if (lower.includes(className)) {
      return { classId: cls.id, reason: `class name mention: "${cls.name}"` };
    }

    // Check for partial name matches (e.g. "twoosy" in "Abrakadoodle — Twoosy Doodlers")
    const parts = className.split(/[—\-–,]/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length > 4 && lower.includes(trimmed)) {
        return { classId: cls.id, reason: `partial name match: "${trimmed}"` };
      }
    }
  }

  return null;
}

/**
 * Assign a single review to the best matching class
 *
 * @param {object} review - { author, text, rating, time }
 * @param {object[]} classes - Array of class objects { id, name, age_min, age_max, category }
 * @returns {{ classId: string|null, reason: string }}
 */
function assignReviewToClass(review, classes) {
  if (!review.text || classes.length === 0) {
    return { classId: null, reason: "no text or no classes" };
  }

  // If only one class under this provider, all reviews go there
  if (classes.length === 1) {
    return { classId: classes[0].id, reason: "only class under this provider" };
  }

  // 1. Check for explicit class name mentions
  const nameMention = findClassNameMention(review.text, classes);
  if (nameMention) return nameMention;

  // 2. Check for age mentions → match to class age ranges
  const ages = extractAges(review.text);
  if (ages.length > 0) {
    for (const age of ages) {
      for (const cls of classes) {
        if (cls.age_min != null && cls.age_max != null) {
          if (age >= cls.age_min && age <= cls.age_max) {
            return {
              classId: cls.id,
              reason: `age mention: ${age} fits range ${cls.age_min}-${cls.age_max}`,
            };
          }
        }
      }
    }
  }

  // 3. Check for activity keywords → match to class category
  const keywords = extractKeywords(review.text);
  if (keywords.length > 0) {
    // Find the most specific keyword match
    for (const { keyword, category } of keywords) {
      const matchingClasses = classes.filter(
        (c) => c.category && c.category.toLowerCase() === category.toLowerCase()
      );
      if (matchingClasses.length === 1) {
        return {
          classId: matchingClasses[0].id,
          reason: `keyword "${keyword}" → category "${category}"`,
        };
      }
    }
  }

  // 4. No match → stays unassigned (provider-level only)
  return { classId: null, reason: "no matching signals found" };
}

/**
 * Assign all provider reviews to their best matching classes
 *
 * @param {object[]} reviews - Array of { author, text, rating, time }
 * @param {object[]} classes - Array of class objects from this provider
 * @returns {{ assigned: Map<classId, review[]>, unassigned: review[] }}
 */
function assignAllReviews(reviews, classes) {
  const assigned = new Map(); // classId → review[]
  const unassigned = [];

  // Initialize assigned map with empty arrays for each class
  for (const cls of classes) {
    assigned.set(cls.id, []);
  }

  for (const review of reviews) {
    const { classId, reason } = assignReviewToClass(review, classes);

    const enrichedReview = {
      ...review,
      assigned_class_id: classId,
      assignment_reason: reason,
    };

    if (classId && assigned.has(classId)) {
      assigned.get(classId).push(enrichedReview);
    } else {
      unassigned.push(enrichedReview);
    }
  }

  return { assigned, unassigned };
}

module.exports = {
  extractAges,
  extractKeywords,
  findClassNameMention,
  assignReviewToClass,
  assignAllReviews,
};
