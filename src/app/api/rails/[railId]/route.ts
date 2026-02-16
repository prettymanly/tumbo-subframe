// ── GET /api/rails/:railId ──
// Server-side rail builder. Scores, shuffles, and returns card items.
//
// Query params:
//   seed    - session seed (number)
//   lat/lng - optional user location
//   exclude - comma-separated class IDs already shown
//   cursor  - pagination cursor (offset-based for now)
//   limit   - items per page (default 12)
//   chip    - active intent chip id (e.g. "build-confidence") for global re-ranking

import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { visibleClassesQuery } from "@/lib/supabase/queries";
import { RAIL_MAP } from "@/lib/rails/config";
import { buildRail, buildSerendipityRail } from "@/lib/rails/build-rail";
import type { ScoringContext, RailApiResponse } from "@/lib/rails/types";
import type { DBClass, Provider } from "@/lib/types/tags";

// Cache the class pool in memory for 60s to avoid hitting Supabase on every rail request
let classCache: { classes: DBClass[]; providers: Record<string, { name: string }>; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

async function getClassPool() {
  const now = Date.now();
  if (classCache && now - classCache.ts < CACHE_TTL_MS) {
    return classCache;
  }

  const supabase = createServer();
  const [classRes, providerRes] = await Promise.all([
    visibleClassesQuery(supabase).limit(10000),
    supabase.from("providers").select("id, name").limit(10000),
  ]);

  const classes = (classRes.data ?? []) as DBClass[];
  const providers: Record<string, { name: string }> = {};
  for (const p of (providerRes.data ?? []) as Provider[]) {
    providers[p.id] = { name: p.name };
  }

  classCache = { classes, providers, ts: now };
  return classCache;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ railId: string }> }
) {
  const { railId } = await params;
  const rail = RAIL_MAP[railId];

  if (!rail) {
    return NextResponse.json({ error: `Unknown rail: ${railId}` }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const seed = parseInt(searchParams.get("seed") ?? "0") || Date.now();
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const excludeRaw = searchParams.get("exclude") ?? "";
  const cursor = parseInt(searchParams.get("cursor") ?? "0") || 0;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12") || 12, 24);
  const chipId = searchParams.get("chip") ?? undefined;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const excludeIds = new Set(excludeRaw ? excludeRaw.split(",").filter(Boolean) : []);

  const ctx: ScoringContext = {
    sessionSeed: seed,
    userLocation: !isNaN(lat) && !isNaN(lng) ? { lat, lng } : undefined,
    isWeekend,
    excludeIds,
    activeChipId: chipId,
  };

  // Fetch class pool (cached)
  const { classes, providers } = await getClassPool();

  // Build the rail
  const { items, shownIds } = rail.isSerendipity
    ? buildSerendipityRail(classes, rail, ctx, providers)
    : buildRail(classes, rail, ctx, providers);

  // Pagination (offset-based within the pre-built items)
  const paginated = items.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < items.length ? cursor + limit : null;

  // Determine subheader (use alt on weekends for recommended)
  const subheader =
    railId === "recommended" && isWeekend && rail.subheaderAlt
      ? rail.subheaderAlt
      : rail.subheader;

  // Header override if location available
  const header =
    railId === "popular-nearby" && ctx.userLocation
      ? "Loved by parents near you"
      : rail.header;

  const response: RailApiResponse = {
    railId,
    header,
    subheader,
    items: paginated,
    nextCursor: nextCursor !== null ? String(nextCursor) : null,
    totalAvailable: items.length,
  };

  // Chip-active requests are personalized — don't CDN cache
  const cacheControl = chipId
    ? "private, no-store"
    : "public, s-maxage=300, stale-while-revalidate=600";

  return NextResponse.json(response, {
    headers: { "Cache-Control": cacheControl },
  });
}
