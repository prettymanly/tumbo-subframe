"use client";

import React from "react";
import type { RailCardItem } from "@/lib/rails/types";

interface V3CollectionCardProps {
  railId: string;
  title: string;
  description: string;
  items: RailCardItem[];
  onClick: () => void;
}

export function V3CollectionCard({
  railId,
  title,
  description,
  items,
  onClick,
}: V3CollectionCardProps) {
  // Use first item's image as blurred background
  const bgImage = items[0]?.image;
  const itemCount = items.length;

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl text-left transition-all duration-500 hover:shadow-lg"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Blurred background image */}
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px] transition-transform duration-700 group-hover:scale-[1.15]"
        />
      ) : (
        <div className="absolute inset-0 bg-[--v3-bg-warm]" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 transition-colors duration-500 group-hover:bg-black/40" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
        {/* Item count badge */}
        {itemCount > 0 && (
          <span
            className="self-start mb-3 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/80"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {itemCount} classes
          </span>
        )}

        {/* Title */}
        <h3
          className="text-white leading-tight text-[20px] md:text-[24px]"
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className="mt-1.5 text-white/60 leading-relaxed line-clamp-2"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "13px",
          }}
        >
          {description}
        </p>

        {/* Explore affordance */}
        <span
          className="mt-3 text-white/40 group-hover:text-white/70 transition-colors duration-300"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          Explore collection →
        </span>
      </div>
    </button>
  );
}
