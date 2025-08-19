"use client";
/*
 * Documentation:
 * Class Card — https://app.subframe.com/library?component=Class+Card_e2147d22-d4e7-464c-bd18-dae445bf2b9d
 * Icon Button — https://app.subframe.com/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Badge — https://app.subframe.com/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherHeart } from "@subframe/core";
import { IconButton } from "./IconButton";
import { Badge } from "./Badge";

interface ClassCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const ClassCardRoot = React.forwardRef<HTMLDivElement, ClassCardRootProps>(
  function ClassCardRoot(
    { className, ...otherProps }: ClassCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex flex-col items-start gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full min-w-[240px] flex-col items-start gap-1 rounded-2xl bg-neutral-50">
          <div className="flex h-60 w-full flex-none flex-col items-center justify-center gap-24 overflow-hidden rounded-xl">
            <div className="flex w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-24">
              <img
                className="w-full grow shrink-0 basis-0 object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1722404911/uploads/302/uxswoalrzimh7g9ivtiq.webp"
              />
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-col items-start gap-2 px-6 py-6">
              <div className="flex w-full grow shrink-0 basis-0 items-start gap-2">
                <span className="grow shrink-0 basis-0 font-['Inter'] text-[24px] font-[700] leading-[32px] text-default-font -tracking-[0.035em]">
                  Creative Little Artists
                </span>
                <div className="flex flex-col items-center justify-center gap-2 self-stretch">
                  <IconButton icon={<FeatherHeart />} />
                </div>
              </div>
              <span className="w-full whitespace-pre-wrap font-['Inter'] text-[16px] font-[400] leading-[24px] text-subtext-color -tracking-[0.01em]">
                {"For kids becoming creators, not just consumers."}
              </span>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Creative Expression</Badge>
                  <Badge variant="neutral">Growth Mindset</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export const ClassCard = ClassCardRoot;
