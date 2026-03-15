import * as turf from '@turf/turf';
import routeData from './data/route.geojson.js';
import { updateRouteData, updateTravelerPosition } from './map.js';
import { cities } from './data/cities.js';

let routeLine;
let routeLength;
// Piecewise mapping: each entry is { storyKm, geoKm } at each route point
let milestones = [];

export function initRoute() {
  routeLine = turf.lineString(routeData.geometry.coordinates);
  routeLength = turf.length(routeLine, { units: 'kilometers' });

  // Build milestones by snapping each city to its nearest route coordinate.
  // This allows the route to have many more points than cities (e.g. detailed
  // railway coordinates) while still mapping story distances correctly.
  const coords = routeData.geometry.coordinates;

  // First, compute cumulative geographic distance at each route point
  const geoDistances = [0];
  for (let i = 1; i < coords.length; i++) {
    const from = turf.point(coords[i - 1]);
    const to = turf.point(coords[i]);
    geoDistances.push(geoDistances[i - 1] + turf.distance(from, to, { units: 'kilometers' }));
  }

  // For each city, find the closest route coordinate and record the mapping
  for (const city of cities) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = turf.distance(turf.point(coords[i]), turf.point(city.coords), { units: 'kilometers' });
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    milestones.push({ storyKm: city.distanceKm, geoKm: geoDistances[bestIdx] });
  }

  // Sort by story distance (should already be sorted, but ensure it)
  milestones.sort((a, b) => a.storyKm - b.storyKm);
}

/**
 * Map a story distance (km) to a geographic distance along the route
 * using piecewise-linear interpolation between city milestones.
 */
function storyToGeo(distanceKm) {
  if (distanceKm <= 0) return 0;
  if (distanceKm >= milestones[milestones.length - 1].storyKm) return routeLength;

  for (let i = 1; i < milestones.length; i++) {
    if (distanceKm <= milestones[i].storyKm) {
      const prev = milestones[i - 1];
      const curr = milestones[i];
      const segFraction = (distanceKm - prev.storyKm) / (curr.storyKm - prev.storyKm);
      return prev.geoKm + segFraction * (curr.geoKm - prev.geoKm);
    }
  }
  return routeLength;
}

/**
 * Update the route line to show progress up to distanceKm.
 * Uses Turf.js lineSliceAlong to clip the route.
 */
export function updateRouteLine(distanceKm) {
  if (!routeLine) return;

  const sliceDistance = storyToGeo(distanceKm);

  if (sliceDistance <= 0) {
    updateRouteData({ type: 'FeatureCollection', features: [] });
    updateTravelerPosition(routeData.geometry.coordinates[0]);
    return;
  }

  try {
    const sliced = turf.lineSliceAlong(routeLine, 0, sliceDistance, { units: 'kilometers' });
    updateRouteData(sliced);

    const coords = sliced.geometry.coordinates;
    updateTravelerPosition(coords[coords.length - 1]);
  } catch {
    // Fallback: interpolate by coordinate index
    const fraction = Math.min(sliceDistance / routeLength, 1);
    const numCoords = routeData.geometry.coordinates.length;
    const idx = Math.max(1, Math.round(fraction * (numCoords - 1)));
    const partialCoords = routeData.geometry.coordinates.slice(0, idx + 1);
    updateRouteData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: partialCoords },
    });
    updateTravelerPosition(partialCoords[partialCoords.length - 1]);
  }
}
