"use client";

import React, { useState } from "react";
import { useExplore, type ClassCardData } from "./explore-context";
import type { DBClass, Provider } from "@/lib/types/tags";
import {
  formatPrice,
  formatAgeRange,
  deriveContextualTags,
  parseGooglePlaces,
} from "@/lib/types/tags";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Dimension color palette (matches mp-card.tsx & tag-pill.tsx) */
const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  content:    { bg: "var(--tumbo-tag-content)", text: "#fff" },
  philosophy: { bg: "var(--tumbo-tag-philosophy)", text: "#fff" },
  experience: { bg: "var(--tumbo-tag-experience)", text: "var(--tumbo-text)" },
  child:      { bg: "var(--tumbo-tag-child)", text: "#fff" },
};

/* ── Info row for sidebar card — stacks on mobile ── */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mp-info-row" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--tumbo-label)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--tumbo-text)", lineHeight: 1.4 }}>
        {children}
      </span>
    </div>
  );
}

/* ── Skeleton for loading state ── */
function SidebarSkeleton() {
  return (
    <div style={{
      background: "var(--tumbo-background)", borderRadius: 20,
      border: "1px solid var(--color-border-subtle)",
      boxShadow: "0 4px 24px var(--color-shadow-md)",
      overflow: "hidden",
    }}>
      {/* Top row skeleton */}
      <div style={{ padding: "14px 16px 10px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-border-subtle)" }} />
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-border-subtle)" }} />
      </div>
      {/* Banner skeleton */}
      <div style={{ width: "100%", height: 100, background: "var(--color-border-subtle)" }} />
      {/* Body skeleton */}
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ background: "var(--color-shadow-md)", height: 24, width: "85%", borderRadius: 8, marginBottom: 10 }} />
        <div style={{ background: "var(--color-shadow-sm)", height: 12, width: "60%", borderRadius: 6, marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          <div style={{ background: "var(--color-border-subtle)", height: 22, width: 60, borderRadius: 100 }} />
          <div style={{ background: "var(--color-border-subtle)", height: 22, width: 48, borderRadius: 100 }} />
          <div style={{ background: "var(--color-border-subtle)", height: 22, width: 72, borderRadius: 100 }} />
        </div>
        <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: 16 }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ background: "var(--color-shadow-sm)", height: 10, width: 50, borderRadius: 4 }} />
              <div style={{ background: "var(--color-border-subtle)", height: 10, width: 90, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExploreSidebarDetailProps {
  fullData?: DBClass | null;
  provider?: Provider | null;
  taxonomyTags?: { slug: string; label: string; dimension: string }[];
}

export function ExploreSidebarDetail({ fullData, provider, taxonomyTags }: ExploreSidebarDetailProps) {
  const { selectedCardData, goBack } = useExplore();

  const [bookmarked, setBookmarked] = useState(false);
  const [justToggled, setJustToggled] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Neither card data nor full data — pure skeleton (direct URL visit)
  if (!selectedCardData && !fullData) {
    return <SidebarSkeleton />;
  }

  // Resolve display values with progressive enrichment
  const cls = fullData;
  const cardData = selectedCardData;

  // Title: prefer fullData, fallback to cardData
  const title = cls?.name ?? cardData?.title ?? "Loading...";

  // Provider info
  const providerName = provider?.name ?? cardData?.provider ?? null;

  // Image / acronym for banner
  const acronymSource = providerName || title;
  const acronym = acronymSource
    .split(/\s+/)
    .map((w: string) => w.charAt(0).toUpperCase())
    .slice(0, 3)
    .join("");

  // Tags: use taxonomy if available, else derive from fullData, else card tags
  const resolvedTags: { label: string; dimension: string }[] = (() => {
    if (taxonomyTags && taxonomyTags.length > 0) {
      return taxonomyTags.map((t) => ({ label: t.label, dimension: t.dimension }));
    }
    if (cls) {
      const contextualTags = deriveContextualTags(cls);
      return [
        ...(cls.category ? [{ label: cls.category, dimension: "content" }] : []),
        ...contextualTags.map((t) => ({ label: t.label, dimension: t.category })),
      ];
    }
    if (cardData?.tags && cardData.tags.length > 0) {
      return cardData.tags.map((t) => ({ label: t.label, dimension: t.dimension }));
    }
    return [];
  })();

  // Google data (enriched only)
  const googleData = provider ? parseGooglePlaces(provider.classes_scrape_source) : null;
  const googleRating = googleData?.google_rating ?? cls?.google_rating ?? (cardData?.rating || null);
  const googleReviewCount = googleData?.google_review_count ?? cls?.review_count ?? (cardData?.reviewCount || null);

  // Address, phone, website (enriched only)
  const displayAddress = cls?.location || googleData?.google_address || provider?.street_address || (cardData?.location ?? null);
  const displayPhone = (cls ? (provider?.phone || googleData?.google_phone) : null) || null;
  const googleWebsite = googleData?.google_website || null;
  const provWebsite = provider?.website || null;
  const displayWebsite = (() => {
    if (googleWebsite && !googleWebsite.includes("skoolopedia")) return googleWebsite;
    if (provWebsite && !provWebsite.includes("skoolopedia")) return provWebsite;
    return null;
  })();

  // Price
  const displayPrice = cls?.price ?? (typeof cardData?.price === "number" ? cardData.price : null);

  // Vibe line (enriched only)
  const vibeLine = cls?.vibe_line ?? null;

  // Schedule (enriched only)
  const schedule = cls?.schedule ?? null;

  // Age
  const ageMin = cls?.age_min ?? null;
  const ageMax = cls?.age_max ?? null;

  return (
    <>
      <div style={{
        background: "var(--color-bg-card)", borderRadius: "var(--card-radius)",
        border: "var(--card-border)",
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        fontFamily: PAGE_FONT,
      }}>
        {/* ── Row 1: Back / Save buttons on cream bg ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px 10px",
        }}>
          {/* Back circle button */}
          <button
            onClick={goBack}
            className="btn-press"
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--color-border-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            aria-label="Go back"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--tumbo-label)" strokeWidth={2.2} strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* + / check save toggle */}
          <button
            onClick={() => {
              setJustToggled(true);
              const next = !bookmarked;
              setBookmarked(next);
              if (next) { setShowToast(true); setTimeout(() => setShowToast(false), 2200); }
              setTimeout(() => setJustToggled(false), 600);
            }}
            className="btn-press"
            style={{
              width: 44, height: 44, borderRadius: "50%",
              border: "none",
              background: bookmarked ? "var(--tumbo-text)" : "var(--color-border-subtle)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s ease, transform 0.15s ease",
              transform: justToggled ? "scale(0.85)" : "scale(1)",
              flexShrink: 0, position: "relative",
            }}
            aria-label={bookmarked ? "Remove from saved" : "Save class"}
          >
            {/* + icon */}
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={bookmarked ? "#fff" : "var(--tumbo-label)"} strokeWidth={2.2} strokeLinecap="round"
              style={{ position: "absolute", opacity: bookmarked ? 0 : 1, transform: bookmarked ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)", transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {/* check icon */}
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={bookmarked ? "#fff" : "var(--tumbo-label)"} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", opacity: bookmarked ? 1 : 0, transform: bookmarked ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)", transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              <polyline points="4 12 9 17 20 6" />
            </svg>
          </button>
        </div>

        {/* ── Row 2: Provider logo/acronym banner ── */}
        <div style={{
          width: "100%", height: 100, background: "var(--tumbo-tag-experience)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 36, fontWeight: 700, color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.08em",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            {acronym}
          </span>
        </div>

        {/* ── Card body content ── */}
        <div style={{ padding: "20px 24px 24px" }}>

          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 600, color: "var(--tumbo-text)", lineHeight: 1.2, letterSpacing: "-0.025em" }}>
            {title}
          </h1>

          {/* "by Provider" — subtle attribution, hidden when title already contains provider name */}
          {providerName && !title.toLowerCase().includes(providerName.toLowerCase()) && (
            <p style={{
              margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: "var(--tumbo-label)",
            }}>
              by {providerName}
            </p>
          )}

          {vibeLine && (
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--tumbo-label)", fontStyle: "italic", lineHeight: 1.5 }}>
              {vibeLine.charAt(0).toUpperCase() + vibeLine.slice(1)}
            </p>
          )}

          <div className="mp-tag-row" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {resolvedTags.slice(0, 5).map((tag, idx) => {
              const colors = DIMENSION_COLORS[tag.dimension] || DIMENSION_COLORS.content;
              return (
                <span key={tag.label} className={idx >= 3 ? "mp-tag-overflow" : ""} style={{
                  padding: "6px 12px", borderRadius: 100,
                  background: colors.bg, color: colors.text,
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                  {tag.label}
                </span>
              );
            })}
            {ageMin != null && (
              <span style={{ padding: "6px 12px", borderRadius: 100, background: DIMENSION_COLORS.child.bg, color: DIMENSION_COLORS.child.text, fontSize: 11, fontWeight: 700 }}>
                {formatAgeRange(ageMin, ageMax)}
              </span>
            )}
            {resolvedTags.length > 3 && (
              <span className="mp-tag-overflow-count" style={{ fontSize: 11, color: "var(--tumbo-label)", fontWeight: 500, display: "none", alignItems: "center" }}>
                +{resolvedTags.length - 3} more
              </span>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--color-border-subtle)", marginBottom: 16 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {displayAddress && (
              <InfoRow label="Address">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--tumbo-text)", textDecoration: "underline", textDecorationColor: "var(--color-border-strong)", textUnderlineOffset: "2px" }}>
                  {displayAddress}
                </a>
              </InfoRow>
            )}
            {ageMin != null && <InfoRow label="Age Group">{formatAgeRange(ageMin, ageMax)}</InfoRow>}
            {displayPrice != null && <InfoRow label="Price">{formatPrice(displayPrice)}</InfoRow>}
            {schedule && <InfoRow label="Schedule">{schedule}</InfoRow>}
            {googleRating != null && googleRating > 0 && (
              <InfoRow label="Google Rating">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="var(--tumbo-tag-experience)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  <strong>{googleRating.toFixed(1)}</strong>
                  {googleReviewCount != null && <span style={{ color: "var(--tumbo-label)" }}>({googleReviewCount})</span>}
                </span>
                {provider && <span style={{ display: "block", fontSize: 10, color: "var(--tumbo-label)", marginTop: 1 }}>Rating for {provider.name}</span>}
              </InfoRow>
            )}
            {displayPhone && (
              <InfoRow label="Phone">
                <a href={`tel:${displayPhone}`} style={{ color: "var(--tumbo-text)", textDecoration: "none" }}>{displayPhone}</a>
              </InfoRow>
            )}
            {displayWebsite && (
              <InfoRow label="Website">
                <a href={displayWebsite} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--tumbo-orange)", fontWeight: 600, textDecoration: "none", fontSize: 13 }}>
                  {displayWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "").substring(0, 28)}
                </a>
              </InfoRow>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--color-border-subtle)" }}>
            <span style={{ fontSize: 10, color: "var(--color-neutral-300)", cursor: "pointer", letterSpacing: "0.02em" }}>Claim this listing</span>
            <span style={{ fontSize: 10, color: "var(--color-border-subtle)" }}>&middot;</span>
            <span style={{ fontSize: 10, color: "var(--color-neutral-300)", cursor: "pointer", letterSpacing: "0.02em" }}>Report</span>
          </div>
        </div>{/* end card body */}
      </div>

      {/* Toast — slides up from viewport bottom */}
      <div
        style={{
          position: "fixed",
          bottom: showToast ? "calc(32px + var(--sai-bottom, 0px))" : -60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          background: "var(--tumbo-text)",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          boxShadow: "0 8px 32px var(--color-shadow-lg)",
          transition: "bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 12 9 17 20 6" />
        </svg>
        Added to Saved Classes
      </div>

      <style>{`
        @media (min-width: 841px) {
          .mp-info-row {
            flex-direction: row !important;
            align-items: baseline !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }
          .mp-info-row > span:last-child {
            text-align: right;
            font-size: 13px !important;
          }
        }
        @media (max-width: 840px) {
          .mp-tag-overflow { display: none !important; }
          .mp-tag-overflow-count { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
