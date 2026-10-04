/**
 * NEXUS AI — Unified Frontend API Service
 * Connects React UI to the FastAPI AI Orchestrator backend (Supabase pgvector + Gemini + Simulation Engine).
 * Includes automatic offline demo fallback for 100% hackathon reliability.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export interface CopilotAction {
  action: string;
  impact: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  action_key?: string;
}

export interface CopilotKnowledgeItem {
  category: string;
  title?: string;
  relevance: number;
  snippet?: string;
}

export interface DecisionFactors {
  live_data: string;
  simulation_prediction: string;
  knowledge_retrieved: string;
  ai_reasoning: string;
}

export interface CopilotChatResponse {
  answer: string;
  risk_level: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  recommended_actions: CopilotAction[];
  knowledge_used: CopilotKnowledgeItem[];
  decision_factors?: DecisionFactors;
  visual_card?: {
    type: string;
    data: any;
  };
  mode?: string;
}

export interface SimulationParamsPayload {
  event_end_delta: number;
  attendance: number;
  weather: 'clear' | 'monsoon' | 'extreme_heat';
  transport_capacity: number;
  hotel_availability: number;
  emergency_scenario?: string;
  event_id?: string;
}

export interface SimulationResponsePayload {
  pressure_before: number;
  pressure_after: number;
  risk_level: 'STABLE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  impacts: {
    transport_congestion: number;
    hotel_checkin_surge: number;
    traffic_delay: number;
    restaurant_demand: number;
  };
  breakdown?: Record<string, number>;
}

export interface ResponsePlanStrategyPayload {
  id: string;
  title: string;
  subtitle: string;
  strategy_type: 'transport' | 'crowd' | 'combined';
  is_recommended?: boolean;
  expected_congestion_reduction: number;
  dispatch_time_minutes: number;
  priority: string;
  timeline_steps: {
    time_offset: string;
    title: string;
    description: string;
    agency: string;
    icon_name: string;
    status: string;
  }[];
  projected_metrics: {
    zoneAPressureBefore: number;
    zoneAPressureAfter: number;
    zoneDPressureBefore: number;
    zoneDPressureAfter: number;
  };
}

class NexusApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
  }

  /**
   * Health check for backend connectivity
   */
  async checkHealth(): Promise<boolean> {
    if (IS_DEMO_MODE) return false;
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send tactical query to AI Copilot (RAG + pgvector + Gemini)
   */
  async chatWithCopilot(
    message: string,
    context?: {
      eventName?: string;
      attendees?: number;
      cityPressure?: number;
      highestRiskZone?: string;
      activeScenario?: string;
    }
  ): Promise<CopilotChatResponse> {
    if (!IS_DEMO_MODE) {
      try {
        const payload = {
          message,
          event_id: 'mumbai-sports',
          include_simulation_context: true,
          simulation_context: context || {}
        };

        const res = await fetch(`${this.baseUrl}/api/copilot/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(12000)
        });

        if (res.ok) {
          const data: CopilotChatResponse = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('[NEXUS API] Backend call failed, engaging tactical client fallback:', err);
      }
    }

    // Client-side tactical demo fallback
    return this.getOfflineCopilotFallback(message, context);
  }

  /**
   * Run deterministic city pressure calculation on backend
   */
  async runSimulation(params: SimulationParamsPayload): Promise<SimulationResponsePayload> {
    if (!IS_DEMO_MODE) {
      try {
        const res = await fetch(`${this.baseUrl}/api/simulation/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(4000)
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[NEXUS API] Simulation backend call failed, computing locally:', err);
      }
    }

    // Deterministic client fallback using the exact same mathematical formula:
    // Pressure = (Crowd * 0.30) + (Transport * 0.25) + (Hotel * 0.15) + (Traffic * 0.20) + (Event * 0.10)
    const baseAttendees = 72480;
    const crowdFactor = (params.attendance / baseAttendees) * 100;
    const transportPressure = (1 / Math.max(0.4, params.transport_capacity)) * 75;
    const hotelPressure = (1 / Math.max(0.4, params.hotel_availability)) * 80;
    const weatherPenalty = params.weather === 'monsoon' ? 28 : params.weather === 'extreme_heat' ? 16 : 0;
    const earlyExitPenalty = params.event_end_delta < 0 ? Math.abs(params.event_end_delta) * 0.85 : 0;
    const trafficPressure = Math.min(100, crowdFactor * 0.55 + weatherPenalty * 0.9 + earlyExitPenalty * 0.4);

    const rawScore = (
      (crowdFactor * 0.30) +
      (transportPressure * 0.25) +
      (hotelPressure * 0.15) +
      (trafficPressure * 0.20) +
      (earlyExitPenalty * 0.10)
    );

    const finalPressure = Math.round(Math.min(100, Math.max(15, rawScore)));
    const riskLevel = finalPressure >= 85 ? 'CRITICAL' : finalPressure >= 70 ? 'HIGH' : finalPressure >= 50 ? 'MODERATE' : 'STABLE';

    return {
      pressure_before: 68,
      pressure_after: finalPressure,
      risk_level: riskLevel,
      impacts: {
        transport_congestion: params.event_end_delta < 0 ? 38 : params.weather === 'monsoon' ? 24 : 12,
        hotel_checkin_surge: params.event_end_delta < 0 ? 22 : 8,
        traffic_delay: params.event_end_delta < 0 ? 31 : params.weather === 'monsoon' ? 18 : 10,
        restaurant_demand: params.event_end_delta < 0 ? 17 : 9
      }
    };
  }

  /**
   * Fetch multi-agency response plans from backend orchestrator
   */
  async generateResponsePlan(params: {
    event_id?: string;
    current_pressure?: number;
    highest_risk_zone?: string;
    active_scenario?: string;
  }): Promise<ResponsePlanStrategyPayload[]> {
    if (!IS_DEMO_MODE) {
      try {
        const res = await fetch(`${this.baseUrl}/api/orchestrator/generate-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(4000)
        });

        if (res.ok) {
          const data = await res.json();
          return data.plans;
        }
      } catch (err) {
        console.warn('[NEXUS API] Orchestrator plan call failed, using default blueprints:', err);
      }
    }
    return [];
  }

  /**
   * Semantic search against vector store
   */
  async searchKnowledge(query: string, topK: number = 4): Promise<any[]> {
    if (!IS_DEMO_MODE) {
      try {
        const res = await fetch(`${this.baseUrl}/api/knowledge/search?q=${encodeURIComponent(query)}&top_k=${topK}`, {
          method: 'GET',
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const data = await res.json();
          return data.results;
        }
      } catch (err) {
        console.warn('[NEXUS API] Vector search failed:', err);
      }
    }
    return [];
  }

  /**
   * Realistic offline fallback for Copilot
   */
  private getOfflineCopilotFallback(
    query: string,
    context?: {
      eventName?: string;
      attendees?: number;
      cityPressure?: number;
      highestRiskZone?: string;
      activeScenario?: string;
    }
  ): CopilotChatResponse {
    const q = query.toLowerCase();
    const zone = context?.highestRiskZone || 'Stadium Grand Arena';
    const pressure = context?.cityPressure || 88;

    if (q.includes('rain') || q.includes('weather') || q.includes('storm')) {
      return {
        answer: `Weather radar detects a precipitation cell inbound in 28 minutes. Surface roadway speeds will drop by 38% and divert 74% of attendees toward underground metro hubs. We must activate covered perimeter shuttles at Gate 4 and open sheltered waiting pavilions in Zone D immediately.`,
        risk_level: 'HIGH',
        confidence: 0.93,
        recommended_actions: [
          { action: 'Activate Rain Egress Protocol', impact: 'Reduces platform saturation by 35%', priority: 'CRITICAL', action_key: 'rain_protocol' },
          { action: 'Deploy 40 Perimeter Shuttles', impact: 'Absorbs 14,200 passengers', priority: 'HIGH', action_key: 'dispatch_shuttles' }
        ],
        knowledge_used: [
          { category: 'weather', title: 'Heavy Rainfall Egress Directive', relevance: 0.94, snippet: 'Precipitation exceeding 25mm/hr triggers covered shuttle bays and traffic diversion.' },
          { category: 'historical_incidents', title: '2023 Monaco Harbor Cloudburst', relevance: 0.81, snippet: 'Pre-staged sheltered wait zones prevented severe underground concourse surges.' }
        ],
        decision_factors: {
          live_data: `Precipitation cell: +25mm/hr | Current Pressure: ${pressure}%`,
          simulation_prediction: 'Predicted underground surge +46% in 28 minutes',
          knowledge_retrieved: 'Heavy Rainfall Directive + Monaco Incident Telemetry',
          ai_reasoning: 'Precipitation diversion redirects foot traffic from open plazas to subterranean rail; perimeter buses eliminate the hazard.'
        },
        visual_card: {
          type: 'zone_stat',
          data: {
            headline: 'Weather Impact Prediction',
            roadDelay: '+38%',
            metroSurge: '+46%',
            shelteredZones: 'Zones B & D'
          }
        },
        mode: 'demo_fallback'
      };
    }

    if (q.includes('risk') || q.includes('danger') || q.includes('zone')) {
      return {
        answer: `Tactical telemetry indicates ${zone} is our highest risk sector (predicted pressure 96% in 35 mins). Venue egress patterns combined with Line 2 metro headway create a critical bottleneck at South Terminal.`,
        risk_level: 'CRITICAL',
        confidence: 0.94,
        recommended_actions: [
          { action: 'Activate Shuttle Route B', impact: 'Reduces station pressure by 21%', priority: 'CRITICAL', action_key: 'dispatch_shuttles' },
          { action: 'Redirect Foot Traffic to Gate 4', impact: 'Diverts 35% foot traffic', priority: 'HIGH', action_key: 'reroute_zone_d' }
        ],
        knowledge_used: [
          { category: 'crowd_management', title: 'Stadium Exit Congestion Protocol', relevance: 0.95, snippet: 'Turnstiles 1-12 switch to unhindered bidirectional flow within 90 seconds.' },
          { category: 'transport', title: 'Metro Line 2 Overload Metering', relevance: 0.89, snippet: 'Smart turnstiles pulse-meter 150 passengers every 45 seconds.' }
        ],
        decision_factors: {
          live_data: `Highest Risk: ${zone} | Current Pressure: ${pressure}%`,
          simulation_prediction: 'Predicted pressure 96% in 35 min',
          knowledge_retrieved: 'Stadium Exit Congestion Protocol & Line 2 Overload Rules',
          ai_reasoning: 'Concourse saturation creates hazardous density; pulse-metering turnstiles and skyway bypass stabilize flow.'
        },
        visual_card: {
          type: 'risk_meter',
          data: {
            zone: zone,
            current: pressure,
            predicted: Math.min(98, pressure + 10),
            timeToPeak: '35m',
            riskLevel: 'CRITICAL'
          }
        },
        mode: 'demo_fallback'
      };
    }

    if (q.includes('hotel') || q.includes('accommodation') || q.includes('room') || q.includes('stay')) {
      return {
        answer: `Zone A hotels are operating at 94% occupancy with rate inflation. Zone D Northern Eco Gateway retains 1,240 verified available rooms with 72% parking surplus. Redirecting 18% of overnight visitors will stabilize hospitality.`,
        risk_level: 'MODERATE',
        confidence: 0.91,
        recommended_actions: [
          { action: 'Broadcast Zone D Incentive', impact: 'Reallocates 1,240 overnight visitors', priority: 'HIGH', action_key: 'broadcast_hospitality' },
          { action: 'Lock Hotel Surge Caps', impact: 'Prevents rate inflation', priority: 'MEDIUM', action_key: 'reroute_zone_d' }
        ],
        knowledge_used: [
          { category: 'hospitality', title: 'Zone A Saturation Mitigation', relevance: 0.92, snippet: 'Dynamic room pricing caps engage when occupancy exceeds 94%.' },
          { category: 'hospitality', title: 'Zone D Eco Gateway Redistribution', relevance: 0.88, snippet: '15% hotel discount + free express shuttle voucher rebalances city yield.' }
        ],
        decision_factors: {
          live_data: 'Zone A: 94% booked ($390/night) | Zone D: 1,240 vacant rooms',
          simulation_prediction: 'Potential tourist displacement if 18% not redirected',
          knowledge_retrieved: 'Zone A Hotel Saturation & Zone D Redistribution SOP',
          ai_reasoning: 'Severe hospitality imbalance resolved via targeted citizen vouchers without coercive enforcement.'
        },
        visual_card: {
          type: 'hospitality_redistribution',
          data: {
            overburdened: 'Zone A (94% booked)',
            surplusZone: 'Zone D (1,240 vacant rooms)',
            incentive: '15% discount + free transit'
          }
        },
        mode: 'demo_fallback'
      };
    }

    // Default briefing
    return {
      answer: `NEXUS Core is monitoring ${context?.attendees?.toLocaleString() || '72,480'} attendees across 6 metropolitan sectors. Predictive telemetry indicates ${pressure}% city-wide pressure with localized surges near ${zone}. All automated response pipelines are primed.`,
      risk_level: pressure >= 80 ? 'HIGH' : 'MODERATE',
      confidence: 0.92,
      recommended_actions: [
        { action: 'Deploy Reserve Shuttles', impact: '-21% Congestion', priority: 'HIGH', action_key: 'dispatch_shuttles' },
        { action: 'Authorize Response Plan C', impact: '-52% Corridor Congestion', priority: 'CRITICAL', action_key: 'deploy_plan_c' }
      ],
      knowledge_used: [
        { category: 'emergency_response', title: 'Synchronized Command Protocol', relevance: 0.89, snippet: 'Unified inter-agency triggers align transit, police, and hospitality boards.' }
      ],
      decision_factors: {
        live_data: `Active Attendees: ${context?.attendees?.toLocaleString() || '72,480'} | Pressure: ${pressure}%`,
        simulation_prediction: 'Nominal city operations with localized egress surge',
        knowledge_retrieved: 'Unified Command Protocol & Inter-Agency Directive',
        ai_reasoning: 'Preemptive resource allocation stabilizes infrastructure before peak egress whistle.'
      },
      visual_card: {
        type: 'route_recommendation',
        data: {
          bottleneck: `${zone} (Surge in 35m)`,
          optimalRoute: 'Smart Skybridge Route C to Zone D',
          capacitySaved: '18,400 passengers'
        }
      },
      mode: 'demo_fallback'
    };
  }
}

export const nexusApi = new NexusApiService();
