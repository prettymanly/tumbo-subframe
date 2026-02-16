"use client";

// ── Editorial Card — image-forward, minimal metadata ──
// Used only on /classes-alt. Does NOT replace CustomClassCard on /classes.
// Anatomy: tall image → provider → title → category. No description, no pills.

import React from "react";
import Link from "next/link";

interface EditorialCardProps {
  id: string;
  title: string;
  providerName?: string;
  image: string;
  href: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (classId: string) => void;
  category?: string;
  priority?: boolean;
}

// Warm category labels — same mapping as class-card.tsx
const WARM_CATEGORY_LABELS: Record<string, string> = {
  Art: "Art & Design",
  Dance: "Dance",
  Music: "Music",
  Swimming: "Swimming",
  Cooking: "Cooking",
  Sports: "Sports & Fitness",
  Drama: "Drama & Theatre",
  Coding: "Coding & Tech",
  "Martial Arts": "Martial Arts",
  Chinese: "Chinese Language",
  English: "English Language",
  Malay: "Malay Language",
  Languages: "Language",
  Mathematics: "Math",
  Science: "Science",
  Chess: "Chess",
  Yoga: "Yoga & Mindfulness",
  Gymnastics: "Gymnastics",
  "Holiday Camp": "Holiday Camps",
  "Brain Training": "Brain Training",
  Football: "Football",
  "Rock Climbing": "Rock Climbing",
  Enrichment: "Enrichment",
  "Life Skills": "Life Skills",
  "Special Needs": "Special Needs Support",
  Piano: "Piano",
  Play: "Play-Based Learning",
  Preschool: "Early Childhood",
  "Religious Education": "Values & Faith",
};

const SUPPRESSED = new Set([
  "Education center", "Learning center", "Training centre",
  "Training provider", "Coaching center", "Tutoring service",
  "Educational institution", "School", "Primary school",
]);

function shouldShowProvider(title: string, providerName?: string): boolean {
  if (!providerName) return false;
  return title.trim().toLowerCase() !== providerName.trim().toLowerCase();
}

function cleanTitle(title: string, providerName?: string): string {
  if (!providerName) return title;
  const separators = [" — ", " – ", " - ", ": "];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const [prefix, ...rest] = title.split(sep);
      if (
        prefix.trim().toLowerCase() === providerName.trim().toLowerCase() ||
        providerName.trim().toLowerCase().startsWith(prefix.trim().toLowerCase())
      ) {
        return rest.join(sep).trim();
      }
    }
  }
  return title;
}

export const EditorialCard = React.memo(function EditorialCard({
  id,
  title,
  providerName,
  image,
  href,
  isBookmarked = false,
  onBookmarkToggle,
  category,
  priority = false,
}: EditorialCardProps) {
  const displayTitle = cleanTitle(title, providerName);
  const showProvider = shouldShowProvider(title, providerName);
  const warmCategory =
    category && !SUPPRESSED.has(category)
      ? WARM_CATEGORY_LABELS[category] || category
      : null;

  return (
    <Link href={href} className="block h-full group/card" prefetch={false}>
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04] transition-all duration-300 hover-hover:hover:ring-black/[0.08] hover-hover:hover:shadow-lg">
        {/* Tall image */}
        <div className="w-full relative overflow-hidden bg-[var(--tumbo-cream)]">
          <img
            className="block h-48 md:h-56 lg:h-64 w-full object-cover hover-hover:group-hover/card:scale-[1.02] transition-transform duration-500 ease-out"
            src={image}
            alt={displayTitle}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            width={400}
            height={300}
            fetchPriority={priority ? "high" : undefined}
          />
          {/* Bookmark */}
          {onBookmarkToggle && (
            <button
              className="absolute right-3 top-3 bg-white/80 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm active:scale-95 transition-all duration-150 z-10 opacity-0 group-hover/card:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmarkToggle(id);
              }}
              aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <svg
                className={`w-4 h-4 transition-colors duration-150 ${isBookmarked ? "fill-current text-[var(--tumbo-orange)]" : "stroke-current text-gray-500"}`}
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>
          )}
        </div>

        {/* Minimal metadata */}
        <div className="flex flex-col gap-0.5 px-4 pt-3 pb-4">
          {showProvider && providerName && (
            <span className="text-[10px] md:text-[11px] font-medium text-neutral-400 uppercase tracking-wider truncate">
              {providerName}
            </span>
          )}
          <span className="text-[14px] md:text-[15px] font-medium text-default-font leading-snug line-clamp-1">
            {displayTitle}
          </span>
          {warmCategory && (
            <span className="text-[12px] md:text-[13px] font-normal text-[var(--tumbo-orange)]/60">
              {warmCategory}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});
