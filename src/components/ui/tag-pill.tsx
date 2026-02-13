"use client";

import React from "react";

// ── Tag categories with colors ──
type TagCategory = "content" | "philosophy" | "experience" | "child";

const TAG_COLORS: Record<TagCategory, string> = {
  content: "var(--tumbo-tag-content)",       // Brown #7E401A
  philosophy: "var(--tumbo-tag-philosophy)",  // Red-orange #FF3C00
  experience: "var(--tumbo-tag-experience)",  // Amber #F1B313
  child: "var(--tumbo-tag-child)",           // Coral #FF6966
};

// ── Category icons (small inline SVGs) ──
function ContentIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function PhilosophyIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ExperienceIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ChildIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<TagCategory, React.FC<{ size?: number }>> = {
  content: ContentIcon,
  philosophy: PhilosophyIcon,
  experience: ExperienceIcon,
  child: ChildIcon,
};

// ── Classify tag into category ──
export function classifyTag(tagName: string): TagCategory {
  const t = tagName.toLowerCase();

  if (
    ["project-based", "play-based", "story-driven", "imaginative", "mindful",
     "montessori", "reggio", "waldorf", "bilingual", "cultural", "heritage",
     "philosophy", "values", "learning", "ib-inspired", "stem/steam",
     "islamic", "christian", "21st-century"].some((k) => t.includes(k))
  ) return "philosophy";

  if (
    ["hands-on", "interactive", "small group", "large group", "one-on-one",
     "outdoor", "tactile", "messy", "high energy", "fast-paced",
     "collaborative", "competitive", "immersive", "sensory"].some((k) => t.includes(k))
  ) return "experience";

  if (
    ["fine motor", "gross motor", "confidence", "leadership", "creativity",
     "problem-solving", "shy", "outgoing", "visual learner", "kinesthetic",
     "focus", "communication", "critical thinking", "social skills",
     "emotional", "self-expression"].some((k) => t.includes(k))
  ) return "child";

  return "content";
}

// ── TagPill component ──
interface TagPillProps {
  label: string;
  /** Override automatic classification */
  category?: TagCategory;
  /** "sm" for cards, "md" for detail pages */
  size?: "sm" | "md";
  className?: string;
}

export function TagPill({ label, category, size = "sm", className = "" }: TagPillProps) {
  const cat = category ?? classifyTag(label);
  const color = TAG_COLORS[cat];
  const Icon = CATEGORY_ICONS[cat];
  const iconSize = size === "sm" ? 10 : 13;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-white font-medium whitespace-nowrap ${
        size === "sm"
          ? "px-2 py-[3px] text-[11px]"
          : "px-3 py-1.5 text-[12px] gap-1.5"
      } ${className}`}
      style={{ backgroundColor: color }}
      title={label}
    >
      <Icon size={iconSize} />
      {label}
    </span>
  );
}

export type { TagCategory };
