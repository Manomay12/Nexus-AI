import hashlib
import logging
from typing import List, Tuple
import numpy as np
import httpx
from backend.config import settings

logger = logging.getLogger("nexus.embedding")

class EmbeddingService:
    def __init__(self):
        self.dimension = settings.EMBEDDING_DIMENSION
        self.model = "text-embedding-004"
        self.mode = settings.EMBEDDING_MODE
        self._is_mock = (self.mode == "mock") or not settings.has_gemini

    @property
    def is_mock_mode(self) -> bool:
        return self._is_mock

    async def get_embedding(self, text: str) -> Tuple[List[float], str]:
        """
        Generates a numerical embedding vector for the provided text.
        Returns: (vector, mode_used)
        """
        if not text or not text.strip():
            return self._get_zero_vector(), "zero_vector"

        if not self._is_mock and settings.has_gemini:
            try:
                vector = await self._fetch_gemini_embedding(text)
                if vector and len(vector) == self.dimension:
                    return vector, "production"
                logger.warning("Gemini embedding returned unexpected dimension or empty vector. Falling back to deterministic mode.")
            except Exception as e:
                logger.warning(f"Gemini embedding API call failed: {e}. Falling back to deterministic mode.")

        # Deterministic local mock embedding
        return self._get_deterministic_embedding(text), "mock"

    async def get_batch_embeddings(self, texts: List[str]) -> Tuple[List[List[float]], str]:
        """
        Generates embedding vectors for a batch of texts.
        Returns: (list_of_vectors, mode_used)
        """
        if not texts:
            return [], "empty"

        if not self._is_mock and settings.has_gemini:
            try:
                vectors = await self._fetch_gemini_batch_embeddings(texts)
                if vectors and len(vectors) == len(texts):
                    return vectors, "production"
            except Exception as e:
                logger.warning(f"Batch Gemini embedding failed: {e}. Falling back to deterministic mode.")

        vectors = [self._get_deterministic_embedding(t) for t in texts]
        return vectors, "mock"

    async def _fetch_gemini_embedding(self, text: str) -> List[float]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:embedContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            payload = {
                "model": f"models/{self.model}",
                "content": {
                    "parts": [{"text": text[:2048]}]
                }
            }
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            return data.get("embedding", {}).get("values", [])

    async def _fetch_gemini_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:batchEmbedContents?key={settings.GEMINI_API_KEY}"
        requests = [
            {
                "model": f"models/{self.model}",
                "content": {"parts": [{"text": t[:2048]}]}
            }
            for t in texts
        ]
        async with httpx.AsyncClient(timeout=20.0) as client:
            payload = {"requests": requests}
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            embeddings = data.get("embeddings", [])
            return [e.get("values", []) for e in embeddings]

    def _get_deterministic_embedding(self, text: str) -> List[float]:
        """
        Produces a deterministic, normalized 768-dimensional float vector.
        Combines character hashing with dense semantic concept clustering so that
        domain queries (rain, transport, crowd, hotel) produce realistic high-similarity
        matches against related documents even in offline mock mode.
        """
        vec = np.zeros(self.dimension, dtype=np.float32)
        clean_text = text.lower().strip()
        tokens = [t.strip(".,?!:;\"'()") for t in clean_text.split() if t]

        # Semantic concept clusters (mapped to distinct coordinate blocks)
        CONCEPT_CLUSTERS = {
            "crowd": (0, 120, ["crowd", "stadium", "exit", "egress", "gate", "evacuation", "bottleneck", "concourse", "turnstile", "spectator", "marshals"]),
            "weather": (120, 240, ["rain", "monsoon", "downpour", "weather", "storm", "flood", "heat", "temperature", "lightning", "water", "precipitation"]),
            "transport": (240, 360, ["transport", "metro", "bus", "shuttle", "transit", "headway", "station", "train", "fleet", "traffic", "vehicle", "skyway", "arterial"]),
            "hospitality": (360, 480, ["hotel", "room", "stay", "booking", "accommodation", "restaurant", "dining", "table", "hospitality", "voucher", "incentive"]),
            "incident": (480, 600, ["incident", "breakdown", "glitch", "failure", "surge", "emergency", "crisis", "overload", "saturation", "hazard"]),
            "command": (600, 720, ["command", "protocol", "orchestration", "police", "marshals", "dispatch", "plan", "directive", "redistribution", "mitigation"])
        }

        # Project concept cluster weights
        for concept, (start_idx, end_idx, keywords) in CONCEPT_CLUSTERS.items():
            for kw in keywords:
                if kw in clean_text:
                    # Activate this concept's subspace
                    weight = 2.5 if kw in tokens else 1.2
                    vec[start_idx:end_idx] += weight

        # Word tokens hashing into general subspace (720-768 + full spectrum)
        for token in tokens:
            h = hashlib.sha256(token.encode('utf-8')).hexdigest()
            for i in range(0, 16):
                idx = int(h[i * 4:(i + 1) * 4], 16) % self.dimension
                val = (int(h[i:i + 2], 16) - 128) / 128.0
                vec[idx] += val

        # L2 Normalization
        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        else:
            vec[0] = 1.0

        return vec.tolist()


    def _get_zero_vector(self) -> List[float]:
        vec = [0.0] * self.dimension
        vec[0] = 1.0
        return vec

embedding_service = EmbeddingService()
