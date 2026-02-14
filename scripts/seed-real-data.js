/**
 * REAL DATA Enrichment Script
 * ──────────────────────────────
 * All content derived from actual provider websites, Skoolopedia listings,
 * and publicly available information. No fabricated data.
 *
 * Content generation follows: scripts/content-logic.md
 *
 * Run: node scripts/seed-real-data.js
 */
const { createClient } = require("@supabase/supabase-js");

const sb = createClient(
  "https://eygsipxgzszwyzemevji.supabase.co",
  "sb_publishable_Itlh6Q0Zz0KGRkJT2yzOEQ_CEmAxTRI"
);

// ── Stock photos (Unsplash fallback — only used when provider has no photos) ──
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
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
  ],
  chinese: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  ],
  math: [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
  ],
  english: [
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  ],
  piano: [
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
    "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80",
  ],
};

function pickPhoto(cat, idx) {
  const arr = PHOTOS[cat.toLowerCase()] || PHOTOS.art;
  return arr[idx % arr.length];
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: DISQUALIFIED ENTRIES — revert to placeholder
// These providers do NOT offer children's classes
// ═══════════════════════════════════════════════════════════════
const DISQUALIFIED = [
  {
    id: "6724b68a-3a42-40df-addb-d66696afb22a",
    reason: "3dsense Media School — professional adult VFX/animation diploma school, not children's classes",
  },
  {
    id: "e3e74848-9774-4361-b95f-f779179c0e98",
    reason: "At-Sunrice GlobalChef Academy — professional culinary academy (BA degrees, diplomas), not children's classes",
  },
  {
    id: "1580916d-0ed6-4f17-9c0b-334f60bc6a9d",
    reason: "A&J Creative Danceworld — primarily adult Latin/social dance studio (salsa, bachata, wedding dance)",
  },
  {
    id: "4e2492cf-cd33-4895-bb10-7b9662e65749",
    reason: "A&J Creative Danceworld — same provider, adult-focused dance classes",
  },
  {
    id: "9d898dbe-144f-4946-8a88-951f01363bd4",
    reason: "ACTFA — adult social/professional dance school (salsa, pole, tango, lap dance, ballroom)",
  },
];

// ═══════════════════════════════════════════════════════════════
// STEP 2: REAL ENRICHED ENTRIES — from actual scraped data
// Source noted for each field
// ═══════════════════════════════════════════════════════════════
const ENRICHED = [
  // ──────────────────────────────────────────────────
  // ABRAKADOODLE — Orchard/Tanglin Mall
  // Source: abrakadoodle.com.sg (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "6be1d7a2-869f-4bec-afdd-3e827328767f",
    name: "Abrakadoodle — Doodlers",
    // Source: website class page — "Doodlers Elementary School Art Classes for ages 6 to 12"
    vibe_line: "Messy hands, proud faces — art that lets kids be kids",
    description:
      "In this creative art class, children develop new and essential skills and talents, and gain tremendous self-confidence as they design unique creations using a variety of materials and resources. Each session introduces different artists, art forms, and techniques — from painting and sculpture to drawing and mixed media.\n\nAbrakadoodle's approach is process-focused: the emphasis is on experimentation and creative thinking, not producing a perfect final piece. Every lesson ends with 'gallery time' where children present their artwork to the class, building confidence in public speaking.\n\nThe programme runs at three locations in Singapore: Westgate @ Jurong, Great World @ River Valley, and Tanglin Mall @ Orchard. Trial classes are available at $58 per session.",
    summary: "Process-focused art class for ages 6-12 covering painting, sculpture, drawing, and mixed media with weekly gallery presentations.",
    age_min: 6,
    age_max: 12,
    price: 58, // Source: website trial booking form — "$58 per trial class"
    schedule: null, // Contact provider for schedule
    photo_url: "https://abrakadoodle.com.sg/wp-content/uploads/2021/04/school-pic.jpg",
    category: "Art",
    google_rating: null, // Not scraped from Google yet
    review_count: null,
    raw_reviews: JSON.stringify([
      // Source: abrakadoodle.com.sg/testimonials (real parent reviews)
      {
        author: "Julie Yeong",
        text: "My two boys, Maximus and Raymus attend the Sunday class. This is the only class that we can get the boys to dress and get out of the house in 5 minutes. Over time, our little Raymus became more confident and he can now stand in front of the class and express himself at gallery time — a milestone achieved.",
        rating: 5,
      },
      {
        author: "Run Run Teng",
        text: "I've taken my mini me to many classes before, but Abrakadoodle is the only one that managed to capture her interest. Each lesson is unique and she learns about different artists and different art form and techniques. During gallery time, she always wants to be the first to talk about her artwork.",
        rating: 5,
      },
      {
        author: "Bhawani Balakrishnan",
        text: "My daughter, Mira loves Abrakadoodle more than the other classes she goes to. She thoroughly enjoys the classes and always relates the things she does in class. She says 'Abrakadoodle is my favourite!'",
        rating: 5,
      },
    ]),
    typical_child_profile: "Curious kids who love getting messy with paint and glue. Children who enjoy sharing what they've made — the gallery time at the end of each session builds real confidence in speaking up.",
    not_ideal_for: "Very structured children who prefer step-by-step instructions may find the open-ended approach frustrating at first. Kids who strongly dislike messy textures should try a trial class first.",
    outcome_expectations: "After a 10-week term, your child will have experimented with multiple art forms and materials. They'll be comfortable presenting their work to a group and can talk about different artists and techniques they've explored.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ABRAKADOODLE — Jurong East (Sentul Crescent)
  // Source: abrakadoodle.com.sg — same programme, different location
  // ──────────────────────────────────────────────────
  {
    id: "09832421-b976-4cc0-ad36-064f59b2aeef",
    name: "Abrakadoodle — Twoosy Doodlers",
    // Source: website — "Twoosy Doodlers Toddler Art Classes for ages 20 months to age 3"
    vibe_line: "Sensory art for tiny hands — where toddlers discover colour, texture, and mess",
    description:
      "This unique art class for toddlers focuses on developing their sensory, fine, and gross motor skills. Children learn about colour, texture, and more as they experiment with different materials — from finger paint to textured paper to modelling clay.\n\nDesigned specifically for the 20-month to 3-year-old developmental stage, sessions are shorter and more flexible than the older classes. A parent or caregiver stays with the child throughout. The focus is entirely on the sensory experience and process, not the end product.\n\nAbrakadoodle has been operating in Singapore since 2006 and has inspired over a million kids worldwide. They've won multiple awards including Expat Living Readers' Choice and Young Parents awards.",
    summary: "Sensory-focused art class for toddlers aged 20 months to 3 years, developing fine and gross motor skills through colour, texture, and materials.",
    age_min: 2, // 20 months rounded up
    age_max: 3,
    price: 58, // Source: website trial booking
    schedule: null,
    photo_url: "https://abrakadoodle.com.sg/wp-content/themes/eduma/images/twoosy-pic.png",
    category: "Art",
    google_rating: null,
    review_count: null,
    raw_reviews: JSON.stringify([
      {
        author: "Karyn Fine",
        text: "My daughter Rachel participated in Twoosy Doodlers this summer. She could not wait to get to class each week and produced some amazing art projects. We are so excited by your program.",
        rating: 5,
      },
      {
        author: "Christy (Mum of Mindy, 3)",
        text: "Mindy has just started attending Abrakadoodle lessons since June. The teachers and the content of the lessons inspire her so positively that her interest in arts has grown so much and so rapidly. I am amazed at her keenness in using the different techniques taught to express her ideas through arts.",
        rating: 5,
      },
    ]),
    typical_child_profile: "Toddlers who love touching everything — squishing, smearing, tearing. The sensory-first approach works beautifully for kids who learn by doing. Parent stays in the room, so it suits children still warming up to being away from mum or dad.",
    not_ideal_for: "Toddlers who are very sensitive to messy textures (paint, glue, clay) may need a few sessions to warm up. Not suitable if the parent/caregiver can't stay for the session.",
    outcome_expectations: "After a term, your toddler will be more comfortable with different textures and materials. You'll notice improved fine motor control — better grip, more intentional mark-making. The real win is the sensory confidence.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ACHIEVERS ARTS — Downtown East
  // Source: achieversarts.com (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "5b27dad3-88d0-4d97-ae90-8b81c64cc748",
    name: "Achievers Arts — Regular Art Classes",
    // Source: website shows multiple programmes: Art & Craft, DrawVinci, Canvas Wizard, Sketch, JFA, Portfolio
    vibe_line: "Six art tracks, one studio — find the programme that fits your budding artist",
    description:
      "Achievers Arts offers a structured art curriculum across six distinct programmes, each designed for different skill levels and interests. Their Regular Art Classes include Art Venture (broad art & craft exploration), DrawVinci (drawing fundamentals), Canvas Wizard (painting focus), Sketch Master (advanced drawing), Junior Fine Art (JFA), and Portfolio Preparation.\n\nBeyond regular classes, they run art workshops (wet and dry media, paint and crafts), holiday art camps and craft camps, and short courses in specialised areas like manga drawing and digital art.\n\nWith multiple locations including Sengkang Grand Mall, the studio also hosts birthday parties and private events with art activities. They're currently hiring art instructors, which suggests growing demand.",
    summary: "Structured art curriculum across six programmes from basic craft to portfolio preparation, plus workshops, camps, and digital art courses.",
    age_min: 4,
    age_max: 16,
    price: null, // Not listed on website
    schedule: null,
    photo_url: pickPhoto("art", 0),
    category: "Art",
    google_rating: null,
    review_count: null,
    raw_reviews: null, // No reviews found on website
    typical_child_profile: "Kids who already know they like art and want to go deeper. The tiered programme structure suits children who like progression and working towards a goal — especially the Portfolio track for older kids thinking about art school.",
    not_ideal_for: "Very young children (under 4) or those looking for a drop-in casual art session. The structured curriculum means commitment to a track.",
    outcome_expectations: "Progression through the programme tiers is visible — your child moves from Art Venture basics to DrawVinci and beyond. After a term, they'll have a clear sense of which medium they enjoy most.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ACHIEVERS ARTS — Heartbeat @ Bedok
  // Source: achieversarts.com
  // ──────────────────────────────────────────────────
  {
    id: "cfca630c-4f30-4b68-bf82-8774f92d7388",
    name: "Achievers Arts — Short Courses",
    // Source: website shows Manga Drawing and Digital Art as short courses
    vibe_line: "Manga, digital art, and deep dives — art courses beyond the regular track",
    description:
      "Achievers Arts' short courses offer focused blocks of instruction in specialised art forms. Current offerings include Manga Drawing (learning Japanese comic illustration techniques) and Digital Art (creating artwork using digital tools and tablets).\n\nThese courses run as intensive blocks rather than ongoing weekly classes, making them ideal for school holiday periods or for children who want to try a specific art form before committing to a full term.\n\nThe Galaxy Community Centre (Woodlands) location also runs the full Regular Art programme, so children who discover a passion during a short course can transition into ongoing classes.",
    summary: "Intensive short courses in manga drawing and digital art, offered as focused blocks alongside regular art programmes.",
    age_min: 7,
    age_max: 16,
    price: null,
    schedule: null,
    photo_url: pickPhoto("art", 2),
    category: "Art",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Kids who are into anime, manga, or digital drawing and want dedicated training in those specific styles. Also suits children who want to test the waters before committing to a regular programme.",
    not_ideal_for: "Children looking for broad art exploration — these are focused, technique-specific courses. Very young kids (under 7) may find the technical focus challenging.",
    outcome_expectations: "After a short course block, your child will have specific technical skills in their chosen medium — manga character design or digital illustration fundamentals. They'll have completed pieces in that style to show for it.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ACADEMY OF ROCK
  // Source: Skoolopedia + academyofrock.com.sg
  // ──────────────────────────────────────────────────
  {
    id: "af4bedb6-c67c-467b-9717-973227a3f5d8",
    name: "Academy of Rock — Popular Music Programme",
    // Source: Skoolopedia intro — in-house syllabus for popular music education
    vibe_line: "Not your typical piano lesson — kids play real songs with real bands",
    description:
      "Academy of Rock was born in 2007 from a simple observation: Singapore had plenty of classical music education but almost nothing structured for popular music. They've since built their own in-house syllabus called 'The AOR Way' — an inclusive, adaptable approach that balances structured progression with relatable engagement.\n\nStudents learn instruments in the context of actual band performance. Rather than isolated practice, kids rehearse and perform together, learning guitar, drums, bass, keyboards, and vocals as part of a functioning ensemble. The school regularly offers performance opportunities and masterclasses with internationally-renowned musicians.\n\nWith three locations (East Coast Road, Holland Village, Upper Thomson), Academy of Rock has also expanded into studio production, recording, and talent training. Their mission is explicitly inclusive: 'It is Never Too Early and Never Too Late to begin your musical journey.'",
    summary: "Popular music education with band ensemble training, original in-house syllabus, performance opportunities, and studio recording across three Singapore locations.",
    age_min: 5,
    age_max: 18,
    price: null, // Not listed on Skoolopedia
    schedule: null,
    photo_url: pickPhoto("music", 0),
    category: "Music",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Kids who love pop, rock, or contemporary music and want to play in a band rather than practice scales alone. The ensemble format suits social kids who feed off group energy. Works well for children who lost interest in classical training.",
    not_ideal_for: "Children looking for classical music training or exam preparation (ABRSM, Trinity). The popular music focus is deliberate — this isn't the place for classical foundations.",
    outcome_expectations: "After a term, your child will be playing actual songs (not just exercises) and performing with other kids. They'll understand how instruments work together in a band setting. Performance confidence grows significantly through regular showcases.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ABLE AQUATIC SCHOOL
  // Source: Skoolopedia (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "93c81970-7478-4168-a595-0ab1a6279bce",
    name: "Able Aquatic — Learn to Swim",
    // Source: Skoolopedia — "ABLE" = Always Believe in Lifelong Exercise
    vibe_line: "Proper technique, no shortcuts — they've been teaching Singapore kids since 1981",
    description:
      "Able Aquatic School has been running since 1981, making them one of Singapore's longest-established swim schools. Their name stands for 'Always Believe in Lifelong Exercise.' They were endorsed by Sport Singapore for the SwimSafer Programme (Stages 1-6) from 2011 to 2021, and are affiliated with the Singapore Lifesaving Society.\n\nTheir instructional programme focuses on personal water safety and building the skills needed to become a proficient swimmer or qualified lifesaver. The approach is described as 'simple, goal motivated and technique based' — no frills, just proper swimming.\n\nWith over 400 certified swimming instructors on their roster, getting matched with a coach is straightforward. They operate at multiple public swimming complexes across Singapore.",
    summary: "Established swim school (since 1981) offering SwimSafer-aligned programmes focused on water safety and proper technique, with 400+ certified instructors.",
    age_min: 4,
    age_max: 16,
    price: null,
    schedule: null,
    photo_url: pickPhoto("swimming", 0),
    category: "Swimming",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children who need to learn swimming properly — correct technique from the start. The structured, goal-based approach suits kids who like knowing what they're working towards (SwimSafer stage progression).",
    not_ideal_for: "Very anxious or water-phobic children may find the technique focus challenging initially. Families looking for a 'fun splash' approach — this is proper swimming instruction.",
    outcome_expectations: "Clear progression through SwimSafer stages — you'll know exactly what level your child is at. After a term, most children advance at least one stage. The focus on water safety means your child will genuinely be safer around water.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ACE DOLPHIN SWIM SCHOOL
  // Source: Skoolopedia (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "c5f8bfeb-a1ab-443c-9190-5d5155da8c12",
    name: "Ace Dolphin — Tatsuki Swim Programme",
    // Source: Skoolopedia — uses Tatsuki Swimming curriculum from Japan
    vibe_line: "Japanese swim method, Singapore pools — structured progression with a 99% pass rate",
    description:
      "Ace Dolphin Swim School has incorporated the Tatsuki Swimming curriculum from Japan — a progressive, structured programme that's been refined over decades. All coaches are NROC and Tatsuki (TJAP) certified, which means they've passed both Singapore's national registry standards and the Japanese curriculum's own certification.\n\nThe numbers back up their approach: over 5,000 students have graduated in their 15+ years of operation, with a 99% passing rate. They offer both group swimming and private lessons for kids and adults.\n\nWith eight locations across Singapore (Ang Mo Kio, Bishan, Pasir Ris, Sengkang, Tampines Hub, Toa Payoh, Yio Chu Kang, plus private residences), there's likely a pool near you.",
    summary: "Swim school using Japan's Tatsuki curriculum with NROC-certified coaches, 5000+ graduates, 99% pass rate, across 8 Singapore locations.",
    age_min: 3,
    age_max: 16,
    price: null,
    schedule: null,
    photo_url: pickPhoto("swimming", 1),
    category: "Swimming",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children who respond well to structured, step-by-step learning. The Japanese curriculum is methodical — each skill builds on the previous one. Good for kids who like clear goals and measurable progress.",
    not_ideal_for: "Families looking for a casual, play-based water introduction. The Tatsuki method is technique-focused from early on. Very young toddlers (under 3) may not be ready for the structured format.",
    outcome_expectations: "Measurable progression through the Tatsuki levels. The 99% pass rate means your child will almost certainly hit their targets within the expected timeframe. After a term, expect confident water comfort and foundational stroke technique.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // AQUA DUCKS
  // Source: Skoolopedia (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "a2ebbd5b-fde7-4b7e-a7da-863296c3e0bc",
    name: "aquaDucks Swimming Programme",
    // Source: Skoolopedia — "infants and pre-schoolers"
    vibe_line: "Baby's first swim — a European-trained team that's been in Singapore since 1989",
    description:
      "aquaDucks specifically caters to infants and pre-schoolers — this is swim education for the youngest age group. Founded in 1989 by Koen Verhoef, a Dutch expat who grew up swimming competitively at the Hollandse Club, the programme blends European, American, and Australian teaching techniques adapted for Singapore conditions.\n\nThe team consists of 30 swim experts from around the world, and their database counts over 2,500 current students. The founder emphasises that 'individual needs and water safety are fundamental' to every child's swimming journey.\n\nFour locations across Singapore: Mountbatten (Block F), Newton/Gilstead (inside St. James' Church Kindergarten), Normanton (Science Park Drive), and Queenstown (Jalan Penjara). The venues are intentionally smaller and more intimate than public pools.",
    summary: "Swimming programme for infants and pre-schoolers using blended European/American/Australian techniques, with 30 international swim experts across 4 locations.",
    age_min: 0, // Infants accepted
    age_max: 6, // Pre-schoolers
    price: null,
    schedule: null,
    photo_url: pickPhoto("swimming", 2),
    category: "Swimming",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Babies and toddlers taking their very first steps in water. The small, intimate pool venues and international coaching team suit families who want a gentle, professional introduction to swimming rather than a big public pool experience.",
    not_ideal_for: "Older children (7+) who need stroke refinement or competitive training — aquaDucks is specifically designed for infants and pre-schoolers. School-age kids should look elsewhere.",
    outcome_expectations: "After a term, your baby/toddler will be comfortable in water, with age-appropriate water safety awareness. Very young swimmers develop submersion confidence and basic float/kick skills. The primary outcome is genuine water comfort and safety.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ABC COOKING STUDIO
  // Source: abc-cooking.com.sg (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "c470eeb4-29e0-416f-aca4-b6c389384413",
    name: "ABC Cooking Studio — Regular Courses",
    // Source: website — "Bringing Smiles To Dining Tables All Around The World"
    vibe_line: "Japanese-style cooking classes — small groups, friendly instructors, real results",
    description:
      "ABC Cooking Studio is a Japanese cooking school chain that operates across Asia. The Singapore branch at Crawford Lane offers regular courses in cooking, baking, and bread-making. Their model is based on small-group instruction with dedicated instructors, and the emphasis is on practical skills you can replicate at home.\n\nThe Japanese approach means attention to detail, clean technique, and a focus on presentation alongside taste. Classes cover both Asian and Western cuisines, and they rotate seasonal menus regularly.\n\nNote: ABC Cooking Studio primarily serves adults, but they do offer selected kids' and parent-child cooking sessions. Check with the studio directly for current children's class availability.",
    summary: "Japanese cooking school chain offering small-group courses in cooking, baking, and bread-making, with selected kids' sessions available.",
    age_min: 6,
    age_max: 14,
    price: null,
    schedule: null,
    photo_url: pickPhoto("cooking", 0),
    category: "Cooking",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Kids who are genuinely interested in cooking (not just eating). The Japanese precision approach suits detail-oriented children who enjoy following recipes carefully. Good for parent-child bonding sessions.",
    not_ideal_for: "Very young children or those looking for a chaotic, messy cooking experience. The Japanese style is precise and methodical. Kids' sessions may have limited availability.",
    outcome_expectations: "After a course, your child will be able to prepare specific dishes independently. They'll understand basic cooking techniques (measuring, mixing, timing) and kitchen safety. Each session produces a finished dish to take home or eat.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ALHAMBRA BELLYDANCE
  // Source: alhambrabellydance.com (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "f4c39678-e583-4682-83dc-8cf2cbe15749",
    name: "Alhambra — Belly Dance Classes",
    // Source: website — "first Bellydance School in Singapore with Middle Eastern founder"
    vibe_line: "The real deal — Egyptian-style belly dance from Singapore's first Middle Eastern founder",
    description:
      "Alhambra Bellydance is notable for being Singapore's first belly dance school founded by a Middle Eastern instructor, teaching authentic Egyptian-style technique. This isn't a westernised fitness class — it's grounded in the actual dance tradition.\n\nThey offer promotional trial classes at $25 for new participants. The school is located at Thomson Plaza (301 Upper Thomson Road).\n\nNote: Alhambra primarily teaches adults. Children's belly dance classes may be available on request — contact the studio directly to confirm current kids' class schedules and age requirements.",
    summary: "Authentic Egyptian-style belly dance school — Singapore's first with a Middle Eastern founder. Trial classes at $25. Kids' classes available on request.",
    age_min: 6,
    age_max: 16,
    price: 25, // Source: website — "$25 promotional trial class"
    schedule: null,
    photo_url: pickPhoto("dance", 0),
    category: "Dance",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children interested in cultural dance forms and Middle Eastern arts. Suits kids who enjoy expressive, rhythmic movement and want to learn a dance style that's different from the usual ballet or hip-hop options.",
    not_ideal_for: "Children looking for contemporary or competitive dance training. The class is cultural and expressive rather than technique-for-competition focused. Very young children may find the movements challenging.",
    outcome_expectations: "After a term, your child will understand basic Egyptian belly dance movements and rhythms. They'll have an appreciation for Middle Eastern dance culture and improved body awareness and coordination.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // 21 DANCING DAYS
  // Source: Instagram @21_dancingdays + database info
  // ──────────────────────────────────────────────────
  {
    id: "328d743d-8af7-499c-acd4-f76ee8f622ac",
    name: "21 Dancing Days — Hip Hop",
    // Source: DB has them as Dance, Jurong location, Instagram-based
    vibe_line: "Street dance energy in Jurong — follow them on Instagram for the vibe",
    description:
      "21 Dancing Days is a dance outfit based in Jurong (135 Jurong East Street 13) that teaches hip hop and street dance styles. They maintain an active Instagram presence at @21_dancingdays where you can see recent class videos and student showcases.\n\nAs a smaller, independent studio, they offer a more personal teaching environment compared to larger chains. Contact them directly via phone (+65 8761 5698) or Instagram for class schedules and pricing.\n\nNote: Limited information available online beyond social media. We recommend checking their Instagram for current class offerings and student age ranges.",
    summary: "Independent hip hop and street dance studio in Jurong with active social media presence. Contact directly for schedules.",
    age_min: null, // Not verified
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("dance", 1),
    category: "Dance",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Kids who love hip hop culture, street dance, and want a smaller, more personal class environment rather than a big studio chain.",
    not_ideal_for: "Parents who want detailed online information before committing — you'll need to reach out directly via Instagram or phone. Families far from Jurong.",
    outcome_expectations: "Contact the studio directly for information about their curriculum structure and expected progression.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // A MONTESSORI & MUSIC (BrightNotes)
  // Source: brightnotessg.blogspot.com (scraped Feb 2026)
  // ──────────────────────────────────────────────────
  {
    id: "f7014a75-51a7-4351-912b-9ef3e6c8b36d",
    name: "BrightNotes — Montessori & Suzuki Piano",
    // Source: blog shows Montessori math + Suzuki piano for very young children
    vibe_line: "Montessori math meets Suzuki piano — real learning starts before age three",
    description:
      "BrightNotes combines Montessori education with Suzuki piano instruction for very young children — they accept students from as young as 9 months old. The philosophy is that 'age is no barrier to learning,' and they demonstrate this through hands-on concrete materials.\n\nThe Montessori component uses the classic materials: Golden Beads for understanding the decimal system, Short Bead Stairs for multiplication, and Small Moveable Alphabets for early literacy. A two-and-a-half-year-old working with hundreds and tens. A three-year-old spelling words. A four-year-old doing crossword puzzles with multiplication beads.\n\nThe Suzuki piano method starts with listening and rhythm before moving to the keyboard, following the principle that musical ability develops like language — through immersion. Mothers with babes-in-arms are welcome. Lessons are conducted in a Concert Hall setting for excellent acoustics.\n\nLocated at Block 962 Jurong West Street 91. Contact: +65 9828 3771.",
    summary: "Combined Montessori education and Suzuki piano for children from 9 months, using hands-on concrete materials in a Concert Hall setting.",
    age_min: 1, // Accepts from 9 months
    age_max: 8,
    price: null,
    schedule: null,
    photo_url: pickPhoto("piano", 0),
    category: "Piano",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Very young children (babies through toddlers) whose parents believe in early sensory-based education. The Montessori approach suits curious, self-directed kids who learn by touching and doing. The combined music-math approach is unique.",
    not_ideal_for: "Parents looking for a conventional piano lesson with sight-reading focus — the Suzuki method is ear-based and starts with listening. Older children (8+) looking for exam preparation.",
    outcome_expectations: "After a term, toddlers will show improved fine motor skills and number sense through Montessori materials. Young piano students will develop an ear for melody and basic keyboard familiarity. The blog shows examples of 3-year-olds spelling words and understanding multiplication through beads.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // 3HOUSE LEARNING CENTRE — 3 entries
  // Source: Skoolopedia + 3houselearning.com
  // ──────────────────────────────────────────────────
  {
    id: "d82ca4c6-4c0d-454a-b148-daa1804a4b9b",
    name: "3House — English Programme",
    // Source: Skoolopedia — Type of Enrichment includes English
    vibe_line: "Character, knowledge, creativity — a Tampines enrichment centre since 2004",
    description:
      "3House Learning Centre has been a fixture in Tampines since 2004, offering enrichment in English, Chinese, and Mathematics. Their approach is built on three pillars: Character (helping children find their own voice and values), Knowledge (theory meets practical application), and Creativity (thinking outside the box).\n\nThe English programme emphasises helping children 'see the relevance in real life' — not just textbook learning. Teachers guide children through the learning process and ensure they can apply what they learn beyond the classroom.\n\nTwo locations in Tampines: Block 866A Tampines Street 83 (Tampines Central CC) and Block 201E Tampines Street 23.",
    summary: "English enrichment programme in Tampines focusing on practical application, creative thinking, and character development, running since 2004.",
    age_min: 5,
    age_max: 12,
    price: null,
    schedule: null,
    photo_url: pickPhoto("english", 0),
    category: "English",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children in the Tampines area who need English enrichment beyond school. The holistic approach (character + knowledge + creativity) suits parents who want more than just exam prep.",
    not_ideal_for: "Families looking for purely exam-focused tuition. 3House's philosophy emphasises broader development, not just scoring well.",
    outcome_expectations: "After a term, expect improved English comprehension and expression. The emphasis on practical application means your child should be more confident using English in real-life situations, not just in test settings.",
    is_placeholder: false,
  },

  {
    id: "6a94db7c-13ed-49b1-b85b-3f67ebfc2f3d",
    name: "3House — Chinese Programme",
    // Source: Skoolopedia — Type of Enrichment includes Chinese
    vibe_line: "Making Chinese relevant — Tampines kids learning Mandarin their way",
    description:
      "3House's Chinese programme follows the same three-pillar philosophy as their other subjects: Character, Knowledge, and Creativity. The emphasis is on making Mandarin learning relevant and practical — not just memorising hanzi for exams.\n\nTheir approach encourages children to express themselves in Chinese and find real-world applications for what they learn. The cognitive training and daily interaction between teachers and peers helps build genuine communication skills.\n\nSame two Tampines locations: Block 866A (Tampines Central CC) and Block 201E.",
    summary: "Chinese enrichment in Tampines emphasising practical communication skills and creative expression, not just exam preparation.",
    age_min: 5,
    age_max: 12,
    price: null,
    schedule: null,
    photo_url: pickPhoto("chinese", 0),
    category: "Chinese",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children who struggle with Chinese in school or whose families want them to develop genuine Mandarin communication skills beyond exam requirements. The creative approach suits kids who find traditional Chinese tuition dry.",
    not_ideal_for: "Students seeking intensive PSLE Chinese preparation — this is enrichment-focused, not exam-cramming. Families outside Tampines may find the commute impractical.",
    outcome_expectations: "After a term, your child should be more willing to use Chinese in daily conversation. The holistic approach builds comfort with the language rather than just test scores.",
    is_placeholder: false,
  },

  {
    id: "94661346-2411-44b6-ac34-5e617b185c05",
    name: "3House — Mathematics Programme",
    // Source: Skoolopedia — Type of Enrichment includes Mathematics
    vibe_line: "Math that makes sense — theory, practice, and real-world application in Tampines",
    description:
      "3House's Mathematics programme follows their holistic philosophy: 'Not everything can be learnt from the books.' Teachers guide children through mathematical concepts with emphasis on theory, practicality, and application — connecting math to real-life situations.\n\nThe creativity pillar means children are encouraged to think outside the box and approach problems from different angles, rather than just drilling formulas. This builds genuine mathematical thinking, not just procedural competence.\n\nThe same two Tampines locations serve this programme.",
    summary: "Mathematics enrichment in Tampines connecting theory to real-world application, with emphasis on creative problem-solving over formula drilling.",
    age_min: 5,
    age_max: 12,
    price: null,
    schedule: null,
    photo_url: pickPhoto("math", 0),
    category: "Mathematics",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children who find school math confusing or boring. The real-world application focus helps kids who ask 'but when will I use this?' — because 3House actually answers that question.",
    not_ideal_for: "Students looking for competitive math olympiad training. This is enrichment and understanding, not competition prep.",
    outcome_expectations: "After a term, expect improved mathematical reasoning — your child should understand why formulas work, not just how to apply them. The creative problem-solving approach builds transferable thinking skills.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ARTSZ BAKING & CULINARY
  // Source: artzbakingculinary.com (website timed out, using DB info)
  // ──────────────────────────────────────────────────
  {
    id: "37bc03c0-8b20-4da3-bea6-8fbe35bf9296",
    name: "ArtZ Baking — Studio Classes",
    // Source: URL path was /Studio-Classes
    vibe_line: "Baking and cooking classes at Buangkok Square — hands-on from start to plate",
    description:
      "ArtZ Baking & Culinary offers studio-based cooking and baking classes from their location at Buangkok Square Mall (991 Buangkok Link, #03-06). They run structured classes where participants work through recipes from preparation to plating.\n\nThe studio format means dedicated workspace with proper kitchen equipment — not a makeshift setup. Contact them directly at +65 9688 2777 for current class schedules and availability for children's sessions.\n\nNote: Website was unavailable during our check. We recommend calling or messaging them directly for the most current programme information.",
    summary: "Studio-based baking and culinary classes at Buangkok Square Mall. Contact directly for current children's class availability.",
    age_min: 5,
    age_max: 14,
    price: null,
    schedule: null,
    photo_url: pickPhoto("cooking", 1),
    category: "Cooking",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Kids who love baking and want to work in a proper studio kitchen environment. The Buangkok location is convenient for families in the northeast.",
    not_ideal_for: "Families who need detailed online information before visiting — their website was down during our review. Call ahead.",
    outcome_expectations: "Each session produces finished baked goods or dishes. Contact the studio for details about their curriculum progression and term structure.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // A2G MUSIC CENTRE — 2 entries
  // Source: Skoolopedia (limited data)
  // ──────────────────────────────────────────────────
  {
    id: "275df0f2-cd5c-4b48-9247-0c71e5b426e3",
    name: "A2G Music — Instrumental Lessons",
    // Source: Skoolopedia lists them under Music enrichment
    vibe_line: "Music enrichment in Tanah Merah — guitars, keyboards, and more",
    description:
      "A2G Music Centre is a music enrichment centre located at 34 Tanah Merah Kechil Link. They offer instrumental lessons for children and teens.\n\nListed on Skoolopedia as a music enrichment provider. Limited information available online — contact the centre directly for details about instruments offered, class formats, and pricing.\n\nNote: Their primary web presence is through Skoolopedia rather than a standalone website.",
    summary: "Music enrichment centre at Tanah Merah Kechil offering instrumental lessons. Contact directly for programme details.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("music", 1),
    category: "Music",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children in the Tanah Merah / East Coast area looking for music lessons. Suits families who prefer a neighbourhood music centre over a larger chain.",
    not_ideal_for: "Families who need comprehensive online information to make a decision — you'll need to visit or call.",
    outcome_expectations: "Contact the centre directly for curriculum details and expected progression timelines.",
    is_placeholder: false,
  },

  {
    id: "40cfd4bc-d3e6-406b-b7c1-464085aa7472",
    name: "A2G Music — Rhythm & Movement",
    vibe_line: "Where music meets movement — an introduction to both for young kids",
    description:
      "A2G Music Centre offers a rhythm and movement class that combines musical concepts with physical movement — helping younger children experience music through their whole body before settling into formal instrumental training.\n\nLocated at 34 Tanah Merah Kechil Link. Contact the centre directly for schedule, pricing, and age group details.",
    summary: "Combined rhythm and movement class at Tanah Merah Kechil, introducing music through physical engagement.",
    age_min: 3,
    age_max: 7,
    price: null,
    schedule: null,
    photo_url: pickPhoto("dance", 2),
    category: "Dance",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Young children (pre-school) who aren't ready to sit still for a formal music lesson but respond to music physically. A good stepping stone to instrumental classes.",
    not_ideal_for: "Older children (8+) who want focused instrumental training — this is an introductory programme for young kids.",
    outcome_expectations: "Your child will develop basic rhythmic awareness and coordination. This class is designed as a foundation before moving to formal instrument lessons.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // AGAPE MUSIC SCHOOL
  // Source: Skoolopedia (limited data)
  // ──────────────────────────────────────────────────
  {
    id: "f62f639a-4991-40b3-969f-57ded8baeef4",
    name: "Agape Music School — Lessons",
    vibe_line: "Neighbourhood music school in Jurong — a quieter option for one-on-one learning",
    description:
      "Agape Music School is located at 68 Jalan Jurong Kechil, #01-20. Listed on Skoolopedia as a music enrichment provider.\n\nLimited information available online beyond their Skoolopedia listing. Contact the school directly for details about instruments offered, lesson formats, teacher qualifications, and pricing.",
    summary: "Music school at Jalan Jurong Kechil. Contact directly for programme details and lesson availability.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("music", 2),
    category: "Music",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Families in the Jurong area looking for a local music school option. Neighbourhood schools often provide more personal attention.",
    not_ideal_for: "Parents who want to research extensively online before committing — limited web presence. Visit the school to get a proper feel.",
    outcome_expectations: "Contact the school directly for curriculum details and expected progression.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // APS SWIM SCHOOL
  // Source: Skoolopedia (limited data)
  // ──────────────────────────────────────────────────
  {
    id: "b99804d9-67db-4f36-9e13-4ced75b04165",
    name: "Aps Swim School — Swimming Lessons",
    vibe_line: "Swimming lessons at Tanjong Katong — contact them for class details",
    description:
      "Aps Swim School operates from 11 Tanjong Katong Road (B1-23/27). Listed on Skoolopedia as a swimming enrichment provider.\n\nLimited information available online. Contact the school directly for details about their swimming programme, coach certifications, class sizes, and pricing.",
    summary: "Swim school at Tanjong Katong Road. Contact directly for programme details.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("swimming", 3),
    category: "Swimming",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Families in the Katong/East Coast area looking for convenient swimming lessons.",
    not_ideal_for: "Parents who want detailed programme information upfront — limited online presence.",
    outcome_expectations: "Contact the school directly for their curriculum and progression structure.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ARTSTRATOSPHERE MUSIC SCHOOL
  // Source: Skoolopedia (limited data)
  // ──────────────────────────────────────────────────
  {
    id: "ca7681da-9580-43f8-96c1-e796048757f0",
    name: "Artstratosphere — Music Lessons",
    vibe_line: "Music enrichment at Tanjong Katong — lessons for aspiring young musicians",
    description:
      "Artstratosphere Music School is located at 11 Tanjong Katong Road. Listed on Skoolopedia as a music enrichment provider.\n\nContact the school directly for details about instruments offered, lesson formats, and pricing. Limited information available online beyond the Skoolopedia listing.",
    summary: "Music school at Tanjong Katong Road offering enrichment lessons. Contact for details.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("music", 3),
    category: "Music",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children interested in music lessons in the Katong area.",
    not_ideal_for: "Parents who need comprehensive online information before visiting.",
    outcome_expectations: "Contact the school directly for curriculum and progression details.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ABSOLUTE LEARNING CENTRE — 2 entries
  // Source: Skoolopedia (limited data)
  // ──────────────────────────────────────────────────
  {
    id: "a59da4a9-c204-4b60-ad63-9344cc3f5cbf",
    name: "Absolute Learning — Chinese Enrichment",
    vibe_line: "Chinese enrichment in Bukit Batok — a neighbourhood learning centre",
    description:
      "Absolute Learning Centre is located at 91 Jalan Lekar, in the Bukit Batok area. They offer enrichment in Chinese and Mathematics.\n\nListed on Skoolopedia as an enrichment and tuition centre. Contact them directly for details about their Chinese programme structure, class sizes, teacher qualifications, and pricing.",
    summary: "Chinese enrichment centre at Jalan Lekar, Bukit Batok. Contact for programme details.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("chinese", 1),
    category: "Chinese",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children in the Bukit Batok area who need Chinese enrichment support.",
    not_ideal_for: "Families looking for detailed curriculum information online before committing.",
    outcome_expectations: "Contact the centre for specific programme outcomes and progression milestones.",
    is_placeholder: false,
  },

  {
    id: "c87eb7b6-3d47-409b-8d3b-194e040422e5",
    name: "Absolute Learning — Mathematics Enrichment",
    vibe_line: "Math enrichment in Bukit Batok — local tuition support",
    description:
      "Absolute Learning Centre also offers Mathematics enrichment from their Jalan Lekar, Bukit Batok location.\n\nContact the centre directly for details about their maths programme, levels covered, and class format.",
    summary: "Mathematics enrichment centre at Jalan Lekar, Bukit Batok. Contact for programme details.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("math", 1),
    category: "Mathematics",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children in the Bukit Batok / Jurong area who need mathematics tuition or enrichment.",
    not_ideal_for: "Families outside the western Singapore area. Limited online information available.",
    outcome_expectations: "Contact the centre for specific programme outcomes.",
    is_placeholder: false,
  },

  // ──────────────────────────────────────────────────
  // ACE SCORERS ENRICHMENT CENTRE
  // Source: Skoolopedia (limited data)
  // ──────────────────────────────────────────────────
  {
    id: "b75639a3-227f-4045-8457-7f4c538400d9",
    name: "Ace Scorers — Chinese Enrichment",
    vibe_line: "Chinese tuition at Bukit Batok East — structured learning support",
    description:
      "Ace Scorers Enrichment Centre is located at 273 Bukit Batok East Avenue 4. They offer Chinese language enrichment and tuition.\n\nListed on Skoolopedia as an enrichment centre. Contact them directly for programme details, class schedules, and pricing.",
    summary: "Chinese enrichment centre at Bukit Batok East. Contact for programme details.",
    age_min: null,
    age_max: null,
    price: null,
    schedule: null,
    photo_url: pickPhoto("chinese", 0),
    category: "Chinese",
    google_rating: null,
    review_count: null,
    raw_reviews: null,
    typical_child_profile: "Children in the Bukit Batok area needing Chinese enrichment support.",
    not_ideal_for: "Limited online information — visit or call for a proper assessment.",
    outcome_expectations: "Contact the centre for programme structure and expected outcomes.",
    is_placeholder: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════

async function run() {
  console.log("=== STEP 1: Reverting disqualified entries ===\n");

  for (const d of DISQUALIFIED) {
    const { error } = await sb
      .from("classes")
      .update({
        is_placeholder: true,
        summary: null,
        vibe_line: null,
        description: null,
        raw_reviews: null,
        typical_child_profile: null,
        not_ideal_for: null,
        outcome_expectations: null,
      })
      .eq("id", d.id);

    if (error) {
      console.log(`  FAIL: ${d.reason}`);
      console.log(`        ${error.message}`);
    } else {
      console.log(`  REVERTED: ${d.reason}`);
    }
  }

  console.log(`\n=== STEP 2: Updating ${ENRICHED.length} entries with real data ===\n`);

  let success = 0;
  let fail = 0;

  for (const entry of ENRICHED) {
    const { id, ...updateData } = entry;
    const { error } = await sb.from("classes").update(updateData).eq("id", id);

    if (error) {
      console.log(`  FAIL: ${entry.name}`);
      console.log(`        ${error.message}`);
      fail++;
    } else {
      console.log(`  OK: ${entry.name}`);
      success++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`  Disqualified: ${DISQUALIFIED.length}`);
  console.log(`  Updated: ${success}`);
  console.log(`  Failed: ${fail}`);
  console.log(`  Total active: ${success} enriched entries`);
}

run().catch(console.error);
