"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Types ── */
interface TagItem {
  label: string;
  dimension: string;
}

interface DimensionSearchBarProps {
  allTagsByDimension: Record<string, TagItem[]>;
  activeTags: Set<string>;
  onToggleTag: (label: string) => void;
  onSearch: () => void;
  /** When true, bar is compact (collapsed into nav) */
  collapsed: boolean;
  totalClasses: number;
  /** Show pill dropdown above the bar instead of below */
  dropdownAbove?: boolean;
}

/* ── Dimension SVG icons (same as card tag pills) ── */
function ContentIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <circle cx={12} cy={12} r={2} fill="currentColor" opacity={0.4} />
      <rect x={11.2} y={1} width={1.6} height={3} rx={0.8} />
      <rect x={11.2} y={20} width={1.6} height={3} rx={0.8} />
      <rect x={1} y={11.2} width={3} height={1.6} rx={0.8} />
      <rect x={20} y={11.2} width={3} height={1.6} rx={0.8} />
    </svg>
  );
}

function PhilosophyIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ExperienceIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ChildIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LocationIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

const DIMENSION_ICONS: Record<string, React.FC<{ size?: number }>> = {
  content: ContentIcon,
  philosophy: PhilosophyIcon,
  experience: ExperienceIcon,
  child: ChildIcon,
  location: LocationIcon,
};

/* ── Dimension config ── */
const DIMENSIONS = [
  { key: "content", label: "Content", placeholder: "What to learn", color: "var(--tumbo-tag-content)" },
  { key: "philosophy", label: "Philosophy", placeholder: "Teaching style", color: "var(--tumbo-tag-philosophy)" },
  { key: "experience", label: "Experience", placeholder: "Class vibe", color: "var(--tumbo-tag-experience)" },
  { key: "child", label: "Child", placeholder: "Your child's style", color: "var(--tumbo-tag-child)" },
  { key: "location", label: "Location", placeholder: "Neighbourhood", color: "var(--tumbo-tag-location)" },
];

/* ── Main component ── */
export function DimensionSearchBar({
  allTagsByDimension,
  activeTags,
  onToggleTag,
  onSearch,
  collapsed,
  totalClasses,
  dropdownAbove = false,
}: DimensionSearchBarProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openSection) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenSection(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openSection]);

  // Close on Escape
  useEffect(() => {
    if (!openSection) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSection(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSection]);

  const toggleSection = useCallback((key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  }, []);

  // Count active tags per dimension
  const activeCountByDim = DIMENSIONS.reduce((acc, dim) => {
    const dimTags = allTagsByDimension[dim.key] || [];
    acc[dim.key] = dimTags.filter((t) => activeTags.has(t.label)).length;
    return acc;
  }, {} as Record<string, number>);

  const totalActive = Array.from(activeTags).length;

  /* ── Collapsed (nav) version ── */
  if (collapsed) {
    return (
      <div ref={barRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpenSection(openSection ? null : "content")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 100,
            border: "1px solid var(--color-border-strong)",
            background: "var(--color-bg-card)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--tumbo-text)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.2s",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx={11} cy={11} r={8} />
            <line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
          <span style={{ display: "flex", gap: 12 }}>
            {DIMENSIONS.map((dim, i) => (
              <React.Fragment key={dim.key}>
                {i > 0 && <span style={{ color: "var(--color-border-strong)" }}>·</span>}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  fontWeight: activeCountByDim[dim.key] > 0 ? 700 : 400,
                  color: activeCountByDim[dim.key] > 0 ? dim.color : "var(--tumbo-label)",
                }}>
                  {DIMENSION_ICONS[dim.key] && React.createElement(DIMENSION_ICONS[dim.key], { size: 10 })}
                  {dim.label}
                  {activeCountByDim[dim.key] > 0 && (
                    <span style={{ fontSize: 10, marginLeft: 2 }}>({activeCountByDim[dim.key]})</span>
                  )}
                </span>
              </React.Fragment>
            ))}
          </span>
        </button>

        {/* Collapsed dropdown */}
        <AnimatePresence>
          {openSection && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                minWidth: 480,
                zIndex: 100,
              }}
            >
              <ExpandedBar
                allTagsByDimension={allTagsByDimension}
                activeTags={activeTags}
                onToggleTag={onToggleTag}
                openSection={openSection}
                onToggleSection={toggleSection}
                activeCountByDim={activeCountByDim}
                dropdownAbove={dropdownAbove}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Expanded (hero) version ── */
  return (
    <div ref={barRef} style={{ position: "relative" }}>
      <ExpandedBar
        allTagsByDimension={allTagsByDimension}
        activeTags={activeTags}
        onToggleTag={onToggleTag}
        openSection={openSection}
        onToggleSection={toggleSection}
        activeCountByDim={activeCountByDim}
        dropdownAbove={dropdownAbove}
      />
    </div>
  );
}

/* ── Expanded bar with 4 segments ── */
function ExpandedBar({
  allTagsByDimension,
  activeTags,
  onToggleTag,
  openSection,
  onToggleSection,
  activeCountByDim,
  dropdownAbove = false,
}: {
  allTagsByDimension: Record<string, TagItem[]>;
  activeTags: Set<string>;
  onToggleTag: (label: string) => void;
  openSection: string | null;
  onToggleSection: (key: string) => void;
  activeCountByDim: Record<string, number>;
  dropdownAbove?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: dropdownAbove ? "column-reverse" : "column" }}>
      {/* Segmented bar */}
      <div
        style={{
          display: "flex",
          borderRadius: 100,
          border: "1px solid var(--color-border-strong)",
          background: "var(--color-bg-card)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {DIMENSIONS.map((dim, i) => {
          const isOpen = openSection === dim.key;
          const count = activeCountByDim[dim.key];
          const tags = allTagsByDimension[dim.key] || [];
          const activeLabels = tags.filter((t) => activeTags.has(t.label)).map((t) => t.label);

          return (
            <React.Fragment key={dim.key}>
              {i > 0 && (
                <div style={{ width: 1, background: "var(--color-border-subtle)", margin: "12px 0" }} />
              )}
              <button
                onClick={() => onToggleSection(dim.key)}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  background: isOpen ? "var(--color-bg-subtle)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                  borderRadius: isOpen ? 100 : 0,
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: dim.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                  {DIMENSION_ICONS[dim.key] && React.createElement(DIMENSION_ICONS[dim.key], { size: 11 })}
                  {dim.label}
                </div>
                <div style={{
                  fontSize: 13,
                  color: count > 0 ? "var(--tumbo-text)" : "var(--tumbo-label)",
                  fontWeight: count > 0 ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {count > 0 ? activeLabels.join(", ") : dim.placeholder}
                </div>
              </button>
            </React.Fragment>
          );
        })}

        {/* Filter button */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 8px 8px 0" }}>
          <button
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--tumbo-orange)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "transform 0.15s",
            }}
            className="btn-press"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown panel */}
      <AnimatePresence>
        {openSection && (
          <motion.div
            key={openSection}
            initial={{ opacity: 0, y: dropdownAbove ? 8 : -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: dropdownAbove ? 8 : -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <DimensionDropdown
              dimensionKey={openSection}
              tags={allTagsByDimension[openSection] || []}
              activeTags={activeTags}
              onToggleTag={onToggleTag}
              hasWhiteBg={dropdownAbove}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Dropdown panel showing pills for one dimension ── */
function DimensionDropdown({
  dimensionKey,
  tags,
  activeTags,
  onToggleTag,
  hasWhiteBg = false,
}: {
  dimensionKey: string;
  tags: TagItem[];
  activeTags: Set<string>;
  onToggleTag: (label: string) => void;
  hasWhiteBg?: boolean;
}) {
  const dim = DIMENSIONS.find((d) => d.key === dimensionKey);
  if (!dim) return null;

  return (
    <div
      style={{
        ...(hasWhiteBg
          ? { marginBottom: 8, padding: "16px 16px 12px", background: "#fff", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }
          : { marginTop: 8, padding: "16px 4px 8px" }),
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tags.slice(0, 20).map((tag) => {
          const isActive = activeTags.has(tag.label);
          return (
            <button
              key={tag.label}
              onClick={() => onToggleTag(tag.label)}
              className="btn-press"
              style={{
                padding: "8px 16px",
                borderRadius: 100,
                border: isActive ? `2px solid ${dim.color}` : "1.5px solid var(--color-border-strong)",
                background: isActive ? dim.color : "transparent",
                color: isActive ? "white" : "var(--tumbo-text)",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {tags.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--tumbo-label)", margin: 0 }}>
          Loading tags...
        </p>
      )}
    </div>
  );
}
