/**
 * cull-v2-pass2.js — Second pass cleanup
 * Catches remaining temples, churches, adult yoga, Pte Ltd businesses,
 * photo studios miscategorized as Art, and other stragglers.
 */
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fetchAll() {
  const all = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from("classes")
      .select("id, name, category, vibe_line, description, summary")
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false)
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

function hasChildKeywords(text) {
  return /child|kid|toddler|preschool|nurser|infant|baby|student|youth|junior|young|school|class|lesson|teach|course|enrichment|programme|program|tuition|academy|learning/i.test(text);
}

async function run() {
  console.log("PASS 2 — Targeted cleanup\n");
  const all = await fetchAll();
  console.log("Currently visible:", all.length);

  const toHide = [];

  for (const c of all) {
    const name = c.name || "";
    const vibe = c.vibe_line || "";
    const desc = c.description || "";
    const combined = name + " " + vibe + " " + desc;

    // Temples with no children keywords
    if (/\btemple\b/i.test(name) && !hasChildKeywords(combined)) {
      toHide.push({ id: c.id, name: c.name, reason: "temple (no children keywords)" });
      continue;
    }

    // Remaining adult-facing religious orgs
    if (/\b(church|masjid|mosque|chapel|cathedral|parish)\b/i.test(name) && !hasChildKeywords(combined)) {
      toHide.push({ id: c.id, name: c.name, reason: "religious org (no children keywords)" });
      continue;
    }

    // Buddhist centres/societies without children keywords
    if (/\bbuddhi(st|sm)\b/i.test(name) && !hasChildKeywords(combined)) {
      toHide.push({ id: c.id, name: c.name, reason: "buddhist org (no children keywords)" });
      continue;
    }

    // Photo studios miscategorized as Art
    if (/\bphoto(graphy)?\s*(studio|service|lab)\b/i.test(name)) {
      toHide.push({ id: c.id, name: c.name, reason: "photo studio in name" });
      continue;
    }

    // "Pte Ltd" in the name — this is a business registration, not a class name
    // Only cull if category is NOT in our safe list
    const safeCats = ["Sports", "Art", "Music", "Dance", "Swimming", "Martial Arts",
      "Drama", "Coding", "Cooking", "Gymnastics", "Football", "Rock Climbing",
      "Chess", "Water Sports", "STEM", "Special Needs", "Chinese", "English",
      "Languages", "Malay", "Mathematics", "Science", "Holiday Camp"];
    if (/\bpte\s*ltd\b/i.test(name) && !safeCats.includes(c.category)) {
      toHide.push({ id: c.id, name: c.name, reason: "Pte Ltd + non-safe category" });
      continue;
    }

    // Amitabha / Gita / Tibetan — adult spiritual centres
    if (/\b(amitabha|gita|tibetan|catholic archdiocesan|archdiocese|chancery)\b/i.test(name) && !hasChildKeywords(combined)) {
      toHide.push({ id: c.id, name: c.name, reason: "spiritual centre (no children keywords)" });
      continue;
    }

    // "Distributor" in name — they sell products, not run classes
    if (/\bdistributor\b/i.test(name)) {
      toHide.push({ id: c.id, name: c.name, reason: "distributor (not a class)" });
      continue;
    }

    // "Bookshop" in name
    if (/\bbookshop\b/i.test(name) && !hasChildKeywords(combined)) {
      toHide.push({ id: c.id, name: c.name, reason: "bookshop (not a class)" });
      continue;
    }

    // "Home" in name for non-preschool (children's homes are care, not enrichment)
    if (/\bchildren'?s?\s+home\b/i.test(name)) {
      toHide.push({ id: c.id, name: c.name, reason: "children's home (care, not enrichment)" });
      continue;
    }

    // "Counselling" / "therapy" centres
    if (/\b(counselling|counseling|therapy)\s+(centre|center|service)\b/i.test(name) && !hasChildKeywords(vibe)) {
      toHide.push({ id: c.id, name: c.name, reason: "counselling/therapy centre" });
      continue;
    }

    // LEGO store (retail, not enrichment class)
    if (/\bLEGO\s+Certified\s+Store\b/i.test(name)) {
      toHide.push({ id: c.id, name: c.name, reason: "LEGO retail store" });
      continue;
    }

    // NEX (if it's just a mall listing)
    if (name.trim() === "NEX") {
      toHide.push({ id: c.id, name: c.name, reason: "mall listing" });
      continue;
    }
  }

  console.log("\nTo hide:", toHide.length);
  for (const h of toHide) {
    console.log("  -", h.name, "—", h.reason);
  }

  if (toHide.length === 0) {
    console.log("Nothing more to cull.");
    return;
  }

  // Execute
  const ids = toHide.map(h => h.id);
  let hidden = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { data, error } = await sb.from("classes")
      .update({ hidden_from_directory: true })
      .in("id", batch)
      .select("id");
    if (error) { console.error("ERROR:", error.message); continue; }
    hidden += (data || []).length;
  }

  // Final count
  let total = 0;
  let from = 0;
  while (true) {
    const { data } = await sb.from("classes").select("id").eq("is_placeholder", false).eq("hidden_from_directory", false).range(from, from + 999);
    if (!data || data.length === 0) break;
    total += data.length;
    if (data.length < 1000) break;
    from += 1000;
  }

  console.log("\nHidden:", hidden);
  console.log("Final visible:", total);
}

run().catch(err => { console.error("FATAL:", err); process.exit(1); });
