/**
 * backfill-tags.js — Assign taxonomy tags to all classes via AI
 * ═══════════════════════════════════════════════════════════════
 * Reads each class's existing data (description, vibe_line, reviews, etc.)
 * and asks GPT-4o-mini to pick tags from the fixed taxonomy.
 *
 * Tags are defined in: src/lib/tags/taxonomy.ts
 * Prompt is loaded from: scripts/prompts/tag-assignment-system.md
 *
 * Usage:
 *   node scripts/backfill-tags.js                    # all non-placeholder classes
 *   node scripts/backfill-tags.js --limit=10         # first 10 only (testing)
 *   node scripts/backfill-tags.js --class-id=UUID    # single class
 *   node scripts/backfill-tags.js --dry-run          # show what would be assigned, don't write
 *   node scripts/backfill-tags.js --force             # re-tag even if already tagged
 */

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// ── Config ──
const PROMPT_PATH = path.join(__dirname, "prompts", "tag-assignment-system.md");
const MODEL = "gpt-4o-mini";
const TEMPERATURE = 0.2; // Low for consistency
const MAX_TOKENS = 800;
const DELAY_MS = 300; // Rate limit buffer

// ── Valid tag labels (loaded from taxonomy) ──
// We load the taxonomy labels directly from the prompt file to avoid TS compilation.
// The canonical source is taxonomy.ts; the prompt mirrors it exactly.
const VALID_DIMENSIONS = ["content", "philosophy", "experience", "child"];

// ── Load valid tags from taxonomy.ts ──
function loadValidTags() {
  const taxonomyPath = path.join(__dirname, "..", "src", "lib", "tags", "taxonomy.ts");
  const raw = fs.readFileSync(taxonomyPath, "utf8");

  const tags = new Map(); // label → { slug, dimension }

  // Parse label and slug from the TS file using regex
  const re = /\{\s*slug:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*dimension:\s*"([^"]+)"/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    const [, slug, label, dimension] = match;
    tags.set(label, { slug, dimension });
  }

  console.log(`Loaded ${tags.size} valid tags from taxonomy.ts`);
  return tags;
}

// ── Init ──
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function loadSystemPrompt() {
  try {
    return fs.readFileSync(PROMPT_PATH, "utf8").trim();
  } catch (e) {
    console.error(`Could not load prompt: ${e.message}`);
    process.exit(1);
  }
}

// ── Build user prompt for a single class ──
function buildUserPrompt(cls, reviews) {
  const parts = [];

  parts.push(`CLASS: ${cls.name}`);
  if (cls.category) parts.push(`CATEGORY: ${cls.category}`);
  if (cls.age_min != null || cls.age_max != null) {
    parts.push(`AGE RANGE: ${cls.age_min || "?"}-${cls.age_max || "?"} years`);
  }
  if (cls.vibe_line) parts.push(`VIBE: ${cls.vibe_line}`);
  if (cls.description) parts.push(`DESCRIPTION:\n${cls.description.slice(0, 1500)}`);
  if (cls.typical_child_profile) parts.push(`WHO THRIVES:\n${cls.typical_child_profile.slice(0, 800)}`);
  if (cls.outcome_expectations) parts.push(`WHAT TO EXPECT:\n${cls.outcome_expectations.slice(0, 800)}`);

  if (reviews && reviews.length > 0) {
    const reviewText = reviews
      .slice(0, 20)
      .map((r) => `- "${r.text?.slice(0, 200) || ""}"`)
      .join("\n");
    parts.push(`PARENT REVIEWS (${reviews.length} total):\n${reviewText}`);
  }

  return parts.join("\n\n");
}

// ── Parse and validate AI response ──
function parseAndValidate(raw, validTags) {
  let parsed;
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.log(`  ✗ JSON parse error: ${e.message}`);
    return null;
  }

  const result = { content: [], philosophy: [], experience: [], child: [] };
  let invalidCount = 0;

  for (const dim of VALID_DIMENSIONS) {
    const labels = parsed[dim];
    if (!Array.isArray(labels)) continue;

    for (const label of labels) {
      const tag = validTags.get(label);
      if (tag && tag.dimension === dim) {
        result[dim].push({ slug: tag.slug, label, dimension: dim });
      } else {
        invalidCount++;
        // Try case-insensitive fuzzy match
        let found = false;
        for (const [validLabel, tagInfo] of validTags) {
          if (validLabel.toLowerCase() === label.toLowerCase() && tagInfo.dimension === dim) {
            result[dim].push({ slug: tagInfo.slug, label: validLabel, dimension: dim });
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`    ⚠ Invalid ${dim} tag: "${label}"`);
        }
      }
    }
  }

  const total = result.content.length + result.philosophy.length +
    result.experience.length + result.child.length;

  if (total === 0) {
    console.log(`  ✗ No valid tags returned`);
    return null;
  }

  if (invalidCount > 0) {
    console.log(`    (${invalidCount} invalid tags filtered out)`);
  }

  return result;
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, "").split("=");
    flags[key] = val ?? true;
  }

  const dryRun = flags["dry-run"] === true;
  const force = flags["force"] === true;
  const limit = flags["limit"] ? parseInt(flags["limit"]) : null;
  const singleClassId = flags["class-id"] || null;

  console.log(`\n═══ Tumbo Tag Backfill ═══`);
  console.log(`Model: ${MODEL} | Temp: ${TEMPERATURE}`);
  if (dryRun) console.log(`DRY RUN — no database writes`);
  if (force) console.log(`FORCE — re-tagging already-tagged classes`);
  if (limit) console.log(`LIMIT: ${limit} classes`);
  if (singleClassId) console.log(`SINGLE CLASS: ${singleClassId}`);
  console.log();

  const SYSTEM_PROMPT = loadSystemPrompt();
  const validTags = loadValidTags();

  // Fetch classes
  let query = sb
    .from("classes")
    .select("id, name, category, age_min, age_max, description, vibe_line, typical_child_profile, outcome_expectations, raw_reviews, is_placeholder, hidden_from_directory")
    .eq("is_placeholder", false);

  if (singleClassId) {
    query = query.eq("id", singleClassId);
  }
  if (limit) {
    query = query.limit(limit);
  }

  const { data: classes, error: fetchErr } = await query;
  if (fetchErr) {
    console.error(`Fetch error: ${fetchErr.message}`);
    process.exit(1);
  }

  console.log(`Found ${classes.length} classes to process\n`);

  // If not forcing, check which classes already have tags
  let alreadyTagged = new Set();
  if (!force) {
    const { data: existing } = await sb
      .from("class_taxonomy_tags")
      .select("class_id");

    if (existing) {
      alreadyTagged = new Set(existing.map((r) => r.class_id));
      console.log(`${alreadyTagged.size} classes already tagged (use --force to re-tag)\n`);
    }
  }

  let tagged = 0;
  let skipped = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];

    if (!force && alreadyTagged.has(cls.id)) {
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${classes.length}] ${cls.name}`);

    // Parse reviews
    let reviews = [];
    try {
      reviews = cls.raw_reviews ? JSON.parse(cls.raw_reviews) : [];
    } catch {}

    const userPrompt = buildUserPrompt(cls, reviews);

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content || "";
      const result = parseAndValidate(raw, validTags);
      if (!result) {
        errors++;
        await delay(500);
        continue;
      }

      // Flatten all tags
      const allTags = [
        ...result.content,
        ...result.philosophy,
        ...result.experience,
        ...result.child,
      ];

      const tagSummary = VALID_DIMENSIONS
        .map((d) => `${d}: ${result[d].map((t) => t.label).join(", ") || "—"}`)
        .join(" | ");
      console.log(`  ✓ ${allTags.length} tags | ${tagSummary}`);

      if (!dryRun) {
        // Delete existing tags for this class (if re-tagging)
        if (force) {
          await sb.from("class_taxonomy_tags").delete().eq("class_id", cls.id);
        }

        // Insert new tags
        const rows = allTags.map((t) => ({
          class_id: cls.id,
          tag_slug: t.slug,
          dimension: t.dimension,
          assigned_by: "ai",
        }));

        const { error: insertErr } = await sb
          .from("class_taxonomy_tags")
          .insert(rows);

        if (insertErr) {
          console.log(`  DB error: ${insertErr.message}`);
          errors++;
        } else {
          tagged++;
        }
      } else {
        tagged++;
      }
    } catch (err) {
      console.log(`  ✗ ${err.message}`);
      errors++;
    }

    await delay(DELAY_MS);

    if ((i + 1) % 25 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`\n── ${i + 1}/${classes.length} | ${tagged} tagged | ${elapsed}min ──\n`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n═══ DONE ═══`);
  console.log(`Tagged: ${tagged} | Skipped: ${skipped} | Errors: ${errors}`);
  console.log(`Time: ${elapsed} minutes`);
  if (dryRun) console.log(`(DRY RUN — nothing was written to database)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
