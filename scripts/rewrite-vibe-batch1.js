/**
 * Batch 1: Rewrite vibe lines for 10 high-visibility listings
 * These appear in rails and have generic/negative vibe lines.
 *
 * Usage: node scripts/rewrite-vibe-batch1.js [--dry-run]
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const DRY_RUN = process.argv.includes("--dry-run");

const REWRITES = [
  {
    // #2 most viewed — currently "creative fun with a side of frustration"
    id: "6968c725-48c8-4e18-b8de-8c4bf5f4675e",
    name: "Am I Addicted Pottery Studio",
    old_vibe: "creative fun with a side of frustration",
    vibe_line: "Get your hands dirty together — pottery that slows the world down for an afternoon",
  },
  {
    // #9 — "patience and structured guidance, but watch for distractions"
    id: "3b15d47a-d76b-422a-a21d-4d703099d420",
    name: "Cycle School SG",
    old_vibe: "patience and structured guidance, but watch for distractions",
    vibe_line: "From training wheels to triumph — the moment they ride alone is worth everything",
  },
  {
    // #5 — "patient coaches making cycling fun and achievable"
    id: "db202465-1466-4dac-82e1-4457f66af5a5",
    name: "Biking Singapore",
    old_vibe: "patient coaches making cycling fun and achievable",
    vibe_line: "For the child who says 'I can't' — until they can, in one session",
  },
  {
    // #6 — "patient instructors and a supportive climbing community"
    id: "48d2b158-edf0-444e-9331-3c2e821cb78c",
    name: "Kinetics Climbing",
    old_vibe: "patient instructors and a supportive climbing community",
    vibe_line: "The wall doesn't care about grades — just how high your child dares to go",
  },
  {
    // #7 — "friendly staff, engaging routes — a cozy climbing community"
    id: "c284dcb7-31f1-4957-abfc-2a358ce25a72",
    name: "Climba Gym",
    old_vibe: "friendly staff, engaging routes — a cozy climbing community",
    vibe_line: "Small enough that the staff know your child's name, big enough to challenge them",
  },
  {
    // #8 — "patient coaches who build confidence in young swimmers"
    id: "23392b56-7afc-419d-bcaa-679f1d2c5a61",
    name: "SwimRay Swimming Lessons",
    old_vibe: "patient coaches who build confidence in young swimmers",
    vibe_line: "From clinging to the wall to swimming the whole length — parents say it happens faster than expected",
  },
  {
    // #17 — "hands-on baking fun with supportive chefs"
    id: "b92b032d-5797-494a-8a08-d9f3b34e7268",
    name: "BELLS Baking Studio",
    old_vibe: "hands-on baking fun with supportive chefs",
    vibe_line: "The class where your child bakes something real and brings it home — pride tastes better than any cake",
  },
  {
    // #16 — "knowledgeable staff, friendly vibes — perfect for beginners"
    id: "4d87a810-adc2-4d8b-93ec-9d848283e461",
    name: "Skatebruh @ City Gate",
    old_vibe: "knowledgeable staff, friendly vibes — perfect for beginners",
    vibe_line: "Where skateboarding culture meets real coaching — your kid walks in curious, walks out hooked",
  },
  {
    // #29 — "patient coaching that transforms fear into confidence"
    id: "8225b25b-fd88-4cf9-b11b-27c74bbc4350",
    name: "Raphah Cycling Academy",
    old_vibe: "patient coaching that transforms fear into confidence",
    vibe_line: "One lesson. That's all most kids need to go from terrified to pedalling away without looking back",
  },
  {
    // #25 — "a supportive space for budding fashionistas"
    id: "a29b225c-fbec-47cc-909f-09c4aafb198e",
    name: "Fashion Makerspace",
    old_vibe: "a supportive space for budding fashionistas",
    vibe_line: "Your child designs it, cuts it, sews it, wears it home — fashion as self-expression, not consumption",
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
