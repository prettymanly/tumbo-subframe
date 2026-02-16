"use client";

import React from "react";
import Link from "next/link";
import { TagPill, TagCategory } from "./tag-pill";

export interface BadgeItem {
  label: string;
  category?: TagCategory;
}

interface ClassCardProps {
  id: string;
  title: string;
  providerName?: string;
  description: string;
  image: string;
  badges: BadgeItem[];
  href: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (classId: string) => void;
  className?: string;
  priority?: boolean;
  category?: string;
  ageMin?: number;
  ageMax?: number;
  vibeLine?: string;
}

// Warm category labels — parent-readable, not taxonomy
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

// Categories too generic to show as offerings context
const SUPPRESSED_CATEGORIES = new Set([
  "Education center", "Learning center", "Training centre",
  "Training provider", "Coaching center", "Tutoring service",
  "Educational institution", "School", "Primary school",
]);

/**
 * Build a structured offerings subtitle from category + age + vibe_line.
 *
 * Rules:
 *   - Category → warm label (skip if suppressed/generic)
 *   - Age range → "Ages X–Y"
 *   - Vibe line → use if short (≤60 chars) and doesn't start with provider name
 *   - Combine with " · " separator
 *   - If nothing usable, fall back to description (current behavior)
 */
function buildOfferingsLine(
  category: string | undefined,
  ageMin: number | undefined,
  ageMax: number | undefined,
  vibeLine: string | undefined,
  providerName: string | undefined,
): string | null {
  const parts: string[] = [];

  if (category && !SUPPRESSED_CATEGORIES.has(category)) {
    parts.push(WARM_CATEGORY_LABELS[category] || category);
  }

  if (ageMin != null && ageMax != null) {
    parts.push(`Ages ${ageMin}–${ageMax}`);
  } else if (ageMin != null) {
    parts.push(`Ages ${ageMin}+`);
  }

  if (vibeLine && vibeLine.length <= 60) {
    const vl = vibeLine.trim();
    const provLower = providerName?.toLowerCase() ?? "";
    if (!vl.toLowerCase().startsWith(provLower) && vl.length > 0) {
      parts.push(vl.charAt(0).toUpperCase() + vl.slice(1));
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * When title == provider name, don't show provider as a separate label.
 * When title differs (e.g. "Abrakadoodle — Twoosy Doodlers"), show provider above.
 */
function shouldShowProviderLabel(title: string, providerName?: string): boolean {
  if (!providerName) return false;
  return title.trim().toLowerCase() !== providerName.trim().toLowerCase();
}

/** Strip redundant provider prefix from title when they differ */
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

export const CustomClassCard = React.memo(function CustomClassCard({
  id,
  title,
  providerName,
  description,
  image,
  badges,
  href,
  isBookmarked = false,
  onBookmarkToggle,
  className = "",
  priority = false,
  category,
  ageMin,
  ageMax,
  vibeLine,
}: ClassCardProps) {
  const displayTitle = cleanTitle(title, providerName);
  const showProvider = shouldShowProviderLabel(title, providerName);
  const offeringsLine = buildOfferingsLine(category, ageMin, ageMax, vibeLine, providerName);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle?.(id);
  };

  return (
    <Link href={href} className={`block h-full ${className}`} prefetch={false}>
      <div className="flex h-full flex-col items-start overflow-hidden rounded-lg bg-white shadow-sm hover-hover:hover:shadow-md transition-shadow duration-200 cursor-pointer group/card relative">
        {/* Image */}
        <div className="w-full relative overflow-hidden bg-[var(--tumbo-cream)]">
          <img
            className="block h-36 md:h-44 lg:h-52 w-full object-cover hover-hover:group-hover/card:scale-[1.03] transition-transform duration-300 ease-out"
            src={image}
            alt={displayTitle}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            width={400}
            height={208}
            fetchPriority={priority ? "high" : undefined}
          />
          {onBookmarkToggle && (
            <button
              className="absolute right-2 top-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-150 z-10"
              onClick={handleBookmarkClick}
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

        {/* Content */}
        <div className="flex w-full flex-col items-start gap-1 px-3 md:px-4 pt-2.5 md:pt-3.5 pb-3 md:pb-4 flex-1">
          {/* Provider label — only when title is a distinct program name */}
          {showProvider && providerName && (
            <span className="text-[10px] md:text-[11px] font-medium text-gray-400 uppercase tracking-wider leading-tight truncate max-w-full">
              {providerName}
            </span>
          )}
          {/* Title — provider name in most cases */}
          <span className="line-clamp-2 text-[14px] md:text-heading-3 font-semibold md:font-heading-3 text-default-font leading-snug">
            {displayTitle}
          </span>
          {/* Offerings line: structured "what they offer" context */}
          {offeringsLine ? (
            <span className="text-[11px] md:text-[12px] font-medium text-[var(--tumbo-orange)]/80 leading-snug truncate max-w-full">
              {offeringsLine}
            </span>
          ) : null}
          {/* Description — fallback context */}
          <span className="text-[12px] md:text-body font-body text-subtext-color line-clamp-2 leading-relaxed">
            {description}
          </span>
          {badges.length > 0 && (
            <div className="flex items-center gap-1 md:gap-1.5 mt-auto pt-1.5 md:pt-2 flex-wrap">
              {badges.slice(0, 3).map((badge, index) => (
                <TagPill key={index} label={badge.label} category={badge.category} size="sm" />
              ))}
              {badges.length > 3 && (
                <span className="text-[10px] text-gray-400 font-medium">+{badges.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Orange accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--tumbo-orange)] scale-x-0 hover-hover:group-hover/card:scale-x-100 transition-transform duration-200 origin-left" />
      </div>
    </Link>
  );
});
