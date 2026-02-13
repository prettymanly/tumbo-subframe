"use client"

import React, { useState, useEffect, useRef } from "react"
import { FilterState } from "./filter-chips"

interface ClassFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFiltersChange: (filters: FilterState) => void
  currentFilters: FilterState
}

// ── Icons (inline SVGs to avoid dependency) ──
function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IconChevron({ open, className = "w-4 h-4" }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Collapsible section ──
function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3.5 text-left group"
      >
        <span className="text-[14px] font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
          {title}
        </span>
        <IconChevron open={isOpen} className="w-4 h-4 text-gray-400" />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

// ── Custom checkbox ──
function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-2.5 py-1 cursor-pointer group text-left"
    >
      <div
        className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all duration-150 ${
          checked
            ? "bg-[var(--tumbo-orange)] border-[var(--tumbo-orange)]"
            : "border-gray-300 group-hover:border-gray-400"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-gray-600 group-hover:text-gray-800 transition-colors select-none">
        {label}
      </span>
    </button>
  )
}

// ── Tag pill ──
function FilterTag({
  label,
  selected,
  color,
  onClick,
}: {
  label: string
  selected: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 ${
        selected
          ? "text-white shadow-sm"
          : "text-gray-600 hover:text-gray-800 border border-neutral-200 hover:border-neutral-300 bg-white"
      }`}
      style={selected ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  )
}

// ── Color mapping for tag categories ──
const TAG_COLORS = {
  content: "#7E401A",
  philosophy: "#FF3C00",
  experience: "#F1B313",
  personality: "#FF6966",
} as const

function getTagColor(tagName: string, category: keyof typeof TAG_COLORS): string {
  return TAG_COLORS[category]
}

// ── Main component ──
export default function ClassFilterSidebar({
  open,
  onOpenChange,
  onFiltersChange,
  currentFilters,
}: ClassFilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const toggleFilter = (filterKey: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const arr = prev[filterKey] as string[]
      return {
        ...prev,
        [filterKey]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value],
      }
    })
  }

  const activeCount = Object.values(filters).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  )

  const clearAll = () => {
    setFilters({
      locations: [],
      ageRanges: [],
      days: [],
      timeSlots: [],
      priceRanges: [],
      contentTypes: [],
      experienceStyles: [],
      educationalPhilosophies: [],
      personalityTraits: [],
      searchTerms: [],
    })
  }

  // ── Tag list with "see more" ──
  function TagList({
    tags,
    selected,
    filterKey,
    color,
    max = 6,
  }: {
    tags: string[]
    selected: string[]
    filterKey: keyof FilterState
    color: string
    max?: number
  }) {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? tags : tags.slice(0, max)

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {visible.map((tag) => (
            <FilterTag
              key={tag}
              label={tag}
              selected={selected.includes(tag)}
              color={color}
              onClick={() => toggleFilter(filterKey, tag)}
            />
          ))}
        </div>
        {tags.length > max && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[12px] font-medium text-gray-400 hover:text-[var(--tumbo-orange)] transition-colors self-start"
          >
            {showAll ? "Show less" : `+${tags.length - max} more`}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <span className="text-[16px] font-bold text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--tumbo-orange)] text-white text-[11px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Close filters"
        >
          <IconX className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        <FilterSection title="Location" defaultOpen>
          <div className="flex flex-col gap-0.5">
            {["Central", "East", "West", "North", "South"].map((loc) => (
              <FilterCheckbox
                key={loc}
                label={loc}
                checked={filters.locations.includes(loc)}
                onChange={() => toggleFilter("locations", loc)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Age Range" defaultOpen>
          <div className="flex flex-col gap-0.5">
            {["3–5 years", "6–8 years", "9–12 years", "13+ years"].map((age) => (
              <FilterCheckbox
                key={age}
                label={age}
                checked={filters.ageRanges.includes(age)}
                onChange={() => toggleFilter("ageRanges", age)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Day">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
              (day) => (
                <FilterCheckbox
                  key={day}
                  label={day.slice(0, 3)}
                  checked={filters.days.includes(day)}
                  onChange={() => toggleFilter("days", day)}
                />
              )
            )}
          </div>
        </FilterSection>

        <FilterSection title="Time">
          <div className="flex flex-col gap-0.5">
            {[
              "Morning (9AM–12PM)",
              "Afternoon (12PM–3PM)",
              "Evening (3PM–6PM)",
              "Late (6PM+)",
            ].map((slot) => (
              <FilterCheckbox
                key={slot}
                label={slot}
                checked={filters.timeSlots.includes(slot)}
                onChange={() => toggleFilter("timeSlots", slot)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price Range">
          <div className="flex flex-col gap-0.5">
            {["Free", "$1–50", "$51–100", "$101–200", "$200+"].map((price) => (
              <FilterCheckbox
                key={price}
                label={price}
                checked={filters.priceRanges.includes(price)}
                onChange={() => toggleFilter("priceRanges", price)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Content Type">
          <TagList
            tags={[
              "Music", "Dance", "STEM & Tech", "Sports", "Art & Design",
              "Languages", "Creative Writing", "Visual Arts", "Robotics",
              "Coding", "Science", "Math",
            ]}
            selected={filters.contentTypes}
            filterKey="contentTypes"
            color={TAG_COLORS.content}
          />
        </FilterSection>

        <FilterSection title="Experience Style">
          <TagList
            tags={[
              "Small Group", "Outdoor", "High Energy", "Collaborative",
              "One-on-One", "Large Group", "Tactile", "Hands-on",
              "Interactive", "Immersive",
            ]}
            selected={filters.experienceStyles}
            filterKey="experienceStyles"
            color={TAG_COLORS.experience}
          />
        </FilterSection>

        <FilterSection title="Educational Philosophy">
          <TagList
            tags={[
              "Montessori", "Reggio Emilia", "Project-Based", "Play-Based",
              "Waldorf", "IB-Inspired", "STEM/STEAM", "Bilingual",
              "Cultural Heritage",
            ]}
            selected={filters.educationalPhilosophies}
            filterKey="educationalPhilosophies"
            color={TAG_COLORS.philosophy}
          />
        </FilterSection>

        <FilterSection title="Personality Fit">
          <TagList
            tags={[
              "Confidence Building", "Leadership", "Creative Expression",
              "Problem Solving", "Shy in Groups", "Visual Learner",
              "Kinesthetic", "Focus & Self-Regulation", "Social Skills",
            ]}
            selected={filters.personalityTraits}
            filterKey="personalityTraits"
            color={TAG_COLORS.personality}
          />
        </FilterSection>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-neutral-100 flex gap-3">
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:text-gray-700 hover:bg-neutral-50 transition-colors"
          >
            Clear all
          </button>
        )}
        <button
          onClick={() => onOpenChange(false)}
          className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity"
        >
          {activeCount > 0 ? `Show results` : "Done"}
        </button>
      </div>
    </div>
  )
}
