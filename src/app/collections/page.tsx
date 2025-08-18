"use client";

import React from "react";
import Link from "next/link";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { Button } from "@/components/subframe/ui/components/Button";
import { FeatherChevronDown, FeatherSearch, FeatherBookmark } from "@subframe/core";
import { TextField } from "@/components/subframe/ui/components/TextField";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Tags } from "@/components/subframe/ui/components/Tags";
import { Badge } from "@/components/subframe/ui/components/Badge";

function CuratedClasses() {
  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-12 bg-default-background py-12">
            <div className="flex w-full items-center gap-2">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                <span className="w-full text-heading-1 font-heading-1 text-default-font">
                  Curated Collections
                </span>
                <div className="flex w-full items-center gap-2">
                  <div className="flex grow shrink-0 basis-0 flex-wrap items-center gap-2">
                    <Button>All</Button>
                    <Button variant="neutral-secondary">Recommended</Button>
                    <Button variant="neutral-secondary" iconRight={<FeatherChevronDown />}>Price</Button>
                    <Button variant="neutral-secondary" iconRight={<FeatherChevronDown />}>Sort by</Button>
                    <span className="text-caption font-caption text-subtext-color">36 collections</span>
                  </div>
                  <TextField className="h-auto w-72 flex-none" variant="filled" label="" helpText="" icon={<FeatherSearch />}>
                    <TextField.Input placeholder="Search collections..." value="" />
                  </TextField>
                </div>
              </div>
            </div>
            <span className="text-heading-2 font-heading-2 text-default-font">Recommended for Alex</span>
            <div className="flex w-full flex-wrap items-start gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                <Link href="/collections/big-energy-gentle-guidance" className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                  <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                  <img className="h-60 w-full flex-none object-cover" src="/photos/collections/Big Energy Gentle Guidance.png" />
                </Link>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                    <span className="text-caption-bold font-caption-bold text-brand-700">FEATURED</span>
                    <Link href="/collections/big-energy-gentle-guidance" className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">
                      Big Energy, Gentle Guidance
                    </Link>
                    <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids who bounce off the walls — and just need the right walls.</span>
                    <div className="flex items-center gap-2">
                      <Tags>Emotional regulation</Tags>
                      <Tags>High-movement</Tags>
                      <Badge>Calm mentors</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                <Link href="/collections/quiet-kids-loud-ideas" className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                  <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                  <img className="h-60 w-full flex-none object-cover" src="/photos/collections/Quiet Kids Loud Ideas.png" />
                </Link>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                    <span className="text-caption-bold font-caption-bold text-brand-700">FEATURED</span>
                    <Link href="/collections/quiet-kids-loud-ideas" className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">
                      Quiet Kids, Loud Ideas
                    </Link>
                    <span className="line-clamp-2 w-full text-body font-body text-default-font">For introverted kids who speak volumes — just not with their voice.</span>
                    <div className="flex items-center gap-2">
                      <Tags>Self-expression</Tags>
                      <Tags>Visual arts</Tags>
                      <Badge>Deep focus</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-9">
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">More Collections</span>
                <span className="text-body font-body text-default-font">Explore additional curated collections tailored to different learning styles and interests</span>
              </div>
              <div className="flex w-full flex-wrap items-start gap-6">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                  <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                    <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                    <img className="h-60 w-full flex-none object-cover" src="/photos/collections/When nothing holds their attention.png" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">When Nothing Holds Their Attention</span>
                      <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids who quit quickly — until something finally clicks.</span>
                      <div className="flex items-center gap-2">
                        <Tags>Exploratory learning</Tags>
                        <Tags>Short-cycle feedback</Tags>
                        <Badge>Intrinsic motivation</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                  <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                    <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                    <img className="h-60 w-full flex-none object-cover" src="/photos/collections/Confidence in disguise.png" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">Confidence in Disguise</span>
                      <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids who say &quot;I can&apos;t&quot; — until they forget they&apos;re trying.</span>
                      <div className="flex items-center gap-2">
                        <Tags>Confidence-building</Tags>
                        <Tags>Play-first</Tags>
                        <Badge>Growth mindset</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-wrap items-start gap-6">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                  <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                    <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                    <img className="h-60 w-full flex-none object-cover" src="/photos/collections/Srong Feelings Soft Places.png" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">Strong Feelings, Soft Places</span>
                      <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids who feel a lot, and need spaces that can hold them.</span>
                      <div className="flex items-center gap-2">
                        <Tags>Emotional safety</Tags>
                        <Tags>Expression through movement</Tags>
                        <Badge>Gentle pace</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                  <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                    <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                    <img className="h-60 w-full flex-none object-cover" src="/photos/collections/tiny rebels big hearts.png" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">Tiny Rebels, Big Hearts</span>
                      <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids who don&apos;t follow the rules — but follow curiosity.</span>
                      <div className="flex items-center gap-2">
                        <Tags>Autonomy</Tags>
                        <Tags>Curious minds</Tags>
                        <Badge>Values learning</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-wrap items-start gap-6">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                  <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                    <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                    <img className="h-60 w-full flex-none object-cover" src="/photos/collections/Stories that make you brave.png" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">Stories That Make You Brave</span>
                      <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids who need to see themselves in the stories they tell.</span>
                      <div className="flex items-center gap-2">
                        <Tags>Identity</Tags>
                        <Tags>Narrative thinking</Tags>
                        <Badge>Personal expression</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 overflow-hidden">
                  <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-md relative">
                    <IconButton className="absolute right-2 top-2" variant="inverse" icon={<FeatherBookmark />} />
                    <img className="h-60 w-full flex-none object-cover" src="/photos/collections/wired for wonder.png" />
                  </div>
                  <div className="flex w-full flex-col items-start gap-2">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="line-clamp-2 w-full text-heading-2 font-heading-2 text-default-font">Wired for Wonder</span>
                      <span className="line-clamp-2 w-full text-body font-body text-default-font">For kids whose questions spiral into discoveries.</span>
                      <div className="flex items-center gap-2">
                        <Tags>Curiosity-led</Tags>
                        <Tags>Tangential play</Tags>
                        <Badge>Awe</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default CuratedClasses;