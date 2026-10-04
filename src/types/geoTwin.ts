export type GeoEntityType = 'venue' | 'hotel' | 'metro' | 'rail' | 'airport' | 'bus_hub' | 'parking' | 'poi';

export type GeoVisualizationMode = 'satellite' | 'map' | '3d_twin' | 'heatmap' | 'ai_prediction';

export interface GeoLocationMetadata {
  indoor?: boolean;
  gates?: number;
  active_turnstiles?: number;
  satellite_preview?: string;
  stars?: number;
  surge_active?: boolean;
  shuttle_connected?: boolean;
  surplus_target?: boolean;
  voucher_active?: boolean;
  discount_percent?: number;
  lines?: string[];
  platforms?: number;
  available_spots?: number;
  ev_charging?: number;
  active_electric_shuttles?: number;
  [key: string]: any;
}

export interface GeoLocationEntity {
  id: string;
  name: string;
  entity_type: GeoEntityType;
  coordinates: [number, number]; // [lon, lat]
  address: string;
  capacity?: number;
  expected_attendance?: number;
  current_pressure?: number;
  predicted_pressure?: number;
  risk_level?: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status?: string;
  occupancy_percent?: number;
  available_rooms?: number;
  avg_rate?: string;
  distance_km?: number;
  capacity_per_hour?: number;
  current_load_percent?: number;
  headway_minutes?: number;
  metadata?: GeoLocationMetadata;
}

export interface TrafficCorridor {
  id: string;
  name: string;
  from_coord: [number, number];
  to_coord: [number, number];
  path?: [number, number][]; // Multi-point actual road coordinates
  congestion_level: number;
  avg_speed_kmh: number;
  delay_minutes: number;
  risk: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface RiskZone {
  id: string;
  name: string;
  center: [number, number];
  radius_meters: number;
  current_pressure: number;
  predicted_pressure_30m: number;
  risk_level: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: string[];
  recommended_action: string;
}

export interface BuildingFootprint {
  id: string;
  name: string;
  height: number;
  baseHeight?: number;
  coordinates: [number, number][][]; // Polygon outer rings [lon, lat]
  category: 'venue' | 'commercial' | 'hotel' | 'transit' | 'civic';
  color?: [number, number, number, number];
}

export interface CrowdSamplePoint {
  coordinates: [number, number]; // [lon, lat]
  weight: number; // 0.0 to 1.0 or headcount density
}

export interface PredictedMovementPath {
  id: string;
  name: string;
  path: [number, number][]; // Array of [lon, lat] coordinates
  timestamps?: number[]; // Timestamps for animated flow (0 to 100)
  flowRate: number; // pax / minute
  direction: string;
  congestionRisk: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  color: [number, number, number];
}

export interface GeoTwinLayerConfig {
  satelliteImagery: boolean;
  buildings: boolean;
  roads: boolean;
  venues: boolean;
  crowdDensity: boolean;
  traffic: boolean;
  riskZones: boolean;
  predictedMovement: boolean;
  // Backward compatibility aliases
  satellite?: boolean;
  buildings3d?: boolean;
  hotels?: boolean;
  transport?: boolean;
  crowdPressure?: boolean;
  trafficPressure?: boolean;
  aiRisk?: boolean;
  weatherImpact?: boolean;
  dependencyNetwork?: boolean;
}

export type TimeIntelligenceMode = 'PAST' | 'NOW' | 'PREDICTED';

export type GeoScenario = 'normal' | 'early_exit' | 'heavy_rain' | 'metro_disruption' | 'hotel_saturation';

export interface DependencyNode {
  id: string;
  label: string;
  type: 'venue' | 'metro' | 'shuttle' | 'traffic' | 'hotel';
  pressure: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  connectedTo: string[];
}

export interface GeoDestination {
  id: string;
  name: string;
  shortName: string;
  latitude: number;
  longitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  category: 'venue' | 'stadium' | 'transit' | 'hotel' | 'custom';
  description: string;
  pressure: number;
  bottleneck: string;
}

