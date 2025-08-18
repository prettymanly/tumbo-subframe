"use client";

import React from "react";
// import { Tag, TagType, getTagColor, getTagDisplayName } from "@/lib/types/tags";

interface TagBadgeProps {
  tag: { id: string; name: string; description?: string } | string;
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
  
  // Category-specific colors for small tags (always active state)
  const getTagStyle = () => {
    const tagLower = tagName.toLowerCase();
    
    // Content Tags - Brown (#7E401A)
    if (['music', 'dance', 'art', 'creative', 'design', 'stem', 'tech', 'robotics', 'coding', 'science', 'math', 'language', 'writing', 'reading', 'sports'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#7E401A', color: '#ffffff' };
    } 
    // Philosophy Tags - Red/Orange (#FF3C00)
    else if (['montessori', 'reggio', 'waldorf', 'project-based', 'play-based', 'bilingual', 'cultural', 'heritage', 'philosophy', 'values', 'learning'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#FF3C00', color: '#ffffff' };
    } 
    // Experience Tags - Yellow/Amber (#F1B313)
    else if (['small group', 'large group', 'one-on-one', 'outdoor', 'tactile', 'messy', 'high energy', 'fast-paced', 'collaborative', 'competitive', 'hands-on'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#F1B313', color: '#ffffff' };
    } 
    // Child Tags - Coral/Pink (#FF6966)
    else if (['confidence', 'leadership', 'creativity', 'problem-solving', 'shy', 'outgoing', 'visual learner', 'kinesthetic', 'focus', 'communication'].some(keyword => tagLower.includes(keyword))) {
      return { backgroundColor: '#FF6966', color: '#ffffff' };
    } 
    // Default to Content Tags color
    else {
      return { backgroundColor: '#7E401A', color: '#ffffff' };
    }
  };

  const tagStyle = getTagStyle();

  return (
    <span 
      className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      style={tagStyle}
      title={showTooltip && tagDescription ? tagDescription : undefined}
    >
      {tagName}
    </span>
  );
};

// Specialized badge components for different tag types
export const ContentTagBadge: React.FC<{ tag: { id: string; name: string; description?: string } | string }> = ({ tag }) => (
  <TagBadge tag={tag} />
);

export const PhilosophyTagBadge: React.FC<{ tag: { id: string; name: string; description?: string } | string }> = ({ tag }) => (
  <TagBadge tag={tag} />
);

export const ExperienceTagBadge: React.FC<{ tag: { id: string; name: string; description?: string } | string }> = ({ tag }) => (
  <TagBadge tag={tag} />
);

export const ChildTagBadge: React.FC<{ tag: { id: string; name: string; description?: string } | string }> = ({ tag }) => (
  <TagBadge tag={tag} />
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
