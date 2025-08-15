"use client";

import React, { useState } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { ListingsSearch } from "@/components/subframe/ui/components/ListingsSearch";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { Badge } from "@/components/subframe/ui/components/Badge";
import Link from "next/link";

function ClassDirectoryPage() {
  // State to track bookmarked classes
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  
  const toggleBookmark = (classId: string) => {
    setBookmarkedClasses(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(classId)) {
        newBookmarks.delete(classId);
      } else {
        newBookmarks.add(classId);
      }
      return newBookmarks;
    });
  };

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-16">
            <div className="flex w-full flex-col items-start gap-7">
              <div className="flex w-full flex-col items-start gap-4">
                <span className="w-full text-heading-1 font-heading-1 text-default-font mobile:text-heading-1 mobile:font-heading-1">
                  Browse All Classes
                </span>
                <span className="text-body font-body text-default-font">
                  From art to STEM, browse curated enrichment classes with
                  filters that make finding the right fit fast.
                </span>
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-3 px-4 py-4">
                <ListingsSearch />
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Recommended for Emma
                </span>
                <span className="text-body font-body text-default-font">
                  Handpicked classes based on Emma&#39;s interests and
                  developmental stage
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                <Link href="/classes/creative-little-architects" className="block">
                  <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                      <img
                        className="h-60 w-full flex-none  object-cover"
                        src="/photos/classes/art_01.jpg"
                      />
                      <BookmarkButton
                        className="absolute right-2 top-2"
                        classId="creative-little-architects"
                        isBookmarked={bookmarkedClasses.has('creative-little-architects')}
                        onToggle={toggleBookmark}
                      />
                    </div>
                    <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                      <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                        Creative Little Architects
                      </span>
                      <span className="text-body font-body text-subtext-color">
                        Build whimsical cities from cardboard, clay, and
                        imagination.
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">Design</Badge>
                        <Badge variant="neutral">Hands-on</Badge>
                        <Badge variant="neutral">Play-based learning</Badge>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/art_02.jpg"
                    />
                    <BookmarkButton
                      className="absolute right-2 top-2"
                      classId="story-sketch-club"
                      isBookmarked={bookmarkedClasses.has('story-sketch-club')}
                      onToggle={toggleBookmark}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Story &amp; Sketch Club
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Turn your favourite tales into illustrated masterpieces.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">
                        Creative Writing &amp; Art
                      </Badge>
                      <Badge variant="neutral">Narrative-based </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/art_03.png"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Clay &amp; Colour Studio
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      For kids that find joy in shaping, smoothing, and painting
                      their own creations.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Ceramics &amp; Painting</Badge>
                      <Badge variant="neutral">Fine motor focus </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Real-World Readiness
                </span>
                <span className="text-body font-body text-default-font">
                  Skills for school, life, and everything in between.
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/science_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Young Innovators Lab
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Prototype real solutions to real-world problems, kids
                      style!
                    </span>
                    <Badge variant="neutral">STEM &amp; Problem-Solving</Badge>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/coding_01.png"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Kidtrepreneurs Market Day
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Create, price, and sell your own products at a mini
                      market.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Entrepreneurship</Badge>
                      <Badge variant="neutral"> Interactive role-play</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/robotics_01.png"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Junior Community Reporters
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      For kids that want to ask questions, find answers, and
                      share the story.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Inquisitive storytellers</Badge>
                      <Badge variant="neutral">Purpose-driven learning</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Confidence &amp; Character
                </span>
                <span className="text-body font-body text-default-font">
                  Nurturing self-belief, resilience, and the courage to be
                  themselves.
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/drama_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Spotlight Juniors
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Build stage presence and self-belief through fun
                      performance games.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Drama</Badge>
                      <Badge variant="neutral">
                        Shy-but-curious performers
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/drama_02.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Mini Mindfulness Explorers
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Learn calm, focus, and self-kindness through nature-based
                      mindfulness.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">
                        Mindfulness &amp; Wellbeing
                      </Badge>
                      <Badge variant="neutral">Sensory exploration</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/drama_03.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Brave Conversations Club
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      For kids that are ready to speak up, even if their voice
                      shakes.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Social confidence</Badge>
                      <Badge variant="neutral">Guided peer learning</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Curiosity &amp; Exploration
                </span>
                <span className="text-body font-body text-default-font">
                  Fueling wonder, big questions, and a lifelong love of
                  learning.
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/explore_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Science Detectives
                    </span>
                      <span className="text-body font-body text-subtext-color">
                       Uncover the &quot;why&quot; behind everyday wonders through hands-on
                       experiments.
                      </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Science &amp; Discovery</Badge>
                      <Badge variant="neutral">Hands-on</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/nature_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Culture Passport Kids
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Travel the world through music, crafts, and stories — all
                      in one room.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Multisensory activities</Badge>
                      <Badge variant="neutral">Global citizenship</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/outdoor_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Nature Trail Makers
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      For kids that see a path and wonder where else it could
                      go.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Outdoor Exploration</Badge>
                      <Badge variant="neutral">Nature-based learning</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Energy &amp; Engagement
                </span>
                <span className="text-body font-body text-default-font">
                  Channelling busy bodies and bright minds into joyful focus.
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/sports_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Rhythm &amp; Moves Crew
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      From hip-hop beats to body percussion, channel energy into
                      rhythm.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Dance &amp; Music</Badge>
                      <Badge variant="neutral">
                        High-energy group sessions
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/play_01.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Ninja Kids Obstacle Camp
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      Tackle agility courses that boost balance, strength, and
                      confidence.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">Fitness &amp; Agility</Badge>
                      <Badge variant="neutral">Learn-through-action</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm">
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                    <img
                      className="h-60 w-full flex-none  object-cover"
                      src="/photos/classes/play_02.jpg"
                    />
                    <IconButton
                      className="absolute right-2 top-2"
                      variant="inverse"
                      icon={<FeatherBookmark />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    />
                  </div>
                  <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                    <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">
                      Action Circus Juniors
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      For kids that want to juggle, tumble, and dazzle an
                      audience.
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">
                        Circus Arts &amp; Acrobatics
                      </Badge>
                      <Badge variant="neutral">Physical skill-building</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-200" />
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <span className="text-caption font-caption text-subtext-color">
                © Copyright 2024, Subframe, Inc. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default ClassDirectoryPage;
