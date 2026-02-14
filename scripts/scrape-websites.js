/**
 * Provider Website Scraper
 * ═════════════════════════
 * Scrapes real content from provider websites to replace template descriptions.
 *
 * Strategy:
 *   1. Fetch each provider's website
 *   2. Extract meaningful text (strip nav/footer/scripts)
 *   3. Pattern-match for: price, age range, schedule, class types
 *   4. Build a real description from the website content
 *   5. Update classes in Supabase with real data + source attribution
 *
 * Run: node scripts/scrape-websites.js
 */

const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Website fetcher with timeout and retry ──
async function fetchPage(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return null;

      return await res.text();
    } catch {
      if (i < retries) await delay(1000);
    }
  }
  return null;
}

// ── Extract clean text and structured data from HTML ──
function extractContent(html, url) {
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, nav, footer, header, iframe, noscript, svg, .cookie-banner, .popup, #cookie").remove();

  // Get metadata
  const title = $("title").text().trim();
  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  // Get main content text
  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  // Get structured content from key sections
  const sections = [];
  $("h1, h2, h3, h4").each((_, el) => {
    const heading = $(el).text().trim();
    const nextText = $(el)
      .nextUntil("h1, h2, h3, h4")
      .text()
      .replace(/\s+/g, " ")
      .trim();
    if (heading && nextText && nextText.length > 30) {
      sections.push({ heading, text: nextText.substring(0, 500) });
    }
  });

  // ── Pattern extraction ──
  const data = {
    title,
    metaDesc: metaDesc.substring(0, 300),
    bodyText: bodyText.substring(0, 5000),
    sections: sections.slice(0, 10),
    domain: new URL(url).hostname.replace("www.", ""),
  };

  // Price extraction: $XX, SGD XX, from $XX
  const pricePatterns = [
    /\$\s*(\d{1,4}(?:\.\d{2})?)\s*(?:\/|per)\s*(?:session|lesson|class|term|month)/i,
    /(?:from|starting)\s*\$\s*(\d{1,4})/i,
    /SGD\s*(\d{1,4})/i,
    /\$\s*(\d{2,4})\s*(?:for|per)\s+(\d+)\s*(?:session|lesson|class)/i,
  ];
  for (const p of pricePatterns) {
    const m = bodyText.match(p);
    if (m) {
      data.price = parseFloat(m[1]);
      data.priceContext = m[0].substring(0, 60);
      break;
    }
  }

  // Age extraction: ages X-Y, X to Y years, for X-Y year olds
  const agePatterns = [
    /(?:ages?|for)\s*(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})\s*(?:years?|yrs?|year.?olds?)?/i,
    /(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})\s*(?:years?|yrs?)\s*old/i,
    /(?:children|kids)\s+(?:aged?)\s+(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})/i,
  ];
  for (const p of agePatterns) {
    const m = bodyText.match(p);
    if (m) {
      data.ageMin = parseInt(m[1]);
      data.ageMax = parseInt(m[2]);
      if (data.ageMin > data.ageMax) [data.ageMin, data.ageMax] = [data.ageMax, data.ageMin];
      if (data.ageMax > 18) data.ageMax = undefined;
      break;
    }
  }

  // Schedule extraction
  const schedulePatterns = [
    /(?:every|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\s*(?:&|and|,)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)?s?\s*(?:,\s*)?(\d{1,2}[:.]\d{2}\s*(?:am|pm)?(?:\s*[-–to]+\s*\d{1,2}[:.]\d{2}\s*(?:am|pm)?)?)?/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\s*[-–:]\s*(\d{1,2}[:.]\d{2}\s*(?:am|pm)?\s*[-–to]+\s*\d{1,2}[:.]\d{2}\s*(?:am|pm)?)/i,
  ];
  for (const p of schedulePatterns) {
    const m = bodyText.match(p);
    if (m) {
      data.schedule = m[0].substring(0, 80);
      break;
    }
  }

  return data;
}

// ── Build a real description from scraped content ──
function buildDescription(scraped, cls) {
  const parts = [];

  // Use meta description as opening if it's substantive
  if (scraped.metaDesc && scraped.metaDesc.length > 50) {
    parts.push(scraped.metaDesc);
  }

  // Find relevant sections from the page
  const classCategory = (cls.category || "").toLowerCase();
  const className = (cls.name || "").toLowerCase();

  for (const section of scraped.sections) {
    const heading = section.heading.toLowerCase();
    const text = section.text;

    // Prioritise sections about: classes, programmes, courses, about us, what we offer
    if (
      heading.includes("class") ||
      heading.includes("programme") ||
      heading.includes("course") ||
      heading.includes("about") ||
      heading.includes("what we") ||
      heading.includes("our ") ||
      heading.includes(classCategory) ||
      heading.includes("approach") ||
      heading.includes("method") ||
      heading.includes("philosophy") ||
      heading.includes("why") ||
      heading.includes("curriculum")
    ) {
      if (text.length > 40 && !parts.includes(text)) {
        parts.push(text);
      }
    }
  }

  // If we found very little from sections, use a chunk of body text
  if (parts.join(" ").length < 100 && scraped.bodyText.length > 100) {
    // Find the most relevant chunk of body text
    const body = scraped.bodyText;
    const keywords = [classCategory, "class", "programme", "learn", "teach", "child", "kids", "student"];
    let bestStart = 0;
    let bestScore = 0;

    for (let i = 0; i < Math.min(body.length, 3000); i += 50) {
      const chunk = body.substring(i, i + 400).toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (kw && chunk.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestStart = i;
      }
    }

    if (bestScore > 0) {
      // Find sentence boundaries
      let start = body.lastIndexOf(". ", bestStart) + 2;
      if (start < 2) start = 0;
      let end = body.indexOf(". ", bestStart + 300);
      if (end < 0) end = bestStart + 400;
      else end += 1;

      parts.push(body.substring(start, end).trim());
    }
  }

  // Combine and clean
  let desc = parts.join("\n\n").trim();

  // Remove excessive whitespace and clean up
  desc = desc
    .replace(/\s+/g, " ")
    .replace(/\. \./g, ".")
    .replace(/\s+\./g, ".")
    .trim();

  // Cap at ~600 chars for a good description length
  if (desc.length > 700) {
    const cutOff = desc.lastIndexOf(". ", 700);
    if (cutOff > 200) desc = desc.substring(0, cutOff + 1);
    else desc = desc.substring(0, 700) + "...";
  }

  return desc.length > 50 ? desc : null;
}

// ══════════════════════════════════════════
// ── MAIN PIPELINE ──
// ══════════════════════════════════════════
async function run() {
  const startTime = Date.now();
  console.log("══════════════════════════════════════════");
  console.log("  Provider Website Scraper");
  console.log("══════════════════════════════════════════\n");

  // 1. Get all enriched classes with their providers
  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, provider_id, category, description, age_min, age_max, price, schedule, discovered_from, photo_url")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  // Group by provider
  const classesByProvider = new Map();
  for (const cls of allClasses) {
    if (!cls.provider_id) continue;
    if (!classesByProvider.has(cls.provider_id)) classesByProvider.set(cls.provider_id, []);
    classesByProvider.get(cls.provider_id).push(cls);
  }

  const providerIds = [...classesByProvider.keys()];

  // 2. Get providers with websites
  let providers = [];
  for (let i = 0; i < providerIds.length; i += 200) {
    const batch = providerIds.slice(i, i + 200);
    const { data } = await sb
      .from("providers")
      .select("id, name, website")
      .in("id", batch);
    if (data) providers = providers.concat(data);
  }

  // Filter to only providers with websites
  const withWebsites = providers.filter((p) => {
    if (!p.website) return false;
    const url = p.website.trim();
    return url.startsWith("http://") || url.startsWith("https://");
  });

  console.log(`Total enriched classes: ${allClasses.length}`);
  console.log(`Providers with websites: ${withWebsites.length} / ${providers.length}`);
  console.log(`Estimated time: ~${Math.ceil(withWebsites.length * 0.5 / 60)} minutes\n`);

  let scraped = 0, failed = 0, updated = 0, noContent = 0;
  let pricesFound = 0, agesFound = 0, schedulesFound = 0;

  for (let i = 0; i < withWebsites.length; i++) {
    const provider = withWebsites[i];
    const classes = classesByProvider.get(provider.id) || [];

    // Progress
    if (i > 0 && i % 50 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = i / elapsed;
      const remaining = Math.ceil((withWebsites.length - i) / rate / 60);
      console.log(`\n── Progress: ${i}/${withWebsites.length} (${scraped} scraped, ${updated} updated, ${failed} failed) ~${remaining}min left ──\n`);
    }

    try {
      // Scrape
      const html = await fetchPage(provider.website);
      if (!html) {
        failed++;
        continue;
      }

      const content = extractContent(html, provider.website);
      scraped++;

      // Update each class under this provider
      for (const cls of classes) {
        const updates = {};
        let sourcesChanged = false;
        let sources;
        try {
          sources = cls.discovered_from ? JSON.parse(cls.discovered_from) : {};
        } catch {
          sources = {};
        }

        // Build real description from scraped content
        const newDesc = buildDescription(content, cls);
        if (newDesc && newDesc.length > cls.description?.length * 0.5) {
          updates.description = newDesc;
          if (!sources.description) sources.description = [];
          if (!sources.description.includes(content.domain)) {
            sources.description.unshift(content.domain);
            sourcesChanged = true;
          }
        }

        // Price
        if (content.price && !cls.price) {
          updates.price = content.price;
          if (!sources.price) sources.price = [];
          if (!sources.price.includes(content.domain)) sources.price.push(content.domain);
          sourcesChanged = true;
          pricesFound++;
        }

        // Age range
        if (content.ageMin && content.ageMax && !cls.age_min) {
          updates.age_min = content.ageMin;
          updates.age_max = content.ageMax;
          if (!sources.age_range) sources.age_range = [];
          if (!sources.age_range.includes(content.domain)) sources.age_range.push(content.domain);
          sourcesChanged = true;
          agesFound++;
        }

        // Schedule
        if (content.schedule && !cls.schedule) {
          updates.schedule = content.schedule;
          if (!sources.schedule) sources.schedule = [];
          if (!sources.schedule.includes(content.domain)) sources.schedule.push(content.domain);
          sourcesChanged = true;
          schedulesFound++;
        }

        if (sourcesChanged) {
          updates.discovered_from = JSON.stringify(sources);
        }

        if (Object.keys(updates).length > 0) {
          await sb.from("classes").update(updates).eq("id", cls.id);
          updated++;
        }
      }

      // Compact log
      const descLen = content.bodyText?.length || 0;
      const price = content.price ? `$${content.price}` : "-";
      const age = content.ageMin ? `${content.ageMin}-${content.ageMax}` : "-";
      process.stdout.write(
        `  ✓ ${provider.name.substring(0, 38).padEnd(40)} ${String(descLen).padStart(5)}ch  ${price.padEnd(6)} age:${age.padEnd(6)} ${classes.length}cls\n`
      );

      await delay(300); // Be polite
    } catch (err) {
      process.stdout.write(`  ✗ ${provider.name.substring(0, 38).padEnd(40)} ${err.message.substring(0, 40)}\n`);
      failed++;
      await delay(500);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Websites scraped:     ${scraped}`);
  console.log(`  Classes updated:      ${updated}`);
  console.log(`  Failed to fetch:      ${failed}`);
  console.log(`  No useful content:    ${noContent}`);
  console.log(`  Prices extracted:     ${pricesFound}`);
  console.log(`  Age ranges extracted: ${agesFound}`);
  console.log(`  Schedules extracted:  ${schedulesFound}`);
  console.log(`  Time:                 ${elapsed} minutes`);
  console.log("══════════════════════════════════════════\n");
}

run().catch(console.error);
