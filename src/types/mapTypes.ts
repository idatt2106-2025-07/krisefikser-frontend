export interface LocationItem {
  id: string;
  name: string;
  coordinates: [number, number];
  address?: string;
}

export interface AffectedArea extends LocationItem {
  radius: number;
}

export interface LocationData {
  hospitals: LocationItem[];
  shelters: LocationItem[];
  defibrillators: LocationItem[];
  waterStations: LocationItem[];
  foodCentrals: LocationItem[];
  affectedAreas: AffectedArea[];
}

export interface MarkerCollections {
  hospitals: mapboxgl.Marker[];
  shelters: mapboxgl.Marker[];
  defibrillators: mapboxgl.Marker[];
  waterStations: mapboxgl.Marker[];
  foodCentrals: mapboxgl.Marker[];
}

export interface Filters {
  hospital?: boolean;
  shelter?: boolean;
  defibrillator?: boolean;
  waterStation?: boolean;
  foodCentral?: boolean;
  affectedAreas?: boolean;
}
