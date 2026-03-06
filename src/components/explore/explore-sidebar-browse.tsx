"use client";

import React from "react";
import type { RailApiResponse } from "@/lib/rails/types";
import type { TagRowItem } from "@/components/ui/hero-section";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const DIMENSION_NAMES = ["All", "Content", "Philosophy", "Experience", "Child"];

export interface BrowseStats {
  totalClasses: number;
  providerCount: number;
  activeDimension: string;
  topTags: TagRowItem[];
  allTagsByDimension: Record<string, TagRowItem[]>;
  railData: Record<string, RailApiResponse>;
  /** Class counts per dimension, reactive to active search/pill/sidebar filters */
  dimensionCounts?: Record<string, number>;
}

export interface ExploreSidebarBrowseProps {
  stats: BrowseStats;
  onDimensionChange: (dim: string) => void;
}

export function ExploreSidebarBrowse({ stats, onDimensionChange }: ExploreSidebarBrowseProps) {
  const {
    totalClasses,
    providerCount,
    activeDimension,
    topTags,
    allTagsByDimension,
    dimensionCounts,
  } = stats;

  return (
    <div style={{ fontFamily: PAGE_FONT }}>
      <h2
        style={{
          margin: "0 0 12px",
          fontSize: "28px",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1.15,
          color: "var(--tumbo-text)",
        }}
      >
        The best classes
        <br />
        aren&apos;t always
        <br />
        the <em>best</em> classes.
      </h2>
      <p
        style={{
          margin: "0 0 24px",
          fontSize: "13px",
          color: "var(--tumbo-label)",
          lineHeight: 1.6,
        }}
      >
        Find enrichment classes built for your child, not the crowd.
      </p>

      {/* Dimensions nav */}
      <div
        style={{
          borderTop: "1px solid var(--color-border-subtle)",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "var(--tumbo-label)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          Dimensions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
          {/* Sliding indicator bar */}
          <div
            style={{
              position: "absolute",
              left: -8,
              top: 0,
              width: 2,
              height: 25,
              borderRadius: 1,
              background: "var(--tumbo-orange)",
              transform: `translateY(${DIMENSION_NAMES.indexOf(activeDimension) * 31}px)`,
              transition: "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          />
          {DIMENSION_NAMES.map((dim) => {
            const dimKey = dim.toLowerCase();
            const tagCount = dimensionCounts
              ? (dim === "All" ? dimensionCounts["all"] ?? 0 : dimensionCounts[dimKey] ?? 0)
              : (dim === "All" ? topTags.length : allTagsByDimension[dimKey]?.length || 0);
            return (
              <div
                key={dim}
                onClick={() => onDimensionChange(dim)}
                className="btn-press"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                  color:
                    activeDimension === dim
                      ? "var(--tumbo-orange)"
                      : "var(--tumbo-label)",
                  fontWeight: activeDimension === dim ? 700 : 400,
                  cursor: "pointer",
                  padding: "3px 0",
                  transition: "color 0.15s",
                }}
              >
                <span>{dim}</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {tagCount > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color:
                          activeDimension === dim
                            ? "var(--tumbo-orange)"
                            : "var(--color-neutral-300)",
                        fontWeight: 400,
                      }}
                    >
                      {tagCount}
                    </span>
                  )}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={
                      activeDimension === dim
                        ? "var(--tumbo-orange)"
                        : "var(--color-neutral-300)"
                    }
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
