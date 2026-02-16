"use client";

// ── Shared data/state hook for /classes and /classes-alt ──
// Single source of truth for all discovery logic: fetching, filtering,
// deduplication, pagination, bookmarks, visibility enforcement.
// No query logic may be duplicated outside this file.

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { TAG_ROWS } from "@/components/ui/hero-section";
import { FilterState } from "@/components/ui/filter-chips";
import { BadgeItem } from "@/components/ui/class-card";
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
export function getClassImage(cls: DBClass): string {
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

// ── Deduplicate classes by provider_id (client-side) ──
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

// ── Infinite scroll batch size ──
export const INFINITE_BATCH = 20;

// ── Sentinel component — self-contained IntersectionObserver ──
export function InfiniteScrollSentinel({ onLoadMore }: { onLoadMore: () => void }) {
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

// ── Hook return type ──
export interface UseClassDirectoryReturn {
  // State values
  isMobile: boolean;
  totalClasses: number;
  activeChipId: string | null;
  searchQuery: string;
  filterSidebarOpen: boolean;
  currentFilters: FilterState;
  hasActiveFilters: boolean;
  showFilteredGrid: boolean;
  browseLoading: boolean;
  filteredClasses: DBClass[];
  infiniteCount: number;
  railData: Record<string, RailApiResponse>;
  bookmarkedClasses: Set<string>;
  providerMap: Record<string, Provider>;
  infiniteClasses: DBClass[];
  allRailsLoaded: boolean;
  activeTag: string | null;

  // Callbacks
  handleChipToggle: (chipId: string | null) => void;
  handleSearchChange: (query: string) => void;
  handleFilterClick: () => void;
  handleFiltersChange: (f: FilterState) => void;
  handleTagClick: (tagValue: string) => void;
  toggleBookmark: (classId: string) => void;
  toBrowseBadges: (cls: DBClass) => BadgeItem[];
  isRailLoading: (railId: string) => boolean;
  loadRail: (railId: string) => Promise<void>;
  handleLoadMore: () => void;

  // Raw setters (used inline in JSX)
  setCurrentFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setActiveTag: React.Dispatch<React.SetStateAction<string | null>>;
  setFilterSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs exposed for render logic
  loadingRef: React.MutableRefObject<Set<string>>;
}

// ── Main hook ──
export function useClassDirectory(): UseClassDirectoryReturn {
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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          cls.name.toLowerCase().includes(q) ||
          (cls.description || "").toLowerCase().includes(q) ||
          (cls.category || "").toLowerCase().includes(q) ||
          (cls.vibe_line || "").toLowerCase().includes(q);
        if (!match) return false;
      }
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

  // ── Infinite scroll ──
  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

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

  // ── Filter handlers ──
  const handleFiltersChange = useCallback((f: FilterState) => setCurrentFilters(f), []);
  const isRailLoading = useCallback((railId: string) => loadingRef.current.has(railId), []);

  const handleFilterClick = useCallback(() => {
    setFilterSidebarOpen((prev) => !prev);
  }, []);

  const handleTagClick = useCallback((tagValue: string) => {
    setActiveTag(tagValue || null);
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

  return {
    isMobile,
    totalClasses,
    activeChipId,
    searchQuery,
    filterSidebarOpen,
    currentFilters,
    hasActiveFilters,
    showFilteredGrid,
    browseLoading,
    filteredClasses,
    infiniteCount,
    railData,
    bookmarkedClasses,
    providerMap,
    infiniteClasses,
    allRailsLoaded,
    activeTag,

    handleChipToggle,
    handleSearchChange,
    handleFilterClick,
    handleFiltersChange,
    handleTagClick,
    toggleBookmark,
    toBrowseBadges,
    isRailLoading,
    loadRail,
    handleLoadMore,

    setCurrentFilters,
    setSearchQuery,
    setActiveTag,
    setFilterSidebarOpen,

    loadingRef,
  };
}
