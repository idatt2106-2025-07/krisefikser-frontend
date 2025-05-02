import type { PointOfInterest, LocationData, AffectedArea } from '@/types/mapTypes'

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
