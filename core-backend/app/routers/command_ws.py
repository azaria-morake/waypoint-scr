"""
Waypoint Secure - Multi-Tenant Command Dashboard WebSocket Router
Streams real-time Way Swarm multi-agent events, telemetry vectors, and POPIA decrypts to control rooms.
"""
import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.database import AsyncSessionLocal
from sqlalchemy import select
from app.models import Journey, User, BoloProfile, Organization, Responder, Incident, PopiaAuditLog

logger = logging.getLogger("waypoint.command_ws")
router = APIRouter(tags=["Command Dashboard WebSocket"])

class CommandConnectionHub:
    def __init__(self):
        # Map org_id -> set of active WebSockets
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, org_id: str, websocket: WebSocket):
        await websocket.accept()
        if org_id not in self.connections:
            self.connections[org_id] = set()
        self.connections[org_id].add(websocket)
        logger.info(f"Dashboard connected for org {org_id}. Total: {len(self.connections[org_id])}")

    def disconnect(self, org_id: str, websocket: WebSocket):
        if org_id in self.connections:
            self.connections[org_id].discard(websocket)
            if not self.connections[org_id]:
                del self.connections[org_id]
        logger.info(f"Dashboard disconnected for org {org_id}")

    async def broadcast(self, message: Dict):
        payload = json.dumps(message)
        for org_id, sockets in list(self.connections.items()):
            dead = set()
            for ws in sockets:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.add(ws)
            for d in dead:
                sockets.discard(d)

hub = CommandConnectionHub()

@router.websocket("/ws/command/{org_id}")
async def command_stream_websocket(websocket: WebSocket, org_id: str):
    await hub.connect(org_id, websocket)
    try:
        # Build and send initial snapshot to newly connected dashboard
        async with AsyncSessionLocal() as session:
            # Get latest journey and incident
            j_res = await session.execute(select(Journey).order_by(Journey.started_at.desc()).limit(1))
            journey = j_res.scalar_one_or_none()

            # Responders
            r_res = await session.execute(select(Responder))
            responders = [
                {
                    "responder_id": r.responder_id,
                    "callsign": r.callsign,
                    "role": r.role,
                    "lat": r.lat,
                    "lng": r.lng,
                    "status": r.status
                }
                for r in r_res.scalars().all()
            ]

            # BOLO profile
            bolo_res = await session.execute(select(BoloProfile).limit(1))
            bolo = bolo_res.scalar_one_or_none()

            # Audits
            a_res = await session.execute(select(PopiaAuditLog).order_by(PopiaAuditLog.accessed_at.desc()).limit(10))
            audits = [
                {
                    "audit_id": a.audit_id,
                    "action": a.action,
                    "responder_id": a.responder_id,
                    "ip_address": a.ip_address,
                    "justification": a.justification,
                    "accessed_at": a.accessed_at.isoformat() if a.accessed_at else None
                }
                for a in a_res.scalars().all()
            ]

            is_red = journey and journey.status == "RED"

            initial_snapshot = {
                "type": "SNAPSHOT",
                "org_id": org_id,
                "journey": {
                    "journey_id": journey.journey_id if journey else "none",
                    "status": journey.status if journey else "IDLE",
                    "origin_lat": journey.origin_lat if journey else -26.2678,
                    "origin_lng": journey.origin_lng if journey else 28.1245,
                    "destination_name": journey.destination_name if journey else "Sandton City Mall, Sandton",
                    "pre_photo_url": journey.pre_journey_outfit_photo_url if journey else None
                } if journey else None,
                "is_popia_shielded": not is_red,
                "bolo": {
                    "full_name": "Thandiwe Ndlovu" if is_red else "[ENCRYPTED - POPIA SHIELD ACTIVE]",
                    "height_cm": bolo.height_cm if bolo else 165,
                    "build": bolo.build_description if (bolo and is_red) else "[ENCRYPTED]",
                    "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" if is_red else ""
                },
                "responders": responders,
                "popia_audit_logs": audits
            }
            await websocket.send_text(json.dumps(initial_snapshot))

        while True:
            # Keep-alive heartbeat listener
            await websocket.receive_text()

    except WebSocketDisconnect:
        hub.disconnect(org_id, websocket)
    except Exception as e:
        logger.error(f"Command WS error for org {org_id}: {e}")
        hub.disconnect(org_id, websocket)
