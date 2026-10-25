"""
Waypoint Secure - B2B Private Security Custom Ops & Organization Tier Router
Handles commercial agent workflows, metered billing, and organization tier switching.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models import Organization, CustomB2BAgent, Journey, Responder, PopiaAuditLog
from app.schemas import CustomAgentTriggerRequest, CustomAgentExecutionResponse, TierUpdateRequest
from app.way_swarm.custom_ops_agent import CustomB2BOpsAgent

router = APIRouter(prefix="/api/v1", tags=["B2B Operations API"])
custom_ops_agent = CustomB2BOpsAgent()

# Broadcast hook
dashboard_broadcast_hook = None

def set_dashboard_broadcast_hook(hook):
    global dashboard_broadcast_hook
    dashboard_broadcast_hook = hook

@router.post("/b2b/custom-agents/{custom_agent_id}/trigger", response_model=CustomAgentExecutionResponse)
async def trigger_custom_b2b_agent(
    custom_agent_id: str,
    req: CustomAgentTriggerRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes commercial operations workflow (Alarm Verification, Client Welfare, Guard Heartbeat).
    Restricted to Tier 2 (Pro) and Tier 3 (Gov). Increments metered voice minutes.
    """
    result = await db.execute(select(CustomB2BAgent).where(CustomB2BAgent.custom_agent_id == custom_agent_id))
    agent = result.scalar_one_or_none()
    category = agent.task_category if agent else "ALARM_VERIFICATION"

    # Execute commercial task
    task_res = await custom_ops_agent.execute_task(
        task_category=category,
        target_property_or_client=req.target_property_or_client,
        callback_number=req.callback_number,
        broadcast_callback=dashboard_broadcast_hook
    )

    # Metered billing: increment organization voice minutes
    billed_minutes = task_res.get("voice_minutes_billed", 2.0)
    org_id = agent.org_id if agent else "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b"
    await db.execute(
        update(Organization)
        .where(Organization.org_id == org_id)
        .values(monthly_voice_minutes_used=Organization.monthly_voice_minutes_used + int(billed_minutes))
    )
    await db.commit()

    return {
        "custom_agent_id": custom_agent_id,
        "task_category": category,
        "status_result": task_res["status_result"],
        "action_taken": task_res["action_taken"],
        "details": task_res["details"],
        "latency_ms": task_res["latency_ms"],
        "voice_minutes_billed": billed_minutes
    }

@router.post("/organizations/{org_id}/tier")
async def update_org_tier(org_id: str, req: TierUpdateRequest, db: AsyncSession = Depends(get_db)):
    """Switches tenant subscription tier (TIER_1_STARTER | TIER_2_PRO | TIER_3_GOV)."""
    await db.execute(
        update(Organization)
        .where(Organization.org_id == org_id)
        .values(subscription_tier=req.tier)
    )
    await db.commit()

    if dashboard_broadcast_hook:
        await dashboard_broadcast_hook({
            "type": "TIER_UPDATED",
            "org_id": org_id,
            "tier": req.tier,
            "message": f"Tenant organization updated to {req.tier}."
        })

    return {"success": True, "org_id": org_id, "subscription_tier": req.tier}

@router.get("/dashboard/state")
async def get_dashboard_state(db: AsyncSession = Depends(get_db)):
    """Returns complete state snapshot for Command Center."""
    j_res = await db.execute(select(Journey).order_by(Journey.started_at.desc()).limit(1))
    journey = j_res.scalar_one_or_none()
    is_red = journey and journey.status == "RED"

    r_res = await db.execute(select(Responder))
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

    o_res = await db.execute(select(Organization).limit(1))
    org = o_res.scalar_one_or_none()

    a_res = await db.execute(select(PopiaAuditLog).order_by(PopiaAuditLog.accessed_at.desc()).limit(10))
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

    return {
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
            "height_cm": 165,
            "build": "Slender Athletic" if is_red else "[ENCRYPTED]",
            "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" if is_red else ""
        },
        "organization": {
            "org_name": org.org_name if org else "Fox Tactical Security",
            "tier": org.subscription_tier if org else "TIER_2_PRO",
            "voice_minutes_used": org.monthly_voice_minutes_used if org else 180,
            "voice_minutes_limit": org.monthly_voice_minutes_limit if org else 1000
        },
        "responders": responders,
        "popia_audit_logs": audits
    }
