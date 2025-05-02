import { MARKER_COLORS, MARKER_LABELS } from '@/constants/markerStyles'
import type { PointOfInterest, LocationData, AffectedArea } from '@/types/mapTypes'

type MarkerType = keyof typeof MARKER_COLORS

export function createCustomMarker(type: string): HTMLDivElement {
  const el = document.createElement('div')

  // Base styles for all markers
  el.style.width = '24px'
  el.style.height = '24px'
  el.style.borderRadius = '50%'
  el.style.display = 'flex'
  el.style.justifyContent = 'center'
  el.style.alignItems = 'center'
  el.style.fontWeight = 'bold'
  el.style.backgroundColor = MARKER_COLORS[type as MarkerType] || MARKER_COLORS.default
  el.textContent = MARKER_LABELS[type as keyof typeof MARKER_LABELS] || MARKER_LABELS.default

  return el
}

export function createSearchableGeoJSON(locationData: LocationData) {
  const features = []

  // Process points of interest
  if (locationData.pointsOfInterest && Array.isArray(locationData.pointsOfInterest)) {
    locationData.pointsOfInterest.forEach((poi: PointOfInterest) => {
      features.push({
        type: 'Feature',
        properties: {
          title: getTypeDisplayName(poi.type),
          description: poi.description,
          category: poi.type,
          id: poi.id,
          poiType: poi.type,
        },
        geometry: {
          type: 'Point',
          coordinates: [poi.longitude, poi.latitude],
        },
      })
    })
  }

  // Process affected areas
  if (locationData.affectedAreas && Array.isArray(locationData.affectedAreas)) {
    locationData.affectedAreas.forEach((area: AffectedArea) => {
      features.push({
        type: 'Feature',
        properties: {
          title: area.description,
          description: 'Affected Area',
          category: 'affected_area',
          id: area.id,
          radius: area.dangerRadiusKm,
        },
        geometry: {
          type: 'Point',
          coordinates: [area.longitude, area.latitude],
        },
      })
    })
  }

  return {
    type: 'FeatureCollection',
    features: features,
  }
}

export function getTypeDisplayName(type: string): string {
  const names = {
    HOSPITAL: 'Hospital',
    SHELTER: 'Shelter',
    DEFIBRILLATOR: 'Defibrillator',
    WATER_STATION: 'Water Station',
    FOOD_CENTRAL: 'Food Central',
    MEETING_PLACE: 'Meeting Place',
  }

  return names[type] || type
}
