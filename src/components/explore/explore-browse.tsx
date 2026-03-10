"use client";

// ── ExploreBrowse — extracted from /classes-alt-v3 ──
// Contains ALL the right-column content: search, filters, pill strip,
// accordion masonry sections (browse mode), filtered masonry (filter mode),
// infinite scroll "More to explore" section.
// Owns all data-fetching and state management.

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type Fuse from "fuse.js";
import { MPCard } from "@/components/ui/mp-card";
import { FadeInUp } from "@/components/ui/fade-in-up";
import {
  MPFilterSidebar,
  MPFilterState,
  MP_DEFAULT_FILTERS,
} from "@/components/ui/mp-filter-sidebar";
import { DBClass, Provider, getTopTags } from "@/lib/types/tags";
import { RAIL_ORDER, RAILS } from "@/lib/rails/config";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import { shouldExcludeFromRails } from "@/lib/rails/build-rail";
import type { RailApiResponse } from "@/lib/rails/types";
import type { TagRowItem } from "@/components/ui/hero-section";
import { useExplore } from "./explore-context";
import type { BrowseStats } from "./explore-sidebar-browse";

// ── SG estate extraction ──
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
];

function extractEstate(loc?: string | null): string | undefined {
  if (!loc) return undefined;
  for (const estate of SG_ESTATES) {
    if (loc.toLowerCase().includes(estate.toLowerCase())) return estate;
  }
  const parts = loc.split(",")[0].trim();
  if (parts === "Singapore" || parts.length < 3) return undefined;
  return parts.length > 25 ? undefined : parts;
}

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

async function fetchRail(railId: string, seed: number, excludeIds: string[] = []): Promise<RailApiResponse | null> {
  try {
    const params = new URLSearchParams({ seed: seed.toString(), limit: "12" });
    if (excludeIds.length > 0) params.set("exclude", excludeIds.join(","));
    const res = await fetch(`/api/rails/${railId}?${params.toString()}`);
    if (!res.ok) return null;
    return (await res.json()) as RailApiResponse;
  } catch { return null; }
}

function getClassImage(cls: DBClass): string {
  const url = cls.photo_url;
  if (!url) return "";  // No photo → ClassPlaceholder will render
  if (url.includes("places.googleapis.com")) return "";  // Google Places → use placeholder
  return url;
}

// Exclusion logic imported from @/lib/rails/build-rail (single source of truth)
const shouldExclude = shouldExcludeFromRails;

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
const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
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

  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
  const [totalClasses, setTotalClasses] = useState(0);

  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());
  const FuseModule = useRef<typeof import('fuse.js') | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeDimension, setActiveDimension] = useState<string>("All");
  const [filters, setFilters] = useState<MPFilterState>(MP_DEFAULT_FILTERS);

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

  useEffect(() => { const t = setTimeout(() => setSearchQuery(inputValue), 300); return () => clearTimeout(t); }, [inputValue]);
  useEffect(() => { setSeed(getSessionSeed()); }, []);

  const seedRef = useRef(seed);
  seedRef.current = seed;

  const loadRail = useCallback(async (railId: string) => {
    if (railDataRef.current[railId] || loadingRef.current.has(railId)) return;
    loadingRef.current.add(railId);
    const data = await fetchRail(railId, seedRef.current, shownIdsRef.current);
    loadingRef.current.delete(railId);
    if (data) {
      setRailData((prev) => ({ ...prev, [railId]: data }));
      shownIdsRef.current = [...shownIdsRef.current, ...data.items.map((i) => i.id)];
    }
  }, []);

  useEffect(() => { fetch("/api/rails/meta").then((r) => r.json()).then((meta) => { if (meta.totalClasses) setTotalClasses(meta.totalClasses); }).catch(() => {}); }, []);

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
      setAllClasses(deduplicateByProvider((allVisible as unknown as DBClass[]).filter((c) => !shouldExclude(c))));
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
    return getTopTags(allClasses, selectDisplayTags);
  }, [allClasses]);

  // ── Effective top tags: API data immediately, computed data once ready ──
  const topTags = computedTopTags.length > 0 ? computedTopTags : apiTopTags;

  // ── ALL tags by dimension (for dimension-filtered views) ──
  const allTagsByDimension = useMemo(() => {
    if (allClasses.length === 0) return {} as Record<string, TagRowItem[]>;
    const dimMap: Record<string, Map<string, number>> = {};
    for (const cls of allClasses) {
      const tags = selectDisplayTags(cls);
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
    return result;
  }, [allClasses]);

  // ── Tags filtered by active dimension ──
  const visibleTags = useMemo(() => {
    if (activeDimension === "All") return topTags;
    const dim = activeDimension.toLowerCase();
    return allTagsByDimension[dim] || [];
  }, [topTags, activeDimension, allTagsByDimension]);

  const searchIndex = useMemo(() => {
    return allClasses.map((c) => {
      const tags = selectDisplayTags(c);
      const provName = c.provider_id ? providerMap[c.provider_id]?.name ?? "" : "";
      return { ...c, _searchTags: tags.map((t) => t.label).join(" "), _providerName: provName };
    });
  }, [allClasses, providerMap]);

  const [fuse, setFuse] = useState<Fuse<(typeof searchIndex)[number]> | null>(null);
  useEffect(() => {
    if (searchIndex.length === 0) { setFuse(null); return; }
    let cancelled = false;
    (async () => {
      if (!FuseModule.current) {
        FuseModule.current = await import("fuse.js");
      }
      if (cancelled) return;
      const FuseClass = FuseModule.current.default;
      setFuse(new FuseClass(searchIndex, {
        keys: [{ name: "name", weight: 0.3 }, { name: "_providerName", weight: 0.2 }, { name: "category", weight: 0.15 }, { name: "_searchTags", weight: 0.2 }, { name: "vibe_line", weight: 0.08 }, { name: "description", weight: 0.07 }],
        threshold: 0.5, distance: 300, minMatchCharLength: 2, includeScore: true, ignoreLocation: true,
      }));
    })();
    return () => { cancelled = true; };
  }, [searchIndex]);

  const substringSearch = useCallback((query: string, items: typeof searchIndex): DBClass[] => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((c) => {
      const haystack = [c.name, c._providerName, c.category, c._searchTags, c.vibe_line, c.description, c.summary].filter(Boolean).join(" ").toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    }) as unknown as DBClass[];
  }, []);

  const isFilterMode = useMemo(() =>
    searchQuery.trim() !== "" || activeTags.size > 0 || activeDimension !== "All" || filters.tags.length > 0 || filters.location !== "All Areas" || filters.priceMax < 200 || filters.ageMin > 0 || filters.ageMax < 18,
  [searchQuery, activeTags, activeDimension, filters]);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim();
    let candidates: DBClass[];
    if (q && fuse) {
      const fuseResults = fuse.search(q);
      candidates = fuseResults.map((r) => r.item as unknown as DBClass);
      if (candidates.length === 0 && searchIndex.length > 0) candidates = substringSearch(q, searchIndex);
    } else if (q && searchIndex.length > 0) {
      candidates = substringSearch(q, searchIndex);
    } else {
      candidates = allClasses;
    }
    return candidates.filter((c) => {
      const tags = (activeTags.size > 0 || activeDimension !== "All") ? selectDisplayTags(c) : null;
      if (activeTags.size > 0) {
        if (!Array.from(activeTags).every((at) => tags!.some((t) => t.label === at))) return false;
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
  }, [allClasses, searchQuery, activeTags, activeDimension, filters, fuse, searchIndex, substringSearch]);

  // ── Dimension counts (reactive to search + pill + sidebar filters, but NOT dimension) ──
  const dimensionCounts = useMemo(() => {
    const q = searchQuery.trim();
    let candidates: DBClass[];
    if (q && fuse) {
      const fuseResults = fuse.search(q);
      candidates = fuseResults.map((r) => r.item as unknown as DBClass);
      if (candidates.length === 0 && searchIndex.length > 0) candidates = substringSearch(q, searchIndex);
    } else if (q && searchIndex.length > 0) {
      candidates = substringSearch(q, searchIndex);
    } else {
      candidates = allClasses;
    }
    // Apply pill + sidebar filters (everything EXCEPT dimension)
    const base = candidates.filter((c) => {
      if (activeTags.size > 0) {
        const tags = selectDisplayTags(c);
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
      const tags = selectDisplayTags(cls);
      const dims = new Set(tags.map((t) => t.dimension));
      for (const d of dims) {
        counts[d] = (counts[d] || 0) + 1;
      }
    }
    return counts;
  }, [allClasses, searchQuery, activeTags, filters, fuse, searchIndex, substringSearch]);

  // ── Rail loading (parallel) ──
  useEffect(() => {
    if (seed === 0) return;
    loadingRef.current.clear();
    Promise.all(RAIL_ORDER.map((railId) => loadRail(railId)));
  }, [seed, loadRail]);

  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  useEffect(() => { if (isFilterMode) return; const t = setTimeout(() => { if (visibleRails < RAIL_ORDER.length) setVisibleRails((v) => v + 1); }, 600); return () => clearTimeout(t); }, [visibleRails, isFilterMode]);
  // Start loading allClasses on mount — no waterfall, no waiting for rails.
  // Ref guard prevents double-loading. Search, filters & dimension tags are
  // ready sooner; the default "All" tag strip uses /api/tags/top in the
  // meantime so pills appear instantly.
  useEffect(() => { loadAllClasses(); }, [loadAllClasses]); // eslint-disable-line react-hooks/exhaustive-deps

  const moreItems = useMemo(() => { const s = new Set(shownIdsRef.current); return allClasses.filter((c) => !s.has(c.id)); }, [allClasses]);
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
              Keep scrolling — there&apos;s always more to discover
            </p>
          </div>
          <div className="v3-masonry">
            {paginatedMore.map((cls) => {
              const provider = cls.provider_id ? providerMap[cls.provider_id]?.name : undefined;
              const tags = selectDisplayTags(cls);
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
            {!loadingMore && paginatedMore.length >= moreItems.length && moreItems.length > 0 && (
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, padding: "20px 0" }}>
                That&apos;s every class — {moreItems.length + shownIdsRef.current.length} and counting
              </p>
            )}
          </div>
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
            const tags = selectDisplayTags(cls);
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
    <div style={{ fontFamily: PAGE_FONT }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        /* Card grid — uniform height, responsive columns */
        .v3-masonry { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--gap-card-grid, 16px); }
        .v3-masonry-item { position: relative; }

        /* Sticky search area */
        .v3-search-sticky {
          position: sticky; top: 0; z-index: 25;
          background: var(--color-bg-page);
          padding-top: 4px; padding-bottom: 12px;
        }

        /* Sticky section headers — below search bar */
        .v3-section-header { position: relative; z-index: 15; background: var(--color-bg-page); }
        @media (min-width: 1024px) {
          .v3-section-header { position: sticky; top: 56px; }
        }

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

      {/* Search + filter row — sticky on scroll */}
      <div className="v3-search-sticky">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0" }}>
        <div style={{
          display: "flex", alignItems: "center", flex: 1, maxWidth: "540px",
          background: "var(--color-bg-card)", border: "1.5px solid var(--color-shadow-md)", borderRadius: "100px", overflow: "hidden",
        }}>
          <div style={{ padding: "0 16px", display: "flex", alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-400)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <input type="text" placeholder="Search classes, activities, providers..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={{
            flex: 1, border: "none", outline: "none", fontSize: "14px", padding: "13px 0",
            background: "transparent", color: "var(--color-text-primary)", fontFamily: "inherit",
          }} />
          {inputValue && (
            <button onClick={() => setInputValue("")} style={{ padding: "0 14px", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-neutral-400)", fontSize: "18px" }} aria-label="Clear search">&times;</button>
          )}
        </div>

        <button onClick={() => setSidebarOpen(true)} style={{
          flexShrink: 0, display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px",
          borderRadius: "100px", border: "1.5px solid var(--color-border-strong)",
          background: totalActiveFilters > 0 ? "var(--tumbo-orange)" : "transparent",
          color: totalActiveFilters > 0 ? "white" : "var(--color-text-primary)",
          fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
          Filters{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ""}
        </button>
      </div>
      </div>

      {/* Tag strip — scrolls away */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <PillStrip size="lg" />
        <button onClick={clearAll} className="btn-press" style={{
          flexShrink: 0, padding: "6px 14px", borderRadius: "100px", border: "1.5px solid var(--color-border-strong)",
          background: "transparent", color: "var(--color-text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          opacity: isFilterMode ? 1 : 0, pointerEvents: isFilterMode ? "auto" : "none",
          transition: "opacity 0.15s ease",
        }}>Clear</button>
      </div>

      {/* Count + active chips */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px",
        paddingBottom: "16px", paddingTop: "0px",
        borderBottom: "1px solid var(--color-border-subtle)", flexWrap: "wrap",
        ...(isFilterMode && hasActiveChips ? { position: "sticky" as const, top: 56, zIndex: 20, background: "var(--color-bg-page)", paddingTop: "16px" } : {}),
      }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {isFilterMode ? `${filteredClasses.length} classes found` : totalClasses > 0 ? `${totalClasses.toLocaleString()} classes to explore` : ""}
        </div>
        {isFilterMode && hasActiveChips && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <AnimatePresence mode="popLayout">
              {searchQuery.trim() && (
                <motion.div key="search-chip" layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
                  <FilterChip label={`"${searchQuery}"`} onRemove={() => setInputValue("")} />
                </motion.div>
              )}
              {activeChips.map((chip, chipIdx) => (
                <motion.div key={chip} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85, transition: { delay: chipIdx * 0.03, duration: 0.15 } }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
                  <FilterChip label={chip} onRemove={() => {
                    if (activeTags.has(chip)) setActiveTags((prev) => { const next = new Set(prev); next.delete(chip); return next; });
                    else if (filters.tags.includes(chip)) setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== chip) }));
                    else if (chip === filters.location) setFilters((f) => ({ ...f, location: "All Areas" }));
                  }} />
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={clearAll} className="btn-press" style={{ padding: "4px 12px", borderRadius: "100px", border: "none", background: "transparent", color: "var(--color-text-secondary)", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Content: filtered masonry or accordion browse sections */}
      {isFilterMode ? renderFilteredContent() : renderBrowseContent()}
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
            padding: "0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
// ── Helper Components ──
// ══════════════════════════════════════════════════════════════

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 10px 5px 12px", borderRadius: "100px", background: "var(--tumbo-orange)", color: "white", fontSize: "12px", fontWeight: 600 }}>
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
      <button onClick={onClear} style={{ padding: "12px 28px", borderRadius: "100px", background: "var(--tumbo-orange)", color: "white", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: PAGE_FONT }}>Clear all filters</button>
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
