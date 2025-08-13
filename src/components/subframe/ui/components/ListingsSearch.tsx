"use client";
/*
 * Documentation:
 * Listings Search — https://app.subframe.com/library?component=Listings+Search_70642323-feed-4702-878b-57509fa5e196
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherSearch } from "@subframe/core";

interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Input = React.forwardRef<HTMLDivElement, InputProps>(function Input(
  { label, value, children, className, ...otherProps }: InputProps,
  ref
) {
  return (
    <SubframeCore.Popover.Root>
      <SubframeCore.Popover.Trigger asChild={true}>
        <div
          className={SubframeUtils.twClassNames(
            "group/f639a2b0 flex h-16 w-full cursor-pointer items-center gap-4 rounded-full px-2 py-2 hover:bg-neutral-100 active:bg-white active:shadow-lg focus-within:bg-white focus-within:shadow-lg",
            className
          )}
          ref={ref}
          {...otherProps}
        >
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 px-4">
            {label ? (
              <span className="line-clamp-1 w-full text-caption-bold font-caption-bold text-default-font">
                {label}
              </span>
            ) : null}
            {value ? (
              <span className="line-clamp-1 w-full text-caption font-caption text-subtext-color">
                {value}
              </span>
            ) : null}
          </div>
        </div>
      </SubframeCore.Popover.Trigger>
      <SubframeCore.Popover.Portal>
        <SubframeCore.Popover.Content
          side="bottom"
          align="center"
          sideOffset={8}
          asChild={true}
        >
          <div className="flex min-h-[192px] min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-3 shadow-lg">
            {children ? (
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-2">
                {children}
              </div>
            ) : null}
          </div>
        </SubframeCore.Popover.Content>
      </SubframeCore.Popover.Portal>
    </SubframeCore.Popover.Root>
  );
});

interface SearchButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SearchButton = React.forwardRef<HTMLDivElement, SearchButtonProps>(
  function SearchButton({ className, ...otherProps }: SearchButtonProps, ref) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/7168f30e flex cursor-pointer flex-col items-start gap-4 rounded-full bg-brand-600 px-4 py-4 hover:bg-brand-500",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <FeatherSearch className="text-heading-2 font-heading-2 text-white" />
      </div>
    );
  }
);

interface ListingsSearchRootProps extends React.HTMLAttributes<HTMLDivElement> {
  isMobile?: boolean;
  className?: string;
}

const ListingsSearchRoot = React.forwardRef<
  HTMLDivElement,
  ListingsSearchRootProps
>(function ListingsSearchRoot(
  { isMobile = false, className, ...otherProps }: ListingsSearchRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/70642323 flex items-center gap-2 rounded-full border border-solid border-neutral-border bg-default-background shadow-sm overflow-auto",
        { "h-auto w-full flex-row flex-nowrap gap-2": isMobile },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <Input
        className={SubframeUtils.twClassNames("h-16 w-auto flex-none", {
          "h-16 grow shrink-0 basis-0": isMobile,
        })}
        label="Locations"
        value="All locations"
      />
      <div
        className={SubframeUtils.twClassNames(
          "flex h-8 w-px flex-none flex-col items-center gap-2 bg-neutral-300",
          { hidden: isMobile }
        )}
      />
      <Input
        className={SubframeUtils.twClassNames("h-16 w-auto flex-none", {
          hidden: isMobile,
        })}
        label="Age Group"
        value="All age groups"
      />
      <div
        className={SubframeUtils.twClassNames(
          "flex h-8 w-px flex-none flex-col items-center gap-2 bg-neutral-300",
          { hidden: isMobile }
        )}
      />
      <Input
        className={SubframeUtils.twClassNames("h-16 w-auto flex-none", {
          hidden: isMobile,
        })}
        label="Subject"
        value="All subjects"
      />
      <div
        className={SubframeUtils.twClassNames(
          "flex h-8 w-px flex-none flex-col items-center gap-2 bg-neutral-300",
          { hidden: isMobile }
        )}
      />
      <Input
        className={SubframeUtils.twClassNames("h-16 w-auto flex-none", {
          hidden: isMobile,
        })}
        label="Price"
        value="All price ranges"
      />
      <div className="flex items-center gap-2 pr-2">
        <SearchButton />
      </div>
    </div>
  );
});

export const ListingsSearch = Object.assign(ListingsSearchRoot, {
  Input,
  SearchButton,
});
