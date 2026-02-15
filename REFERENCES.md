# References & Data Sources

## Route Coordinates

### Moscow to Nijni-Novgorod Railway

**Source:** OpenStreetMap via the Overpass API (free, no API key)

**API Endpoint:**
```
https://overpass-api.de/api/interpreter
```

**Query used:**
```
[out:json];
way["railway"="rail"]["name"~"Горьковское направление"]["usage"="main"]
(55.5, 37.5, 56.5, 44.0);
out geom;
```

**Query breakdown:**

| Part | Meaning |
|------|---------|
| `[out:json]` | Return results as JSON |
| `way` | Search for ways (lines/polylines in OSM) |
| `["railway"="rail"]` | Only railway tracks |
| `["name"~"Горьковское направление"]` | Name matches "Gorky Direction" (regex). This is the official Russian name for the Moscow-Nizhny Novgorod mainline. |
| `["usage"="main"]` | Only the main trunk line (excludes sidings, spurs) |
| `(55.5, 37.5, 56.5, 44.0)` | Bounding box: (south lat, west lon, north lat, east lon) covering Moscow to Nizhny Novgorod |
| `out geom` | Include full geometry (all coordinate points) in response |

**Processing:**
1. Raw query returned ~1,500 track points across multiple way segments
2. Filtered for main trunk line only (excluded branch lines like Balashikha spur)
3. Ordered all points west-to-east by longitude
4. Downsampled to 88 representative points
5. Validated monotonic longitude increase and no abrupt latitude jumps (>0.08 degrees)
6. Final coordinates saved to `moscow-nizhny-railway.json`, then integrated into `src/data/route.geojson.js`

**Historical context:** The Moscow-Nizhny Novgorod Railway was completed in 1862 (Moscow-Vladimir 1861, Vladimir-Nizhny Novgorod 1862). It followed the ancient Vladimirka (Vladimir Highway), the western segment of the Great Siberian Road. In the novel, Strogoff departs Moscow on the morning of July 16th and arrives at Nijni-Novgorod approximately ten hours later.

### Nijni-Novgorod to Kazan — Volga River (Steamer)

**Source:** OpenStreetMap via the Overpass API

**Query used:**
```
[out:json];
way["waterway"="river"]["name"="Волга"]
(54.5, 43.5, 56.5, 49.5);
out geom;
```

**Query breakdown:**

| Part | Meaning |
|------|---------|
| `way["waterway"="river"]` | River waterways only |
| `["name"="Волга"]` | The Volga river (Russian name) |
| `(54.5, 43.5, 56.5, 49.5)` | Bounding box covering Nijni-Novgorod to Kazan |

**Processing:**
1. 23 OSM ways returned, filtered to 18 relevant segments
2. Chained using greedy nearest-endpoint algorithm starting from Nizhny Novgorod
3. Trimmed to the segment between Nijni-Novgorod and Kazan
4. Downsampled from ~586 points to 50 evenly-spaced representative points
5. Validated west-to-east direction with no backward jumps

**Historical context:** In the novel, Strogoff boards the steamer *Caucasus* at Nijni-Novgorod. The Volga adds ~2 mph of current going downstream. The steamer passes Cheboksary and reaches Kazan in approximately one day. At Kazan, the steamer turns up the Kama river toward Perm.

### Kazan to Perm — Kama River (Steamer)

**Source:** OpenStreetMap via the Overpass API

**Query used:**
```
[out:json];
way["waterway"="river"]["name"="Кама"]
(55.0, 49.0, 58.5, 56.5);
out geom;
```

**Query breakdown:**

| Part | Meaning |
|------|---------|
| `way["waterway"="river"]` | River waterways only |
| `["name"="Кама"]` | The Kama river (Russian name) |
| `(55.0, 49.0, 58.5, 56.5)` | Bounding box covering Kama-Volga confluence to Perm |

**Processing:**
1. 66 OSM way segments returned for the Kama river
2. Chained into continuous polyline using nearest-endpoint algorithm
3. Trimmed to the Kama-Volga confluence (49.94, 55.36) to Perm (56.25, 58.01) segment
4. Downsampled to 50 representative points using Ramer-Douglas-Peucker simplification
5. Route starts at the actual Kama-Volga confluence, south of Kazan

**Historical context:** At Kazan the steamer *Caucasus* leaves the Volga and turns up the Kama. Fighting the current, the steamer makes only ~10 mph. The Kama passage to Perm takes roughly 40 hours. The river passes Chistopol, Yelabuga, and Sarapul before reaching Perm on July 19th.

### Key Location Coordinates

| Location | Coordinates [lon, lat] | Source | Notes |
|----------|----------------------|--------|-------|
| Moscow (Kremlin) | 37.6177, 55.7510 | User-provided precision coordinate | Story opens here at the Czar's ball |
| Vladimir Station | 40.4202, 56.1304 | User-provided precision coordinate | Actual passenger train station. Nadia boards here. |
| Nijni-Novgorod | 43.94, 56.30 | OpenStreetMap | Junction of Volga and Oka rivers. Railway terminus. |

## Tile & Map Sources

| Layer | URL | Notes |
|-------|-----|-------|
| Base map (Voyager) | `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png` | CartoDB, free, no key |
| Satellite imagery | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` | Esri World Imagery, free, no key, tileSize 256 |
| Terrain DEM | `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | AWS open terrain, encoding: terrarium |
| Glyphs | `https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf` | MapLibre demo, "Open Sans Semibold" confirmed |

## Book Source

Full text of "Michael Strogoff" by Jules Verne, stored locally as `book.txt`. Used to identify:
- Exact route and stops between cities
- Mode of transport for each segment (railway, steamer, tarantass)
- Narrative events at each location
- Character introductions and key scenes

Public domain source: [Project Gutenberg](https://www.gutenberg.org/files/1842/1842-h/1842-h.htm)
