"use client";

// ── /classes-alt — experimental editorial discovery layout ──
// Consumes the SAME shared hook as /classes. Differs only in presentation:
//   • Rail 1 uses layout="grid" (desktop 3-col grid, mobile rail)
//   • Zone dividers between content zones
//   • CollectionStrip navigation between Rails 4 and 5
//   • Editorial dividers around serendipity rail

import React from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { HeroSection } from "@/components/ui/hero-section";
import { RailSection, RailSkeleton } from "@/components/ui/rail-section";
import { RailLoader } from "@/components/ui/rail-loader";
import { CollectionStrip } from "@/components/ui/collection-strip";
import { SectionDivider } from "@/components/ui/section-divider";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import FilterChips from "@/components/ui/filter-chips";
import { CustomClassCard } from "@/components/ui/class-card";
import { RAIL_ORDER, RAIL_MAP } from "@/lib/rails/config";
import { useClassDirectory, getClassImage, InfiniteScrollSentinel } from "@/app/classes/_hooks/useClassDirectory";

function ClassDirectoryAltPage() {
  const {
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
    handleChipToggle,
    handleSearchChange,
    handleFilterClick,
    handleFiltersChange,
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
  } = useClassDirectory();

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
                  category={cls.category ?? undefined}
                  ageMin={cls.age_min ?? undefined}
                  ageMax={cls.age_max ?? undefined}
                  vibeLine={cls.vibe_line ?? undefined}
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
        /* ── Rails (discovery mode) — editorial zone layout ── */
        <>
          <div className="flex w-full flex-col items-start pb-4">
            {RAIL_ORDER.map((railId, index) => {
              const data = railData[railId];
              const loading = isRailLoading(railId) || loadingRef.current.has(railId);
              const railConfig = RAIL_MAP[railId];
              const density = railConfig?.density ?? "standard";
              const isFirstRail = index === 0;
              const isSerendipity = railConfig?.isSerendipity === true;
              const renderCount = isMobile
                ? (railConfig?.renderCount.mobile ?? 3)
                : (railConfig?.renderCount.desktop ?? 6);

              // ── Zone dividers + collection strip insertion ──
              // After Rail 1 (featured): standard divider before Rail 2
              // Before Rail 5 (index 4): divider → CollectionStrip → divider
              // Before serendipity rail: editorial (thicker) divider
              const zoneBreakBefore = (
                <>
                  {index === 1 && <SectionDivider />}
                  {index === 4 && (
                    <>
                      <SectionDivider />
                      <CollectionStrip />
                      <SectionDivider />
                    </>
                  )}
                  {isSerendipity && <SectionDivider variant="editorial" />}
                </>
              );

              if (data && data.items.length > 0) {
                return (
                  <React.Fragment key={railId}>
                    {zoneBreakBefore}
                    <div className={isFirstRail ? "" : "mt-6 md:mt-8"}>
                      <RailSection
                        railId={data.railId}
                        header={data.header}
                        subheader={data.subheader}
                        items={data.items}
                        bookmarkedClasses={bookmarkedClasses}
                        onBookmarkToggle={toggleBookmark}
                        initialRenderCount={renderCount}
                        isFirstRail={isFirstRail}
                        density={density}
                        layout={isFirstRail ? "grid" : "rail"}
                      />
                    </div>
                    {isSerendipity && <SectionDivider variant="editorial" />}
                    {index + 1 < RAIL_ORDER.length && !railData[RAIL_ORDER[index + 1]] && (
                      <RailLoader
                        railId={RAIL_ORDER[index + 1]}
                        onVisible={() => loadRail(RAIL_ORDER[index + 1])}
                      />
                    )}
                  </React.Fragment>
                );
              }

              if (loading) {
                return (
                  <React.Fragment key={railId}>
                    {zoneBreakBefore}
                    <div className={isFirstRail ? "" : "mt-6 md:mt-8"}>
                      <RailSkeleton layout={isFirstRail ? "grid" : "rail"} />
                    </div>
                  </React.Fragment>
                );
              }

              if (index === 1 && !data) {
                return (
                  <React.Fragment key={railId}>
                    {zoneBreakBefore}
                    <RailLoader railId={railId} onVisible={() => loadRail(railId)} rootMargin="400px 0px">
                      <div className="mt-6 md:mt-8"><RailSkeleton /></div>
                    </RailLoader>
                  </React.Fragment>
                );
              }

              if (index > 0 && railData[RAIL_ORDER[index - 1]]) {
                return (
                  <React.Fragment key={railId}>
                    {zoneBreakBefore}
                    <RailLoader railId={railId} onVisible={() => loadRail(railId)}>
                      <div className="mt-6 md:mt-8"><RailSkeleton /></div>
                    </RailLoader>
                  </React.Fragment>
                );
              }

              return null;
            })}
          </div>

          {/* ── Infinite scroll grid after all rails ── */}
          {allRailsLoaded && (
            <div className="flex w-full flex-col items-start gap-4 pb-12">
              <SectionDivider />
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
                      category={cls.category ?? undefined}
                      ageMin={cls.age_min ?? undefined}
                      ageMax={cls.age_max ?? undefined}
                      vibeLine={cls.vibe_line ?? undefined}
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

export default ClassDirectoryAltPage;
