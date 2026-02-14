/**
 * AI Description Enrichment
 * ══════════════════════════
 * Uses OpenAI GPT-4o-mini to rewrite all remaining template descriptions
 * into high-quality, class-specific content using scraped website data.
 *
 * For classes WITH a provider website:
 *   - Scrapes the website for raw content
 *   - Sends to GPT with class context (name, category, age range)
 *   - Gets back a proper description in Tumbo's voice
 *
 * For classes WITHOUT a website:
 *   - Uses Google reviews + class metadata to generate a description
 *
 * Cost estimate (~$0.50 for 273 classes using gpt-4o-mini):
 *   - ~500 tokens input + ~200 tokens output per class
 *   - 273 × 700 tokens ≈ 191K tokens ≈ $0.03 input + $0.11 output
 *
 * Run: node scripts/ai-enrich.js
 */

const OpenAI = require("openai");
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
  $("script, style, nav, footer, header, iframe, noscript, svg").remove();
  const meta =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") || "";
  const body = $("body").text().replace(/\s+/g, " ").trim().substring(0, 2000);
  return { meta, body };
}

const SYSTEM_PROMPT = `You are writing for Tümbo, a Singapore-based platform that helps parents find enrichment classes for kids. Your tone is warm, direct, slightly opinionated — like a trusted friend who's done the research.

Write a 2-3 paragraph description for a children's enrichment class. Be specific about what makes THIS class different. Never use corporate buzzwords like "unlock potential" or "empower your child." Never start with "At [provider name]" or "Classes at this provider."

If the website content mentions specific details (teaching method, class size, trial availability, curriculum approach), include them. If you don't have specifics, be honest and brief rather than making things up.`;

async function generateDescription(cls, websiteContent, reviews) {
  const userPrompt = `Write a description for this class:

Class: ${cls.name}
Category: ${cls.category || "General"}
Age range: ${cls.age_min && cls.age_max ? `${cls.age_min}-${cls.age_max} years` : "Not specified"}
${cls.price ? `Price: $${cls.price}` : ""}

${websiteContent ? `Website content:\n${websiteContent.meta ? websiteContent.meta + "\n\n" : ""}${websiteContent.body?.substring(0, 1500) || ""}` : "No website content available."}

${reviews ? `Parent reviews:\n${reviews.map((r) => `- "${r.text?.substring(0, 150)}"`).join("\n")}` : ""}

Write 2-3 short paragraphs. Be specific. No filler.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || null;
}

async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  AI Description Enrichment (GPT-4o-mini)");
  console.log("══════════════════════════════════════════\n");

  if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: Set OPENAI_API_KEY in .env.local");
    process.exit(1);
  }

  // Load ALL enriched classes (not just template ones — we'll improve all)
  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, provider_id, category, description, age_min, age_max, price, raw_reviews, discovered_from")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  // Filter to template descriptions only
  const toFix = allClasses.filter((c) => isTemplate(c.description));
  console.log(`Total classes: ${allClasses.length}`);
  console.log(`Template descriptions to fix: ${toFix.length}`);

  // Load providers
  const provIds = [...new Set(toFix.map((c) => c.provider_id).filter(Boolean))];
  let providers = [];
  for (let i = 0; i < provIds.length; i += 200) {
    const { data } = await sb
      .from("providers")
      .select("id, name, website")
      .in("id", provIds.slice(i, i + 200));
    if (data) providers = providers.concat(data);
  }
  const provMap = new Map(providers.map((p) => [p.id, p]));

  const estimate = toFix.length * 700 * (0.15 / 1000000 + 0.6 / 1000000);
  console.log(`Estimated cost: ~$${estimate.toFixed(2)}`);
  console.log(`\nStarting...\n`);

  let fixed = 0, failed = 0;
  const websiteCache = new Map();

  for (let i = 0; i < toFix.length; i++) {
    const cls = toFix[i];
    const prov = provMap.get(cls.provider_id);

    if (i > 0 && i % 25 === 0) {
      console.log(`── Progress: ${i}/${toFix.length} (${fixed} fixed, ${failed} failed) ──`);
    }

    try {
      // Get website content (cached per provider)
      let websiteContent = null;
      if (prov?.website?.startsWith("http")) {
        if (websiteCache.has(prov.id)) {
          websiteContent = websiteCache.get(prov.id);
        } else {
          const html = await fetchPage(prov.website);
          websiteContent = html ? extractText(html) : null;
          websiteCache.set(prov.id, websiteContent);
          await delay(200);
        }
      }

      // Get reviews
      let reviews = null;
      if (cls.raw_reviews) {
        try {
          reviews = JSON.parse(cls.raw_reviews).slice(0, 3);
        } catch {}
      }

      // Generate with GPT
      const newDesc = await generateDescription(cls, websiteContent, reviews);
      if (!newDesc || newDesc.length < 30) {
        failed++;
        continue;
      }

      // Update
      let sources;
      try {
        sources = cls.discovered_from ? JSON.parse(cls.discovered_from) : {};
      } catch {
        sources = {};
      }
      if (!sources.description) sources.description = [];
      const domain = prov?.website
        ? new URL(prov.website).hostname.replace("www.", "")
        : null;
      if (domain && !sources.description.includes(domain))
        sources.description.unshift(domain);
      if (!sources.description.includes("Tumbo editorial"))
        sources.description.push("Tumbo editorial");

      await sb
        .from("classes")
        .update({
          description: newDesc,
          discovered_from: JSON.stringify(sources),
        })
        .eq("id", cls.id);

      fixed++;
      process.stdout.write(`  ✓ ${cls.name.substring(0, 50).padEnd(52)} ${newDesc.substring(0, 50)}...\n`);

      await delay(100); // Rate limit
    } catch (err) {
      process.stdout.write(`  ✗ ${cls.name.substring(0, 50).padEnd(52)} ${err.message.substring(0, 40)}\n`);
      failed++;
      await delay(500);
    }
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Failed: ${failed}`);
  console.log("══════════════════════════════════════════\n");
}

run().catch(console.error);
