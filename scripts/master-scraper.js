/**
 * Master Scraper & Database Expansion
 * ═══════════════════════════════════
 * Comprehensive script to dramatically expand the Tumbo class database
 * using multiple data sources and automated enrichment.
 *
 * Data Sources:
 *   1. Google Places API (systematic keyword expansion)
 *   2. Singapore-specific directories (MyActiveSG, CCs, etc.)
 *   3. Automated enrichment pipeline
 *
 * Estimated Results: 2,000-4,000 new classes
 * 
 * Run: node scripts/master-scraper.js
 */

const { spawn } = require('child_process');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Enhanced script runner with progress tracking ──
function runScriptWithProgress(scriptPath, description, estimatedMinutes = 5) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}...`);
    console.log(`   Estimated time: ~${estimatedMinutes} minutes`);
    console.log(`   Running: node ${scriptPath}\n`);
    
    const startTime = Date.now();
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Progress indicator
    const progressInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      process.stdout.write(`\r   ⏱️  Running for ${elapsed}min...`);
    }, 30000); // Update every 30 seconds
    
    child.on('close', (code) => {
      clearInterval(progressInterval);
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      
      if (code === 0) {
        console.log(`\n✅ ${description} completed in ${elapsed} minutes`);
        resolve({ success: true, elapsed });
      } else {
        console.error(`\n❌ ${description} failed with exit code ${code} after ${elapsed} minutes`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      clearInterval(progressInterval);
      console.error(`\n❌ ${description} failed:`, error.message);
      reject(error);
    });
  });
}

// ── Get comprehensive database statistics ──
async function getDatabaseStats() {
  const queries = [
    sb.from('classes').select('id', { count: 'exact', head: true }),
    sb.from('classes').select('id', { count: 'exact', head: true }).eq('is_placeholder', false),
    sb.from('classes').select('id', { count: 'exact', head: true }).eq('is_placeholder', true),
    sb.from('providers').select('id', { count: 'exact', head: true }),
    sb.from('classes').select('category').eq('is_placeholder', false)
  ];
  
  const [totalClasses, enrichedClasses, placeholderClasses, totalProviders, categoryData] = await Promise.all(queries);
  
  // Count categories
  const categories = {};
  if (categoryData.data) {
    categoryData.data.forEach(cls => {
      const cat = cls.category || 'Unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
  }
  
  return {
    totalClasses: totalClasses.count || 0,
    enrichedClasses: enrichedClasses.count || 0,
    placeholderClasses: placeholderClasses.count || 0,
    totalProviders: totalProviders.count || 0,
    categories,
    topCategories: Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  };
}

// ── Validate environment setup ──
async function validateEnvironment() {
  console.log("🔍 Validating environment setup...");
  
  const issues = [];
  
  // Check Supabase connection
  try {
    const { data, error } = await sb.from('classes').select('id').limit(1);
    if (error) issues.push(`Supabase connection failed: ${error.message}`);
  } catch (error) {
    issues.push(`Supabase connection failed: ${error.message}`);
  }
  
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) issues.push("NEXT_PUBLIC_SUPABASE_URL not set");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
  if (!process.env.GOOGLE_PLACES_API_KEY) issues.push("GOOGLE_PLACES_API_KEY not set (Google Places scraping will be skipped)");
  if (!process.env.OPENAI_API_KEY) issues.push("OPENAI_API_KEY not set (AI enrichment will be skipped)");
  
  if (issues.length > 0) {
    console.log("❌ Environment issues found:");
    issues.forEach(issue => console.log(`   • ${issue}`));
    return false;
  }
  
  console.log("✅ Environment validation passed");
  return true;
}

// ── Generate expansion report ──
function generateReport(initialStats, finalStats, scriptResults, totalTime) {
  const newClasses = finalStats.totalClasses - initialStats.totalClasses;
  const newProviders = finalStats.totalProviders - initialStats.totalProviders;
  const enrichedDelta = finalStats.enrichedClasses - initialStats.enrichedClasses;
  
  console.log("\n" + "═".repeat(60));
  console.log("  🎉 DATABASE EXPANSION COMPLETE");
  console.log("═".repeat(60));
  
  console.log(`\n📊 BEFORE → AFTER:`);
  console.log(`   Classes:    ${initialStats.totalClasses.toLocaleString()} → ${finalStats.totalClasses.toLocaleString()} (+${newClasses.toLocaleString()})`);
  console.log(`   Providers:  ${initialStats.totalProviders.toLocaleString()} → ${finalStats.totalProviders.toLocaleString()} (+${newProviders.toLocaleString()})`);
  console.log(`   Enriched:   ${initialStats.enrichedClasses.toLocaleString()} → ${finalStats.enrichedClasses.toLocaleString()} (+${enrichedDelta.toLocaleString()})`);
  
  console.log(`\n⏱️  PERFORMANCE:`);
  console.log(`   Total time: ${totalTime.toFixed(1)} minutes`);
  console.log(`   Rate: ${(newClasses / (totalTime / 60)).toFixed(0)} classes/hour`);
  
  if (scriptResults.length > 0) {
    console.log(`\n🔧 SCRIPT PERFORMANCE:`);
    scriptResults.forEach(result => {
      console.log(`   ${result.name}: ${result.elapsed}min`);
    });
  }
  
  console.log(`\n📈 TOP CATEGORIES (After Expansion):`);
  finalStats.topCategories.forEach(([category, count], index) => {
    const change = count - (initialStats.categories[category] || 0);
    const changeStr = change > 0 ? ` (+${change})` : '';
    console.log(`   ${index + 1}. ${category}: ${count}${changeStr}`);
  });
  
  const successRate = ((finalStats.enrichedClasses / finalStats.totalClasses) * 100).toFixed(1);
  console.log(`\n✨ ENRICHMENT QUALITY:`);
  console.log(`   Success rate: ${successRate}% classes fully enriched`);
  console.log(`   Remaining placeholders: ${finalStats.placeholderClasses.toLocaleString()}`);
  
  console.log("\n" + "═".repeat(60));
  
  // Recommendations
  if (finalStats.placeholderClasses > 100) {
    console.log("\n💡 RECOMMENDATIONS:");
    console.log("   • Run auto-enrich-pipeline.js again to process remaining placeholders");
  }
  
  if (newClasses > 1000) {
    console.log("   • Consider running quality validation on the new classes");
    console.log("   • Update your website's class count in the UI");
  }
  
  console.log("\n🎯 NEXT STEPS:");
  console.log("   1. Check your website at http://localhost:3000/classes");
  console.log("   2. Review the new categories and class distribution");
  console.log("   3. Consider running periodic updates to keep data fresh");
  console.log("   4. Monitor user engagement with the new classes");
}

// ── Main expansion process ──
async function runExpansion() {
  console.log("══════════════════════════════════════════");
  console.log("  🚀 TUMBO DATABASE EXPANSION");
  console.log("══════════════════════════════════════════");
  console.log("\nThis will dramatically expand your class database using:");
  console.log("• Google Places API (comprehensive keyword search)");
  console.log("• Singapore directories (MyActiveSG, CCs, etc.)");
  console.log("• Automated enrichment pipeline");
  console.log("\nEstimated: 2,000-4,000 new classes | Time: 30-60 minutes");
  
  const startTime = Date.now();
  
  // Validate environment
  if (!(await validateEnvironment())) {
    console.log("\n❌ Please fix environment issues before proceeding");
    process.exit(1);
  }
  
  // Get initial statistics
  console.log("\n📊 Getting initial database state...");
  const initialStats = await getDatabaseStats();
  
  console.log(`\n📋 CURRENT STATE:`);
  console.log(`   Total classes: ${initialStats.totalClasses.toLocaleString()}`);
  console.log(`   Enriched classes: ${initialStats.enrichedClasses.toLocaleString()}`);
  console.log(`   Placeholder classes: ${initialStats.placeholderClasses.toLocaleString()}`);
  console.log(`   Total providers: ${initialStats.totalProviders.toLocaleString()}`);
  console.log(`   Categories: ${Object.keys(initialStats.categories).length}`);
  
  const scriptResults = [];
  
  try {
    // Phase 1: Google Places Expansion
    if (process.env.GOOGLE_PLACES_API_KEY) {
      console.log("\n" + "─".repeat(50));
      console.log("  PHASE 1: Google Places Expansion");
      console.log("─".repeat(50));
      
      const googleResult = await runScriptWithProgress(
        'scripts/google-places-expansion.js',
        'Google Places comprehensive search',
        25
      );
      scriptResults.push({ name: 'Google Places', elapsed: googleResult.elapsed });
    } else {
      console.log("\n⚠️  Skipping Google Places expansion - API key not found");
    }
    
    // Phase 2: Singapore Directories
    console.log("\n" + "─".repeat(50));
    console.log("  PHASE 2: Singapore Directories");
    console.log("─".repeat(50));
    
    const directoriesResult = await runScriptWithProgress(
      'scripts/singapore-directories-scraper.js',
      'Singapore-specific directory scraping',
      10
    );
    scriptResults.push({ name: 'Directories', elapsed: directoriesResult.elapsed });
    
    // Phase 3: Automated Enrichment
    console.log("\n" + "─".repeat(50));
    console.log("  PHASE 3: Automated Enrichment");
    console.log("─".repeat(50));
    
    const enrichmentResult = await runScriptWithProgress(
      'scripts/auto-enrich-pipeline.js',
      'Complete enrichment pipeline',
      20
    );
    scriptResults.push({ name: 'Enrichment', elapsed: enrichmentResult.elapsed });
    
    // Get final statistics
    console.log("\n📊 Calculating final results...");
    const finalStats = await getDatabaseStats();
    
    const totalTime = (Date.now() - startTime) / 1000 / 60;
    
    // Generate comprehensive report
    generateReport(initialStats, finalStats, scriptResults, totalTime);
    
  } catch (error) {
    console.error("\n❌ Expansion failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   • Check network connection");
    console.log("   • Verify API keys are valid");
    console.log("   • Check Supabase database permissions");
    console.log("   • Try running individual scripts to isolate the issue");
    process.exit(1);
  }
}

// ── CLI interface ──
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Tumbo Master Scraper & Database Expansion

Usage: node scripts/master-scraper.js [options]

Options:
  --help, -h     Show this help message
  --stats        Show current database statistics
  --validate     Validate environment setup only
  --dry-run      Show what would be done without executing

This script will:
  1. Scrape Google Places API with 100+ targeted keywords
  2. Scrape Singapore-specific directories and platforms
  3. Run automated enrichment pipeline
  4. Generate comprehensive expansion report

Expected Results:
  • 2,000-4,000 new classes
  • 500-1,000 new providers  
  • 30-60 minutes execution time

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY Supabase anon key
  GOOGLE_PLACES_API_KEY        Google Places API key (recommended)
  OPENAI_API_KEY               OpenAI API key (optional)
`);
    process.exit(0);
  }
  
  if (args.includes('--stats')) {
    getDatabaseStats().then(stats => {
      console.log("📊 Current Database Statistics:");
      console.log(`   Total classes: ${stats.totalClasses.toLocaleString()}`);
      console.log(`   Enriched: ${stats.enrichedClasses.toLocaleString()} (${((stats.enrichedClasses / stats.totalClasses) * 100).toFixed(1)}%)`);
      console.log(`   Placeholder: ${stats.placeholderClasses.toLocaleString()}`);
      console.log(`   Total providers: ${stats.totalProviders.toLocaleString()}`);
      console.log(`   Categories: ${Object.keys(stats.categories).length}`);
      console.log("\n🏆 Top Categories:");
      stats.topCategories.forEach(([category, count], index) => {
        console.log(`   ${index + 1}. ${category}: ${count}`);
      });
    });
    return;
  }
  
  if (args.includes('--validate')) {
    validateEnvironment().then(valid => {
      if (valid) {
        console.log("✅ Environment is ready for expansion");
      } else {
        process.exit(1);
      }
    });
    return;
  }
  
  if (args.includes('--dry-run')) {
    console.log("🔍 DRY RUN - What would be executed:");
    console.log("1. google-places-expansion.js (~25 min)");
    console.log("2. singapore-directories-scraper.js (~10 min)");
    console.log("3. auto-enrich-pipeline.js (~20 min)");
    console.log("\nTotal estimated time: ~55 minutes");
    console.log("Expected new classes: 2,000-4,000");
    return;
  }
  
  runExpansion();
}

module.exports = { runExpansion, getDatabaseStats, validateEnvironment };