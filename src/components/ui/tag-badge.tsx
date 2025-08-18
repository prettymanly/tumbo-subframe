"use client";

import React from "react";
// import { Tag, TagType, getTagColor, getTagDisplayName } from "@/lib/types/tags";

interface TagBadgeProps {
  tag: any | string; // Using any for now until we have proper types
  className?: string;
  showTooltip?: boolean;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ 
  tag, 
  className = "",
  showTooltip = true 
}) => {
  // Handle string tags (fallback for existing badges)
  if (typeof tag === 'string') {
    return (
      <span 
        className={`bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium ${className}`}
      >
        {tag}
      </span>
    );
  }

  // Handle Tag or TagType objects
  const tagName = typeof tag === 'string' ? tag : tag.name || 'Unknown';
  const tagDescription = typeof tag === 'string' ? '' : (tag.description || '');
  
  // Mock tag colors for now - will be replaced with real colors from Supabase
  const getMockTagStyle = () => {
    // Simple color scheme based on tag name for demo
    const tagLower = tagName.toLowerCase();
    
    if (['music', 'dance', 'art', 'creative'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#3b82f6', color: '#ffffff', borderColor: '#3b82f6' }; // Blue
    } else if (['montessori', 'reggio', 'philosophy', 'values'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#10b981', color: '#ffffff', borderColor: '#10b981' }; // Green
    } else if (['small group', 'outdoor', 'high energy', 'collaborative'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#f59e0b', color: '#ffffff', borderColor: '#f59e0b' }; // Amber
    } else if (['confidence', 'leadership', 'creativity', 'problem-solving'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }; // Red
    } else {
      return { backgroundColor: '#6b7280', color: '#ffffff', borderColor: '#6b7280' }; // Gray default
    }
  };

  const tagStyle = getMockTagStyle();

  return (
    <span 
      className={`px-2 py-1 rounded text-xs font-medium border ${className}`}
      style={tagStyle}
      title={showTooltip && tagDescription ? tagDescription : undefined}
    >
      {tagName}
    </span>
  );
};

// Specialized badge components for different tag types
export const ContentTagBadge: React.FC<{ tag: any | string }> = ({ tag }) => (
  <TagBadge 
    tag={tag} 
    className="bg-blue-100 text-blue-800 border-blue-200"
  />
);

export const PhilosophyTagBadge: React.FC<{ tag: any | string }> = ({ tag }) => (
  <TagBadge 
    tag={tag} 
    className="bg-blue-100 text-blue-800 border-blue-200"
  />
);

export const ExperienceTagBadge: React.FC<{ tag: any | string }> = ({ tag }) => (
  <TagBadge 
    tag={tag} 
    className="bg-blue-100 text-blue-800 border-blue-200"
  />
);

export const ChildTagBadge: React.FC<{ tag: any | string }> = ({ tag }) => (
  <TagBadge 
    tag={tag} 
    className="bg-blue-100 text-blue-800 border-blue-200"
  />
);

// Utility function to determine badge type based on tag name
export const getBadgeComponent = (tagName: string) => {
  const lowerTagName = tagName.toLowerCase();
  
  // Content tags
  if (['art', 'design', 'music', 'dance', 'sports', 'stem', 'tech', 'robotics', 'coding', 'science', 'math', 'language', 'writing', 'reading'].some(keyword => lowerTagName.includes(keyword))) {
    return ContentTagBadge;
  }
  
  // Philosophy tags
  if (['montessori', 'reggio', 'waldorf', 'project-based', 'play-based', 'bilingual', 'cultural', 'heritage', 'confidence', 'resilience', 'mindfulness'].some(keyword => lowerTagName.includes(keyword))) {
    return PhilosophyTagBadge;
  }
  
  // Experience tags
  if (['small group', 'large group', 'one-on-one', 'outdoor', 'tactile', 'messy', 'high energy', 'fast-paced', 'collaborative', 'competitive'].some(keyword => lowerTagName.includes(keyword))) {
    return ExperienceTagBadge;
  }
  
  // Child tags
  if (['shy', 'outgoing', 'visual learner', 'kinesthetic', 'confidence', 'focus', 'leadership', 'communication', 'problem-solving'].some(keyword => lowerTagName.includes(keyword))) {
    return ChildTagBadge;
  }
  
  // Default to content tag
  return ContentTagBadge;
};
