import maplibregl from 'maplibre-gl';
import { cities, rivers, regions } from './config.js';
import routeData from './data/route.geojson.js';

let map;
let mapReady = false;

// Light map style using free CartoDB Voyager tiles (no API key needed)
const MAP_STYLE = {
  version: 8,
  name: 'Strogoff Light',
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 512,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxzoom: 18,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f4f1eb' },
    },
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm-raster',
      paint: {
        'raster-opacity': 1,
        'raster-saturation': -0.15,
      },
    },
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
};

export function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: MAP_STYLE,
    center: [70, 55],
    zoom: 2.8,
    pitch: 0,
    bearing: 0,
    attributionControl: true,
    antialias: true,
    maxZoom: 16,
    minZoom: 2,
  });

  return new Promise((resolve) => {
    map.on('load', () => {
      addTerrainSource();
      addRegionLayers();
      addRouteLayer();
      addRiverLayers();
      addTravelerDot();
      addCityMarkers();
      addCityLabels();
      setFog({ color: '#f4f1eb', 'sky-color': '#c8dce8', 'horizon-blend': 0.08 });
      mapReady = true;
      resolve(map);
    });
  });
}

export function getMap() {
  return mapReady ? map : null;
}

// ── Terrain ──

function addTerrainSource() {
  // Use AWS open terrain tiles (no API key needed)
  map.addSource('terrain-dem', {
    type: 'raster-dem',
    tiles: [
      'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    ],
    tileSize: 256,
    encoding: 'terrarium',
    maxzoom: 15,
  });
}

export function setTerrain(enabled) {
  if (enabled) {
    map.setTerrain({ source: 'terrain-dem', exaggeration: 3 });
  } else {
    map.setTerrain(null);
  }
}

// ── Fog / Atmosphere ──

export function setFog(fog) {
  if (!fog) return;
  map.setSky({
    'sky-color': fog['sky-color'] || '#c8dce8',
    'fog-color': fog.color || '#f4f1eb',
    'fog-ground-blend': fog['horizon-blend'] || 0.08,
    'horizon-fog-blend': fog['horizon-blend'] || 0.08,
    'sky-horizon-blend': 0.5,
  });
}

// ── Camera ──

export function flyTo(camera) {
  map.flyTo({
    center: camera.center,
    zoom: camera.zoom,
    pitch: camera.pitch || 0,
    bearing: camera.bearing || 0,
    duration: camera.duration || 3000,
    essential: true,
  });
}

// ── Route Layer ──

function addRouteLayer() {
  // Full route ghost line (always visible)
  map.addSource('route-full', {
    type: 'geojson',
    data: routeData,
  });

  map.addLayer({
    id: 'route-full-line',
    type: 'line',
    source: 'route-full',
    paint: {
      'line-color': '#8b6914',
      'line-width': 1.5,
      'line-opacity': 0.18,
      'line-dasharray': [3, 3],
    },
  });

  // Progressive route (revealed on scroll)
  map.addSource('route', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  // Shadow / glow under route
  map.addLayer({
    id: 'route-glow',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#8b6914',
      'line-width': 8,
      'line-opacity': 0.15,
      'line-blur': 8,
    },
  });

  // Main route line
  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#8b6914',
      'line-width': 3,
      'line-opacity': 0.85,
      'line-dasharray': [2, 1.5],
    },
  });
}

export function updateRouteData(geojson) {
  const source = map.getSource('route');
  if (source) source.setData(geojson);
}

// ── Traveler Dot ──

function addTravelerDot() {
  map.addSource('traveler', {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'Point', coordinates: [37.62, 55.76] } },
  });

  // Pulse ring
  map.addLayer({
    id: 'traveler-pulse',
    type: 'circle',
    source: 'traveler',
    paint: {
      'circle-radius': 12,
      'circle-color': '#8b6914',
      'circle-opacity': 0.2,
      'circle-blur': 0.8,
    },
  });

  // Core dot
  map.addLayer({
    id: 'traveler-dot',
    type: 'circle',
    source: 'traveler',
    paint: {
      'circle-radius': 5,
      'circle-color': '#8b6914',
      'circle-opacity': 1,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  });
}

export function updateTravelerPosition(coords) {
  const source = map.getSource('traveler');
  if (source) {
    source.setData({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
    });
  }
}

// ── City Markers ──

function addCityMarkers() {
  const features = cities.map((city) => ({
    type: 'Feature',
    properties: { name: city.name, state: 'future' },
    geometry: { type: 'Point', coordinates: city.coords },
  }));

  map.addSource('cities', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features },
  });

  map.addLayer({
    id: 'city-markers',
    type: 'circle',
    source: 'cities',
    paint: {
      'circle-radius': [
        'match', ['get', 'state'],
        'current', 7,
        'visited', 5,
        4,
      ],
      'circle-color': [
        'match', ['get', 'state'],
        'current', '#8b6914',
        'visited', '#b8a060',
        '#c0bdb5',
      ],
      'circle-opacity': [
        'match', ['get', 'state'],
        'current', 1,
        'visited', 0.9,
        0.5,
      ],
      'circle-stroke-width': [
        'match', ['get', 'state'],
        'current', 2,
        1,
      ],
      'circle-stroke-color': [
        'match', ['get', 'state'],
        'current', '#fff',
        'visited', '#8b6914',
        '#aaa',
      ],
    },
  });
}

export function updateCityStates(currentDistanceKm) {
  const source = map.getSource('cities');
  if (!source) return;

  const features = cities.map((city) => {
    let state = 'future';
    if (city.distanceKm < currentDistanceKm - 50) state = 'visited';
    if (city.distanceKm <= currentDistanceKm && city.distanceKm >= currentDistanceKm - 200) state = 'current';
    return {
      type: 'Feature',
      properties: { name: city.name, state },
      geometry: { type: 'Point', coordinates: city.coords },
    };
  });

  source.setData({ type: 'FeatureCollection', features });
}

// ── City Labels ──

function addCityLabels() {
  map.addLayer({
    id: 'city-labels',
    type: 'symbol',
    source: 'cities',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Semibold'],
      'text-size': [
        'match', ['get', 'state'],
        'current', 13,
        11,
      ],
      'text-offset': [0, 1.5],
      'text-anchor': 'top',
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': [
        'match', ['get', 'state'],
        'current', '#1a1a2e',
        'visited', '#5a5a6e',
        '#8a8a9a',
      ],
      'text-halo-color': 'rgba(255, 255, 255, 0.85)',
      'text-halo-width': 1.5,
    },
  });
}

// ── River Layers ──

function addRiverLayers() {
  Object.entries(rivers).forEach(([key, river]) => {
    map.addSource(`river-${key}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: river.coordinates },
      },
    });

    map.addLayer({
      id: `river-${key}`,
      type: 'line',
      source: `river-${key}`,
      paint: {
        'line-color': river.color,
        'line-width': 2.5,
        'line-opacity': 0,
        'line-blur': 1,
      },
    });
  });
}

export function setRiverVisibility(activeRivers) {
  Object.keys(rivers).forEach((key) => {
    const opacity = activeRivers.includes(key) ? 0.7 : 0;
    map.setPaintProperty(`river-${key}`, 'line-opacity', opacity);
  });
}

// ── Region Layers ──

function addRegionLayers() {
  Object.entries(regions).forEach(([key, region]) => {
    map.addSource(`region-${key}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: region.coordinates },
      },
    });

    // Fill
    map.addLayer({
      id: `region-${key}-fill`,
      type: 'fill',
      source: `region-${key}`,
      paint: {
        'fill-color': region.color,
        'fill-opacity': 0,
      },
    });

    // Border
    map.addLayer({
      id: `region-${key}-border`,
      type: 'line',
      source: `region-${key}`,
      paint: {
        'line-color': region.borderColor,
        'line-width': 1.5,
        'line-opacity': 0,
        'line-dasharray': [4, 2],
      },
    });
  });
}

export function setRegionVisibility(activeRegions) {
  Object.keys(regions).forEach((key) => {
    const opacity = activeRegions.includes(key) ? 1 : 0;
    map.setPaintProperty(`region-${key}-fill`, 'fill-opacity', opacity);
    map.setPaintProperty(`region-${key}-border`, 'line-opacity', opacity);
  });
}
