import { GeoLocationEntity, TrafficCorridor, RiskZone, GeoScenario } from '../types/geoTwin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Embedded high-fidelity Mumbai fallback dataset
export const FALLBACK_MUMBAI_GEO = {
  event_id: 'mumbai-sports',
  name: 'Mumbai International Sports Festival & Tech Summit',
  center: [72.8683, 19.0657] as [number, number],
  venues: [
    {
      id: 'loc-venue-1',
      name: 'Jio World Convention Centre',
      entity_type: 'venue' as const,
      coordinates: [72.8683, 19.0657] as [number, number],
      address: 'G Block BKC, Bandra Kurla Complex, Mumbai',
      capacity: 10000,
      expected_attendance: 8500,
      current_pressure: 78,
      predicted_pressure: 92,
      risk_level: 'HIGH' as const,
      status: 'INGRESS',
      metadata: {
        indoor: true,
        gates: 8,
        active_turnstiles: 24,
        satellite_preview: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80'
      }
    },
    {
      id: 'loc-venue-2',
      name: 'Wankhede Stadium Grand Arena',
      entity_type: 'venue' as const,
      coordinates: [72.8258, 18.9322] as [number, number],
      address: 'Vinoo Mankad Rd, Churchgate, Mumbai',
      capacity: 33100,
      expected_attendance: 32000,
      current_pressure: 88,
      predicted_pressure: 96,
      risk_level: 'CRITICAL' as const,
      status: 'LIVE',
      metadata: {
        indoor: false,
        gates: 12,
        active_turnstiles: 36,
        satellite_preview: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=400&q=80'
      }
    },
    {
      id: 'loc-venue-3',
      name: 'BKC Open-Air Megaplex',
      entity_type: 'venue' as const,
      coordinates: [72.8620, 19.0680] as [number, number],
      address: 'MMRDA Grounds, BKC, Mumbai',
      capacity: 25000,
      expected_attendance: 21000,
      current_pressure: 72,
      predicted_pressure: 85,
      risk_level: 'MODERATE' as const,
      status: 'INGRESS',
      metadata: {
        indoor: false,
        gates: 6,
        active_turnstiles: 18,
        satellite_preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'
      }
    }
  ],
  hotels: [
    {
      id: 'loc-hotel-1',
      name: 'Trident Hotel BKC',
      entity_type: 'hotel' as const,
      coordinates: [72.8690, 19.0665] as [number, number],
      address: 'C-56, G Block, BKC, Mumbai',
      capacity: 436,
      occupancy_percent: 96,
      available_rooms: 17,
      avg_rate: '$390/night',
      distance_km: 0.2,
      metadata: { stars: 5, surge_active: true, shuttle_connected: true }
    },
    {
      id: 'loc-hotel-2',
      name: 'Sofitel Mumbai BKC',
      entity_type: 'hotel' as const,
      coordinates: [72.8665, 19.0672] as [number, number],
      address: 'C-57, Bandra Kurla Complex, Mumbai',
      capacity: 302,
      occupancy_percent: 94,
      available_rooms: 18,
      avg_rate: '$410/night',
      distance_km: 0.3,
      metadata: { stars: 5, surge_active: true, shuttle_connected: true }
    },
    {
      id: 'loc-hotel-3',
      name: 'Grand Hyatt Mumbai',
      entity_type: 'hotel' as const,
      coordinates: [72.8530, 19.0760] as [number, number],
      address: 'Western Express Highway, Santacruz East',
      capacity: 547,
      occupancy_percent: 88,
      available_rooms: 65,
      avg_rate: '$290/night',
      distance_km: 2.4,
      metadata: { stars: 5, surge_active: false, shuttle_connected: true }
    },
    {
      id: 'loc-hotel-4',
      name: 'Taj Lands End Bandra',
      entity_type: 'hotel' as const,
      coordinates: [72.8190, 19.0435] as [number, number],
      address: 'BJ Road, Bandstand, Bandra West',
      capacity: 493,
      occupancy_percent: 98,
      available_rooms: 10,
      avg_rate: '$520/night',
      distance_km: 4.8,
      metadata: { stars: 5, surge_active: true, shuttle_connected: true }
    },
    {
      id: 'loc-hotel-5',
      name: 'Zone D Northern Eco Resort Hub',
      entity_type: 'hotel' as const,
      coordinates: [72.8500, 19.1600] as [number, number],
      address: 'Eco Gateway Sector 4, Northern Corridor',
      capacity: 2800,
      occupancy_percent: 44,
      available_rooms: 1240,
      avg_rate: '$160/night',
      distance_km: 11.2,
      metadata: { stars: 4, surge_active: false, surplus_target: true, voucher_active: true, discount_percent: 15 }
    }
  ],
  transport: [
    {
      id: 'loc-trans-1',
      name: 'BKC Metro Interchange (Line 3)',
      entity_type: 'metro' as const,
      coordinates: [72.8640, 19.0650] as [number, number],
      address: 'BKC Underground Concourse, Mumbai',
      capacity_per_hour: 18000,
      current_load_percent: 78,
      headway_minutes: 3.0,
      status: 'Optimal',
      metadata: { lines: ['Aqua Line 3'], accessible: true }
    },
    {
      id: 'loc-trans-2',
      name: 'Andheri Metro Interchange (Line 1 & 2)',
      entity_type: 'metro' as const,
      coordinates: [72.8468, 19.1197] as [number, number],
      address: 'Western Express Highway, Andheri East',
      capacity_per_hour: 24000,
      current_load_percent: 89,
      headway_minutes: 2.2,
      status: 'Surging',
      metadata: { lines: ['Blue Line 1', 'Yellow Line 2A'], critical_junction: true }
    },
    {
      id: 'loc-trans-3',
      name: 'Bandra Terminus Railway Hub',
      entity_type: 'rail' as const,
      coordinates: [72.8410, 19.0620] as [number, number],
      address: 'Naupada, Bandra East, Mumbai',
      capacity_per_hour: 22000,
      current_load_percent: 84,
      headway_minutes: 5.0,
      status: 'Congested',
      metadata: { platforms: 7 }
    },
    {
      id: 'loc-trans-4',
      name: 'Chhatrapati Shivaji Maharaj Airport (CSMIA)',
      entity_type: 'airport' as const,
      coordinates: [72.8656, 19.0896] as [number, number],
      address: 'Sahar, Andheri East, Mumbai',
      capacity_per_hour: 15000,
      current_load_percent: 68,
      headway_minutes: 0,
      status: 'Optimal',
      metadata: { terminals: ['T1 Domestic', 'T2 International'] }
    },
    {
      id: 'loc-trans-5',
      name: 'BKC Multi-Level Parking G-Block',
      entity_type: 'parking' as const,
      coordinates: [72.8670, 19.0680] as [number, number],
      address: 'Behind Jio Convention Centre, BKC',
      capacity_per_hour: 2400,
      current_load_percent: 36,
      headway_minutes: 0,
      status: 'Optimal',
      metadata: { available_spots: 1536, ev_charging: 48 }
    },
    {
      id: 'loc-trans-6',
      name: 'Zone D Rapid Transit Depot',
      entity_type: 'bus_hub' as const,
      coordinates: [72.8480, 19.1580] as [number, number],
      address: 'Northern Eco Corridor Depot 9',
      capacity_per_hour: 9000,
      current_load_percent: 32,
      headway_minutes: 4.0,
      status: 'Optimal',
      metadata: { active_electric_shuttles: 45, surplus_fleet: true }
    }
  ],
  traffic_corridors: [
    {
      id: 'corridor-weh',
      name: 'Western Express Highway Transit Ribbon',
      from_coord: [72.8468, 19.1197] as [number, number],
      to_coord: [72.8640, 19.0650] as [number, number],
      congestion_level: 86,
      avg_speed_kmh: 18,
      delay_minutes: 24,
      risk: 'HIGH' as const
    },
    {
      id: 'corridor-bkc-connector',
      name: 'BKC Elevated Flyover Connector',
      from_coord: [72.8410, 19.0620] as [number, number],
      to_coord: [72.8683, 19.0657] as [number, number],
      congestion_level: 74,
      avg_speed_kmh: 32,
      delay_minutes: 11,
      risk: 'MODERATE' as const
    },
    {
      id: 'corridor-zone-d-bypass',
      name: 'Northern Eco Express Smart Skyway',
      from_coord: [72.8683, 19.0657] as [number, number],
      to_coord: [72.8500, 19.1600] as [number, number],
      congestion_level: 34,
      avg_speed_kmh: 68,
      delay_minutes: 2,
      risk: 'STABLE' as const
    }
  ],
  risk_zones: [
    {
      id: 'risk-bkc-core',
      name: 'BKC Transport & Venue Concourse',
      center: [72.8683, 19.0657] as [number, number],
      radius_meters: 650,
      current_pressure: 82,
      predicted_pressure_30m: 94,
      risk_level: 'CRITICAL' as const,
      factors: [
        'Event egress convergence (8,500 pax)',
        'Heavy rain surface speed reduction (-38%)',
        'Metro concourse saturation (78% -> 91%)'
      ],
      recommended_action: 'Activate Shuttle Route B & toggle biometric turnstiles.'
    },
    {
      id: 'risk-andheri-axis',
      name: 'Andheri Metro Interchange Axis',
      center: [72.8468, 19.1197] as [number, number],
      radius_meters: 500,
      current_pressure: 68,
      predicted_pressure_30m: 91,
      risk_level: 'HIGH' as const,
      factors: [
        'Line 2 headway compression needed',
        'Turnstile inflow surge in 37 mins',
        'Busway bridge transfer bottleneck'
      ],
      recommended_action: 'Deploy 40 auxiliary perimeter buses to Western Highway.'
    },
    {
      id: 'risk-bandra-hospitality',
      name: 'Bandra Coastal Hospitality Sector',
      center: [72.8190, 19.0435] as [number, number],
      radius_meters: 800,
      current_pressure: 76,
      predicted_pressure_30m: 84,
      risk_level: 'MODERATE' as const,
      factors: [
        'Hotel occupancy at 98%',
        'Walk-in dining reservation deficit',
        'Coastal road private vehicle accumulation'
      ],
      recommended_action: 'Broadcast Zone D 15% discount hospitality voucher.'
    }
  ]
};

class GeoApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
  }

  async fetchLocations(): Promise<any> {
    if (!IS_DEMO_MODE) {
      try {
        const res = await fetch(`${this.baseUrl}/api/geo/locations`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[GEO API] Using local Mumbai spatial fallback:', e);
      }
    }
    return FALLBACK_MUMBAI_GEO;
  }

  async fetchEventGeoJson(eventId: string = 'mumbai-sports', scenario: GeoScenario = 'normal', timeOffset: number = 0): Promise<any> {
    if (!IS_DEMO_MODE) {
      try {
        const res = await fetch(`${this.baseUrl}/api/geo/event/${eventId}?scenario=${scenario}&time_offset=${timeOffset}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[GEO API] GeoJSON endpoint unavailable, building client-side GeoJSON:', e);
      }
    }
    return this.buildFallbackGeoJson(scenario, timeOffset);
  }

  async analyzeRegion(bbox: number[] = [72.80, 18.90, 72.90, 19.20], scenario: GeoScenario = 'normal'): Promise<any> {
    if (!IS_DEMO_MODE) {
      try {
        const res = await fetch(`${this.baseUrl}/api/geo/analyze-region`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bbox, scenario }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[GEO API] Regional analysis endpoint fallback:', e);
      }
    }
    return {
      source: 'NEXUS Spatial Analysis Engine (GEE-Compatible Schema)',
      dataset: 'Sentinel-2 MultiSpectral + ALOS AW3D30 Elevation Model',
      indicators: {
        elevation_mean_meters: 11.8,
        impervious_surface_percent: 84.6,
        coastal_flood_susceptibility: scenario === 'heavy_rain' ? 'HIGH' : 'LOW',
        flood_risk_score: scenario === 'heavy_rain' ? 78.4 : 24.1
      },
      operational_impact: {
        road_friction_reduction_pct: scenario === 'heavy_rain' ? 38.0 : 0.0,
        drainage_pump_stations_required: scenario === 'heavy_rain' ? 8 : 0
      }
    };
  }

  private buildFallbackGeoJson(scenario: GeoScenario, timeOffset: number) {
    const timeMult = 1.0 + (timeOffset / 60.0) * 0.22;
    const scenarioMult = scenario === 'early_exit' ? 1.25 : scenario === 'heavy_rain' ? 1.30 : scenario === 'metro_disruption' ? 1.35 : 1.0;

    const features: any[] = [];

    // Venues
    FALLBACK_MUMBAI_GEO.venues.forEach(v => {
      const p = Math.min(100, Math.round(v.current_pressure * timeMult * scenarioMult));
      features.push({
        type: 'Feature',
        id: v.id,
        geometry: { type: 'Point', coordinates: v.coordinates },
        properties: {
          feature_type: 'venue',
          name: v.name,
          capacity: v.capacity,
          current_pressure: p,
          risk_level: p >= 85 ? 'CRITICAL' : p >= 70 ? 'HIGH' : 'MODERATE',
          address: v.address,
          status: v.status,
          metadata: v.metadata
        }
      });
    });

    // Hotels
    FALLBACK_MUMBAI_GEO.hotels.forEach(h => {
      features.push({
        type: 'Feature',
        id: h.id,
        geometry: { type: 'Point', coordinates: h.coordinates },
        properties: {
          feature_type: 'hotel',
          name: h.name,
          capacity: h.capacity,
          occupancy_percent: h.occupancy_percent,
          available_rooms: h.available_rooms,
          avg_rate: h.avg_rate,
          distance_km: h.distance_km,
          address: h.address,
          metadata: h.metadata
        }
      });
    });

    // Transport
    FALLBACK_MUMBAI_GEO.transport.forEach(t => {
      features.push({
        type: 'Feature',
        id: t.id,
        geometry: { type: 'Point', coordinates: t.coordinates },
        properties: {
          feature_type: 'transport',
          name: t.name,
          entity_type: t.entity_type,
          capacity_per_hour: t.capacity_per_hour,
          current_load_percent: t.current_load_percent,
          headway_minutes: t.headway_minutes,
          status: t.status,
          address: t.address,
          metadata: t.metadata
        }
      });
    });

    // Corridors
    FALLBACK_MUMBAI_GEO.traffic_corridors.forEach(c => {
      features.push({
        type: 'Feature',
        id: c.id,
        geometry: { type: 'LineString', coordinates: [c.from_coord, c.to_coord] },
        properties: {
          feature_type: 'traffic_corridor',
          name: c.name,
          congestion_level: c.congestion_level,
          avg_speed_kmh: c.avg_speed_kmh,
          delay_minutes: c.delay_minutes,
          risk: c.risk
        }
      });
    });

    return {
      type: 'FeatureCollection',
      metadata: {
        event_id: 'mumbai-sports',
        scenario,
        time_offset_minutes: timeOffset,
        data_integrity: {
          imagery_source: 'Satellite Basemap (Real Geographic Context)',
          telemetry_source: 'Simulated & Algorithmic Operational Layer',
          is_live_satellite_crowd_tracking: false
        }
      },
      features
    };
  }
}

export const geoApi = new GeoApiService();
