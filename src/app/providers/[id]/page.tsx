"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { TagPill } from "@/components/ui/tag-pill";
import { CustomClassCard } from "@/components/ui/class-card";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Provider, DBClass, formatPrice, formatAgeRange, parseGooglePlaces } from "@/lib/types/tags";

// ── Category image fallbacks ──
const CATEGORY_IMAGES: Record<string, string> = {
  Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&q=80",
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=640&q=80",
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&q=80",
  Swimming: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=640&q=80",
  Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=640&q=80",
  Chinese: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
  Mathematics: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=640&q=80",
  English: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=640&q=80",
  Piano: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=640&q=80",
};

export default function ProviderDetailPage() {
  const params = useParams();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [classes, setClasses] = useState<DBClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ── Fetch from Supabase ──
  useEffect(() => {
    async function fetchProvider() {
      if (!providerId) return;
      const supabase = supabaseBrowser();

      // Fetch provider
      const { data: providerData, error: provErr } = await supabase
        .from("providers")
        .select("*")
        .eq("id", providerId)
        .single();

      if (provErr || !providerData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProvider(providerData);

      // Fetch this provider's enriched classes
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("provider_id", providerId)
        .eq("is_placeholder", false)
        .eq("hidden_from_directory", false)
        .order("name", { ascending: true });

      setClasses(classData || []);
      setLoading(false);
    }
    fetchProvider();
  }, [providerId]);

  const toggleBookmark = (classId: string) => {
    setBookmarkedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  // ── Derive categories from classes ──
  const categories = [...new Set(classes.map((c) => c.category).filter(Boolean))] as string[];
  const filteredClasses = selectedCategory
    ? classes.filter((c) => c.category === selectedCategory)
    : classes;

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex w-full flex-col items-center gap-8 py-12">
          <div className="w-full max-w-[960px] flex flex-col gap-6 px-4">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse mt-4" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </ModernPageLayout>
    );
  }

  if (notFound || !provider) {
    return (
      <ModernPageLayout>
        <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
          <span className="text-heading-1 font-heading-1 text-default-font">Provider not found</span>
          <span className="text-body text-gray-500">This provider may have been removed or the link is incorrect.</span>
          <Link href="/providers" className="mt-4 px-6 py-3 rounded-full bg-[var(--tumbo-orange)] text-white font-semibold hover:opacity-90 transition-opacity">
            Browse all providers
          </Link>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex w-full max-w-[960px] flex-col items-start gap-8 px-4 py-12">
          {/* Header */}
          <FadeInUp as="div" className="flex w-full flex-col items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--tumbo-cream)] flex items-center justify-center text-[28px] font-bold text-gray-500 flex-shrink-0">
                {provider.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-heading-1 font-heading-1 text-default-font">{provider.name}</h1>
                {provider.bio && provider.bio !== `Provider offering: ${classes[0]?.category || ""}` && (
                  <p className="text-[15px] text-gray-500">{provider.bio}</p>
                )}
              </div>
            </div>

            {/* Google rating */}
            {(() => {
              const gd = parseGooglePlaces(provider.classes_scrape_source);
              if (!gd?.google_rating) return null;
              return (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(gd.google_rating!) ? "text-[var(--tumbo-orange)]" : "text-[var(--tumbo-hover)]"}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[14px] font-semibold text-gray-900">{gd.google_rating.toFixed(1)}</span>
                  {gd.google_review_count != null && (
                    <span className="text-[13px] text-gray-400">({gd.google_review_count} Google reviews)</span>
                  )}
                </div>
              );
            })()}

            {/* Contact info */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {provider.phone && (
                <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {provider.phone}
                </div>
              )}
              {provider.website && (
                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-[var(--tumbo-orange)] hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {provider.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              {provider.street_address && (
                <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {provider.street_address}
                </div>
              )}
            </div>
          </FadeInUp>

          <div className="flex h-px w-full bg-neutral-200" />

          {/* Classes section */}
          <FadeInUp as="div" className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-end justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-heading-2 font-heading-2 text-default-font">
                  Classes {classes.length > 0 ? `(${filteredClasses.length})` : ""}
                </h2>
                <p className="text-[13px] text-gray-400">
                  {classes.length > 0
                    ? "Enriched class listings from this provider"
                    : "No enriched classes yet — check back soon"}
                </p>
              </div>
            </div>

            {/* Category filter pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    !selectedCategory ? "bg-[var(--tumbo-orange)] text-white" : "bg-[var(--tumbo-cream)] text-gray-600 hover:bg-[var(--tumbo-hover)]"
                  }`}
                >
                  All ({classes.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-[var(--tumbo-orange)] text-white"
                        : "bg-neutral-100 text-gray-600 hover:bg-neutral-200"
                    }`}
                  >
                    {cat} ({classes.filter((c) => c.category === cat).length})
                  </button>
                ))}
              </div>
            )}

            {/* Class cards grid */}
            {filteredClasses.length > 0 ? (
              <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                  <CustomClassCard
                    key={cls.id}
                    id={cls.id}
                    title={cls.name}
                    description={cls.summary || cls.vibe_line || cls.description || ""}
                    image={cls.photo_url || CATEGORY_IMAGES[cls.category || ""] || CATEGORY_IMAGES.Art}
                    badges={[
                      cls.category,
                      cls.age_min != null ? formatAgeRange(cls.age_min, cls.age_max) : null,
                      cls.price ? formatPrice(cls.price) : null,
                    ].filter(Boolean) as string[]}
                    href={`/classes/${cls.id}`}
                    isBookmarked={bookmarkedClasses.has(cls.id)}
                    onBookmarkToggle={toggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-3 py-16 rounded-lg border border-dashed border-neutral-200">
                <span className="text-[14px] text-gray-400">No enriched classes for this provider yet</span>
                <Link href="/classes" className="text-[13px] font-semibold text-[var(--tumbo-orange)] hover:underline">
                  Browse all classes →
                </Link>
              </div>
            )}
          </FadeInUp>
        </div>
      </div>
    </ModernPageLayout>
  );
}
