#!/usr/bin/env python3
"""
E2E Test: Safe Disarm Sync, Duress Coercion, and Command Dashboard State
"""
import sys
import os
import asyncio
import json
import httpx
import websockets

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

API_BASE = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/command/e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b"

async def test_disarm_sync_flow():
    print("=" * 70)
    print("🚀 RUNNING E2E SAFE DISARM & DURESS VERIFICATION TEST")
    print("=" * 70)

    async with httpx.AsyncClient(base_url=API_BASE, timeout=30.0) as client:
        # Step 0: Reset state
        print("\n[Step 0] Resetting state to clean IDLE...")
        r = await client.post("/api/v1/journeys/reset")
        assert r.status_code == 200, f"Reset failed: {r.text}"
        print("✅ State reset to IDLE.")

        # Check dashboard state
        r = await client.get("/api/v1/dashboard/state")
        state = r.json()
        assert not state["journey"] or state["journey"]["status"] != "RED", "Journey should not be RED"
        assert state["is_popia_shielded"] is True, "POPIA shield should be active"
        assert "ENCRYPTED" in state["bolo"]["full_name"], "BOLO should be encrypted"
        print("✅ Initial Dashboard State: POPIA Shield ACTIVE, No Red Alert.")

        # Connect WebSocket to listen for real-time events
        print("\n[Step 1] Connecting to Command Dashboard WebSocket...")
        async with websockets.connect(WS_URL) as ws:
            print("✅ WebSocket connected.")

            # Step 2: Citizen starts monitored journey
            print("\n[Step 2] Citizen starts journey from Alberton to Sandton...")
            start_payload = {
                "destination_name": "Sandton City Mall, Sandton",
                "destination_lat": -26.1076,
                "destination_lng": 28.0567,
                "eta_minutes": 35,
                "pre_journey_outfit_photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
            }
            r = await client.post("/api/v1/journeys/start", json=start_payload)
            assert r.status_code == 200, f"Start failed: {r.text}"
            journey_data = r.json()
            journey_id = journey_data["journey_id"]
            print(f"✅ Journey Started: ID = {journey_id}, Status = {journey_data['status']}")

            # Step 3: Trigger Panic (2nd Tap)
            print("\n[Step 3] Citizen triggers SOS Panic (2nd Tap)...")
            r = await client.post(f"/api/v1/journeys/{journey_id}/panic")
            assert r.status_code == 200, f"Panic failed: {r.text}"
            print("✅ Panic endpoint returned 200.")

            # Wait for WS message: JOURNEY_RED_ALERT
            msg_data = None
            for _ in range(5):
                msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                msg_data = json.loads(msg)
                if msg_data.get("type") in ["JOURNEY_RED_ALERT", "SWARM_AWAKENED"]:
                    print(f"✅ WS Received Alert: {msg_data['type']}")
                    break

            # Verify Dashboard state is now RED
            r = await client.get("/api/v1/dashboard/state")
            state = r.json()
            assert state["journey"]["status"] == "RED", f"Expected RED, got {state['journey']['status']}"
            assert state["is_popia_shielded"] is False, "POPIA shield must be unlocked on Code Red"
            assert state["bolo"]["full_name"] == "Thandiwe Ndlovu", "BOLO name must be revealed"
            print("✅ Dashboard State: RED ALERT ACTIVE, POPIA Shield Section 11 UNLOCKED, BOLO visible.")

            # Step 4: Citizen enters Standard PIN 1234 to safely disarm
            print("\n[Step 4] Citizen enters Standard PIN '1234' (I've Arrived Safely)...")
            r = await client.post(f"/api/v1/journeys/{journey_id}/disarm", json={"pin": "1234"})
            assert r.status_code == 200, f"Disarm failed: {r.text}"
            disarm_data = r.json()
            assert disarm_data["status"] == "SAFE_COMPLETED", f"Expected SAFE_COMPLETED, got {disarm_data['status']}"
            print("✅ Citizen Disarm Response: SAFE_COMPLETED")

            # Check WS message for JOURNEY_DISARMED
            ws_disarmed = False
            for _ in range(25):
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                    data = json.loads(msg)
                    msg_type = data.get("type")
                    if msg_type == "JOURNEY_DISARMED":
                        print(f"✅ WS Received: JOURNEY_DISARMED ({data.get('message')})")
                        ws_disarmed = True
                        break
                    else:
                        print(f"   [Swarm WS Event]: {msg_type}")
                except asyncio.TimeoutError:
                    break
            assert ws_disarmed, "Expected JOURNEY_DISARMED broadcast over WebSocket"

            # Check Dashboard state immediately
            r = await client.get("/api/v1/dashboard/state")
            state = r.json()
            assert state["journey"]["status"] == "SAFE_COMPLETED", f"Expected SAFE_COMPLETED, got {state['journey']['status']}"
            assert state["is_popia_shielded"] is True, "POPIA shield must be RESTORED after safe arrival"
            assert "ENCRYPTED" in state["bolo"]["full_name"], "BOLO must be re-encrypted"
            print("✅ Dashboard State: ALERT CLEARED, POPIA Shield RESTORED, BOLO RE-ENCRYPTED.")

            # Step 5: Test Duress PIN 9999 (Coercion Protocol)
            print("\n[Step 5] Testing Silent Coercion: Citizen forced to enter Duress PIN '9999'...")
            # Start new journey
            r = await client.post("/api/v1/journeys/start", json=start_payload)
            journey_id_2 = r.json()["journey_id"]

            r = await client.post(f"/api/v1/journeys/{journey_id_2}/disarm", json={"pin": "9999"})
            assert r.status_code == 200, f"Duress disarm failed: {r.text}"
            duress_res = r.json()
            assert duress_res["status"] == "SAFE_COMPLETED", "Client must receive deceptive SAFE_COMPLETED response"
            print("✅ Citizen received deceptive 'SAFE_COMPLETED' response (Kidnapper deceived).")

            # But backend is Code Red
            r = await client.get("/api/v1/dashboard/state")
            state = r.json()
            assert state["journey"]["status"] == "RED", "Backend must secretly transition to RED!"
            assert state["is_popia_shielded"] is False, "POPIA shield must unlock for responders"
            print("✅ Backend & Dashboard secretly transitioned to CODE RED with full Swarm tracking!")

            # Step 6: Stand Down / Reset
            print("\n[Step 6] Operator clicks Stand Down / Reset...")
            r = await client.post("/api/v1/journeys/reset")
            assert r.status_code == 200

            # Verify reset
            r = await client.get("/api/v1/dashboard/state")
            state = r.json()
            assert state["journey"]["status"] != "RED"
            assert state["is_popia_shielded"] is True
            print("✅ Full cycle complete! All assertions passed cleanly.")

    print("\n" + "=" * 70)
    print("🏆 ALL E2E DISARM & SYNC VERIFICATIONS PASSED 100%")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_disarm_sync_flow())
