// ── GET /api/classes/browse ──
// Server-side paginated browse endpoint for the /classes grid.
// Replaces the client-side fetchAllVisibleClasses() full-dataset fetch.
//
// Handles: search, tag filter, price filter, age filter, deduplication.
// Returns only the columns needed for card display + pre-computed badges.
//
// Query params:
//   offset  - pagination offset (default 0)
//   limit   - items per page (default 24, max 48)
//   q       - search query
//   tag     - active tag label (matched via warm-tag pipeline)
//   age     - age range filter (e.g. "3-5")
//   price   - price range filter (e.g. "30-50")
//   exclude - comma-separated IDs to exclude (e.g. already shown in rails)

import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import { shouldExcludeFromRails } from "@/lib/rails/build-rail";
import type { DBClass } from "@/lib/types/tags";
import type { WarmTag } from "@/lib/rails/types";

// Columns needed for card display + tag derivation.
// ⚠️  DO NOT add raw_reviews — it is ~20 MB and was the root cause of /classes
//    being 28 MB per load. Also excluded: discovered_from (~1 MB), source.
const BROWSE_SELECT = [
  "id", "name", "provider_id", "summary", "vibe_line", "description",
  "typical_child_profile", "not_ideal_for", "outcome_expectations",
  "category", "age_min", "age_max", "photo_url", "google_rating",
  "review_count", "price", "is_placeholder", "hidden_from_directory",
].join(",");

// Category fallback images (same as build-rail.ts)
const CATEGORY_IMAGES: Record<string, string> = {
  Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=70",
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=70",
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70",
  Swimming: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=400&q=70",
  Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=70",
};

interface BrowseCardItem {
  id: string;
  title: string;
  providerName?: string;
  description: string;
  image: string;
  badges: { label: string; category: string }[];
  href: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
  vibeLine?: string;
}

// ── Server-side cache for class pool + provider names ──
// Shared across requests within the same serverless instance.
// 5 min TTL avoids re-fetching 1,200 rows on every browse request.
const CACHE_TTL = 300_000;

let classPoolCache: { rows: DBClass[]; ts: number } | null = null;
let providerCache: { map: Record<string, string>; ts: number } | null = null;

async function getCachedClassPool(supabase: ReturnType<typeof createServer>): Promise<DBClass[]> {
  const now = Date.now();
  if (classPoolCache && now - classPoolCache.ts < CACHE_TTL) return classPoolCache.rows;

  const allRows: DBClass[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data } = await supabase
      .from("classes")
      .select(BROWSE_SELECT)
      .eq("is_placeholder", false)
      .eq("hidden_from_directory", false)
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    allRows.push(...(data as DBClass[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  classPoolCache = { rows: allRows, ts: now };
  return allRows;
}

async function getProviderMap(supabase: ReturnType<typeof createServer>): Promise<Record<string, string>> {
  const now = Date.now();
  if (providerCache && now - providerCache.ts < CACHE_TTL) return providerCache.map;

  const { data } = await supabase.from("providers").select("id, name").limit(10000);
  const map: Record<string, string> = {};
  for (const p of data ?? []) map[p.id] = p.name;
  providerCache = { map, ts: now };
  return map;
}

function classQuality(cls: DBClass): number {
  let s = 0;
  if (cls.description) s += Math.min(cls.description.length, 500);
  if (cls.summary) s += 100;
  if (cls.vibe_line) s += 50;
  if (cls.google_rating) s += cls.google_rating * 20;
  if (cls.review_count) s += Math.min(cls.review_count, 50);
  if (cls.age_min != null) s += 30;
  if (cls.photo_url) s += 40;
  return s;
}

function deduplicateByProvider(classes: DBClass[]): DBClass[] {
  const best = new Map<string, DBClass>();
  for (const cls of classes) {
    const key = cls.provider_id ?? cls.id;
    const existing = best.get(key);
    if (!existing || classQuality(cls) > classQuality(existing)) {
      best.set(key, cls);
    }
  }
  return Array.from(best.values());
}

function toCardItem(cls: DBClass, providerMap: Record<string, string>): BrowseCardItem {
  const tags: WarmTag[] = selectDisplayTags(cls);
  return {
    id: cls.id,
    title: cls.name,
    providerName: cls.provider_id ? providerMap[cls.provider_id] : undefined,
    description: cls.summary || cls.vibe_line || (cls.description ?? "").slice(0, 200) || "",
    image: cls.photo_url || CATEGORY_IMAGES[cls.category || ""] || CATEGORY_IMAGES.Art,
    badges: tags.map((t) => ({ label: t.label, category: t.dimension })),
    href: `/classes/${cls.id}`,
    category: cls.category ?? undefined,
    ageMin: cls.age_min ?? undefined,
    ageMax: cls.age_max ?? undefined,
    vibeLine: cls.vibe_line ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0") || 0);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "24") || 24), 48);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const tagFilter = searchParams.get("tag") ?? "";
  const ageParam = searchParams.get("age") ?? "";
  const priceParam = searchParams.get("price") ?? "";
  const excludeRaw = searchParams.get("exclude") ?? "";
  const excludeIds = new Set(excludeRaw ? excludeRaw.split(",").filter(Boolean) : []);

  const supabase = createServer();

  // Use cached class pool (5 min TTL) — avoids re-fetching 1,200 rows on every request.
  const allRows = await getCachedClassPool(supabase);

  // Deduplicate by provider, then apply centralized exclusion filter
  let pool = deduplicateByProvider(allRows).filter((c) => !shouldExcludeFromRails(c));

  // Exclude IDs (already shown in rails)
  if (excludeIds.size > 0) {
    pool = pool.filter((c) => !excludeIds.has(c.id));
  }

  // Apply filters server-side
  if (query) {
    pool = pool.filter((c) => {
      const haystack = [c.name, c.description, c.category, c.vibe_line, c.summary]
        .filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  if (tagFilter) {
    pool = pool.filter((c) => {
      const cardTags = selectDisplayTags(c);
      return cardTags.some((t) => t.label === tagFilter);
    });
  }

  if (ageParam) {
    const [minStr, maxStr] = ageParam.split("-");
    const ageMin = parseInt(minStr) || 0;
    const ageMax = parseInt(maxStr) || 99;
    pool = pool.filter((c) => {
      const cMin = c.age_min ?? 0;
      const cMax = c.age_max ?? 99;
      return cMin <= ageMax && cMax >= ageMin;
    });
  }

  if (priceParam) {
    if (priceParam === "under30") pool = pool.filter((c) => c.price != null && c.price < 30);
    else if (priceParam === "30-50") pool = pool.filter((c) => c.price != null && c.price >= 30 && c.price <= 50);
    else if (priceParam === "50-80") pool = pool.filter((c) => c.price != null && c.price > 50 && c.price <= 80);
    else if (priceParam === "over80") pool = pool.filter((c) => c.price != null && c.price > 80);
  }

  const total = pool.length;
  const page = pool.slice(offset, offset + limit);

  // Resolve provider names and build card items
  const providerMap = await getProviderMap(supabase);
  const items = page.map((cls) => toCardItem(cls, providerMap));

  return NextResponse.json(
    {
      items,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    },
    {
      headers: {
        "Cache-Control": query || tagFilter || ageParam || priceParam
          ? "private, no-store"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
