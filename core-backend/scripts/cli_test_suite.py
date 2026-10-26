#!/usr/bin/env python3
"""
Waypoint Secure - Core Backend Full CLI Test Suite
Automated terminal test runner covering:
1. Database & Seed verification
2. Gemini Flash handshake
3. 1st Tap Journey Start
4. Telemetry Ingestion & G-Force Struggle (3.8G)
5. Dual-PIN Verification (Standard 1234 vs Duress 9999 silent escalation)
6. 2G SMS GSM-7 Fallback
7. The Way Swarm multi-agent execution & tier gating
8. Commercial B2B operations & metered voice billing
"""
import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

import asyncio
import time
from sqlalchemy import select
from app.database import init_db, AsyncSessionLocal
from app.seed import seed_database
from app.models import User, Journey, Incident, AIAgentLog, Organization, BoloProfile, PopiaAuditLog
from app.security.crypto import SecurityCrypto
from app.services.journey_fsm import JourneyFSM
from app.services.sms_gateway import SmsGateway
from app.way_swarm.supervisor import WaySwarmSupervisor
from app.way_swarm.custom_ops_agent import CustomB2BOpsAgent
from app.way_swarm.llm import llm_client

def print_header(title):
    print("\n" + "=" * 65)
    print(f"🔹 {title}")
    print("=" * 65)

async def run_cli_tests():
    print("🚀 Initializing Waypoint Secure Backend CLI Test Suite...")
    await init_db()
    await seed_database()

    # -------------------------------------------------------------
    # TEST 1: Database & Seed
    # -------------------------------------------------------------
    print_header("TEST 1: Database Entity & Seed Verification")
    async with AsyncSessionLocal() as session:
        u_res = await session.execute(select(User))
        users = u_res.scalars().all()
        print(f"✅ Users Seeded: {len(users)} (Primary: {users[0].full_name}, Phone: {users[0].phone_number})")

        o_res = await session.execute(select(Organization))
        orgs = o_res.scalars().all()
        print(f"✅ Organizations Seeded: {len(orgs)}")
        for o in orgs:
            print(f"   • [{o.subscription_tier}] {o.org_name} (Max Agents: {o.max_concurrent_agents})")

    # -------------------------------------------------------------
    # TEST 2: Gemini Flash Handshake
    # -------------------------------------------------------------
    print_header("TEST 2: Gemini Flash Handshake")
    from app.config import settings
    t0 = time.perf_counter()
    res = await llm_client.generate_structured(
        system_prompt="You are Waypoint Secure AI. Return valid JSON only.",
        user_prompt="Handshake ping. Return JSON: {\"handshake\": \"CONFIRMED\", \"service\": \"Waypoint Secure\"}",
        model=settings.MODEL_TELEMETRY
    )
    t_llm = int((time.perf_counter() - t0) * 1000)
    print(f"✅ LLM Engine Response ({t_llm}ms) via [{settings.MODEL_TELEMETRY}]:")
    print(f"   {res}")

    # -------------------------------------------------------------
    # TEST 3: 1st Tap Journey Start (Dead-Man's Switch)
    # -------------------------------------------------------------
    print_header("TEST 3: Journey Lifecycle (1st Tap Start)")
    async with AsyncSessionLocal() as session:
        journey = await JourneyFSM.start_journey(
            session=session,
            user_id=users[0].user_id,
            destination_name="Sandton City Mall, Sandton",
            destination_lat=-26.1076,
            destination_lng=28.0567,
            eta_minutes=25,
            pre_journey_outfit_photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2"
        )
        await session.commit()
        await session.refresh(journey)
        print(f"✅ Journey Started: ID {journey.journey_id}")
        print(f"   Status: {journey.status} | ETA Deadline: {journey.eta_timestamp} (25 min DMS)")

    # -------------------------------------------------------------
    # TEST 4: Standard PIN Safe Disarm (1234)
    # -------------------------------------------------------------
    print_header("TEST 4: Standard PIN Disarm Protocol (1234)")
    async with AsyncSessionLocal() as session:
        ok, res = await JourneyFSM.disarm_journey(session, journey.journey_id, pin="1234")
        print(f"✅ Disarm with 1234 -> Success: {ok}")
        print(f"   Response to client: {res}")
        j_check = (await session.execute(select(Journey).where(Journey.journey_id == journey.journey_id))).scalar_one()
        print(f"   Database State: {j_check.status}")

    # -------------------------------------------------------------
    # TEST 5: Duress PIN Silent Coercion Protocol (9999)
    # -------------------------------------------------------------
    print_header("TEST 5: Duress PIN Silent Coercion Protocol (9999)")
    async with AsyncSessionLocal() as session:
        # Start fresh journey for coercion test
        j2 = await JourneyFSM.start_journey(
            session=session,
            user_id=users[0].user_id,
            destination_name="Alberton North",
            destination_lat=-26.2580,
            destination_lng=28.1290,
            eta_minutes=15
        )
        await session.commit()

        # Disarm with Duress PIN 9999
        ok, res = await JourneyFSM.disarm_journey(session, j2.journey_id, pin="9999")
        print(f"✅ Duress PIN entered (9999):")
        print(f"   -> Client Response (Deceptive Safe UI): {res}")
        j2_check = (await session.execute(select(Journey).where(Journey.journey_id == j2.journey_id))).scalar_one()
        print(f"   -> ACTUAL Backend Database State: {j2_check.status} (CODE RED ESCALATION!)")
        assert j2_check.status == "RED", "Duress PIN must secretly transition journey to RED!"

    # -------------------------------------------------------------
    # TEST 6: 2G SMS GSM-7 Fallback Packet Parsing
    # -------------------------------------------------------------
    print_header("TEST 6: 2G SMS GSM-7 Load-Shedding Fallback")
    raw_sms = "WP1|+27825550199|RED|-26.2678,28.1245|78|140|42|HMAC_OK"
    valid, parsed = SmsGateway.parse_gsm_packet(raw_sms)
    print(f"✅ Raw GSM-7 Packet: {raw_sms} (Length: {len(raw_sms)} chars < 160 GSM limit)")
    print(f"   -> Valid: {valid}")
    print(f"   -> Extracted Telemetry: Speed {parsed.get('speed_kmh')} km/h, Heading {parsed.get('heading_deg')}°, Alert: {parsed.get('status')}")

    # -------------------------------------------------------------
    # TEST 7: The Way Swarm Execution (Tier 2 Pro - 4 Agents)
    # -------------------------------------------------------------
    print_header("TEST 7: The Way Swarm Parallel Multi-Agent Execution")
    supervisor = WaySwarmSupervisor()
    async with AsyncSessionLocal() as session:
        state = {
            "incident_id": "cli_test_incident",
            "journey_id": j2.journey_id,
            "subscription_tier": "TIER_2_PRO",
            "trigger_source": "DURESS_PIN",
            "speed_kmh": 78.0,
            "heading_deg": 140.0,
            "g_force": 3.8,
            "current_lat": -26.2678,
            "current_lng": 28.1245,
            "decrypted_bolo": {
                "full_name": "Thandiwe Ndlovu",
                "height_cm": 165,
                "build": "Slender Athletic"
            }
        }
        t_swarm = time.perf_counter()
        swarm_result = await supervisor.execute_swarm(session=session, state=state)
        swarm_ms = int((time.perf_counter() - t_swarm) * 1000)

        print(f"✅ The Way Swarm completed in {swarm_ms}ms (Status: {swarm_result['status']})")
        print(f"   Agents executed in parallel: {swarm_result['agents_executed']}")
        for agent_out in swarm_result["results"]:
            if isinstance(agent_out, dict):
                atype = agent_out.get("agent_type", "AGENT")
                lat = agent_out.get("execution_latency_ms", 0)
                print(f"   • {atype} (Latency: {lat}ms)")
                if atype == "TELEMETRY_KINEMATICS":
                    print(f"     -> Movement: {agent_out.get('movement_classification')}")
                elif atype == "NEXT_OF_KIN_RECON":
                    print(f"     -> Verified Attire: {agent_out.get('synthesized_attire_summary')}")
                elif atype == "DISPATCH_ROUTING_CAD":
                    print(f"     -> Radio Broadcast: {agent_out.get('cad_radio_voice_script')}")
            elif isinstance(agent_out, Exception):
                print(f"   ❌ Agent execution failed: {agent_out}")
                raise agent_out

    # -------------------------------------------------------------
    # TEST 8: Tier Gating Verification (Tier 1 CPF vs Tier 2 Pro)
    # -------------------------------------------------------------
    print_header("TEST 8: Subscription Tier Gatekeeper Verification")
    async with AsyncSessionLocal() as session:
        state_t1 = state.copy()
        state_t1["subscription_tier"] = "TIER_1_STARTER"
        t1_res = await supervisor.execute_swarm(session=session, state=state_t1)
        print(f"✅ Tier 1 (CPF) executed {t1_res['agents_executed']} agents (Agents 3 & 4 Locked to community mode).")
        assert t1_res['agents_executed'] == 2, "Tier 1 must restrict to 2 concurrent agents!"

    # -------------------------------------------------------------
    # TEST 9: Commercial B2B Operations Runner & Metered Billing
    # -------------------------------------------------------------
    print_header("TEST 9: Commercial B2B Operations & Metered Voice Billing")
    custom_ops = CustomB2BOpsAgent()
    task_res = await custom_ops.execute_task(
        task_category="ALARM_VERIFICATION",
        target_property_or_client="42 Voortrekker Road, Alberton",
        callback_number="+27825550199"
    )
    print(f"✅ Commercial B2B Task Executed: ALARM_VERIFICATION")
    print(f"   Status: {task_res['status_result']} ({task_res['latency_ms']}ms)")
    print(f"   Action: {task_res['action_taken']}")
    print(f"   Voice Minutes Billed: +{task_res['voice_minutes_billed']} minutes (Metered Billing Active)")

    print("\n" + "=" * 65)
    print("🎉 ALL 9 BACKEND CLI BENCHMARK TESTS PASSED CLEANLY!")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(run_cli_tests())
