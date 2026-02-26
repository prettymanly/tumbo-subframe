"use client"

import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"
import type { WarmTag, TagDimension } from "@/lib/rails/types"

// ── Dimension → solid color (matches TagPill from V1) ──
const DIMENSION_COLORS: Record<TagDimension, string> = {
  content: "#7E401A",
  philosophy: "#FF3C00",
  experience: "#F1B313",
  child: "#FF6966",
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
  // Capitalize after sentence-ending punctuation or at start
  return str
    .split(/([.!?]\s+)/)
    .map((segment, i) => {
      if (i === 0 || /^[.!?]\s+$/.test(segment)) {
        // First segment: capitalize first letter
        if (i === 0) return segment.charAt(0).toUpperCase() + segment.slice(1)
        return segment
      }
      // Segment after punctuation: capitalize first letter
      return segment.charAt(0).toUpperCase() + segment.slice(1)
    })
    .join("")
}

// V3 pill colors (kept separate for V3 variant)
const PILL_COLORS_V3 = ["#7E401A", "#F1B313", "#FF3C00", "#FF6966"]

export interface MPCardProps {
  id: string
  title: string
  provider?: string
  summary?: string
  image?: string
  tags?: WarmTag[]
  rating?: number
  reviewCount?: number
  location?: string
  price?: number | string
  href: string
  /** "v2" = dimension-colored pills with icons, "v3" = solid color pills */
  variant?: "v2" | "v3"
  /** Larger card for featured rail */
  featured?: boolean
  /** Masonry mode: fills column width, natural height, no summary clamp */
  masonry?: boolean
}

export function MPCard({
  id,
  title,
  provider,
  summary,
  image,
  tags = [],
  rating,
  reviewCount,
  location,
  price,
  href,
  variant = "v2",
  featured = false,
  masonry = false,
}: MPCardProps) {
  const [hovered, setHovered] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [justToggled, setJustToggled] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Subtle click sound — filtered noise burst, like a soft toggle switch
  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const t = ctx.currentTime

      // Create a tiny buffer of noise (12ms)
      const len = Math.ceil(ctx.sampleRate * 0.012)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1)

      const src = ctx.createBufferSource()
      src.buffer = buf

      // Bandpass filter — gives it a warm, woody click character
      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.value = 2400
      filter.Q.value = 1.2

      // Sharp attack, instant decay
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

  // Subtle whoosh — rising filtered noise, like a soft confirmation sweep
  const playWhoosh = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const t = ctx.currentTime

      // Longer noise burst (150ms)
      const len = Math.ceil(ctx.sampleRate * 0.15)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1)

      const src = ctx.createBufferSource()
      src.buffer = buf

      // Sweeping bandpass — rises from low to high for the "whoosh" feel
      const filter = ctx.createBiquadFilter()
      filter.type = "bandpass"
      filter.frequency.setValueAtTime(400, t)
      filter.frequency.exponentialRampToValueAtTime(3000, t + 0.12)
      filter.Q.value = 2

      // Soft attack, gentle fade
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

  // On mobile, featured cards should be same size as regular cards
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  const effectiveFeatured = featured && !isMobile
  const cardWidth = masonry ? undefined : effectiveFeatured ? 520 : 260
  const imageAspect = effectiveFeatured ? "32/10" : (masonry ? "3/2" : "16/10")
  const titleSize = masonry ? 15 : effectiveFeatured ? 18 : 15

  const priceDisplay =
    typeof price === "number"
      ? price > 0
        ? `From $${price}`
        : "Free"
      : price || ""

  // ── Hover-driven color scheme (instant snap, no gradual fade) ──
  const bg = hovered ? "#FF4400" : "#fff"
  const titleColor = hovered ? "#fff" : "#000"
  const providerColor = hovered ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.45)"
  const summaryColor = hovered ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.55)"
  const footerBorder = hovered ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.07)"
  const locationColor = hovered ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.4)"
  const priceColor = hovered ? "#fff" : "#000"

  // Sentence-case the summary/vibe line
  const displaySummary = summary ? toSentenceCase(summary) : undefined

  return (
    <Link
      href={href}
      className={`no-underline block mp-card-link${hovered ? " mp-card-bounce" : ""}`}
      style={{
        width: masonry ? "100%" : cardWidth,
        minWidth: masonry ? undefined : cardWidth,
        flexShrink: masonry ? undefined : 0,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        position: "relative",
        textDecoration: "none",
        color: "inherit",
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
        @keyframes cardRubberBand {
          0%   { transform: translateY(0); }
          20%  { transform: translateY(-3px); }
          55%  { transform: translateY(5px); }
          100% { transform: translateY(0); }
        }
        /* Bounce only on hover-capable devices */
        @media (hover: hover) and (pointer: fine) {
          .mp-card-bounce {
            animation: cardRubberBand 0.25s cubic-bezier(0.22, 0.68, 0.31, 1.2) forwards;
          }
        }
        /* Touch: show corner save, hide hover overlay */
        @media (hover: none) {
          .mp-card-save-corner { display: block !important; }
          .mp-card-save-hover { display: none !important; }
        }
        /* Desktop: hide corner save, show hover overlay */
        @media (hover: hover) and (pointer: fine) {
          .mp-card-save-corner { display: none !important; }
          .mp-card-save-hover { display: block !important; }
        }
      `}</style>

      {/* ── Main card ── */}
      <div
        style={{
          background: bg,
          borderRadius: 20,
          border: hovered ? "1px solid #FF4400" : "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Textures moved to content section below */}
        {/* Image */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            aspectRatio: imageAspect,
            overflow: "hidden",
            flexShrink: 0,
            background: hovered ? "#FF4400" : "#f5f0eb",
          }}
        >
          <img
            src={image || "/photos/Default/Placeholder.png"}
            alt={title}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/photos/Default/Placeholder.png"; }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "none",
              transform: "none",
            }}
          />

          {/* Corner save button — always visible on touch devices */}
          <div className="mp-card-save-corner" style={{
            position: "absolute", top: 8, right: 8, zIndex: 5,
          }}>
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
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: bookmarked ? "rgba(28,28,28,0.92)" : "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.3s ease, transform 0.15s ease",
                transform: justToggled ? "scale(0.85)" : "scale(1)",
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke={bookmarked ? "#fff" : "#333"} strokeWidth={2.2} strokeLinecap="round"
                style={{ position: "absolute", opacity: bookmarked ? 0 : 1, transition: "opacity 0.2s" }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", opacity: bookmarked ? 1 : 0, transition: "opacity 0.2s" }}>
                <polyline points="4 12 9 17 20 6" />
              </svg>
            </button>
          </div>

          {/* Hover overlay save — desktop only (hidden on touch) */}
          <div
            className="mp-card-save-hover"
            style={{
              position: "absolute",
              inset: 0,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s ease",
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
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
                top: "50%",
                left: "50%",
                marginTop: -32,
                marginLeft: -32,
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "none",
                background: bookmarked ? "rgba(28, 28, 28, 0.92)" : "rgba(255,255,255,0.88)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s ease, transform 0.15s ease",
                transform: justToggled ? "scale(0.88)" : "scale(1)",
              }}
            >
              {/* + icon */}
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke={bookmarked ? "#fff" : "#333"}
                strokeWidth={2.2}
                strokeLinecap="round"
                style={{
                  position: "absolute",
                  opacity: bookmarked ? 0 : 1,
                  transform: bookmarked ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
                  transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>

              {/* ✓ icon */}
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  opacity: bookmarked ? 1 : 0,
                  transform: bookmarked ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
                  transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <polyline points="4 12 9 17 20 6" />
              </svg>
            </button>

            {/* "Added to Saved Classes" pill */}
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: bookmarked
                  ? "translate(-50%, 42px)"
                  : "translate(-50%, 48px)",
                fontSize: 11,
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "0.02em",
                background: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(4px)",
                padding: "5px 14px",
                borderRadius: 100,
                opacity: bookmarked ? 1 : 0,
                transition: "opacity 0.25s ease 0.1s, transform 0.25s ease 0.1s",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Added to Saved Classes
            </span>
          </div>

          {/* "Added to Saved Classes" pill — visible on all devices when bookmarked */}
          {justToggled && bookmarked && (
            <span
              className="mp-card-save-pill"
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 11, fontWeight: 600, color: "#fff",
                letterSpacing: "0.02em",
                background: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(4px)",
                padding: "8px 16px",
                borderRadius: 100,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 10,
                animation: "mpSavePillFade 2s ease forwards",
              }}
            >
              Added to Saved Classes
            </span>
          )}

          {/* Rating badge */}
          {rating != null && rating > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                borderRadius: 100,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="#FF4400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {rating.toFixed(1)}
              {reviewCount != null && reviewCount > 0 && (
                <span style={{ opacity: 0.6, fontWeight: 400 }}>
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: masonry ? "12px 14px 14px" : "16px 18px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            position: "relative",
            zIndex: 3,
            overflow: "hidden",
          }}
        >
          {/* All content wrapped to sit above texture layers */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {/* Title — smooth thickening to black weight on hover */}
            <h3
              style={{
                margin: 0,
                fontSize: titleSize,
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                color: titleColor,
                textShadow: hovered
                  ? "0.2px 0 0 currentColor, -0.2px 0 0 currentColor"
                  : "0 0 0 transparent",
                transition: "text-shadow 0.25s ease",
              }}
            >
              {title}
            </h3>

            {/* Provider */}
            {provider && (
              <p style={{
                margin: 0,
                fontSize: 12,
                color: providerColor,
                fontWeight: 500,
                transition: "none",
              }}>
                {provider}
              </p>
            )}

            {/* Summary (vibe line) — sentence case, smooth thickening via text-shadow */}
            {displaySummary && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: summaryColor,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  flex: 1,
                  ...(masonry ? {} : {
                    display: "-webkit-box" as const,
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }),
                  textShadow: hovered
                    ? "0.3px 0 0 currentColor, -0.3px 0 0 currentColor"
                    : "0 0 0 transparent",
                  transition: "text-shadow 0.25s ease",
                }}
              >
                {displaySummary}
              </p>
            )}

            {/* Tags — bottom row, with dimension icons */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {tags.slice(0, 2).map((tag) =>
                  variant === "v2" ? (
                    <DimensionPill key={tag.label} label={tag.label} dimension={tag.dimension} hovered={hovered} />
                  ) : (
                    <V3Pill key={tag.label} label={tag.label} dimension={tag.dimension} />
                  )
                )}
              </div>
            )}

            {/* Footer: location + price */}
            {(location || priceDisplay) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                  paddingTop: 10,
                  borderTop: `1px solid ${footerBorder}`,
                  transition: "none",
                }}
              >
                {location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={locationColor}
                      strokeWidth={2}
                      style={{ transition: "none" }}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx={12} cy={10} r={3} />
                    </svg>
                    <span
                      style={{
                        fontSize: 11,
                        color: locationColor,
                        fontWeight: 500,
                        transition: "none",
                      }}
                    >
                      {location}
                    </span>
                  </div>
                )}
                {priceDisplay && (
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: priceColor,
                    transition: "none",
                  }}>
                    {priceDisplay}
                  </span>
                )}
              </div>
            )}
          </div>{/* close content wrapper */}
        </div>
      </div>
    </Link>
  )
}

/* ── V2 Dimension pill: solid dimension color + icon, inverts on card hover ── */
function DimensionPill({ label, dimension, hovered }: { label: string; dimension: TagDimension; hovered: boolean }) {
  const color = DIMENSION_COLORS[dimension]
  const Icon = DIMENSION_ICONS[dimension]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: 700,
        padding: "5px 10px",
        borderRadius: 100,
        border: "none",
        color: hovered ? color : "#1A1A1A",
        background: hovered ? "rgba(255,255,255,0.9)" : color,
        whiteSpace: "nowrap",
        transition: "none",
      }}
    >
      <Icon size={10} />
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
        gap: 4,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 100,
        border: "none",
        color: "#fff",
        background: color,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={10} />
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
