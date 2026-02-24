const BUILDING_FOOTPRINT_URL =
  'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/BuildingFootprint2D_gdb/FeatureServer/0/query';

const LARGE_BUILDING_URL =
  'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/LargeBuilding_gdb/FeatureServer/0/query';

export interface BuildingFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  properties: {
    OBJECTID: number;
    HEIGHT?: number;
    Shape__Area: number;
    Shape__Length: number;
  };
}

export interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: BuildingFeature[];
}

// Downtown Miami / Brickell bounding box
export const DOWNTOWN_BBOX = {
  xmin: -80.205,
  ymin: 25.760,
  xmax: -80.185,
  ymax: 25.780,
};

export async function fetchBuildingFootprints(
  bbox = DOWNTOWN_BBOX,
  maxRecords = 500
): Promise<GeoJSONResponse> {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: 'OBJECTID,HEIGHT,Shape__Area,Shape__Length',
    geometry: JSON.stringify(bbox),
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: String(maxRecords),
  });

  const res = await fetch(`${BUILDING_FOOTPRINT_URL}?${params}`);
  if (!res.ok) throw new Error(`GIS API error: ${res.status}`);
  return res.json();
}

// Fetch large buildings with better height data for tall structures
export async function fetchLargeBuildings(
  bbox = DOWNTOWN_BBOX,
  maxRecords = 500
): Promise<GeoJSONResponse> {
  const params = new URLSearchParams({
    where: 'HEIGHT>0',
    outFields: 'OBJECTID,HEIGHT,SHAPE__Area,SHAPE__Length',
    geometry: JSON.stringify(bbox),
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: String(maxRecords),
  });

  const res = await fetch(`${LARGE_BUILDING_URL}?${params}`);
  if (!res.ok) throw new Error(`Large building API error: ${res.status}`);
  return res.json();
}

// ===== TRANSIT DATA =====

const ARCGIS_BASE =
  'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services';

export interface TransitLineFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface TransitStationFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    OBJECTID: number;
    NAME: string;
    LAT?: number;
    LON?: number;
    MRAIL_XFER?: number;
    DTWN_LOOP?: number;
    OMNI_LOOP?: number;
    BRICK_LOOP?: number;
    [key: string]: unknown;
  };
}

export interface TransitGeoJSON<T> {
  type: 'FeatureCollection';
  features: T[];
}

function transitQuery(service: string, where = '1=1'): string {
  const params = new URLSearchParams({
    where,
    outFields: '*',
    outSR: '4326',
    f: 'geojson',
  });
  return `${ARCGIS_BASE}/${service}/FeatureServer/0/query?${params}`;
}

export async function fetchMetrorailLines(): Promise<TransitGeoJSON<TransitLineFeature>> {
  const res = await fetch(transitQuery('MetroRail_gdb'));
  if (!res.ok) throw new Error(`Metrorail lines API error: ${res.status}`);
  return res.json();
}

export async function fetchMetrorailStations(): Promise<TransitGeoJSON<TransitStationFeature>> {
  const res = await fetch(transitQuery('MetroRailStations_gdb'));
  if (!res.ok) throw new Error(`Metrorail stations API error: ${res.status}`);
  return res.json();
}

export async function fetchMetromoverLines(): Promise<TransitGeoJSON<TransitLineFeature>> {
  const res = await fetch(transitQuery('MetroMover_gdb'));
  if (!res.ok) throw new Error(`Metromover lines API error: ${res.status}`);
  return res.json();
}

export async function fetchMetromoverStations(): Promise<TransitGeoJSON<TransitStationFeature>> {
  const res = await fetch(transitQuery('MetroMoverStations_gdb'));
  if (!res.ok) throw new Error(`Metromover stations API error: ${res.status}`);
  return res.json();
}

// ===== BUILDING HEIGHTS =====

// Convert real height in feet to scene units, or estimate from area as fallback
const FEET_TO_UNITS = 0.04; // scale factor: 400ft building = 16 scene units

export function toSceneHeight(feature: BuildingFeature): number {
  const h = feature.properties.HEIGHT;
  if (h && h > 0) {
    return h * FEET_TO_UNITS;
  }
  // Fallback: estimate from footprint area (small buildings with no height data)
  return Math.max(0.5, Math.sqrt(feature.properties.Shape__Area || 100) * 0.15);
}
