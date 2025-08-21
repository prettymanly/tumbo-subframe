"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { CustomClassCard } from "@/components/ui/class-card";
import ClassFilterSidebarIntegrated from "@/components/ui/class-filter-sidebar-integrated";
import { FilterState } from "@/components/ui/filter-chips";
import FilterChips from "@/components/ui/filter-chips";
// import { getCategoryTags, getTagsByType, searchClasses } from "@/lib/supabase/tags";
// import { Tag, TagType, TAG_TYPES } from "@/lib/types/tags";

// Netflix-style scrollable section component
interface ScrollableSectionProps {
  title: string;
  description: string;
  classes: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    badges: string[];
    href: string;
  }>;
  bookmarkedClasses: Set<string>;
  toggleBookmark: (classId: string) => void;
  tags?: any[];
}

function ScrollableSection({ title, description, classes, bookmarkedClasses, toggleBookmark }: ScrollableSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 320; // Width of one card + gap
      let newScrollLeft = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      
      // Ensure we don't scroll beyond bounds
      if (direction === 'right' && newScrollLeft > container.scrollWidth - container.clientWidth) {
        newScrollLeft = container.scrollWidth - container.clientWidth;
      } else if (direction === 'left' && newScrollLeft < 0) {
        newScrollLeft = 0;
      }
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex flex-col items-start gap-2 px-4 md:px-6 lg:px-10">
        <span className="text-heading-2 font-heading-2 text-default-font">
          {title}
        </span>
        <span className="text-body font-body text-default-font">
          {description}
        </span>
      </div>
      <div className="relative w-full">
        {/* Scrollable Container with fixed width */}
        <div className="relative w-full overflow-hidden">
          {/* Left Arrow - positioned at left edge of container */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white opacity-100 hover:bg-black/90 transition-all duration-200 shadow-lg"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right Arrow - positioned at right edge of container */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white opacity-100 hover:bg-black/90 transition-all duration-200 shadow-lg"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Gradient overlays to fade content behind arrows */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-default-background to-transparent z-10 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-default-background to-transparent z-10 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
          
          {/* Scrollable content container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 lg:px-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {classes.map((classItem) => (
              <div key={classItem.id} className="flex-none w-80">
                <CustomClassCard
                  id={classItem.id}
                  title={classItem.title}
                  description={classItem.description}
                  image={classItem.image}
                  badges={classItem.badges}
                  href={classItem.href}
                  isBookmarked={bookmarkedClasses.has(classItem.id)}
                  onBookmarkToggle={toggleBookmark}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassDirectoryPage() {
  // Class data - in real app this would come from Supabase
  const classes = [
    {
      id: "creative-little-architects",
      title: "Creative Little Architects",
      description: "Build whimsical cities from cardboard, clay, and imagination.",
      image: "/photos/classes/art_01.jpg",
      badges: ["Art & Design", "Project-Based Learning", "Hands-on", "Small Group"],
      href: "/classes/creative-little-architects"
    },
    {
      id: "story-sketch-club", 
      title: "Story & Sketch Club",
      description: "Turn your favourite tales into illustrated masterpieces.",
      image: "/photos/classes/art_02.jpg",
      badges: ["Creative Writing", "Visual Arts", "Story-Driven Learning", "Imaginative"],
      href: "/classes/story-sketch-club"
    },
    {
      id: "clay-colour-studio",
      title: "Clay & Colour Studio", 
      description: "For kids that find joy in shaping, smoothing, and painting their own creations.",
      image: "/photos/classes/art_03.png",
      badges: ["Pottery", "Painting", "Tactile", "Fine Motor Skills"],
      href: "/classes/clay-colour-studio"
    },
    {
      id: "young-innovators-lab",
      title: "Young Innovators Lab",
      description: "Prototype real solutions to real-world problems, kids style!",
      image: "/photos/classes/science_01.jpg",
      badges: ["STEM & Tech", "Problem-Solving", "Project-Based", "Critical Thinking"],
      href: "/classes/young-innovators-lab"
    },
    {
      id: "kidtrepreneurs-market",
      title: "Kidtrepreneurs Market Day",
      description: "Create, price, and sell your own products at a mini market.",
      image: "/photos/classes/play_01.jpg",
      badges: ["Entrepreneurship", "Collaborative", "Real-World Skills", "Confidence Building"],
      href: "/classes/kidtrepreneurs-market"
    },
    {
      id: "junior-community-reporters",
      title: "Junior Community Reporters",
      description: "For kids that want to ask questions, find answers, and share the story.",
      image: "/photos/classes/explore_01.jpg",
      badges: ["Communication", "Critical Thinking", "Community", "Inquiry-Based"],
      href: "/classes/junior-community-reporters"
    },
    {
      id: "outdoor-adventure-club",
      title: "Outdoor Adventure Club",
      description: "Explore nature through hiking, camping, and outdoor skills.",
      image: "/photos/classes/outdoor_01.jpg",
      badges: ["Nature & Outdoor", "High Energy", "Movement-Based", "Environmental Awareness"],
      href: "/classes/outdoor-adventure-club"
    },
    {
      id: "robotics-workshop",
      title: "Robotics Workshop",
      description: "Build and program robots while learning engineering principles.",
      image: "/photos/classes/robotics_01.png",
      badges: ["Robotics", "Coding", "Engineering", "Tech-Enabled"],
      href: "/classes/robotics-workshop"
    },
    {
      id: "drama-academy",
      title: "Drama Academy",
      description: "Express yourself through acting, improvisation, and storytelling.",
      image: "/photos/classes/art_01.jpg",
      badges: ["Performing Arts", "Confidence Building", "Creative Expression", "Public Speaking"],
      href: "/classes/drama-academy"
    },
    {
      id: "sports-champions",
      title: "Sports Champions",
      description: "Develop athletic skills and teamwork through various sports.",
      image: "/photos/classes/sports_01.jpg",
      badges: ["Sports", "Teamwork", "High Energy", "Competitive Environment"],
      href: "/classes/sports-champions"
    }
  ];

  // State to track bookmarked classes
  const [bookmarkedClasses, setBookmarkedClasses] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  
  // Filter state
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
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
  });
  
  // Filtered classes based on current filters and search
  const [filteredClasses, setFilteredClasses] = useState(classes);
  
  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('tumbo-class-filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setCurrentFilters(parsedFilters);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('tumbo-class-filters', JSON.stringify(currentFilters));
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [currentFilters]);

  // Filter classes based on current filters and search
  useEffect(() => {
    let filtered = [...classes];

    // Apply search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(classItem => 
        classItem.title.toLowerCase().includes(searchLower) ||
        classItem.description.toLowerCase().includes(searchLower) ||
        classItem.badges.some(badge => badge.toLowerCase().includes(searchLower))
      );
    }

    // Apply location filters
    if (currentFilters.locations.length > 0) {
      // This would integrate with real location data
      // For now, we'll skip location filtering
    }

    // Apply age range filters
    if (currentFilters.ageRanges.length > 0) {
      // This would integrate with real age data
      // For now, we'll skip age filtering
    }

    // Apply day filters
    if (currentFilters.days.length > 0) {
      // This would integrate with real schedule data
      // For now, we'll skip day filtering
    }

    // Apply time slot filters
    if (currentFilters.timeSlots.length > 0) {
      // This would integrate with real time data
      // For now, we'll skip time filtering
    }

    // Apply price filters
    if (currentFilters.priceRanges.length > 0) {
      // This would integrate with real price data
      // For now, we'll skip price filtering
    }

    // Apply content type filters
    if (currentFilters.contentTypes.length > 0) {
      filtered = filtered.filter(classItem =>
        currentFilters.contentTypes.some(contentType =>
          classItem.badges.some(badge => 
            badge.toLowerCase().includes(contentType.toLowerCase())
          )
        )
      );
    }

    // Apply experience style filters
    if (currentFilters.experienceStyles.length > 0) {
      filtered = filtered.filter(classItem =>
        currentFilters.experienceStyles.some(experience =>
          classItem.badges.some(badge => 
            badge.toLowerCase().includes(experience.toLowerCase())
          )
        )
      );
    }

    // Apply educational philosophy filters
    if (currentFilters.educationalPhilosophies.length > 0) {
      filtered = filtered.filter(classItem =>
        currentFilters.educationalPhilosophies.some(philosophy =>
          classItem.badges.some(badge => 
            badge.toLowerCase().includes(philosophy.toLowerCase())
          )
        )
      );
    }

    // Apply personality trait filters
    if (currentFilters.personalityTraits.length > 0) {
      filtered = filtered.filter(classItem =>
        currentFilters.personalityTraits.some(trait =>
          classItem.badges.some(badge => 
            badge.toLowerCase().includes(trait.toLowerCase())
          )
        )
      );
    }

    setFilteredClasses(filtered);
  }, [currentFilters, searchQuery]);

  // Mock category tags for now - will be replaced with real Supabase data
  const categoryTags = {
    content: [
      { id: "music", name: "Music", description: "Musical instruments and vocal training" },
      { id: "dance", name: "Dance", description: "Various dance styles and movement" },
      { id: "stem", name: "STEM & Tech", description: "Science, technology, engineering, and math" },
      { id: "sports", name: "Sports", description: "Physical activities and athletic training" },
      { id: "art", name: "Art & Design", description: "Creative arts and design projects" },
      { id: "language", name: "Languages", description: "Foreign language learning" }
    ],
    philosophy: [
      { id: "montessori", name: "Montessori", description: "Montessori-aligned learning approach" },
      { id: "reggio", name: "Reggio Emilia", description: "Reggio Emilia inspired learning" },
      { id: "project-based", name: "Project-Based", description: "Learning through hands-on projects" },
      { id: "play-based", name: "Play-Based", description: "Learning through play and exploration" }
    ],
    experience: [
      { id: "small-group", name: "Small Group", description: "Intimate learning environment" },
      { id: "outdoor", name: "Outdoor", description: "Nature-based learning experiences" },
      { id: "high-energy", name: "High Energy", description: "Active and movement-based activities" },
      { id: "collaborative", name: "Collaborative", description: "Team-based learning experiences" }
    ],
    child: [
      { id: "confidence", name: "Confidence Building", description: "Builds self-confidence and self-esteem" },
      { id: "leadership", name: "Leadership", description: "Develops leadership and initiative skills" },
      { id: "creativity", name: "Creative Expression", description: "Encourages creative thinking and expression" },
      { id: "problem-solving", name: "Problem Solving", description: "Enhances critical thinking abilities" }
    ]
  };
  
  const toggleBookmark = (classId: string) => {
    setBookmarkedClasses(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(classId)) {
        newBookmarks.delete(classId);
      } else {
        newBookmarks.add(classId);
      }
      return newBookmarks;
    });
  };
  
  const handleTagClick = (tagId: string) => {
    // Find the tag to determine its type
    let tagType: keyof FilterState | null = null;
    let tagName = '';
    
    for (const [type, tags] of Object.entries(categoryTags)) {
      const foundTag = tags.find(tag => tag.id === tagId);
      if (foundTag) {
        // Map category tag types to FilterState properties
        switch (type) {
          case 'content':
            tagType = 'contentTypes';
            break;
          case 'philosophy':
            tagType = 'educationalPhilosophies';
            break;
          case 'experience':
            tagType = 'experienceStyles';
            break;
          case 'child':
            tagType = 'personalityTraits';
            break;
        }
        tagName = foundTag.name;
        break;
      }
    }
    
    if (tagType) {
      setCurrentFilters(prev => {
        const currentArray = prev[tagType!] as string[];
        const isSelected = currentArray.includes(tagName);
        
        if (isSelected) {
          // Remove tag
          return {
            ...prev,
            [tagType!]: currentArray.filter(item => item !== tagName)
          };
        } else {
          // Add tag
          return {
            ...prev,
            [tagType!]: [...currentArray, tagName]
          };
        }
      });
      
      // Also update selectedTags for visual feedback
      setSelectedTags(prev => {
        if (prev.includes(tagId)) {
          return prev.filter(id => id !== tagId);
        } else {
          return [...prev, tagId];
        }
      });
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear search terms from filters when search is cleared
    if (!query.trim() && currentFilters.searchTerms.length > 0) {
      setCurrentFilters(prev => ({
        ...prev,
        searchTerms: []
      }));
    }
  };

  // Memoize the filter change callback to prevent unnecessary re-renders
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setCurrentFilters(newFilters);
  }, []);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && filterSidebarOpen) {
        setFilterSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [filterSidebarOpen]);



  return (
    <ModernPageLayout>
      {/* Page Structure:
          - Header Section (title + search & filter elements)
          - Content Section (all class card rows as subsections)
      */}
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-start" style={{ gap: '30px' }}>
          {/* Header Section - Title + Search & Filter */}
          <div className="flex w-full flex-col items-start gap-6 px-4 md:px-6 lg:px-10 py-12">
            {/* Page Title */}
            <span className="w-full text-heading-1 font-heading-1 text-default-font mobile:text-heading-1 mobile:font-heading-1">
              Browse All Classes
            </span>
            
            {/* Search and Filter Elements */}
            <div className="flex w-full flex-col items-start gap-4">
              {/* Search Bar and Filters Row */}
              <div className="flex w-full items-center gap-3">
                {/* Filter Button */}
                <button 
                  className="flex items-center gap-2 px-4 py-3 bg-transparent rounded-full text-gray-700 transition-all duration-200" 
                  style={{ 
                    border: filterSidebarOpen ? '1.5px solid #000000' : '1.5px solid #F3F1ED'
                  }}
                  onMouseEnter={(e) => {
                    if (!filterSidebarOpen) {
                      e.currentTarget.style.borderColor = '#000000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!filterSidebarOpen) {
                      e.currentTarget.style.borderColor = '#F3F1ED';
                    }
                  }}
                  onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
                >
                  {filterSidebarOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M7 8h10M9 13h6M11 18h2" />
                    </svg>
                  )}
                  Filter
                </button>
                
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    style={{ backgroundColor: '#F3F1ED' }}
                  />
                </div>
              </div>
              
              {/* Category Tabs */}
              <div className="flex w-full items-center gap-2 overflow-x-auto category-tabs-scroll">
                {/* Content Tags */}
                {categoryTags.content?.slice(0, 6).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? '#7E401A' : 'transparent',
                      ':hover': selectedTags.includes(tag.id) ? {} : { backgroundColor: '#E2D6C7' }
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = '#E2D6C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={tag.description}
                  >
                    {tag.name}
                  </button>
                ))}
                
                {/* Philosophy Tags */}
                {categoryTags.philosophy?.slice(0, 4).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? '#FF3C00' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = '#E2D6C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={tag.description}
                  >
                    {tag.name}
                  </button>
                ))}
                
                {/* Experience Tags */}
                {categoryTags.experience?.slice(0, 4).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? '#F1B313' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = '#E2D6C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={tag.description}
                  >
                    {tag.name}
                  </button>
                ))}
                
                {/* Child Tags */}
                {categoryTags.child?.slice(0, 4).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? '#FF6966' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = '#E2D6C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTags.includes(tag.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={tag.description}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          

          

        </div>
      </div>
      
      {/* Filter Sidebar */}
      <ClassFilterSidebarIntegrated
        open={filterSidebarOpen}
        onOpenChange={setFilterSidebarOpen}
        currentFilters={currentFilters}
        onFiltersChange={handleFiltersChange}
      >
        <div className="flex w-full flex-col items-start gap-6">
          {/* Filter Chips */}
          <FilterChips
            filters={currentFilters}
            onRemoveFilter={(filterType, value) => {
              setCurrentFilters(prev => ({
                ...prev,
                [filterType]: (prev[filterType] as string[]).filter(item => item !== value)
              }));
            }}
            onClearAll={() => {
              setCurrentFilters({
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
              });
            }}
          />

          {/* Content Section */}
          <div className="flex w-full flex-col items-start gap-12" style={{ gap: '30px' }}>
            {currentFilters.locations.length > 0 || 
             currentFilters.ageRanges.length > 0 || 
             currentFilters.days.length > 0 || 
             currentFilters.timeSlots.length > 0 || 
             currentFilters.priceRanges.length > 0 || 
             currentFilters.contentTypes.length > 0 || 
             currentFilters.experienceStyles.length > 0 || 
             currentFilters.educationalPhilosophies.length > 0 || 
             currentFilters.personalityTraits.length > 0 || 
             currentFilters.searchTerms.length > 0 ? (
              // Filtered Results Section
              <ScrollableSection
                title={`${filteredClasses.length} Class${filteredClasses.length !== 1 ? 'es' : ''} Found`}
                description="Results based on your selected filters"
                classes={filteredClasses}
                bookmarkedClasses={bookmarkedClasses}
                toggleBookmark={toggleBookmark}
              />
            ) : (
              <>
                {/* Recommended for Emma Subsection */}
                <ScrollableSection
                  title="Recommended for Emma"
                  description="Handpicked classes based on Emma's interests and developmental stage"
                  classes={classes.slice(0, 6)}
                  bookmarkedClasses={bookmarkedClasses}
                  toggleBookmark={toggleBookmark}
                />
                {/* Popular This Week Subsection */}
                <ScrollableSection
                  title="Popular This Week"
                  description="Classes that other parents are loving right now"
                  classes={classes.slice(2, 8)}
                  bookmarkedClasses={bookmarkedClasses}
                  toggleBookmark={toggleBookmark}
                />
                {/* All Classes Subsection */}
                <ScrollableSection
                  title="All Classes"
                  description="Explore our complete collection of enrichment classes"
                  classes={classes}
                  bookmarkedClasses={bookmarkedClasses}
                  toggleBookmark={toggleBookmark}
                />
              </>
            )}
          </div>
        </div>
      </ClassFilterSidebarIntegrated>
    </ModernPageLayout>
  );
}

export default ClassDirectoryPage;