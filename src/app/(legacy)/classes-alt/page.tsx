"use client";

// ── /classes-alt — MagicPath V2 Directory ──
// Bold Orange hero + cream content area + horizontal rail carousels.
// Same data pipeline as before — only the visual layer changed.

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import MPNavbar from "@/components/ui/mp-navbar";
import { MPCard } from "@/components/ui/mp-card";
import { MPRail } from "@/components/ui/mp-rail";
import { MPFilterSidebar, MPFilterState, MP_DEFAULT_FILTERS } from "@/components/ui/mp-filter-sidebar";
import { DBClass, Provider, getTopTags } from "@/lib/types/tags";
import { RAIL_ORDER, RAILS } from "@/lib/rails/config";
import { selectDisplayTags } from "@/lib/rails/warm-tags";
import type { RailApiResponse, RailCardItem } from "@/lib/rails/types";

// ── Extract estate/area name from a full Singapore address ──
const SG_ESTATES = [
  "Bukit Timah", "Bukit Batok", "Bukit Merah", "Bukit Panjang",
  "Jurong West", "Jurong East", "Jurong",
  "Ang Mo Kio", "Toa Payoh", "Bishan", "Hougang", "Sengkang", "Punggol",
  "Tampines", "Pasir Ris", "Bedok", "Simei", "Changi",
  "Clementi", "Queenstown", "Commonwealth", "Dover", "Holland",
  "Woodlands", "Yishun", "Sembawang", "Admiralty",
  "Choa Chu Kang", "Tengah",
  "Paya Lebar", "Geylang", "Kallang", "Lavender", "Bugis",
  "Orchard", "Dhoby Ghaut", "Somerset", "Newton", "Novena",
  "Harbourfront", "Telok Blangah", "Sentosa",
  "Marina Bay", "Tanjong Pagar", "Shenton", "Raffles Place",
  "City Hall", "Bras Basah", "Prinsep",
  "Serangoon", "Kovan", "Potong Pasir",
  "MacPherson", "Mountbatten", "Katong", "Marine Parade",
  "Thomson", "Marymount", "Bright Hill",
  "Yio Chu Kang", "Lentor",
  "West Coast", "Pasir Panjang", "Kent Ridge",
  "Tiong Bahru", "Redhill", "Alexandra",
  "Camden", "Tanglin", "River Valley",
  "Neil Rd", "Chinatown", "Outram",
  "Little India", "Farrer Park", "Jalan Besar",
]
function extractEstate(loc?: string | null): string | undefined {
  if (!loc) return undefined
  for (const estate of SG_ESTATES) {
    if (loc.toLowerCase().includes(estate.toLowerCase())) return estate
  }
  // Fallback: try to grab area from "Blk X <Area>" or just return first meaningful segment
  const parts = loc.split(",")[0].trim()
  if (parts === "Singapore" || parts.length < 3) return undefined
  return parts.length > 25 ? undefined : parts
}

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

// ── Fetch rail from API ──
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

function getClassImage(cls: DBClass): string {
  const url = cls.photo_url
  if (!url) return "/photos/Default/Placeholder.png"
  if (url.includes("places.googleapis.com")) return "/photos/Default/Placeholder.png"
  return url
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

const INFINITE_BATCH = 24;
const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ══════════════════════════════════════════════════════════════
// ── Main page component ──
// ══════════════════════════════════════════════════════════════

export default function MPDirectoryV2Page() {
  // ── Core state (same data pipeline) ──
  const [seed, setSeed] = useState(0);
  const [railData, setRailData] = useState<Record<string, RailApiResponse>>({});
  const [totalClasses, setTotalClasses] = useState(0);

  const railDataRef = useRef(railData);
  railDataRef.current = railData;
  const shownIdsRef = useRef<string[]>([]);
  const loadingRef = useRef<Set<string>>(new Set());

  // ── Search / filter / tag state ──
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [filters, setFilters] = useState<MPFilterState>(MP_DEFAULT_FILTERS);

  // ── Browse dataset ──
  const [allClasses, setAllClasses] = useState<DBClass[]>([]);
  const [providerMap, setProviderMap] = useState<Record<string, Provider>>({});
  const [browseLoading, setBrowseLoading] = useState(false);
  const allClassesLoadedRef = useRef(false);

  const [page, setPage] = useState(1);
  const [visibleRails, setVisibleRails] = useState(1);

  // ── Debounced search ──
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // ── Initialize ──
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

  // ── Fetch total ──
  useEffect(() => {
    fetch("/api/rails/meta")
      .then((r) => r.json())
      .then((meta) => { if (meta.totalClasses) setTotalClasses(meta.totalClasses); })
      .catch(() => {});
  }, []);

  // ── Load all classes for browse/search ──
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

  // ── Top tags ──
  const topTags = useMemo(() => {
    if (allClasses.length === 0) return [] as string[];
    return getTopTags(allClasses, selectDisplayTags).map((t) => t.label);
  }, [allClasses]);

  // ── Enriched search index: class data + flattened tag labels ──
  // Each entry has the original DBClass plus a `_searchTags` string
  // so Fuse can fuzzy-match against tag names like "Builds Confidence"
  const searchIndex = useMemo(() => {
    return allClasses.map((c) => {
      const tags = selectDisplayTags(c);
      const provName = c.provider_id ? providerMap[c.provider_id]?.name ?? "" : "";
      return {
        ...c,
        _searchTags: tags.map((t) => t.label).join(" "),
        _providerName: provName,
      };
    });
  }, [allClasses, providerMap]);

  // ── Fuse.js instance — rebuilt when index changes ──
  const fuse = useMemo(() => {
    if (searchIndex.length === 0) return null;
    return new Fuse(searchIndex, {
      keys: [
        { name: "name", weight: 0.3 },
        { name: "_providerName", weight: 0.2 },
        { name: "category", weight: 0.15 },
        { name: "_searchTags", weight: 0.2 },
        { name: "vibe_line", weight: 0.08 },
        { name: "description", weight: 0.07 },
      ],
      threshold: 0.5,        // 0 = exact, 1 = match anything. 0.5 = generous typo tolerance
      distance: 300,         // how far from expected position chars can be
      minMatchCharLength: 2, // don't match single chars
      includeScore: true,
      ignoreLocation: true,  // search anywhere in the field, not just start
    });
  }, [searchIndex]);

  // ── Fallback: simple case-insensitive substring match ──
  const substringSearch = useCallback((query: string, items: typeof searchIndex): DBClass[] => {
    const q = query.toLowerCase();
    // Support multi-word: split on spaces, each token must appear somewhere
    const tokens = q.split(/\s+/).filter(Boolean);
    return items.filter((c) => {
      const haystack = [
        c.name,
        c._providerName,
        c.category,
        c._searchTags,
        c.vibe_line,
        c.description,
        c.summary,
      ].filter(Boolean).join(" ").toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    }) as unknown as DBClass[];
  }, []);

  // ── Filter mode ──
  const isFilterMode = useMemo(() =>
    searchQuery.trim() !== "" ||
    activeTag !== null ||
    filters.tags.length > 0 ||
    filters.location !== "All Areas" ||
    filters.priceMax < 200 ||
    filters.ageMin > 0 ||
    filters.ageMax < 18,
  [searchQuery, activeTag, filters]);

  // ── Filtered classes — Fuse for text, then hard filters for tags/age/price ──
  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim();

    // Step 1: fuzzy text search (or all classes if no query)
    let candidates: DBClass[];
    if (q && fuse) {
      // Try Fuse.js fuzzy search first
      const fuseResults = fuse.search(q);
      candidates = fuseResults.map((r) => r.item as unknown as DBClass);

      // Fallback: if Fuse returns nothing, try simple substring match
      if (candidates.length === 0 && searchIndex.length > 0) {
        candidates = substringSearch(q, searchIndex);
      }
    } else if (q && searchIndex.length > 0) {
      // Fuse not ready yet but we have data — use substring
      candidates = substringSearch(q, searchIndex);
    } else {
      candidates = allClasses;
    }

    // Step 2: hard filters (tag pill, category, age, price)
    return candidates.filter((c) => {
      if (activeTag) {
        const tags = selectDisplayTags(c);
        if (!tags.some((t) => t.label === activeTag)) return false;
      }
      if (filters.tags.length > 0 && !(c.category && filters.tags.some((t) => t.toLowerCase() === c.category!.toLowerCase()))) return false;
      if (filters.ageMin > 0 && (c.age_min == null || c.age_min > filters.ageMax)) return false;
      if (filters.ageMax < 18 && (c.age_max == null || c.age_max < filters.ageMin)) return false;
      if (filters.priceMax < 200 && c.price != null && c.price > filters.priceMax) return false;
      return true;
    });
  }, [allClasses, searchQuery, activeTag, filters, fuse, searchIndex, substringSearch]);

  // ── Load all rails on mount ──
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

  const allRailsLoaded = RAIL_ORDER.every((rid) => railData[rid]);

  // ── Progressive rail reveal ──
  useEffect(() => {
    if (isFilterMode) return;
    const timer = setTimeout(() => {
      if (visibleRails < RAIL_ORDER.length) setVisibleRails((v) => v + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [visibleRails, isFilterMode]);

  // ── Load classes for search/filter ──
  useEffect(() => {
    if (isFilterMode && !allClassesLoadedRef.current) loadAllClasses();
  }, [isFilterMode, loadAllClasses]);

  // ── Load classes once all rails finish ──
  useEffect(() => {
    if (allRailsLoaded && !allClassesLoadedRef.current && !isFilterMode) loadAllClasses();
  }, [allRailsLoaded, isFilterMode, loadAllClasses]);

  // ── "More to explore" items ──
  const moreItems = useMemo(() => {
    const shownSet = new Set(shownIdsRef.current);
    return allClasses.filter((c) => !shownSet.has(c.id));
  }, [allClasses]);

  const paginatedMore = useMemo(() => moreItems.slice(0, page * INFINITE_BATCH), [moreItems, page]);

  // ── InfiniteScroll for "More to explore" ──
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore && paginatedMore.length < moreItems.length) {
        setLoadingMore(true);
        setTimeout(() => { setPage((p) => p + 1); setLoadingMore(false); }, 400);
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadingMore, paginatedMore.length, moreItems.length]);

  const totalActiveFilters = filters.tags.length + (filters.location !== "All Areas" ? 1 : 0) + (filters.priceMax < 200 ? 1 : 0) + (filters.ageMin > 0 || filters.ageMax < 18 ? 1 : 0);

  // ── Rails data ──
  const rails = useMemo(() =>
    RAIL_ORDER.map((rid) => {
      const config = RAILS.find((r) => r.railId === rid);
      const data = railData[rid];
      return { railId: rid, header: config?.header ?? rid, subheader: config?.subheader ?? "", items: data?.items ?? [] };
    }),
  [railData]);

  // ═══════════════════════════════════ RENDER ═══════════════════════════════════

  return (
    <div style={{ fontFamily: PAGE_FONT, background: "#FF4400", minHeight: "100vh", WebkitFontSmoothing: "antialiased", paddingTop: 12 }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes mpPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <MPFilterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} filters={filters} onChange={setFilters} />

      <MPNavbar />

      {/* ═══════ HERO SECTION — Bold Orange ═══════ */}
      <section style={{ background: "#FF4400", position: "relative", overflow: "hidden", padding: "80px 0 60px" }}>
        {/* SVG topographic pattern */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M0 200 Q200 100 400 200 T800 200" fill="none" stroke="#fff" strokeWidth="1.5" />
          <path d="M0 250 Q200 150 400 250 T800 250" fill="none" stroke="#fff" strokeWidth="1" />
          <path d="M0 150 Q200 50 400 150 T800 150" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="650" cy="80" r="40" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="150" cy="320" r="60" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {/* Badge */}
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "0.04em" }}>
              Singapore&apos;s class directory
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 700, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            The best classes aren&apos;t<br />always <span style={{ fontStyle: "italic" }}>the best classes.</span>
          </h1>
          <p style={{ margin: "0 0 32px", fontSize: 17, color: "rgba(255,255,255,0.75)", maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            Tümbo surfaces the hidden gems that match your child&apos;s learning style<br />and your family&apos;s values — not just the programs with the longest waitlists.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 580, margin: "0 auto 24px", position: "relative" }}>
            <div style={{ display: "flex", background: "#FDFBF7", borderRadius: 100, padding: "6px 6px 6px 20px", boxShadow: "0 4px 32px rgba(0,0,0,0.25)", alignItems: "center" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={2} style={{ flexShrink: 0 }}>
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for any class or activity..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 15,
                  padding: "12px 12px",
                  color: "#000",
                  fontFamily: PAGE_FONT,
                }}
              />
              {inputValue && (
                <button
                  onClick={() => { setInputValue(""); setSearchQuery(""); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center" }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={2}>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                style={{
                  background: "#FF4400",
                  color: "#fff",
                  border: "none",
                  borderRadius: 100,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: PAGE_FONT,
                  transition: "opacity 0.2s",
                }}
                onClick={() => setSearchQuery(inputValue)}
              >
                Search
              </button>
            </div>
          </div>

          {/* Filter + Tag pills row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 100,
                border: "1.5px solid rgba(255,255,255,0.35)",
                background: totalActiveFilters > 0 ? "rgba(255,255,255,0.2)" : "transparent",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: PAGE_FONT,
                transition: "all 0.15s",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filters
              {totalActiveFilters > 0 && (
                <span style={{ background: "#fff", color: "#FF4400", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                  {totalActiveFilters}
                </span>
              )}
            </button>

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.25)" }} />

            {/* Tag pills */}
            <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: "60vw" }}>
              {topTags.slice(0, 10).map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag((t) => t === tag ? null : tag)}
                    style={{
                      flexShrink: 0,
                      padding: "6px 14px",
                      borderRadius: 100,
                      border: isActive ? "1.5px solid #fff" : "1.5px solid rgba(255,255,255,0.35)",
                      background: isActive ? "#fff" : "transparent",
                      color: isActive ? "#FF4400" : "#fff",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: PAGE_FONT,
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class count */}
          <p style={{ margin: "16px 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            {isFilterMode
              ? `${filteredClasses.length} classes found`
              : totalClasses > 0
                ? `${totalClasses.toLocaleString()} classes to explore`
                : ""}
          </p>
        </div>
      </section>

      {/* ═══════ CONTENT AREA — Cream ═══════ */}
      <div style={{ background: "#FDFBF7", minHeight: "60vh" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 80px" }}>

          {isFilterMode ? (
            /* ── FILTERED GRID ── */
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "#000" }}>
                  {browseLoading ? "Loading..." : `${filteredClasses.length} classes found`}
                </h2>
                <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>Sorted by relevance</span>
              </div>
              {browseLoading ? (
                <GridSkeleton />
              ) : filteredClasses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <p style={{ fontSize: 24, fontWeight: 600, color: "#000", margin: "0 0 8px" }}>No classes found</p>
                  <p style={{ fontSize: 15, color: "rgba(0,0,0,0.45)" }}>Try broadening your search or removing some filters.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {filteredClasses.slice(0, page * INFINITE_BATCH).map((cls) => (
                    <MPCard
                      key={cls.id}
                      id={cls.id}
                      title={cls.name}
                      provider={cls.provider_id ? providerMap[cls.provider_id]?.name : undefined}
                      summary={cls.vibe_line || cls.summary || ""}
                      image={getClassImage(cls)}
                      tags={selectDisplayTags(cls)}
                      rating={cls.google_rating ?? undefined}
                      reviewCount={cls.review_count ?? undefined}
                      location={cls.location ?? undefined}
                      price={cls.price ?? undefined}
                      href={`/classes-alt/${cls.id}`}
                      variant="v2"
                    />
                  ))}
                </div>
              )}
              {filteredClasses.length > page * INFINITE_BATCH && (
                <div ref={loadMoreRef} style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                  <LoadingDots />
                </div>
              )}
            </div>
          ) : (
            /* ── DISCOVERY MODE — Rails ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
              {rails.slice(0, visibleRails).map((rail) => {
                if (rail.items.length === 0) return null;
                return (
                  <MPRail key={rail.railId} title={rail.header} subtitle={rail.subheader}>
                    {rail.items.map((item) => (
                      <MPCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        provider={item.providerName}
                        summary={item.vibeLine || item.summary}
                        image={item.image}
                        tags={item.tags}
                        href={`/classes-alt/${item.id}`}
                        variant="v2"
                        featured={rail.railId === "recommended"}
                      />
                    ))}
                  </MPRail>
                );
              })}

              {/* Loading indicator between rails */}
              {visibleRails < rails.length && (
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                  <LoadingDots />
                </div>
              )}

              {/* ── MORE TO EXPLORE ── */}
              {allRailsLoaded && !browseLoading && paginatedMore.length > 0 && (
                <div>
                  <div style={{ display: "inline-block", background: "rgba(255,68,0,0.08)", borderRadius: 100, padding: "5px 14px", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#FF4400", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      More to explore
                    </span>
                  </div>
                  <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: "#000" }}>
                    Every class, <span style={{ color: "rgba(0,0,0,0.3)" }}>one scroll</span>
                  </h2>
                  <p style={{ margin: "0 0 24px", fontSize: 14, color: "rgba(0,0,0,0.45)" }}>
                    {moreItems.length} more classes to discover
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                    {paginatedMore.map((cls) => (
                      <MPCard
                        key={cls.id}
                        id={cls.id}
                        title={cls.name}
                        summary={cls.vibe_line || cls.summary || ""}
                        image={getClassImage(cls)}
                        tags={selectDisplayTags(cls)}
                        location={extractEstate(cls.location)}
                        href={`/classes-alt/${cls.id}`}
                        variant="v2"
                      />
                    ))}
                  </div>
                  {paginatedMore.length < moreItems.length && (
                    <div ref={loadMoreRef} style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                      <LoadingDots />
                    </div>
                  )}
                </div>
              )}

              {allRailsLoaded && browseLoading && (
                <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                  <LoadingDots />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ── Loading dots ── */
function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FF4400",
            animation: `mpPulse 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Grid skeleton ── */
function GridSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ aspectRatio: "16/10", background: "#f5f0eb" }} />
          <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: 60, height: 10, background: "#f0ebe5", borderRadius: 4 }} />
            <div style={{ width: "80%", height: 14, background: "#ede8e2", borderRadius: 4 }} />
            <div style={{ width: "50%", height: 10, background: "#f0ebe5", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
