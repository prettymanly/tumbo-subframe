/**
 * Seed 9 hand-picked listings (7 new + 2 updates)
 * These are nuanced, philosophy-driven classes that embody Tumbo's positioning.
 *
 * Usage: node scripts/seed-handpicked-9.js [--dry-run]
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DRY_RUN = process.argv.includes("--dry-run");

// ── New providers ──
const NEW_PROVIDERS = [
  {
    id: randomUUID(),
    name: "Your Prologue",
    bio: "Creative writing and storytelling workshops for children who have stories to tell but need someone to believe they can tell them.",
    website: "https://www.instagram.com/yourprologue.sg",
    teaching_philosophy: "Every child has a story. We help them find the courage to tell it — through creative writing, storytelling, and self-expression in a judgment-free space.",
  },
  {
    id: randomUUID(),
    name: "First Principles Education",
    bio: "Teaching children how to learn — so they never need tuition again. Study skills mentoring backed by neuroscience and AI.",
    website: "https://firstprinciples.com.sg",
    teaching_philosophy: "We don't teach subjects. We teach learning itself. Our C.H.E.A.T Method (Consistent Habits Enforced Active Tracking) builds self-directed learners who understand their own study patterns.",
  },
  {
    id: randomUUID(),
    name: "Arabic Comes Alive",
    bio: "Arabic language through wonder and play — for children who want to fall in love with the language, not just memorise it.",
    website: "https://www.instagram.com/arabic_comes_alive",
    teaching_philosophy: "Language is culture, not curriculum. We bring Arabic alive through stories, songs, art, and conversation — so children connect with the language emotionally, not just academically.",
  },
  {
    id: randomUUID(),
    name: "Skate Edu",
    bio: "Skateboarding education that builds grit, resilience, and self-belief — one fall at a time.",
    website: "https://www.instagram.com/skateedu",
    teaching_philosophy: "Every fall is practice for getting back up. Skateboarding teaches children that failure is part of mastery — a lesson most classrooms can't offer.",
  },
  {
    id: randomUUID(),
    name: "SG Venus Flytrap",
    bio: "Carnivorous plant workshops and nature education. Born from a biotech breakthrough by a JC2 student who tropicalized temperate plants for Singapore's climate.",
    website: "https://www.sgvenusflytrap.com",
    teaching_philosophy: "Nature is the best teacher. Our workshops let children touch, observe, and build — turning curiosity about the natural world into hands-on scientific thinking.",
  },
  {
    id: randomUUID(),
    name: "Gakken Learning Centre",
    bio: "Japanese-method enrichment centre blending traditional education with modern techniques. Maths, Science, and Programming with a focus on invisible skills.",
    website: "https://gakken.com.sg",
    teaching_philosophy: "Education should develop both visible skills (test scores) and invisible skills (logical thinking, curiosity, resilience). Founded in Japan in 1947, we believe thinking matters more than memorising.",
  },
  {
    id: randomUUID(),
    name: "Gosh! Kids",
    bio: "Creative arts school teaching photography, art, and visual storytelling to children aged 6-16. Founded by professional photographers.",
    website: "https://www.goshkids.org",
    teaching_philosophy: "In an AI world, human creativity is the ultimate skill. We transform children from passive consumers into active creators — seeing the world through their own lens.",
  },
];

// ── Build class entries ──
function buildClasses(providers) {
  const pMap = {};
  for (const p of providers) pMap[p.name] = p.id;

  return [
    // ── 1. Your Prologue (NEW) ──
    {
      id: randomUUID(),
      name: "Your Prologue",
      provider_id: pMap["Your Prologue"],
      vibe_line: "Where your child's imagination becomes their superpower — stories that build confidence one word at a time",
      summary: "Creative writing and storytelling workshops for children who have big ideas but need someone to believe they can express them.",
      description: "Your Prologue is a creative writing and storytelling workshop designed for children who love stories — whether they're the quiet ones scribbling in notebooks or the loud ones who narrate everything. Through structured yet playful sessions, children learn to craft narratives, find their voice, and build the confidence to share their ideas with the world. This isn't about grammar drills or composition marks. It's about helping your child discover that their perspective matters and their stories deserve to be heard.",
      age_min: 5,
      age_max: 12,
      category: "Creative Writing",
      location: "Singapore",
      typical_child_profile: "The child who is always making up stories, drawing comics, or narrating elaborate games. Also great for the quiet child who has a rich inner world but struggles to express it in school settings.",
      not_ideal_for: "Children looking for exam-focused English tuition or PSLE composition prep.",
      outcome_expectations: "Improved creative confidence, storytelling ability, vocabulary growth, and the courage to share ideas publicly. Many children find their writing voice here.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
    // ── 2. First Principles Education (NEW) ──
    {
      id: randomUUID(),
      name: "First Principles Education",
      provider_id: pMap["First Principles Education"],
      vibe_line: "Teaching your child how to learn — so they never need tuition again",
      summary: "Study skills mentoring backed by neuroscience and AI. For disheartened students who've lost confidence in their own ability to learn.",
      description: "First Principles Education isn't tuition — it's the opposite of tuition. Instead of teaching subjects, they teach learning itself. Their C.H.E.A.T Method (Consistent Habits Enforced Active Tracking) uses neuroscience research and AI tools to help students understand their own study patterns, build memory skills, manage exam stress, and develop the self-discipline to study independently. Supported by Enterprise Singapore, their approach has shown success in government schools. For the parent who's tired of the tuition treadmill and wants their child to become a confident, independent learner.",
      age_min: 9,
      age_max: 16,
      category: "Enrichment",
      location: "Singapore (Online 1-on-1 sessions)",
      price: null,
      typical_child_profile: "The student who is bright but disorganised. The one who 'doesn't know how to study' despite hours at the desk. The child who has lost confidence after poor results and thinks they're 'just not smart enough.'",
      not_ideal_for: "Children who need subject-specific content tutoring (this is methodology, not syllabus). Very young children under 9.",
      outcome_expectations: "Self-directed study habits, improved memory and note-making skills, better time management, reduced exam anxiety, and — most importantly — the belief that they can learn anything on their own.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
    // ── 3. Arabic Comes Alive (NEW) ──
    {
      id: randomUUID(),
      name: "Arabic Comes Alive",
      provider_id: pMap["Arabic Comes Alive"],
      vibe_line: "Arabic through wonder and play — for children who want to fall in love with the language, not just memorise it",
      summary: "Joyful Arabic language enrichment that connects children to the beauty of the language through stories, songs, and culture — not rote memorisation.",
      description: "Arabic Comes Alive takes a different approach to Arabic language learning. Instead of drilling vocabulary lists and grammar rules, children experience Arabic as a living, breathing language — through storytelling, songs, art projects, and cultural immersion. This is for the family that wants their child to genuinely love Arabic, to feel the music and poetry of the language, whether for heritage connection, Islamic enrichment, or pure curiosity. No textbooks. No tests. Just a child falling in love with one of the world's most beautiful languages.",
      age_min: 4,
      age_max: 12,
      category: "Arabic Language",
      location: "Singapore",
      typical_child_profile: "Children from families who want Arabic language exposure beyond Madrasah or formal Islamic schooling. Mixed-heritage families. Children who respond better to creative, play-based learning than structured classroom drilling.",
      not_ideal_for: "Families looking for formal Arabic exam preparation or Madrasah entry test prep.",
      outcome_expectations: "Basic Arabic vocabulary and phrases learned through joy rather than obligation. Cultural connection to the Arabic-speaking world. Confidence to use Arabic in everyday life.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
    // ── 4. Skate Edu (NEW) ──
    {
      id: randomUUID(),
      name: "Skate Edu",
      provider_id: pMap["Skate Edu"],
      vibe_line: "Every fall is practice for getting back up — skateboarding that builds grit, not just tricks",
      summary: "Skateboarding education that teaches children resilience, body awareness, and the quiet confidence that comes from mastering something hard.",
      description: "Skate Edu isn't just teaching kickflips. It's using skateboarding as a vehicle for life skills — resilience after failure, body awareness, spatial intelligence, and the deep satisfaction of mastering something genuinely difficult. In a world of instant gratification, skateboarding is one of the few activities where falling down is literally part of the curriculum. Children learn that failure isn't something to avoid — it's the path to getting good at anything.",
      age_min: 5,
      age_max: 14,
      category: "Skateboarding",
      location: "Singapore",
      typical_child_profile: "The child who needs to move. The one who gets restless in chairs. Children who respond better to physical challenges than academic ones. Also great for the perfectionist child who needs to learn that failure is okay.",
      not_ideal_for: "Children with significant fear of physical activity or injury anxiety (though coaches are trained to build confidence gradually).",
      outcome_expectations: "Basic skateboarding skills, improved balance and coordination, physical confidence, resilience after falls, and the self-belief that comes from doing something hard.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
    // ── 5. SG Venus Flytrap (NEW) ──
    {
      id: randomUUID(),
      name: "SG Venus Flytrap Nature Workshop",
      provider_id: pMap["SG Venus Flytrap"],
      vibe_line: "When your child asks 'why' about everything — a garden that answers back",
      summary: "Hands-on carnivorous plant workshops where children touch, build, and discover — born from a student's biotech breakthrough.",
      description: "SG Venus Flytrap was born from a remarkable story: a JC2 student who used Gene Re-expression technology to tropicalize cold-growing carnivorous plants for Singapore's climate — a genuine biotech breakthrough. Now they share that wonder with children through hands-on workshops where kids tour a garden of carnivorous plants, learn how each species hunts its prey, and build their own terrarium to take home. This isn't a sanitised nature lesson — children touch the plants, watch them move, and ask the kinds of 'why' questions that don't have easy answers.",
      age_min: 4,
      age_max: 12,
      category: "Nature & Science",
      location: "Midview City, Singapore",
      typical_child_profile: "The endlessly curious child. The one who brings bugs home and wants to know how everything works. Children who learn better through touching and doing than sitting and listening.",
      not_ideal_for: "Children who strongly dislike insects or being outdoors (though many overcome this during the workshop).",
      outcome_expectations: "Basic botany knowledge, terrarium-building skills, scientific observation habits, and the kind of wonder about the natural world that sticks with them.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
    // ── 6. Gakken Learning Centre (NEW) ──
    {
      id: randomUUID(),
      name: "Gakken Learning Centre",
      provider_id: pMap["Gakken Learning Centre"],
      vibe_line: "The Japanese way of learning — where thinking matters more than memorising",
      summary: "Japanese-method enrichment in Maths, Science, and Programming. Building invisible skills — logical thinking, curiosity, and resilience — alongside visible results.",
      description: "Gakken has been quietly shaping how children learn since 1947 in Japan, and now they're in Singapore. Unlike typical tuition centres that drill for exams, Gakken's method develops what they call 'invisible skills' — logical thinking, problem-solving intuition, and the ability to approach unfamiliar problems with confidence. Their Maths, Science, and Programming classes blend traditional Japanese educational rigour with modern techniques. The result is children who don't just score well, but who actually understand why things work the way they do.",
      age_min: 5,
      age_max: 14,
      category: "Enrichment",
      location: "#04-01, Cineleisure, 8 Grange Road, Singapore 239695",
      price: 180,
      typical_child_profile: "Children who are capable but need structure. The child who can do well but hasn't found the right method yet. Also suits the naturally curious child who wants to understand the 'why' behind maths and science, not just memorise formulas.",
      not_ideal_for: "Children looking for last-minute exam cramming or purely creative, unstructured enrichment.",
      outcome_expectations: "Stronger mathematical intuition, scientific reasoning ability, basic programming skills, and — crucially — the confidence to tackle unfamiliar problems without panicking.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
    // ── 7. Gosh! Kids (NEW) ──
    {
      id: randomUUID(),
      name: "Gosh! Kids",
      provider_id: pMap["Gosh! Kids"],
      vibe_line: "Turning screen time into seeing time — your child's world through their own lens",
      summary: "Photography and creative arts for ages 6-16. Founded by professional photographers who believe human creativity is the ultimate skill in an AI world.",
      description: "Gosh! Kids is what happens when professional photographers build a school for children. Co-founders Gladys Soh and Mathieu Beth Tan don't just teach kids to take photos — they teach them to see. Through photography boot camps, 1-to-1 mentorship, art workshops, and overseas creative-culture camps (Java, Taipei, Jeju, Chiang Mai, Okinawa), children learn to observe the world with intent, tell visual stories, and build a creative portfolio that's genuinely their own. In a world drowning in content, Gosh! Kids teaches children to be creators, not consumers.",
      age_min: 6,
      age_max: 16,
      category: "Art",
      location: "Near Eunos MRT, Singapore",
      typical_child_profile: "The child who's always on their phone camera. The one who notices things others miss. Children who are visually creative but haven't found their medium yet. Also great for teenagers looking for creative expression beyond academics.",
      not_ideal_for: "Very young children under 6 (they need fine motor skills for camera handling). Children expecting passive entertainment — this is active creation.",
      outcome_expectations: "Photography skills, visual storytelling ability, creative confidence, a personal portfolio, and for mentorship students — a body of work they can be proud of.",
      is_placeholder: false,
      hidden_from_directory: false,
    },
  ];
}

// ── Updates for existing entries ──
const UPDATES = [
  {
    id: "7cb2754f-a99b-4ec9-9d42-e7b3451c7eb5", // Pineapple MMA
    vibe_line: "Where your child's wild energy isn't a problem — it's the whole point",
    summary: "World-class martial arts in an anti-ego gym. Founded by a dad who wanted his daughter to learn that strength comes with respect.",
    description: "Pineapple MMA is not your typical martial arts gym. Founded in 2022 by Nigel Smith — an Australian expat, former professional basketball player turned finance lawyer — because he wanted a space where his daughter could train martial arts without the toxic masculinity that plagues many gyms. The result is a world-class facility with coaches who've trained UFC and ONE Championship fighters, but with a zero-tolerance policy on ego, angry sparring, and bullying. Kids (5-13) learn Muay Thai, Boxing, and Brazilian Jiu-Jitsu in meticulously structured classes that use imaginative warm-ups ('bear crawls', 'spider walks') and focus on technique over aggression. Head BJJ instructor Yuri Simoes is a three-time ADCC World Champion teaching full-time in Singapore.",
    age_min: 5,
    age_max: 13,
    location: "1 Selegie Road, #B1-13, GR.iD, Singapore 188306",
    price: 50,
    google_rating: 4.9,
    review_count: 135,
    typical_child_profile: "The high-energy child who needs a physical outlet with structure. Children who respond to discipline when it comes with respect. The shy child who needs to find their physical confidence. Also great for kids fascinated by martial arts but whose parents worry about aggressive gym culture.",
    not_ideal_for: "Children expecting a purely recreational play session — classes are structured and technique-focused. Very young children under 5.",
    outcome_expectations: "Self-defense skills, physical coordination, discipline, respect for others, and the quiet confidence that comes from knowing you can handle yourself. Many parents report improved behaviour and focus at school.",
    best_parent_quote: "The coaching level is incredibly high, but it's also the friendliest environment — zero ego, personalised attention regardless of skill level.",
  },
  {
    id: "7074445a-4a23-4ee5-b508-89a8436ac60e", // The Mindful Camp
    vibe_line: "For the child who feels everything deeply — tools to turn big emotions into quiet strength",
    summary: "Singapore's most trusted holiday camp for emotional resilience. 5-day programmes blending mindfulness, SEL, and adventure — founded by a psychotherapist.",
    description: "The Mindful Camp was founded in 2013 by Dawn Sim, a practicing psychotherapist and mindfulness practitioner, who noticed a gap: Singapore's holiday camps were all about academics and skills, with nothing for the child's emotional world. Her 5-day camps (Camp River for 5-7, Camp Mountain for 8-12) blend Social-Emotional Learning with brain-enhancing exercises, nature exploration, swimming, cooking, painting, and mindfulness practices. The result is children who leave with real tools to manage their emotions, build resilience, and navigate friendships — not just a sunburn and a craft project.",
    age_min: 5,
    age_max: 12,
    location: "Sprout Hub & Goodman Arts Centre, Singapore",
    typical_child_profile: "The sensitive child who feels everything deeply. The anxious child who needs coping tools. The child going through a transition (new school, divorce, friendship problems). Also wonderful for emotionally healthy children who would benefit from deepening their self-awareness.",
    not_ideal_for: "Children looking for academic enrichment or sports-focused camps. Not a substitute for therapy for children with serious mental health needs.",
    outcome_expectations: "Emotional vocabulary, mindfulness techniques they'll actually use, improved self-regulation, stronger friendships, and the understanding that big feelings aren't a problem to fix — they're information to learn from.",
    best_parent_quote: "My daughter came home with actual tools for managing her anxiety. Not platitudes — real techniques she uses daily.",
  },
];

// Also hide the duplicate Mindful Camp entry
const HIDE_DUPLICATES = [
  "dd722b62-2419-437f-b4e1-7d0dec73ed35", // "Children's club at The Mindful Camp" — duplicate
];

async function main() {
  console.log(`\n${DRY_RUN ? "[DRY RUN]" : "[LIVE]"} Seeding 9 hand-picked listings...\n`);

  // 1. Insert new providers
  console.log("── Inserting 7 new providers ──");
  for (const p of NEW_PROVIDERS) {
    console.log(`  + ${p.name}`);
    if (!DRY_RUN) {
      const { error } = await sb.from("providers").insert(p);
      if (error) console.log(`    ERROR: ${error.message}`);
    }
  }

  // 2. Insert new classes
  const classes = buildClasses(NEW_PROVIDERS);
  console.log(`\n── Inserting ${classes.length} new classes ──`);
  for (const c of classes) {
    console.log(`  + ${c.name} (${c.category}) — "${c.vibe_line.slice(0, 60)}..."`);
    if (!DRY_RUN) {
      const { error } = await sb.from("classes").insert(c);
      if (error) console.log(`    ERROR: ${error.message}`);
    }
  }

  // 3. Update existing entries
  console.log(`\n── Updating ${UPDATES.length} existing classes ──`);
  for (const u of UPDATES) {
    const { id, ...fields } = u;
    console.log(`  ~ ${id} — "${fields.vibe_line.slice(0, 60)}..."`);
    if (!DRY_RUN) {
      const { error } = await sb.from("classes").update(fields).eq("id", id);
      if (error) console.log(`    ERROR: ${error.message}`);
    }
  }

  // 4. Hide duplicates
  if (HIDE_DUPLICATES.length > 0) {
    console.log(`\n── Hiding ${HIDE_DUPLICATES.length} duplicate entries ──`);
    for (const id of HIDE_DUPLICATES) {
      console.log(`  x ${id}`);
      if (!DRY_RUN) {
        const { error } = await sb.from("classes").update({ hidden_from_directory: true }).eq("id", id);
        if (error) console.log(`    ERROR: ${error.message}`);
      }
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
