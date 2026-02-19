-- Taxonomy Tag System Migration
-- ═══════════════════════════════
-- Flat, slug-based tag assignment. Tags are defined in code (taxonomy.ts),
-- not in the database. This table stores which tags are assigned to which classes.
--
-- Run: paste into Supabase SQL Editor

-- Drop old junction table if it exists (it was never populated)
-- DROP TABLE IF EXISTS class_tags;

-- Create new taxonomy-based tag assignments
CREATE TABLE IF NOT EXISTS class_taxonomy_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    tag_slug VARCHAR(100) NOT NULL,       -- matches taxonomy.ts slug
    dimension VARCHAR(20) NOT NULL,        -- content | philosophy | experience | child
    confidence REAL DEFAULT 1.0,           -- AI confidence score (0-1), reserved for future use
    assigned_by VARCHAR(50) DEFAULT 'ai',  -- 'ai' | 'manual' | 'regex'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Each class can only have each tag once
    UNIQUE(class_id, tag_slug)
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_ctt_class_id ON class_taxonomy_tags(class_id);
CREATE INDEX IF NOT EXISTS idx_ctt_tag_slug ON class_taxonomy_tags(tag_slug);
CREATE INDEX IF NOT EXISTS idx_ctt_dimension ON class_taxonomy_tags(dimension);
CREATE INDEX IF NOT EXISTS idx_ctt_dimension_slug ON class_taxonomy_tags(dimension, tag_slug);

-- Composite index for the most common query: "find all classes with tag X"
CREATE INDEX IF NOT EXISTS idx_ctt_slug_class ON class_taxonomy_tags(tag_slug, class_id);

-- RLS: public read, authenticated write
ALTER TABLE class_taxonomy_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for class_taxonomy_tags"
    ON class_taxonomy_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated write access for class_taxonomy_tags"
    ON class_taxonomy_tags FOR ALL USING (auth.role() = 'authenticated');

-- Verify
SELECT 'class_taxonomy_tags table created successfully' AS status;
