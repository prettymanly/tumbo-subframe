/**
 * Tumbo Tag Taxonomy — Single Source of Truth
 * ═══════════════════════════════════════════════
 * Every class is tagged against this fixed dictionary by AI during enrichment.
 * AI picks from these lists — it never invents new tags.
 *
 * 4 dimensions: content (what), philosophy (how), experience (feel), child (who).
 * Tags are short, filterable, parent-facing labels.
 *
 * To add/remove tags: edit this file, redeploy, then re-run the backfill script
 * for affected classes.
 */

// ── Dimension types ──
export type TagDimension = "content" | "philosophy" | "experience" | "child";

export interface TaxonomyTag {
  slug: string; // Unique identifier, kebab-case
  label: string; // Display label (what parents see)
  dimension: TagDimension;
  group: string; // Visual grouping for admin/UI
}

// ── CONTENT TAGS — What the class teaches ──
// These are the specific subject/skill being taught.

const CONTENT_TAGS: TaxonomyTag[] = [
  // 🎵 Music
  { slug: "piano", label: "Piano", dimension: "content", group: "Music" },
  { slug: "violin", label: "Violin", dimension: "content", group: "Music" },
  { slug: "vocal-training", label: "Vocal Training", dimension: "content", group: "Music" },
  { slug: "guitar", label: "Guitar", dimension: "content", group: "Music" },
  { slug: "drums", label: "Drums", dimension: "content", group: "Music" },
  { slug: "music-theory", label: "Music Theory", dimension: "content", group: "Music" },

  // 💃 Dance
  { slug: "ballet", label: "Ballet", dimension: "content", group: "Dance" },
  { slug: "kpop-dance", label: "K-Pop Dance", dimension: "content", group: "Dance" },
  { slug: "hip-hop", label: "Hip-Hop", dimension: "content", group: "Dance" },
  { slug: "contemporary", label: "Contemporary", dimension: "content", group: "Dance" },
  { slug: "jazz", label: "Jazz", dimension: "content", group: "Dance" },
  { slug: "cultural-dance", label: "Cultural Dance", dimension: "content", group: "Dance" },

  // 🎭 Drama & Theatre
  { slug: "drama", label: "Drama", dimension: "content", group: "Drama & Theatre" },
  { slug: "musical-theatre", label: "Musical Theatre", dimension: "content", group: "Drama & Theatre" },
  { slug: "improv", label: "Improv", dimension: "content", group: "Drama & Theatre" },
  { slug: "speech-drama", label: "Speech & Drama", dimension: "content", group: "Drama & Theatre" },

  // 🧠 Academic Enrichment
  { slug: "math", label: "Math", dimension: "content", group: "Academic Enrichment" },
  { slug: "chinese", label: "Chinese", dimension: "content", group: "Academic Enrichment" },
  { slug: "higher-chinese", label: "Higher Chinese", dimension: "content", group: "Academic Enrichment" },
  { slug: "english", label: "English", dimension: "content", group: "Academic Enrichment" },
  { slug: "science", label: "Science", dimension: "content", group: "Academic Enrichment" },
  { slug: "creative-writing", label: "Creative Writing", dimension: "content", group: "Academic Enrichment" },
  { slug: "phonics", label: "Phonics", dimension: "content", group: "Academic Enrichment" },
  { slug: "reading-literacy", label: "Reading & Literacy", dimension: "content", group: "Academic Enrichment" },
  { slug: "tamil", label: "Tamil", dimension: "content", group: "Academic Enrichment" },

  // 🧪 Exam Prep & Olympiads
  { slug: "psle-math", label: "PSLE Math", dimension: "content", group: "Exam Prep & Olympiads" },
  { slug: "psle-english", label: "PSLE English", dimension: "content", group: "Exam Prep & Olympiads" },
  { slug: "psle-science", label: "PSLE Science", dimension: "content", group: "Exam Prep & Olympiads" },
  { slug: "psle-chinese", label: "PSLE Chinese", dimension: "content", group: "Exam Prep & Olympiads" },
  { slug: "math-olympiad", label: "Math Olympiad", dimension: "content", group: "Exam Prep & Olympiads" },
  { slug: "gep-prep", label: "GEP Prep", dimension: "content", group: "Exam Prep & Olympiads" },

  // 🤖 STEM & Tech
  { slug: "coding", label: "Coding", dimension: "content", group: "STEM & Tech" },
  { slug: "robotics", label: "Robotics", dimension: "content", group: "STEM & Tech" },
  { slug: "maker-tinkering", label: "Maker / Tinkering", dimension: "content", group: "STEM & Tech" },
  { slug: "app-development", label: "App Development", dimension: "content", group: "STEM & Tech" },
  { slug: "3d-printing", label: "3D Printing", dimension: "content", group: "STEM & Tech" },
  { slug: "engineering-basics", label: "Engineering Basics", dimension: "content", group: "STEM & Tech" },
  { slug: "animation", label: "Animation", dimension: "content", group: "STEM & Tech" },

  // ⚽ Sports
  { slug: "swimming", label: "Swimming", dimension: "content", group: "Sports" },
  { slug: "badminton", label: "Badminton", dimension: "content", group: "Sports" },
  { slug: "football", label: "Football", dimension: "content", group: "Sports" },
  { slug: "taekwondo", label: "Taekwondo", dimension: "content", group: "Sports" },
  { slug: "basketball", label: "Basketball", dimension: "content", group: "Sports" },
  { slug: "gymnastics", label: "Gymnastics", dimension: "content", group: "Sports" },
  { slug: "tennis", label: "Tennis", dimension: "content", group: "Sports" },
  { slug: "table-tennis", label: "Table Tennis", dimension: "content", group: "Sports" },
  { slug: "karate", label: "Karate", dimension: "content", group: "Sports" },
  { slug: "boxing", label: "Boxing", dimension: "content", group: "Sports" },
  { slug: "fencing", label: "Fencing", dimension: "content", group: "Sports" },
  { slug: "rock-climbing", label: "Rock Climbing", dimension: "content", group: "Sports" },
  { slug: "yoga", label: "Yoga", dimension: "content", group: "Sports" },
  { slug: "martial-arts", label: "Martial Arts", dimension: "content", group: "Sports" },
  { slug: "silat", label: "Silat", dimension: "content", group: "Sports" },
  { slug: "wushu", label: "Wushu", dimension: "content", group: "Sports" },
  { slug: "judo", label: "Judo", dimension: "content", group: "Sports" },
  { slug: "water-sports", label: "Water Sports", dimension: "content", group: "Sports" },
  { slug: "golf", label: "Golf", dimension: "content", group: "Sports" },

  // 🎨 Art & Design
  { slug: "drawing", label: "Drawing", dimension: "content", group: "Art & Design" },
  { slug: "painting", label: "Painting", dimension: "content", group: "Art & Design" },
  { slug: "crafts", label: "Crafts", dimension: "content", group: "Art & Design" },
  { slug: "digital-art", label: "Digital Art", dimension: "content", group: "Art & Design" },
  { slug: "watercolour", label: "Watercolour", dimension: "content", group: "Art & Design" },
  { slug: "pottery", label: "Pottery", dimension: "content", group: "Art & Design" },
  { slug: "design-thinking", label: "Design Thinking", dimension: "content", group: "Art & Design" },

  // 🧩 Cognitive & Strategy
  { slug: "chess", label: "Chess", dimension: "content", group: "Cognitive & Strategy" },
  { slug: "rubiks-cube", label: "Rubik's Cube", dimension: "content", group: "Cognitive & Strategy" },
  { slug: "go", label: "Go", dimension: "content", group: "Cognitive & Strategy" },
  { slug: "logic-puzzles", label: "Logic Puzzles", dimension: "content", group: "Cognitive & Strategy" },

  // 🌱 Holistic & Life Skills
  { slug: "public-speaking", label: "Public Speaking", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "debate", label: "Debate", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "leadership", label: "Leadership", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "entrepreneurship", label: "Entrepreneurship", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "mindfulness", label: "Mindfulness", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "mental-wellness", label: "Mental Wellness", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "financial-literacy", label: "Financial Literacy", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "nature-outdoor", label: "Nature & Outdoor", dimension: "content", group: "Holistic & Life Skills" },
  { slug: "holiday-camps", label: "Holiday Camps", dimension: "content", group: "Holistic & Life Skills" },

  // 🗣️ Languages (Non-exam / Foreign)
  { slug: "lang-chinese", label: "Chinese", dimension: "content", group: "Languages" },
  { slug: "lang-malay", label: "Malay", dimension: "content", group: "Languages" },
  { slug: "lang-hindi", label: "Hindi", dimension: "content", group: "Languages" },
  { slug: "lang-tamil", label: "Tamil", dimension: "content", group: "Languages" },
  { slug: "lang-arabic", label: "Arabic", dimension: "content", group: "Languages" },
  { slug: "lang-japanese", label: "Japanese", dimension: "content", group: "Languages" },
  { slug: "lang-korean", label: "Korean", dimension: "content", group: "Languages" },
  { slug: "lang-french", label: "French", dimension: "content", group: "Languages" },
  { slug: "lang-spanish", label: "Spanish", dimension: "content", group: "Languages" },

  // 👶 Early Years
  { slug: "pre-reading", label: "Phonics & Pre-Reading", dimension: "content", group: "Early Years" },
  { slug: "fine-motor-skills", label: "Fine Motor Skills", dimension: "content", group: "Early Years" },
  { slug: "sensory-play", label: "Sensory Play", dimension: "content", group: "Early Years" },
  { slug: "parent-child-classes", label: "Parent-Child Classes", dimension: "content", group: "Early Years" },
  { slug: "school-readiness", label: "School Readiness", dimension: "content", group: "Early Years" },

  // 🍳 Culinary & Media
  { slug: "baking", label: "Baking", dimension: "content", group: "Culinary & Media" },
  { slug: "cooking", label: "Cooking", dimension: "content", group: "Culinary & Media" },
  { slug: "photography", label: "Photography", dimension: "content", group: "Culinary & Media" },
  { slug: "videography", label: "Videography", dimension: "content", group: "Culinary & Media" },

  // 🕌 Values / Religious
  { slug: "islamic-studies", label: "Islamic Studies", dimension: "content", group: "Values / Religious" },
  { slug: "sunday-school", label: "Sunday School", dimension: "content", group: "Values / Religious" },
  { slug: "character-education", label: "Character Education", dimension: "content", group: "Values / Religious" },
];

// ── PHILOSOPHY TAGS — How the class teaches ──

const PHILOSOPHY_TAGS: TaxonomyTag[] = [
  // Educational Philosophies
  { slug: "montessori-aligned", label: "Montessori-Aligned", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "reggio-emilia", label: "Reggio Emilia Inspired", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "waldorf-steiner", label: "Waldorf / Steiner", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "ib-inspired", label: "IB-Inspired Learning", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "project-based-learning", label: "Project-Based Learning", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "play-based-learning", label: "Play-Based Learning", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "stem-steam", label: "STEM / STEAM-Focused", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "future-skills", label: "21st-Century Skills", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "exam-focused", label: "Exam-Focused / Results-Driven", dimension: "philosophy", group: "Educational Philosophies" },
  { slug: "performance-oriented", label: "Performance-Oriented", dimension: "philosophy", group: "Educational Philosophies" },

  // Cultural Exposure & Heritage
  { slug: "mandarin-speaking", label: "Mandarin-Speaking", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "malay-led", label: "Malay-Led", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "tamil-led", label: "Tamil-Led", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "bilingual-instruction", label: "Bilingual Instruction", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "chinese-heritage-arts", label: "Chinese Heritage Arts", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "malay-heritage-arts", label: "Malay Heritage Arts", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "indian-heritage-arts", label: "Indian Heritage Arts", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "global-perspectives", label: "Global Perspectives", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "islamic-ethos", label: "Islamic Ethos", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "christian-values", label: "Christian Values", dimension: "philosophy", group: "Cultural Exposure & Heritage" },
  { slug: "buddhist-philosophy", label: "Buddhist Philosophy", dimension: "philosophy", group: "Cultural Exposure & Heritage" },

  // Core Values & Social-Emotional Anchors
  { slug: "emotional-literacy", label: "Emotional Literacy Focus", dimension: "philosophy", group: "Core Values" },
  { slug: "resilience-building", label: "Resilience-Building", dimension: "philosophy", group: "Core Values" },
  { slug: "anti-burnout", label: "Anti-Burnout / Balanced Learning", dimension: "philosophy", group: "Core Values" },
  { slug: "confidence-building", label: "Confidence-Building", dimension: "philosophy", group: "Core Values" },
  { slug: "collaboration-teamwork", label: "Collaboration & Teamwork", dimension: "philosophy", group: "Core Values" },
  { slug: "critical-thinking", label: "Critical Thinking / Problem-Solving", dimension: "philosophy", group: "Core Values" },
  { slug: "independence", label: "Independence / Self-Directed", dimension: "philosophy", group: "Core Values" },
  { slug: "parent-child-colearning", label: "Parent-Child Co-Learning", dimension: "philosophy", group: "Core Values" },
  { slug: "neurodiverse-inclusive", label: "Neurodiverse-Inclusive", dimension: "philosophy", group: "Core Values" },
  { slug: "equity-access", label: "Equity / Access-Oriented", dimension: "philosophy", group: "Core Values" },
  { slug: "sustainability", label: "Environmental Awareness", dimension: "philosophy", group: "Core Values" },
];

// ── EXPERIENCE TAGS — What the class feels like ──

const EXPERIENCE_TAGS: TaxonomyTag[] = [
  // Class Dynamics
  { slug: "instructor-led", label: "Instructor-Led", dimension: "experience", group: "Class Dynamics" },
  { slug: "peer-driven", label: "Peer-Driven", dimension: "experience", group: "Class Dynamics" },
  { slug: "play-based", label: "Play-Based", dimension: "experience", group: "Class Dynamics" },
  { slug: "project-based", label: "Project-Based", dimension: "experience", group: "Class Dynamics" },
  { slug: "improv-creative-flow", label: "Improv / Creative Flow", dimension: "experience", group: "Class Dynamics" },
  { slug: "curriculum-driven", label: "Highly Structured", dimension: "experience", group: "Class Dynamics" },
  { slug: "open-ended-exploration", label: "Open-Ended Exploration", dimension: "experience", group: "Class Dynamics" },
  { slug: "competitive", label: "Competitive Environment", dimension: "experience", group: "Class Dynamics" },
  { slug: "collaborative", label: "Collaborative Setting", dimension: "experience", group: "Class Dynamics" },

  // Pace & Intensity
  { slug: "high-energy", label: "High Energy", dimension: "experience", group: "Pace & Intensity" },
  { slug: "fast-paced", label: "Fast-Paced", dimension: "experience", group: "Pace & Intensity" },
  { slug: "slow-reflective", label: "Slow & Reflective", dimension: "experience", group: "Pace & Intensity" },
  { slug: "moderate-pace", label: "Balanced Pace", dimension: "experience", group: "Pace & Intensity" },

  // Class Size / Social Setting
  { slug: "one-on-one", label: "One-on-One", dimension: "experience", group: "Class Size" },
  { slug: "small-group", label: "Small Group (3\u20135)", dimension: "experience", group: "Class Size" },
  { slug: "medium-group", label: "Medium Group (6\u201310)", dimension: "experience", group: "Class Size" },
  { slug: "large-group", label: "Large Group (11+)", dimension: "experience", group: "Class Size" },
  { slug: "parent-child-exp", label: "Parent-Child", dimension: "experience", group: "Class Size" },

  // Environment & Sensory
  { slug: "outdoor-nature", label: "Outdoor / Nature-Based", dimension: "experience", group: "Environment" },
  { slug: "tactile-messy", label: "Tactile / Messy", dimension: "experience", group: "Environment" },
  { slug: "calm-low-stimulus", label: "Calm / Low-Stimulus", dimension: "experience", group: "Environment" },
  { slug: "immersive-tech", label: "Immersive / Tech-Enabled", dimension: "experience", group: "Environment" },
  { slug: "music-infused", label: "Music-Infused", dimension: "experience", group: "Environment" },
  { slug: "digital-online", label: "Digital / Online Available", dimension: "experience", group: "Environment" },
];

// ── CHILD TAGS — Who the class is for ──

const CHILD_TAGS: TaxonomyTag[] = [
  // Personality Traits
  { slug: "shy-in-groups", label: "Shy in Groups", dimension: "child", group: "Personality" },
  { slug: "outgoing-expressive", label: "Outgoing & Expressive", dimension: "child", group: "Personality" },
  { slug: "sensitive-thoughtful", label: "Sensitive & Thoughtful", dimension: "child", group: "Personality" },
  { slug: "restless-needs-movement", label: "Restless / Needs Movement", dimension: "child", group: "Personality" },
  { slug: "detail-oriented", label: "Detail-Oriented", dimension: "child", group: "Personality" },
  { slug: "highly-curious", label: "Highly Curious", dimension: "child", group: "Personality" },
  { slug: "imaginative-dreamer", label: "Imaginative Dreamer", dimension: "child", group: "Personality" },
  { slug: "resilient-persistent", label: "Resilient / Persistent", dimension: "child", group: "Personality" },
  { slug: "easily-distracted", label: "Easily Distracted", dimension: "child", group: "Personality" },
  { slug: "thrives-on-routine", label: "Thrives on Routine", dimension: "child", group: "Personality" },

  // Learning Styles
  { slug: "visual-learner", label: "Visual Learner", dimension: "child", group: "Learning Style" },
  { slug: "auditory-learner", label: "Auditory Learner", dimension: "child", group: "Learning Style" },
  { slug: "kinesthetic-learner", label: "Kinesthetic Learner", dimension: "child", group: "Learning Style" },
  { slug: "observational-learner", label: "Observational Learner", dimension: "child", group: "Learning Style" },
  { slug: "trial-error-learner", label: "Trial-and-Error Learner", dimension: "child", group: "Learning Style" },
  { slug: "story-driven-learner", label: "Story-Driven Learner", dimension: "child", group: "Learning Style" },
  { slug: "tech-oriented-learner", label: "Tech-Oriented Learner", dimension: "child", group: "Learning Style" },

  // Social Preferences
  { slug: "loves-team-activities", label: "Loves Team Activities", dimension: "child", group: "Social Preference" },
  { slug: "prefers-one-on-one", label: "Prefers One-on-One", dimension: "child", group: "Social Preference" },
  { slug: "small-group-comfort", label: "Small Group Comfort", dimension: "child", group: "Social Preference" },
  { slug: "large-group-energy", label: "Enjoys Large Group Energy", dimension: "child", group: "Social Preference" },
  { slug: "peer-motivated", label: "Peer-Motivated", dimension: "child", group: "Social Preference" },
  { slug: "independent-worker", label: "Independent Worker", dimension: "child", group: "Social Preference" },

  // Growth Areas
  { slug: "builds-confidence", label: "Builds Confidence", dimension: "child", group: "Growth Areas" },
  { slug: "improves-focus", label: "Improves Focus & Self-Regulation", dimension: "child", group: "Growth Areas" },
  { slug: "develops-resilience", label: "Develops Resilience", dimension: "child", group: "Growth Areas" },
  { slug: "encourages-exploration", label: "Encourages Exploration", dimension: "child", group: "Growth Areas" },
  { slug: "emotional-literacy-child", label: "Emotional Literacy", dimension: "child", group: "Growth Areas" },
  { slug: "communication-speaking", label: "Communication & Speaking Up", dimension: "child", group: "Growth Areas" },
  { slug: "leadership-initiative", label: "Leadership / Taking Initiative", dimension: "child", group: "Growth Areas" },
  { slug: "collaboration-empathy", label: "Collaboration & Empathy", dimension: "child", group: "Growth Areas" },
  { slug: "problem-solving-thinking", label: "Problem-Solving & Critical Thinking", dimension: "child", group: "Growth Areas" },
  { slug: "stress-management", label: "Stress Management", dimension: "child", group: "Growth Areas" },
];

// ── Full taxonomy ──
export const TAXONOMY: TaxonomyTag[] = [
  ...CONTENT_TAGS,
  ...PHILOSOPHY_TAGS,
  ...EXPERIENCE_TAGS,
  ...CHILD_TAGS,
];

// ── Lookup helpers ──
export const TAXONOMY_BY_SLUG = new Map(TAXONOMY.map((t) => [t.slug, t]));
export const TAXONOMY_BY_DIMENSION = {
  content: CONTENT_TAGS,
  philosophy: PHILOSOPHY_TAGS,
  experience: EXPERIENCE_TAGS,
  child: CHILD_TAGS,
} as const;

/** Get all tag labels for a dimension as a flat array (for AI prompt injection). */
export function getTagLabelsForDimension(dim: TagDimension): string[] {
  return TAXONOMY_BY_DIMENSION[dim].map((t) => t.label);
}

/** Get all unique group names for a dimension. */
export function getGroupsForDimension(dim: TagDimension): string[] {
  const groups = new Set(TAXONOMY_BY_DIMENSION[dim].map((t) => t.group));
  return [...groups];
}

/** Find a tag by its label (case-insensitive). Returns undefined if not in taxonomy. */
export function findTagByLabel(label: string): TaxonomyTag | undefined {
  const lower = label.toLowerCase();
  return TAXONOMY.find((t) => t.label.toLowerCase() === lower);
}

/** Validate that a set of labels are all in the taxonomy. Returns invalid ones. */
export function validateTagLabels(labels: string[]): string[] {
  return labels.filter((l) => !findTagByLabel(l));
}

// ── Tag counts ──
export const TAG_COUNTS = {
  content: CONTENT_TAGS.length,
  philosophy: PHILOSOPHY_TAGS.length,
  experience: EXPERIENCE_TAGS.length,
  child: CHILD_TAGS.length,
  total: TAXONOMY.length,
} as const;
