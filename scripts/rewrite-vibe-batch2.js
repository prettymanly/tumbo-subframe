/**
 * Batch 2: Rewrite vibe lines for 20 more high-visibility listings
 * Targeting remaining rail-visible listings with generic content.
 *
 * Usage: node scripts/rewrite-vibe-batch2.js [--dry-run]
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const DRY_RUN = process.argv.includes("--dry-run");

const REWRITES = [
  {
    id: "c6d14735-ed36-47e6-98da-353ef0aec119",
    name: "Mountain Bike Chestnut Trail",
    old_vibe: "nature-focused trails with wildlife encounters and family fun",
    vibe_line: "Mud, monkeys, and the kind of tired that means a good night's sleep",
  },
  {
    id: "8a45ada3-ecba-43f7-b822-69a8b11aad2f",
    name: "Boulder Planet Sembawang",
    old_vibe: "patient coaching, supportive community — climbing made fun",
    vibe_line: "The gym where 'I can't reach' turns into 'watch me' — one hold at a time",
  },
  {
    id: "4a83822a-98b8-4c55-84de-d02cbeb2b09c",
    name: "Outpost Climbing",
    old_vibe: "supportive community, where kids climb and connect",
    vibe_line: "Problem-solving with your whole body — every route is a puzzle your child solves with their hands and feet",
  },
  {
    id: "c8241a82-0b08-4d7d-ac31-fc0d3624c729",
    name: "Little Splashes Aquatics",
    old_vibe: "patient instructors helping kids thrive in the water",
    vibe_line: "Heated pool, tiny classes, and coaches who remember your child's name — swimming without the shivering",
  },
  {
    id: "d6439090-26e7-4621-ac34-065d899b3014",
    name: "Learn to Cycle Singapore",
    old_vibe: "structured lessons with a focus on individual progress",
    vibe_line: "They arrive holding your hand. They leave pedalling ahead of you. Most families need just one session",
  },
  {
    id: "99d0a0b3-ca56-4a4d-9332-ad0237ab1d2b",
    name: "Galaxy Dance Academy",
    old_vibe: "a vibrant community where every step is celebrated",
    vibe_line: "Where your child discovers their body can tell stories — dance that builds poise, not perfectionism",
  },
  {
    id: "09467a3f-02db-445d-a990-32252ddc97f6",
    name: "Happy Fish HOME @ Bedok",
    old_vibe: "gentle guidance in a warm, welcoming pool",
    vibe_line: "Warm water, gentle hands, and the joy of watching your toddler go from splashing to swimming",
  },
  {
    id: "ce306cf1-2cb3-48c2-8831-8106bca1b128",
    name: "CRISTOFORI Music School Bishan",
    old_vibe: "personalized lessons with attentive, friendly instructors",
    vibe_line: "The piano school where practice stops feeling like homework — because the teacher actually listens",
  },
  {
    id: "6c96ce61-e1a8-43bb-9694-2cf568d29cfa",
    name: "Lingo Languages",
    old_vibe: "engaging lessons with cultural insights and supportive teachers",
    vibe_line: "Malay, Mandarin, or Hindi through stories and songs — language as a window, not a worksheet",
  },
  {
    id: "0f62a101-a877-410d-9866-16c48e201159",
    name: "Forest Adventure",
    old_vibe: "thrilling obstacles and ziplines in a beautiful setting",
    vibe_line: "The day your child conquers a high-rope course is the day they stop saying 'I'm scared'",
  },
  {
    id: "7362912d-a04c-40ad-9176-eecd04876119",
    name: "Cycling Lessons Singapore",
    old_vibe: "patient and engaging coaching for confident cycling",
    vibe_line: "Your child arrives nervous. Ninety minutes later, you're chasing them across the park",
  },
  {
    id: "f6073df3-757d-4950-afe2-13d7757a22b1",
    name: "Xtreme SkatePark",
    old_vibe: "community-driven, safety-focused skatepark for all skill levels",
    vibe_line: "Where falling is just part of the fun — a skatepark that welcomes beginners, not just pros",
  },
  {
    id: "61c61a40-adc1-410c-b216-a9bd54c679c8",
    name: "The Curiosity Circuit",
    old_vibe: "interactive play with a nature twist, but logistics can frustrate",
    vibe_line: "Part playground, part science lab — the kind of messy, curious play that screens can't replace",
  },
  {
    id: "17759277-04ad-4f0c-a50b-3198bb660391",
    name: "ABC Cooking Studio Funan",
    old_vibe: "engaging classes with fun instructors, but booking is a challenge",
    vibe_line: "Japanese-style cooking classes where your child learns to make what they love to eat",
  },
  {
    id: "05dfb22b-e91b-4517-a935-a4c12de072ec",
    name: "Gateway Arts",
    old_vibe: "supportive instructors, creative exploration, and a nurturing space",
    vibe_line: "A studio where your child's weird ideas are welcome — art without right answers",
  },
  {
    id: "73cf7a7f-34d1-4e1a-a79d-484389115ec8",
    name: "Optimum Badminton Academy",
    old_vibe: "dedicated coaching with mixed experiences — choose wisely",
    vibe_line: "Where your child discovers that badminton is chess at 200km/h — strategy disguised as sport",
  },
  {
    id: "577b980e-e6f0-451f-a51e-9c08fa18e9a7",
    name: "Elite Coach",
    old_vibe: "a welcoming community where fitness meets fun",
    vibe_line: "Multi-sport coaching that lets your child try everything before committing to anything",
  },
  {
    id: "fe7b452f-2dac-480e-9b2f-4e97c72da914",
    name: "Por Vida Skateboarding",
    old_vibe: "patient coaching in a fun, supportive skate community",
    vibe_line: "Indoor skatepark with real coaches — your child learns to skate without the sunburn or the scraped knees",
  },
  {
    id: "a5ba6229-8c60-4849-800e-bb7f5b7f2c5e",
    name: "Macs Music School",
    old_vibe: "a nurturing community where music and passion thrive",
    vibe_line: "The music school that cares more about whether your child loves playing than whether they pass Grade 5",
  },
  {
    id: "52d61caa-6f36-496b-bbb0-8a4f3eee2ecf",
    name: "Dance Class Singapore",
    old_vibe: "a fun escape with supportive instructors and a vibrant community",
    vibe_line: "Hip-hop, K-pop, ballet — whatever moves your child, there's a class that lets them move",
  },
];

async function main() {
  console.log((DRY_RUN ? "[DRY RUN]" : "[LIVE]") + " Rewriting " + REWRITES.length + " vibe lines...\n");

  for (var i = 0; i < REWRITES.length; i++) {
    var r = REWRITES[i];
    console.log((i + 1) + ". " + r.name);
    console.log("   OLD: \"" + r.old_vibe + "\"");
    console.log("   NEW: \"" + r.vibe_line + "\"");

    if (!DRY_RUN) {
      var result = await sb.from("classes").update({ vibe_line: r.vibe_line }).eq("id", r.id);
      if (result.error) {
        console.log("   ERROR: " + result.error.message);
      } else {
        console.log("   OK");
      }
    }
    console.log("");
  }

  console.log("Done!");
}

main().catch(console.error);
