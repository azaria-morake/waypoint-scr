"""
Waypoint Secure - Core Backend Application Entrypoint
Decoupled FastAPI service running on port 8000.
Coordinates SQLite/PostGIS spatial engine, AES-256-GCM crypto, The Way Swarm multi-agent engine,
and dual WebSockets for Citizen telemetry and Tactical Command Center.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.seed import seed_database
from app.models import Journey, User, Organization, BoloProfile, Incident
from app.way_swarm.supervisor import WaySwarmSupervisor

# Routers
from app.routers import citizen_api, telemetry_ws, command_ws, b2b_ops_api, webhooks

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("waypoint.main")

async def trigger_swarm_for_journey(journey_id: str, trigger_source: str = "SECOND_TAP"):
    """
    Background hook invoked when Code Red is triggered via:
    - 2nd Tap SOS panic button
    - Duress PIN (9999) silent coercion trigger
    - G-Force >3.0G struggle impact
    - 2G SMS load-shedding fallback packet
    """
    logger.info(f"Triggering The Way Swarm for journey {journey_id} (Source: {trigger_source})")
    try:
        async with AsyncSessionLocal() as session:
            j_res = await session.execute(select(Journey).where(Journey.journey_id == journey_id))
            journey = j_res.scalar_one_or_none()
            if not journey:
                logger.warning(f"Swarm triggered for missing journey {journey_id}")
                return

            u_res = await session.execute(select(User).where(User.user_id == journey.user_id))
            user = u_res.scalar_one_or_none()

            o_res = await session.execute(select(Organization).limit(1))
            org = o_res.scalar_one_or_none()

            b_res = await session.execute(select(BoloProfile).where(BoloProfile.user_id == journey.user_id))
            bolo = b_res.scalar_one_or_none()

            inc_res = await session.execute(select(Incident).where(Incident.journey_id == journey_id))
            incident = inc_res.scalar_one_or_none()

            tier = org.subscription_tier if org else "TIER_2_PRO"
            incident_id = incident.incident_id if incident else f"inc_{journey_id[:8]}"

            swarm_state = {
                "incident_id": incident_id,
                "journey_id": journey_id,
                "subscription_tier": tier,
                "trigger_source": trigger_source,
                "current_lat": journey.origin_lat,
                "current_lng": journey.origin_lng,
                "speed_kmh": 78.0,
                "heading_deg": 140.0,
                "g_force": 3.8,
                "pre_journey_outfit_photo_url": journey.pre_journey_outfit_photo_url,
                "decrypted_bolo": {
                    "full_name": user.full_name if user else "Thandiwe Ndlovu",
                    "height_cm": bolo.height_cm if bolo else 165,
                    "build": bolo.build_description if bolo else "Slender Athletic",
                    "encrypted_face_photo_blob": bolo.encrypted_face_photo_blob if bolo else "mock_photo_url",
                    "encryption_iv": bolo.encryption_iv if bolo else "mock_iv"
                }
            }

            # Broadcast Red Alert journey update to command room
            await command_ws.hub.broadcast({
                "type": "JOURNEY_RED_ALERT",
                "journey_id": journey_id,
                "incident_id": incident_id,
                "trigger_source": trigger_source,
                "status": "RED",
                "lat": journey.origin_lat,
                "lng": journey.origin_lng
            })

            supervisor = WaySwarmSupervisor()
            await supervisor.execute_swarm(
                session=session,
                state=swarm_state,
                broadcast_callback=command_ws.hub.broadcast
            )
    except Exception as e:
        logger.error(f"Error executing The Way Swarm: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and run Seed
    logger.info("Initializing Waypoint Secure database and spatial engine...")
    await init_db()
    logger.info("Executing South African Gauteng demo bootstrap seed...")
    await seed_database()

    # Wire event hooks
    telemetry_ws.set_dashboard_broadcast_hook(command_ws.hub.broadcast)
    b2b_ops_api.set_dashboard_broadcast_hook(command_ws.hub.broadcast)
    citizen_api.set_swarm_trigger_hook(trigger_swarm_for_journey)
    webhooks.set_swarm_trigger_hook(trigger_swarm_for_journey)
    logger.info("Waypoint Secure Core Backend online and fully wired.")
    yield
    logger.info("Shutting down Waypoint Secure Core Backend.")

app = FastAPI(
    title="Waypoint Secure - Core Backend API",
    description="Mission-critical high-frequency telemetry, AES-256-GCM crypto, Dual-PIN FSM, and The Way Swarm multi-agent engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Cross-Origin Resource Sharing for Citizen Mobile (3001) & Command Dashboard (3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(citizen_api.router)
app.include_router(telemetry_ws.router)
app.include_router(command_ws.router)
app.include_router(b2b_ops_api.router)
app.include_router(webhooks.router)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "Waypoint Secure Core Backend",
        "version": "1.0.0",
        "port": 8000
    }
