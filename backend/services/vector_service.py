import json
import logging
import os
import uuid
from typing import List, Dict, Any, Optional
import numpy as np

from backend.config import settings
from backend.services.embedding_service import embedding_service

logger = logging.getLogger("nexus.vector")

class VectorService:
    def __init__(self):
        self.supabase_client = None
        self._local_documents: List[Dict[str, Any]] = []
        self._local_embeddings: Dict[str, np.ndarray] = {}
        self._initialized = False

        if settings.has_supabase:
            try:
                from supabase import create_client
                self.supabase_client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                logger.info("Supabase client initialized successfully for pgvector operations.")
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}. Defaulting to local vector engine.")
                self.supabase_client = None

    async def initialize(self):
        """Preload default knowledge base documents into memory for local similarity fallback."""
        if self._initialized:
            return

        json_path = os.path.join(os.path.dirname(__file__), "..", "data", "nexus_knowledge.json")
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    docs = json.load(f)
                    for doc in docs:
                        doc_id = doc.get("id") or str(uuid.uuid4())
                        content = doc.get("content", "")
                        metadata = {
                            "title": doc.get("title", ""),
                            "category": doc.get("category", "general"),
                            "scenario": doc.get("scenario", "standard"),
                            "severity": doc.get("severity", "medium"),
                            "zone": doc.get("zone", "All"),
                            "source_type": doc.get("source_type", "protocol")
                        }
                        self._local_documents.append({
                            "id": doc_id,
                            "content": content,
                            "metadata": metadata
                        })
                        # Generate embedding
                        emb, _ = await embedding_service.get_embedding(f"{doc.get('title', '')} {content}")
                        self._local_embeddings[doc_id] = np.array(emb, dtype=np.float32)

                logger.info(f"Loaded {len(self._local_documents)} documents into NEXUS Vector Cache.")
            except Exception as e:
                logger.error(f"Failed loading local nexus_knowledge.json: {e}")

        self._initialized = True

    async def add_document(self, content: str, metadata: Dict[str, Any], embedding: Optional[List[float]] = None) -> Dict[str, Any]:
        """Adds a document to Supabase pgvector and the local fallback cache."""
        await self.initialize()

        if embedding is None:
            embedding, _ = await embedding_service.get_embedding(content)

        doc_id = str(uuid.uuid4())
        doc_record = {
            "id": doc_id,
            "content": content,
            "metadata": metadata
        }

        # Save to local cache
        self._local_documents.append(doc_record)
        self._local_embeddings[doc_id] = np.array(embedding, dtype=np.float32)

        # Attempt save to Supabase if connected
        if self.supabase_client:
            try:
                self.supabase_client.table("knowledge_documents").insert({
                    "id": doc_id,
                    "content": content,
                    "metadata": metadata,
                    "embedding": embedding
                }).execute()
            except Exception as e:
                logger.warning(f"Supabase insertion failed: {e}. Kept in local vector cache.")

        return doc_record

    async def search_documents(
        self,
        query_embedding: List[float],
        top_k: int = 4,
        similarity_threshold: float = 0.15,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes semantic search against pgvector or local vector engine.
        Returns top relevant documents matching metadata criteria and threshold.
        """
        await self.initialize()

        # 1. Attempt Supabase pgvector RPC search if available
        if self.supabase_client:
            try:
                rpc_params = {
                    "query_embedding": query_embedding,
                    "match_count": top_k,
                    "filter": filter_metadata or {}
                }
                response = self.supabase_client.rpc("match_documents", rpc_params).execute()
                if response.data and len(response.data) > 0:
                    results = [
                        {
                            "id": str(item.get("id")),
                            "content": item.get("content"),
                            "metadata": item.get("metadata", {}),
                            "similarity": float(item.get("similarity", 0.0))
                        }
                        for item in response.data
                        if float(item.get("similarity", 0.0)) >= similarity_threshold
                    ]
                    if results:
                        return {
                            "results": results,
                            "mode": "supabase_pgvector"
                        }
            except Exception as e:
                logger.warning(f"Supabase match_documents RPC failed: {e}. Engaging local vector fallback.")

        # 2. Local vectorized cosine similarity search
        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm < 1e-6:
            q_norm = 1.0

        scored_docs = []
        for doc in self._local_documents:
            doc_id = doc["id"]
            d_vec = self._local_embeddings.get(doc_id)
            if d_vec is None:
                continue

            # Check metadata filter if specified
            if filter_metadata:
                match = True
                for k, v in filter_metadata.items():
                    if doc["metadata"].get(k) != v:
                        match = False
                        break
                if not match:
                    continue

            d_norm = np.linalg.norm(d_vec)
            if d_norm < 1e-6:
                d_norm = 1.0

            # Cosine similarity
            sim = float(np.dot(q_vec, d_vec) / (q_norm * d_norm))
            if sim >= similarity_threshold:
                scored_docs.append({
                    "id": doc_id,
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                    "similarity": round(sim, 4)
                })

        # Sort descending by similarity
        scored_docs.sort(key=lambda x: x["similarity"], reverse=True)
        top_results = scored_docs[:top_k]

        return {
            "results": top_results,
            "mode": "local_deterministic_vector"
        }

    async def delete_document(self, doc_id: str) -> bool:
        await self.initialize()
        self._local_documents = [d for d in self._local_documents if d["id"] != doc_id]
        self._local_embeddings.pop(doc_id, None)

        if self.supabase_client:
            try:
                self.supabase_client.table("knowledge_documents").delete().eq("id", doc_id).execute()
            except Exception as e:
                logger.warning(f"Supabase delete failed: {e}")
        return True

    async def update_document(self, doc_id: str, content: str, metadata: Dict[str, Any]) -> bool:
        await self.initialize()
        emb, _ = await embedding_service.get_embedding(content)
        for doc in self._local_documents:
            if doc["id"] == doc_id:
                doc["content"] = content
                doc["metadata"] = metadata
                self._local_embeddings[doc_id] = np.array(emb, dtype=np.float32)
                break

        if self.supabase_client:
            try:
                self.supabase_client.table("knowledge_documents").update({
                    "content": content,
                    "metadata": metadata,
                    "embedding": emb
                }).eq("id", doc_id).execute()
            except Exception as e:
                logger.warning(f"Supabase update failed: {e}")
        return True

vector_service = VectorService()
