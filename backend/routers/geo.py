from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Query, HTTPException

from backend.services.location_service import location_service
from backend.services.earth_engine_service import earth_engine_service

router = APIRouter(prefix="/api/geo", tags=["NEXUS Geo-Twin"])

# ==========================================
# REQUEST / RESPONSE SCHEMAS
# ==========================================

class GeocodeRequest(BaseModel):
    query: str = Field(..., description="Address or landmark query to geocode")

class AnalyzeRegionRequest(BaseModel):
    bbox: List[float] = Field(default=[72.80, 18.90, 72.90, 19.20], description="[min_lon, min_lat, max_lon, max_lat]")
    analysis_type: str = "environmental_context"
    scenario: str = "normal"

class RiskZoneCalculationRequest(BaseModel):
    crowd_pressure: float = Field(default=85.0, ge=0, le=100)
    transport_pressure: float = Field(default=80.0, ge=0, le=100)
    traffic_pressure: float = Field(default=75.0, ge=0, le=100)
    event_pressure: float = Field(default=90.0, ge=0, le=100)
    weather_impact: float = Field(default=20.0, ge=0, le=100)
    weights: Optional[Dict[str, float]] = None

class GeoSimulateRequest(BaseModel):
    event_id: str = "mumbai-sports"
    scenario: str = "normal"  # normal, early_exit, heavy_rain, metro_disruption, hotel_saturation
    time_offset: int = 0      # 0, 15, 30, 60 minutes
    expected_attendance: Optional[int] = 72480

# ==========================================
# ENDPOINTS
# ==========================================

@router.get("/locations")
async def get_locations():
    """Returns all operational points of interest (venues, hotels, transit hubs, corridors)."""
    return location_service._geo_data

@router.get("/event/{event_id}")
async def get_event_geojson(
    event_id: str,
    scenario: str = Query(default="normal", description="Operational scenario"),
    time_offset: int = Query(default=0, ge=-60, le=120, description="Time offset in minutes")
):
    """
    Returns standard GeoJSON FeatureCollection representation of the city digital twin.
    Includes points for venues, hotels, transit nodes, lines for traffic corridors,
    and polygons for spatial risk buffers.
    """
    return location_service.generate_geojson(
        event_id=event_id,
        scenario=scenario,
        time_offset=time_offset
    )

@router.post("/geocode")
async def geocode(request: GeocodeRequest):
    """Geocodes an address or landmark name into verified latitude & longitude."""
    result = await location_service.geocode_location(request.query)
    if not result:
        raise HTTPException(status_code=404, detail="Location could not be geocoded.")
    return result

@router.post("/analyze-region")
async def analyze_region(request: AnalyzeRegionRequest):
    """Returns regional environmental, elevation, and flood susceptibility context."""
    return await earth_engine_service.analyze_region(
        bbox=request.bbox,
        analysis_type=request.analysis_type,
        scenario=request.scenario
    )

@router.get("/risk-zones")
async def get_risk_zones():
    """Returns active risk zones with their factors and recommended mitigations."""
    geo_data = location_service.get_event_geo_data("mumbai-sports")
    return geo_data.get("risk_zones", [])

@router.post("/risk-zones")
async def calculate_risk_zones(request: RiskZoneCalculationRequest):
    """
    Algorithmic risk zone generator based on the deterministic formula:
    risk_score = crowd_pressure * 0.30 + transport_pressure * 0.25 + traffic_pressure * 0.20 + event_pressure * 0.15 + weather_impact * 0.10
    """
    w = request.weights or {
        "crowd": 0.30,
        "transport": 0.25,
        "traffic": 0.20,
        "event": 0.15,
        "weather": 0.10
    }

    score = (
        request.crowd_pressure * w.get("crowd", 0.30) +
        request.transport_pressure * w.get("transport", 0.25) +
        request.traffic_pressure * w.get("traffic", 0.20) +
        request.event_pressure * w.get("event", 0.15) +
        request.weather_impact * w.get("weather", 0.10)
    )

    final_score = round(min(100.0, max(0.0, score)), 1)
    
    # Classification logic: 0-30 SAFE, 31-55 MODERATE, 56-75 HIGH, 76-100 CRITICAL
    if final_score >= 76.0:
        classification = "CRITICAL"
    elif final_score >= 56.0:
        classification = "HIGH"
    elif final_score >= 31.0:
        classification = "MODERATE"
    else:
        classification = "SAFE"

    return {
        "risk_score": final_score,
        "classification": classification,
        "weights_used": w,
        "contributing_breakdown": {
            "crowd": round(request.crowd_pressure * w.get("crowd", 0.30), 1),
            "transport": round(request.transport_pressure * w.get("transport", 0.25), 1),
            "traffic": round(request.traffic_pressure * w.get("traffic", 0.20), 1),
            "event": round(request.event_pressure * w.get("event", 0.15), 1),
            "weather": round(request.weather_impact * w.get("weather", 0.10), 1)
        }
    }

@router.get("/snapshot/{event_id}")
async def get_snapshot(event_id: str, time_offset: int = Query(default=0)):
    """Returns spatial and simulation state snapshot for the specified temporal offset."""
    return {
        "event_id": event_id,
        "time_offset_minutes": time_offset,
        "geojson": location_service.generate_geojson(event_id, time_offset=time_offset),
        "environmental_summary": await earth_engine_service.analyze_region([72.80, 18.90, 72.90, 19.20])
    }

@router.post("/simulate")
async def simulate_spatial_shift(request: GeoSimulateRequest):
    """
    Couples what-if simulation inputs to geographic risk zones and returns
    updated GeoJSON and pressure deltas.
    """
    geojson = location_service.generate_geojson(
        event_id=request.event_id,
        scenario=request.scenario,
        time_offset=request.time_offset
    )

    base_pressure = 68
    scenario_boost = {
        "normal": 0,
        "early_exit": 23,
        "heavy_rain": 26,
        "metro_disruption": 28,
        "hotel_saturation": 14
    }.get(request.scenario, 0)

    time_boost = int((request.time_offset / 60.0) * 15)
    predicted_pressure = min(98, base_pressure + scenario_boost + time_boost)

    return {
        "event_id": request.event_id,
        "scenario": request.scenario,
        "time_offset": request.time_offset,
        "pressure_before": base_pressure,
        "pressure_after": predicted_pressure,
        "risk_level": "CRITICAL" if predicted_pressure >= 85 else "HIGH" if predicted_pressure >= 70 else "MODERATE",
        "geojson": geojson
    }

@router.post("/earth-engine/analyze")
async def analyze_earth_engine(request: AnalyzeRegionRequest):
    """Proxy endpoint for Google Earth Engine remote sensing dataset queries."""
    return await earth_engine_service.analyze_region(
        bbox=request.bbox,
        analysis_type=request.analysis_type,
        scenario=request.scenario
    )
