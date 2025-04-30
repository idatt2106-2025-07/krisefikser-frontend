import { MARKER_COLORS, MARKER_LABELS } from '@/constants/markerStyles';
import type { PointOfInterest, LocationData, AffectedArea } from '@/types/mapTypes';

type MarkerType = keyof typeof MARKER_COLORS;

export function createCustomMarker(type: string): HTMLDivElement {
  const el = document.createElement('div');

  // Base styles for all markers
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.borderRadius = '50%';
  el.style.display = 'flex';
  el.style.justifyContent = 'center';
  el.style.alignItems = 'center';
  el.style.fontWeight = 'bold';
  el.style.backgroundColor = MARKER_COLORS[type as MarkerType] || MARKER_COLORS.default;
  el.textContent = MARKER_LABELS[type as keyof typeof MARKER_LABELS] || MARKER_LABELS.default;

  return el;
}


//TODO: FIX
export function createSearchableGeoJSON(locationData: LocationData) {
  const features = [];

  // Process each location type
  Object.entries(locationData).forEach(([category, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item: PointOfInterest | AffectedArea) => {
        features.push({
          type: 'Feature',
          properties: {
            title: item.name,
            description: getCategoryDisplayName(category),
            category: category.replace(/s$/, ''), // Remove plural 's'
            id: item.id,
            ...(('radius' in item) && { radius: item.radius })
          },
          geometry: {
            type: 'Point',
            coordinates: item.coordinates
          }
        });
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features: features
  };
}

function getCategoryDisplayName(category: string): string {
  const names = {
    hospitals: 'Hospital',
    shelters: 'Shelter',
    defibrillators: 'Defibrillator',
    waterStations: 'Water Station',
    foodCentrals: 'Food Central',
    affectedAreas: 'Affected Area'
  };

  return names[category] || category;
}
