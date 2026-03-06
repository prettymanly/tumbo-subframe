"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MPNavbar from "@/components/ui/mp-navbar";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DBClass,
  Provider,
  Review,
  GooglePlacesData,
  parseReviews,
  parseGooglePlaces,
  formatPrice,
  formatAgeRange,
  deriveContextualTags,
} from "@/lib/types/tags";

const PAGE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const CONTAINER_MAX = "min(1280px, calc(100% - 48px))";

/** Dimension → color palette (matches mp-card.tsx & tag-pill.tsx) */
const DIMENSION_COLORS: Record<string, { bg: string; text: string }> = {
  content:    { bg: "var(--tumbo-tag-content)", text: "#fff" },
  philosophy: { bg: "var(--tumbo-tag-philosophy)", text: "#fff" },
  experience: { bg: "var(--tumbo-tag-experience)", text: "var(--tumbo-text)" },
  child:      { bg: "var(--tumbo-tag-child)", text: "#fff" },
};

/**
 * ScrollReveal — lightweight intersection-observer fade-in-up.
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
 * MagicPath V2/V3 class detail page.
 * Editorial two-column layout: sticky left info card (beige) + scrollable right content.
 * Magazine-style typography with visual variety between sections.
 */
export function MPClassDetail({ backHref }: { backHref: string }) {
  const params = useParams();
  const classId = params.id as string;

  const [cls, setCls] = useState<DBClass | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [taxonomyTags, setTaxonomyTags] = useState<{ slug: string; label: string; dimension: string }[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [justToggled, setJustToggled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Record<string, { name: string; placeId?: string; distanceMeters?: number | null; googleMapsUri?: string | null }[]> | null>(null);
  const [similarClasses, setSimilarClasses] = useState<{ id: string; name: string; photo_url?: string; category?: string; provider_name?: string; shared_tags: number }[]>([]);
  const [otherLocations, setOtherLocations] = useState<{ id: string; name: string; photo_url?: string; location?: string }[]>([]);

  useEffect(() => {
    async function fetchClass() {
      if (!classId) return;
      const supabase = supabaseBrowser();
      try {

      const { data: classData, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error || !classData) { setNotFound(true); setLoading(false); return; }
      setCls(classData);

      if (classData.provider_id) {
        const { data: providerData } = await supabase
          .from("providers")
          .select("*")
          .eq("id", classData.provider_id)
          .single();
        setProvider(providerData || null);

        // ── Other locations: sibling classes from the same provider ──
        const { data: siblingClasses } = await supabase
          .from("classes")
          .select("id, name, photo_url, location")
          .eq("provider_id", classData.provider_id)
          .eq("is_placeholder", false)
          .neq("id", classData.id)
          .limit(10);
        if (siblingClasses && siblingClasses.length > 0) {
          setOtherLocations(siblingClasses.map((c) => ({
            id: c.id,
            name: c.name,
            photo_url: c.photo_url ?? undefined,
            location: c.location ?? undefined,
          })));
        }
      }

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
        setTaxonomyTags(resolved);

        // ── Similar classes via shared taxonomy tags ──
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
                .select("id, name, photo_url, category, provider_id")
                .in("id", topIds)
                .eq("is_placeholder", false);

              if (simClasses && simClasses.length > 0) {
                foundSimilar = true;
                const providerIds = [...new Set(simClasses.map((c) => c.provider_id).filter(Boolean))] as string[];
                let provMap = new Map<string, string>();
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
                }));
                enriched.sort((a, b) => b.shared_tags - a.shared_tags);
                setSimilarClasses(enriched);
              }
            }
          }
        }
      }

      // ── Fallback: same category (when taxonomy tags yielded nothing) ──
      if (!foundSimilar && classData.category) {
        const { data: catClasses } = await supabase
          .from("classes")
          .select("id, name, photo_url, category, provider_id")
          .eq("category", classData.category)
          .eq("is_placeholder", false)
          .neq("id", classData.id)
          .limit(6);

        if (catClasses && catClasses.length > 0) {
          const providerIds = [...new Set(catClasses.map((c) => c.provider_id).filter(Boolean))] as string[];
          let provMap = new Map<string, string>();
          if (providerIds.length > 0) {
            const { data: provRows } = await supabase
              .from("providers")
              .select("id, name")
              .in("id", providerIds);
            if (provRows) provRows.forEach((p) => provMap.set(p.id, p.name));
          }

          setSimilarClasses(catClasses.map((c) => ({
            id: c.id,
            name: c.name,
            photo_url: c.photo_url ?? undefined,
            category: c.category ?? undefined,
            provider_name: c.provider_id ? provMap.get(c.provider_id) : undefined,
            shared_tags: 0,
          })));
        }
      }

      // ── Nearby places from provider JSON column ──
      if (classData.provider_id) {
        // Provider already fetched above — check for nearby_places JSON
        const provRaw = await supabase
          .from("providers")
          .select("nearby_places")
          .eq("id", classData.provider_id)
          .single();
        if (provRaw.data?.nearby_places && typeof provRaw.data.nearby_places === "object") {
          setNearbyPlaces(provRaw.data.nearby_places as Record<string, { name: string; placeId?: string; distanceMeters?: number | null; googleMapsUri?: string | null }[]>);
        }
      }

      setLoading(false);
      } catch (err) {
        console.error("[MPClassDetail] fetchClass error:", err);
        setLoading(false);
      }
    }
    fetchClass();
  }, [classId]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !cls) {
    return (
      <div style={{ fontFamily: PAGE_FONT, background: "var(--tumbo-orange)", minHeight: "100vh" }}>
        <MPNavbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>Class not found</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", margin: "0 0 24px" }}>This class may have been removed or the link is incorrect.</p>
          <Link href={backHref} style={{ display: "inline-block", padding: "12px 28px", borderRadius: 100, background: "var(--color-bg-card)", color: "var(--tumbo-orange)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Browse all classes
          </Link>
        </div>
      </div>
    );
  }

  const reviews = parseReviews(cls.raw_reviews);
  const heroImage = (cls.photo_url && !cls.photo_url.includes("places.googleapis.com"))
    ? cls.photo_url
    : "/photos/Default/Placeholder.png";
  const contextualTags = deriveContextualTags(cls);
  const googleData = parseGooglePlaces(provider?.classes_scrape_source);
  const googleRating = googleData?.google_rating ?? cls.google_rating ?? null;
  const googleReviewCount = googleData?.google_review_count ?? cls.review_count ?? null;
  const displayAddress = cls.location || googleData?.google_address || provider?.street_address || null;
  const displayPhone = provider?.phone || googleData?.google_phone || null;
  const googleWebsite = googleData?.google_website || null;
  const provWebsite = provider?.website || null;
  const displayWebsite = (() => {
    if (googleWebsite && !googleWebsite.includes("skoolopedia")) return googleWebsite;
    if (provWebsite && !provWebsite.includes("skoolopedia")) return provWebsite;
    return null;
  })();

  const resolvedTags: { label: string; dimension: string }[] = taxonomyTags.length > 0
    ? taxonomyTags.map((t) => ({ label: t.label, dimension: t.dimension }))
    : [
        ...(cls.category ? [{ label: cls.category, dimension: "content" }] : []),
        ...contextualTags.map((t) => ({ label: t.label, dimension: t.category })),
      ];

  // Best review quote for pull-quote treatment
  const bestQuote = reviews
    .filter((r) => r.text.length > 60)
    .sort((a, b) => b.text.length - a.text.length)[0] || null;

  return (
    <div style={{ fontFamily: PAGE_FONT, background: "var(--tumbo-orange)", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <MPNavbar />

      {/* ═══════ CENTERED CONTAINER ═══════ */}
      <div style={{ maxWidth: CONTAINER_MAX, margin: "0 auto", padding: "24px 0 0" }}>

        {/* ═══════ TWO-COLUMN FLEX LAYOUT (flex for reliable sticky — matches V1) ═══════ */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }} className="mp-detail-grid">

          {/* ══════════════════════════════════════════
              LEFT SIDEBAR: beige info card (sticky)
              Sticky on the aside itself — flex child with
              align-self:start can stick within the flex row.
             ══════════════════════════════════════════ */}
          <aside style={{ position: "sticky", top: 96, width: 340, flexShrink: 0, alignSelf: "flex-start" }}>
            <div style={{
              background: "var(--tumbo-background)", borderRadius: 20,
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "0 4px 24px var(--color-shadow-md)",
              overflow: "hidden",
            }}>
              {/* ── Row 1: Back / Save buttons on cream bg ── */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px 10px",
              }}>
                {/* Back circle button */}
                <Link href={backHref} style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--color-border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.2s ease",
                }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth={2.2} strokeLinecap="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </Link>

                {/* + / ✓ save toggle */}
                <button
                  onClick={() => {
                    setJustToggled(true);
                    const next = !bookmarked;
                    setBookmarked(next);
                    if (next) { setShowToast(true); setTimeout(() => setShowToast(false), 2200); }
                    setTimeout(() => setJustToggled(false), 600);
                  }}
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
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={bookmarked ? "#fff" : "var(--color-text-secondary)"} strokeWidth={2.2} strokeLinecap="round"
                    style={{ position: "absolute", opacity: bookmarked ? 0 : 1, transform: bookmarked ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)", transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {/* ✓ icon */}
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={bookmarked ? "#fff" : "var(--color-text-secondary)"} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "absolute", opacity: bookmarked ? 1 : 0, transform: bookmarked ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)", transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                    <polyline points="4 12 9 17 20 6" />
                  </svg>
                </button>
              </div>

              {/* ── Row 2: Provider logo/acronym banner ── */}
              {(() => {
                const acronym = (provider?.name || cls.name).split(/\s+/).map((w: string) => w.charAt(0).toUpperCase()).slice(0, 3).join("");
                return (
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
                );
              })()}

              {/* ── Card body content ── */}
              <div style={{ padding: "20px 24px 24px" }}>

              <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 600, color: "var(--tumbo-text)", lineHeight: 1.2, letterSpacing: "-0.025em" }}>
                {cls.name}
              </h1>

              {/* "by Provider" — subtle attribution */}
              {provider && (
                <Link href={`/providers/${provider.id}`} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 500, color: "var(--tumbo-label)",
                  textDecoration: "none", marginBottom: 6,
                  transition: "color 0.15s",
                }}>
                  by {provider.name}
                  <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ opacity: 0.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {cls.vibe_line && (
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
                  {cls.vibe_line.charAt(0).toUpperCase() + cls.vibe_line.slice(1)}
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
                {cls.age_min != null && (
                  <span style={{ padding: "6px 12px", borderRadius: 100, background: DIMENSION_COLORS.child.bg, color: DIMENSION_COLORS.child.text, fontSize: 11, fontWeight: 700 }}>
                    {formatAgeRange(cls.age_min, cls.age_max)}
                  </span>
                )}
                {resolvedTags.length > 3 && (
                  <span className="mp-tag-overflow-count" style={{ fontSize: 11, color: "var(--tumbo-label)", fontWeight: 500, display: "none", alignItems: "center" }}>
                    +{resolvedTags.length - 3} more
                  </span>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--color-shadow-md)", marginBottom: 16 }} />

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
                {cls.age_min != null && <InfoRow label="Age Group">{formatAgeRange(cls.age_min, cls.age_max)}</InfoRow>}
                {cls.price != null && <InfoRow label="Price">{formatPrice(cls.price)}</InfoRow>}
                {cls.schedule && <InfoRow label="Schedule">{cls.schedule}</InfoRow>}
                {googleRating != null && googleRating > 0 && (
                  <InfoRow label="Google Rating">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="var(--tumbo-tag-experience)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <strong>{googleRating.toFixed(1)}</strong>
                      {googleReviewCount != null && <span style={{ color: "var(--color-text-secondary)" }}>({googleReviewCount})</span>}
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
                <span style={{ fontSize: 10, color: "var(--tumbo-label)", cursor: "pointer", letterSpacing: "0.02em" }}>Claim this listing</span>
                <span style={{ fontSize: 10, color: "var(--color-border-subtle)" }}>·</span>
                <span style={{ fontSize: 10, color: "var(--tumbo-label)", cursor: "pointer", letterSpacing: "0.02em" }}>Report</span>
              </div>
              </div>{/* end card body */}
            </div>
          </aside>

          {/* ══════════════════════════════════════════
              RIGHT CONTENT — editorial magazine layout
             ══════════════════════════════════════════ */}
          <main style={{ flex: 1, minWidth: 0, padding: "12px 0 80px" }}>

            {/* ── Hero image ── */}
            <div
              style={{
                borderRadius: 20, overflow: "hidden", position: "relative",
                cursor: "pointer", marginBottom: 36,
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={heroImage}
                alt={cls.name}
                className="mp-hero-img"
                style={{
                  width: "100%", height: "auto", aspectRatio: "16/9", maxHeight: 420,
                  objectFit: "cover", display: "block",
                  transition: "transform 0.6s cubic-bezier(0.25,0.1,0.25,1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
              />
            </div>

            {/* ═════════════════════════════════════
                SECTION 1 — About (the editorial lede)
                Open on orange bg, white text, large type.
                Like a Monocle feature opening.
               ═════════════════════════════════════ */}
            {cls.description && (
              <ScrollReveal><div style={{ marginBottom: 36, padding: "0 4px" }}>
                <p style={{
                  margin: "0 0 8px", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: "#fff",
                }}>
                  About this class
                </p>
                <p style={{
                  margin: 0, fontSize: 22, fontWeight: 400,
                  color: "rgba(255,255,255,0.92)", lineHeight: 1.55,
                  letterSpacing: "-0.01em",
                }}>
                  {cleanText(cls.description)}
                </p>
                {(cls as Record<string, unknown>).discovered_from && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
                    <SourcePills discovered_from={(cls as Record<string, unknown>).discovered_from as string} variant="light" />
                  </div>
                )}
              </div></ScrollReveal>
            )}

            {/* Visual separator — warm translucent line */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "0 0 36px" }} />

            {/* ═════════════════════════════════════
                SECTION 2 — What parents say (cream card)
                Editorial subheads + body, then pull quote.
               ═════════════════════════════════════ */}
            {(cls.summary || reviews.length > 0) && (
              <ScrollReveal><div style={{
                background: "var(--tumbo-background)", borderRadius: 20,
                border: "1px solid var(--color-border-subtle)",
                padding: "36px 36px 32px",
                marginBottom: 24,
                boxShadow: "0 2px 16px var(--color-shadow-sm)",
              }}>
                <p style={{
                  margin: "0 0 20px", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "var(--tumbo-label)",
                }}>
                  What parents say
                </p>

                {/* Star rating */}
                {googleRating != null && googleRating > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width={18} height={18} viewBox="0 0 24 24" fill={i < Math.floor(googleRating) ? "var(--tumbo-tag-experience)" : "var(--color-shadow-md)"}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--tumbo-text)" }}>{googleRating.toFixed(1)}</span>
                    {googleReviewCount != null && <span style={{ fontSize: 13, color: "var(--tumbo-label)" }}>({googleReviewCount} reviews)</span>}
                  </div>
                )}

                {/* Editorial review synthesis with bold subheads */}
                {cls.summary && <EditorialBlocks text={cleanText(cls.summary)} />}

                {/* ── Pull quote — dark editorial moment ── */}
                {bestQuote && (
                  <div style={{
                    marginTop: 28,
                    background: "linear-gradient(145deg, var(--tumbo-text) 0%, var(--color-neutral-800) 100%)",
                    borderRadius: 16, padding: "36px 36px 30px",
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
                      margin: 0, fontSize: 18, fontStyle: "italic",
                      color: "rgba(255,255,255,0.85)", lineHeight: 1.6,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      position: "relative", zIndex: 1,
                      paddingTop: 12,
                    }}>
                      {bestQuote.text.length > 280 ? bestQuote.text.substring(0, 280).trim() + "..." : bestQuote.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, position: "relative", zIndex: 1 }}>
                      <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.2)" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                        {bestQuote.author}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Parent, Google review</span>
                    </div>
                  </div>
                )}

                {/* Source pills */}
                {(cls as Record<string, unknown>).discovered_from && (
                  <div style={{ marginTop: 20 }}>
                    <SourcePills discovered_from={(cls as Record<string, unknown>).discovered_from as string} section="reviews" variant="dark" />
                  </div>
                )}
              </div></ScrollReveal>
            )}

            {/* ═════════════════════════════════════
                SECTION 3 — Who thrives here (cream card)
               ═════════════════════════════════════ */}
            {cls.typical_child_profile && (
              <ScrollReveal delay={0.05}><div style={{
                background: "var(--tumbo-background)", borderRadius: 20,
                border: "1px solid var(--color-border-subtle)",
                padding: "36px 36px 32px",
                marginBottom: 24,
                boxShadow: "0 2px 16px var(--color-shadow-sm)",
              }}>
                <p style={{
                  margin: "0 0 18px", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "var(--tumbo-label)",
                }}>
                  Who thrives here
                </p>
                <EditorialBlocks text={cleanText(cls.typical_child_profile)} variant="light" />

                {/* Not ideal for — warm amber callout */}
                {cls.not_ideal_for && (
                  <div style={{
                    marginTop: 20, padding: "16px 18px",
                    background: "#FFF8F0",
                    borderRadius: 14,
                    borderLeft: "3px solid var(--tumbo-tag-experience)",
                  }}>
                    <p style={{
                      margin: "0 0 6px", fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      color: "#B8860B",
                    }}>
                      Not ideal for
                    </p>
                    <p style={{ margin: 0, fontSize: 14, color: "#8B7355", lineHeight: 1.65 }}>
                      {cleanText(cls.not_ideal_for)}
                    </p>
                  </div>
                )}
              </div></ScrollReveal>
            )}

            {/* ═════════════════════════════════════
                SECTION 4 — What to expect
                Open on orange, white text — visual rhythm
                alternation (card → open → card → open)
               ═════════════════════════════════════ */}
            {cls.outcome_expectations && (
              <ScrollReveal delay={0.05}><div style={{
                background: "var(--tumbo-background)", borderRadius: 20,
                border: "1px solid var(--color-border-subtle)",
                padding: "36px 36px 32px",
                marginBottom: 24,
                boxShadow: "0 2px 16px var(--color-shadow-sm)",
              }}>
                <p style={{
                  margin: "0 0 24px", fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "var(--tumbo-label)",
                }}>
                  What to expect
                </p>
                <NumberedBlocks text={cleanText(cls.outcome_expectations)} variant="light" />
              </div></ScrollReveal>
            )}

            {/* ═════════════════════════════════════
                SECTION 5 — In the neighbourhood (cream card)
               ═════════════════════════════════════ */}
            <ScrollReveal delay={0.05}><NeighbourhoodCard displayAddress={displayAddress} nearbyPlaces={nearbyPlaces} /></ScrollReveal>

            {/* ═════════════════════════════════════
                SECTION 6 — Other locations (same provider)
               ═════════════════════════════════════ */}
            {otherLocations.length > 0 && (
              <ScrollReveal delay={0.08}><OtherLocationsSection locations={otherLocations} providerName={provider?.name || cls.name} backHref={backHref} /></ScrollReveal>
            )}

            {/* ═════════════════════════════════════
                SECTION 7 — Similar classes (open on orange)
               ═════════════════════════════════════ */}
            <ScrollReveal delay={0.1}><SimilarClassesSection classes={similarClasses} backHref={backHref} /></ScrollReveal>

          </main>
        </div>
      </div>

      {/* ═══════ Toast — slides up from viewport bottom ═══════ */}
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(28,25,23,0.9)", backdropFilter: "blur(4px)" }} onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <img src={heroImage} alt={cls.name} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}


      <style>{`
        @media (max-width: 840px) {
          .mp-detail-grid {
            flex-direction: column !important;
            gap: 16px !important;
            padding: 0 16px !important;
          }
          .mp-detail-grid > aside {
            position: relative !important;
            top: auto !important;
            width: 100% !important;
            flex-shrink: 1 !important;
          }
          .mp-detail-grid > main {
            padding-top: 0 !important;
          }
          .mp-hero-img {
            aspect-ratio: 4/3 !important;
            max-height: 280px !important;
          }
          .mp-tag-overflow { display: none !important; }
          .mp-tag-overflow-count { display: inline-flex !important; }
        }
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
      `}</style>
    </div>
  );
}

/* ── Info row for left sidebar card — stacks on mobile ── */
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

/**
 * Editorial blocks: pairs short lines (subheads) with their following paragraphs.
 *
 * AI-generated summaries store content as alternating short/long blocks
 * separated by \n\n. A short block (≤80 chars) followed by a long block
 * is a subhead→body pair. Renders subheads as bold 16px with tight 6px
 * coupling to body, 28px breathing room above.
 */
function EditorialBlocks({ text, variant = "dark" }: { text: string; variant?: "dark" | "light" }) {
  const subheadColor = variant === "dark" ? "#fff" : "var(--tumbo-text)";
  const bodyColor = variant === "dark" ? "#fff" : "var(--color-text-secondary)";
  const bodySize = variant === "dark" ? 18 : 15;
  const subheadSize = variant === "dark" ? 18 : 15;
  const subheadWeight = variant === "dark" ? 400 : 500;

  const raw = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const SUBHEAD_MAX = 100;

  // Build pairs: group short block + next long block as subhead→body
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
        <div key={i} style={{ marginTop: nodes.length > 0 ? 28 : 0 }}>
          <p style={{ margin: "0 0 6px", fontSize: subheadSize, fontWeight: subheadWeight, color: subheadColor, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
            {subhead}
          </p>
          <p style={{ margin: 0, fontSize: bodySize, fontWeight: 400, color: bodyColor, lineHeight: 1.7 }}>{body}</p>
        </div>
      );
      i += 1;
      continue;
    }

    // Pattern 2: short standalone block followed by a longer block → subhead + body
    if (block.length <= SUBHEAD_MAX && nextBlock && nextBlock.length > SUBHEAD_MAX) {
      nodes.push(
        <div key={i} style={{ marginTop: nodes.length > 0 ? 28 : 0 }}>
          <p style={{ margin: "0 0 6px", fontSize: subheadSize, fontWeight: subheadWeight, color: subheadColor, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
            {block}
          </p>
          <p style={{ margin: 0, fontSize: bodySize, fontWeight: 400, color: bodyColor, lineHeight: 1.7 }}>{nextBlock}</p>
        </div>
      );
      i += 2; // skip both blocks
      continue;
    }

    // Plain body paragraph
    nodes.push(
      <p key={i} style={{ margin: 0, marginTop: nodes.length > 0 ? 16 : 0, fontSize: bodySize, fontWeight: 400, color: bodyColor, lineHeight: 1.7 }}>
        {block}
      </p>
    );
    i += 1;
  }

  return <div>{nodes}</div>;
}

/**
 * Numbered editorial blocks — poster-style oversized numerals.
 * Parses AI text into numbered items with optional subheads.
 * Numbers rendered in large serif at ~3 lines height for graphic editorial feel.
 */
function NumberedBlocks({ text, variant = "dark" }: { text: string; variant?: "dark" | "light" }) {
  const subheadColor = variant === "dark" ? "#fff" : "var(--tumbo-text)";
  const bodyColor = variant === "dark" ? "#fff" : "var(--color-text-secondary)";
  const numeralColor = variant === "dark" ? "rgba(255,255,255,0.15)" : "var(--color-shadow-sm)";
  const bodySize = variant === "dark" ? 18 : 15;
  const subheadSize = variant === "dark" ? 18 : 15;
  const subheadWeight = variant === "dark" ? 400 : 500;

  const raw = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const SUBHEAD_MAX = 100;

  // Parse into items: { subhead?, body }
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

    // Pattern 2: short block + longer block → subhead + body
    if (stripped.length <= SUBHEAD_MAX && nextBlock && nextBlock.length > SUBHEAD_MAX) {
      items.push({
        subhead: stripped,
        body: nextBlock.replace(/^\d+[\.\)\-]\s*/, ""),
      });
      i += 2;
      continue;
    }

    // Plain paragraph — becomes a body-only item
    items.push({ body: stripped });
    i += 1;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: "grid",
            gridTemplateColumns: "52px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Poster-scale serif numeral — spans ~3 lines of body text */}
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
                  margin: "0 0 6px",
                  fontSize: subheadSize,
                  fontWeight: subheadWeight,
                  color: subheadColor,
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                }}
              >
                {item.subhead}
              </p>
            )}
            <p
              style={{
                margin: 0,
                fontSize: bodySize,
                fontWeight: 400,
                color: bodyColor,
                lineHeight: 1.7,
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
          margin: "0 0 8px", fontSize: 9, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
          color: isLight ? "rgba(255,255,255,0.4)" : "var(--tumbo-label)",
        }}>
          Written based on these sources
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {sources.map((s: string, i: number) => (
            <span key={i} style={{
              padding: "4px 10px", borderRadius: 100,
              border: isLight ? "1px solid rgba(255,255,255,0.5)" : "1px solid var(--color-shadow-lg)",
              fontSize: 11, fontWeight: 500,
              color: isLight ? "#fff" : "var(--color-text-secondary)",
              textTransform: "uppercase", letterSpacing: "0.04em",
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

/* ── Neighbourhood section — tabbed nearby places ── */
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
      background: "var(--tumbo-background)", borderRadius: 20,
      border: "1px solid var(--color-border-subtle)",
      padding: "36px 36px 32px",
      marginBottom: 24,
      boxShadow: "0 2px 16px var(--color-shadow-sm)",
    }}>
      <p style={{
        margin: "0 0 20px", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: "var(--tumbo-label)",
      }}>
        In the neighbourhood
      </p>

      {displayAddress && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: hasTabs ? 24 : 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "rgba(255,68,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--tumbo-orange)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500, color: "var(--tumbo-text)", lineHeight: 1.4 }}>
              {displayAddress}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--tumbo-orange)", textDecoration: "none" }}
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      )}

      {hasTabs && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {NEIGHBOURHOOD_TABS
              .filter((t) => Array.isArray(nearbyPlaces?.[t.key]) && nearbyPlaces[t.key]!.length > 0)
              .map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 100, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
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
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "10px 0",
                borderBottom: idx < Math.min(activePlaces.length, 5) - 1 ? "1px solid var(--color-border-subtle)" : "none",
              }}>
                {place.googleMapsUri ? (
                  <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, fontWeight: 500, color: "var(--tumbo-text)", textDecoration: "none", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {place.name}
                  </a>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--tumbo-text)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {place.name}
                  </span>
                )}
                {place.distanceMeters != null && (
                  <span style={{ fontSize: 12, color: "var(--tumbo-label)", whiteSpace: "nowrap", flexShrink: 0 }}>
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

/* ── Other locations — sibling classes from the same provider ── */
function OtherLocationsSection({
  locations,
  providerName,
  backHref,
}: {
  locations: { id: string; name: string; photo_url?: string; location?: string }[];
  providerName: string;
  backHref: string;
}) {
  if (locations.length === 0) return null;
  const basePath = backHref;

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        margin: "0 0 20px", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: "#fff",
        padding: "0 4px",
      }}>
        Other {providerName} classes
      </p>

      <div
        className="other-locations-scroll"
        style={{
          display: "flex", gap: 16, overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"],
        }}
      >
        {locations.map((loc) => {
          const img = (loc.photo_url && !loc.photo_url.includes("places.googleapis.com"))
            ? loc.photo_url
            : "/photos/Default/Placeholder.png";
          return (
            <SimilarCard
              key={loc.id}
              cls={{ name: loc.name, photo_url: loc.photo_url, category: loc.location, provider_name: undefined }}
              img={img}
              href={`${basePath}/${loc.id}`}
            />
          );
        })}
      </div>

      <style>{`
        .other-locations-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ── Similar classes — horizontal scroll, V2 MPCard style ── */
function SimilarClassesSection({
  classes,
  backHref,
}: {
  classes: { id: string; name: string; photo_url?: string; category?: string; provider_name?: string; shared_tags: number }[];
  backHref: string;
}) {
  if (classes.length === 0) return null;
  const basePath = backHref;

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        margin: "0 0 20px", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: "#fff",
        padding: "0 4px",
      }}>
        You might also like
      </p>

      <div
        className="similar-scroll"
        style={{
          display: "flex", gap: 16, overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
          msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"],
        }}
      >
        {classes.map((c) => {
          const img = (c.photo_url && !c.photo_url.includes("places.googleapis.com"))
            ? c.photo_url
            : "/photos/Default/Placeholder.png";
          return (
            <SimilarCard key={c.id} cls={c} img={img} href={`${basePath}/${c.id}`} />
          );
        })}
      </div>

      <style>{`
        .similar-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/** Single card in "You might also like" — matches V2 MPCard visual language */
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
        borderRadius: 20, overflow: "hidden",
        display: "flex", flexDirection: "column",
        background: hovered ? "var(--tumbo-orange)" : "var(--color-bg-card)",
        border: hovered ? "1px solid var(--tumbo-orange)" : "1px solid var(--color-shadow-md)",
        fontFamily: PAGE_FONT,
        animation: hovered ? "simCardBounce 0.25s cubic-bezier(0.22, 0.68, 0.31, 1.2)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image — 16:10 aspect, matching MPCard */}
      <div style={{ aspectRatio: "16/10", overflow: "hidden", flexShrink: 0, background: "#f5f0eb" }}>
        <img
          src={img}
          alt={cls.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Content — matching MPCard padding & typography */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {/* Provider name */}
        {cls.provider_name && (
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 500,
            color: hovered ? "rgba(255,255,255,0.7)" : "var(--color-text-secondary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {cls.provider_name}
          </p>
        )}

        {/* Class name */}
        <p style={{
          margin: 0, fontSize: 15, fontWeight: 600,
          color: hovered ? "#fff" : "var(--color-text-primary)",
          lineHeight: 1.25, letterSpacing: "-0.01em",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {cls.name}
        </p>

        {/* Category */}
        {cls.category && (
          <p style={{
            margin: "4px 0 0", fontSize: 11, fontWeight: 500,
            color: hovered ? "rgba(255,255,255,0.65)" : "var(--color-text-secondary)",
          }}>
            {cls.category}
          </p>
        )}
      </div>

      <style>{`
        @keyframes simCardBounce {
          0%   { transform: translateY(0); }
          20%  { transform: translateY(-3px); }
          55%  { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </a>
  );
}

/* ── Loading skeleton ── */
function DetailSkeleton() {
  return (
    <div style={{ fontFamily: PAGE_FONT, background: "var(--tumbo-orange)", minHeight: "100vh" }}>
      <MPNavbar />
      <div style={{ maxWidth: CONTAINER_MAX, margin: "0 auto", padding: "24px 0 0" }}>
        <div className="mp-detail-grid" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <aside style={{ width: 340, flexShrink: 0 }}>
            <div style={{ background: "var(--tumbo-background)", borderRadius: 20, padding: 28, border: "1px solid var(--color-border-subtle)" }}>
              <div style={{ background: "var(--color-border-subtle)", height: 12, width: "40%", borderRadius: 6, marginBottom: 16 }} />
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
          </aside>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ borderRadius: 20, background: "rgba(255,255,255,0.12)", height: 420, marginBottom: 32 }} />
            <div style={{ background: "rgba(255,255,255,0.06)", height: 16, width: "30%", borderRadius: 6, marginBottom: 12 }} />
            <div style={{ background: "rgba(255,255,255,0.08)", height: 100, borderRadius: 8, marginBottom: 32 }} />
            <div style={{ background: "rgba(255,255,255,0.08)", height: 240, borderRadius: 20 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
