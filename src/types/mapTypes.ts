export interface LocationItem {
  id: string
  name: string
  coordinates: [number, number]
  address?: string
}

export interface AffectedArea extends LocationItem {
  radius: number
}

export interface LocationData {
  hospitals: LocationItem[]
  shelters: LocationItem[]
  defibrillators: LocationItem[]
  water_stations: LocationItem[]
  food_centrals: LocationItem[]
  affected_areas: AffectedArea[]
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
