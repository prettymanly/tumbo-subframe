// ── GET /api/rails/meta ──
// Returns session-level metadata for the /classes page.
// Includes class count so the client doesn't need to import supabase for discovery mode.

import { NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { RAIL_ORDER } from "@/lib/rails/config";

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

  // Fetch class count (lightweight HEAD query, cached at CDN level)
  let totalClasses = 0;
  try {
    const supabase = createServer();
    const { count } = await supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("is_placeholder", false);
    totalClasses = count ?? 0;
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
