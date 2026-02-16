"use client";

// ── Collection Strip — editorial navigation cards ──
// Derives from RAILS config (header + subheader). No data fetching.
// Each card is an anchor link to #rail-{railId} on the same page.

import { RAILS } from "@/lib/rails/config";

// Only show intent-based rails (3–6) as collections.
// Rail 1 (recommended) and Rail 2 (popular-nearby) are already visible above.
// Rail 7 (serendipity) is a wildcard — not a browsable collection.
const COLLECTION_RAILS = RAILS.filter(
  (r) => r.intentSignals.length > 0
);

export function CollectionStrip() {
  if (COLLECTION_RAILS.length === 0) return null;

  const handleClick = (railId: string) => {
    const el = document.getElementById(`rail-${railId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="w-full px-4 md:px-6 lg:px-10 py-6 md:py-10">
      {/* Section header */}
      <div className="flex items-end justify-between mb-5 md:mb-6">
        <div>
          <h2 className="text-[18px] md:text-[22px] font-semibold text-default-font">
            Collections
          </h2>
          <p className="text-[13px] md:text-[14px] text-subtext-color mt-0.5">
            Curated by what matters to your child
          </p>
        </div>
      </div>

      {/* Collection cards — responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {COLLECTION_RAILS.map((rail) => (
          <button
            key={rail.railId}
            onClick={() => handleClick(rail.railId)}
            className="group flex flex-col items-start gap-2 md:gap-2.5 rounded-xl bg-white p-4 md:p-5 text-left shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover-hover:hover:shadow-md hover-hover:hover:ring-black/[0.08] active:scale-[0.98]"
          >
            <span className="text-[14px] md:text-[16px] font-semibold text-default-font leading-snug">
              {rail.header}
            </span>
            <span className="text-[12px] md:text-[13px] text-subtext-color leading-relaxed line-clamp-2">
              {rail.subheader}
            </span>
            <span className="text-[11px] md:text-[12px] font-semibold text-[var(--tumbo-orange)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
              Explore ↓
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
