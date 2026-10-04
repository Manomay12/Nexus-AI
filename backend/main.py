import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.services.vector_service import vector_service
from backend.routers import copilot, simulation, knowledge, analytics, geo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("nexus.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NEXUS Vector Database & Operational Knowledge Base...")
    await vector_service.initialize()
    logger.info("NEXUS Intelligence Architecture online and primed.")
    yield
    logger.info("NEXUS Backend shutting down.")

app = FastAPI(
    title="NEXUS AI — City Orchestration & Mega-Event Intelligence",
    description="Real-time hybrid AI backend combining deterministic simulation, Supabase pgvector semantic search, Google Gemini tactical reasoning, and NEXUS GEO-TWIN spatial intelligence.",
    version="2.1.0",
    lifespan=lifespan
)

# Configure CORS for Vite frontend and local tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(copilot.router)
app.include_router(simulation.router)
app.include_router(simulation.orchestrator_router)
app.include_router(knowledge.router)
app.include_router(analytics.router)
app.include_router(geo.router)


@app.get("/")
async def root():
    return {
        "system": "NEXUS AI Command Orchestrator",
        "version": "2.0.0",
        "status": "ONLINE",
        "architecture": {
            "layer_1": "Deterministic Simulation Engine",
            "layer_2": "Supabase pgvector (768-dim Semantic RAG)",
            "layer_3": "Google Gemini Generative AI"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "has_gemini": settings.has_gemini,
        "has_supabase": settings.has_supabase,
        "embedding_mode": settings.EMBEDDING_MODE,
        "demo_mode": settings.DEMO_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
