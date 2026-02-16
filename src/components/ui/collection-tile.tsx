"use client";

// ── Collection Tile — editorial navigation with thumbnail previews ──
// Used only on /classes-alt. Shows collection name, description, and
// a strip of class thumbnails from the loaded rail data.

import React from "react";
import type { RailCardItem } from "@/lib/rails/types";

interface CollectionTileProps {
  railId: string;
  title: string;
  description: string;
  /** Class items from this rail (may be empty if rail hasn't loaded yet) */
  items: RailCardItem[];
  /** Called when the tile is clicked — should filter/navigate to this collection */
  onClick: () => void;
}

export const CollectionTile = React.memo(function CollectionTile({
  title,
  description,
  items,
  onClick,
}: CollectionTileProps) {
  // Show up to 5 thumbnails from the rail's loaded classes
  const previews = items.slice(0, 5);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start text-left w-full rounded-xl bg-white p-5 md:p-6 ring-1 ring-black/[0.04] shadow-sm transition-all duration-300 hover-hover:hover:shadow-md hover-hover:hover:ring-black/[0.08] active:scale-[0.99]"
    >
      {/* Text content */}
      <span className="text-[16px] md:text-[18px] font-semibold text-default-font leading-snug">
        {title}
      </span>
      <span className="text-[13px] md:text-[14px] text-neutral-500 leading-relaxed mt-1 line-clamp-2">
        {description}
      </span>

      {/* Thumbnail strip */}
      <div className="flex items-center gap-2 mt-4">
        {previews.length > 0 ? (
          previews.map((item) => (
            <div
              key={item.id}
              className="w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden bg-[var(--tumbo-cream)] flex-shrink-0 ring-1 ring-black/[0.04]"
            >
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={44}
                height={44}
              />
            </div>
          ))
        ) : (
          // Placeholder circles while rail data loads
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-neutral-100 flex-shrink-0 animate-pulse"
            />
          ))
        )}
        {previews.length > 0 && items.length > 5 && (
          <span className="text-[11px] text-neutral-400 font-medium ml-1">
            +{items.length - 5}
          </span>
        )}
      </div>

      {/* Explore affordance */}
      <span className="text-[12px] font-medium text-[var(--tumbo-orange)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Explore collection →
      </span>
    </button>
  );
});
