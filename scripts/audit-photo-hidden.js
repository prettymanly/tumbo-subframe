/**
 * audit-photo-hidden.js
 * =====================================================================
 * After the aggressive cull hid ~889 listings whose photo_url contained
 * "places.googleapis.com", this script audits those listings to find
 * the ones with GREAT content that deserve to be shown — they just
 * need a better photo.
 *
 * Scoring (max 110 pts, photo quality deliberately excluded):
 *   30 pts  Non-generic vibe_line (using same patterns as cull script)
 *   20 pts  Description > 100 chars
 *   10 pts  Has a summary
 *   15 pts  Has age_min AND age_max set
 *   15 pts  google_rating >= 4.0
 *   10 pts  review_count >= 5
 *   10 pts  Legit children's category (not "Point of interest" etc.)
 *
 * Tiers:
 *   A (80-110)  Great content, just needs photos — SHOULD be shown
 *   B (50-79)   Decent content, worth showing with placeholder — CONSIDER
 *   C (20-49)   Thin content, not worth showing yet — KEEP HIDDEN
 *   D (0-19)    Garbage content — KEEP HIDDEN
 *
 * Run:  node scripts/audit-photo-hidden.js
 */

const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ═══════════════════════════════════════════════════════════════════════
//  GENERIC VIBE LINE DETECTION (copied from cull-listings.js)
// ═══════════════════════════════════════════════════════════════════════
const GENERIC_VIBE_PATTERNS = [
  /^a fun and engaging class for kids\.?$/i,
  /^classes for children\.?$/i,
  /^fun activities for kids\.?$/i,
  /^a great place for children\.?$/i,
  /^fun and engaging/i,
  /^classes for (kids|children)/i,
  /^a (fun|great|wonderful|amazing) (place|class|school) for (kids|children)/i,
  /^(great|good|nice|best) (classes|activities|programs?) for (kids|children)/i,
  /^(learn|discover|explore) (and|&) (have fun|play|grow)/i,
  /^where (kids|children) (can )?(learn|grow|play|have fun)/i,
  /^nurturing.*environment/i,
  /^safe and nurturing/i,
  /^holistic development/i,
  /^enriching.*experience/i,
];

function isGenericVibeLine(vl) {
  if (!vl) return true;
  const trimmed = vl.trim();
  if (trimmed.length < 20) return true;
  for (const re of GENERIC_VIBE_PATTERNS) {
    if (re.test(trimmed)) return true;
  }
  const genericOnly = /^[a-z\s,]*(fun|engaging|creative|exciting|wonderful|amazing|great|best|quality|enriching|nurturing|joyful|supportive|inspiring|innovative|holistic|dynamic|vibrant|interactive)[a-z\s,]*(class|classes|program|school|centre|center|academy|studio|activities?|lessons?|sessions?|learning|education|enrichment)[a-z\s,]*(for|with)?[a-z\s,]*(kids?|children|toddlers?|preschoolers?|students?|learners?|little ones?)?\.?$/i;
  if (genericOnly.test(trimmed) && trimmed.length < 60) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
//  CATEGORY KILL LIST (copied from cull-listings.js)
// ═══════════════════════════════════════════════════════════════════════
const CATEGORY_KILL_LIST = new Set([
  "Photography studio", "Photographer", "Photo studio",
  "Junior college", "University", "Adult education school", "Vocational school",
  "Bicycle rental service", "Greengrocer", "Government office",
  "Tourist attraction", "Animal hospital", "Animal shelter", "Pet store",
  "Buddhist temple", "Hindu temple", "Church", "Mosque", "Non-profit organization",
  "Point of interest", "Establishment", "Locality", "Sublocality",
  "Beauty salon", "Hair salon", "Spa", "Laundry service", "Car wash",
  "Moving company", "Real estate agency", "Insurance agency", "Accounting firm",
  "Law firm", "Tax preparation", "Financial planner", "Consultant",
  "Contractor", "Electrician", "Plumber", "Painter", "Locksmith",
  "Hospital", "Clinic", "Doctor", "Dentist", "Physiotherapist",
  "Pharmacy", "Veterinary care",
  "Restaurant", "Cafe", "Bar", "Bakery", "Supermarket", "Grocery store",
  "Convenience store", "Liquor store", "Shopping mall", "Department store",
  "Clothing store", "Shoe store", "Jewelry store", "Electronics store",
  "Hardware store", "Book store", "Toy store", "Furniture store",
  "Home goods store", "Florist",
  "Bus station", "Train station", "Taxi stand", "Car rental", "Parking",
]);
const CATEGORY_KILL_LIST_LOWER = new Set(
  [...CATEGORY_KILL_LIST].map((c) => c.toLowerCase())
);

// Non-children's categories that aren't on the kill list but aren't legit either
const NON_LEGIT_CATEGORIES = new Set([
  "point of interest", "establishment", "locality", "sublocality",
  "general contractor", "store", "shopping", "business",
  "food", "health", "finance",
]);

function isLegitChildCategory(category) {
  if (!category || category.trim().length === 0) return false;
  const lower = category.toLowerCase().trim();
  if (CATEGORY_KILL_LIST_LOWER.has(lower)) return false;
  if (NON_LEGIT_CATEGORIES.has(lower)) return false;
  return true;
}

// ═══════════════════════════════════════════════════════════════════════
//  LAYER CHECKS (from cull-listings.js) for overlap detection
// ═══════════════════════════════════════════════════════════════════════
function failsLayer1(cls) {
  if (!cls.category) return false;
  return CATEGORY_KILL_LIST_LOWER.has(cls.category.toLowerCase().trim());
}

function failsLayer2_ExceptPhoto(cls) {
  // Layer 2 checks MINUS the photo check — we want to know
  // which listings would have been hidden even without the photo issue
  const reasons = [];
  if (!cls.name || cls.name.trim().length === 0) reasons.push("missing name");
  const vl = (cls.vibe_line || "").trim();
  if (vl.length === 0) {
    reasons.push("missing vibe_line");
  } else if (isGenericVibeLine(vl)) {
    reasons.push(`generic vibe_line`);
  }
  if (!cls.description || cls.description.trim().length === 0) reasons.push("missing description");
  if (cls.is_placeholder) reasons.push("is_placeholder = true");
  return reasons.length > 0 ? reasons : null;
}

function failsLayer3(cls) {
  const reasons = [];
  const summary = (cls.summary || "").trim().toLowerCase();
  const name = (cls.name || "").trim().toLowerCase();
  if (summary && name && (summary === name || summary.startsWith(name + ".") || summary.startsWith(name + " -"))) {
    reasons.push("summary is just name repeated");
  }
  const hasVibe = (cls.vibe_line || "").trim().length > 0;
  const hasSummary = (cls.summary || "").trim().length > 0;
  const hasDesc = (cls.description || "").trim().length > 0;
  if (!hasVibe && !hasSummary && !hasDesc) {
    reasons.push("no vibe_line AND no summary AND no description");
  }
  const hasCat = (cls.category || "").trim().length > 0;
  // We can't check tags here without fetching them, so skip that sub-check
  // for the overlap analysis. A listing with no category is flagged.
  if (!hasCat) {
    reasons.push("no category");
  }
  return reasons.length > 0 ? reasons : null;
}

// ═══════════════════════════════════════════════════════════════════════
//  CONTENT QUALITY SCORER (photo deliberately excluded)
// ═══════════════════════════════════════════════════════════════════════
function scoreContent(cls) {
  let score = 0;
  const breakdown = [];

  // 1. Non-generic vibe_line (30 pts)
  const vl = (cls.vibe_line || "").trim();
  if (vl.length > 0 && !isGenericVibeLine(vl)) {
    score += 30;
    breakdown.push("+30 vibe_line");
  }

  // 2. Description > 100 chars (20 pts)
  const desc = (cls.description || "").trim();
  if (desc.length > 100) {
    score += 20;
    breakdown.push("+20 description");
  }

  // 3. Has summary (10 pts)
  const summary = (cls.summary || "").trim();
  if (summary.length > 0) {
    score += 10;
    breakdown.push("+10 summary");
  }

  // 4. Has age_min AND age_max (15 pts)
  if (cls.age_min != null && cls.age_max != null) {
    score += 15;
    breakdown.push("+15 age_range");
  }

  // 5. google_rating >= 4.0 (15 pts)
  if (cls.google_rating != null && cls.google_rating >= 4.0) {
    score += 15;
    breakdown.push("+15 rating");
  }

  // 6. review_count >= 5 (10 pts)
  if (cls.review_count != null && cls.review_count >= 5) {
    score += 10;
    breakdown.push("+10 reviews");
  }

  // 7. Legit children's category (10 pts)
  if (isLegitChildCategory(cls.category)) {
    score += 10;
    breakdown.push("+10 category");
  }

  return { score, breakdown };
}

// ═══════════════════════════════════════════════════════════════════════
//  FETCH ALL PHOTO-HIDDEN LISTINGS
// ═══════════════════════════════════════════════════════════════════════
async function fetchPhotoHiddenListings() {
  const allRows = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await sb
      .from("classes")
      .select("id, name, category, vibe_line, description, summary, photo_url, is_placeholder, hidden_from_directory, google_rating, review_count, age_min, age_max, provider_id")
      .eq("hidden_from_directory", true)
      .eq("is_placeholder", false)
      .like("photo_url", "%places.googleapis.com%")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allRows;
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════
async function run() {
  console.log("================================================================");
  console.log("  TUMBO PHOTO-HIDDEN LISTINGS AUDIT");
  console.log("  \"889 culled for Google Places photos — what's worth saving?\"");
  console.log("================================================================\n");

  // ── Fetch ──
  console.log("Fetching listings hidden with Google Places photos...");
  const listings = await fetchPhotoHiddenListings();
  console.log(`  Found ${listings.length} listings matching criteria.\n`);

  if (listings.length === 0) {
    console.log("No listings found. Nothing to audit.");
    return;
  }

  // ── Score each listing ──
  const scored = listings.map((cls) => {
    const { score, breakdown } = scoreContent(cls);
    return { cls, score, breakdown };
  });

  // ── Sort by score descending ──
  scored.sort((a, b) => b.score - a.score);

  // ── Bucket into tiers ──
  const tierA = scored.filter((s) => s.score >= 80);
  const tierB = scored.filter((s) => s.score >= 50 && s.score < 80);
  const tierC = scored.filter((s) => s.score >= 20 && s.score < 50);
  const tierD = scored.filter((s) => s.score < 20);

  // ═══════════════════════════════════════════════════════════════════
  //  TIER COUNTS
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  TIER BREAKDOWN");
  console.log("================================================================\n");
  console.log(`  Tier A (80-110 pts) — GREAT content, SHOULD show:  ${tierA.length}`);
  console.log(`  Tier B (50-79 pts)  — Decent, CONSIDER showing:    ${tierB.length}`);
  console.log(`  Tier C (20-49 pts)  — Thin content, KEEP HIDDEN:   ${tierC.length}`);
  console.log(`  Tier D (0-19 pts)   — Garbage, KEEP HIDDEN:        ${tierD.length}`);
  console.log(`  ─────────────────────────────────────────────────`);
  console.log(`  TOTAL:                                             ${scored.length}`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════
  //  TIER A — Top 20
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  TIER A — Great content, just needs photos (first 20)");
  console.log("================================================================\n");
  if (tierA.length === 0) {
    console.log("  (none)\n");
  } else {
    const showA = tierA.slice(0, 20);
    for (let i = 0; i < showA.length; i++) {
      const { cls, score, breakdown } = showA[i];
      console.log(`  ${i + 1}. [${score} pts] ${cls.name}`);
      console.log(`     Category:     ${cls.category || "(none)"}`);
      console.log(`     Vibe line:    ${(cls.vibe_line || "(none)").slice(0, 80)}`);
      console.log(`     Rating:       ${cls.google_rating ?? "n/a"} (${cls.review_count ?? 0} reviews)`);
      console.log(`     Scoring:      ${breakdown.join(", ")}`);
      console.log();
    }
    if (tierA.length > 20) {
      console.log(`  ... and ${tierA.length - 20} more Tier A listings.\n`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  TIER B — Top 15
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  TIER B — Decent content, consider showing (first 15)");
  console.log("================================================================\n");
  if (tierB.length === 0) {
    console.log("  (none)\n");
  } else {
    const showB = tierB.slice(0, 15);
    for (let i = 0; i < showB.length; i++) {
      const { cls, score, breakdown } = showB[i];
      console.log(`  ${i + 1}. [${score} pts] ${cls.name}`);
      console.log(`     Category:     ${cls.category || "(none)"}`);
      console.log(`     Vibe line:    ${(cls.vibe_line || "(none)").slice(0, 80)}`);
      console.log(`     Scoring:      ${breakdown.join(", ")}`);
      console.log();
    }
    if (tierB.length > 15) {
      console.log(`  ... and ${tierB.length - 15} more Tier B listings.\n`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  SUMMARY STATS
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  SUMMARY STATISTICS");
  console.log("================================================================\n");

  const scores = scored.map((s) => s.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sortedScores = [...scores].sort((a, b) => a - b);
  const median = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];

  const withGoodVibeLine = scored.filter((s) => {
    const vl = (s.cls.vibe_line || "").trim();
    return vl.length > 0 && !isGenericVibeLine(vl);
  }).length;

  const withRating = scored.filter((s) => s.cls.google_rating != null && s.cls.google_rating > 0).length;
  const withHighRating = scored.filter((s) => s.cls.google_rating != null && s.cls.google_rating >= 4.0).length;
  const withReviews = scored.filter((s) => s.cls.review_count != null && s.cls.review_count >= 5).length;
  const withAgeRange = scored.filter((s) => s.cls.age_min != null && s.cls.age_max != null).length;
  const withDescription = scored.filter((s) => (s.cls.description || "").trim().length > 100).length;
  const withSummary = scored.filter((s) => (s.cls.summary || "").trim().length > 0).length;
  const withLegitCategory = scored.filter((s) => isLegitChildCategory(s.cls.category)).length;

  console.log(`  Total photo-hidden listings:   ${scored.length}`);
  console.log(`  Average content score:         ${avg.toFixed(1)} / 110`);
  console.log(`  Median content score:          ${median} / 110`);
  console.log(`  Min score:                     ${sortedScores[0]}`);
  console.log(`  Max score:                     ${sortedScores[sortedScores.length - 1]}`);
  console.log();
  console.log(`  With good vibe_line:           ${withGoodVibeLine} (${(withGoodVibeLine / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With description > 100ch:      ${withDescription} (${(withDescription / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With summary:                  ${withSummary} (${(withSummary / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With age range set:            ${withAgeRange} (${(withAgeRange / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With any Google rating:        ${withRating} (${(withRating / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With rating >= 4.0:            ${withHighRating} (${(withHighRating / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With review_count >= 5:        ${withReviews} (${(withReviews / scored.length * 100).toFixed(1)}%)`);
  console.log(`  With legit child category:     ${withLegitCategory} (${(withLegitCategory / scored.length * 100).toFixed(1)}%)`);
  console.log();

  // ═══════════════════════════════════════════════════════════════════
  //  OVERLAP ANALYSIS — "Photo-only" vs "would have been hidden anyway"
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  OVERLAP ANALYSIS — Photo-only vs other cull criteria");
  console.log("================================================================\n");

  let hitByLayer1 = 0;
  let hitByLayer2NonPhoto = 0;
  let hitByLayer3 = 0;
  let photoOnlyCount = 0;
  const photoOnlyListings = [];
  const otherReasonCounts = {};

  for (const { cls, score } of scored) {
    const otherReasons = [];

    // Check Layer 1: category kill
    if (failsLayer1(cls)) {
      hitByLayer1++;
      otherReasons.push(`L1: killed category "${cls.category}"`);
    }

    // Check Layer 2 (minus photo): content quality
    const l2reasons = failsLayer2_ExceptPhoto(cls);
    if (l2reasons) {
      hitByLayer2NonPhoto++;
      for (const r of l2reasons) {
        otherReasons.push(`L2: ${r}`);
      }
    }

    // Check Layer 3: enrichment integrity
    const l3reasons = failsLayer3(cls);
    if (l3reasons) {
      hitByLayer3++;
      for (const r of l3reasons) {
        otherReasons.push(`L3: ${r}`);
      }
    }

    if (otherReasons.length === 0) {
      photoOnlyCount++;
      photoOnlyListings.push({ cls, score });
    }

    for (const r of otherReasons) {
      const key = r.startsWith("L1:") ? "L1: killed category" : r;
      otherReasonCounts[key] = (otherReasonCounts[key] || 0) + 1;
    }
  }

  console.log(`  Also flagged by Layer 1 (category kill):          ${hitByLayer1}`);
  console.log(`  Also flagged by Layer 2 (non-photo content):      ${hitByLayer2NonPhoto}`);
  console.log(`  Also flagged by Layer 3 (enrichment integrity):   ${hitByLayer3}`);
  console.log();
  console.log(`  ┌─────────────────────────────────────────────────────────┐`);
  console.log(`  │  PHOTO-ONLY count (only problem is the photo):  ${String(photoOnlyCount).padStart(5)} │`);
  console.log(`  │  Would have been hidden ANYWAY (other issues):  ${String(scored.length - photoOnlyCount).padStart(5)} │`);
  console.log(`  └─────────────────────────────────────────────────────────┘`);
  console.log();

  // Breakdown of "other" reasons
  console.log("  Other cull reasons found in this set:");
  const sortedReasons = Object.entries(otherReasonCounts).sort((a, b) => b[1] - a[1]);
  for (const [reason, count] of sortedReasons) {
    console.log(`    ${reason}: ${count}`);
  }
  console.log();

  // ═══════════════════════════════════════════════════════════════════
  //  PHOTO-ONLY LISTINGS — by tier
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  PHOTO-ONLY LISTINGS — by tier");
  console.log("  (These are the REAL opportunities — great content, only");
  console.log("   problem is the Google Places photo)");
  console.log("================================================================\n");

  const poTierA = photoOnlyListings.filter((s) => s.score >= 80);
  const poTierB = photoOnlyListings.filter((s) => s.score >= 50 && s.score < 80);
  const poTierC = photoOnlyListings.filter((s) => s.score >= 20 && s.score < 50);
  const poTierD = photoOnlyListings.filter((s) => s.score < 20);

  console.log(`  Photo-only Tier A:  ${poTierA.length}  ← These are your goldmine`);
  console.log(`  Photo-only Tier B:  ${poTierB.length}  ← Worth showing with placeholder`);
  console.log(`  Photo-only Tier C:  ${poTierC.length}  ← Thin even ignoring photo`);
  console.log(`  Photo-only Tier D:  ${poTierD.length}  ← Not worth it`);
  console.log();

  if (poTierA.length > 0) {
    console.log("  ── Photo-only Tier A (first 15) ──");
    for (let i = 0; i < Math.min(poTierA.length, 15); i++) {
      const { cls, score } = poTierA[i];
      console.log(`  ${i + 1}. [${score} pts] ${cls.name}`);
      console.log(`     Category: ${cls.category || "(none)"} | Rating: ${cls.google_rating ?? "n/a"} (${cls.review_count ?? 0} reviews)`);
      console.log(`     Vibe: ${(cls.vibe_line || "(none)").slice(0, 90)}`);
      console.log();
    }
    if (poTierA.length > 15) {
      console.log(`  ... and ${poTierA.length - 15} more photo-only Tier A listings.\n`);
    }
  }

  if (poTierB.length > 0) {
    console.log("  ── Photo-only Tier B (first 10) ──");
    for (let i = 0; i < Math.min(poTierB.length, 10); i++) {
      const { cls, score } = poTierB[i];
      console.log(`  ${i + 1}. [${score} pts] ${cls.name}`);
      console.log(`     Category: ${cls.category || "(none)"} | Vibe: ${(cls.vibe_line || "(none)").slice(0, 80)}`);
      console.log();
    }
    if (poTierB.length > 10) {
      console.log(`  ... and ${poTierB.length - 10} more photo-only Tier B listings.\n`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  FINAL RECOMMENDATION
  // ═══════════════════════════════════════════════════════════════════
  console.log("================================================================");
  console.log("  RECOMMENDATION");
  console.log("================================================================\n");

  const rescuable = poTierA.length + poTierB.length;
  console.log(`  Of ${scored.length} photo-hidden listings:`);
  console.log(`    ${scored.length - photoOnlyCount} would have been hidden ANYWAY (other quality issues)`);
  console.log(`    ${photoOnlyCount} were hidden ONLY because of the photo`);
  console.log(`    ${rescuable} of those have good enough content to rescue (Tier A + B)`);
  console.log();
  console.log(`  ACTION: Un-hide the ${poTierA.length} Tier A photo-only listings and`);
  console.log(`  assign them a placeholder photo or fetch a real one.`);
  if (poTierB.length > 0) {
    console.log(`  CONSIDER: Un-hide the ${poTierB.length} Tier B photo-only listings too,`);
    console.log(`  possibly with a generic category placeholder image.`);
  }
  console.log();
  console.log("================================================================\n");
}

run().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
