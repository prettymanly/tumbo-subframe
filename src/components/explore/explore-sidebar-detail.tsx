"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useExplore, type ClassCardData } from "./explore-context";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/ui/auth-modal";
import type { DBClass, Provider } from "@/lib/types/tags";
import {
  formatPrice,
  formatAgeRange,
  deriveContextualTags,
  parseGooglePlaces,
} from "@/lib/types/tags";



/** Dimension color palette (matches mp-card.tsx & tag-pill.tsx) */
const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  content:    { bg: "var(--tumbo-tag-content)", text: "#fff" },
  philosophy: { bg: "var(--tumbo-tag-philosophy)", text: "#fff" },
  experience: { bg: "var(--tumbo-tag-experience)", text: "var(--tumbo-text)" },
  child:      { bg: "var(--tumbo-tag-child)", text: "#fff" },
};

/* ── Contact info row — label left, value right ── */
function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--tumbo-label)", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--tumbo-text)", lineHeight: 1.4, textAlign: "right" }}>
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

  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
  // Use short name (before em dash) for sidebar display
  const fullName = cls?.name ?? cardData?.title ?? "Loading...";
  const title = fullName.split(" — ")[0].trim();

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

  // Banner image: always use orange eyes default for unclaimed listings
  // When listing is claimed, provider can upload their own banner
  const bannerSrc = "/photos/Default/Placeholder.png";

  // DP: always show acronym circle for now (claimed listings can upload their own later)
  const dpSrc = null;

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
      }}>
        {/* ── Banner image + DP overlay ── */}
        <div style={{ position: "relative", margin: "20px 20px 0" }}>
          {/* Banner — claimed listings show photo, unclaimed show placeholder */}
          <div style={{
            width: "100%", height: 140, overflow: "hidden",
            borderRadius: 16,
            background: "var(--tumbo-tag-experience)",
          }}>
            <img src={bannerSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          {/* DP circle — floats on bottom-left of banner */}
          <div style={{
            position: "absolute", bottom: -28, left: 16,
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--tumbo-tag-experience)",
            border: "3px solid var(--color-bg-card)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            {dpSrc ? (
              <img src={dpSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{
                fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.04em",
              }}>
                {acronym}
              </span>
            )}
          </div>
        </div>

        {/* ── Card body content ── */}
        <div style={{ padding: "40px 24px 28px" }}>

          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, color: "var(--tumbo-text)", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
            {title}
          </h1>

          {/* "by Provider" — subtle attribution, hidden when title already contains provider name */}
          {providerName && !title.toLowerCase().includes(providerName.toLowerCase()) && (
            <p style={{
              margin: "0 0 8px", fontSize: 12, fontWeight: 500, color: "var(--tumbo-label)",
            }}>
              by {providerName}
            </p>
          )}

          {/* Tag pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, marginBottom: 24 }}>
            {resolvedTags.slice(0, 4).map((tag) => {
              const colors = DIMENSION_COLORS[tag.dimension] || DIMENSION_COLORS.content;
              return (
                <span key={tag.label} style={{
                  padding: "7px 14px", borderRadius: 100,
                  background: colors.bg, color: colors.text,
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                  {tag.label}
                </span>
              );
            })}
            {ageMin != null && (
              <span style={{
                padding: "6px 14px", borderRadius: 100,
                background: "transparent",
                border: "1.5px solid var(--tumbo-text)",
                color: "var(--tumbo-text)",
                fontSize: 11, fontWeight: 600,
              }}>
                {formatAgeRange(ageMin, ageMax)}
              </span>
            )}
          </div>

          {/* ── Contact info ── */}
          {(displayAddress || displayPhone || displayWebsite) && (
            <>
              <div style={{ borderTop: "1px solid var(--color-border-subtle)", marginBottom: 20 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {displayAddress && (
                  <ContactRow label="Address">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--tumbo-text)", textDecoration: "none" }}>
                      {displayAddress}
                    </a>
                  </ContactRow>
                )}
                {displayPhone && (
                  <ContactRow label="Phone">
                    <a href={`tel:${displayPhone}`} style={{ color: "var(--tumbo-text)", textDecoration: "none" }}>{displayPhone}</a>
                  </ContactRow>
                )}
                {displayWebsite && (
                  <ContactRow label="Website">
                    <a href={displayWebsite} target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--tumbo-orange)", fontWeight: 600, textDecoration: "none" }}>
                      {displayWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "").substring(0, 28)}
                    </a>
                  </ContactRow>
                )}
              </div>
            </>
          )}

          {/* ── Wide bookmark button ── */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setAuthModalOpen(true);
                return;
              }
              setJustToggled(true);
              const next = !bookmarked;
              setBookmarked(next);
              if (next) { setShowToast(true); setTimeout(() => setShowToast(false), 2200); }
              setTimeout(() => setJustToggled(false), 600);
            }}
            className="btn-press"
            style={{
              width: "100%", padding: "14px 0",
              borderRadius: 12,
              border: bookmarked ? "1.5px solid var(--tumbo-text)" : "1.5px solid var(--color-border-subtle)",
              background: bookmarked ? "var(--tumbo-text)" : "transparent",
              color: bookmarked ? "#fff" : "var(--tumbo-text)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 14, fontWeight: 600,
              transition: "all 0.3s ease",
              transform: justToggled ? "scale(0.97)" : "scale(1)",
              marginTop: 24,
            }}
            aria-label={bookmarked ? "Remove from saved" : "Save class"}
          >
            {bookmarked ? (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 12 9 17 20 6" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Bookmark
              </>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
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
      {authModalOpen && typeof document !== "undefined" && createPortal(
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode="signin"
        />,
        document.body
      )}
    </>
  );
}
