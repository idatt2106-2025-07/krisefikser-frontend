import { describe, it, expect } from 'vitest'
import { createSearchableGeoJSON, getTypeDisplayName } from '@/utils/mapUtils'
import type { LocationData, PointOfInterest, AffectedArea } from '@/types/mapTypes'

describe('mapUtils', () => {
  // Tests for getTypeDisplayName
  describe('getTypeDisplayName', () => {
    it('should return the correct display name for known types', () => {
      expect(getTypeDisplayName('HOSPITAL')).toBe('Hospital')
      expect(getTypeDisplayName('SHELTER')).toBe('Shelter')
      expect(getTypeDisplayName('DEFIBRILLATOR')).toBe('Defibrillator')
      expect(getTypeDisplayName('WATER_STATION')).toBe('Water Station')
      expect(getTypeDisplayName('FOOD_CENTRAL')).toBe('Food Central')
      expect(getTypeDisplayName('MEETING_PLACE')).toBe('Meeting Place')
    })

    it('should return the original type for unknown types', () => {
      expect(getTypeDisplayName('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
      expect(getTypeDisplayName('')).toBe('')
    })
  })

  // Tests for createSearchableGeoJSON
  describe('createSearchableGeoJSON', () => {
    it('should create an empty feature collection with empty location data', () => {
      const emptyLocationData: LocationData = {
        pointsOfInterest: [],
        affectedAreas: []
      }

      const result = createSearchableGeoJSON(emptyLocationData)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toEqual([])
    })

    it('should create features for points of interest', () => {
      const locationData: LocationData = {
        pointsOfInterest: [
          {
            id: 1,
            type: 'HOSPITAL',
            latitude: 59.9139,
            longitude: 10.7522,
            description: 'Oslo Hospital'
          } as PointOfInterest
        ],
        affectedAreas: []
      }

      const result = createSearchableGeoJSON(locationData)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features.length).toBe(1)
      expect(result.features[0]).toEqual({
        type: 'Feature',
        properties: {
          title: 'Hospital',
          description: 'Oslo Hospital',
          category: 'HOSPITAL',
          id: 1,
          poiType: 'HOSPITAL'
        },
        geometry: {
          type: 'Point',
          coordinates: [10.7522, 59.9139]
        }
      })
    })

    it('should create features for affected areas', () => {
      const locationData: LocationData = {
        pointsOfInterest: [],
        affectedAreas: [
          {
            id: 1,
            latitude: 59.9139,
            longitude: 10.7522,
            description: 'Flood Area',
            lowDangerRadiusKm: 5,
            mediumDangerRadiusKm: 2,
            highDangerRadiusKm: 1
          } as AffectedArea
        ]
      }

      const result = createSearchableGeoJSON(locationData)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features.length).toBe(1)
      expect(result.features[0]).toEqual({
        type: 'Feature',
        properties: {
          title: 'Flood Area',
          description: 'Affected Area',
          category: 'affected_area',
          id: 1,
          radius: 5
        },
        geometry: {
          type: 'Point',
          coordinates: [10.7522, 59.9139]
        }
      })
    })

    it('should create features for both points of interest and affected areas', () => {
      const locationData: LocationData = {
        pointsOfInterest: [
          {
            id: 1,
            type: 'SHELTER',
            latitude: 59.9139,
            longitude: 10.7522,
            description: 'Oslo Shelter'
          } as PointOfInterest
        ],
        affectedAreas: [
          {
            id: 2,
            latitude: 60.3913,
            longitude: 5.3221,
            description: 'Bergen Flooding',
            lowDangerRadiusKm: 10,
            mediumDangerRadiusKm: 5,
            highDangerRadiusKm: 2
          } as AffectedArea
        ]
      }

      const result = createSearchableGeoJSON(locationData)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features.length).toBe(2)

      // Check POI feature
      expect(result.features[0].properties.title).toBe('Shelter')
      expect(result.features[0].geometry.coordinates).toEqual([10.7522, 59.9139])

      // Check affected area feature
      expect(result.features[1].properties.title).toBe('Bergen Flooding')
      expect(result.features[1].geometry.coordinates).toEqual([5.3221, 60.3913])
    })

    it('should handle undefined or non-array location data', () => {
      const incompleteLocationData = {} as LocationData
      const result = createSearchableGeoJSON(incompleteLocationData)

      expect(result.type).toBe('FeatureCollection')
      expect(result.features).toEqual([])
    })
  })
})
