/**
 * Update content_sources for each enriched class.
 * Stores a JSON object in `discovered_from` with per-section source attribution.
 *
 * Schema:
 * {
 *   "description": ["abrakadoodle.com.sg", "Tumbo editorial"],
 *   "reviews": ["abrakadoodle.com.sg"],
 *   "child_profile": ["Tumbo editorial"],
 *   "outcomes": ["Tumbo editorial"],
 *   "vibe_line": ["Tumbo editorial"],
 *   "price": ["abrakadoodle.com.sg"],
 *   "age_range": ["abrakadoodle.com.sg"]
 * }
 *
 * Run: node scripts/update-sources.js
 */
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(
  "https://eygsipxgzszwyzemevji.supabase.co",
  "sb_publishable_Itlh6Q0Zz0KGRkJT2yzOEQ_CEmAxTRI"
);

const EDITORIAL = "Tumbo editorial";

// ── Source map: classId → per-field sources ──
// Only real, scraped sources are listed. Everything else defaults to "Tumbo editorial".
const SOURCES = {
  // ABRAKADOODLE — Doodlers (Orchard)
  "6be1d7a2-869f-4bec-afdd-3e827328767f": {
    description: ["abrakadoodle.com.sg"],
    reviews: ["abrakadoodle.com.sg"],
    price: ["abrakadoodle.com.sg"],
    age_range: ["abrakadoodle.com.sg"],
    photo: ["abrakadoodle.com.sg"],
  },

  // ABRAKADOODLE — Twoosy Doodlers (Jurong East)
  "09832421-b976-4cc0-ad36-064f59b2aeef": {
    description: ["abrakadoodle.com.sg"],
    reviews: ["abrakadoodle.com.sg"],
    price: ["abrakadoodle.com.sg"],
    age_range: ["abrakadoodle.com.sg"],
    photo: ["abrakadoodle.com.sg"],
  },

  // ACHIEVERS ARTS — Regular Art Classes
  "5b27dad3-88d0-4d97-ae90-8b81c64cc748": {
    description: ["achieversarts.com"],
  },

  // ACHIEVERS ARTS — Short Courses
  "cfca630c-4f30-4b68-bf82-8774f92d7388": {
    description: ["achieversarts.com"],
  },

  // ACADEMY OF ROCK
  "af4bedb6-c67c-467b-9717-973227a3f5d8": {
    description: ["Skoolopedia", "academyofrock.com.sg"],
    age_range: ["academyofrock.com.sg"],
  },

  // ABLE AQUATIC
  "93c81970-7478-4168-a595-0ab1a6279bce": {
    description: ["Skoolopedia"],
  },

  // ACE DOLPHIN SWIM SCHOOL
  "c5f8bfeb-a1ab-443c-9190-5d5155da8c12": {
    description: ["Skoolopedia"],
  },

  // AQUA DUCKS
  "a2ebbd5b-fde7-4b7e-a7da-863296c3e0bc": {
    description: ["Skoolopedia"],
    age_range: ["Skoolopedia"],
  },

  // ABC COOKING STUDIO
  "c470eeb4-29e0-416f-aca4-b6c389384413": {
    description: ["abc-cooking.com.sg"],
  },

  // ALHAMBRA BELLYDANCE
  "f4c39678-e583-4682-83dc-8cf2cbe15749": {
    description: ["alhambrabellydance.com"],
    price: ["alhambrabellydance.com"],
  },

  // 21 DANCING DAYS
  "328d743d-8af7-499c-acd4-f76ee8f622ac": {
    description: ["Instagram @21_dancingdays"],
  },

  // BRIGHTNOTES — Montessori & Suzuki Piano
  "f7014a75-51a7-4351-912b-9ef3e6c8b36d": {
    description: ["brightnotessg.blogspot.com"],
    age_range: ["brightnotessg.blogspot.com"],
  },

  // 3HOUSE — English
  "d82ca4c6-4c0d-454a-b148-daa1804a4b9b": {
    description: ["Skoolopedia", "3houselearning.com"],
  },

  // 3HOUSE — Chinese
  "6a94db7c-13ed-49b1-b85b-3f67ebfc2f3d": {
    description: ["Skoolopedia", "3houselearning.com"],
  },

  // 3HOUSE — Mathematics
  "94661346-2411-44b6-ac34-5e617b185c05": {
    description: ["Skoolopedia", "3houselearning.com"],
  },

  // ARTSZ BAKING
  "37bc03c0-8b20-4da3-bea6-8fbe35bf9296": {
    description: ["artzbakingculinary.com"],
  },

  // A2G MUSIC — Instrumental
  "275df0f2-cd5c-4b48-9247-0c71e5b426e3": {
    description: ["Skoolopedia"],
  },

  // A2G MUSIC — Rhythm & Movement
  "40cfd4bc-d3e6-406b-b7c1-464085aa7472": {
    description: ["Skoolopedia"],
  },

  // AGAPE MUSIC SCHOOL
  "f62f639a-4991-40b3-969f-57ded8baeef4": {
    description: ["Skoolopedia"],
  },

  // APS SWIM SCHOOL
  "b99804d9-67db-4f36-9e13-4ced75b04165": {
    description: ["Skoolopedia"],
  },

  // ARTSTRATOSPHERE MUSIC
  "ca7681da-9580-43f8-96c1-e796048757f0": {
    description: ["Skoolopedia"],
  },

  // ABSOLUTE LEARNING — Chinese
  "a59da4a9-c204-4b60-ad63-9344cc3f5cbf": {
    description: ["Skoolopedia"],
  },

  // ABSOLUTE LEARNING — Mathematics
  "c87eb7b6-3d47-409b-8d3b-194e040422e5": {
    description: ["Skoolopedia"],
  },

  // ACE SCORERS
  "b75639a3-227f-4045-8457-7f4c538400d9": {
    description: ["Skoolopedia"],
  },
};

async function run() {
  let ok = 0;
  let fail = 0;

  for (const [classId, realSources] of Object.entries(SOURCES)) {
    // Build complete source map: real sources + Tumbo editorial for derived fields
    const fullSources = {
      description: [...(realSources.description || []), EDITORIAL],
      reviews: realSources.reviews || null, // null = no reviews, don't show section
      child_profile: [EDITORIAL],
      outcomes: [EDITORIAL],
      vibe_line: [EDITORIAL],
      price: realSources.price || null,
      age_range: realSources.age_range || null,
      photo: realSources.photo || null,
    };

    const { error } = await sb
      .from("classes")
      .update({ discovered_from: JSON.stringify(fullSources) })
      .eq("id", classId);

    if (error) {
      console.log(`FAIL: ${classId} — ${error.message}`);
      fail++;
    } else {
      ok++;
    }
  }

  console.log(`Updated ${ok} classes with source metadata (${fail} failed)`);
}

run().catch(console.error);
