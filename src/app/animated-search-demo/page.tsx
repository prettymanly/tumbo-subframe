"use client";

import React from "react";
import { DefaultPageLayout } from "@/components/subframe/ui/layouts/DefaultPageLayout";
import { AnimatedTextField } from "@/components/AnimatedTextField";
import { AnimatedSearchPlaceholder } from "@/components/AnimatedSearchPlaceholder";
import { TextFieldUnstyled } from "@/components/subframe/ui/components/TextFieldUnstyled";
import { FeatherSearch } from "@subframe/core";

export default function AnimatedSearchDemoPage() {
  // Example phrases that could cycle through
  const searchPhrases = [
    "Shy 6-year-old who loves dinosaurs",
    "Creative 8-year-old interested in art",
    "Active 5-year-old who needs to burn energy",
    "Quiet 7-year-old who loves reading",
    "Social 9-year-old who enjoys group activities",
    "Curious 4-year-old fascinated by science",
    "Musical 10-year-old learning instruments"
  ];

  const shortPhrases = [
    "Find art classes",
    "Discover STEM programs",
    "Explore music lessons",
    "Search drama clubs",
    "Browse sports activities"
  ];

  return (
    <DefaultPageLayout>
      <div className="flex w-full flex-col items-start gap-8 px-6 py-8">
        <div className="w-full max-w-[1200px] mx-auto space-y-12">
          
          {/* Header */}
          <div>
            <h1 className="text-heading-1 font-heading-1 text-default-font mb-4">
              Animated Search Examples
            </h1>
            <p className="text-body font-body text-subtext-color">
              Examples of the rotating placeholder text animation like on tumbo.vercel.app
            </p>
          </div>

          {/* Example 1: Home Page Style */}
          <div className="space-y-4">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              Home Page Hero Search (Large)
            </h2>
            <div className="flex h-14 w-full max-w-[768px] flex-none items-center justify-center gap-2 rounded-full bg-neutral-100 px-2 py-2">
              <TextFieldUnstyled className="h-auto grow shrink-0 basis-0">
                <TextFieldUnstyled.Input
                  placeholder=""
                  value=""
                  onChange={() => {}}
                  style={{
                    '::placeholder': {
                      opacity: 0
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                  <AnimatedSearchPlaceholder 
                    phrases={searchPhrases}
                    typingSpeed={80}
                    deletingSpeed={40}
                    pauseTime={3000}
                    className="text-neutral-400"
                  />
                </div>
              </TextFieldUnstyled>
            </div>
          </div>

          {/* Example 2: Standard Search Field */}
          <div className="space-y-4">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              Standard Search Field
            </h2>
            <div className="max-w-md">
              <AnimatedTextField
                phrases={shortPhrases}
                label="Search Classes"
                typingSpeed={100}
                deletingSpeed={50}
                pauseTime={2000}
                onSubmit={(value) => console.log('Search:', value)}
              />
            </div>
          </div>

          {/* Example 3: Text Animation Only */}
          <div className="space-y-4">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              Text Animation Component (for any element)
            </h2>
            <div className="p-6 bg-neutral-50 rounded-lg">
              <p className="text-body font-body text-default-font">
                Looking for: <AnimatedSearchPlaceholder 
                  phrases={["the perfect class", "amazing teachers", "fun activities", "learning opportunities"]}
                  typingSpeed={120}
                  deletingSpeed={60}
                  pauseTime={2500}
                  className="text-brand-600 font-bold"
                />
              </p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              How to Use
            </h2>
            <div className="space-y-4">
              
              <div className="p-4 bg-neutral-900 rounded-lg text-green-400 text-sm overflow-x-auto">
                <pre>{`// 1. Import the components
import { AnimatedSearchPlaceholder, useAnimatedPlaceholder } from '@/components/AnimatedSearchPlaceholder';
import { AnimatedTextField } from '@/components/AnimatedTextField';

// 2. Define your phrases
const phrases = [
  "Shy 6-year-old who loves dinosaurs",
  "Creative 8-year-old interested in art",
  "Active 5-year-old who needs energy outlet"
];

// 3. Use in your component
<AnimatedSearchPlaceholder 
  phrases={phrases}
  typingSpeed={80}
  deletingSpeed={40}
  pauseTime={3000}
/>

// Or use the TextField wrapper
<AnimatedTextField
  phrases={phrases}
  onSubmit={(value) => handleSearch(value)}
/>`}</pre>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-body-bold font-body-bold text-default-font mb-2">Props:</h3>
                <ul className="text-caption font-caption text-default-font space-y-1">
                  <li><strong>phrases:</strong> Array of strings to cycle through</li>
                  <li><strong>typingSpeed:</strong> Speed of typing (ms per character, default: 100)</li>
                  <li><strong>deletingSpeed:</strong> Speed of deleting (ms per character, default: 50)</li>
                  <li><strong>pauseTime:</strong> Pause after completing each phrase (ms, default: 2000)</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DefaultPageLayout>
  );
}
