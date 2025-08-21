"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, X, Search, MapPin, Clock, DollarSign, Tag, Users, Brain, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFiltersChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  locations: string[];
  ageRanges: string[];
  days: string[];
  timeSlots: string[];
  priceRanges: string[];
  contentTypes: string[];
  experienceStyles: string[];
  educationalPhilosophies: string[];
  personalityTraits: string[];
  searchTerms: string[];
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
  );
}

function ClassFilterSidebar({ open, onOpenChange, onFiltersChange, currentFilters }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [searchQueries, setSearchQueries] = useState({
    contentTypes: "",
    experienceStyles: "",
    educationalPhilosophies: "",
    personalityTraits: ""
  });

  // Update parent when filters change (but not on initial mount)
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Helper function to toggle selection
  const toggleSelection = (array: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  // Helper function to get tag color
  const getTagColor = (tagName: string, isSelected: boolean) => {
    if (!isSelected) return 'transparent';
    
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
    };
    setFilters(emptyFilters);
    setSearchQueries({
      contentTypes: "",
      experienceStyles: "",
      educationalPhilosophies: "",
      personalityTraits: ""
    });
  };

  // Render tag list with "See more" functionality
  const renderTagList = (tags: string[], selectedTags: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, maxVisible: number = 6) => {
    const [showAll, setShowAll] = useState(false);
    const visibleTags = showAll ? tags : tags.slice(0, maxVisible);
    const hasMore = tags.length > maxVisible;

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleSelection(selectedTags, tag, setter)}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-700"
          >
            {showAll ? 'Show Less' : `See ${tags.length - maxVisible} More`}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl font-semibold">Filter Classes</SheetTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </SheetHeader>

        <div className="space-y-6">
          {/* Location */}
          <CollapsibleSection title="Location" icon={<MapPin className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[
                'Central Singapore', 'North Singapore', 'South Singapore', 'East Singapore', 'West Singapore',
                'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Panjang', 'Bukit Timah',
                'Choa Chu Kang', 'Clementi', 'Geylang', 'Hougang', 'Jurong East', 'Jurong West', 'Kallang',
                'Marine Parade', 'Pasir Ris', 'Punggol', 'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon',
                'Tampines', 'Toa Payoh', 'Woodlands', 'Yishun'
              ].map((region) => (
                <label key={region} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1">
                  <input
                    type="checkbox"
                    checked={filters.locations.includes(region)}
                    onChange={() => toggleSelection(filters.locations, region, (value) => setFilters({...filters, locations: value}))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </CollapsibleSection>

          {/* Age Range */}
          <CollapsibleSection title="Age Range" icon={<Users className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {['2-3', '3-4', '5-6', '7-9', '10-12', '13-14', '15-16'].map((ageRange) => (
                <button
                  key={ageRange}
                  onClick={() => toggleSelection(filters.ageRanges, ageRange, (value) => setFilters({...filters, ageRanges: value}))}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.ageRanges.includes(ageRange)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: filters.ageRanges.includes(ageRange) ? '#7E401A' : 'transparent',
                    border: filters.ageRanges.includes(ageRange) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {ageRange}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Day & Time */}
          <CollapsibleSection title="Day & Time" icon={<Clock className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleSelection(filters.days, day, (value) => setFilters({...filters, days: value}))}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.days.includes(day)
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: filters.days.includes(day) ? '#F1B313' : 'transparent',
                      border: filters.days.includes(day) ? 'none' : '1px solid #E2D6C7'
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Morning', icon: '🌅' },
                  { name: 'Afternoon', icon: '☀️' },
                  { name: 'Evening', icon: '🌙' }
                ].map((timeSlot) => (
                  <button
                    key={timeSlot.name}
                    onClick={() => toggleSelection(filters.timeSlots, timeSlot.name, (value) => setFilters({...filters, timeSlots: value}))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.timeSlots.includes(timeSlot.name)
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: filters.timeSlots.includes(timeSlot.name) ? '#F1B313' : 'transparent',
                      border: filters.timeSlots.includes(timeSlot.name) ? 'none' : '1px solid #E2D6C7'
                    }}
                  >
                    <span>{timeSlot.icon}</span>
                    {timeSlot.name}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Price Range */}
          <CollapsibleSection title="Price Range" icon={<DollarSign className="h-5 w-5 text-gray-500" />} defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {['Under $25', '$25 - $50', '$50 - $75', '$75 - $100', '$100+'].map((priceBadge) => (
                <button
                  key={priceBadge}
                  onClick={() => toggleSelection(filters.priceRanges, priceBadge, (value) => setFilters({...filters, priceRanges: value}))}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.priceRanges.includes(priceBadge)
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor: filters.priceRanges.includes(priceBadge) ? '#7E401A' : 'transparent',
                    border: filters.priceRanges.includes(priceBadge) ? 'none' : '1px solid #E2D6C7'
                  }}
                >
                  {priceBadge}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Content Type */}
          <CollapsibleSection title="Content Type" icon={<Tag className="h-5 w-5 text-gray-500" />} defaultOpen={false}>
            <div className="space-y-3">
              <Input
                placeholder="Search content types..."
                value={searchQueries.contentTypes}
                onChange={(e) => setSearchQueries({...searchQueries, contentTypes: e.target.value})}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
              {renderTagList([
                'Music', 'Dance', 'Art', 'Creative', 'Design', 'STEM', 'Tech', 'Robotics', 'Coding', 'Science', 
                'Math', 'Language', 'Writing', 'Reading', 'Sports', 'Pottery', 'Painting', 'Visual', 'Drawing', 
                'Sculpture', 'Crafts', 'Ballet', 'Mandarin', 'Drama', 'Theater', 'Photography', 'Film', 'Animation',
                'Digital Art', 'Graphic Design', 'Fashion Design', 'Architecture', 'Engineering', 'Chemistry', 'Physics',
                'Biology', 'Astronomy', 'Geology', 'Computer Science', 'Web Development', 'App Development', 'Game Design'
              ], filters.contentTypes, (value) => setFilters({...filters, contentTypes: value}))}
            </div>
          </CollapsibleSection>

          {/* Experience Style */}
          <CollapsibleSection title="Experience Style" icon={<Users className="h-5 w-5 text-gray-500" />} defaultOpen={false}>
            <div className="space-y-3">
              <Input
                placeholder="Search experience styles..."
                value={searchQueries.experienceStyles}
                onChange={(e) => setSearchQueries({...searchQueries, experienceStyles: e.target.value})}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
              {renderTagList([
                '1-to-1', 'Small Group', 'Large Group', 'Movement-Based', 'High-Energy', 'Quiet', 'Sensory', 'Outdoor',
                'Tactile', 'Messy', 'Fast-Paced', 'Collaborative', 'Competitive', 'Hands-on', 'Interactive', 'Immersive',
                'Instructor-Led', 'Peer-Driven', 'Project-Based', 'Improv-Style', 'Creative Flow', 'Highly Structured',
                'Curriculum-Driven', 'Open-Ended Exploration', 'Competitive Environment', 'Collaborative Setting'
              ], filters.experienceStyles, (value) => setFilters({...filters, experienceStyles: value}))}
            </div>
          </CollapsibleSection>

          {/* Educational Philosophy */}
          <CollapsibleSection title="Educational Philosophy" icon={<Brain className="h-5 w-5 text-gray-500" />} defaultOpen={false}>
            <div className="space-y-3">
              <Input
                placeholder="Search educational philosophies..."
                value={searchQueries.educationalPhilosophies}
                onChange={(e) => setSearchQueries({...searchQueries, educationalPhilosophies: e.target.value})}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
              {renderTagList([
                'Montessori-Aligned', 'Reggio Emilia Inspired', 'Waldorf / Steiner', 'IB-Inspired Learning', 
                'Project-Based Learning', 'Play-Based Learning', 'STEM / STEAM-Focused', '21st-Century Skills', 
                'Future Skills', 'Mandarin-Speaking', 'Malay-Led', 'Tamil-Led', 'Bilingual Instruction', 
                'Chinese Heritage Arts', 'Malay Heritage Arts', 'Indian Heritage Arts', 'Global Perspectives', 
                'Religious Ethos', 'Islamic Ethos', 'Christian Values', 'Buddhist Philosophy', 'Emotional Literacy Focus', 
                'Resilience-Building', 'Anti-Burnout', 'Balanced Learning', 'Confidence-Building', 'Collaboration & Teamwork', 
                'Critical Thinking', 'Problem-Solving', 'Independence', 'Self-Directed', 'Parent-Child Co-Learning', 
                'Neurodiverse-Inclusive', 'Equity', 'Access-Oriented', 'Environmental Awareness', 'Sustainability'
              ], filters.educationalPhilosophies, (value) => setFilters({...filters, educationalPhilosophies: value}))}
            </div>
          </CollapsibleSection>

          {/* Personality Fit */}
          <CollapsibleSection title="Personality Fit" icon={<Heart className="h-5 w-5 text-gray-500" />} defaultOpen={false}>
            <div className="space-y-3">
              <Input
                placeholder="Search personality traits..."
                value={searchQueries.personalityTraits}
                onChange={(e) => setSearchQueries({...searchQueries, personalityTraits: e.target.value})}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
              {renderTagList([
                'Shy in Groups', 'Outgoing & Expressive', 'Sensitive & Thoughtful', 'Restless / Needs Movement', 
                'Detail-Oriented', 'Highly Curious', 'Imaginative Dreamer', 'Resilient / Persistent', 'Easily Distracted', 
                'Thrives on Routine', 'Visual Learner', 'Auditory Learner', 'Kinesthetic Learner', 'Observational Learner', 
                'Experimental / Trial-and-Error Learner', 'Story-Driven Learner', 'Tech-Oriented Learner', 'Loves Team Activities', 
                'Prefers One-on-One Attention', 'Small Group Comfort', 'Enjoys Large Group Energy', 'Peer-Motivated', 
                'Independent Worker', 'Parent-Child Co-Learning', 'Builds Confidence', 'Improves Focus & Self-Regulation', 
                'Develops Resilience', 'Encourages Risk-Taking / Exploration', 'Emotional Literacy', 'Communication & Speaking Up', 
                'Leadership / Taking Initiative', 'Collaboration & Empathy', 'Problem-Solving & Critical Thinking', 'Stress Management / Anti-Burnout'
              ], filters.personalityTraits, (value) => setFilters({...filters, personalityTraits: value}))}
            </div>
          </CollapsibleSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ClassFilterSidebar;
