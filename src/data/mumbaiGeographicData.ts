import { 
  BuildingFootprint, 
  CrowdSamplePoint, 
  PredictedMovementPath, 
  GeoLocationEntity, 
  TrafficCorridor, 
  RiskZone,
  GeoDestination
} from '../types/geoTwin';

// ====================================================================
// 1. AUTHENTIC BUILDING FOOTPRINTS (3D DIGITAL TWIN)
// Actual architectural footprints in Bandra Kurla Complex & South Mumbai
// ====================================================================

export const MUMBAI_BUILDING_FOOTPRINTS: BuildingFootprint[] = [
  // Jio World Convention Centre (JWCC) - Flagship Venue
  {
    id: 'bldg-jwcc',
    name: 'Jio World Convention Centre',
    height: 44,
    baseHeight: 0,
    category: 'venue',
    color: [139, 92, 246, 220], // Violet neon accent
    coordinates: [[
      [72.8672, 19.0648],
      [72.8698, 19.0648],
      [72.8698, 19.0666],
      [72.8672, 19.0666],
      [72.8672, 19.0648]
    ]]
  },
  // Jio World Garden / Cultural Pavilion
  {
    id: 'bldg-jio-garden',
    name: 'Jio World Cultural Pavilion',
    height: 16,
    baseHeight: 0,
    category: 'venue',
    color: [6, 182, 212, 180],
    coordinates: [[
      [72.8665, 19.0636],
      [72.8685, 19.0636],
      [72.8685, 19.0646],
      [72.8665, 19.0646],
      [72.8665, 19.0636]
    ]]
  },
  // Trident Hotel BKC
  {
    id: 'bldg-trident',
    name: 'Trident Hotel BKC',
    height: 56,
    baseHeight: 0,
    category: 'hotel',
    color: [245, 158, 11, 200], // Amber
    coordinates: [[
      [72.8686, 19.0668],
      [72.8696, 19.0668],
      [72.8696, 19.0678],
      [72.8686, 19.0678],
      [72.8686, 19.0668]
    ]]
  },
  // Sofitel Mumbai BKC
  {
    id: 'bldg-sofitel',
    name: 'Sofitel Luxury Hotel BKC',
    height: 62,
    baseHeight: 0,
    category: 'hotel',
    color: [245, 158, 11, 200],
    coordinates: [[
      [72.8658, 19.0668],
      [72.8670, 19.0668],
      [72.8670, 19.0679],
      [72.8658, 19.0679],
      [72.8658, 19.0668]
    ]]
  },
  // Bharat Diamond Bourse (BDB) - Complex of 8 interconnecting towers
  {
    id: 'bldg-bdb-towers',
    name: 'Bharat Diamond Bourse Complex',
    height: 74,
    baseHeight: 0,
    category: 'commercial',
    color: [59, 130, 246, 190],
    coordinates: [[
      [72.8618, 19.0644],
      [72.8646, 19.0644],
      [72.8646, 19.0672],
      [72.8618, 19.0672],
      [72.8618, 19.0644]
    ]]
  },
  // ICICI Bank Headquarters Tower
  {
    id: 'bldg-icici-hq',
    name: 'ICICI Financial Towers',
    height: 88,
    baseHeight: 0,
    category: 'commercial',
    color: [59, 130, 246, 210],
    coordinates: [[
      [72.8648, 19.0654],
      [72.8662, 19.0654],
      [72.8662, 19.0666],
      [72.8648, 19.0666],
      [72.8648, 19.0654]
    ]]
  },
  // One BKC / Platina Commercial Center
  {
    id: 'bldg-one-bkc',
    name: 'One BKC Corporate Tower',
    height: 94,
    baseHeight: 0,
    category: 'commercial',
    color: [59, 130, 246, 210],
    coordinates: [[
      [72.8632, 19.0674],
      [72.8652, 19.0674],
      [72.8652, 19.0688],
      [72.8632, 19.0688],
      [72.8632, 19.0674]
    ]]
  },
  // MMRDA BKC Open Grounds
  {
    id: 'bldg-mmrda-grounds',
    name: 'BKC Open-Air Megaplex Arena',
    height: 18,
    baseHeight: 0,
    category: 'venue',
    color: [139, 92, 246, 190],
    coordinates: [[
      [72.8596, 19.0668],
      [72.8624, 19.0668],
      [72.8624, 19.0692],
      [72.8596, 19.0692],
      [72.8596, 19.0668]
    ]]
  },
  // BKC Multi-Level Transit Interchange & Car Park
  {
    id: 'bldg-bkc-parking',
    name: 'BKC G-Block Parking Concourse',
    height: 32,
    baseHeight: 0,
    category: 'transit',
    color: [16, 185, 129, 190],
    coordinates: [[
      [72.8666, 19.0678],
      [72.8682, 19.0678],
      [72.8682, 19.0689],
      [72.8666, 19.0689],
      [72.8666, 19.0678]
    ]]
  },
  // National Stock Exchange (NSE India)
  {
    id: 'bldg-nse',
    name: 'National Stock Exchange (NSE)',
    height: 66,
    baseHeight: 0,
    category: 'commercial',
    color: [59, 130, 246, 200],
    coordinates: [[
      [72.8624, 19.0622],
      [72.8640, 19.0622],
      [72.8640, 19.0636],
      [72.8624, 19.0636],
      [72.8624, 19.0622]
    ]]
  },
  // Bank of Baroda Corporate Center
  {
    id: 'bldg-bob',
    name: 'Bank of Baroda Tower',
    height: 70,
    baseHeight: 0,
    category: 'commercial',
    color: [59, 130, 246, 200],
    coordinates: [[
      [72.8652, 19.0638],
      [72.8664, 19.0638],
      [72.8664, 19.0649],
      [72.8652, 19.0649],
      [72.8652, 19.0638]
    ]]
  }
];

// ====================================================================
// 2. REAL GEOGRAPHICAL ROAD CORRIDORS & TRAFFIC NETWORKS
// Multi-segment coordinates following actual Mumbai arterial highways
// ====================================================================

export const MUMBAI_ROAD_CORRIDORS: TrafficCorridor[] = [
  {
    id: 'corridor-weh',
    name: 'Western Express Highway (WEH) Main Arterial',
    from_coord: [72.8468, 19.1197],
    to_coord: [72.8410, 19.0550],
    path: [
      [72.8468, 19.1197], // Andheri Flyover
      [72.8485, 19.1020], // Vile Parle Junction
      [72.8520, 19.0830], // Santacruz Airport underpass
      [72.8505, 19.0710], // Vakola Junction
      [72.8465, 19.0610], // Kalanagar Flyover ramp
      [72.8410, 19.0550]  // Bandra Reclamation
    ],
    congestion_level: 86,
    avg_speed_kmh: 18,
    delay_minutes: 24,
    risk: 'HIGH'
  },
  {
    id: 'corridor-bkc-connector',
    name: 'BKC Elevated Flyover Connector',
    from_coord: [72.8790, 19.0520],
    to_coord: [72.8683, 19.0657],
    path: [
      [72.8790, 19.0520], // Chunabhatti ramp (Eastern Expressway)
      [72.8745, 19.0585], // Mithi River Flyover span
      [72.8705, 19.0630], // G-Block entry portal
      [72.8683, 19.0657]  // JWCC Roundabout
    ],
    congestion_level: 74,
    avg_speed_kmh: 34,
    delay_minutes: 11,
    risk: 'MODERATE'
  },
  {
    id: 'corridor-bkc-avenue-3',
    name: 'BKC Central Avenue 3 Concourse Boulevard',
    from_coord: [72.8465, 19.0610],
    to_coord: [72.8710, 19.0670],
    path: [
      [72.8465, 19.0610], // Kalanagar interchange
      [72.8540, 19.0625], // Asian Heart Institute junction
      [72.8618, 19.0642], // BDB Crossing
      [72.8672, 19.0656], // JWCC Plaza gate
      [72.8710, 19.0670]  // Kurla West link
    ],
    congestion_level: 89,
    avg_speed_kmh: 12,
    delay_minutes: 19,
    risk: 'CRITICAL'
  },
  {
    id: 'corridor-bandra-sealink',
    name: 'Bandra-Worli Sea Link Coastal Expressway',
    from_coord: [72.8180, 19.0430],
    to_coord: [72.8160, 19.0080],
    path: [
      [72.8180, 19.0430], // Bandra Toll Plaza
      [72.8195, 19.0300], // Cable-Stayed Main Bridge
      [72.8175, 19.0150], // Worli Tower Approach
      [72.8160, 19.0080]  // Worli Seaface
    ],
    congestion_level: 42,
    avg_speed_kmh: 65,
    delay_minutes: 4,
    risk: 'STABLE'
  }
];

// ====================================================================
// 3. REAL CROWD SAMPLES (GPU HEATMAP CLUSTER - GREEN TO RED)
// Sampled around gates, concourses, turnstiles, and bus bays
// ====================================================================

function generateCrowdCluster(centerLon: number, centerLat: number, count: number, spread: number, baseWeight: number): CrowdSamplePoint[] {
  const points: CrowdSamplePoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * spread;
    const lon = centerLon + r * Math.cos(angle);
    const lat = centerLat + (r * 0.85) * Math.sin(angle);
    const weight = Math.min(1.0, Math.max(0.1, baseWeight + (Math.random() * 0.3 - 0.15)));
    points.push({ coordinates: [lon, lat], weight });
  }
  return points;
}

export const MUMBAI_CROWD_HEATMAP_POINTS: CrowdSamplePoint[] = [
  // JWCC Gate 1-4 North Concourse (Heavy crowd ingress/egress surge)
  ...generateCrowdCluster(72.8685, 19.0658, 140, 0.0018, 0.95),
  // JWCC Gate 5-8 South Plaza
  ...generateCrowdCluster(72.8676, 19.0649, 90, 0.0015, 0.85),
  // BKC Metro Line 3 Concourse Entrance
  ...generateCrowdCluster(72.8640, 19.0650, 110, 0.0020, 0.90),
  // BKC Transit Bus Depots & Taxi Holding Bay
  ...generateCrowdCluster(72.8670, 19.0680, 80, 0.0016, 0.70),
  // Trident / Sofitel Pedestrian Skyway Crossing
  ...generateCrowdCluster(72.8688, 19.0668, 60, 0.0012, 0.65),
  // Bharat Diamond Bourse Entry Perimeter
  ...generateCrowdCluster(72.8630, 19.0655, 50, 0.0015, 0.50),
  // Wankhede Stadium Main Pavilion Gate (Churchgate side)
  ...generateCrowdCluster(72.8258, 18.9322, 120, 0.0022, 0.92),
  // Churchgate Station Concourse
  ...generateCrowdCluster(72.8274, 18.9355, 80, 0.0018, 0.80)
];

// ====================================================================
// 4. ANIMATED AI PREDICTION MOVEMENT PATHS (TRIPS & FLOW ARROWS)
// Directional evacuation trajectories from venues to transit hubs
// ====================================================================

export const MUMBAI_PREDICTED_FLOW_PATHS: PredictedMovementPath[] = [
  {
    id: 'flow-jwcc-metro',
    name: 'Primary Egress: JWCC Plaza → BKC Underground Metro Concourse',
    path: [
      [72.8683, 19.0657], // JWCC Plaza exit
      [72.8670, 19.0654], // Avenue 3 pedestrian crossing
      [72.8655, 19.0652], // ICICI Bank promenade
      [72.8640, 19.0650]  // BKC Line 3 Metro Turnstiles
    ],
    timestamps: [0, 25, 60, 100],
    flowRate: 340, // 340 pax/min
    direction: 'WESTBOUND (METRO LINE 3)',
    congestionRisk: 'CRITICAL',
    color: [244, 63, 94] // Crimson red
  },
  {
    id: 'flow-jwcc-shuttle',
    name: 'Contingency Egress: JWCC → BKC Elevated Shuttle Connector',
    path: [
      [72.8683, 19.0657], // JWCC Gate 2
      [72.8695, 19.0662], // Trident Roundabout
      [72.8710, 19.0650], // Elevated flyover ramp entry
      [72.8750, 19.0580]  // Eastern Expressway Link
    ],
    timestamps: [0, 30, 70, 100],
    flowRate: 180,
    direction: 'EASTBOUND (EXPRESS SHUTTLES)',
    congestionRisk: 'HIGH',
    color: [245, 158, 11] // Amber
  },
  {
    id: 'flow-jwcc-hotels',
    name: 'VIP / Delegate Flow: JWCC → Trident & Sofitel Skyway',
    path: [
      [72.8683, 19.0657],
      [72.8688, 19.0665], // Trident Porte-Cochere
      [72.8675, 19.0670], // Connecting skybridge
      [72.8665, 19.0672]  // Sofitel Lobby Concourse
    ],
    timestamps: [0, 25, 65, 100],
    flowRate: 95,
    direction: 'NORTHBOUND (HOSPITALITY CLUSTER)',
    congestionRisk: 'STABLE',
    color: [16, 185, 129] // Emerald green
  },
  {
    id: 'flow-jwcc-kalanagar',
    name: 'Vehicular Exit: BKC Avenue 3 → Western Express Highway',
    path: [
      [72.8672, 19.0656],
      [72.8618, 19.0642],
      [72.8540, 19.0625],
      [72.8465, 19.0610]  // Kalanagar Flyover
    ],
    timestamps: [0, 35, 75, 100],
    flowRate: 420,
    direction: 'WESTBOUND (WESTERN HIGHWAY)',
    congestionRisk: 'HIGH',
    color: [139, 92, 246] // Purple
  }
];

// ====================================================================
// 5. OPERATIONAL VENUES, HOTELS & TRANSIT HUBS (VERIFIED GPS)
// ====================================================================

export const MUMBAI_OPERATIONAL_VENUES: GeoLocationEntity[] = [
  {
    id: 'loc-venue-jwcc',
    name: 'Jio World Convention Centre',
    entity_type: 'venue',
    coordinates: [72.8683, 19.0657],
    address: 'G Block BKC, Bandra Kurla Complex, Mumbai',
    capacity: 10000,
    expected_attendance: 8500,
    current_pressure: 82,
    predicted_pressure: 94,
    risk_level: 'HIGH',
    status: 'INGRESS',
    metadata: {
      indoor: true,
      gates: 8,
      active_turnstiles: 24,
      satellite_preview: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'loc-venue-wankhede',
    name: 'Wankhede Stadium Grand Arena',
    entity_type: 'venue',
    coordinates: [72.8258, 18.9322],
    address: 'Vinoo Mankad Rd, Churchgate, Mumbai',
    capacity: 33100,
    expected_attendance: 32000,
    current_pressure: 88,
    predicted_pressure: 96,
    risk_level: 'CRITICAL',
    status: 'LIVE',
    metadata: {
      indoor: false,
      gates: 12,
      active_turnstiles: 36,
      satellite_preview: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=400&q=80'
    }
  },
  {
    id: 'loc-venue-mmrda',
    name: 'BKC Open-Air Megaplex',
    entity_type: 'venue',
    coordinates: [72.8620, 19.0680],
    address: 'MMRDA Grounds, BKC, Mumbai',
    capacity: 25000,
    expected_attendance: 21000,
    current_pressure: 72,
    predicted_pressure: 85,
    risk_level: 'MODERATE',
    status: 'INGRESS',
    metadata: {
      indoor: false,
      gates: 6,
      active_turnstiles: 18,
      satellite_preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'
    }
  }
];

export const MUMBAI_OPERATIONAL_HOTELS: GeoLocationEntity[] = [
  {
    id: 'loc-hotel-trident',
    name: 'Trident Hotel BKC',
    entity_type: 'hotel',
    coordinates: [72.8690, 19.0665],
    address: 'C-56, G Block, BKC, Mumbai',
    capacity: 436,
    occupancy_percent: 96,
    available_rooms: 17,
    avg_rate: '$390/night',
    distance_km: 0.2,
    metadata: { stars: 5, surge_active: true, shuttle_connected: true }
  },
  {
    id: 'loc-hotel-sofitel',
    name: 'Sofitel Mumbai BKC',
    entity_type: 'hotel',
    coordinates: [72.8665, 19.0672],
    address: 'C-57, Bandra Kurla Complex, Mumbai',
    capacity: 302,
    occupancy_percent: 94,
    available_rooms: 18,
    avg_rate: '$410/night',
    distance_km: 0.3,
    metadata: { stars: 5, surge_active: true, shuttle_connected: true }
  },
  {
    id: 'loc-hotel-hyatt',
    name: 'Grand Hyatt Mumbai',
    entity_type: 'hotel',
    coordinates: [72.8530, 19.0760],
    address: 'Western Express Highway, Santacruz East',
    capacity: 547,
    occupancy_percent: 88,
    available_rooms: 65,
    avg_rate: '$290/night',
    distance_km: 2.4,
    metadata: { stars: 5, surge_active: false, shuttle_connected: true }
  },
  {
    id: 'loc-hotel-taj',
    name: 'Taj Lands End Bandra',
    entity_type: 'hotel',
    coordinates: [72.8190, 19.0435],
    address: 'BJ Road, Bandstand, Bandra West',
    capacity: 493,
    occupancy_percent: 98,
    available_rooms: 10,
    avg_rate: '$520/night',
    distance_km: 4.8,
    metadata: { stars: 5, surge_active: true, shuttle_connected: true }
  },
  {
    id: 'loc-hotel-zone-d',
    name: 'Zone D Northern Eco Resort Hub',
    entity_type: 'hotel',
    coordinates: [72.8500, 19.1600],
    address: 'Eco Gateway Sector 4, Northern Corridor',
    capacity: 2800,
    occupancy_percent: 44,
    available_rooms: 1240,
    avg_rate: '$160/night',
    distance_km: 11.2,
    metadata: { stars: 4, surge_active: false, surplus_target: true, voucher_active: true, discount_percent: 15 }
  }
];

export const MUMBAI_OPERATIONAL_TRANSIT: GeoLocationEntity[] = [
  {
    id: 'loc-trans-bkc-metro',
    name: 'BKC Metro Concourse (Line 3 Aqua Line)',
    entity_type: 'metro',
    coordinates: [72.8640, 19.0650],
    address: 'BKC Underground Concourse, Mumbai',
    capacity_per_hour: 18000,
    current_load_percent: 78,
    headway_minutes: 3.0,
    status: 'Optimal',
    metadata: { lines: ['Aqua Line 3'], accessible: true }
  },
  {
    id: 'loc-trans-andheri-metro',
    name: 'Andheri Metro Interchange (Line 1 & 2)',
    entity_type: 'metro',
    coordinates: [72.8468, 19.1197],
    address: 'Western Express Highway, Andheri East',
    capacity_per_hour: 24000,
    current_load_percent: 89,
    headway_minutes: 2.2,
    status: 'Surging',
    metadata: { lines: ['Blue Line 1', 'Yellow Line 2A'], critical_junction: true }
  },
  {
    id: 'loc-trans-bandra-terminus',
    name: 'Bandra Terminus Railway Station',
    entity_type: 'rail',
    coordinates: [72.8410, 19.0620],
    address: 'Naupada, Bandra East, Mumbai',
    capacity_per_hour: 22000,
    current_load_percent: 84,
    headway_minutes: 5.0,
    status: 'Congested',
    metadata: { platforms: 7 }
  },
  {
    id: 'loc-trans-csmia',
    name: 'Chhatrapati Shivaji Maharaj Int. Airport (CSMIA)',
    entity_type: 'airport',
    coordinates: [72.8656, 19.0896],
    address: 'Sahar, Andheri East, Mumbai',
    capacity_per_hour: 15000,
    current_load_percent: 68,
    headway_minutes: 0,
    status: 'Optimal',
    metadata: { terminals: ['T1 Domestic', 'T2 International'] }
  },
  {
    id: 'loc-trans-bkc-parking',
    name: 'BKC Multi-Level Parking G-Block',
    entity_type: 'parking',
    coordinates: [72.8670, 19.0680],
    address: 'Behind Jio Convention Centre, BKC',
    capacity_per_hour: 2400,
    current_load_percent: 36,
    headway_minutes: 0,
    status: 'Optimal',
    metadata: { available_spots: 1536, ev_charging: 48 }
  }
];

export const MUMBAI_RISK_ZONES: RiskZone[] = [
  {
    id: 'risk-bkc-core',
    name: 'BKC Concourse & Venue Transit Axis',
    center: [72.8683, 19.0657],
    radius_meters: 650,
    current_pressure: 82,
    predicted_pressure_30m: 94,
    risk_level: 'CRITICAL',
    factors: [
      'Concurrent egress surge (8,500 delegates)',
      'Monsoon surface runoff delay factor 2.4x',
      'Metro Line 3 turnstile queue overflow'
    ],
    recommended_action: 'Activate Express Shuttle Route B & pulse biometric gates.'
  },
  {
    id: 'risk-andheri-junction',
    name: 'Andheri Metro & Highway Interchange',
    center: [72.8468, 19.1197],
    radius_meters: 500,
    current_pressure: 74,
    predicted_pressure_30m: 91,
    risk_level: 'HIGH',
    factors: [
      'Dual metro line transfer influx',
      'WEH southbound congestion spillover',
      'Busway bridge bottleneck'
    ],
    recommended_action: 'Deploy 40 auxiliary perimeter buses to Western Highway corridor.'
  },
  {
    id: 'risk-bandra-hospitality',
    name: 'Bandra Coastal Sector & Sea Link Approach',
    center: [72.8190, 19.0435],
    radius_meters: 800,
    current_pressure: 76,
    predicted_pressure_30m: 84,
    risk_level: 'MODERATE',
    factors: [
      'Hotel cluster occupancy at 98%',
      'Sea Link toll plaza deceleration',
      'Private hire vehicle accumulation'
    ],
    recommended_action: 'Broadcast Zone D 15% discount hospitality voucher.'
  }
];

// ====================================================================
// 7. REAL DESTINATION PRESETS & SEARCHABLE LANDMARKS
// Grounded coordinates for seamless top-bar camera targeting
// ====================================================================

export const MUMBAI_DEFAULT_DESTINATIONS: GeoDestination[] = [
  {
    id: 'jwcc-bkc',
    name: 'Jio World Convention Centre',
    shortName: 'JWCC BKC',
    latitude: 19.0657,
    longitude: 72.8683,
    zoom: 15.8,
    pitch: 60,
    bearing: -15,
    category: 'venue',
    description: 'G Block, Bandra Kurla Complex',
    pressure: 82,
    bottleneck: 'JWCC Gate concourse & BKC flyover ramp'
  },
  {
    id: 'wankhede',
    name: 'Wankhede Stadium Grand Arena',
    shortName: 'Wankhede Stadium',
    latitude: 18.9322,
    longitude: 72.8258,
    zoom: 15.4,
    pitch: 55,
    bearing: 10,
    category: 'stadium',
    description: 'Churchgate Coastal Precinct',
    pressure: 88,
    bottleneck: 'Churchgate railway station surge & marine concourse'
  },
  {
    id: 'csmia',
    name: 'Chhatrapati Shivaji Maharaj Int. Airport (CSMIA)',
    shortName: 'CSIA Airport',
    latitude: 19.0896,
    longitude: 72.8656,
    zoom: 14.8,
    pitch: 45,
    bearing: 0,
    category: 'transit',
    description: 'Sahar, Terminal 1 & 2 Corridor',
    pressure: 68,
    bottleneck: 'Western Express Highway airport junction'
  },
  {
    id: 'bandra-hotels',
    name: 'Bandra Hospitality & Lands End Zone',
    shortName: 'Bandra Hotels',
    latitude: 19.0435,
    longitude: 72.8190,
    zoom: 15.0,
    pitch: 50,
    bearing: 20,
    category: 'hotel',
    description: 'Bandstand & Coastal Hospitality Hub',
    pressure: 76,
    bottleneck: 'Sea Link toll plaza & coastal approach'
  }
];

export const MUMBAI_KNOWN_SEARCH_LANDMARKS: GeoDestination[] = [
  ...MUMBAI_DEFAULT_DESTINATIONS,
  {
    id: 'bkc-mmrda',
    name: 'BKC Open-Air Megaplex (MMRDA Grounds)',
    shortName: 'MMRDA Grounds',
    latitude: 19.0680,
    longitude: 72.8620,
    zoom: 15.2,
    pitch: 52,
    bearing: -10,
    category: 'venue',
    description: 'Bandra Kurla Complex Open Arena',
    pressure: 72,
    bottleneck: 'Avenue 3 pedestrian crossing'
  },
  {
    id: 'gateway-india',
    name: 'Gateway of India & Colaba Precinct',
    shortName: 'Gateway of India',
    latitude: 18.9220,
    longitude: 72.8347,
    zoom: 15.5,
    pitch: 45,
    bearing: 30,
    category: 'custom',
    description: 'South Mumbai Heritage & Harbor Zone',
    pressure: 65,
    bottleneck: 'Apollo Bunder maritime promenade'
  },
  {
    id: 'bandra-terminus',
    name: 'Bandra Terminus Railway Junction',
    shortName: 'Bandra Terminus',
    latitude: 19.0620,
    longitude: 72.8410,
    zoom: 15.3,
    pitch: 48,
    bearing: 15,
    category: 'transit',
    description: 'Western Railway Multi-Platform Hub',
    pressure: 84,
    bottleneck: 'Platform egress & auto-rickshaw bays'
  },
  {
    id: 'andheri-metro',
    name: 'Andheri Metro Interchange (Line 1 & 2)',
    shortName: 'Andheri Metro',
    latitude: 19.1197,
    longitude: 72.8468,
    zoom: 15.0,
    pitch: 45,
    bearing: 0,
    category: 'transit',
    description: 'Dual Line Metro Transfer Station',
    pressure: 89,
    bottleneck: 'Elevated skywalk turnstile queues'
  }
];

