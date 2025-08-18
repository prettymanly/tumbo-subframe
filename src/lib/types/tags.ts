// Tag System Types for Tümbo

export interface TagType {
  id: string;
  name: 'content' | 'philosophy' | 'experience' | 'child';
  display_name: string;
  description?: string;
  color: string; // Hex color code
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  tag_type_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  level: number;
  path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed properties
  tag_type?: TagType;
  children?: Tag[];
  parent?: Tag;
}

export interface Class {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image_url?: string;
  age_range_min?: number;
  age_range_max?: number;
  class_duration?: number; // in minutes
  class_schedule?: string;
  price_per_class?: number;
  group_size_min?: number;
  group_size_max?: number;
  location_address?: string;
  instructor_name?: string;
  instructor_bio?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed properties
  tags?: ClassTag[];
  images?: ClassImage[];
}

export interface ClassTag {
  id: string;
  class_id: string;
  tag_id: string;
  created_at: string;
  
  // Computed properties
  tag?: Tag;
  class?: Class;
}

export interface ClassImage {
  id: string;
  class_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface TagHierarchy {
  id: string;
  name: string;
  description?: string;
  level: number;
  path: string;
  children?: TagHierarchy[];
}

export interface SearchFilters {
  search_query?: string;
  tag_ids?: string[];
  tag_type_ids?: string[];
  age_min?: number;
  age_max?: number;
}

export interface SearchResult {
  class_id: string;
  title: string;
  description?: string;
  image_url?: string;
  age_range_min?: number;
  age_range_max?: number;
  relevance_score: number;
}

// Tag type constants
export const TAG_TYPES = {
  CONTENT: 'content',
  PHILOSOPHY: 'philosophy',
  EXPERIENCE: 'experience',
  CHILD: 'child'
} as const;

export type TagTypeName = typeof TAG_TYPES[keyof typeof TAG_TYPES];

// Default colors for tag types
export const TAG_TYPE_COLORS: Record<TagTypeName, string> = {
  [TAG_TYPES.CONTENT]: '#3B82F6',    // Blue
  [TAG_TYPES.PHILOSOPHY]: '#10B981', // Green
  [TAG_TYPES.EXPERIENCE]: '#F59E0B', // Amber
  [TAG_TYPES.CHILD]: '#EF4444'       // Red
};

// Helper function to get tag color
export function getTagColor(tag: Tag | TagType): string {
  if ('color' in tag) {
    return tag.color;
  }
  
  if (tag.tag_type?.color) {
    return tag.tag_type.color;
  }
  
  // Fallback to default colors
  const tagType = tag.tag_type?.name as TagTypeName;
  if (tagType && TAG_TYPE_COLORS[tagType]) {
    return TAG_TYPE_COLORS[tagType];
  }
  
  return '#6B7280'; // Default gray
}

// Helper function to get tag display name
export function getTagDisplayName(tag: Tag | TagType): string {
  if ('display_name' in tag) {
    return tag.display_name;
  }
  
  if (tag.tag_type?.display_name) {
    return tag.tag_type.display_name;
  }
  
  return 'Tag';
}

// Helper function to check if tag is of specific type
export function isTagType(tag: Tag, typeName: TagTypeName): boolean {
  return tag.tag_type?.name === typeName;
}

// Helper function to get tag path segments
export function getTagPathSegments(tag: Tag): string[] {
  return tag.path.split(' > ');
}

// Helper function to get tag level display
export function getTagLevelDisplay(tag: Tag): string {
  const segments = getTagPathSegments(tag);
  if (segments.length === 1) {
    return segments[0];
  }
  return `${segments[0]} > ${segments[segments.length - 1]}`;
}
