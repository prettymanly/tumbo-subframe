"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { TagPill } from "./tag-pill";

interface ClassCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  badges: string[];
  href: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (classId: string) => void;
  className?: string;
}

export const CustomClassCard = React.memo(function CustomClassCard({
  id,
  title,
  description,
  image,
  badges,
  href,
  isBookmarked = false,
  onBookmarkToggle,
  className = "",
}: ClassCardProps) {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle?.(id);
  };

  return (
    <Link href={href} className={`block h-full ${className}`}>
      <div className="flex h-full flex-col items-start overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group/card relative">
        {/* Image */}
        <div className="w-full relative overflow-hidden">
          <Image 
            className="block h-52 w-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500 ease-out" 
            src={image} 
            alt={title}
            width={640}
            height={208}
          />
          {onBookmarkToggle && (
            <button 
              className="absolute right-2.5 top-2.5 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-200 z-10"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <svg 
                className={`w-4 h-4 transition-colors duration-200 ${isBookmarked ? 'fill-current text-[var(--tumbo-orange)]' : 'stroke-current text-gray-500'}`}
                viewBox="0 0 24 24" 
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex w-full flex-col items-start gap-1.5 px-4 pt-3.5 pb-4 flex-1">
          <span className="line-clamp-2 text-heading-3 font-heading-3 text-default-font leading-snug">
            {title}
          </span>
          <span className="text-body font-body text-subtext-color line-clamp-2">
            {description}
          </span>
          {badges.length > 0 && (
            <div className="flex items-center gap-1.5 mt-auto pt-2 flex-wrap">
              {badges.slice(0, 3).map((badge, index) => (
                <TagPill key={index} label={badge} size="sm" />
              ))}
              {badges.length > 3 && (
                <span className="text-[11px] text-gray-400 font-medium">
                  +{badges.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Orange accent line — slides in on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--tumbo-orange)] scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  );
});
