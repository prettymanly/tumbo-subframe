"use client";

import React from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FeatherArmchair, FeatherAntenna, FeatherAlarmSmoke, FeatherListFilter, FeatherArrowUpDown, FeatherSearch, FeatherBookmark } from "@subframe/core";
import { LargeBadge } from "@/components/subframe/ui/components/LargeBadge";
import { Button } from "@/components/subframe/ui/components/Button";
import { TextField } from "@/components/subframe/ui/components/TextField";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Badge } from "@/components/subframe/ui/components/Badge";

function CuratedClassDetail() {
  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-16">
            <div className="flex w-full flex-col items-start gap-12">
              <div className="flex w-full flex-col items-start gap-4 relative">
                <img className="h-112 w-full flex-none rounded-md object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780577/uploads/302/hhmv6ey0yajkadnmcp0a.png" />
              </div>
              <span className="text-heading-1 font-heading-1 text-default-font">Curated Classes Detail</span>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-2 px-1 py-1">
            <span className="text-heading-2 font-heading-2 text-default-font">About this collection</span>
            <span className="text-body font-body text-default-font">Description of this collection.</span>
          </div>
          <div className="flex items-center gap-2">
            <LargeBadge icon={<FeatherArmchair />}>Product Design</LargeBadge>
            <LargeBadge icon={<FeatherAntenna />}>Product Design</LargeBadge>
            <LargeBadge icon={<FeatherAlarmSmoke />}>Product Design</LargeBadge>
          </div>
          <div className="flex w-full flex-col items-start gap-2 px-1 py-1">
            <span className="text-heading-2 font-heading-2 text-default-font">Classes in this collection</span>
            <span className="text-body font-body text-default-font">4 carefully curated classes that embody this approach.</span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2">
            <Button variant="neutral-secondary" icon={<FeatherListFilter />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Filter</Button>
            <Button variant="neutral-secondary" icon={<FeatherArrowUpDown />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Sort by price (high to low)</Button>
            <TextField label="" helpText="" icon={<FeatherSearch />}>
              <TextField.Input placeholder="Search" value="" onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}} />
            </TextField>
          </div>
          <div className="w-full items-start gap-4 grid grid-cols-3">
            <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                <img className="h-60 w-full flex-none border-b border-solid border-neutral-border object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780751/uploads/302/cbaa1tfstfnmksus95et.png" />
                <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
              </div>
              <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">Creative Little Architects</span>
                <span className="text-body font-body text-subtext-color">Build whimsical cities from cardboard, clay, and imagination.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Design</Badge>
                  <Badge variant="neutral">Hands-on</Badge>
                  <Badge variant="neutral">Play-based learning</Badge>
                </div>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                <img className="h-60 w-full flex-none border-b border-solid border-neutral-border object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780719/uploads/302/lf4i2zybfw9xxl56w6ce.png" />
                <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
              </div>
              <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">Story & Sketch Club</span>
                <span className="text-body font-body text-subtext-color">Turn your favourite tales into illustrated masterpieces.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Creative Writing & Art</Badge>
                  <Badge variant="neutral">Narrative-based </Badge>
                </div>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                <img className="h-60 w-full flex-none border-b border-solid border-neutral-border object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780859/uploads/302/hh4s5xjmsigiehqkb1uh.png" />
                <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
              </div>
              <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">Clay & Colour Studio</span>
                <span className="text-body font-body text-subtext-color">For kids that find joy in shaping, smoothing, and painting their own creations.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Ceramics & Painting</Badge>
                  <Badge variant="neutral">Fine motor focus </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full items-start gap-4 grid grid-cols-3">
            <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                <img className="h-60 w-full flex-none border-b border-solid border-neutral-border object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780730/uploads/302/bfoixbupgy9opiv7ljrb.png" />
                <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
              </div>
              <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">Young Innovators Lab</span>
                <span className="text-body font-body text-subtext-color">Prototype real solutions to real-world problems, kids style!</span>
                <Badge variant="neutral">STEM & Problem-Solving</Badge>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                <img className="h-60 w-full flex-none border-b border-solid border-neutral-border object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780779/uploads/302/rpnpvey9vgpe15ktp8j6.png" />
                <IconButton className="absolute left-2 top-2" variant="inverse" icon={<FeatherBookmark />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
              </div>
              <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">Kidtrepreneurs Market Day</span>
                <span className="text-body font-body text-subtext-color">Create, price, and sell your own products at a mini market.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Entrepreneurship</Badge>
                  <Badge variant="neutral"> Interactive role-play</Badge>
                </div>
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                <img className="h-60 w-full flex-none border-b border-solid border-neutral-border object-cover" src="https://res.cloudinary.com/subframe/image/upload/v1723780624/uploads/302/sxocuez05safdpfaztiz.png" />
                <IconButton className="absolute left-2 top-2" variant="inverse" icon={<FeatherBookmark />} onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
              </div>
              <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">Junior Community Reporters</span>
                <span className="text-body font-body text-subtext-color">For kids that want to ask questions, find answers, and share the story.</span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Inquisitive storytellers</Badge>
                  <Badge variant="neutral">Purpose-driven learning</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default CuratedClassDetail;
