"""
SQLAlchemy ORM Models: Journeys & High-Frequency Telemetry Pings
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, BigInteger
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Journey(Base):
    __tablename__ = "journeys"

    journey_id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    status = Column(String(20), nullable=False, default="IDLE")  # IDLE, GREEN, AMBER, RED, SAFE_COMPLETED
    origin_lat = Column(Float, nullable=False, default=-26.2678)
    origin_lng = Column(Float, nullable=False, default=28.1245)
    destination_name = Column(String(255), nullable=True, default="Sandton City Mall, Sandton")
    destination_lat = Column(Float, nullable=False, default=-26.1076)
    destination_lng = Column(Float, nullable=False, default=28.0567)
    pre_journey_outfit_photo_url = Column(Text, nullable=True)
    eta_timestamp = Column(DateTime(timezone=True), nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="journeys")
    telemetry_pings = relationship("TelemetryPing", back_populates="journey", cascade="all, delete-orphan", order_by="desc(TelemetryPing.recorded_at)")
    incident = relationship("Incident", back_populates="journey", uselist=False)

class TelemetryPing(Base):
    __tablename__ = "telemetry_pings"

    ping_id = Column(BigInteger, primary_key=True, autoincrement=True)
    journey_id = Column(String(36), ForeignKey("journeys.journey_id", ondelete="CASCADE"), nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    speed_kmh = Column(Float, nullable=False, default=0.0)
    heading_deg = Column(Float, nullable=False, default=0.0)
    accelerometer_g_force = Column(Float, nullable=False, default=1.0)
    battery_percentage = Column(Integer, nullable=False, default=85)
    ingestion_channel = Column(String(20), nullable=False, default="WSS")  # WSS, REST, SMS_FALLBACK
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    journey = relationship("Journey", back_populates="telemetry_pings")
