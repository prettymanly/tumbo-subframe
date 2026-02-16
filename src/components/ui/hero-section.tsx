"use client";

import React, { useRef } from "react";
import { TagPill } from "./tag-pill";
import type { TagCategory } from "./tag-pill";

// ── Tag row item (computed by page from loaded data) ──
export interface TagRowItem {
  label: string;
  dimension: "content" | "philosophy" | "experience" | "child";
}

interface HeroSectionProps {
  classCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  filterSidebarOpen: boolean;
  /** Taxonomy tags derived from loaded dataset */
  tags: TagRowItem[];
  activeTag: string | null;
  onTagClick: (tagLabel: string) => void;
}

export function HeroSection({
  classCount,
  searchQuery,
  onSearchChange,
  onFilterClick,
  filterSidebarOpen,
  tags,
  activeTag,
  onTagClick,
}: HeroSectionProps) {
  const tagScrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="flex w-full flex-col items-start gap-4 md:gap-5 px-4 md:px-6 lg:px-10 pt-6 md:pt-8 pb-2 md:pb-4">
      {/* Headline */}
      <div className="flex w-full flex-col items-start gap-1 md:gap-1.5 max-w-2xl">
        <h1 className="text-[22px] md:text-heading-1 font-heading-1 text-default-font leading-tight">
          Find the right class for your child
        </h1>
        <p className="text-[13px] md:text-body font-body text-subtext-color leading-relaxed">
          Curated activities across Singapore — from creative play to deep focus.
        </p>
      </div>

      {/* Search bar — own row */}
      <div className="flex w-full items-center gap-2.5 md:gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border-0 rounded-full bg-tumbo-cream text-[14px] md:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tumbo-orange focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Filter button + scrollable taxonomy tag row — same row */}
      <div className="flex w-full items-center gap-2.5 md:gap-3 -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10">
        <button
          onClick={onFilterClick}
          className={`flex items-center gap-1.5 md:gap-2 px-3.5 md:px-4 py-[5px] md:py-1.5 rounded-full text-[13px] md:text-sm font-medium transition-all duration-200 border-[1.5px] flex-shrink-0 ${
            filterSidebarOpen
              ? "border-[var(--tumbo-orange)] text-[var(--tumbo-orange)] bg-orange-50"
              : "border-tumbo-cream text-gray-600 bg-white hover:border-gray-300"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M7 8h10M9 13h6M11 18h2" />
          </svg>
          Filter
        </button>

        {/* Taxonomy tags — scroll container takes remaining width */}
        {tags.length > 0 && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              ref={tagScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {/* Clear affordance — visible only when a tag is active */}
              {activeTag && (
                <button
                  onClick={() => onTagClick("")}
                  className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-[5px] text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                  type="button"
                  aria-label="Clear tag filter"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
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
        )}
      </div>

      {/* Class count */}
      {classCount > 0 && (
        <p className="text-[11px] md:text-[12px] text-gray-400 -mt-1">
          {classCount} classes to explore
        </p>
      )}
    </section>
  );
}
