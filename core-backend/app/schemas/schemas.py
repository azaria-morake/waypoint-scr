"""
Pydantic v2 Strict Validation Schemas for Waypoint Secure API Contracts
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# User & Auth
class UserCreate(BaseModel):
    phone_number: str
    full_name: str
    standard_pin: str = Field(min_length=4, max_length=4)
    duress_pin: str = Field(min_length=4, max_length=4)

class UserLogin(BaseModel):
    phone_number: str
    pin: str = Field(min_length=4, max_length=4)

class UserResponse(BaseModel):
    user_id: str
    phone_number: str
    full_name: str
    is_fica_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Emergency Contact
class EmergencyContactCreate(BaseModel):
    full_name: str
    relationship: str
    phone_number: str
    whatsapp_number: str
    priority_order: int = 1

class EmergencyContactResponse(BaseModel):
    contact_id: str
    user_id: str
    full_name: str
    relationship: str
    phone_number: str
    whatsapp_number: str
    priority_order: int

    class Config:
        from_attributes = True

# BOLO Profile
class BoloProfileCreate(BaseModel):
    height_cm: int
    build_description: str
    face_photo_url: str
    distinguishing_marks: Optional[str] = None

class BoloProfileResponse(BaseModel):
    profile_id: str
    user_id: str
    height_cm: int
    build_description: str
    kms_key_id: str
    is_encrypted: bool = True
    updated_at: datetime

    class Config:
        from_attributes = True

class BoloDecryptedView(BaseModel):
    profile_id: str
    full_name: str
    phone_number: str
    height_cm: int
    build_description: str
    face_photo_url: str
    distinguishing_marks: Optional[str] = None
    synthesized_attire: Optional[str] = None
    decrypted_at: datetime

# Journey & FSM
class JourneyStartRequest(BaseModel):
    destination_name: str = "Sandton City Mall, Sandton"
    destination_lat: float = -26.1076
    destination_lng: float = 28.0567
    eta_minutes: int = 25
    pre_journey_outfit_photo_url: Optional[str] = None

class JourneyResponse(BaseModel):
    journey_id: str
    user_id: str
    status: str
    origin_lat: float
    origin_lng: float
    destination_name: Optional[str]
    destination_lat: float
    destination_lng: float
    pre_journey_outfit_photo_url: Optional[str]
    eta_timestamp: datetime
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JourneyDisarmRequest(BaseModel):
    pin: str = Field(min_length=4, max_length=4)

class JourneyDisarmResponse(BaseModel):
    status: str
    ui_action: str
    message: str

# Telemetry
class TelemetryPingCreate(BaseModel):
    lat: float
    lng: float
    speed_kmh: float = 0.0
    heading_deg: float = 0.0
    g_force: float = 1.0
    battery: int = 85
    ingestion_channel: str = "WSS"

class TelemetryPingResponse(BaseModel):
    ping_id: int
    journey_id: str
    lat: float
    lng: float
    speed_kmh: float
    heading_deg: float
    accelerometer_g_force: float
    battery_percentage: int
    ingestion_channel: str
    recorded_at: datetime

    class Config:
        from_attributes = True

# SMS Fallback
class SmsFallbackRequest(BaseModel):
    raw_sms: str

# Incident & Swarm
class IncidentResponse(BaseModel):
    incident_id: str
    journey_id: str
    trigger_source: str
    movement_state: str
    synthesized_bolo_json: Dict[str, Any]
    predicted_intercept_nodes: List[Dict[str, Any]]
    resolution_status: str
    triggered_at: datetime

    class Config:
        from_attributes = True

class AIAgentLogResponse(BaseModel):
    agent_log_id: str
    incident_id: str
    agent_type: str
    action_taken: str
    structured_output: Dict[str, Any]
    transcript_or_payload: Optional[str]
    execution_latency_ms: int
    created_at: datetime

    class Config:
        from_attributes = True

class PopiaAuditLogResponse(BaseModel):
    audit_id: str
    incident_id: str
    org_id: str
    responder_id: Optional[str]
    action: str
    ip_address: str
    justification: Optional[str]
    accessed_at: datetime

    class Config:
        from_attributes = True

# Organization & Custom B2B Ops
class OrganizationResponse(BaseModel):
    org_id: str
    org_name: str
    org_type: str
    subscription_tier: str
    max_concurrent_agents: int
    monthly_voice_minutes_used: int
    monthly_voice_minutes_limit: int

    class Config:
        from_attributes = True

class TierUpdateRequest(BaseModel):
    tier: str

class CustomAgentTriggerRequest(BaseModel):
    target_property_or_client: str
    callback_number: Optional[str] = None

class CustomAgentExecutionResponse(BaseModel):
    custom_agent_id: str
    task_category: str
    status_result: str
    action_taken: str
    details: str
    latency_ms: int
    voice_minutes_billed: float
