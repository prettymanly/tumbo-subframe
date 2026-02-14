/**
 * Fix Template Descriptions
 * ═════════════════════════
 * Re-scrapes provider websites and directly replaces template descriptions
 * with the REAL website content. Uses a much more aggressive extraction
 * strategy than the first pass.
 *
 * Strategy:
 * 1. Find all classes with template descriptions
 * 2. Scrape their provider's website
 * 3. Extract the best available text (meta desc, OG desc, first paragraphs)
 * 4. Replace the template with real content — even if shorter
 * 5. Update source attribution
 *
 * Run: node scripts/fix-descriptions.js
 */

const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Template phrases that indicate fake/generated content
const TEMPLATE_PHRASES = [
  "Classes at this provider",
  "Classes at the provider",
  "classes at the provider",
  "At the provider,",
  "language classes at the provider",
  "classes offered by",
  "See all enrichments near your location",
  "programme building strong reading, writing",
  "programme building conceptual",
  "instruction building water confidence",
];

function isTemplate(desc) {
  if (!desc || desc.length < 30) return true;
  return TEMPLATE_PHRASES.some((p) => desc.includes(p));
}

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractBestDescription(html, url, className, category) {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, iframe, noscript, svg").remove();

  const domain = new URL(url).hostname.replace("www.", "");

  // 1. Meta description — usually the best summary
  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") || "";

  // 2. First substantive paragraphs from the page
  const paragraphs = [];
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40 && text.length < 600) {
      // Skip navigation/footer/cookie text
      if (!/cookie|privacy|terms|copyright|©|sign up|subscribe|newsletter/i.test(text)) {
        paragraphs.push(text);
      }
    }
  });

  // 3. H1/H2 sections that mention relevant keywords
  const relevantText = [];
  const keywords = [category?.toLowerCase(), "class", "programme", "course", "learn", "teach", "child", "kids", "student", "lesson"].filter(Boolean);
  
  $("h1, h2, h3").each((_, el) => {
    const heading = $(el).text().trim();
    const nextText = $(el).nextUntil("h1, h2, h3").text().replace(/\s+/g, " ").trim();
    if (nextText.length > 40) {
      const lower = (heading + " " + nextText).toLowerCase();
      if (keywords.some((k) => lower.includes(k))) {
        relevantText.push(nextText.substring(0, 400));
      }
    }
  });

  // Build the best possible description
  const parts = [];

  // Meta description is almost always the best opening
  if (metaDesc.length > 40) {
    parts.push(metaDesc.trim());
  }

  // Add relevant section content
  for (const rt of relevantText.slice(0, 2)) {
    if (!parts.some((p) => p.includes(rt.substring(0, 30)))) {
      parts.push(rt);
    }
  }

  // If we still need more, use top paragraphs
  if (parts.join(" ").length < 100) {
    for (const p of paragraphs.slice(0, 3)) {
      if (!parts.some((existing) => existing.includes(p.substring(0, 30)))) {
        parts.push(p);
      }
      if (parts.join(" ").length > 300) break;
    }
  }

  let desc = parts.join("\n\n").replace(/\s+/g, " ").trim();

  // Cap at 600 chars
  if (desc.length > 600) {
    const cutOff = desc.lastIndexOf(". ", 600);
    desc = cutOff > 100 ? desc.substring(0, cutOff + 1) : desc.substring(0, 600) + "...";
  }

  return { desc: desc.length > 30 ? desc : null, domain };
}

async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  Fix Template Descriptions");
  console.log("══════════════════════════════════════════\n");

  // Load all enriched classes
  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, provider_id, category, description, discovered_from")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  // Filter to only template descriptions
  const templateClasses = allClasses.filter((c) => isTemplate(c.description));
  console.log(`Total classes: ${allClasses.length}`);
  console.log(`Template descriptions to fix: ${templateClasses.length}\n`);

  // Group by provider
  const providerIds = [...new Set(templateClasses.map((c) => c.provider_id).filter(Boolean))];

  // Load providers with websites
  let providers = [];
  for (let i = 0; i < providerIds.length; i += 200) {
    const { data } = await sb
      .from("providers")
      .select("id, name, website")
      .in("id", providerIds.slice(i, i + 200));
    if (data) providers = providers.concat(data);
  }

  const provMap = new Map(providers.map((p) => [p.id, p]));
  const withWebsites = providers.filter((p) => p.website?.startsWith("http"));
  console.log(`Providers with websites: ${withWebsites.length}`);
  console.log(`Providers without websites: ${providers.length - withWebsites.length}\n`);

  let fixed = 0, failed = 0, noContent = 0;

  for (let i = 0; i < withWebsites.length; i++) {
    const prov = withWebsites[i];
    const classes = templateClasses.filter((c) => c.provider_id === prov.id);

    if (i > 0 && i % 50 === 0) {
      console.log(`── Progress: ${i}/${withWebsites.length} (${fixed} fixed, ${failed} failed, ${noContent} no content) ──`);
    }

    const html = await fetchPage(prov.website);
    if (!html) {
      failed += classes.length;
      continue;
    }

    for (const cls of classes) {
      const result = extractBestDescription(html, prov.website, cls.name, cls.category);
      if (!result.desc) {
        noContent++;
        continue;
      }

      // Update description and sources
      let sources;
      try {
        sources = cls.discovered_from ? JSON.parse(cls.discovered_from) : {};
      } catch {
        sources = {};
      }
      if (!sources.description) sources.description = [];
      if (!sources.description.includes(result.domain)) {
        sources.description.unshift(result.domain);
      }

      await sb
        .from("classes")
        .update({
          description: result.desc,
          discovered_from: JSON.stringify(sources),
        })
        .eq("id", cls.id);

      fixed++;
    }

    await delay(250);
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Failed (site down): ${failed}`);
  console.log(`  No useful content: ${noContent}`);
  console.log(`  Remaining template: ${templateClasses.length - fixed}`);
  console.log("══════════════════════════════════════════\n");
}

run().catch(console.error);
