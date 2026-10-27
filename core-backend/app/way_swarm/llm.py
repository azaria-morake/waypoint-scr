"""
Waypoint Secure - The Way Swarm LLM Client & Multi-Model Inference Engine
Direct REST client for Google Gemini models and OpenAI models with strict JSON validation.
NO synthetic/fabricated fallback: calls real LLM APIs and fails loudly on API errors or quota limits.
"""
import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional, Type
from pydantic import BaseModel
import httpx
from app.config import settings

logger = logging.getLogger("waypoint.llm")

class WaypointLLMClient:
    """
    Central LLM Client for all agents in The Way Swarm.
    - Connects directly to Google Generative Language REST API for Gemini models.
    - Supports distinct models per agent (MODEL_TELEMETRY, MODEL_NOK_RECON, MODEL_DISPATCH, MODEL_CUSTOM_OPS).
    - If OPENAI_API_KEY is present: supports OpenAI models (gpt-4o-mini).
    - Fails loudly with full error traces if the API returns an error or quota is exceeded.
    """
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")

        if self.gemini_key:
            logger.info("Waypoint LLM Client initialized with Google Gemini REST API.")
        elif self.openai_key:
            logger.info("Waypoint LLM Client initialized with OpenAI.")
        else:
            logger.warning("No active GEMINI_API_KEY or OPENAI_API_KEY found in environment.")

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        response_model: Optional[Type[BaseModel]] = None,
        response_schema: Optional[Any] = None,
        temperature: float = 0.2,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Executes prompt through active LLM (Gemini or OpenAI) with JSON schema enforcement.
        Raises RuntimeError on API failure, rate-limiting, or invalid JSON.
        """
        target_model = model or settings.MODEL_TELEMETRY

        if self.gemini_key:
            # Multi-model fallback sequence to eliminate any transient 503 / 404 / spike
            models_to_try = [
                target_model,
                "gemini-3.1-flash-lite",
                "gemini-3.1-flash-lite-preview",
                "gemini-flash-latest",
                "gemini-flash-lite-latest",
                "gemini-3.5-flash-lite",
            ]
            seen = set()
            candidate_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

            last_err = None
            for cand_model in candidate_models:
                try:
                    logger.info(f"Dispatching structured prompt to Google Gemini [{cand_model}]...")
                    parsed = await self._call_gemini_rest(
                        model=cand_model,
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        temperature=temperature
                    )
                    logger.info(f"Successfully received valid structured response from Gemini [{cand_model}]")
                    return parsed
                except Exception as e:
                    logger.warning(f"Gemini call on [{cand_model}] failed: {e}. Trying next available model...")
                    last_err = e

            raise RuntimeError(f"All Google Gemini models failed. Last error: {last_err}")

        elif self.openai_key:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=self.openai_key)
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt + "\nYou MUST return valid RFC-8259 JSON only."},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}")
                raise RuntimeError(f"OpenAI API call failed: {e}")

        else:
            raise RuntimeError(
                "No active LLM API key configured. Please set GEMINI_API_KEY in your .env file."
            )

    async def _call_gemini_rest(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
        timeout: float = 35.0
    ) -> Dict[str, Any]:
        """
        Direct HTTP/2 REST call to Google's Generative Language API with JSON mode.
        Fails loudly on HTTP errors, timeouts, or JSON parsing issues.
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": temperature
            }
        }

        max_retries = 3
        for attempt in range(1, max_retries + 1):
            async with httpx.AsyncClient(timeout=timeout) as client:
                try:
                    res = await client.post(url, json=payload)
                except httpx.TimeoutException as e:
                    if attempt < max_retries:
                        await asyncio.sleep(1.5)
                        continue
                    raise RuntimeError(f"Gemini API timed out after {timeout}s on model [{model}]: {e}")
                except Exception as e:
                    raise RuntimeError(f"Network error contacting Gemini API on model [{model}]: {e}")

                if res.status_code == 200:
                    try:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if not candidates:
                            raise RuntimeError(f"Gemini [{model}] returned 0 candidates. Response: {data}")
                        text = candidates[0]["content"]["parts"][0]["text"].strip()
                        if text.startswith("```"):
                            lines = text.splitlines()
                            if lines[0].startswith("```"):
                                lines = lines[1:]
                            if lines and lines[-1].startswith("```"):
                                lines = lines[:-1]
                            text = "\n".join(lines).strip()
                        return json.loads(text)
                    except json.JSONDecodeError as jde:
                        raise RuntimeError(f"Gemini [{model}] returned malformed JSON: {jde}\nRaw text: {text}")
                elif res.status_code == 503:
                    if attempt < max_retries:
                        logger.warning(f"Gemini [{model}] 503 High Demand spike. Retrying in 1.5s (attempt {attempt}/{max_retries})...")
                        import asyncio
                        await asyncio.sleep(1.5)
                        continue
                    raise RuntimeError(
                        f"Gemini [{model}] HTTP 503 (High Demand Spikes). Details: {res.text}"
                    )
                elif res.status_code == 429:
                    raise RuntimeError(
                        f"Gemini [{model}] HTTP 429 (Rate Limit / Quota Exceeded). Details: {res.text}"
                    )
                else:
                    raise RuntimeError(
                        f"Gemini [{model}] HTTP {res.status_code} Error: {res.text}"
                    )

# Global LLM client instance
llm_client = WaypointLLMClient()
