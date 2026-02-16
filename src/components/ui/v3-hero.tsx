"use client";

import React, { useCallback } from "react";
import { TextLoop } from "@/components/ui/text-loop";

interface V3HeroProps {
  classCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CYCLING_WORDS = ["Art", "Music", "Movement", "Focus", "Play", "Dance", "Swimming", "Drama"];

export function V3Hero({ classCount, searchQuery, onSearchChange }: V3HeroProps) {
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange],
  );

  return (
    <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-6 md:px-10">
      {/* Headline */}
      <h1
        className="text-center leading-[1.1] tracking-[-0.03em] text-[--v3-text]"
        style={{
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
          fontSize: "clamp(36px, 6vw, 56px)",
          fontWeight: 400,
        }}
      >
        Discover what
        <br />
        lights them up
      </h1>

      {/* Animated cycling subtext */}
      <div
        className="mt-5 flex items-center gap-2 text-[--v3-text-muted]"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: "15px" }}
      >
        <span>Explore</span>
        <TextLoop interval={2.5} transition={{ duration: 0.4 }}>
          {CYCLING_WORDS.map((word) => (
            <span key={word} className="text-[--v3-accent] font-medium">
              {word}
            </span>
          ))}
        </TextLoop>
        <span>classes across Singapore</span>
      </div>

      {/* Minimal search */}
      <div className="mt-12 w-full max-w-md">
        <div className="relative">
          {/* Search icon */}
          <svg
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[--v3-text-muted]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInput}
            placeholder="Search classes..."
            className="w-full border-0 border-b border-[--v3-border] bg-transparent py-3 pl-7 pr-4 text-[15px] text-[--v3-text] placeholder:text-[--v3-text-muted]/50 focus:border-[--v3-accent] focus:outline-none transition-colors duration-300"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          />
        </div>
      </div>

      {/* Class count */}
      {classCount > 0 && (
        <p
          className="mt-4 text-[12px] tracking-[0.02em] uppercase text-[--v3-text-muted]/60"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 500 }}
        >
          {classCount.toLocaleString()} classes to explore
        </p>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="text-[--v3-text-muted]/30"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
