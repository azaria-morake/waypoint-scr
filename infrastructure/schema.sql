-- ==============================================================================
-- WAYPOINT SECURE & THE WAY SWARM
-- PostgreSQL + PostGIS Production Schema
-- Team: Artificial Star — FNB AOTY Hackathon 2026
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Citizens / App Users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    standard_pin_hash VARCHAR(255) NOT NULL,
    duress_pin_hash VARCHAR(255) NOT NULL,
    is_fica_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Encrypted BOLO Profiles (POPIA Zero-Knowledge Shield)
CREATE TABLE IF NOT EXISTS bolo_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    height_cm INT NOT NULL,
    build_description VARCHAR(100) NOT NULL,
    encrypted_face_photo_blob TEXT NOT NULL, -- AES-256-GCM base64 ciphertext
    encrypted_distinguishing_marks TEXT,     -- AES-256-GCM base64 ciphertext
    encryption_iv VARCHAR(64) NOT NULL,
    kms_key_id VARCHAR(120) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Emergency Contacts (Next of Kin for Recon Interrogation)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    priority_order INT DEFAULT 1
);

-- 4. Journeys (Citizen Trips & Dead-Man's Switch)
CREATE TABLE IF NOT EXISTS journeys (
    journey_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('IDLE', 'GREEN', 'AMBER', 'RED', 'SAFE_COMPLETED')),
    origin_point GEOGRAPHY(POINT, 4326) NOT NULL,
    destination_point GEOGRAPHY(POINT, 4326) NOT NULL,
    pre_journey_outfit_photo_url TEXT,
    eta_timestamp TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 5. High-Frequency Telemetry Pings
CREATE TABLE IF NOT EXISTS telemetry_pings (
    ping_id BIGSERIAL PRIMARY KEY,
    journey_id UUID NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_kmh FLOAT NOT NULL DEFAULT 0.0,
    heading_deg FLOAT NOT NULL DEFAULT 0.0,
    accelerometer_g_force FLOAT NOT NULL DEFAULT 1.0,
    battery_percentage INT NOT NULL,
    ingestion_channel VARCHAR(20) DEFAULT 'WSS' CHECK (ingestion_channel IN ('WSS', 'REST', 'SMS_FALLBACK')),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tenant Organizations (CPFs, Armed Response, SAPS Police)
CREATE TABLE IF NOT EXISTS organizations (
    org_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_name VARCHAR(150) NOT NULL,
    org_type VARCHAR(30) NOT NULL CHECK (org_type IN ('CPF', 'PRIVATE_SECURITY', 'SAPS_GOV')),
    subscription_tier VARCHAR(30) NOT NULL CHECK (subscription_tier IN ('TIER_1_STARTER', 'TIER_2_PRO', 'TIER_3_GOV')),
    jurisdiction_polygon GEOGRAPHY(POLYGON, 4326) NOT NULL,
    max_concurrent_agents INT NOT NULL DEFAULT 2,
    monthly_voice_minutes_used INT DEFAULT 0,
    monthly_voice_minutes_limit INT DEFAULT 500,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Responders & Field Patrol Fleet
CREATE TABLE IF NOT EXISTS responders (
    responder_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    callsign VARCHAR(60) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('DISPATCHER', 'PATROLLER', 'COMMANDER')),
    current_location GEOGRAPHY(POINT, 4326) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'EN_ROUTE', 'ON_SCENE', 'OFFLINE'))
);

-- 8. Emergency Incidents (Triggered when RED state transition occurs)
CREATE TABLE IF NOT EXISTS incidents (
    incident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID UNIQUE NOT NULL REFERENCES journeys(journey_id),
    trigger_source VARCHAR(30) NOT NULL CHECK (trigger_source IN ('SECOND_TAP', 'DURESS_PIN', 'DEAD_MAN_SWITCH', 'G_FORCE_ANOMALY', 'SMS_FALLBACK')),
    movement_state VARCHAR(40) DEFAULT 'CALCULATING',
    synthesized_bolo_json JSONB DEFAULT '{}'::jsonb,
    predicted_intercept_nodes JSONB DEFAULT '[]'::jsonb,
    resolution_status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (resolution_status IN ('ACTIVE', 'INTERCEPTED', 'FALSE_ALARM', 'RESOLVED')),
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 9. The Way Swarm AI Agent Logs
CREATE TABLE IF NOT EXISTS ai_agent_logs (
    agent_log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    agent_type VARCHAR(40) NOT NULL,
    action_taken TEXT NOT NULL,
    structured_output JSONB NOT NULL,
    transcript_or_payload TEXT,
    execution_latency_ms INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Custom B2B Operations Agents
CREATE TABLE IF NOT EXISTS custom_b2b_agents (
    custom_agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    task_category VARCHAR(50) NOT NULL CHECK (task_category IN ('ALARM_VERIFICATION', 'CLIENT_WELFARE_CHECK', 'GUARD_CHECKIN', 'INCIDENT_REPORT')),
    system_prompt_template TEXT NOT NULL,
    webhook_trigger_url TEXT,
    is_enabled BOOLEAN DEFAULT TRUE
);

-- 11. Incident Dispatches (CAD & Fleet Routing)
CREATE TABLE IF NOT EXISTS incident_dispatches (
    dispatch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(org_id),
    responder_id UUID NOT NULL REFERENCES responders(responder_id),
    dispatch_method VARCHAR(30) NOT NULL CHECK (dispatch_method IN ('AI_VOICE_CALL', 'DASHBOARD_PUSH', 'WHATSAPP', 'CAD_WEBHOOK')),
    distance_km FLOAT NOT NULL,
    alerted_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ
);

-- 12. POPIA Cryptographic Audit Logs (Immutable Legal Record)
CREATE TABLE IF NOT EXISTS popia_audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id),
    org_id UUID NOT NULL REFERENCES organizations(org_id),
    responder_id UUID,
    action VARCHAR(60) NOT NULL CHECK (action IN ('KMS_BOLO_DECRYPTED', 'LIVE_TRAJECTORY_VIEWED', 'NOK_TRANSCRIPT_ACCESSED', 'FORENSIC_EXPORT')),
    ip_address VARCHAR(45) NOT NULL,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial Indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_geom ON telemetry_pings USING GIST (coordinates);
CREATE INDEX IF NOT EXISTS idx_org_jurisdiction ON organizations USING GIST (jurisdiction_polygon);
CREATE INDEX IF NOT EXISTS idx_responder_geom ON responders USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_journeys_active ON journeys (status) WHERE status IN ('GREEN', 'AMBER', 'RED');
