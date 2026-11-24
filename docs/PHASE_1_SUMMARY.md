# CarePath AI: Architectural Blueprints & Implementation Guide

**Project:** CarePath AI  
**Full Title:** AI-Powered Predictive Healthcare Continuity and Patient Recovery Network  
**Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*  
**Clinical Scope:** Non-diagnostic healthcare workflow tracking, care-process gap detection, and human outreach coordination.

---

## 1. System Architecture Overview

```
 CarePath AI Ecosystem
 ┌─────────────────────────────────────────────────────────────┐
 │  Frontend Client (React 19, TypeScript, Tailwind CSS, Vite) │
 │  - Healthcare White-First SaaS UI (Cyan / Blue / Navy)      │
 │  - Real-time Continuity Center & Care Gap Resolution Feed   │
 │  - Active Patients & Coordinated Follow-up Queue            │
 └──────────────────────────────┬──────────────────────────────┘
                                │ REST / JSON (JWT Auth)
 ┌──────────────────────────────▼──────────────────────────────┐
 │  Core API Service (Node.js, Express, TypeScript)            │
 │  - Role-Based Access Control (RBAC) & Facility Tenancy       │
 │  - Immutable Audit Logging (HIPAA Compliance Trail)         │
 │  - Dual-Mode Persistence (Supabase PostgreSQL / Local Store)│
 └───────────────────┬───────────────────────────┬─────────────┘
                     │                           │
 ┌───────────────────▼──────────┐    ┌───────────▼─────────────┐
 │  Supabase / PostgreSQL       │    │  FastAPI ML Microservice│
 │  - 11 Domain Tables & Indexes│    │  (Python, Scikit-learn) │
 │  - Synthetic Patient Journey │    │  - Transparent Scoring  │
 │  - Strict Consent Records    │    │  - Non-diagnostic Gap ML│
 └──────────────────────────────┘    └─────────────────────────┘
```

---

## 2. Completed Phase 1 Milestones

1. **Database Schema & Synthetic Seeding (`/database`):**
   - [schema.sql](file:///e:/CarePathAI/database/schema.sql): Complete multi-tenant tables (`facilities`, `user_profiles`, `patients`, `patient_consents`, `care_protocols`, `protocol_milestones`, `patient_pathways`, `pathway_steps`, `care_gaps`, `followup_tasks`, `audit_logs`).
   - [seed.sql](file:///e:/CarePathAI/database/seed.sql): Rich synthetic dataset honoring clinical continuity pathways (Post-PCI cardiac recovery protocol, overdue rehab step, high-risk gap alerts).

2. **Express TypeScript Backend (`/server`):**
   - Configured JWT authentication with facility-level isolation and role validation.
   - Dual-mode data access layer (`dataStore.ts`) enabling development with synthetic clinical datasets and direct Supabase PostgreSQL integration.
   - Verified compilation (`tsc --noEmit` exited 0).

3. **FastAPI ML Continuity Engine (`/ml-service`):**
   - Multi-factor continuity score computation with transparent rule-based risk driver identification.
   - Absolute non-diagnostic boundaries: models predict care-process drop-offs, missed outreach, and transportation barriers without offering clinical medical diagnosis.

4. **React Vite UI Foundation (`/client`):**
   - White-first aesthetic, healthcare cyan/blue palette, responsive layouts.
   - Dynamic Continuity KPI cards, interactive Care Gap reviews, live resolution logging with audit trail generation, and patient table.
   - Verified build (`npm run build` completed cleanly).
