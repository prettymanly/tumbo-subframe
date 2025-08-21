"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, MapPin, Calendar, Clock, DollarSign, Palette, Zap, Brain, User, X } from "lucide-react"
import { FilterState } from "./filter-chips"

interface ClassFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFiltersChange: (filters: FilterState) => void
  currentFilters: FilterState
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 text-left hover:bg-gray-50 rounded-lg px-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

function ClassFilterSidebar({ open, onOpenChange, onFiltersChange, currentFilters }: ClassFilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)
  const isInitialMount = useRef(true)

  // Update parent when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  // Helper function to toggle selection in filters
  const toggleFilter = (filterKey: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterKey] as string[]
      if (currentArray.includes(value)) {
        return { ...prev, [filterKey]: currentArray.filter(item => item !== value) }
      } else {
        return { ...prev, [filterKey]: [...currentArray, value] }
      }
    })
  }

  // Helper function to get tag color
  const getTagColor = (tagName: string, isSelected: boolean) => {
    if (!isSelected) return 'transparent'
    
    const tagLower = tagName.toLowerCase()
    
    // Content Tags - Brown (#7E401A)
    if (['music', 'dance', 'art', 'creative', 'design', 'stem', 'tech', 'robotics', 'coding', 'science', 'math', 'language', 'writing', 'reading', 'sports', 'pottery', 'painting', 'visual', 'drawing', 'sculpture', 'crafts'].some(keyword => tagLower.includes(keyword))) {
      return '#7E401A'
    } 
    // Philosophy Tags - Red/Orange (#FF3C00)
    else if (['montessori', 'reggio', 'waldorf', 'project-based', 'play-based', 'bilingual', 'cultural', 'heritage', 'philosophy', 'values', 'learning', 'story-driven', 'imaginative', 'mindful'].some(keyword => tagLower.includes(keyword))) {
      return '#FF3C00'
    } 
    // Experience Tags - Yellow/Amber (#F1B313)
    else if (['small group', 'large group', 'one-on-one', 'outdoor', 'tactile', 'messy', 'high energy', 'fast-paced', 'collaborative', 'competitive', 'hands-on', 'interactive', 'immersive', 'sensory'].some(keyword => tagLower.includes(keyword))) {
      return '#F1B313'
    } 
    // Child Tags - Coral/Pink (#FF6966)
    else if (['confidence', 'leadership', 'creativity', 'problem-solving', 'shy', 'outgoing', 'visual learner', 'kinesthetic', 'focus', 'communication', 'critical thinking', 'fine motor', 'gross motor', 'social skills', 'emotional', 'self-expression'].some(keyword => tagLower.includes(keyword))) {
      return '#FF6966'
    } 
    // Default to Content Tags color
    else {
      return '#7E401A'
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      locations: [],
      ageRanges: [],
      days: [],
      timeSlots: [],
      priceRanges: [],
      contentTypes: [],
      experienceStyles: [],
      educationalPhilosophies: [],
      personalityTraits: [],
      searchTerms: []
    }
    setFilters(emptyFilters)
  }

  // Render tag list with "See more" functionality
  const renderTagList = (tags: string[], selectedTags: string[], maxVisible: number = 6) => {
    const [showAll, setShowAll] = useState(false)
    const visibleTags = showAll ? tags : tags.slice(0, maxVisible)
    const hasMore = tags.length > maxVisible

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleFilter('contentTypes', tag)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTags.includes(tag)
                  ? 'text-white'
                  : 'text-gray-700 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: getTagColor(tag, selectedTags.includes(tag)),
                border: selectedTags.includes(tag) ? 'none' : '1px solid #E2D6C7'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? 'See less' : `See ${tags.length - maxVisible} more`}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Filter Classes</h2>
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <CollapsibleSection title="Location" icon={<MapPin className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          <div className="space-y-2">
            {['Central', 'East', 'West', 'North', 'South'].map((location) => (
              <label key={location} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(location)}
                  onChange={() => toggleFilter('locations', location)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{location}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Age Range */}
        <CollapsibleSection title="Age Range" icon={<User className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          <div className="space-y-2">
            {['3-5 years', '6-8 years', '9-12 years', '13+ years'].map((ageRange) => (
              <label key={ageRange} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.ageRanges.includes(ageRange)}
                  onChange={() => toggleFilter('ageRanges', ageRange)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{ageRange}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Day & Time */}
        <CollapsibleSection title="Day & Time" icon={<Calendar className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Days</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.days.includes(day)}
                      onChange={() => toggleFilter('days', day)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Time Slots</h4>
              <div className="space-y-2">
                {['Morning (9AM-12PM)', 'Afternoon (12PM-3PM)', 'Evening (3PM-6PM)', 'Late Evening (6PM+)'].map((timeSlot) => (
                  <label key={timeSlot} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.timeSlots.includes(timeSlot)}
                      onChange={() => toggleFilter('timeSlots', timeSlot)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{timeSlot}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Price Range */}
        <CollapsibleSection title="Price Range" icon={<DollarSign className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          <div className="space-y-2">
            {['Free', '$1-50', '$51-100', '$101-200', '$200+'].map((priceRange) => (
              <label key={priceRange} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.priceRanges.includes(priceRange)}
                  onChange={() => toggleFilter('priceRanges', priceRange)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{priceRange}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Content Type */}
        <CollapsibleSection title="Content Type" icon={<Palette className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          {renderTagList(
            ['Music', 'Dance', 'STEM & Tech', 'Sports', 'Art & Design', 'Languages', 'Creative Writing', 'Visual Arts', 'Robotics', 'Coding', 'Science', 'Math'],
            filters.contentTypes
          )}
        </CollapsibleSection>

        {/* Experience Style */}
        <CollapsibleSection title="Experience Style" icon={<Zap className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          {renderTagList(
            ['Small Group', 'Outdoor', 'High Energy', 'Collaborative', 'One-on-One', 'Large Group', 'Tactile', 'Messy', 'Fast-Paced', 'Hands-on', 'Interactive', 'Immersive'],
            filters.experienceStyles
          )}
        </CollapsibleSection>

        {/* Educational Philosophy */}
        <CollapsibleSection title="Educational Philosophy" icon={<Brain className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          {renderTagList(
            ['Montessori', 'Reggio Emilia', 'Project-Based', 'Play-Based', 'Waldorf', 'IB-Inspired', 'STEM/STEAM', '21st-Century Skills', 'Bilingual', 'Cultural Heritage', 'Islamic Ethos', 'Christian Values'],
            filters.educationalPhilosophies
          )}
        </CollapsibleSection>

        {/* Personality Fit */}
        <CollapsibleSection title="Personality Fit" icon={<User className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
          {renderTagList(
            ['Confidence Building', 'Leadership', 'Creative Expression', 'Problem Solving', 'Shy in Groups', 'Outgoing & Expressive', 'Visual Learner', 'Kinesthetic', 'Focus & Self-Regulation', 'Communication', 'Critical Thinking', 'Social Skills'],
            filters.personalityTraits
          )}
        </CollapsibleSection>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={clearAllFilters}
          className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}

export default ClassFilterSidebar
