import { createClient } from '@supabase/supabase-js';
import { 
  TagType, 
  Tag, 
  Class, 
  ClassTag, 
  ClassImage, 
  TagHierarchy, 
  SearchFilters, 
  SearchResult,
  TAG_TYPES 
} from '../types/tags';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Tag Types
export async function getTagTypes(): Promise<TagType[]> {
  const { data, error } = await supabase
    .from('tag_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTagTypeByName(name: string): Promise<TagType | null> {
  const { data, error } = await supabase
    .from('tag_types')
    .select('*')
    .eq('name', name)
    .single();

  if (error) throw error;
  return data;
}

// Tags
export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      tag_type:tag_types(*)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTagsByType(typeName: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      tag_type:tag_types(*)
    `)
    .eq('tag_types.name', typeName)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTagHierarchy(typeName: string): Promise<TagHierarchy[]> {
  const { data, error } = await supabase
    .rpc('get_tag_hierarchy', { tag_type_name: typeName });

  if (error) throw error;
  return data || [];
}

export async function getTagById(id: string): Promise<Tag | null> {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      tag_type:tag_types(*),
      parent:tags!parent_id(*),
      children:tags!parent_id(*)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

export async function searchTags(query: string, typeName?: string): Promise<Tag[]> {
  let queryBuilder = supabase
    .from('tags')
    .select(`
      *,
      tag_type:tag_types(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  if (typeName) {
    queryBuilder = queryBuilder.eq('tag_types.name', typeName);
  }

  const { data, error } = await queryBuilder
    .order('sort_order', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data || [];
}

// Classes
export async function getClasses(): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      tags:class_tags(
        *,
        tag:tags(
          *,
          tag_type:tag_types(*)
        )
      ),
      images:class_images(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getClassBySlug(slug: string): Promise<Class | null> {
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      tags:class_tags(
        *,
        tag:tags(
          *,
          tag_type:tag_types(*)
        )
      ),
      images:class_images(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

export async function getClassesByTags(tagIds: string[]): Promise<Class[]> {
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      tags:class_tags(
        *,
        tag:tags(
          *,
          tag_type:tag_types(*)
        )
      ),
      images:class_images(*)
    `)
    .eq('is_active', true)
    .in('class_tags.tag_id', tagIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Search
export async function searchClasses(filters: SearchFilters): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .rpc('search_classes_by_tags', {
      search_query: filters.search_query || '',
      tag_ids: filters.tag_ids || null,
      tag_type_ids: filters.tag_type_ids || null,
      age_min: filters.age_min || null,
      age_max: filters.age_max || null
    });

  if (error) throw error;
  return data || [];
}

// Tag Suggestions for Search
export async function getTagSuggestions(query: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      tag_type:tag_types(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,path.ilike.%${query}%`)
    .order('sort_order', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data || [];
}

// Popular Tags (for category tabs)
export async function getPopularTags(limit: number = 20): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      tag_type:tag_types(*),
      class_count:class_tags(count)
    `)
    .eq('is_active', true)
    .order('class_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get tags by type for category tabs
export async function getCategoryTags(): Promise<Record<string, Tag[]>> {
  const tagTypes = Object.values(TAG_TYPES);
  const categoryTags: Record<string, Tag[]> = {};

  for (const typeName of tagTypes) {
    const tags = await getTagsByType(typeName);
    categoryTags[typeName] = tags.slice(0, 8); // Limit to 8 tags per category
  }

  return categoryTags;
}

// Utility function to get tag display info
export function getTagDisplayInfo(tag: Tag) {
  return {
    name: tag.name,
    color: tag.tag_type?.color || '#6B7280',
    type: tag.tag_type?.name || 'unknown',
    description: tag.description || tag.tag_type?.description || '',
    path: tag.path
  };
}

// Utility function to group tags by type
export function groupTagsByType(tags: Tag[]): Record<string, Tag[]> {
  return tags.reduce((acc, tag) => {
    const typeName = tag.tag_type?.name || 'unknown';
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);
}
