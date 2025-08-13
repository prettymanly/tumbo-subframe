"use client";
/*
 * Documentation:
 * Large Badge — https://app.subframe.com/library?component=Large+Badge_f003eb3b-6b6f-483f-8f2e-f6fcd63ad117
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherPlus } from "@subframe/core";

interface LargeBadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const LargeBadgeRoot = React.forwardRef<HTMLDivElement, LargeBadgeRootProps>(
  function LargeBadgeRoot(
    {
      icon = <FeatherPlus />,
      children,
      className,
      ...otherProps
    }: LargeBadgeRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/f003eb3b flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-solid border-neutral-border px-3 py-2 hover:bg-neutral-50 active:bg-neutral-100",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-brand-700">
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {children ? (
          <span className="text-caption-bold font-caption-bold text-default-font">
            {children}
          </span>
        ) : null}
      </div>
    );
  }
);

export const LargeBadge = LargeBadgeRoot;
