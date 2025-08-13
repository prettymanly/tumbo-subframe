"use client";
/*
 * Documentation:
 * Filter Badge — https://app.subframe.com/library?component=Filter+Badge_9f379f68-a795-4bb7-a975-8b10f72f2f30
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface FilterBadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  count?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

const FilterBadgeRoot = React.forwardRef<HTMLDivElement, FilterBadgeRootProps>(
  function FilterBadgeRoot(
    {
      label,
      count,
      selected = false,
      className,
      ...otherProps
    }: FilterBadgeRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/9f379f68 flex cursor-pointer items-center overflow-hidden rounded-md border border-solid border-neutral-border px-1 py-1 hover:bg-neutral-50",
          {
            "border border-solid border-brand-100 bg-brand-50 hover:bg-brand-100":
              selected,
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-center gap-2 px-2">
          {label ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption-bold font-caption-bold text-default-font",
                { "text-brand-700": selected }
              )}
            >
              {label}
            </span>
          ) : null}
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "flex min-w-[24px] items-center justify-center gap-2 rounded-md bg-neutral-100 px-1 py-1",
            { "bg-brand-100 group-hover/9f379f68:bg-brand-200": selected }
          )}
        >
          {count ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption-bold font-caption-bold text-default-font text-center",
                { "text-brand-700": selected }
              )}
            >
              {count}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const FilterBadge = FilterBadgeRoot;
