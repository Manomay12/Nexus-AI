import json
import os
import math
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger("nexus.location")

class LocationService:
    def __init__(self):
        self._geo_data: Dict[str, Any] = {}
        self._load_geo_data()

    def _load_geo_data(self):
        json_path = os.path.join(os.path.dirname(__file__), "..", "data", "mumbai_geo_data.json")
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    self._geo_data = json.load(f)
                logger.info(f"Loaded {len(self._geo_data.get('venues', []))} venues and {len(self._geo_data.get('hotels', []))} hotels into LocationService.")
            except Exception as e:
                logger.error(f"Failed loading mumbai_geo_data.json: {e}")

    def get_event_geo_data(self, event_id: str = "mumbai-sports") -> Dict[str, Any]:
        """Returns the full parsed geo dataset for the event."""
        return self._geo_data

    def validate_coordinates(self, lat: float, lon: float) -> bool:
        """Validates that latitude is within [-90, 90] and longitude within [-180, 180]."""
        return -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0

    async def geocode_location(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Geocodes an address or landmark name using a resilient abstraction.
        Checks known locations first, then falls back to public geocoding or deterministic coordinates.
        """
        clean_q = query.lower().strip()
        
        # Check in pre-loaded dataset
        for category in ["venues", "hotels", "transport"]:
            for item in self._geo_data.get(category, []):
                name = item.get("name", "").lower()
                addr = item.get("address", "").lower()
                if clean_q in name or name in clean_q or clean_q in addr:
                    coords = item.get("coordinates", [72.8683, 19.0657])
                    return {
                        "name": item.get("name"),
                        "latitude": coords[1],
                        "longitude": coords[0],
                        "address": item.get("address"),
                        "entity_type": item.get("entity_type", "poi"),
                        "confidence": 0.98,
                        "provider": "nexus_verified_spatial_db"
                    }

        # Known landmarks fallback in Mumbai
        landmarks = {
            "wankhede": {"lat": 18.9322, "lon": 72.8258, "name": "Wankhede Stadium", "type": "venue"},
            "bkc": {"lat": 19.0657, "lon": 72.8683, "name": "Bandra Kurla Complex", "type": "commercial"},
            "jio": {"lat": 19.0657, "lon": 72.8683, "name": "Jio World Convention Centre", "type": "venue"},
            "andheri": {"lat": 19.1197, "lon": 72.8468, "name": "Andheri Interchange", "type": "transport"},
            "airport": {"lat": 19.0896, "lon": 72.8656, "name": "CSMIA Airport", "type": "transport"},
            "bandra": {"lat": 19.0596, "lon": 72.8295, "name": "Bandra Gateway", "type": "hospitality"},
            "zone d": {"lat": 19.1600, "lon": 72.8500, "name": "Zone D Northern Eco Hub", "type": "hospitality"}
        }

        for k, v in landmarks.items():
            if k in clean_q:
                return {
                    "name": v["name"],
                    "latitude": v["lat"],
                    "longitude": v["lon"],
                    "address": f"{v['name']}, Mumbai",
                    "entity_type": v["type"],
                    "confidence": 0.90,
                    "provider": "nexus_landmark_registry"
                }

        # Default centered coordinate for unmapped query
        return {
            "name": query.title(),
            "latitude": 19.0657,
            "longitude": 72.8683,
            "address": f"{query}, Mumbai, Maharashtra",
            "entity_type": "poi",
            "confidence": 0.65,
            "provider": "nexus_geocoder_fallback"
        }

    def extract_locations(self, data: Any) -> List[Dict[str, Any]]:
        """Extracts location entities from uploaded JSON or structured lists."""
        extracted = []
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and "name" in item:
                    coords = item.get("coordinates") or [item.get("longitude", 72.8683), item.get("latitude", 19.0657)]
                    extracted.append({
                        "name": item.get("name"),
                        "entity_type": item.get("entity_type", "poi"),
                        "coordinates": coords,
                        "metadata": item.get("metadata", {})
                    })
        elif isinstance(data, dict):
            for cat in ["venues", "hotels", "transport", "locations"]:
                if cat in data and isinstance(data[cat], list):
                    extracted.extend(self.extract_locations(data[cat]))
        return extracted

    def generate_geojson(
        self,
        event_id: str = "mumbai-sports",
        scenario: str = "normal",
        time_offset: int = 0
    ) -> Dict[str, Any]:
        """
        Transforms raw event, venue, hotel, transport, and risk zone data into
        standard GeoJSON FeatureCollection with dynamic scenario and temporal pressure scaling.
        """
        features = []

        # Pressure modifiers based on time offset (0, 15, 30, 60 mins) and scenario
        time_mult = 1.0 + (time_offset / 60.0) * 0.22
        scenario_mult = 1.0
        if scenario == "early_exit":
            scenario_mult = 1.25
        elif scenario == "heavy_rain":
            scenario_mult = 1.30
        elif scenario == "metro_disruption":
            scenario_mult = 1.35
        elif scenario == "hotel_saturation":
            scenario_mult = 1.15

        # 1. Venues (Point Features)
        for v in self._geo_data.get("venues", []):
            scaled_pressure = min(100, int(v.get("current_pressure", 70) * time_mult * scenario_mult))
            risk = "CRITICAL" if scaled_pressure >= 85 else "HIGH" if scaled_pressure >= 70 else "MODERATE" if scaled_pressure >= 50 else "STABLE"
            features.append({
                "type": "Feature",
                "id": v["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": v["coordinates"]
                },
                "properties": {
                    "feature_type": "venue",
                    "name": v["name"],
                    "entity_type": v["entity_type"],
                    "capacity": v["capacity"],
                    "expected_attendance": v.get("expected_attendance", v["capacity"]),
                    "current_pressure": scaled_pressure,
                    "risk_level": risk,
                    "address": v["address"],
                    "status": v.get("status", "LIVE"),
                    "metadata": v.get("metadata", {})
                }
            })

        # 2. Hotels (Point Features)
        for h in self._geo_data.get("hotels", []):
            occupancy = h.get("occupancy_percent", 80)
            if scenario == "hotel_saturation" and not h.get("metadata", {}).get("surplus_target"):
                occupancy = min(99, occupancy + 12)
            features.append({
                "type": "Feature",
                "id": h["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": h["coordinates"]
                },
                "properties": {
                    "feature_type": "hotel",
                    "name": h["name"],
                    "capacity": h["capacity"],
                    "occupancy_percent": occupancy,
                    "available_rooms": h["available_rooms"],
                    "avg_rate": h["avg_rate"],
                    "distance_km": h["distance_km"],
                    "address": h["address"],
                    "metadata": h.get("metadata", {})
                }
            })

        # 3. Transport Nodes (Point Features)
        for t in self._geo_data.get("transport", []):
            load = t.get("current_load_percent", 70)
            if scenario == "metro_disruption" and "metro" in t.get("entity_type", ""):
                load = min(100, load + 22)
            elif scenario == "heavy_rain":
                load = min(100, load + 18)

            features.append({
                "type": "Feature",
                "id": t["id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": t["coordinates"]
                },
                "properties": {
                    "feature_type": "transport",
                    "name": t["name"],
                    "entity_type": t["entity_type"],
                    "capacity_per_hour": t["capacity_per_hour"],
                    "current_load_percent": load,
                    "headway_minutes": t["headway_minutes"],
                    "status": "Surging" if load >= 85 else "Congested" if load >= 75 else "Optimal",
                    "address": t["address"],
                    "metadata": t.get("metadata", {})
                }
            })

        # 4. Traffic Corridors (LineString Features)
        for c in self._geo_data.get("traffic_corridors", []):
            delay = c.get("delay_minutes", 10)
            congestion = c.get("congestion_level", 60)
            if scenario == "heavy_rain":
                congestion = min(100, congestion + 24)
                delay += 14
            elif scenario == "early_exit":
                congestion = min(100, congestion + 30)
                delay += 18

            features.append({
                "type": "Feature",
                "id": c["id"],
                "geometry": {
                    "type": "LineString",
                    "coordinates": [c["from_coord"], c["to_coord"]]
                },
                "properties": {
                    "feature_type": "traffic_corridor",
                    "name": c["name"],
                    "congestion_level": congestion,
                    "avg_speed_kmh": max(10, c.get("avg_speed_kmh", 40) - int(congestion * 0.3)),
                    "delay_minutes": delay,
                    "risk": "CRITICAL" if congestion >= 85 else "HIGH" if congestion >= 70 else "MODERATE"
                }
            })

        # 5. Risk Zones (Polygon Circular Approximations)
        for r in self._geo_data.get("risk_zones", []):
            scaled_pressure = min(100, int(r["current_pressure"] * time_mult * scenario_mult))
            risk = "CRITICAL" if scaled_pressure >= 85 else "HIGH" if scaled_pressure >= 70 else "MODERATE" if scaled_pressure >= 50 else "STABLE"
            
            # Generate 16-point circle polygon around center
            center_lon, center_lat = r["center"]
            radius_km = (r["radius_meters"] * (1.0 + (time_offset / 60.0) * 0.3)) / 1000.0
            polygon_coords = []
            for i in range(17):
                angle = (i * 2 * math.pi) / 16
                d_lat = (radius_km / 111.0) * math.sin(angle)
                d_lon = (radius_km / (111.0 * math.cos(math.radians(center_lat)))) * math.cos(angle)
                polygon_coords.append([round(center_lon + d_lon, 6), round(center_lat + d_lat, 6)])

            features.append({
                "type": "Feature",
                "id": r["id"],
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [polygon_coords]
                },
                "properties": {
                    "feature_type": "risk_zone",
                    "name": r["name"],
                    "center": r["center"],
                    "radius_meters": r["radius_meters"],
                    "current_pressure": scaled_pressure,
                    "predicted_pressure_30m": min(100, int(r.get("predicted_pressure_30m", scaled_pressure + 10) * scenario_mult)),
                    "risk_level": risk,
                    "factors": r.get("factors", []),
                    "recommended_action": r.get("recommended_action", "Deploy perimeter shuttles.")
                }
            })

        # 6. Building Footprints (Polygon Features)
        for b in self._geo_data.get("building_footprints", []):
            features.append({
                "type": "Feature",
                "id": b["id"],
                "geometry": {
                    "type": "Polygon",
                    "coordinates": b["coordinates"][0] if len(b["coordinates"]) > 0 and isinstance(b["coordinates"][0][0], list) and isinstance(b["coordinates"][0][0][0], (int, float)) else b["coordinates"]
                },
                "properties": {
                    "feature_type": "building",
                    "name": b["name"],
                    "height": b.get("height", 40),
                    "category": b.get("category", "commercial")
                }
            })

        return {
            "type": "FeatureCollection",
            "metadata": {
                "event_id": event_id,
                "scenario": scenario,
                "time_offset_minutes": time_offset,
                "data_integrity": {
                    "imagery_source": "Satellite Basemap (Real Geographic Context)",
                    "telemetry_source": "Simulated & Algorithmic Operational Layer",
                    "is_live_satellite_crowd_tracking": False
                }
            },
            "features": features
        }

location_service = LocationService()
