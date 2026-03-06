"use client";

// ── /classes — production discovery page ──
// Architecture: NO client-side full-dataset fetch.
// - Rails: /api/rails/* (already paginated)
// - Tag row: /api/tags/top (fast, cached)
// - Browse grid: /api/classes/browse (paginated, server-side filtering)
// - Search/filter: same browse API with query params

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { HeroSection } from "@/components/ui/hero-section";
import type { TagRowItem } from "@/components/ui/hero-section";
import { RailSection, RailSkeleton } from "@/components/ui/rail-section";
import { RailLoader } from "@/components/ui/rail-loader";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import { FilterState } from "@/components/ui/filter-chips";
import FilterChips from "@/components/ui/filter-chips";
import { CustomClassCard, BadgeItem } from "@/components/ui/class-card";
import { RAIL_ORDER, RAIL_MAP } from "@/lib/rails/config";
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

// ── Browse API response shape ──
interface BrowseCardItem {
  id: string;
  title: string;
  providerName?: string;
  description: string;
  image: string;
  badges: { label: string; category: string }[];
  href: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
  vibeLine?: string;
}

interface BrowseResponse {
  items: BrowseCardItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
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

// ── Infinite scroll sentinel ──
function InfiniteScrollSentinel({ onLoadMore }: { onLoadMore: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMoreRef.current(); },
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

// ── Browse page size ──
const BROWSE_PAGE = 24;

// ── Main page component ──
function ClassDirectoryPage() {
  const isMobile = useIsMobile();

  // ── Core state ──
  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [totalClasses, setTotalClasses] = useState(0);

  // ── Refs for stable callback identities ──
  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());

  // ── Search / filter / sidebar state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    locations: [], ageRanges: [], days: [], timeSlots: [],
    priceRanges: [], contentTypes: [], experienceStyles: [],
    educationalPhilosophies: [], personalityTraits: [], searchTerms: [],
  });

  // ── Browse grid state (server-side paginated) ──
  const [browseItems, setBrowseItems] = useState<BrowseCardItem[]>([]);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browseHasMore, setBrowseHasMore] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(false);
  const browseAbortRef = useRef<AbortController | null>(null);

  // ── Top tags (fast path from API) ──
  const [topTags, setTopTags] = useState<TagRowItem[]>([]);

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

  // ── Fetch top tags on mount (fast path) ──
  useEffect(() => {
    if (seed === 0) return;
    fetch(`/api/tags/top?seed=${seed}`)
      .then((r) => r.json())
      .then((data) => { if (data.tags?.length > 0) setTopTags(data.tags); })
      .catch(() => {});
  }, [seed]);

  // ── Fetch a rail ──
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

  // ── Debounce search query (300ms) — input updates instantly, API call debounced ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Browse API fetcher ──
  const fetchBrowse = useCallback(async (offset: number, append: boolean) => {
    // Abort any in-flight browse request
    browseAbortRef.current?.abort();
    const controller = new AbortController();
    browseAbortRef.current = controller;

    setBrowseLoading(true);
    try {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(BROWSE_PAGE),
      });
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      if (activeTag) params.set("tag", activeTag);

      // Map sidebar filters to API params
      if (currentFilters.ageRanges.length > 0) {
        const range = currentFilters.ageRanges[0];
        const match = range.match(/(\d+)/);
        if (match) params.set("age", range.replace(/[^\d-]/g, "").replace(/years?/i, ""));
      }
      if (currentFilters.priceRanges.length > 0) {
        const range = currentFilters.priceRanges[0];
        if (range === "Under $30") params.set("price", "under30");
        else if (range === "$30-$50") params.set("price", "30-50");
        else if (range === "$50-$80") params.set("price", "50-80");
        else if (range === "Over $80") params.set("price", "over80");
      }

      // Exclude IDs already shown in rails (only for non-filtered browse)
      if (!searchQuery.trim() && !activeTag && shownIdsRef.current.length > 0) {
        params.set("exclude", shownIdsRef.current.join(","));
      }

      const res = await fetch(`/api/classes/browse?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Browse API error");
      const data: BrowseResponse = await res.json();

      if (append) {
        setBrowseItems((prev) => [...prev, ...data.items]);
      } else {
        setBrowseItems(data.items);
      }
      setBrowseTotal(data.total);
      setBrowseHasMore(data.hasMore);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("[browse]", e);
      }
    } finally {
      setBrowseLoading(false);
    }
  }, [debouncedQuery, activeTag, currentFilters.ageRanges, currentFilters.priceRanges]);

  // ── Determine if we're in search/filter mode ──
  const isSearchActive = debouncedQuery.trim().length > 0 || activeTag !== null;
  const hasActiveFilters = Object.values(currentFilters).some(
    (v) => Array.isArray(v) && v.length > 0
  );
  const showFilteredGrid = isSearchActive || hasActiveFilters;

  // ── Fetch browse results when search/filter/tag changes ──
  useEffect(() => {
    if (showFilteredGrid) {
      fetchBrowse(0, false);
    }
  }, [showFilteredGrid, debouncedQuery, activeTag, currentFilters, fetchBrowse]);

  // ── Fetch "More to explore" grid when all rails are loaded ──
  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);
  const browseTriggeredRef = useRef(false);

  useEffect(() => {
    if (allRailsLoaded && !showFilteredGrid && !browseTriggeredRef.current) {
      browseTriggeredRef.current = true;
      fetchBrowse(0, false);
    }
  }, [allRailsLoaded, showFilteredGrid, fetchBrowse]);

  // ── Load more browse results ──
  const handleLoadMore = useCallback(() => {
    if (browseLoading || !browseHasMore) return;
    fetchBrowse(browseItems.length, true);
  }, [browseLoading, browseHasMore, browseItems.length, fetchBrowse]);

  // ── Filter handlers ──
  const handleFiltersChange = useCallback((f: FilterState) => setCurrentFilters(f), []);
  const isRailLoading = useCallback((railId: string) => loadingRef.current.has(railId), []);

  const handleFilterClick = useCallback(() => {
    setFilterSidebarOpen((prev) => !prev);
  }, []);

  const handleTagClick = useCallback((tagValue: string) => {
    setActiveTag(tagValue || null);
    setBrowseItems([]);
    setBrowseTotal(0);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ── Escape key handler ──
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && filterSidebarOpen) setFilterSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [filterSidebarOpen]);

  // ── Render a browse card item ──
  const renderBrowseCard = useCallback(
    (item: BrowseCardItem, priority = false) => (
      <CustomClassCard
        key={item.id}
        id={item.id}
        title={item.title}
        providerName={item.providerName}
        description={item.description}
        image={item.image}
        badges={item.badges.map((b) => ({ label: b.label, category: b.category as TagCategory }))}
        href={item.href}
        isBookmarked={bookmarkedClasses.has(item.id)}
        onBookmarkToggle={toggleBookmark}
        category={item.category}
        ageMin={item.ageMin}
        ageMax={item.ageMax}
        vibeLine={item.vibeLine}
        priority={priority}
      />
    ),
    [bookmarkedClasses, toggleBookmark]
  );

  // ──────────────────── RENDER ────────────────────

  const mainContent = (
    <div className="flex w-full flex-col items-start gap-2">
      <HeroSection
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
              {browseLoading && browseItems.length === 0 ? "Loading..." : `${browseTotal} classes found`}
            </p>
          </div>
          {browseLoading && browseItems.length === 0 ? (
            <div className="flex w-full flex-col gap-8">
              {[1, 2].map((i) => <RailSkeleton key={i} />)}
            </div>
          ) : browseItems.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center gap-4 py-16 px-4">
              <span className="text-heading-2 font-heading-2 text-default-font">No classes found</span>
              <span className="text-body font-body text-subtext-color text-center max-w-md">
                Try broadening your search or removing some filters.
              </span>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6 lg:px-10">
              {browseItems.map((item) => renderBrowseCard(item))}
            </div>
          )}
          {browseHasMore && <InfiniteScrollSentinel onLoadMore={handleLoadMore} />}
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

          {/* ── "More to explore" — paginated from browse API ── */}
          {allRailsLoaded && (
            <div className="flex w-full flex-col items-start gap-4 pb-12">
              <div className="px-4 md:px-6 lg:px-10">
                <h2 className="text-[16px] md:text-heading-2 font-semibold text-default-font">More to explore</h2>
                <p className="text-[12px] md:text-[13px] text-gray-400 mt-1">Keep scrolling — we&apos;ll load more as you go</p>
              </div>
              {browseLoading && browseItems.length === 0 ? (
                <div className="flex w-full items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--tumbo-orange)]" />
                </div>
              ) : browseItems.length > 0 ? (
                <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6 lg:px-10">
                  {browseItems.map((item) => renderBrowseCard(item))}
                </div>
              ) : null}
              {browseHasMore && <InfiniteScrollSentinel onLoadMore={handleLoadMore} />}
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
