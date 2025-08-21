"use client";

import React from "react";
import { X } from "lucide-react";
import { FilterState } from "./class-filter-sidebar";

interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (filterType: keyof FilterState, value: string) => void;
  onClearAll: () => void;
}

function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  // Helper function to get tag color
  const getTagColor = (tagName: string) => {
    const tagLower = tagName.toLowerCase();
    
    // Content Tags - Brown (#7E401A)
    if (['music', 'dance', 'art', 'creative', 'design', 'stem', 'tech', 'robotics', 'coding', 'science', 'math', 'language', 'writing', 'reading', 'sports', 'pottery', 'painting', 'visual', 'drawing', 'sculpture', 'crafts'].some(keyword => tagLower.includes(keyword))) {
      return '#7E401A';
    } 
    // Philosophy Tags - Red/Orange (#FF3C00)
    else if (['montessori', 'reggio', 'waldorf', 'project-based', 'play-based', 'bilingual', 'cultural', 'heritage', 'philosophy', 'values', 'learning', 'story-driven', 'imaginative', 'mindful'].some(keyword => tagLower.includes(keyword))) {
      return '#FF3C00';
    } 
    // Experience Tags - Yellow/Amber (#F1B313)
    else if (['small group', 'large group', 'one-on-one', 'outdoor', 'tactile', 'messy', 'high energy', 'fast-paced', 'collaborative', 'competitive', 'hands-on', 'interactive', 'immersive', 'sensory'].some(keyword => tagLower.includes(keyword))) {
      return '#F1B313';
    } 
    // Child Tags - Coral/Pink (#FF6966)
    else if (['confidence', 'leadership', 'creativity', 'problem-solving', 'shy', 'outgoing', 'visual learner', 'kinesthetic', 'focus', 'communication', 'critical thinking', 'fine motor', 'gross motor', 'social skills', 'emotional', 'self-expression'].some(keyword => tagLower.includes(keyword))) {
      return '#FF6966';
    } 
    // Default to Content Tags color
    else {
      return '#7E401A';
    }
  };

  // Get all active filters
  const getAllActiveFilters = () => {
    const activeFilters: Array<{ type: keyof FilterState; value: string; label: string }> = [];
    
    // Helper function to add filters with proper labels
    const addFilters = (type: keyof FilterState, values: string[], labelPrefix: string) => {
      values.forEach(value => {
        activeFilters.push({
          type,
          value,
          label: `${labelPrefix}: ${value}`
        });
      });
    };

    addFilters('locations', filters.locations, 'Location');
    addFilters('ageRanges', filters.ageRanges, 'Age');
    addFilters('days', filters.days, 'Day');
    addFilters('timeSlots', filters.timeSlots, 'Time');
    addFilters('priceRanges', filters.priceRanges, 'Price');
    addFilters('contentTypes', filters.contentTypes, 'Content');
    addFilters('experienceStyles', filters.experienceStyles, 'Experience');
    addFilters('educationalPhilosophies', filters.educationalPhilosophies, 'Philosophy');
    addFilters('personalityTraits', filters.personalityTraits, 'Personality');
    addFilters('searchTerms', filters.searchTerms, 'Search');

    return activeFilters;
  };

  const activeFilters = getAllActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-start gap-4 px-4 md:px-6 lg:px-10">
      {/* Filter Header */}
      <div className="flex w-full items-center justify-between">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Filtered Results
        </span>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>
      
      {/* Filter Chips */}
      <div className="flex w-full flex-wrap items-center gap-2">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.type}-${filter.value}-${index}`}
            className="group flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
            style={{
              backgroundColor: getTagColor(filter.value),
              cursor: 'default'
            }}
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.type, filter.value)}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded-full p-0.5"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilterChips;
