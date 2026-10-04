import logging
from typing import Dict, Any, List
from backend.models.schemas import (
    SimulationRunRequest,
    SimulationRunResponse,
    SimulationImpacts,
    ResponsePlanStrategy,
    TimelineStep,
    OrchestratorPlanResponse
)

logger = logging.getLogger("nexus.simulation")

class SimulationService:
    BASE_ATTENDANCE_MAP = {
        "mumbai-sports": 72480,
        "monaco-f1": 142000,
        "melbourne-cricket": 96800,
        "tomorrowland": 185000
    }

    def run_simulation(self, params: SimulationRunRequest) -> SimulationRunResponse:
        """
        Deterministic Algorithmic City Pressure Model:
        Pressure Score = (Crowd * 0.30) + (Transport * 0.25) + (Hotel * 0.15) + (Traffic * 0.20) + (Event * 0.10)
        """
        base_att = self.BASE_ATTENDANCE_MAP.get(params.event_id, 72480)
        
        # 1. Crowd Factor (0 - 150)
        crowd_ratio = params.attendance / max(1, base_att)
        crowd_factor = crowd_ratio * 100.0

        # 2. Transport Pressure (0 - 150)
        trans_mod = max(0.4, min(2.0, params.transport_capacity))
        transport_pressure = (1.0 / trans_mod) * 75.0
        if params.emergency_scenario == "metro_glitch":
            transport_pressure *= 1.35

        # 3. Hotel Pressure (0 - 150)
        hotel_mod = max(0.4, min(2.0, params.hotel_availability))
        hotel_pressure = (1.0 / hotel_mod) * 80.0

        # 4. Weather & Early Exit Penalty
        weather_penalty = 0.0
        if params.weather == "monsoon" or params.emergency_scenario == "rain_storm":
            weather_penalty = 28.0
        elif params.weather == "extreme_heat":
            weather_penalty = 16.0

        early_exit_penalty = 0.0
        if params.event_end_delta < 0 or params.emergency_scenario == "early_exit":
            early_exit_penalty = abs(params.event_end_delta) * 0.85

        # 5. Traffic Pressure
        traffic_pressure = min(100.0, (crowd_factor * 0.55) + (weather_penalty * 0.9) + (early_exit_penalty * 0.4))

        # 6. Weighted Sum (Layer 1 Deterministic Intelligence)
        pressure_score = (
            (crowd_factor * 0.30) +
            (transport_pressure * 0.25) +
            (hotel_pressure * 0.15) +
            (traffic_pressure * 0.20) +
            (early_exit_penalty * 0.10)
        )

        final_pressure = round(min(100.0, max(15.0, pressure_score)), 1)
        baseline_pressure = 68.0

        # Risk Classification
        if final_pressure >= 85.0:
            risk = "CRITICAL"
        elif final_pressure >= 70.0:
            risk = "HIGH"
        elif final_pressure >= 50.0:
            risk = "MODERATE"
        else:
            risk = "STABLE"

        # Deterministic Impact Metrics
        transport_congestion_change = round(
            (38.0 if params.event_end_delta < 0 else 0.0) +
            (24.0 if params.weather == "monsoon" else 0.0) +
            (20.0 if params.transport_capacity < 1.0 else -8.0) +
            (25.0 if params.emergency_scenario == "metro_glitch" else 0.0),
            1
        )

        hotel_checkin_surge_change = round(
            (22.0 if params.event_end_delta < 0 else 8.0) +
            (15.0 if params.hotel_availability < 0.9 else 0.0),
            1
        )

        traffic_delay_minutes_change = round(
            (31.0 if params.event_end_delta < 0 else 12.0) +
            (18.0 if params.weather == "monsoon" else 0.0) +
            (15.0 if crowd_ratio > 1.1 else 0.0),
            1
        )

        restaurant_demand_change = round(
            (17.0 if params.event_end_delta < 0 else 9.0) +
            (8.0 if crowd_ratio > 1.0 else 0.0),
            1
        )

        impacts = SimulationImpacts(
            transport_congestion=transport_congestion_change,
            hotel_checkin_surge=hotel_checkin_surge_change,
            traffic_delay=traffic_delay_minutes_change,
            restaurant_demand=restaurant_demand_change
        )

        breakdown = {
            "crowd_component": round(crowd_factor * 0.30, 1),
            "transport_component": round(transport_pressure * 0.25, 1),
            "hotel_component": round(hotel_pressure * 0.15, 1),
            "traffic_component": round(traffic_pressure * 0.20, 1),
            "event_delta_component": round(early_exit_penalty * 0.10, 1)
        }

        return SimulationRunResponse(
            pressure_before=baseline_pressure,
            pressure_after=final_pressure,
            risk_level=risk,
            impacts=impacts,
            breakdown=breakdown
        )

    def generate_response_plans(
        self,
        current_pressure: float,
        highest_risk_zone: str = "Stadium Grand Arena",
        active_scenario: str = "none"
    ) -> OrchestratorPlanResponse:
        """
        Generates 3 multi-agency orchestration plans with algorithmic projected metrics:
        - Plan A: Transport-focused strategy
        - Plan B: Crowd redistribution strategy
        - Plan C: Combined AI recommended strategy
        """
        base_zone_a = max(70.0, current_pressure)
        base_zone_d = 42.0

        # Plan A: Transport Focus
        reduction_a = 21.0
        plan_a = ResponsePlanStrategy(
            id="plan_a",
            title="Plan A: Surge Transport Capacity",
            subtitle="Fleet expansion & rapid headway modulation",
            strategy_type="transport",
            is_recommended=False,
            expected_congestion_reduction=reduction_a,
            dispatch_time_minutes=6,
            priority="HIGH",
            timeline_steps=[
                TimelineStep(
                    time_offset="T - 30 Minutes",
                    title="Fleet Mobilization",
                    description="Dispatch 40 reserve electric shuttles to Arena Gates 1 & 4.",
                    agency="Transport",
                    icon_name="Bus",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 20 Minutes",
                    title="Metro Headway Optimization",
                    description="Compress Metro Line 2 intervals from 4.5 min down to 2.2 min.",
                    agency="Transport",
                    icon_name="Train",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 15 Minutes",
                    title="Express Corridor Clearance",
                    description="Traffic lights prioritize transit arterial ribbons via automated green waves.",
                    agency="Police/Security",
                    icon_name="Compass",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 5 Minutes",
                    title="Full Ingress to Egress Switch",
                    description="Reconfigure all turnstiles for unhindered tap-and-go clearance.",
                    agency="Transport",
                    icon_name="CheckCircle",
                    status="ready"
                )
            ],
            projected_metrics={
                "zoneAPressureBefore": round(base_zone_a, 1),
                "zoneAPressureAfter": round(base_zone_a - 12.0, 1),
                "zoneDPressureBefore": round(base_zone_d, 1),
                "zoneDPressureAfter": round(base_zone_d + 3.0, 1)
            }
        )

        # Plan B: Crowd Redistribution Focus
        reduction_b = 34.0
        plan_b = ResponsePlanStrategy(
            id="plan_b",
            title="Plan B: Spatial Crowd Redistribution",
            subtitle="Perimeter dispersal & dynamic hospitality incentives",
            strategy_type="crowd",
            is_recommended=False,
            expected_congestion_reduction=reduction_b,
            dispatch_time_minutes=4,
            priority="HIGH",
            timeline_steps=[
                TimelineStep(
                    time_offset="T - 30 Minutes",
                    title="Broadcast Targeted Push Prompts",
                    description="Alert 28,000 visitors of delayed exit perks (concert afterparty / dining discounts).",
                    agency="Citizen Communications",
                    icon_name="Radio",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 20 Minutes",
                    title="Open Northern Skywalk Bypass",
                    description="Redirect 35% of foot traffic away from congested South Terminal.",
                    agency="Police/Security",
                    icon_name="Milestone",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 15 Minutes",
                    title="Incentivize Zone D Hospitality",
                    description="Activate free express shuttle voucher + $25 restaurant subsidy for Zone D.",
                    agency="Hospitality",
                    icon_name="Utensils",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 5 Minutes",
                    title="Activate Live Field Marshals",
                    description="80 AI-guided ground stewards positioned at critical decision junctions.",
                    agency="Police/Security",
                    icon_name="Users",
                    status="ready"
                )
            ],
            projected_metrics={
                "zoneAPressureBefore": round(base_zone_a, 1),
                "zoneAPressureAfter": round(base_zone_a - 20.0, 1),
                "zoneDPressureBefore": round(base_zone_d, 1),
                "zoneDPressureAfter": round(base_zone_d + 16.0, 1)
            }
        )

        # Plan C: Combined AI Recommended
        reduction_c = 52.0
        plan_c = ResponsePlanStrategy(
            id="plan_c",
            title="Plan C: Combined Dynamic Orchestration",
            subtitle="Integrated multi-agency synchronized intervention",
            strategy_type="combined",
            is_recommended=True,
            expected_congestion_reduction=reduction_c,
            dispatch_time_minutes=3,
            priority="CRITICAL",
            timeline_steps=[
                TimelineStep(
                    time_offset="T - 30 Minutes",
                    title="Synchronized Inter-Agency Lock",
                    description="Simultaneously deploy 45 electric buses and initialize Zone D hospitality vouchers.",
                    agency="Transport",
                    icon_name="Zap",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 20 Minutes",
                    title="Dynamic Geo-Fenced Mobile Guidance",
                    description="Visitor companion app routes 40% of users to Skybridge Route C with zero wait time.",
                    agency="Citizen Communications",
                    icon_name="Smartphone",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 15 Minutes",
                    title="Autonomous Perimeter Gates & Green Waves",
                    description="Synchronize 22 traffic intersections and open 16 biometric express turnstiles.",
                    agency="Police/Security",
                    icon_name="ShieldAlert",
                    status="ready"
                ),
                TimelineStep(
                    time_offset="T - 5 Minutes",
                    title="Active Surge Stabilization",
                    description="City pressure index drops from peak down to stable levels within 40-minute window.",
                    agency="Hospitality",
                    icon_name="TrendingDown",
                    status="ready"
                )
            ],
            projected_metrics={
                "zoneAPressureBefore": round(base_zone_a, 1),
                "zoneAPressureAfter": round(max(30.0, base_zone_a - 34.0), 1),
                "zoneDPressureBefore": round(base_zone_d, 1),
                "zoneDPressureAfter": round(base_zone_d + 19.0, 1)
            }
        )

        return OrchestratorPlanResponse(
            plans=[plan_a, plan_b, plan_c],
            recommended_plan_id="plan_c",
            summary=f"NEXUS Orchestrator generated 3 coordinated response blueprints for {highest_risk_zone}. Plan C delivers maximum relief (-52% congestion reduction) by simultaneously unlocking transport capacity and redistributing hospitality demand."
        )

simulation_service = SimulationService()
