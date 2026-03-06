"use client"

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ClassPlaceholder } from "@/components/ui/class-placeholder"
import type { WarmTag, TagDimension } from "@/lib/rails/types"

// ── Dimension → solid color (matches TagPill from V1) ──
const DIMENSION_COLORS: Record<TagDimension, string> = {
  content: "var(--tumbo-tag-content)",
  philosophy: "var(--tumbo-tag-philosophy)",
  experience: "var(--tumbo-tag-experience)",
  child: "var(--tumbo-tag-child)",
}

// ── Dimension icons (same SVGs as tag-pill.tsx) ──
function ContentIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <circle cx={12} cy={12} r={2} fill="currentColor" opacity={0.4} />
      <rect x={11.2} y={1} width={1.6} height={3} rx={0.8} />
      <rect x={11.2} y={20} width={1.6} height={3} rx={0.8} />
      <rect x={1} y={11.2} width={3} height={1.6} rx={0.8} />
      <rect x={20} y={11.2} width={3} height={1.6} rx={0.8} />
    </svg>
  )
}

function PhilosophyIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function ExperienceIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ChildIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

const DIMENSION_ICONS: Record<TagDimension, React.FC<{ size?: number }>> = {
  content: ContentIcon,
  philosophy: PhilosophyIcon,
  experience: ExperienceIcon,
  child: ChildIcon,
}

// ── Sentence case helper ──
function toSentenceCase(str: string): string {
  if (!str) return str
  return str
    .split(/([.!?]\s+)/)
    .map((segment, i) => {
      if (i === 0 || /^[.!?]\s+$/.test(segment)) {
        if (i === 0) return segment.charAt(0).toUpperCase() + segment.slice(1)
        return segment
      }
      return segment.charAt(0).toUpperCase() + segment.slice(1)
    })
    .join("")
}

// ── Simplify verbose listing names ──
// "MindChamps PreSchool @ Buangkok (Serangoon North)" → "MindChamps PreSchool, Buangkok"
// "Tennis Lessons Singapore | Group Tennis Classes | Spin Tennis" → "Tennis Lessons Singapore"
// "ULC Academy - English School in Singapore (Orchard) | Adults & Kids" → "ULC Academy"
function simplifyTitle(name: string): string {
  let n = name
  // 1. Pipe-separated: take first segment (brand)
  if (n.includes("|")) n = n.split("|")[0].trim()
  // 2. Long dash-separated: keep first part if it's a meaningful name (≥6 chars)
  const dashParts = n.split(/\s+[-–—]\s+/)
  if (dashParts.length > 1 && dashParts[0].length >= 6) n = dashParts[0]
  // 3. Remove parenthetical qualifiers
  n = n.replace(/\s*\([^)]*\)\s*/g, "").trim()
  // 4. Replace " @ " with ", "
  n = n.replace(/\s*@\s*/g, ", ")
  return n
}

// V3 pill colors (kept separate for V3 variant)
const PILL_COLORS_V3 = ["var(--tumbo-tag-content)", "var(--tumbo-tag-experience)", "var(--tumbo-tag-philosophy)", "var(--tumbo-tag-child)"]

// ── Fixed card dimensions ──
const CARD_W = 280
const CARD_H = 315     // total card height — room for title+summary+pills+breathing
const IMAGE_H = 185    // fixed image height (image-forward, less text at rest)
const PAD = 16         // internal padding
const FEATURED_W = 520
const FEATURED_H = 315

export interface MPCardProps {
  id: string
  title: string
  provider?: string
  summary?: string
  image?: string
  tags?: WarmTag[]
  location?: string
  price?: number | string
  href: string
  /** "v2" = dimension-colored pills with icons, "v3" = solid color pills */
  variant?: "v2" | "v3"
  /** Larger card for featured rail */
  featured?: boolean
  /** Masonry mode: fills column width, natural height, no summary clamp */
  masonry?: boolean
  /** Category string for placeholder generation, e.g. "Art studio" */
  category?: string
  /** Age range string, e.g. "3–8 yrs" — shown as first outlined pill */
  ageRange?: string
  /** Best parent review quote — shown in hover reveal */
  parentQuote?: string
}

export const MPCard = React.memo(function MPCard({
  id,
  title,
  provider,
  summary,
  image,
  tags = [],
  location,
  price,
  href,
  variant = "v2",
  featured = false,
  masonry = false,
  category,
  ageRange,
  parentQuote,
}: MPCardProps) {
  const [hovered, setHovered] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [justToggled, setJustToggled] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const [revealH, setRevealH] = useState(0)

  // Measure reveal content height for slide-up animation
  useLayoutEffect(() => {
    if (revealRef.current) {
      setRevealH(revealRef.current.offsetHeight)
    }
  }, [parentQuote, location])

  // Subtle click sound
  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const t = ctx.currentTime
      const len = Math.ceil(ctx.sampleRate * 0.012)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1)
      const src = ctx.createBufferSource()
      src.buffer = buf
      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.value = 2400
      filter.Q.value = 1.2
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012)
      src.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      src.start(t)
      src.stop(t + 0.012)
    } catch {}
  }, [])

  // Subtle whoosh sound
  const playWhoosh = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const t = ctx.currentTime
      const len = Math.ceil(ctx.sampleRate * 0.15)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1)
      const src = ctx.createBufferSource()
      src.buffer = buf
      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.setValueAtTime(400, t)
      filter.frequency.exponentialRampToValueAtTime(3000, t + 0.12)
      filter.Q.value = 2
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.08, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      src.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      src.start(t)
      src.stop(t + 0.15)
    } catch {}
  }, [])

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  const effectiveFeatured = featured && !isMobile
  const isFixedSize = true   // always enforce uniform height
  const cardWidth = masonry ? undefined : effectiveFeatured ? FEATURED_W : CARD_W
  const cardHeight = effectiveFeatured ? FEATURED_H : CARD_H
  const imgH = effectiveFeatured ? 155 : IMAGE_H
  const titleSize = masonry ? 15 : effectiveFeatured ? 18 : 14

  const priceDisplay =
    typeof price === "number"
      ? price > 0
        ? `From $${price}`
        : "Free"
      : price || ""

  // ── Hover: minimal, confident — no bg shift, no heavy shadow ──
  const bg = "var(--color-bg-card)"
  const titleColor = "var(--color-text-primary)"
  const summaryColor = "var(--color-text-secondary)"
  const footerBorder = "var(--color-border-subtle)"
  const priceColor = "var(--color-text-secondary)"
  const CARD_TRANSITION = "border-color 0.2s ease, transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)"

  // Display values
  const displayTitle = simplifyTitle(title)
  const displaySummary = summary ? toSentenceCase(summary) : undefined

  // Does this card have reveal content?
  const hasReveal = !!(parentQuote || location)

  // Slide-up amount: CLAMPED so title never goes above card top.
  // Max slide = imageHeight - topPadding (keeps title flush with top + padding)
  const maxSlide = imgH - PAD
  const slideUp = hovered && hasReveal ? Math.min(revealH, maxSlide) : 0

  return (
    <Link
      href={href}
      className="no-underline block mp-card-link"
      style={{
        width: masonry ? "100%" : cardWidth,
        minWidth: masonry ? undefined : cardWidth,
        flexShrink: masonry ? undefined : 0,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        textDecoration: "none",
        color: "inherit",
        zIndex: 1,
      }}
      onMouseEnter={() => { setHovered(true); playTick() }}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        @keyframes mpSavePillFade {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          70%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
      `}</style>

      {/* ── Main card — fixed height for uniform grid ── */}
      <div
        style={{
          background: bg,
          borderRadius: "var(--card-radius-inner)",
          border: hovered ? "1px solid var(--color-border-strong)" : "var(--card-border)",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative",
          height: cardHeight,
          transition: CARD_TRANSITION,
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
        }}
      >
        {/* ── Save button — fixed position, doesn't slide ── */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setJustToggled(true)
            setBookmarked(!bookmarked)
            playWhoosh()
            setTimeout(() => setJustToggled(false), 2200)
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 20,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: bookmarked ? "var(--color-shadow-overlay)" : "var(--color-bg-frosted)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px var(--color-shadow-md)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s ease, transform 0.15s ease, opacity 0.2s ease",
            transform: justToggled ? "scale(0.85)" : "scale(1)",
            opacity: hovered || bookmarked || isMobile ? 1 : 0,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke={bookmarked ? "#fff" : "var(--color-text-primary)"} strokeWidth={2.5} strokeLinecap="round"
            style={{ position: "absolute", opacity: bookmarked ? 0 : 1, transition: "opacity 0.2s" }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", opacity: bookmarked ? 1 : 0, transition: "opacity 0.2s" }}>
            <polyline points="4 12 9 17 20 6" />
          </svg>
        </button>

        {/* "Added to Saved Classes" pill */}
        {justToggled && bookmarked && (
          <span style={{
            position: "absolute",
            top: "30%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 11, fontWeight: 600, color: "#fff",
            letterSpacing: "0.02em",
            background: "var(--color-shadow-overlay)",
            backdropFilter: "blur(4px)",
            padding: "8px 16px",
            borderRadius: 100,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 25,
            animation: "mpSavePillFade 2s ease forwards",
          }}>
            Added to Saved Classes
          </span>
        )}

        {/* ── Sliding inner — translates up on hover to reveal content ── */}
        <div
          style={{
            transition: "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)",
            transform: `translateY(-${slideUp}px)`,
          }}
        >
          {/* Image — fixed height for uniform cards */}
          <div
            style={{
              height: imgH,
              overflow: "hidden",
              flexShrink: 0,
              background: "var(--tumbo-cream)",
            }}
          >
            {image ? (
              <Image
                src={image}
                alt={displayTitle}
                width={400}
                height={300}
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/photos/Default/Placeholder.png"; }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <ClassPlaceholder
                category={category}
                tags={tags}
                seed={id}
              />
            )}
          </div>

          {/* Content — minHeight fills remaining card space so reveal stays clipped */}
          <div
            style={{
              padding: `${PAD}px ${PAD}px ${PAD}px`,
              display: "flex",
              flexDirection: "column",
              gap: 0,
              minHeight: cardHeight - imgH, boxSizing: "border-box" as const,
            }}
          >
            {/* Title — 2-line clamp */}
            <h3
              style={{
                margin: 0,
                fontSize: titleSize,
                fontWeight: 600,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                color: titleColor,
                display: "-webkit-box" as const,
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {displayTitle}
            </h3>

            {/* Vibe line — summary under title for scanning context */}
            {displaySummary && (
              <p style={{
                margin: 0,
                marginTop: 5,
                fontSize: 12,
                color: summaryColor,
                fontWeight: 400,
                lineHeight: 1.4,
                display: "-webkit-box" as const,
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}>
                {displaySummary}
              </p>
            )}

            {/* Spacer pushes pills to bottom */}
            <div style={{ flex: 1 }} />

            {/* Separator + Tags row */}
            {(ageRange || tags.length > 0 || priceDisplay) && (
              <>
                <div style={{ borderTop: `1px solid ${footerBorder}`, marginBottom: 10 }} />
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                    flex: 1,
                    maxHeight: 55,
                    overflow: "hidden",
                  }}>
                    {ageRange && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: 100,
                          border: "1.5px solid var(--color-border-strong)",
                          color: "var(--color-text-secondary)",
                          background: "transparent",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {ageRange}
                      </span>
                    )}
                    {tags.slice(0, 2).map((tag) =>
                      variant === "v2" ? (
                        <DimensionPill key={tag.label} label={tag.label} dimension={tag.dimension} />
                      ) : (
                        <V3Pill key={tag.label} label={tag.label} dimension={tag.dimension} />
                      )
                    )}
                  </div>
                  {priceDisplay && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: priceColor,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}>
                      {priceDisplay}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Reveal content (below card boundary, slides into view on hover) ── */}
          {hasReveal && (
            <div
              ref={revealRef}
              style={{
                padding: `0 ${PAD}px ${PAD}px`,
                // Negative margin cancels height contribution — card clips this
                marginBottom: revealH > 0 ? -revealH : undefined,
              }}
            >
              {/* Separator — matches content separator width */}
              <div style={{ borderTop: `1px solid ${footerBorder}`, marginBottom: 2 }} />

              {/* Parent review quote */}
              {parentQuote && (
                <div style={{
                  paddingTop: 12,
                  paddingBottom: location ? 8 : 0,
                  marginBottom: location ? 8 : 0,
                  borderBottom: location ? "1px solid var(--color-border-subtle)" : "none",
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 11.5,
                    fontStyle: "italic",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                    display: "-webkit-box" as const,
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}>
                    &ldquo;{parentQuote}&rdquo;
                  </p>
                  <p style={{
                    margin: "4px 0 0",
                    fontSize: 9,
                    fontWeight: 600,
                    color: "var(--tumbo-label)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Parent Review
                  </p>
                </div>
              )}

              {/* Location in reveal */}
              {location && (
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 5,
                  paddingTop: parentQuote ? 0 : 10,
                }}>
                  <svg
                    width={10}
                    height={10}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-secondary)"
                    strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx={12} cy={10} r={3} />
                  </svg>
                  <span style={{
                    fontSize: 10.5,
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    display: "-webkit-box" as const,
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}>
                    {location}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>{/* end slider */}
      </div>
    </Link>
  )
})

/* ── V2 Dimension pill: solid dimension color + icon ── */
function DimensionPill({ label, dimension }: { label: string; dimension: TagDimension }) {
  const color = DIMENSION_COLORS[dimension]
  const Icon = DIMENSION_ICONS[dimension]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        fontWeight: 700,
        padding: "4px 8px",
        borderRadius: 100,
        border: "1.5px solid transparent",
        color: "#fff",
        background: color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Icon size={9} />
      {label}
    </span>
  )
}

/* ── V3 pill: solid dimension color, white text + icon ── */
function V3Pill({ label, dimension }: { label: string; dimension: TagDimension }) {
  const color = DIMENSION_COLORS[dimension]
  const Icon = DIMENSION_ICONS[dimension]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        fontWeight: 700,
        padding: "4px 8px",
        borderRadius: 100,
        border: "1.5px solid transparent",
        color: "#fff",
        background: color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Icon size={9} />
      {label}
    </span>
  )
}

/* ── Grid variant for search/filter results ── */
export function MPCardGrid(props: Omit<MPCardProps, "featured">) {
  return (
    <MPCard
      {...props}
      featured={false}
    />
  )
}
