"""
SQLAlchemy ORM Models: Incidents, Swarm AI Agent Logs, Dispatches & POPIA Audit Logs
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Incident(Base):
    __tablename__ = "incidents"

    incident_id = Column(String(36), primary_key=True, default=gen_uuid)
    journey_id = Column(String(36), ForeignKey("journeys.journey_id"), unique=True, nullable=False)
    trigger_source = Column(String(30), nullable=False)  # SECOND_TAP, DURESS_PIN, DEAD_MAN_SWITCH, G_FORCE_ANOMALY, SMS_FALLBACK
    movement_state = Column(String(40), default="CALCULATING")
    synthesized_bolo_json = Column(JSON, default=dict)
    predicted_intercept_nodes = Column(JSON, default=list)
    resolution_status = Column(String(30), default="ACTIVE")  # ACTIVE, INTERCEPTED, FALSE_ALARM, RESOLVED
    triggered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    journey = relationship("Journey", back_populates="incident")
    agent_logs = relationship("AIAgentLog", back_populates="incident", cascade="all, delete-orphan", order_by="AIAgentLog.created_at")
    dispatches = relationship("IncidentDispatch", back_populates="incident", cascade="all, delete-orphan")
    popia_audit_logs = relationship("PopiaAuditLog", back_populates="incident")

class AIAgentLog(Base):
    __tablename__ = "ai_agent_logs"

    agent_log_id = Column(String(36), primary_key=True, default=gen_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.incident_id", ondelete="CASCADE"), nullable=False)
    agent_type = Column(String(40), nullable=False)
    action_taken = Column(Text, nullable=False)
    structured_output = Column(JSON, nullable=False, default=dict)
    transcript_or_payload = Column(Text, nullable=True)
    execution_latency_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="agent_logs")

class IncidentDispatch(Base):
    __tablename__ = "incident_dispatches"

    dispatch_id = Column(String(36), primary_key=True, default=gen_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.incident_id", ondelete="CASCADE"), nullable=False)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=False)
    responder_id = Column(String(36), ForeignKey("responders.responder_id"), nullable=False)
    dispatch_method = Column(String(30), nullable=False)  # AI_VOICE_CALL, DASHBOARD_PUSH, WHATSAPP, CAD_WEBHOOK
    distance_km = Column(Float, nullable=False)
    alerted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    arrived_at = Column(DateTime(timezone=True), nullable=True)

    incident = relationship("Incident", back_populates="dispatches")

class PopiaAuditLog(Base):
    __tablename__ = "popia_audit_logs"

    audit_id = Column(String(36), primary_key=True, default=gen_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.incident_id"), nullable=False)
    org_id = Column(String(36), ForeignKey("organizations.org_id"), nullable=False)
    responder_id = Column(String(36), nullable=True)
    action = Column(String(60), nullable=False)  # KMS_BOLO_DECRYPTED, LIVE_TRAJECTORY_VIEWED, NOK_TRANSCRIPT_ACCESSED, FORENSIC_EXPORT
    ip_address = Column(String(45), nullable=False, default="127.0.0.1")
    justification = Column(Text, nullable=True, default="POPIA Section 11(1)(d) Emergency Vital Interest")
    accessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="popia_audit_logs")
