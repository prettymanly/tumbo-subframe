"use client";

// ── ExploreBrowse — extracted from /classes-alt-v3 ──
// Contains ALL the right-column content: search, filters, pill strip,
// accordion masonry sections (browse mode), filtered masonry (filter mode),
// infinite scroll "More to explore" section.
// Owns all data-fetching and state management.

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MPCard } from "@/components/ui/mp-card";
import { FadeInUp } from "@/components/ui/fade-in-up";
import {
  MPFilterSidebar,
  MPFilterState,
  MP_DEFAULT_FILTERS,
} from "@/components/ui/mp-filter-sidebar";
import { MobileTinderBrowse } from "@/components/explore/mobile-tinder-browse";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { DBClass, Provider, getTopTags } from "@/lib/types/tags";
import { RAIL_ORDER, RAILS } from "@/lib/rails/config";
import { buildRail, buildSerendipityRail } from "@/lib/rails/build-rail";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { RailApiResponse, RailCardItem, ScoringContext } from "@/lib/rails/types";
import type { TagRowItem } from "@/components/ui/hero-section";
import { useExplore } from "./explore-context";
import type { BrowseStats } from "./explore-sidebar-browse";
import { SearchAutocomplete } from "./search-autocomplete";
import { buildSearchIndex, fullSearch, type SearchIndex } from "@/lib/search/search-engine";
import { DimensionSearchBar } from "./dimension-search-bar";

// ── SG estate extraction ──
// Estate names matched against location strings (order matters — longer/more specific first)
const SG_ESTATES = [
  "Bukit Timah","Bukit Batok","Bukit Merah","Bukit Panjang",
  "Jurong West","Jurong East","Jurong",
  "Ang Mo Kio","Toa Payoh","Bishan","Hougang","Sengkang","Punggol",
  "Tampines","Pasir Ris","Bedok","Simei","Changi",
  "Clementi","Queenstown","Commonwealth","Dover","Holland",
  "Woodlands","Yishun","Sembawang","Admiralty",
  "Choa Chu Kang","Tengah",
  "Paya Lebar","Geylang","Kallang","Lavender","Bugis",
  "Orchard","Dhoby Ghaut","Somerset","Newton","Novena",
  "Harbourfront","Telok Blangah","Sentosa",
  "Marina Bay","Tanjong Pagar","Shenton","Raffles Place",
  "City Hall","Bras Basah","Prinsep",
  "Serangoon","Kovan","Potong Pasir",
  "MacPherson","Mountbatten","Katong","Marine Parade",
  "Thomson","Marymount","Bright Hill",
  "Yio Chu Kang","Lentor",
  "West Coast","Pasir Panjang","Kent Ridge",
  "Tiong Bahru","Redhill","Alexandra",
  "Camden","Tanglin","River Valley",
  "Neil Rd","Chinatown","Outram",
  "Little India","Farrer Park","Jalan Besar",
  "Upper Thomson","Balestier","Whampoa",
  "Aljunied","Eunos","Kembangan",
  "Hillview","Dairy Farm",
  "Tuas","Pioneer","Boon Lay",
  "Telok Kurau","Siglap","Frankel",
  "Upper Bukit Timah","Beauty World",
  "Bartley","Tai Seng","Ubi",
];

// Singapore postal district → neighbourhood (first 2 digits of 6-digit postal code)
const POSTAL_DISTRICT_MAP: Record<string, string> = {
  "01": "Raffles Place", "02": "Raffles Place", "03": "Queenstown", "04": "Telok Blangah",
  "05": "Pasir Panjang", "06": "City Hall", "07": "Bugis", "08": "Little India",
  "09": "Orchard", "10": "Orchard", "11": "Novena", "12": "Balestier",
  "13": "MacPherson", "14": "Geylang", "15": "Katong", "16": "Bedok",
  "17": "Changi", "18": "Tampines", "19": "Hougang", "20": "Bishan",
  "21": "Clementi", "22": "Jurong", "23": "Bukit Panjang", "24": "Tengah",
  "25": "Woodlands", "26": "Upper Thomson", "27": "Yishun", "28": "Serangoon",
  "29": "Ang Mo Kio", "30": "Ang Mo Kio", "31": "Bukit Batok", "32": "Bukit Batok",
  "33": "Bukit Timah", "34": "Bukit Timah", "35": "Bukit Timah", "36": "Bukit Timah",
  "37": "Bukit Timah", "38": "Geylang", "39": "Kallang", "40": "Kallang",
  "41": "Kallang", "42": "Geylang", "43": "Katong", "44": "Katong",
  "45": "Katong", "46": "Bedok", "47": "Tampines", "48": "Pasir Ris",
  "49": "Pasir Ris", "50": "Bukit Merah", "51": "Bukit Merah",
  "53": "Toa Payoh", "54": "Toa Payoh", "55": "Bishan", "56": "Bishan",
  "57": "Ang Mo Kio", "58": "MacPherson", "59": "Kovan", "60": "Hougang",
  "65": "Sengkang", "67": "Sengkang", "68": "Punggol",
  "69": "Woodlands", "70": "Woodlands", "71": "Woodlands",
  "72": "Jurong West", "73": "Jurong West",
  "75": "Yishun", "76": "Yishun",
  "77": "Sembawang", "78": "Sembawang",
  "79": "Sengkang", "80": "Ang Mo Kio",
  "82": "Punggol",
};

function extractEstate(loc?: string | null): string | undefined {
  if (!loc) return undefined;

  // 1. Try matching estate names directly
  const lower = loc.toLowerCase();
  for (const estate of SG_ESTATES) {
    if (lower.includes(estate.toLowerCase())) return estate;
  }

  // 2. Try postal code extraction (6-digit Singapore postal code)
  const postalMatch = loc.match(/(?:Singapore\s*)?(\d{6})/i) || loc.match(/\b(\d{6})\b/);
  if (postalMatch) {
    const district = postalMatch[1].slice(0, 2);
    const mapped = POSTAL_DISTRICT_MAP[district];
    if (mapped) return mapped;
  }

  // 3. Fallback: first part before comma if short enough
  const parts = loc.split(",")[0].trim();
  if (parts === "Singapore" || parts.length < 3) return undefined;
  return parts.length > 25 ? undefined : parts;
}

// ── Session seed (per-tab, resets on new session for fresh content each visit) ──
function getSessionSeed(): number {
  if (typeof window === "undefined") return 0;
  const stored = sessionStorage.getItem("tumbo_seed");
  if (stored) return parseInt(stored);
  const seed = Math.floor(Math.random() * 2147483647);
  sessionStorage.setItem("tumbo_seed", seed.toString());
  return seed;
}

/** Deterministic Fisher-Yates shuffle for client-side content rotation */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Rails are now built client-side from allClasses (no API route needed)

function getClassImage(cls: DBClass): string {
  const url = cls.photo_url;
  if (!url) return "";  // No photo → ClassPlaceholder will render
  if (url.includes("places.googleapis.com")) return "";  // Google Places → use placeholder
  return url;
}

// ── Memoized tag lookup — avoids recomputing selectDisplayTags for the same class ──
// selectDisplayTags is pure (deterministic for the same DBClass), so we cache results
// in a WeakMap keyed by the class object reference. The cache is automatically GC'd
// when classes are released. This avoids O(N * tagCost) per render in filteredClasses
// and dimensionCounts which both iterate allClasses.
const _tagCache = new WeakMap<DBClass, ReturnType<typeof selectDisplayTags>>();
function cachedDisplayTags(cls: DBClass): ReturnType<typeof selectDisplayTags> {
  let cached = _tagCache.get(cls);
  if (!cached) {
    cached = selectDisplayTags(cls);
    _tagCache.set(cls, cached);
  }
  return cached;
}

// Exclusion logic imported from @/lib/rails/build-rail (single source of truth)

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

function formatAgeRange(ageMin?: number | null, ageMax?: number | null): string | undefined {
  if (ageMin == null && ageMax == null) return undefined;
  if (ageMin != null && ageMax != null) {
    if (ageMin === ageMax) return `${ageMin} yrs`;
    return `${ageMin}\u2013${ageMax} yrs`;
  }
  if (ageMin != null) return `${ageMin}+ yrs`;
  if (ageMax != null) return `Up to ${ageMax} yrs`;
  return undefined;
}

const INFINITE_BATCH = 24;

const CLASS_BASE = "/class";
const PILL_COLORS = ["var(--tumbo-tag-content)", "var(--tumbo-tag-experience)", "var(--tumbo-tag-philosophy)", "var(--tumbo-tag-child)"];
function getPillColor(index: number): string { return PILL_COLORS[index % PILL_COLORS.length]; }

const DIMENSION_NAMES = ["All", "Content", "Philosophy", "Experience", "Child"];

// ══════════════════════════════════════════════════════════════
// ── Props ──
// ══════════════════════════════════════════════════════════════

export interface ExploreBrowseProps {
  /** Callback fired when stats data changes so the shell can forward to sidebar */
  onStatsChange?: (stats: BrowseStats) => void;
  /** Dimension requested by the sidebar — browse syncs to this */
  requestedDimension?: string;
}

// ══════════════════════════════════════════════════════════════
// ── Main component ──
// ══════════════════════════════════════════════════════════════

export function ExploreBrowse({ onStatsChange, requestedDimension }: ExploreBrowseProps) {
  const { selectClass } = useExplore();
  const isMobile = useIsMobile(768);

  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, { items: RailCardItem[]; shownIds: string[] }>>({});
  const [totalClasses, setTotalClasses] = useState(0);

  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeDimension, setActiveDimension] = useState<string>("All");
  const [filters, setFilters] = useState<MPFilterState>(MP_DEFAULT_FILTERS);
  const [searchBarCollapsed, setSearchBarCollapsed] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection: collapse dimension bar when hero version scrolls out ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setSearchBarCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" } // account for topbar height
    );
    const el = heroSearchRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  // ── Sync dimension when sidebar requests a change ──
  useEffect(() => {
    if (requestedDimension && requestedDimension !== activeDimension) {
      setActiveDimension(requestedDimension);
    }
  }, [requestedDimension]); // eslint-disable-line react-hooks/exhaustive-deps

  const [allClasses, setAllClasses] = useState<DBClass[]>([]);
  const [providerMap, setProviderMap] = useState<Record<string, Provider>>({});
  const [browseLoading, setBrowseLoading] = useState(false);
  const allClassesLoadedRef = useRef(false);

  const [page, setPage] = useState(1);
  const [visibleRails, setVisibleRails] = useState(RAIL_ORDER.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ── Accordion state: tracks collapsed sections (all open by default) ──
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = useCallback((id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  useEffect(() => { const t = setTimeout(() => setSearchQuery(inputValue), 150); return () => clearTimeout(t); }, [inputValue]);
  useEffect(() => { setSeed(getSessionSeed()); }, []);

  const seedRef = useRef(seed);
  seedRef.current = seed;

  // totalClasses set from allClasses when loaded
  useEffect(() => { if (allClasses.length > 0) setTotalClasses(allClasses.length); }, [allClasses]);

  const loadAllClasses = useCallback(async () => {
    if (allClassesLoadedRef.current || browseLoading) return;
    allClassesLoadedRef.current = true;
    setBrowseLoading(true);
    try {
      const { supabaseBrowser } = await import("@/lib/supabase/client");
      const { fetchAllVisibleClasses } = await import("@/lib/supabase/queries");
      const supabase = supabaseBrowser();
      const BROWSE_SELECT = [
        "id", "name", "provider_id", "summary", "vibe_line", "description",
        "typical_child_profile", "not_ideal_for", "outcome_expectations",
        "category", "age_min", "age_max", "photo_url", "google_rating",
        "review_count", "updated_at", "created_at", "schedule", "location",
        "is_placeholder", "hidden_from_directory", "price", "best_parent_quote",
      ].join(",");
      const [allVisible, providerRes] = await Promise.all([
        fetchAllVisibleClasses(supabase, BROWSE_SELECT),
        supabase.from("providers").select("id, name"),
      ]);
      // No shouldExclude filter here — allClasses powers search + autocomplete
      // which should find ALL visible listings. Rail exclusions are handled
      // server-side by the /api/rails/ endpoints.
      setAllClasses(allVisible as unknown as DBClass[]);
      const pMap: Record<string, Provider> = {};
      for (const p of providerRes.data || []) pMap[p.id] = p;
      setProviderMap(pMap);
    } catch (e) { allClassesLoadedRef.current = false; console.error(e); }
    setBrowseLoading(false);
  }, [browseLoading]);

  // ── Fast-path: fetch top tags from lightweight API on mount ──
  const [apiTopTags, setApiTopTags] = useState<TagRowItem[]>([]);
  useEffect(() => {
    fetch("/api/tags/top")
      .then((r) => r.json())
      .then((data) => { if (data?.tags?.length) setApiTopTags(data.tags); })
      .catch(() => {});
  }, []);

  // ── Computed top tags (from allClasses — available later, richer) ──
  const computedTopTags: TagRowItem[] = useMemo(() => {
    if (allClasses.length === 0) return [];
    return getTopTags(allClasses, cachedDisplayTags);
  }, [allClasses]);

  // ── Effective top tags: API data immediately, computed data once ready ──
  const topTags = computedTopTags.length > 0 ? computedTopTags : apiTopTags;

  // ── ALL tags by dimension (for dimension-filtered views) ──
  const allTagsByDimension = useMemo(() => {
    if (allClasses.length === 0) return {} as Record<string, TagRowItem[]>;
    const dimMap: Record<string, Map<string, number>> = {};
    for (const cls of allClasses) {
      const tags = cachedDisplayTags(cls);
      for (const tag of tags) {
        const dim = tag.dimension;
        if (!dimMap[dim]) dimMap[dim] = new Map();
        dimMap[dim].set(tag.label, (dimMap[dim].get(tag.label) || 0) + 1);
      }
    }
    const result: Record<string, TagRowItem[]> = {};
    for (const [dim, counts] of Object.entries(dimMap)) {
      result[dim] = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label]) => ({ label, dimension: dim as TagRowItem["dimension"] }));
    }

    // ── Location dimension: derived from listing location field ──
    const locCounts = new Map<string, number>();
    for (const cls of allClasses) {
      const estate = extractEstate(cls.location);
      if (estate) {
        locCounts.set(estate, (locCounts.get(estate) || 0) + 1);
      }
    }
    result["location"] = [...locCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => ({ label, dimension: "location" as TagRowItem["dimension"] }));

    return result;
  }, [allClasses]);

  // ── Tags filtered by active dimension ──
  const visibleTags = useMemo(() => {
    if (activeDimension === "All") return topTags;
    const dim = activeDimension.toLowerCase();
    return allTagsByDimension[dim] || [];
  }, [topTags, activeDimension, allTagsByDimension]);

  // ── Tumbo search engine (replaces Fuse.js — zero-dependency, built once) ──
  const tumboSearchIndex = useMemo<SearchIndex | null>(() => {
    if (allClasses.length === 0) return null;
    return buildSearchIndex(allClasses, providerMap);
  }, [allClasses, providerMap]);

  const isFilterMode = useMemo(() =>
    searchQuery.trim() !== "" || activeTags.size > 0 || activeDimension !== "All" || filters.tags.length > 0 || filters.location !== "All Areas" || filters.priceMax < 200 || filters.ageMin > 0 || filters.ageMax < 18,
  [searchQuery, activeTags, activeDimension, filters]);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim();
    let candidates: DBClass[];
    if (q && tumboSearchIndex) {
      const results = fullSearch(tumboSearchIndex, q);
      candidates = results.map((r) => r.cls);
    } else {
      candidates = allClasses;
    }
    // Split active tags into location vs regular tags
    const activeLocationTags = new Set<string>();
    const activeRegularTags = new Set<string>();
    const locationLabels = new Set((allTagsByDimension["location"] || []).map((t) => t.label));
    for (const at of activeTags) {
      if (locationLabels.has(at)) activeLocationTags.add(at);
      else activeRegularTags.add(at);
    }

    return candidates.filter((c) => {
      const tags = (activeRegularTags.size > 0 || activeDimension !== "All") ? cachedDisplayTags(c) : null;
      // Location filter: listing must match ANY active location (OR logic)
      if (activeLocationTags.size > 0) {
        const estate = extractEstate(c.location);
        if (!estate || !activeLocationTags.has(estate)) return false;
      }
      if (activeRegularTags.size > 0) {
        if (!Array.from(activeRegularTags).every((at) => tags!.some((t) => t.label === at))) return false;
      }
      if (activeDimension !== "All") {
        if (!tags!.some((t) => t.dimension === activeDimension.toLowerCase())) return false;
      }
      if (filters.tags.length > 0 && !(c.category && filters.tags.some((t) => t.toLowerCase() === c.category!.toLowerCase()))) return false;
      if (filters.ageMin > 0 && (c.age_min == null || c.age_min > filters.ageMax)) return false;
      if (filters.ageMax < 18 && (c.age_max == null || c.age_max < filters.ageMin)) return false;
      if (filters.priceMax < 200 && c.price != null && c.price > filters.priceMax) return false;
      return true;
    });
  }, [allClasses, searchQuery, activeTags, activeDimension, filters, tumboSearchIndex, allTagsByDimension]);

  // ── Dimension counts (reactive to search + pill + sidebar filters, but NOT dimension) ──
  const dimensionCounts = useMemo(() => {
    const q = searchQuery.trim();
    let candidates: DBClass[];
    if (q && tumboSearchIndex) {
      const results = fullSearch(tumboSearchIndex, q);
      candidates = results.map((r) => r.cls);
    } else {
      candidates = allClasses;
    }
    // Apply pill + sidebar filters (everything EXCEPT dimension)
    const base = candidates.filter((c) => {
      if (activeTags.size > 0) {
        const tags = cachedDisplayTags(c);
        if (!Array.from(activeTags).every((at) => tags.some((t) => t.label === at))) return false;
      }
      if (filters.tags.length > 0 && !(c.category && filters.tags.some((t) => t.toLowerCase() === c.category!.toLowerCase()))) return false;
      if (filters.ageMin > 0 && (c.age_min == null || c.age_min > filters.ageMax)) return false;
      if (filters.ageMax < 18 && (c.age_max == null || c.age_max < filters.ageMin)) return false;
      if (filters.priceMax < 200 && c.price != null && c.price > filters.priceMax) return false;
      return true;
    });
    // Count per dimension
    const counts: Record<string, number> = { all: base.length };
    for (const cls of base) {
      const tags = cachedDisplayTags(cls);
      const dims = new Set(tags.map((t) => t.dimension));
      for (const d of dims) {
        counts[d] = (counts[d] || 0) + 1;
      }
      // Location dimension: count if listing has an extractable estate
      if (extractEstate(cls.location)) {
        counts["location"] = (counts["location"] || 0) + 1;
      }
    }
    return counts;
  }, [allClasses, searchQuery, activeTags, filters, tumboSearchIndex]);

  // ── Build rails client-side from allClasses ──
  useEffect(() => {
    if (seed === 0 || allClasses.length === 0) return;
    // Don't rebuild if we already have all rails
    if (RAIL_ORDER.every((rid) => railData[rid])) return;

    const excludeIds = new Set<string>();
    const ctx: ScoringContext = {
      excludeIds,
      activeChipId: null,
      seed,
    };

    const newRailData: Record<string, { items: RailCardItem[]; shownIds: string[] }> = {};
    for (const railId of RAIL_ORDER) {
      const railConfig = RAILS.find((r) => r.railId === railId);
      if (!railConfig) continue;

      const isSerendipity = railConfig.railId === "serendipity";
      const result = isSerendipity
        ? buildSerendipityRail(allClasses, railConfig, ctx, providerMap)
        : buildRail(allClasses, railConfig, ctx, providerMap);

      newRailData[railId] = { items: result.items, shownIds: result.shownIds };
      // Add shown IDs to exclude set so next rail doesn't repeat
      for (const id of result.shownIds) excludeIds.add(id);
    }
    setRailData(newRailData);
    // Update shownIds ref
    const allShown = Object.values(newRailData).flatMap((r) => r.shownIds);
    shownIdsRef.current = allShown;
  }, [seed, allClasses, providerMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  useEffect(() => { if (isFilterMode) return; const t = setTimeout(() => { if (visibleRails < RAIL_ORDER.length) setVisibleRails((v) => v + 1); }, 600); return () => clearTimeout(t); }, [visibleRails, isFilterMode]);
  // Defer loading allClasses until after initial paint + rails are visible.
  // Uses requestIdleCallback (with 3s fallback) so the browser prioritises
  // rendering the rail cards first. Search, filters & dimension tags will
  // still be ready before most users scroll past the rails. The default
  // "All" tag strip uses /api/tags/top in the meantime so pills appear
  // instantly without waiting for allClasses.
  useEffect(() => {
    const schedule = typeof requestIdleCallback === "function"
      ? (cb: () => void) => { const id = requestIdleCallback(cb, { timeout: 3000 }); return () => cancelIdleCallback(id); }
      : (cb: () => void) => { const id = setTimeout(cb, 1500); return () => clearTimeout(id); };
    const cancel = schedule(() => loadAllClasses());
    return cancel;
  }, [loadAllClasses]);

  const moreItems = useMemo(() => { const s = new Set(shownIdsRef.current); return deduplicateByProvider(allClasses.filter((c) => !s.has(c.id))); }, [allClasses]);
  const paginatedMore = useMemo(() => moreItems.slice(0, page * INFINITE_BATCH), [moreItems, page]);

  useEffect(() => {
    const el = loadMoreRef.current; if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore && paginatedMore.length < moreItems.length) {
        setLoadingMore(true); setTimeout(() => { setPage((p) => p + 1); setLoadingMore(false); }, 400);
      }
    }, { rootMargin: "200px" });
    observer.observe(el); return () => observer.disconnect();
  }, [loadingMore, paginatedMore.length, moreItems.length]);

  const totalActiveFilters = filters.tags.length + (filters.location !== "All Areas" ? 1 : 0) + (filters.priceMax < 200 ? 1 : 0) + (filters.ageMin > 0 || filters.ageMax < 18 ? 1 : 0);

  const rails = useMemo(() =>
    RAIL_ORDER.map((rid) => { const c = RAILS.find((r) => r.railId === rid); const d = railData[rid]; return { railId: rid, header: c?.header ?? rid, subheader: c?.subheader ?? "", items: d?.items ?? [] }; }),
  [railData]);

  const providerCount = useMemo(() => Object.keys(providerMap).length, [providerMap]);

  const clearAll = useCallback(() => {
    setInputValue(""); setSearchQuery(""); setActiveTags(new Set()); setActiveDimension("All"); setFilters(MP_DEFAULT_FILTERS);
  }, []);

  // ── Autocomplete handlers ──
  const handleAcSelectCategory = useCallback((category: string) => {
    setFilters((f) => ({ ...f, tags: [category] }));
    setInputValue("");
    setSearchQuery("");
  }, []);

  const handleAcSelectClass = useCallback((classId: string) => {
    // Navigate to class detail page
    const cls = allClasses.find((c) => c.id === classId);
    if (cls) {
      const provider = cls.provider_id ? providerMap[cls.provider_id]?.name : undefined;
      const tags = cachedDisplayTags(cls);
      selectClass(classId, {
        id: classId,
        title: cls.name,
        provider,
        summary: cls.vibe_line || cls.summary || undefined,
        image: getClassImage(cls),
        tags: tags.map((t) => ({ label: t.label, dimension: t.dimension as "content" | "philosophy" | "experience" | "child" })),
        location: cls.location ?? undefined,
        price: cls.price ?? undefined,
      });
    }
  }, [allClasses, providerMap, selectClass]);

  const handleAcSelectTag = useCallback((tagLabel: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.add(tagLabel);
      return next;
    });
    setInputValue("");
    setSearchQuery("");
  }, []);

  const handleAcSearch = useCallback((query: string) => {
    setInputValue(query);
    setSearchQuery(query);
  }, []);

  // ── Tag label → dimension color lookup ──
  const tagDimColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const DIM_COLORS: Record<string, string> = {
      content: "var(--tumbo-tag-content)",
      philosophy: "var(--tumbo-tag-philosophy)",
      experience: "var(--tumbo-tag-experience)",
      child: "var(--tumbo-tag-child)",
      location: "var(--tumbo-tag-location)",
    };
    for (const [dim, tags] of Object.entries(allTagsByDimension)) {
      const color = DIM_COLORS[dim] || "var(--tumbo-orange)";
      for (const tag of tags) {
        map[tag.label] = color;
      }
    }
    return map;
  }, [allTagsByDimension]);

  // ── Active chips for display ──
  const activeChips = useMemo(() => {
    const chips: string[] = [];
    activeTags.forEach((t) => chips.push(t));
    filters.tags.forEach((t) => { if (!activeTags.has(t)) chips.push(t); });
    if (filters.location !== "All Areas") chips.push(filters.location);
    if (filters.ageMin > 0 || filters.ageMax < 18) chips.push(`Ages ${filters.ageMin}\u2013${filters.ageMax}`);
    if (filters.priceMax < 200) chips.push(`\u2264 S$${filters.priceMax}`);
    return chips;
  }, [activeTags, filters]);

  const hasActiveChips = activeChips.length > 0 || searchQuery.trim() !== "";

  // ── Notify parent (shell) of stats changes ──
  const onDimensionChange = useCallback((dim: string) => {
    setActiveDimension(dim);
  }, []);

  useEffect(() => {
    if (onStatsChange) {
      onStatsChange({
        totalClasses,
        providerCount,
        activeDimension,
        topTags,
        allTagsByDimension,
        railData,
        dimensionCounts,
      });
    }
  }, [totalClasses, providerCount, activeDimension, topTags, allTagsByDimension, railData, dimensionCounts, onStatsChange]);

  // ── Card click handler — uses explore context ──
  const handleCardClick = useCallback(
    (
      e: React.MouseEvent,
      id: string,
      data: {
        title: string;
        provider?: string;
        summary?: string;
        image?: string;
        tags: { label: string; dimension: string }[];
        location?: string;
        price?: number | string;
      }
    ) => {
      e.preventDefault();
      selectClass(id, {
        id,
        title: data.title,
        provider: data.provider,
        summary: data.summary,
        image: data.image,
        tags: data.tags.map((t) => ({
          label: t.label,
          dimension: t.dimension as "content" | "philosophy" | "experience" | "child",
        })),
        location: data.location,
        price: data.price,
      });
    },
    [selectClass]
  );

  // ── Pill strip component ──
  const PillStrip = ({ size }: { size: "sm" | "lg" }) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeDimension}
        className="hide-scrollbar"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ display: "flex", gap: "6px", overflowX: "auto", flex: 1, paddingBottom: "2px" }}
      >
        {visibleTags.map((tag, idx) => {
          const isActive = activeTags.has(tag.label);
          const pillColor = getPillColor(idx);
          return (
            <button key={tag.label} className="btn-press" onClick={() => setActiveTags((prev) => { const next = new Set(prev); if (next.has(tag.label)) next.delete(tag.label); else next.add(tag.label); return next; })} style={{
              flexShrink: 0, padding: size === "sm" ? "8px 14px" : "6px 14px", borderRadius: "100px",
              border: isActive ? "none" : "1.5px solid var(--color-border-strong)",
              background: isActive ? pillColor : "transparent",
              color: isActive ? "white" : "var(--color-text-primary)",
              fontSize: "13px", fontWeight: isActive ? 700 : 500,
              cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap",
              minHeight: size === "sm" ? 44 : undefined,
            }}>
              {tag.label}
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );

  // ── Browse content renderer (accordion sections) ──
  const renderBrowseContent = () => (
    <>
      {rails.slice(0, visibleRails).map((rail) => {
        if (rail.items.length === 0) return null;
        const isOpen = !collapsedSections.has(rail.railId);
        return (
          <AccordionSection
            key={rail.railId}
            id={rail.railId}
            title={rail.header}
            subtitle={rail.subheader}
            itemCount={rail.items.length}
            isOpen={isOpen}
            onToggle={() => toggleSection(rail.railId)}
          >
            {rail.items.map((item, cardIdx) => (
              <FadeInUp key={item.id} delay={Math.min(cardIdx, 12) * 0.04} offset={20} duration={0.5}>
                <div
                  className="v3-masonry-item"
                  onClick={(e) =>
                    handleCardClick(e, item.id, {
                      title: item.title,
                      provider: item.providerName,
                      summary: item.vibeLine || item.summary,
                      image: item.image,
                      tags: item.tags,
                      location: item.location,
                      price: undefined,
                    })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <MPCard
                    id={item.id}
                    title={item.title}
                    provider={item.providerName}
                    summary={item.vibeLine || item.summary}
                    image={item.image}
                    tags={item.tags}
                    location={item.location}
                    price={undefined}
                    href={`${CLASS_BASE}/${item.id}`}
                    variant="v2"
                    masonry
                    category={item.category}
                    ageRange={formatAgeRange(item.ageMin, item.ageMax)}
                    parentQuote={item.parentQuote}
                  />
                </div>
              </FadeInUp>
            ))}
          </AccordionSection>
        );
      })}

      {visibleRails < rails.length && <div style={{ textAlign: "center", padding: "20px 0 60px" }}><LoadingDots /></div>}

      {/* ── Endless scroll: every class on Tumbo ── */}
      {allRailsLoaded && !browseLoading && paginatedMore.length > 0 && (
        <>
          <div style={{ marginTop: 40, marginBottom: 24, paddingTop: 20, borderTop: "1px solid var(--color-border-subtle)" }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>
              Every class on T&uuml;mbo
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 400 }}>
              Keep scrolling. There&apos;s always more to discover
            </p>
          </div>
          <div className="v3-masonry">
            {paginatedMore.map((cls) => {
              const provider = cls.provider_id ? providerMap[cls.provider_id]?.name : undefined;
              const tags = cachedDisplayTags(cls);
              const location = extractEstate(cls.location);
              return (
                <div
                  key={cls.id}
                  className="v3-masonry-item"
                  onClick={(e) =>
                    handleCardClick(e, cls.id, {
                      title: cls.name,
                      provider,
                      summary: cls.vibe_line || cls.summary || "",
                      image: getClassImage(cls),
                      tags,
                      location,
                      price: cls.price ?? undefined,
                    })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <MPCard
                    id={cls.id}
                    title={cls.name}
                    provider={provider}
                    summary={cls.vibe_line || cls.summary || ""}
                    image={getClassImage(cls)}
                    tags={tags}
                    location={location}
                    href={`${CLASS_BASE}/${cls.id}`}
                    variant="v2"
                    masonry
                    category={cls.category ?? undefined}
                    ageRange={formatAgeRange(cls.age_min, cls.age_max)}
                    parentQuote={cls.best_parent_quote}
                  />
                </div>
              );
            })}
          </div>
          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loadingMore && <LoadingDots />}
          </div>
          {/* End of list */}
          {!loadingMore && paginatedMore.length >= moreItems.length && moreItems.length > 0 && (
            <div style={{ textAlign: "center", padding: "40px 0 60px" }}>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>
                You&apos;ve seen every class on T&uuml;mbo. {moreItems.length + shownIdsRef.current.length} and counting.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  background: "transparent", border: "1.5px solid var(--color-border-subtle)",
                  borderRadius: 100, padding: "10px 24px", fontSize: 13, fontWeight: 600,
                  color: "var(--tumbo-text)", cursor: "pointer", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--tumbo-text)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--tumbo-text)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--tumbo-text)"; e.currentTarget.style.borderColor = "var(--color-border-subtle)"; }}
              >
                Back to top
              </button>
            </div>
          )}
        </>
      )}

      {allRailsLoaded && browseLoading && <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}><LoadingDots /></div>}
    </>
  );

  // ── Filtered content renderer ──
  const renderFilteredContent = () => (
    <div>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>
          {filteredClasses.length} <span style={{ fontWeight: 400, color: "var(--color-text-secondary)" }}>classes found</span>
        </h2>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Sorted by relevance</span>
      </div>
      {browseLoading ? <GridSkeleton /> : filteredClasses.length === 0 ? <EmptyState onClear={clearAll} /> : (
        <div className="v3-masonry">
          {filteredClasses.slice(0, page * INFINITE_BATCH).map((cls, cardIdx) => {
            const provider = cls.provider_id ? providerMap[cls.provider_id]?.name : undefined;
            const tags = cachedDisplayTags(cls);
            const location = cls.location ?? undefined;
            return (
              <FadeInUp key={cls.id} delay={Math.min(cardIdx, 12) * 0.04} offset={20} duration={0.5}>
                <div
                  className="v3-masonry-item"
                  onClick={(e) =>
                    handleCardClick(e, cls.id, {
                      title: cls.name,
                      provider,
                      summary: cls.vibe_line || cls.summary || "",
                      image: getClassImage(cls),
                      tags,
                      location,
                      price: cls.price ?? undefined,
                    })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <MPCard
                    id={cls.id}
                    title={cls.name}
                    provider={provider}
                    summary={cls.vibe_line || cls.summary || ""}
                    image={getClassImage(cls)}
                    tags={tags}
                    location={location}
                    price={cls.price ?? undefined}
                    href={`${CLASS_BASE}/${cls.id}`}
                    variant="v2"
                    masonry
                    category={cls.category ?? undefined}
                    ageRange={formatAgeRange(cls.age_min, cls.age_max)}
                    parentQuote={cls.best_parent_quote}
                  />
                </div>
              </FadeInUp>
            );
          })}
        </div>
      )}
      {filteredClasses.length > page * INFINITE_BATCH && (
        <div ref={loadMoreRef} style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}><LoadingDots /></div>
      )}
    </div>
  );

  // ═══════════════════════════════ RENDER ═══════════════════════════════

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        /* Card grid — uniform height, responsive columns */
        .v3-masonry { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--gap-card-grid, 16px); }
        .v3-masonry-item { position: relative; }

        /* Sticky section headers (all viewports) */
        .v3-section-header { position: sticky; top: 56px; z-index: 15; background: var(--color-bg-page); }

        /* Accordion body animation */
        .v3-accordion-body {
          display: grid;
          transition: grid-template-rows 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .v3-accordion-body[data-open="true"]  { grid-template-rows: 1fr; }
        .v3-accordion-body[data-open="false"] { grid-template-rows: 0fr; }
        .v3-accordion-inner { overflow: hidden; }
      `}</style>

      <MPFilterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} filters={filters} onChange={setFilters} />

      {/* Floating "Filter classes" FAB — bounces in when hero bar scrolls out */}
      <FloatingFilterFAB
        visible={searchBarCollapsed && !filterModalOpen}
        onClick={() => setFilterModalOpen(true)}
        activeCount={activeTags.size}
      />

      {/* Floating filter modal — white panel at bottom with all dimension pills */}
      <FloatingFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        allTagsByDimension={allTagsByDimension}
        activeTags={activeTags}
        onToggleTag={(label) => setActiveTags((prev) => { const next = new Set(prev); if (next.has(label)) next.delete(label); else next.add(label); return next; })}
      />

      {/* Nav search icon — portaled into top bar */}
      <NavSearchPortal
        allClasses={allClasses}
        providerMap={providerMap}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSelectCategory={handleAcSelectCategory}
        onSelectClass={handleAcSelectClass}
        onSelectTag={handleAcSelectTag}
        onSearch={handleAcSearch}
      />

      {/* Hero dimension search bar — visible until scrolled past */}
      <div ref={heroSearchRef} style={{ marginBottom: 16 }}>
        <DimensionSearchBar
          allTagsByDimension={allTagsByDimension}
          activeTags={activeTags}
          onToggleTag={(label) => setActiveTags((prev) => { const next = new Set(prev); if (next.has(label)) next.delete(label); else next.add(label); return next; })}
          onSearch={() => {}}
          collapsed={false}
          totalClasses={totalClasses}
        />
      </div>

      {/* Active chips — only visible in filter mode */}
      {isFilterMode && hasActiveChips && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <AnimatePresence mode="popLayout">
              {searchQuery.trim() && (
                <motion.div key="search-chip" layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
                  <FilterChip label={`"${searchQuery}"`} onRemove={() => setInputValue("")} />
                </motion.div>
              )}
              {activeChips.map((chip, chipIdx) => (
                <motion.div key={chip} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85, transition: { delay: chipIdx * 0.03, duration: 0.15 } }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
                  <FilterChip label={chip} color={tagDimColorMap[chip]} onRemove={() => {
                    if (activeTags.has(chip)) setActiveTags((prev) => { const next = new Set(prev); next.delete(chip); return next; });
                    else if (filters.tags.includes(chip)) setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== chip) }));
                    else if (chip === filters.location) setFilters((f) => ({ ...f, location: "All Areas" }));
                  }} />
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={clearAll} className="btn-press" style={{ padding: "4px 12px", borderRadius: "100px", border: "none", background: "transparent", color: "var(--color-text-secondary)", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear all</button>
          </div>
        </div>
      )}

      {/* Content: filtered masonry, mobile Tinder, or accordion browse sections */}
      {isFilterMode
        ? renderFilteredContent()
        : isMobile
          ? <MobileTinderBrowse
              rails={rails}
              moreItems={moreItems}
              providerMap={providerMap}
              onCardClick={(id: string) => {
                selectClass(id, { id, title: "", tags: [], provider: "" });
              }}
              sessionSeed={seed}
            />
          : renderBrowseContent()
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Accordion Section with Masonry Grid ──
// ══════════════════════════════════════════════════════════════

function AccordionSection({
  id,
  title,
  subtitle,
  itemCount,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  itemCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: isOpen ? "8px" : "0", position: "relative" }}>
      {/* Sticky section header */}
      <div
        className="v3-section-header"
        style={{
          background: "var(--color-bg-page)",
          paddingTop: "16px",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", cursor: "pointer", background: "transparent", border: "none",
            padding: "0",
            textAlign: "left",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              margin: 0, fontSize: "22px", fontWeight: 600,
              letterSpacing: "-0.02em", color: "var(--color-text-primary)", lineHeight: 1.2,
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{
                margin: "4px 0 0", fontSize: "13px", color: "var(--color-text-secondary)",
                lineHeight: 1.4, maxWidth: "500px",
              }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "16px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)",
              background: "var(--color-bg-subtle)", borderRadius: "100px", padding: "4px 10px",
            }}>
              {itemCount}
            </span>

            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              border: "1.5px solid var(--color-shadow-md)", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "border-color 0.15s", flexShrink: 0,
            }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round"
                style={{
                  transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Collapsible masonry content */}
      <div className="v3-accordion-body" data-open={isOpen ? "true" : "false"}>
        <div className="v3-accordion-inner">
          <div className="v3-masonry" style={{ paddingTop: "16px", paddingBottom: "24px" }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Floating Filter FAB — bounces in from bottom when hero bar scrolls away ──
// ══════════════════════════════════════════════════════════════

function FloatingFilterFAB({
  visible,
  onClick,
  activeCount,
}: {
  visible: boolean;
  onClick: () => void;
  activeCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Double rAF for the bounce-in
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 50,
        pointerEvents: "none",
        transform: show ? "translateY(0)" : "translateY(80px)",
        opacity: show ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease",
      }}
    >
      <button
        onClick={onClick}
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 24px",
          borderRadius: 100,
          border: "none",
          background: "var(--tumbo-orange)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.04)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1={4} y1={6} x2={20} y2={6} />
          <line x1={8} y1={12} x2={16} y2={12} />
          <line x1={11} y1={18} x2={13} y2={18} />
        </svg>
        Filter classes
        {activeCount > 0 && (
          <span
            style={{
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              background: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Floating Filter Modal — white panel with dimension pills ──
// ══════════════════════════════════════════════════════════════

function FloatingFilterModal({
  open,
  onClose,
  allTagsByDimension,
  activeTags,
  onToggleTag,
}: {
  open: boolean;
  onClose: () => void;
  allTagsByDimension: Record<string, { label: string; dimension: string }[]>;
  activeTags: Set<string>;
  onToggleTag: (label: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body + html scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => {
        // Close when clicking the backdrop (not the panel itself)
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: show ? "rgba(0,0,0,0.25)" : "transparent",
        transition: "background 0.3s ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          marginBottom: 32,
          width: "min(820px, calc(100% - 32px))",
          position: "relative",
          transform: show ? "translateY(0)" : "translateY(40px)",
          opacity: show ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.3s ease",
        }}
      >
        {/* Reuse the same 4-segment DimensionSearchBar as the hero */}
        <DimensionSearchBar
          allTagsByDimension={allTagsByDimension}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
          onSearch={onClose}
          collapsed={false}
          totalClasses={0}
          dropdownAbove
        />
      </div>
    </div>,
    document.body
  );
}

// ══════════════════════════════════════════════════════════════
// ── Nav Search Icon — portals into #v2-search-portal in the top bar ──
// ══════════════════════════════════════════════════════════════

function NavSearchPortal({
  allClasses,
  providerMap,
  inputValue,
  onInputChange,
  onSelectCategory,
  onSelectClass,
  onSelectTag,
  onSearch,
}: {
  allClasses: DBClass[];
  providerMap: Record<string, Provider>;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectClass: (classId: string) => void;
  onSelectTag: (tagLabel: string) => void;
  onSearch: (query: string) => void;
}) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Find the portal target in the DOM (right-side, beside hamburger)
  useEffect(() => {
    const el = document.getElementById("v2-search-icon-portal");
    if (el) setPortalTarget(el);
  }, []);

  // Click-outside to collapse
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      const inside = searchContainerRef.current?.contains(e.target as Node);
      if (searchContainerRef.current && !inside) {
        setExpanded(false);
        onInputChange("");
      }
    };
    // Use setTimeout to avoid catching the same click that opened the search
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 100);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [expanded, onInputChange]);

  // Escape to collapse
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpanded(false);
        onInputChange("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [expanded, onInputChange]);

  // Wrap handlers to collapse search after selection
  const handleSelectCategory = useCallback((category: string) => {
    onSelectCategory(category);
    setExpanded(false);
  }, [onSelectCategory]);

  const handleSelectClass = useCallback((classId: string) => {
    onSelectClass(classId);
    setExpanded(false);
  }, [onSelectClass]);

  const handleSelectTag = useCallback((tagLabel: string) => {
    onSelectTag(tagLabel);
    setExpanded(false);
  }, [onSelectTag]);

  const handleSearch = useCallback((query: string) => {
    onSearch(query);
    setExpanded(false);
  }, [onSearch]);

  if (!portalTarget) return null;

  return createPortal(
    <div ref={searchContainerRef} style={{ position: "relative" }}>
      {!expanded ? (
        /* Search icon button — stays right beside hamburger */
        <button
          onClick={() => setExpanded(true)}
          aria-label="Search"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--tumbo-text)",
            opacity: 0.6,
            transition: "opacity 0.15s, background 0.15s",
            padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
        </button>
      ) : (
        /* Expanded: search bar expands leftward from icon position */
        <div style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "min(480px, calc(100vw - 120px))",
          zIndex: 50,
        }}>
          <SearchAutocomplete
            allClasses={allClasses}
            providerMap={providerMap}
            onSelectCategory={handleSelectCategory}
            onSelectClass={handleSelectClass}
            onSelectTag={handleSelectTag}
            onSearch={handleSearch}
            value={inputValue}
            onChange={onInputChange}
          />
        </div>
      )}
    </div>,
    portalTarget
  );
}

// ══════════════════════════════════════════════════════════════
// ── Helper Components ──
// ══════════════════════════════════════════════════════════════

function FilterChip({ label, onRemove, color }: { label: string; onRemove: () => void; color?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 10px 5px 12px", borderRadius: "100px", background: color || "var(--tumbo-orange)", color: "white", fontSize: "12px", fontWeight: 600 }}>
      {label}
      <button onClick={onRemove} style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", padding: 0 }} aria-label={`Remove ${label} filter`}>&times;</button>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 40px" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>No classes found</h3>
      <p style={{ margin: "0 0 24px", fontSize: "15px", color: "var(--color-text-secondary)" }}>Try adjusting your filters or search for something different.</p>
      <button onClick={onClear} style={{ padding: "12px 28px", borderRadius: "100px", background: "var(--tumbo-orange)", color: "white", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", }}>Clear all filters</button>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center", width: "100%", padding: "16px 0" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-text-secondary)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="v3-masonry">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="v3-masonry-item">
          <div style={{ background: "var(--color-bg-card)", borderRadius: "20px", border: "1px solid var(--color-border-subtle)", overflow: "hidden" }}>
            <div style={{ aspectRatio: "16/10", background: "var(--color-bg-subtle)" }} />
            <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ width: 60, height: 10, background: "var(--color-bg-subtle)", borderRadius: 4 }} />
              <div style={{ width: "80%", height: 14, background: "var(--color-bg-subtle)", borderRadius: 4 }} />
              <div style={{ width: "50%", height: 10, background: "var(--color-bg-subtle)", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
