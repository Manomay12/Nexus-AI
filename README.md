# NEXUS AI — Tactical City Orchestration & Mega-Event Intelligence

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase pgvector](https://img.shields.io/badge/Vector%20DB-Supabase%20pgvector-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![Google Gemini](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4.svg?logo=google&logoColor=white)](https://aistudio.google.com)
[![Three.js](https://img.shields.io/badge/3D%20Digital%20Twin-Three.js-000000.svg?logo=threedotjs&logoColor=white)](https://threejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)

NEXUS AI is an enterprise-grade, hybrid decision-support system designed to orchestrate metropolitan infrastructure, transit networks, crowd egress, and hospitality capacity during global mega-events (stadium finals, Grand Prix, international music festivals).

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │   NEXUS AI FRONTEND (React) │
                                  │ 3D Twin • Copilot • Lab UI  │
                                  └──────────────┬──────────────┘
                                                 │ HTTP REST (FastAPI Client)
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   FASTAPI AI ORCHESTRATOR   │
                                  │   Routing • Schemas • CORS  │
                                  └──────────────┬──────────────┘
                                                 │
        ┌────────────────────────────────────────┼────────────────────────────────────────┐
        ▼                                        ▼                                        ▼
┌──────────────────────────┐         ┌──────────────────────────┐             ┌──────────────────────────┐
│  LAYER 1:                │         │  LAYER 2:                │             │  LAYER 3:                │
│  DETERMINISTIC           │         │  VECTOR                  │             │  GENERATIVE AI           │
│  SIMULATION              │         │  INTELLIGENCE            │             │  (GEMINI)                │
│                          │         │                          │             │                          │
│ • Weighted City          │         │ • Supabase PostgreSQL    │             │ • Natural Language       │
│   Pressure Model         │         │   with pgvector          │             │   Reasoning              │
│ • Algorithmic Risk       │         │ • 768-dim Embeddings     │             │ • Tactical Commander     │
│   Scoring Bounds         │         │   (text-embedding-004)   │             │   Briefings              │
│ • What-If Scenario Lab   │         │ • 24 Standard Protocols  │             │ • Actionable Multi-Step  │
│ • Deterministic Strategy │         │   & Historical Precedents│             │   Recommendations        │
│   Relief Projections     │         │ • Sub-millisecond Cosine │             │ • Decision Factor        │
│                          │         │   Similarity Matching    │             │   Evidence Synthesis     │
└────────────┬─────────────┘         └────────────┬─────────────┘             └────────────┬─────────────┘
             │                                    │                                        │
             └────────────────────────────────────┼────────────────────────────────────────┘
                                                  ▼
                                    ┌───────────────────────────┐
                                    │    INTELLIGENT RESPONSE   │
                                    │                           │
                                    │ • Tactical Briefing Text  │
                                    │ • Dynamic Visual Cards    │
                                    │ • Dispatched Action Items │
                                    │ • Grounded Protocols Used │
                                    │ • AI Transparency Panel  │
                                    └───────────────────────────┘
```

---

## 🧠 Why NEXUS Uses Hybrid AI

Modern city orchestration and emergency dispatch cannot rely on a pure generative Large Language Model (LLM) alone. Hallucinations, non-deterministic math, and random latency in life-critical operations are unacceptable.

NEXUS solves this with a **three-layer hybrid intelligence architecture**:

1. **Layer 1 — Deterministic Intelligence (Simulation Engine)**:
   - Calculates exact city pressure indices using an explainable mathematical formula:
     $$\text{Pressure Score} = (\text{Crowd} \times 0.30) + (\text{Transport} \times 0.25) + (\text{Hotel} \times 0.15) + (\text{Traffic} \times 0.20) + (\text{Event} \times 0.10)$$
   - Simulates early egress whistle penalties, weather road speed degradation (-38%), and capacity bounds without guessing numbers.

2. **Layer 2 — Vector Intelligence (Supabase pgvector & Semantic RAG)**:
   - Indexes verified Standard Operating Procedures (SOPs), monsoon diversion blueprints, gate failure failovers, and historical after-action reports into a 768-dimensional vector space.
   - Searches relevant protocols in milliseconds using cosine distance `<=>`.

3. **Layer 3 — Generative AI (Google Gemini)**:
   - Ingests the deterministic simulation state + retrieved protocols.
   - Formulates concise, authoritative commander briefings (under 110 words), identifies root causes, and populates the **"How NEXUS Reached This Decision"** transparency matrix without hallucination.

---

## 🔍 AI Transparency Panel: "How NEXUS Reached This Decision"

Every AI Copilot response features an expandable decision evidence panel for command accountability and hackathon judging:

| Evidence Factor | Source | Example Telemetry |
| :--- | :--- | :--- |
| **Live Telemetry** | IoT Sensors / Core State | `Transport Load: 89% • Active Attendees: 72,480 • Pressure: 88%` |
| **Simulation Forecast** | Layer 1 Deterministic Model | `Predicted peak critical saturation (96%) in 35 minutes` |
| **Knowledge Retrieved** | Layer 2 pgvector Database | `Stadium Exit Congestion Protocol (Cosine Match: 0.94)` |
| **Operational Reasoning**| Layer 3 Gemini Synthesis | `Concourse saturation exceeds safety limits; pulse turnstiles and skyway bypass stabilize flow.` |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Python 3.11+
- `uv` (recommended) or standard `pip`

### 1. Backend Setup (FastAPI + pgvector + Gemini)

Navigate to the project root:
```bash
# Create Python virtual environment
uv venv backend/.venv

# Activate environment
# On Windows:
backend\.venv\Scripts\activate
# On Linux/macOS:
source backend/.venv/bin/activate

# Install dependencies
uv pip install -r backend/requirements.txt
```

Create `backend/.env` (or copy from `backend/.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Optional: Supabase credentials (if omitted, runs with local deterministic vector engine)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:...

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EMBEDDING_MODE=production
EMBEDDING_DIMENSION=768
DEMO_MODE=false
```

Start the FastAPI backend:
```bash
# From workspace root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup (React + Three.js)

In a separate terminal:
```bash
# Install NPM packages
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🗄️ Supabase PostgreSQL & pgvector Setup

To configure Supabase pgvector:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
2. Go to **SQL Editor** -> **New query**.
3. Paste the contents of `backend/schema.sql` and execute.
4. This will:
   - Enable the `vector` and `uuid-ossp` extensions.
   - Create `events`, `zones`, `incidents`, `response_plans`, `simulation_history`, and `knowledge_documents`.
   - Build the 768-dimension HNSW cosine index `knowledge_documents_embedding_hnsw_idx`.
   - Deploy the `match_documents(query_embedding, match_count, filter)` vector search procedure.
5. In your `backend/.env`, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 🛡️ Offline / Hackathon Demo Resilience

NEXUS AI is built to **never break or crash**, even under zero-connectivity hackathon conditions:
- **No Gemini Key?** The app automatically switches to deterministic RAG templates using live simulation metrics.
- **No Supabase / Offline?** The vector service automatically uses an in-memory NumPy cosine similarity engine preloaded with 24 high-detail operational protocols from `backend/data/nexus_knowledge.json`.
- **Backend Offline?** The React frontend gracefully falls back to client-side high-fidelity simulation and Copilot briefings with zero error screens.

---

## 🛰️ NEXUS GEO-TWIN — Spatial Intelligence & Satellite Context Engine

*"See the city. Understand the pressure. Predict what happens next."*

NEXUS GEO-TWIN is a premium spatial intelligence engine that bridges macro-satellite context with street-level deterministic pressure telemetry and Google Gemini predictive reasoning.

### Key Capabilities
- **Dual Visual Engine (Mapbox GL & Orbital Recon WebGL)**: Renders high-resolution satellite basemaps with extruded 3D buildings, dynamic camera pitch/bearing, and responsive touch controls. If `VITE_MAPBOX_TOKEN` is omitted or network drops, a custom cyber-styled WebGL canvas engine takes over seamlessly with zero crashes.
- **Layered Spatial Intelligence**: Toggle 10 distinct operational layers including Satellite Basemaps, 3D Building Meshes, Event Venues, Hospitality Clusters, Transit Arteries, Corridor Delays, Crowd Pressure Fields, AI Risk Hotspots, Cascading Dependency Networks, and Precipitation Overlays.
- **Time Intelligence Slider**: Scrub between `HISTORICAL (-30m)`, `CURRENT (NOW)`, `SIMULATED (+15m)`, `PREDICTED (+30m)`, and `OUTLOOK (+60m)` with continuous animated playback.
- **Scenario Stress Testing**: 5 one-click simulation scenarios ("Normal Baseline", "Sudden Concurrent Egress", "Monsoon Flash Downpour", "Metro Line 2 Disruption", "BKC Hotel Saturation") dynamically update risk buffer polygons and corridor delays in real time.
- **Data Authenticity & Responsible AI**:
  - **Satellite Basemaps**: Real geographic imagery and orthophotos providing physical spatial orientation (not live crowd tracking from orbit).
  - **Simulated Layers**: Generated by the deterministic physics/queuing model, tagged as `SIMULATED`.
  - **AI Predictions**: Synthesized by Gemini 2.5 RAG with confidence metrics (e.g. 92.4%) and an expandable **[Explain Decision]** algorithmic transparency card.
- **Google Earth Engine Integration (Optional)**: Isolated on the backend (`EARTH_ENGINE_ENABLED=false` by default). When enabled with service account credentials, it queries real-time SRTM elevation, impervious surface ratios, and coastal flood susceptibility for any bounding box.

### Configuration
```env
# Frontend (.env)
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here  # Optional: enables Mapbox satellite 3D streets

# Backend (backend/.env)
EARTH_ENGINE_ENABLED=false                   # Optional: enables Google Earth Engine remote sensing
EARTH_ENGINE_PROJECT=your-gee-project-id
EARTH_ENGINE_SERVICE_ACCOUNT=your-service-account@project.iam.gserviceaccount.com
EARTH_ENGINE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/copilot/chat` | AI Copilot RAG briefing with decision transparency |
| `POST` | `/api/simulation/run` | Deterministic weighted city pressure calculation |
| `POST` | `/api/orchestrator/generate-plan` | Generates 3 multi-agency blueprints (Plan A, B, C) |
| `GET` | `/api/knowledge/search?q=...` | Semantic search over pgvector / local vector store |
| `POST` | `/api/knowledge/ingest` | Ingest new protocols, compute vector, and store |
| `POST` | `/api/knowledge/seed` | Pre-seed 24 operational protocols |
| `GET` | `/api/analytics/summary` | Executive ROI, transit efficiency, and satisfaction |
| `GET` | `/api/geo/locations` | Operational POIs (venues, hotels, transit hubs, corridors) |
| `GET` | `/api/geo/event/{event_id}` | GeoJSON FeatureCollection with dynamic scenario scaling |
| `POST` | `/api/geo/geocode` | Resilient address/landmark geocoding |
| `POST` | `/api/geo/analyze-region` | Regional environmental & flood susceptibility analysis |
| `POST` | `/api/geo/risk-zones` | Algorithmic risk zone generator with weighted formula |
| `GET` | `/api/geo/snapshot/{event_id}` | Temporal state and simulation snapshot |
| `POST` | `/api/geo/simulate` | Coupled simulation updating spatial risk polygons |
| `POST` | `/api/geo/earth-engine/analyze` | Remote sensing analysis proxy |
| `GET` | `/health` | Service health, connectivity, and active modes |
