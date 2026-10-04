from fastapi import APIRouter
from backend.models.schemas import (
    SimulationRunRequest,
    SimulationRunResponse,
    OrchestratorPlanRequest,
    OrchestratorPlanResponse
)
from backend.services.simulation_service import simulation_service

router = APIRouter(prefix="/api/simulation", tags=["Simulation Engine"])

@router.post("/run", response_model=SimulationRunResponse)
async def run_simulation(request: SimulationRunRequest):
    """
    Executes the deterministic weighted city pressure algorithm:
    Pressure Score = (Crowd * 0.30) + (Transport * 0.25) + (Hotel * 0.15) + (Traffic * 0.20) + (Event * 0.10)
    """
    return simulation_service.run_simulation(request)

@router.post("/orchestrate", response_model=OrchestratorPlanResponse)
async def orchestrate_plans(request: OrchestratorPlanRequest):
    """Generates 3 multi-agency orchestration blueprints (Plan A, Plan B, Plan C)."""
    return simulation_service.generate_response_plans(
        current_pressure=request.current_pressure,
        highest_risk_zone=request.highest_risk_zone,
        active_scenario=request.active_scenario or "none"
    )

# Direct Orchestrator router alias
orchestrator_router = APIRouter(prefix="/api/orchestrator", tags=["Response Orchestrator"])

@orchestrator_router.post("/generate-plan", response_model=OrchestratorPlanResponse)
async def generate_response_plan(request: OrchestratorPlanRequest):
    """Direct alias endpoint for POST /api/orchestrator/generate-plan."""
    return simulation_service.generate_response_plans(
        current_pressure=request.current_pressure,
        highest_risk_zone=request.highest_risk_zone,
        active_scenario=request.active_scenario or "none"
    )
