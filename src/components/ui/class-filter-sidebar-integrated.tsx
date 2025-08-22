"use client"

import React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
  children
}: ClassFilterSidebarIntegratedProps) {
  return (
    <SidebarProvider defaultOpen={false} open={open} onOpenChange={onOpenChange}>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarContent>
          <ClassFilterSidebar
            open={open}
            onOpenChange={onOpenChange}
            onFiltersChange={onFiltersChange}
            currentFilters={currentFilters}
          />
        </SidebarContent>
      </Sidebar>
      
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

