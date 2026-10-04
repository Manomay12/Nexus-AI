-- ====================================================================
-- NEXUS AI — Supabase PostgreSQL & pgvector Database Schema
-- High-Performance City Telemetry & Semantic Knowledge Store
-- ====================================================================

-- 1. Enable pgvector extension for high-dimension embedding searches
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ DEFAULT now() + INTERVAL '4 hours',
    expected_attendance INT NOT NULL DEFAULT 75000,
    status VARCHAR(32) NOT NULL DEFAULT 'LIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Zones Table
CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hotel_occupancy DOUBLE PRECISION NOT NULL DEFAULT 0,
    transport_load DOUBLE PRECISION NOT NULL DEFAULT 0,
    crowd_density DOUBLE PRECISION NOT NULL DEFAULT 0,
    traffic_load DOUBLE PRECISION NOT NULL DEFAULT 0,
    restaurant_demand DOUBLE PRECISION NOT NULL DEFAULT 0,
    parking_availability DOUBLE PRECISION NOT NULL DEFAULT 0,
    pressure_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    risk_level VARCHAR(32) NOT NULL DEFAULT 'STABLE',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    zone_id VARCHAR(64) REFERENCES zones(id) ON DELETE SET NULL,
    incident_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Response Plans Table
CREATE TABLE IF NOT EXISTS response_plans (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    strategy_type VARCHAR(64) NOT NULL,
    estimated_congestion_reduction DOUBLE PRECISION NOT NULL DEFAULT 0,
    estimated_cost VARCHAR(64),
    estimated_impact TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'READY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Simulation History Table
CREATE TABLE IF NOT EXISTS simulation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    pressure_before DOUBLE PRECISION NOT NULL,
    pressure_after DOUBLE PRECISION NOT NULL,
    recommended_plan VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Knowledge Documents Table (RAG Knowledge Base)
-- Configured for 768 dimensions (matches Google text-embedding-004)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW Vector Index for millisecond-speed approximate nearest neighbor queries
CREATE INDEX IF NOT EXISTS knowledge_documents_embedding_hnsw_idx 
ON knowledge_documents 
USING hnsw (embedding vector_cosine_ops);

-- GIN Index for rapid metadata filtering (category, scenario, zone)
CREATE INDEX IF NOT EXISTS knowledge_documents_metadata_gin_idx 
ON knowledge_documents 
USING gin (metadata);

-- 8. Cosine Similarity Matching RPC Function
CREATE OR REPLACE FUNCTION match_documents (
    query_embedding VECTOR(768),
    match_count INT DEFAULT 5,
    filter JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        kd.id,
        kd.content,
        kd.metadata,
        (1 - (kd.embedding <=> query_embedding))::FLOAT AS similarity
    FROM knowledge_documents kd
    WHERE (filter = '{}'::jsonb OR kd.metadata @> filter)
    ORDER BY kd.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ====================================================================
-- SEED INITIAL EVENTS & ZONES
-- ====================================================================

INSERT INTO events (id, name, location, event_type, expected_attendance, status)
VALUES 
('mumbai-sports', 'Mumbai International Sports Festival', 'Wankhede & BKC Megaplex, Mumbai', 'sports', 72480, 'LIVE'),
('monaco-f1', 'Monaco Grand Prix World Championship', 'Circuit de Monaco, Monte Carlo', 'motorsport', 142000, 'LIVE'),
('melbourne-cricket', 'Melbourne World Cup Final', 'Melbourne Sports Precinct, Victoria', 'sports', 96800, 'LIVE'),
('tomorrowland', 'Tomorrowland Global Electronic Festival', 'De Schorre, Boom, Belgium', 'festival', 185000, 'LIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zones (id, event_id, name, latitude, longitude, hotel_occupancy, transport_load, crowd_density, traffic_load, restaurant_demand, parking_availability, pressure_score, risk_level)
VALUES 
('zone-venue', 'mumbai-sports', 'Stadium Grand Arena', 18.9322, 72.8258, 98.0, 94.0, 4.8, 92.0, 92.0, 4.0, 88.0, 'CRITICAL'),
('zone-andheri', 'mumbai-sports', 'Andheri Metro Interchange', 19.1197, 72.8468, 82.0, 89.0, 3.2, 84.0, 78.0, 18.0, 68.0, 'HIGH'),
('zone-bandra', 'mumbai-sports', 'Bandra Coastal Gateway', 19.0596, 72.8295, 94.0, 88.0, 3.6, 86.0, 76.0, 12.0, 82.0, 'HIGH'),
('zone-bkc', 'mumbai-sports', 'BKC Business & Hotel Hub', 19.0657, 72.8683, 91.0, 76.0, 2.7, 74.0, 84.0, 28.0, 74.0, 'MODERATE'),
('zone-d', 'mumbai-sports', 'Zone D - Northern Eco Gateway', 19.1600, 72.8500, 48.0, 38.0, 1.1, 35.0, 44.0, 72.0, 42.0, 'STABLE'),
('zone-terminal', 'mumbai-sports', 'Central Rail & Harbor Terminal', 18.9400, 72.8350, 79.0, 91.0, 3.4, 88.0, 68.0, 22.0, 71.0, 'HIGH')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- NEXUS GEO-TWIN SPATIAL INTELLIGENCE TABLES
-- ====================================================================

-- 9. Locations Table (POIs, Venues, Hotels, Transit Hubs)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS locations_coords_idx ON locations (latitude, longitude);

-- 10. Geo Snapshots Table (Time Intelligence Historical & Forecast States)
CREATE TABLE IF NOT EXISTS geo_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    snapshot_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    simulation_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    risk_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    weather_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Geospatial Analysis Table (Google Earth Engine & Remote Sensing Results)
CREATE TABLE IF NOT EXISTS geospatial_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    analysis_type VARCHAR(64) NOT NULL,
    location JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

