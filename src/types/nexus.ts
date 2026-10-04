export type MegaEventType = 
  | 'mumbai-sports' 
  | 'monaco-f1' 
  | 'melbourne-cricket' 
  | 'tomorrowland';

export interface MegaEvent {
  id: MegaEventType;
  name: string;
  tagline: string;
  location: string;
  venueName: string;
  scheduledTime: string;
  baseAttendees: number;
  hotelBaseDemand: number;
  transportHubsCount: number;
  status: 'LIVE' | 'ENDING_SOON' | 'INGRESS' | 'EGRESS';
}

export type StakeholderRole = 
  | 'commander' 
  | 'hospitality' 
  | 'transport' 
  | 'visitor';

export interface CityZone {
  id: string;
  name: string;
  district: string;
  type: 'venue' | 'hospitality' | 'transport_hub' | 'residential' | 'commercial';
  coordinates: { x: number; y: number; z: number }; // 3D twin coords
  latLng: [number, number];
  
  // Real-time telemetry (0-100%)
  currentPressure: number;
  predictedPressure: number; // 60 min horizon
  riskLevel: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  
  // Specific telemetry
  hotelCapacityPercent: number;
  totalRooms: number;
  availableRooms: number;
  avgRoomRate: string;
  
  transportLoadPercent: number;
  activeVehicles: number;
  stationCongestion: number;
  
  restaurantDemandPercent: number;
  availableTables: number;
  
  parkingAvailabilityPercent: number;
  crowdDensitySqMeter: number;
  
  aiSummary: string;
  recommendedAction: string;
}

export interface MapLayerConfig {
  crowdDensity: boolean;
  hotelOccupancy: boolean;
  traffic: boolean;
  transportLoad: boolean;
  restaurantDemand: boolean;
  parkingAvailability: boolean;
  emergencyCorridors: boolean;
}

export interface SimulationParameters {
  eventEndDeltaMinutes: number; // e.g. -45 (ends early) to +60
  expectedAttendance: number;   // 40,000 to 120,000
  weather: 'clear' | 'monsoon' | 'extreme_heat';
  transportCapacityModifier: number; // 50% to 150% (1.0 default)
  hotelAvailabilityBuffer: number;   // 50% to 120%
  emergencyScenario: 'none' | 'early_exit' | 'metro_glitch' | 'rain_storm' | 'vip_corridor';
}

export interface SimulationImpact {
  transportCongestionChange: number; // e.g. +38%
  hotelCheckinSurgeChange: number;   // e.g. +22%
  trafficDelayMinutesChange: number; // e.g. +31%
  restaurantDemandChange: number;    // e.g. +17%
  compositePressureScore: number;    // 0-100
  riskClassification: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface AIResponsePlan {
  id: 'plan_a' | 'plan_b' | 'plan_c';
  title: string;
  subtitle: string;
  strategyType: 'transport' | 'crowd' | 'combined';
  isRecommended?: boolean;
  expectedCongestionReduction: number;
  dispatchTimeMinutes: number;
  timelineSteps: {
    timeOffset: string; // "T - 30 Minutes"
    title: string;
    description: string;
    agency: 'Transport' | 'Hospitality' | 'Police/Security' | 'Citizen Communications';
    iconName: string;
    status: 'ready' | 'simulating' | 'active' | 'completed';
  }[];
  projectedMetrics: {
    zoneAPressureBefore: number;
    zoneAPressureAfter: number;
    zoneDPressureBefore: number;
    zoneDPressureAfter: number;
  };
}

export interface IntelligentAlert {
  id: string;
  severity: 'critical' | 'warning' | 'opportunity';
  title: string;
  zone: string;
  timestamp: string;
  etaToPeak: string;
  why: string;
  impact: string;
  recommendedAction: string;
  actionPayloadId?: string;
  resolved: boolean;
}

export interface TransportRoute {
  id: string;
  name: string;
  tag: 'FASTEST' | 'LOWEST CROWD' | 'AI RECOMMENDED';
  durationMinutes: number;
  crowdLevelPercent: number;
  reliabilityScore: number;
  mode: 'Metro Express' | 'Electric Shuttle B' | 'Dedicated Busway' | 'Pedestrian Skybridge';
  status: 'Optimal' | 'Congested' | 'Surging';
  waypoints: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nexus';
  timestamp: string;
  text: string;
  isStreaming?: boolean;
  visualCard?: {
    type: 'risk_meter' | 'route_recommendation' | 'zone_stat' | 'hospitality_redistribution' | string;
    data: any;
  };
  actions?: {
    label: string;
    actionKey: string;
  }[];
  decisionFactors?: {
    live_data: string;
    simulation_prediction: string;
    knowledge_retrieved: string;
    ai_reasoning: string;
  };
  knowledgeUsed?: {
    category: string;
    title?: string;
    relevance: number;
    snippet?: string;
  }[];
  confidence?: number;
  riskLevel?: string;
  isThinking?: boolean;
}

