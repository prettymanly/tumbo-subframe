"use client";

import React, { useState } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { ListingsSearch } from "@/components/subframe/ui/components/ListingsSearch";
import { ClassCard } from "@/components/subframe/ui/components/ClassCard";

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

  // Class data - in real app this would come from Supabase
  const classes = [
    {
      id: "creative-little-architects",
      title: "Creative Little Architects",
      description: "Build whimsical cities from cardboard, clay, and imagination.",
      image: "/photos/classes/art_01.jpg",
      badges: ["Design", "Hands-on", "Play-based learning"],
      href: "/classes/creative-little-architects"
    },
    {
      id: "story-sketch-club", 
      title: "Story & Sketch Club",
      description: "Turn your favourite tales into illustrated masterpieces.",
      image: "/photos/classes/art_02.jpg",
      badges: ["Creative Writing & Art", "Narrative-based"],
      href: "/classes/story-sketch-club"
    },
    {
      id: "clay-colour-studio",
      title: "Clay & Colour Studio", 
      description: "For kids that find joy in shaping, smoothing, and painting their own creations.",
      image: "/photos/classes/art_03.png",
      badges: ["Ceramics & Painting", "Fine motor focus"],
      href: "/classes/clay-colour-studio"
    },
    {
      id: "young-innovators-lab",
      title: "Young Innovators Lab",
      description: "Prototype real solutions to real-world problems, kids style!",
      image: "/photos/classes/science_01.jpg",
      badges: ["STEM & Problem-Solving"],
      href: "/classes/young-innovators-lab"
    },
    {
      id: "kidtrepreneurs-market",
      title: "Kidtrepreneurs Market Day",
      description: "Create, price, and sell your own products at a mini market.",
      image: "/photos/classes/play_01.jpg",
      badges: ["Entrepreneurship", "Interactive role-play"],
      href: "/classes/kidtrepreneurs-market"
    },
    {
      id: "junior-community-reporters",
      title: "Junior Community Reporters",
      description: "For kids that want to ask questions, find answers, and share the story.",
      image: "/photos/classes/explore_01.jpg",
      badges: ["Inquisitive storytellers", "Purpose-driven learning"],
      href: "/classes/junior-community-reporters"
    }
  ];

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
                  Handpicked classes based on Emma's interests and
                  developmental stage
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                {classes.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    title={classItem.title}
                    description={classItem.description}
                    image={classItem.image}
                    badges={classItem.badges}
                    href={classItem.href}
                    classId={classItem.id}
                    isBookmarked={bookmarkedClasses.has(classItem.id)}
                    onBookmarkToggle={toggleBookmark}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default ClassDirectoryPage;