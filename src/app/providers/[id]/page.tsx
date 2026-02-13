"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { TagPill } from "@/components/ui/tag-pill";
import { CustomClassCard } from "@/components/ui/class-card";

// ── Placeholder data — will be replaced with Supabase fetch in Step 2 ──
const MOCK_PROVIDER = {
  id: "art-studio-kids",
  name: "Art Studio Kids",
  logo: "https://res.cloudinary.com/subframe/image/upload/v1718919568/uploads/3102/mmfbvgi9hwpewyqglgul.png",
  tagline: "Where creativity meets confidence",
  description:
    "Art Studio Kids has been nurturing young artists across Singapore since 2018. Founded by early childhood educators who believe every child is an artist, our studios create a safe, mess-friendly environment where children discover their creative voice through hands-on exploration of diverse mediums — from watercolor and acrylics to clay, printmaking, and mixed media.\n\nOur curriculum is designed around developmental milestones, ensuring each activity builds fine motor skills, visual-spatial awareness, and self-expression. With small class sizes (max 8 children) and patient, trained instructors, even the shyest child finds their confidence through art.",
  website: "artstudiokids.sg",
  phone: "+65 9123 4567",
  email: "hello@artstudiokids.sg",
  founded: "2018",
  tags: ["Creative Expression", "Fine Motor Skills", "Confidence Building", "Visual Arts", "Small Group"],
  locations: [
    {
      id: "ubi",
      name: "Ubi Studio",
      address: "10 Ubi Crescent, #01-43, Singapore 408564",
      hours: "Tue–Sat 9:00 AM – 6:00 PM",
      classCount: 4,
    },
    {
      id: "holland",
      name: "Holland Village Studio",
      address: "31 Holland Close, #01-05, Singapore 271031",
      hours: "Mon–Sat 9:30 AM – 6:30 PM",
      classCount: 6,
    },
    {
      id: "katong",
      name: "Katong Studio",
      address: "112 East Coast Road, #02-08, Singapore 428802",
      hours: "Tue–Sun 10:00 AM – 5:00 PM",
      classCount: 3,
    },
  ],
  classes: [
    // Ubi Studio — 4 classes
    { id: "creative-little-architects", title: "Creative Little Architects", description: "Explore architecture through hands-on building, design thinking, and creative problem solving.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780559/uploads/302/tkyvdicnwbc5ftuyysc0.png", badges: ["Creative Expression", "Fine Motor Skills", "Confidence Building"], href: "/classes/creative-little-architects", locationId: "ubi" },
    { id: "tiny-brushstrokes", title: "Tiny Brushstrokes", description: "Introduction to watercolor painting for little ones. Discover color mixing, brush control and creative expression.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780871/uploads/302/h25wathcuwiid5ulpu1i.png", badges: ["Visual Arts", "Fine Motor Skills"], href: "/classes/tiny-brushstrokes", locationId: "ubi" },
    { id: "clay-explorers-ubi", title: "Clay Explorers", description: "Hands-on pottery and sculpture for curious kids. Build, mold, and create with different types of clay.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780878/uploads/302/mdjcme9tm4svgmkjv4zf.png", badges: ["Hands-on", "Creative Expression"], href: "/classes/clay-explorers", locationId: "ubi" },
    { id: "colour-theory-kids", title: "Colour Theory for Kids", description: "Learn how colours work together through fun mixing experiments and painting projects.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780730/uploads/302/bfoixbupgy9opiv7ljrb.png", badges: ["Visual Arts", "Creative Expression"], href: "/classes/colour-theory-kids", locationId: "ubi" },
    // Holland Village — 6 classes
    { id: "mixed-media-makers", title: "Mixed Media Makers", description: "Combine painting, collage, printmaking and found materials into original artworks.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780696/uploads/302/hxk01sckxtlsjxi4n2dv.png", badges: ["Visual Arts", "Creative Expression"], href: "/classes/mixed-media-makers", locationId: "holland" },
    { id: "little-sculptors", title: "Little Sculptors", description: "3D art adventures with clay, wire, papier-mâché and recycled materials for young makers.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780878/uploads/302/mdjcme9tm4svgmkjv4zf.png", badges: ["Hands-on", "Fine Motor Skills"], href: "/classes/little-sculptors", locationId: "holland" },
    { id: "printmaking-play", title: "Printmaking Play", description: "Discover the magic of stamps, stencils, and screen printing in this tactile, process-driven class.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780871/uploads/302/h25wathcuwiid5ulpu1i.png", badges: ["Creative Expression", "Hands-on"], href: "/classes/printmaking-play", locationId: "holland" },
    { id: "art-journaling", title: "Art Journaling", description: "Combine drawing, writing and collage to create a personal visual diary that tells your story.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780559/uploads/302/tkyvdicnwbc5ftuyysc0.png", badges: ["Creative Expression", "Confidence Building"], href: "/classes/art-journaling", locationId: "holland" },
    { id: "nature-art-hv", title: "Nature Art", description: "Create art inspired by the natural world using leaves, flowers, sand and found objects.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780730/uploads/302/bfoixbupgy9opiv7ljrb.png", badges: ["Outdoor", "Creative Expression"], href: "/classes/nature-art", locationId: "holland" },
    { id: "canvas-kids-hv", title: "Canvas Kids", description: "Build confidence with acrylics on canvas. Each session ends with a finished painting to take home.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780696/uploads/302/hxk01sckxtlsjxi4n2dv.png", badges: ["Visual Arts", "Confidence Building"], href: "/classes/canvas-kids", locationId: "holland" },
    // Katong — 3 classes
    { id: "story-sketch-club", title: "Story Sketch Club", description: "Where storytelling meets illustration. Kids create their own picture books over a term.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780559/uploads/302/tkyvdicnwbc5ftuyysc0.png", badges: ["Creative Expression", "Visual Arts"], href: "/classes/story-sketch-club", locationId: "katong" },
    { id: "clay-explorers-katong", title: "Clay Explorers", description: "Hands-on pottery and sculpture for curious kids at our cosy Katong studio.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780878/uploads/302/mdjcme9tm4svgmkjv4zf.png", badges: ["Hands-on", "Fine Motor Skills"], href: "/classes/clay-explorers", locationId: "katong" },
    { id: "watercolour-wonders", title: "Watercolour Wonders", description: "Explore the beautiful unpredictability of watercolour through guided experiments and free painting.", image: "https://res.cloudinary.com/subframe/image/upload/v1723780871/uploads/302/h25wathcuwiid5ulpu1i.png", badges: ["Visual Arts", "Creative Expression"], href: "/classes/watercolour-wonders", locationId: "katong" },
  ],
};

export default function ProviderDetailPage() {
  const params = useParams();
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  // All locations active by default
  const [activeLocations, setActiveLocations] = useState<Set<string>>(() =>
    new Set(MOCK_PROVIDER.locations.map((l) => l.id))
  );

  // TODO: Fetch provider from Supabase using params.id
  const provider = MOCK_PROVIDER;

  const toggleLocation = (locId: string) => {
    setActiveLocations((prev) => {
      const next = new Set(prev);
      if (next.has(locId)) next.delete(locId);
      else next.add(locId);
      return next;
    });
  };

  const allActive = activeLocations.size === provider.locations.length;
  const filteredClasses = allActive
    ? provider.classes
    : provider.classes.filter((cls) => activeLocations.has(cls.locationId));

  const toggleBookmark = (classId: string) => {
    setBookmarkedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  const initial = provider.name.charAt(0).toUpperCase();

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center">
        <div className="w-full max-w-[1024px] flex flex-col items-start gap-10 px-4 md:px-6 py-12">
          {/* ── Header ── */}
          <FadeInUp className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-start gap-6 md:items-center">
              {provider.logo ? (
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-1 ring-black/[0.05] flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[var(--tumbo-cream)] flex items-center justify-center text-[28px] font-bold text-gray-500 flex-shrink-0">
                  {initial}
                </div>
              )}
              <div className="flex flex-col items-start gap-1.5">
                <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
                  {provider.name}
                </h1>
                <p className="text-[15px] text-gray-500">{provider.tagline}</p>
                <div className="flex items-center gap-3 mt-1">
                  {provider.website && (
                    <a
                      href={`https://${provider.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-medium text-[var(--tumbo-orange)] hover:underline"
                    >
                      {provider.website}
                    </a>
                  )}
                  {provider.phone && (
                    <span className="text-[12px] text-gray-400">{provider.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {provider.tags.map((tag) => (
                <TagPill key={tag} label={tag} size="md" />
              ))}
            </div>
          </FadeInUp>

          {/* ── About ── */}
          <FadeInUp className="flex w-full flex-col items-start gap-4">
            <h2 className="text-[20px] font-bold text-gray-900">About</h2>
            <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
              {provider.description}
            </p>
          </FadeInUp>

          {/* ── Locations (clickable filters) ── */}
          <FadeInUp className="flex w-full flex-col items-start gap-5">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-bold text-gray-900">Locations</h2>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[12px] font-medium text-gray-500">
                {provider.locations.length}
              </span>
              {!allActive && (
                <button
                  onClick={() => setActiveLocations(new Set(provider.locations.map((l) => l.id)))}
                  className="text-[12px] font-medium text-gray-400 hover:text-[var(--tumbo-orange)] transition-colors"
                >
                  Show all
                </button>
              )}
            </div>
            <p className="text-[13px] text-gray-400 -mt-3">
              Click a location to filter classes below
            </p>
            <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
              {provider.locations.map((loc) => {
                const isActive = activeLocations.has(loc.id);
                return (
                  <button
                    key={loc.id}
                    onClick={() => toggleLocation(loc.id)}
                    className={`flex flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-250 cursor-pointer ${
                      isActive
                        ? "border-[var(--tumbo-orange)]/40 bg-white shadow-sm ring-1 ring-[var(--tumbo-orange)]/10"
                        : "border-neutral-200 bg-neutral-50 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                        isActive ? "bg-[var(--tumbo-orange)]/10" : "bg-neutral-100"
                      }`}>
                        <svg className={`w-4 h-4 transition-colors duration-200 ${isActive ? "text-[var(--tumbo-orange)]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className={`text-[15px] font-semibold transition-colors duration-200 ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                        {loc.name}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{loc.address}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-100">
                      <span className="text-[12px] text-gray-400">{loc.hours}</span>
                      <span className={`text-[12px] font-semibold transition-colors duration-200 ${isActive ? "text-[var(--tumbo-orange)]" : "text-gray-400"}`}>
                        {loc.classCount} classes
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </FadeInUp>

          {/* ── Classes (filtered by active locations) ── */}
          <div className="flex w-full flex-col items-start gap-5">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-bold text-gray-900">Classes</h2>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[12px] font-medium text-gray-500">
                {filteredClasses.length}
                {!allActive && (
                  <span className="text-gray-400"> / {provider.classes.length}</span>
                )}
              </span>
            </div>
            {filteredClasses.length > 0 ? (
              <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map((cls) => (
                  <CustomClassCard
                    key={cls.id}
                    id={cls.id}
                    title={cls.title}
                    description={cls.description}
                    image={cls.image}
                    badges={cls.badges}
                    href={cls.href}
                    isBookmarked={bookmarkedClasses.has(cls.id)}
                    onBookmarkToggle={toggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-3 py-16 rounded-xl border border-dashed border-neutral-200">
                <span className="text-[15px] font-medium text-gray-400">No locations selected</span>
                <button
                  onClick={() => setActiveLocations(new Set(provider.locations.map((l) => l.id)))}
                  className="text-[13px] font-semibold text-[var(--tumbo-orange)] hover:underline"
                >
                  Show all locations
                </button>
              </div>
            )}
          </div>

          {/* ── Contact / CTA ── */}
          <FadeInUp className="flex w-full flex-col items-center gap-4 rounded-xl bg-[var(--tumbo-cream)] px-8 py-10 text-center">
            <h2 className="text-[20px] font-bold text-gray-900">
              Interested in {provider.name}?
            </h2>
            <p className="text-[14px] text-gray-500 max-w-md">
              Get in touch to learn more about their classes, schedule a trial, or ask any questions.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {provider.website && (
                <a
                  href={`https://${provider.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity"
                >
                  Visit website
                </a>
              )}
              {provider.email && (
                <a
                  href={`mailto:${provider.email}`}
                  className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-gray-700 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  Email them
                </a>
              )}
            </div>
          </FadeInUp>
        </div>
      </div>
    </ModernPageLayout>
  );
}
