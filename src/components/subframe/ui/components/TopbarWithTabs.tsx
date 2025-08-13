"use client";
/*
 * Documentation:
 * Topbar with tabs — https://app.subframe.com/library?component=Topbar+with+tabs_6da83a87-48a6-4316-a989-ea33ed7ff81e
 * Text Field — https://app.subframe.com/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Avatar — https://app.subframe.com/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  {
    selected = false,
    icon = null,
    children,
    className,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/42c794dd flex h-full cursor-pointer items-center gap-2 border-b-0 border-solid border-neutral-border px-2 py-2 hover:bg-transparent",
        { "border-b border-solid border-brand-primary": selected },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body font-body text-default-font group-hover/42c794dd:text-brand-700",
            { "text-brand-700": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-body-bold font-body-bold text-default-font group-hover/42c794dd:text-brand-700",
            { "text-brand-700": selected }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface TopbarWithTabsRootProps extends React.HTMLAttributes<HTMLElement> {
  rightSlot?: React.ReactNode;
  leftSlot?: React.ReactNode;
  className?: string;
}

const TopbarWithTabsRoot = React.forwardRef<
  HTMLElement,
  TopbarWithTabsRootProps
>(function TopbarWithTabsRoot(
  { rightSlot, leftSlot, className, ...otherProps }: TopbarWithTabsRootProps,
  ref
) {
  return (
    <nav
      className={SubframeUtils.twClassNames(
        "flex h-16 w-full items-center justify-between border-b border-solid border-neutral-border bg-default-background px-6",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {leftSlot ? (
        <div className="flex items-center gap-6 self-stretch">{leftSlot}</div>
      ) : null}
      {rightSlot ? (
        <div className="flex items-center justify-end gap-4">{rightSlot}</div>
      ) : null}
    </nav>
  );
});

export const TopbarWithTabs = Object.assign(TopbarWithTabsRoot, {
  NavItem,
});
