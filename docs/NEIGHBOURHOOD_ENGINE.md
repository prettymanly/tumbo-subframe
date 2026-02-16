# In the Neighbourhood — Engine & Pipeline

## Purpose

Parents consider sending their kid to a class as part of **lifestyle context**: what can they do while the child is in class, how’s parking, what transport is nearby. The section answers: F&B, cafes, remote working, groceries, parking, public transport — each as a **tab**; each tab shows a **visual list with distance** to the venue.

- **Input:** Google Places API (Nearby Search) — data comes from Google.
- **What we show and how:** Our engine. We decide categories (tabs), radius, max results, and presentation. This doc is the single source of truth so future scripts that add classes include neighbourhood finessing.

## Tabs (categories)

| Tab label         | Google Place types (includedTypes)                    | Notes                    |
|------------------|--------------------------------------------------------|--------------------------|
| F&B              | `restaurant`                                           | Restaurants, eateries    |
| Cafes            | `cafe`, `coffee_shop`                                 | Coffee, light bites      |
| Remote working   | `cafe`, `library`, `coworking_space`                  | Work while kid in class  |
| Groceries        | `grocery_store`, `supermarket`, `convenience_store`   | Errands                  |
| Parking          | `parking`, `parking_garage`, `parking_lot`            | Where to park            |
| Public transport  | `transit_station`, `bus_station`, `subway_station`, `train_station`, `bus_stop` | MRT, bus, etc.   |

## Data storage

- **Where:** `providers.nearby_places` (JSONB).
- **Shape:** One object per provider; keys = category slugs; value = array of places.

```json
{
  "food": [
    { "name": "Hakka Yu", "placeId": "ChIJ...", "distanceMeters": 120, "formattedAddress": "...", "googleMapsUri": "https://..." }
  ],
  "cafes": [ ... ],
  "remote_working": [ ... ],
  "groceries": [ ... ],
  "parking": [ ... ],
  "transit": [ ... ]
}
```

- **Distance:** From Google Places Nearby Search with `rankPreference: "DISTANCE"`. We store `distanceMeters` (straight-line or travel; API returns what it gives).
- **Schema:** Add column if missing: `ALTER TABLE providers ADD COLUMN IF NOT EXISTS nearby_places jsonb;`

## Pipeline step

When we run scripts to add or finess new classes:

1. Provider must have **Google Place ID** (in `classes_scrape_source`) so we have a venue location.
2. Run **`node scripts/nearby-places-fetch.js`** (after pipeline-prep or google-places-fetch so `classes_scrape_source` is set). The script:
   - Loads providers with `classes_scrape_source` containing `google_place_id`.
   - Gets lat/lng via Place Details (New) for each.
   - For each category above, calls Nearby Search (New) with radius 500 m, `rankPreference: "DISTANCE"`, max 15 results.
   - Writes `nearby_places` to the provider.

3. **UI:** Class detail page reads `provider.nearby_places` and renders the tabbed “In the neighbourhood” section. If `nearby_places` is null or empty, show address + “Open in Google Maps” only (no map embed as primary content).

## Script reference

| Script                    | What it does                                                                 |
|---------------------------|-------------------------------------------------------------------------------|
| `nearby-places-fetch.js`  | Fetches nearby places per category for all providers with Place ID; writes `providers.nearby_places`. Run after Place ID is set (pipeline-prep or google-places-fetch). |

## UI rules (our engine)

- Tabs: F&B | Cafes | Remote working | Groceries | Parking | Public transport.
- Each tab: list of places; each row/card shows **name** and **distance** (e.g. “120 m” or “0.2 km”). Optional: link to Google Maps for the place.
- No large embedded map as the main neighbourhood content; optional “Open in Google Maps” for the venue address only.
- If no `nearby_places` data, show address and link only; do not show empty tabs.
