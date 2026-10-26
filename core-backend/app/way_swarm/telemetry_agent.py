"""
The Way Swarm - Agent 1: Telemetry & Highway Off-Ramp Interception Predictor (Tier 1+)
Performs velocity delta analysis, accelerometer G-force struggle detection, and
spatial LLM reasoning across Gauteng highway networks to calculate predicted intercept nodes.
"""
import time
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.config import settings
from app.way_swarm.llm import llm_client

# ============================================================================
# AGENT 1 AI PROMPTS
# ============================================================================

TELEMETRY_KINEMATICS_SYSTEM_PROMPT = """You are Waypoint Secure's Telemetry & Kinematics Spatial Intelligence Agent (Agent 1).
Your role is to analyze high-frequency GPS coordinate vectors, vehicle velocity deltas, heading angles, and accelerometer G-force anomalies for an active emergency incident in the South African Gauteng province (Alberton, Johannesburg South, N12, R59, Swartkoppies Rd corridors).

TASKS:
1. Classify the kinetic movement state based on physics benchmarks:
   - ON_FOOT: speed < 12 km/h
   - STRUGGLE_DETECTED: accelerometer G-force > 3.0G (indicates physical struggle, impact, or forced phone seizure)
   - HIGH_SPEED_VEHICLE_ABDUCTION: speed > 35 km/h along arterial highway
   - TRANSIT_NORMAL: normal vehicular commuting speed
2. Perform spatial routing prediction across the local Gauteng arterial road network to determine the next 3 probable highway off-ramps or intersection bottleneck choke-points.
3. For each intercept node, calculate estimated arrival seconds (ETA) and tactical containment advice for converging armed patrol units.

You must output strictly valid RFC-8259 JSON matching the requested schema.
"""

TELEMETRY_KINEMATICS_USER_PROMPT_TEMPLATE = """ACTIVE EMERGENCY TELEMETRY PACKET:
- Journey ID: {journey_id}
- Incident Trigger: {trigger_source}
- Current Coordinates: Lat {current_lat}, Lng {current_lng}
- Current Velocity: {speed_kmh} km/h
- Heading: {heading_deg}° (South-East vector)
- Accelerometer G-Force: {g_force}G
- Road Corridor: N12 / Voortrekker Road interchange corridor, Alberton, South Africa

Analyze the telemetry vector and predict the next 3 tactical highway intercept choke points."""

class InterceptNode(BaseModel):
    name: str = Field(description="Name and description of the highway off-ramp or intersection")
    lat: float = Field(description="Latitude of the predicted intercept node")
    lng: float = Field(description="Longitude of the predicted intercept node")
    estimated_arrival_seconds: int = Field(description="Estimated time of arrival in seconds")
    confidence_score: float = Field(description="Probability confidence score (0.0 to 1.0)")
    tactical_recommendation: str = Field(description="Tactical advice for armed response units")

class TelemetrySpatialOutput(BaseModel):
    movement_classification: str = Field(description="Classified movement state")
    risk_level: str = Field(description="Threat risk assessment level")
    kinematics_summary: str = Field(description="Summary of kinetic velocity and g-force analysis")
    predicted_intercept_nodes: List[InterceptNode] = Field(description="Top 3 predicted off-ramp intercept choke points")

class TelemetryAgent:
    def __init__(self):
        self.agent_name = "Telemetry_Agent"
        self.tier_requirement = "TIER_1_STARTER"

    async def execute(self, state: Dict[str, Any], broadcast_callback=None) -> Dict[str, Any]:
        """
        Executes Agent 1 telemetry kinematics and spatial off-ramp prediction.
        """
        start_time = time.perf_counter()
        speed_kmh = float(state.get("speed_kmh", 78.0))
        heading_deg = float(state.get("heading_deg", 140.0))
        g_force = float(state.get("g_force", 3.8))
        current_lat = float(state.get("current_lat", -26.2678))
        current_lng = float(state.get("current_lng", 28.1245))
        journey_id = state.get("journey_id", "default_journey")
        trigger_source = state.get("trigger_source", "SECOND_TAP")

        if broadcast_callback:
            await broadcast_callback({
                "type": "AGENT_STEP",
                "agent": self.agent_name,
                "status": "RUNNING",
                "message": f"Analyzing kinematics vector: {speed_kmh} km/h @ {heading_deg}° | G-Force: {g_force}G..."
            })

        user_prompt = TELEMETRY_KINEMATICS_USER_PROMPT_TEMPLATE.format(
            journey_id=journey_id,
            trigger_source=trigger_source,
            current_lat=current_lat,
            current_lng=current_lng,
            speed_kmh=speed_kmh,
            heading_deg=heading_deg,
            g_force=g_force
        )

        structured_output = await llm_client.generate_structured(
            system_prompt=TELEMETRY_KINEMATICS_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            model=settings.MODEL_TELEMETRY,
            response_model=TelemetrySpatialOutput
        )

        latency_ms = int((time.perf_counter() - start_time) * 1000)

        result = {
            "agent_type": "TELEMETRY_KINEMATICS",
            "execution_latency_ms": latency_ms,
            "structured_output": structured_output,
            "movement_state": structured_output.get("movement_classification", "STRUGGLE_DETECTED"),
            "movement_classification": structured_output.get("movement_classification", "STRUGGLE_DETECTED"),
            "predicted_intercept_nodes": structured_output.get("predicted_intercept_nodes", [])
        }

        if broadcast_callback:
            await broadcast_callback({
                "type": "SWARM_AGENT_EXECUTED",
                "agent": self.agent_name,
                "status": "COMPLETED",
                "latency_ms": latency_ms,
                "movement_state": result["movement_state"],
                "message": f"Agent 1 completed in {latency_ms}ms: {result['movement_state']}"
            })

        return result
