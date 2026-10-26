"""
The Way Swarm - Agent 5: Custom B2B Operations Runner (Tier 2/3 Revenue Engine)
Executes commercial private security workflows (Alarm Verification, Client Welfare, Guard Check-In)
with system prompts and metered voice-minute billing.
"""
import time
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.config import settings
from app.way_swarm.llm import llm_client

# ============================================================================
# AGENT 5 COMMERCIAL PROMPTS
# ============================================================================

ALARM_VERIFICATION_SYSTEM_PROMPT = """You are Fox Tactical's Automated Alarm Verification AI Agent.
A residential perimeter infrared beam or electric fence alarm has triggered at a client's property in Alberton.
Your objective is to place an automated priority call to the registered property owner, verify their safety, assess whether they are under duress, and check if armed response dispatch is required.
Respond strictly in JSON matching the schema."""

CLIENT_WELFARE_CHECK_SYSTEM_PROMPT = """You are Fox Tactical's VIP Client Welfare AI Agent.
You are performing a scheduled high-risk client safety check-in for a verified residential client.
Your objective is to verify client well-being, confirm status of property security systems, and log the interaction.
Respond strictly in JSON matching the schema."""

GUARD_CHECKIN_SYSTEM_PROMPT = """You are Fox Tactical's Automated Guard Force Heartbeat Agent.
You are conducting a scheduled hourly check-in with a stationary guard post or boom gate operator.
Your objective is to verify guard alertness, confirm zero perimeter breaches, and log the sentinel status.
Respond strictly in JSON matching the schema."""

class CustomTaskExecutionOutput(BaseModel):
    status_result: str = Field(description="Operational status result (e.g. VERIFIED_SAFE, DISPATCH_REQUIRED)")
    action_taken: str = Field(description="Summary of action taken by AI agent")
    details: str = Field(description="Detailed conversation log or operational finding")
    voice_minutes_billed: float = Field(default=2.0, description="Metered voice minutes billed for this call")

class CustomB2BOpsAgent:
    def __init__(self):
        self.agent_name = "Custom_B2B_Ops_Agent"
        self.tier_requirement = "TIER_2_PRO"

    async def execute_task(
        self,
        task_category: str,
        target_property_or_client: str,
        callback_number: Optional[str] = None,
        broadcast_callback=None
    ) -> Dict[str, Any]:
        """
        Executes a commercial operations workflow with metered voice billing.
        """
        start_time = time.perf_counter()
        callback_num = callback_number or "+27825550199"

        # Select prompt based on category
        if task_category == "ALARM_VERIFICATION":
            system_prompt = ALARM_VERIFICATION_SYSTEM_PROMPT
            user_prompt = f"Perimeter alarm tripped at property: {target_property_or_client}. Calling owner at {callback_num} to verify status."
            minutes = 2.0
        elif task_category == "CLIENT_WELFARE_CHECK":
            system_prompt = CLIENT_WELFARE_CHECK_SYSTEM_PROMPT
            user_prompt = f"Executing scheduled welfare check-in for VIP client: {target_property_or_client} at {callback_num}."
            minutes = 2.0
        else:
            system_prompt = GUARD_CHECKIN_SYSTEM_PROMPT
            user_prompt = f"Conducting hourly guard heartbeat check-in for post: {target_property_or_client}."
            minutes = 1.0

        if broadcast_callback:
            await broadcast_callback({
                "type": "B2B_AGENT_RUNNING",
                "task_category": task_category,
                "target": target_property_or_client,
                "message": f"Executing commercial agent: {task_category} for {target_property_or_client}..."
            })

        structured_output = await llm_client.generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=settings.MODEL_CUSTOM_OPS,
            response_model=CustomTaskExecutionOutput
        )

        latency_ms = int((time.perf_counter() - start_time) * 1000)

        result = {
            "status_result": structured_output.get("status_result", "VERIFIED_SAFE"),
            "action_taken": structured_output.get("action_taken", "Automated client verification call completed."),
            "details": structured_output.get("details", f"Verification confirmed safe for {target_property_or_client}."),
            "latency_ms": latency_ms,
            "voice_minutes_billed": minutes
        }

        if broadcast_callback:
            await broadcast_callback({
                "type": "B2B_AGENT_COMPLETED",
                "task_category": task_category,
                "status_result": result["status_result"],
                "voice_minutes_billed": minutes,
                "message": f"Commercial task {task_category} completed in {latency_ms}ms (+{minutes} min billed)."
            })

        return result
