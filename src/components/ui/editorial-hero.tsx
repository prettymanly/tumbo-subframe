"use client";

// ── Editorial Hero — Framer-scale typography, taxonomy tags, no intent chips ──
// Used only on /classes-alt. Different from HeroSection on /classes:
//   • Search bar at top (full width)
//   • Larger heading (48px desktop)
//   • Filter button on same row as taxonomy tags (not search row)
//   • NO intent chips — taxonomy tags only
//   • Generous vertical spacing

import React, { useRef } from "react";
import { TagPill } from "./tag-pill";
import type { TagCategory } from "./tag-pill";
import type { TagRowItem } from "./hero-section";

interface EditorialHeroProps {
  classCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  filterSidebarOpen: boolean;
  tags: TagRowItem[];
  activeTag: string | null;
  onTagClick: (tagLabel: string) => void;
}

export function EditorialHero({
  classCount,
  searchQuery,
  onSearchChange,
  onFilterClick,
  filterSidebarOpen,
  tags,
  activeTag,
  onTagClick,
}: EditorialHeroProps) {
  const tagScrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="flex w-full flex-col items-start gap-6 md:gap-8 px-6 md:px-10 lg:px-16 pt-10 md:pt-16 pb-4 md:pb-6">
      {/* Search bar — full width, top position */}
      <div className="w-full max-w-2xl">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 md:py-3.5 border-0 rounded-full bg-tumbo-cream text-[15px] text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tumbo-orange focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Headline — editorial scale */}
      <div className="flex w-full flex-col items-start gap-2 md:gap-3 max-w-3xl">
        <h1 className="text-[32px] md:text-[44px] lg:text-[48px] font-bold text-default-font leading-[1.08] tracking-[-0.03em]">
          Find the right class
          <br />
          for your child
        </h1>
        <p className="text-[15px] md:text-[18px] font-light text-neutral-500 leading-relaxed">
          Curated activities across Singapore — from creative play to deep focus.
        </p>
      </div>

      {/* Filter button + taxonomy tags — single scrollable row */}
      <div className="w-full -mx-6 md:-mx-10 lg:-mx-16">
        <div
          ref={tagScrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-6 md:px-10 lg:px-16 pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Filter button — leftmost position */}
          <button
            onClick={onFilterClick}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-[5px] rounded-full text-[11px] font-medium transition-all duration-200 border-[1.5px] ${
              filterSidebarOpen
                ? "border-[var(--tumbo-orange)] text-[var(--tumbo-orange)] bg-orange-50"
                : "border-neutral-200 text-neutral-500 bg-white hover:border-neutral-300"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M7 8h10M9 13h6M11 18h2" />
            </svg>
            Filter
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-neutral-200 flex-shrink-0" />

          {/* Clear button — visible only when tag is active */}
          {activeTag && (
            <button
              onClick={() => onTagClick("")}
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-150"
              type="button"
              aria-label="Clear tag filter"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}

          {/* Taxonomy tags */}
          {tags.map((tag) => {
            const isSelected = activeTag === tag.label;
            return (
              <TagPill
                key={tag.label}
                label={tag.label}
                category={tag.dimension as TagCategory}
                size="hero"
                variant="outline"
                selected={isSelected}
                onClick={() => onTagClick(isSelected ? "" : tag.label)}
                className="flex-shrink-0"
              />
            );
          })}
        </div>
      </div>

      {/* Class count — quiet */}
      {classCount > 0 && (
        <p className="text-[11px] md:text-[12px] text-neutral-400 -mt-3">
          {classCount} classes to explore
        </p>
      )}
    </section>
  );
}
