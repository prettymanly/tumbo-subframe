-- Tümbo MVP Database Schema
-- Based on PRD v0.9 - MVP Build

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROVIDERS table
CREATE TABLE public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  short_description text,
  long_description text,
  website_url text,
  contact_email text,
  contact_phone text,
  address_text text,
  map_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CLASSES table
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE,
  tagline text,                        -- one-liner ("For kids who …")
  description text,                    -- rich overview
  age_min int,                         -- e.g. 3
  age_max int,                         -- e.g. 6
  class_size_min int,
  class_size_max int,
  price_per_class numeric(10,2),
  price_range_min numeric(10,2),
  price_range_max numeric(10,2),
  package_notes text,                  -- e.g. "4 sessions pack available"
  location_name text,
  address_text text,
  map_url text,
  hero_image_url text,                 -- primary hero
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CLASS IMAGES (gallery for hero carousel / "See all photos")
CREATE TABLE public.class_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  alt_text text
);

-- SESSIONS (structured schedule)
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  weekday int CHECK (weekday BETWEEN 0 AND 6),  -- 0=Sun … 6=Sat
  start_time time,
  end_time time,
  frequency text DEFAULT 'weekly',             -- weekly, ad-hoc, holiday-camp
  notes text
);

-- INSTRUCTORS
CREATE TABLE public.instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  avatar_url text,
  bio_short text,
  bio_long text,
  specialties text[]
);

-- LINK: class ↔ instructor
CREATE TABLE public.instructor_classes (
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES public.instructors(id) ON DELETE CASCADE,
  role text,                -- lead, assistant
  PRIMARY KEY (class_id, instructor_id)
);

-- REVIEWS ("Overheard Online")
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  reviewer_name text,
  reviewer_avatar_url text,
  review_source text,               -- Google, FB, KiasuParents
  review_url text,
  review_date date,
  rating int CHECK (rating BETWEEN 1 AND 5),
  body text
);

-- NEARBY PLACES (Cafes, Libraries, Shops etc.)
CREATE TABLE public.nearby_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text CHECK (category IN ('cafe','gym','shop','library','park','food','other')),
  short_description text,
  image_url text,
  address_text text,
  map_url text
);

-- TAGS (shared taxonomy)
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  family text NOT NULL CHECK (
    family IN ('content','experience','philosophy','child_style','collection_theme')
  )
);

-- LINK: class ↔ tag
CREATE TABLE public.class_tags (
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, tag_id)
);

-- COLLECTIONS (Curated Picks)
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tagline text,                 -- collection one-liner
  cover_image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- LINK: class ↔ collection (ordered)
CREATE TABLE public.collection_items (
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  sort_order int DEFAULT 0,
  PRIMARY KEY (collection_id, class_id)
);

-- USERS & CHILDREN (for personalization)
CREATE TABLE public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  birthdate date,
  notes text,                   -- raw parent input
  learning_signature jsonb,     -- generated profile snapshot
  created_at timestamptz DEFAULT now()
);

-- FAVORITES (save classes)
CREATE TABLE public.favorites (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, class_id)
);

-- FEEDBACK on recommendations / fits
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
  signal text CHECK (signal IN ('like','dislike','maybe')),
  reason_tags text[],           -- e.g. ['too-far','too-fast','pricey']
  comment text,
  created_at timestamptz DEFAULT now()
);

-- SCRAPING STAGING
CREATE TABLE public.raw_scrape_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_hint text,      -- name/slug you expect
  url text,
  source_type text,        -- site, google, fb, forum
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.raw_scrape_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.raw_scrape_sources(id) ON DELETE CASCADE,
  scraped_at timestamptz DEFAULT now(),
  raw_html text,
  extracted jsonb,         -- flexible: name, price, schedule blocks, images, etc.
  status text DEFAULT 'new' CHECK (status IN ('new','parsed','ignored','error')),
  error_message text
);

-- Helpful indexes for performance
CREATE INDEX ON public.classes (provider_id);
CREATE INDEX ON public.classes USING gin (to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(description,'')));
CREATE INDEX ON public.class_tags (class_id);
CREATE INDEX ON public.class_tags (tag_id);
CREATE INDEX ON public.tags (family, name);
CREATE INDEX ON public.sessions (class_id, weekday);
CREATE INDEX ON public.reviews (class_id, review_date DESC);

-- Enable Row Level Security
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_scrape_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_scrape_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous read access to public catalog
CREATE POLICY "Allow anonymous read access to providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to class_images" ON public.class_images FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to instructors" ON public.instructors FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to instructor_classes" ON public.instructor_classes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to nearby_places" ON public.nearby_places FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to class_tags" ON public.class_tags FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access to collection_items" ON public.collection_items FOR SELECT USING (true);

-- RLS Policies for user-owned data
CREATE POLICY "Users can manage their own children" ON public.children FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own feedback" ON public.feedback FOR ALL USING (auth.uid() = user_id);

-- Insert seed tags for MVP
INSERT INTO public.tags (name, slug, family) VALUES
-- Content tags
('Art', 'art', 'content'),
('Robotics', 'robotics', 'content'),
('Dance', 'dance', 'content'),
('Mandarin', 'mandarin', 'content'),
('Chess', 'chess', 'content'),
('Coding', 'coding', 'content'),
('STEM', 'stem', 'content'),
('Music', 'music', 'content'),
('Sports', 'sports', 'content'),
('Language', 'language', 'content'),

-- Experience tags
('Project-based', 'project-based', 'experience'),
('Movement-based', 'movement-based', 'experience'),
('High-energy', 'high-energy', 'experience'),
('Small-group', 'small-group', 'experience'),
('1-to-1', '1-to-1', 'experience'),
('Outdoor', 'outdoor', 'experience'),
('Interactive', 'interactive', 'experience'),
('Hands-on', 'hands-on', 'experience'),

-- Philosophy tags
('Montessori', 'montessori', 'philosophy'),
('Reggio', 'reggio', 'philosophy'),
('Play-based', 'play-based', 'philosophy'),
('Islamic', 'islamic', 'philosophy'),
('Nature-inspired', 'nature-inspired', 'philosophy'),
('Evidence-based', 'evidence-based', 'philosophy'),
('Waldorf', 'waldorf', 'philosophy'),
('Traditional', 'traditional', 'philosophy'),

-- Child style tags
('Shy-but-curious', 'shy-but-curious', 'child_style'),
('Hands-on learner', 'hands-on-learner', 'child_style'),
('Needs structure', 'needs-structure', 'child_style'),
('Sensory-seeking', 'sensory-seeking', 'child_style'),
('Social butterfly', 'social-butterfly', 'child_style'),
('Independent', 'independent', 'child_style'),
('Creative', 'creative', 'child_style'),
('Analytical', 'analytical', 'child_style'),

-- Collection theme tags
('Best for Toddlers', 'best-for-toddlers', 'collection_theme'),
('STEM Focus', 'stem-focus', 'collection_theme'),
('Creative Arts', 'creative-arts', 'collection_theme'),
('Physical Development', 'physical-development', 'collection_theme'),
('Language Learning', 'language-learning', 'collection_theme'),
('Holiday Camps', 'holiday-camps', 'collection_theme'),
('Weekend Activities', 'weekend-activities', 'collection_theme'),
('After School', 'after-school', 'collection_theme');
