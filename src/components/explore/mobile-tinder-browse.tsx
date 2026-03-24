"use client"

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { SwipeCard } from "@/components/ui/swipe-card"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/ui/auth-modal"

// ── Seeded shuffle (same algorithm as diversity.ts) ──
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr]
  let s = seed
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const j = s % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ── Session storage helpers ──
const STORAGE_KEY = "tumbo_tinder_pos"

function loadPosition(): { rail: number; card: number } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.rail === "number" && typeof parsed.card === "number") {
      return parsed
    }
  } catch {
    // Corrupted or unavailable
  }
  return null
}

function savePosition(rail: number, card: number): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ rail, card }))
  } catch {
    // sessionStorage full or unavailable
  }
}

// ── Types ──

interface RailItem {
  id: string
  title: string
  provider?: string
  summary?: string
  image?: string
  tags: Array<{ label: string; dimension: string; slug: string }>
  location?: string
  ageRange?: string
  category?: string
}

interface Rail {
  railId: string
  header: string
  subheader: string
  items: RailItem[]
}

interface MoreItem {
  id: string
  name: string
  photo_url?: string | null
  category?: string | null
  provider_id?: string | null
  vibe_line?: string | null
  summary?: string | null
  location?: string | null
  age_min?: number | null
  age_max?: number | null
}

export interface MobileTinderBrowseProps {
  rails: Rail[]
  moreItems: MoreItem[]
  providerMap: Record<string, { name: string }>
  onCardClick: (id: string) => void
  sessionSeed: number
}

// ── Constants ──
const BATCH_SIZE = 24
const PREFETCH_AT = 20
const NAVBAR_HEIGHT = 56

// ── Format age range ──
function formatAge(min?: number | null, max?: number | null): string | undefined {
  if (min == null && max == null) return undefined
  if (min != null && max != null) {
    if (min === 0) return `Up to ${max} yrs`
    return `${min}–${max} yrs`
  }
  if (min != null) return `${min}+ yrs`
  return `Up to ${max} yrs`
}

// ── Main Component ──

export function MobileTinderBrowse({
  rails,
  moreItems,
  providerMap,
  onCardClick,
  sessionSeed,
}: MobileTinderBrowseProps) {
  const { isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // State machine
  const [currentRailIndex, setCurrentRailIndex] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [animatingOut, setAnimatingOut] = useState<"left" | "right" | null>(null)
  const [finished, setFinished] = useState(false)

  // "Every class" pagination
  const [moreLoadedCount, setMoreLoadedCount] = useState(BATCH_SIZE)

  // Shuffled moreItems (deterministic per session)
  const shuffledMore = useMemo(
    () => seededShuffle(moreItems, sessionSeed),
    [moreItems, sessionSeed]
  )

  const totalRails = rails.length // index === totalRails means "Every class"
  const isEveryClassSection = currentRailIndex === totalRails

  // Restore position from sessionStorage on mount
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    const pos = loadPosition()
    if (pos) {
      // Validate bounds
      if (pos.rail <= totalRails) {
        setCurrentRailIndex(pos.rail)
        setCurrentCardIndex(pos.card)
        // Pre-load enough "every class" items if needed
        if (pos.rail === totalRails && pos.card >= BATCH_SIZE) {
          setMoreLoadedCount(Math.ceil((pos.card + 1) / BATCH_SIZE) * BATCH_SIZE)
        }
      }
    }
  }, [totalRails])

  // Persist position
  useEffect(() => {
    savePosition(currentRailIndex, currentCardIndex)
  }, [currentRailIndex, currentCardIndex])

  // ── Current section data ──
  const currentRail: Rail | null = isEveryClassSection ? null : rails[currentRailIndex] ?? null
  const currentItems: RailItem[] = useMemo(() => {
    if (!isEveryClassSection && currentRail) {
      return currentRail.items
    }
    // "Every class" section — convert moreItems to RailItem shape
    return shuffledMore.slice(0, moreLoadedCount).map((item) => ({
      id: item.id,
      title: item.name,
      provider: item.provider_id ? providerMap[item.provider_id]?.name : undefined,
      summary: item.vibe_line || item.summary || undefined,
      image: item.photo_url || undefined,
      tags: [],
      location: item.location || undefined,
      ageRange: formatAge(item.age_min, item.age_max),
      category: item.category || undefined,
    }))
  }, [isEveryClassSection, currentRail, shuffledMore, moreLoadedCount, providerMap])

  const totalCardsInSection = isEveryClassSection ? shuffledMore.length : currentItems.length
  const currentCard = currentItems[currentCardIndex] ?? null
  const nextCard = currentItems[currentCardIndex + 1] ?? null

  // Prefetch more items in "Every class" section
  useEffect(() => {
    if (isEveryClassSection && currentCardIndex >= moreLoadedCount - (BATCH_SIZE - PREFETCH_AT)) {
      setMoreLoadedCount((prev) => Math.min(prev + BATCH_SIZE, shuffledMore.length))
    }
  }, [isEveryClassSection, currentCardIndex, moreLoadedCount, shuffledMore.length])

  // ── Advance logic ──
  const advanceCard = useCallback(() => {
    const nextIdx = currentCardIndex + 1
    if (nextIdx < currentItems.length) {
      setCurrentCardIndex(nextIdx)
    } else if (!isEveryClassSection) {
      // Move to next rail
      const nextRail = currentRailIndex + 1
      if (nextRail <= totalRails) {
        setCurrentRailIndex(nextRail)
        setCurrentCardIndex(0)
      } else {
        setFinished(true)
      }
    } else {
      // At the end of "Every class"
      if (nextIdx < shuffledMore.length) {
        setMoreLoadedCount((prev) => Math.min(prev + BATCH_SIZE, shuffledMore.length))
        setCurrentCardIndex(nextIdx)
      } else {
        setFinished(true)
      }
    }
    setAnimatingOut(null)
  }, [currentCardIndex, currentItems.length, currentRailIndex, isEveryClassSection, totalRails, shuffledMore.length])

  const advanceToNextRail = useCallback(() => {
    const nextRail = currentRailIndex + 1
    if (nextRail <= totalRails) {
      setCurrentRailIndex(nextRail)
      setCurrentCardIndex(0)
    } else {
      setFinished(true)
    }
    setAnimatingOut(null)
  }, [currentRailIndex, totalRails])

  // ── Swipe handlers ──
  const pendingSwipeRef = useRef<{ direction: "right" | "left"; cardId: string } | null>(null)

  const handleSwipeRight = useCallback(() => {
    if (!currentCard) return
    // Auth gate
    if (!isAuthenticated) {
      pendingSwipeRef.current = { direction: "right", cardId: currentCard.id }
      setAuthModalOpen(true)
      return
    }
    setSavedIds((prev) => new Set(prev).add(currentCard.id))
    setAnimatingOut("right")
    setTimeout(advanceCard, 300)
  }, [currentCard, isAuthenticated, advanceCard])

  const handleSwipeLeft = useCallback(() => {
    setAnimatingOut("left")
    if (isEveryClassSection) {
      // In "Every class", left swipe just skips the card
      setTimeout(advanceCard, 300)
    } else {
      setTimeout(advanceToNextRail, 300)
    }
  }, [isEveryClassSection, advanceCard, advanceToNextRail])

  const handleTap = useCallback(() => {
    if (currentCard) {
      onCardClick(currentCard.id)
    }
  }, [currentCard, onCardClick])

  // Auth modal close handler — complete pending save if auth succeeded
  const handleAuthClose = useCallback(() => {
    setAuthModalOpen(false)
    // If user just authenticated and we had a pending save, execute it
    if (pendingSwipeRef.current && isAuthenticated) {
      const { cardId } = pendingSwipeRef.current
      pendingSwipeRef.current = null
      setSavedIds((prev) => new Set(prev).add(cardId))
      setAnimatingOut("right")
      setTimeout(advanceCard, 300)
    } else {
      pendingSwipeRef.current = null
    }
  }, [isAuthenticated, advanceCard])

  // ── Navigation: prev/next within rail ──
  const goToPrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
    }
  }, [currentCardIndex])

  const goToNextCard = useCallback(() => {
    if (currentCardIndex < currentItems.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    }
  }, [currentCardIndex, currentItems.length])

  // ── Back to top ──
  const backToTop = useCallback(() => {
    setCurrentRailIndex(0)
    setCurrentCardIndex(0)
    setFinished(false)
    setAnimatingOut(null)
  }, [])

  // ── Section header info ──
  const sectionHeader = isEveryClassSection ? "Every class" : (currentRail?.header ?? "")
  const sectionSubheader = isEveryClassSection
    ? "Browse the full directory"
    : (currentRail?.subheader ?? "")
  const sectionCount = totalCardsInSection

  // ── Finished screen ──
  if (finished) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          padding: 32,
          textAlign: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary, #6b7280)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 12 9 17 20 6" />
          </svg>
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-text-primary, #111)",
            margin: 0,
          }}
        >
          You&apos;ve seen every class
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary, #6b7280)",
            margin: 0,
            maxWidth: 280,
          }}
        >
          {savedIds.size > 0
            ? `You saved ${savedIds.size} class${savedIds.size === 1 ? "" : "es"}. Check your saved list to explore them.`
            : "Swipe through again or try the full directory."}
        </p>
        <button
          onClick={backToTop}
          style={{
            marginTop: 8,
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: "var(--tumbo-orange, #f97316)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          Back to top
        </button>
      </div>
    )
  }

  // No card available (empty rail)
  if (!currentCard) {
    // Auto-advance to next rail
    if (!isEveryClassSection && currentRailIndex < totalRails) {
      // Use effect-free advance
      setTimeout(() => {
        setCurrentRailIndex((prev) => prev + 1)
        setCurrentCardIndex(0)
      }, 0)
    }
    return null
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Sticky rail header ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border-subtle, #e5e7eb)",
          background: "var(--color-bg-card, #fff)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text-primary, #111)",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sectionHeader}
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 13,
              color: "var(--color-text-secondary, #6b7280)",
              lineHeight: 1.3,
            }}
          >
            {sectionSubheader}
          </p>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text-secondary, #6b7280)",
            background: "var(--color-bg-subtle, #f3f4f6)",
            padding: "4px 10px",
            borderRadius: 100,
            marginLeft: 12,
          }}
        >
          {sectionCount} classes
        </span>
      </div>

      {/* ── Card stack area ── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          padding: 16,
          overflow: "hidden",
        }}
      >
        {/* Next card (underneath) */}
        {nextCard && !animatingOut && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              bottom: 16,
              zIndex: 1,
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              transform: "scale(0.97)",
              opacity: 0.7,
            }}
          />
        )}

        {/* Current card (swipeable) */}
        <AnimatePresence mode="wait">
          {currentCard && !animatingOut && (
            <SwipeCard
              key={`${currentRailIndex}-${currentCardIndex}-${currentCard.id}`}
              id={currentCard.id}
              title={currentCard.title}
              provider={currentCard.provider}
              summary={currentCard.summary}
              image={currentCard.image}
              tags={currentCard.tags}
              location={currentCard.location}
              ageRange={currentCard.ageRange}
              category={currentCard.category}
              isSaved={savedIds.has(currentCard.id)}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onTap={handleTap}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom controls ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "8px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "var(--color-bg-card, #fff)",
          borderTop: "1px solid var(--color-border-subtle, #e5e7eb)",
        }}
      >
        {/* Progress indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary, #6b7280)",
            }}
          >
            {currentCardIndex + 1} of {Math.min(currentItems.length, totalCardsInSection)}
          </span>

          {/* Dot indicators (show up to 8 dots) */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {Array.from({ length: Math.min(8, currentItems.length) }).map((_, i) => {
              const isActive = i === Math.min(currentCardIndex, 7)
              return (
                <div
                  key={i}
                  style={{
                    width: isActive ? 8 : 5,
                    height: isActive ? 8 : 5,
                    borderRadius: "50%",
                    background: isActive
                      ? "var(--tumbo-orange, #f97316)"
                      : "var(--color-border-subtle, #d1d5db)",
                    transition: "all 0.2s ease",
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {/* Previous card */}
          <button
            onClick={goToPrevCard}
            disabled={currentCardIndex === 0}
            aria-label="Previous card"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1.5px solid var(--color-border-subtle, #d1d5db)",
              background: "var(--color-bg-card, #fff)",
              cursor: currentCardIndex === 0 ? "not-allowed" : "pointer",
              opacity: currentCardIndex === 0 ? 0.35 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.15s",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary, #111)" strokeWidth={2} strokeLinecap="round">
              <polyline points="12 19 5 12 12 5" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Skip rail (left swipe equivalent) */}
          <button
            onClick={handleSwipeLeft}
            aria-label={isEveryClassSection ? "Skip card" : "Skip rail"}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "2px solid #ef4444",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Save (right swipe equivalent) */}
          <button
            onClick={handleSwipeRight}
            aria-label="Save class"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "2px solid #22c55e",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Next card */}
          <button
            onClick={goToNextCard}
            disabled={currentCardIndex >= currentItems.length - 1}
            aria-label="Next card"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1.5px solid var(--color-border-subtle, #d1d5db)",
              background: "var(--color-bg-card, #fff)",
              cursor: currentCardIndex >= currentItems.length - 1 ? "not-allowed" : "pointer",
              opacity: currentCardIndex >= currentItems.length - 1 ? 0.35 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.15s",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary, #111)" strokeWidth={2} strokeLinecap="round">
              <polyline points="12 5 19 12 12 19" />
              <line x1="19" y1="12" x2="5" y2="12" />
            </svg>
          </button>
        </div>

        {/* Hint text */}
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: 11,
            color: "var(--color-text-secondary, #9ca3af)",
            fontWeight: 400,
          }}
        >
          Swipe right to save · Swipe left to {isEveryClassSection ? "skip" : "skip rail"} · Tap for details
        </p>
      </div>

      {/* ── Auth modal (portal) ── */}
      {authModalOpen && typeof document !== "undefined" && createPortal(
        <AuthModal
          isOpen={authModalOpen}
          onClose={handleAuthClose}
          mode="signin"
        />,
        document.body
      )}
    </div>
  )
}
