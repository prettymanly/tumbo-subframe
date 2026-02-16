"use client";

import React, { useRef } from "react";
import { INTENT_CHIPS } from "@/lib/rails/config";

// ── Scrollable tag rows — warm, clickable labels ──
// Each tag maps to one or more DB categories (case-insensitive contains)
export const TAG_ROWS = [
  { label: "Art & Design", keywords: ["Art", "Animation studio", "Pottery"] },
  { label: "Music", keywords: ["Music"] },
  { label: "Dance & Movement", keywords: ["Dance", "Gymnastics"] },
  { label: "Swimming", keywords: ["Swimming"] },
  { label: "Sports", keywords: ["Sports", "Football", "Archery"] },
  { label: "Drama & Theatre", keywords: ["Drama", "Performing arts"] },
  { label: "Coding & Tech", keywords: ["Coding", "Computer", "Brain Training"] },
  { label: "Martial Arts", keywords: ["Martial Arts"] },
  { label: "Languages", keywords: ["Languages", "English", "Chinese", "Malay"] },
  { label: "Science & STEM", keywords: ["Science", "Mathematics", "Coding", "Brain Training"] },
  { label: "Enrichment", keywords: ["Enrichment", "Learning center", "Education center", "Tutoring", "Tuition"] },
  { label: "Cooking", keywords: ["Cooking"] },
  { label: "Holiday Camp", keywords: ["Holiday Camp", "Children's camp"] },
  { label: "Outdoor & Nature", keywords: ["Rock Climbing", "Farm", "Nature", "Bicycle"] },
  { label: "Yoga & Mindfulness", keywords: ["Yoga", "Meditation", "Wellness"] },
  { label: "Special Needs", keywords: ["Special Needs", "Speech pathologist", "Occupational"] },
  { label: "Life Skills", keywords: ["Life Skills", "Financial Literacy"] },
  { label: "Chess & Strategy", keywords: ["Chess"] },
] as const;

interface HeroSectionProps {
  classCount: number;
  activeChipId: string | null;
  onChipToggle: (chipId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  filterSidebarOpen: boolean;
  onTagClick: (tagLabel: string) => void;
  activeTag: string | null;
}

export function HeroSection({
  classCount,
  activeChipId,
  onChipToggle,
  searchQuery,
  onSearchChange,
  onFilterClick,
  filterSidebarOpen,
  onTagClick,
  activeTag,
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

      {/* Filter button + search bar */}
      <div className="flex w-full items-center gap-2.5 md:gap-3">
        <button
          onClick={onFilterClick}
          className={`flex items-center gap-1.5 md:gap-2 px-3.5 md:px-4 py-2.5 md:py-3 rounded-full text-[13px] md:text-sm font-medium transition-all duration-200 border-[1.5px] flex-shrink-0 ${
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

      {/* Intent chips */}
      <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
        {INTENT_CHIPS.map((chip) => {
          const isActive = activeChipId === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onChipToggle(isActive ? null : chip.id)}
              className={`group relative flex items-center gap-1.5 md:gap-2 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-[12px] md:text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? "bg-[var(--tumbo-orange)] text-white border-[1.5px] border-[var(--tumbo-orange)] shadow-sm"
                  : "bg-white text-gray-700 border-[1.5px] border-tumbo-cream hover-hover:hover:border-[var(--tumbo-orange)] hover-hover:hover:text-[var(--tumbo-orange)]"
              }`}
              aria-pressed={isActive}
            >
              <ChipIcon chipId={chip.id} isActive={isActive} />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable tag row */}
      <div className="w-full -mx-4 md:-mx-6 lg:-mx-10">
        <div
          ref={tagScrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 lg:px-10 pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {TAG_ROWS.map((tag) => {
            const isActive = activeTag === tag.label;
            return (
              <button
                key={tag.label}
                onClick={() => onTagClick(isActive ? "" : tag.label)}
                className={`flex-shrink-0 rounded-full px-3 md:px-3.5 py-1 md:py-1.5 text-[11px] md:text-[12px] font-medium transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
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

// ── Small icons for each chip ──
function ChipIcon({ chipId, isActive }: { chipId: string; isActive: boolean }) {
  const cls = `w-3.5 h-3.5 md:w-4 md:h-4 transition-opacity ${
    isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
  }`;

  switch (chipId) {
    case "build-confidence":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case "burn-energy":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "quiet-focus":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "creative-explorers":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    default:
      return null;
  }
}
