/**
 * Singapore Directories Scraper
 * ════════════════════════════════
 * Scrapes Singapore-specific platforms and directories for enrichment classes
 * not found through Google Places API.
 *
 * Target Sources:
 *   - MyActiveSG (official Singapore sports directory)
 *   - Community Centers (PA Singapore)
 *   - Honeycombers Singapore (family activities)
 *   - Sistic.com.sg (workshops and classes)
 *   - NLB programs (library activities)
 *
 * Run: node scripts/singapore-directories-scraper.js
 */

const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Fetch page with proper headers ──
async function fetchPage(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        if (i < retries) continue;
        return null;
      }
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) return null;
      
      return await response.text();
    } catch (error) {
      if (i < retries) {
        await delay(1000 * (i + 1));
        continue;
      }
      return null;
    }
  }
  return null;
}

// ── MyActiveSG Scraper ──
async function scrapeMyActiveSG() {
  console.log("\n🏃‍♂️ Scraping MyActiveSG...");
  const results = [];
  
  // MyActiveSG has different activity categories
  const categories = [
    'swimming', 'badminton', 'tennis', 'football', 'basketball', 'volleyball',
    'table-tennis', 'squash', 'gym', 'fitness', 'yoga', 'pilates', 'dance',
    'martial-arts', 'rock-climbing', 'cycling', 'running'
  ];
  
  for (const category of categories) {
    try {
      const url = `https://www.myactivesg.com/facilities/${category}`;
      const html = await fetchPage(url);
      if (!html) continue;
      
      const $ = cheerio.load(html);
      
      // Extract facility information
      $('.facility-card, .location-card, .venue-card').each((_, element) => {
        const $el = $(element);
        const name = $el.find('.facility-name, .venue-name, h3, h4').first().text().trim();
        const address = $el.find('.address, .location').text().trim();
        const description = $el.find('.description, p').text().trim();
        
        if (name && name.length > 3) {
          results.push({
            name: name,
            address: address || 'Singapore',
            category: mapActivityToCategory(category),
            description: description,
            source: 'MyActiveSG',
            sourceUrl: url,
            website: 'https://www.myactivesg.com'
          });
        }
      });
      
      await delay(500);
    } catch (error) {
      console.error(`Error scraping MyActiveSG ${category}:`, error.message);
    }
  }
  
  console.log(`  Found ${results.length} MyActiveSG facilities`);
  return results;
}

// ── Community Centers Scraper ──
async function scrapeCommunitycenters() {
  console.log("\n🏢 Scraping Community Centers...");
  const results = [];
  
  try {
    // PA Singapore community centers list
    const url = 'https://www.pa.gov.sg/our-network/community-clubs-centres';
    const html = await fetchPage(url);
    if (!html) return results;
    
    const $ = cheerio.load(html);
    
    // Extract CC information
    $('.cc-listing, .centre-card, .community-centre').each((_, element) => {
      const $el = $(element);
      const name = $el.find('h3, h4, .cc-name, .centre-name').first().text().trim();
      const address = $el.find('.address, .location').text().trim();
      const phone = $el.find('.phone, .tel').text().trim();
      
      if (name && name.includes('Community')) {
        results.push({
          name: name,
          address: address || 'Singapore',
          phone: phone,
          category: 'Enrichment',
          description: 'Community center offering various enrichment programs for children and families.',
          source: 'PA Singapore',
          sourceUrl: url,
          website: 'https://www.pa.gov.sg'
        });
      }
    });
    
  } catch (error) {
    console.error('Error scraping Community Centers:', error.message);
  }
  
  console.log(`  Found ${results.length} Community Centers`);
  return results;
}

// ── Honeycombers Scraper ──
async function scrapeHoneycombers() {
  console.log("\n🍯 Scraping Honeycombers Singapore...");
  const results = [];
  
  const searchUrls = [
    'https://honeycombers.com/singapore/kids-activities-classes-singapore/',
    'https://honeycombers.com/singapore/enrichment-classes-kids-singapore/',
    'https://honeycombers.com/singapore/art-classes-kids-singapore/',
    'https://honeycombers.com/singapore/music-classes-kids-singapore/',
    'https://honeycombers.com/singapore/sports-classes-kids-singapore/'
  ];
  
  for (const url of searchUrls) {
    try {
      const html = await fetchPage(url);
      if (!html) continue;
      
      const $ = cheerio.load(html);
      
      // Extract class provider information from articles
      $('article, .post-content, .entry-content').each((_, element) => {
        const $el = $(element);
        
        // Look for provider names and details
        $el.find('h2, h3, h4, strong').each((_, heading) => {
          const $heading = $(heading);
          const text = $heading.text().trim();
          
          // Skip if it's just a generic heading
          if (text.length < 10 || text.toLowerCase().includes('classes') || text.toLowerCase().includes('singapore')) {
            return;
          }
          
          // Get the following content for details
          const $next = $heading.next('p, div');
          const description = $next.text().trim().substring(0, 500);
          
          // Look for address or contact info
          const fullText = $el.text();
          const addressMatch = fullText.match(/(?:Address|Location):\s*([^\.]+)/i);
          const phoneMatch = fullText.match(/(?:Phone|Tel|Contact):\s*([\d\s\-\+\(\)]+)/);
          const websiteMatch = fullText.match(/(https?:\/\/[^\s]+)/);
          
          if (description.length > 50) {
            results.push({
              name: text,
              address: addressMatch ? addressMatch[1].trim() : 'Singapore',
              phone: phoneMatch ? phoneMatch[1].trim() : null,
              website: websiteMatch ? websiteMatch[1] : null,
              category: extractCategoryFromText(text + ' ' + description),
              description: description,
              source: 'Honeycombers',
              sourceUrl: url
            });
          }
        });
      });
      
      await delay(1000);
    } catch (error) {
      console.error(`Error scraping Honeycombers ${url}:`, error.message);
    }
  }
  
  console.log(`  Found ${results.length} Honeycombers providers`);
  return results;
}

// ── SISTIC Scraper ──
async function scrapeSistic() {
  console.log("\n🎫 Scraping SISTIC workshops...");
  const results = [];
  
  try {
    const url = 'https://www.sistic.com.sg/events/workshops';
    const html = await fetchPage(url);
    if (!html) return results;
    
    const $ = cheerio.load(html);
    
    // Extract workshop/class information
    $('.event-card, .workshop-item, .class-listing').each((_, element) => {
      const $el = $(element);
      const name = $el.find('.event-title, .workshop-name, h3').first().text().trim();
      const description = $el.find('.description, .event-desc, p').text().trim();
      const venue = $el.find('.venue, .location').text().trim();
      const organizer = $el.find('.organizer, .provider').text().trim();
      
      if (name && description && (name.toLowerCase().includes('kids') || name.toLowerCase().includes('children') || description.toLowerCase().includes('children'))) {
        results.push({
          name: organizer || name,
          address: venue || 'Singapore',
          category: extractCategoryFromText(name + ' ' + description),
          description: description.substring(0, 500),
          source: 'SISTIC',
          sourceUrl: url,
          website: 'https://www.sistic.com.sg'
        });
      }
    });
    
  } catch (error) {
    console.error('Error scraping SISTIC:', error.message);
  }
  
  console.log(`  Found ${results.length} SISTIC workshops`);
  return results;
}

// ── NLB Programs Scraper ──
async function scrapeNLB() {
  console.log("\n📚 Scraping NLB programs...");
  const results = [];
  
  try {
    const url = 'https://www.nlb.gov.sg/main/whats-on';
    const html = await fetchPage(url);
    if (!html) return results;
    
    const $ = cheerio.load(html);
    
    // Extract library program information
    $('.programme-card, .event-item, .activity-card').each((_, element) => {
      const $el = $(element);
      const name = $el.find('.programme-title, .event-title, h3').first().text().trim();
      const description = $el.find('.description, .programme-desc, p').text().trim();
      const library = $el.find('.library, .venue, .location').text().trim();
      
      if (name && (name.toLowerCase().includes('kids') || name.toLowerCase().includes('children') || description.toLowerCase().includes('children'))) {
        results.push({
          name: `${name} at ${library || 'National Library'}`,
          address: library || 'National Library Singapore',
          category: extractCategoryFromText(name + ' ' + description),
          description: description.substring(0, 500),
          source: 'NLB',
          sourceUrl: url,
          website: 'https://www.nlb.gov.sg'
        });
      }
    });
    
  } catch (error) {
    console.error('Error scraping NLB:', error.message);
  }
  
  console.log(`  Found ${results.length} NLB programs`);
  return results;
}

// ── Helper functions ──
function mapActivityToCategory(activity) {
  const map = {
    'swimming': 'Swimming',
    'badminton': 'Sports',
    'tennis': 'Sports', 
    'football': 'Sports',
    'basketball': 'Sports',
    'volleyball': 'Sports',
    'table-tennis': 'Sports',
    'squash': 'Sports',
    'gym': 'Sports',
    'fitness': 'Sports',
    'yoga': 'Yoga',
    'pilates': 'Sports',
    'dance': 'Dance',
    'martial-arts': 'Martial Arts',
    'rock-climbing': 'Rock Climbing',
    'cycling': 'Sports',
    'running': 'Sports'
  };
  return map[activity] || 'Sports';
}

function extractCategoryFromText(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('swim')) return 'Swimming';
  if (lower.includes('music') || lower.includes('piano') || lower.includes('violin') || lower.includes('guitar')) return 'Music';
  if (lower.includes('dance') || lower.includes('ballet')) return 'Dance';
  if (lower.includes('art') || lower.includes('paint') || lower.includes('draw')) return 'Art';
  if (lower.includes('martial') || lower.includes('karate') || lower.includes('taekwondo')) return 'Martial Arts';
  if (lower.includes('coding') || lower.includes('robot') || lower.includes('programming')) return 'STEM';
  if (lower.includes('drama') || lower.includes('acting') || lower.includes('theatre')) return 'Drama';
  if (lower.includes('cook') || lower.includes('baking')) return 'Cooking';
  if (lower.includes('chinese') || lower.includes('mandarin')) return 'Chinese';
  if (lower.includes('english')) return 'English';
  if (lower.includes('math')) return 'Mathematics';
  if (lower.includes('science')) return 'Science';
  if (lower.includes('sport') || lower.includes('tennis') || lower.includes('football')) return 'Sports';
  if (lower.includes('yoga')) return 'Yoga';
  if (lower.includes('climb')) return 'Rock Climbing';
  if (lower.includes('gymnastic')) return 'Gymnastics';
  if (lower.includes('chess')) return 'Chess';
  
  return 'Enrichment';
}

// ── Check if provider exists ──
async function providerExists(name, address) {
  const { data } = await sb
    .from('providers')
    .select('id, name, address')
    .ilike('name', `%${name.substring(0, 20)}%`)
    .limit(3);
  
  if (!data) return false;
  
  return data.some(p => 
    p.name.toLowerCase().includes(name.toLowerCase().substring(0, 15)) ||
    (address && p.address && p.address.toLowerCase().includes(address.toLowerCase().substring(0, 15)))
  );
}

// ── Main function ──
async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  Singapore Directories Scraper");
  console.log("══════════════════════════════════════════");
  
  const startTime = Date.now();
  let totalFound = 0;
  let newProviders = 0;
  let duplicates = 0;
  let errors = 0;
  
  // Scrape all sources
  const allResults = [];
  
  try {
    const myActiveSGResults = await scrapeMyActiveSG();
    allResults.push(...myActiveSGResults);
  } catch (error) {
    console.error('MyActiveSG scraping failed:', error.message);
  }
  
  try {
    const ccResults = await scrapeCommunitycenters();
    allResults.push(...ccResults);
  } catch (error) {
    console.error('Community Centers scraping failed:', error.message);
  }
  
  try {
    const honeycombersResults = await scrapeHoneycombers();
    allResults.push(...honeycombersResults);
  } catch (error) {
    console.error('Honeycombers scraping failed:', error.message);
  }
  
  try {
    const sisticResults = await scrapeSistic();
    allResults.push(...sisticResults);
  } catch (error) {
    console.error('SISTIC scraping failed:', error.message);
  }
  
  try {
    const nlbResults = await scrapeNLB();
    allResults.push(...nlbResults);
  } catch (error) {
    console.error('NLB scraping failed:', error.message);
  }
  
  totalFound = allResults.length;
  console.log(`\n📊 Total providers found: ${totalFound}`);
  console.log("\n💾 Adding to database...");
  
  // Process results
  for (const result of allResults) {
    try {
      // Check for duplicates
      if (await providerExists(result.name, result.address)) {
        duplicates++;
        continue;
      }
      
      // Prepare provider data
      const providerData = {
        name: result.name,
        address: result.address,
        phone: result.phone,
        website: result.website,
        discovered_from: JSON.stringify({
          source: result.source,
          sourceUrl: result.sourceUrl,
          date: new Date().toISOString()
        })
      };
      
      // Insert provider
      const { data: providerResult, error: providerError } = await sb
        .from('providers')
        .insert(providerData)
        .select('id')
        .single();
      
      if (providerError) {
        errors++;
        continue;
      }
      
      // Create placeholder class
      const classData = {
        name: result.name,
        provider_id: providerResult.id,
        category: result.category,
        location: result.address,
        description: result.description,
        is_placeholder: true,
        discovered_from: JSON.stringify({
          source: result.source,
          sourceUrl: result.sourceUrl,
          date: new Date().toISOString()
        })
      };
      
      const { error: classError } = await sb
        .from('classes')
        .insert(classData);
      
      if (classError) {
        errors++;
      } else {
        newProviders++;
        process.stdout.write(`  ✓ ${result.name.substring(0, 40).padEnd(42)} ${result.category.padEnd(12)} ${result.source}\n`);
      }
      
    } catch (error) {
      errors++;
      console.error(`  ✗ Error processing ${result.name}:`, error.message);
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log("\n══════════════════════════════════════════");
  console.log("  DIRECTORY SCRAPING RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Total found:           ${totalFound}`);
  console.log(`  New providers added:   ${newProviders}`);
  console.log(`  Duplicates skipped:    ${duplicates}`);
  console.log(`  Errors:                ${errors}`);
  console.log(`  Success rate:          ${((newProviders / totalFound) * 100).toFixed(1)}%`);
  console.log(`  Time:                  ${elapsed} minutes`);
  console.log("══════════════════════════════════════════\n");
  
  console.log("Next steps:");
  console.log("1. Run batch-enrich.js to enrich the new placeholder classes");
  console.log("2. Run scrape-websites.js to get detailed content from provider websites");
}

run().catch(console.error);