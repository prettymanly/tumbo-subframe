/**
 * Automated Enrichment Pipeline
 * ═══════════════════════════════
 * Automatically runs the complete enrichment pipeline for new placeholder classes.
 * 
 * Pipeline Steps:
 *   1. Batch enrich - Apply templates and normalize categories
 *   2. Website scraping - Extract real content from provider websites  
 *   3. AI enrichment - Generate high-quality descriptions with GPT
 *   4. Quality validation - Check and flag low-quality results
 *
 * Run: node scripts/auto-enrich-pipeline.js
 */

const { spawn } = require('child_process');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Run a script and capture output ──
function runScript(scriptPath, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}...`);
    console.log(`   Running: node ${scriptPath}\n`);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${description} completed successfully`);
        resolve();
      } else {
        console.error(`\n❌ ${description} failed with exit code ${code}`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`\n❌ ${description} failed:`, error.message);
      reject(error);
    });
  });
}

// ── Get pipeline statistics ──
async function getPipelineStats() {
  const [placeholderResult, enrichedResult, totalResult] = await Promise.all([
    sb.from('classes').select('id', { count: 'exact', head: true }).eq('is_placeholder', true),
    sb.from('classes').select('id', { count: 'exact', head: true }).eq('is_placeholder', false),
    sb.from('classes').select('id', { count: 'exact', head: true })
  ]);
  
  return {
    placeholder: placeholderResult.count || 0,
    enriched: enrichedResult.count || 0,
    total: totalResult.count || 0
  };
}

// ── Quality validation ──
async function validateQuality() {
  console.log("\n🔍 Running quality validation...");
  
  // Check for template descriptions that weren't properly enriched
  const { data: templateClasses } = await sb
    .from('classes')
    .select('id, name, description, vibe_line')
    .eq('is_placeholder', false)
    .limit(100);
  
  if (!templateClasses) return { issues: 0, total: 0 };
  
  const templatePhrases = [
    "Classes at this provider",
    "Classes at the provider", 
    "classes at the provider",
    "At the provider,",
    "programme building strong reading, writing",
    "programme building conceptual",
    "instruction building water confidence"
  ];
  
  let issues = 0;
  const problemClasses = [];
  
  for (const cls of templateClasses) {
    const hasTemplateDesc = templatePhrases.some(phrase => 
      cls.description?.includes(phrase)
    );
    
    const hasEmptyVibe = !cls.vibe_line || cls.vibe_line.length < 10;
    const hasShortDesc = !cls.description || cls.description.length < 50;
    
    if (hasTemplateDesc || hasEmptyVibe || hasShortDesc) {
      issues++;
      problemClasses.push({
        id: cls.id,
        name: cls.name,
        issues: [
          hasTemplateDesc && "Template description",
          hasEmptyVibe && "Missing vibe line", 
          hasShortDesc && "Short description"
        ].filter(Boolean)
      });
    }
  }
  
  if (issues > 0) {
    console.log(`\n⚠️  Quality Issues Found: ${issues}/${templateClasses.length} classes`);
    console.log("\nTop issues:");
    problemClasses.slice(0, 5).forEach(cls => {
      console.log(`  • ${cls.name}: ${cls.issues.join(', ')}`);
    });
    
    if (issues > 10) {
      console.log(`\n💡 Recommendation: Re-run ai-enrich.js to fix template descriptions`);
    }
  } else {
    console.log("✅ No quality issues detected");
  }
  
  return { issues, total: templateClasses.length, problemClasses };
}

// ── Main pipeline ──
async function runPipeline() {
  console.log("══════════════════════════════════════════");
  console.log("  Automated Enrichment Pipeline");
  console.log("══════════════════════════════════════════");
  
  const startTime = Date.now();
  
  // Get initial stats
  const initialStats = await getPipelineStats();
  console.log(`\n📊 Initial State:`);
  console.log(`   Total classes: ${initialStats.total}`);
  console.log(`   Enriched: ${initialStats.enriched}`);
  console.log(`   Placeholder: ${initialStats.placeholder}`);
  
  if (initialStats.placeholder === 0) {
    console.log("\n✅ No placeholder classes found. Pipeline not needed.");
    return;
  }
  
  console.log(`\n🎯 Pipeline will process ${initialStats.placeholder} placeholder classes`);
  
  try {
    // Step 1: Batch Enrichment
    await runScript('scripts/batch-enrich.js', 'Step 1: Batch Enrichment');
    await delay(2000);
    
    // Step 2: Website Scraping
    await runScript('scripts/scrape-websites.js', 'Step 2: Website Scraping');
    await delay(2000);
    
    // Step 3: AI Enrichment
    if (process.env.OPENAI_API_KEY) {
      await runScript('scripts/ai-enrich.js', 'Step 3: AI Enrichment');
    } else {
      console.log("\n⚠️  Skipping AI enrichment - OPENAI_API_KEY not found");
      console.log("   Set OPENAI_API_KEY in .env.local to enable AI descriptions");
    }
    
    await delay(2000);
    
    // Get final stats
    const finalStats = await getPipelineStats();
    const processed = initialStats.placeholder - finalStats.placeholder;
    
    console.log("\n══════════════════════════════════════════");
    console.log("  PIPELINE RESULTS");
    console.log("══════════════════════════════════════════");
    console.log(`  Classes processed:     ${processed}`);
    console.log(`  Remaining placeholders: ${finalStats.placeholder}`);
    console.log(`  Total enriched:        ${finalStats.enriched}`);
    console.log(`  Success rate:          ${((processed / initialStats.placeholder) * 100).toFixed(1)}%`);
    
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`  Total time:            ${elapsed} minutes`);
    
    // Quality validation
    const quality = await validateQuality();
    console.log(`  Quality score:         ${((quality.total - quality.issues) / quality.total * 100).toFixed(1)}%`);
    
    console.log("══════════════════════════════════════════\n");
    
    // Recommendations
    if (finalStats.placeholder > 0) {
      console.log("💡 Next Steps:");
      console.log(`   • ${finalStats.placeholder} classes still need enrichment`);
      console.log("   • Check logs above for any errors during processing");
      console.log("   • Consider running individual scripts for failed classes");
    }
    
    if (quality.issues > 5) {
      console.log("   • Consider re-running ai-enrich.js to improve quality");
    }
    
    console.log("\n🎉 Enrichment pipeline completed!");
    
  } catch (error) {
    console.error("\n❌ Pipeline failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   • Check that all required environment variables are set");
    console.log("   • Ensure Supabase connection is working");
    console.log("   • Verify individual scripts run successfully");
    process.exit(1);
  }
}

// ── CLI interface ──
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Automated Enrichment Pipeline

Usage: node scripts/auto-enrich-pipeline.js [options]

Options:
  --help, -h     Show this help message
  --stats        Show current database statistics only
  --validate     Run quality validation only

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY Supabase anon key
  OPENAI_API_KEY               OpenAI API key (optional, for AI enrichment)

The pipeline runs these scripts in sequence:
  1. batch-enrich.js     - Apply templates and normalize categories
  2. scrape-websites.js  - Extract content from provider websites
  3. ai-enrich.js        - Generate AI descriptions (if OpenAI key available)
  4. Quality validation  - Check results and provide recommendations
`);
    process.exit(0);
  }
  
  if (args.includes('--stats')) {
    getPipelineStats().then(stats => {
      console.log("📊 Database Statistics:");
      console.log(`   Total classes: ${stats.total}`);
      console.log(`   Enriched: ${stats.enriched} (${((stats.enriched / stats.total) * 100).toFixed(1)}%)`);
      console.log(`   Placeholder: ${stats.placeholder} (${((stats.placeholder / stats.total) * 100).toFixed(1)}%)`);
    });
    return;
  }
  
  if (args.includes('--validate')) {
    validateQuality().then(result => {
      console.log(`Quality validation: ${result.total - result.issues}/${result.total} classes passed`);
    });
    return;
  }
  
  runPipeline();
}

module.exports = { runPipeline, getPipelineStats, validateQuality };