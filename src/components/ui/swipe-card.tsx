"use client"

import React, { useCallback, useRef } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useDrag } from "@use-gesture/react"
import Image from "next/image"
import { ClassPlaceholder } from "@/components/ui/class-placeholder"
import type { TagDimension } from "@/lib/rails/types"

// ── Dimension color mapping (mirrors mp-card.tsx) ──
const DIMENSION_COLORS: Record<string, string> = {
  content: "var(--tumbo-tag-content)",
  philosophy: "var(--tumbo-tag-philosophy)",
  experience: "var(--tumbo-tag-experience)",
  child: "var(--tumbo-tag-child)",
}

// ── Swipe thresholds ──
const SWIPE_THRESHOLD_PX = 100
const SWIPE_VELOCITY = 0.5
const OVERLAY_START_PX = 50
const EXIT_X = 500

// ── Props ──
export interface SwipeCardProps {
  id: string
  title: string
  provider?: string
  summary?: string
  image?: string
  tags?: Array<{ label: string; dimension: string }>
  location?: string
  ageRange?: string
  category?: string
  isSaved: boolean
  onSwipeRight: () => void
  onSwipeLeft: () => void
  onTap: () => void
}

export const SwipeCard = React.memo(function SwipeCard({
  id,
  title,
  provider,
  summary,
  image,
  tags = [],
  location,
  ageRange,
  category,
  isSaved,
  onSwipeRight,
  onSwipeLeft,
  onTap,
}: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0.5, 0.8, 1, 0.8, 0.5])

  // Overlay opacities: fade in after OVERLAY_START_PX
  const saveOverlayOpacity = useTransform(x, [0, OVERLAY_START_PX, 200], [0, 0, 0.85])
  const skipOverlayOpacity = useTransform(x, [-200, -OVERLAY_START_PX, 0], [0.85, 0, 0])

  const isDraggingRef = useRef(false)
  const hasSwipedRef = useRef(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Whoosh sound (same pattern as mp-card.tsx)
  const playWhoosh = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const t = ctx.currentTime
      const len = Math.ceil(ctx.sampleRate * 0.15)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
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
    } catch {
      // Audio not available
    }
  }, [])

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], tap, cancel }) => {
      if (hasSwipedRef.current) {
        cancel()
        return
      }

      if (tap) {
        onTap()
        return
      }

      isDraggingRef.current = active

      if (active) {
        x.set(mx)
      } else {
        // Check if swipe threshold met
        const absX = Math.abs(mx)
        const absVx = Math.abs(vx)
        const isSwipe = absX > SWIPE_THRESHOLD_PX || absVx > SWIPE_VELOCITY
        const direction = mx > 0 ? "right" : "left"

        if (isSwipe) {
          hasSwipedRef.current = true
          const exitX = direction === "right" ? EXIT_X : -EXIT_X
          playWhoosh()
          animate(x, exitX, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            onComplete: () => {
              if (direction === "right") {
                onSwipeRight()
              } else {
                onSwipeLeft()
              }
            },
          })
        } else {
          // Snap back
          animate(x, 0, {
            type: "spring",
            stiffness: 500,
            damping: 30,
          })
        }
      }
    },
    {
      axis: "x",
      filterTaps: true,
      from: () => [x.get(), 0],
    }
  )

  // Simplify title (same logic as mp-card.tsx)
  const displayTitle = simplifyTitle(title)

  // Separate gesture handlers from motion props to avoid type conflicts
  const bindResult = bind()

  return (
    <motion.div
      onPointerDown={bindResult.onPointerDown as React.PointerEventHandler<HTMLDivElement>}
      style={{
        x,
        rotate,
        opacity: cardOpacity,
        touchAction: "pan-y",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        cursor: "grab",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          userSelect: "none",
        }}
      >
        {/* ── Saved badge (top-right) ── */}
        {isSaved && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 12 9 17 20 6" />
            </svg>
          </div>
        )}

        {/* ── SAVE overlay (right swipe) ── */}
        <motion.div
          style={{
            opacity: saveOverlayOpacity,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(34,197,94,0.15)",
            borderRadius: 16,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#22c55e",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "4px solid #22c55e",
              borderRadius: 12,
              padding: "8px 24px",
              transform: "rotate(-12deg)",
            }}
          >
            SAVE
          </span>
        </motion.div>

        {/* ── SKIP overlay (left swipe) ── */}
        <motion.div
          style={{
            opacity: skipOverlayOpacity,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(239,68,68,0.12)",
            borderRadius: 16,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#ef4444",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "4px solid #ef4444",
              borderRadius: 12,
              padding: "8px 24px",
              transform: "rotate(12deg)",
            }}
          >
            SKIP
          </span>
        </motion.div>

        {/* ── Image area (55%) ── */}
        <div
          style={{
            flex: "0 0 55%",
            overflow: "hidden",
            position: "relative",
            background: "var(--tumbo-cream, #f5f0eb)",
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/photos/Default/Placeholder.png"
              }}
              draggable={false}
            />
          ) : (
            <ClassPlaceholder
              category={category}
              seed={id}
            />
          )}
        </div>

        {/* ── Content area (45%) ── */}
        <div
          style={{
            flex: "0 0 45%",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflow: "hidden",
          }}
        >
          {/* Category + Location line */}
          {(category || location || ageRange) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "var(--color-text-secondary, #6b7280)",
                fontWeight: 500,
              }}
            >
              {ageRange && <span>{ageRange}</span>}
              {ageRange && location && <span style={{ opacity: 0.4 }}>·</span>}
              {location && (
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {location}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              color: "var(--color-text-primary, #111)",
              display: "-webkit-box" as React.CSSProperties["display"],
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
              overflow: "hidden",
            }}
          >
            {displayTitle}
          </h3>

          {/* Provider */}
          {provider && !displayTitle.toLowerCase().includes(provider.toLowerCase()) && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--color-text-secondary, #6b7280)",
                fontWeight: 500,
              }}
            >
              by {provider}
            </p>
          )}

          {/* Summary */}
          {summary && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-text-secondary, #6b7280)",
                fontWeight: 400,
                lineHeight: 1.45,
                display: "-webkit-box" as React.CSSProperties["display"],
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
                overflow: "hidden",
              }}
            >
              {toSentenceCase(summary)}
            </p>
          )}

          {/* Tag pills */}
          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: "auto",
              }}
            >
              {tags.slice(0, 3).map((tag) => (
                <SwipeTagPill
                  key={tag.label}
                  label={tag.label}
                  dimension={tag.dimension}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
})

// ── Tag pill for swipe cards ──
function SwipeTagPill({ label, dimension }: { label: string; dimension: string }) {
  const bg = DIMENSION_COLORS[dimension] || "var(--color-text-secondary)"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 100,
        color: "#fff",
        background: bg,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  )
}

// ── Helpers (mirror mp-card.tsx) ──
function simplifyTitle(name: string): string {
  let n = name
  if (n.includes("|")) n = n.split("|")[0].trim()
  const dashParts = n.split(/\s+[-–—]\s+/)
  if (dashParts.length > 1 && dashParts[0].length >= 6) n = dashParts[0]
  n = n.replace(/\s*\([^)]*\)\s*/g, "").trim()
  n = n.replace(/\s*@\s*/g, ", ")
  return n
}

function toSentenceCase(str: string): string {
  if (!str) return str
  return str
    .split(/([.!?]\s+)/)
    .map((segment, i) => {
      if (i === 0) return segment.charAt(0).toUpperCase() + segment.slice(1)
      if (/^[.!?]\s+$/.test(segment)) return segment
      return segment.charAt(0).toUpperCase() + segment.slice(1)
    })
    .join("")
}
