"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { useExplore } from "@/components/explore/explore-context";
import { AppSidebar } from "./app-sidebar";
import type { BrowseStats } from "@/components/explore/explore-sidebar-browse";
import { ExploreBrowse } from "@/components/explore/explore-browse";
import { ExploreDetail } from "@/components/explore/explore-detail";
import type { DBClass, Provider } from "@/lib/types/tags";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const DEFAULT_STATS: BrowseStats = {
  totalClasses: 0,
  providerCount: 0,
  activeDimension: "All",
  topTags: [],
  allTagsByDimension: {},
  railData: {},
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const explore = useExplore();

  // Determine which view to show in the sidebar
  const isExploreBrowse = pathname === "/" || pathname === "/explore";
  const isExploreDetail =
    pathname.startsWith("/class/") && explore.view === "detail";
  const sidebarView = isExploreDetail
    ? "detail"
    : isExploreBrowse
      ? "browse"
      : "other";

  // Is this the explore section (browse or detail)?
  const isExploreSection = isExploreBrowse || pathname.startsWith("/class/");

  // Stats state lifted here so sidebar can read what browse computes
  const [browseStats, setBrowseStats] = useState<BrowseStats>(DEFAULT_STATS);
  const handleStatsChange = useCallback((stats: BrowseStats) => {
    setBrowseStats(stats);
  }, []);

  // Dimension change: sidebar → shell → browse
  const [requestedDimension, setRequestedDimension] = useState<string>("All");
  const handleDimensionChange = useCallback((dim: string) => {
    setRequestedDimension(dim);
  }, []);

  // Detail data for progressive enrichment of sidebar
  const [detailData, setDetailData] = useState<{
    fullData: DBClass | null;
    provider: Provider | null;
    taxonomyTags: { slug: string; label: string; dimension: string }[];
  }>({ fullData: null, provider: null, taxonomyTags: [] });

  const handleDetailDataLoaded = useCallback(
    (
      cls: DBClass,
      provider: Provider | null,
      taxonomyTags: { slug: string; label: string; dimension: string }[]
    ) => {
      setDetailData({ fullData: cls, provider, taxonomyTags });
    },
    []
  );

  // Clear detail data when leaving detail view or switching class
  useEffect(() => {
    if (explore.view === "browse") {
      setDetailData({ fullData: null, provider: null, taxonomyTags: [] });
    }
  }, [explore.view]);

  useEffect(() => {
    setDetailData({ fullData: null, provider: null, taxonomyTags: [] });
  }, [explore.selectedClassId]);

  // Background color based on view
  const bgColor = isExploreDetail ? "var(--tumbo-orange)" : "var(--tumbo-background)";

  return (
    <LayoutGroup>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: bgColor,
          fontFamily: PAGE_FONT,
          transition: "background 0.4s ease",
        }}
      >
        {/* LEFT SIDEBAR — fixed full height */}
        <aside
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 300,
            flexShrink: 0,
            zIndex: 10,
            background: isExploreDetail ? "var(--tumbo-orange)" : "var(--tumbo-background)",
            transition: "background 0.4s ease",
            borderRight: isExploreDetail
              ? "none"
              : "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <AppSidebar
            view={sidebarView}
            browseStats={browseStats}
            onDimensionChange={handleDimensionChange}
            detailData={detailData}
          />
        </aside>

        {/* RIGHT CONTENT — offset by sidebar width */}
        <main
          style={{
            marginLeft: 300,
            flex: 1,
            minWidth: 0,
            position: "relative",
            minHeight: "100vh",
          }}
        >
          {isExploreSection ? (
            <>
              {/* Browse: always mounted, hidden when detail is active */}
              <div
                style={{
                  visibility:
                    explore.view === "browse" ? "visible" : "hidden",
                  position:
                    explore.view === "browse" ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: explore.view === "browse" ? 1 : 0,
                  pointerEvents:
                    explore.view === "browse" ? "auto" : "none",
                  transition: "opacity 0.15s ease",
                  padding: "24px 32px 0",
                }}
              >
                <ExploreBrowse
                  onStatsChange={handleStatsChange}
                  requestedDimension={requestedDimension}
                />
              </div>

              {/* Detail: mounted only when active */}
              <AnimatePresence>
                {explore.view === "detail" && explore.selectedClassId && (
                  <motion.div
                    key={explore.selectedClassId}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    style={{ padding: "24px 32px 0" }}
                  >
                    <ExploreDetail
                      classId={explore.selectedClassId}
                      onDataLoaded={handleDetailDataLoaded}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Non-explore pages: render children directly */
            <div style={{ padding: "24px 32px 0", maxWidth: "min(1300px, 100%)" }}>{children}</div>
          )}
        </main>
      </div>
    </LayoutGroup>
  );
}
