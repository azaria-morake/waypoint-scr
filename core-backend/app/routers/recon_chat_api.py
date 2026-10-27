"""
Waypoint Secure - Traffic Control & Next-of-Kin WhatsApp Reconnaissance API
Handles two-way WhatsApp conversational recon with Next-of-Kin,
Gemini 2.5 Flash entity extraction, and live payload auditing.
"""
import time
from datetime import datetime, timezone
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from app.database import get_db, AsyncSessionLocal
from app.models import Journey, User, BoloProfile, Incident, TelemetryPing
from app.way_swarm.traffic_control_agent import traffic_control_agent
from app.way_swarm.llm import llm_client
from app.config import settings

logger = logging.getLogger("waypoint.recon_chat")
router = APIRouter(prefix="/api/v1", tags=["Traffic Control & WhatsApp Recon"])

# Global session state for interactive Next-of-Kin WhatsApp Recon
class ReconSessionState:
    def __init__(self):
        self.incident_id: Optional[str] = None
        self.recipient_name: str = "Zanele Ndlovu"
        self.recipient_relationship: str = "Sister (Primary Next-of-Kin)"
        self.recipient_phone: str = "+27825550198"
        self.is_active: bool = False
        self.is_complete: bool = False
        self.messages: List[Dict[str, str]] = []
        self.extracted_attire: Optional[Dict[str, Any]] = None

    def reset(self):
        self.is_active = False
        self.is_complete = False
        self.messages = []
        self.extracted_attire = None

recon_session = ReconSessionState()

# Reference to dashboard broadcast hook
dashboard_broadcast_hook = None

def set_dashboard_broadcast_hook(hook):
    global dashboard_broadcast_hook
    dashboard_broadcast_hook = hook

class ReconSendMessageRequest(BaseModel):
    message: str
    sender: str = "KIN"  # "KIN" (Sister) or "OPERATOR" (Constable Morake)

class TrafficControlPromptRequest(BaseModel):
    operator_query: Optional[str] = None
    operator_name: str = "Constable Morake"

@router.get("/traffic-control/audit")
async def get_traffic_control_audit(operator_name: str = "Constable Morake", db: AsyncSession = Depends(get_db)):
    """
    Returns real-time payload audit and Traffic Control Agent briefing for the operator.
    Only evaluates emergency/stagnation if a journey is actively running.
    """
    now = datetime.now(timezone.utc)
    now_str = now.strftime("%H:%M:%S")

    # Fetch currently ACTIVE or RED journey only (not ended)
    j_res = await db.execute(
        select(Journey)
        .where(Journey.status.in_(["GREEN", "AMBER", "RED"]))
        .where(Journey.ended_at.is_(None))
        .order_by(Journey.started_at.desc())
        .limit(1)
    )
    journey = j_res.scalar_one_or_none()

    b_res = await db.execute(select(BoloProfile).limit(1))
    bolo = b_res.scalar_one_or_none()

    if not journey:
        # Check for recently ended journey
        last_j_res = await db.execute(
            select(Journey)
            .order_by(Journey.started_at.desc())
            .limit(1)
        )
        last_journey = last_j_res.scalar_one_or_none()
        citizen_name = getattr(bolo, "full_name", "Thandiwe Ndlovu") if bolo else "Thandiwe Ndlovu"
        is_safe_completed = bool(last_journey and last_journey.status == "SAFE_COMPLETED")
        dest_name = getattr(last_journey, "destination_name", "Sandton City Mall, Sandton") if last_journey else "destination"

        if is_safe_completed:
            return {
                "status": "SAFE_COMPLETED",
                "has_active_journey": False,
                "journey_status": "SAFE_COMPLETED",
                "threat_level": "NOMINAL",
                "citizen_name": citizen_name,
                "destination_name": dest_name,
                "audit": None,
                "liaison": {
                    "briefing": f"{operator_name}, {citizen_name} has arrived safely at {dest_name} and entered verified safe disarm PIN. Safe arrival protocol confirmed. All tactical reaction units are standing down to baseline patrols.",
                    "threat_level": "NOMINAL",
                    "stagnation_assessment": "Safe arrival completed. 0 active beacons.",
                    "appearance_assessment": "Safe stand-down.",
                    "recommended_action": "STANDBY",
                    "action_chips": [
                        {
                            "action_id": "SECTOR_SWEEP",
                            "label": "🔄 Sector Routine Patrol",
                            "rationale": "Maintain routine cruising circuits across Sector 2 corridor.",
                            "primary": True
                        },
                        {
                            "action_id": "STATION_CHECK",
                            "label": "🛡️ Station Readiness Diagnostic",
                            "rationale": "Verify communication links with SAPS-302 and Fox-14.",
                            "primary": False
                        }
                    ]
                },
                "observation_log": [
                    {
                        "id": f"obs-{int(time.time())}-1",
                        "timestamp": now_str,
                        "tag": "SAFE_ARRIVAL",
                        "text": f"✅ Journey #{last_journey.journey_id[:8]} disarmed with verified safe PIN. {citizen_name} arrived safely."
                    },
                    {
                        "id": f"obs-{int(time.time())}-2",
                        "timestamp": now_str,
                        "tag": "STANDBY",
                        "text": "Sector 2 corridor radar sweep: 0 active citizen beacons. Watchdog returned to baseline standby."
                    }
                ],
                "recon_session_active": False,
                "recon_completed": False,
                "extracted_attire": None
            }
        else:
            return {
                "status": "STANDBY",
                "has_active_journey": False,
                "journey_status": "IDLE",
                "threat_level": "NOMINAL",
                "citizen_name": citizen_name,
                "destination_name": dest_name,
                "audit": None,
                "liaison": {
                    "briefing": f"{operator_name}, BOLO Young on watch. Sector 2 corridor is clear. No active citizen journeys monitored.",
                    "threat_level": "NOMINAL",
                    "stagnation_assessment": "Standby: 0 active beacons.",
                    "appearance_assessment": "Standby.",
                    "recommended_action": "STANDBY",
                    "action_chips": [
                        {
                            "action_id": "SECTOR_SWEEP",
                            "label": "🔄 Sector Routine Patrol",
                            "rationale": "Maintain routine cruising circuits across Sector 2 corridor.",
                            "primary": True
                        }
                    ]
                },
                "observation_log": [
                    {
                        "id": "obs-standby-1",
                        "timestamp": now_str,
                        "tag": "STANDBY",
                        "text": "Sector 2 corridor radar sweep: 0 active citizen beacons detected. CARTO mesh nominal."
                    },
                    {
                        "id": "obs-standby-2",
                        "timestamp": now_str,
                        "tag": "LISTENING",
                        "text": "Autonomous watchdog active. Awaiting journey start signals from citizen mobile clients."
                    }
                ],
                "recon_session_active": False,
                "recon_completed": False,
                "extracted_attire": None
            }

    # An active journey exists
    p_res = await db.execute(
        select(TelemetryPing)
        .where(TelemetryPing.journey_id == journey.journey_id)
        .order_by(TelemetryPing.recorded_at.asc())
    )
    pings = p_res.scalars().all() if p_res else []

    audit_report = traffic_control_agent.audit_payload(journey, bolo, pings)
    citizen_name = getattr(bolo, "full_name", "Thandiwe Ndlovu") if bolo else "Thandiwe Ndlovu"

    if journey.status in ["GREEN", "AMBER"]:
        # Safe in transit
        liaison = {
            "briefing": f"{citizen_name} is in transit to {journey.destination_name}. Telemetry is normal and safe.",
            "threat_level": "NOMINAL",
            "stagnation_assessment": "Nominal motion along corridor.",
            "appearance_assessment": audit_report["appearance_audit"]["attire_summary"],
            "recommended_action": "MONITOR",
            "action_chips": []
        }
        observation_log = [
            {
                "id": f"obs-{int(time.time())}-1",
                "timestamp": now_str,
                "tag": "BEACON_LOCKED",
                "text": f"Active beacon ID #{journey.journey_id[:8]} locked for {citizen_name}. Status: {journey.status} (Safe transit)."
            },
            {
                "id": f"obs-{int(time.time())}-2",
                "timestamp": now_str,
                "tag": "TELEMETRY",
                "text": f"Telemetry frequency: 1Hz WSS. Current speed: {audit_report['location_audit']['current_speed_kmh']} km/h along corridor. No geofence breach."
            }
        ]
    else:
        # RED Alert crisis
        liaison = await traffic_control_agent.liaise_with_operator(audit_report, operator_name=operator_name)
        observation_log = [
            {
                "id": f"obs-{int(time.time())}-1",
                "timestamp": now_str,
                "tag": "RED_ALERT",
                "text": f"Code Red flag active on beacon #{journey.journey_id[:8]}. Stagnation check: {audit_report['location_audit']['stagnation_summary']}"
            },
            {
                "id": f"obs-{int(time.time())}-2",
                "timestamp": now_str,
                "tag": "DEFICIT_AUDIT",
                "text": f"Appearance deficit audit: {audit_report['appearance_audit']['attire_summary']}. Recommended operator vector: {liaison.get('recommended_action', 'INTERCEPT_CONVERGE')}."
            }
        ]

    return {
        "status": "ACTIVE",
        "has_active_journey": True,
        "journey_status": journey.status,
        "audit": audit_report,
        "liaison": liaison,
        "observation_log": observation_log,
        "recon_session_active": recon_session.is_active,
        "recon_completed": recon_session.is_complete,
        "extracted_attire": recon_session.extracted_attire
    }

@router.post("/traffic-control/liaise")
async def prompt_traffic_control(req: TrafficControlPromptRequest, db: AsyncSession = Depends(get_db)):
    """
    Allows Constable Morake to ask questions or send direct instructions to the Traffic Control Agent.
    """
    j_res = await db.execute(
        select(Journey)
        .where(Journey.status.in_(["GREEN", "AMBER", "RED"]))
        .where(Journey.ended_at.is_(None))
        .order_by(Journey.started_at.desc())
        .limit(1)
    )
    journey = j_res.scalar_one_or_none()
    b_res = await db.execute(select(BoloProfile).limit(1))
    bolo = b_res.scalar_one_or_none()

    if not journey:
        last_j_res = await db.execute(
            select(Journey)
            .order_by(Journey.started_at.desc())
            .limit(1)
        )
        last_journey = last_j_res.scalar_one_or_none()
        citizen_name = getattr(bolo, "full_name", "Thandiwe Ndlovu") if bolo else "Thandiwe Ndlovu"
        dest_name = getattr(last_journey, "destination_name", "her destination") if last_journey else "destination"
        is_safe_arrival = bool(last_journey and last_journey.status == "SAFE_COMPLETED")

        user_prompt = f"""OPERATIONAL CONTEXT:
- Human Operator: {req.operator_name}
- Citizen Name: {citizen_name}
- Current State: {'SAFE ARRIVAL COMPLETED (Citizen ' + citizen_name + ' arrived safely at ' + dest_name + ' and disarmed with verified safe PIN. Journey is concluded)' if is_safe_arrival else 'STANDBY (No active citizen journeys)'}
- Sector 2 Corridor Status: QUIET AND SECURE. Zero active distress beacons. All reaction units (Fox-14, SAPS-302) stood down to routine cruising patrols.
- Operator Query / Directive: {req.operator_query}

CRITICAL OPERATIONAL & SECURITY RULES:
1. The citizen journey is OVER. {citizen_name} has already arrived safely at {dest_name} and entered their verified safe disarm PIN.
2. ZERO-KNOWLEDGE CREDENTIAL PRIVACY: Under NO circumstances should you ever disclose, quote, or display the citizen's actual PIN digits (e.g. '1234', '9999'). Refer strictly to 'verified safe disarm PIN' or 'safe disarm code'. Never leak raw authentication credentials to the police or dispatch log.
3. Under NO circumstances should you state that the citizen is still on an active journey, in transit, stationary at coordinates, or that you are maintaining a lock on active telemetry.
4. If the operator mentions passive monitoring, taking an action, or asks about the citizen: explicitly confirm that {citizen_name} has arrived safely, the journey is concluded, and that passive monitoring on this citizen is no longer active because the destination has been reached.
5. Provide constructive next steps for general station standby (e.g. routine patrol sweeps, station readiness checks, radar diagnostics).
6. Never repeat old action chips from an active journey (e.g. do NOT output 'Maintain Passive Monitor' or 'Broadcast to CAD').
7. Output valid RFC-8259 JSON with keys:
   - briefing: Clear tactical response acknowledging safe arrival and current standby status (WITHOUT disclosing PIN digits)
   - threat_level: "NOMINAL"
   - stagnation_assessment: "Standby: Citizen arrived safely."
   - appearance_assessment: "Stand-down nominal."
   - recommended_action: "STANDBY"
   - action_chips: Array of 2 to 3 fresh standby action chips (e.g. "🔄 Sector Routine Patrol", "🛡️ Station Readiness Check")
"""

        try:
            from app.way_swarm.llm import llm_client
            from app.way_swarm.traffic_control_agent import TRAFFIC_CONTROL_SYSTEM_PROMPT
            res = await llm_client.generate_structured(
                system_prompt=TRAFFIC_CONTROL_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                model=settings.MODEL_TELEMETRY
            )
            if isinstance(res, dict) and "briefing" in res:
                return res
        except Exception as e:
            logger.warning(f"Standby LLM fallback: {e}")

        standby_briefing = (
            f"{req.operator_name}, citizen {citizen_name} has already arrived safely at {dest_name} and entered verified safe disarm PIN. Journey is concluded. Sector 2 corridor is secure with zero active distress beacons."
            if is_safe_arrival
            else f"{req.operator_name}, BOLO Young standing by. Sector 2 corridor is quiet with zero active distress beacons. All reaction units are cruising and available for dispatch."
        )

        return {
            "briefing": standby_briefing,
            "threat_level": "NOMINAL",
            "stagnation_assessment": "Standby: 0 active beacons.",
            "appearance_assessment": "Stand-down nominal.",
            "recommended_action": "STANDBY",
            "action_chips": [
                {
                    "action_id": "SECTOR_SWEEP",
                    "label": "🔄 Sector Routine Patrol",
                    "rationale": "Maintain routine cruising circuits across Sector 2 corridor.",
                    "primary": True,
                },
                {
                    "action_id": "STATION_CHECK",
                    "label": "🛡️ Station Readiness Diagnostic",
                    "rationale": "Verify communication links with SAPS-302 and Fox-14.",
                    "primary": False,
                },
            ]
        }

    p_res = await db.execute(
        select(TelemetryPing)
        .where(TelemetryPing.journey_id == journey.journey_id)
        .order_by(TelemetryPing.recorded_at.asc())
    ) if journey else None
    pings = p_res.scalars().all() if p_res else []

    audit_report = traffic_control_agent.audit_payload(journey, bolo, pings)
    liaison = await traffic_control_agent.liaise_with_operator(
        audit_report,
        operator_name=req.operator_name,
        operator_query=req.operator_query
    )
    return liaison

@router.post("/recon/start")
async def start_recon_session(db: AsyncSession = Depends(get_db)):
    """
    Launches the Next-of-Kin WhatsApp Reconnaissance thread.
    Initiates with high-urgency message to Sister Zanele.
    """
    recon_session.reset()
    recon_session.is_active = True
    
    opening_msg = (
        "🚨 URGENT WAYPOINT ALERT: Thandiwe has triggered an emergency distress signal near Alberton. "
        "What was she wearing when leaving today, and was she with anyone?"
    )
    recon_session.messages.append({
        "sender": "AGENT",
        "sender_name": "Waypoint AI Recon",
        "text": opening_msg,
        "timestamp": "Just now"
    })

    if dashboard_broadcast_hook:
        await dashboard_broadcast_hook({
            "type": "RECON_THREAD_STARTED",
            "contact": recon_session.recipient_name,
            "phone": recon_session.recipient_phone,
            "opening_message": opening_msg
        })

    return {
        "status": "STARTED",
        "recipient": recon_session.recipient_name,
        "phone": recon_session.recipient_phone,
        "messages": recon_session.messages,
        "is_complete": False
    }

@router.get("/recon/session")
async def get_recon_session():
    """Returns current state of the Next-of-Kin WhatsApp session."""
    return {
        "is_active": recon_session.is_active,
        "is_complete": recon_session.is_complete,
        "recipient_name": recon_session.recipient_name,
        "recipient_phone": recon_session.recipient_phone,
        "messages": recon_session.messages,
        "extracted_attire": recon_session.extracted_attire
    }

@router.post("/recon/chat")
async def send_recon_message(req: ReconSendMessageRequest, db: AsyncSession = Depends(get_db)):
    """
    Appends a message to the live WhatsApp thread and invokes Gemini 2.5 Flash to converse & extract attire.
    """
    if not recon_session.is_active:
        await start_recon_session(db)

    # 1. Record incoming user/kin message
    user_text = req.message.strip()
    recon_session.messages.append({
        "sender": req.sender,
        "sender_name": "Zanele (Sister)" if req.sender == "KIN" else "Constable Morake (Operator)",
        "text": user_text,
        "timestamp": "Just now"
    })

    # 2. Formulate prompt for Gemini
    history_str = "\n".join([f"{m['sender_name']}: {m['text']}" for m in recon_session.messages])
    
    agent_prompt = f"""You are Waypoint Secure's Emergency Next-of-Kin Reconnaissance Agent.
You are chatting on WhatsApp with Zanele Ndlovu (Sister of Thandiwe Ndlovu, who triggered a Code Red distress signal).
Your primary mission: Obtain visual clothing description (upper body, lower body, footwear, colors, hair, accessories) to guide responding tactical units (Fox-14 and SAPS).

CONVERSATION HISTORY:
{history_str}

CRITICAL RULES:
1. If Zanele has NOT provided any specific clothing items yet, or says "I am not sure", "I don't know", or asks a question:
   - "is_attire_identified": false
   - "extracted_attire": null
   - "upper_body": null
   - "lower_body": null
   - "footwear": null
   - "confidence_score": 0.0
   - "agent_reply": Natural, empathetic, urgent reply asking gently for whatever details she remembers (e.g. jacket color, shoes, workout clothes, what time she saw her). DO NOT thank her for clothing descriptions she did not give!

2. ONLY if Zanele has explicitly described what Thandiwe is wearing (e.g. jacket, pants, tights, shirt, shoes, colors):
   - "is_attire_identified": true
   - "extracted_attire": Concise summary of confirmed items and colors
   - "upper_body": Upper body item/color if mentioned, else null
   - "lower_body": Lower body item/color if mentioned, else null
   - "footwear": Footwear if mentioned, else null
   - "confidence_score": Float between 0.85 and 0.99
   - "agent_reply": Urgent, grateful confirmation that responding units (Fox-14 and SAPS Flying Squad) now have this visual BOLO description and are converging on her location.

Output valid JSON matching these fields exactly."""

    gemini_res = None
    try:
        gemini_res = await llm_client.generate_structured(
            system_prompt="You are an expert law-enforcement emergency reconnaissance agent. Output strict JSON only.",
            user_prompt=agent_prompt,
            model=settings.MODEL_NOK_RECON
        )
    except Exception as e:
        logger.warning(f"Recon LLM generation error: {e}")

    if isinstance(gemini_res, dict) and "agent_reply" in gemini_res:
        reply_text = gemini_res["agent_reply"]
        is_identified = bool(gemini_res.get("is_attire_identified", False))
        attire_summary = gemini_res.get("extracted_attire")
    else:
        # Honest fallback without faking attire
        reply_text = "I understand this is frightening, Zanele. Responders are tracking her signal right now. Do you remember what jacket, shirt, or shoes she was wearing today? Any detail helps."
        is_identified = False
        attire_summary = None

    # Append agent reply
    recon_session.messages.append({
        "sender": "AGENT",
        "sender_name": "Waypoint AI Recon",
        "text": reply_text,
        "timestamp": "Just now"
    })

    # If attire is identified by Gemini, complete session and update BOLO
    if is_identified and attire_summary:
        recon_session.is_complete = True
        recon_session.extracted_attire = {
            "summary": attire_summary,
            "upper_body": gemini_res.get("upper_body") if isinstance(gemini_res, dict) else None,
            "lower_body": gemini_res.get("lower_body") if isinstance(gemini_res, dict) else None,
            "footwear": gemini_res.get("footwear") if isinstance(gemini_res, dict) else None,
            "confidence_score": gemini_res.get("confidence_score", 0.95) if isinstance(gemini_res, dict) else 0.95
        }

        # Update Incident in Database
        try:
            inc_res = await db.execute(select(Incident).order_by(Incident.triggered_at.desc()).limit(1))
            incident = inc_res.scalar_one_or_none()
            if incident:
                current_bolo = dict(incident.synthesized_bolo_json or {})
                current_bolo["synthesized_attire"] = attire_summary
                current_bolo["recon_confidence"] = recon_session.extracted_attire["confidence_score"]
                incident.synthesized_bolo_json = current_bolo
                await db.commit()
        except Exception as e:
            logger.warning(f"Failed to update Incident with attire: {e}")

        # Broadcast to all connected command terminals
        if dashboard_broadcast_hook:
            await dashboard_broadcast_hook({
                "type": "RECON_INTEL_ACQUIRED",
                "attire": attire_summary,
                "confidence": recon_session.extracted_attire["confidence_score"],
                "transcript": recon_session.messages,
                "message": f"🎯 Intel Confirmed: Victim identified wearing {attire_summary}."
            })

    return {
        "status": "SUCCESS",
        "agent_reply": reply_text,
        "is_complete": recon_session.is_complete,
        "extracted_attire": recon_session.extracted_attire,
        "messages": recon_session.messages
    }
