"use client";

// ── /classes-alt-v3 — Premium Flagship Discovery Surface ──
// Design philosophy: "Calm Authority"
// Serif/sans pairing, gradient overlay cards, immersive hero.
// Same data pipeline as /classes-alt. Zero backend changes.

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { V3Hero } from "@/components/ui/v3-hero";
import { V3TaxonomyStrip } from "@/components/ui/v3-taxonomy-strip";
import { V3Card } from "@/components/ui/v3-card";
import { V3CollectionCard } from "@/components/ui/v3-collection-card";
import { FadeInUp } from "@/components/ui/fade-in-up";
import type { TagRowItem } from "@/components/ui/hero-section";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import { FilterState } from "@/components/ui/filter-chips";
import FilterChips from "@/components/ui/filter-chips";
import { DBClass, Provider, getTopTags } from "@/lib/types/tags";
import { RAIL_ORDER, RAILS } from "@/lib/rails/config";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { RailApiResponse } from "@/lib/rails/types";

// ── V3 CSS custom properties (injected inline) ──
const V3_STYLES = {
  "--v3-bg": "#FFFFFF",
  "--v3-bg-warm": "#FAF8F5",
  "--v3-text": "#1A1A1A",
  "--v3-text-muted": "#6B7280",
  "--v3-accent": "#C45A3C",
  "--v3-sage": "#7B8F6B",
  "--v3-border": "#E8E5E0",
} as React.CSSProperties;

// ── Collection rails (intent-based, rails 3–6) ──
const COLLECTION_RAILS = RAILS.filter((r) => r.intentSignals.length > 0);

// ── Session seed ──
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

// ── Fetch a single rail ──
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

// ── Fallback images ──
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
    if (!existing || qualityScore(cls) > qualityScore(existing)) best.set(key, cls);
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

// ── Infinite scroll sentinel ──
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
    <div ref={ref} className="flex w-full items-center justify-center py-12">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[--v3-border] border-t-[--v3-accent]" />
    </div>
  );
}

// ── Skeleton ──
function V3GridSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 lg:px-16">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="rounded-lg bg-[--v3-bg-warm] overflow-hidden" style={{ aspectRatio: "3/4" }} />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Main page ──
// ══════════════════════════════════════════════════════════════

function ClassDirectoryV3Page() {
  const isMobile = useIsMobile();

  // ── Core state (same pipeline as /classes-alt) ──
  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [totalClasses, setTotalClasses] = useState(0);

  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());

  // ── Search / filter / tag ──
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

  // ── Init ──
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
      if (next.has(classId)) next.delete(classId); else next.add(classId);
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
      shownIdsRef.current = [...shownIdsRef.current, ...data.items.map((i) => i.id)];
    } else {
      setRailData((prev) => ({ ...prev }));
    }
  }, []);

  // ── Fetch total ──
  useEffect(() => {
    fetch("/api/rails/meta")
      .then((r) => r.json())
      .then((meta) => { if (meta.totalClasses) setTotalClasses(meta.totalClasses); })
      .catch(() => {});
  }, []);

  // ── Load all classes ──
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
      allClassesLoadedRef.current = false;
      console.error("Failed to load classes:", e);
    }
    setBrowseLoading(false);
  }, [browseLoading]);

  // ── Derived state ──
  const isSearchActive = searchQuery.trim().length > 0 || activeTag !== null;
  const hasActiveFilters = Object.values(currentFilters).some((v) => Array.isArray(v) && v.length > 0);
  const showFilteredGrid = isSearchActive || hasActiveFilters;

  const topTags: TagRowItem[] = useMemo(() => {
    if (allClasses.length === 0) return [];
    return getTopTags(allClasses, selectDisplayTags);
  }, [allClasses]);

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

  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  // ── Triggers ──
  useEffect(() => {
    if (showFilteredGrid && !allClassesLoadedRef.current) loadAllClasses();
  }, [showFilteredGrid, loadAllClasses]);

  useEffect(() => {
    if (allRailsLoaded && !allClassesLoadedRef.current && !showFilteredGrid) loadAllClasses();
  }, [allRailsLoaded, showFilteredGrid, loadAllClasses]);

  const handleLoadMore = useCallback(() => setInfiniteCount((p) => p + INFINITE_BATCH), []);

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

  // ── Staggered rail loading ──
  useEffect(() => {
    if (seed === 0) return;
    loadingRef.current.clear();
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    loadRail(RAIL_ORDER[0]);
    RAIL_ORDER.slice(1).forEach((railId, i) => {
      timers.push(setTimeout(() => { if (!cancelled) loadRail(railId); }, 1000 + i * 400));
    });
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [seed, loadRail]);

  // ═══════════════════════════════ RENDER ═══════════════════════════════

  const showcaseData = railData[RAIL_ORDER[0]];
  const showcaseItems = showcaseData?.items ?? [];
  const showcaseCount = isMobile ? 4 : 6;

  const mainContent = (
    <div className="flex w-full flex-col items-start" style={V3_STYLES}>
      {/* ═══ HERO ═══ */}
      <V3Hero
        classCount={totalClasses}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* ═══ TAXONOMY STRIP ═══ */}
      <V3TaxonomyStrip
        tags={topTags}
        activeTag={activeTag}
        onTagClick={handleTagClick}
        onFilterClick={handleFilterClick}
        filterSidebarOpen={filterSidebarOpen}
      />

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="px-6 md:px-10 lg:px-16 w-full pt-4">
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

      {/* ── FILTERED GRID ── */}
      {showFilteredGrid ? (
        <div className="flex w-full flex-col items-start gap-4 pt-8 pb-16">
          <div className="px-6 md:px-10 lg:px-16">
            <p
              className="text-[13px] text-[--v3-text-muted]"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              {browseLoading ? "Loading..." : `${filteredClasses.length} classes found`}
            </p>
          </div>
          {browseLoading ? (
            <V3GridSkeleton />
          ) : filteredClasses.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center gap-4 py-24 px-6">
              <span
                className="text-[24px] text-[--v3-text]"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
              >
                No classes found
              </span>
              <span
                className="text-[14px] text-[--v3-text-muted] text-center max-w-md"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
              >
                Try broadening your search or removing some filters.
              </span>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 lg:px-16">
              {filteredClasses.slice(0, infiniteCount).map((cls) => (
                <V3Card
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
          )}
          {filteredClasses.length > infiniteCount && (
            <InfiniteScrollSentinel onLoadMore={handleLoadMore} />
          )}
        </div>
      ) : (
        /* ── EDITORIAL DISCOVERY MODE ── */
        <>
          {/* ═══ SECTION A — Featured Showcase ═══ */}
          <FadeInUp as="section" className="w-full pt-16 md:pt-24 pb-16 md:pb-24">
            <div className="px-6 md:px-10 lg:px-16 mb-8 md:mb-10 max-w-[1440px] mx-auto">
              <h2
                className="text-[--v3-text]"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                This week&apos;s picks
              </h2>
              <p
                className="text-[--v3-text-muted] mt-2"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: "14px" }}
              >
                A fresh selection worth exploring
              </p>
            </div>

            {showcaseItems.length > 0 ? (
              <div className="px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
                {/* Row 1: Asymmetric — hero card + 2 stacked */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Hero card spans 2 rows on desktop */}
                  {showcaseItems[0] && (
                    <div className="col-span-2 md:col-span-1 md:row-span-2">
                      <V3Card
                        id={showcaseItems[0].id}
                        title={showcaseItems[0].title}
                        providerName={showcaseItems[0].providerName}
                        image={showcaseItems[0].image}
                        href={showcaseItems[0].href}
                        isBookmarked={bookmarkedClasses.has(showcaseItems[0].id)}
                        onBookmarkToggle={toggleBookmark}
                        category={showcaseItems[0].category}
                        priority
                        variant="hero"
                      />
                    </div>
                  )}
                  {/* Stacked cards */}
                  {showcaseItems.slice(1, showcaseCount).map((item, i) => (
                    <V3Card
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
              </div>
            ) : (
              <V3GridSkeleton />
            )}
          </FadeInUp>

          {/* ── Divider ── */}
          <div className="w-full px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
            <hr className="border-t border-[--v3-border]" />
          </div>

          {/* ═══ SECTION B — Curated Collections ═══ */}
          <FadeInUp as="section" className="w-full pt-16 md:pt-24 pb-16 md:pb-24 bg-[--v3-bg-warm]">
            <div className="px-6 md:px-10 lg:px-16 mb-8 md:mb-10 max-w-[1440px] mx-auto">
              <h2
                className="text-[--v3-text]"
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                Explore by intent
              </h2>
              <p
                className="text-[--v3-text-muted] mt-2"
                style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: "14px" }}
              >
                Curated around what matters to your child
              </p>
            </div>

            <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
              {COLLECTION_RAILS.map((rail) => {
                const data = railData[rail.railId];
                return (
                  <V3CollectionCard
                    key={rail.railId}
                    railId={rail.railId}
                    title={rail.header}
                    description={rail.subheader}
                    items={data?.items ?? []}
                    onClick={() => {
                      const el = document.getElementById(`rail-${rail.railId}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  />
                );
              })}
            </div>
          </FadeInUp>

          {/* ═══ SECTION C — Full Directory ═══ */}
          {allRailsLoaded && (
            <FadeInUp as="section" className="w-full pt-16 md:pt-24 pb-20">
              <div className="px-6 md:px-10 lg:px-16 mb-8 md:mb-10 max-w-[1440px] mx-auto">
                <h2
                  className="text-[--v3-text]"
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "clamp(20px, 2.5vw, 28px)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Every class, one scroll
                </h2>
                <p
                  className="text-[--v3-text-muted] mt-1.5"
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: "13px" }}
                >
                  Keep scrolling — we&apos;ll load more as you go
                </p>
              </div>

              {browseLoading ? (
                <div className="flex w-full items-center justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[--v3-border] border-t-[--v3-accent]" />
                </div>
              ) : infiniteClasses.length > 0 ? (
                <div className="grid w-full grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
                  {infiniteClasses.slice(0, infiniteCount).map((cls) => (
                    <V3Card
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
            </FadeInUp>
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

export default ClassDirectoryV3Page;
