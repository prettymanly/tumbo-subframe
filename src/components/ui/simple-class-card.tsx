"use client";

import React from "react";
import { FeatherBookmark } from "@subframe/core";
import { Bookmark } from "lucide-react";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Badge } from "@/components/subframe/ui/components/Badge";
import Link from "next/link";

interface SimpleClassCardProps {
  title: string;
  description: string;
  image: string;
  badges: string[];
  href?: string;
  classId?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (classId: string) => void;
}

export function SimpleClassCard({
  title,
  description,
  image,
  badges,
  href,
  classId,
  isBookmarked = false,
  onBookmarkToggle,
}: SimpleClassCardProps) {
  const cardContent = (
    <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
        <img
          className="h-60 w-full flex-none object-cover"
          src={image}
          alt={title}
        />
        {classId && onBookmarkToggle && (
          <IconButton
            className="absolute right-2 top-2"
            variant="inverse"
            icon={isBookmarked ? <Bookmark className="fill-current" /> : <FeatherBookmark />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              onBookmarkToggle(classId);
            }}
          />
        )}
      </div>
      <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
        <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
          {title}
        </span>
        <span className="text-body font-body text-subtext-color">
          {description}
        </span>
        <div className="flex items-center gap-2">
          {badges.map((badge, index) => (
            <Badge key={index} variant="neutral">{badge}</Badge>
          ))}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <div className="flex flex-col items-start gap-2">
          {cardContent}
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {cardContent}
    </div>
  );
}



