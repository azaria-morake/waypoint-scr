"""
Waypoint Secure - Journey Finite State Machine (FSM) & Dual-PIN Security
Manages IDLE -> GREEN -> AMBER -> RED -> SAFE_COMPLETED transitions and Dead-Man's Switch.
"""
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Tuple, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models import Journey, User, Incident, PopiaAuditLog
from app.security.crypto import SecurityCrypto

class JourneyFSM:
    @staticmethod
    async def start_journey(
        session: AsyncSession,
        user_id: str,
        destination_name: str,
        destination_lat: float,
        destination_lng: float,
        eta_minutes: int,
        pre_journey_outfit_photo_url: Optional[str] = None
    ) -> Journey:
        """Starts a GREEN journey with Dead-Man's Switch ETA timestamp."""
        now = datetime.now(timezone.utc)
        eta = now + timedelta(minutes=eta_minutes)

        journey = Journey(
            user_id=user_id,
            status="GREEN",
            origin_lat=-26.2678,
            origin_lng=28.1245,
            destination_name=destination_name,
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            pre_journey_outfit_photo_url=pre_journey_outfit_photo_url,
            eta_timestamp=eta,
            started_at=now
        )
        session.add(journey)
        await session.flush()
        return journey

    @staticmethod
    async def disarm_journey(
        session: AsyncSession,
        journey_id: str,
        pin: str,
        on_duress_trigger_swarm=None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Dual-PIN Disarm Protocol:
        - Case A: Matches standard_pin_hash -> Ends journey normally (SAFE_COMPLETED).
        - Case B: Matches duress_pin_hash -> Returns the EXACT SAME safe response to client,
                  while secretly transitioning state to RED and awakening The Way Swarm!
        """
        # Resolve journey by ID or fallback to latest active journey
        journey = None
        if journey_id and journey_id != "active_journey":
            result = await session.execute(select(Journey).where(Journey.journey_id == journey_id))
            journey = result.scalar_one_or_none()

        if not journey:
            # Fall back to newest active journey
            result = await session.execute(
                select(Journey)
                .where(Journey.status.in_(["GREEN", "AMBER", "RED"]))
                .order_by(Journey.started_at.desc())
                .limit(1)
            )
            journey = result.scalar_one_or_none()

        if not journey:
            # Fall back to newest journey overall
            result = await session.execute(
                select(Journey).order_by(Journey.started_at.desc()).limit(1)
            )
            journey = result.scalar_one_or_none()

        if not journey:
            return False, {"error": "Active journey not found"}

        user_result = await session.execute(select(User).where(User.user_id == journey.user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            return False, {"error": "User not found"}

        # 1. Verify Standard PIN (Safe Arrival / Disarm)
        if SecurityCrypto.verify_pin(pin, user.standard_pin_hash):
            journey.status = "SAFE_COMPLETED"
            journey.ended_at = datetime.now(timezone.utc)

            # Resolve any active incident
            inc_res = await session.execute(
                select(Incident).where(
                    Incident.journey_id == journey.journey_id,
                    Incident.resolution_status == "ACTIVE"
                )
            )
            for inc in inc_res.scalars().all():
                inc.resolution_status = "RESOLVED_SAFE"
                inc.resolved_at = datetime.now(timezone.utc)

            await session.commit()
            return True, {
                "status": "SAFE_COMPLETED",
                "journey_id": journey.journey_id,
                "ui_action": "SHOW_HOME_SCREEN",
                "message": "Journey safely ended with Standard PIN."
            }

        # 2. Verify Duress PIN (Silent Coercion / Hostage Protocol)
        elif SecurityCrypto.verify_pin(pin, user.duress_pin_hash):
            # SILENT CODE RED ESCALATION:
            journey.status = "RED"
            await session.commit()

            # Trigger Way Swarm in background
            if on_duress_trigger_swarm:
                asyncio.create_task(on_duress_trigger_swarm(journey.journey_id, "DURESS_PIN"))

            # Return DECEPTIVE peaceful response to citizen phone so kidnapper suspects nothing
            return True, {
                "status": "SAFE_COMPLETED",
                "journey_id": journey.journey_id,
                "ui_action": "SHOW_HOME_SCREEN",
                "message": "Journey completed safely."
            }

        else:
            return False, {"error": "Invalid security PIN entered"}

    @staticmethod
    async def trigger_panic(
        session: AsyncSession,
        journey_id: str,
        trigger_source: str = "SECOND_TAP",
        on_panic_trigger_swarm=None
    ) -> Incident:
        """Escalates journey to RED alert immediately (2nd Tap or G-Force spike)."""
        journey = None
        if journey_id and journey_id != "active_journey":
            result = await session.execute(select(Journey).where(Journey.journey_id == journey_id))
            journey = result.scalar_one_or_none()

        if not journey:
            # Fall back to newest active journey
            result = await session.execute(
                select(Journey)
                .where(Journey.status.in_(["GREEN", "AMBER"]))
                .order_by(Journey.started_at.desc())
                .limit(1)
            )
            journey = result.scalar_one_or_none()

        if not journey:
            # Create ad-hoc journey if user panics directly from IDLE
            user_res = await session.execute(select(User).limit(1))
            user = user_res.scalar_one_or_none()
            user_id = user.user_id if user else "test_user"
            now = datetime.now(timezone.utc)
            journey = Journey(
                user_id=user_id,
                status="RED",
                origin_lat=-26.2678,
                origin_lng=28.1245,
                destination_name="Emergency Intercept Point",
                destination_lat=-26.2580,
                destination_lng=28.1290,
                eta_timestamp=now + timedelta(minutes=10),
                started_at=now
            )
            session.add(journey)
            await session.flush()
        else:
            journey.status = "RED"

        # Check or create Incident
        inc_res = await session.execute(select(Incident).where(Incident.journey_id == journey.journey_id))
        incident = inc_res.scalar_one_or_none()
        if not incident:
            incident = Incident(
                journey_id=journey.journey_id,
                trigger_source=trigger_source,
                movement_state="CALCULATING",
                resolution_status="ACTIVE"
            )
            session.add(incident)
            await session.flush()
        else:
            incident.resolution_status = "ACTIVE"
            incident.resolved_at = None

        await session.commit()

        if on_panic_trigger_swarm:
            asyncio.create_task(on_panic_trigger_swarm(journey.journey_id, trigger_source))

        return incident
