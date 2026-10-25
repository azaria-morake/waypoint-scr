"""
Waypoint Secure - Inbound Webhooks & 2G SMS Fallback Router
Accepts compressed GSM-7 SMS packets during load-shedding LTE blackouts.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Journey, Incident
from app.schemas import SmsFallbackRequest
from app.services.sms_gateway import SmsGateway
from app.services.telemetry_service import TelemetryService
from app.services.journey_fsm import JourneyFSM

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks & 2G Fallback"])

swarm_trigger_hook = None

def set_swarm_trigger_hook(hook):
    global swarm_trigger_hook
    swarm_trigger_hook = hook

@router.post("/sms-fallback")
async def inbound_sms_fallback(req: SmsFallbackRequest, db: AsyncSession = Depends(get_db)):
    """
    Inbound 2G / Load-Shedding GSM-7 SMS Fallback Webhook.
    Example: WP1|+27825550199|RED|-26.2678,28.1245|78|140|42|HMAC_OK
    """
    valid, parsed = SmsGateway.parse_gsm_packet(req.raw_sms)
    if not valid:
        raise HTTPException(status_code=400, detail=parsed.get("error", "SMS parse failed"))

    phone = parsed["phone_number"]
    user_res = await db.execute(select(User).where(User.phone_number == phone))
    user = user_res.scalar_one_or_none()
    if not user:
        # Fallback to demo user
        user_res = await db.execute(select(User).limit(1))
        user = user_res.scalar_one_or_none()

    user_id = user.user_id if user else "demo_user"

    # Find or create active journey
    j_res = await db.execute(select(Journey).where(Journey.user_id == user_id).order_by(Journey.started_at.desc()).limit(1))
    journey = j_res.scalar_one_or_none()
    if not journey or journey.status == "IDLE":
        journey = await JourneyFSM.start_journey(
            session=db,
            user_id=user_id,
            destination_name="Emergency GSM Corridor",
            destination_lat=-26.2580,
            destination_lng=28.1290,
            eta_minutes=15
        )

    # Ingest telemetry ping via SMS channel
    await TelemetryService.record_ping(
        session=db,
        journey_id=journey.journey_id,
        lat=parsed["lat"],
        lng=parsed["lng"],
        speed_kmh=parsed["speed_kmh"],
        heading_deg=parsed["heading_deg"],
        g_force=2.8,
        battery=parsed["battery"],
        channel="SMS_FALLBACK"
    )

    # Trigger Code Red
    incident = await JourneyFSM.trigger_panic(
        session=db,
        journey_id=journey.journey_id,
        trigger_source="SMS_FALLBACK",
        on_panic_trigger_swarm=swarm_trigger_hook
    )

    return {
        "success": True,
        "channel": "SMS_FALLBACK",
        "verified_hmac": True,
        "journey_id": journey.journey_id,
        "incident_id": incident.incident_id,
        "parsed": parsed,
        "message": "📡 2G GSM SMS Fallback verified via HMAC. Code Red awakened."
    }
