/**
 * data-cleanup.js — Fix garbage descriptions, Skoolopedia links, and missing phone numbers
 *
 * 1. Null out 145+ garbage descriptions (scraped HTML/junk from Skoolopedia)
 * 2. Replace 156 Skoolopedia website links with real Google-provided URLs
 * 3. Add Google-provided phone numbers to 178 providers
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Patterns that indicate a description is scraped HTML garbage, not real content
const GARBAGE_PATTERNS = [
  /[A-Z]\s[A-Z]\s[A-Z]\s[A-Z]/, // spaced out letters like "C H A P T E R"
  /noun\.\s*\//, // dictionary formatting
  /×\s*Search|EDIT THIS PAGE/i, // Skoolopedia chrome
  /See all enrichments near your location/i,
  /Skip to content.*Copyright/is, // full page scrape
  /©\s*20\d\d.*All rights? reserved/i, // copyright
  /Terms of Service|Terms & Conditions|Privacy Policy/i,
  /Sign up|Log in|Register now|Subscribe/i,
  /Toggle navigation|Hamburger|Sidebar/i,
  /cookie consent|cookie policy|accept cookies/i,
  /islandwide\s+Enrichment Type/i, // Skoolopedia template
  /locations? islandwide/i, // Skoolopedia template
];

function isGarbage(desc) {
  if (!desc) return false;
  for (const p of GARBAGE_PATTERNS) {
    if (p.test(desc)) return true;
  }
  // Also check if description starts with a URL
  if (/^https?:\/\//i.test(desc.trim())) return true;
  // Check if more than 30% uppercase (likely scraped headers)
  const upper = (desc.match(/[A-Z]/g) || []).length;
  const total = desc.length;
  if (total > 50 && upper / total > 0.4) return true;
  return false;
}

async function run() {
  console.log("=== TUMBO DATA CLEANUP ===\n");

  // ─── STEP 1: Fix garbage descriptions ───
  console.log("STEP 1: Cleaning garbage descriptions...");
  const { data: allClasses } = await sb
    .from("classes")
    .select("id, name, description, discovered_from")
    .eq("is_placeholder", false)
    .not("description", "is", null);

  let garbageCount = 0;
  for (const cls of allClasses) {
    if (isGarbage(cls.description)) {
      garbageCount++;
      // Null out the garbage description — better to show nothing than junk
      const { error } = await sb
        .from("classes")
        .update({ description: null })
        .eq("id", cls.id);
      if (error) {
        console.log(`  ERROR nulling ${cls.name}: ${error.message}`);
      }
    }
  }
  console.log(`  Cleaned ${garbageCount} garbage descriptions\n`);

  // ─── STEP 2: Replace Skoolopedia links with Google websites ───
  console.log("STEP 2: Replacing Skoolopedia website links...");
  const { data: skoolProviders } = await sb
    .from("providers")
    .select("id, name, website, phone, classes_scrape_source")
    .like("website", "%skoolopedia%");

  let websiteFixed = 0;
  let phoneFixed = 0;

  for (const prov of skoolProviders) {
    const updates = {};

    if (prov.classes_scrape_source) {
      try {
        const gd = JSON.parse(prov.classes_scrape_source);

        // Replace Skoolopedia URL with Google-provided real website
        if (gd.google_website) {
          updates.website = gd.google_website;
          websiteFixed++;
        } else {
          // No real website found — null it out rather than show Skoolopedia
          updates.website = null;
        }

        // Add Google phone if provider has none
        if (!prov.phone && gd.google_phone) {
          updates.phone = gd.google_phone;
          phoneFixed++;
        }
      } catch {}
    } else {
      // No Google data — null out Skoolopedia link
      updates.website = null;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await sb
        .from("providers")
        .update(updates)
        .eq("id", prov.id);
      if (error) {
        console.log(`  ERROR updating ${prov.name}: ${error.message}`);
      }
    }
  }
  console.log(`  Fixed ${websiteFixed} websites (Skoolopedia → real URL)`);
  console.log(`  Nulled ${skoolProviders.length - websiteFixed} providers with no real website`);
  console.log(`  Added ${phoneFixed} Google phone numbers\n`);

  // ─── STEP 3: Add Google phone numbers for ALL providers missing them ───
  console.log("STEP 3: Adding missing phone numbers from Google...");
  const { data: noPhoneProviders } = await sb
    .from("providers")
    .select("id, name, phone, classes_scrape_source")
    .is("phone", null)
    .not("classes_scrape_source", "is", null);

  let phonesAdded = 0;
  for (const prov of noPhoneProviders) {
    try {
      const gd = JSON.parse(prov.classes_scrape_source);
      if (gd.google_phone) {
        const { error } = await sb
          .from("providers")
          .update({ phone: gd.google_phone })
          .eq("id", prov.id);
        if (!error) phonesAdded++;
      }
    } catch {}
  }
  console.log(`  Added ${phonesAdded} more phone numbers from Google\n`);

  console.log("=== CLEANUP COMPLETE ===");
}

run().catch(console.error);
