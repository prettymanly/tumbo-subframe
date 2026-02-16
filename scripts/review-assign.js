/**
 * review-assign.js — Assign provider-level reviews to specific classes
 * ══════════════════════════════════════════════════════════════════════
 *
 * Google reviews are collected at the PROVIDER level (one Google listing
 * per business). But parents care about specific CLASSES.
 *
 * Assignment logic:
 *   - Single-class providers (88%): all reviews → that class
 *   - Multi-class providers (12%): keyword matching to assign
 *     - Category keywords ("swimming", "piano", "Chinese")
 *     - Class name keywords
 *     - Age mentions cross-referenced with class age ranges
 *     - Unassignable → stays at provider level only
 *
 * Important distinction (per product brief):
 *   - Class page: shows class-assigned reviews (synthesized, no star rating)
 *   - Provider page: shows aggregate stats + all reviews
 *
 * Run: node scripts/review-assign.js
 * Prerequisite: node scripts/review-collect.js (Outscraper data in data/outscraper/)
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const DATA_DIR = path.join(__dirname, "..", "data", "outscraper");

// ── Category keyword maps ──
const CATEGORY_KEYWORDS = {
  Swimming: ["swim", "pool", "water", "lane", "stroke", "freestyle", "breaststroke", "backstroke", "float", "splash", "aqua"],
  English: ["english", "reading", "writing", "phonics", "grammar", "spelling", "essay", "composition", "vocab", "literature", "story"],
  Chinese: ["chinese", "mandarin", "hanyu", "pinyin", "华文", "中文", "汉语", "huawen"],
  Malay: ["malay", "bahasa"],
  Math: ["math", "maths", "mathematics", "algebra", "arithmetic", "geometry", "abacus", "mental math"],
  Science: ["science", "experiment", "biology", "chemistry", "physics", "lab", "stem"],
  Piano: ["piano", "keyboard", "keys"],
  Violin: ["violin", "fiddle", "strings"],
  Guitar: ["guitar", "ukulele", "strum"],
  Music: ["music", "rhythm", "melody", "instrument", "note", "singing", "vocal", "choir", "orchestra"],
  Ballet: ["ballet", "pointe", "barre", "plié", "tutu"],
  Dance: ["dance", "dancing", "hip hop", "jazz", "contemporary", "choreography", "bollywood", "kpop"],
  Art: ["art", "draw", "drawing", "paint", "painting", "sketch", "craft", "clay", "pottery", "sculpture"],
  Coding: ["coding", "programming", "code", "robotics", "robot", "scratch", "python", "minecraft"],
  Sports: ["sport", "gym", "gymnastics", "martial art", "taekwondo", "karate", "judo", "fencing", "rock climb", "climbing", "soccer", "football", "tennis", "badminton", "basketball"],
  "Holiday Camp": ["camp", "holiday", "vacation", "school break"],
  "Special Needs": ["special needs", "therapy", "speech therapy", "occupational", "autism", "adhd", "dyslexia", "intervention"],
};

// ── Extract assignment signals from review text ──
function extractSignals(reviewText) {
  const text = (reviewText || "").toLowerCase();
  const signals = {
    categories: [],
    agesMentioned: [],
    keywords: [],
  };

  // Category matching
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        if (!signals.categories.includes(category)) {
          signals.categories.push(category);
        }
        signals.keywords.push(kw);
        break; // one match per category is enough
      }
    }
  }

  // Age extraction
  const agePatterns = [
    /my (\d+)[- ]year[- ]old/gi,
    /(\d+) year old/gi,
    /(\d+)yo\b/gi,
    /age (\d+)/gi,
    /(\d+) years old/gi,
    /daughter.*?(\d+)/gi,
    /son.*?(\d+)/gi,
    /kid.*?(\d+)/gi,
    /child.*?(\d+)/gi,
  ];
  for (const pat of agePatterns) {
    let match;
    while ((match = pat.exec(text)) !== null) {
      const age = parseInt(match[1]);
      if (age >= 1 && age <= 18) signals.agesMentioned.push(age);
    }
  }

  return signals;
}

// ── Score how well a review matches a class ──
function scoreMatch(review, cls) {
  let score = 0;
  const signals = extractSignals(review.text);

  // Category match — strongest signal
  if (cls.category && signals.categories.includes(cls.category)) {
    score += 10;
  }

  // Class name keywords in review text
  const reviewLower = (review.text || "").toLowerCase();
  const nameWords = cls.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  for (const word of nameWords) {
    if (reviewLower.includes(word)) score += 3;
  }

  // Age range match
  if (signals.agesMentioned.length > 0 && cls.age_min != null) {
    for (const age of signals.agesMentioned) {
      if (age >= (cls.age_min || 0) && age <= (cls.age_max || 18)) {
        score += 2;
      }
    }
  }

  return { score, signals };
}

// ── Main ──
async function run() {
  console.log("══════════════════════════════════════════════════════");
  console.log("  REVIEW ASSIGNMENT — Provider Reviews → Classes");
  console.log("══════════════════════════════════════════════════════\n");

  // Check data directory
  if (!fs.existsSync(DATA_DIR)) {
    console.error("ERROR: No Outscraper data found. Run review-collect.js first.");
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} provider review files\n`);

  if (files.length === 0) {
    console.error("No review files found in", DATA_DIR);
    process.exit(1);
  }

  // Load all classes
  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, provider_id, category, age_min, age_max")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  // Group classes by provider
  const classesByProvider = {};
  for (const cls of allClasses) {
    if (!cls.provider_id) continue;
    if (!classesByProvider[cls.provider_id]) classesByProvider[cls.provider_id] = [];
    classesByProvider[cls.provider_id].push(cls);
  }

  let assigned = 0;
  let unassigned = 0;
  let singleProviders = 0;
  let multiProviders = 0;
  let totalReviewsProcessed = 0;

  for (const file of files) {
    const providerId = file.replace(".json", "");
    const corpus = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    const reviews = corpus.reviews || [];
    const classes = classesByProvider[providerId] || [];

    if (classes.length === 0 || reviews.length === 0) continue;

    totalReviewsProcessed += reviews.length;

    if (classes.length === 1) {
      // ── Single-class provider: all reviews go to the one class ──
      singleProviders++;
      const cls = classes[0];
      const classReviews = reviews.map((r) => ({
        ...r,
        assignment_reason: "single_class_provider",
        assigned_class_id: cls.id,
      }));

      const { error } = await sb
        .from("classes")
        .update({ raw_reviews: JSON.stringify(classReviews) })
        .eq("id", cls.id);

      if (error) {
        console.log(`  ✗ ${cls.name}: ${error.message}`);
      } else {
        assigned += classReviews.length;
        console.log(`[1 class] ${corpus.provider_name}: ${classReviews.length} reviews → ${cls.name}`);
      }
    } else {
      // ── Multi-class provider: score and assign ──
      multiProviders++;
      console.log(`[${classes.length} classes] ${corpus.provider_name} (${reviews.length} reviews):`);

      const classAssignments = {};
      for (const cls of classes) classAssignments[cls.id] = [];

      for (const review of reviews) {
        // Score against each class
        let bestClass = null;
        let bestScore = 0;
        const scores = [];

        for (const cls of classes) {
          const { score } = scoreMatch(review, cls);
          scores.push({ class: cls.name, score });
          if (score > bestScore) {
            bestScore = score;
            bestClass = cls;
          }
        }

        if (bestScore >= 5) {
          // Clear winner — assign to best match
          classAssignments[bestClass.id].push({
            ...review,
            assignment_reason: `keyword_match_score_${bestScore}`,
            assigned_class_id: bestClass.id,
          });
          assigned++;
        } else if (bestScore > 0 && classes.filter((c) => scoreMatch(review, c).score === bestScore).length === 1) {
          // Weak but unique match — still assign
          classAssignments[bestClass.id].push({
            ...review,
            assignment_reason: `weak_match_score_${bestScore}`,
            assigned_class_id: bestClass.id,
          });
          assigned++;
        } else {
          // Ambiguous or no signal — distribute to ALL classes (it's general provider feedback)
          for (const cls of classes) {
            classAssignments[cls.id].push({
              ...review,
              assignment_reason: "general_provider_review",
              assigned_class_id: cls.id,
            });
          }
          assigned += classes.length;
          unassigned++;
        }
      }

      // Save assignments to each class
      for (const cls of classes) {
        const classReviews = classAssignments[cls.id];
        if (classReviews.length === 0) continue;

        const { error } = await sb
          .from("classes")
          .update({ raw_reviews: JSON.stringify(classReviews) })
          .eq("id", cls.id);

        if (error) {
          console.log(`  ✗ ${cls.name}: ${error.message}`);
        } else {
          const specific = classReviews.filter((r) => r.assignment_reason !== "general_provider_review").length;
          const general = classReviews.filter((r) => r.assignment_reason === "general_provider_review").length;
          console.log(`  → ${cls.name}: ${classReviews.length} reviews (${specific} specific, ${general} general)`);
        }
      }
    }
  }

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  DONE`);
  console.log(`  Single-class providers: ${singleProviders}`);
  console.log(`  Multi-class providers: ${multiProviders}`);
  console.log(`  Total reviews processed: ${totalReviewsProcessed}`);
  console.log(`  Reviews assigned: ${assigned}`);
  console.log(`  Ambiguous (distributed to all): ${unassigned}`);
  console.log(`  Next step: node scripts/full-enrich.js`);
  console.log(`══════════════════════════════════════════`);
}

run().catch(console.error);
