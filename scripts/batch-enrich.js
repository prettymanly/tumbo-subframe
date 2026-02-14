/**
 * batch-enrich.js — Enrich all relevant placeholder classes in Supabase
 * 
 * Cleans names, normalizes categories, and generates content following
 * scripts/content-logic.md rules. Content is AI-generated (Tumbo editorial)
 * and can be refined later with real scraped data + Google Places.
 * 
 * Run: node scripts/batch-enrich.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Category normalization map ──
const CATEGORY_MAP = {
  "Music school": "Music",
  "Music": "Music",
  "Vocal instructor": "Music",
  "Dance school": "Dance",
  "Dance": "Dance",
  "Dance company": "Dance",
  "Ballet school": "Dance",
  "Art school": "Art",
  "Art center": "Art",
  "Art studio": "Art",
  "Arts & Crafts": "Art",
  "Arts organization": "Art",
  "Swimming school": "Swimming",
  "Swimming": "Swimming",
  "Swimming instructor": "Swimming",
  "Culinary school": "Cooking",
  "Cooking class": "Cooking",
  "Chinese": "Chinese",
  "Chinese language school": "Chinese",
  "Language school": "Languages",
  "Other Languages": "Languages",
  "English language school": "English",
  "English": "English",
  "Mathematics": "Mathematics",
  "Science": "Science",
  "Sports school": "Sports",
  "Sports": "Sports",
  "Badminton club": "Sports",
  "Kickboxing school": "Martial Arts",
  "Martial arts school": "Martial Arts",
  "Drama theater": "Drama",
  "Drama school": "Drama",
  "Speech & Drama": "Drama",
  "Performing arts theater": "Drama",
  "Gymnastics center": "Gymnastics",
  "Gymnastics club": "Gymnastics",
  "Chess instructor": "Chess",
  "Chess club": "Chess",
  "Kids Yoga": "Yoga",
  "Yoga studio": "Yoga",
  "Rock climbing gym": "Rock Climbing",
  "Rock climbing": "Rock Climbing",
  "Surf school": "Water Sports",
  "Roller skating rink": "Sports",
  "After school program": "Enrichment",
  "Holiday Camp Workshop": "Holiday Camp",
  "Fitness": "Sports",
  "Special education school": "Special Needs",
};

// ── Unsplash fallback images by normalized category ──
const CATEGORY_IMAGES = {
  Music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&q=80",
  Dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=640&q=80",
  Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&q=80",
  Swimming: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=640&q=80",
  Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=640&q=80",
  Chinese: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
  Languages: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
  English: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=640&q=80",
  Mathematics: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=640&q=80",
  Science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=640&q=80",
  Sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&q=80",
  "Martial Arts": "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=640&q=80",
  Drama: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=640&q=80",
  Gymnastics: "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=640&q=80",
  Chess: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&q=80",
  Yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=640&q=80",
  "Rock Climbing": "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=640&q=80",
  "Water Sports": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=640&q=80",
  Enrichment: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
  "Holiday Camp": "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=640&q=80",
  "Special Needs": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&q=80",
};

// ── Content templates per category ──
// Each category gets varied descriptions, vibe_lines, child_profiles, etc.
// The templates use {name} and {location} as placeholders

const CONTENT = {
  Music: {
    vibe_lines: [
      "where the rhythm finds them before they find the notes",
      "real music skills, taught at their pace",
      "less recital pressure, more genuine love for sound",
      "they'll hum the melodies long after class ends",
      "music made personal — not one-size-fits-all",
    ],
    descriptions: [
      "Classes at {name} focus on building a genuine love for music through hands-on practice and creative exploration. Students learn foundational techniques — rhythm, pitch, and basic music theory — while discovering their own musical voice.\n\nThe approach is encouraging rather than competitive: children progress at their own pace with regular check-ins rather than high-pressure assessments. Lessons are structured but leave room for improvisation and personal expression.\n\nLocated at {location}, the studio provides all instruments and materials. Parents are welcome to observe a trial session before committing to a term.",
      "At {name}, music education is about more than learning to play an instrument. Each session blends technical instruction with creative exercises that help children understand the language of music.\n\nTeachers focus on building both skill and confidence — children learn proper technique alongside the joy of making music with others. The programme is designed so every child, regardless of starting level, can feel progress within weeks.\n\nThe centre operates from {location}. Trial classes are available for new families wanting to experience the teaching style before enrolling.",
    ],
    summaries: [
      "Music classes for children focusing on technique, creativity, and a genuine love of music.",
      "Structured music programme building both technical skill and creative confidence.",
    ],
    child_profiles: [
      "Kids who light up around sound — whether they're humming, tapping, or just listening intently. Children who enjoy creative expression and aren't afraid to try something new.",
      "Musical children who want to explore beyond just following instructions. Kids who enjoy both solo practice and making music with others.",
    ],
    not_ideal: [
      "Children who need very high-energy, movement-based activities may find seated practice sessions challenging at first.",
      "Very restless kids might need a more physical outlet. Children expecting instant mastery may need patience as music skills build gradually.",
    ],
    outcomes: [
      "After a term, your child will be comfortable with basic musical concepts and can play simple pieces independently. They'll have developed better listening skills and a stronger sense of rhythm.",
      "By the end of a 10-week term, your child will demonstrate improved musical confidence, basic sight-reading, and the ability to perform a short piece for family.",
    ],
  },
  Dance: {
    vibe_lines: [
      "where the shy ones find their feet (literally)",
      "movement first, technique follows naturally",
      "not a recital factory — dance that feels like play",
      "rhythm, expression, and serious fun",
      "proper dance skills without the competitive edge",
    ],
    descriptions: [
      "Dance classes at {name} blend structured technique with creative movement, letting children develop coordination, rhythm, and self-expression at their own pace.\n\nSessions start with a warm-up that gets bodies moving and minds ready, followed by skills work tailored to the group's level. The teaching philosophy prioritises joy and confidence over perfection — mistakes are part of learning.\n\nBased at {location}, classes typically run in small groups. Parents can arrange a trial class to see if the style and energy are the right fit.",
      "At {name}, dance is taught as both an art and a physical discipline. Children learn proper technique — posture, alignment, and movement vocabulary — while encouraged to bring their own personality to each routine.\n\nThe programme builds progressively, with each term introducing new skills and choreography. End-of-term showcases are low-pressure celebrations of what students have learned, not competitive performances.\n\nClasses are held at {location}. Trial sessions available.",
    ],
    summaries: [
      "Dance classes building coordination, expression, and confidence through movement.",
      "Structured dance programme blending technique with creative expression for children.",
    ],
    child_profiles: [
      "Children who love to move — whether it's living-room dancing or playground cartwheels. Kids who thrive when given physical outlets for their energy and creativity.",
      "Active kids who respond well to music and rhythm. Children who enjoy performing or expressing themselves through movement.",
    ],
    not_ideal: [
      "Very shy children who are uncomfortable moving in front of others may need a few sessions to warm up. Kids who dislike structured routines might prefer a more free-form movement class.",
      "Children who need lots of verbal instruction rather than visual/physical learning may find the pace challenging at first.",
    ],
    outcomes: [
      "After a term, your child will show improved coordination and rhythm. They'll know basic dance vocabulary and be confident performing a short routine.",
      "By term end, expect noticeably better posture, body awareness, and the confidence to move expressively in front of others.",
    ],
  },
  Art: {
    vibe_lines: [
      "messy hands, proud faces — art the way it should be",
      "process over product, every single time",
      "where the quiet ones get loud with colour",
      "real art skills, taught without the pretension",
      "creativity encouraged, perfection not required",
    ],
    descriptions: [
      "Art classes at {name} focus on creative exploration and skill-building through a variety of media — painting, drawing, sculpting, and mixed media. Each session introduces new techniques while giving children freedom to experiment.\n\nThe teaching philosophy is process-focused: the emphasis is on creative thinking and experimentation, not producing a perfect final piece. Children learn to observe, express ideas visually, and talk about their work.\n\nLocated at {location}, all materials are provided. Classes run in small groups to ensure each child gets proper attention.",
      "{name} offers structured art education that balances technique with creative freedom. Children work with diverse materials — from watercolour and acrylic to clay, printmaking, and collage.\n\nEach lesson explores a different theme, artist, or technique, building a broad foundation of artistic skills. The environment is encouraging: children are praised for effort and ideas, not just results.\n\nThe studio is at {location}. Trial classes are available for families wanting to test the fit.",
    ],
    summaries: [
      "Creative art classes exploring multiple media with a focus on process and self-expression.",
      "Art education covering painting, drawing, sculpture, and mixed media for children.",
    ],
    child_profiles: [
      "Creative kids who love getting their hands dirty. Children who enjoy making things and showing what they've created. The gallery-style sharing builds quiet confidence.",
      "Kids who think in pictures and colours. Children who enjoy experimenting with materials and aren't afraid to make a mess.",
    ],
    not_ideal: [
      "Very structured children who prefer step-by-step instructions may find the open-ended approach frustrating initially. Kids who strongly dislike messy textures should try a trial first.",
      "Children who need constant movement may find extended seated art sessions challenging. Very competitive kids might struggle with a non-competitive creative environment.",
    ],
    outcomes: [
      "After a term, your child will be confident with multiple art techniques and materials. They'll talk about their creative choices and have a portfolio of original work to bring home.",
      "By term end, expect improved fine motor control, a broader artistic vocabulary, and genuine pride in their creative work.",
    ],
  },
  Swimming: {
    vibe_lines: [
      "proper technique, zero pressure — swimming at their pace",
      "water confidence first, speed later",
      "they'll actually enjoy swimming, not just survive it",
      "safe, patient instruction in the water",
      "strokes taught right, from the very start",
    ],
    descriptions: [
      "Swimming lessons at {name} prioritise water safety and confidence alongside proper stroke development. Classes follow a structured progression from basic water familiarisation to full stroke technique.\n\nInstructors are patient and encouraging — the goal is for every child to feel comfortable and capable in the water. Small class sizes ensure individual attention and safety.\n\nLessons take place at {location}. Trial sessions are available for new swimmers.",
      "At {name}, swimming is taught with a focus on building genuine water confidence. Children progress from basic skills — floating, kicking, breathing — to proper stroke technique at their own pace.\n\nThe programme follows recognised swimming standards, with clear milestones that children can work towards. Safety is always the priority, with qualified instructors and appropriate ratios.\n\nPool facilities are at {location}. Contact the school for current schedules and availability.",
    ],
    summaries: [
      "Swimming lessons building water confidence and proper stroke technique for children.",
      "Structured swimming programme from water safety basics to advanced stroke development.",
    ],
    child_profiles: [
      "Kids who love water play and are ready to learn proper skills. Children who respond well to patient, encouraging instruction.",
      "Any child needing water confidence or looking to refine their technique. Kids who enjoy physical challenges in a supportive environment.",
    ],
    not_ideal: [
      "Children with extreme water anxiety may need additional one-on-one sessions first. Kids who dislike getting their face wet will need extra patience at the start.",
      "Very restless children may find the waiting portions of group lessons challenging. Kids wanting competitive swim training should look for squad programmes.",
    ],
    outcomes: [
      "After a term, your child will demonstrate improved water confidence and at least one recognisable stroke. They'll understand basic water safety principles.",
      "By term end, expect your child to swim a short distance independently, demonstrate proper breathing technique, and show genuine comfort in the water.",
    ],
  },
  Cooking: {
    vibe_lines: [
      "tiny chefs, real recipes — actual food they can eat",
      "kitchen skills that stick (and taste good too)",
      "cooking with kids, minus the chaos",
      "messy, delicious, and secretly educational",
    ],
    descriptions: [
      "Cooking classes at {name} teach children real kitchen skills through age-appropriate recipes. Each session covers a different dish, with children learning practical techniques — measuring, mixing, chopping (with safe tools), and tasting.\n\nThe programme develops coordination, following instructions, and basic food science concepts. Every child leaves with something they've made themselves.\n\nClasses run at {location}. All ingredients and equipment are provided.",
    ],
    summaries: [
      "Hands-on cooking classes teaching real kitchen skills through age-appropriate recipes.",
    ],
    child_profiles: [
      "Kids who love food and aren't afraid to get messy. Children who enjoy following steps and seeing a tangible result at the end.",
    ],
    not_ideal: [
      "Children with severe food allergies need to check ingredient lists in advance. Very impatient kids may find waiting for food to cook challenging.",
    ],
    outcomes: [
      "After a term, your child will confidently handle basic kitchen tools, follow a simple recipe independently, and understand food safety basics.",
    ],
  },
  Chinese: {
    vibe_lines: [
      "mandarin that doesn't feel like homework",
      "real conversational Chinese, not just textbook drills",
      "where Chinese becomes a language they actually want to speak",
      "immersive Mandarin — less rote, more real",
    ],
    descriptions: [
      "Chinese language classes at {name} focus on building genuine Mandarin fluency through immersive, conversation-first teaching. Lessons blend speaking, listening, reading, and writing in ways that make Chinese feel relevant and fun.\n\nThe curriculum progresses from basic vocabulary and sentence patterns to more complex communication, with activities that encourage children to actually use the language.\n\nClasses are held at {location}. Placement assessments available for new students.",
    ],
    summaries: [
      "Immersive Chinese language classes building conversational fluency for children.",
    ],
    child_profiles: [
      "Children who need a more engaging approach to Chinese than school provides. Kids from bilingual families wanting to strengthen their Mandarin foundation.",
    ],
    not_ideal: [
      "Children who strongly resist Chinese language learning may need a different motivational approach first. Advanced speakers looking for exam prep should check the level match.",
    ],
    outcomes: [
      "After a term, your child will show measurable improvement in Chinese conversation, reading, or writing depending on their starting level.",
    ],
  },
  English: {
    vibe_lines: [
      "English that builds real communication skills, not just grammar rules",
      "reading, writing, speaking — made genuinely engaging",
      "where English becomes a tool, not a chore",
    ],
    descriptions: [
      "English classes at {name} develop strong communication skills through a balanced programme of reading, writing, and oral expression. The approach is engaging and practical, building skills children actually use.\n\nLessons are structured around age-appropriate themes, with activities that develop vocabulary, comprehension, and confident self-expression.\n\nLocated at {location}. Assessment available to ensure the right class level.",
    ],
    summaries: [
      "English language programme building strong reading, writing, and communication skills.",
    ],
    child_profiles: [
      "Children wanting to strengthen their English beyond school curriculum. Kids who enjoy reading and storytelling but need structured skill-building.",
    ],
    not_ideal: [
      "Children already advanced in English may not find enough challenge unless placed in a higher-level group.",
    ],
    outcomes: [
      "After a term, expect improved reading fluency, stronger written expression, and greater confidence in speaking and presenting ideas.",
    ],
  },
  Mathematics: {
    vibe_lines: [
      "maths that clicks — taught through understanding, not memorisation",
      "problem-solving skills that go way beyond the textbook",
      "where numbers start making actual sense",
    ],
    descriptions: [
      "Mathematics classes at {name} build genuine mathematical thinking through conceptual understanding and problem-solving. Instead of rote memorisation, students learn to think mathematically — understanding why methods work, not just how.\n\nThe curriculum is structured to build progressively, with plenty of hands-on activities and real-world applications that make abstract concepts concrete.\n\nBased at {location}. Diagnostic assessment available for new students.",
    ],
    summaries: [
      "Mathematics programme building conceptual understanding and problem-solving skills.",
    ],
    child_profiles: [
      "Children who want to genuinely understand maths rather than memorise procedures. Kids who enjoy puzzles and logical thinking.",
    ],
    not_ideal: [
      "Children looking purely for exam drilling may find the conceptual focus different from what they expect. Kids who need very fast-paced instruction should check the class level.",
    ],
    outcomes: [
      "After a term, your child will show stronger number sense, improved problem-solving strategies, and greater confidence approaching unfamiliar maths questions.",
    ],
  },
  Science: {
    vibe_lines: [
      "real experiments, real curiosity — science that sticks",
      "hands-on discovery, not textbook memorisation",
      "where 'why does that happen?' gets a proper answer",
    ],
    descriptions: [
      "Science classes at {name} bring concepts to life through hands-on experiments and guided discovery. Each session focuses on a different scientific topic, with children conducting real experiments and learning the scientific method.\n\nThe approach is inquiry-based: children ask questions, form hypotheses, test ideas, and discuss findings. It's science as exploration, not rote learning.\n\nClasses run at {location}. All materials and lab equipment are provided.",
    ],
    summaries: [
      "Hands-on science classes with real experiments building scientific thinking and curiosity.",
    ],
    child_profiles: [
      "Naturally curious children who always ask 'why?' and 'how?' Kids who enjoy experiments, making observations, and discovering how things work.",
    ],
    not_ideal: [
      "Children who prefer neat, predictable activities may find experiments messy or unpredictable. Kids who need lots of movement may find observation periods challenging.",
    ],
    outcomes: [
      "After a term, your child will demonstrate scientific thinking — forming hypotheses, conducting experiments, and explaining their observations using proper vocabulary.",
    ],
  },
  Sports: {
    vibe_lines: [
      "skills and fitness, built through genuine fun",
      "proper coaching without the pressure",
      "where sport is about the child, not the trophy",
    ],
    descriptions: [
      "Sports programmes at {name} develop physical skills, fitness, and sportsmanship through structured coaching and play. Sessions balance skill development with game play, ensuring children improve while having genuine fun.\n\nCoaches focus on proper technique and positive encouragement, building both ability and confidence.\n\nTraining takes place at {location}. Trial sessions available for new participants.",
    ],
    summaries: [
      "Sports coaching building physical skills, fitness, and sportsmanship for children.",
    ],
    child_profiles: [
      "Active kids who love physical challenges. Children who enjoy team environments and respond well to coaching and encouragement.",
    ],
    not_ideal: [
      "Very shy children in large group sports may need smaller classes first. Kids who dislike competitive environments should check if the programme has a non-competitive track.",
    ],
    outcomes: [
      "After a term, expect improved physical coordination, sport-specific skills, and better understanding of teamwork and sportsmanship.",
    ],
  },
  "Martial Arts": {
    vibe_lines: [
      "discipline and confidence, taught through respect",
      "self-defence skills that build character too",
      "structured, focused, and quietly transformative",
    ],
    descriptions: [
      "Martial arts training at {name} builds discipline, focus, and physical fitness alongside self-defence skills. Classes follow a progressive belt system, with each level introducing new techniques and concepts.\n\nThe philosophy emphasises respect, self-control, and perseverance. Students learn that martial arts is about personal growth, not aggression.\n\nTraining at {location}. Trial classes available for beginners.",
    ],
    summaries: [
      "Martial arts training building discipline, fitness, and self-confidence for children.",
    ],
    child_profiles: [
      "Children who need a structured outlet for their energy. Kids who respond well to clear expectations, routines, and visible progress through belt rankings.",
    ],
    not_ideal: [
      "Very timid children may find sparring elements intimidating initially. Kids who resist structure and discipline may need time to adjust to the format.",
    ],
    outcomes: [
      "After a term, your child will demonstrate improved focus, basic self-defence skills, and noticeably better self-discipline and body control.",
    ],
  },
  Drama: {
    vibe_lines: [
      "where the quiet ones find their voice",
      "storytelling, confidence, and real stage skills",
      "drama that builds life skills, not just acting chops",
    ],
    descriptions: [
      "Drama classes at {name} develop communication skills, confidence, and creative expression through performance and storytelling. Children learn acting techniques alongside public speaking, improvisation, and collaborative storytelling.\n\nThe programme builds progressively, culminating in informal showcases where students share their work. The environment is supportive and encourages risk-taking.\n\nClasses at {location}. Trial sessions available.",
    ],
    summaries: [
      "Drama and speech classes building confidence, communication skills, and creative expression.",
    ],
    child_profiles: [
      "Expressive children who love storytelling and imaginative play. Shy kids who need a safe space to practice speaking up — drama classes are often transformative for them.",
    ],
    not_ideal: [
      "Children who are deeply uncomfortable with any form of performance may need gentle encouragement first. Very physically active kids may find dialogue-heavy sessions challenging.",
    ],
    outcomes: [
      "After a term, expect stronger public speaking skills, improved confidence in group settings, and the ability to express ideas clearly and creatively.",
    ],
  },
  Gymnastics: {
    vibe_lines: [
      "flips, balance, and genuine body confidence",
      "strength and flexibility, built through play",
      "proper gymnastics skills in a safe, fun environment",
    ],
    descriptions: [
      "Gymnastics classes at {name} develop strength, flexibility, coordination, and body awareness through progressive skill-building. Children learn fundamental gymnastics skills — rolls, balances, vaults, and tumbling — in a safe, supervised environment.\n\nClasses are structured to build progressively, with each child advancing at their own pace. The focus is on proper technique and safety.\n\nFacilities at {location}. Trial sessions available.",
    ],
    summaries: [
      "Gymnastics classes building strength, coordination, and body confidence for children.",
    ],
    child_profiles: [
      "Physical, energetic children who love climbing, jumping, and testing their bodies. Kids who enjoy challenges and visible progress.",
    ],
    not_ideal: [
      "Children with strong fear of heights or being upside down will need gradual exposure. Very cautious kids may need extra time with basic skills before advancing.",
    ],
    outcomes: [
      "After a term, your child will show improved balance, core strength, and basic gymnastics skills. They'll demonstrate greater body awareness and physical confidence.",
    ],
  },
  Chess: {
    vibe_lines: [
      "where thinking ahead becomes second nature",
      "strategic thinking skills that transfer to everything",
      "chess made engaging — not stuffy or intimidating",
    ],
    descriptions: [
      "Chess classes at {name} develop strategic thinking, problem-solving, and concentration through structured lessons and practice games. Students learn openings, tactics, and endgame strategy while developing patience and sportsmanship.\n\nClasses are grouped by ability, ensuring appropriate challenge levels. The environment is encouraging, with emphasis on learning from mistakes.\n\nBased at {location}. Assessment available for placement.",
    ],
    summaries: [
      "Chess instruction building strategic thinking, concentration, and problem-solving skills.",
    ],
    child_profiles: [
      "Analytical children who enjoy puzzles and strategy. Kids who are patient enough to think before acting and enjoy mental challenges.",
    ],
    not_ideal: [
      "Very physically active children who need constant movement may find seated chess sessions challenging. Kids who get frustrated by losing may need sportsmanship support.",
    ],
    outcomes: [
      "After a term, your child will understand fundamental chess strategy, recognise common tactical patterns, and demonstrate improved concentration and forward planning.",
    ],
  },
  Yoga: {
    vibe_lines: [
      "calm bodies, focused minds — yoga sized for kids",
      "mindfulness and movement in one gentle package",
      "flexibility and focus, without the pressure",
    ],
    descriptions: [
      "Kids' yoga classes at {name} combine movement, breathing exercises, and mindfulness in age-appropriate sessions. Children learn yoga poses, relaxation techniques, and body awareness through playful, themed activities.\n\nThe approach is gentle and non-competitive, focusing on each child's individual progress. Sessions help develop flexibility, strength, and emotional regulation.\n\nClasses at {location}. Trial sessions available.",
    ],
    summaries: [
      "Kids' yoga combining movement, breathing, and mindfulness for physical and emotional development.",
    ],
    child_profiles: [
      "Children who benefit from calm-down strategies. Kids with lots of energy who need help learning to self-regulate, and quieter children who enjoy gentle movement.",
    ],
    not_ideal: [
      "Very high-energy children who need intense physical activity may find the pace too slow initially. Kids who resist quiet or still moments may need adjustment time.",
    ],
    outcomes: [
      "After a term, your child will know basic yoga poses, demonstrate improved flexibility, and have practical breathing and calming techniques they can use independently.",
    ],
  },
  "Rock Climbing": {
    vibe_lines: [
      "vertical problem-solving that builds real grit",
      "climb higher, think harder, fear less",
      "physical challenge that's also a mental workout",
    ],
    descriptions: [
      "Climbing programmes at {name} teach technical climbing skills alongside problem-solving and perseverance. Children learn proper climbing technique, safety, and route-reading in a controlled indoor environment.\n\nThe sport naturally builds upper body strength, coordination, and mental resilience. Instructors encourage children to push their limits safely.\n\nFacilities at {location}. Introductory sessions available for beginners.",
    ],
    summaries: [
      "Indoor rock climbing building physical strength, problem-solving, and mental resilience.",
    ],
    child_profiles: [
      "Adventurous, physical children who love challenges. Kids who enjoy problem-solving with their bodies and aren't easily discouraged.",
    ],
    not_ideal: [
      "Children with a strong fear of heights may need gradual exposure starting with very low walls. Kids who don't enjoy physical exertion may find climbing tiring.",
    ],
    outcomes: [
      "After a term, your child will confidently climb beginner-intermediate routes, demonstrate proper safety techniques, and show noticeably improved upper body strength.",
    ],
  },
  Languages: {
    vibe_lines: [
      "a new language learned through conversation, not textbooks",
      "immersive language skills for curious young minds",
    ],
    descriptions: [
      "Language classes at {name} build fluency through conversation-first teaching. Children learn through immersive activities, stories, and games that make the language feel natural and relevant.\n\nThe programme develops all four skills — listening, speaking, reading, and writing — with emphasis on practical communication.\n\nBased at {location}. Placement assessment available.",
    ],
    summaries: [
      "Language classes building conversational fluency through immersive, engaging activities.",
    ],
    child_profiles: [
      "Curious children interested in other cultures and languages. Kids from multilingual families wanting to strengthen a specific language.",
    ],
    not_ideal: [
      "Children who strongly resist language learning may need a motivational approach first.",
    ],
    outcomes: [
      "After a term, your child will demonstrate measurable improvement in conversation, vocabulary, and confidence using the target language.",
    ],
  },
  "Water Sports": {
    vibe_lines: [
      "waves, boards, and genuine ocean confidence",
      "water skills that go beyond the pool",
    ],
    descriptions: [
      "Water sports programmes at {name} teach ocean and water skills in a safe, structured environment. Children develop water confidence, physical fitness, and respect for the water through hands-on instruction.\n\nSafety is always the priority, with qualified instructors and appropriate equipment for all skill levels.\n\nActivities at {location}. Trial sessions available for new participants.",
    ],
    summaries: [
      "Water sports instruction building water confidence, fitness, and ocean awareness.",
    ],
    child_profiles: [
      "Adventurous children who love being in and around water. Kids who enjoy physical challenges and the outdoors.",
    ],
    not_ideal: [
      "Children who are not yet comfortable in water should build basic swimming skills first.",
    ],
    outcomes: [
      "After a term, your child will demonstrate improved water confidence, basic sport-specific skills, and a solid understanding of water safety.",
    ],
  },
  Enrichment: {
    vibe_lines: [
      "learning that feels nothing like school",
      "skills and confidence built through genuine engagement",
    ],
    descriptions: [
      "The enrichment programme at {name} provides structured learning in a supportive, engaging environment. Activities are designed to complement school education while developing broader skills — critical thinking, creativity, and social confidence.\n\nClasses blend academic support with enrichment activities, ensuring children develop both intellectually and socially.\n\nLocated at {location}. Trial sessions available.",
    ],
    summaries: [
      "After-school enrichment programme building academic skills and social confidence.",
    ],
    child_profiles: [
      "Children who benefit from structured support beyond school hours. Kids who enjoy learning in smaller, more personal settings.",
    ],
    not_ideal: [
      "Children who are already over-scheduled may find additional after-school commitments tiring.",
    ],
    outcomes: [
      "After a term, expect improved study habits, stronger foundational skills, and greater confidence in academic settings.",
    ],
  },
  "Holiday Camp": {
    vibe_lines: [
      "school holidays spent actually learning something fun",
      "camp vibes with genuine skill-building baked in",
    ],
    descriptions: [
      "Holiday programmes at {name} keep children engaged and learning during school breaks. Each camp session centres on a specific theme, blending structured activities with creative exploration and social time.\n\nThe format keeps kids active and stimulated without the intensity of regular term-time classes. It's a great way to try something new in a relaxed environment.\n\nCamps run at {location}. Registration typically opens a few weeks before each school holiday.",
    ],
    summaries: [
      "Holiday camp programmes combining themed activities, creative exploration, and social fun.",
    ],
    child_profiles: [
      "Children who get bored during school holidays. Kids who enjoy trying new activities and meeting other children in a camp setting.",
    ],
    not_ideal: [
      "Children who need lots of routine and familiarity may find the changing daily activities unsettling. Very shy kids may take a day or two to settle in.",
    ],
    outcomes: [
      "After a camp week, your child will have explored new skills, made new friends, and come home genuinely excited about something they learned.",
    ],
  },
  "Special Needs": {
    vibe_lines: [
      "learning tailored to how they learn best",
      "inclusive education that meets every child where they are",
    ],
    descriptions: [
      "Programmes at {name} are designed to support children with diverse learning needs. The approach is individualised, with trained educators who adapt teaching methods to each child's strengths and challenges.\n\nSmall class sizes ensure proper attention and a supportive environment. The focus is on building skills and confidence at each child's own pace.\n\nFacilities at {location}. Consultation available to discuss your child's specific needs.",
    ],
    summaries: [
      "Specialist education programmes supporting children with diverse learning needs.",
    ],
    child_profiles: [
      "Children with learning differences who benefit from specialised support and smaller class environments.",
    ],
    not_ideal: [
      "Families should verify the specific specialisations match their child's needs, as not all learning differences are covered by every programme.",
    ],
    outcomes: [
      "After a term, expect measurable progress in targeted skill areas, with detailed feedback from educators on your child's development.",
    ],
  },
};

// ── Name cleaning ──
function cleanClassName(rawName, providerName, category) {
  // Strip "Category at " prefix pattern
  // e.g., "Music school at Academy of Rock" → "Academy of Rock"
  const patterns = [
    /^[\w\s&/]+\s+at\s+/i,  // "Music school at ..."
  ];
  
  let name = rawName;
  for (const p of patterns) {
    name = name.replace(p, "");
  }
  
  // If the name is just the provider name, create a proper class name
  if (name.trim().toLowerCase() === providerName?.trim().toLowerCase()) {
    return providerName.trim();
  }
  
  return name.trim();
}

// ── Pick from array with some variation ──
function pick(arr, seed) {
  return arr[seed % arr.length];
}

// ── Generate enriched data for a class ──
function generateEnrichment(cls, provider, index) {
  const normalizedCat = CATEGORY_MAP[cls.category] || "Enrichment";
  const templates = CONTENT[normalizedCat] || CONTENT["Enrichment"];
  const providerName = provider?.name || "the provider";
  const location = cls.location || "their studio";
  
  // Clean the name
  const cleanedName = cleanClassName(cls.name, providerName, cls.category);
  
  // Generate content using templates + variations
  const desc = pick(templates.descriptions, index)
    .replace(/\{name\}/g, providerName)
    .replace(/\{location\}/g, location);
  
  const summary = pick(templates.summaries, index);
  const vibeLine = pick(templates.vibe_lines, index);
  const childProfile = pick(templates.child_profiles, index);
  const notIdeal = pick(templates.not_ideal, index);
  const outcome = pick(templates.outcomes, index);
  const photo = CATEGORY_IMAGES[normalizedCat] || CATEGORY_IMAGES["Enrichment"];
  
  return {
    name: cleanedName,
    category: normalizedCat,
    vibe_line: vibeLine,
    description: desc,
    summary: summary,
    photo_url: photo,
    typical_child_profile: childProfile,
    not_ideal_for: notIdeal,
    outcome_expectations: outcome,
    is_placeholder: false,
    discovered_from: JSON.stringify({
      description: ["Tumbo editorial"],
      vibe_line: ["Tumbo editorial"],
      child_profile: ["Tumbo editorial"],
      outcomes: ["Tumbo editorial"],
    }),
  };
}

// ── Main ──
async function run() {
  console.log("🔍 Fetching relevant placeholder classes...");
  
  const relevantCategories = Object.keys(CATEGORY_MAP);
  
  const { data: classes, error: classErr } = await sb
    .from("classes")
    .select("id, name, provider_id, category, location, age_min, age_max, price")
    .eq("is_placeholder", true)
    .in("category", relevantCategories);
  
  if (classErr) {
    console.error("Error fetching classes:", classErr);
    return;
  }
  
  console.log(`Found ${classes.length} relevant placeholder classes`);
  
  // Fetch all providers for lookup
  console.log("📦 Fetching providers...");
  const { data: providers } = await sb.from("providers").select("id, name, website");
  const providerMap = {};
  for (const p of providers || []) {
    providerMap[p.id] = p;
  }
  
  // Process in batches
  const BATCH_SIZE = 50;
  let updated = 0;
  let errors = 0;
  
  for (let i = 0; i < classes.length; i += BATCH_SIZE) {
    const batch = classes.slice(i, i + BATCH_SIZE);
    
    for (let j = 0; j < batch.length; j++) {
      const cls = batch[j];
      const provider = cls.provider_id ? providerMap[cls.provider_id] : null;
      const enrichment = generateEnrichment(cls, provider, i + j);
      
      const { error } = await sb
        .from("classes")
        .update(enrichment)
        .eq("id", cls.id);
      
      if (error) {
        errors++;
        if (errors <= 5) console.error(`  ✗ Error updating ${cls.name}:`, error.message);
      } else {
        updated++;
      }
    }
    
    console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${updated} updated, ${errors} errors`);
  }
  
  console.log(`\n✅ Done! Updated ${updated} classes (${errors} errors)`);
  console.log(`Total enriched classes now: 24 (manual) + ${updated} (batch) = ${24 + updated}`);
}

run().catch(console.error);
