"use client";

// ── /classes-alt-v3 — MagicPath V3 Directory ──
// Two-column desktop layout: sticky left sidebar (headline, stats, dimensions)
// + main content area (search, pill strip, accordion sections w/ masonry grids).
// Based on _reference/Class Directory_V3.
// Uses real data pipeline + MPCard components in masonry layout.

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import MPNavbar from "@/components/ui/mp-navbar";
import { MPCard } from "@/components/ui/mp-card";
import {
  MPFilterSidebar,
  MPFilterState,
  MP_DEFAULT_FILTERS,
} from "@/components/ui/mp-filter-sidebar";
import { DBClass, Provider, getTopTags } from "@/lib/types/tags";
import { RAIL_ORDER, RAILS } from "@/lib/rails/config";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { RailApiResponse } from "@/lib/rails/types";
import type { TagRowItem } from "@/components/ui/hero-section";

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
  if (!url) return "/photos/Default/Placeholder.png";
  if (url.includes("places.googleapis.com")) return "/photos/Default/Placeholder.png";
  return url;
}

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

const INFINITE_BATCH = 24;
const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const CLASS_BASE = "/classes-alt-v3";
const PILL_COLORS = ["#7E401A", "#F1B313", "#FF3C00", "#FF6966"];
function getPillColor(index: number): string { return PILL_COLORS[index % PILL_COLORS.length]; }

const DIMENSION_NAMES = ["All", "Content", "Philosophy", "Experience", "Child"];

// ══════════════════════════════════════════════════════════════
// ── Main page ──
// ══════════════════════════════════════════════════════════════

export default function MPDirectoryV3Page() {
  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
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

  const [allClasses, setAllClasses] = useState<DBClass[]>([]);
  const [providerMap, setProviderMap] = useState<Record<string, Provider>>({});
  const [browseLoading, setBrowseLoading] = useState(false);
  const allClassesLoadedRef = useRef(false);

  const [page, setPage] = useState(1);
  const [visibleRails, setVisibleRails] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ── Accordion state: tracks collapsed sections (all open by default) ──
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => {
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
      setAllClasses(deduplicateByProvider(allVisible as unknown as DBClass[]));
      const pMap: Record<string, Provider> = {};
      for (const p of providerRes.data || []) pMap[p.id] = p;
      setProviderMap(pMap);
    } catch (e) { allClassesLoadedRef.current = false; console.error(e); }
    setBrowseLoading(false);
  }, [browseLoading]);

  // ── Top tags (curated top 12 for "All" view) ──
  const topTags: TagRowItem[] = useMemo(() => {
    if (allClasses.length === 0) return [];
    return getTopTags(allClasses, selectDisplayTags);
  }, [allClasses]);

  // ── ALL tags by dimension (for dimension-filtered views) ──
  // This gives many more tags per dimension than the top-12 curated set.
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

  const fuse = useMemo(() => {
    if (searchIndex.length === 0) return null;
    return new Fuse(searchIndex, {
      keys: [{ name: "name", weight: 0.3 }, { name: "_providerName", weight: 0.2 }, { name: "category", weight: 0.15 }, { name: "_searchTags", weight: 0.2 }, { name: "vibe_line", weight: 0.08 }, { name: "description", weight: 0.07 }],
      threshold: 0.5, distance: 300, minMatchCharLength: 2, includeScore: true, ignoreLocation: true,
    });
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
      if (activeTags.size > 0) {
        const tags = selectDisplayTags(c);
        if (!Array.from(activeTags).some((at) => tags.some((t) => t.label === at))) return false;
      }
      if (activeTags.size === 0 && activeDimension !== "All") {
        const tags = selectDisplayTags(c);
        if (!tags.some((t) => t.dimension === activeDimension.toLowerCase())) return false;
      }
      if (filters.tags.length > 0 && !(c.category && filters.tags.some((t) => t.toLowerCase() === c.category!.toLowerCase()))) return false;
      if (filters.ageMin > 0 && (c.age_min == null || c.age_min > filters.ageMax)) return false;
      if (filters.ageMax < 18 && (c.age_max == null || c.age_max < filters.ageMin)) return false;
      if (filters.priceMax < 200 && c.price != null && c.price > filters.priceMax) return false;
      return true;
    });
  }, [allClasses, searchQuery, activeTags, activeDimension, filters, fuse, searchIndex, substringSearch]);

  // ── Rail loading ──
  useEffect(() => {
    if (seed === 0) return;
    loadingRef.current.clear();
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    loadRail(RAIL_ORDER[0]);
    RAIL_ORDER.slice(1).forEach((railId, i) => { timers.push(setTimeout(() => { if (!cancelled) loadRail(railId); }, 1000 + i * 400)); });
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [seed, loadRail]);

  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  useEffect(() => { if (isFilterMode) return; const t = setTimeout(() => { if (visibleRails < RAIL_ORDER.length) setVisibleRails((v) => v + 1); }, 600); return () => clearTimeout(t); }, [visibleRails, isFilterMode]);
  useEffect(() => { if (isFilterMode && !allClassesLoadedRef.current) loadAllClasses(); }, [isFilterMode, loadAllClasses]);
  useEffect(() => { if (allRailsLoaded && !allClassesLoadedRef.current && !isFilterMode) loadAllClasses(); }, [allRailsLoaded, isFilterMode, loadAllClasses]);

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
    if (filters.ageMin > 0 || filters.ageMax < 18) chips.push(`Ages ${filters.ageMin}–${filters.ageMax}`);
    if (filters.priceMax < 200) chips.push(`≤ S$${filters.priceMax}`);
    return chips;
  }, [activeTags, filters]);

  const hasActiveChips = activeChips.length > 0 || searchQuery.trim() !== "";

  // ── Pill strip component ──
  const PillStrip = ({ size }: { size: "sm" | "lg" }) => (
    <div className="hide-scrollbar" style={{ display: "flex", gap: "6px", overflowX: "auto", flex: 1, paddingBottom: "2px" }}>
      {visibleTags.map((tag, idx) => {
        const isActive = activeTags.has(tag.label);
        const pillColor = getPillColor(idx);
        return (
          <button key={tag.label} onClick={() => setActiveTags((prev) => { const next = new Set(prev); if (next.has(tag.label)) next.delete(tag.label); else next.add(tag.label); return next; })} style={{
            flexShrink: 0, padding: size === "sm" ? "8px 14px" : "6px 14px", borderRadius: "100px",
            border: isActive ? "none" : "1.5px solid rgba(0,0,0,0.15)",
            background: isActive ? pillColor : "transparent",
            color: isActive ? "#fff" : "#000",
            fontSize: "13px", fontWeight: isActive ? 700 : 500,
            cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap",
            minHeight: size === "sm" ? 44 : undefined,
          }}>
            {tag.label}
          </button>
        );
      })}
    </div>
  );

  // ── Shared content renderer (accordion sections or masonry grid) ──
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
            {rail.items.map((item) => (
              <div key={item.id} className="v3-masonry-item">
                <MPCard
                  id={item.id} title={item.title} provider={item.providerName}
                  summary={item.vibeLine || item.summary} image={item.image}
                  tags={item.tags} href={`${CLASS_BASE}/${item.id}`}
                  variant="v2" masonry
                />
              </div>
            ))}
          </AccordionSection>
        );
      })}

      {visibleRails < rails.length && <div style={{ textAlign: "center", padding: "20px 0 60px" }}><LoadingDots /></div>}

      {allRailsLoaded && !browseLoading && paginatedMore.length > 0 && (() => {
        const isOpen = !collapsedSections.has("more-to-explore");
        return (
          <AccordionSection
            id="more-to-explore"
            title="More to explore"
            subtitle={`${moreItems.length} more classes not shown above`}
            itemCount={paginatedMore.length}
            isOpen={isOpen}
            onToggle={() => toggleSection("more-to-explore")}
          >
            {paginatedMore.map((cls) => (
              <div key={cls.id} className="v3-masonry-item">
                <MPCard
                  id={cls.id} title={cls.name}
                  provider={cls.provider_id ? providerMap[cls.provider_id]?.name : undefined}
                  summary={cls.vibe_line || cls.summary || ""} image={getClassImage(cls)}
                  tags={selectDisplayTags(cls)} location={extractEstate(cls.location)}
                  href={`${CLASS_BASE}/${cls.id}`} variant="v2" masonry
                />
              </div>
            ))}
            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", breakInside: "avoid" as const }}>
              {loadingMore && <LoadingDots />}
              {!loadingMore && paginatedMore.length >= moreItems.length && moreItems.length > 0 && (
                <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.3)", margin: 0 }}>You&apos;ve seen it all ✦</p>
              )}
            </div>
          </AccordionSection>
        );
      })()}

      {allRailsLoaded && browseLoading && <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}><LoadingDots /></div>}
    </>
  );

  const renderFilteredContent = () => (
    <div>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 600, letterSpacing: "-0.03em", color: "#000" }}>
          {filteredClasses.length} <span style={{ fontWeight: 400, color: "rgba(0,0,0,0.4)" }}>classes found</span>
        </h2>
        <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.35)" }}>Sorted by relevance</span>
      </div>
      {browseLoading ? <GridSkeleton /> : filteredClasses.length === 0 ? <EmptyState onClear={clearAll} /> : (
        <div className="v3-masonry">
          {filteredClasses.slice(0, page * INFINITE_BATCH).map((cls) => (
            <div key={cls.id} className="v3-masonry-item">
              <MPCard
                id={cls.id} title={cls.name}
                provider={cls.provider_id ? providerMap[cls.provider_id]?.name : undefined}
                summary={cls.vibe_line || cls.summary || ""}
                image={getClassImage(cls)} tags={selectDisplayTags(cls)}
                rating={cls.google_rating ?? undefined} reviewCount={cls.review_count ?? undefined}
                location={cls.location ?? undefined} price={cls.price ?? undefined}
                href={`${CLASS_BASE}/${cls.id}`} variant="v2" masonry
              />
            </div>
          ))}
        </div>
      )}
      {filteredClasses.length > page * INFINITE_BATCH && (
        <div ref={loadMoreRef} style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}><LoadingDots /></div>
      )}
    </div>
  );

  // ═══════════════════════════════ RENDER ═══════════════════════════════

  return (
    <div style={{ fontFamily: PAGE_FONT, background: "#FDFBF7", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        /* Masonry grid — 2 cols mobile, scales to 4–6 on desktop */
        .v3-masonry { column-count: 2; column-gap: 12px; }
        @media (min-width: 640px)  { .v3-masonry { column-count: 3; column-gap: 14px; } }
        @media (min-width: 1024px) { .v3-masonry { column-count: 3; column-gap: 16px; } }
        @media (min-width: 1280px) { .v3-masonry { column-count: 4; column-gap: 16px; } }
        @media (min-width: 1536px) { .v3-masonry { column-count: 5; column-gap: 16px; } }
        @media (min-width: 1920px) { .v3-masonry { column-count: 6; column-gap: 16px; } }

        /* Masonry items — tighter spacing for smaller cards */
        .v3-masonry-item { break-inside: avoid; margin-bottom: 12px; display: inline-block; width: 100%; }
        @media (min-width: 1024px) { .v3-masonry-item { margin-bottom: 14px; } }

        /* Sticky section headers — desktop only for now */
        .v3-section-header { position: relative; z-index: 15; }
        @media (min-width: 1024px) {
          .v3-section-header { position: sticky; top: 84px; }
        }
        /* Fade-mask below sticky header — cards slide "under" it */
        .v3-section-header::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -24px;
          height: 24px;
          background: linear-gradient(to bottom, #FDFBF7, transparent);
          pointer-events: none;
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

      {/* ════════════════════════════════════════════════════════
          MOBILE LAYOUT (< lg)
       ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <MPNavbar />

        <header style={{
          position: "sticky", top: 0, zIndex: 55,
          background: "rgba(253,251,247,0.96)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "12px 16px 0",
        }}>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", background: "#fff",
            border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "100px", marginBottom: "12px", overflow: "hidden",
            minHeight: 44,
          }}>
            <div style={{ padding: "0 14px", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input type="text" placeholder="Search classes, providers..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={{
              flex: 1, border: "none", outline: "none", fontSize: "14px", padding: "13px 0",
              background: "transparent", color: "#111", fontFamily: "inherit",
            }} />
            {inputValue && (
              <button onClick={() => setInputValue("")} style={{ padding: "0 16px", background: "transparent", border: "none", cursor: "pointer", color: "#aaa", fontSize: "18px", minHeight: 44, minWidth: 44 }} aria-label="Clear search">×</button>
            )}
          </div>

          {/* Filter + pills row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px" }}>
            <button onClick={() => setSidebarOpen(true)} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px",
              borderRadius: "100px", border: "1.5px solid rgba(0,0,0,0.15)",
              background: totalActiveFilters > 0 ? "#FF4400" : "transparent",
              color: totalActiveFilters > 0 ? "#fff" : "#000",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              minHeight: 44,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
              Filter{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ""}
            </button>
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <PillStrip size="sm" />
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 40, background: "linear-gradient(to right, transparent, rgba(253,251,247,0.97))", pointerEvents: "none" }} />
            </div>
          </div>
        </header>

        {/* Mobile active chips — sticky below header, horizontal scroll */}
        {isFilterMode && hasActiveChips && (
          <div className="hide-scrollbar" style={{ background: "#FDFBF7", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "10px 16px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <span style={{ fontSize: "12px", color: "rgba(0,0,0,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>Active:</span>
            {searchQuery.trim() && <FilterChip label={`"${searchQuery}"`} onRemove={() => setInputValue("")} />}
            {activeChips.map((chip) => <FilterChip key={chip} label={chip} onRemove={() => {
              if (activeTags.has(chip)) setActiveTags((prev) => { const next = new Set(prev); next.delete(chip); return next; });
              else if (filters.tags.includes(chip)) setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== chip) }));
              else if (chip === filters.location) setFilters((f) => ({ ...f, location: "All Areas" }));
            }} />)}
            <button onClick={clearAll} style={{ padding: "4px 10px", borderRadius: "100px", border: "none", background: "transparent", color: "rgba(0,0,0,0.4)", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear all</button>
          </div>
        )}

        {/* Mobile content */}
        <main style={{ flex: 1, padding: "20px 16px 40px" }}>
          <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
            {isFilterMode ? `${filteredClasses.length} classes found` : totalClasses > 0 ? `${totalClasses.toLocaleString()} classes to explore` : ""}
          </div>
          {isFilterMode ? renderFilteredContent() : renderBrowseContent()}
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥ lg)
       ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col min-h-screen">
        {/* Navbar mask — sticky solid bg so cards never peek above section headers */}
        <div style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "#FDFBF7",
          paddingTop: 12, paddingBottom: 12,
        }}>
          <MPNavbar />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "clamp(300px, 380px, 30%) 1fr", flex: 1 }}>
          {/* ── Left Sidebar ── */}
          <aside style={{
            borderRight: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column",
            justifyContent: "space-between", padding: "32px 28px", position: "sticky", top: "84px",
            height: "calc(100vh - 84px)", overflowY: "auto", background: "#FDFBF7",
          }}>
            <div>
              <h2 style={{ margin: "0 0 12px", fontSize: "28px", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.15, color: "#000" }}>
                The best classes<br />aren&apos;t always<br />the <em>best</em> classes.
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>
                Tümbo surfaces the hidden gems that match your child&apos;s learning style and your family&apos;s values — not just the programs with the longest waitlists.
              </p>

              {/* Stats grid */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Classes", value: totalClasses > 0 ? totalClasses.toLocaleString() : "—" },
                  { label: "Providers", value: providerCount > 0 ? `${providerCount}+` : "—" },
                  { label: "Collections", value: String(RAIL_ORDER.length) },
                  { label: "Districts", value: "28" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{stat.label}</div>
                    <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#000" }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Dimensions nav */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "20px" }}>
                <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "10px" }}>Dimensions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {DIMENSION_NAMES.map((dim) => {
                    const dimKey = dim.toLowerCase();
                    const tagCount = dim === "All" ? topTags.length : (allTagsByDimension[dimKey]?.length || 0);
                    return (
                      <div key={dim} onClick={() => { setActiveDimension(dim); }} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: "13px", color: activeDimension === dim ? "#FF4400" : "rgba(0,0,0,0.65)",
                        fontWeight: activeDimension === dim ? 700 : 400, cursor: "pointer", padding: "3px 0", transition: "color 0.15s",
                      }}>
                        <span>{dim}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {tagCount > 0 && (
                            <span style={{ fontSize: "11px", color: activeDimension === dim ? "#FF4400" : "rgba(0,0,0,0.25)", fontWeight: 400 }}>
                              {tagCount}
                            </span>
                          )}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={activeDimension === dim ? "#FF4400" : "rgba(0,0,0,0.25)"} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main style={{ flex: 1, padding: "32px 40px 80px", overflowX: "clip" }}>
            {/* Search + filter row */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{
                display: "flex", alignItems: "center", flex: 1, maxWidth: "540px",
                background: "#fff", border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "100px", overflow: "hidden",
              }}>
                <div style={{ padding: "0 16px", display: "flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
                <input type="text" placeholder="Search classes, activities, providers..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={{
                  flex: 1, border: "none", outline: "none", fontSize: "14px", padding: "13px 0",
                  background: "transparent", color: "#111", fontFamily: "inherit",
                }} />
                {inputValue && (
                  <button onClick={() => setInputValue("")} style={{ padding: "0 14px", background: "transparent", border: "none", cursor: "pointer", color: "#aaa", fontSize: "18px" }} aria-label="Clear search">×</button>
                )}
              </div>

              <button onClick={() => setSidebarOpen(true)} style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px",
                borderRadius: "100px", border: "1.5px solid rgba(0,0,0,0.15)",
                background: totalActiveFilters > 0 ? "#FF4400" : "transparent",
                color: totalActiveFilters > 0 ? "#fff" : "#000",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                Filters{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ""}
              </button>
            </div>

            {/* Tag strip */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <PillStrip size="lg" />
              {isFilterMode && (
                <button onClick={clearAll} style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: "100px", border: "1.5px solid rgba(0,0,0,0.15)",
                  background: "transparent", color: "rgba(0,0,0,0.45)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>Clear</button>
              )}
            </div>

            {/* Count + active chips — sticky when filter mode */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px",
              paddingBottom: "16px", paddingTop: isFilterMode && hasActiveChips ? "16px" : "0px",
              borderBottom: "1px solid rgba(0,0,0,0.08)", flexWrap: "wrap",
              ...(isFilterMode && hasActiveChips ? { position: "sticky" as const, top: 84, zIndex: 20, background: "#FDFBF7" } : {}),
            }}>
              <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {isFilterMode ? `${filteredClasses.length} classes found` : totalClasses > 0 ? `${totalClasses.toLocaleString()} classes to explore` : ""}
              </div>
              {isFilterMode && hasActiveChips && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                  {searchQuery.trim() && <FilterChip label={`"${searchQuery}"`} onRemove={() => setInputValue("")} />}
                  {activeChips.map((chip) => <FilterChip key={chip} label={chip} onRemove={() => {
                    if (activeTags.has(chip)) setActiveTags((prev) => { const next = new Set(prev); next.delete(chip); return next; });
                    else if (filters.tags.includes(chip)) setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== chip) }));
                    else if (chip === filters.location) setFilters((f) => ({ ...f, location: "All Areas" }));
                  }} />)}
                  <button onClick={clearAll} style={{ padding: "4px 12px", borderRadius: "100px", border: "none", background: "transparent", color: "rgba(0,0,0,0.4)", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear all</button>
                </div>
              )}
            </div>

            {/* Content: filtered masonry or accordion browse sections */}
            {isFilterMode ? renderFilteredContent() : renderBrowseContent()}
          </main>
        </div>

      </div>
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
      {/* ── Sticky section header — solid bg so cards mask under it ── */}
      <div
        className="v3-section-header"
        style={{
          background: "#FDFBF7",
          paddingTop: "16px",
          paddingBottom: "14px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
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
              letterSpacing: "-0.02em", color: "#000", lineHeight: 1.2,
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{
                margin: "4px 0 0", fontSize: "13px", color: "rgba(0,0,0,0.4)",
                lineHeight: 1.4, maxWidth: "500px",
              }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "16px" }}>
            {/* Item count badge */}
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.35)",
              background: "rgba(0,0,0,0.04)", borderRadius: "100px", padding: "4px 10px",
            }}>
              {itemCount}
            </span>

            {/* Chevron — rotates on open/close */}
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              border: "1.5px solid rgba(0,0,0,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "border-color 0.15s", flexShrink: 0,
            }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round"
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

      {/* ── Collapsible masonry content ── */}
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
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 10px 5px 12px", borderRadius: "100px", background: "#FF4400", color: "#fff", fontSize: "12px", fontWeight: 600 }}>
      {label}
      <button onClick={onRemove} style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", padding: 0 }} aria-label={`Remove ${label} filter`}>×</button>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 40px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
      <h3 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 600, color: "#000", letterSpacing: "-0.02em" }}>No classes found</h3>
      <p style={{ margin: "0 0 24px", fontSize: "15px", color: "rgba(0,0,0,0.45)" }}>Try adjusting your filters or search for something different.</p>
      <button onClick={onClear} style={{ padding: "12px 28px", borderRadius: "100px", background: "#FF4400", color: "#fff", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: PAGE_FONT }}>Clear all filters</button>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: "inline-flex", gap: "6px", justifyContent: "center", width: "100%", padding: "16px 0" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(0,0,0,0.2)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="v3-masonry">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="v3-masonry-item">
          <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ aspectRatio: "16/10", background: "#f5f0eb" }} />
            <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ width: 60, height: 10, background: "#f0ebe5", borderRadius: 4 }} />
              <div style={{ width: "80%", height: 14, background: "#ede8e2", borderRadius: 4 }} />
              <div style={{ width: "50%", height: 10, background: "#f0ebe5", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
