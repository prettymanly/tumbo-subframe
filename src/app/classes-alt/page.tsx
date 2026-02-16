"use client";

// ── /classes-alt — Editorial discovery surface (Variant 2: Hybrid) ──
// Radically different presentation from /classes. Same data pipeline.
//
// Structure:
//   EditorialHero  — Framer-scale heading, search, taxonomy tags (no intent chips)
//   Section A      — Showcase grid (Rail 1 data, EditorialCard, 3-col)
//   Section B      — Collections (4 intent rails as large tiles with thumbnails)
//   Section C      — More to explore (infinite scroll grid, EditorialCard)
//
// Non-negotiables:
//   • No intent chips on this surface
//   • Taxonomy tags use same getTopTags + selectDisplayTags pipeline as /classes
//   • No data logic duplication beyond the state hooks (same as /classes/page.tsx)
//   • /classes remains untouched

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { EditorialHero } from "@/components/ui/editorial-hero";
import type { TagRowItem } from "@/components/ui/hero-section";
import { EditorialCard } from "@/components/ui/editorial-card";
import { CollectionTile } from "@/components/ui/collection-tile";
import { RailSkeleton } from "@/components/ui/rail-section";
import { RailLoader } from "@/components/ui/rail-loader";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import { FilterState } from "@/components/ui/filter-chips";
import FilterChips from "@/components/ui/filter-chips";
import { CustomClassCard, BadgeItem } from "@/components/ui/class-card";
import { DBClass, Provider, getTopTags } from "@/lib/types/tags";
import { RAIL_ORDER, RAIL_MAP, RAILS } from "@/lib/rails/config";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { RailApiResponse, RailCardItem } from "@/lib/rails/types";
import type { TagCategory } from "@/components/ui/tag-pill";

// ── Collection rails (intent-based rails 3–6) ──
const COLLECTION_RAILS = RAILS.filter((r) => r.intentSignals.length > 0);

// ── Session seed — stable within a day ──
function getSessionSeed(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const stored = sessionStorage.getItem("tumbo_seed");
  const storedDate = sessionStorage.getItem("tumbo_seed_date");
  if (stored && storedDate === today) return parseInt(stored);
  const seed = Math.floor(Math.random() * 2147483647);
  sessionStorage.setItem("tumbo_seed", seed.toString());
  sessionStorage.setItem("tumbo_seed_date", today);
  return seed;
}

// ── Fetch a single rail from the API ──
async function fetchRail(
  railId: string,
  seed: number,
  excludeIds: string[] = [],
): Promise<RailApiResponse | null> {
  try {
    const params = new URLSearchParams({ seed: seed.toString(), limit: "12" });
    if (excludeIds.length > 0) params.set("exclude", excludeIds.join(","));
    const res = await fetch(`/api/rails/${railId}?${params.toString()}`);
    if (!res.ok) return null;
    return (await res.json()) as RailApiResponse;
  } catch {
    return null;
  }
}

// ── Category fallback images ──
const CATEGORY_IMAGES: Record<string, string> = {
  Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=70",
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=70",
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70",
  Swimming: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=400&q=70",
  Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=70",
};
function getClassImage(cls: DBClass): string {
  return cls.photo_url || CATEGORY_IMAGES[cls.category || ""] || CATEGORY_IMAGES.Art;
}

// ── Responsive ──
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ── Deduplicate ──
function deduplicateByProvider(classes: DBClass[]): DBClass[] {
  const best = new Map<string, DBClass>();
  for (const cls of classes) {
    const key = cls.provider_id ?? cls.id;
    const existing = best.get(key);
    if (!existing || qualityScore(cls) > qualityScore(existing)) {
      best.set(key, cls);
    }
  }
  return Array.from(best.values());
}

function qualityScore(cls: DBClass): number {
  let s = 0;
  if (cls.description) s += Math.min(cls.description.length, 500);
  if (cls.summary) s += 100;
  if (cls.vibe_line) s += 50;
  if (cls.google_rating) s += cls.google_rating * 20;
  if (cls.review_count) s += Math.min(cls.review_count, 50);
  if (cls.age_min != null) s += 30;
  if (cls.photo_url) s += 40;
  return s;
}

const INFINITE_BATCH = 20;

// ── Sentinel ──
function InfiniteScrollSentinel({ onLoadMore }: { onLoadMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onLoadMore);
  cb.current = onLoadMore;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) cb.current(); },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex w-full items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-[var(--tumbo-orange)]" />
    </div>
  );
}

// ── Editorial grid skeleton ──
function EditorialGridSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 px-6 md:px-10 lg:px-16">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="rounded-xl bg-white ring-1 ring-black/[0.04] overflow-hidden">
            <div className="w-full h-48 md:h-56 lg:h-64 bg-neutral-100" />
            <div className="px-4 pt-3 pb-4 flex flex-col gap-1.5">
              <div className="h-3 w-16 bg-neutral-100 rounded" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="h-3 w-20 bg-neutral-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Main page component ──
// ══════════════════════════════════════════════════════════════

function ClassDirectoryAltPage() {
  const isMobile = useIsMobile();

  // ── Core state (same data pipeline as /classes) ──
  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [totalClasses, setTotalClasses] = useState(0);

  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());

  // ── Search / filter / tag state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    locations: [], ageRanges: [], days: [], timeSlots: [],
    priceRanges: [], contentTypes: [], experienceStyles: [],
    educationalPhilosophies: [], personalityTraits: [], searchTerms: [],
  });

  // ── Browse dataset ──
  const [allClasses, setAllClasses] = useState<DBClass[]>([]);
  const [providerMap, setProviderMap] = useState<Record<string, Provider>>({});
  const [browseLoading, setBrowseLoading] = useState(false);
  const allClassesLoadedRef = useRef(false);

  const [infiniteCount, setInfiniteCount] = useState(INFINITE_BATCH);

  // ── Initialize ──
  useEffect(() => { setSeed(getSessionSeed()); }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tumbo_bookmarks");
      if (saved) setBookmarkedClasses(new Set(JSON.parse(saved)));
    } catch { /* noop */ }
  }, []);

  const toggleBookmark = useCallback((classId: string) => {
    setBookmarkedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      try { localStorage.setItem("tumbo_bookmarks", JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  }, []);

  const seedRef = useRef(seed);
  seedRef.current = seed;

  const loadRail = useCallback(async (railId: string) => {
    if (railDataRef.current[railId] || loadingRef.current.has(railId)) return;
    loadingRef.current.add(railId);
    setRailData((prev) => ({ ...prev }));

    const data = await fetchRail(railId, seedRef.current, shownIdsRef.current);
    loadingRef.current.delete(railId);

    if (data) {
      setRailData((prev) => ({ ...prev, [railId]: data }));
      const newIds = data.items.map((item) => item.id);
      shownIdsRef.current = [...shownIdsRef.current, ...newIds];
    } else {
      setRailData((prev) => ({ ...prev }));
    }
  }, []);

  // ── Fetch total class count ──
  useEffect(() => {
    fetch("/api/rails/meta")
      .then((r) => r.json())
      .then((meta) => { if (meta.totalClasses) setTotalClasses(meta.totalClasses); })
      .catch(() => {});
  }, []);

  // ── Lazy-load all classes for search/filter/infinite scroll ──
  const loadAllClasses = useCallback(async () => {
    if (allClassesLoadedRef.current || browseLoading) return;
    allClassesLoadedRef.current = true;
    setBrowseLoading(true);
    try {
      const { supabaseBrowser } = await import("@/lib/supabase/client");
      const { fetchAllVisibleClasses } = await import("@/lib/supabase/queries");
      const supabase = supabaseBrowser();
      const [allVisible, providerRes] = await Promise.all([
        fetchAllVisibleClasses(supabase),
        supabase.from("providers").select("*"),
      ]);
      setAllClasses(deduplicateByProvider(allVisible as DBClass[]));
      const pMap: Record<string, Provider> = {};
      for (const p of providerRes.data || []) pMap[p.id] = p;
      setProviderMap(pMap);
    } catch (e) {
      allClassesLoadedRef.current = false; // allow retry on failure
      console.error("Failed to load classes:", e);
    }
    setBrowseLoading(false);
  }, [browseLoading]);

  // ── Search/filter state ──
  const isSearchActive = searchQuery.trim().length > 0 || activeTag !== null;
  const hasActiveFilters = Object.values(currentFilters).some(
    (v) => Array.isArray(v) && v.length > 0,
  );
  const showFilteredGrid = isSearchActive || hasActiveFilters;


  // ── Top tags for taxonomy row ──
  const topTags: TagRowItem[] = useMemo(() => {
    if (allClasses.length === 0) return [];
    return getTopTags(allClasses, selectDisplayTags);
  }, [allClasses]);

  // ── Filtered classes ──
  const filteredClasses = useMemo(() => {
    return allClasses.filter((cls) => {
      if (activeTag) {
        const cardTags = selectDisplayTags(cls);
        if (!cardTags.some((t) => t.label === activeTag)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !cls.name.toLowerCase().includes(q) &&
          !(cls.description || "").toLowerCase().includes(q) &&
          !(cls.category || "").toLowerCase().includes(q) &&
          !(cls.vibe_line || "").toLowerCase().includes(q)
        ) return false;
      }
      if (currentFilters.priceRanges.length > 0 && cls.price) {
        if (!currentFilters.priceRanges.some((range) => {
          if (range === "Under $30") return cls.price! < 30;
          if (range === "$30-$50") return cls.price! >= 30 && cls.price! <= 50;
          if (range === "$50-$80") return cls.price! > 50 && cls.price! <= 80;
          if (range === "Over $80") return cls.price! > 80;
          return true;
        })) return false;
      }
      if (currentFilters.ageRanges.length > 0) {
        if (!currentFilters.ageRanges.some((range) => {
          if (range === "0-2 years" && cls.age_min != null) return cls.age_min <= 2;
          if (range === "3-5 years") return (cls.age_min ?? 99) <= 5 && (cls.age_max ?? 0) >= 3;
          if (range === "6-8 years") return (cls.age_min ?? 99) <= 8 && (cls.age_max ?? 0) >= 6;
          if (range === "9-12 years") return (cls.age_min ?? 99) <= 12 && (cls.age_max ?? 0) >= 9;
          if (range === "13+ years" && cls.age_max != null) return cls.age_max >= 13;
          return true;
        })) return false;
      }
      return true;
    });
  }, [allClasses, searchQuery, activeTag, currentFilters.priceRanges, currentFilters.ageRanges]);

  const toBrowseBadges = useCallback((cls: DBClass): BadgeItem[] => {
    return selectDisplayTags(cls).map((t) => ({ label: t.label, category: t.dimension as TagCategory }));
  }, []);

  // ── Infinite scroll ──
  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  // ── Load all classes when search/filter/tag activates ──
  useEffect(() => {
    if (showFilteredGrid && !allClassesLoadedRef.current) {
      loadAllClasses();
    }
  }, [showFilteredGrid, loadAllClasses]);

  // ── Load all classes once all rails finish (for taxonomy tags + "More to explore") ──
  useEffect(() => {
    if (allRailsLoaded && !allClassesLoadedRef.current && !showFilteredGrid) {
      loadAllClasses();
    }
  }, [allRailsLoaded, showFilteredGrid, loadAllClasses]);

  const handleLoadMore = useCallback(() => {
    setInfiniteCount((prev) => prev + INFINITE_BATCH);
  }, []);

  const infiniteClasses = useMemo(() => {
    if (allClasses.length === 0) return [];
    const shownSet = new Set(shownIdsRef.current);
    return allClasses.filter((cls) => !shownSet.has(cls.id));
  }, [allClasses]);

  // ── Handlers ──
  const handleFiltersChange = useCallback((f: FilterState) => setCurrentFilters(f), []);
  const handleFilterClick = useCallback(() => setFilterSidebarOpen((p) => !p), []);
  const handleTagClick = useCallback((v: string) => {
    setActiveTag(v || null);
    setInfiniteCount(INFINITE_BATCH);
  }, []);
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    setInfiniteCount(INFINITE_BATCH);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && filterSidebarOpen) setFilterSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [filterSidebarOpen]);

  // ── Eagerly load all rails for collection tile previews ──
  // Rail 1 loads immediately, rest stagger every 400ms after 1s
  useEffect(() => {
    if (seed === 0) return;
    // Reset loading guards on mount (handles HMR + StrictMode double-mount)
    loadingRef.current.clear();
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Load first rail immediately for showcase grid
    loadRail(RAIL_ORDER[0]);
    // Stagger remaining rails
    RAIL_ORDER.slice(1).forEach((railId, i) => {
      timers.push(setTimeout(() => {
        if (!cancelled) loadRail(railId);
      }, 1000 + i * 400));
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [seed, loadRail]);

  // ═══════════════════════════════════ RENDER ═══════════════════════════════════

  // ── Get showcase items (Rail 1 = recommended) ──
  const showcaseData = railData[RAIL_ORDER[0]];
  const showcaseItems = showcaseData?.items ?? [];
  const showcaseCount = isMobile ? 4 : 6;

  const mainContent = (
    <div className="flex w-full flex-col items-start">
      <EditorialHero
        classCount={totalClasses}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterClick={handleFilterClick}
        filterSidebarOpen={filterSidebarOpen}
        tags={topTags}
        activeTag={activeTag}
        onTagClick={handleTagClick}
      />

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="px-6 md:px-10 lg:px-16 w-full pt-2">
          <FilterChips
            filters={currentFilters}
            onRemoveFilter={(filterType, value) => {
              setCurrentFilters((prev) => ({
                ...prev,
                [filterType]: (prev[filterType] as string[]).filter((item) => item !== value),
              }));
            }}
            onClearAll={() => {
              setCurrentFilters({
                locations: [], ageRanges: [], days: [], timeSlots: [],
                priceRanges: [], contentTypes: [], experienceStyles: [],
                educationalPhilosophies: [], personalityTraits: [], searchTerms: [],
              });
              setSearchQuery("");
              setActiveTag(null);
            }}
          />
        </div>
      )}

      {/* ── FILTERED GRID (search/tag/filter active) ── */}
      {showFilteredGrid ? (
        <div className="flex w-full flex-col items-start gap-4 pt-6 pb-12">
          <div className="px-6 md:px-10 lg:px-16">
            <p className="text-[13px] text-neutral-400">
              {browseLoading ? "Loading..." : `${filteredClasses.length} classes found`}
            </p>
          </div>
          {browseLoading ? (
            <EditorialGridSkeleton />
          ) : filteredClasses.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center gap-4 py-20 px-6">
              <span className="text-[24px] font-semibold text-default-font">No classes found</span>
              <span className="text-[15px] text-neutral-500 text-center max-w-md">
                Try broadening your search or removing some filters.
              </span>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 px-6 md:px-10 lg:px-16">
              {filteredClasses.slice(0, infiniteCount).map((cls) => (
                <CustomClassCard
                  key={cls.id}
                  id={cls.id}
                  title={cls.name}
                  providerName={cls.provider_id ? providerMap[cls.provider_id]?.name : undefined}
                  description={cls.summary || cls.vibe_line || cls.description || ""}
                  image={getClassImage(cls)}
                  badges={toBrowseBadges(cls)}
                  href={`/classes/${cls.id}`}
                  isBookmarked={bookmarkedClasses.has(cls.id)}
                  onBookmarkToggle={toggleBookmark}
                  category={cls.category ?? undefined}
                  ageMin={cls.age_min ?? undefined}
                  ageMax={cls.age_max ?? undefined}
                  vibeLine={cls.vibe_line ?? undefined}
                />
              ))}
            </div>
          )}
          {filteredClasses.length > infiniteCount && (
            <InfiniteScrollSentinel onLoadMore={handleLoadMore} />
          )}
        </div>
      ) : (
        /* ── EDITORIAL DISCOVERY MODE ── */
        <>
          {/* ═══ SECTION A — Showcase Grid ═══ */}
          <section className="w-full pt-10 md:pt-16 pb-12 md:pb-20">
            <div className="px-6 md:px-10 lg:px-16 mb-6 md:mb-8">
              <h2 className="text-[20px] md:text-[24px] font-semibold text-default-font tracking-[-0.01em]">
                Start here
              </h2>
              <p className="text-[13px] md:text-[15px] text-neutral-500 mt-1">
                A fresh pick of classes worth exploring this week
              </p>
            </div>

            {showcaseItems.length > 0 ? (
              <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 px-6 md:px-10 lg:px-16">
                {showcaseItems.slice(0, showcaseCount).map((item, i) => (
                  <EditorialCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    providerName={item.providerName}
                    image={item.image}
                    href={item.href}
                    isBookmarked={bookmarkedClasses.has(item.id)}
                    onBookmarkToggle={toggleBookmark}
                    category={item.category}
                    priority={i < 2}
                  />
                ))}
              </div>
            ) : (
              <EditorialGridSkeleton />
            )}
          </section>

          {/* ── Divider ── */}
          <div className="w-full px-6 md:px-10 lg:px-16">
            <hr className="border-t border-neutral-200/60" />
          </div>

          {/* ═══ SECTION B — Collections ═══ */}
          <section className="w-full pt-12 md:pt-20 pb-12 md:pb-20">
            <div className="px-6 md:px-10 lg:px-16 mb-8 md:mb-10">
              <h2 className="text-[22px] md:text-[28px] font-semibold text-default-font tracking-[-0.02em]">
                Collections
              </h2>
              <p className="text-[14px] md:text-[15px] text-neutral-500 mt-1.5">
                Curated by what matters to your child
              </p>
            </div>

            <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 px-6 md:px-10 lg:px-16">
              {COLLECTION_RAILS.map((rail) => {
                const data = railData[rail.railId];
                return (
                  <CollectionTile
                    key={rail.railId}
                    railId={rail.railId}
                    title={rail.header}
                    description={rail.subheader}
                    items={data?.items ?? []}
                    onClick={() => {
                      // Scroll to the section or could trigger a filter in future
                      const el = document.getElementById(`rail-${rail.railId}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  />
                );
              })}
            </div>
          </section>

          {/* ── Divider ── */}
          <div className="w-full px-6 md:px-10 lg:px-16">
            <hr className="border-t border-neutral-200/60" />
          </div>

          {/* ═══ SECTION C — More to explore ═══ */}
          {allRailsLoaded && (
            <section className="w-full pt-12 md:pt-20 pb-16">
              <div className="px-6 md:px-10 lg:px-16 mb-6 md:mb-8">
                <h2 className="text-[18px] md:text-[20px] font-semibold text-default-font">
                  More to explore
                </h2>
                <p className="text-[12px] md:text-[13px] text-neutral-400 mt-1">
                  Keep scrolling — we&apos;ll load more as you go
                </p>
              </div>

              {browseLoading ? (
                <div className="flex w-full items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-[var(--tumbo-orange)]" />
                </div>
              ) : infiniteClasses.length > 0 ? (
                <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 px-6 md:px-10 lg:px-16">
                  {infiniteClasses.slice(0, infiniteCount).map((cls) => (
                    <EditorialCard
                      key={cls.id}
                      id={cls.id}
                      title={cls.name}
                      providerName={cls.provider_id ? providerMap[cls.provider_id]?.name : undefined}
                      image={getClassImage(cls)}
                      href={`/classes/${cls.id}`}
                      isBookmarked={bookmarkedClasses.has(cls.id)}
                      onBookmarkToggle={toggleBookmark}
                      category={cls.category ?? undefined}
                    />
                  ))}
                </div>
              ) : null}

              {infiniteClasses.length > infiniteCount && (
                <InfiniteScrollSentinel onLoadMore={handleLoadMore} />
              )}
            </section>
          )}
        </>
      )}
    </div>
  );

  return (
    <ModernPageLayout>
      <ClassFilterSidebarIntegrated
        open={filterSidebarOpen}
        onOpenChange={setFilterSidebarOpen}
        currentFilters={currentFilters}
        onFiltersChange={handleFiltersChange}
      >
        {mainContent}
      </ClassFilterSidebarIntegrated>
    </ModernPageLayout>
  );
}

export default ClassDirectoryAltPage;
