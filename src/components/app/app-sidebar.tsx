"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarNav } from "./sidebar-nav";
import { SidebarAuth } from "./sidebar-auth";
import { ExploreSidebarBrowse } from "@/components/explore/explore-sidebar-browse";
import type { BrowseStats } from "@/components/explore/explore-sidebar-browse";
import { ExploreSidebarDetail } from "@/components/explore/explore-sidebar-detail";
import type { DBClass, Provider } from "@/lib/types/tags";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

interface AppSidebarProps {
  view: "browse" | "detail" | "other";
  browseStats: BrowseStats;
  onDimensionChange: (dim: string) => void;
  detailData: {
    fullData: DBClass | null;
    provider: Provider | null;
    taxonomyTags: { slug: string; label: string; dimension: string }[];
  };
}

export function AppSidebar({
  view,
  browseStats,
  onDimensionChange,
  detailData,
}: AppSidebarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: PAGE_FONT,
        padding: "20px 24px 20px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <Link href="/explore" style={{ textDecoration: "none", marginBottom: 16 }}>
        <Image
          src="/photos/Default/TumboLogo.png"
          alt="Tümbo"
          width={80}
          height={28}
          style={{ display: "block" }}
        />
      </Link>

      {/* Nav */}
      <div style={{ marginBottom: 20 }}>
        <SidebarNav />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(0,0,0,0.08)", marginBottom: 20 }} />

      {/* Contextual area — grows to fill space */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <AnimatePresence mode="wait">
          {view === "browse" && (
            <motion.div
              key="sidebar-browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExploreSidebarBrowse
                stats={browseStats}
                onDimensionChange={onDimensionChange}
              />
            </motion.div>
          )}
          {view === "detail" && (
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
          {view === "other" && (
            <motion.div
              key="sidebar-other"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "16px 0" }} />

      {/* Auth footer */}
      <SidebarAuth />
    </div>
  );
}
