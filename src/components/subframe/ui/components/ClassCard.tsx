"use client";
/*
 * Documentation:
 * Class Card — https://app.subframe.com/library?component=Class+Card_e2147d22-d4e7-464c-bd18-dae445bf2b9d
 * Icon Button — https://app.subframe.com/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Badge — https://app.subframe.com/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherBookmark } from "@subframe/core";
import { Bookmark } from "lucide-react";
import { IconButton } from "./IconButton";
import { Badge } from "./Badge";
import Link from "next/link";

interface ClassCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
  description?: string;
  image?: string;
  badges?: string[];
  href?: string;
  classId?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (classId: string) => void;
}

const ClassCardRoot = React.forwardRef<HTMLDivElement, ClassCardRootProps>(
  function ClassCardRoot(
    { 
      className, 
      title = "Creative Little Artists",
      description = "For kids becoming creators, not just consumers.",
      image = "https://res.cloudinary.com/subframe/image/upload/v1722404911/uploads/302/uxswoalrzimh7g9ivtiq.webp",
      badges = ["Creative Expression", "Growth Mindset"],
      href,
      classId,
      isBookmarked = false,
      onBookmarkToggle,
      ...otherProps 
    }: ClassCardRootProps,
    ref
  ) {
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

    const containerDiv = (
      <div
        className={SubframeUtils.twClassNames(
          "flex flex-col items-start gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {cardContent}
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block">
          {containerDiv}
        </Link>
      );
    }

    return containerDiv;
  }
);

export const ClassCard = ClassCardRoot;
