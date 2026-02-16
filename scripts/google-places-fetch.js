/**
 * Google Places Enrichment — Full Pipeline
 * ══════════════════════════════════════════
 * Fetches real data from Google Places API (New) for ALL providers,
 * then pushes addresses, ratings, reviews, and photos to classes.
 *
 * Cost for ~861 providers (~$49, within $200/mo free tier):
 *   Text Search:    861 × $0.032 = $27.55
 *   Place Details:  861 × $0.025 = $21.53
 * See docs/COST_AND_API_RULES.md for red flags and no recurring runs.
 *
 * Run: node scripts/google-places-fetch.js
 */

const { createClient } = require("@supabase/supabase-js");
const { assignAllReviews } = require("./lib/review-parser");
require("dotenv").config({ path: ".env.local" });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error("ERROR: Set GOOGLE_PLACES_API_KEY in .env.local");
  process.exit(1);
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Rate limiting ──
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Google Places API (New) — Text Search ──
async function searchPlace(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber",
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: 1.3521, longitude: 103.8198 },
          radius: 50000.0,
        },
      },
      maxResultCount: 1,
      languageCode: "en",
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.places?.[0] || null;
}

// ── Google Places API (New) — Place Details (reviews + photos) ──
async function getPlaceDetails(placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,rating,userRatingCount,reviews,photos,websiteUri,nationalPhoneNumber",
    },
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

// ── Photo URL from photo reference ──
function photoUrl(photoName, maxWidth = 800) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;
}

// ══════════════════════════════════════════
// ── MAIN PIPELINE ──
// ══════════════════════════════════════════
async function run() {
  const startTime = Date.now();
  console.log("══════════════════════════════════════════");
  console.log("  Google Places Enrichment Pipeline");
  console.log("══════════════════════════════════════════\n");

  // 1. Load all enriched classes grouped by provider
  const { data: classes } = await sb
    .from("classes")
    .select("id, name, provider_id, category, age_min, age_max, photo_url, discovered_from")
    .eq("is_placeholder", false);

  const providerIds = [...new Set(classes.map((c) => c.provider_id).filter(Boolean))];
  const classesByProvider = new Map();
  for (const cls of classes) {
    if (!cls.provider_id) continue;
    if (!classesByProvider.has(cls.provider_id)) classesByProvider.set(cls.provider_id, []);
    classesByProvider.get(cls.provider_id).push(cls);
  }

  // 2. Load providers (batch in chunks of 200 to avoid query limits)
  let providers = [];
  for (let i = 0; i < providerIds.length; i += 200) {
    const batch = providerIds.slice(i, i + 200);
    const { data } = await sb
      .from("providers")
      .select("id, name, google_maps_query, street_address, classes_scrape_source")
      .in("id", batch);
    if (data) providers = providers.concat(data);
  }

  // Skip providers already fetched (resume-safe)
  const todo = providers.filter((p) => {
    if (!p.classes_scrape_source) return true;
    try {
      const existing = JSON.parse(p.classes_scrape_source);
      return !existing.google_place_id; // Re-fetch if no place ID
    } catch {
      return true;
    }
  });

  const alreadyDone = providers.length - todo.length;
  console.log(`Providers total: ${providers.length}`);
  console.log(`Already fetched: ${alreadyDone}`);
  console.log(`To fetch: ${todo.length}`);
  console.log(`Estimated cost: ~$${((todo.length * 0.032) + (todo.length * 0.025)).toFixed(2)}`);
  console.log(`Estimated time: ~${Math.ceil(todo.length * 0.8 / 60)} minutes\n`);

  let success = 0, fail = 0, noResult = 0;
  let reviewsAssigned = 0, reviewsUnassigned = 0, photosUpdated = 0, addressesUpdated = 0;

  for (let i = 0; i < todo.length; i++) {
    const provider = todo[i];
    const searchQuery = `${provider.name} Singapore`;
    const providerClasses = classesByProvider.get(provider.id) || [];

    // Progress every 25
    if (i > 0 && i % 25 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = i / elapsed;
      const remaining = Math.ceil((todo.length - i) / rate / 60);
      console.log(`\n── Progress: ${i}/${todo.length} (${success} ok, ${fail} err, ${noResult} not found) ~${remaining}min left ──\n`);
    }

    try {
      // Step 1: Text Search
      const place = await searchPlace(searchQuery);
      if (!place) {
        noResult++;
        continue;
      }

      // Step 2: Place Details (reviews + photos)
      const details = await getPlaceDetails(place.id);

      const googleAddress = details.formattedAddress || place.formattedAddress || null;
      const googleRating = details.rating || place.rating || null;
      const googleReviewCount = details.userRatingCount || place.userRatingCount || 0;
      const googleWebsite = details.websiteUri || null;
      const googlePhone = details.nationalPhoneNumber || null;

      // Extract reviews
      const googleReviews = (details.reviews || []).map((r) => ({
        author: r.authorAttribution?.displayName || "Anonymous",
        text: r.text?.text || "",
        rating: r.rating || 0,
        time: r.publishTime || null,
      }));

      // Extract photos (up to 5)
      const googlePhotos = (details.photos || []).slice(0, 5).map((p) => photoUrl(p.name));

      // Step 3: Store raw Google data on provider
      const googleData = {
        google_place_id: place.id,
        google_rating: googleRating,
        google_review_count: googleReviewCount,
        google_reviews_raw: googleReviews,
        google_photos: googlePhotos,
        google_address: googleAddress,
        google_website: googleWebsite,
        google_phone: googlePhone,
        fetched_at: new Date().toISOString(),
      };

      await sb
        .from("providers")
        .update({ classes_scrape_source: JSON.stringify(googleData) })
        .eq("id", provider.id);

      // Step 4: Update each class under this provider
      for (const cls of providerClasses) {
        const updates = {};

        // Address: update if class has none
        if (!cls.location && googleAddress) {
          updates.location = googleAddress;
          addressesUpdated++;
        }

        // Rating: always update from Google
        if (googleRating) {
          updates.google_rating = googleRating;
          updates.review_count = googleReviewCount;
        }

        // Photo: replace Unsplash stock with Google photo
        if (cls.photo_url?.includes("unsplash.com") && googlePhotos.length > 0) {
          const idx = providerClasses.indexOf(cls) % googlePhotos.length;
          updates.photo_url = googlePhotos[idx];
          photosUpdated++;
        }

        // Source attribution
        try {
          const sources = cls.discovered_from ? JSON.parse(cls.discovered_from) : {};
          if (!sources.reviews) sources.reviews = [];
          if (!sources.reviews.includes("Google")) sources.reviews.push("Google");
          if (!sources.photo) sources.photo = [];
          if (updates.photo_url && !sources.photo.includes("Google")) sources.photo.push("Google");
          if (!sources.address) sources.address = [];
          if (updates.location && !sources.address.includes("Google")) sources.address.push("Google");
          updates.discovered_from = JSON.stringify(sources);
        } catch {}

        if (Object.keys(updates).length > 0) {
          await sb.from("classes").update(updates).eq("id", cls.id);
        }
      }

      // Step 5: Assign reviews to classes
      if (googleReviews.length > 0 && providerClasses.length > 0) {
        const { assigned, unassigned } = assignAllReviews(googleReviews, providerClasses);

        for (const [classId, classReviews] of assigned) {
          if (classReviews.length === 0) continue;
          const reviewsForDb = classReviews.map((r) => ({
            author: r.author,
            text: r.text,
            rating: r.rating,
          }));
          await sb.from("classes").update({ raw_reviews: JSON.stringify(reviewsForDb) }).eq("id", classId);
          reviewsAssigned += classReviews.length;
        }
        reviewsUnassigned += unassigned.length;
      }

      success++;
      // Compact log
      const stars = googleRating ? `${googleRating}★` : "no rating";
      const revs = googleReviews.length;
      const photos = googlePhotos.length;
      process.stdout.write(`  ✓ ${provider.name.substring(0, 40).padEnd(42)} ${stars.padEnd(12)} ${revs}r ${photos}p\n`);

      // Rate limit: 500ms between requests
      await delay(500);
    } catch (err) {
      process.stdout.write(`  ✗ ${provider.name.substring(0, 40).padEnd(42)} ${err.message.substring(0, 40)}\n`);
      fail++;
      await delay(1000); // Back off on errors
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Providers found:     ${success}`);
  console.log(`  Providers not found: ${noResult}`);
  console.log(`  Errors:              ${fail}`);
  console.log(`  Addresses updated:   ${addressesUpdated}`);
  console.log(`  Photos updated:      ${photosUpdated}`);
  console.log(`  Reviews → classes:   ${reviewsAssigned}`);
  console.log(`  Reviews unassigned:  ${reviewsUnassigned}`);
  console.log(`  Time:                ${elapsed} minutes`);
  console.log(`  Est. cost:           ~$${((success * 0.057)).toFixed(2)}`);
  console.log("══════════════════════════════════════════\n");
}

run().catch(console.error);
