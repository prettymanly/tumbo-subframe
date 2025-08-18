-- Insert Child Tags for Tümbo
-- Run this after creating the schema, content tags, philosophy tags, and experience tags

-- First, get the child tag type ID
DO $$
DECLARE
    child_type_id UUID;
BEGIN
    SELECT id INTO child_type_id FROM tag_types WHERE name = 'child';
    
    -- Personality Traits Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (child_type_id, 'Personality Traits', 'Individual personality characteristics and behavioral patterns', 1);
    
    -- Personality Traits Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (child_type_id, 'Shy in Groups', 'Children who are reserved or quiet in group settings', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 1),
    (child_type_id, 'Outgoing & Expressive', 'Children who are naturally social and expressive', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 2),
    (child_type_id, 'Sensitive & Thoughtful', 'Children who are emotionally aware and reflective', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 3),
    (child_type_id, 'Restless / Needs Movement', 'Children who require physical activity and movement', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 4),
    (child_type_id, 'Detail-Oriented', 'Children who focus on specifics and precision', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 5),
    (child_type_id, 'Highly Curious', 'Children with strong natural curiosity and inquiry', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 6),
    (child_type_id, 'Imaginative Dreamer', 'Children with rich imagination and creative thinking', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 7),
    (child_type_id, 'Resilient / Persistent', 'Children who persevere through challenges', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 8),
    (child_type_id, 'Easily Distracted', 'Children who need help maintaining focus', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 9),
    (child_type_id, 'Thrives on Routine', 'Children who benefit from structured, predictable schedules', 
     (SELECT id FROM tags WHERE name = 'Personality Traits' AND tag_type_id = child_type_id), 10);
    
    -- Learning Styles Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (child_type_id, 'Learning Styles', 'Preferred ways of acquiring and processing information', 2);
    
    -- Learning Styles Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (child_type_id, 'Visual Learner', 'Children who learn best through visual aids and imagery', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 1),
    (child_type_id, 'Auditory Learner', 'Children who learn best through listening and verbal instruction', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 2),
    (child_type_id, 'Kinesthetic Learner', 'Children who learn best through hands-on activities and movement', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 3),
    (child_type_id, 'Observational Learner', 'Children who learn by watching and observing others', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 4),
    (child_type_id, 'Experimental / Trial-and-Error Learner', 'Children who learn through experimentation and testing', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 5),
    (child_type_id, 'Story-Driven Learner', 'Children who learn best through narratives and storytelling', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 6),
    (child_type_id, 'Tech-Oriented Learner', 'Children who are comfortable with and motivated by technology', 
     (SELECT id FROM tags WHERE name = 'Learning Styles' AND tag_type_id = child_type_id), 7);
    
    -- Social Preferences Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (child_type_id, 'Social Preferences', 'Preferred social interaction patterns and group dynamics', 3);
    
    -- Social Preferences Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (child_type_id, 'Loves Team Activities', 'Children who enjoy collaborative group work and team sports', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 1),
    (child_type_id, 'Prefers One-on-One Attention', 'Children who thrive with individual attention and instruction', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 2),
    (child_type_id, 'Small Group Comfort (3–5 kids)', 'Children who are comfortable in intimate group settings', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 3),
    (child_type_id, 'Enjoys Large Group Energy', 'Children who thrive in dynamic, energetic group environments', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 4),
    (child_type_id, 'Peer-Motivated', 'Children who are inspired and motivated by their peers', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 5),
    (child_type_id, 'Independent Worker', 'Children who prefer to work and learn independently', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 6),
    (child_type_id, 'Parent-Child Co-Learning', 'Children who enjoy learning experiences with their parents', 
     (SELECT id FROM tags WHERE name = 'Social Preferences' AND tag_type_id = child_type_id), 7);
    
    -- Growth Areas (Developmental Needs) Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (child_type_id, 'Growth Areas (Developmental Needs)', 'Areas where children need support and development', 4);
    
    -- Growth Areas Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (child_type_id, 'Builds Confidence', 'Classes that help develop self-confidence and self-esteem', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 1),
    (child_type_id, 'Improves Focus & Self-Regulation', 'Classes that enhance concentration and self-control', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 2),
    (child_type_id, 'Develops Resilience', 'Classes that build mental and emotional resilience', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 3),
    (child_type_id, 'Encourages Risk-Taking / Exploration', 'Classes that promote trying new things and exploration', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 4),
    (child_type_id, 'Emotional Literacy', 'Classes that develop emotional intelligence and awareness', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 5),
    (child_type_id, 'Communication & Speaking Up', 'Classes that improve verbal communication and self-expression', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 6),
    (child_type_id, 'Leadership / Taking Initiative', 'Classes that develop leadership skills and initiative', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 7),
    (child_type_id, 'Collaboration & Empathy', 'Classes that foster teamwork and emotional understanding', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 8),
    (child_type_id, 'Problem-Solving & Critical Thinking', 'Classes that develop analytical and problem-solving skills', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 9),
    (child_type_id, 'Stress Management / Anti-Burnout', 'Classes that help manage stress and prevent burnout', 
     (SELECT id FROM tags WHERE name = 'Growth Areas (Developmental Needs)' AND tag_type_id = child_type_id), 10);
    
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
WHERE tt.name = 'child'
ORDER BY t.sort_order, t.name;
