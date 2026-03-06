"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DBClass,
  Provider,
  parseReviews,
  parseGooglePlaces,
  deriveContextualTags,
} from "@/lib/types/tags";
import { MPCard } from "@/components/ui/mp-card";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function formatAgeRange(ageMin?: number | null, ageMax?: number | null): string | undefined {
  if (ageMin == null && ageMax == null) return undefined;
  if (ageMin != null && ageMax != null) {
    if (ageMin === ageMax) return `${ageMin} yrs`;
    return `${ageMin}\u2013${ageMax} yrs`;
  }
  if (ageMin != null) return `${ageMin}+ yrs`;
  if (ageMax != null) return `Up to ${ageMax} yrs`;
  return undefined;
}

/**
 * ScrollReveal -- lightweight intersection-observer fade-in-up.
 * No framer-motion needed. Elements slide up 24px and fade in
 * when they enter the viewport. Stagger via `delay` prop.
 */
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.08, rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s, transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/** Clean literal \n sequences from AI-generated text into real newlines */
function cleanText(text: string): string {
  return text.replace(/\\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Editorial blocks: pairs short lines (subheads) with their following paragraphs.
 *
 * AI-generated summaries store content as alternating short/long blocks
 * separated by \n\n. A short block (<=80 chars) followed by a long block
 * is a subhead->body pair. Renders subheads as bold 16px with tight 6px
 * coupling to body, 28px breathing room above.
 */
function EditorialBlocks({ text, variant = "dark" }: { text: string; variant?: "dark" | "light" }) {
  // dark = white text on dark/orange bg, light = dark text on cream/white bg
  const subheadColor = variant === "dark" ? "#fff" : "var(--tumbo-text)";
  const bodyColor = variant === "dark" ? "#fff" : "var(--color-text-secondary)";
  const bodySize = variant === "dark" ? "var(--type-editorial-size)" : "var(--type-body-size)";
  const subheadSize = variant === "dark" ? "var(--type-editorial-size)" : "var(--type-body-size)";
  const subheadWeight = variant === "dark" ? "var(--weight-regular)" : "var(--type-subhead-weight)";

  const raw = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const SUBHEAD_MAX = 100;

  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < raw.length) {
    const block = raw[i];
    const nextBlock = raw[i + 1];

    // Pattern 1: subhead\nbody within same block (single newline separator)
    const firstNewline = block.indexOf("\n");
    if (firstNewline > 0 && firstNewline <= SUBHEAD_MAX) {
      const subhead = block.slice(0, firstNewline).trim();
      const body = block.slice(firstNewline + 1).trim();
      nodes.push(
        <div key={i} style={{ marginTop: nodes.length > 0 ? "var(--gap-editorial-block)" : 0 }}>
          <p style={{ margin: "0 0 var(--gap-subhead-body)", fontSize: subheadSize, fontWeight: subheadWeight, color: subheadColor, lineHeight: "var(--type-subhead-leading)", letterSpacing: "var(--type-subhead-tracking)" }}>
            {subhead}
          </p>
          <p style={{ margin: 0, fontSize: bodySize, fontWeight: "var(--type-body-weight)", color: bodyColor, lineHeight: "var(--type-body-leading)" }}>{body}</p>
        </div>
      );
      i += 1;
      continue;
    }

    // Pattern 2: short standalone block followed by a longer block -> subhead + body
    if (block.length <= SUBHEAD_MAX && nextBlock && nextBlock.length > SUBHEAD_MAX) {
      nodes.push(
        <div key={i} style={{ marginTop: nodes.length > 0 ? "var(--gap-editorial-block)" : 0 }}>
          <p style={{ margin: "0 0 var(--gap-subhead-body)", fontSize: subheadSize, fontWeight: subheadWeight, color: subheadColor, lineHeight: "var(--type-subhead-leading)", letterSpacing: "var(--type-subhead-tracking)" }}>
            {block}
          </p>
          <p style={{ margin: 0, fontSize: bodySize, fontWeight: "var(--type-body-weight)", color: bodyColor, lineHeight: "var(--type-body-leading)" }}>{nextBlock}</p>
        </div>
      );
      i += 2;
      continue;
    }

    // Plain body paragraph
    nodes.push(
      <p key={i} style={{ margin: 0, marginTop: nodes.length > 0 ? "var(--gap-label-content)" : 0, fontSize: bodySize, fontWeight: "var(--type-body-weight)", color: bodyColor, lineHeight: "var(--type-body-leading)" }}>
        {block}
      </p>
    );
    i += 1;
  }

  return <div>{nodes}</div>;
}

/**
 * Numbered editorial blocks -- poster-style oversized numerals.
 * Parses AI text into numbered items with optional subheads.
 * Numbers rendered in large serif at ~3 lines height for graphic editorial feel.
 */
function NumberedBlocks({ text, variant = "dark" }: { text: string; variant?: "dark" | "light" }) {
  const subheadColor = variant === "dark" ? "#fff" : "var(--tumbo-text)";
  const bodyColor = variant === "dark" ? "#fff" : "var(--color-text-secondary)";
  const numeralColor = variant === "dark" ? "rgba(255,255,255,0.15)" : "var(--color-shadow-sm)";
  const bodySize = variant === "dark" ? "var(--type-editorial-size)" : "var(--type-body-size)";
  const subheadSize = variant === "dark" ? "var(--type-editorial-size)" : "var(--type-body-size)";
  const subheadWeight = variant === "dark" ? "var(--weight-regular)" : "var(--type-subhead-weight)";

  const raw = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const SUBHEAD_MAX = 100;

  const items: { subhead?: string; body: string }[] = [];
  let i = 0;
  while (i < raw.length) {
    const block = raw[i];
    const nextBlock = raw[i + 1];

    // Strip leading numbers like "1. " or "1) " or "1 - "
    const stripped = block.replace(/^\d+[\.\)\-]\s*/, "");

    // Pattern 1: subhead\nbody within same block
    const firstNewline = stripped.indexOf("\n");
    if (firstNewline > 0 && firstNewline <= SUBHEAD_MAX) {
      items.push({
        subhead: stripped.slice(0, firstNewline).trim(),
        body: stripped.slice(firstNewline + 1).trim(),
      });
      i += 1;
      continue;
    }

    // Pattern 2: short block + longer block -> subhead + body
    if (stripped.length <= SUBHEAD_MAX && nextBlock && nextBlock.length > SUBHEAD_MAX) {
      items.push({
        subhead: stripped,
        body: nextBlock.replace(/^\d+[\.\)\-]\s*/, ""),
      });
      i += 2;
      continue;
    }

    // Plain paragraph -- becomes a body-only item
    items.push({ body: stripped });
    i += 1;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-section)" }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: "grid",
            gridTemplateColumns: "52px 1fr",
            gap: "var(--gap-label-content)",
            alignItems: "start",
          }}
        >
          {/* Poster-scale serif numeral */}
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(40px, 10vw, 64px)",
              fontWeight: 400,
              lineHeight: 0.85,
              color: numeralColor,
              letterSpacing: "-0.04em",
              paddingTop: item.subhead ? 0 : 2,
              userSelect: "none",
            }}
          >
            {idx + 1}
          </span>

          <div style={{ paddingTop: 2 }}>
            {item.subhead && (
              <p
                style={{
                  margin: "0 0 var(--gap-subhead-body)",
                  fontSize: subheadSize,
                  fontWeight: subheadWeight,
                  color: subheadColor,
                  lineHeight: "var(--type-subhead-leading)",
                  letterSpacing: "var(--type-subhead-tracking)",
                }}
              >
                {item.subhead}
              </p>
            )}
            <p
              style={{
                margin: 0,
                fontSize: bodySize,
                fontWeight: "var(--type-body-weight)",
                color: bodyColor,
                lineHeight: "var(--type-body-leading)",
              }}
            >
              {item.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Source attribution pills ── */
function SourcePills({ discovered_from, section, variant = "dark" }: { discovered_from: string; section?: string; variant?: "light" | "dark" }) {
  try {
    const parsed = JSON.parse(discovered_from);
    const sources: string[] = section
      ? (parsed[section] || parsed.description || [])
      : (parsed.description || []);
    if (!sources || sources.length === 0) return null;

    const isLight = variant === "light";
    return (
      <div>
        <p style={{
          margin: "0 0 var(--gap-subhead-body)", fontSize: "var(--type-source-label-size)", fontWeight: "var(--type-source-label-weight)",
          textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
          color: isLight ? "rgba(255,255,255,0.4)" : "var(--color-text-tertiary)",
        }}>
          Written based on these sources
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-source-pills)" }}>
          {sources.map((s: string, i: number) => (
            <span key={i} style={{
              padding: "var(--space-1) var(--space-3)", borderRadius: 100,
              border: isLight ? "1px solid rgba(255,255,255,0.5)" : "1px solid var(--color-border-subtle)",
              fontSize: "var(--type-pill-size)", fontWeight: "var(--type-pill-weight)",
              color: isLight ? "#fff" : "var(--color-text-tertiary)",
              textTransform: "uppercase", letterSpacing: "var(--tracking-wide)",
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

/* ── Neighbourhood section -- tabbed nearby places ── */
const NEIGHBOURHOOD_TABS: { key: string; label: string }[] = [
  { key: "food", label: "F&B" },
  { key: "cafes", label: "Cafes" },
  { key: "remote_working", label: "Co-working" },
  { key: "groceries", label: "Groceries" },
  { key: "parking", label: "Parking" },
  { key: "transit", label: "Transport" },
];

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "";
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function NeighbourhoodCard({
  displayAddress,
  nearbyPlaces,
}: {
  displayAddress: string | null;
  nearbyPlaces: Record<string, { name: string; placeId?: string; distanceMeters?: number | null; googleMapsUri?: string | null }[]> | null;
}) {
  const [activeTab, setActiveTab] = useState("food");
  const hasTabs = nearbyPlaces && typeof nearbyPlaces === "object" &&
    NEIGHBOURHOOD_TABS.some((t) => Array.isArray(nearbyPlaces[t.key]) && nearbyPlaces[t.key]!.length > 0);
  const activePlaces = hasTabs && nearbyPlaces?.[activeTab] ? nearbyPlaces[activeTab]! : [];

  if (!displayAddress && !hasTabs) return null;

  return (
    <div style={{
      background: "var(--color-bg-card)", borderRadius: "var(--card-radius)",
      border: "var(--card-border)",
      padding: "var(--padding-card-y) var(--padding-card-x)",
      marginBottom: "var(--gap-card-stack)",
      boxShadow: "var(--card-shadow)",
    }}>
      <p style={{
        margin: "0 0 var(--gap-label-content)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
        textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
        color: "var(--color-text-tertiary)",
      }}>
        In the neighbourhood
      </p>

      {displayAddress && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--gap-inline)", marginBottom: hasTabs ? "var(--gap-card-stack)" : 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "color-mix(in srgb, var(--tumbo-orange) 8%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--tumbo-orange)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)", color: "var(--tumbo-text)", lineHeight: "var(--leading-snug)" }}>
              {displayAddress}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "var(--type-caption-size)", fontWeight: "var(--weight-semibold)", color: "var(--tumbo-orange)", textDecoration: "none" }}
            >
              Open in Google Maps &rarr;
            </a>
          </div>
        </div>
      )}

      {hasTabs && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-source-pills)", marginBottom: "var(--gap-label-content)" }}>
            {NEIGHBOURHOOD_TABS
              .filter((t) => Array.isArray(nearbyPlaces?.[t.key]) && nearbyPlaces[t.key]!.length > 0)
              .map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: "var(--space-2) var(--space-4)", borderRadius: 100, border: "none", cursor: "pointer",
                    fontSize: "var(--type-caption-size)", fontWeight: "var(--weight-semibold)",
                    minHeight: 44,
                    background: activeTab === t.key ? "var(--tumbo-orange)" : "var(--color-shadow-sm)",
                    color: activeTab === t.key ? "#fff" : "var(--color-text-secondary)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t.label}
                </button>
              ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activePlaces.slice(0, 5).map((place, idx) => (
              <div key={place.placeId || idx} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)",
                padding: "var(--space-3) 0",
                borderBottom: idx < Math.min(activePlaces.length, 5) - 1 ? "1px solid var(--color-border-subtle)" : "none",
              }}>
                {place.googleMapsUri ? (
                  <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)", color: "var(--tumbo-text)", textDecoration: "none", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {place.name}
                  </a>
                ) : (
                  <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)", color: "var(--tumbo-text)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {place.name}
                  </span>
                )}
                {place.distanceMeters != null && (
                  <span style={{ fontSize: "var(--type-caption-size)", color: "var(--color-text-tertiary)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatDistance(place.distanceMeters)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Other locations -- sibling classes from the same provider ── */
function OtherLocationsSection({
  locations,
  providerName,
}: {
  locations: { id: string; name: string; photo_url?: string; location?: string; vibe_line?: string; summary?: string; best_parent_quote?: string; age_min?: number; age_max?: number }[];
  providerName: string;
}) {
  if (locations.length === 0) return null;

  return (
    <div style={{ marginBottom: "var(--gap-card-stack)" }}>
      <p style={{
        margin: "0 0 var(--gap-label-content)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
        textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
        color: "var(--color-text-tertiary)",
        padding: "0 var(--space-1)",
      }}>
        Other {providerName} classes
      </p>

      <div
        className="explore-other-locations-scroll"
        style={{
          display: "flex", gap: "var(--gap-card-grid)", overflowX: "auto",
          paddingBottom: "var(--space-2)",
          scrollbarWidth: "none",
          msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"],
        }}
      >
        {locations.map((loc) => {
          const img = (loc.photo_url && !loc.photo_url.includes("places.googleapis.com"))
            ? loc.photo_url
            : undefined;
          return (
            <MPCard
              key={loc.id}
              id={loc.id}
              title={loc.name}
              summary={loc.vibe_line || loc.summary}
              image={img}
              location={loc.location}
              href={`/explore/${loc.id}`}
              variant="v2"
              ageRange={formatAgeRange(loc.age_min, loc.age_max)}
              parentQuote={loc.best_parent_quote}
            />
          );
        })}
      </div>

      <style>{`
        .explore-other-locations-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ── Similar classes -- horizontal scroll, V2 MPCard style ── */
function SimilarClassesSection({
  classes,
}: {
  classes: { id: string; name: string; photo_url?: string; category?: string; provider_name?: string; shared_tags: number }[];
}) {
  if (classes.length === 0) return null;

  return (
    <div style={{ marginBottom: "var(--gap-card-stack)" }}>
      <p style={{
        margin: "0 0 var(--gap-label-content)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
        textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
        color: "var(--color-text-tertiary)",
        padding: "0 var(--space-1)",
      }}>
        You might also like
      </p>

      <div
        className="explore-similar-scroll"
        style={{
          display: "flex", gap: "var(--gap-card-grid)", overflowX: "auto",
          paddingBottom: "var(--space-2)",
          scrollbarWidth: "none",
          msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"],
        }}
      >
        {classes.map((c) => {
          const img = (c.photo_url && !c.photo_url.includes("places.googleapis.com"))
            ? c.photo_url
            : undefined;
          return (
            <MPCard
              key={c.id}
              id={c.id}
              title={c.name}
              provider={c.provider_name}
              summary={c.vibe_line || c.summary}
              image={img}
              location={c.location}
              href={`/explore/${c.id}`}
              variant="v2"
              category={c.category}
              ageRange={formatAgeRange(c.age_min, c.age_max)}
              parentQuote={c.best_parent_quote}
            />
          );
        })}
      </div>

      <style>{`
        .explore-similar-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/** Legacy SimilarCard — kept for OtherLocationsSection */
function SimilarCard({
  cls,
  img,
  href,
}: {
  cls: { name: string; photo_url?: string; category?: string; provider_name?: string };
  img: string;
  href: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      style={{
        flexShrink: 0, width: 260, textDecoration: "none",
        borderRadius: "var(--card-radius)", overflow: "hidden",
        display: "flex", flexDirection: "column",
        background: hovered ? "var(--tumbo-orange)" : "var(--color-bg-card)",
        border: hovered ? "1px solid var(--tumbo-orange)" : "1px solid var(--color-shadow-md)",
        fontFamily: PAGE_FONT,
        animation: hovered ? "exploreSimCardBounce 0.25s cubic-bezier(0.22, 0.68, 0.31, 1.2)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image -- 16:10 aspect, matching MPCard */}
      <div style={{ aspectRatio: "16/10", overflow: "hidden", flexShrink: 0, background: "var(--tumbo-cream)" }}>
        <img
          src={img}
          alt={cls.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Content -- matching MPCard padding & typography */}
      <div style={{ padding: "var(--space-4) var(--padding-callout)", display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
        {/* Provider name */}
        {cls.provider_name && (
          <p style={{
            margin: 0, fontSize: "var(--type-caption-size)", fontWeight: "var(--weight-medium)",
            color: hovered ? "rgba(255,255,255,0.7)" : "var(--color-text-secondary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {cls.provider_name}
          </p>
        )}

        {/* Class name */}
        <p style={{
          margin: 0, fontSize: "var(--type-body-size)", fontWeight: "var(--weight-semibold)",
          color: hovered ? "#fff" : "var(--tumbo-text)",
          lineHeight: "var(--leading-tight)", letterSpacing: "var(--tracking-tight)",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {cls.name}
        </p>

        {/* Category */}
        {cls.category && (
          <p style={{
            margin: "var(--space-1) 0 0", fontSize: "var(--type-pill-size)", fontWeight: "var(--weight-medium)",
            color: hovered ? "rgba(255,255,255,0.65)" : "var(--color-text-tertiary)",
          }}>
            {cls.category}
          </p>
        )}
      </div>

      <style>{`
        @keyframes exploreSimCardBounce {
          0%   { transform: translateY(0); }
          20%  { transform: translateY(-3px); }
          55%  { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </a>
  );
}

/* ── Content loading skeleton ── */
function DetailContentSkeleton() {
  return (
    <div style={{ padding: "var(--padding-page-top) 0 80px" }}>
      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 16, background: "var(--color-shadow-md)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ marginTop: "var(--gap-card-stack)" }}>
        <div style={{ width: "60%", height: 20, borderRadius: 8, background: "var(--color-shadow-md)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "40%", height: 14, borderRadius: 6, background: "var(--color-shadow-md)", marginTop: "var(--space-3)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "90%", height: 14, borderRadius: 6, background: "var(--color-shadow-md)", marginTop: "var(--gap-card-stack)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "85%", height: 14, borderRadius: 6, background: "var(--color-shadow-md)", marginTop: "var(--gap-inline)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "70%", height: 14, borderRadius: 6, background: "var(--color-shadow-md)", marginTop: "var(--gap-inline)", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

/* ======================================================================
   ExploreDetail -- right content panel for class detail view.
   Fetches its own data from Supabase and exposes it via callback.
   ====================================================================== */

interface ExploreDetailProps {
  classId: string;
  onDataLoaded?: (cls: DBClass, provider: Provider | null, taxonomyTags: { slug: string; label: string; dimension: string }[]) => void;
}

export function ExploreDetail({ classId, onDataLoaded }: ExploreDetailProps) {
  const [cls, setCls] = useState<DBClass | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [taxonomyTags, setTaxonomyTags] = useState<{ slug: string; label: string; dimension: string }[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<string, { name: string; placeId?: string; distanceMeters?: number | null; googleMapsUri?: string | null }[]> | null>(null);
  const [similarClasses, setSimilarClasses] = useState<{ id: string; name: string; photo_url?: string; category?: string; provider_name?: string; shared_tags: number; vibe_line?: string; summary?: string; location?: string; best_parent_quote?: string; age_min?: number; age_max?: number }[]>([]);
  const [otherLocations, setOtherLocations] = useState<{ id: string; name: string; photo_url?: string; location?: string; vibe_line?: string; summary?: string; best_parent_quote?: string; age_min?: number; age_max?: number }[]>([]);

  // Stable callback ref to avoid re-triggering effects
  const onDataLoadedRef = useRef(onDataLoaded);
  onDataLoadedRef.current = onDataLoaded;

  useEffect(() => {
    let cancelled = false;

    async function fetchClass() {
      if (!classId) return;
      const supabase = supabaseBrowser();
      try {

      const { data: classData, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (cancelled) return;
      if (error || !classData) { setNotFound(true); setLoading(false); return; }
      setCls(classData);

      let fetchedProvider: Provider | null = null;

      if (classData.provider_id) {
        const { data: providerData } = await supabase
          .from("providers")
          .select("*")
          .eq("id", classData.provider_id)
          .single();
        fetchedProvider = providerData || null;
        if (!cancelled) setProvider(fetchedProvider);

        // Other locations: sibling classes from the same provider
        const { data: siblingClasses } = await supabase
          .from("classes")
          .select("id, name, photo_url, location, vibe_line, summary, best_parent_quote, age_min, age_max")
          .eq("provider_id", classData.provider_id)
          .eq("is_placeholder", false)
          .neq("id", classData.id)
          .limit(10);
        if (!cancelled && siblingClasses && siblingClasses.length > 0) {
          setOtherLocations(siblingClasses.map((c) => ({
            id: c.id,
            name: c.name,
            photo_url: c.photo_url ?? undefined,
            location: c.location ?? undefined,
            vibe_line: c.vibe_line ?? undefined,
            summary: c.summary ?? undefined,
            best_parent_quote: c.best_parent_quote ?? undefined,
            age_min: c.age_min ?? undefined,
            age_max: c.age_max ?? undefined,
          })));
        }
      }

      let resolvedTaxonomyTags: { slug: string; label: string; dimension: string }[] = [];

      const { data: tagRows } = await supabase
        .from("class_taxonomy_tags")
        .select("tag_slug, dimension")
        .eq("class_id", classData.id);

      // Track whether taxonomy-based similar classes were found
      let foundSimilar = false;

      if (tagRows && tagRows.length > 0) {
        const { TAXONOMY_BY_SLUG } = await import("@/lib/tags/taxonomy");
        const resolved = tagRows
          .map((row: { tag_slug: string; dimension: string }) => {
            const tag = TAXONOMY_BY_SLUG.get(row.tag_slug);
            return tag ? { slug: row.tag_slug, label: tag.label, dimension: tag.dimension } : null;
          })
          .filter(Boolean) as { slug: string; label: string; dimension: string }[];
        const dimOrder: Record<string, number> = { content: 0, philosophy: 1, experience: 2, child: 3 };
        resolved.sort((a, b) => (dimOrder[a.dimension] ?? 9) - (dimOrder[b.dimension] ?? 9));
        if (!cancelled) setTaxonomyTags(resolved);
        resolvedTaxonomyTags = resolved;

        // Similar classes via shared taxonomy tags
        const tagSlugs = resolved.map((t) => t.slug);
        if (tagSlugs.length > 0) {
          const { data: sharedRows } = await supabase
            .from("class_taxonomy_tags")
            .select("class_id, tag_slug")
            .in("tag_slug", tagSlugs)
            .neq("class_id", classData.id);

          if (sharedRows && sharedRows.length > 0) {
            const countMap = new Map<string, number>();
            for (const row of sharedRows) {
              countMap.set(row.class_id, (countMap.get(row.class_id) || 0) + 1);
            }
            const topIds = Array.from(countMap.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([id]) => id);

            if (topIds.length > 0) {
              const { data: simClasses } = await supabase
                .from("classes")
                .select("id, name, photo_url, category, provider_id, vibe_line, summary, location, best_parent_quote, age_min, age_max")
                .in("id", topIds)
                .eq("is_placeholder", false);

              if (simClasses && simClasses.length > 0) {
                foundSimilar = true;
                const providerIds = [...new Set(simClasses.map((c) => c.provider_id).filter(Boolean))] as string[];
                const provMap = new Map<string, string>();
                if (providerIds.length > 0) {
                  const { data: provRows } = await supabase
                    .from("providers")
                    .select("id, name")
                    .in("id", providerIds);
                  if (provRows) provRows.forEach((p) => provMap.set(p.id, p.name));
                }

                const enriched = simClasses.map((c) => ({
                  id: c.id,
                  name: c.name,
                  photo_url: c.photo_url ?? undefined,
                  category: c.category ?? undefined,
                  provider_name: c.provider_id ? provMap.get(c.provider_id) : undefined,
                  shared_tags: countMap.get(c.id) || 0,
                  vibe_line: c.vibe_line ?? undefined,
                  summary: c.summary ?? undefined,
                  location: c.location ?? undefined,
                  best_parent_quote: c.best_parent_quote ?? undefined,
                  age_min: c.age_min ?? undefined,
                  age_max: c.age_max ?? undefined,
                }));
                enriched.sort((a, b) => b.shared_tags - a.shared_tags);
                if (!cancelled) setSimilarClasses(enriched);
              }
            }
          }
        }
      }

      // Fallback: same category (when taxonomy tags yielded nothing)
      if (!foundSimilar && classData.category) {
        const { data: catClasses } = await supabase
          .from("classes")
          .select("id, name, photo_url, category, provider_id, vibe_line, summary, location, best_parent_quote, age_min, age_max")
          .eq("category", classData.category)
          .eq("is_placeholder", false)
          .neq("id", classData.id)
          .limit(6);

        if (catClasses && catClasses.length > 0) {
          const providerIds = [...new Set(catClasses.map((c) => c.provider_id).filter(Boolean))] as string[];
          const provMap = new Map<string, string>();
          if (providerIds.length > 0) {
            const { data: provRows } = await supabase
              .from("providers")
              .select("id, name")
              .in("id", providerIds);
            if (provRows) provRows.forEach((p) => provMap.set(p.id, p.name));
          }

          if (!cancelled) {
            setSimilarClasses(catClasses.map((c) => ({
              id: c.id,
              name: c.name,
              photo_url: c.photo_url ?? undefined,
              category: c.category ?? undefined,
              provider_name: c.provider_id ? provMap.get(c.provider_id) : undefined,
              shared_tags: 0,
              vibe_line: c.vibe_line ?? undefined,
              summary: c.summary ?? undefined,
              location: c.location ?? undefined,
              best_parent_quote: c.best_parent_quote ?? undefined,
              age_min: c.age_min ?? undefined,
              age_max: c.age_max ?? undefined,
            })));
          }
        }
      }

      // Nearby places from provider JSON column
      if (classData.provider_id) {
        const provRaw = await supabase
          .from("providers")
          .select("nearby_places")
          .eq("id", classData.provider_id)
          .single();
        if (!cancelled && provRaw.data?.nearby_places && typeof provRaw.data.nearby_places === "object") {
          setNearbyPlaces(provRaw.data.nearby_places as Record<string, { name: string; placeId?: string; distanceMeters?: number | null; googleMapsUri?: string | null }[]>);
        }
      }

      if (!cancelled) {
        setLoading(false);

        // Notify parent (shell) with fetched data for sidebar progressive enrichment
        onDataLoadedRef.current?.(classData, fetchedProvider, resolvedTaxonomyTags);
      }

      } catch (err) {
        console.error("[ExploreDetail] fetchClass error:", err);
        if (!cancelled) setLoading(false);
      }
    }
    fetchClass();

    return () => { cancelled = true; };
  }, [classId]);

  // Lightbox Escape key handler
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);

  if (loading) return <DetailContentSkeleton />;

  if (notFound || !cls) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--weight-semibold)", color: "var(--tumbo-text)", margin: "0 0 var(--gap-subhead-body)" }}>Class not found</h1>
        <p style={{ fontSize: "var(--type-body-size)", color: "var(--color-text-secondary)", margin: "0 0 var(--gap-card-stack)" }}>This class may have been removed or the link is incorrect.</p>
        <a href="/explore" style={{ display: "inline-block", padding: "var(--space-3) var(--space-6)", borderRadius: 100, background: "var(--color-bg-card)", color: "var(--tumbo-orange)", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)", textDecoration: "none" }}>
          Browse all classes
        </a>
      </div>
    );
  }

  const reviews = parseReviews(cls.raw_reviews);
  const heroImage = (cls.photo_url && !cls.photo_url.includes("places.googleapis.com"))
    ? cls.photo_url
    : "/photos/Default/Placeholder.png";
  const googleData = parseGooglePlaces(provider?.classes_scrape_source);
  const googleRating = googleData?.google_rating ?? cls.google_rating ?? null;
  const googleReviewCount = googleData?.google_review_count ?? cls.review_count ?? null;
  const displayAddress = cls.location || googleData?.google_address || provider?.street_address || null;

  // Best review quote for pull-quote treatment
  const bestQuote = reviews
    .filter((r) => r.text.length > 60)
    .sort((a, b) => b.text.length - a.text.length)[0] || null;

  return (
    <div style={{ padding: "var(--padding-page-top) 0 var(--padding-page-bottom)", fontFamily: PAGE_FONT }}>

      {/* ── Hero image ── */}
      <div
        style={{
          borderRadius: "var(--hero-radius)", overflow: "hidden", position: "relative",
          cursor: "pointer", marginBottom: "var(--gap-section)",
        }}
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={heroImage}
          alt={cls.name}
          className="explore-hero-img"
          style={{
            width: "100%", height: "auto", aspectRatio: "16/9", maxHeight: 420,
            objectFit: "cover", display: "block",
            transition: "transform 0.6s cubic-bezier(0.25,0.1,0.25,1)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
        />
      </div>

      {/* ═══════════════════════════════════
          SECTION 1 -- About (the editorial lede)
          Open on orange bg, white text, large type.
         ═══════════════════════════════════ */}
      {cls.description && (
        <ScrollReveal><div style={{ marginBottom: "var(--gap-section)", padding: "0 var(--space-1)" }}>
          <p style={{
            margin: "0 0 var(--gap-subhead-body)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
            textTransform: "uppercase", letterSpacing: "var(--tracking-widest)",
            color: "var(--color-text-tertiary)",
          }}>
            About this class
          </p>
          <p style={{
            margin: 0, fontSize: "var(--type-lede-size)", fontWeight: "var(--type-lede-weight)",
            color: "var(--tumbo-orange)", lineHeight: "var(--type-lede-leading)",
            letterSpacing: "var(--type-lede-tracking)",
          }}>
            {cleanText(cls.description)}
          </p>
          {cls.discovered_from && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-source-pills)", marginTop: "var(--gap-label-content)" }}>
              <SourcePills discovered_from={cls.discovered_from!} variant="dark" />
            </div>
          )}
        </div></ScrollReveal>
      )}

      {/* Visual separator -- warm translucent line */}
      <div style={{ height: 1, background: "var(--color-border-subtle)", margin: "0 0 var(--gap-section)" }} />

      {/* ═══════════════════════════════════
          SECTION 2 -- What parents say (cream card)
          Editorial subheads + body, then pull quote.
         ═══════════════════════════════════ */}
      {(cls.summary || reviews.length > 0) && (
        <ScrollReveal><div style={{
          background: "var(--color-bg-card)", borderRadius: "var(--card-radius)",
          border: "var(--card-border)",
          padding: "var(--padding-card-y) var(--padding-card-x)",
          marginBottom: "var(--gap-card-stack)",
          boxShadow: "var(--card-shadow)",
        }}>
          <p style={{
            margin: "0 0 var(--gap-label-content)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
            textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
            color: "var(--color-text-tertiary)",
          }}>
            What parents say
          </p>

          {/* Star rating */}
          {googleRating != null && googleRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-source-pills)", marginBottom: "var(--gap-card-stack)" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width={18} height={18} viewBox="0 0 24 24" fill={i < Math.floor(googleRating) ? "var(--tumbo-tag-experience)" : "var(--color-shadow-sm)"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-bold)", color: "var(--tumbo-text)" }}>{googleRating.toFixed(1)}</span>
              {googleReviewCount != null && <span style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-tertiary)" }}>({googleReviewCount} reviews)</span>}
            </div>
          )}

          {/* Editorial review synthesis with bold subheads */}
          {cls.summary && <EditorialBlocks text={cleanText(cls.summary)} variant="light" />}

          {/* Pull quote -- dark editorial moment */}
          {bestQuote && (
            <div style={{
              marginTop: "var(--gap-editorial-block)",
              background: "linear-gradient(145deg, var(--tumbo-text) 0%, #292420 100%)",
              borderRadius: "var(--card-radius-inner)", padding: "var(--padding-card-y) var(--padding-card-x)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Large decorative quotation mark */}
              <span style={{
                position: "absolute", top: 4, left: 20,
                fontSize: 96, fontWeight: 700, lineHeight: 1,
                color: "rgba(255,255,255,0.06)",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}>
                &ldquo;
              </span>
              <p style={{
                margin: 0, fontSize: "var(--type-editorial-size)", fontStyle: "italic",
                color: "rgba(255,255,255,0.85)", lineHeight: "var(--leading-relaxed)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                position: "relative", zIndex: 1,
                paddingTop: "var(--space-3)",
              }}>
                {bestQuote.text.length > 280 ? bestQuote.text.substring(0, 280).trim() + "..." : bestQuote.text}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--gap-inline)", marginTop: "var(--gap-label-content)", position: "relative", zIndex: 1 }}>
                <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.2)" }} />
                <span style={{ fontSize: "var(--type-caption-size)", fontWeight: "var(--weight-semibold)", color: "rgba(255,255,255,0.5)" }}>
                  {bestQuote.author}
                </span>
                <span style={{ fontSize: "var(--type-pill-size)", color: "rgba(255,255,255,0.3)" }}>Parent, Google review</span>
              </div>
            </div>
          )}

          {/* Source pills */}
          {cls.discovered_from && (
            <div style={{ marginTop: "var(--gap-label-content)" }}>
              <SourcePills discovered_from={cls.discovered_from!} section="reviews" variant="dark" />
            </div>
          )}
        </div></ScrollReveal>
      )}

      {/* ═══════════════════════════════════
          SECTION 3 -- Who thrives here (cream card)
         ═══════════════════════════════════ */}
      {cls.typical_child_profile && (
        <ScrollReveal delay={0.05}><div style={{
          background: "var(--color-bg-card)", borderRadius: "var(--card-radius)",
          border: "var(--card-border)",
          padding: "var(--padding-card-y) var(--padding-card-x)",
          marginBottom: "var(--gap-card-stack)",
          boxShadow: "var(--card-shadow)",
        }}>
          <p style={{
            margin: "0 0 var(--gap-label-content)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
            textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
            color: "var(--color-text-tertiary)",
          }}>
            Who thrives here
          </p>
          <EditorialBlocks text={cleanText(cls.typical_child_profile)} variant="light" />

          {/* Not ideal for -- warm amber callout */}
          {cls.not_ideal_for && (
            <div style={{
              marginTop: "var(--gap-label-content)", padding: "var(--padding-callout)",
              background: "#FFF8F0",
              borderRadius: "var(--card-radius-sm)",
              borderLeft: "3px solid var(--tumbo-tag-experience)",
            }}>
              <p style={{
                margin: "0 0 var(--gap-subhead-body)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                color: "#B8860B",
              }}>
                Not ideal for
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-base)", color: "#8B7355", lineHeight: "var(--leading-relaxed)" }}>
                {cleanText(cls.not_ideal_for)}
              </p>
            </div>
          )}
        </div></ScrollReveal>
      )}

      {/* ═══════════════════════════════════
          SECTION 4 -- What to expect
         ═══════════════════════════════════ */}
      {cls.outcome_expectations && (
        <ScrollReveal delay={0.05}><div style={{
          background: "var(--color-bg-card)", borderRadius: "var(--card-radius)",
          border: "var(--card-border)",
          padding: "var(--padding-card-y) var(--padding-card-x)",
          marginBottom: "var(--gap-card-stack)",
          boxShadow: "var(--card-shadow)",
        }}>
          <p style={{
            margin: "0 0 var(--gap-card-stack)", fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)",
            textTransform: "uppercase", letterSpacing: "var(--type-label-tracking)",
            color: "var(--color-text-tertiary)",
          }}>
            What to expect
          </p>
          <NumberedBlocks text={cleanText(cls.outcome_expectations)} variant="light" />
        </div></ScrollReveal>
      )}

      {/* ═══════════════════════════════════
          SECTION 5 -- In the neighbourhood (cream card)
         ═══════════════════════════════════ */}
      <ScrollReveal delay={0.05}><NeighbourhoodCard displayAddress={displayAddress} nearbyPlaces={nearbyPlaces} /></ScrollReveal>

      {/* ═══════════════════════════════════
          SECTION 6 -- Other locations (same provider)
         ═══════════════════════════════════ */}
      {otherLocations.length > 0 && (
        <ScrollReveal delay={0.08}><OtherLocationsSection locations={otherLocations} providerName={provider?.name || cls.name} /></ScrollReveal>
      )}

      {/* ═══════════════════════════════════
          SECTION 7 -- Similar classes (open on orange)
         ═══════════════════════════════════ */}
      <ScrollReveal delay={0.1}><SimilarClassesSection classes={similarClasses} /></ScrollReveal>

      {/* Lightbox */}
      {lightboxOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-overlay)", backdropFilter: "blur(4px)" }} onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <img src={heroImage} alt={cls.name} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style>{`
        @media (max-width: 840px) {
          .explore-hero-img {
            aspect-ratio: 4/3 !important;
            max-height: 280px !important;
          }
        }
      `}</style>
    </div>
  );
}
