"""
Waypoint Secure - Telemetry Ingestion & Kinematic Anomaly Service
Handles high-frequency telemetry, speed vector calculation, and accelerometer G-force struggle detection.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import TelemetryPing, Journey

class TelemetryService:
    @staticmethod
    async def record_ping(
        session: AsyncSession,
        journey_id: str,
        lat: float,
        lng: float,
        speed_kmh: float = 0.0,
        heading_deg: float = 0.0,
        g_force: float = 1.0,
        battery: int = 85,
        channel: str = "WSS",
        on_anomaly_trigger=None
    ) -> TelemetryPing:
        """Records telemetry ping and evaluates G-force struggle / crash anomaly."""
        ping = TelemetryPing(
            journey_id=journey_id,
            lat=lat,
            lng=lng,
            speed_kmh=speed_kmh,
            heading_deg=heading_deg,
            accelerometer_g_force=g_force,
            battery_percentage=battery,
            ingestion_channel=channel,
            recorded_at=datetime.now(timezone.utc)
        )
        session.add(ping)

        # Check for violent seizure or crash anomaly
        if g_force >= 3.8:
            result = await session.execute(select(Journey).where(Journey.journey_id == journey_id))
            journey = result.scalar_one_or_none()
            if journey and journey.status == "GREEN":
                journey.status = "RED"
                if on_anomaly_trigger:
                    await on_anomaly_trigger(journey_id, "G_FORCE_ANOMALY")

        await session.commit()
        return ping
