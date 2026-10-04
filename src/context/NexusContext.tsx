import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  MegaEvent, 
  CityZone, 
  StakeholderRole, 
  MapLayerConfig, 
  SimulationParameters, 
  SimulationImpact, 
  AIResponsePlan, 
  IntelligentAlert, 
  TransportRoute 
} from '../types/nexus';
import { soundFx } from '../utils/audio';
import { speakTacticalBriefing, stopTacticalBriefing } from '../services/aiService';

export const MEGA_EVENTS: MegaEvent[] = [
  {
    id: 'mumbai-sports',
    name: 'Mumbai International Sports Festival',
    tagline: 'World Athletics Championship & Mega Cricket Showdown',
    location: 'Wankhede & BKC Megaplex, Mumbai',
    venueName: 'National Grand Stadium',
    scheduledTime: '19:42 IST',
    baseAttendees: 72480,
    hotelBaseDemand: 88,
    transportHubsCount: 14,
    status: 'LIVE'
  },
  {
    id: 'monaco-f1',
    name: 'Monaco Grand Prix World Championship',
    tagline: 'High-Velocity Street Circuit & VIP Nautical Hub',
    location: 'Circuit de Monaco, Monte Carlo',
    venueName: 'Harbor Grandstand Arena',
    scheduledTime: '15:10 CET',
    baseAttendees: 142000,
    hotelBaseDemand: 98,
    transportHubsCount: 8,
    status: 'LIVE'
  },
  {
    id: 'melbourne-cricket',
    name: 'Melbourne World Cup Final',
    tagline: 'Global Championship Final Match',
    location: 'Melbourne Sports Precinct, Victoria',
    venueName: 'Melbourne Cricket Ground (MCG)',
    scheduledTime: '20:30 AEDT',
    baseAttendees: 96800,
    hotelBaseDemand: 92,
    transportHubsCount: 12,
    status: 'LIVE'
  },
  {
    id: 'tomorrowland',
    name: 'Tomorrowland Global Electronic Festival',
    tagline: 'Multi-Stage 180,000 Attendee Sonic Odyssey',
    location: 'De Schorre, Boom, Belgium',
    venueName: 'The Mainstage Omniverse',
    scheduledTime: '22:15 CET',
    baseAttendees: 185000,
    hotelBaseDemand: 96,
    transportHubsCount: 22,
    status: 'LIVE'
  }
];

export const INITIAL_ZONES: CityZone[] = [
  {
    id: 'zone-venue',
    name: 'Stadium Grand Arena',
    district: 'Central Sports Core',
    type: 'venue',
    coordinates: { x: 0, y: 0, z: 0 },
    latLng: [18.9322, 72.8258],
    currentPressure: 88,
    predictedPressure: 96,
    riskLevel: 'CRITICAL',
    hotelCapacityPercent: 98,
    totalRooms: 3400,
    availableRooms: 68,
    avgRoomRate: '$480/night',
    transportLoadPercent: 94,
    activeVehicles: 640,
    stationCongestion: 96,
    restaurantDemandPercent: 92,
    availableTables: 14,
    parkingAvailabilityPercent: 4,
    crowdDensitySqMeter: 4.8,
    aiSummary: 'Primary stadium exit corridor nearing critical threshold. Ingress gates switching to egress in 32 minutes.',
    recommendedAction: 'Deploy crowd diversion skyway and activate perimeter buses.'
  },
  {
    id: 'zone-andheri',
    name: 'Andheri Metro Interchange',
    district: 'North Transport Axis',
    type: 'transport_hub',
    coordinates: { x: -8, y: 0, z: -10 },
    latLng: [19.1197, 72.8468],
    currentPressure: 68,
    predictedPressure: 91,
    riskLevel: 'HIGH',
    hotelCapacityPercent: 82,
    totalRooms: 4200,
    availableRooms: 756,
    avgRoomRate: '$240/night',
    transportLoadPercent: 89,
    activeVehicles: 1280,
    stationCongestion: 88,
    restaurantDemandPercent: 78,
    availableTables: 120,
    parkingAvailabilityPercent: 18,
    crowdDensitySqMeter: 3.2,
    aiSummary: 'Event exit patterns combined with metro arrival data indicate a significant transport surge in approximately 37 minutes.',
    recommendedAction: 'Activate Shuttle Route B & redirect visitors to Station C.'
  },
  {
    id: 'zone-bandra',
    name: 'Bandra Coastal Gateway',
    district: 'Hospitality & Commercial',
    type: 'hospitality',
    coordinates: { x: 9, y: 0, z: -6 },
    latLng: [19.0596, 72.8295],
    currentPressure: 82,
    predictedPressure: 89,
    riskLevel: 'HIGH',
    hotelCapacityPercent: 94,
    totalRooms: 5100,
    availableRooms: 306,
    avgRoomRate: '$390/night',
    transportLoadPercent: 88,
    activeVehicles: 940,
    stationCongestion: 84,
    restaurantDemandPercent: 76,
    availableTables: 48,
    parkingAvailabilityPercent: 12,
    crowdDensitySqMeter: 3.6,
    aiSummary: 'High hospitality concentration. Critical restaurant reservation deficit expected at 21:00.',
    recommendedAction: 'Incentivize dining reservation rollover to Zone D.'
  },
  {
    id: 'zone-bkc',
    name: 'BKC Business & Hotel Hub',
    district: 'Financial District',
    type: 'hospitality',
    coordinates: { x: 5, y: 0, z: 8 },
    latLng: [19.0657, 72.8683],
    currentPressure: 74,
    predictedPressure: 83,
    riskLevel: 'MODERATE',
    hotelCapacityPercent: 91,
    totalRooms: 6800,
    availableRooms: 612,
    avgRoomRate: '$350/night',
    transportLoadPercent: 76,
    activeVehicles: 850,
    stationCongestion: 72,
    restaurantDemandPercent: 84,
    availableTables: 190,
    parkingAvailabilityPercent: 28,
    crowdDensitySqMeter: 2.7,
    aiSummary: 'Corporate hotels near saturation. Surface taxi availability decreasing by 4% every 10 minutes.',
    recommendedAction: 'Authorize ride-share geo-surge perimeter pickup lanes.'
  },
  {
    id: 'zone-d',
    name: 'Zone D - Northern Eco Gateway',
    district: 'Buffer & Rapid Transit Zone',
    type: 'commercial',
    coordinates: { x: -14, y: 0, z: 12 },
    latLng: [19.1600, 72.8500],
    currentPressure: 42,
    predictedPressure: 55,
    riskLevel: 'STABLE',
    hotelCapacityPercent: 48,
    totalRooms: 2800,
    availableRooms: 1240,
    avgRoomRate: '$160/night',
    transportLoadPercent: 38,
    activeVehicles: 420,
    stationCongestion: 34,
    restaurantDemandPercent: 44,
    availableTables: 640,
    parkingAvailabilityPercent: 72,
    crowdDensitySqMeter: 1.1,
    aiSummary: 'Zone D has 1,240 available hotel rooms while Zone A is at 97% occupancy. Prime target for AI redistribution.',
    recommendedAction: 'Redirect 18% of incoming visitors toward Zone D with rapid express transit vouchers.'
  },
  {
    id: 'zone-terminal',
    name: 'Central Rail & Harbor Terminal',
    district: 'Intermodal Transit Hub',
    type: 'transport_hub',
    coordinates: { x: 14, y: 0, z: -14 },
    latLng: [18.9400, 72.8350],
    currentPressure: 71,
    predictedPressure: 86,
    riskLevel: 'HIGH',
    hotelCapacityPercent: 79,
    totalRooms: 3900,
    availableRooms: 819,
    avgRoomRate: '$210/night',
    transportLoadPercent: 91,
    activeVehicles: 1100,
    stationCongestion: 89,
    restaurantDemandPercent: 68,
    availableTables: 140,
    parkingAvailabilityPercent: 22,
    crowdDensitySqMeter: 3.4,
    aiSummary: 'Intermodal freight and passenger convergence. Platform 3-5 queuing time projected to exceed 22 minutes.',
    recommendedAction: 'Deploy 6 additional double-decker electric shuttle trains.'
  }
];

export const INITIAL_ALERTS: IntelligentAlert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    title: 'Metro Hub A predicted to exceed capacity in 18 minutes',
    zone: 'Andheri Metro Interchange',
    timestamp: '19:38:12',
    etaToPeak: '18 mins',
    why: 'Stadium final whistle egress surge combined with red-signal headway bottleneck on Line 2.',
    impact: 'Station concourse saturation, overflow into vehicular streets, and 45-minute platform queues.',
    recommendedAction: 'Deploy 24 perimeter auxiliary buses and toggle automated turnstile flow restrictors.',
    resolved: false
  },
  {
    id: 'alert-2',
    severity: 'warning',
    title: 'Hotel occupancy near venue exceeds 94%',
    zone: 'Bandra Coastal Gateway',
    timestamp: '19:35:45',
    etaToPeak: '40 mins',
    why: 'International VIP & corporate delegations booking contiguous room blocks without pre-cleared logistics.',
    impact: 'Severe room rate inflation ($650/night) and walk-in tourist displacement.',
    recommendedAction: 'Activate Zone D redistribution vouchers (15% discount + express transit shuttle).',
    resolved: false
  },
  {
    id: 'alert-3',
    severity: 'opportunity',
    title: 'Zone D has 1,240 available rooms and 72% parking surplus',
    zone: 'Zone D - Northern Eco Gateway',
    timestamp: '19:28:00',
    etaToPeak: 'Optimal now',
    why: 'Newly inaugurated eco-resort sector is under-indexed on global event ticketing aggregators.',
    impact: 'Can absorb 3,200 overnight visitors and lower Central Sector pressure by 19%.',
    recommendedAction: 'Broadcast dynamic incentive notification to visitor mobile companion apps.',
    resolved: false
  }
];

export const INITIAL_ROUTES: TransportRoute[] = [
  {
    id: 'route-a',
    name: 'Route A — Direct Central Corridor',
    tag: 'FASTEST',
    durationMinutes: 18,
    crowdLevelPercent: 92,
    reliabilityScore: 78,
    mode: 'Metro Express',
    status: 'Congested',
    waypoints: ['Arena Gate 1', 'Central Underpass', 'Metro Line 2 Platform', 'South Hub']
  },
  {
    id: 'route-b',
    name: 'Route B — Northern Perimeter Loop',
    tag: 'LOWEST CROWD',
    durationMinutes: 24,
    crowdLevelPercent: 41,
    reliabilityScore: 94,
    mode: 'Dedicated Busway',
    status: 'Optimal',
    waypoints: ['Arena Gate 4', 'Northern Boulevard', 'Autonomous Electric Shuttle', 'Station C']
  },
  {
    id: 'route-c',
    name: 'Route C — Multi-Modal Smart Skyway',
    tag: 'AI RECOMMENDED',
    durationMinutes: 21,
    crowdLevelPercent: 54,
    reliabilityScore: 98,
    mode: 'Pedestrian Skybridge',
    status: 'Optimal',
    waypoints: ['Elevated Concourse', 'Skybridge Walkway', 'Zone D Express Depot', 'Interchange 9']
  }
];

export const AI_RESPONSE_PLANS: AIResponsePlan[] = [
  {
    id: 'plan_a',
    title: 'Plan A: Surge Transport Capacity',
    subtitle: 'Fleet expansion & rapid headway modulation',
    strategyType: 'transport',
    expectedCongestionReduction: 21,
    dispatchTimeMinutes: 6,
    timelineSteps: [
      {
        timeOffset: 'T - 30 Minutes',
        title: 'Fleet Mobilization',
        description: 'Dispatch 40 reserve electric shuttles to Arena Gates 1 & 4.',
        agency: 'Transport',
        iconName: 'Bus',
        status: 'ready'
      },
      {
        timeOffset: 'T - 20 Minutes',
        title: 'Metro Headway Optimization',
        description: 'Compress Metro Line 2 intervals from 4.5 min down to 2.2 min.',
        agency: 'Transport',
        iconName: 'Train',
        status: 'ready'
      },
      {
        timeOffset: 'T - 15 Minutes',
        title: 'Express Corridor Clearance',
        description: 'Traffic lights prioritize transit arterial ribbons via automated green waves.',
        agency: 'Police/Security',
        iconName: 'Compass',
        status: 'ready'
      },
      {
        timeOffset: 'T - 5 Minutes',
        title: 'Full Ingress to Egress Switch',
        description: 'Reconfigure all turnstiles for unhindered tap-and-go clearance.',
        agency: 'Transport',
        iconName: 'CheckCircle',
        status: 'ready'
      }
    ],
    projectedMetrics: {
      zoneAPressureBefore: 88,
      zoneAPressureAfter: 76,
      zoneDPressureBefore: 42,
      zoneDPressureAfter: 45
    }
  },
  {
    id: 'plan_b',
    title: 'Plan B: Spatial Crowd Redistribution',
    subtitle: 'Perimeter dispersal & dynamic hospitality incentives',
    strategyType: 'crowd',
    expectedCongestionReduction: 34,
    dispatchTimeMinutes: 4,
    timelineSteps: [
      {
        timeOffset: 'T - 30 Minutes',
        title: 'Broadcast Targeted Push Prompts',
        description: 'Alert 28,000 visitors of delayed exit perks (concert afterparty / dining discounts).',
        agency: 'Citizen Communications',
        iconName: 'Radio',
        status: 'ready'
      },
      {
        timeOffset: 'T - 20 Minutes',
        title: 'Open Northern Skywalk Bypass',
        description: 'Redirect 35% of foot traffic away from congested South Terminal.',
        agency: 'Police/Security',
        iconName: 'Milestone',
        status: 'ready'
      },
      {
        timeOffset: 'T - 15 Minutes',
        title: 'Incentivize Zone D Hospitality',
        description: 'Activate free express shuttle voucher + $25 restaurant subsidy for Zone D.',
        agency: 'Hospitality',
        iconName: 'Utensils',
        status: 'ready'
      },
      {
        timeOffset: 'T - 5 Minutes',
        title: 'Activate Live Field Marshals',
        description: '80 AI-guided ground stewards positioned at critical decision junctions.',
        agency: 'Police/Security',
        iconName: 'Users',
        status: 'ready'
      }
    ],
    projectedMetrics: {
      zoneAPressureBefore: 88,
      zoneAPressureAfter: 68,
      zoneDPressureBefore: 42,
      zoneDPressureAfter: 58
    }
  },
  {
    id: 'plan_c',
    title: 'Plan C: Combined Dynamic Orchestration',
    subtitle: 'Integrated multi-agency synchronized intervention',
    strategyType: 'combined',
    isRecommended: true,
    expectedCongestionReduction: 52,
    dispatchTimeMinutes: 3,
    timelineSteps: [
      {
        timeOffset: 'T - 30 Minutes',
        title: 'Synchronized Inter-Agency Lock',
        description: 'Simultaneously deploy 45 electric buses and initialize Zone D hospitality vouchers.',
        agency: 'Transport',
        iconName: 'Zap',
        status: 'ready'
      },
      {
        timeOffset: 'T - 20 Minutes',
        title: 'Dynamic Geo-Fenced Mobile Guidance',
        description: 'Visitor companion app routes 40% of users to Skybridge Route C with zero wait time.',
        agency: 'Citizen Communications',
        iconName: 'Smartphone',
        status: 'ready'
      },
      {
        timeOffset: 'T - 15 Minutes',
        title: 'Autonomous Perimeter Gates & Green Waves',
        description: 'Synchronize 22 traffic intersections and open 16 biometric express turnstiles.',
        agency: 'Police/Security',
        iconName: 'ShieldAlert',
        status: 'ready'
      },
      {
        timeOffset: 'T - 5 Minutes',
        title: 'Active Surge Stabilization',
        description: 'City pressure index drops from 88% down to 54% in simulated 40-minute window.',
        agency: 'Hospitality',
        iconName: 'TrendingDown',
        status: 'ready'
      }
    ],
    projectedMetrics: {
      zoneAPressureBefore: 88,
      zoneAPressureAfter: 54,
      zoneDPressureBefore: 42,
      zoneDPressureAfter: 61
    }
  }
];

interface NexusContextType {
  currentEvent: MegaEvent;
  setEventId: (id: string) => void;
  zones: CityZone[];
  selectedZone: CityZone | null;
  setSelectedZone: (zone: CityZone | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStakeholder: StakeholderRole;
  setStakeholder: (role: StakeholderRole) => void;
  mapLayers: MapLayerConfig;
  toggleMapLayer: (key: keyof MapLayerConfig) => void;
  simulationParams: SimulationParameters;
  updateSimulationParams: (params: Partial<SimulationParameters>) => void;
  simulationImpact: SimulationImpact;
  resetSimulation: () => void;
  responsePlans: AIResponsePlan[];
  activePlan: AIResponsePlan;
  setActivePlan: (plan: AIResponsePlan) => void;
  executePlan: (plan: AIResponsePlan) => void;
  hasExecutedPlan: boolean;
  alerts: IntelligentAlert[];
  dismissAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  transportRoutes: TransportRoute[];
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
  isVoiceSpeaking: boolean;
  triggerVoiceBriefing: (customText?: string) => void;
  stopVoiceBriefing: () => void;
  liveTime: string;
  redistributionActive: boolean;
  executeRedistribution: () => void;
  activeCopilotOpen: boolean;
  setActiveCopilotOpen: (open: boolean) => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('mumbai-sports');
  const [zones, setZones] = useState<CityZone[]>(INITIAL_ZONES);
  const [selectedZone, setSelectedZone] = useState<CityZone | null>(INITIAL_ZONES[0]);
  const [activeTab, setActiveTab] = useState<string>('command');
  const [currentStakeholder, setStakeholder] = useState<StakeholderRole>('commander');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [hasExecutedPlan, setHasExecutedPlan] = useState<boolean>(false);
  const [redistributionActive, setRedistributionActive] = useState<boolean>(false);
  const [activeCopilotOpen, setActiveCopilotOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<IntelligentAlert[]>(INITIAL_ALERTS);

  const [mapLayers, setMapLayers] = useState<MapLayerConfig>({
    crowdDensity: true,
    hotelOccupancy: true,
    traffic: true,
    transportLoad: true,
    restaurantDemand: false,
    parkingAvailability: false,
    emergencyCorridors: true
  });

  const [simulationParams, setSimulationParams] = useState<SimulationParameters>({
    eventEndDeltaMinutes: 0,
    expectedAttendance: 72480,
    weather: 'clear',
    transportCapacityModifier: 1.0,
    hotelAvailabilityBuffer: 1.0,
    emergencyScenario: 'none'
  });

  const [activePlan, setActivePlan] = useState<AIResponsePlan>(AI_RESPONSE_PLANS[2]); // Plan C by default

  const currentEvent = useMemo(() => {
    return MEGA_EVENTS.find(e => e.id === selectedEventId) || MEGA_EVENTS[0];
  }, [selectedEventId]);

  // Live real-time clock simulation
  const [liveTime, setLiveTime] = useState<string>('19:42:15');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update audio muted in sound engine
  useEffect(() => {
    soundFx.isMuted = isAudioMuted;
  }, [isAudioMuted]);

  // Calculate dynamic simulation impact using prompt's mathematical formula:
  // Pressure = Crowd * 0.30 + Transport * 0.25 + Hotel * 0.15 + Traffic * 0.20 + Event * 0.10
  const simulationImpact = useMemo<SimulationImpact>(() => {
    const crowdFactor = (simulationParams.expectedAttendance / currentEvent.baseAttendees) * 100;
    const transportPressure = (1 / simulationParams.transportCapacityModifier) * 75;
    const hotelPressure = (1 / simulationParams.hotelAvailabilityBuffer) * 80;
    
    // Weather multiplier
    let weatherPenalty = 0;
    if (simulationParams.weather === 'monsoon') weatherPenalty = 25;
    if (simulationParams.weather === 'extreme_heat') weatherPenalty = 15;

    // Early exit scenario penalty
    let earlyExitPenalty = 0;
    if (simulationParams.eventEndDeltaMinutes < 0) {
      earlyExitPenalty = Math.abs(simulationParams.eventEndDeltaMinutes) * 0.8;
    }

    if (simulationParams.emergencyScenario === 'metro_glitch') transportPressure * 1.35;
    if (simulationParams.emergencyScenario === 'rain_storm') weatherPenalty = 30;

    const trafficPressure = Math.min(100, (crowdFactor * 0.6 + weatherPenalty * 0.8));

    // Dynamic weights from prompt specification
    const rawScore = (
      (crowdFactor * 0.30) +
      (transportPressure * 0.25) +
      (hotelPressure * 0.15) +
      (trafficPressure * 0.20) +
      (earlyExitPenalty * 0.10)
    );

    // Apply plan execution mitigation if approved
    const mitigation = hasExecutedPlan ? activePlan.expectedCongestionReduction : 0;
    const finalScore = Math.min(100, Math.max(20, Math.round(rawScore - mitigation)));

    let risk: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
    if (finalScore >= 85) risk = 'CRITICAL';
    else if (finalScore >= 70) risk = 'HIGH';
    else if (finalScore >= 50) risk = 'MODERATE';
    else risk = 'STABLE';

    // Delas
    const transportCongestionChange = Math.round(
      (simulationParams.eventEndDeltaMinutes < 0 ? 38 : 0) + 
      (simulationParams.weather === 'monsoon' ? 24 : 0) + 
      (simulationParams.transportCapacityModifier < 1 ? 20 : 0) -
      mitigation
    );

    const hotelCheckinSurgeChange = Math.round(
      (simulationParams.eventEndDeltaMinutes < 0 ? 22 : 8) + 
      (redistributionActive ? -19 : 0)
    );

    const trafficDelayMinutesChange = Math.round(
      (simulationParams.eventEndDeltaMinutes < 0 ? 31 : 12) +
      (simulationParams.weather === 'monsoon' ? 18 : 0) -
      (mitigation * 0.6)
    );

    const restaurantDemandChange = Math.round(
      (simulationParams.eventEndDeltaMinutes < 0 ? 17 : 9)
    );

    return {
      transportCongestionChange,
      hotelCheckinSurgeChange,
      trafficDelayMinutesChange,
      restaurantDemandChange,
      compositePressureScore: finalScore,
      riskClassification: risk
    };
  }, [simulationParams, currentEvent, hasExecutedPlan, activePlan, redistributionActive]);

  const toggleMapLayer = (key: keyof MapLayerConfig) => {
    soundFx.playClick();
    setMapLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSimulationParams = (params: Partial<SimulationParameters>) => {
    soundFx.playHover();
    setSimulationParams(prev => ({ ...prev, ...params }));
    setHasExecutedPlan(false); // Reset execution on parameter change
  };

  const resetSimulation = () => {
    soundFx.playClick();
    setSimulationParams({
      eventEndDeltaMinutes: 0,
      expectedAttendance: currentEvent.baseAttendees,
      weather: 'clear',
      transportCapacityModifier: 1.0,
      hotelAvailabilityBuffer: 1.0,
      emergencyScenario: 'none'
    });
    setHasExecutedPlan(false);
  };

  const executePlan = (plan: AIResponsePlan) => {
    soundFx.playSuccess();
    setActivePlan(plan);
    setHasExecutedPlan(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#0066FF', '#8B5CF6', '#10B981']
      });
    } catch {
      // ignore
    }

    // Trigger audio briefing
    triggerVoiceBriefing(`Tactical Plan ${plan.title} authorized. Coordinated multi-agency dispatch initiated. Projected city congestion reduction of ${plan.expectedCongestionReduction} percent over the next 40 minutes.`);
  };

  const executeRedistribution = () => {
    soundFx.playSuccess();
    setRedistributionActive(true);
    setZones(prev => prev.map(z => {
      if (z.id === 'zone-venue') {
        return { ...z, hotelCapacityPercent: 78, currentPressure: 72, riskLevel: 'MODERATE' };
      }
      if (z.id === 'zone-d') {
        return { ...z, hotelCapacityPercent: 61, currentPressure: 52, availableRooms: 940 };
      }
      return z;
    }));
    triggerVoiceBriefing(`Dynamic Hospitality Redistribution activated. 18 percent of incoming overnight visitors rerouted toward Zone D luxury eco-hub. Zone A pressure reduced to 78 percent.`);
  };

  const toggleAudioMute = () => {
    setIsAudioMuted(prev => !prev);
  };

  const triggerVoiceBriefing = (customText?: string) => {
    if (isAudioMuted) return;
    setIsVoiceSpeaking(true);
    const text = customText || `This is NEXUS Intelligence. Current city pressure is ${simulationImpact.compositePressureScore} percent with status ${simulationImpact.riskClassification}. Stadium perimeter and Metro Line 2 are under surveillance. All automated intervention protocols are primed.`;
    speakTacticalBriefing(text, () => {
      setIsVoiceSpeaking(false);
    });
  };

  const stopVoice = () => {
    stopTacticalBriefing();
    setIsVoiceSpeaking(false);
  };

  const dismissAlert = (id: string) => {
    soundFx.playClick();
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const resolveAlert = (id: string) => {
    soundFx.playSuccess();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <NexusContext.Provider
      value={{
        currentEvent,
        setEventId: (id) => {
          soundFx.playClick();
          setSelectedEventId(id);
          const ev = MEGA_EVENTS.find(e => e.id === id);
          if (ev) {
            setSimulationParams(p => ({ ...p, expectedAttendance: ev.baseAttendees }));
          }
        },
        zones,
        selectedZone,
        setSelectedZone: (zone) => {
          if (zone) soundFx.playClick();
          setSelectedZone(zone);
        },
        activeTab,
        setActiveTab: (tab) => {
          soundFx.playClick();
          setActiveTab(tab);
        },
        currentStakeholder,
        setStakeholder: (role) => {
          soundFx.playClick();
          setStakeholder(role);
        },
        mapLayers,
        toggleMapLayer,
        simulationParams,
        updateSimulationParams,
        simulationImpact,
        resetSimulation,
        responsePlans: AI_RESPONSE_PLANS,
        activePlan,
        setActivePlan,
        executePlan,
        hasExecutedPlan,
        alerts,
        dismissAlert,
        resolveAlert,
        transportRoutes: INITIAL_ROUTES,
        isAudioMuted,
        toggleAudioMute,
        isVoiceSpeaking,
        triggerVoiceBriefing,
        stopVoiceBriefing: stopVoice,
        liveTime,
        redistributionActive,
        executeRedistribution,
        activeCopilotOpen,
        setActiveCopilotOpen
      }}
    >
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
};
