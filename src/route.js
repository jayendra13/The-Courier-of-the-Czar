import * as turf from '@turf/turf';
import routeData from './data/route.geojson.js';
import { updateRouteData, updateTravelerPosition } from './map.js';
import { TOTAL_DISTANCE_KM } from './config.js';

let routeLine;
let routeLength;

export function initRoute() {
  routeLine = turf.lineString(routeData.geometry.coordinates);
  routeLength = turf.length(routeLine, { units: 'kilometers' });
}

/**
 * Update the route line to show progress up to distanceKm.
 * Uses Turf.js lineSliceAlong to clip the route.
 */
export function updateRouteLine(distanceKm) {
  if (!routeLine) return;

  // Map story distance to actual GeoJSON line distance
  const fraction = Math.min(distanceKm / TOTAL_DISTANCE_KM, 1);
  const sliceDistance = fraction * routeLength;

  if (sliceDistance <= 0) {
    // Empty state — show no route but position traveler at Moscow
    updateRouteData({ type: 'FeatureCollection', features: [] });
    updateTravelerPosition(routeData.geometry.coordinates[0]);
    return;
  }

  try {
    const sliced = turf.lineSliceAlong(routeLine, 0, sliceDistance, { units: 'kilometers' });
    updateRouteData(sliced);

    // Update traveler position to end of sliced line
    const coords = sliced.geometry.coordinates;
    const lastCoord = coords[coords.length - 1];
    updateTravelerPosition(lastCoord);
  } catch {
    // Fallback: show full route up to fraction
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
