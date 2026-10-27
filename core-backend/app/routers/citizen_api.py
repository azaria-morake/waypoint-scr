"""
Waypoint Secure - Citizen REST API Router
Handles Citizen onboarding, BOLO profile, Two-Tap journey lifecycle, and Dual-PIN verification.
"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, BoloProfile, EmergencyContact, Journey, Incident
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    JourneyStartRequest,
    JourneyResponse,
    JourneyDisarmRequest,
    JourneyDisarmResponse
)
from app.security.crypto import SecurityCrypto
from app.services.journey_fsm import JourneyFSM
from app.config import settings

router = APIRouter(prefix="/api/v1", tags=["Citizen Mobile API"])

# Reference to background swarm trigger callback (injected by main.py)
swarm_trigger_hook = None

def set_swarm_trigger_hook(hook):
    global swarm_trigger_hook
    swarm_trigger_hook = hook

@router.post("/auth/signup", response_model=UserResponse)
async def signup_citizen(req: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registers a citizen, hashing Standard and Duress PINs using Argon2id."""
    existing = await db.execute(select(User).where(User.phone_number == req.phone_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    std_hash = SecurityCrypto.hash_pin(req.standard_pin)
    dur_hash = SecurityCrypto.hash_pin(req.duress_pin)

    user = User(
        phone_number=req.phone_number,
        full_name=req.full_name,
        standard_pin_hash=std_hash,
        duress_pin_hash=dur_hash,
        is_fica_verified=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/auth/login")
async def login_citizen(req: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticates citizen with phone and 4-digit PIN."""
    result = await db.execute(select(User).where(User.phone_number == req.phone_number))
    user = result.scalar_one_or_none()
    if not user:
        # Auto-create for demo convenience if doesn't exist
        std_hash = SecurityCrypto.hash_pin(req.pin)
        dur_hash = SecurityCrypto.hash_pin("9999")
        user = User(
            phone_number=req.phone_number,
            full_name="Thandiwe Ndlovu",
            standard_pin_hash=std_hash,
            duress_pin_hash=dur_hash,
            is_fica_verified=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    is_valid = SecurityCrypto.verify_pin(req.pin, user.standard_pin_hash)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid security PIN")

    return {
        "status": "AUTHENTICATED",
        "user_id": user.user_id,
        "full_name": user.full_name,
        "phone_number": user.phone_number
    }

@router.post("/journeys/start", response_model=JourneyResponse)
async def start_green_journey(req: JourneyStartRequest, db: AsyncSession = Depends(get_db)):
    """
    1st Tap: Starts a GREEN journey with Dead-Man's Switch ETA countdown.
    """
    # Use pre-seeded demo user or first user in DB
    user_res = await db.execute(select(User).limit(1))
    user = user_res.scalar_one_or_none()
    user_id = user.user_id if user else "demo_user_id"

    journey = await JourneyFSM.start_journey(
        session=db,
        user_id=user_id,
        destination_name=req.destination_name,
        destination_lat=req.destination_lat,
        destination_lng=req.destination_lng,
        eta_minutes=req.eta_minutes,
        pre_journey_outfit_photo_url=req.pre_journey_outfit_photo_url
    )
    await db.commit()
    await db.refresh(journey)

    try:
        from app.routers import command_ws
        await command_ws.hub.broadcast({
            "type": "JOURNEY_STARTED",
            "journey_id": journey.journey_id,
            "citizen_name": user.full_name if user else "Thandiwe Ndlovu",
            "status": "GREEN",
            "lat": journey.origin_lat or -26.2585,
            "lng": journey.origin_lng or 28.1215,
            "speed_kmh": 45.0,
            "heading_deg": 140.0,
            "destination": journey.destination_name,
            "message": "Thandiwe has activated a journey. Currently safe. Open chat interface if you want me to run any tasks on the journey."
        })
    except Exception as e:
        pass

    return journey

@router.post("/journeys/{journey_id}/panic")
async def trigger_panic_tap_two(journey_id: str, db: AsyncSession = Depends(get_db)):
    """
    2nd Tap: Emergency SOS Panic Button. Immediately transitions to RED and awakens The Way Swarm!
    """
    incident = await JourneyFSM.trigger_panic(
        session=db,
        journey_id=journey_id,
        trigger_source="SECOND_TAP",
        on_panic_trigger_swarm=swarm_trigger_hook
    )

    try:
        from app.routers import command_ws
        await command_ws.hub.broadcast({
            "type": "JOURNEY_RED_ALERT",
            "journey_id": journey_id,
            "incident_id": incident.incident_id,
            "trigger_source": "SECOND_TAP",
            "status": "RED",
            "lat": getattr(incident, "lat", -26.2678) or -26.2678,
            "lng": getattr(incident, "lng", 28.1245) or 28.1245,
            "speed_kmh": 78.0,
            "heading_deg": 140.0,
            "citizen_name": "Thandiwe Ndlovu",
            "message": "🚨 Emergency: Thandiwe has triggered a Red Alert! Immediate operator intervention required. Click to engage BOLO Young."
        })
    except Exception as e:
        pass

    return {
        "success": True,
        "status": "RED",
        "incident_id": incident.incident_id,
        "message": "🚨 Red alert triggered. The Way Swarm awakened."
    }

@router.post("/journeys/{journey_id}/disarm", response_model=JourneyDisarmResponse)
async def disarm_journey_dual_pin(
    journey_id: str,
    req: JourneyDisarmRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Dual-PIN Disarm Protocol:
    - Standard PIN 1234: Safely disarms journey (SAFE_COMPLETED).
    - Duress PIN 9999: Returns the EXACT SAME safe response to client,
      while secretly transitioning state to RED and awakening The Way Swarm!
    """
    success, res = await JourneyFSM.disarm_journey(
        session=db,
        journey_id=journey_id,
        pin=req.pin,
        on_duress_trigger_swarm=swarm_trigger_hook
    )

    if not success:
        raise HTTPException(status_code=400, detail=res.get("error", "Disarm failed"))

    # When standard safe PIN is used, notify command room dashboard to clear alert
    if req.pin != "9999":
        from app.routers import command_ws
        await command_ws.hub.broadcast({
            "type": "JOURNEY_DISARMED",
            "journey_id": journey_id,
            "status": "SAFE_COMPLETED",
            "message": "Citizen entered Standard PIN. Journey ended safely."
        })

    return res

@router.post("/journeys/reset")
async def reset_demo_state(db: AsyncSession = Depends(get_db)):
    """Resets active journey to IDLE for demo loops."""
    now = datetime.now(timezone.utc)
    result = await db.execute(select(Journey).where(Journey.status.in_(["GREEN", "AMBER", "RED"])))
    for j in result.scalars().all():
        j.status = "SAFE_COMPLETED"
        j.ended_at = now

    # Also resolve all active incidents
    inc_res = await db.execute(select(Incident).where(Incident.resolution_status == "ACTIVE"))
    for inc in inc_res.scalars().all():
        inc.resolution_status = "RESOLVED_SAFE"
        inc.resolved_at = now

    await db.commit()

    from app.routers import command_ws
    await command_ws.hub.broadcast({
        "type": "JOURNEY_RESET",
        "status": "IDLE",
        "message": "Demo state reset to IDLE."
    })

    return {"status": "RESET_TO_IDLE", "message": "Demo reset safely."}
