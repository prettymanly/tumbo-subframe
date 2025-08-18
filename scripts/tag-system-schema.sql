-- Tag System Database Schema for Tümbo
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tag Types Table (Content, Philosophy, Experience, Child)
CREATE TABLE tag_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL, -- Hex color code
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags Table (supports hierarchical structure)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_type_id UUID NOT NULL REFERENCES tag_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES tags(id) ON DELETE CASCADE, -- For hierarchy
    level INTEGER DEFAULT 0, -- 0 = root, 1 = first level, etc.
    path TEXT, -- Full path like "Dance > Cultural dance > Malay dance"
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique names within the same type and parent
    UNIQUE(tag_type_id, parent_id, name)
);

-- Classes Table (enhanced with additional details)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    age_range_min INTEGER,
    age_range_max INTEGER,
    class_duration INTEGER, -- in minutes
    class_schedule TEXT, -- JSON or text description
    price_per_class DECIMAL(10,2),
    group_size_min INTEGER,
    group_size_max INTEGER,
    location_address TEXT,
    instructor_name VARCHAR(255),
    instructor_bio TEXT,
    contact_info TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class Tags Junction Table (many-to-many)
CREATE TABLE class_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(class_id, tag_id)
);

-- Class Images Table (for multiple images per class)
CREATE TABLE class_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tags_tag_type_id ON tags(tag_type_id);
CREATE INDEX idx_tags_parent_id ON tags(parent_id);
CREATE INDEX idx_tags_path ON tags(path);
CREATE INDEX idx_class_tags_class_id ON class_tags(class_id);
CREATE INDEX idx_class_tags_tag_id ON class_tags(tag_id);
CREATE INDEX idx_classes_slug ON classes(slug);
CREATE INDEX idx_classes_age_range ON classes(age_range_min, age_range_max);

-- Insert default tag types with colors
INSERT INTO tag_types (name, display_name, description, color, sort_order) VALUES
('content', 'Content Tag', 'What the class teaches or covers', '#3B82F6', 1),
('philosophy', 'Philosophy Tag', 'The educational approach or methodology', '#10B981', 2),
('experience', 'Experience Tag', 'The type of experience or interaction', '#F59E0B', 3),
('child', 'Child Tag', 'Child-specific characteristics or needs', '#EF4444', 4);

-- Function to update path when parent changes
CREATE OR REPLACE FUNCTION update_tag_path()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = NEW.name;
        NEW.level = 0;
    ELSE
        SELECT path, level INTO NEW.path, NEW.level
        FROM tags
        WHERE id = NEW.parent_id;
        
        NEW.path = NEW.path || ' > ' || NEW.name;
        NEW.level = NEW.level + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update path
CREATE TRIGGER tag_path_trigger
    BEFORE INSERT OR UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_path();

-- Function to get tag hierarchy as JSON
CREATE OR REPLACE FUNCTION get_tag_hierarchy(tag_type_name VARCHAR)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', t.id,
            'name', t.name,
            'description', t.description,
            'level', t.level,
            'path', t.path,
            'children', (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'description', c.description,
                        'level', c.level,
                        'path', c.path
                    )
                )
                FROM tags c
                WHERE c.parent_id = t.id
                ORDER BY c.sort_order, c.name
            )
        )
    )
    INTO result
    FROM tags t
    WHERE t.tag_type_id = (SELECT id FROM tag_types WHERE name = tag_type_name)
    AND t.parent_id IS NULL
    ORDER BY t.sort_order, t.name;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to search classes by tags
CREATE OR REPLACE FUNCTION search_classes_by_tags(
    search_query TEXT DEFAULT '',
    tag_ids UUID[] DEFAULT NULL,
    tag_type_ids UUID[] DEFAULT NULL,
    age_min INTEGER DEFAULT NULL,
    age_max INTEGER DEFAULT NULL
)
RETURNS TABLE(
    class_id UUID,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT,
    age_range_min INTEGER,
    age_range_max INTEGER,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.image_url,
        c.age_range_min,
        c.age_range_max,
        COUNT(DISTINCT ct.tag_id)::INTEGER as relevance_score
    FROM classes c
    LEFT JOIN class_tags ct ON c.id = ct.class_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE c.is_active = true
    AND (
        search_query = '' OR 
        c.title ILIKE '%' || search_query || '%' OR
        c.description ILIKE '%' || search_query || '%' OR
        t.name ILIKE '%' || search_query || '%'
    )
    AND (
        tag_ids IS NULL OR 
        ct.tag_id = ANY(tag_ids)
    )
    AND (
        tag_type_ids IS NULL OR 
        t.tag_type_id = ANY(tag_type_ids)
    )
    AND (
        age_min IS NULL OR 
        c.age_range_max >= age_min
    )
    AND (
        age_max IS NULL OR 
        c.age_range_min <= age_max
    )
    GROUP BY c.id, c.title, c.description, c.image_url, c.age_range_min, c.age_range_max
    ORDER BY relevance_score DESC, c.title;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE tag_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_images ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access for tag_types" ON tag_types FOR SELECT USING (true);
CREATE POLICY "Public read access for tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read access for classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public read access for class_tags" ON class_tags FOR SELECT USING (true);
CREATE POLICY "Public read access for class_images" ON class_images FOR SELECT USING (true);

-- Admin write access (you can modify these policies based on your auth setup)
CREATE POLICY "Admin write access for tag_types" ON tag_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for tags" ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for classes" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for class_tags" ON class_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for class_images" ON class_images FOR ALL USING (auth.role() = 'authenticated');
