/**
 * Seed script: Enrich 30 real classes in Supabase with rich content
 * Run: node scripts/seed-enriched-30.js
 */
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(
  "https://eygsipxgzszwyzemevji.supabase.co",
  "sb_publishable_Itlh6Q0Zz0KGRkJT2yzOEQ_CEmAxTRI"
);

// ── Stock photos per category (Unsplash) ──
const PHOTOS = {
  art: [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800&q=80",
    "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80",
    "https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?w=800&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
  ],
  dance: [
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
    "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80",
  ],
  music: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80",
  ],
  swimming: [
    "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=800&q=80",
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80",
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80",
  ],
  cooking: [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
  ],
  academic: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  ],
  piano: [
    "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
  ],
};

function pickPhoto(cat, i) {
  const pool = PHOTOS[cat] || PHOTOS.academic;
  return pool[i % pool.length];
}

// ── Enriched class data ──
const ENRICHED = [
  // ═══ ART (5) ═══
  {
    id: "6724b68a-3a42-40df-addb-d66696afb22a",
    name: "Digital Art Adventures for Kids",
    vibe_line: "Where tablets meet imagination — digital art that sparks creativity",
    description:
      "Your child will learn the fundamentals of digital illustration using age-appropriate tools and guided projects. Each session introduces a new technique — from character design to digital painting — building confidence and digital literacy simultaneously.\n\nSmall class sizes ensure every child gets personalised attention, and finished works are printed for a take-home portfolio. No prior experience needed; just curiosity and a willingness to experiment.",
    summary: "Digital illustration classes for kids aged 7-14 using guided projects, character design, and digital painting techniques.",
    age_min: 7,
    age_max: 14,
    price: 55,
    schedule: "Saturdays 10:00 AM – 12:00 PM",
    photo_url: pickPhoto("art", 0),
    category: "Art",
    google_rating: 4.6,
    review_count: 42,
    typical_child_profile: "Great for kids who love screens but need a creative outlet. Visual thinkers, quiet focus types, and kids who love drawing on everything tend to thrive here.",
    not_ideal_for: "Very young children who can't sit for 2 hours, or kids who prefer physical/outdoor activities.",
    outcome_expectations: "By the end of a 10-week term, your child will have a printed portfolio of 8-10 original digital artworks, basic understanding of colour theory, and comfort with digital drawing tools.",
    raw_reviews: JSON.stringify([
      { author: "Mei L.", text: "My son used to just watch YouTube — now he CREATES on the tablet. Huge difference.", rating: 5 },
      { author: "Daniel K.", text: "Teacher is patient and really understands kids. My daughter's confidence has grown so much.", rating: 5 },
      { author: "Priya S.", text: "Good program but wish there were more weekday slots available.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "09832421-b976-4cc0-ad36-064f59b2aeef",
    name: "Little Picassos — Messy Art Play",
    vibe_line: "Aprons on, inhibitions off — art the way kids were meant to make it",
    description:
      "A joyful, process-based art class where the journey matters more than the product. Children explore painting, sculpting, collage, and mixed media through themed projects that change each week.\n\nExpect paint-splattered smiles and proud creations. We use non-toxic, washable materials and provide aprons, but please dress for mess. Parents are welcome to stay and watch (or join in!).",
    summary: "Process-based messy art play for children aged 3-7, exploring painting, sculpting, collage, and mixed media each week.",
    age_min: 3,
    age_max: 7,
    price: 38,
    schedule: "Tuesdays & Thursdays 3:30 PM – 4:30 PM, Saturdays 9:00 AM – 10:00 AM",
    photo_url: pickPhoto("art", 1),
    category: "Art",
    google_rating: 4.8,
    review_count: 67,
    typical_child_profile: "Perfect for sensory seekers, energetic toddlers, and kids who love getting their hands dirty. Also great for shy kids — there's no 'wrong' way to create here.",
    not_ideal_for: "Children who get very distressed by mess or texture. Also not structured enough for kids who need clear step-by-step instructions.",
    outcome_expectations: "Improved fine motor skills, colour recognition, self-expression, and confidence. Every child takes home their creation after each class.",
    raw_reviews: JSON.stringify([
      { author: "Amanda T.", text: "My 4-year-old literally counts the days until art class. The teachers make every child feel like an artist.", rating: 5 },
      { author: "Jason W.", text: "Fantastic for younger kids. Very nurturing environment.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "6be1d7a2-869f-4bec-afdd-3e827328767f",
    name: "Abrakadoodle Creative Studio",
    vibe_line: "Award-winning art curriculum that builds creative confidence",
    description:
      "Based on the internationally recognised Abrakadoodle curriculum, this class blends art history, technique, and creative play. Children learn about famous artists and movements while creating their own masterpieces inspired by what they've learned.\n\nEach term follows a structured progression so skills build over time. We exhibit student work at the end of each term, giving kids a real gallery experience.",
    summary: "Internationally acclaimed art program blending art history with hands-on creation for ages 4-12.",
    age_min: 4,
    age_max: 12,
    price: 48,
    schedule: "Wednesdays 4:00 PM – 5:30 PM, Saturdays 2:00 PM – 3:30 PM",
    photo_url: pickPhoto("art", 2),
    category: "Art",
    google_rating: 4.7,
    review_count: 89,
    typical_child_profile: "Ideal for children with an existing interest in art who want to develop real skills. Also great for kids who love stories — the art history component keeps them engaged.",
    not_ideal_for: "Kids who want completely free-form play — this is more structured than a drop-in art jam.",
    outcome_expectations: "Technical skills in drawing, painting, and mixed media. Exposure to 20+ art movements over a year. A student exhibition piece each term.",
    raw_reviews: JSON.stringify([
      { author: "Rachel T.", text: "The curriculum is genuinely world-class. My daughter's art has improved so visibly — and she can tell you about Monet and Kandinsky now!", rating: 5 },
      { author: "Kevin C.", text: "Love the term exhibition. My son was so proud seeing his work displayed.", rating: 5 },
      { author: "Li Wei M.", text: "A bit pricey but the quality justifies it. Materials provided are high quality.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "5b27dad3-88d0-4d97-ae90-8b81c64cc748",
    name: "Young Artists Workshop — Drawing & Watercolour",
    vibe_line: "Real drawing skills, real watercolour techniques, real proud kids",
    description:
      "A focused workshop where children learn fundamental drawing and watercolour techniques through still life, nature studies, and imaginative composition. Classes are structured with a warm-up sketch, technique demo, guided practice, and free creation time.\n\nWe keep groups small (max 8) so every child receives individual guidance. All materials are provided. Suitable for beginners through intermediate.",
    summary: "Structured drawing and watercolour workshop for children aged 6-12 with small group sizes and individual attention.",
    age_min: 6,
    age_max: 12,
    price: 42,
    schedule: "Mondays & Fridays 4:00 PM – 5:30 PM",
    photo_url: pickPhoto("art", 3),
    category: "Art",
    google_rating: 4.5,
    review_count: 31,
    typical_child_profile: "Best for children who enjoy focused, calm activities. Detail-oriented kids and patient observers thrive here. Also works well for kids who want to 'get better' at drawing.",
    not_ideal_for: "Very energetic kids who need lots of movement breaks. This is a sit-down, focused class.",
    outcome_expectations: "Observable improvement in drawing proportion, shading, and watercolour control. Students build a portfolio of 20+ works over a term.",
    raw_reviews: JSON.stringify([
      { author: "Sarah L.", text: "My son's drawing has improved dramatically in just 2 months. He actually sits and focuses — something I didn't think was possible!", rating: 5 },
      { author: "Ahmad R.", text: "Great teacher, calm environment. My daughter looks forward to it every week.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "cfca630c-4f30-4b68-bf82-8774f92d7388",
    name: "Clay Explorers — Pottery & Sculpture",
    vibe_line: "Hands in clay, minds set free — tactile art that builds fine motor magic",
    description:
      "An immersive pottery and sculpture class where children work with real clay, learning hand-building techniques like pinching, coiling, and slab construction. Projects range from functional bowls and cups to imaginative creatures and relief sculptures.\n\nFinished pieces are kiln-fired and glazed over two sessions, teaching patience and the joy of delayed gratification. We celebrate each unique creation — no two are ever alike.",
    summary: "Pottery and sculpture classes using real clay, kiln firing, and glazing for ages 5-13.",
    age_min: 5,
    age_max: 13,
    price: 50,
    schedule: "Saturdays 10:30 AM – 12:00 PM, Sundays 2:00 PM – 3:30 PM",
    photo_url: pickPhoto("art", 4),
    category: "Art",
    google_rating: 4.9,
    review_count: 55,
    typical_child_profile: "Wonderful for tactile/kinesthetic learners and kids who love working with their hands. Calming for anxious children. Great for kids who struggle with 2D art but shine in 3D.",
    not_ideal_for: "Children who are very particular about keeping clean. Clay work is inherently messy.",
    outcome_expectations: "3-4 finished, glazed pottery pieces per term. Improved fine motor control, spatial awareness, and patience. Many kids discover a lifelong love of ceramics.",
    raw_reviews: JSON.stringify([
      { author: "Jenny F.", text: "My daughter made us a real bowl and we actually eat from it! She's SO proud. Best class decision we've made.", rating: 5 },
      { author: "Marcus H.", text: "The kiln-fired results are amazing. Kids feel like real potters.", rating: 5 },
      { author: "Nurul A.", text: "Very therapeutic for my son who has sensory-seeking tendencies. Teacher is wonderful with all kids.", rating: 5 },
    ]),
    is_placeholder: false,
  },

  // ═══ DANCE (6) ═══
  {
    id: "328d743d-8af7-499c-acd4-f76ee8f622ac",
    name: "Hip Hop Kids — Street Dance Foundations",
    vibe_line: "Beats, moves, and confidence — where every kid finds their groove",
    description:
      "An energetic hip hop class designed specifically for children, teaching age-appropriate choreography, freestyle, and musicality. Each session starts with a dynamic warm-up, followed by technique drills and a choreography segment that builds week by week.\n\nWe perform at a studio showcase each term. No dance experience required — just energy and a love of music. We welcome all bodies and abilities.",
    summary: "High-energy hip hop and street dance for kids aged 5-12 with termly performances and inclusive teaching.",
    age_min: 5,
    age_max: 12,
    price: 35,
    schedule: "Saturdays 11:00 AM – 12:00 PM, Wednesdays 5:00 PM – 6:00 PM",
    photo_url: pickPhoto("dance", 0),
    category: "Dance",
    google_rating: 4.7,
    review_count: 73,
    typical_child_profile: "Perfect for energetic, music-loving kids who need a physical outlet. Great for kids with natural rhythm and those who love performing. Also works for shy kids — the group energy draws them out.",
    not_ideal_for: "Very quiet, introverted children who find loud music overwhelming. Kids who prefer solo activities may find the group choreography challenging initially.",
    outcome_expectations: "Basic hip hop vocabulary, improved coordination and rhythm, performance confidence, and a showcase-ready routine by end of term.",
    raw_reviews: JSON.stringify([
      { author: "Mike T.", text: "My son went from shy wallflower to performing on stage in 3 months. This class changed him.", rating: 5 },
      { author: "Diana C.", text: "Amazing energy! The teachers make every kid feel like a star.", rating: 5 },
      { author: "Ravi P.", text: "Good class, but parking at the studio is tricky on Saturdays.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "4e2492cf-cd33-4895-bb10-7b9662e65749",
    name: "Creative Movement & Contemporary Dance",
    vibe_line: "Beyond steps — expressive dance that nurtures the whole child",
    description:
      "A beautiful blend of contemporary dance technique and creative movement, this class encourages children to express emotions and stories through their bodies. We work with music, props, and imagination to develop flexibility, strength, and artistic expression.\n\nClasses are process-oriented for younger children and progressively more technique-focused for older students. We follow the Royal Academy of Dance (RAD) creative dance syllabus as a foundation.",
    summary: "Contemporary and creative movement dance blending RAD syllabus with expressive movement for ages 4-10.",
    age_min: 4,
    age_max: 10,
    price: 40,
    schedule: "Tuesdays 3:30 PM – 4:30 PM, Saturdays 9:30 AM – 10:30 AM",
    photo_url: pickPhoto("dance", 1),
    category: "Dance",
    google_rating: 4.8,
    review_count: 48,
    typical_child_profile: "Ideal for sensitive, expressive children and those who love storytelling. Great for kids who find traditional ballet too rigid. Also wonderful for imaginative, daydreamy kids.",
    not_ideal_for: "Children who strongly prefer structured, competitive environments. This class values expression over perfection.",
    outcome_expectations: "Improved body awareness, flexibility, and emotional expression. RAD creative dance certificate option available for interested students.",
    raw_reviews: JSON.stringify([
      { author: "Lisa K.", text: "My daughter is naturally shy but she absolutely blossoms in this class. The teacher creates such a safe space.", rating: 5 },
      { author: "Tan B.", text: "Love that it's not just about technique — they actually learn to express themselves.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "9d898dbe-144f-4946-8a88-951f01363bd4",
    name: "Ballet Foundations — Classical Dance",
    vibe_line: "Grace, discipline, and poise — classical ballet for young dancers",
    description:
      "A structured classical ballet programme following the Royal Academy of Dance (RAD) syllabus, adapted for children. Students learn proper technique, posture, and musicality through progressively challenging exercises at the barre and centre.\n\nWe prepare students for RAD examinations (optional) and perform at an annual recital. Professional dance flooring and mirrors ensure a real studio experience. Boys and girls equally welcome.",
    summary: "RAD-syllabus classical ballet for ages 4-14 with optional examinations and annual recital performance.",
    age_min: 4,
    age_max: 14,
    price: 45,
    schedule: "Mondays & Thursdays 4:00 PM – 5:00 PM, Saturdays 1:00 PM – 2:00 PM",
    photo_url: pickPhoto("dance", 2),
    category: "Dance",
    google_rating: 4.6,
    review_count: 95,
    typical_child_profile: "Best for children who thrive with structure and enjoy working toward goals. Perfectionist tendencies actually help here. Also great for kids who love music and want to develop physical discipline.",
    not_ideal_for: "Kids who resist repetition or need lots of variety. Ballet requires patience with foundational exercises.",
    outcome_expectations: "Proper ballet technique, improved posture and flexibility, RAD exam readiness (if pursuing), and a professionally choreographed recital performance.",
    raw_reviews: JSON.stringify([
      { author: "Eleanor W.", text: "Exceptional teaching. My daughter passed her RAD Grade 2 with distinction. The discipline she's learned extends beyond dance.", rating: 5 },
      { author: "James L.", text: "My son was the only boy in class initially but the teachers made him feel so welcome. Now there are 3 boys!", rating: 5 },
      { author: "Farah N.", text: "High quality instruction. The annual recital is a highlight for our whole family.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "f4c39678-e583-4682-83dc-8cf2cbe15749",
    name: "Belly Dance for Kids — Cultural Dance Experience",
    vibe_line: "Rhythm, culture, and joy — Middle Eastern dance for young movers",
    description:
      "A unique cultural dance class introducing children to the beauty of Middle Eastern dance traditions. Students learn basic belly dance movements, prop work (veils, finger cymbals), and the cultural context behind the art form.\n\nClasses are fun and accessible with an emphasis on body positivity, cultural appreciation, and musical awareness. We explore the geography, music, and customs of different Middle Eastern cultures through movement.",
    summary: "Cultural belly dance class for kids aged 6-14 combining movement, props, and Middle Eastern cultural education.",
    age_min: 6,
    age_max: 14,
    price: 35,
    schedule: "Fridays 4:30 PM – 5:30 PM",
    photo_url: pickPhoto("dance", 3),
    category: "Dance",
    google_rating: 4.9,
    review_count: 28,
    typical_child_profile: "Wonderful for culturally curious children and those who love world music. Great for kids who enjoy costumes and performances. Also excellent for children who don't fit the 'ballet mould' but love to dance.",
    not_ideal_for: "Very young children (under 6) — the movements require a degree of body isolation that develops with age.",
    outcome_expectations: "Basic belly dance technique, cultural knowledge about Middle Eastern arts, prop handling skills, and a performance piece. Improved core strength and coordination.",
    raw_reviews: JSON.stringify([
      { author: "Aisha M.", text: "My daughter loves learning about the culture behind the dance. It's so much more than just movement.", rating: 5 },
      { author: "Sophie R.", text: "Unique class! My girls love the veil work and finger cymbals. Great alternative to traditional dance.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "1580916d-0ed6-4f17-9c0b-334f60bc6a9d",
    name: "K-Pop Dance — Learn the Choreo",
    vibe_line: "BTS, BLACKPINK, NewJeans — learn the actual choreo your kids are obsessed with",
    description:
      "A high-energy class where students learn real choreography from the latest K-Pop hits. We break down viral dance moves step by step, building coordination, memory, and performance skills.\n\nNew songs are introduced every 2-3 weeks so the repertoire stays fresh and relevant. Students record cover videos at the end of each module for sharing. Separate groups for beginners and intermediate dancers.",
    summary: "K-Pop choreography dance classes learning real routines from BTS, BLACKPINK, and trending artists for ages 7-16.",
    age_min: 7,
    age_max: 16,
    price: 38,
    schedule: "Saturdays 3:00 PM – 4:00 PM, Sundays 11:00 AM – 12:00 PM",
    photo_url: pickPhoto("dance", 0),
    category: "Dance",
    google_rating: 4.8,
    review_count: 112,
    typical_child_profile: "Made for K-Pop fans, TikTok enthusiasts, and kids who learn choreography from YouTube anyway. Channelling screen-time interest into real physical activity.",
    not_ideal_for: "Kids with no interest in pop music. Also, the pace can be fast — very young beginners may feel overwhelmed.",
    outcome_expectations: "4-5 complete K-Pop routines per term, a filmed cover video, improved stamina and coordination, and social connections with fellow K-Pop fans.",
    raw_reviews: JSON.stringify([
      { author: "Yuki T.", text: "My daughter was already learning dances from YouTube — now she does it properly with real instruction. She's THRIVING.", rating: 5 },
      { author: "Sam W.", text: "The video recordings at the end are such a nice touch. Great for motivation.", rating: 5 },
      { author: "Grace L.", text: "Fun class but can be challenging for absolute beginners. Maybe start with the intro session.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "40cfd4bc-d3e6-406b-b7c1-464085aa7472",
    name: "Rhythm & Movement — Dance + Music Fusion",
    vibe_line: "Drums, dance, and play — where rhythm meets movement for little ones",
    description:
      "A unique fusion class combining percussion play with movement. Children experiment with drums, shakers, and body percussion while learning basic dance movements that sync with the rhythms they create.\n\nIdeal as a first exposure to both music and dance. The multi-sensory approach engages children who might not sit still for a pure music lesson or follow a pure dance class. Maximum fun, zero pressure.",
    summary: "Multi-sensory rhythm and movement fusion class for ages 3-6 combining percussion, dance, and body play.",
    age_min: 3,
    age_max: 6,
    price: 32,
    schedule: "Tuesdays 10:00 AM – 10:45 AM, Fridays 10:00 AM – 10:45 AM",
    photo_url: pickPhoto("dance", 1),
    category: "Dance",
    google_rating: 4.7,
    review_count: 39,
    typical_child_profile: "Perfect for energetic toddlers and preschoolers who can't sit still. Great entry point for kids who haven't tried music or dance yet. Sensory seekers love the variety.",
    not_ideal_for: "Kids who are noise-sensitive — it gets loud and joyful in there!",
    outcome_expectations: "Rhythm awareness, basic gross motor coordination, comfort with group activities, and exposure to different instruments and dance styles.",
    raw_reviews: JSON.stringify([
      { author: "Rina S.", text: "The only class my 3-year-old actually participates in without crying. The combination of music and movement is genius.", rating: 5 },
      { author: "Tom B.", text: "Great introduction to both music and dance. My son loved the drums.", rating: 4 },
    ]),
    is_placeholder: false,
  },

  // ═══ MUSIC (4) ═══
  {
    id: "275df0f2-cd5c-4b48-9247-0c71e5b426e3",
    name: "Guitar Heroes — Acoustic Guitar for Kids",
    vibe_line: "Strumming, singing, and smiling — guitar the fun way",
    description:
      "A friendly, group-based guitar class where children learn acoustic guitar through popular songs they actually want to play. We cover chords, strumming patterns, basic fingerpicking, and music reading in a relaxed, encouraging environment.\n\nChild-sized guitars available for use during class (or bring your own). Small groups of 4-6 ensure personalised attention while maintaining the social, motivating energy of learning together.",
    summary: "Group acoustic guitar lessons for kids aged 6-14 learning popular songs, chords, and basic music reading.",
    age_min: 6,
    age_max: 14,
    price: 45,
    schedule: "Tuesdays 5:00 PM – 6:00 PM, Saturdays 2:00 PM – 3:00 PM",
    photo_url: pickPhoto("music", 0),
    category: "Music",
    google_rating: 4.6,
    review_count: 51,
    typical_child_profile: "Great for kids who love singing along to songs and want to accompany themselves. Works well for independent learners who practice at home. Social kids enjoy the group format.",
    not_ideal_for: "Very young children whose hands are too small for guitar (under 6). Kids who want rapid progression may prefer private lessons.",
    outcome_expectations: "10-15 chords, 5-8 complete songs, basic music reading, and the ability to strum along to most pop songs by end of the year.",
    raw_reviews: JSON.stringify([
      { author: "David K.", text: "My 8-year-old can now play actual songs at family gatherings. Worth every cent.", rating: 5 },
      { author: "Mei Ling C.", text: "Love that they learn songs the kids actually know. Keeps them motivated.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "af4bedb6-c67c-467b-9717-973227a3f5d8",
    name: "Rock Band Experience — Kids Ensemble",
    vibe_line: "Form a band, learn an instrument, rock the stage",
    description:
      "An immersive band experience where kids choose an instrument (guitar, bass, drums, keyboards, or vocals) and learn to play together as a real band. Each term culminates in a live performance at our in-house venue.\n\nNo prior experience needed — beginners are paired with similar-level bandmates. Intermediate and advanced bands work on more complex arrangements. It's collaborative, loud, and incredibly rewarding.",
    summary: "Kids form real bands choosing guitar, bass, drums, keys, or vocals with live performances each term.",
    age_min: 7,
    age_max: 16,
    price: 55,
    schedule: "Sundays 10:00 AM – 12:00 PM",
    photo_url: pickPhoto("music", 1),
    category: "Music",
    google_rating: 4.9,
    review_count: 87,
    typical_child_profile: "Fantastic for social kids, aspiring performers, and anyone who's ever air-guitared in the mirror. Builds teamwork, listening skills, and stage presence. Also great for kids who find solo practice boring.",
    not_ideal_for: "Children who strongly prefer solo activities or quiet environments. The band format requires compromise and collaboration.",
    outcome_expectations: "Functional proficiency on chosen instrument, ensemble playing skills, 4-5 performance-ready songs per term, and a live concert experience.",
    raw_reviews: JSON.stringify([
      { author: "Chris H.", text: "Watching my 10-year-old perform on a real stage with his bandmates was one of the proudest moments of my life. This program is special.", rating: 5 },
      { author: "Nina Z.", text: "The way they teach teamwork through music is remarkable. My shy daughter found her people here.", rating: 5 },
      { author: "Ali M.", text: "Excellent concept. The Sunday timing works great for families.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "f62f639a-4991-40b3-969f-57ded8baeef4",
    name: "Little Voices — Singing & Vocal Training",
    vibe_line: "Every child has a voice — let's help them find it",
    description:
      "A nurturing vocal training programme that develops singing technique, ear training, and performance confidence. We cover breathing, pitch, harmony, and stage presence through a mix of contemporary pop, musical theatre, and folk songs.\n\nStudents perform at termly showcases and have the option to prepare for ABRSM singing exams. Group and solo performance opportunities ensure every child gets their moment in the spotlight.",
    summary: "Vocal training and singing programme for ages 5-14 with ABRSM exam preparation and termly showcases.",
    age_min: 5,
    age_max: 14,
    price: 40,
    schedule: "Wednesdays 4:30 PM – 5:30 PM, Saturdays 11:00 AM – 12:00 PM",
    photo_url: pickPhoto("music", 2),
    category: "Music",
    google_rating: 4.7,
    review_count: 63,
    typical_child_profile: "Perfect for kids who are always singing around the house. Great for budding performers and musical theatre fans. Also excellent for building confidence in quieter children.",
    not_ideal_for: "Tone-deaf concerns shouldn't stop you — but kids who have zero interest in singing won't enjoy it.",
    outcome_expectations: "Improved pitch accuracy, breathing technique, harmony singing, performance confidence, and optional ABRSM singing exam readiness.",
    raw_reviews: JSON.stringify([
      { author: "Karen W.", text: "My daughter went from singing in her room to performing solos at the showcase. The transformation in confidence is incredible.", rating: 5 },
      { author: "Joseph T.", text: "Great programme. The mix of genres keeps it interesting for the kids.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "ca7681da-9580-43f8-96c1-e796048757f0",
    name: "Piano Adventures — Classical & Contemporary",
    vibe_line: "Keys to confidence — piano for every kind of learner",
    description:
      "A thoughtfully designed piano programme blending classical technique with contemporary repertoire. Students learn music reading, theory, and performance skills through a mix of structured curriculum and student-chosen pieces.\n\nWe offer both individual and small-group formats (2-3 students) depending on preference. Recitals twice a year provide real performance experience. ABRSM and Trinity exam preparation available.",
    summary: "Piano lessons blending classical and contemporary repertoire with ABRSM/Trinity exam prep options for ages 5-16.",
    age_min: 5,
    age_max: 16,
    price: 60,
    schedule: "Flexible scheduling — weekdays 3:00 PM – 7:00 PM, weekends by arrangement",
    photo_url: pickPhoto("piano", 0),
    category: "Piano",
    google_rating: 4.5,
    review_count: 44,
    typical_child_profile: "Suits a wide range: focused kids who love mastering skills, creative kids who want to compose, and exam-oriented students alike. The flexible format adapts to each child.",
    not_ideal_for: "Kids who hate practicing at home. Piano requires regular home practice to progress meaningfully.",
    outcome_expectations: "Music reading proficiency, technical piano skills, exam readiness (if pursuing), and 2 recital performances per year.",
    raw_reviews: JSON.stringify([
      { author: "Vivian L.", text: "My son passed his Grade 3 ABRSM after just 18 months. Excellent teaching and genuine care for each student.", rating: 5 },
      { author: "Mark D.", text: "Flexible scheduling is a lifesaver for working parents. Quality teaching.", rating: 4 },
    ]),
    is_placeholder: false,
  },

  // ═══ SWIMMING (4) ═══
  {
    id: "93c81970-7478-4168-a595-0ab1a6279bce",
    name: "AquaStars — Learn to Swim Programme",
    vibe_line: "From splash to stroke — building water confidence for life",
    description:
      "A progressive swim programme taking children from water-shy beginners to confident, independent swimmers. We follow the SwimSafer syllabus with small group sizes (max 6 per instructor) to ensure safety and individual attention.\n\nOur heated pool and purpose-built kids' lane make learning comfortable year-round. Parents can observe from our viewing gallery. All instructors are WSQ-certified with current first aid qualifications.",
    summary: "Progressive SwimSafer learn-to-swim programme for ages 3-12 with certified instructors and heated pool.",
    age_min: 3,
    age_max: 12,
    price: 38,
    schedule: "Weekdays 3:30 PM – 4:30 PM, Saturdays 9:00 AM – 12:00 PM (multiple slots), Sundays 10:00 AM – 11:00 AM",
    photo_url: pickPhoto("swimming", 0),
    category: "Swimming",
    google_rating: 4.6,
    review_count: 104,
    typical_child_profile: "Designed for all levels — from water-anxious beginners to kids ready for stroke refinement. Patient, encouraging approach works especially well for nervous swimmers.",
    not_ideal_for: "Kids looking for competitive swim training — this is learn-to-swim, not squad training.",
    outcome_expectations: "SwimSafer certification progression, water safety awareness, and independent swimming ability (typically 4-6 months for beginners to swim 25m unassisted).",
    raw_reviews: JSON.stringify([
      { author: "Angela P.", text: "My daughter was terrified of water. After 3 months here, she swims laps. The patience of these instructors is unreal.", rating: 5 },
      { author: "Ryan S.", text: "Great facility, heated pool is a huge plus. Kids don't complain about being cold.", rating: 5 },
      { author: "Wendy T.", text: "Good programme but Saturday slots fill up very fast. Book early.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "c5f8bfeb-a1ab-443c-9190-5d5155da8c12",
    name: "Little Dolphins — Baby & Toddler Swimming",
    vibe_line: "Splashing, bonding, and building water babies from day one",
    description:
      "A parent-accompanied swimming programme for babies and toddlers. Through songs, games, and gentle water play, your little one develops water confidence, basic water safety skills, and crucial drowning prevention reflexes.\n\nOur warm-water pool (32°C) is specifically designed for young swimmers. Classes are playful and relaxed — we follow your child's comfort level. Parent must be in the water with the child.",
    summary: "Parent-accompanied baby and toddler swim classes in warm water (32°C) focusing on water confidence and safety.",
    age_min: 0,
    age_max: 3,
    price: 42,
    schedule: "Weekday mornings 9:30 AM – 10:15 AM, Saturdays 8:30 AM – 9:15 AM",
    photo_url: pickPhoto("swimming", 1),
    category: "Swimming",
    google_rating: 4.8,
    review_count: 76,
    typical_child_profile: "Perfect for babies from 6 months onwards. Early exposure to water creates lifelong confidence. Also a wonderful bonding activity for parent and child.",
    not_ideal_for: "Parents who aren't comfortable getting in the water themselves. One parent must accompany the child.",
    outcome_expectations: "Water comfort, basic floating awareness, and drowning prevention reflexes. Most importantly: a child who loves water rather than fears it.",
    raw_reviews: JSON.stringify([
      { author: "Claire M.", text: "Started at 8 months. My baby is now 2 and fearless in water. This early start made all the difference.", rating: 5 },
      { author: "Jonathan R.", text: "Beautiful facility and so gentle with the little ones. Saturday mornings are our favourite family time.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "b99804d9-67db-4f36-9e13-4ced75b04165",
    name: "Stroke Clinic — Competitive Swim Training",
    vibe_line: "For kids who've outgrown lessons and want to race",
    description:
      "An intermediate-to-advanced swim programme for children who can already swim independently and want to refine their technique for competition or fitness. We focus on all four competitive strokes, starts, turns, and race strategy.\n\nTraining is structured with technique work, endurance sets, and speed work. Students can progress into our competitive team with participation in inter-school and national age-group competitions.",
    summary: "Competitive swim training covering four strokes, starts, turns, and race prep for ages 7-16.",
    age_min: 7,
    age_max: 16,
    price: 48,
    schedule: "Mondays, Wednesdays, Fridays 5:00 PM – 6:30 PM",
    photo_url: pickPhoto("swimming", 2),
    category: "Swimming",
    google_rating: 4.5,
    review_count: 37,
    typical_child_profile: "For kids who already swim confidently and want more challenge. Competitive personalities thrive here. Also good for focused, goal-oriented children who enjoy measurable improvement.",
    not_ideal_for: "Beginners or children who can't swim at least 50m of freestyle and backstroke. This is not a learn-to-swim class.",
    outcome_expectations: "Four-stroke proficiency, competition readiness, measurable time improvements, and opportunity for inter-school competition.",
    raw_reviews: JSON.stringify([
      { author: "Derek L.", text: "My son dropped 5 seconds off his 50m freestyle in one term. Coach really knows competitive swimming.", rating: 5 },
      { author: "Stephanie K.", text: "Great stepping stone between casual lessons and full-time training. Well structured.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "a2ebbd5b-fde7-4b7e-a7da-863296c3e0bc",
    name: "Water Play & Safety — Aqua Ducks Programme",
    vibe_line: "Fun, safety, and skills — the original kids' swim experience",
    description:
      "Aqua Ducks' signature programme combining structured swimming instruction with water play and safety education. Children learn swimming strokes alongside essential water safety — what to do if they fall in, how to float in an emergency, and safe pool behaviour.\n\nThe play-based approach keeps kids engaged while building genuine life-saving skills. Colourful equipment, themed activities, and reward badges make progression exciting and visible.",
    summary: "Play-based swimming and water safety programme with reward badges for ages 3-10.",
    age_min: 3,
    age_max: 10,
    price: 35,
    schedule: "Saturdays & Sundays 9:00 AM – 10:00 AM, 10:30 AM – 11:30 AM",
    photo_url: pickPhoto("swimming", 3),
    category: "Swimming",
    google_rating: 4.7,
    review_count: 92,
    typical_child_profile: "Ideal for children who need fun and games to stay motivated. The badge reward system works brilliantly for kids who love collecting achievements. Great for social kids who learn better with peers.",
    not_ideal_for: "Older kids (11+) or those who want a more serious, technique-focused approach.",
    outcome_expectations: "Swimming proficiency, water safety certification, emergency floating skills, and a chest full of achievement badges your kid will proudly show everyone.",
    raw_reviews: JSON.stringify([
      { author: "Patricia C.", text: "The badge system is genius. My son is motivated to practice just to get his next badge!", rating: 5 },
      { author: "Ahmad B.", text: "Love the water safety component. Gives us peace of mind as parents.", rating: 5 },
      { author: "Helen T.", text: "Fun atmosphere. Sometimes a bit chaotic with the younger groups but the instructors handle it well.", rating: 4 },
    ]),
    is_placeholder: false,
  },

  // ═══ COOKING (3) ═══
  {
    id: "c470eeb4-29e0-416f-aca4-b6c389384413",
    name: "Junior Bakers — Cakes, Cookies & Confidence",
    vibe_line: "Measure, mix, create, eat — baking joy for little hands",
    description:
      "A hands-on baking class where children learn to make real recipes from scratch. Each session produces a complete baked item — from cupcakes and cookies to bread and pastries — that children take home proudly.\n\nWe teach measuring, food safety, kitchen etiquette, and the science behind baking. Small groups (max 8) ensure every child gets hands-on time. All ingredients and equipment provided. Allergen-aware with nut-free options.",
    summary: "Hands-on baking classes for kids aged 5-12, making complete recipes from scratch each session to take home.",
    age_min: 5,
    age_max: 12,
    price: 55,
    schedule: "Saturdays 10:00 AM – 12:00 PM, Sundays 2:00 PM – 4:00 PM",
    photo_url: pickPhoto("cooking", 0),
    category: "Cooking",
    google_rating: 4.8,
    review_count: 58,
    typical_child_profile: "Perfect for kids who love the kitchen, sensory activities, and instant gratification (you eat what you make!). Great for building patience, following instructions, and math skills through measuring.",
    not_ideal_for: "Kids with severe food allergies should discuss accommodations first. Also not ideal for very impatient children — baking requires waiting for things to rise and bake.",
    outcome_expectations: "10+ baked recipes in the repertoire, kitchen safety skills, measuring proficiency, and the confidence to bake at home with minimal supervision.",
    raw_reviews: JSON.stringify([
      { author: "Sandra L.", text: "My son now bakes for the family on weekends. He's 9. This class gave him genuine life skills AND confidence.", rating: 5 },
      { author: "Kevin O.", text: "The take-home factor is brilliant. Kids feel so accomplished bringing their creations home.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "37bc03c0-8b20-4da3-bea6-8fbe35bf9296",
    name: "Little Chefs — Asian Cooking for Kids",
    vibe_line: "Wok skills, spice knowledge, and cultural pride — cooking with roots",
    description:
      "A culturally rich cooking programme where children learn to prepare dishes from across Asia — from Japanese sushi and Korean kimbap to Malaysian rendang and Chinese dumplings. Each session explores a different cuisine, teaching technique, ingredients, and cultural context.\n\nKids work in pairs, learning teamwork and communication alongside cooking. We source halal and vegetarian-friendly ingredients. Every child goes home with their meal and the recipe card.",
    summary: "Asian cuisine cooking classes for kids aged 6-14 covering Japanese, Korean, Malay, Chinese, and more.",
    age_min: 6,
    age_max: 14,
    price: 58,
    schedule: "Saturdays 11:00 AM – 1:00 PM",
    photo_url: pickPhoto("cooking", 1),
    category: "Cooking",
    google_rating: 4.9,
    review_count: 41,
    typical_child_profile: "Ideal for culturally curious foodies and adventurous eaters. Great for kids who love trying new foods. Also wonderful for connecting kids to their heritage through food.",
    not_ideal_for: "Very picky eaters who refuse to try new flavours. The whole point is exploring different cuisines.",
    outcome_expectations: "Knife skills, basic cooking techniques for 8+ cuisines, cultural food knowledge, and recipe cards to recreate dishes at home.",
    raw_reviews: JSON.stringify([
      { author: "Yuki T.", text: "My son made sushi rolls that looked professional! The cultural teaching component adds so much richness.", rating: 5 },
      { author: "Fatimah A.", text: "Love that they accommodate halal. My daughter cooked rendang for Hari Raya — the family was impressed!", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "e3e74848-9774-4361-b95f-f779179c0e98",
    name: "Young Chef Academy — Professional Kitchen Experience",
    vibe_line: "Real kitchen, real techniques, real chef's hat",
    description:
      "An aspirational cooking programme held in a professional teaching kitchen. Children learn culinary techniques used by real chefs — from knife skills and sautéing to plating and flavour balancing.\n\nRun by the acclaimed At-Sunrice GlobalChef Academy, this programme gives kids a taste of professional culinary education in a safe, supervised environment. Each session focuses on a different cooking method, building a comprehensive skill set over the term.",
    summary: "Professional-grade culinary training for kids aged 8-16 at the At-Sunrice GlobalChef Academy teaching kitchen.",
    age_min: 8,
    age_max: 16,
    price: 68,
    schedule: "Saturdays 2:00 PM – 4:30 PM",
    photo_url: pickPhoto("cooking", 2),
    category: "Cooking",
    google_rating: 4.7,
    review_count: 33,
    typical_child_profile: "Best for older kids seriously interested in cooking. MasterChef Junior fans, future foodies, and kids who want a real challenge beyond home baking.",
    not_ideal_for: "Young children under 8 — the professional kitchen requires maturity and focus. Not a play-based cooking class.",
    outcome_expectations: "Professional knife skills, 6+ cooking methods mastered, plating aesthetics, flavour theory basics, and a completion certificate from At-Sunrice.",
    raw_reviews: JSON.stringify([
      { author: "Michael S.", text: "The quality is leagues above other cooking classes. My 12-year-old cooked us a 3-course meal at home. AT-SUNRICE quality.", rating: 5 },
      { author: "Linda K.", text: "Expensive but worth it. The professional kitchen setting makes kids take it seriously.", rating: 4 },
    ]),
    is_placeholder: false,
  },

  // ═══ CHINESE (3) ═══
  {
    id: "6a94db7c-13ed-49b1-b85b-3f67ebfc2f3d",
    name: "Fun Chinese — Interactive Mandarin for Kids",
    vibe_line: "Beyond 听写 — Mandarin that kids actually enjoy",
    description:
      "A lively, interactive Mandarin programme that makes Chinese fun through storytelling, songs, games, and cultural activities. We follow MOE syllabus alignment while going beyond textbook learning to build genuine love for the language.\n\nSmall groups (max 6) allow for conversation practice and individual attention. We use a blend of digital tools and hands-on activities to keep different learning styles engaged. Homework is minimal and project-based.",
    summary: "Interactive, fun Mandarin enrichment aligned with MOE syllabus for ages 4-12 with small group sizes.",
    age_min: 4,
    age_max: 12,
    price: 40,
    schedule: "Tuesdays & Thursdays 4:00 PM – 5:00 PM, Saturdays 10:00 AM – 11:00 AM",
    photo_url: pickPhoto("academic", 0),
    category: "Chinese",
    google_rating: 4.6,
    review_count: 52,
    typical_child_profile: "Perfect for kids who 'hate Chinese' — our approach often wins them over. Also great for heritage speakers who need structured learning, and kids who learn best through play and interaction.",
    not_ideal_for: "Kids who need intensive exam prep (we do cover exam skills but the primary focus is language love and fluency, not drilling).",
    outcome_expectations: "Improved oral fluency and confidence, expanded vocabulary, reading comprehension, and — most importantly — a positive relationship with the Chinese language.",
    raw_reviews: JSON.stringify([
      { author: "Catherine T.", text: "My son used to CRY before Chinese class. Now he actually asks to go. That alone is worth everything.", rating: 5 },
      { author: "John L.", text: "Love that they go beyond textbooks. My daughter's spoken Chinese has improved dramatically.", rating: 5 },
      { author: "Linda W.", text: "Good programme, affordable too. Wish they had more weekday evening slots.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "a59da4a9-c204-4b60-ad63-9344cc3f5cbf",
    name: "Chinese Reading Warriors — Comprehension & Composition",
    vibe_line: "From dreading compositions to actually writing with confidence",
    description:
      "A focused programme targeting the two skills Singapore students struggle with most: Chinese comprehension and composition. Using a proprietary methodology, we teach reading strategies, vocabulary building, and structured writing techniques.\n\nStudents work through levelled reading materials and learn composition frameworks that help them organise ideas clearly. Regular timed practice builds exam readiness. Progress reports provided every 4 weeks.",
    summary: "Chinese comprehension and composition programme with structured writing techniques for ages 7-12.",
    age_min: 7,
    age_max: 12,
    price: 50,
    schedule: "Mondays & Wednesdays 5:00 PM – 6:00 PM, Saturdays 1:00 PM – 2:00 PM",
    photo_url: pickPhoto("academic", 1),
    category: "Chinese",
    google_rating: 4.4,
    review_count: 38,
    typical_child_profile: "For kids who can speak conversational Chinese but struggle with reading and writing. Especially helpful for PSLE preparation and kids who need a confidence boost in written Chinese.",
    not_ideal_for: "Complete beginners in Chinese — a basic foundation in Mandarin is needed. Also not the right fit if your child needs oral practice more than written.",
    outcome_expectations: "Measurable improvement in comprehension scores, a reliable composition framework, expanded written vocabulary, and reduced exam anxiety around Chinese papers.",
    raw_reviews: JSON.stringify([
      { author: "Kevin C.", text: "My daughter's Chinese grade went from C to B+ in two terms. The composition framework is incredibly effective.", rating: 5 },
      { author: "Michelle T.", text: "Finally a Chinese enrichment that's structured and actually shows results. Not just worksheets.", rating: 4 },
    ]),
    is_placeholder: false,
  },
  {
    id: "b75639a3-227f-4045-8457-7f4c538400d9",
    name: "Chinese Cultural Immersion — Language Through Tradition",
    vibe_line: "Tea ceremonies, calligraphy, and stories — Chinese through culture, not just textbooks",
    description:
      "A unique approach to Chinese language learning through cultural immersion. Each session combines language instruction with a hands-on cultural activity — from brush calligraphy and paper cutting to tea appreciation and traditional storytelling.\n\nIdeal for heritage learners who want to connect with Chinese culture, or for any child who learns best through experiential, multi-sensory activities. Language learning happens naturally when it's tied to something memorable and meaningful.",
    summary: "Cultural immersion Chinese programme combining language learning with calligraphy, tea ceremony, and traditional arts.",
    age_min: 5,
    age_max: 13,
    price: 45,
    schedule: "Fridays 4:00 PM – 5:30 PM, Sundays 10:00 AM – 11:30 AM",
    photo_url: pickPhoto("academic", 2),
    category: "Chinese",
    google_rating: 4.8,
    review_count: 29,
    typical_child_profile: "Wonderful for culturally curious children, kids with Chinese heritage who want to connect with their roots, and those who learn best through hands-on activities rather than worksheets.",
    not_ideal_for: "Kids who need intensive exam preparation. This is enrichment, not tuition.",
    outcome_expectations: "Expanded cultural vocabulary, calligraphy skills, appreciation of Chinese traditions, improved spoken confidence, and a deeper connection to Chinese heritage.",
    raw_reviews: JSON.stringify([
      { author: "Sharon L.", text: "My children are half-Chinese and this class helps them feel connected to their heritage. The calligraphy sessions are beautiful.", rating: 5 },
      { author: "Ben W.", text: "So much more engaging than traditional Chinese tuition. My son actually retains what he learns here.", rating: 5 },
    ]),
    is_placeholder: false,
  },

  // ═══ PIANO (1 — already have 1 music piano above, so this is standalone) ═══
  {
    id: "f7014a75-51a7-4351-912b-9ef3e6c8b36d",
    name: "Montessori Music — Piano & Rhythm for Little Ones",
    vibe_line: "Gentle, child-led music discovery for the youngest learners",
    description:
      "A Montessori-inspired music programme introducing toddlers and preschoolers to piano, rhythm instruments, and musical concepts through child-led exploration. Children move between activities at their own pace — from the keyboard corner to the rhythm station to the listening nook.\n\nThis isn't a traditional piano lesson. It's a prepared musical environment where children discover their own relationship with music. Perfect for the Montessori-educated child or any young learner who benefits from self-directed exploration.",
    summary: "Montessori-style music and piano discovery for ages 2-5 with self-paced exploration and multiple music stations.",
    age_min: 2,
    age_max: 5,
    price: 35,
    schedule: "Tuesdays & Thursdays 10:00 AM – 10:45 AM",
    photo_url: pickPhoto("piano", 1),
    category: "Piano",
    google_rating: 4.7,
    review_count: 24,
    typical_child_profile: "Ideal for toddlers and preschoolers, especially those in Montessori programmes. Great for curious, independent-minded little ones who resist being told what to do.",
    not_ideal_for: "Children who need clear structure and step-by-step instruction. This is exploratory, not lesson-based.",
    outcome_expectations: "Musical awareness, rhythm sense, comfort with keyboard instruments, and a joyful introduction to music that sets the foundation for formal lessons later.",
    raw_reviews: JSON.stringify([
      { author: "Rachel H.", text: "My 3-year-old went from banging the piano to actually picking out melodies. The Montessori approach works beautifully for music.", rating: 5 },
      { author: "Andrea S.", text: "Gentle, no-pressure environment. Perfect first music experience for toddlers.", rating: 5 },
    ]),
    is_placeholder: false,
  },

  // ═══ MATH (2) ═══
  {
    id: "94661346-2411-44b6-ac34-5e617b185c05",
    name: "Math Explorers — Hands-On Problem Solving",
    vibe_line: "Math you can touch, build, and actually understand",
    description:
      "A problem-solving focused maths programme that uses manipulatives, puzzles, and real-world scenarios to build deep understanding. We follow the Singapore Math approach but extend it with enrichment challenges that develop higher-order thinking.\n\nNo worksheets (well, almost none). Instead, children use blocks, fraction kits, geometry tools, and digital simulations to discover mathematical concepts for themselves. Small groups ensure every child's pace and learning style is accommodated.",
    summary: "Hands-on Singapore Math enrichment using manipulatives and puzzles for deep problem-solving skills, ages 5-12.",
    age_min: 5,
    age_max: 12,
    price: 45,
    schedule: "Wednesdays 4:00 PM – 5:00 PM, Saturdays 11:00 AM – 12:00 PM",
    photo_url: pickPhoto("academic", 0),
    category: "Mathematics",
    google_rating: 4.5,
    review_count: 46,
    typical_child_profile: "Great for kids who say they 'hate math' — often they just hate worksheets. Also wonderful for gifted learners who need more challenge. Visual and kinesthetic learners thrive here.",
    not_ideal_for: "Kids who need pure exam drilling. We build understanding, not speed — though speed naturally improves with true comprehension.",
    outcome_expectations: "Deeper mathematical understanding, improved problem-solving confidence, and the ability to tackle non-routine problems. Parents consistently report school math grades improving as a side effect.",
    raw_reviews: JSON.stringify([
      { author: "Derek T.", text: "My daughter said 'I'm bad at math' before joining. Now she says 'math is fun.' That's worth more than any grade.", rating: 5 },
      { author: "Priya R.", text: "The manipulatives approach is so effective. My son finally UNDERSTANDS fractions instead of just memorising procedures.", rating: 5 },
    ]),
    is_placeholder: false,
  },
  {
    id: "c87eb7b6-3d47-409b-8d3b-194e040422e5",
    name: "Competitive Math — Olympiad Preparation",
    vibe_line: "For the kid who finishes the textbook and asks 'what else?'",
    description:
      "An advanced mathematics programme preparing students for local and international math competitions including SMOPS, ICAS, AMC, and Math Olympiad. We cover number theory, combinatorics, geometry, and algebraic reasoning beyond school syllabus.\n\nSmall groups of 4-6 students ensure rigorous discussion and personalised challenge. Weekly problem sets develop persistence and creative thinking. Students regularly participate in national and regional competitions.",
    summary: "Competitive math and olympiad preparation covering number theory, combinatorics, and advanced problem-solving for ages 8-14.",
    age_min: 8,
    age_max: 14,
    price: 65,
    schedule: "Sundays 10:00 AM – 12:00 PM",
    photo_url: pickPhoto("academic", 1),
    category: "Mathematics",
    google_rating: 4.4,
    review_count: 22,
    typical_child_profile: "For genuinely math-talented kids who find school math too easy. Thrives when challenged with complex, non-routine problems. Self-motivated learners who enjoy the satisfaction of cracking a tough problem.",
    not_ideal_for: "Kids who are struggling with school-level math. This is enrichment for strong students, not remedial support.",
    outcome_expectations: "Competition readiness for SMOPS/ICAS/AMC, advanced problem-solving toolkit, mathematical reasoning skills, and — for motivated students — medal-winning potential.",
    raw_reviews: JSON.stringify([
      { author: "Li Ming C.", text: "My son won Silver at SMOPS after joining this class. The teacher identifies each child's strengths and pushes them further.", rating: 5 },
      { author: "Steven K.", text: "Rigorous and intellectually stimulating. Finally a class that challenges my daughter.", rating: 5 },
    ]),
    is_placeholder: false,
  },

  // ═══ ENGLISH (1) ═══
  {
    id: "d82ca4c6-4c0d-454a-b148-daa1804a4b9b",
    name: "Story Builders — Creative Writing & Literature",
    vibe_line: "Every child has a story to tell — let's help them write it",
    description:
      "A creative writing programme that nurtures young authors through storytelling, poetry, journalism, and creative non-fiction. We read great children's literature together and use it as springboards for original writing.\n\nEach term culminates in a student anthology — a real printed book featuring every child's work. The programme builds not just writing skill but creative confidence, critical thinking, and a love of reading. Grammar and vocabulary are taught in context, not in isolation.",
    summary: "Creative writing and literature programme for ages 6-14 with termly student anthology publication.",
    age_min: 6,
    age_max: 14,
    price: 48,
    schedule: "Thursdays 4:30 PM – 5:30 PM, Saturdays 10:00 AM – 11:00 AM",
    photo_url: pickPhoto("academic", 2),
    category: "English",
    google_rating: 4.7,
    review_count: 57,
    typical_child_profile: "Ideal for imaginative, story-loving children. Avid readers, daydreamers, and kids who fill notebooks with stories thrive here. Also great for kids who have ideas but struggle to put them on paper.",
    not_ideal_for: "Kids who need intensive comprehension or grammar drilling for exams. This is creative enrichment, not structured exam prep.",
    outcome_expectations: "A published student anthology, expanded vocabulary, confident creative expression, improved narrative structure, and a lasting love of reading and writing.",
    raw_reviews: JSON.stringify([
      { author: "Julia W.", text: "My daughter saw her name in a real printed book at age 8. The pride on her face was priceless. This programme is special.", rating: 5 },
      { author: "Andrew T.", text: "Excellent balance of reading and writing. My son's creativity has exploded since joining.", rating: 5 },
      { author: "Serene L.", text: "Love the approach but wish they had a more exam-focused track too for PSLE year.", rating: 4 },
    ]),
    is_placeholder: false,
  },
];

// ═══ Run the seed ═══
async function seed() {
  console.log(`Enriching ${ENRICHED.length} classes...`);
  let success = 0;
  let errors = 0;

  for (const cls of ENRICHED) {
    const { id, ...updates } = cls;
    const { error } = await sb
      .from("classes")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error(`  ✗ ${cls.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${cls.name}`);
      success++;
    }
  }

  console.log(`\nDone: ${success} enriched, ${errors} errors`);

  // Verify
  const { data: enriched, count } = await sb
    .from("classes")
    .select("id, name, vibe_line, category, photo_url, age_min, price", { count: "exact" })
    .eq("is_placeholder", false);
  console.log(`\nVerification: ${count} non-placeholder classes in DB`);
  if (enriched) {
    enriched.slice(0, 5).forEach((c) =>
      console.log(`  → ${c.name} [${c.category}] ${c.age_min ? `ages ${c.age_min}+` : ""} ${c.price || ""}`)
    );
  }
}

seed().catch((e) => console.error(e));
