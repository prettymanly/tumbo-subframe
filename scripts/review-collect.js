/**
 * review-collect.js — Outscraper stratified review collection
 * ═══════════════════════════════════════════════════════════════
 * Rules: ENGINE.md § Stage 2 Phase 1. Stratified method is MANDATORY.
 * Do not change limits or call order without updating ENGINE.md.
 *
 * Stratified (per provider, when review_count > 40):
 *   Call 1: lowest_rating, limit 10
 *   Call 2: newest, limit 15
 *   Call 3: most_relevant, limit 15
 * When review_count ≤ 40: one call, most_relevant, get ALL.
 *
 * Storage: data/outscraper/{provider_id}.json; provider.classes_scrape_source metadata.
 * Run: node scripts/review-collect.js
 * Requires: OUTSCRAPER_API_KEY in .env.local
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const API_KEY = process.env.OUTSCRAPER_API_KEY;
const DATA_DIR = path.join(__dirname, "..", "data", "outscraper");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Outscraper API call (with retries so collection does not silently fail) ──
// API expects limit=1 when query is a place ID.
const FETCH_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

async function fetchReviews(placeId, sort = "most_relevant", limit = 15) {
  const url = new URL("https://api.app.outscraper.com/maps/reviews-v3");
  url.searchParams.set("query", placeId);
  url.searchParams.set("limit", "1");
  url.searchParams.set("reviewsLimit", String(limit));
  url.searchParams.set("sort", sort);
  url.searchParams.set("language", "en");
  url.searchParams.set("async", "false");

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: { "X-API-KEY": API_KEY },
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) {
        const text = await res.text();
        console.log(`    API ${res.status}: ${text.substring(0, 200)}`);
        if (attempt < FETCH_RETRIES) { await delay(RETRY_DELAY_MS); continue; }
        return null;
      }

      const data = await res.json();
      const firstPlace = data?.data?.[0]?.[0] ?? data?.data?.[0];
      if (firstPlace?.reviews_data && firstPlace.reviews_data.length > 0) {
        return firstPlace.reviews_data;
      }
      if (data?.data?.[0] != null) {
        const place = data.data[0][0] ?? data.data[0];
        const list = place?.reviews_data;
        if (Array.isArray(list)) return list;
      }
      if (attempt < FETCH_RETRIES) {
        console.log(`    Empty response, retry ${attempt + 1}/${FETCH_RETRIES} in ${RETRY_DELAY_MS / 1000}s`);
        await delay(RETRY_DELAY_MS);
        continue;
      }
      console.log(`    Place found but no reviews_data after ${FETCH_RETRIES + 1} attempts`);
      return null;
    } catch (err) {
      console.log(`    Fetch error: ${err.message}${attempt < FETCH_RETRIES ? `; retry ${attempt + 1}/${FETCH_RETRIES}` : ""}`);
      if (attempt < FETCH_RETRIES) await delay(RETRY_DELAY_MS);
      else return null;
    }
  }
  return null;
}

// ── Deduplicate reviews by review_id or author+text ──
function deduplicateReviews(reviews) {
  const seen = new Set();
  const unique = [];
  for (const r of reviews) {
    const key = r.review_id || `${r.author_title}|${(r.review_text || "").substring(0, 50)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }
  return unique;
}

// ── Normalize Outscraper review to our format ──
function normalizeReview(r) {
  return {
    review_id: r.review_id || null,
    author: r.author_title || r.author_name || "Anonymous",
    author_reviews_count: r.author_reviews_count || null,
    text: r.review_text || "",
    rating: r.review_rating || 0,
    timestamp: r.review_timestamp || null,
    datetime: r.review_datetime_utc || null,
    likes: r.review_likes || 0,
    photos: r.review_img_urls || r.review_img_url ? [r.review_img_url || r.review_img_urls].flat().filter(Boolean) : [],
    owner_reply: r.owner_answer || null,
    owner_reply_date: r.owner_answer_timestamp_datetime_utc || null,
    source: "outscraper",
    sort_bucket: r._sort_bucket || "unknown", // which API call this came from
  };
}

// ── Main ──
async function run() {
  const testOne = process.argv.includes("--test-one");

  console.log("═══════════════════════════════════════════════════════");
  console.log(testOne ? "  OUTSCRAPER — Single provider test (no write)" : "  OUTSCRAPER REVIEW COLLECTION — Stratified Sampling");
  console.log("═══════════════════════════════════════════════════════\n");

  if (!API_KEY) {
    console.error("ERROR: Set OUTSCRAPER_API_KEY in .env.local");
    console.error("Sign up at https://outscraper.com and get your API key.");
    process.exit(1);
  }

  // Ensure data directory exists (unless test)
  if (!testOne && !fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Load all providers with Google Place IDs
  let allProviders = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("providers")
      .select("id, name, classes_scrape_source")
      .not("classes_scrape_source", "is", null)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allProviders = allProviders.concat(data);
  }

  // Parse Google data and filter to providers with reviews
  const providers = [];
  for (const p of allProviders) {
    try {
      const gd = JSON.parse(p.classes_scrape_source);
      if (gd.google_place_id && (gd.google_review_count || 0) > 0) {
        providers.push({
          id: p.id,
          name: p.name,
          place_id: gd.google_place_id,
          review_count: gd.google_review_count || 0,
          existing_scrape: gd,
        });
      }
    } catch {}
  }

  console.log(`Providers with reviews: ${providers.length}`);

  if (testOne) {
    if (providers.length === 0) {
      console.error("No providers with place_id + review_count.");
      process.exit(1);
    }
    const prov = providers[0];
    console.log(`\nTest provider: ${prov.name} (place_id: ${prov.place_id}, Google reviews: ${prov.review_count})`);
    console.log("Calling Outscraper (most_relevant, 5 reviews)...\n");
    const reviews = await fetchReviews(prov.place_id, "most_relevant", 5);
    if (reviews && reviews.length > 0) {
      console.log(`SUCCESS: got ${reviews.length} review(s). Sample:`, JSON.stringify(reviews[0], null, 2).slice(0, 500));
      process.exit(0);
    }
    console.log("No reviews returned. Check API key, credits, and place_id.");
    process.exit(1);
  }

  // Skip already-collected providers (check local files)
  const alreadyCollected = new Set();
  try {
    const files = fs.readdirSync(DATA_DIR);
    for (const f of files) {
      if (f.endsWith(".json")) alreadyCollected.add(f.replace(".json", ""));
    }
  } catch {}

  let toCollect = providers.filter((p) => !alreadyCollected.has(p.id));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  if (limitArg) {
    const n = parseInt(limitArg.split("=")[1], 10);
    if (n > 0) toCollect = toCollect.slice(0, n);
    console.log(`Limit applied: collecting ${toCollect.length} provider(s)\n`);
  }
  console.log(`Already collected: ${alreadyCollected.size}`);
  console.log(`Remaining (this run): ${toCollect.length}\n`);

  // Estimate cost
  let estReviews = 0;
  for (const p of toCollect) {
    estReviews += p.review_count <= 40 ? p.review_count : 40;
  }
  console.log(`Estimated reviews to collect: ~${estReviews}`);
  console.log(`Estimated cost: ~$${(estReviews / 1000 * 3).toFixed(2)}\n`);

  let collected = 0;
  let errors = 0;
  let totalReviews = 0;
  const startTime = Date.now();

  for (let i = 0; i < toCollect.length; i++) {
    const prov = toCollect[i];
    console.log(`[${i + 1}/${toCollect.length}] ${prov.name} (${prov.review_count} reviews on Google)`);

    let allReviews = [];

    if (prov.review_count <= 40) {
      // Small provider — get everything in one call
      console.log(`  → Fetching ALL (≤40) with most_relevant sort`);
      const reviews = await fetchReviews(prov.place_id, "most_relevant", prov.review_count);
      if (reviews) {
        for (const r of reviews) r._sort_bucket = "all";
        allReviews = reviews;
      }
    } else {
      // Stratified collection — exactly per ENGINE.md: 10 + 15 + 15
      console.log(`  → lowest_rating: 10`);
      const low = await fetchReviews(prov.place_id, "lowest_rating", 10);
      if (low) {
        for (const r of low) r._sort_bucket = "lowest_rating";
        allReviews.push(...low);
      }
      await delay(1000);

      console.log(`  → newest: 15`);
      const newest = await fetchReviews(prov.place_id, "newest", 15);
      if (newest) {
        for (const r of newest) r._sort_bucket = "newest";
        allReviews.push(...newest);
      }
      await delay(1000);

      console.log(`  → most_relevant: 15`);
      const relevant = await fetchReviews(prov.place_id, "most_relevant", 15);
      if (relevant) {
        for (const r of relevant) r._sort_bucket = "most_relevant";
        allReviews.push(...relevant);
      }
    }

    if (allReviews.length === 0) {
      console.log(`  ✗ No reviews returned`);
      errors++;
      await delay(500);
      continue;
    }

    // Deduplicate (same review may appear in multiple sort buckets)
    const unique = deduplicateReviews(allReviews);
    const normalized = unique.map(normalizeReview);

    // Build rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of normalized) {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
    }

    // Count structural signals
    const withText = normalized.filter((r) => r.text.length > 10).length;
    const withPhotos = normalized.filter((r) => r.photos.length > 0).length;
    const withOwnerReply = normalized.filter((r) => r.owner_reply).length;

    const corpus = {
      provider_id: prov.id,
      provider_name: prov.name,
      place_id: prov.place_id,
      google_review_count: prov.review_count,
      collected_count: normalized.length,
      collected_at: new Date().toISOString(),
      rating_distribution_sample: distribution,
      structural_signals: {
        with_text: withText,
        with_photos: withPhotos,
        with_owner_reply: withOwnerReply,
        pct_with_text: Math.round((withText / normalized.length) * 100),
        pct_owner_responds: Math.round((withOwnerReply / normalized.length) * 100),
      },
      reviews: normalized,
    };

    // Save locally
    const filePath = path.join(DATA_DIR, `${prov.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));

    // Update provider metadata in Supabase (NOT the full reviews — just metadata)
    try {
      const updatedScrape = {
        ...prov.existing_scrape,
        outscraper_collected_at: corpus.collected_at,
        outscraper_review_count: normalized.length,
        outscraper_rating_distribution: distribution,
        outscraper_structural_signals: corpus.structural_signals,
      };
      await sb
        .from("providers")
        .update({ classes_scrape_source: JSON.stringify(updatedScrape) })
        .eq("id", prov.id);
    } catch (err) {
      console.log(`  ⚠ Metadata update failed: ${err.message}`);
    }

    totalReviews += normalized.length;
    collected++;
    console.log(`  ✓ ${normalized.length} unique reviews (dist: ${Object.entries(distribution).map(([k, v]) => `${k}★:${v}`).join(" ")})`);
    console.log(`    text:${withText} photos:${withPhotos} owner_reply:${withOwnerReply}`);

    // Rate limit — Outscraper allows 25 req/sec but be respectful
    await delay(1500);

    if ((i + 1) % 25 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`\n── ${i + 1}/${toCollect.length} | ${collected} done | ${totalReviews} reviews | ${elapsed}min ──\n`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const attempted = toCollect.length;
  const errorRate = attempted > 0 ? errors / attempted : 0;
  const FAIL_THRESHOLD = 0.1; // 10% — do not accept silent mass failure

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  DONE: ${collected} providers, ${totalReviews} reviews, ${errors} errors`);
  console.log(`  Time: ${totalTime} minutes`);
  console.log(`  Files saved to: ${DATA_DIR}`);
  if (attempted > 0 && errorRate > FAIL_THRESHOLD) {
    console.error(`\n  FAIL: ${(errorRate * 100).toFixed(0)}% of providers returned no reviews (threshold ${FAIL_THRESHOLD * 100}%).`);
    console.error(`  Fix API key, credits, or place IDs before re-running. See ENGINE.md § Stage 2.`);
    process.exit(1);
  }
  console.log(`  Next step: node scripts/review-assign.js`);
  console.log(`═══════════════════════════════════════════`);
}

run().catch(console.error);
