"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { ListingsSearch } from "@/components/subframe/ui/components/ListingsSearch";

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
      image: "https://res.cloudinary.com/subframe/image/upload/v1723780751/uploads/302/cbaa1tfstfnmksus95et.png",
      badges: ["Design", "Hands-on", "Play-based learning"],
      href: "/classes/creative-little-architects"
    },
    {
      id: "story-sketch-club", 
      title: "Story & Sketch Club",
      description: "Turn your favourite tales into illustrated masterpieces.",
      image: "https://res.cloudinary.com/subframe/image/upload/v1723780719/uploads/302/lf4i2zybfw9xxl56w6ce.png",
      badges: ["Creative Writing & Art", "Narrative-based"],
      href: "/classes/story-sketch-club"
    },
    {
      id: "clay-colour-studio",
      title: "Clay & Colour Studio", 
      description: "For kids that find joy in shaping, smoothing, and painting their own creations.",
      image: "https://res.cloudinary.com/subframe/image/upload/v1723780859/uploads/302/hh4s5xjmsigiehqkb1uh.png",
      badges: ["Ceramics & Painting", "Fine motor focus"],
      href: "/classes/clay-colour-studio"
    },
    {
      id: "young-innovators-lab",
      title: "Young Innovators Lab",
      description: "Prototype real solutions to real-world problems, kids style!",
      image: "https://res.cloudinary.com/subframe/image/upload/v1723780730/uploads/302/bfoixbupgy9opiv7ljrb.png",
      badges: ["STEM & Problem-Solving"],
      href: "/classes/young-innovators-lab"
    },
    {
      id: "kidtrepreneurs-market",
      title: "Kidtrepreneurs Market Day",
      description: "Create, price, and sell your own products at a mini market.",
      image: "https://res.cloudinary.com/subframe/image/upload/v1723780779/uploads/302/rpnpvey9vgpe15ktp8j6.png",
      badges: ["Entrepreneurship", "Interactive role-play"],
      href: "/classes/kidtrepreneurs-market"
    },
    {
      id: "junior-community-reporters",
      title: "Junior Community Reporters",
      description: "For kids that want to ask questions, find answers, and share the story.",
      image: "https://res.cloudinary.com/subframe/image/upload/v1723780624/uploads/302/sxocuez05safdpfaztiz.png",
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
                  Handpicked classes based on Emma&apos;s interests and
                  developmental stage
                </span>
              </div>
              <div className="w-full items-start gap-4 grid grid-cols-3">
                {classes.map((classItem) => (
                  <Link key={classItem.id} href={classItem.href} className="block">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md bg-white shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start relative">
                        <img className="h-60 w-full flex-none object-cover" src={classItem.image} />
                        <button 
                          className="absolute right-2 top-2 bg-white rounded-full p-2 shadow-sm hover:bg-gray-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleBookmark(classItem.id);
                          }}
                        >
                          {bookmarkedClasses.has(classItem.id) ? '♥' : '♡'}
                        </button>
                      </div>
                      <div className="flex w-full flex-col items-start gap-1 px-4 py-4">
                        <span className="line-clamp-3 text-heading-3 font-heading-3 text-default-font">{classItem.title}</span>
                        <span className="text-body font-body text-subtext-color">{classItem.description}</span>
                        <div className="flex items-center gap-2">
                          {classItem.badges.map((badge, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
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