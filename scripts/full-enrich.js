/**
 * full-enrich.js — Editorial synthesis engine
 * ═══════════════════════════════════════════════
 * Rules: ENGINE.md § STAGE 3. System prompt: scripts/prompts/synthesis-system.md (canonical).
 * Do not change synthesis logic without updating ENGINE.md and the prompt file.
 *
 * Run: node scripts/full-enrich.js
 */

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const PROMPT_PATH = path.join(__dirname, "prompts", "synthesis-system.md");
function loadSystemPrompt() {
  try {
    const raw = fs.readFileSync(PROMPT_PATH, "utf8");
    return raw.trim();
  } catch (e) {
    console.warn(`Could not load ${PROMPT_PATH}, using inline prompt: ${e.message}`);
    return null;
  }
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Website scraping (for FACTUAL context only, NOT parent sentiment) ──
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractText(html) {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, iframe, noscript, svg, .cookie-banner, #cookie").remove();
  const meta = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
  const body = $("body").text().replace(/\s+/g, " ").trim().substring(0, 3000);
  return { meta, body };
}

// System prompt: load from canonical file (ENGINE.md § Stage 3). Fallback kept for portability.
const SYSTEM_PROMPT_FALLBACK = `You are synthesizing reviews for parents. Return JSON with keys: content_tags (subject, philosophy, experience, child), description, review_synthesis, who_thrives, what_to_expect, neighbourhood, vibe_line. Use parent language verbatim. No marketing copy. Null when insufficient evidence.`;
const SYSTEM_PROMPT = loadSystemPrompt() || SYSTEM_PROMPT_FALLBACK;

// ── Build user prompt ──
function buildUserPrompt(cls, provider, web, reviews) {
  const parts = [];

  // Factual data block
  parts.push("══════ FACTUAL DATA (for description only) ══════");
  parts.push(`Class: ${cls.name}`);
  parts.push(`Provider: ${provider?.name || "Unknown"}`);
  if (cls.category) parts.push(`Category: ${cls.category}`);
  if (cls.age_min != null) parts.push(`Ages: ${cls.age_min}${cls.age_max ? `-${cls.age_max}` : "+"}`);
  if (cls.price) parts.push(`Price: $${cls.price}`);
  if (cls.location) parts.push(`Location: ${cls.location}`);
  if (cls.schedule) parts.push(`Schedule: ${cls.schedule}`);
  if (cls.google_rating) parts.push(`Google Rating: ${cls.google_rating}`);
  if (cls.review_count) parts.push(`Total Reviews on Google: ${cls.review_count}`);

  if (web) {
    parts.push("\n── Provider Website ──");
    parts.push("Use ONLY Meta below for description if it is one short factual sentence. Do NOT use Content in description—it is raw nav/hero/marketing.");
    if (web.meta) parts.push(`Meta: ${web.meta}`);
    if (web.body) parts.push(`Content (reference only, do not copy into description):\n${web.body.substring(0, 1500)}`);
  }

  // Review data block — the primary evidence
  if (reviews && reviews.length > 0) {
    parts.push(`\n══════ PARENT REVIEWS — PRIMARY EVIDENCE (${reviews.length} scraped of ${cls.review_count || reviews.length} on Google) ══════`);
    parts.push("These are independent Google reviews. Use parent language verbatim.");
    for (const r of reviews.slice(0, 40)) {
      const date = r.time ? new Date(r.time * 1000).toISOString().split("T")[0] : "";
      parts.push(`[${r.rating}★ ${date}] ${r.author_name || r.author || "Anon"}: "${r.text || "(no text)"}"`);
    }
    if (reviews.length > 40) parts.push(`... and ${reviews.length - 40} more reviews not shown. Surface patterns from what you see; flag what's absent.`);
  } else {
    parts.push("\n══════ PARENT REVIEWS ══════");
    parts.push("No reviews available. Set review_synthesis, who_thrives, what_to_expect, and neighbourhood to null.");
  }

  parts.push("\nProduce the editorial JSON. Surface patterns. Flag absences. Don't interpret—report.");
  return parts.join("\n");
}

// ── Parse response ──
function parseResponse(text) {
  try {
    let clean = text.trim();
    if (clean.startsWith("```")) clean = clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(clean);
  } catch (e) {
    console.log(`    Parse error: ${e.message}`);
    return null;
  }
}

// ── Need enrichment? ──
const TEMPLATE_PHRASES = [
  "Classes at this provider", "Classes at the provider", "classes at the provider",
  "At the provider,", "programme building strong reading", "programme building conceptual",
  "instruction building water confidence", "coaching building physical skills",
  "programme building conversational fluency", "in a supportive learning environment",
  "building genuine skills and confidence",
];

const GENERIC_CHILD_PROFILE = [
  "children who enjoy", "respond well to", "supportive learning environment",
  "supportive, structured", "structured instruction", "enjoy creative activities",
  "enjoy play",
];
const GENERIC_OUTCOME = [
  "measurable progress", "greater confidence", "after a term",
  "show measurable progress",
];

function needsEnrichment(cls) {
  if (!cls.description || cls.description.length < 30) return true;
  if (TEMPLATE_PHRASES.some((p) => cls.description.includes(p))) return true;
  const templateVibes = ["made genuinely engaging", "built through genuine fun", "with real depth and warmth", "through patient, structured guidance", "in a supportive, playful environment"];
  if (cls.vibe_line && templateVibes.some((v) => cls.vibe_line.includes(v))) return true;
  // Re-enrich classes from previous AI runs with generic vibes
  if (cls.vibe_line && /where every child|where every note|where little ones|where curiosity|where young minds|where creativity blooms|where little feet|where little dancers|where musical magic|where math becomes|a joyful space|the joyful|a vibrant space|a focused space|interactive learning|the joy of music/i.test(cls.vibe_line)) return true;
  // Re-enrich generic who_thrives / what_to_expect (Chipchase standard)
  const profile = (cls.typical_child_profile || "").toLowerCase();
  const outcome = (cls.outcome_expectations || "").toLowerCase();
  if (GENERIC_CHILD_PROFILE.some((p) => profile.includes(p))) return true;
  if (GENERIC_OUTCOME.some((p) => outcome.includes(p))) return true;
  return false;
}

// ── Main ──
async function run() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  ETHNOGRAPHIC SYNTHESIS ENGINE — Neutral, Pattern-Surfacing");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, provider_id, category, description, summary, vibe_line, typical_child_profile, not_ideal_for, outcome_expectations, age_min, age_max, price, location, schedule, raw_reviews, discovered_from, google_rating, review_count")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  const minReviewsArg = process.argv.find((a) => a.startsWith("--min-reviews="));
  const allArg = process.argv.includes("--all");
  let toEnrich;
  if (allArg) {
    toEnrich = allClasses;
    console.log(`--all: enriching every non-placeholder class (${toEnrich.length})\n`);
  } else if (minReviewsArg) {
    const minR = parseInt(minReviewsArg.split("=")[1], 10);
    if (minR > 0) {
      toEnrich = allClasses.filter((c) => {
        try {
          const r = c.raw_reviews ? JSON.parse(c.raw_reviews) : [];
          return Array.isArray(r) && r.length >= minR;
        } catch { return false; }
      });
      console.log(`Min reviews filter: ${minR}+ assigned reviews → ${toEnrich.length} class(es) (bypasses needsEnrichment)\n`);
    } else toEnrich = allClasses.filter(needsEnrichment);
  } else toEnrich = allClasses.filter(needsEnrichment);

  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  if (limitArg) {
    const n = parseInt(limitArg.split("=")[1], 10);
    if (n > 0) toEnrich = toEnrich.slice(0, n);
    console.log(`Limit applied: enriching ${toEnrich.length} class(es)\n`);
  }

  // Exclude flagged out-of-scope classes (docs/FLAGGED_CLASS_IDS.json) so we don't enrich them
  const flaggedPath = path.join(__dirname, "..", "docs", "FLAGGED_CLASS_IDS.json");
  if (fs.existsSync(flaggedPath)) {
    try {
      const flagged = JSON.parse(fs.readFileSync(flaggedPath, "utf8"));
      const flaggedIds = new Set(flagged.map((f) => f.id).filter(Boolean));
      const before = toEnrich.length;
      toEnrich = toEnrich.filter((c) => !flaggedIds.has(c.id));
      if (before > toEnrich.length) console.log(`Excluded ${before - toEnrich.length} flagged (out-of-scope) classes. Enriching ${toEnrich.length}\n`);
    } catch (_) {}
  }

  const classIdArg = process.argv.find((a) => a.startsWith("--class-id="));
  let singleClassId = null;
  if (classIdArg) {
    singleClassId = classIdArg.split("=")[1]?.trim();
    if (singleClassId) {
      const { data: one, error: e } = await sb
        .from("classes")
        .select("id, name, provider_id, category, description, summary, vibe_line, typical_child_profile, not_ideal_for, outcome_expectations, age_min, age_max, price, location, schedule, raw_reviews, discovered_from, google_rating, review_count")
        .eq("id", singleClassId)
        .single();
      if (e || !one) {
        console.error(`Class not found: ${singleClassId}`);
        process.exit(1);
      }
      toEnrich = [one];
      console.log(`Single class mode: ${one.name}\n`);
      console.log("── BEFORE ──");
      console.log("What parents say (summary):", (one.summary || "(empty)").slice(0, 500) + (one.summary && one.summary.length > 500 ? "…" : ""));
      console.log("Who thrives here:", (one.typical_child_profile || "(empty)").slice(0, 400) + (one.typical_child_profile && one.typical_child_profile.length > 400 ? "…" : ""));
      console.log("What to expect:", (one.outcome_expectations || "(empty)").slice(0, 400) + (one.outcome_expectations && one.outcome_expectations.length > 400 ? "…" : ""));
      console.log("Vibe line:", one.vibe_line || "(empty)");
      console.log("");
    }
  }

  console.log(`Total classes: ${allClasses.length}`);
  console.log(`Need enrichment (this run): ${toEnrich.length}\n`);

  // Load providers
  const providerIds = [...new Set(toEnrich.map((c) => c.provider_id).filter(Boolean))];
  const providerMap = new Map();
  for (let i = 0; i < providerIds.length; i += 200) {
    const batch = providerIds.slice(i, i + 200);
    const { data } = await sb.from("providers").select("id, name, website, classes_scrape_source").in("id", batch);
    for (const p of data || []) providerMap.set(p.id, p);
  }

  const webCache = new Map();
  let enriched = 0, errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < toEnrich.length; i++) {
    const cls = toEnrich[i];
    const provider = cls.provider_id ? providerMap.get(cls.provider_id) : null;

    // Website content (cached per provider) — for FACTUAL context only
    let web = null;
    if (provider) {
      if (webCache.has(provider.id)) {
        web = webCache.get(provider.id);
      } else {
        let realUrl = null;
        if (provider.classes_scrape_source) {
          try {
            const gd = JSON.parse(provider.classes_scrape_source);
            if (gd.google_website && !gd.google_website.includes("skoolopedia")) realUrl = gd.google_website;
          } catch {}
        }
        if (!realUrl && provider.website && !provider.website.includes("skoolopedia")) realUrl = provider.website;
        if (realUrl) {
          const html = await fetchPage(realUrl);
          if (html) web = extractText(html);
        }
        webCache.set(provider.id, web);
      }
    }

    // Parse reviews
    let reviews = null;
    if (cls.raw_reviews) {
      try { reviews = JSON.parse(cls.raw_reviews); if (!Array.isArray(reviews)) reviews = null; } catch { reviews = null; }
    }

    const hasWeb = !!web?.body;
    const hasReviews = reviews && reviews.length > 0;

    console.log(`[${i + 1}/${toEnrich.length}] ${cls.name} | web=${hasWeb ? "Y" : "N"} reviews=${reviews?.length || 0}`);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(cls, provider, web, reviews) },
        ],
        max_tokens: 3200,
        temperature: 0.35,
        response_format: { type: "json_object" },
      });

      const result = parseResponse(response.choices[0]?.message?.content || "");
      if (!result) { errors++; await delay(500); continue; }

      // Baseline (ENGINE.md): full synthesis only with ≥10 assigned reviews. No overclaim on thin data.
      const MIN_REVIEWS_FOR_SYNTHESIS = 10;
      if (!reviews || reviews.length < MIN_REVIEWS_FOR_SYNTHESIS) {
        result.review_synthesis = null;
        result.who_thrives = null;
        result.what_to_expect = null;
      }

      const updates = {};
      if (result.description) updates.description = result.description;
      if (result.review_synthesis) updates.summary = result.review_synthesis;
      if (result.who_thrives) updates.typical_child_profile = result.who_thrives;
      if (result.what_to_expect) updates.outcome_expectations = result.what_to_expect;
      updates.not_ideal_for = null; // folded into what_to_expect

      if (result.vibe_line) {
        let vl = result.vibe_line.replace(/^["']|["']$/g, "").replace(/\.$/, "").trim();
        vl = vl.charAt(0).toLowerCase() + vl.slice(1);
        updates.vibe_line = vl;
      }

      // Source attribution + content tags + neighbourhood
      let srcObj = {};
      try { srcObj = JSON.parse(cls.discovered_from || "{}"); } catch {}
      if (result.content_tags) srcObj.content_tags = result.content_tags;
      if (result.neighbourhood) srcObj.neighbourhood_note = result.neighbourhood;
      let hostname = "Tumbo editorial";
      try { if (provider?.website) hostname = new URL(provider.website).hostname.replace("www.", ""); } catch {}
      srcObj.description = hasWeb ? [hostname, "Tumbo editorial"] : ["Tumbo editorial"];
      if (result.review_synthesis) srcObj.reviews = ["Google", "Tumbo editorial"];
      if (result.who_thrives) srcObj.child_profile = hasReviews ? ["Google", "Tumbo editorial"] : ["Tumbo editorial"];
      srcObj.vibe_line = ["Tumbo editorial"];
      updates.discovered_from = JSON.stringify(srcObj);

      // Null out sections AI couldn't fill
      if (!result.review_synthesis) updates.summary = null;
      if (!result.who_thrives) updates.typical_child_profile = null;
      if (!result.what_to_expect) updates.outcome_expectations = null;

      const sections = [result.description, result.review_synthesis, result.who_thrives, result.what_to_expect, result.vibe_line, result.neighbourhood].filter(Boolean).length;
      console.log(`  ✓ ${sections} sections | vibe: "${updates.vibe_line || "—"}"`);
      if (result.neighbourhood) console.log(`    neighbourhood: "${result.neighbourhood}"`);

      const { error } = await sb.from("classes").update(updates).eq("id", cls.id);
      if (error) { console.log(`  DB error: ${error.message}`); errors++; }
      else enriched++;
    } catch (err) {
      console.log(`  ✗ ${err.message}`);
      errors++;
    }

    await delay(400);
    if ((i + 1) % 25 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`\n── ${i + 1}/${toEnrich.length} | ${enriched} done | ${elapsed}min ──\n`);
    }
  }

  if (singleClassId && enriched > 0) {
    const { data: after } = await sb
      .from("classes")
      .select("summary, typical_child_profile, outcome_expectations, vibe_line")
      .eq("id", singleClassId)
      .single();
    if (after) {
      console.log("\n── AFTER ──");
      console.log("What parents say (summary):", (after.summary || "(empty)").slice(0, 1200) + (after.summary && after.summary.length > 1200 ? "…" : ""));
      console.log("Who thrives here:", (after.typical_child_profile || "(empty)").slice(0, 900) + (after.typical_child_profile && after.typical_child_profile.length > 900 ? "…" : ""));
      console.log("What to expect:", (after.outcome_expectations || "(empty)").slice(0, 900) + (after.outcome_expectations && after.outcome_expectations.length > 900 ? "…" : ""));
      console.log("Vibe line:", after.vibe_line || "(empty)");
    }
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`  DONE: ${enriched} enriched, ${errors} errors, ${((Date.now() - startTime) / 1000 / 60).toFixed(1)}min`);
  console.log(`═══════════════════════════════════════════`);
}

run().catch(console.error);
