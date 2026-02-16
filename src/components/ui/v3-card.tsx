"use client";

import React from "react";
import Link from "next/link";

// ── Warm category display names ──
const WARM_CATEGORIES: Record<string, string> = {
  Art: "Art & Design",
  Dance: "Dance",
  Music: "Music",
  Swimming: "Swimming",
  Cooking: "Culinary",
  Drama: "Drama & Theatre",
  Martial_Arts: "Martial Arts",
  Sports: "Sports & Fitness",
  Gymnastics: "Gymnastics",
  Enrichment: "Enrichment",
  Yoga: "Yoga & Mindfulness",
  Chess: "Chess",
  Crafts: "Crafts",
  Science: "Science & Tech",
  Language: "Language",
};

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[\(\[].+?[\)\]]\s*/g, "")
    .replace(/\s*[-–—]\s*(Trial|Intro|New|Free|Promo).*/i, "")
    .trim();
}

interface V3CardProps {
  id: string;
  title: string;
  providerName?: string;
  image: string;
  href: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (classId: string) => void;
  category?: string;
  priority?: boolean;
  variant?: "default" | "hero";
}

export function V3Card({
  id,
  title,
  providerName,
  image,
  href,
  isBookmarked = false,
  onBookmarkToggle,
  category,
  priority = false,
  variant = "default",
}: V3CardProps) {
  const isHero = variant === "hero";
  const displayTitle = cleanTitle(title);
  const displayCategory = category ? WARM_CATEGORIES[category] || category : null;

  return (
    <Link href={href} className="group relative block overflow-hidden rounded-lg">
      {/* Image container */}
      <div
        className={`relative w-full overflow-hidden ${
          isHero ? "aspect-[3/4] md:aspect-[4/5]" : "aspect-[3/4]"
        }`}
      >
        <img
          src={image}
          alt={displayTitle}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 35%, transparent 60%)",
          }}
        />

        {/* Bookmark button */}
        {onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isBookmarked ? "white" : "none"}
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}

        {/* Text overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          {/* Provider */}
          {providerName && (
            <p
              className="text-white/70 mb-1"
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {providerName}
            </p>
          )}

          {/* Title */}
          <h3
            className={`text-white leading-tight ${isHero ? "text-[22px] md:text-[26px]" : "text-[16px] md:text-[18px]"}`}
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {displayTitle}
          </h3>

          {/* Category */}
          {displayCategory && (
            <p
              className="text-white/50 mt-1.5"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              {displayCategory}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
