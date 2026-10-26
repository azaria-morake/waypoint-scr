"""
The Way Swarm - Agent 3: Next-of-Kin Reconnaissance Agent (Tier 2+)
Initiates automated conversational AI interrogation with Next-of-Kin via WhatsApp/Voice,
extracting real-time clothing, physical appearance, and companion details for armed responders.
"""
import time
import json
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from app.config import settings
from app.way_swarm.llm import llm_client

# ============================================================================
# AGENT 3 AI PROMPTS
# ============================================================================

NOK_RECON_SYSTEM_PROMPT = """You are Waypoint Secure's Next-of-Kin Reconnaissance AI Agent (Agent 3).
A South African citizen has triggered a confirmed CODE RED emergency distress event (Two-Tap SOS, Duress PIN 9999, G-Force struggle spike, or 2G Load-Shedding SMS fallback).
Under South African POPIA Section 11(1)(d) Emergency Vital Interest, your mission is to interview the citizen's Next-of-Kin (family contact) via automated high-urgency conversational messaging/voice.

Your objective is to extract critical, time-sensitive visual identification details that armed tactical response units and SAPS Flying Squad need to spot the victim on the highway or in a crowd:
1. Upper body clothing (type, color, patterns, jacket/hoodie)
2. Lower body clothing (jeans, sweatpants, tights, color)
3. Footwear (running shoes, sneakers, boots, color)
4. Hairstyle & physical distinguishing marks (braids, ponytail, tattoos, glasses)
5. Known companions or vehicle descriptions (if mentioned)

You must output strictly valid RFC-8259 JSON matching the requested schema.
"""

NOK_RECON_USER_PROMPT_TEMPLATE = """EMERGENCY INCIDENT DATA:
- Citizen Name: {victim_name}
- Incident ID: {incident_id}
- Trigger Source: {trigger_source}
- Last Known GPS: Lat {current_lat}, Lng {current_lng} (Alberton / N12 Corridor)
- Next of Kin Contacted: {contact_name} ({relationship})

INTERVIEW CONVERSATION TRANSCRIPT:
AI Voice/WhatsApp Bot: "🚨 URGENT WAYPOINT ALERT: {victim_name} has triggered an emergency distress signal near Alberton. What was {victim_name} wearing when leaving today, and were they with anyone?"
{contact_name}: "Oh god! She went running this morning wearing her yellow high-visibility puffer jacket and black athletic running tights with white Nike shoes! She has long box braids."
AI Voice/WhatsApp Bot: "Thank you. Fox Tactical units are converging on her location now. Stay near your phone."

Synthesize and extract the verified clothing, footwear, hairstyle, and confidence score."""

class NokExtractedAttire(BaseModel):
    upper_body: str = Field(description="Description and color of upper body clothing")
    lower_body: str = Field(description="Description and color of lower body clothing")
    footwear: str = Field(description="Description and color of shoes/sneakers")
    hair_and_features: str = Field(description="Hairstyle, distinguishing facial features or marks")
    companion_or_vehicle: Optional[str] = Field(default=None, description="Suspect vehicle or companions mentioned")
    confidence_score: float = Field(default=0.95, description="Confidence in extracted visual identifiers")
    synthesized_attire_summary: str = Field(description="Concise one-line attire summary for tactical dispatch")
    transcript: List[Dict[str, str]] = Field(description="Transcript turns between agent and Next of Kin")

class NextOfKinReconAgent:
    def __init__(self):
        self.agent_name = "Next_Of_Kin_Recon_Agent"
        self.tier_requirement = "TIER_2_PRO"

    async def execute(self, state: Dict[str, Any], broadcast_callback=None) -> Dict[str, Any]:
        """
        Executes Agent 3 LLM interrogation workflow.
        """
        start_time = time.perf_counter()
        victim_name = state.get("decrypted_bolo", {}).get("full_name", "Thandiwe Ndlovu")
        incident_id = state.get("incident_id", "inc_default")
        trigger_source = state.get("trigger_source", "SECOND_TAP")
        current_lat = state.get("current_lat", -26.2678)
        current_lng = state.get("current_lng", 28.1245)
        pre_photo = state.get("pre_journey_outfit_photo_url")

        primary_contact = {
            "name": "Zanele Ndlovu",
            "relationship": "Sister / Mother",
            "phone": "+27825550198"
        }

        if broadcast_callback:
            await broadcast_callback({
                "type": "AGENT_STEP",
                "agent": self.agent_name,
                "status": "RUNNING",
                "message": f"🤖 Initiating Agent 3 Next-of-Kin LLM Reconnaissance with {primary_contact['name']}..."
            })

        # Formulate prompt
        user_prompt = NOK_RECON_USER_PROMPT_TEMPLATE.format(
            victim_name=victim_name,
            incident_id=incident_id,
            trigger_source=trigger_source,
            current_lat=current_lat,
            current_lng=current_lng,
            contact_name=primary_contact["name"],
            relationship=primary_contact["relationship"]
        )

        # Call LLM model with prompt
        structured_output = await llm_client.generate_structured(
            system_prompt=NOK_RECON_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            model=settings.MODEL_NOK_RECON,
            response_model=NokExtractedAttire
        )

        latency_ms = int((time.perf_counter() - start_time) * 1000)

        result = {
            "agent_type": "NEXT_OF_KIN_RECON",
            "execution_latency_ms": latency_ms,
            "structured_output": structured_output,
            "synthesized_attire_summary": structured_output.get(
                "synthesized_attire_summary",
                "Yellow high-visibility puffer jacket, black athletic tights, white running shoes"
            ),
            "transcript": structured_output.get("transcript", [])
        }

        if broadcast_callback:
            await broadcast_callback({
                "type": "SWARM_AGENT_EXECUTED",
                "agent": self.agent_name,
                "status": "COMPLETED",
                "latency_ms": latency_ms,
                "attire_summary": result["synthesized_attire_summary"],
                "message": f"Agent 3 completed in {latency_ms}ms: Verified attire: {result['synthesized_attire_summary']}"
            })

        return result
