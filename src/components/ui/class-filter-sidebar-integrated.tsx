"use client"

import React, { useEffect } from "react"
import ClassFilterSidebar from "./class-filter-sidebar"
import { FilterState } from "./filter-chips"

interface ClassFilterSidebarIntegratedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFiltersChange: (filters: FilterState) => void
  currentFilters: FilterState
  children: React.ReactNode
}

export default function ClassFilterSidebarIntegrated({
  open,
  onOpenChange,
  onFiltersChange,
  currentFilters,
  children,
}: ClassFilterSidebarIntegratedProps) {
  // Lock body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div className="relative w-full min-w-0">
      {/* Main content — always visible */}
      <div className="w-full min-w-0 overflow-x-hidden">{children}</div>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[340px] max-w-[85vw] bg-white shadow-2xl shadow-black/10 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ClassFilterSidebar
          open={open}
          onOpenChange={onOpenChange}
          onFiltersChange={onFiltersChange}
          currentFilters={currentFilters}
        />
      </div>
    </div>
  )
}
