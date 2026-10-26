#!/usr/bin/env python3
"""
Waypoint Secure - Gemini Flash CLI Handshake Utility
Tests connectivity, authentication, and structured output with gemini-3.8-flash / gemini-3.5-flash.
"""
import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import json
import time
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(BASE_DIR, ".env"))

def run_handshake():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ ERROR: No GEMINI_API_KEY found in .env file.")
        sys.exit(1)

    print(f"🔑 GEMINI_API_KEY loaded (Length: {len(api_key)}, Prefix: {api_key[:8]}...)")
    print("=" * 60)
    print("STEP 1: Querying Google Generative AI Models List...")
    print("=" * 60)

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        t0 = time.perf_counter()
        res = httpx.get(url, timeout=15.0)
        t_list = int((time.perf_counter() - t0) * 1000)

        if res.status_code == 200:
            models = [m["name"].replace("models/", "") for m in res.json().get("models", []) if "flash" in m["name"]]
            print(f"✅ Models query successful ({t_list}ms). Available Flash models:")
            for m in models[:8]:
                print(f"   • {m}")
        else:
            print(f"❌ Failed to list models (HTTP {res.status_code}): {res.text}")
            return
    except Exception as e:
        print(f"❌ Network error querying models: {e}")
        return

    print("\n" + "=" * 60)
    print("STEP 2: Testing Swarm Multi-Model Distribution Handshake")
    print("=" * 60)

    from app.config import settings
    swarm_models = [
        ("Agent 1 (Telemetry)", settings.MODEL_TELEMETRY),
        ("Agent 3 (NOK Recon)", settings.MODEL_NOK_RECON),
        ("Agent 4 (Dispatch CAD)", settings.MODEL_DISPATCH),
        ("Agent 5 (Commercial B2B)", settings.MODEL_CUSTOM_OPS),
    ]

    for role, model in swarm_models:
        print(f"\n📡 Pinging [{role} -> {model}]...")
        post_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "systemInstruction": {
                "parts": [{"text": "You are Waypoint Secure AI. Return valid JSON only."}]
            },
            "contents": [
                {
                    "parts": [{"text": f"Handshake check for {role}. Return JSON: {{\"status\": \"ONLINE\", \"role\": \"{role}\", \"model\": \"{model}\"}}"}]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        t_start = time.perf_counter()
        try:
            r = httpx.post(post_url, json=payload, timeout=25.0)
            latency = int((time.perf_counter() - t_start) * 1000)

            if r.status_code == 200:
                body = r.json()
                text = body["candidates"][0]["content"]["parts"][0]["text"]
                print(f"✅ [{role}] HANDSHAKE SUCCESS (HTTP 200, {latency}ms)")
                print(f"   Payload: {text.strip()}")
            elif r.status_code == 429:
                print(f"⚠️ [{role}] HTTP 429: Quota or rate limit exceeded on {model}.")
            elif r.status_code == 503:
                print(f"⚠️ [{role}] HTTP 503: High demand spike on {model}.")
            else:
                print(f"⚠️ [{role}] HTTP {r.status_code}: {r.text[:200]}")
        except httpx.ReadTimeout:
            print(f"⏱️ [{role}] ReadTimeout (>25s) on {model}.")
        except Exception as e:
            print(f"❌ [{role}] Error: {e}")

    print("\n" + "=" * 60)
    print("Handshake diagnostic complete.")
    print("=" * 60)

if __name__ == "__main__":
    run_handshake()
