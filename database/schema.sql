-- CarePath AI: PostgreSQL / Supabase Database Schema
-- Focus: Predictive Healthcare Continuity & Patient Recovery Network
-- Security: Facility multi-tenancy, Row Level Security (RLS), RBAC, Audit Logging & Patient Consent

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM (
    'system_admin',
    'facility_admin',
    'care_coordinator',
    'physician',
    'nurse',
    'navigator'
);

CREATE TYPE care_pathway_status AS ENUM (
    'active',
    'paused',
    'completed',
    'discontinued',
    'lost_to_followup'
);

CREATE TYPE step_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'overdue',
    'missed',
    'cancelled'
);

CREATE TYPE risk_level AS ENUM (
    'low',
    'moderate',
    'high',
    'critical'
);

CREATE TYPE follow_up_status AS ENUM (
    'pending',
    'contacted',
    'rescheduled',
    'escalated',
    'resolved',
    'unreachable'
);

-- 1. Facilities (Multi-tenant partition)
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles (Extends Supabase auth.users or standalone auth)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- references auth.users(id) in Supabase
    facility_id UUID REFERENCES facilities(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'care_coordinator',
    department VARCHAR(100),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Patients (Synthetic / Anonymized compliant records)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    mrn VARCHAR(64) NOT NULL, -- Medical Record Number (Facility unique)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(30),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    primary_language VARCHAR(50) DEFAULT 'English',
    risk_level risk_level DEFAULT 'low',
    continuity_score NUMERIC(5,2) DEFAULT 100.00, -- 0 to 100 continuity index
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_facility_mrn UNIQUE(facility_id, mrn)
);

-- 4. Patient Consents (Strict privacy & continuity communication tracking)
CREATE TABLE IF NOT EXISTS patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL, -- 'care_coordination', 'sms_notifications', 'digital_followup', 'ai_assisted_continuity'
    status VARCHAR(50) NOT NULL DEFAULT 'granted', -- 'granted', 'revoked', 'expired'
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES user_profiles(id),
    consent_notes TEXT
);

-- 5. Care Protocols / Pathway Templates
CREATE TABLE IF NOT EXISTS care_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL, -- e.g. 'POST_CABG_RECOVERY', 'DIABETES_MGMT_T2', 'ONCOLOGY_CYCLE_A'
    category VARCHAR(100) NOT NULL, -- 'Surgical Recovery', 'Chronic Disease', 'Preventive Care', 'Oncology'
    description TEXT,
    target_duration_days INTEGER NOT NULL DEFAULT 90,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Protocol Milestones / Template Steps
CREATE TABLE IF NOT EXISTS protocol_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES care_protocols(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    offset_days INTEGER NOT NULL, -- days from pathway start date
    tolerance_days INTEGER DEFAULT 3, -- allowable variance before flagged overdue
    activity_type VARCHAR(100) NOT NULL, -- 'Lab Test', 'Physician Followup', 'Medication Review', 'Imaging', 'Rehab Check-in'
    is_mandatory BOOLEAN DEFAULT TRUE
);

-- 7. Patient Care Pathways (Active journey instances)
CREATE TABLE IF NOT EXISTS patient_pathways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES care_protocols(id) ON DELETE RESTRICT,
    assigned_coordinator_id UUID REFERENCES user_profiles(id),
    primary_physician_id UUID REFERENCES user_profiles(id),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    status care_pathway_status NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    expected_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    overall_progress_pct NUMERIC(5,2) DEFAULT 0.00,
    current_continuity_score NUMERIC(5,2) DEFAULT 100.00,
    discontinuation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Pathway Steps (Tracked care actions in the journey)
CREATE TABLE IF NOT EXISTS pathway_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pathway_id UUID NOT NULL REFERENCES patient_pathways(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES protocol_milestones(id),
    title VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,
    status step_status NOT NULL DEFAULT 'scheduled',
    is_mandatory BOOLEAN DEFAULT TRUE,
    notes TEXT,
    verification_source VARCHAR(100), -- 'EHR Sync', 'Patient Self-Report', 'Coordinator Call', 'Clinic Log'
    verified_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Care Gaps & Predictive Alerts
CREATE TABLE IF NOT EXISTS care_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    pathway_id UUID REFERENCES patient_pathways(id) ON DELETE CASCADE,
    step_id UUID REFERENCES pathway_steps(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    gap_type VARCHAR(100) NOT NULL, -- 'Overdue Appointment', 'Unfilled Prescription', 'Missing Lab', 'Lost Contact Risk', 'Transition of Care Delayed'
    severity risk_level NOT NULL DEFAULT 'moderate',
    ml_confidence_score NUMERIC(5,2), -- 0.00 to 1.00 or 0 to 100
    risk_factors JSONB DEFAULT '[]'::jsonb, -- e.g. ["Missed previous 2 rehab appointments", "Transportation barrier identified"]
    ai_generated_explanation TEXT,
    suggested_action TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES user_profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Human Follow-up Tasks (Coordination queue)
CREATE TABLE IF NOT EXISTS followup_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    gap_id UUID REFERENCES care_gaps(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES user_profiles(id),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    priority risk_level NOT NULL DEFAULT 'moderate',
    status follow_up_status NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    outcome_notes TEXT,
    contact_method VARCHAR(50), -- 'phone', 'email', 'sms', 'in_person', 'home_health'
    attempt_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Comprehensive Audit Logs (Strict HIPAA & compliance traceability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id),
    user_id UUID REFERENCES user_profiles(id),
    action VARCHAR(100) NOT NULL, -- 'VIEW_PATIENT', 'UPDATE_PATHWAY', 'RESOLVE_GAP', 'EXPORT_REPORT', 'LOGIN_SUCCESS'
    entity_name VARCHAR(100) NOT NULL, -- 'patients', 'care_gaps', 'followup_tasks'
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_facility ON patients(facility_id);
CREATE INDEX IF NOT EXISTS idx_pathways_patient ON patient_pathways(patient_id);
CREATE INDEX IF NOT EXISTS idx_pathways_facility ON patient_pathways(facility_id);
CREATE INDEX IF NOT EXISTS idx_steps_pathway ON pathway_steps(pathway_id);
CREATE INDEX IF NOT EXISTS idx_steps_status_date ON pathway_steps(status, due_date);
CREATE INDEX IF NOT EXISTS idx_care_gaps_facility_patient ON care_gaps(facility_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_care_gaps_resolved ON care_gaps(is_resolved);
CREATE INDEX IF NOT EXISTS idx_followup_assigned ON followup_tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_audit_facility ON audit_logs(facility_id, created_at DESC);
