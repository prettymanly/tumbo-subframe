"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExploreSidebarBrowse } from "@/components/explore/explore-sidebar-browse";
import type { BrowseStats } from "@/components/explore/explore-sidebar-browse";
import { ExploreSidebarDetail } from "@/components/explore/explore-sidebar-detail";
import type { DBClass, Provider } from "@/lib/types/tags";

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
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
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
    </div>
  );
}
