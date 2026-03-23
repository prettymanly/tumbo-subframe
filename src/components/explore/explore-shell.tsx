"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import MPNavbar from "@/components/ui/mp-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/ui/auth-modal";
import { useExplore } from "./explore-context";
import { ExploreSidebarBrowse } from "./explore-sidebar-browse";
import type { BrowseStats } from "./explore-sidebar-browse";
import { ExploreSidebarDetail } from "./explore-sidebar-detail";
import { ExploreBrowse } from "./explore-browse";
import { ExploreDetail } from "./explore-detail";
import type { DBClass, Provider } from "@/lib/types/tags";


const CONTAINER_MAX = "min(1600px, calc(100% - 48px))";

const DEFAULT_STATS: BrowseStats = {
  totalClasses: 0,
  providerCount: 0,
  activeDimension: "All",
  topTags: [],
  allTagsByDimension: {},
  railData: {},
};

export function ExploreShell() {
  const { view, selectedClassId, selectedCardData } = useExplore();
  const { isAuthenticated, user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const homeUrl = "/explore";

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Stats state lifted here so sidebar can read what browse computes
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [browseStats, setBrowseStats] = useState<BrowseStats>(DEFAULT_STATS);

  const handleStatsChange = useCallback((stats: BrowseStats) => {
    setBrowseStats(stats);
  }, []);

  // Dimension change flows: sidebar -> shell -> browse (via stats update)
  // Since browse owns activeDimension, the sidebar calls onDimensionChange
  // which is actually handled inside ExploreBrowse. We pass the current
  // activeDimension via stats and the sidebar triggers the change via
  // the browse component's exposed callback.
  //
  // However, since ExploreBrowse owns the state, we need a way for the
  // sidebar to tell browse to change dimension. We'll use a ref-based
  // approach: pass a callback ref from browse up, then sidebar calls it.
  //
  // Simpler approach: store a "requested dimension" in shell state,
  // and pass it down to browse as a prop. Browse syncs to it.
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
    (cls: DBClass, provider: Provider | null, taxonomyTags: { slug: string; label: string; dimension: string }[]) => {
      setDetailData({ fullData: cls, provider, taxonomyTags });
    },
    []
  );

  // Clear detail data when navigating away from detail view or switching class
  useEffect(() => {
    if (view === "browse") {
      setDetailData({ fullData: null, provider: null, taxonomyTags: [] });
    }
  }, [view]);

  // Reset detail enrichment when classId changes (new selection before data loads)
  useEffect(() => {
    setDetailData({ fullData: null, provider: null, taxonomyTags: [] });
  }, [selectedClassId]);

  return (
    <LayoutGroup>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--tumbo-background)",
          transition: "background 0.4s ease",
        }}
      >
        {/* Mobile-only navbar — desktop nav is inbuilt into left sidebar */}
        <div className="md:hidden">
          <MPNavbar />
        </div>

        {/* Two-column layout */}
        <div
          style={{
            maxWidth: CONTAINER_MAX,
            margin: "0 auto",
            padding: "var(--shell-top) 0 0",
            display: "flex",
            gap: "var(--shell-gap)",
            alignItems: "flex-start",
            minHeight: view === "browse" ? "calc(100vh - 24px)" : undefined,
          }}
        >
          {/* LEFT SIDEBAR — sticky, collapsible */}
          <aside
            className="hidden md:block"
            style={{
              position: "sticky",
              top: 24,
              width: sidebarOpen ? 430 : 0,
              minWidth: sidebarOpen ? 430 : 0,
              flexShrink: 0,
              alignSelf: "flex-start",
              overflow: "hidden",
              transition: "width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), min-width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {/* Inner wrapper keeps content from collapsing weirdly */}
            <div style={{ width: 430, opacity: sidebarOpen ? 1 : 0, transition: "opacity 0.2s ease" }}>
            {/* ── Sidebar Nav (persistent across browse/detail) ── */}
            <div style={{ marginBottom: 28 }}>
              {/* Logo */}
              <div style={{ marginBottom: 20 }}>
                <Link href={homeUrl} style={{ display: "inline-block", textDecoration: "none" }}>
                  <Image
                    src="/photos/Default/TumboLogo.png"
                    alt="Tümbo"
                    width={80}
                    height={28}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </Link>
              </div>

              {/* Nav links row + auth */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Explore / Saved links */}
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Link
                    href="/explore"
                    style={{
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--tumbo-orange)",
                      background: "var(--tumbo-orange-subtle)",
                      borderRadius: 100,
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    Explore
                  </Link>
                  <span
                    style={{
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--tumbo-label)",
                      borderRadius: 100,
                      cursor: "default",
                    }}
                    title="Coming soon"
                  >
                    Saved
                  </span>
                </div>

                {/* Auth controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {isAuthenticated ? (
                    <div ref={userMenuRef} style={{ position: "relative" }}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--color-shadow-md)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--tumbo-label)",
                          overflow: "hidden",
                          transition: "box-shadow 0.15s",
                        }}
                      >
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          user?.name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </button>
                      {/* User dropdown */}
                      {userMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            width: 200,
                            background: "var(--tumbo-background)",
                            borderRadius: 12,
                            border: "1px solid var(--color-border-subtle)",
                            boxShadow: "0 8px 24px var(--color-shadow-xl)",
                            padding: 6,
                            zIndex: 100,
                          }}
                        >
                          {user && (
                            <div style={{ padding: "8px 10px 6px" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tumbo-text)" }}>{user.name}</div>
                              <div style={{ fontSize: 11, color: "var(--tumbo-label)" }}>{user.email}</div>
                            </div>
                          )}
                          <div style={{ height: 1, background: "var(--color-border-subtle)", margin: "4px 0" }} />
                          <Link
                            href="/explore"
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: "block",
                              padding: "8px 10px",
                              fontSize: 13,
                              color: "var(--color-text-secondary)",
                              textDecoration: "none",
                              borderRadius: 8,
                              transition: "background 0.15s",
                            }}
                          >
                            Saved Classes
                          </Link>
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "8px 10px",
                              fontSize: 13,
                              color: "var(--tumbo-label)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              borderRadius: 8,
                              textAlign: "left",
                              fontFamily: "inherit",
                              transition: "background 0.15s, color 0.15s",
                            }}
                          >
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setAuthMode("signin");
                          setAuthModalOpen(true);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--tumbo-label)",
                          padding: "6px 8px",
                          transition: "color 0.15s",
                        }}
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode("register");
                          setAuthModalOpen(true);
                        }}
                        style={{
                          padding: "7px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                          background: "var(--tumbo-orange)",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: 100,
                          transition: "opacity 0.15s",
                        }}
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Animated sidebar content ── */}
            <AnimatePresence mode="wait">
              {view === "browse" ? (
                <motion.div
                  key="sidebar-browse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExploreSidebarBrowse
                    stats={browseStats}
                    onDimensionChange={handleDimensionChange}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="sidebar-detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExploreSidebarDetail
                    fullData={detailData.fullData}
                    provider={detailData.provider}
                    taxonomyTags={detailData.taxonomyTags}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </aside>

          {/* Sidebar toggle button */}
          <button
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: "sticky",
              top: 28,
              width: 24,
              height: 24,
              borderRadius: 6,
              border: "1px solid var(--color-border-subtle)",
              background: "var(--tumbo-background)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginLeft: sidebarOpen ? -12 : 0,
              marginRight: sidebarOpen ? -12 : 8,
              zIndex: 30,
              transition: "margin 0.3s ease, background 0.15s ease",
            }}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--tumbo-label)"
              strokeWidth={2}
              strokeLinecap="round"
              style={{
                transition: "transform 0.3s ease",
                transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* RIGHT CONTENT */}
          <main style={{ flex: 1, minWidth: 0, position: "relative", overflow: view === "detail" ? "hidden" : undefined }}>
            {/* Browse: always mounted, hidden when detail is active */}
            <div
              style={{
                visibility: view === "browse" ? "visible" : "hidden",
                position: view === "browse" ? "relative" : "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity: view === "browse" ? 1 : 0,
                transform: view === "browse" ? "scale(1)" : "scale(0.98)",
                pointerEvents: view === "browse" ? "auto" : "none",
                transition: "opacity 0.15s ease, transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              <ExploreBrowse
                onStatsChange={handleStatsChange}
                requestedDimension={requestedDimension}
              />
            </div>

            {/* Detail: mounted only when active */}
            <AnimatePresence>
              {view === "detail" && selectedClassId && (
                <motion.div
                  key={selectedClassId}
                  initial={{ opacity: 0, x: 40, y: 12 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 40, y: 12 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <ExploreDetail classId={selectedClassId} onDataLoaded={handleDetailDataLoaded} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Auth modal (triggered by sidebar sign-in / sign-up) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </LayoutGroup>
  );
}
