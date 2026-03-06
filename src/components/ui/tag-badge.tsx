"use client";

import React from "react";

type TagCategory = "content" | "philosophy" | "experience" | "child";

interface TagBadgeProps {
  tag: { id: string; name: string; description?: string } | string;
  className?: string;
  showTooltip?: boolean;
}

// Category-specific color map matching TagPill tokens
const CATEGORY_STYLES: Record<TagCategory, { bg: string; text: string }> = {
  content:    { bg: "bg-[var(--tumbo-tag-content)]",     text: "text-white" },
  philosophy: { bg: "bg-[var(--tumbo-tag-philosophy)]",   text: "text-white" },
  experience: { bg: "bg-[var(--tumbo-tag-experience)]",   text: "text-white" },
  child:      { bg: "bg-[var(--tumbo-tag-child)]",        text: "text-white" },
};

function classifyTag(name: string): TagCategory {
  const l = name.toLowerCase();
  if (["montessori","reggio","waldorf","project-based","play-based","bilingual","cultural","heritage","story-driven","mindful","child-led","stem/steam","discipline","process-focused"].some(k => l.includes(k)))
    return "philosophy";
  if (["small group","one-on-one","outdoor","hands-on","interactive","immersive","sensory","high energy","collaborative","performance","gentle pace","messy"].some(k => l.includes(k)))
    return "experience";
  if (["confidence","leadership","creativity","problem-solving","shy","focus","fine motor","gross motor","social skills","self-expression","creative kids","problem solving","focus & regulation","focus & discipline","builds confidence"].some(k => l.includes(k)))
    return "child";
  return "content";
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  className = "",
  showTooltip = true,
}) => {
  const tagName = typeof tag === "string" ? tag : tag.name || "Unknown";
  const tagDescription = typeof tag === "string" ? "" : tag.description || "";
  const category = classifyTag(tagName);
  const style = CATEGORY_STYLES[category];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text} ${className}`}
      title={showTooltip && tagDescription ? tagDescription : undefined}
    >
      {tagName}
    </span>
  );
};

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
