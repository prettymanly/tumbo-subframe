"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { HeroSection, TAG_ROWS } from "@/components/ui/hero-section";
import { RailSection, RailSkeleton } from "@/components/ui/rail-section";
import { RailLoader } from "@/components/ui/rail-loader";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import { FilterState } from "@/components/ui/filter-chips";
import FilterChips from "@/components/ui/filter-chips";
import { CustomClassCard, BadgeItem } from "@/components/ui/class-card";
import { DBClass, Provider } from "@/lib/types/tags";
import { RAIL_ORDER, RAIL_MAP } from "@/lib/rails/config";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { RailApiResponse } from "@/lib/rails/types";
import type { TagCategory } from "@/components/ui/tag-pill";

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
  chipId?: string | null
): Promise<RailApiResponse | null> {
  try {
    const params = new URLSearchParams({ seed: seed.toString(), limit: "12" });
    if (excludeIds.length > 0) params.set("exclude", excludeIds.join(","));
    if (chipId) params.set("chip", chipId);
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

// ── Infinite scroll batch size ──
const INFINITE_BATCH = 20;

// ── Sentinel component — self-contained IntersectionObserver ──
function InfiniteScrollSentinel({ onLoadMore }: { onLoadMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex w-full items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--tumbo-orange)]" />
    </div>
  );
}

// ── Main page component ──
function ClassDirectoryPage() {
  const isMobile = useIsMobile();

  // ── Core state ──
  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [totalClasses, setTotalClasses] = useState(0);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  // ── Refs for stable callback identities ──
  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());
  const activeChipRef = useRef(activeChipId);
  activeChipRef.current = activeChipId;

  // ── Search / filter / sidebar state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    locations: [], ageRanges: [], days: [], timeSlots: [],
    priceRanges: [], contentTypes: [], experienceStyles: [],
    educationalPhilosophies: [], personalityTraits: [], searchTerms: [],
  });

  // ── Browse all dataset (lazy-loaded on first search/filter/scroll-to-bottom) ──
  const [allClasses, setAllClasses] = useState<DBClass[]>([]);
  const [providerMap, setProviderMap] = useState<Record<string, Provider>>({});
  const [browseLoading, setBrowseLoading] = useState(false);
  const allClassesLoadedRef = useRef(false);

  // ── Infinite scroll state ──
  const [infiniteCount, setInfiniteCount] = useState(INFINITE_BATCH);

  // ── Initialize seed on mount ──
  useEffect(() => { setSeed(getSessionSeed()); }, []);

  // ── Load bookmarks ──
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

  // ── Fetch a rail ──
  const seedRef = useRef(seed);
  seedRef.current = seed;

  const loadRail = useCallback(async (railId: string) => {
    if (railDataRef.current[railId] || loadingRef.current.has(railId)) return;
    loadingRef.current.add(railId);
    setRailData((prev) => ({ ...prev }));

    const data = await fetchRail(railId, seedRef.current, shownIdsRef.current, activeChipRef.current);
    loadingRef.current.delete(railId);

    if (data) {
      setRailData((prev) => ({ ...prev, [railId]: data }));
      const newIds = data.items.map((item) => item.id);
      shownIdsRef.current = [...shownIdsRef.current, ...newIds];
    } else {
      setRailData((prev) => ({ ...prev }));
    }
  }, []);

  // ── Load first rail on mount ──
  const firstLoadRef = useRef(false);
  useEffect(() => {
    if (seed === 0 || firstLoadRef.current) return;
    firstLoadRef.current = true;
    loadRail(RAIL_ORDER[0]);
  }, [seed, loadRail]);

  // ── Fetch total class count on mount ──
  useEffect(() => {
    fetch("/api/rails/meta")
      .then((r) => r.json())
      .then((meta) => { if (meta.totalClasses) setTotalClasses(meta.totalClasses); })
      .catch(() => {});
  }, []);

  // ── Chip toggle: re-fetch loaded rails ──
  const handleChipToggle = useCallback(async (chipId: string | null) => {
    setActiveChipId(chipId);
    activeChipRef.current = chipId;

    const loadedRailIds = Object.keys(railDataRef.current);
    if (loadedRailIds.length === 0) return;
    shownIdsRef.current = [];

    const refetched: Record<string, RailApiResponse> = {};
    const results = await Promise.all(
      loadedRailIds.map((rid) => fetchRail(rid, seedRef.current, [], chipId))
    );

    for (let i = 0; i < loadedRailIds.length; i++) {
      const data = results[i];
      if (data) {
        refetched[loadedRailIds[i]] = data;
        shownIdsRef.current.push(...data.items.map((item) => item.id));
      }
    }
    setRailData(refetched);
  }, []);

  // ── Lazy-load all classes for search/filter/infinite scroll ──
  const loadAllClasses = useCallback(async () => {
    if (allClassesLoadedRef.current || browseLoading) return;
    allClassesLoadedRef.current = true;
    setBrowseLoading(true);
    const { supabaseBrowser } = await import("@/lib/supabase/client");
    const supabase = supabaseBrowser();
    const [classRes, providerRes] = await Promise.all([
      supabase.from("classes").select("*")
        .eq("is_placeholder", false)
        .order("google_rating", { ascending: false }),
      supabase.from("providers").select("*"),
    ]);
    setAllClasses(classRes.data || []);
    const pMap: Record<string, Provider> = {};
    for (const p of providerRes.data || []) pMap[p.id] = p;
    setProviderMap(pMap);
    setBrowseLoading(false);
  }, [browseLoading]);

  // ── Determine if we're in search/filter mode ──
  const isSearchActive = searchQuery.trim().length > 0 || activeTag !== null;
  const hasActiveFilters = Object.values(currentFilters).some(
    (v) => Array.isArray(v) && v.length > 0
  );
  const showFilteredGrid = isSearchActive || hasActiveFilters;

  // ── Load all classes when search/filter/tag activates ──
  useEffect(() => {
    if (showFilteredGrid && !allClassesLoadedRef.current) {
      loadAllClasses();
    }
  }, [showFilteredGrid, loadAllClasses]);

  // ── Filtered classes ──
  const filteredClasses = useMemo(() => {
    return allClasses.filter((cls) => {
      // Tag filter — match against keyword list
      if (activeTag) {
        const tagDef = TAG_ROWS.find((t) => t.label === activeTag);
        if (tagDef) {
          const cat = (cls.category ?? "").toLowerCase();
          const name = (cls.name ?? "").toLowerCase();
          const desc = (cls.description ?? "").toLowerCase();
          const matchesTag = tagDef.keywords.some(
            (kw) => cat.includes(kw.toLowerCase()) || name.includes(kw.toLowerCase()) || desc.includes(kw.toLowerCase())
          );
          if (!matchesTag) return false;
        }
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          cls.name.toLowerCase().includes(q) ||
          (cls.description || "").toLowerCase().includes(q) ||
          (cls.category || "").toLowerCase().includes(q) ||
          (cls.vibe_line || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      // Price filter
      if (currentFilters.priceRanges.length > 0 && cls.price) {
        const matchesPrice = currentFilters.priceRanges.some((range) => {
          if (range === "Under $30") return cls.price! < 30;
          if (range === "$30-$50") return cls.price! >= 30 && cls.price! <= 50;
          if (range === "$50-$80") return cls.price! > 50 && cls.price! <= 80;
          if (range === "Over $80") return cls.price! > 80;
          return true;
        });
        if (!matchesPrice) return false;
      }
      // Age filter
      if (currentFilters.ageRanges.length > 0) {
        const matchesAge = currentFilters.ageRanges.some((range) => {
          if (range === "0-2 years" && cls.age_min != null) return cls.age_min <= 2;
          if (range === "3-5 years") return (cls.age_min ?? 99) <= 5 && (cls.age_max ?? 0) >= 3;
          if (range === "6-8 years") return (cls.age_min ?? 99) <= 8 && (cls.age_max ?? 0) >= 6;
          if (range === "9-12 years") return (cls.age_min ?? 99) <= 12 && (cls.age_max ?? 0) >= 9;
          if (range === "13+ years" && cls.age_max != null) return cls.age_max >= 13;
          return true;
        });
        if (!matchesAge) return false;
      }
      return true;
    });
  }, [allClasses, searchQuery, activeTag, currentFilters.priceRanges, currentFilters.ageRanges]);

  const toBrowseBadges = useCallback((cls: DBClass): BadgeItem[] => {
    return selectDisplayTags(cls).map((t) => ({ label: t.label, category: t.dimension as TagCategory }));
  }, []);

  // ── Infinite scroll: load more when bottom sentinel enters viewport ──
  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  // When all rails are loaded and user hasn't searched, lazy-load the full dataset for infinite scroll
  useEffect(() => {
    if (allRailsLoaded && !allClassesLoadedRef.current && !showFilteredGrid) {
      loadAllClasses();
    }
  }, [allRailsLoaded, showFilteredGrid, loadAllClasses]);

  const handleLoadMore = useCallback(() => {
    setInfiniteCount((prev) => prev + INFINITE_BATCH);
  }, []);

  // ── Classes for the infinite grid (exclude already shown in rails) ──
  const infiniteClasses = useMemo(() => {
    if (allClasses.length === 0) return [];
    const shownSet = new Set(shownIdsRef.current);
    return allClasses.filter((cls) => !shownSet.has(cls.id));
  }, [allClasses]);

  // ── Filter handlers ──
  const handleFiltersChange = useCallback((f: FilterState) => setCurrentFilters(f), []);
  const isRailLoading = useCallback((railId: string) => loadingRef.current.has(railId), []);

  const handleFilterClick = useCallback(() => {
    setFilterSidebarOpen((prev) => !prev);
  }, []);

  const handleTagClick = useCallback((tagValue: string) => {
    setActiveTag(tagValue || null);
    // Reset infinite count when tag changes
    setInfiniteCount(INFINITE_BATCH);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setInfiniteCount(INFINITE_BATCH);
  }, []);

  // ── Escape key handler ──
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (filterSidebarOpen) setFilterSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [filterSidebarOpen]);

  // ──────────────────── RENDER ────────────────────

  const mainContent = (
    <div className="flex w-full flex-col items-start gap-2">
      <HeroSection
        classCount={totalClasses}
        activeChipId={activeChipId}
        onChipToggle={handleChipToggle}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterClick={handleFilterClick}
        filterSidebarOpen={filterSidebarOpen}
        onTagClick={handleTagClick}
        activeTag={activeTag}
      />

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="px-4 md:px-6 lg:px-10 w-full">
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

      {/* ── Filtered grid (search/tag/filter active) ── */}
      {showFilteredGrid ? (
        <div className="flex w-full flex-col items-start gap-4 pb-12">
          <div className="px-4 md:px-6 lg:px-10">
            <p className="text-[13px] text-gray-400">
              {browseLoading ? "Loading..." : `${filteredClasses.length} classes found`}
            </p>
          </div>
          {browseLoading ? (
            <div className="flex w-full flex-col gap-8">
              {[1, 2].map((i) => <RailSkeleton key={i} />)}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center gap-4 py-16 px-4">
              <span className="text-heading-2 font-heading-2 text-default-font">No classes found</span>
              <span className="text-body font-body text-subtext-color text-center max-w-md">
                Try broadening your search or removing some filters.
              </span>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6 lg:px-10">
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
                />
              ))}
            </div>
          )}
          {/* Infinite scroll sentinel */}
          {filteredClasses.length > infiniteCount && (
            <InfiniteScrollSentinel onLoadMore={handleLoadMore} />
          )}
        </div>
      ) : (
        /* ── Rails (discovery mode) ── */
        <>
          <div className="flex w-full flex-col items-start gap-6 md:gap-8 pb-4">
            {RAIL_ORDER.map((railId, index) => {
              const data = railData[railId];
              const loading = isRailLoading(railId) || loadingRef.current.has(railId);
              const railConfig = RAIL_MAP[railId];
              const density = railConfig?.density ?? "standard";
              const renderCount = isMobile
                ? (railConfig?.renderCount.mobile ?? 3)
                : (railConfig?.renderCount.desktop ?? 6);

              if (data && data.items.length > 0) {
                return (
                  <React.Fragment key={railId}>
                    <RailSection
                      railId={data.railId}
                      header={data.header}
                      subheader={data.subheader}
                      items={data.items}
                      bookmarkedClasses={bookmarkedClasses}
                      onBookmarkToggle={toggleBookmark}
                      initialRenderCount={renderCount}
                      isFirstRail={index === 0}
                      density={density}
                    />
                    {index + 1 < RAIL_ORDER.length && !railData[RAIL_ORDER[index + 1]] && (
                      <RailLoader
                        railId={RAIL_ORDER[index + 1]}
                        onVisible={() => loadRail(RAIL_ORDER[index + 1])}
                      />
                    )}
                  </React.Fragment>
                );
              }

              if (loading) return <RailSkeleton key={railId} />;

              if (index === 1 && !data) {
                return (
                  <RailLoader key={railId} railId={railId} onVisible={() => loadRail(railId)} rootMargin="400px 0px">
                    <RailSkeleton />
                  </RailLoader>
                );
              }

              if (index > 0 && railData[RAIL_ORDER[index - 1]]) {
                return (
                  <RailLoader key={railId} railId={railId} onVisible={() => loadRail(railId)}>
                    <RailSkeleton />
                  </RailLoader>
                );
              }

              return null;
            })}
          </div>

          {/* ── Infinite scroll grid after all rails ── */}
          {allRailsLoaded && (
            <div className="flex w-full flex-col items-start gap-4 pb-12">
              <div className="px-4 md:px-6 lg:px-10">
                <h2 className="text-[16px] md:text-heading-2 font-semibold text-default-font">More to explore</h2>
                <p className="text-[12px] md:text-[13px] text-gray-400 mt-1">Keep scrolling — we&apos;ll load more as you go</p>
              </div>
              {browseLoading ? (
                <div className="flex w-full items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--tumbo-orange)]" />
                </div>
              ) : infiniteClasses.length > 0 ? (
                <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6 lg:px-10">
                  {infiniteClasses.slice(0, infiniteCount).map((cls) => (
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
                    />
                  ))}
                </div>
              ) : null}
              {/* Infinite scroll sentinel */}
              {infiniteClasses.length > infiniteCount && (
                <InfiniteScrollSentinel onLoadMore={handleLoadMore} />
              )}
            </div>
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

export default ClassDirectoryPage;
