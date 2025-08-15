"use client"

import React from "react";
import { FeatherBookmark } from "@subframe/core";
import { Bookmark } from "lucide-react";
import { IconButton } from "@/components/subframe/ui/components/IconButton";

interface BookmarkButtonProps {
  classId: string;
  isBookmarked: boolean;
  onToggle: (classId: string) => void;
  className?: string;
}

export function BookmarkButton({ classId, isBookmarked, onToggle, className }: BookmarkButtonProps) {
  return (
    <IconButton
      className={className}
      variant="inverse"
      icon={isBookmarked ? <Bookmark className="fill-current" /> : <FeatherBookmark />}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle(classId);
      }}
    />
  );
}
