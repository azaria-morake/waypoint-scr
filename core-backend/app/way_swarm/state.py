"""
The Way Swarm - Shared Multi-Agent State Definition
"""
from typing import TypedDict, List, Dict, Any, Optional

class WaySwarmState(TypedDict, total=False):
    incident_id: str
    journey_id: str
    user_id: str
    trigger_source: str
    org_id: str
    subscription_tier: str  # TIER_1_STARTER | TIER_2_PRO | TIER_3_GOV
    latest_telemetry: Dict[str, Any]
    decrypted_bolo: Dict[str, Any]
    pre_journey_outfit_url: Optional[str]
    emergency_contacts: List[Dict[str, Any]]
    movement_classification: str
    predicted_intercept_nodes: List[Dict[str, Any]]
    nearby_patrollers_alerted: List[Dict[str, Any]]
    nok_extracted_attire: Optional[Dict[str, Any]]
    dispatched_units: List[Dict[str, Any]]
    agent_execution_logs: List[Dict[str, Any]]
    total_execution_latency_ms: int
