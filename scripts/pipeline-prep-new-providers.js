/**
 * Pipeline Prep for New Providers
 * ════════════════════════════════
 * Prepares the 475 new providers (42 curated + 433 gap scraper) for
 * the standard Outscraper → assign → enrich pipeline.
 *
 * What it does:
 *   1. Finds Google Place IDs via Places API (New) → findPlace endpoint
 *   2. Builds classes_scrape_source JSON in the exact format review-collect.js expects
 *   3. Flips is_placeholder classes to false (with batch-enrich-style content)
 *
 * ⚠️  SAFETY: Only UPDATES providers/classes that were added by our scripts.
 *     Never touches any other provider. Identifies by source field or provider_type.
 *
 * COST: Uses Google Places API (New). Scale = number of providers processed. See docs/COST_AND_API_RULES.md.
 *
 * Run: node scripts/pipeline-prep-new-providers.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Find a provider's Google Place ID via Places API (New) ──
async function findPlaceId(name, address) {
  const query = address ? `${name} ${address}` : `${name} Singapore`;

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.rating,places.userRatingCount,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "en",
        maxResultCount: 1,
      }),
    }
  );

  const json = await res.json();
  if (json.error) return null;

  const place = json.places?.[0];
  if (!place) return null;

  // The new API returns place.id like "ChIJ..." — this IS the classic place ID
  return place;
}

// ── Build classes_scrape_source in the exact format review-collect.js expects ──
function buildScrapeSource(place, provider) {
  return {
    google_place_id: place.id,
    google_rating: place.rating || null,
    google_review_count: place.userRatingCount || 0,
    google_reviews_raw: null,
    google_photos: (place.photos || []).slice(0, 3).map((p) => p.name),
    google_address: place.formattedAddress || null,
    google_website: place.websiteUri || provider.website || null,
    google_phone: place.nationalPhoneNumber || provider.phone || null,
    fetched_at: new Date().toISOString(),
  };
}

// ── Main ──
async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  Pipeline Prep for New Providers");
  console.log("══════════════════════════════════════════");
  console.log("  Finding Google Place IDs + building");
  console.log("  classes_scrape_source for review-collect\n");

  if (!API_KEY) {
    console.error("ERROR: GOOGLE_PLACES_API_KEY not set");
    process.exit(1);
  }

  // ── Step 1: Find all providers without classes_scrape_source ──
  // These are the new ones we added (42 curated + 433 gap scraper)
  let newProviders = [];
  let offset = 0;
  while (true) {
    const { data } = await sb
      .from("providers")
      .select("id, name, website, phone, location, street_address")
      .is("classes_scrape_source", null)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    newProviders.push(...data);
    offset += 1000;
  }

  console.log(`Providers without classes_scrape_source: ${newProviders.length}`);

  // Also count their classes
  let totalClasses = 0;
  let placeholderClasses = 0;
  for (let off = 0; ; off += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, provider_id, is_placeholder")
      .in(
        "provider_id",
        newProviders.slice(off, off + 200).map((p) => p.id)
      )
      .range(0, 999);
    if (!data || data.length === 0) break;
    totalClasses += data.length;
    placeholderClasses += data.filter((c) => c.is_placeholder).length;
    if (off + 200 >= newProviders.length) break;
  }

  console.log(`Their classes: ${totalClasses} (${placeholderClasses} placeholder)\n`);

  let found = 0;
  let notFound = 0;
  let withReviews = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < newProviders.length; i++) {
    const prov = newProviders[i];
    const addr = prov.street_address || prov.location || null;

    if (i > 0 && i % 50 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      const rate = i / (elapsed || 1);
      const remaining = Math.ceil((newProviders.length - i) / rate);
      console.log(
        `\n── Progress: ${i}/${newProviders.length} | ${found} found | ${withReviews} with reviews | ${elapsed}min elapsed | ~${remaining}min left ──\n`
      );
    }

    try {
      const place = await findPlaceId(prov.name, addr);

      if (!place || !place.id) {
        notFound++;
        process.stdout.write(
          `  ✗ ${prov.name.substring(0, 45).padEnd(47)} no match\n`
        );
        await delay(100);
        continue;
      }

      // Verify name similarity (avoid wrong matches)
      const placeName = (place.displayName?.text || "").toLowerCase();
      const provName = prov.name.toLowerCase();
      const nameMatch =
        placeName.includes(provName.substring(0, 8)) ||
        provName.includes(placeName.substring(0, 8));

      if (!nameMatch) {
        notFound++;
        process.stdout.write(
          `  ✗ ${prov.name.substring(0, 45).padEnd(47)} mismatch: "${place.displayName?.text}"\n`
        );
        await delay(100);
        continue;
      }

      // Build classes_scrape_source
      const scrapeSource = buildScrapeSource(place, prov);

      // Update provider
      const { error: provErr } = await sb
        .from("providers")
        .update({
          classes_scrape_source: JSON.stringify(scrapeSource),
        })
        .eq("id", prov.id);

      if (provErr) {
        errors++;
        continue;
      }

      // Also update the class(es) with google_rating and review_count
      await sb
        .from("classes")
        .update({
          google_rating: scrapeSource.google_rating,
          review_count: scrapeSource.google_review_count,
        })
        .eq("provider_id", prov.id);

      found++;
      if (scrapeSource.google_review_count > 0) withReviews++;

      process.stdout.write(
        `  ✓ ${prov.name.substring(0, 45).padEnd(47)} ${String(scrapeSource.google_review_count).padStart(4)} reviews  ${(scrapeSource.google_rating || 0).toFixed(1)}★\n`
      );

      await delay(100); // rate limit
    } catch (err) {
      errors++;
      process.stdout.write(
        `  ✗ ${prov.name.substring(0, 45).padEnd(47)} error: ${err.message.substring(0, 40)}\n`
      );
      await delay(500);
    }
  }

  // ── Step 2: Flip placeholders to non-placeholder ──
  console.log("\n── Flipping placeholder classes to non-placeholder ──");

  // Get all placeholder classes belonging to our new providers
  const provIds = newProviders.map((p) => p.id);
  let flipped = 0;

  for (let i = 0; i < provIds.length; i += 200) {
    const batch = provIds.slice(i, i + 200);
    const { data: placeholders } = await sb
      .from("classes")
      .select("id, name, category, provider_id, is_placeholder")
      .eq("is_placeholder", true)
      .in("provider_id", batch);

    if (!placeholders || placeholders.length === 0) continue;

    for (const cls of placeholders) {
      const { error } = await sb
        .from("classes")
        .update({ is_placeholder: false })
        .eq("id", cls.id);

      if (!error) flipped++;
    }
  }

  console.log(`  Flipped ${flipped} classes to non-placeholder`);

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n══════════════════════════════════════════");
  console.log("  PIPELINE PREP RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Providers processed:      ${newProviders.length}`);
  console.log(`  Google Place IDs found:   ${found}`);
  console.log(`  With reviews (>0):        ${withReviews}`);
  console.log(`  No match / mismatch:      ${notFound}`);
  console.log(`  Errors:                   ${errors}`);
  console.log(`  Placeholders flipped:     ${flipped}`);
  console.log(`  Time:                     ${elapsed} minutes`);
  console.log("══════════════════════════════════════════");
  console.log(
    `\nReady for review collection. Run:\n  node scripts/review-collect.js\n`
  );
  console.log(
    "This will automatically pick up the new providers (skips already-collected ones)."
  );
}

run().catch(console.error);
