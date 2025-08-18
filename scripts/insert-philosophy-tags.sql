-- Insert Philosophy Tags for Tümbo
-- Run this after creating the schema and content tags

-- First, get the philosophy tag type ID
DO $$
DECLARE
    philosophy_type_id UUID;
BEGIN
    SELECT id INTO philosophy_type_id FROM tag_types WHERE name = 'philosophy';
    
    -- Educational Philosophies (pedagogical anchors) Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (philosophy_type_id, 'Educational Philosophies (pedagogical anchors)', 'Core educational approaches and methodologies', 1);
    
    -- Educational Philosophies Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (philosophy_type_id, 'Montessori-Aligned', 'Montessori method and principles', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 1),
    (philosophy_type_id, 'Reggio Emilia Inspired', 'Reggio Emilia approach to early childhood education', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 2),
    (philosophy_type_id, 'Waldorf / Steiner', 'Waldorf education philosophy and methods', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 3),
    (philosophy_type_id, 'IB-Inspired Learning', 'International Baccalaureate principles and approaches', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 4),
    (philosophy_type_id, 'Project-Based Learning', 'Learning through hands-on projects and real-world applications', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 5),
    (philosophy_type_id, 'Play-Based Learning', 'Learning through structured and unstructured play', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 6),
    (philosophy_type_id, 'STEM / STEAM-Focused', 'Science, Technology, Engineering, Arts, and Mathematics integration', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 7),
    (philosophy_type_id, '21st-Century Skills / Future Skills', 'Modern skills for future success', 
     (SELECT id FROM tags WHERE name = 'Educational Philosophies (pedagogical anchors)' AND tag_type_id = philosophy_type_id), 8);
    
    -- Cultural Exposure & Heritage Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (philosophy_type_id, 'Cultural Exposure & Heritage', 'Cultural education and heritage preservation', 2);
    
    -- Cultural Exposure & Heritage Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (philosophy_type_id, 'Mandarin-Speaking', 'Classes conducted primarily in Mandarin Chinese', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 1),
    (philosophy_type_id, 'Malay-Led', 'Classes led by Malay instructors with cultural context', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 2),
    (philosophy_type_id, 'Tamil-Led', 'Classes led by Tamil instructors with cultural context', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 3),
    (philosophy_type_id, 'Bilingual Instruction', 'Classes taught in multiple languages', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 4),
    (philosophy_type_id, 'Chinese Heritage Arts', 'Traditional Chinese arts and cultural practices', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 5),
    (philosophy_type_id, 'Malay Heritage Arts', 'Traditional Malay arts and cultural practices', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 6),
    (philosophy_type_id, 'Indian Heritage Arts', 'Traditional Indian arts and cultural practices', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 7),
    (philosophy_type_id, 'Global Perspectives', 'International and multicultural viewpoints', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 8),
    (philosophy_type_id, 'Religious Ethos', 'Religious and spiritual educational approaches', 
     (SELECT id FROM tags WHERE name = 'Cultural Exposure & Heritage' AND tag_type_id = philosophy_type_id), 9);
    
    -- Religious Ethos Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (philosophy_type_id, 'Islamic Ethos', 'Islamic values and principles in education', 
     (SELECT id FROM tags WHERE name = 'Religious Ethos' AND tag_type_id = philosophy_type_id), 1),
    (philosophy_type_id, 'Christian Values', 'Christian values and principles in education', 
     (SELECT id FROM tags WHERE name = 'Religious Ethos' AND tag_type_id = philosophy_type_id), 2),
    (philosophy_type_id, 'Buddhist Philosophy', 'Buddhist principles and mindfulness in education', 
     (SELECT id FROM tags WHERE name = 'Religious Ethos' AND tag_type_id = philosophy_type_id), 3);
    
    -- Core Values & Social-Emotional Anchors Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (philosophy_type_id, 'Core Values & Social-Emotional Anchors', 'Values-based and emotional development approaches', 3);
    
    -- Core Values & Social-Emotional Anchors Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (philosophy_type_id, 'Emotional Literacy Focus', 'Developing emotional intelligence and awareness', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 1),
    (philosophy_type_id, 'Resilience-Building', 'Building mental and emotional resilience', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 2),
    (philosophy_type_id, 'Anti-Burnout / Balanced Learning', 'Preventing burnout through balanced educational approaches', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 3),
    (philosophy_type_id, 'Confidence-Building', 'Developing self-confidence and self-esteem', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 4),
    (philosophy_type_id, 'Collaboration & Teamwork', 'Fostering collaborative skills and team dynamics', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 5),
    (philosophy_type_id, 'Critical Thinking / Problem-Solving', 'Developing analytical and problem-solving skills', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 6),
    (philosophy_type_id, 'Independence / Self-Directed', 'Encouraging independent learning and self-direction', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 7),
    (philosophy_type_id, 'Parent-Child Co-Learning', 'Learning experiences designed for parent and child together', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 8),
    (philosophy_type_id, 'Neurodiverse-Inclusive', 'Inclusive education for neurodiverse learners', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 9),
    (philosophy_type_id, 'Equity / Access-Oriented', 'Ensuring equal access and opportunities for all learners', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 10),
    (philosophy_type_id, 'Environmental Awareness / Sustainability', 'Environmental education and sustainable practices', 
     (SELECT id FROM tags WHERE name = 'Core Values & Social-Emotional Anchors' AND tag_type_id = philosophy_type_id), 11);
    
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
WHERE tt.name = 'philosophy'
ORDER BY t.sort_order, t.name;
