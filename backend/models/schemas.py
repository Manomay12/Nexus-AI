from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ==========================================
# SIMULATION SCHEMAS
# ==========================================

class SimulationRunRequest(BaseModel):
    event_end_delta: int = Field(default=0, description="Delta in minutes e.g. -45 early exit, +30 delay")
    attendance: int = Field(default=72480, description="Attendee headcount")
    weather: str = Field(default="clear", description="'clear' | 'monsoon' | 'extreme_heat'")
    transport_capacity: float = Field(default=1.0, description="Fleet capacity multiplier (0.5 - 1.5)")
    hotel_availability: float = Field(default=1.0, description="Hotel inventory buffer (0.5 - 1.2)")
    emergency_scenario: str = Field(default="none", description="'none' | 'early_exit' | 'metro_glitch' | 'rain_storm'")
    event_id: str = Field(default="mumbai-sports", description="Event identifier")

class SimulationImpacts(BaseModel):
    transport_congestion: float
    hotel_checkin_surge: float
    traffic_delay: float
    restaurant_demand: float

class SimulationRunResponse(BaseModel):
    pressure_before: float
    pressure_after: float
    risk_level: str  # STABLE, MODERATE, HIGH, CRITICAL
    impacts: SimulationImpacts
    breakdown: Dict[str, float] = Field(default_factory=dict)
    formula_weights: Dict[str, float] = Field(
        default={
            "crowd": 0.30,
            "transport": 0.25,
            "hotel": 0.15,
            "traffic": 0.20,
            "event": 0.10
        }
    )

# ==========================================
# COPILOT & RAG SCHEMAS
# ==========================================

class ActionItem(BaseModel):
    action: str
    impact: str
    priority: str = "HIGH"
    action_key: Optional[str] = None

class KnowledgeItem(BaseModel):
    category: str
    title: Optional[str] = None
    relevance: float
    snippet: Optional[str] = None

class DecisionFactors(BaseModel):
    live_data: str
    simulation_prediction: str
    knowledge_retrieved: str
    ai_reasoning: str

class VisualCard(BaseModel):
    type: str  # risk_meter, route_recommendation, hospitality_redistribution, zone_stat
    data: Dict[str, Any]

class CopilotChatRequest(BaseModel):
    message: str
    event_id: Optional[str] = "mumbai-sports"
    zone_id: Optional[str] = None
    include_simulation_context: bool = True
    simulation_context: Optional[Dict[str, Any]] = None

class CopilotChatResponse(BaseModel):
    answer: str
    risk_level: str
    confidence: float
    recommended_actions: List[ActionItem] = Field(default_factory=list)
    knowledge_used: List[KnowledgeItem] = Field(default_factory=list)
    decision_factors: Optional[DecisionFactors] = None
    visual_card: Optional[VisualCard] = None
    mode: str = "production"

# ==========================================
# ORCHESTRATOR RESPONSE PLANS
# ==========================================

class TimelineStep(BaseModel):
    time_offset: str
    title: str
    description: str
    agency: str
    icon_name: str
    status: str = "ready"

class ResponsePlanStrategy(BaseModel):
    id: str  # plan_a, plan_b, plan_c
    title: str
    subtitle: str
    strategy_type: str  # transport, crowd, combined
    is_recommended: bool = False
    expected_congestion_reduction: float
    dispatch_time_minutes: int
    priority: str = "HIGH"
    timeline_steps: List[TimelineStep]
    projected_metrics: Dict[str, Any]

class OrchestratorPlanRequest(BaseModel):
    event_id: str = "mumbai-sports"
    current_pressure: float = 88.0
    highest_risk_zone: str = "Stadium Grand Arena"
    active_scenario: Optional[str] = None
    simulation_params: Optional[Dict[str, Any]] = None

class OrchestratorPlanResponse(BaseModel):
    plans: List[ResponsePlanStrategy]
    recommended_plan_id: str
    summary: str

# ==========================================
# KNOWLEDGE BASE INGESTION & SEARCH
# ==========================================

class KnowledgeDocumentCreate(BaseModel):
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class KnowledgeDocumentResponse(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    similarity: Optional[float] = None

class KnowledgeSearchResponse(BaseModel):
    query: str
    results: List[KnowledgeDocumentResponse]
    count: int
    search_mode: str  # "supabase_pgvector" or "local_deterministic_vector"

# ==========================================
# ANALYTICS SUMMARY
# ==========================================

class AnalyticsSummaryResponse(BaseModel):
    crowd_distribution_efficiency: float
    hospitality_utilization: float
    avg_travel_time_minutes: float
    congestion_reduction_pct: float
    ai_intervention_impact: str
    visitor_satisfaction_score: float
    active_bottlenecks_prevented: int
    system_status: str
