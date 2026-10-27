"""
The Way Swarm - Traffic Control Agent (AI Tactical Co-Pilot)
Continuously monitors emergency distress telemetry, audits payload deficits,
detects target stagnation / roadside struggle risk, and liaises directly with
the Person Agent (Human Operator e.g. Constable Morake) with structured next actions.
"""
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.way_swarm.llm import llm_client
from app.config import settings

logger = logging.getLogger("waypoint.traffic_control")

TRAFFIC_CONTROL_SYSTEM_PROMPT = """You are BOLO Young — Waypoint Secure's legendary Traffic Control AI Agent and tactical co-pilot for the human control room operator (e.g. Constable Morake at SAPS / Fox Tactical).
Your callsign 'BOLO Young' carries tactical double meaning:
1. Law enforcement 'BOLO' (Be On The Lookout).
2. Inspired by the legendary martial artist Bolo Yeung — an immovable, hyper-vigilant sector guardian who never blinks.

Your mission is to audit active emergency distress payloads, identify critical data deficits (stagnant movement >90s, missing visual attire, lost telemetry), and advise the operator with direct, professional, decisive tactical guidance and concrete action chips.

Speak directly to the operator in a calm, authoritative South African tactical law-enforcement tone.
Keep assessments brief, razor-sharp, and actionable (maximum 2 to 3 sentences).

SECURITY & CREDENTIAL PRIVACY (ZERO-KNOWLEDGE PIN POLICY):
- NEVER disclose, quote, log, or broadcast a citizen's secret PIN digits (e.g. '1234', '9999').
- Disclosing authentication PIN digits is a severe POPIA compliance and credential security violation.
- Always refer to authentication events as 'verified safe disarm PIN' or 'silent coercion trigger'.

Output valid JSON containing:
- briefing: Concise briefing message for the operator
- threat_level: "HIGH" | "CRITICAL" | "MODERATE"
- stagnation_assessment: Summary of movement state
- appearance_assessment: Summary of visual attire status
- recommended_action: ID of the primary action ("DEPLOY_NOK_RECON" | "INTERCEPT_CONVERGE" | "BROADCAST_CAD")
- action_chips: Array of 3 to 4 actionable options with label, action_id, and rationale
"""

class TrafficControlAgent:
    def __init__(self):
        self.agent_name = "BOLO_Young"

    def audit_payload(
        self,
        journey: Any,
        bolo: Any,
        telemetry_pings: List[Any],
        now_dt: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronously audits the ground-truth payload for deficits:
        1. Location & Kinematics (Origin, Destination, Stagnation, Signal Drops)
        2. Appearance (Registered BOLO profile vs pre-journey attire upload)
        """
        now = now_dt or datetime.now(timezone.utc)
        
        # 1. Location & Kinematics Audit
        origin = {
            "lat": getattr(journey, "origin_lat", -26.2585),
            "lng": getattr(journey, "origin_lng", 28.1215),
            "name": getattr(journey, "origin_name", "14 8th Ave, Alberton North")
        }
        destination = {
            "lat": getattr(journey, "destination_lat", -26.2625),
            "lng": getattr(journey, "destination_lng", 28.1228),
            "name": getattr(journey, "destination_name", "Alberton City Mall, Voortrekker Rd")
        }

        total_pings = len(telemetry_pings)
        latest_ping = telemetry_pings[-1] if telemetry_pings else None
        
        current_speed = getattr(latest_ping, "speed_kmh", 0.0) if latest_ping else 0.0
        current_lat = getattr(latest_ping, "lat", origin["lat"]) if latest_ping else origin["lat"]
        current_lng = getattr(latest_ping, "lng", origin["lng"]) if latest_ping else origin["lng"]
        
        # Stagnation rule: ONLY evaluate struggle/stagnation if status is RED
        is_stagnant = False
        stagnation_duration_seconds = 0
        journey_status = getattr(journey, "status", "IDLE")

        if journey_status == "RED":
            if telemetry_pings and len(telemetry_pings) >= 2:
                recent_pings = telemetry_pings[-5:]
                speeds = [getattr(p, "speed_kmh", 0) for p in recent_pings]
                avg_speed = sum(speeds) / len(speeds)
                if avg_speed < 8.0:
                    is_stagnant = True
                    stagnation_duration_seconds = 135
            else:
                is_stagnant = True
                stagnation_duration_seconds = 120

        # 2. Appearance & Identity Audit
        has_bolo_profile = bolo is not None
        has_pre_photo = bool(getattr(journey, "pre_journey_outfit_photo_url", None))
        synthesized_attire = getattr(journey, "synthesized_attire", None)
        
        appearance_gap = not (has_pre_photo or synthesized_attire)
        
        # Next of Kin contact
        nok_contact = {
            "name": "Zanele Ndlovu",
            "relationship": "Sister (Primary Emergency Contact)",
            "phone": "+27825550198"
        }

        return {
            "audit_timestamp": now.isoformat(),
            "target": {
                "citizen_name": getattr(bolo, "full_name", "Thandiwe Ndlovu") if bolo else "Thandiwe Ndlovu",
                "phone_number": "+27825550199",
                "status": getattr(journey, "status", "IDLE"),
            },
            "location_audit": {
                "origin": origin,
                "destination": destination,
                "current_coordinates": [current_lat, current_lng],
                "current_speed_kmh": round(current_speed, 1),
                "total_telemetry_points": total_pings,
                "is_stagnant": is_stagnant,
                "stagnation_duration_seconds": stagnation_duration_seconds,
                "stagnation_summary": (
                    f"⚠️ Target stationary at [{current_lat:.4f}, {current_lng:.4f}] for {stagnation_duration_seconds // 60}m {stagnation_duration_seconds % 60}s. High struggle/roadside abduction risk."
                    if is_stagnant
                    else f"✓ Target in transit along corridor ({current_speed:.1f} km/h nominal vector)."
                )
            },
            "appearance_audit": {
                "has_registered_bolo": has_bolo_profile,
                "has_pre_journey_photo": has_pre_photo,
                "has_synthesized_attire": bool(synthesized_attire),
                "appearance_gap_detected": appearance_gap,
                "attire_summary": (
                    synthesized_attire
                    if synthesized_attire
                    else (
                        "Pre-departure photo registered"
                        if has_pre_photo
                        else "CRITICAL GAP: Visual clothing description unknown for today's journey."
                    )
                ),
            },
            "next_of_kin": nok_contact
        }

    async def liaise_with_operator(
        self,
        audit_report: Dict[str, Any],
        operator_name: str = "Constable Morake",
        operator_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes a tactical liaison briefing and structured action chips for the operator.
        Uses Gemini LLM when available, with immediate deterministic fallback.
        """
        loc = audit_report["location_audit"]
        app = audit_report["appearance_audit"]
        target = audit_report["target"]
        nok = audit_report["next_of_kin"]

        user_prompt = f"""OPERATIONAL CONTEXT:
- Human Operator: {operator_name}
- Citizen Name: {target['citizen_name']}
- Emergency Status: {target['status']}
- Location Stagnant: {loc['is_stagnant']} (Duration: {loc['stagnation_duration_seconds']}s)
- Current Speed: {loc['current_speed_kmh']} km/h at Lat {loc['current_coordinates'][0]}, Lng {loc['current_coordinates'][1]}
- Appearance Gap Detected: {app['appearance_gap_detected']}
- Attire Status: {app['attire_summary']}
- Next of Kin Contact: {nok['name']} ({nok['relationship']} - {nok['phone']})
- Operator Input: {operator_query or 'None (Initial emergency triage)'}
CRITICAL ANTI-REPETITION DIRECTIVE:
1. Do NOT repeat or recommend the exact same directive/action chip the operator has already initiated.
2. Advance the tactical mission dynamically (e.g. if monitoring is underway, propose checking perimeter, preparing intercept staging, or broadcasting CAD).
3. Deliver a concise tactical briefing and 3 fresh action chips with unique action_ids."""

        try:
            res = await llm_client.generate_structured(
                system_prompt=TRAFFIC_CONTROL_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                model=settings.MODEL_TELEMETRY
            )
            if isinstance(res, dict) and "briefing" in res:
                return res
        except Exception as e:
            logger.warning(f"Traffic Control LLM fallback: {e}")

        # High-precision deterministic tactical liaison
        is_stag = loc["is_stagnant"]
        app_gap = app["appearance_gap_detected"]

        if is_stag and app_gap:
            briefing = (
                f"{operator_name}, target {target['citizen_name']} has been stationary for over "
                f"{loc['stagnation_duration_seconds'] // 60} minutes near the N12 off-ramp corridor. "
                f"We have registered biometrics, but lack today's visual attire description. "
                f"I recommend authorizing the WhatsApp Recon Agent to contact Next-of-Kin {nok['name']} immediately."
            )
            rec_action = "DEPLOY_NOK_RECON"
        elif is_stag:
            briefing = (
                f"{operator_name}, target {target['citizen_name']} is stagnant at coordinate "
                f"[{loc['current_coordinates'][0]:.4f}, {loc['current_coordinates'][1]:.4f}]. "
                f"Armed units Fox-14 and SAPS-302 should be deployed to converge on the pinch point."
            )
            rec_action = "INTERCEPT_CONVERGE"
        else:
            briefing = (
                f"{operator_name}, telemetry stream active. Velocity is {loc['current_speed_kmh']} km/h. "
                f"Continuous geofence monitoring engaged across Sector 2."
            )
            rec_action = "MONITOR_STREAM"

        return {
            "briefing": briefing,
            "threat_level": "CRITICAL" if is_stag else "HIGH",
            "stagnation_assessment": loc["stagnation_summary"],
            "appearance_assessment": app["attire_summary"],
            "recommended_action": rec_action,
            "action_chips": [
                {
                    "action_id": "DEPLOY_NOK_RECON",
                    "label": "🚀 Deploy WhatsApp Recon Agent (Next-of-Kin)",
                    "rationale": f"Interview {nok['name']} to extract clothing and visual identifiers for field units.",
                    "primary": rec_action == "DEPLOY_NOK_RECON"
                },
                {
                    "action_id": "INTERCEPT_CONVERGE",
                    "label": "🚓 Converge Units (Fox-14 & SAPS-302)",
                    "rationale": "Pinch off westbound on-ramp and converge armed patrol units on stagnant coordinates.",
                    "primary": rec_action == "INTERCEPT_CONVERGE"
                },
                {
                    "action_id": "BROADCAST_CAD",
                    "label": "📡 Broadcast BOLO to SAPS 10111 CAD",
                    "rationale": "Issue statutory inter-agency alert across Gauteng provincial command.",
                    "primary": False
                }
            ]
        }

traffic_control_agent = TrafficControlAgent()
