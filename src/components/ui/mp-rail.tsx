"use client"

import { useRef, useState, useCallback } from "react"

interface MPRailProps {
  title: string
  subtitle?: string
  /** Background color for the fade overlay on the right edge */
  fadeTo?: string
  children: React.ReactNode
}

/**
 * MagicPath horizontal carousel rail.
 * Wraps children in a horizontally-scrollable container with left/right arrows.
 */
export function MPRail({
  title,
  subtitle,
  fadeTo = "var(--tumbo-background)",
  children,
}: MPRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [leftHover, setLeftHover] = useState(false)
  const [rightHover, setRightHover] = useState(false)

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = direction === "left" ? -580 : 580
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }, [])

  return (
    <div
      style={{
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 20,
          paddingRight: 4,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 14,
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
                maxWidth: 500,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Arrow buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 24 }}>
          <ArrowButton
            direction="left"
            hovered={leftHover}
            onMouseEnter={() => setLeftHover(true)}
            onMouseLeave={() => setLeftHover(false)}
            onClick={() => scroll("left")}
          />
          <ArrowButton
            direction="right"
            hovered={rightHover}
            onMouseEnter={() => setRightHover(true)}
            onMouseLeave={() => setRightHover(false)}
            onClick={() => scroll("right")}
          />
        </div>
      </div>

      {/* Carousel container */}
      <div style={{ position: "relative" }}>
        <div
          ref={scrollRef}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            overflowY: "visible",
            paddingBottom: 12,
            paddingTop: 8,
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
          {/* End padding sentinel */}
          <div style={{ flexShrink: 0, width: 4 }} />
        </div>

        {/* Right-edge fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 12,
            width: 80,
            background: `linear-gradient(to right, transparent, ${fadeTo})`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  )
}

/* ── Arrow button ── */
function ArrowButton({
  direction,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  direction: "left" | "right"
  hovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: `1.5px solid ${hovered ? "var(--tumbo-orange)" : "var(--color-border-strong)"}`,
        background: hovered ? "var(--tumbo-orange)" : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke={hovered ? "#fff" : "currentColor"}
        strokeWidth={2}
        style={{ transition: "stroke 0.15s" }}
      >
        {direction === "left" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  )
}
