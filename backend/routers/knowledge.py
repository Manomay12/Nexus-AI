import json
import os
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from backend.models.schemas import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentResponse,
    KnowledgeSearchResponse
)
from backend.services.embedding_service import embedding_service
from backend.services.vector_service import vector_service

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge & Vector Search"])

@router.post("/ingest", response_model=KnowledgeDocumentResponse)
async def ingest_document(doc: KnowledgeDocumentCreate):
    """
    Ingests an operational protocol or incident report.
    Validates content, generates 768-dim embedding, stores vector and metadata.
    """
    if not doc.content.strip():
        raise HTTPException(status_code=400, detail="Document content cannot be empty.")

    embedding, _ = await embedding_service.get_embedding(doc.content)
    record = await vector_service.add_document(
        content=doc.content,
        metadata=doc.metadata,
        embedding=embedding
    )

    return KnowledgeDocumentResponse(
        id=record["id"],
        content=record["content"],
        metadata=record["metadata"]
    )

@router.get("/search", response_model=KnowledgeSearchResponse)
async def search_knowledge(
    q: str = Query(..., description="Natural language search query"),
    top_k: int = Query(default=4, ge=1, le=20, description="Max documents to return"),
    threshold: float = Query(default=0.25, ge=0.0, le=1.0, description="Similarity threshold"),
    category: Optional[str] = Query(default=None, description="Optional category filter")
):
    """
    Semantic search over Supabase pgvector / NEXUS Vector Store.
    Example query: 'What happens if heavy rain starts 30 minutes before exit?'
    """
    if not q.strip():
        return KnowledgeSearchResponse(query="", results=[], count=0, search_mode="none")

    query_emb, _ = await embedding_service.get_embedding(q)
    filter_meta = {"category": category} if category else None

    search_result = await vector_service.search_documents(
        query_embedding=query_emb,
        top_k=top_k,
        similarity_threshold=threshold,
        filter_metadata=filter_meta
    )

    results = [
        KnowledgeDocumentResponse(
            id=r["id"],
            content=r["content"],
            metadata=r["metadata"],
            similarity=r.get("similarity")
        )
        for r in search_result.get("results", [])
    ]

    return KnowledgeSearchResponse(
        query=q,
        results=results,
        count=len(results),
        search_mode=search_result.get("mode", "local_deterministic_vector")
    )

@router.post("/seed")
async def seed_knowledge_base():
    """Seeds the 24 pre-built operational knowledge documents into the vector store."""
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "nexus_knowledge.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="nexus_knowledge.json not found")

    with open(json_path, "r", encoding="utf-8") as f:
        docs = json.load(f)

    seeded_count = 0
    for d in docs:
        content = d.get("content", "")
        meta = {
            "title": d.get("title", ""),
            "category": d.get("category", "protocol"),
            "scenario": d.get("scenario", "standard"),
            "severity": d.get("severity", "medium"),
            "zone": d.get("zone", "All"),
            "source_type": d.get("source_type", "protocol")
        }
        await vector_service.add_document(content=content, metadata=meta)
        seeded_count += 1

    return {"status": "success", "documents_seeded": seeded_count}
