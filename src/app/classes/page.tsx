"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { CustomClassCard, BadgeItem } from "@/components/ui/class-card";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import { FilterState } from "@/components/ui/filter-chips";
import FilterChips from "@/components/ui/filter-chips";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DBClass, Provider, formatPrice, formatAgeRange, deriveContextualTags } from "@/lib/types/tags";

// ── Default placeholder image by category ──
const CATEGORY_IMAGES: Record<string, string> = {
  Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&q=80",
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=640&q=80",
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&q=80",
  Swimming: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=640&q=80",
  Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=640&q=80",
  Chinese: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
  Mathematics: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=640&q=80",
  English: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=640&q=80",
  Piano: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=640&q=80",
};

function getClassImage(cls: DBClass): string {
  return cls.photo_url || CATEGORY_IMAGES[cls.category || ""] || CATEGORY_IMAGES.Art;
}

// ── Scrollable section with View All toggle ──
interface ClassItem {
  id: string;
  title: string;
  providerName?: string;
  description: string;
  image: string;
  badges: BadgeItem[];
  href: string;
}

interface ScrollableSectionProps {
  title: string;
  description: string;
  classes: ClassItem[];
  bookmarkedClasses: Set<string>;
  toggleBookmark: (classId: string) => void;
  sectionId: string;
  expanded: boolean;
  onToggleExpand: (id: string | null) => void;
}

function ScrollableSection({
  title,
  description,
  classes,
  bookmarkedClasses,
  toggleBookmark,
  sectionId,
  expanded,
  onToggleExpand,
}: ScrollableSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows, expanded]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? 300 : -300,
        behavior: "smooth",
      });
    }
  };

  // ── Expanded grid view ──
  if (expanded) {
    return (
      <div className="flex w-full flex-col items-start gap-5">
        <div className="flex w-full items-end justify-between px-4 md:px-6 lg:px-10">
          <div className="flex flex-col items-start gap-1">
            <span className="text-heading-2 font-heading-2 text-default-font">{title}</span>
            <span className="text-body font-body text-subtext-color">{description}</span>
          </div>
          <button
            onClick={() => onToggleExpand(null)}
            className="text-[13px] font-semibold text-gray-400 hover:text-gray-700 transition-colors duration-200 whitespace-nowrap pb-0.5"
          >
            ← Back to all
          </button>
        </div>
        <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-6 lg:px-10">
          {classes.map((c) => (
            <CustomClassCard
              key={c.id}
              id={c.id}
              title={c.title}
              providerName={c.providerName}
              description={c.description}
              image={c.image}
              badges={c.badges}
              href={c.href}
              isBookmarked={bookmarkedClasses.has(c.id)}
              onBookmarkToggle={toggleBookmark}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Scrollable row view ──
  return (
    <div className="flex w-full flex-col items-start gap-5 min-w-0">
      <div className="flex w-full items-end justify-between px-4 md:px-6 lg:px-10">
        <div className="flex flex-col items-start gap-1">
          <span className="text-heading-2 font-heading-2 text-default-font">{title}</span>
          <span className="text-body font-body text-subtext-color">{description}</span>
        </div>
        <button
          onClick={() => onToggleExpand(sectionId)}
          className="text-[13px] font-semibold text-gray-400 hover:text-[var(--tumbo-orange)] transition-colors duration-200 whitespace-nowrap pb-0.5"
        >
          View all →
        </button>
      </div>

      <div className="relative w-full min-w-0" style={{ overflowX: "clip", overflowY: "visible" }}>
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all duration-200 shadow-md ring-1 ring-black/[0.04]"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all duration-200 shadow-md ring-1 ring-black/[0.04]"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 lg:px-10 py-3 items-stretch"
        >
          {classes.map((c) => (
            <div key={c.id} className="flex-none w-72">
              <CustomClassCard
                id={c.id}
                title={c.title}
                providerName={c.providerName}
                description={c.description}
                image={c.image}
                badges={c.badges}
                href={c.href}
                isBookmarked={bookmarkedClasses.has(c.id)}
                onBookmarkToggle={toggleBookmark}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ──
function ClassCardSkeleton() {
  return (
    <div className="flex-none w-72 animate-pulse">
      <div className="flex h-full flex-col items-start overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="w-full h-52 bg-gray-200" />
        <div className="flex w-full flex-col items-start gap-2 px-4 pt-3.5 pb-4">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="flex gap-1.5 mt-2">
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex w-full flex-col gap-4">
          <div className="px-4 md:px-6 lg:px-10">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-4 px-4 md:px-6 lg:px-10 overflow-hidden">
            {[1, 2, 3, 4].map((j) => (
              <ClassCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──

function ClassDirectoryPage() {
  const [allClasses, setAllClasses] = useState<DBClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ classes: number; providers: number } | null>(null);
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    locations: [],
    ageRanges: [],
    days: [],
    timeSlots: [],
    priceRanges: [],
    contentTypes: [],
    experienceStyles: [],
    educationalPhilosophies: [],
    personalityTraits: [],
    searchTerms: [],
  });

  // Provider lookup map
  const [providerMap, setProviderMap] = useState<Record<string, Provider>>({});

  // ── Fetch enriched classes + providers from Supabase ──
  useEffect(() => {
    async function fetchData() {
      const supabase = supabaseBrowser();

      const [classRes, providerRes, statsRes] = await Promise.all([
        supabase
          .from("classes")
          .select("*")
          .eq("is_placeholder", false)
          .order("google_rating", { ascending: false }),
        supabase.from("providers").select("*"),
        Promise.all([
          supabase.from("classes").select("id", { count: "exact", head: true }),
          supabase.from("providers").select("id", { count: "exact", head: true }),
        ]),
      ]);

      setAllClasses(classRes.data || []);

      // Build provider lookup
      const pMap: Record<string, Provider> = {};
      for (const p of providerRes.data || []) {
        pMap[p.id] = p;
      }
      setProviderMap(pMap);

      setStats({
        classes: statsRes[0].count || 0,
        providers: statsRes[1].count || 0,
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  // ── Derive categories from fetched data ──
  const categories = [...new Set(allClasses.map((c) => c.category).filter(Boolean))] as string[];

  // ── Filter classes ──
  const filteredClasses = allClasses.filter((cls) => {
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
    // Category filter
    if (selectedCategory && cls.category !== selectedCategory) return false;
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

  // ── Map DB classes to card items ──
  function toCardItems(classes: DBClass[]): ClassItem[] {
    return classes.map((cls) => {
      const contextTags = deriveContextualTags(cls);
      const badges: BadgeItem[] = [];

      // Category badge (content type)
      if (cls.category) badges.push({ label: cls.category, category: "content" });

      // Contextual tags with explicit categories (philosophy, experience, child)
      for (const t of contextTags) {
        badges.push({ label: t.label, category: t.category });
      }

      // Age range badge (child category)
      if (cls.age_min != null) {
        badges.push({ label: formatAgeRange(cls.age_min, cls.age_max), category: "child" });
      }

      return {
        id: cls.id,
        title: cls.name,
        providerName: cls.provider_id ? providerMap[cls.provider_id]?.name : undefined,
        description: cls.summary || cls.vibe_line || cls.description || "",
        image: getClassImage(cls),
        badges,
        href: `/classes/${cls.id}`,
      };
    });
  }

  // ── Group by category for sections ──
  const classesByCategory: Record<string, ClassItem[]> = {};
  for (const cls of filteredClasses) {
    const cat = cls.category || "Other";
    if (!classesByCategory[cat]) classesByCategory[cat] = [];
    classesByCategory[cat].push(toCardItems([cls])[0]);
  }

  const toggleBookmark = (classId: string) => {
    setBookmarkedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setCurrentFilters(newFilters);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && filterSidebarOpen) {
        setFilterSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [filterSidebarOpen]);

  const allCardItems = toCardItems(filteredClasses);
  const hasActiveFilters = searchQuery.trim() || selectedCategory || 
    currentFilters.priceRanges.length > 0 || currentFilters.ageRanges.length > 0;

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-start gap-8">
          {/* Header Section */}
          <div className="flex w-full flex-col items-start gap-6 px-4 md:px-6 lg:px-10 py-12">
            <div className="flex w-full items-end justify-between gap-4">
              <span className="text-heading-1 font-heading-1 text-default-font">Browse All Classes</span>
              {stats && (
                <span className="text-[13px] text-gray-400 whitespace-nowrap pb-1">
                  {allClasses.length} enriched classes from {stats.providers.toLocaleString()} providers
                </span>
              )}
            </div>

            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center gap-3">
                <button
                  className={`flex items-center gap-2 px-4 py-3 bg-transparent rounded-full text-gray-700 transition-all duration-200 border-[1.5px] ${
                    filterSidebarOpen ? "border-black" : "border-tumbo-cream hover:border-black"
                  }`}
                  onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
                >
                  {filterSidebarOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M7 8h10M9 13h6M11 18h2" />
                    </svg>
                  )}
                  Filter
                </button>

                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-full bg-tumbo-cream text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-tumbo-orange focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Category Tabs — dynamically from DB, with sliding indicator */}
              <div className="flex w-full items-center gap-1.5 overflow-x-auto category-tabs-scroll pb-0.5">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200"
                  style={{ color: !selectedCategory ? "#fff" : "#374151" }}
                >
                  {!selectedCategory && (
                    <motion.span
                      layoutId="categoryPill"
                      className="absolute inset-0 rounded-full bg-[var(--tumbo-orange)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">All</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className="relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200"
                    style={{ color: selectedCategory === cat ? "#fff" : "#374151" }}
                  >
                    {selectedCategory === cat && (
                      <motion.span
                        layoutId="categoryPill"
                        className="absolute inset-0 rounded-full bg-[var(--tumbo-orange)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar + Content */}
      <ClassFilterSidebarIntegrated
        open={filterSidebarOpen}
        onOpenChange={setFilterSidebarOpen}
        currentFilters={currentFilters}
        onFiltersChange={handleFiltersChange}
      >
        <div className="flex w-full min-w-0 flex-col items-start gap-6">
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
                locations: [],
                ageRanges: [],
                days: [],
                timeSlots: [],
                priceRanges: [],
                contentTypes: [],
                experienceStyles: [],
                educationalPhilosophies: [],
                personalityTraits: [],
                searchTerms: [],
              });
              setSelectedCategory(null);
              setSearchQuery("");
            }}
          />

          <div className="flex w-full min-w-0 flex-col items-start gap-8">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredClasses.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center gap-4 py-20 px-4">
                <span className="text-heading-2 font-heading-2 text-default-font">No classes found</span>
                <span className="text-body font-body text-tumbo-muted text-center max-w-md">
                  Try broadening your search or removing some filters.
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                    setCurrentFilters({
                      locations: [], ageRanges: [], days: [], timeSlots: [],
                      priceRanges: [], contentTypes: [], experienceStyles: [],
                      educationalPhilosophies: [], personalityTraits: [], searchTerms: [],
                    });
                  }}
                  className="mt-2 px-6 py-3 rounded-full bg-tumbo-orange text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Clear all filters
                </button>
              </div>
            ) : hasActiveFilters ? (
              // When filtering, show flat results
              <ScrollableSection
                title={`${filteredClasses.length} Class${filteredClasses.length !== 1 ? "es" : ""} Found`}
                description={selectedCategory ? `Filtered by ${selectedCategory}` : "Results based on your search"}
                classes={allCardItems}
                bookmarkedClasses={bookmarkedClasses}
                toggleBookmark={toggleBookmark}
                sectionId="filtered"
                expanded={expandedSection === "filtered"}
                onToggleExpand={setExpandedSection}
              />
            ) : (
              // Default: group by category
              <>
                {/* Top picks — highest rated */}
                {(!expandedSection || expandedSection === "top-rated") && (
                  <ScrollableSection
                    title="Top Rated"
                    description="Highest rated classes by parents"
                    classes={toCardItems(
                      [...filteredClasses].sort((a, b) => (b.google_rating || 0) - (a.google_rating || 0)).slice(0, 10)
                    )}
                    bookmarkedClasses={bookmarkedClasses}
                    toggleBookmark={toggleBookmark}
                    sectionId="top-rated"
                    expanded={expandedSection === "top-rated"}
                    onToggleExpand={setExpandedSection}
                  />
                )}

                {/* Category sections */}
                {Object.entries(classesByCategory).map(([category, items]) =>
                  (!expandedSection || expandedSection === category) ? (
                    <ScrollableSection
                      key={category}
                      title={category}
                      description={`${items.length} class${items.length !== 1 ? "es" : ""} available`}
                      classes={items}
                      bookmarkedClasses={bookmarkedClasses}
                      toggleBookmark={toggleBookmark}
                      sectionId={category}
                      expanded={expandedSection === category}
                      onToggleExpand={setExpandedSection}
                    />
                  ) : null
                )}

                {/* All classes */}
                {(!expandedSection || expandedSection === "all") && (
                  <ScrollableSection
                    title="All Classes"
                    description="Explore our complete collection"
                    classes={allCardItems}
                    bookmarkedClasses={bookmarkedClasses}
                    toggleBookmark={toggleBookmark}
                    sectionId="all"
                    expanded={expandedSection === "all"}
                    onToggleExpand={setExpandedSection}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </ClassFilterSidebarIntegrated>
    </ModernPageLayout>
  );
}

export default ClassDirectoryPage;
