"use client";

import React from "react";

interface BrowseAllButtonProps {
  onOpenFilters: () => void;
  totalClasses: number;
}

export function BrowseAllButton({ onOpenFilters, totalClasses }: BrowseAllButtonProps) {
  return (
    <section className="flex w-full flex-col items-center gap-3 py-12 px-4">
      <p className="text-body font-body text-subtext-color text-center max-w-md">
        Looking for something specific? Browse the full directory with filters.
      </p>
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2.5 rounded-full bg-[var(--tumbo-orange)] px-7 py-3.5 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M7 8h10M9 13h6M11 18h2" />
        </svg>
        Browse all {totalClasses > 0 ? `${totalClasses} classes` : "classes"}
      </button>
    </section>
  );
}
