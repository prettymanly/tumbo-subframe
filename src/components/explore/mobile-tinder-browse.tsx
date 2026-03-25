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
  allTagsByDimension: Record<string, Array<{ label: string; dimension: string }>>
  activeTags: Set<string>
  onToggleTag: (label: string) => void
}

// ── Filter dimension config (matches dimension-search-bar) ──
const FILTER_DIMENSIONS = [
  { key: "content", label: "Content", color: "var(--tumbo-tag-content, #E8530E)" },
  { key: "philosophy", label: "Philosophy", color: "var(--tumbo-tag-philosophy, #D4A017)" },
  { key: "experience", label: "Experience", color: "var(--tumbo-tag-experience, #2D8A4E)" },
  { key: "child", label: "Child", color: "var(--tumbo-tag-child, #7C3AED)" },
  { key: "location", label: "Location", color: "var(--tumbo-tag-location, #2563EB)" },
]

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
  allTagsByDimension,
  activeTags,
  onToggleTag,
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

  // ── Vertical swipe detection for section snapping ──
  // IMPORTANT: these hooks must be declared before any early returns
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const [filterOpen, setFilterOpen] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0
    touchStartTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0]
    if (!touch) return
    const dy = touchStartY.current - touch.clientY
    const dt = Date.now() - touchStartTime.current
    if (dt === 0) return
    const velocity = Math.abs(dy) / dt

    // Swipe down (finger moves up) = next section
    if (dy > 60 || (dy > 30 && velocity > 0.3)) {
      advanceToNextRail()
    }
    // Swipe up (finger moves down) = previous section
    if (dy < -60 || (dy < -30 && velocity > 0.3)) {
      if (currentRailIndex > 0) {
        setCurrentRailIndex((prev) => prev - 1)
        setCurrentCardIndex(0)
      }
    }
  }, [advanceToNextRail, currentRailIndex])

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

  // Still loading: all rails are empty and moreItems hasn't arrived
  const allRailsEmpty = rails.every((r) => r.items.length === 0)
  if (allRailsEmpty && moreItems.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: `calc(100vh - ${NAVBAR_HEIGHT}px - 100px)`,
        gap: 12, color: "var(--color-text-secondary)",
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--tumbo-primary, #E8530E)", opacity: 0.4,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 13, margin: 0 }}>Loading classes...</p>
      </div>
    )
  }

  // No card available (empty rail or still loading)
  if (!currentCard) {
    // Try to find next rail with items
    if (!isEveryClassSection) {
      let nextRailWithItems = -1
      for (let i = currentRailIndex + 1; i < rails.length; i++) {
        if (rails[i].items.length > 0) { nextRailWithItems = i; break }
      }
      if (nextRailWithItems >= 0) {
        setTimeout(() => { setCurrentRailIndex(nextRailWithItems); setCurrentCardIndex(0) }, 0)
        return null
      }
      // No rails with items found: check if "Every class" has data
      if (shuffledMore.length > 0) {
        setTimeout(() => { setCurrentRailIndex(totalRails); setCurrentCardIndex(0) }, 0)
        return null
      }
    }
    // Truly nothing available yet, show loading
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: `calc(100vh - ${NAVBAR_HEIGHT}px - 100px)`,
        gap: 12, color: "var(--color-text-secondary)",
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--tumbo-primary, #E8530E)", opacity: 0.4,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 13, margin: 0 }}>Loading classes...</p>
      </div>
    )
  }

  const isCardSaved = savedIds.has(currentCard?.id ?? "")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "relative",
        background: "var(--tumbo-background, #FAF7F2)",
        overflow: "hidden",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── 1. Section title (sticky top) ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "max(12px, env(safe-area-inset-top)) 20px 8px",
        }}
      >
        <motion.div
          key={sectionHeader}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "var(--tumbo-text, #111)",
              lineHeight: 1.15,
              fontFamily: "var(--font-lexend), system-ui, sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            {sectionHeader}
          </h2>
          {sectionSubheader && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 13,
                color: "var(--tumbo-label, #888)",
                lineHeight: 1.3,
              }}
            >
              {sectionSubheader}
            </p>
          )}
        </motion.div>
      </div>

      {/* ── 2. Card (swipeable, fills available space) ── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          padding: "4px 16px 8px",
          minHeight: 0,
        }}
      >
        {/* Next card peek */}
        {nextCard && !animatingOut && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 20,
              right: 20,
              bottom: 12,
              zIndex: 1,
              borderRadius: 20,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transform: "scale(0.96) translateY(6px)",
              opacity: 0.4,
            }}
          />
        )}

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
              isSaved={isCardSaved}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onTap={handleTap}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. Navigation buttons: ← X · Bookmark → ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "6px 20px 68px",  /* 68px bottom to clear floating FAB */
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* ← Previous card */}
        <button
          onClick={goToPrevCard}
          disabled={currentCardIndex === 0}
          aria-label="Previous card"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            cursor: currentCardIndex === 0 ? "default" : "pointer",
            opacity: currentCardIndex === 0 ? 0.2 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.15s",
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--tumbo-text, #111)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* X — skip to next section */}
        <button
          onClick={handleSwipeLeft}
          aria-label={isEveryClassSection ? "Skip card" : "Next section"}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "1.5px solid rgba(0,0,0,0.1)",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--tumbo-text, #111)" strokeWidth={2} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Bookmark — save */}
        <button
          onClick={handleSwipeRight}
          aria-label="Save class"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: `1.5px solid ${isCardSaved ? "var(--tumbo-primary, #E8530E)" : "rgba(0,0,0,0.1)"}`,
            background: isCardSaved ? "var(--tumbo-primary, #E8530E)" : "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease",
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill={isCardSaved ? "#fff" : "none"} stroke={isCardSaved ? "#fff" : "var(--tumbo-text, #111)"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* → Next card */}
        <button
          onClick={goToNextCard}
          disabled={currentCardIndex >= currentItems.length - 1}
          aria-label="Next card"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            cursor: currentCardIndex >= currentItems.length - 1 ? "default" : "pointer",
            opacity: currentCardIndex >= currentItems.length - 1 ? 0.2 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.15s",
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--tumbo-text, #111)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Filter button handled by the existing FloatingFilterFAB in explore-browse-v2 */}

      {/* ── Subtle hint — first visit only ── */}
      {currentCardIndex === 0 && currentRailIndex === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.4,
            fontSize: 11,
            color: "var(--tumbo-label, #888)",
          }}
        />
      )}

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
