"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { useExplore } from "@/components/explore/explore-context";
import { AppSidebar } from "./app-sidebar";
import { SidebarNav } from "./sidebar-nav";
import { SidebarAuth } from "./sidebar-auth";
import type { BrowseStats } from "@/components/explore/explore-sidebar-browse";
import { ExploreBrowse } from "@/components/explore/explore-browse";
import { ExploreDetail } from "@/components/explore/explore-detail";
import type { DBClass, Provider } from "@/lib/types/tags";

const SIDEBAR_WIDTH = 430;
const TOPBAR_HEIGHT = 56;
const CONTAINER_MAX = "min(1600px, calc(100% - 48px))";

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
    (pathname.startsWith("/class/") || pathname.startsWith("/explore/")) && explore.view === "detail";
  const sidebarView = isExploreDetail
    ? "detail"
    : isExploreBrowse
      ? "browse"
      : "other";

  // Is this the explore section (browse or detail)?
  const isExploreSection = isExploreBrowse || pathname.startsWith("/class/") || pathname.startsWith("/explore/");

  // Sidebar always visible
  const sidebarOpen = true;

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

  return (
    <LayoutGroup>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--tumbo-background)",
        }}
      >
        {/* ── Top navigation bar ── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "var(--tumbo-background)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              maxWidth: CONTAINER_MAX,
              margin: "0 auto",
              height: TOPBAR_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            {/* Left: logo + nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Link href="/explore" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                <Image
                  src="/photos/Default/TumboLogo.png"
                  alt="Tümbo"
                  width={80}
                  height={28}
                  style={{ display: "block" }}
                />
              </Link>
              <SidebarNav />
            </div>
            {/* Right: auth */}
            <SidebarAuth />
          </div>
        </header>

        {/* Two-column layout inside max-width container */}
        <div
          style={{
            maxWidth: CONTAINER_MAX,
            margin: "0 auto",
            paddingTop: 16,
            display: "flex",
            gap: "var(--shell-gap, 0px)",
            alignItems: "flex-start",
            minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          }}
        >
          {/* LEFT SIDEBAR — fixed to viewport, never scrolls */}
          <aside
            className="hidden md:block"
            style={{
              position: "fixed",
              top: TOPBAR_HEIGHT + 16,
              left: `max(24px, calc((100vw - 1600px) / 2 + 24px))`,
              width: SIDEBAR_WIDTH,
              height: `calc(100vh - ${TOPBAR_HEIGHT + 16}px)`,
              overflowY: "auto",
              zIndex: 20,
            }}
          >
            <AppSidebar
              view={sidebarView}
              browseStats={browseStats}
              onDimensionChange={handleDimensionChange}
              detailData={detailData}
            />
          </aside>
          {/* Spacer to reserve sidebar width in flow */}
          <div
            className="hidden md:block"
            style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, flexShrink: 0 }}
          />

          {/* RIGHT CONTENT */}
          <main style={{ flex: 1, minWidth: 0, position: "relative" }}>
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
              <div style={{ maxWidth: "min(1300px, 100%)" }}>{children}</div>
            )}
          </main>
        </div>
      </div>
    </LayoutGroup>
  );
}
