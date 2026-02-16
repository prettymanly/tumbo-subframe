"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CustomClassCard, BadgeItem } from "@/components/ui/class-card";
import type { RailCardItem, RailDensity } from "@/lib/rails/types";
import type { TagCategory } from "@/components/ui/tag-pill";

// ── Density → card width class mapping ──
const DENSITY_CARD_WIDTH: Record<RailDensity, string> = {
  featured: "w-[85vw] md:w-80",     // larger cards, highest visual weight
  compact: "w-[72vw] md:w-64",      // tighter, utility tone
  airy: "w-[85vw] md:w-80",         // spacious, fewer visible
  standard: "w-[78vw] md:w-72",     // default
};

// ── Card skeleton — matches actual card dimensions ──
function CardSkeleton() {
  return (
    <div className="flex-none w-[78vw] md:w-72 animate-pulse">
      <div className="flex h-full flex-col items-start overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="w-full h-36 md:h-44 lg:h-52 bg-gray-100" />
        <div className="flex w-full flex-col items-start gap-2 px-3 md:px-4 pt-2.5 md:pt-3.5 pb-3 md:pb-4">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="flex gap-1.5 mt-1">
            <div className="h-5 w-14 bg-gray-100 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Grid card skeleton — for featured grid layout (CLS-matched) ──
function GridCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex h-full flex-col items-start overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="w-full h-44 md:h-52 lg:h-64 bg-gray-100" />
        <div className="flex w-full flex-col items-start gap-2 px-3 md:px-4 pt-2.5 md:pt-3.5 pb-3 md:pb-4">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="flex gap-1.5 mt-1">
            <div className="h-5 w-14 bg-gray-100 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rail section skeleton (shown while loading) ──
export function RailSkeleton({ layout = "rail" }: { layout?: "rail" | "grid" }) {
  if (layout === "grid") {
    return (
      <div className="flex w-full flex-col gap-5 md:gap-6">
        <div className="px-4 md:px-6 lg:px-10">
          <div className="h-6 md:h-7 w-40 md:w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 md:h-4 w-56 md:w-72 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        {/* Mobile: horizontal skeleton row */}
        <div className="flex md:hidden gap-3 px-4 overflow-hidden">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        {/* Desktop: 3-col grid skeleton */}
        <div className="hidden md:grid grid-cols-3 gap-4 px-6 lg:px-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GridCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      <div className="px-4 md:px-6 lg:px-10">
        <div className="h-5 md:h-6 w-40 md:w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 md:h-4 w-56 md:w-72 bg-gray-100 rounded animate-pulse mt-2" />
      </div>
      <div className="flex gap-3 md:gap-4 px-4 md:px-6 lg:px-10 overflow-hidden">
        {/* 2 skeletons on mobile, 4 on desktop */}
        <CardSkeleton />
        <CardSkeleton />
        <div className="hidden md:block"><CardSkeleton /></div>
        <div className="hidden md:block"><CardSkeleton /></div>
      </div>
    </div>
  );
}

// ── Convert RailCardItem to ClassCard props ──
function toCardBadges(item: RailCardItem): BadgeItem[] {
  return item.tags.map((t) => ({
    label: t.label,
    category: t.dimension as TagCategory,
  }));
}

// ── Rail section component ──
interface RailSectionProps {
  railId: string;
  header: string;
  subheader: string;
  items: RailCardItem[];
  bookmarkedClasses: Set<string>;
  onBookmarkToggle: (classId: string) => void;
  initialRenderCount: number;
  /** First rail gets eager image loading */
  isFirstRail?: boolean;
  /** Visual density variant — controls card sizing */
  density?: RailDensity;
  /** Layout mode: "rail" = horizontal scroll (default), "grid" = CSS grid on desktop, rail on mobile */
  layout?: "rail" | "grid";
}

export const RailSection = React.memo(function RailSection({
  railId,
  header,
  subheader,
  items,
  bookmarkedClasses,
  onBookmarkToggle,
  initialRenderCount,
  isFirstRail = false,
  density = "standard",
  layout = "rail",
}: RailSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, initialRenderCount);

  const updateArrows = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows, showAll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Scroll by one card width on mobile, more on desktop
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth ?? 288;
    el.scrollBy({ left: direction === "right" ? cardWidth + 12 : -(cardWidth + 12), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  // ── Grid layout: desktop = CSS grid, mobile = horizontal rail ──
  if (layout === "grid") {
    return (
      <section id={`rail-${railId}`} className="flex w-full flex-col items-start gap-4 md:gap-6 min-w-0">
        {/* Header — slightly larger for featured grid */}
        <div className="flex w-full items-end justify-between px-4 md:px-6 lg:px-10">
          <div className="flex flex-col items-start gap-0.5 md:gap-1 min-w-0">
            <h2 className="text-[20px] md:text-[24px] font-semibold text-default-font truncate">
              {header}
            </h2>
            <p className="text-[13px] md:text-[14px] font-body text-subtext-color line-clamp-1">{subheader}</p>
          </div>
        </div>

        {/* Mobile: horizontal rail */}
        <div className="md:hidden relative w-full min-w-0" style={{ overflowX: "clip", overflowY: "visible" }}>
          <div
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4 py-2 items-stretch"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {visibleItems.map((item, i) => (
              <div key={item.id} className="flex-none w-[85vw]">
                <CustomClassCard
                  id={item.id}
                  title={item.title}
                  providerName={item.providerName}
                  description={item.summary}
                  image={item.image}
                  badges={toCardBadges(item)}
                  href={item.href}
                  isBookmarked={bookmarkedClasses.has(item.id)}
                  onBookmarkToggle={onBookmarkToggle}
                  priority={isFirstRail && i < 2}
                  category={item.category}
                  ageMin={item.ageMin}
                  ageMax={item.ageMax}
                  vibeLine={item.vibeLine}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 3-col grid (2 rows × 3 cards = 6 items) */}
        <div className="hidden md:grid w-full grid-cols-3 gap-4 px-6 lg:px-10">
          {visibleItems.map((item, i) => (
            <CustomClassCard
              key={item.id}
              id={item.id}
              title={item.title}
              providerName={item.providerName}
              description={item.summary}
              image={item.image}
              badges={toCardBadges(item)}
              href={item.href}
              isBookmarked={bookmarkedClasses.has(item.id)}
              onBookmarkToggle={onBookmarkToggle}
              priority={isFirstRail && i < 2}
              category={item.category}
              ageMin={item.ageMin}
              ageMax={item.ageMax}
              vibeLine={item.vibeLine}
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Rail layout (horizontal scroll — default) ──
  return (
    <section id={`rail-${railId}`} className="flex w-full flex-col items-start gap-3 md:gap-5 min-w-0">
      {/* Header */}
      <div className="flex w-full items-end justify-between px-4 md:px-6 lg:px-10">
        <div className="flex flex-col items-start gap-0.5 md:gap-1 min-w-0">
          <h2 className="text-[18px] md:text-heading-2 font-semibold md:font-heading-2 text-default-font truncate">
            {header}
          </h2>
          <p className="text-[13px] md:text-body font-body text-subtext-color line-clamp-1">{subheader}</p>
        </div>
        {items.length > initialRenderCount && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[12px] md:text-[13px] font-semibold text-gray-400 hover:text-[var(--tumbo-orange)] transition-colors duration-150 whitespace-nowrap pb-0.5 ml-3 flex-shrink-0"
          >
            Show more →
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="text-[12px] md:text-[13px] font-semibold text-gray-400 hover:text-gray-700 transition-colors duration-150 whitespace-nowrap pb-0.5 ml-3 flex-shrink-0"
          >
            ← Less
          </button>
        )}
      </div>

      {/* Scrollable row */}
      <div className="relative w-full min-w-0" style={{ overflowX: "clip", overflowY: "visible" }}>
        {/* Arrows — hidden on touch devices, no backdrop-blur */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-50 transition-colors duration-150 shadow-md ring-1 ring-black/[0.06]"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-50 transition-colors duration-150 shadow-md ring-1 ring-black/[0.06]"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 lg:px-10 py-2 md:py-3 items-stretch -webkit-overflow-scrolling-touch"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {visibleItems.map((item, i) => (
            <div key={item.id} className={`flex-none ${DENSITY_CARD_WIDTH[density]}`}>
              <CustomClassCard
                id={item.id}
                title={item.title}
                providerName={item.providerName}
                description={item.summary}
                image={item.image}
                badges={toCardBadges(item)}
                href={item.href}
                isBookmarked={bookmarkedClasses.has(item.id)}
                onBookmarkToggle={onBookmarkToggle}
                priority={isFirstRail && i < 2}
                category={item.category}
                ageMin={item.ageMin}
                ageMax={item.ageMax}
                vibeLine={item.vibeLine}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
