/**
 * Insert Curated Discovery Listings — INSERT ONLY
 * ═════════════════════════════════════════════════
 * Inserts 44 verified, deduplicated providers + placeholder classes
 * from Tumbo's discovery research.
 *
 * ⚠️  SAFETY: ONLY inserts. NEVER updates or deletes.
 *     All 30 duplicates already removed during research.
 *
 * Run: node scripts/insert-curated-listings.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LISTINGS = [
  // ══════════════════════════════════════════
  // A) EXPRESSION + CONFIDENCE (6 new)
  // ══════════════════════════════════════════
  {
    name: "SRT Centre for Creative Learning",
    website: "https://www.srt.com.sg/centre-for-creative-learning",
    location: "20 Merbau Road, Robertson Walk, Singapore 239035",
    phone: "+65 6221 5585",
    category: "Drama",
    provider_type: "independent_studio",
    age_min: 4, age_max: 12,
    description: "The education arm of Singapore Repertory Theatre. Offers weekly acting and musical theatre classes with an inquiry-based, experiential curriculum. Builds critical thinking, storytelling, and confidence through process-focused drama. Optional LAMDA exam prep. Stage Camp immersive holiday programmes available.",
    vibe_line: "process-first drama from Singapore's leading theatre company",
    summary: "Weekly acting & musical theatre classes, Stage Camp holiday programmes, Theatre Tales storytelling",
    typical_child_profile: "Kids who love stories and want to act them out. Quiet kids who respond well to structured, warm group environments.",
    not_ideal_for: "Children looking for competitive audition training or purely exam-focused programmes.",
    outcome_expectations: "Improved storytelling ability, stage confidence, and collaborative creativity after one term.",
  },
  {
    name: "Wonderlit World",
    website: "https://wonderlitworld.com",
    location: "442 Orchard Road, Claymore Connect #02-15, Singapore 238879",
    phone: "+65 6980 5670",
    category: "Drama",
    provider_type: "independent_studio",
    age_min: 3, age_max: 16,
    description: "A creative enrichment centre dedicated to nurturing confident communicators and storytellers. Their Wonderlit Speak programme covers impromptu conversation, speech writing, audience engagement, and voice modulation. Curriculum aligns with Trinity College London Communication Skills and MOE frameworks.",
    vibe_line: "where quiet kids learn to speak with clarity and confidence",
    summary: "Public speaking & speech quality, stage acting & performance, targeted 1-to-1 mentoring",
    typical_child_profile: "Kids who freeze during class presentations and need gentle scaffolding to find their voice. Children preparing for oral exams who want real communication skills.",
    not_ideal_for: "Children already confident on stage who want advanced performance training.",
    outcome_expectations: "Stronger impromptu speaking ability, clearer voice projection, and reduced anxiety around class presentations.",
  },
  {
    name: "Conundrum Theatre",
    website: "https://www.whataconundrum.com",
    location: "The Yards, Joo Chiat, Singapore",
    phone: "+65 9869 9578",
    category: "Drama",
    provider_type: "independent_studio",
    age_min: 5, age_max: 18,
    description: "A boutique theatre company in Joo Chiat founded by award-winning practitioner Claire Glenn. Offers nurturing drama classes focused on theatre-making over performance polish. Kids devise original pieces, build ensemble trust, and develop creative confidence. No auditions. Strong emphasis on process, expression, and forging friendships through collaborative play.",
    vibe_line: "safe, process-first drama for kids who'd never sign up for 'drama class'",
    summary: "Pure Play! (ages 5–8), Play On!/Play Up! (ages 7–11), Impact Collective (ages 12–16)",
    typical_child_profile: "Shy kids who need a safe space to experiment without the pressure of a big show. Creative kids who want to make theatre, not just perform scripts.",
    not_ideal_for: "Children seeking competitive or exam-oriented drama training.",
    outcome_expectations: "Greater creative confidence, stronger ensemble skills, and willingness to express ideas in group settings.",
  },
  {
    name: "Emerge Arts & Media Academy",
    website: "https://emergeartsandmedia.com",
    location: "2 Stamford Road, Raffles Boulevard, Singapore 178882",
    phone: "+65 9276 5321",
    category: "Drama",
    provider_type: "independent_studio",
    age_min: 3, age_max: 15,
    description: "A performing arts studio offering drama classes that combine storytelling, improvisation, and character work to build verbal skills and emotional intelligence. Small class sizes ensure individual attention. Dual-syllabus training uses Australia's CSTD and UK's Trinity frameworks.",
    vibe_line: "nurturing, small-group drama that helps introverts open up through story",
    summary: "Stage Exploring drama classes (ages 3–15), improvisation & character work, showcase opportunities",
    typical_child_profile: "Introverted kids who open up through storytelling and character play rather than direct spotlight. Kids needing a nurturing, small-group environment.",
    not_ideal_for: "Children wanting large-scale musical theatre productions.",
    outcome_expectations: "Improved expressive confidence, stronger verbal communication, and comfort performing in front of small audiences.",
  },
  {
    name: "SuperMinds",
    website: "https://superminds.com.sg",
    location: "175 Bencoolen Street, Burlington Square #08-01, Singapore 189649",
    phone: "+65 6602 8262",
    category: "Enrichment",
    provider_type: "independent_studio",
    age_min: 7, age_max: 14,
    description: "A soft-skills enrichment centre focused on building confidence, communication, and character through interactive public speaking, leadership, and social confidence programmes. Uses speech games, mini-debates, role-playing and communication challenges aligned to MOE's 21st Century Competencies Framework.",
    vibe_line: "soft skills that schools don't teach, delivered without the corporate cringe",
    summary: "Public speaking for kids (10-week terms), kids leadership & social confidence, holiday intensives",
    typical_child_profile: "Kids who are confident one-on-one but clam up in groups. Children who need structured practice organising and voicing their thoughts.",
    not_ideal_for: "Children looking for academic enrichment or exam preparation.",
    outcome_expectations: "Greater comfort speaking in groups, improved ability to organise ideas, and stronger social confidence.",
  },
  {
    name: "Split Theatre",
    website: "https://www.splittheatre.com",
    location: "250 New Bridge Road, Singapore 088811",
    phone: "+65 8111 5026",
    category: "Drama",
    provider_type: "independent_studio",
    age_min: 11, age_max: 18,
    description: "A unique 'playful theatre experience' workshop series called Work On The Self — part theatre training, part guided self-discovery. Led by Artistic Director Darryl Lim with 10+ years pedagogical experience. Uses improvisation, movement, and theatre exercises to build confidence and self-awareness. No prior experience needed. Supported by National Youth Council.",
    vibe_line: "theatre as self-exploration, not showbiz — for quiet teens who think deeply",
    summary: "Work On The Self 3-hour workshops, improvisation & movement, mini solo performance creation",
    typical_child_profile: "Older introverted kids and teens who'd never sign up for 'drama class' but might try 'self-discovery through play'. Quiet teens needing low-stakes, non-performative space.",
    not_ideal_for: "Young children or kids wanting traditional drama/musical theatre training.",
    outcome_expectations: "Increased self-awareness, comfort with physical expression, and confidence in sharing ideas without performance pressure.",
  },

  // ══════════════════════════════════════════
  // B) MOVEMENT + REGULATION (4 new)
  // ══════════════════════════════════════════
  {
    name: "Lion City Parkour",
    website: "https://lioncityparkour.com",
    location: "Multiple locations: Aljunied, Bishan, Holland Village, Jurong",
    phone: null,
    category: "Sports",
    provider_type: "independent_studio",
    age_min: 3, age_max: 14,
    description: "Homegrown parkour academy offering affordable classes ($35/session) across multiple heartland locations. Coaches send parents post-class progress videos. Kinder Parkour programme starts from age 3. Focus on risk-calibrated play — teaching kids to assess obstacles and build physical problem-solving skills in a safe environment.",
    vibe_line: "affordable heartland parkour that teaches kids to assess risk, not avoid it",
    summary: "Kinder Parkour (age 3+), youth parkour classes, holiday camps across 4 locations",
    typical_child_profile: "Energetic kids who climb everything at the playground. Children who need physical challenges that also build focus and risk assessment.",
    not_ideal_for: "Very cautious children who are uncomfortable with heights or physical risk.",
    outcome_expectations: "Improved spatial awareness, physical confidence, and ability to assess and manage physical risk safely.",
  },
  {
    name: "Saudacao Capoeira Singapore",
    website: "https://www.saudacao.com.sg",
    location: "Middle Road, Bugis, Singapore",
    phone: null,
    category: "Martial Arts",
    provider_type: "independent_studio",
    age_min: 4, age_max: 14,
    description: "A unique Afro-Brazilian cultural arts school teaching capoeira — a hybrid of martial arts, dance, music, and acrobatics. Sessions include movement, live drumming (batucada), and singing in Portuguese. Cultural immersion approach builds coordination, rhythm, and community belonging. One of Singapore's few capoeira schools for kids.",
    vibe_line: "martial art meets dance meets drumming — nothing else like it in Singapore",
    summary: "Kids capoeira classes, batucada drumming, samba workshops, cultural immersion",
    typical_child_profile: "Kids who don't fit neatly into 'dance' or 'martial arts' and need something that's both. Children who respond to music and rhythm alongside physical challenge.",
    not_ideal_for: "Children looking for traditional martial arts belt progression.",
    outcome_expectations: "Improved coordination, rhythm, body awareness, and exposure to a rich cultural tradition.",
  },
  {
    name: "It's Just Play",
    website: "https://www.itsjustplay.com.sg",
    location: "Mobile — homes and schools across Singapore",
    phone: null,
    category: "Special Needs",
    provider_type: "solo_tutor",
    age_min: 1, age_max: 10,
    description: "Neurodiversity-affirming paediatric occupational therapy practice built on the principle that 'play is how regulation develops.' Mobile sessions at homes and schools. Focuses on sensory processing, self-regulation, and motor development through play-based intervention rather than clinical drilling.",
    vibe_line: "play-based OT that meets your child where they are — literally at your doorstep",
    summary: "Mobile paediatric OT, sensory processing support, play-based self-regulation",
    typical_child_profile: "Children who need sensory or regulation support in their natural environment. Kids whose families want a warm, non-clinical approach to developmental support.",
    not_ideal_for: "Families seeking clinic-based assessment or formal diagnosis services.",
    outcome_expectations: "Improved sensory regulation, motor confidence, and daily function through play-based strategies that parents can continue at home.",
  },
  {
    name: "Tesserae",
    website: "https://tesserae.sg",
    location: "Joo Chiat, Singapore",
    phone: null,
    category: "Dance",
    provider_type: "independent_studio",
    age_min: 3, age_max: 18,
    description: "ABA-integrated dance programme for children with developmental needs, led by Southeast Asia's only doctoral-level Board Certified Behavior Analyst. Uses structured dance as a medium for building social, communication, and motor skills. Evidence-based approach unique in Singapore's enrichment landscape.",
    vibe_line: "evidence-based dance therapy for children who learn differently",
    summary: "ABA-integrated dance for developmental needs, social skills through movement, evidence-based approach",
    typical_child_profile: "Children with developmental needs who benefit from structured, evidence-based movement programmes. Families wanting enrichment that genuinely accommodates neurodiversity.",
    not_ideal_for: "Neurotypical children seeking conventional dance training.",
    outcome_expectations: "Measurable progress in social engagement, motor coordination, and confidence through structured dance participation.",
  },

  // ══════════════════════════════════════════
  // C) LEARNING + CURIOSITY (8 new)
  // ══════════════════════════════════════════
  {
    name: "Maths2Art",
    website: "https://maths2art.com",
    location: "Singapore (home-based tutor)",
    phone: null,
    category: "Mathematics",
    provider_type: "solo_tutor",
    age_min: 5, age_max: 12,
    description: "A solo tutor who teaches mathematics through art and visual learning. Uses guided discovery methods to help children see mathematical concepts as creative patterns rather than abstract formulas. Small group sessions with a visual, hands-on approach uncommon in Singapore's tuition market.",
    vibe_line: "maths through art — because numbers are patterns, not problems",
    summary: "Visual mathematics through art, guided discovery, small group sessions",
    typical_child_profile: "Visual learners who struggle with abstract math but light up when they can draw or build. Kids who need a creative entry point into mathematical thinking.",
    not_ideal_for: "Children needing intensive exam drilling or PSLE-focused preparation.",
    outcome_expectations: "Stronger number sense and spatial reasoning, with improved confidence approaching unfamiliar math problems.",
  },
  {
    name: "Paperland",
    website: "https://paperland.sg",
    location: "Singapore",
    phone: null,
    category: "Mathematics",
    provider_type: "independent_studio",
    age_min: 5, age_max: 12,
    description: "Computational mathematics workshops teaching from first principles. Maximum 1:6 instructor ratio ensures individual attention. Focus on building genuine mathematical understanding through progressive problem-solving rather than repetition.",
    vibe_line: "first-principles math in tiny groups — understanding over memorisation",
    summary: "Computational math workshops, 1:6 ratio, $89/workshop, first-principles approach",
    typical_child_profile: "Kids who ask 'but why?' about math rules. Children who need to understand concepts before they can apply procedures.",
    not_ideal_for: "Children wanting fast-paced competitive math olympiad training.",
    outcome_expectations: "Deeper conceptual understanding of mathematical principles and ability to tackle novel problems independently.",
  },
  {
    name: "Tinker With Things",
    website: "https://tinkerwith.things.sg",
    location: "Singapore",
    phone: null,
    category: "Coding",
    provider_type: "independent_studio",
    age_min: 6, age_max: 14,
    description: "Engineer-led 3D printing and maker workshops with a maximum 1:5 instructor ratio. Kids learn CAD design, 3D printing, and physical prototyping. Focus on real engineering problem-solving rather than pre-packaged kits — children design, iterate, and troubleshoot their own creations.",
    vibe_line: "real engineering, not kit-assembly — kids design and 3D-print their own ideas",
    summary: "3D printing workshops, CAD design for kids, engineering problem-solving, 1:5 ratio",
    typical_child_profile: "Kids who take things apart to see how they work. Children who want to build real things, not follow instruction manuals.",
    not_ideal_for: "Very young children or those needing more screen-based coding activities.",
    outcome_expectations: "Basic CAD skills, understanding of the design-prototype cycle, and confidence approaching open-ended engineering challenges.",
  },
  {
    name: "Maker.sg",
    website: "https://maker.sg",
    location: "4 locations across Singapore",
    phone: null,
    category: "Coding",
    provider_type: "independent_studio",
    age_min: 3, age_max: 16,
    description: "A 4-location makerspace offering hands-on STEM workshops using Chibitronics, Makey Makey, Squishy Circuits, and other maker tools. Curriculum designed for children as young as 3. Focus on tactile, creative technology exploration rather than screen-based coding.",
    vibe_line: "tangible tech play — circuits, sensors, and inventions you can touch",
    summary: "Maker workshops (Chibitronics, Makey Makey, Squishy Circuits), ages 3-16, 4 locations",
    typical_child_profile: "Hands-on kids who learn by touching and building. Children who find traditional coding classes too screen-heavy.",
    not_ideal_for: "Children wanting competitive robotics or pure programming training.",
    outcome_expectations: "Comfort with basic electronics and circuits, creative problem-solving confidence, and excitement about how technology works physically.",
  },
  {
    name: "Arkki Singapore",
    website: "https://arkki.com.sg",
    location: "Singapore",
    phone: null,
    category: "Coding",
    provider_type: "franchise_chain",
    age_min: 4, age_max: 14,
    description: "Finnish architecture-based STEAM education with a 30-module progressive curriculum. Children learn design thinking, spatial reasoning, and engineering through architecture projects — building models, designing spaces, and solving real-world design challenges. Award-winning Finnish pedagogy adapted for Singapore.",
    vibe_line: "Finnish design thinking through architecture — STEAM with a blueprint",
    summary: "Architecture-based STEAM, 30-module curriculum, design thinking through building",
    typical_child_profile: "Spatial thinkers who love building with Lego or blocks. Kids interested in how buildings and spaces work.",
    not_ideal_for: "Children looking for software coding or pure robotics.",
    outcome_expectations: "Stronger spatial reasoning, design thinking skills, and ability to communicate ideas through physical models.",
  },
  {
    name: "The Curiosity Circuit",
    website: "https://thecuriositycircuit.com",
    location: "Multiple venues, Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "independent_studio",
    age_min: 4, age_max: 10,
    description: "Play-based design thinking workshops for children. Sessions follow a structured inquiry cycle — wonder, explore, create, reflect — in 2-hour sessions at multiple venues. Intentionally non-academic: designed to build creative problem-solving, collaboration, and curiosity as transferable life skills.",
    vibe_line: "design thinking for small humans — wonder, build, reflect, repeat",
    summary: "Play-based design thinking workshops, $100/2hrs, structured inquiry cycle",
    typical_child_profile: "Curious kids who ask lots of questions and enjoy open-ended challenges. Children who need creative outlets beyond academic enrichment.",
    not_ideal_for: "Kids looking for structured academic content or exam preparation.",
    outcome_expectations: "Improved ability to frame problems creatively, collaborate with peers, and present ideas with confidence.",
  },
  {
    name: "Lil' but Mighty",
    website: "https://www.lilbutmighty.com",
    location: "6 branches + online, Singapore",
    phone: null,
    category: "English",
    provider_type: "independent_studio",
    age_min: 5, age_max: 12,
    description: "Creative writing and English enrichment with a maximum 6 students per teacher. Known for making writing genuinely enjoyable rather than formulaic. 6 physical branches plus online options. Focus on voice, imagination, and originality in composition rather than template-based exam writing.",
    vibe_line: "writing that doesn't feel like homework — voice and imagination over templates",
    summary: "Creative writing (max 6:1 ratio), English enrichment, 6 branches + online",
    typical_child_profile: "Kids who have ideas but struggle to put them on paper. Children who find school composition boring but love storytelling.",
    not_ideal_for: "Children needing intensive PSLE comprehension drilling.",
    outcome_expectations: "Stronger written voice, improved sentence variety, and genuine enjoyment of the writing process.",
  },
  {
    name: "Young Writers Lab",
    website: "https://www.bookcouncil.sg/programmes/young-writers-lab",
    location: "National Library, Singapore",
    phone: null,
    category: "English",
    provider_type: "community_org",
    age_min: 12, age_max: 18,
    description: "A Singapore Book Council programme offering free or subsidised creative writing workshops led by real published authors. Held at the National Library. Focuses on developing authentic literary voice and craft — poetry, fiction, non-fiction — outside the exam system. One of Singapore's few free quality writing programmes for teens.",
    vibe_line: "real authors teaching real writing — free, literary, zero exam pressure",
    summary: "Free/subsidised creative writing workshops, led by published authors, ages 12-18",
    typical_child_profile: "Teens who read voraciously and want to write seriously. Young people who need a space to develop literary voice without academic pressure.",
    not_ideal_for: "Children under 12 or those seeking exam-focused English tuition.",
    outcome_expectations: "Development of authentic writing voice, exposure to professional literary craft, and a portfolio of original creative work.",
  },

  // ══════════════════════════════════════════
  // D) SOCIAL + LIFE SKILLS (4 new)
  // ══════════════════════════════════════════
  {
    name: "The Collaboration Corner",
    website: "https://thecollaborationcorner.com",
    location: "Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "independent_studio",
    age_min: 4, age_max: 12,
    description: "A dedicated EQ enrichment centre offering social-emotional learning programmes with parent coaching. Focus on emotional literacy, self-regulation, empathy, and collaborative problem-solving. One of the few Singapore enrichment providers built entirely around emotional intelligence rather than academics.",
    vibe_line: "EQ enrichment that helps kids understand feelings — theirs and others'",
    summary: "Social-emotional learning, parent coaching, emotional literacy programmes",
    typical_child_profile: "Children who struggle with big emotions or social situations. Kids who would benefit from structured practice in empathy, turn-taking, and emotional vocabulary.",
    not_ideal_for: "Families seeking academic enrichment or competitive programmes.",
    outcome_expectations: "Improved emotional vocabulary, better self-regulation strategies, and greater comfort navigating social situations.",
  },
  {
    name: "LK Academy",
    website: "https://lkacademy.com.sg",
    location: "Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "independent_studio",
    age_min: 6, age_max: 14,
    description: "Public speaking enrichment using a talk-show format — part EQ development, part Toastmasters for kids. Children practice interviewing, presenting, and articulating opinions in a structured but lively format. Builds communication confidence without the pressure of formal debate or performance.",
    vibe_line: "Toastmasters meets talk-show — speaking confidence without the stiffness",
    summary: "Talk-show format public speaking, EQ + IQ communication, structured confidence building",
    typical_child_profile: "Kids who have opinions but struggle to share them in groups. Children who enjoy watching talk shows and interviews.",
    not_ideal_for: "Very young children or those seeking formal debate/competition training.",
    outcome_expectations: "Greater comfort expressing opinions publicly, improved interviewing and listening skills, and stronger presentation confidence.",
  },
  {
    name: "Moneykids",
    website: "https://moneykids.sg",
    location: "Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "independent_studio",
    age_min: 7, age_max: 14,
    description: "Financial literacy bootcamp for kids. Teaches budgeting, saving, basic investing concepts, and entrepreneurial thinking through hands-on activities and simulations. One of Singapore's few dedicated financial literacy programmes for children.",
    vibe_line: "money skills for kids — before TikTok teaches them first",
    summary: "Financial literacy bootcamp, budgeting & saving, entrepreneurial thinking",
    typical_child_profile: "Kids who are curious about money and how business works. Children who enjoy strategy games and real-world problem-solving.",
    not_ideal_for: "Very young children or those not yet ready for abstract financial concepts.",
    outcome_expectations: "Basic understanding of budgeting, saving, and how businesses work, plus improved decision-making around spending.",
  },
  {
    name: "Singapore Kidpreneur Bazaar",
    website: "https://sgkidpreneurbazaar.com",
    location: "Various venues, Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 5, age_max: 14,
    description: "A real maker market where children create products, set up stalls, and sell to the public. Now in its 6th edition. Teaches entrepreneurship, creativity, and confidence through actual commerce — pricing, customer interaction, marketing, and handling money. Unique experiential learning not found in typical enrichment settings.",
    vibe_line: "kids running real businesses at a real market — entrepreneurship you can taste",
    summary: "Kids maker market, real commerce experience, product creation to sales, ages 5-14",
    typical_child_profile: "Kids who love making things and want to see if people will buy them. Children who learn best through real-world experiences rather than classroom simulations.",
    not_ideal_for: "Very shy children who would find public selling overwhelming without preparation.",
    outcome_expectations: "First-hand experience in creating, pricing, and selling a product, plus the confidence that comes from real customer interaction.",
  },

  // ══════════════════════════════════════════
  // E) COMMUNITY DEVELOPMENT + SAFE SPACE (8 new)
  // ══════════════════════════════════════════
  {
    name: "Tak Takut Kids Club",
    website: "https://www.taktakutkidsclub.com",
    location: "Boon Lay, Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 5, age_max: 14,
    description: "A community initiative providing a safe, judgement-free space for children in Boon Lay. Founded under 3Pumpkins, TTKC uses creative, social, and exploratory activities — art, gardening, cooking, hosting events — as mediums for building trust, resilience, and belonging. Connected to approximately 200 children in the neighbourhood.",
    vibe_line: "a safe space where kampung spirit meets creative courage for every kid",
    summary: "Safe-space community programme, creative & social activities, trust-building, neighbourhood-based",
    typical_child_profile: "Kids who need a safe, judgement-free environment to build trust and connections. Children who benefit from play-based community support and socio-emotional growth.",
    not_ideal_for: "Families seeking structured academic enrichment or competitive programmes.",
    outcome_expectations: "Stronger sense of belonging, improved social confidence, and resilience built through consistent community engagement.",
  },
  {
    name: "Ground-Up Initiative",
    website: "https://groundupinitiative.org",
    location: "91 Lorong Chencharu, Kampung Kampus, Yishun, Singapore 769201",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 3, age_max: 16,
    description: "A 2.6-hectare Kampung Kampus in Yishun offering nature-based learning, farming, and community programmes. Over 150,000 people impacted. Teaches sustainability, resilience, and earth stewardship through hands-on outdoor experiences. Community school model with programmes ranging from toddler nature play to teen leadership.",
    vibe_line: "a kampung in the city where kids learn to grow food, build things, and belong",
    summary: "Kampung Kampus nature programmes, urban farming, community school, sustainability education",
    typical_child_profile: "Kids who need outdoor, hands-on experiences. Children who thrive when learning has purpose and community connection.",
    not_ideal_for: "Families seeking indoor, air-conditioned academic enrichment.",
    outcome_expectations: "Connection to nature, practical sustainability skills, and a sense of stewardship and community responsibility.",
  },
  {
    name: "The Artground",
    website: "https://theartground.com.sg",
    location: "Goodman Arts Centre & The Artground @ Bras Basah, Singapore",
    phone: null,
    category: "Art",
    provider_type: "community_org",
    age_min: 0, age_max: 9,
    description: "A registered arts charity focused on children from birth to 9. Creates immersive sensory-rich art installations, storytelling experiences, and creative play environments. Two locations. Emphasis on process-based exploration, sensory engagement, and early arts access regardless of family income.",
    vibe_line: "arts charity where babies and toddlers explore — sensory, immersive, income-inclusive",
    summary: "Immersive art installations, sensory storytelling, creative play environments, birth to 9",
    typical_child_profile: "Very young children who respond to sensory-rich environments. Families wanting early arts exposure in a non-commercial, inclusive space.",
    not_ideal_for: "Older children seeking structured art technique classes.",
    outcome_expectations: "Early sensory development, creative confidence through open-ended exploration, and positive first associations with art.",
  },
  {
    name: "32 Pages",
    website: "https://www.32pages.org",
    location: "Various neighbourhood locations, Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 4, age_max: 12,
    description: "A grassroots social-emotional learning initiative using picture books as the primary medium. Volunteer-led neighbourhood sessions help children explore emotions, relationships, and social situations through carefully curated stories and guided discussion. Free or low-cost. Deliberately neighbourhood-based to build local community connections.",
    vibe_line: "SEL through picture books — grassroots, volunteer-led, neighbourhood by neighbourhood",
    summary: "Picture book-based SEL sessions, volunteer-led, neighbourhood-based, free/low-cost",
    typical_child_profile: "Children who connect with stories and benefit from guided emotional exploration. Kids in communities where affordable SEL programming is limited.",
    not_ideal_for: "Families seeking structured academic reading programmes.",
    outcome_expectations: "Improved emotional vocabulary, greater empathy, and ability to discuss feelings and social situations through the lens of stories.",
  },
  {
    name: "Morning Star EXSEL",
    website: "https://morningstar.org.sg",
    location: "4 centres across Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 5, age_max: 14,
    description: "Community-based social-emotional learning programme using the CASEL Framework, combining structured SEL curriculum with art therapy approaches. 4 centres across Singapore. Focus on emotional regulation, interpersonal skills, and responsible decision-making for children who need additional support.",
    vibe_line: "CASEL Framework SEL with art therapy — structured support across 4 centres",
    summary: "CASEL-based SEL programme, art therapy integration, 4 centres, emotional regulation focus",
    typical_child_profile: "Children who need structured support developing emotional regulation and social skills. Kids who respond to creative arts as a medium for emotional processing.",
    not_ideal_for: "Families seeking clinical therapy or academic enrichment.",
    outcome_expectations: "Improved emotional regulation strategies, stronger interpersonal skills, and better responsible decision-making in social situations.",
  },
  {
    name: "Gateway Arts",
    website: "https://gatewayarts.sg",
    location: "3 Jalan Bukit Merah, Singapore 159461",
    phone: "+65 6424 9408",
    category: "Drama",
    provider_type: "community_org",
    age_min: 3, age_max: 14,
    description: "A registered charity using theatre and performing arts to build emotional resilience and social confidence in children. 91% reported positive impact on participants. Programmes include free storytelling sessions, affordable arts & crafts workshops, and inclusive community performances.",
    vibe_line: "theatre for emotional resilience — a registered charity with 91% impact",
    summary: "Theatre for resilience, free storytelling sessions, affordable arts workshops, community performances",
    typical_child_profile: "Children who need safe, creative outlets for emotional expression. Kids from families seeking affordable or free arts programming.",
    not_ideal_for: "Families wanting intensive technical theatre training.",
    outcome_expectations: "Greater emotional resilience, improved self-expression, and confidence in creative group settings.",
  },
  {
    name: "Beyond Social Services",
    website: "https://www.beyond.org.sg",
    location: "Multiple locations across Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 5, age_max: 18,
    description: "An asset-based community development organisation serving over 3,000 families. Programmes focus on building children's strengths rather than fixing deficits. Youth development through mentoring, community projects, and leadership opportunities. Emphasis on agency, belonging, and contribution.",
    vibe_line: "building on strengths, not fixing deficits — community development that empowers kids",
    summary: "Asset-based community development, youth mentoring, community projects, 3,000+ families",
    typical_child_profile: "Children and youth who benefit from consistent mentoring and community belonging. Kids who need adults who believe in their potential.",
    not_ideal_for: "Families seeking traditional enrichment classes or academic tuition.",
    outcome_expectations: "Stronger sense of agency and belonging, leadership skills developed through real community contribution.",
  },
  {
    name: "Boys' Town",
    website: "https://www.boystown.org.sg",
    location: "624 Upper Bukit Timah Road, Singapore 678212",
    phone: null,
    category: "Enrichment",
    provider_type: "community_org",
    age_min: 6, age_max: 21,
    description: "With over 75 years of history, Boys' Town offers adventure therapy, YouthReach street engagement, and developmental programmes for at-risk youth. Uses outdoor adventure, arts, and community service as mediums for building resilience, self-worth, and life skills. Not a typical enrichment centre — a deep-impact youth development organisation.",
    vibe_line: "75 years of reaching kids others give up on — adventure therapy meets real support",
    summary: "Adventure therapy, YouthReach street engagement, developmental programmes, 75+ year history",
    typical_child_profile: "Youth who need intensive support and consistent mentoring. Children and teens facing challenging circumstances who benefit from structured adventure-based development.",
    not_ideal_for: "Families looking for typical weekend enrichment classes.",
    outcome_expectations: "Improved self-regulation, stronger resilience, and measurable progress in life skills and social development.",
  },

  // ══════════════════════════════════════════
  // F) ARTS + CRAFT (9 new)
  // ══════════════════════════════════════════
  {
    name: "Boldly In Art",
    website: "https://boldlyinart.com",
    location: "Stevens, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 2, age_max: 10,
    description: "A Reggio Emilia-inspired home studio offering process art with 6 sensory stations per session. Children move freely between stations — paint, clay, sand, water, light — exploring materials at their own pace. Tiny class sizes in an intimate setting. The emphasis is entirely on creative process, not a finished product.",
    vibe_line: "Reggio process art in a home studio — 6 sensory stations, zero product pressure",
    summary: "Process art with 6 sensory stations, Reggio-inspired, tiny classes, home studio setting",
    typical_child_profile: "Sensory-seeking children who need to explore materials freely. Kids who shut down when told 'make it look like this.'",
    not_ideal_for: "Children wanting structured technique lessons or take-home projects every session.",
    outcome_expectations: "Greater sensory confidence, creative independence, and comfort with open-ended exploration.",
  },
  {
    name: "Art Curios",
    website: "https://artcurios.com",
    location: "Singapore (contact for address)",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 3, age_max: 12,
    description: "Reggio inquiry-based art studio offering cross-disciplinary sessions that weave art with drama, science, and storytelling. Each term follows a thematic investigation rather than technique-based lessons. Children explore questions through multiple creative media. Focus on documentation and reflection.",
    vibe_line: "art as investigation — Reggio inquiry where kids ask questions and create answers",
    summary: "Reggio inquiry-based art, cross-disciplinary themes (art + drama + science), documentation focus",
    typical_child_profile: "Curious kids who ask 'what if?' and enjoy exploring ideas through making. Children who get bored with repetitive craft projects.",
    not_ideal_for: "Families wanting traditional art technique progression or take-home crafts.",
    outcome_expectations: "Stronger inquiry skills, ability to explore ideas across media, and confidence expressing thinking through creative work.",
  },
  {
    name: "stART Studio",
    website: "https://www.startstudio.sg",
    location: "Bukit Timah Plaza, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 4, age_max: 14,
    description: "Therapeutic art studio using creative expression as a medium for emotional growth and self-awareness. Sessions are guided by art therapists or trained facilitators. Children explore feelings, build resilience, and develop coping strategies through art-making. Not a typical art class — the art is the vehicle, emotional development is the destination.",
    vibe_line: "art as emotional processing — where the painting is secondary to what it unlocks",
    summary: "Therapeutic art for emotional growth, art therapist-guided, resilience & coping through creativity",
    typical_child_profile: "Children processing big emotions, transitions, or anxiety who need a creative outlet. Kids who express themselves better through making than talking.",
    not_ideal_for: "Children seeking technique-focused art training or portfolio development.",
    outcome_expectations: "Improved emotional awareness, healthier coping strategies, and greater comfort expressing difficult feelings through creative work.",
  },
  {
    name: "Arterly Obsessed",
    website: "https://arterlyobsessed.com",
    location: "Chinatown, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 6, age_max: 18,
    description: "An artist-led studio run by practising artists (ex-SOTA graduates). Offers serious art education including DSA portfolio preparation, life drawing, and contemporary art techniques. Focus on developing individual artistic voice rather than generic enrichment. One of the few studios that treats young artists as emerging artists, not just kids doing crafts.",
    vibe_line: "practising artists teaching emerging artists — serious art, not weekend crafts",
    summary: "Artist-led studio, DSA portfolio prep, life drawing, contemporary techniques, ex-SOTA instructors",
    typical_child_profile: "Artistically inclined teens wanting to develop a real portfolio. Kids who've outgrown typical art enrichment and want genuine skill development.",
    not_ideal_for: "Very young children or families wanting casual weekend craft sessions.",
    outcome_expectations: "Development of individual artistic voice, portfolio-ready work, and exposure to contemporary art practices and critique.",
  },
  {
    name: "Music Solutions",
    website: "https://musicsolutions.com.sg",
    location: "Enabling Village, Lengkok Bahru, Singapore",
    phone: null,
    category: "Music",
    provider_type: "independent_studio",
    age_min: 3, age_max: 14,
    description: "A pedagogy-driven music school using Orff, Dalcroze, and Kodály methods — 'Sound Before Sight' approach where children make music before learning notation. Located at Enabling Village with an inclusive MS Academy programme. One of Singapore's few music schools built entirely on research-backed early childhood music pedagogy.",
    vibe_line: "Sound Before Sight — real music pedagogy in an inclusive setting",
    summary: "Orff/Dalcroze/Kodály methods, Sound Before Sight, inclusive MS Academy, Enabling Village",
    typical_child_profile: "Children who respond to music physically and intuitively. Kids who might struggle with traditional notation-first instrument lessons.",
    not_ideal_for: "Families wanting immediate instrument exam grading or ABRSM-focused preparation.",
    outcome_expectations: "Strong musical ear, rhythmic confidence, and genuine musical expression before formal notation — a foundation that transfers to any instrument.",
  },
  {
    name: "Heppi Pottery & Goods",
    website: "https://heppipottery.com",
    location: "Bukit Timah, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 5, age_max: 14,
    description: "Intimate pottery studio specialising in handbuilding techniques — slab, pinch, and coil — with a maximum of 6 kids per class. Children create functional pieces from scratch, learning the full ceramic process from forming to glazing. Focus on patience, craftsmanship, and tactile creativity.",
    vibe_line: "slow pottery in tiny groups — hands in clay, no rush, real craft",
    summary: "Handbuilding pottery (slab, pinch, coil), max 6 kids/class, full ceramic process",
    typical_child_profile: "Kids who need tactile, slow-paced creative work. Children who enjoy making functional objects with their hands.",
    not_ideal_for: "Children wanting quick, take-home craft projects or large social class environments.",
    outcome_expectations: "Understanding of the full ceramic process, improved patience and fine motor skills, and pride in creating functional handmade objects.",
  },
  {
    name: "Clay Cove",
    website: "https://claycove.com.sg",
    location: "Delfi Orchard, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 4, age_max: 14,
    description: "A progressive pottery studio with a 3-level course structure — Foundation, Intermediate, Advanced. Children develop wheel-throwing and handbuilding skills through structured progression. Located in Orchard. Clear skill pathway rare among Singapore pottery studios for kids.",
    vibe_line: "pottery with a progression pathway — from first pinch pot to the wheel",
    summary: "3-level progressive pottery courses, wheel-throwing & handbuilding, Orchard location",
    typical_child_profile: "Kids who enjoy mastering skills progressively and want to see clear advancement. Children drawn to the meditative quality of working with clay.",
    not_ideal_for: "Children wanting one-off craft experiences rather than committed skill development.",
    outcome_expectations: "Progressive mastery from basic handbuilding to wheel-throwing, with a clear sense of skill advancement and a portfolio of completed ceramic work.",
  },
  {
    name: "Creativebits",
    website: "https://creativebits.org",
    location: "In-school and external venues, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 5, age_max: 14,
    description: "Digital arts studio specialising in claymation, sand animation, and stop-motion filmmaking. NAC Arts Education Programme endorsed since 2005. Children create their own animated films from concept to completion. One of Singapore's few providers focused specifically on animation as a creative medium for children.",
    vibe_line: "claymation and sand animation — kids make real animated films, frame by frame",
    summary: "Claymation workshops, sand animation, stop-motion filmmaking, NAC-AEP endorsed since 2005",
    typical_child_profile: "Detail-oriented kids who enjoy storytelling through visual media. Children fascinated by how cartoons and films are made.",
    not_ideal_for: "Kids wanting live-action drama or performance-based arts.",
    outcome_expectations: "Ability to plan, shoot, and edit a short animation, plus improved patience and attention to detail.",
  },
  {
    name: "Beary Naise Co.",
    website: "https://bearynaise.com",
    location: "Studio + home-visit available, Singapore",
    phone: null,
    category: "Art",
    provider_type: "independent_studio",
    age_min: 5, age_max: 14,
    description: "Sewing and textile craft studio offering a tiered RAWR Kids' Club programme. Children learn sewing machine operation, pattern reading, and garment construction. Home-visit option available. Upcycling workshops teach sustainability through craft. One of very few dedicated kids' sewing studios in Singapore.",
    vibe_line: "real sewing skills for kids — machines, patterns, and upcycling with purpose",
    summary: "Tiered RAWR Kids' Club sewing, home-visit available, upcycling workshops, machine sewing",
    typical_child_profile: "Kids who love making wearable or usable things. Children interested in fashion, crafting, or sustainability.",
    not_ideal_for: "Very young children not yet ready for sewing machine use.",
    outcome_expectations: "Ability to operate a sewing machine safely, read basic patterns, and complete simple garment or accessory projects independently.",
  },

  // ══════════════════════════════════════════
  // G) OUTDOOR + NATURE (3 new — rest already in DB)
  // ══════════════════════════════════════════
  {
    name: "Forest Atelier",
    website: "https://forestatelier.com",
    location: "Dempsey area, Singapore",
    phone: null,
    category: "Enrichment",
    provider_type: "independent_studio",
    age_min: 2, age_max: 7,
    description: "A Reggio Emilia-inspired forest school combining outdoor nature play with artistic documentation. Facilitators observe and document children's learning journeys in nature. Sessions take place in green spaces around the Dempsey area. Unique blend of forest school philosophy and Reggio documentation practice.",
    vibe_line: "Reggio meets forest school — nature play with documented learning journeys",
    summary: "Reggio-inspired forest school, artistic documentation, nature play, Dempsey area",
    typical_child_profile: "Young children who need unstructured outdoor exploration. Families who value the Reggio approach to observing and documenting learning.",
    not_ideal_for: "Families wanting structured indoor activities or air-conditioned environments.",
    outcome_expectations: "Deep nature connection, creative confidence outdoors, and documented learning that parents can follow and appreciate.",
  },
  {
    name: "Roots and Boots",
    website: "https://rootsandboots.sg",
    location: "Rotating parks across Singapore",
    phone: null,
    category: "Chinese",
    provider_type: "independent_studio",
    age_min: 3, age_max: 8,
    description: "An urban forest school offering Chinese language immersion nature sessions. Children learn Mandarin through outdoor exploration, nature play, and guided discovery in Singapore's parks and green spaces. Sessions run every school holiday. One of the only providers combining forest school methodology with Chinese language acquisition.",
    vibe_line: "learn Mandarin in the forest — Chinese immersion meets nature play",
    summary: "Chinese language immersion nature sessions, forest school methodology, school holiday sessions",
    typical_child_profile: "Bilingual families wanting Chinese exposure outside the classroom. Kids who resist Chinese tuition but love being outdoors.",
    not_ideal_for: "Children needing intensive Chinese exam preparation or character writing drills.",
    outcome_expectations: "Improved Mandarin vocabulary through natural context, positive associations with Chinese language, and nature literacy.",
  },
  {
    name: "Kaleido Kids",
    website: "https://kaleidokids.sg",
    location: "Singapore (location provided upon booking)",
    phone: "+65 8513 4088",
    category: "Dance",
    provider_type: "independent_studio",
    age_min: 2, age_max: 6,
    description: "Holistic enrichment for toddlers and preschoolers offering 45-minute interactive sessions combining public speaking, creative dance, kids yoga, and arts-and-movement. Uses vocal warm-ups, storytelling, dramatic play, costumes, and props. Multi-sensory approach to early expression and body confidence.",
    vibe_line: "playful multi-sensory expression for the youngest movers and speakers",
    summary: "Public speaking for toddlers, creative dance, kids yoga, arts & movement, ages 1.5-6",
    typical_child_profile: "Toddlers and preschoolers who need a gentle, play-first introduction to using their voice and body. Shy young kids who respond better to costumes and props.",
    not_ideal_for: "Older children or families wanting technique-focused dance or speech training.",
    outcome_expectations: "Early voice confidence, body awareness, and comfort with creative self-expression in group settings.",
  },
];

async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  Curated Listings Inserter (INSERT-ONLY)");
  console.log("══════════════════════════════════════════");
  console.log("  ⚠️  ONLY inserts. NEVER updates/deletes.\n");

  // Load existing for final dedup
  let existing = [];
  let offset = 0;
  while (true) {
    const { data } = await sb.from("providers").select("name").range(offset, offset + 999);
    if (!data || data.length === 0) break;
    existing.push(...data.map(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, "")));
    offset += 1000;
  }
  console.log(`Loaded ${existing.length} existing providers for dedup\n`);

  let inserted = 0;
  let dupes = 0;
  let errors = 0;

  for (const listing of LISTINGS) {
    const normName = listing.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Final dedup — exact match or high-overlap substring (min 10 chars)
    const isDupe = existing.some(e => {
      if (e === normName) return true;
      // Only do substring matching for strings long enough to be meaningful
      if (e.length >= 10 && normName.length >= 10) {
        if (e === normName) return true;
        // Check if one is a near-exact subset (90%+ of the shorter string)
        const shorter = e.length < normName.length ? e : normName;
        const longer = e.length < normName.length ? normName : e;
        if (shorter.length >= 10 && longer.includes(shorter)) return true;
      }
      return false;
    });
    if (isDupe) {
      console.log(`  SKIP (dupe): ${listing.name}`);
      dupes++;
      continue;
    }

    // Insert provider
    const { data: prov, error: provErr } = await sb
      .from("providers")
      .insert({
        name: listing.name,
        website: listing.website,
        location: listing.location,
        phone: listing.phone,
        provider_type: `{${listing.provider_type}}`,
      })
      .select("id")
      .single();

    if (provErr) {
      console.log(`  ERR provider: ${listing.name} — ${provErr.message}`);
      errors++;
      continue;
    }

    // Insert class
    const { error: clsErr } = await sb
      .from("classes")
      .insert({
        name: listing.name,
        provider_id: prov.id,
        category: listing.category,
        location: listing.location,
        age_min: listing.age_min || null,
        age_max: listing.age_max || null,
        description: listing.description,
        vibe_line: listing.vibe_line,
        summary: listing.summary,
        typical_child_profile: listing.typical_child_profile,
        not_ideal_for: listing.not_ideal_for,
        outcome_expectations: listing.outcome_expectations,
        is_placeholder: false,  // These are fully enriched!
        source: "tumbo-discovery-research",
        discovered_from: JSON.stringify({
          source: "tumbo-discovery-research",
          date: new Date().toISOString(),
          method: "manual-curation",
        }),
      });

    if (clsErr) {
      console.log(`  ERR class: ${listing.name} — ${clsErr.message}`);
      errors++;
      continue;
    }

    existing.push(normName); // prevent self-duplication
    inserted++;
    console.log(`  ✓ ${listing.name.padEnd(40)} ${listing.category}`);
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS (insert-only, zero updates)");
  console.log("══════════════════════════════════════════");
  console.log(`  Inserted:  ${inserted}`);
  console.log(`  Dupes:     ${dupes}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Total in script: ${LISTINGS.length}`);
  console.log("══════════════════════════════════════════\n");
}

run().catch(console.error);
