-- Insert Content Tags for Tümbo
-- Run this after creating the schema

-- First, get the content tag type ID
DO $$
DECLARE
    content_type_id UUID;
BEGIN
    SELECT id INTO content_type_id FROM tag_types WHERE name = 'content';
    
    -- Music Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Music', 'Musical instruments and vocal training', 1);
    
    -- Music Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Piano', 'Piano lessons and training', 
     (SELECT id FROM tags WHERE name = 'Music' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Violin', 'Violin lessons and training', 
     (SELECT id FROM tags WHERE name = 'Music' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Vocal Training', 'Voice lessons and singing instruction', 
     (SELECT id FROM tags WHERE name = 'Music' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Guitar', 'Guitar lessons and training', 
     (SELECT id FROM tags WHERE name = 'Music' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Drums', 'Drum lessons and percussion training', 
     (SELECT id FROM tags WHERE name = 'Music' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Music Theory', 'Music theory and composition', 
     (SELECT id FROM tags WHERE name = 'Music' AND tag_type_id = content_type_id), 6);
    
    -- Dance Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Dance', 'Various dance styles and techniques', 2);
    
    -- Dance Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Ballet', 'Classical ballet training', 
     (SELECT id FROM tags WHERE name = 'Dance' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'K-Pop Dance', 'K-Pop style dance routines', 
     (SELECT id FROM tags WHERE name = 'Dance' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Hip-Hop', 'Hip-hop dance styles', 
     (SELECT id FROM tags WHERE name = 'Dance' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Contemporary', 'Contemporary dance techniques', 
     (SELECT id FROM tags WHERE name = 'Dance' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Jazz', 'Jazz dance styles', 
     (SELECT id FROM tags WHERE name = 'Dance' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Cultural Dance', 'Traditional cultural dance forms', 
     (SELECT id FROM tags WHERE name = 'Dance' AND tag_type_id = content_type_id), 6);
    
    -- Cultural Dance Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Chinese Dance', 'Traditional Chinese dance forms', 
     (SELECT id FROM tags WHERE name = 'Cultural Dance' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Indian Dance', 'Traditional Indian dance forms', 
     (SELECT id FROM tags WHERE name = 'Cultural Dance' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Malay Dance', 'Traditional Malay dance forms', 
     (SELECT id FROM tags WHERE name = 'Cultural Dance' AND tag_type_id = content_type_id), 3);
    
    -- Academic Enrichment Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Academic Enrichment', 'Core academic subjects and skills', 3);
    
    -- Academic Enrichment Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Math', 'Mathematics and problem solving', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Chinese', 'Chinese language including Higher Chinese', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'English', 'English language and literature', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Science', 'General science and experiments', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Creative Writing', 'Creative writing and storytelling', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Phonics', 'Phonics and early reading skills', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 6),
    (content_type_id, 'Reading & Literacy', 'Reading comprehension and literacy skills', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 7),
    (content_type_id, 'Malay', 'Malay language and literature', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 8),
    (content_type_id, 'Tamil', 'Tamil language and literature', 
     (SELECT id FROM tags WHERE name = 'Academic Enrichment' AND tag_type_id = content_type_id), 9);
    
    -- Exam Prep & Olympiads Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Exam Prep & Olympiads', 'Test preparation and competitive programs', 4);
    
    -- Exam Prep & Olympiads Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'PSLE Math', 'Primary School Leaving Examination Mathematics preparation', 
     (SELECT id FROM tags WHERE name = 'Exam Prep & Olympiads' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'PSLE English', 'Primary School Leaving Examination English preparation', 
     (SELECT id FROM tags WHERE name = 'Exam Prep & Olympiads' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'PSLE Science', 'Primary School Leaving Examination Science preparation', 
     (SELECT id FROM tags WHERE name = 'Exam Prep & Olympiads' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'PSLE Chinese', 'Primary School Leaving Examination Chinese preparation', 
     (SELECT id FROM tags WHERE name = 'Exam Prep & Olympiads' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Math Olympiad', 'Mathematics competition preparation', 
     (SELECT id FROM tags WHERE name = 'Exam Prep & Olympiads' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'GEP Prep', 'Gifted Education Programme preparation', 
     (SELECT id FROM tags WHERE name = 'Exam Prep & Olympiads' AND tag_type_id = content_type_id), 6);
    
    -- STEM & Tech Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'STEM & Tech', 'Science, Technology, Engineering, and Mathematics', 5);
    
    -- STEM & Tech Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Coding', 'Programming with Scratch, Python, and other languages', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Robotics', 'Robot building and programming', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Maker / Tinkering', 'DIY projects and hands-on building', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'App Development', 'Mobile and web application development', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 4),
    (content_type_id, '3D Printing', '3D design and printing technology', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Engineering Basics', 'Fundamental engineering principles', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 6),
    (content_type_id, 'Animation', 'Digital animation and motion graphics', 
     (SELECT id FROM tags WHERE name = 'STEM & Tech' AND tag_type_id = content_type_id), 7);
    
    -- Sports Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Sports', 'Physical activities and athletic training', 6);
    
    -- Sports Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Swimming', 'Swimming lessons and water safety', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Badminton', 'Badminton training and skills', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Football (Soccer)', 'Football training and team play', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Taekwondo', 'Taekwondo martial arts training', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Basketball', 'Basketball training and team play', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Gymnastics', 'Gymnastics training and flexibility', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 6),
    (content_type_id, 'Tennis', 'Tennis training and skills', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 7),
    (content_type_id, 'Table Tennis', 'Table tennis training and skills', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 8),
    (content_type_id, 'Karate', 'Karate martial arts training', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 9),
    (content_type_id, 'Boxing', 'Boxing training and fitness', 
     (SELECT id FROM tags WHERE name = 'Sports' AND tag_type_id = content_type_id), 10);
    
    -- Art & Design Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Art & Design', 'Creative arts and design thinking', 7);
    
    -- Art & Design Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Drawing', 'Drawing techniques and skills', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Painting', 'Painting techniques and mediums', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Crafts', 'Handmade crafts and DIY projects', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Digital Art', 'Digital art and design tools', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Watercolour', 'Watercolour painting techniques', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Pottery', 'Clay and pottery making', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 6),
    (content_type_id, 'Design Thinking', 'Creative problem-solving and design process', 
     (SELECT id FROM tags WHERE name = 'Art & Design' AND tag_type_id = content_type_id), 7);
    
    -- Cognitive & Strategy Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Cognitive & Strategy', 'Brain training and strategic thinking', 8);
    
    -- Cognitive & Strategy Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Chess', 'Chess strategy and tactics', 
     (SELECT id FROM tags WHERE name = 'Cognitive & Strategy' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Rubik''s Cube', 'Rubik''s cube solving techniques', 
     (SELECT id FROM tags WHERE name = 'Cognitive & Strategy' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Go', 'Go board game strategy', 
     (SELECT id FROM tags WHERE name = 'Cognitive & Strategy' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Logic Puzzles', 'Logic and reasoning puzzles', 
     (SELECT id FROM tags WHERE name = 'Cognitive & Strategy' AND tag_type_id = content_type_id), 4);
    
    -- Holistic & Life Skills Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Holistic & Life Skills', 'Personal development and life skills', 9);
    
    -- Holistic & Life Skills Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Public Speaking', 'Public speaking and presentation skills', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Debate', 'Debate and argumentation skills', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Leadership', 'Leadership development and team management', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Entrepreneurship', 'Business and entrepreneurial skills', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Mindfulness', 'Mindfulness and meditation practices', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Mental Wellness', 'Mental health and emotional well-being', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 6),
    (content_type_id, 'Financial Literacy', 'Money management and financial education', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 7),
    (content_type_id, 'Nature & Outdoor', 'Outdoor activities and nature education', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 8),
    (content_type_id, 'Holiday Camps', 'Holiday and vacation programs', 
     (SELECT id FROM tags WHERE name = 'Holistic & Life Skills' AND tag_type_id = content_type_id), 9);
    
    -- Languages (Non-exam / Foreign) Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Languages (Non-exam / Foreign)', 'Foreign language learning and cultural studies', 10);
    
    -- Languages Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Chinese', 'Chinese language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Malay', 'Malay language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Hindi', 'Hindi language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Tamil', 'Tamil language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'Arabic', 'Arabic language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 5),
    (content_type_id, 'Japanese', 'Japanese language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 6),
    (content_type_id, 'Korean', 'Korean language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 7),
    (content_type_id, 'French', 'French language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 8),
    (content_type_id, 'Spanish', 'Spanish language and culture', 
     (SELECT id FROM tags WHERE name = 'Languages (Non-exam / Foreign)' AND tag_type_id = content_type_id), 9);
    
    -- Early Years (2–6) Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Early Years (2–6)', 'Early childhood development programs', 11);
    
    -- Early Years Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Phonics & Pre-Reading', 'Early reading and phonics skills', 
     (SELECT id FROM tags WHERE name = 'Early Years (2–6)' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Fine Motor Skills', 'Fine motor development and coordination', 
     (SELECT id FROM tags WHERE name = 'Early Years (2–6)' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Sensory Play', 'Sensory exploration and play activities', 
     (SELECT id FROM tags WHERE name = 'Early Years (2–6)' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Parent-Child Classes', 'Classes designed for parent and child participation', 
     (SELECT id FROM tags WHERE name = 'Early Years (2–6)' AND tag_type_id = content_type_id), 4),
    (content_type_id, 'School Readiness', 'Preparation for formal education', 
     (SELECT id FROM tags WHERE name = 'Early Years (2–6)' AND tag_type_id = content_type_id), 5);
    
    -- Culinary & Media Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Culinary & Media', 'Cooking, baking, and media production', 12);
    
    -- Culinary & Media Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Baking', 'Baking and pastry making', 
     (SELECT id FROM tags WHERE name = 'Culinary & Media' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Cooking', 'Cooking and culinary arts', 
     (SELECT id FROM tags WHERE name = 'Culinary & Media' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Photography', 'Photography and visual arts', 
     (SELECT id FROM tags WHERE name = 'Culinary & Media' AND tag_type_id = content_type_id), 3),
    (content_type_id, 'Videography', 'Video production and filmmaking', 
     (SELECT id FROM tags WHERE name = 'Culinary & Media' AND tag_type_id = content_type_id), 4);
    
    -- Values / Religious (opt-in) Category
    INSERT INTO tags (tag_type_id, name, description, sort_order) VALUES
    (content_type_id, 'Values / Religious (opt-in)', 'Religious education and character development', 13);
    
    -- Values / Religious Subcategories
    INSERT INTO tags (tag_type_id, name, description, parent_id, sort_order) VALUES
    (content_type_id, 'Islamic Studies', 'Islamic education including Quran and Tajwid', 
     (SELECT id FROM tags WHERE name = 'Values / Religious (opt-in)' AND tag_type_id = content_type_id), 1),
    (content_type_id, 'Sunday School', 'Christian religious education', 
     (SELECT id FROM tags WHERE name = 'Values / Religious (opt-in)' AND tag_type_id = content_type_id), 2),
    (content_type_id, 'Character Education', 'Moral and character development', 
     (SELECT id FROM tags WHERE name = 'Values / Religious (opt-in)' AND tag_type_id = content_type_id), 3);
    
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
WHERE tt.name = 'content'
ORDER BY t.sort_order, t.name;
