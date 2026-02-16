/**
 * enrich-curated-42.js — Force GPT synthesis on the 42 curated listings
 * ═══════════════════════════════════════════════════════════════════════
 * These classes already have hand-written descriptions, but need proper
 * ENGINE.md ethnographic synthesis using Outscraper reviews.
 *
 * Uses the same synthesis engine (system prompt, user prompt format,
 * update logic) as full-enrich.js — just targets curated classes only.
 *
 * Run: node scripts/enrich-curated-42.js
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
    return fs.readFileSync(PROMPT_PATH, "utf8").trim();
  } catch (e) {
    console.warn(`Could not load ${PROMPT_PATH}: ${e.message}`);
    return null;
  }
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const SYSTEM_PROMPT_FALLBACK = `You are synthesizing reviews for parents. Return JSON with keys: content_tags (subject, philosophy, experience, child), description, review_synthesis, who_thrives, what_to_expect, neighbourhood, vibe_line. Use parent language verbatim. No marketing copy. Null when insufficient evidence.`;
const SYSTEM_PROMPT = loadSystemPrompt() || SYSTEM_PROMPT_FALLBACK;

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
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
  $(
    "script, style, nav, footer, header, iframe, noscript, svg, .cookie-banner, #cookie"
  ).remove();
  const meta =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";
  const body = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 3000);
  return { meta, body };
}

function buildUserPrompt(cls, provider, web, reviews) {
  const parts = [];
  parts.push("══════ FACTUAL DATA (for description only) ══════");
  parts.push(`Class: ${cls.name}`);
  parts.push(`Provider: ${provider?.name || "Unknown"}`);
  if (cls.category) parts.push(`Category: ${cls.category}`);
  if (cls.age_min != null)
    parts.push(`Ages: ${cls.age_min}${cls.age_max ? `-${cls.age_max}` : "+"}`);
  if (cls.price) parts.push(`Price: $${cls.price}`);
  if (cls.location) parts.push(`Location: ${cls.location}`);
  if (cls.schedule) parts.push(`Schedule: ${cls.schedule}`);
  if (cls.google_rating) parts.push(`Google Rating: ${cls.google_rating}`);
  if (cls.review_count)
    parts.push(`Total Reviews on Google: ${cls.review_count}`);

  if (web) {
    parts.push("\n── Provider Website ──");
    parts.push(
      "Use ONLY Meta below for description if it is one short factual sentence. Do NOT use Content in description—it is raw nav/hero/marketing."
    );
    if (web.meta) parts.push(`Meta: ${web.meta}`);
    if (web.body)
      parts.push(
        `Content (reference only, do not copy into description):\n${web.body.substring(0, 1500)}`
      );
  }

  if (reviews && reviews.length > 0) {
    parts.push(
      `\n══════ PARENT REVIEWS — PRIMARY EVIDENCE (${reviews.length} scraped of ${cls.review_count || reviews.length} on Google) ══════`
    );
    parts.push(
      "These are independent Google reviews. Use parent language verbatim."
    );
    for (const r of reviews.slice(0, 20)) {
      const date = r.time
        ? new Date(r.time * 1000).toISOString().split("T")[0]
        : "";
      parts.push(
        `[${r.rating}★ ${date}] ${r.author_name || r.author || "Anon"}: "${r.text || "(no text)"}"`
      );
    }
    if (reviews.length > 20)
      parts.push(`... and ${reviews.length - 20} more reviews not shown.`);
  } else {
    parts.push("\n══════ PARENT REVIEWS ══════");
    parts.push(
      "No reviews available. Set review_synthesis, who_thrives, what_to_expect, and neighbourhood to null."
    );
  }

  parts.push(
    "\nProduce the editorial JSON. Surface patterns. Flag absences. Don't interpret—report."
  );
  return parts.join("\n");
}

function parseResponse(text) {
  try {
    let clean = text.trim();
    if (clean.startsWith("```"))
      clean = clean
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```$/, "");
    return JSON.parse(clean);
  } catch (e) {
    console.log(`    Parse error: ${e.message}`);
    return null;
  }
}

async function run() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  GPT SYNTHESIS — 42 Curated Listings (force re-enrich)");
  console.log("═══════════════════════════════════════════════════════\n");

  // Find the 42 curated classes
  let curatedClasses = [];
  let offset = 0;
  while (true) {
    const { data } = await sb
      .from("classes")
      .select(
        "id, name, provider_id, category, description, summary, vibe_line, typical_child_profile, not_ideal_for, outcome_expectations, age_min, age_max, price, location, schedule, raw_reviews, discovered_from, google_rating, review_count"
      )
      .eq("source", "tumbo-discovery-research")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    curatedClasses.push(...data);
    offset += 1000;
  }

  console.log(`Found ${curatedClasses.length} curated classes\n`);

  if (curatedClasses.length === 0) {
    console.log("No curated classes found.");
    return;
  }

  // Load providers
  const providerIds = [
    ...new Set(curatedClasses.map((c) => c.provider_id).filter(Boolean)),
  ];
  const providerMap = new Map();
  for (let i = 0; i < providerIds.length; i += 200) {
    const batch = providerIds.slice(i, i + 200);
    const { data } = await sb
      .from("providers")
      .select("id, name, website, classes_scrape_source")
      .in("id", batch);
    for (const p of data || []) providerMap.set(p.id, p);
  }

  const webCache = new Map();
  let enriched = 0;
  let errors = 0;
  let noReviews = 0;
  const startTime = Date.now();
  const MIN_REVIEWS_FOR_SYNTHESIS = 10;

  for (let i = 0; i < curatedClasses.length; i++) {
    const cls = curatedClasses[i];
    const provider = cls.provider_id
      ? providerMap.get(cls.provider_id)
      : null;

    // Website content
    let web = null;
    if (provider) {
      if (webCache.has(provider.id)) {
        web = webCache.get(provider.id);
      } else {
        let realUrl = null;
        if (provider.classes_scrape_source) {
          try {
            const gd = JSON.parse(provider.classes_scrape_source);
            if (
              gd.google_website &&
              !gd.google_website.includes("skoolopedia")
            )
              realUrl = gd.google_website;
          } catch {}
        }
        if (
          !realUrl &&
          provider.website &&
          !provider.website.includes("skoolopedia")
        )
          realUrl = provider.website;
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
      try {
        reviews = JSON.parse(cls.raw_reviews);
        if (!Array.isArray(reviews)) reviews = null;
      } catch {
        reviews = null;
      }
    }

    const hasWeb = !!web?.body;
    const hasReviews = reviews && reviews.length > 0;

    console.log(
      `[${i + 1}/${curatedClasses.length}] ${cls.name} | web=${hasWeb ? "Y" : "N"} reviews=${reviews?.length || 0}`
    );

    if (!hasReviews && !hasWeb) {
      console.log("  ⏭ No reviews and no website — keeping original content");
      noReviews++;
      continue;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildUserPrompt(cls, provider, web, reviews),
          },
        ],
        max_tokens: 1500,
        temperature: 0.6,
        response_format: { type: "json_object" },
      });

      const result = parseResponse(
        response.choices[0]?.message?.content || ""
      );
      if (!result) {
        errors++;
        await delay(500);
        continue;
      }

      // ENGINE.md baseline: full synthesis only with ≥10 reviews
      if (!reviews || reviews.length < MIN_REVIEWS_FOR_SYNTHESIS) {
        result.review_synthesis = null;
        result.who_thrives = null;
        result.what_to_expect = null;
      }

      const updates = {};
      if (result.description) updates.description = result.description;
      if (result.review_synthesis) updates.summary = result.review_synthesis;
      if (result.who_thrives)
        updates.typical_child_profile = result.who_thrives;
      if (result.what_to_expect)
        updates.outcome_expectations = result.what_to_expect;
      updates.not_ideal_for = null;

      if (result.vibe_line) {
        let vl = result.vibe_line
          .replace(/^["']|["']$/g, "")
          .replace(/\.$/, "")
          .trim();
        vl = vl.charAt(0).toLowerCase() + vl.slice(1);
        updates.vibe_line = vl;
      }

      // Source attribution
      let srcObj = {};
      try {
        srcObj = JSON.parse(cls.discovered_from || "{}");
      } catch {}
      if (result.content_tags) srcObj.content_tags = result.content_tags;
      if (result.neighbourhood)
        srcObj.neighbourhood_note = result.neighbourhood;
      let hostname = "Tumbo editorial";
      try {
        if (provider?.website)
          hostname = new URL(provider.website).hostname.replace("www.", "");
      } catch {}
      srcObj.description = hasWeb
        ? [hostname, "Tumbo editorial"]
        : ["Tumbo editorial"];
      if (result.review_synthesis) srcObj.reviews = ["Google", "Tumbo editorial"];
      if (result.who_thrives)
        srcObj.child_profile = hasReviews
          ? ["Google", "Tumbo editorial"]
          : ["Tumbo editorial"];
      srcObj.vibe_line = ["Tumbo editorial"];
      updates.discovered_from = JSON.stringify(srcObj);

      if (!result.review_synthesis) updates.summary = null;
      if (!result.who_thrives) updates.typical_child_profile = null;
      if (!result.what_to_expect) updates.outcome_expectations = null;

      const sections = [
        result.description,
        result.review_synthesis,
        result.who_thrives,
        result.what_to_expect,
        result.vibe_line,
        result.neighbourhood,
      ].filter(Boolean).length;
      console.log(
        `  ✓ ${sections} sections | vibe: "${updates.vibe_line || "—"}"`
      );
      if (result.neighbourhood)
        console.log(`    neighbourhood: "${result.neighbourhood}"`);

      const { error } = await sb
        .from("classes")
        .update(updates)
        .eq("id", cls.id);
      if (error) {
        console.log(`  DB error: ${error.message}`);
        errors++;
      } else enriched++;
    } catch (err) {
      console.log(`  ✗ ${err.message}`);
      errors++;
    }

    await delay(400);
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n═══════════════════════════════════════════`);
  console.log(
    `  DONE: ${enriched} enriched, ${noReviews} skipped (no data), ${errors} errors, ${elapsed}min`
  );
  console.log(`═══════════════════════════════════════════`);
}

run().catch(console.error);
