"use client";
/*
 * Documentation:
 * Listings Search — https://app.subframe.com/library?component=Listings+Search_70642323-feed-4702-878b-57509fa5e196
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
// Suggestions are rendered inline to avoid DropdownMenu context requirements

interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  value?: string;
  placeholder?: string;
  onChange?: (next: string) => void;
  suggestions?: string[];
  className?: string;
}

const Input = React.forwardRef<HTMLDivElement, InputProps>(function Input(
  { label, value = "", placeholder, onChange, suggestions = [], className, ...otherProps }: InputProps,
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
            <input
              className="w-full bg-transparent outline-none text-caption font-caption text-subtext-color placeholder:text-subtext-color"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
            />
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
          <div className="flex min-h-[192px] min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-white px-1 py-1 shadow-lg">
            {suggestions.length > 0 ? (
              <div className="flex w-full flex-col">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-left hover:bg-neutral-100 active:bg-neutral-50"
                    onClick={() => onChange?.(s)}
                  >
                    <span className="line-clamp-1 grow text-body font-body text-default-font">{s}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-caption text-subtext-color">No suggestions</div>
            )}
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
  const [location, setLocation] = React.useState("");
  const [age, setAge] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [price, setPrice] = React.useState("");

  const locationOptions = [
    "All locations",
    "Central",
    "East",
    "West",
    "North",
    "Online",
  ];
  const ageOptions = [
    "All age groups",
    "3-5",
    "6-8",
    "9-12",
    "13-16",
  ];
  const subjectOptions = [
    "All subjects",
    "Art",
    "STEM",
    "Music",
    "Sports",
    "Coding",
  ];
  const priceOptions = [
    "All price ranges",
    "Free",
    "< $50",
    "$50 – $100",
    "$100 – $200",
    "> $200",
  ];

  const filterByQuery = (query: string, options: string[]) =>
    options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/70642323 flex items-center gap-2 rounded-full border border-solid border-neutral-border bg-white shadow-sm overflow-auto",
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
        placeholder="All locations"
        value={location}
        onChange={setLocation}
        suggestions={filterByQuery(location, locationOptions)}
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
        placeholder="All age groups"
        value={age}
        onChange={setAge}
        suggestions={filterByQuery(age, ageOptions)}
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
        placeholder="All subjects"
        value={subject}
        onChange={setSubject}
        suggestions={filterByQuery(subject, subjectOptions)}
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
        placeholder="All price ranges"
        value={price}
        onChange={setPrice}
        suggestions={filterByQuery(price, priceOptions)}
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
