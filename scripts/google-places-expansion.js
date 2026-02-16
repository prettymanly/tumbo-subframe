/**
 * Google Places API Expansion Scraper
 * ═══════════════════════════════════
 * Systematically searches for enrichment classes using 50+ targeted keywords
 * to find providers not yet in our database.
 *
 * Strategy:
 *   1. Use comprehensive keyword list covering all activity types
 *   2. Search multiple Singapore regions (Central, East, West, North, South)
 *   3. Cross-reference with existing providers to avoid duplicates
 *   4. Extract detailed information and add to Supabase
 *
 * COST: Heavy Google Places API (New) use (many Text Search + Place Details). See docs/COST_AND_API_RULES.md.
 *
 * Run: node scripts/google-places-expansion.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Comprehensive search keywords ──
const SEARCH_KEYWORDS = [
  // Physical Activities
  "kids swimming lessons singapore", "children tennis coaching", "badminton classes kids",
  "football training children", "basketball classes singapore", "volleyball kids",
  "gymnastics classes children", "martial arts kids singapore", "karate classes children",
  "taekwondo kids", "judo classes singapore", "aikido children", "boxing kids",
  "rock climbing children", "bouldering kids singapore", "cycling classes children",
  "skating lessons kids", "roller skating singapore", "ice skating lessons",
  "parkour classes kids", "trampoline classes children", "cheerleading kids singapore",
  
  // Creative Arts
  "art classes kids singapore", "painting lessons children", "pottery classes kids",
  "ceramics workshop children", "sculpture classes singapore", "drawing lessons kids",
  "watercolor classes children", "acrylic painting kids", "digital art classes singapore",
  "animation classes children", "graphic design kids", "photography classes children",
  
  // Music & Performance
  "piano lessons kids singapore", "violin classes children", "guitar lessons kids",
  "drum classes singapore", "singing lessons children", "voice coaching kids",
  "ukulele classes singapore", "keyboard lessons children", "flute classes kids",
  "saxophone lessons singapore", "cello classes children", "music theory kids",
  "choir classes singapore", "band classes children", "orchestra kids",
  
  // Dance & Movement
  "ballet classes kids singapore", "jazz dance children", "hip hop classes kids",
  "contemporary dance singapore", "tap dance classes children", "ballroom kids",
  "latin dance classes singapore", "cultural dance children", "chinese dance kids",
  "indian dance singapore", "malay dance classes", "street dance children",
  
  // Drama & Speech
  "drama classes kids singapore", "acting lessons children", "theatre classes kids",
  "speech therapy singapore", "public speaking children", "storytelling classes kids",
  "debate classes singapore", "presentation skills children", "communication kids",
  
  // STEM & Technology
  "coding classes kids singapore", "programming children", "robotics classes kids",
  "scratch programming singapore", "python kids classes", "app development children",
  "game design classes singapore", "3D printing kids", "electronics children",
  "science experiments classes", "chemistry kids singapore", "physics children",
  "biology classes kids", "astronomy singapore", "engineering children",
  
  // Languages
  "chinese tuition kids singapore", "mandarin classes children", "english tuition kids",
  "french classes singapore", "spanish lessons children", "japanese classes kids",
  "korean lessons singapore", "german classes children", "malay tuition kids",
  "tamil classes singapore", "hindi lessons children",
  
  // Academic Support
  "math tuition kids singapore", "mathematics classes children", "science tuition kids",
  "physics tuition singapore", "chemistry classes children", "biology tuition kids",
  "english composition singapore", "creative writing children", "reading classes kids",
  
  // Life Skills
  "cooking classes kids singapore", "baking lessons children", "kitchen skills kids",
  "sewing classes singapore", "knitting lessons children", "gardening classes kids",
  "woodworking singapore", "crafts classes children", "diy workshops kids",
  
  // Specialized Programs
  "autism support classes singapore", "adhd programs children", "special needs kids",
  "gifted programs singapore", "accelerated learning children", "montessori classes",
  "waldorf education singapore", "homeschool support", "learning difficulties kids",
  
  // Wellness & Mindfulness
  "kids yoga singapore", "children meditation", "mindfulness classes kids",
  "breathing exercises singapore", "stress management children", "emotional regulation kids",
  
  // Holiday Programs
  "school holiday programs singapore", "camp activities children", "workshop kids",
  "vacation classes singapore", "summer programs children", "winter activities kids"
];

// ── Singapore regions for geographic coverage ──
const SINGAPORE_REGIONS = [
  "Central Singapore",
  "East Singapore", 
  "West Singapore",
  "North Singapore",
  "South Singapore",
  "Orchard Singapore",
  "Marina Bay Singapore",
  "Jurong Singapore",
  "Tampines Singapore",
  "Woodlands Singapore"
];

// ── Google Places API wrapper ──
async function searchGooglePlaces(query, region) {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY not found in environment");
  }

  const searchQuery = `${query} ${region}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn(`API Warning for "${searchQuery}": ${data.status}`);
      return [];
    }
    
    return data.results || [];
  } catch (error) {
    console.error(`Error searching "${searchQuery}":`, error.message);
    return [];
  }
}

// ── Get detailed place information ──
async function getPlaceDetails(placeId) {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const fields = 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos,reviews,types,geometry';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      console.warn(`Details API Warning for ${placeId}: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting details for ${placeId}:`, error.message);
    return null;
  }
}

// ── Check if provider already exists ──
async function providerExists(name, address) {
  const { data } = await sb
    .from('providers')
    .select('id, name, address')
    .ilike('name', `%${name}%`)
    .limit(5);
  
  if (!data) return false;
  
  // Check for exact name match or similar address
  return data.some(p => 
    p.name.toLowerCase().trim() === name.toLowerCase().trim() ||
    (address && p.address && p.address.toLowerCase().includes(address.toLowerCase().substring(0, 20)))
  );
}

// ── Extract category from Google place types and search query ──
function extractCategory(types, searchQuery, name) {
  const typeMap = {
    'school': 'Education',
    'gym': 'Sports',
    'art_gallery': 'Art',
    'museum': 'Art',
    'library': 'Education',
    'community_center': 'Enrichment',
    'swimming_pool': 'Swimming'
  };
  
  // Check Google types first
  for (const type of types) {
    if (typeMap[type]) return typeMap[type];
  }
  
  // Extract from search query
  const query = searchQuery.toLowerCase();
  if (query.includes('swim')) return 'Swimming';
  if (query.includes('music') || query.includes('piano') || query.includes('violin') || query.includes('guitar')) return 'Music';
  if (query.includes('dance') || query.includes('ballet')) return 'Dance';
  if (query.includes('art') || query.includes('paint') || query.includes('draw')) return 'Art';
  if (query.includes('martial') || query.includes('karate') || query.includes('taekwondo')) return 'Martial Arts';
  if (query.includes('coding') || query.includes('robot') || query.includes('stem')) return 'STEM';
  if (query.includes('drama') || query.includes('acting') || query.includes('theatre')) return 'Drama';
  if (query.includes('cook') || query.includes('baking')) return 'Cooking';
  if (query.includes('chinese') || query.includes('mandarin')) return 'Chinese';
  if (query.includes('english')) return 'English';
  if (query.includes('math')) return 'Mathematics';
  if (query.includes('science')) return 'Science';
  if (query.includes('sport') || query.includes('tennis') || query.includes('football')) return 'Sports';
  if (query.includes('yoga')) return 'Yoga';
  if (query.includes('climb')) return 'Rock Climbing';
  if (query.includes('gymnastic')) return 'Gymnastics';
  if (query.includes('chess')) return 'Chess';
  
  return 'Enrichment'; // Default category
}

// ── Main scraping function ──
async function run() {
  console.log("══════════════════════════════════════════");
  console.log("  Google Places Expansion Scraper");
  console.log("══════════════════════════════════════════\n");
  
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error("ERROR: Set GOOGLE_PLACES_API_KEY in .env.local");
    console.log("Get your API key from: https://console.cloud.google.com/apis/credentials");
    process.exit(1);
  }
  
  let totalFound = 0;
  let newProviders = 0;
  let duplicates = 0;
  let errors = 0;
  
  const startTime = Date.now();
  
  console.log(`Searching ${SEARCH_KEYWORDS.length} keywords across ${SINGAPORE_REGIONS.length} regions...`);
  console.log(`Total searches: ${SEARCH_KEYWORDS.length * SINGAPORE_REGIONS.length}\n`);
  
  for (let i = 0; i < SEARCH_KEYWORDS.length; i++) {
    const keyword = SEARCH_KEYWORDS[i];
    
    console.log(`\n[${i + 1}/${SEARCH_KEYWORDS.length}] "${keyword}"`);
    
    for (const region of SINGAPORE_REGIONS) {
      try {
        const places = await searchGooglePlaces(keyword, region);
        totalFound += places.length;
        
        for (const place of places) {
          // Check if provider already exists
          if (await providerExists(place.name, place.formatted_address)) {
            duplicates++;
            continue;
          }
          
          // Get detailed information
          const details = await getPlaceDetails(place.place_id);
          if (!details) {
            errors++;
            continue;
          }
          
          // Extract category
          const category = extractCategory(details.types || [], keyword, details.name);
          
          // Prepare provider data
          const providerData = {
            name: details.name,
            address: details.formatted_address,
            phone: details.formatted_phone_number,
            website: details.website,
            google_rating: details.rating,
            google_reviews_count: details.user_ratings_total,
            google_place_id: place.place_id,
            latitude: details.geometry?.location?.lat,
            longitude: details.geometry?.location?.lng,
            google_types: JSON.stringify(details.types || []),
            discovered_from: JSON.stringify({
              source: "Google Places Expansion",
              search_query: keyword,
              region: region,
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
            console.error(`  ✗ Provider error: ${providerError.message}`);
            errors++;
            continue;
          }
          
          // Create placeholder class
          const classData = {
            name: `${category} classes at ${details.name}`,
            provider_id: providerResult.id,
            category: category,
            location: details.formatted_address,
            google_rating: details.rating,
            raw_reviews: details.reviews ? JSON.stringify(details.reviews.slice(0, 5)) : null,
            is_placeholder: true,
            discovered_from: JSON.stringify({
              source: "Google Places Expansion",
              search_query: keyword,
              date: new Date().toISOString()
            })
          };
          
          const { error: classError } = await sb
            .from('classes')
            .insert(classData);
          
          if (classError) {
            console.error(`  ✗ Class error: ${classError.message}`);
            errors++;
          } else {
            newProviders++;
            process.stdout.write(`  ✓ ${details.name.substring(0, 40).padEnd(42)} ${category.padEnd(12)} ${(details.rating || 0).toFixed(1)}★\n`);
          }
        }
        
        await delay(100); // Rate limiting
        
      } catch (error) {
        console.error(`  ✗ Search error for "${keyword}" in ${region}:`, error.message);
        errors++;
        await delay(500);
      }
    }
    
    // Progress update every 10 keywords
    if ((i + 1) % 10 === 0) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const rate = (i + 1) / elapsed;
      const remaining = Math.ceil((SEARCH_KEYWORDS.length - i - 1) / rate);
      console.log(`\n── Progress: ${i + 1}/${SEARCH_KEYWORDS.length} keywords (${newProviders} new, ${duplicates} duplicates, ${errors} errors) ~${remaining}min left ──`);
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  
  console.log("\n══════════════════════════════════════════");
  console.log("  EXPANSION RESULTS");
  console.log("══════════════════════════════════════════");
  console.log(`  Total places found:    ${totalFound}`);
  console.log(`  New providers added:   ${newProviders}`);
  console.log(`  Duplicates skipped:    ${duplicates}`);
  console.log(`  Errors:                ${errors}`);
  console.log(`  Success rate:          ${((newProviders / (newProviders + duplicates + errors)) * 100).toFixed(1)}%`);
  console.log(`  Time:                  ${elapsed} minutes`);
  console.log("══════════════════════════════════════════\n");
  
  console.log("Next steps:");
  console.log("1. Run batch-enrich.js to enrich the new placeholder classes");
  console.log("2. Run scrape-websites.js to get detailed content from provider websites");
  console.log("3. Run ai-enrich.js to generate high-quality descriptions");
}

run().catch(console.error);