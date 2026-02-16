// ── GET /api/tags/top ──
// Returns the top 12 taxonomy tags for the /classes hero tag row.
// Fast path: fetches only the columns needed by selectDisplayTags from a
// sample of ~500 rows, computes warm tags server-side, returns immediately.
// CDN-cached for 5 min, stale-while-revalidate for 1 hour.

import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { DBClass } from "@/lib/types/tags";

// Only the columns selectDisplayTags + deriveContextualTags need
const TAG_SELECT =
  "description,vibe_line,typical_child_profile,not_ideal_for,outcome_expectations,category";

const SAMPLE_SIZE = 500;

// ── Dimension constraints ──
type Dim = "child" | "experience" | "philosophy" | "content";
const DIMENSION_ORDER: Dim[] = ["child", "experience", "philosophy", "content"];
const MIN_PER_DIM: Record<Dim, number> = { child: 3, experience: 3, philosophy: 2, content: 2 };
const MAX_TAGS = 12;

// ── Seeded PRNG (Mulberry32) — deterministic per session/day ──
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface TagEntry {
  label: string;
  dimension: Dim;
  count: number;
}

export async function GET(req: NextRequest) {
  const seedParam = req.nextUrl.searchParams.get("seed");
  const seed = seedParam ? parseInt(seedParam, 10) || 0 : 0;
  const rng = mulberry32(seed);

  const supabase = createServer();

  // Fetch a random sample of visible classes (only tag-relevant columns).
  // Using a random offset seeded by the request seed gives session variety.
  const { count: totalCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);

  const total = totalCount ?? 1000;
  const maxOffset = Math.max(0, total - SAMPLE_SIZE);
  const offset = Math.floor(rng() * (maxOffset + 1));

  const { data: sample } = await supabase
    .from("classes")
    .select(TAG_SELECT)
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false)
    .range(offset, offset + SAMPLE_SIZE - 1);

  if (!sample || sample.length === 0) {
    return NextResponse.json({ tags: [] }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  }

  // Count tag frequency across sample
  const freq = new Map<string, TagEntry>();
  for (const row of sample) {
    const tags = selectDisplayTags(row as DBClass);
    for (const t of tags) {
      const key = `${t.dimension}::${t.label}`;
      const existing = freq.get(key);
      if (existing) {
        existing.count++;
      } else {
        freq.set(key, { label: t.label, dimension: t.dimension as Dim, count: 1 });
      }
    }
  }

  // Group by dimension, sort each by frequency desc → label asc
  const byDim: Record<Dim, TagEntry[]> = { child: [], experience: [], philosophy: [], content: [] };
  for (const entry of freq.values()) {
    byDim[entry.dimension].push(entry);
  }
  for (const dim of DIMENSION_ORDER) {
    byDim[dim].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }

  // Pick: guarantee minimums per dimension, then fill remaining by global frequency
  const picked = new Map<string, TagEntry>();

  for (const dim of DIMENSION_ORDER) {
    const min = MIN_PER_DIM[dim];
    const candidates = byDim[dim];
    for (let i = 0; i < Math.min(min, candidates.length); i++) {
      const t = candidates[i];
      picked.set(`${t.dimension}::${t.label}`, t);
    }
  }

  // Fill remaining slots: collect all un-picked, sort by frequency, pick top
  if (picked.size < MAX_TAGS) {
    const remaining: TagEntry[] = [];
    for (const dim of DIMENSION_ORDER) {
      for (const t of byDim[dim]) {
        const key = `${t.dimension}::${t.label}`;
        if (!picked.has(key)) remaining.push(t);
      }
    }
    remaining.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    // Seeded slight shuffle of the fill candidates for session variety
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    // Re-sort by count but with slight jitter from seed
    remaining.sort((a, b) => b.count - a.count);

    for (const t of remaining) {
      if (picked.size >= MAX_TAGS) break;
      picked.set(`${t.dimension}::${t.label}`, t);
    }
  }

  // Build final array in dimension order
  const DIMENSION_RANK = Object.fromEntries(DIMENSION_ORDER.map((d, i) => [d, i]));
  const result = [...picked.values()].sort((a, b) => {
    const dimDiff = (DIMENSION_RANK[a.dimension] ?? 99) - (DIMENSION_RANK[b.dimension] ?? 99);
    if (dimDiff !== 0) return dimDiff;
    return b.count - a.count || a.label.localeCompare(b.label);
  });

  return NextResponse.json(
    {
      tags: result.map((t) => ({ label: t.label, dimension: t.dimension })),
      meta: { sampleSize: sample.length, sampleOffset: offset, totalVisible: total },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
