// ── GET /api/rails/meta ──
// Returns session-level metadata for the /classes page.
// Includes class count so the client doesn't need to import supabase for discovery mode.

import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { RAIL_ORDER } from "@/lib/rails/config";

// In-memory cache for the class count — avoids hitting Supabase on every request.
// The count only changes when classes are added/removed (rare), so a 10 min TTL
// is safe. Previous implementation fetched ALL rows to count distinct providers.
let countCache: { count: number; ts: number } | null = null;
const COUNT_CACHE_TTL = 600_000; // 10 min

async function getCachedClassCount(): Promise<number> {
  const now = Date.now();
  if (countCache && now - countCache.ts < COUNT_CACHE_TTL) return countCache.count;

  const supabase = createServer();
  // Lightweight HEAD query — PostgREST returns just the count, no row data.
  const { count } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);

  const result = count ?? 0;
  countCache = { count: result, ts: now };
  return result;
}

export async function GET() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Generate a daily seed
  const dateStr = now.toISOString().slice(0, 10);
  let dailySeed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    dailySeed = (dailySeed * 31 + dateStr.charCodeAt(i)) & 0x7fffffff;
  }

  // Lightweight cached count — HEAD query, no row data fetched.
  let totalClasses = 0;
  try {
    totalClasses = await getCachedClassCount();
  } catch {
    // Non-critical — page works without count
  }

  return NextResponse.json(
    {
      sessionSeed: dailySeed,
      isWeekend,
      railOrder: RAIL_ORDER,
      totalClasses,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
