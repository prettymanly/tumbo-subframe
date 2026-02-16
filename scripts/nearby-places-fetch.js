/**
 * Nearby Places Fetch — In the Neighbourhood data for parents
 * ═══════════════════════════════════════════════════════════════
 * Fetches F&B, cafes, remote working, groceries, parking, transit
 * via Google Places API (New) Nearby Search. Stores per-provider
 * in providers.nearby_places (JSONB). See docs/NEIGHBOURHOOD_ENGINE.md.
 *
 * COST: ~7 Google API calls per provider (1 Place Details + 6 Nearby Search).
 *       Can be hundreds of dollars for 4k+ providers. See docs/COST_AND_API_RULES.md.
 *
 * Run: node scripts/nearby-places-fetch.js --limit=10   (safe test)
 *      node scripts/nearby-places-fetch.js --all        (all providers; confirm cost)
 * Requires: GOOGLE_PLACES_API_KEY. Providers must have classes_scrape_source
 *           with google_place_id (run pipeline-prep or google-places-fetch first).
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const RADIUS_M = 500;
const MAX_RESULTS = 15;

const CATEGORIES = [
  { key: "food", types: ["restaurant"] },
  { key: "cafes", types: ["cafe", "coffee_shop"] },
  { key: "remote_working", types: ["cafe", "library", "coworking_space"] },
  { key: "groceries", types: ["grocery_store", "supermarket", "convenience_store"] },
  { key: "parking", types: ["parking", "parking_garage", "parking_lot"] },
  { key: "transit", types: ["transit_station", "bus_station", "subway_station", "train_station", "bus_stop"] },
];

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

async function getPlaceLocation(placeId) {
  const id = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const res = await fetch(`https://places.googleapis.com/v1/${id}`, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "id,location",
    },
  });
  const data = await res.json();
  if (data.error || !data.location) return null;
  return data.location;
}

async function searchNearby(lat, lng, includedTypes) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri",
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: MAX_RESULTS,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: RADIUS_M,
        },
      },
    }),
  });
  const data = await res.json();
  if (data.error) return [];
  const places = data.places || [];
  return places.map((p) => {
    const name = p.displayName?.text || "Unknown";
    const placeId = (p.id || "").replace("places/", "");
    const addr = p.formattedAddress || null;
    const mapsUri = p.googleMapsUri || (placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : null);
    let distanceMeters = null;
    if (p.location && p.location.latitude != null && p.location.longitude != null) {
      distanceMeters = haversineMeters(lat, lng, p.location.latitude, p.location.longitude);
    }
    return { name, placeId, formattedAddress: addr, googleMapsUri: mapsUri, distanceMeters };
  });
}

async function run() {
  console.log("══════════════════════════════════════════════════════");
  console.log("  Nearby Places Fetch — In the Neighbourhood");
  console.log("══════════════════════════════════════════════════════\n");

  if (!API_KEY) {
    console.error("ERROR: GOOGLE_PLACES_API_KEY not set in .env.local");
    process.exit(1);
  }

  let providers = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("providers")
      .select("id, name, classes_scrape_source")
      .not("classes_scrape_source", "is", null)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    providers = providers.concat(data);
  }

  // Pre-check: ensure nearby_places column exists (we can't create it from here)
  if (providers.length > 0) {
    const { error } = await sb.from("providers").select("nearby_places").limit(1);
    if (error && (error.message || "").toLowerCase().includes("nearby_places")) {
      console.error("\n  Missing column. Run this once in Supabase Dashboard → SQL Editor → New query:\n");
      console.error("  ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS nearby_places jsonb;\n");
      console.error("  Then run this script again.\n");
      process.exit(1);
    }
  }

  const withPlaceId = [];
  for (const p of providers) {
    try {
      const gd = JSON.parse(p.classes_scrape_source || "{}");
      if (gd.google_place_id) withPlaceId.push({ ...p, place_id: gd.google_place_id });
    } catch {}
  }

  console.log(`Providers with Place ID: ${withPlaceId.length}\n`);

  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const useAll = process.argv.includes("--all");
  if (!limitArg && !useAll) {
    console.error("  COST GUARD: This script uses Google Places API and can cost hundreds of dollars.");
    console.error("  You must pass either --limit=N (e.g. --limit=10) or --all to run.");
    console.error("  Example: node scripts/nearby-places-fetch.js --limit=10");
    console.error("  See docs/COST_AND_API_RULES.md.\n");
    process.exit(1);
  }
  const toProcess = limitArg
    ? withPlaceId.slice(0, parseInt(limitArg.split("=")[1], 10))
    : withPlaceId;

  const apiCallsEstimate = toProcess.length * 7;
  if (toProcess.length > 100) {
    console.log(`  ⚠ COST WARNING: ~${apiCallsEstimate.toLocaleString()} Google API calls (${toProcess.length} providers × 7).`);
    console.log("  This can cost hundreds of dollars. Proceeding in 5s... (Ctrl+C to cancel)\n");
    await delay(5000);
  }

  let done = 0;
  let errors = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const prov = toProcess[i];
    if (i > 0 && i % 25 === 0) {
      console.log(`\n── ${i}/${toProcess.length} done ──\n`);
    }

    try {
      const location = await getPlaceLocation(prov.place_id);
      await delay(50);
      if (!location || location.latitude == null || location.longitude == null) {
        console.log(`  ✗ ${prov.name.substring(0, 45)} — no location`);
        errors++;
        continue;
      }

      const lat = location.latitude;
      const lng = location.longitude;
      const nearby = {};

      for (const cat of CATEGORIES) {
        const places = await searchNearby(lat, lng, cat.types);
        nearby[cat.key] = places;
        await delay(80);
      }

      const { error } = await sb
        .from("providers")
        .update({ nearby_places: nearby })
        .eq("id", prov.id);

      if (error) {
        console.log(`  ✗ ${prov.name.substring(0, 45)} — DB: ${error.message}`);
        errors++;
        continue;
      }

      const total = Object.values(nearby).reduce((s, arr) => s + arr.length, 0);
      console.log(`  ✓ ${prov.name.substring(0, 45).padEnd(47)} ${total} places`);
      done++;
    } catch (err) {
      console.log(`  ✗ ${prov.name.substring(0, 45)} — ${err.message}`);
      errors++;
      await delay(500);
    }
  }

  console.log("\n══════════════════════════════════════════════════════");
  console.log(`  DONE: ${done} providers updated, ${errors} errors`);
  console.log("══════════════════════════════════════════════════════\n");
}

run().catch(console.error);
