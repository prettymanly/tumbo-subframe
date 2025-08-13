-- Tümbo MVP Seed Data
-- Sample providers and classes for testing

-- Insert sample providers
INSERT INTO public.providers (name, slug, short_description, long_description, website_url, contact_email, verified) VALUES
('Little Artists Studio', 'little-artists-studio', 'Creative arts and crafts for young minds', 'We specialize in nurturing creativity through various art forms including painting, drawing, and sculpture. Our experienced instructors create a supportive environment where children can express themselves freely.', 'https://littleartists.sg', 'hello@littleartists.sg', true),
('TechTots Academy', 'techtots-academy', 'STEM education for curious kids', 'Introducing children to the exciting world of technology, robotics, and coding through hands-on projects and interactive learning experiences.', 'https://techtots.sg', 'info@techtots.sg', true),
('Dance Dreams Singapore', 'dance-dreams-singapore', 'Dance classes for all ages and skill levels', 'From ballet to hip-hop, we offer comprehensive dance education that builds confidence, coordination, and creativity in children.', 'https://dancedreams.sg', 'contact@dancedreams.sg', true),
('Mandarin Magic', 'mandarin-magic', 'Fun Mandarin learning for children', 'Making Mandarin learning enjoyable through songs, stories, and interactive activities. Perfect for both native and non-native speakers.', 'https://mandarinmagic.sg', 'learn@mandarinmagic.sg', true),
('Chess Champions', 'chess-champions', 'Strategic thinking through chess', 'Teaching chess fundamentals while developing critical thinking, patience, and strategic planning skills in a fun, supportive environment.', 'https://chesschampions.sg', 'play@chesschampions.sg', true);

-- Insert sample classes
INSERT INTO public.classes (provider_id, title, slug, tagline, description, age_min, age_max, class_size_min, class_size_max, price_per_class, location_name, hero_image_url) VALUES
((SELECT id FROM public.providers WHERE slug = 'little-artists-studio'), 'Creative Painting Workshop', 'creative-painting-workshop', 'For kids who love to paint and create', 'A hands-on painting workshop where children explore different techniques, colors, and mediums. Each session focuses on a new theme or technique, encouraging creativity and artistic expression.', 4, 8, 6, 12, 35.00, 'Little Artists Studio - Orchard', 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=800'),
((SELECT id FROM public.providers WHERE slug = 'little-artists-studio'), 'Clay Sculpture for Kids', 'clay-sculpture-for-kids', 'For kids who love to build and shape', 'Children learn the basics of working with clay, creating 3D sculptures and developing fine motor skills. Each child takes home their unique creation.', 5, 10, 4, 8, 45.00, 'Little Artists Studio - Orchard', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'),
((SELECT id FROM public.providers WHERE slug = 'techtots-academy'), 'Introduction to Robotics', 'introduction-to-robotics', 'For kids who love to build and program', 'Learn the fundamentals of robotics through building and programming simple robots. Children work with age-appropriate robotics kits and learn basic programming concepts.', 6, 12, 6, 10, 55.00, 'TechTots Academy - Marina Bay', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'),
((SELECT id FROM public.providers WHERE slug = 'techtots-academy'), 'Coding for Beginners', 'coding-for-beginners', 'For kids who love puzzles and logic', 'An introduction to coding concepts using visual programming languages. Children learn problem-solving skills while creating their own games and animations.', 7, 11, 4, 8, 50.00, 'TechTots Academy - Marina Bay', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'),
((SELECT id FROM public.providers WHERE slug = 'dance-dreams-singapore'), 'Ballet Basics', 'ballet-basics', 'For kids who love to move gracefully', 'Introduction to classical ballet techniques, posture, and movement. Children develop coordination, balance, and musicality in a structured yet fun environment.', 3, 6, 8, 15, 40.00, 'Dance Dreams - Orchard Road', 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800'),
((SELECT id FROM public.providers WHERE slug = 'dance-dreams-singapore'), 'Hip-Hop Kids', 'hip-hop-kids', 'For kids who love energetic dance moves', 'High-energy hip-hop classes teaching rhythm, coordination, and street dance moves. Children learn choreography while building confidence and fitness.', 7, 12, 6, 12, 45.00, 'Dance Dreams - Orchard Road', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'),
((SELECT id FROM public.providers WHERE slug = 'mandarin-magic'), 'Mandarin Story Time', 'mandarin-story-time', 'For kids who love stories and songs', 'Interactive Mandarin learning through storytelling, songs, and games. Perfect for young learners to develop listening and speaking skills naturally.', 2, 5, 4, 8, 30.00, 'Mandarin Magic - Tampines', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),
((SELECT id FROM public.providers WHERE slug = 'mandarin-magic'), 'Mandarin Conversation Club', 'mandarin-conversation-club', 'For kids who want to practice speaking', 'Structured conversation practice in Mandarin, focusing on everyday topics and building confidence in speaking. Includes cultural activities and games.', 6, 10, 4, 6, 35.00, 'Mandarin Magic - Tampines', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'),
((SELECT id FROM public.providers WHERE slug = 'chess-champions'), 'Chess Fundamentals', 'chess-fundamentals', 'For kids who love strategy games', 'Learn chess basics including piece movement, game rules, and simple strategies. Children develop critical thinking and patience through gameplay.', 5, 9, 4, 8, 25.00, 'Chess Champions - Jurong East', 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800'),
((SELECT id FROM public.providers WHERE slug = 'chess-champions'), 'Advanced Chess Strategies', 'advanced-chess-strategies', 'For kids who want to improve their game', 'Advanced chess concepts including opening strategies, middle game tactics, and endgame techniques. For children with basic chess knowledge.', 8, 12, 4, 6, 30.00, 'Chess Champions - Jurong East', 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800');

-- Insert sample sessions
INSERT INTO public.sessions (class_id, weekday, start_time, end_time, frequency, notes) VALUES
((SELECT id FROM public.classes WHERE slug = 'creative-painting-workshop'), 1, '14:00:00', '15:30:00', 'weekly', 'Monday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'creative-painting-workshop'), 3, '14:00:00', '15:30:00', 'weekly', 'Wednesday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'clay-sculpture-for-kids'), 2, '15:00:00', '16:30:00', 'weekly', 'Tuesday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'introduction-to-robotics'), 4, '16:00:00', '17:30:00', 'weekly', 'Thursday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'coding-for-beginners'), 5, '14:00:00', '15:30:00', 'weekly', 'Friday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'ballet-basics'), 6, '09:00:00', '10:00:00', 'weekly', 'Saturday morning session'),
((SELECT id FROM public.classes WHERE slug = 'hip-hop-kids'), 6, '10:30:00', '11:30:00', 'weekly', 'Saturday morning session'),
((SELECT id FROM public.classes WHERE slug = 'mandarin-story-time'), 1, '10:00:00', '11:00:00', 'weekly', 'Monday morning session'),
((SELECT id FROM public.classes WHERE slug = 'mandarin-conversation-club'), 3, '16:00:00', '17:00:00', 'weekly', 'Wednesday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'chess-fundamentals'), 6, '14:00:00', '15:00:00', 'weekly', 'Saturday afternoon session'),
((SELECT id FROM public.classes WHERE slug = 'advanced-chess-strategies'), 6, '15:30:00', '16:30:00', 'weekly', 'Saturday afternoon session');

-- Link classes to tags
INSERT INTO public.class_tags (class_id, tag_id) VALUES
-- Creative Painting Workshop
((SELECT id FROM public.classes WHERE slug = 'creative-painting-workshop'), (SELECT id FROM public.tags WHERE slug = 'art')),
((SELECT id FROM public.classes WHERE slug = 'creative-painting-workshop'), (SELECT id FROM public.tags WHERE slug = 'hands-on')),
((SELECT id FROM public.classes WHERE slug = 'creative-painting-workshop'), (SELECT id FROM public.tags WHERE slug = 'creative')),

-- Clay Sculpture
((SELECT id FROM public.classes WHERE slug = 'clay-sculpture-for-kids'), (SELECT id FROM public.classes WHERE slug = 'art')),
((SELECT id FROM public.classes WHERE slug = 'clay-sculpture-for-kids'), (SELECT id FROM public.tags WHERE slug = 'hands-on')),
((SELECT id FROM public.classes WHERE slug = 'clay-sculpture-for-kids'), (SELECT id FROM public.tags WHERE slug = 'project-based')),

-- Robotics
((SELECT id FROM public.classes WHERE slug = 'introduction-to-robotics'), (SELECT id FROM public.tags WHERE slug = 'robotics')),
((SELECT id FROM public.classes WHERE slug = 'introduction-to-robotics'), (SELECT id FROM public.tags WHERE slug = 'stem')),
((SELECT id FROM public.classes WHERE slug = 'introduction-to-robotics'), (SELECT id FROM public.tags WHERE slug = 'hands-on')),

-- Coding
((SELECT id FROM public.classes WHERE slug = 'coding-for-beginners'), (SELECT id FROM public.tags WHERE slug = 'coding')),
((SELECT id FROM public.classes WHERE slug = 'coding-for-beginners'), (SELECT id FROM public.tags WHERE slug = 'stem')),
((SELECT id FROM public.classes WHERE slug = 'coding-for-beginners'), (SELECT id FROM public.tags WHERE slug = 'analytical')),

-- Ballet
((SELECT id FROM public.classes WHERE slug = 'ballet-basics'), (SELECT id FROM public.tags WHERE slug = 'dance')),
((SELECT id FROM public.classes WHERE slug = 'ballet-basics'), (SELECT id FROM public.tags WHERE slug = 'movement-based')),
((SELECT id FROM public.classes WHERE slug = 'ballet-basics'), (SELECT id FROM public.tags WHERE slug = 'needs-structure')),

-- Hip-Hop
((SELECT id FROM public.classes WHERE slug = 'hip-hop-kids'), (SELECT id FROM public.tags WHERE slug = 'dance')),
((SELECT id FROM public.classes WHERE slug = 'hip-hop-kids'), (SELECT id FROM public.tags WHERE slug = 'high-energy')),
((SELECT id FROM public.classes WHERE slug = 'hip-hop-kids'), (SELECT id FROM public.tags WHERE slug = 'social-butterfly')),

-- Mandarin Story Time
((SELECT id FROM public.classes WHERE slug = 'mandarin-story-time'), (SELECT id FROM public.tags WHERE slug = 'mandarin')),
((SELECT id FROM public.classes WHERE slug = 'mandarin-story-time'), (SELECT id FROM public.tags WHERE slug = 'language')),
((SELECT id FROM public.classes WHERE slug = 'mandarin-story-time'), (SELECT id FROM public.tags WHERE slug = 'interactive')),

-- Mandarin Conversation
((SELECT id FROM public.classes WHERE slug = 'mandarin-conversation-club'), (SELECT id FROM public.tags WHERE slug = 'mandarin')),
((SELECT id FROM public.classes WHERE slug = 'mandarin-conversation-club'), (SELECT id FROM public.tags WHERE slug = 'language')),
((SELECT id FROM public.classes WHERE slug = 'mandarin-conversation-club'), (SELECT id FROM public.tags WHERE slug = 'small-group')),

-- Chess Fundamentals
((SELECT id FROM public.classes WHERE slug = 'chess-fundamentals'), (SELECT id FROM public.tags WHERE slug = 'chess')),
((SELECT id FROM public.classes WHERE slug = 'chess-fundamentals'), (SELECT id FROM public.tags WHERE slug = 'analytical')),
((SELECT id FROM public.classes WHERE slug = 'chess-fundamentals'), (SELECT id FROM public.tags WHERE slug = 'needs-structure')),

-- Advanced Chess
((SELECT id FROM public.classes WHERE slug = 'advanced-chess-strategies'), (SELECT id FROM public.tags WHERE slug = 'chess')),
((SELECT id FROM public.classes WHERE slug = 'advanced-chess-strategies'), (SELECT id FROM public.tags WHERE slug = 'analytical')),
((SELECT id FROM public.classes WHERE slug = 'advanced-chess-strategies'), (SELECT id FROM public.tags WHERE slug = 'independent'));

-- Insert sample collections
INSERT INTO public.collections (title, tagline, cover_image_url, is_featured) VALUES
('Best for Toddlers', 'Perfect activities for our littlest learners', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', true),
('STEM Focus', 'Science, Technology, Engineering, and Math for curious minds', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', true),
('Creative Arts', 'Unleash creativity through various art forms', 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e?w=800', true);

-- Link classes to collections
INSERT INTO public.collection_items (collection_id, class_id, sort_order) VALUES
((SELECT id FROM public.collections WHERE title = 'Best for Toddlers'), (SELECT id FROM public.classes WHERE slug = 'mandarin-story-time'), 1),
((SELECT id FROM public.collections WHERE title = 'Best for Toddlers'), (SELECT id FROM public.classes WHERE slug = 'ballet-basics'), 2),
((SELECT id FROM public.collections WHERE title = 'STEM Focus'), (SELECT id FROM public.classes WHERE slug = 'introduction-to-robotics'), 1),
((SELECT id FROM public.collections WHERE title = 'STEM Focus'), (SELECT id FROM public.classes WHERE slug = 'coding-for-beginners'), 2),
((SELECT id FROM public.collections WHERE title = 'Creative Arts'), (SELECT id FROM public.classes WHERE slug = 'creative-painting-workshop'), 1),
((SELECT id FROM public.collections WHERE title = 'Creative Arts'), (SELECT id FROM public.classes WHERE slug = 'clay-sculpture-for-kids'), 2);
