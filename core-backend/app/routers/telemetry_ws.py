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
                        "battery": battery
                    })

                await websocket.send_text(json.dumps({"status": "ACK", "ping_saved": True}))

            except Exception as e:
                logger.error(f"Error processing telemetry packet: {e}")

    except WebSocketDisconnect:
        logger.info(f"Telemetry stream closed for journey {journey_id}")
    except Exception as e:
        logger.error(f"WebSocket telemetry error: {e}")
