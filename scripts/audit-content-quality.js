require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await sb.from("classes")
    .select("id, name, vibe_line, category, google_rating, review_count, age_min, age_max, photo_url")
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);

  // Flag negative vibe lines
  console.log("== NEGATIVE VIBE LINES ==");
  const negativeWords = ["frustrat", "disappoint", "needs work", "mixed", "hit or miss", "inconsisten", "overpriced", "choose wisely"];
  const negative = data.filter(function(c) {
    if (!c.vibe_line) return false;
    var vl = c.vibe_line.toLowerCase();
    return negativeWords.some(function(w) { return vl.includes(w); });
  });
  negative.forEach(function(c) {
    console.log("  " + c.id.slice(0,8) + " [" + c.category + "] " + c.name);
    console.log("    \"" + c.vibe_line + "\"");
  });

  // Most generic vibe lines (3+ buzzwords)
  console.log("\n== MOST GENERIC VIBE LINES (3+ buzzwords) ==");
  var buzzwords = ["supportive", "nurturing", "community", "patient", "welcoming", "vibrant", "engaging", "thrive", "holistic", "fun"];
  var generic = data.map(function(c) {
    var vl = (c.vibe_line || "").toLowerCase();
    var score = buzzwords.filter(function(b) { return vl.includes(b); }).length;
    return { id: c.id, name: c.name, vibe_line: c.vibe_line, category: c.category, genericScore: score, rating: c.google_rating, reviews: c.review_count };
  }).filter(function(c) { return c.genericScore >= 3; }).sort(function(a,b) { return b.genericScore - a.genericScore; });

  generic.slice(0, 25).forEach(function(c) {
    console.log("  [" + c.genericScore + " buzzwords] " + c.id.slice(0,8) + " " + c.name);
    console.log("    \"" + c.vibe_line + "\"");
  });

  // Vibe lines with "but" (conditional positivity)
  console.log("\n== CONDITIONAL VIBE LINES (contain 'but') ==");
  data.filter(function(c) {
    return c.vibe_line && c.vibe_line.toLowerCase().includes(" but ");
  }).forEach(function(c) {
    console.log("  " + c.id.slice(0,8) + " " + c.name + " — \"" + c.vibe_line + "\"");
  });

  // Venues that aren't really classes
  console.log("\n== POSSIBLE VENUES (not enrichment classes) ==");
  var venueWords = ["Theatre", "Stadium", "Arena", "Museum", "Gallery", "Library", "Playground", "Park"];
  data.filter(function(c) {
    return venueWords.some(function(w) { return c.name.includes(w); });
  }).forEach(function(c) {
    console.log("  " + c.id.slice(0,8) + " [" + c.category + "] " + c.name + " — \"" + c.vibe_line + "\"");
  });

  // Summary stats
  console.log("\n== SUMMARY ==");
  console.log("Total visible: " + data.length);
  console.log("Negative vibe lines: " + negative.length);
  console.log("Generic (3+ buzzwords): " + generic.length);
  console.log("Conditional (but): " + data.filter(function(c) { return c.vibe_line && c.vibe_line.toLowerCase().includes(" but "); }).length);
}

main().catch(console.error);
