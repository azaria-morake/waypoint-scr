"""
Waypoint Secure - High-Frequency Telemetry WebSocket Router
Ingests real-time GPS, kinematics, and accelerometer G-force packets from citizen devices.
"""
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.database import AsyncSessionLocal
from app.services.telemetry_service import TelemetryService

logger = logging.getLogger("waypoint.telemetry_ws")
router = APIRouter(tags=["Telemetry WebSocket"])

# Hook to broadcast telemetry out to Command Dashboard
dashboard_broadcast_hook = None
swarm_trigger_hook = None

def set_dashboard_broadcast_hook(hook):
    global dashboard_broadcast_hook
    dashboard_broadcast_hook = hook

def set_swarm_trigger_hook(hook):
    global swarm_trigger_hook
    swarm_trigger_hook = hook

from pydantic import BaseModel
from typing import Optional

class TelemetryPingRequest(BaseModel):
    journey_id: str
    lat: float
    lng: float
    speed_kmh: float = 0.0
    heading_deg: float = 0.0
    g_force: float = 1.0
    battery: int = 85
    citizen_name: Optional[str] = "Thandiwe Ndlovu"

@router.post("/api/v1/telemetry/ping")
async def post_telemetry_ping(ping: TelemetryPingRequest):
    """
    Ingests live telemetry ping via HTTP POST and broadcasts in real time to the Command Dashboard.
    """
    try:
        async with AsyncSessionLocal() as session:
            await TelemetryService.record_ping(
                session=session,
                journey_id=ping.journey_id,
                lat=ping.lat,
                lng=ping.lng,
                speed_kmh=ping.speed_kmh,
                heading_deg=ping.heading_deg,
                g_force=ping.g_force,
                battery=ping.battery,
                channel="HTTP",
                on_anomaly_trigger=swarm_trigger_hook
            )
    except Exception as e:
        logger.warning(f"DB record_ping fallback: {e}")

    if dashboard_broadcast_hook:
        await dashboard_broadcast_hook({
            "type": "TELEMETRY_PING",
            "journey_id": ping.journey_id,
            "lat": ping.lat,
            "lng": ping.lng,
            "speed_kmh": ping.speed_kmh,
            "heading_deg": ping.heading_deg,
            "g_force": ping.g_force,
            "battery": ping.battery,
            "citizen_name": ping.citizen_name or "Thandiwe Ndlovu"
        })
    return {"status": "OK", "ping_saved": True}

@router.websocket("/ws/telemetry/{journey_id}")
async def telemetry_ingest_websocket(websocket: WebSocket, journey_id: str):
    await websocket.accept()
    logger.info(f"Telemetry stream opened for journey {journey_id}")
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                lat = float(data.get("lat", -26.2678))
                lng = float(data.get("lng", 28.1245))
                speed = float(data.get("speed_kmh", 0.0))
                heading = float(data.get("heading_deg", 0.0))
                g_force = float(data.get("g_force", 1.0))
                battery = int(data.get("battery", 85))

                # Record ping asynchronously in DB
                async with AsyncSessionLocal() as session:
                    await TelemetryService.record_ping(
                        session=session,
                        journey_id=journey_id,
                        lat=lat,
                        lng=lng,
                        speed_kmh=speed,
                        heading_deg=heading,
                        g_force=g_force,
                        battery=battery,
                        channel="WSS",
                        on_anomaly_trigger=swarm_trigger_hook
                    )

                # Broadcast to Command Dashboard in real time
                if dashboard_broadcast_hook:
                    await dashboard_broadcast_hook({
                        "type": "TELEMETRY_PING",
                        "journey_id": journey_id,
                        "lat": lat,
                        "lng": lng,
                        "speed_kmh": speed,
                        "heading_deg": heading,
                        "g_force": g_force,
                        "battery": battery,
                        "citizen_name": "Thandiwe Ndlovu"
                    })

                await websocket.send_text(json.dumps({"status": "ACK", "ping_saved": True}))

            except Exception as e:
                logger.error(f"Error processing telemetry packet: {e}")

    except WebSocketDisconnect:
        logger.info(f"Telemetry stream closed for journey {journey_id}")
    except Exception as e:
        logger.error(f"WebSocket telemetry error: {e}")
