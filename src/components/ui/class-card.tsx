"use client";

import React from "react";
import Link from "next/link";

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

export const ClassCard = React.memo(function ClassCard({
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
    <Link href={href} className={`block ${className}`}>
      <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
          <img 
            className="h-60 w-full flex-none object-cover" 
            src={image} 
            alt={title}
            loading="lazy"
          />
          {onBookmarkToggle && (
            <button 
              className="absolute right-2 top-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <svg 
                className={`w-4 h-4 ${isBookmarked ? 'fill-current text-red-500' : 'stroke-current text-gray-600'}`}
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
        <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
          <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
            {title}
          </span>
          <span className="text-body font-body text-subtext-color">
            {description}
          </span>
          {badges.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {badges.map((badge, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});
