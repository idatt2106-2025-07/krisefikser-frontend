export interface PointOfInterest {
  id: number
  latitude: number
  longitude: number
  type:
    | 'HOSPITAL'
    | 'SHELTER'
    | 'DEFIBRILLATOR'
    | 'WATER_STATION'
    | 'FOOD_CENTRAL'
    | 'MEETING_PLACE'
  opensAt: string | null
  closesAt: string | null
  contactNumber: string | null
  description: string
}

export interface AffectedArea {
  id: number
  longitude: number
  latitude: number
  highDangerRadiusKm: number
  mediumDangerRadiusKm: number
  lowDangerRadiusKm: number
  severityLevel: number
  description: string
  startDate: string
}

export interface LocationData {
  pointsOfInterest: PointOfInterest[]
  affectedAreas: AffectedArea[]
}

export interface MarkerCollections {
  hospitals: mapboxgl.Marker[]
  shelters: mapboxgl.Marker[]
  defibrillators: mapboxgl.Marker[]
  water_stations: mapboxgl.Marker[]
  food_centrals: mapboxgl.Marker[]
}

export interface Filters {
  hospital?: boolean
  shelter?: boolean
  defibrillator?: boolean
  water_station?: boolean
  food_central?: boolean
  affected_areas?: boolean
}

export interface GetPointsOfInterestRequest {
  types: string[]
}
