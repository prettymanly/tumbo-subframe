/**
 * Targeted Gap Scraper — INSERT ONLY
 * ════════════════════════════════════
 * Adds NEW providers + placeholder classes for categories
 * missing from the database. Uses Google Places API (New).
 *
 * ⚠️  SAFETY: This script ONLY inserts. It will NEVER update
 *    or delete any existing row. Robust dedup against the
 *    4,160 existing providers prevents duplicates.
 *
 * COST: Uses Google Places API (New). Scale = number of searches × details. See docs/COST_AND_API_RULES.md.
 *
 * Run: node scripts/targeted-gap-scraper.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════
// Targeted searches — query + Tumbo category
// ═══════════════════════════════════════════
const SEARCHES = [
  // ── Religious Education ──
  { q: "islamic school children singapore", cat: "Religious Education" },
  { q: "quran class kids singapore", cat: "Religious Education" },
  { q: "mengaji class singapore", cat: "Religious Education" },
  { q: "madrasah singapore", cat: "Religious Education" },
  { q: "islamic enrichment singapore", cat: "Religious Education" },
  { q: "agama class singapore", cat: "Religious Education" },
  { q: "catholic school enrichment singapore", cat: "Religious Education" },
  { q: "sunday school kids singapore", cat: "Religious Education" },
  { q: "christian education children singapore", cat: "Religious Education" },
  { q: "church kids programme singapore", cat: "Religious Education" },
  { q: "bible class children singapore", cat: "Religious Education" },
  { q: "hindu religious class children singapore", cat: "Religious Education" },
  { q: "buddhist education children singapore", cat: "Religious Education" },

  // ── Malay Language ──
  { q: "malay language class children singapore", cat: "Malay" },
  { q: "bahasa melayu tuition singapore", cat: "Malay" },
  { q: "malay tuition centre singapore", cat: "Malay" },
  { q: "malay enrichment centre singapore", cat: "Malay" },

  // ── Football Academies ──
  { q: "F17 academy singapore football", cat: "Football" },
  { q: "fandi ahmad football singapore", cat: "Football" },
  { q: "barcelona football academy singapore", cat: "Football" },
  { q: "FCB escola singapore", cat: "Football" },
  { q: "JSSL arsenal singapore", cat: "Football" },
  { q: "arsenal soccer school singapore", cat: "Football" },
  { q: "ActiveSG football academy singapore", cat: "Football" },
  { q: "football academy kids singapore", cat: "Football" },
  { q: "soccer school children singapore", cat: "Football" },
  { q: "youth football training singapore", cat: "Football" },
  { q: "goals soccer centre singapore", cat: "Football" },
  { q: "lion city sailors youth singapore", cat: "Football" },

  // ── Coding & Robotics ──
  { q: "coding class kids singapore", cat: "Coding" },
  { q: "robotics class children singapore", cat: "Coding" },
  { q: "scratch programming kids singapore", cat: "Coding" },
  { q: "STEM enrichment kids singapore", cat: "Coding" },
  { q: "Lego robotics children singapore", cat: "Coding" },
  { q: "saturday kids coding singapore", cat: "Coding" },
  { q: "first code academy singapore", cat: "Coding" },

  // ── Additional Sports ──
  { q: "tennis academy kids singapore", cat: "Sports" },
  { q: "badminton coaching children singapore", cat: "Sports" },
  { q: "table tennis class kids singapore", cat: "Sports" },
  { q: "fencing class children singapore", cat: "Sports" },
  { q: "archery class kids singapore", cat: "Sports" },
  { q: "golf lessons children singapore", cat: "Sports" },
  { q: "rugby kids singapore", cat: "Sports" },
  { q: "basketball academy children singapore", cat: "Sports" },
  { q: "ice skating class children singapore", cat: "Sports" },
  { q: "inline skating kids singapore", cat: "Sports" },

  // ── Creative & Niche ──
  { q: "pottery class kids singapore", cat: "Art" },
  { q: "ceramics class children singapore", cat: "Art" },
  { q: "photography class kids singapore", cat: "Art" },
  { q: "sewing class children singapore", cat: "Art" },
  { q: "animation class children singapore", cat: "Art" },

  // ── Languages (Tamil, Hindi, etc.) ──
  { q: "tamil tuition children singapore", cat: "Languages" },
  { q: "hindi class kids singapore", cat: "Languages" },
  { q: "japanese language children singapore", cat: "Languages" },
  { q: "korean language kids singapore", cat: "Languages" },
  { q: "french class children singapore", cat: "Languages" },

  // ── Well-known Singapore providers ──
  { q: "Julia Gabriel Centre singapore", cat: "Drama" },
  { q: "The Learning Lab singapore", cat: "Enrichment" },
  { q: "Heguru Method singapore", cat: "Enrichment" },
  { q: "Shichida Method singapore", cat: "Enrichment" },
  { q: "MindChamps singapore", cat: "Enrichment" },
  { q: "Kumon centre singapore", cat: "Mathematics" },
  { q: "Berries World of Learning singapore", cat: "Chinese" },
  { q: "Chengzhu Mandarin Centre singapore", cat: "Chinese" },
];

// ═══════════════════════════════════════════
// Google Places API (New) helpers
// ═══════════════════════════════════════════
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.types",
  "places.googleMapsUri",
  "places.location",
  "places.reviews",
].join(",");

async function searchPlaces(query) {
  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({ textQuery: query, languageCode: "en" }),
    }
  );
  const json = await res.json();
  if (json.error) {
    console.warn(`  ⚠  API error: ${json.error.message}`);
    return [];
  }
  return json.places || [];
}

// ═══════════════════════════════════════════
// Robust deduplication
// ═══════════════════════════════════════════
let existingNames = []; // normalised names
let existingNamesRaw = []; // raw names for substring matching

async function loadExistingProviders() {
  console.log("📦 Loading all existing providers for dedup...");
  let all = [];
  let offset = 0;
  while (true) {
    const { data } = await sb
      .from("providers")
      .select("name")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    all.push(...data);
    offset += 1000;
  }
  existingNamesRaw = all.map((p) => p.name);
  existingNames = existingNamesRaw.map(norm);
  console.log(`  ✓ Loaded ${existingNames.length} provider names\n`);
}

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(
      /\b(pte|ltd|llp|co|inc|sg|singapore|centre|center|school|academy|the)\b/gi,
      ""
    )
    .replace(/[^a-z0-9]/g, "");
}

function isDuplicate(name) {
  const n = norm(name);
  if (!n || n.length < 3) return true; // junk

  for (const existing of existingNames) {
    // exact normalised match
    if (existing === n) return true;
    // one fully contains the other (for long-enough strings)
    if (n.length > 6 && existing.length > 6) {
      if (existing.includes(n) || n.includes(existing)) return true;
    }
  }
  return false;
}

// also track names we add in THIS run to avoid self-duplication
const addedThisRun = new Set();

// ═══════════════════════════════════════════
// Main
// ═══════════════════════════════════════════
async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  Targeted Gap Scraper (INSERT-ONLY)");
  console.log("══════════════════════════════════════════");
  console.log("  ⚠️  This script will NEVER update or");
  console.log("     delete existing data.\n");

  if (!API_KEY) {
    console.error("ERROR: GOOGLE_PLACES_API_KEY not set");
    process.exit(1);
  }

  await loadExistingProviders();

  let totalHits = 0;
  let inserted = 0;
  let dupes = 0;
  let errors = 0;
  const added = [];

  for (let i = 0; i < SEARCHES.length; i++) {
    const { q, cat } = SEARCHES[i];
    process.stdout.write(
      `[${String(i + 1).padStart(2)}/${SEARCHES.length}] "${q}" … `
    );

    try {
      const places = await searchPlaces(q);
      totalHits += places.length;
      let batchNew = 0;

      for (const p of places) {
        const name = p.displayName?.text;
        if (!name) continue;

        // ── Dedup ──
        if (isDuplicate(name)) {
          dupes++;
          continue;
        }
        if (addedThisRun.has(norm(name))) {
          dupes++;
          continue;
        }

        // ── Insert provider (INSERT only) ──
        const provRow = {
          name: name,
          website: p.websiteUri || null,
          location: p.formattedAddress || null,
          street_address: p.formattedAddress || null,
          phone: p.nationalPhoneNumber || null,
          google_maps_query: p.googleMapsUri || null,
          provider_type: `{${cat}}`,
          categories_offered: `{${cat}}`,
        };

        const { data: prov, error: provErr } = await sb
          .from("providers")
          .insert(provRow)
          .select("id")
          .single();

        if (provErr) {
          // unique constraint → skip, don't error
          if (provErr.code === "23505") {
            dupes++;
            continue;
          }
          console.warn(`\n  provider insert err: ${provErr.message}`);
          errors++;
          continue;
        }

        // ── Insert placeholder class (INSERT only) ──
        const reviewTexts = (p.reviews || [])
          .slice(0, 5)
          .map((r) => ({
            text: r.text?.text || "",
            rating: r.rating,
            author: r.authorAttribution?.displayName || "",
          }));

        const classRow = {
          name: name,
          provider_id: prov.id,
          category: cat,
          location: p.formattedAddress || null,
          google_rating: p.rating || null,
          review_count: p.userRatingCount || null,
          raw_reviews:
            reviewTexts.length > 0 ? JSON.stringify(reviewTexts) : null,
          is_placeholder: true,
          source: "targeted-gap-scraper",
          discovered_from: JSON.stringify({
            source: "targeted-gap-scraper",
            query: q,
            date: new Date().toISOString(),
          }),
        };

        const { error: clsErr } = await sb.from("classes").insert(classRow);

        if (clsErr) {
          console.warn(`\n  class insert err: ${clsErr.message}`);
          errors++;
          continue;
        }

        // Track for self-dedup
        addedThisRun.add(norm(name));
        existingNames.push(norm(name));

        inserted++;
        batchNew++;
        added.push({ name, cat, rating: p.rating });

        await delay(50);
      }

      console.log(`${places.length} hits, ${batchNew} new`);
      await delay(250); // rate-limit between searches
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errors++;
      await delay(1000);
    }
  }

  // ── Summary ──
  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS (insert-only, zero updates)");
  console.log("══════════════════════════════════════════");
  console.log(`  Google Places hits:  ${totalHits}`);
  console.log(`  NEW providers added: ${inserted}`);
  console.log(`  Duplicates skipped:  ${dupes}`);
  console.log(`  Errors:              ${errors}`);

  const byCat = {};
  for (const a of added) byCat[a.cat] = (byCat[a.cat] || 0) + 1;
  console.log("\n  New classes by category:");
  Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`    ${k.padEnd(22)} ${v}`));

  console.log("\n  Sample additions:");
  added.slice(0, 15).forEach((a) =>
    console.log(
      `    ${a.name.substring(0, 45).padEnd(47)} ${a.cat.padEnd(18)} ${(a.rating || 0).toFixed(1)}★`
    )
  );

  console.log("\n══════════════════════════════════════════");
  console.log(
    `Done. ${inserted} new placeholder classes ready for enrichment.`
  );
  console.log(
    "Run  node scripts/auto-enrich-pipeline.js  when ready.\n"
  );
}

run().catch(console.error);
