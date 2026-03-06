"use client";

import React from "react";
import * as SubframeUtils from "../subframe/ui/utils";

interface WarmFilterBadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  count?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

const WarmFilterBadgeRoot = React.forwardRef<HTMLDivElement, WarmFilterBadgeRootProps>(
  function WarmFilterBadgeRoot(
    {
      label,
      count,
      selected = false,
      className,
      ...otherProps
    }: WarmFilterBadgeRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/9f379f68 flex cursor-pointer items-center overflow-hidden rounded-md border border-solid border-neutral-border px-1 py-1 hover:bg-[var(--tumbo-cream)]",
          {
            "border border-solid border-[var(--tumbo-hover)] bg-[var(--tumbo-cream)] hover:bg-[var(--tumbo-hover)]":
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
                { "text-[var(--tumbo-orange)]": selected }
              )}
            >
              {label}
            </span>
          ) : null}
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "flex min-w-[24px] items-center justify-center gap-2 rounded-md bg-[var(--tumbo-cream)] px-1 py-1",
            { "bg-[var(--tumbo-cream)] group-hover/9f379f68:bg-[var(--tumbo-cream)]": selected }
          )}
        >
          {count ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption-bold font-caption-bold text-gray-700 text-center",
                { "text-gray-800": selected }
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

export const WarmFilterBadge = WarmFilterBadgeRoot;