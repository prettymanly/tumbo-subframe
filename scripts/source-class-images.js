/**
 * Source Class Images — Quality-gated, verified image sourcing
 * ═══════════════════════════════════════════════════════════
 *
 * Cascade: 1) Provider website (OG/Twitter + hero scan)  2) Google Places (stored)
 * Applies quality gate and verification; never accepts without evidence.
 *
 * Usage:
 *   node scripts/source-class-images.js           # all classes (respects photo_override)
 *   node scripts/source-class-images.js --limit 5
 *   node scripts/source-class-images.js --dry-run
 *   node scripts/source-class-images.js --limit 3 --dry-run
 *   node scripts/source-class-images.js --class-id <uuid>   # single class
 *
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * Optional: GOOGLE_PLACES_API_KEY only if Google photos are not already in classes_scrape_source
 */

const cheerio = require("cheerio");
const imageSize = require("image-size");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Quality gate constants ──
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const MIN_BYTES = 3000; // ~3KB — lowered from 8KB; well-compressed WebP/JPEG can be small
const MIN_BYTES_SVG = 500; // SVGs can be tiny but still valid
const MAX_ASPECT = 2.5;
const MIN_ASPECT = 0.5;
const FETCH_TIMEOUT_MS = 12000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB cap when checking dimensions

// ── Known CDN domains (images hosted here found on a provider's page are trusted) ──
const TRUSTED_CDN_PATTERNS = [
  /\.shopify\.com$/i,
  /\.squarespace-cdn\.com$/i,
  /\.squarespace\.com$/i,
  /\.wp\.com$/i,
  /\.wordpress\.com$/i,
  /\.wixstatic\.com$/i,
  /\.wix\.com$/i,
  /\.cloudinary\.com$/i,
  /\.imgix\.net$/i,
  /\.contentful\.com$/i,
  /\.amazonaws\.com$/i,
  /\.cloudfront\.net$/i,
  /\.googleusercontent\.com$/i,
  /\.ggpht\.com$/i,
  /\.googleapis\.com$/i,
  /\.fbcdn\.net$/i,
  /\.cdninstagram\.com$/i,
  /\.pinimg\.com$/i,
  /\.medium\.com$/i,
  /\.ghost\.io$/i,
  /\.netlify\.app$/i,
  /\.vercel\.app$/i,
  /\.strikinglycdn\.com$/i,
  /\.weeblysite\.com$/i,
  /\.jimdocdn\.com$/i,
  /\.scdn\.co$/i,
  /\.hubspotusercontent.*\.net$/i,
  /\.ctfassets\.net$/i,
  /\.akamaized\.net$/i,
  /\.fastly\.net$/i,
  /\.twimg\.com$/i,
  /\.unsplash\.com$/i,
];

function isTrustedCdn(hostname) {
  return TRUSTED_CDN_PATTERNS.some((re) => re.test(hostname));
}

// ── Reject paths that look like favicon/logo ──
const LOGO_FAVICON_PATTERNS = [
  /favicon\.(ico|png|jpg|jpeg|gif|webp)$/i,
  /logo[-_\s%20]*\w*\.(png|jpg|jpeg|gif|webp|svg|avif)/i, // "logo.png", "Logo white.png", "logo-dark.svg"
  /\/logo[^/]*$/i, // path ending with "logo..." segment
  /icon[-_]?(16|32|64|180|192|512)\./i,
  /apple[-_]?touch[-_]?icon/i,
  /site[-_]?icon/i,
];

// ── Try to extract dimensions from CDN URL params (Wix, Shopify, Imgix, etc.) ──
function parseDimensionsFromUrl(url) {
  try {
    const u = new URL(url);
    // Wix: /v1/fill/w_400,h_300,...
    const wixMatch = url.match(/\/w_(\d+),h_(\d+)/);
    if (wixMatch) return { width: parseInt(wixMatch[1]), height: parseInt(wixMatch[2]) };
    // Shopify: /files/..._{width}x{height}...
    const shopifyMatch = url.match(/_(\d{2,4})x(\d{2,4})\./);
    if (shopifyMatch) return { width: parseInt(shopifyMatch[1]), height: parseInt(shopifyMatch[2]) };
    // Query params: ?w=400&h=300 or ?width=400&height=300
    const w = u.searchParams.get("w") || u.searchParams.get("width");
    const h = u.searchParams.get("h") || u.searchParams.get("height");
    if (w && h) return { width: parseInt(w), height: parseInt(h) };
    return null;
  } catch { return null; }
}

function looksLikeLogoOrFavicon(url) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return LOGO_FAVICON_PATTERNS.some((re) => re.test(path));
  } catch {
    return false;
  }
}

/** Fetch image and return { ok, contentType, dimensions, reason } without loading full body into memory for huge files */
async function checkImageQuality(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "image/*,*/*" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const isSvg = contentType === "image/svg+xml" || url.endsWith(".svg");

    // SVGs: accept if content-type is right and body is non-trivial
    if (isSvg) {
      const text = await res.text();
      if (text.length < MIN_BYTES_SVG) return { ok: false, reason: `SVG too small (${text.length} chars)` };
      // SVGs are scalable — don't check pixel dimensions, just accept if non-trivial
      return { ok: true, contentType: "image/svg+xml", dimensions: { width: 800, height: 600 }, reason: "ok (svg)" };
    }

    if (!contentType.startsWith("image/")) return { ok: false, reason: `not image (${contentType})` };

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) < MIN_BYTES)
      return { ok: false, reason: `too small (${contentLength} bytes)` };

    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length < MIN_BYTES) return { ok: false, reason: `too small (${bytes.length} bytes)` };
    if (bytes.length > MAX_IMAGE_BYTES) return { ok: false, reason: `too large (${(bytes.length / 1024 / 1024).toFixed(1)}MB)` };

    let dimensions;
    try {
      dimensions = imageSize(Buffer.from(bytes));
    } catch (dimErr) {
      // image-size failed — try extracting dimensions from URL params (CDN resize URLs)
      const urlDims = parseDimensionsFromUrl(url);
      if (urlDims && urlDims.width >= MIN_WIDTH && urlDims.height >= MIN_HEIGHT) {
        const aspect = urlDims.width / urlDims.height;
        if (aspect >= MIN_ASPECT && aspect <= MAX_ASPECT) {
          return { ok: true, contentType, dimensions: { ...urlDims, fromUrl: true }, reason: `ok (dims from URL: ${urlDims.width}×${urlDims.height})` };
        }
        return { ok: false, reason: `aspect ratio ${aspect.toFixed(2)} outside ${MIN_ASPECT}–${MAX_ASPECT} (from URL dims)` };
      }
      if (urlDims) {
        return { ok: false, reason: `dimensions too small from URL (${urlDims.width}×${urlDims.height}, min ${MIN_WIDTH}×${MIN_HEIGHT})` };
      }
      // No URL dims either — accept known formats if large enough (likely a real photo)
      const isKnownFormat = /^image\/(jpeg|jpg|png|gif|webp|avif|bmp|tiff)$/.test(contentType);
      if (isKnownFormat && bytes.length >= 15000) {
        // 15KB+ for unknown-dimension images — more conservative to avoid accepting small icons
        return { ok: true, contentType, dimensions: { width: 0, height: 0, estimated: true }, reason: `ok (dimension parse failed; accepted by content-type + size ${bytes.length}b)` };
      }
      return { ok: false, reason: `could not read image dimensions (${dimErr.message}, ${contentType}, ${bytes.length}b)` };
    }

    if (!dimensions.width || !dimensions.height) {
      const urlDims = parseDimensionsFromUrl(url);
      if (urlDims && urlDims.width >= MIN_WIDTH && urlDims.height >= MIN_HEIGHT) {
        return { ok: true, contentType, dimensions: { ...urlDims, fromUrl: true }, reason: `ok (dims from URL: ${urlDims.width}×${urlDims.height})` };
      }
      const isKnownFormat = /^image\/(jpeg|jpg|png|gif|webp|avif|bmp|tiff)$/.test(contentType);
      if (isKnownFormat && bytes.length >= 15000) {
        return { ok: true, contentType, dimensions: { width: 0, height: 0, estimated: true }, reason: "ok (no dimensions but known format + sufficient size)" };
      }
      return { ok: false, reason: "missing width/height" };
    }

    const w = dimensions.width;
    const h = dimensions.height;
    if (w < MIN_WIDTH || h < MIN_HEIGHT)
      return { ok: false, reason: `dimensions too small (${w}×${h}, min ${MIN_WIDTH}×${MIN_HEIGHT})` };

    const aspect = w / h;
    if (aspect < MIN_ASPECT || aspect > MAX_ASPECT)
      return { ok: false, reason: `aspect ratio ${aspect.toFixed(2)} outside ${MIN_ASPECT}–${MAX_ASPECT}` };

    return { ok: true, contentType, dimensions: { width: w, height: h }, reason: "ok" };
  } catch (e) {
    clearTimeout(timeout);
    return { ok: false, reason: e.name === "AbortError" ? "timeout" : e.message };
  }
}

/** Resolve url relative to base */
function resolveUrl(base, url) {
  if (!url || !url.trim()) return null;
  url = url.trim();
  if (/^https?:\/\//i.test(url)) return url;
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

/** Get provider's official domain (no www) */
function providerDomain(provider) {
  let url = provider.website || null;
  if (!url && provider.classes_scrape_source) {
    try {
      const g = JSON.parse(provider.classes_scrape_source);
      url = g.google_website || null;
    } catch {}
  }
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Verify image URL belongs to provider (domain match or trusted CDN found on their page) */
function verifyWebsiteImage(imageUrl, provider) {
  const domain = providerDomain(provider);
  if (!domain) return { verified: false, reason: "no provider domain" };
  try {
    const imgHost = new URL(imageUrl).hostname.replace(/^www\./, "");
    // Direct domain match
    if (imgHost === domain) return { verified: true, reason: "domain_match" };
    if (imgHost.endsWith("." + domain) || domain.endsWith("." + imgHost)) return { verified: true, reason: "domain_match" };
    // Trusted CDN — image was found on the provider's own page, hosted on a known CDN
    if (isTrustedCdn(imgHost)) return { verified: true, reason: `cdn_on_provider_page (${imgHost})` };
    return { verified: false, reason: `domain mismatch (image: ${imgHost}, provider: ${domain})` };
  } catch {
    return { verified: false, reason: "invalid image URL" };
  }
}

/** Fetch HTML of provider website */
async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TumboBot/1.0; +https://tumbo.sg)",
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
    clearTimeout(timeout);
    return null;
  }
}

/** Extract OG/Twitter image and hero-like image URLs from HTML */
function extractImageCandidates(html, pageUrl) {
  const $ = cheerio.load(html);
  const candidates = [];

  const og = $('meta[property="og:image"]').attr("content");
  const twitter = $('meta[name="twitter:image"], meta[property="twitter:image"]').attr("content");
  if (og) candidates.push({ url: resolveUrl(pageUrl, og), type: "og:image" });
  if (twitter) candidates.push({ url: resolveUrl(pageUrl, twitter), type: "twitter:image" });

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    const full = resolveUrl(pageUrl, src);
    if (!full) return;
    const w = parseInt($(el).attr("width"), 10);
    const h = parseInt($(el).attr("height"), 10);
    candidates.push({
      url: full,
      type: "img",
      width: w || null,
      height: h || null,
    });
  });

  const seen = new Set();
  return candidates.filter((c) => {
    if (!c.url || seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

/** Try website as source: fetch page, get candidates, quality + verify, return first accepted or null */
async function tryWebsite(provider, classId, log) {
  const pageUrl = provider.website || null;
  if (!pageUrl) return null;
  let urlToFetch = pageUrl;
  if (!/^https?:\/\//i.test(urlToFetch)) urlToFetch = "https://" + urlToFetch;

  const html = await fetchPage(urlToFetch);
  if (!html) {
    log(`      [website] could not fetch page`);
    return null;
  }

  const candidates = extractImageCandidates(html, urlToFetch);
  const rejected = [];

  for (const cand of candidates) {
    if (!cand.url) continue;
    if (looksLikeLogoOrFavicon(cand.url)) {
      rejected.push({ url: cand.url, reason: "logo/favicon path" });
      continue;
    }

    const quality = await checkImageQuality(cand.url);
    if (!quality.ok) {
      rejected.push({ url: cand.url, reason: quality.reason });
      continue;
    }

    const ver = verifyWebsiteImage(cand.url, provider);
    if (!ver.verified) {
      rejected.push({ url: cand.url, reason: ver.reason });
      continue;
    }

    log(`      [website] ACCEPTED ${cand.url} (${quality.dimensions.width}×${quality.dimensions.height}, ${ver.reason})`);
    return {
      url: cand.url,
      source_type: "website",
      verified: true,
      verification_reason: ver.reason,
      rejected_candidates: rejected.slice(0, 10),
    };
  }

  if (rejected.length) log(`      [website] rejected ${rejected.length} candidate(s): ${rejected.map((r) => r.reason).join("; ")}`);
  return null;
}

/** Try Google Places (stored photos). Verification = we own the place_id. */
function tryGooglePlaces(provider, classIndex, classTotal, log) {
  let gd;
  try {
    gd = JSON.parse(provider.classes_scrape_source || "{}");
  } catch {
    return null;
  }
  const photos = gd.google_photos || [];
  if (photos.length === 0) {
    log(`      [google_places] no stored photos`);
    return null;
  }

  let url = photos[classIndex % photos.length];
  // Fix relative paths — prepend Google Places base URL if needed
  if (url && !url.startsWith("http")) {
    url = `https://places.googleapis.com/v1/${url.replace(/^\/+/, "")}`;
  }
  log(`      [google_places] using stored photo (place_id verified): ${url.substring(0, 60)}…`);
  return {
    url,
    source_type: "google_places",
    verified: true,
    verification_reason: "google_place_id",
    rejected_candidates: [],
  };
}

/** Run quality check on Google Places URL (they're typically 800px, so we may only HEAD) */
async function checkGooglePhotoUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return { ok: false, reason: `content-type ${ct}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function run() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : null;
  const classIdIdx = args.indexOf("--class-id");
  const singleClassId = classIdIdx >= 0 && args[classIdIdx + 1] ? args[classIdIdx + 1] : null;
  const dryRun = args.includes("--dry-run");

  console.log("══════════════════════════════════════════════════════════");
  console.log("  Source Class Images — Quality-gated, verified");
  console.log("══════════════════════════════════════════════════════════\n");
  if (dryRun) console.log("  [DRY RUN — no DB updates]\n");

  const skipProcessed = args.includes("--skip-processed");

  let classes = [];
  if (singleClassId) {
    const { data: one } = await sb.from("classes").select("id, name, provider_id, photo_url, discovered_from").eq("id", singleClassId).single();
    classes = one ? [one] : [];
  } else {
    // Paginate to fetch ALL classes (Supabase caps at 1000 per query)
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data: page, error } = await sb
        .from("classes")
        .select("id, name, provider_id, photo_url, discovered_from")
        .eq("is_placeholder", false)
        .range(from, from + pageSize - 1);
      if (error) { console.error("DB fetch error:", error.message); break; }
      if (!page || page.length === 0) break;
      classes = classes.concat(page);
      if (page.length < pageSize) break;
      from += pageSize;
    }
    console.log(`  Fetched ${classes.length} classes from DB`);

    // Optionally skip classes that already have verified photo_metadata
    if (skipProcessed) {
      const before = classes.length;
      classes = classes.filter((c) => {
        try {
          const df = typeof c.discovered_from === "string" ? JSON.parse(c.discovered_from) : (c.discovered_from || {});
          return !df.photo_metadata;
        } catch { return true; }
      });
      console.log(`  Skipping ${before - classes.length} already-processed (have photo_metadata)`);
      console.log(`  Will process ${classes.length} remaining classes\n`);
    }

    if (limit) {
      classes = classes.slice(0, limit);
    }
  }

  const providerIds = [...new Set(classes.map((c) => c.provider_id).filter(Boolean))];
  let providers = [];
  for (let i = 0; i < providerIds.length; i += 200) {
    const batch = providerIds.slice(i, i + 200);
    const { data } = await sb.from("providers").select("id, name, website, classes_scrape_source").in("id", batch);
    if (data) providers = providers.concat(data);
  }
  const providerMap = new Map(providers.map((p) => [p.id, p]));

  let updated = 0;
  let skippedOverride = 0;
  let noSource = 0;

  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const provider = cls.provider_id ? providerMap.get(cls.provider_id) : null;

    let discoveredFrom = {};
    try {
      discoveredFrom = JSON.parse(cls.discovered_from || "{}");
    } catch {}

    if (discoveredFrom.photo_override) {
      skippedOverride++;
      console.log(`[${i + 1}/${classes.length}] ${cls.name} — skipped (photo_override)\n`);
      continue;
    }

    const log = (msg) => console.log(msg);

    console.log(`[${i + 1}/${classes.length}] ${cls.name}`);
    const providerClasses = classes.filter((c) => c.provider_id === cls.provider_id);
    const classIndex = providerClasses.findIndex((c) => c.id === cls.id);

    let result = await tryWebsite(provider || {}, cls.id, log);
    if (result) {
      const googleCheck = await checkGooglePhotoUrl(result.url);
      if (!googleCheck.ok && result.source_type === "website") {
        // already accepted website
      }
    }

    if (!result && provider) {
      result = tryGooglePlaces(provider, classIndex, providerClasses.length, log);
      if (result) {
        if (!result.url.includes("places.googleapis.com")) {
          const check = await checkGooglePhotoUrl(result.url);
          if (!check.ok) {
            log(`      [google_places] URL check failed: ${check.reason} — skipping`);
            result = null;
          }
        }
      }
    }

    if (!result) {
      noSource++;
      log(`      → no accepted source; leaving photo_url unchanged\n`);
      continue;
    }

    if (dryRun) {
      log(`      [dry-run] would set photo_url and photo_metadata\n`);
      updated++;
      continue;
    }

    const sources = discoveredFrom.photo ? (Array.isArray(discoveredFrom.photo) ? discoveredFrom.photo : [discoveredFrom.photo]) : [];
    const sourceLabel = result.source_type === "website" ? (providerDomain(provider) || "website") : "Google";
    if (!sources.includes(sourceLabel)) sources.push(sourceLabel);

    const updates = {
      photo_url: result.url,
      discovered_from: JSON.stringify({
        ...discoveredFrom,
        photo: sources,
        photo_metadata: {
          source_type: result.source_type,
          verified: result.verified,
          verification_reason: result.verification_reason,
          rejected_candidates: (result.rejected_candidates || []).slice(0, 5),
        },
      }),
    };

    const { error } = await sb.from("classes").update(updates).eq("id", cls.id);
    if (error) {
      log(`      DB error: ${error.message}\n`);
    } else {
      updated++;
      log(`      → updated photo_url + photo_metadata`);
      log(`      → View: /classes/${cls.id}\n`);
    }

    await delay(400);
  }

  console.log("══════════════════════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Processed:    ${classes.length}`);
  console.log(`  Updated:      ${updated}`);
  console.log(`  Skipped:      ${skippedOverride} (photo_override)`);
  console.log(`  No source:    ${noSource}`);
  if (dryRun) console.log("  (dry run — no changes written)");
  console.log("══════════════════════════════════════════════════════════\n");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
