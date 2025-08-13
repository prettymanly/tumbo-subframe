"use client";
/*
 * Documentation:
 * Search Card — https://app.subframe.com/library?component=Search+Card_6dfc4210-f30d-400b-884c-55608cbd302f
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface SearchCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  image?: string;
  source?: React.ReactNode;
  className?: string;
}

const SearchCardRoot = React.forwardRef<HTMLDivElement, SearchCardRootProps>(
  function SearchCardRoot(
    { title, image, source, className, ...otherProps }: SearchCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/6dfc4210 flex cursor-pointer flex-col items-start gap-2 rounded-md bg-neutral-50 px-4 py-4 hover:bg-neutral-100",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {title ? (
          <span className="line-clamp-2 w-full text-body-bold font-body-bold text-default-font">
            {title}
          </span>
        ) : null}
        <div className="flex items-center gap-2">
          {image ? (
            <img className="h-4 w-4 flex-none object-cover" src={image} />
          ) : null}
          {source ? (
            <span className="text-caption font-caption text-subtext-color">
              {source}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const SearchCard = SearchCardRoot;
