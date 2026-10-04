import json
import logging
from typing import Dict, Any, Optional
import httpx
from backend.config import settings

logger = logging.getLogger("nexus.gemini")

class GeminiService:
    def __init__(self):
        self.model = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.api_key = settings.GEMINI_API_KEY

    async def generate_tactical_reasoning(
        self,
        system_instruction: str,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 600
    ) -> Optional[str]:
        """Calls the Gemini generateContent REST API with tactical parameters."""
        if not settings.has_gemini:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and len(candidates) > 0:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Gemini generation failed: {e}")

        return None

gemini_service = GeminiService()
