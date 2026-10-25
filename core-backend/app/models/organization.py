"""
SQLAlchemy ORM Models: Tenant Organizations, Responders & Custom B2B Agents
"""
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    org_id = Column(String(36), primary_key=True, default=gen_uuid)
    org_name = Column(String(150), nullable=False)
    org_type = Column(String(30), nullable=False)  # CPF, PRIVATE_SECURITY, SAPS_GOV
    subscription_tier = Column(String(30), nullable=False, default="TIER_1_STARTER")  # TIER_1_STARTER, TIER_2_PRO, TIER_3_GOV
    # Jurisdiction bounding box representation for spatial queries
    min_lat = Column(Float, nullable=False, default=-26.35)
    max_lat = Column(Float, nullable=False, default=-26.15)
    min_lng = Column(Float, nullable=False, default=28.05)
    max_lng = Column(Float, nullable=False, default=28.25)
    max_concurrent_agents = Column(Integer, nullable=False, default=2)
    monthly_voice_minutes_used = Column(Integer, default=0)
    monthly_voice_minutes_limit = Column(Integer, default=500)
    is_active = Column(Boolean, default=True)

    responders = relationship("Responder", back_populates="organization", cascade="all, delete-orphan")
    custom_agents = relationship("CustomB2BAgent", back_populates="organization", cascade="all, delete-orphan")

class Responder(Base):
    __tablename__ = "responders"

    responder_id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organizations.org_id", ondelete="CASCADE"), nullable=False)
    callsign = Column(String(60), nullable=False)
    role = Column(String(30), nullable=False)  # DISPATCHER, PATROLLER, COMMANDER
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String(20), default="AVAILABLE")  # AVAILABLE, EN_ROUTE, ON_SCENE, OFFLINE

    organization = relationship("Organization", back_populates="responders")

class CustomB2BAgent(Base):
    __tablename__ = "custom_b2b_agents"

    custom_agent_id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organizations.org_id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    task_category = Column(String(50), nullable=False)  # ALARM_VERIFICATION, CLIENT_WELFARE_CHECK, GUARD_CHECKIN, INCIDENT_REPORT
    system_prompt_template = Column(Text, nullable=False)
    webhook_trigger_url = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="custom_agents")
