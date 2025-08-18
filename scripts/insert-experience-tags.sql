-- Insert Experience Tags for Tümbo
-- Run this after creating the schema, content tags, and philosophy tags

-- First, get the experience tag type ID
DO $$
DECLARE
    experience_type_id UUID;
BEGIN
    SELECT id INTO experience_type_id FROM tag_types WHERE name = 'experience';
    
    -- Class Dynamics (style & structure) Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (experience_type_id, 'Class Dynamics (style & structure)', 'How the class is structured and conducted', 1);
    
    -- Class Dynamics Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (experience_type_id, 'Instructor-Led', 'Classes primarily guided by the instructor', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 1),
    (experience_type_id, 'Peer-Driven', 'Learning driven by peer interaction and collaboration', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 2),
    (experience_type_id, 'Play-Based', 'Learning through structured and unstructured play', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 3),
    (experience_type_id, 'Project-Based', 'Learning through hands-on projects and real-world applications', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 4),
    (experience_type_id, 'Improv-Style / Creative Flow', 'Spontaneous and creative learning approaches', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 5),
    (experience_type_id, 'Highly Structured / Curriculum-Driven', 'Rigid curriculum with clear learning objectives', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 6),
    (experience_type_id, 'Open-Ended Exploration', 'Free-form exploration and discovery-based learning', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 7),
    (experience_type_id, 'Competitive Environment', 'Learning through competition and achievement', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 8),
    (experience_type_id, 'Collaborative Setting', 'Team-based learning and group cooperation', 
     (SELECT id FROM tags WHERE name = 'Class Dynamics (style & structure)' AND tag_type_id = experience_type_id), 9);
    
    -- Pace & Intensity Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (experience_type_id, 'Pace & Intensity', 'The speed and energy level of the class', 2);
    
    -- Pace & Intensity Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (experience_type_id, 'High Energy / Movement-Based', 'Active, high-energy classes with lots of movement', 
     (SELECT id FROM tags WHERE name = 'Pace & Intensity' AND tag_type_id = experience_type_id), 1),
    (experience_type_id, 'Fast-Paced', 'Quick-moving classes with rapid transitions', 
     (SELECT id FROM tags WHERE name = 'Pace & Intensity' AND tag_type_id = experience_type_id), 2),
    (experience_type_id, 'Slow & Reflective', 'Calm, thoughtful classes with time for reflection', 
     (SELECT id FROM tags WHERE name = 'Pace & Intensity' AND tag_type_id = experience_type_id), 3),
    (experience_type_id, 'Moderate Tempo / Balanced Pace', 'Well-balanced pace with varied activities', 
     (SELECT id FROM tags WHERE name = 'Pace & Intensity' AND tag_type_id = experience_type_id), 4);
    
    -- Class Size / Social Setting Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (experience_type_id, 'Class Size / Social Setting', 'The social dynamics and group size of the class', 3);
    
    -- Class Size / Social Setting Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (experience_type_id, 'One-on-One / Private', 'Individual instruction with personal attention', 
     (SELECT id FROM tags WHERE name = 'Class Size / Social Setting' AND tag_type_id = experience_type_id), 1),
    (experience_type_id, 'Small Group (3–5 students)', 'Intimate group setting with close interaction', 
     (SELECT id FROM tags WHERE name = 'Class Size / Social Setting' AND tag_type_id = experience_type_id), 2),
    (experience_type_id, 'Medium Group (6–10 students)', 'Moderate group size with balanced attention', 
     (SELECT id FROM tags WHERE name = 'Class Size / Social Setting' AND tag_type_id = experience_type_id), 3),
    (experience_type_id, 'Large Group (11+ students)', 'Big group setting with diverse peer interaction', 
     (SELECT id FROM tags WHERE name = 'Class Size / Social Setting' AND tag_type_id = experience_type_id), 4),
    (experience_type_id, 'Parent-Child Co-Learning', 'Classes designed for parent and child participation together', 
     (SELECT id FROM tags WHERE name = 'Class Size / Social Setting' AND tag_type_id = experience_type_id), 5);
    
    -- Environment & Sensory Experience Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (experience_type_id, 'Environment & Sensory Experience', 'The physical and sensory environment of the class', 4);
    
    -- Environment & Sensory Experience Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (experience_type_id, 'Outdoor / Nature-Based', 'Classes held outdoors or in natural settings', 
     (SELECT id FROM tags WHERE name = 'Environment & Sensory Experience' AND tag_type_id = experience_type_id), 1),
    (experience_type_id, 'Tactile / Messy', 'Hands-on activities that may involve mess or tactile exploration', 
     (SELECT id FROM tags WHERE name = 'Environment & Sensory Experience' AND tag_type_id = experience_type_id), 2),
    (experience_type_id, 'Calm / Low-Stimulus', 'Peaceful environment with minimal distractions', 
     (SELECT id FROM tags WHERE name = 'Environment & Sensory Experience' AND tag_type_id = experience_type_id), 3),
    (experience_type_id, 'Immersive / Tech-Enabled', 'Technology-rich or immersive learning environments', 
     (SELECT id FROM tags WHERE name = 'Environment & Sensory Experience' AND tag_type_id = experience_type_id), 4),
    (experience_type_id, 'Music-Infused', 'Classes that incorporate music throughout the experience', 
     (SELECT id FROM tags WHERE name = 'Environment & Sensory Experience' AND tag_type_id = experience_type_id), 5);
    
END $$;

-- Verify the insertion
SELECT 
    t.name as tag_name,
    tt.name as tag_type,
    t.level,
    t.path,
    t.description
FROM tags t
JOIN tag_types tt ON t.tag_type_id = tt.id
WHERE tt.name = 'experience'
ORDER BY t.sort_order, t.name;
