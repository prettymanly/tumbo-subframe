"use client";

import React, { useRef, useEffect, useState } from "react";
import type { TagRowItem } from "@/components/ui/hero-section";

interface V3TaxonomyStripProps {
  tags: TagRowItem[];
  activeTag: string | null;
  onTagClick: (tagLabel: string) => void;
  onFilterClick: () => void;
  filterSidebarOpen: boolean;
}

export function V3TaxonomyStrip({
  tags,
  activeTag,
  onTagClick,
  onFilterClick,
  filterSidebarOpen,
}: V3TaxonomyStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Detect when strip becomes sticky
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: [1], rootMargin: "-57px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (tags.length === 0) return null;

  return (
    <div ref={stripRef} className="w-full">
      <div
        className={`sticky top-[56px] z-40 w-full transition-all duration-300 ${
          isSticky
            ? "bg-white/90 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-[--v3-border]"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3 px-6 md:px-10 lg:px-16 py-3 max-w-[1440px] mx-auto">
          {/* Filter button */}
          <button
            onClick={onFilterClick}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 text-[13px] ${
              filterSidebarOpen
                ? "border-[--v3-accent] text-[--v3-accent] bg-[--v3-accent]/5"
                : "border-[--v3-border] text-[--v3-text-muted] hover:border-[--v3-text-muted] hover:text-[--v3-text]"
            }`}
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filter
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-[--v3-border] flex-shrink-0" />

          {/* Tags scroll container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {tags.map((tag) => {
              const isActive = activeTag === tag.label;
              return (
                <button
                  key={tag.label}
                  onClick={() => onTagClick(isActive ? "" : tag.label)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] transition-all duration-200 border ${
                    isActive
                      ? "border-[--v3-accent] text-[--v3-accent] bg-[--v3-accent]/5"
                      : "border-transparent text-[--v3-text-muted] hover:text-[--v3-text] hover:bg-[--v3-bg-warm]"
                  }`}
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 500 }}
                >
                  {tag.label}
                </button>
              );
            })}

            {/* Clear button */}
            {activeTag && (
              <button
                onClick={() => onTagClick("")}
                className="flex-shrink-0 px-2 py-1 text-[12px] text-[--v3-text-muted] hover:text-[--v3-text] transition-colors"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
