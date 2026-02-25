"use client"

import { useState, useEffect } from "react"

export interface MPFilterState {
  tags: string[]
  ageMin: number
  ageMax: number
  location: string
  priceMax: number
}

export const MP_DEFAULT_FILTERS: MPFilterState = {
  tags: [],
  ageMin: 0,
  ageMax: 18,
  location: "All Areas",
  priceMax: 200,
}

const FILTER_TAGS = [
  "Arts & Crafts", "Music", "Sports", "Dance", "Drama",
  "Coding", "Math", "Science", "Cooking", "Yoga",
  "Swimming", "Martial Arts", "Chess", "Language", "Nature",
]

const LOCATIONS = [
  "All Areas", "Bukit Timah", "Orchard", "Tampines",
  "Jurong", "Woodlands", "Bedok", "Toa Payoh",
]

interface MPFilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: MPFilterState
  onChange: (f: MPFilterState) => void
}

export function MPFilterSidebar({ isOpen, onClose, filters, onChange }: MPFilterSidebarProps) {
  const [local, setLocal] = useState<MPFilterState>(filters)

  useEffect(() => {
    setLocal(filters)
  }, [filters])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleTag = (tag: string) => {
    setLocal((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const apply = () => {
    onChange(local)
    onClose()
  }

  const reset = () => {
    setLocal(MP_DEFAULT_FILTERS)
    onChange(MP_DEFAULT_FILTERS)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 100,
          backdropFilter: "blur(2px)",
          animation: "mpFadeIn 0.2s ease",
        }}
      />

      {/* Sidebar panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: "90vw",
          background: "#FDFBF7",
          zIndex: 101,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          animation: "mpSlideIn 0.3s cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 28px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "#000" }}>
              Filters
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
              Narrow down your search
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Category */}
          <div>
            <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, color: "rgba(0,0,0,0.4)", display: "block", marginBottom: 14 }}>
              Category
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FILTER_TAGS.map((tag) => {
                const active = local.tags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 100,
                      fontSize: 13,
                      fontWeight: 500,
                      border: active ? "1.5px solid #FF4400" : "1.5px solid rgba(0,0,0,0.15)",
                      background: active ? "#FF4400" : "transparent",
                      color: active ? "#fff" : "#000",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Age range */}
          <div>
            <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, color: "rgba(0,0,0,0.4)", display: "block", marginBottom: 14 }}>
              Age Range
            </label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(0,0,0,0.35)" }}>
                  Min: {local.ageMin}
                </p>
                <input
                  type="range"
                  min={0}
                  max={18}
                  value={local.ageMin}
                  onChange={(e) => setLocal((prev) => ({ ...prev, ageMin: +e.target.value }))}
                  style={{ width: "100%", accentColor: "#FF4400" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(0,0,0,0.35)" }}>
                  Max: {local.ageMax}
                </p>
                <input
                  type="range"
                  min={0}
                  max={18}
                  value={local.ageMax}
                  onChange={(e) => setLocal((prev) => ({ ...prev, ageMax: +e.target.value }))}
                  style={{ width: "100%", accentColor: "#FF4400" }}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, color: "rgba(0,0,0,0.4)", display: "block", marginBottom: 14 }}>
              Location
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LOCATIONS.map((loc) => {
                const active = local.location === loc
                return (
                  <button
                    key={loc}
                    onClick={() => setLocal((prev) => ({ ...prev, location: loc }))}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 100,
                      fontSize: 13,
                      fontWeight: 500,
                      border: active ? "1.5px solid #000" : "1.5px solid rgba(0,0,0,0.15)",
                      background: active ? "#000" : "transparent",
                      color: active ? "#fff" : "#000",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    {loc}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Max price */}
          <div>
            <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, color: "rgba(0,0,0,0.4)", display: "block", marginBottom: 14 }}>
              Max Price
            </label>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={local.priceMax}
              onChange={(e) => setLocal((prev) => ({ ...prev, priceMax: +e.target.value }))}
              style={{ width: "100%", accentColor: "#FF4400" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(0,0,0,0.35)", marginTop: 4 }}>
              <span>$0</span>
              <span>{local.priceMax >= 200 ? "S$200+" : `S$${local.priceMax}`}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px 28px",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            gap: 12,
          }}
        >
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 100,
              border: "1.5px solid rgba(0,0,0,0.15)",
              background: "transparent",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              color: "#000",
              fontFamily: "inherit",
            }}
          >
            Reset
          </button>
          <button
            onClick={apply}
            style={{
              flex: 2,
              padding: 12,
              borderRadius: 100,
              border: "none",
              background: "#FF4400",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Apply Filters
            <span
              style={{
                width: 28,
                height: 28,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes mpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mpSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
