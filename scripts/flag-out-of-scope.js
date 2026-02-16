/**
 * flag-out-of-scope.js — Analyse all classes and flag entries that shouldn't be on a kids enrichment directory.
 *
 * Product: Tümbo = children's classes/activities for parents (Singapore). Out of scope: tertiary (JC, Poly, Uni),
 * adult-only, corporate training, etc.
 *
 * Run: node scripts/flag-out-of-scope.js
 * Output: docs/FLAGGED_OUT_OF_SCOPE.md (human-readable) and docs/FLAGGED_CLASS_IDS.json (for apply script).
 * Does NOT modify the database. After you review the list, run: node scripts/apply-flagged-hidden.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Rules: match class name, provider name, or category (case-insensitive) ──
const OUT_OF_SCOPE_PATTERNS = [
  // Tertiary / pre-university (not kids enrichment)
  { pattern: /\bjunior college\b/i, reason: "Junior College (JC) — tertiary, not kids enrichment" },
  { pattern: /\bJ\.?C\.?\b/i, reason: "JC abbreviation — Junior College" },
  { pattern: /\bpolytechnic\b/i, reason: "Polytechnic — tertiary" },
  { pattern: /\bpoly\s+(?:technic)?\b/i, reason: "Poly — tertiary" },
  { pattern: /\bITE\b/i, reason: "ITE — tertiary" },
  { pattern: /\buniversity\b/i, reason: "University — tertiary" },
  { pattern: /\bNUS\b/i, reason: "NUS — university" },
  { pattern: /\bNTU\b/i, reason: "NTU — university" },
  { pattern: /\bSMU\b/i, reason: "SMU — university" },
  { pattern: /\bSIT\b/i, reason: "SIT — university" },
  { pattern: /\bSUTD\b/i, reason: "SUTD — university" },
  { pattern: /\bSUSS\b/i, reason: "SUSS — university" },
  // Adult / corporate
  { pattern: /\badult\s+(?:education|training|class)\b/i, reason: "Adult education / training" },
  { pattern: /\bcorporate\s+training\b/i, reason: "Corporate training" },
  { pattern: /\bprofessional\s+certification\b/i, reason: "Professional certification" },
  { pattern: /\bexecutive\s+(?:education|programme)\b/i, reason: "Executive education" },
  // Clearly not kids enrichment
  { pattern: /\bMBA\b/i, reason: "MBA — adult programme" },
  { pattern: /\bdegree\s+programme\b/i, reason: "Degree programme — tertiary" },
  { pattern: /\bdiploma\s+programme\b/i, reason: "Diploma programme — tertiary (unless kids diploma)" },
  { pattern: /\bA\-?Level\b/i, reason: "A-Level — pre-university" },
];

function flagReason(text) {
  if (!text || typeof text !== "string") return null;
  for (const { pattern, reason } of OUT_OF_SCOPE_PATTERNS) {
    if (pattern.test(text)) return reason;
  }
  return null;
}

async function run() {
  console.log("══════════════════════════════════════════════════════");
  console.log("  FLAG OUT-OF-SCOPE ENTRIES (kids enrichment directory)");
  console.log("══════════════════════════════════════════════════════\n");

  let allClasses = [];
  for (let offset = 0; ; offset += 1000) {
    const { data } = await sb
      .from("classes")
      .select("id, name, category, provider_id")
      .eq("is_placeholder", false)
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allClasses = allClasses.concat(data);
  }

  const providerIds = [...new Set(allClasses.map((c) => c.provider_id).filter(Boolean))];
  const providerMap = new Map();
  for (let i = 0; i < providerIds.length; i += 200) {
    const batch = providerIds.slice(i, i + 200);
    const { data } = await sb.from("providers").select("id, name").in("id", batch);
    for (const p of data || []) providerMap.set(p.id, p);
  }

  const flagged = [];
  for (const cls of allClasses) {
    const provider = cls.provider_id ? providerMap.get(cls.provider_id) : null;
    const providerName = provider?.name || "";
    const combined = [cls.name, cls.category, providerName].filter(Boolean).join(" ");
    const reason = flagReason(cls.name) || flagReason(cls.category) || flagReason(providerName);
    if (reason) {
      flagged.push({
        id: cls.id,
        name: cls.name,
        category: cls.category || "",
        provider_name: providerName,
        reason,
        hide_reason: "out_of_scope",
      });
    }
  }

  const docsDir = path.join(__dirname, "..", "docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const mdPath = path.join(docsDir, "FLAGGED_OUT_OF_SCOPE.md");
  const jsonPath = path.join(docsDir, "FLAGGED_CLASS_IDS.json");

  const md = [
    "# Flagged out-of-scope entries",
    "",
    "These classes were flagged as **not suitable** for a kids enrichment directory (e.g. Junior College, Polytechnic, University, adult-only).",
    "",
    "**Review this list.** If you agree, run:",
    "```bash",
    "cd tumbo-subframe && node scripts/apply-flagged-hidden.js",
    "```",
    "That will set `hidden_from_directory = true` so they no longer appear on the site.",
    "",
    "| Class name | Category | Provider | Reason |",
    "|------------|----------|----------|--------|",
    ...flagged.map(
      (f) =>
        `| ${(f.name || "").replace(/\|/g, "\\|").slice(0, 60)} | ${(f.category || "").replace(/\|/g, "\\|")} | ${(f.provider_name || "").replace(/\|/g, "\\|").slice(0, 40)} | ${(f.reason || "").replace(/\|/g, "\\|")} |`
    ),
    "",
    `**Total flagged:** ${flagged.length} of ${allClasses.length} classes.`,
    "",
    "---",
    "Generated by `node scripts/flag-out-of-scope.js`.",
  ].join("\n");

  fs.writeFileSync(mdPath, md, "utf8");
  fs.writeFileSync(jsonPath, JSON.stringify(flagged, null, 2), "utf8");

  console.log(`Flagged: ${flagged.length} of ${allClasses.length} classes.`);
  console.log(`\nOutput:`);
  console.log(`  ${mdPath}`);
  console.log(`  ${jsonPath}`);
  console.log("\nReview docs/FLAGGED_OUT_OF_SCOPE.md tomorrow. When ready, run:");
  console.log("  node scripts/apply-flagged-hidden.js");
  console.log("\nThen run full enrichment on the rest: node scripts/full-enrich.js --all");
}

run().catch(console.error);
