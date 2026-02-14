"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { Avatar } from "@/components/subframe/ui/components/Avatar";
import { Badge } from "@/components/subframe/ui/components/Badge";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Categories to EXCLUDE (not children's enrichment) ──
const EXCLUDED_BIOS = new Set([
  "Veterinarian", "Non-profit organization", "Farm", "Church",
  "Internet cafe", "Game store", "Graphic designer", "Adult education school",
  "Video production service", "Event planner", "Mental health clinic",
  "Wellness center", "Park", "Garden", "Nature preserve", "Community garden",
  "National forest", "Sporting goods store", "Water sports equipment rental service",
  "Cat boarding service", "Animal hospital", "Animal protection organization",
  "Wildlife rescue service", "Pet care service", "Government office",
  "Corporate office", "Dental clinic", "Bicycle rental service", "Bakery",
  "Credit counseling service", "Ambulance service", "Business center",
  "Musical instrument store", "Christian college", "College", "University",
  "Middle school", "Tourist attraction", "Health food store",
  "Agricultural organization", "Movie studio", "Religious organization",
  "Religious school", "Baptist church", "Christian church",
  "Non-denominational church", "Presbyterian church", "Buddhist temple",
  "Monastery", "Anglican church", "Dance store", "Wellness program",
  "Educational testing service", "Psychologist", "Portrait studio",
  "Photographer", "Artist", "Studying center",
]);

// ── Types ──
interface ProviderRow {
  id: string;
  name: string;
  bio: string | null;
  website: string | null;
  phone: string | null;
  street_address: string | null;
}

/** Extract the category label from "Provider offering: X, Y" */
function extractCategories(bio: string | null): string[] {
  if (!bio) return [];
  const match = bio.replace(/^Provider offering:\s*/i, "");
  return match
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Check if a provider is relevant children's enrichment */
function isRelevantProvider(p: ProviderRow): boolean {
  const cats = extractCategories(p.bio);
  if (cats.length === 0) return false;
  return !cats.every((c) => EXCLUDED_BIOS.has(c));
}

// ── Provider Card ──
function ProviderCard({ provider }: { provider: ProviderRow }) {
  const categories = extractCategories(provider.bio);
  const initial = provider.name.charAt(0).toUpperCase();

  return (
    <Link href={`/providers/${provider.id}`} className="block group">
      <div className="flex h-full flex-col items-start gap-4 rounded-lg border border-solid border-neutral-border bg-default-background p-5 shadow-sm group-hover:shadow-md group-hover:border-neutral-300 transition-all duration-300 relative">
        {/* Top row: initial + name */}
        <div className="flex w-full items-center gap-3.5">
          <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-[var(--tumbo-cream)] flex items-center justify-center text-[18px] font-bold text-gray-500">
            {initial}
          </div>
          <div className="flex grow flex-col items-start gap-0.5 min-w-0">
            <span className="text-[15px] font-semibold text-default-font truncate w-full">
              {provider.name}
            </span>
            {provider.street_address && (
              <span className="text-[12px] text-gray-400 truncate w-full">
                {provider.street_address}
              </span>
            )}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--tumbo-cream)] text-gray-600"
              >
                {cat}
              </span>
            ))}
            {categories.length > 3 && (
              <span className="text-[11px] text-gray-400">
                +{categories.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex w-full items-center justify-between mt-auto pt-3 border-t border-neutral-100">
          {provider.website ? (
            <span className="text-[11px] text-gray-400 truncate max-w-[60%]">
              {provider.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
            </span>
          ) : (
            <span className="text-[11px] text-gray-300">No website listed</span>
          )}
          <span className="text-[12px] font-semibold text-[var(--tumbo-orange)] group-hover:underline">
            View →
          </span>
        </div>

        {/* Accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--tumbo-orange)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-lg" />
      </div>
    </Link>
  );
}

// ── Skeleton Card ──
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-100 bg-white p-5 animate-pulse">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-lg bg-neutral-100" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 bg-neutral-100 rounded w-3/4" />
          <div className="h-3 bg-neutral-50 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 bg-neutral-50 rounded-full w-16" />
        <div className="h-5 bg-neutral-50 rounded-full w-20" />
      </div>
      <div className="h-px bg-neutral-50 mt-auto" />
    </div>
  );
}

// ── Page ──
const PAGE_SIZE = 60;

function ProvidersDirectoryPage() {
  const [allProviders, setAllProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [totalRaw, setTotalRaw] = useState(0);

  // Fetch providers from Supabase
  useEffect(() => {
    async function fetchProviders() {
      const supabase = supabaseBrowser();

      // Fetch all providers (4K rows is fine for client — ~200KB JSON)
      const { data, error, count } = await supabase
        .from("providers")
        .select("id, name, bio, website, phone, street_address", {
          count: "exact",
        })
        .order("name")
        .limit(4200);

      if (error) {
        console.error("Error fetching providers:", error);
        setLoading(false);
        return;
      }

      // Filter to children's enrichment only
      const filtered = (data || []).filter(isRelevantProvider);
      setAllProviders(filtered);
      setTotalRaw(count || 0);
      setLoading(false);
    }

    fetchProviders();
  }, []);

  // Search filter
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return allProviders;
    const q = searchQuery.toLowerCase();
    return allProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.bio && p.bio.toLowerCase().includes(q)) ||
        (p.street_address && p.street_address.toLowerCase().includes(q))
    );
  }, [allProviders, searchQuery]);

  const displayedProviders = filteredProviders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProviders.length;

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-12">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-10 py-12 px-4 md:px-6">
            {/* Header */}
            <FadeInUp className="flex w-full flex-col items-start gap-3">
              <span className="w-full text-heading-1 font-heading-1 text-default-font">
                Explore Providers
              </span>
              <span className="text-body font-body text-subtext-color max-w-2xl">
                Every class on Tümbo is run by a real provider. Browse the
                studios, academies, and educators behind the classes.
              </span>
              {!loading && (
                <span className="text-[13px] text-gray-400">
                  {allProviders.length.toLocaleString()} children&apos;s enrichment
                  providers in Singapore
                </span>
              )}
            </FadeInUp>

            {/* Search */}
            <div className="flex w-full max-w-lg items-center">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, category, or area"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-0 rounded-full bg-[var(--tumbo-cream)] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--tumbo-orange)] focus:bg-white transition-all text-[14px]"
                />
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : displayedProviders.length > 0 ? (
              <>
                <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>

                {/* Load more / count */}
                <div className="flex w-full items-center justify-between">
                  <span className="text-[13px] text-gray-400">
                    Showing {displayedProviders.length} of{" "}
                    {filteredProviders.length.toLocaleString()}
                    {searchQuery && " results"}
                  </span>
                  {hasMore && (
                    <button
                      onClick={() =>
                        setVisibleCount((prev) => prev + PAGE_SIZE)
                      }
                      className="px-5 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 border border-neutral-200 rounded-full hover:border-neutral-300 transition-colors"
                    >
                      Load more
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  No providers found
                </span>
                <span className="text-body font-body text-gray-400 text-center max-w-md">
                  No results for &ldquo;{searchQuery}&rdquo;. Try a different
                  term.
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 px-6 py-3 rounded-full bg-[var(--tumbo-orange)] text-white font-medium hover:opacity-90 transition-opacity text-[14px]"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="h-px w-full bg-neutral-200" />

            {/* Provider CTA */}
            <FadeInUp className="flex w-full flex-col items-center gap-5 py-10">
              <span className="text-heading-2 font-heading-2 text-default-font text-center">
                Are you a provider?
              </span>
              <span className="text-body font-body text-subtext-color text-center max-w-lg">
                If you run classes for children in Singapore, you might already
                be listed. Claim your page to update your info and connect with
                parents.
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/contact"
                  className="px-6 py-2.5 rounded-full bg-[var(--tumbo-orange)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
                >
                  Claim your listing
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-2.5 rounded-full border border-neutral-200 text-[14px] font-medium text-gray-600 hover:border-neutral-300 hover:text-gray-900 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default ProvidersDirectoryPage;
