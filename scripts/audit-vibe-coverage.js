require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await sb.from("classes")
    .select("id, name, vibe_line, summary, category")
    .eq("is_placeholder", false)
    .eq("hidden_from_directory", false);

  if (error) { console.error(error); return; }

  const total = data.length;
  const hasVibe = data.filter(c => c.vibe_line && c.vibe_line.trim().length > 0).length;
  const hasSummary = data.filter(c => c.summary && c.summary.trim().length > 0).length;
  const neither = data.filter(c => {
    const noVibe = !c.vibe_line || !c.vibe_line.trim();
    const noSum = !c.summary || !c.summary.trim();
    return noVibe && noSum;
  }).length;

  console.log("Total visible:", total);
  console.log("Has vibe_line:", hasVibe, "(" + (100 * hasVibe / total).toFixed(1) + "%)");
  console.log("Has summary:", hasSummary, "(" + (100 * hasSummary / total).toFixed(1) + "%)");
  console.log("Neither:", neither);

  // Sample vibe lines
  const vibed = data.filter(c => c.vibe_line && c.vibe_line.trim().length > 0);
  console.log("\n-- Sample vibe lines (" + vibed.length + " total) --");
  vibed.slice(0, 15).forEach(c => console.log("  " + c.name + ": \"" + c.vibe_line + "\""));

  // Sample generic summaries
  const summaryOnly = data.filter(c => {
    const noVibe = !c.vibe_line || !c.vibe_line.trim();
    return noVibe && c.summary && c.summary.trim();
  });
  console.log("\n-- Sample generic summaries (no vibe_line, " + summaryOnly.length + " total) --");
  summaryOnly.slice(0, 15).forEach(c => console.log("  " + c.name + ": \"" + c.summary + "\""));
}

main().catch(console.error);
