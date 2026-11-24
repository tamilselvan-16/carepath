# CarePath AI - Complete Project Documentation & Phase Verifications

> **Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*

This master document consolidates all documentation and verification specifications across Phases 1 through 9 of the CarePath AI healthcare continuity platform.

---



<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_1_SUMMARY.md -->
<!-- ========================================== -->

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

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_1_AUTH_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI: Phase 1 Welcome & Authentication Verification

**Status:** Completed and Verified &bull; **Compilation:** 0 errors &bull; **Production Build:** Success

---

## Deliverables Summary

1. **Attractive Landing & Welcome Screen:**
   - White-first aesthetic, healthcare cyan (`#0891b2`), blue (`#1d4ed8`), and deep indigo palette.
   - Project name: **CarePath AI**
   - Full name: **AI-Powered Predictive Healthcare Continuity and Patient Recovery Network**
   - Tagline: *Every Patient Matters. Every Treatment Journey Counts.*
   - Interactive Healthcare Visual Illustration component ([HealthcareIllustration.tsx](file:///e:/CarePathAI/client/src/components/HealthcareIllustration.tsx)) visualizing post-discharge milestones, 48h nurse check-ins, detected care gaps, and specialist reviews.

2. **Multilingual Language Support (8 Indian Languages):**
   - Comprehensive dictionary ([translations.ts](file:///e:/CarePathAI/client/src/translations.ts)) with instant live switching for:
     1. **English (en)**
     2. **Tamil / தமிழ் (ta)**
     3. **Hindi / हिन्दी (hi)**
     4. **Telugu / తెలుగు (te)**
     5. **Malayalam / മലയാളം (ml)**
     6. **Kannada / ಕನ್ನಡ (kn)**
     7. **Bengali / বাংলা (bn)**
     8. **Marathi / मराठी (mr)**
   - Header Language Selector dropdown component ([LanguageSelector.tsx](file:///e:/CarePathAI/client/src/components/LanguageSelector.tsx)).

3. **Supabase Authentication & Auth Flow Module:**
   - Real Supabase client configured ([supabase.ts](file:///e:/CarePathAI/client/src/lib/supabase.ts)) with session persistence, auto-refresh tokens, and `onAuthStateChange` listeners.
   - Comprehensive Auth Modal ([AuthModal.tsx](file:///e:/CarePathAI/client/src/components/AuthModal.tsx)) supporting:
     - **Sign In (Login)**
     - **Create Account (Registration)** with clinical user profiles (name, email, phone, role, preferred language)
     - **Forgot Password & Password Reset**
     - Password visibility toggles, loading indicators, and user-friendly error/success banners.

4. **Role-Based Access Control (RBAC) & Dedicated Dashboards:**
   - **Administrator Dashboard:** Multi-facility governance, tenant authority, RBAC policies, and audit log monitors.
   - **Doctor / Physician Dashboard:** Urgent clinical alerts, uncollected lab panels, post-PCI review cohorts.
   - **Healthcare Worker Workspace:** Real-time Care Continuity Center, priority care-gap review and resolution feed with audit trail logging, and follow-up queue.
   - **Facility Administrator Dashboard:** Protocol performance, care coordinator workloads, and transit barrier resolution analytics.
   - Interactive top-bar role persona switcher for instant testing across all 4 clinical roles.

5. **Responsiveness & Safety Protocols:**
   - Seamless mobile, tablet, laptop, and desktop layouts.
   - Clear non-diagnostic clinical continuity disclaimers throughout the UI.

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_2_DASHBOARD_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI: Phase 2 Dashboard & Navigation Verification

**Status:** Completed & Production Verified &bull; **Compilation:** 0 errors &bull; **Build Status:** Clean

---

## Deliverables Summary

1. **Responsive Shell & Navigation System:**
   - **Desktop Sidebar:** [Sidebar.tsx](file:///e:/CarePathAI/client/src/components/Sidebar.tsx) (collapsible width, institutional user profile card, live badges, and clinical role markers).
   - **Mobile Bottom Navigation:** [BottomNavigation.tsx](file:///e:/CarePathAI/client/src/components/BottomNavigation.tsx) (optimized quick actions with alert badges).
   - **Role-Based Access Control (RBAC):** Restricts navigation views based on authenticated role (`administrator`, `doctor`, `healthcare_worker`, `facility_administrator`).

2. **10 Complete Dashboard Sections:**
   1. **Overview:** Complete KPI dashboard with live Recharts area & bar charts, status breakdown, and recent audit activity stream.
   2. **Patients:** Patient directory with MRN, contact, risk categories, and continuity health scores.
   3. **Care Journeys:** Surgical recovery & chronic disease pathways with progress bars and milestone statuses.
   4. **Care Activities:** Scheduled, in-progress, and overdue milestone activities (intake sessions, lab requisition panels, ECGs).
   5. **Referrals:** Specialty transfer tracking with facility names, target dates, and overdue alert flags ([ReferralsView.tsx](file:///e:/CarePathAI/client/src/components/sections/ReferralsView.tsx)).
   6. **AI Care-Gap Intelligence:** Multi-factor care drop-off detection, ML confidence levels, risk drivers, and coordinator resolution logging.
   7. **Follow-up Tasks:** Prioritized human coordination queue for telephone calls, family liaison support, and transit vouchers.
   8. **Notifications:** Real-time clinical triggers and care gap alerts with mark-as-read capability ([NotificationsView.tsx](file:///e:/CarePathAI/client/src/components/sections/NotificationsView.tsx)).
   9. **Reports & Analytics:** Exportable HIPAA-aligned quality metrics, readmission avoidance, and audit compliance ([ReportsView.tsx](file:///e:/CarePathAI/client/src/components/sections/ReportsView.tsx)).
   10. **Settings:** Institutional account preferences, dark/light theme switcher, and MFA status ([SettingsView.tsx](file:///e:/CarePathAI/client/src/components/sections/SettingsView.tsx)).

3. **Dashboard Overview Statistics:**
   - Total registered patients (real database aggregation).
   - Active care journeys.
   - Pending care activities.
   - Overdue referrals.
   - Pending follow-up tasks.
   - High-priority & critical care-gap alerts.
   - Completed coordinator follow-ups with retention benchmarks.

4. **Filters, Themes & Search:**
   - **Facility Filter:** Switches between All Facilities, St. Jude Metropolitan, and Highland Valley Community Hospital.
   - **Date Range Filter:** Today, Last 7 Days, Last 30 Days, Quarter to Date.
   - **Global Search:** Filters patients, MRNs, and care pathways dynamically.
   - **Light & Dark Theme:** Full system persistence via `ThemeProvider` ([ThemeContext.tsx](file:///e:/CarePathAI/client/src/context/ThemeContext.tsx)).
   - **Multilingual Support:** Preserved for all 8 Indian languages.

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_3_PATIENT_MANAGEMENT_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI: Phase 3 Patient Management Module Verification

**Status:** Completed & Production Verified &bull; **Backend:** 0 errors &bull; **Frontend Build:** Clean (`dist/assets/index-uJf5nJhd.js` generated)

---

## Deliverables Summary

1. **Patient Registration & Reference ID Generation:**
   - [PatientFormModal.tsx](file:///e:/CarePathAI/client/src/components/patients/PatientFormModal.tsx)
   - Generates unique reference IDs formatted as `CLP-2026-XXXX`.
   - Comprehensive clinical fields: Full Name, DOB, Gender, Phone, Email, Residential Address, Primary Language, Emergency Care Surrogate Liaison, Facility Assignment, Risk Tier, Consent Status, and Care Status.
   - Form validation with inline error handling.

2. **Patient Editing & Permission Verification:**
   - Existing patients can be edited (`PUT /api/patients/:id`).
   - Maintains immutable patient ID and MRN integrity while updating clinical parameters, contact info, and care status.
   - Every modification is automatically recorded in the PostgreSQL immutable `audit_logs` collection.

3. **Multi-Tenant Facility Filtering & Search:**
   - [PatientManagementView.tsx](file:///e:/CarePathAI/client/src/components/patients/PatientManagementView.tsx)
   - Real-time search by Patient Name, Reference ID (`CLP-2026-XXXX`), phone number, or email.
   - Filters by Facility (`St. Jude Metropolitan`, `Highland Valley`), Care Status (`active`, `in_recovery`, `completed`, `paused`), and Clinical Risk Tier (`low`, `moderate`, `high`, `critical`).
   - Facility-level RBAC: non-system administrators are restricted to inspecting records within their permitted institutional facility.

4. **Tabbed Patient Profile View (6 Distinct Tabs):**
   - [PatientProfileView.tsx](file:///e:/CarePathAI/client/src/components/patients/PatientProfileView.tsx)
   - **Tab 1: Overview:** Demographics, emergency liaison, continuity score (0–100), active predictive care gaps, and interactive consent management widget (one-click Grant/Revoke).
   - **Tab 2: Care Journey:** Ongoing recovery protocols (PCI recovery, diabetes intensive continuity) with visual completion meters and timeline ranges.
   - **Tab 3: Activities:** Complete list of scheduled, completed, and overdue clinical milestone activities (intake sessions, lab requisition panels, ECGs).
   - **Tab 4: Referrals:** Outpatient specialty transfers, destination facilities, target completion dates, and clinical notes.
   - **Tab 5: Follow-ups:** Coordinator outreach queue for phone calls, family liaison support, and transit assistance.
   - **Tab 6: History & Audit:** Immutable audit trail showing timestamped administrative events, consent changes, and care gap resolutions.

5. **Hackathon Synthetic Demo Dataset:**
   - Pre-loaded with realistic post-PCI and diabetes continuity cohorts.
   - Prominent notification badge explaining de-identified synthetic test records.

6. **Responsive Layout:**
   - Adapts from compact mobile stacked cards to spacious desktop data tables.

---


<!-- ========================================== -->
<!-- SOURCE FILE: PATIENT_REGISTRATION_ONBOARDING_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Patient Registration & Onboarding System Verification

## Overview
CarePath AI incorporates a complete, accessible, and resilient **Patient Registration and Onboarding System** designed specifically for diverse healthcare continuity environments. It accommodates community healthcare workers, hospital registration staff, caregivers, and individual patients without imposing smartphone, email, or internet prerequisites.

---

## 1. Architectural Highlights

### A. Primary Staff-Assisted Registration (`PatientFormModal.tsx`)
- **Comprehensive Clinical & Demographic Fields**:
  - Full Name (First Name, Last Name).
  - Date of Birth (ISO date picker) & Gender.
  - Contact Number (with graceful handling for patients without personal phones).
  - Residential Address & Locality.
  - Preferred Language (English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi).
  - Assigned Healthcare Facility (St. Jude Metropolitan, Highland Valley Hospital).
  - Registration Purpose (e.g., Post-operative cardiology continuity, TB DOTS protocol, Maternity monitoring).
  - Informed Consent Status (`granted`, `pending`, `revoked`).
  - Initial Risk Category (`low`, `moderate`, `high`, `critical`).
- **Post-Registration Outcomes**:
  - Automatically generates a unique, human-readable Patient Reference ID (`CLP-2026-XXXX`).
  - Saves the record into PostgreSQL database with facility association and recording the registering staff member (`registered_by_staff_id`, `registered_by_staff_name`).
  - Initiates the patient profile and enables immediate commencement of longitudinal care journeys.
  - Generates a **Printable Patient Continuity Card with QR Code** for offline clinic verification.

---

### B. Real-Time Duplicate Patient Detection
- Real-time pre-submission verification endpoint: `POST /api/patients/check-duplicate`.
- Checks clean telephone digits, exact names, and DOB to identify existing records across facilities.
- Non-blocking advisory alert surfaces if a match is found (`AlertCircle`), showing the existing patient name and Reference ID to prevent fragmented clinical continuity records.

---

### C. Printable Patient Card with QR Code
- Embedded directly into the post-registration workflow (`.printable-patient-card`).
- Includes:
  - Patient Full Name, DOB, Gender, and Preferred Language.
  - Bold Patient Reference ID (`CLP-2026-XXXX`).
  - Contact telephone & Primary assigned healthcare center.
  - Scannable QR Code representation for instant clinic check-in.
  - One-click print trigger (`window.print()`).

---

### D. Patient & Caregiver Self-Registration & Public Portal (`PatientPortalView.tsx`)
- **No Forced Account Creation**:
  - Patients are never forced to create email credentials or download an app.
  - Patients access their records using their **Patient Reference ID (MRN)** paired with a verification factor (registered Phone Number or Date of Birth).
- **Public Care Portal**:
  - View longitudinal care journey milestones, upcoming lab investigations, consultations, and recovery check-ins.
  - View active specialist referrals and liaison statuses.
  - Direct institutional contact line for transportation barriers or rescheduling.
- **Self-Registration Intake**:
  - Clean intake form for patients or assisted family members registering from home or community kiosks.
  - Endpoint: `POST /api/patients/self-register`.

---

### E. Offline Registration with Sync Queue
- When connectivity is unavailable (`navigator.onLine === false`):
  - Patient intake data is enqueued into IndexedDB (`CarePath_offline_db` store `sync_queue`) with action `REGISTER_OFFLINE_PATIENT`.
  - Client receives an immediate offline reference ID (`CLP-OFFLINE-XXXX`) and can still print the physical card.
  - As soon as connectivity resumes, `POST /api/sync/batch` processes the pending registrations, runs duplicate detection, assigns an official MRN, and appends the creation to the immutable audit trail.

---

## 2. API Specifications

| Method | Endpoint | Authorization | Description |
| :--- | :---: | :---: | :--- |
| `POST` | `/api/patients` | Staff Token | Primary registration with facility assignment & audit logging |
| `POST` | `/api/patients/check-duplicate` | Staff Token | Real-time duplicate detection across phone, name, and DOB |
| `POST` | `/api/patients/self-register` | Public | Self-intake / caregiver registration with consent capture |
| `POST` | `/api/patient-portal/lookup` | Public | Verification factor lookup for read-only appointment portal |
| `POST` | `/api/sync/batch` | Staff Token | Batch synchronization of offline patient registrations |

---

## 3. Verification Checklist

| Requirement | Implementation Status | Evidence / Location |
| :--- | :---: | :--- |
| **Complete Registration Fields** | Verified | `PatientFormModal.tsx` & `Patient.ts` schema |
| **Unique Patient Reference ID** | Verified | Generated as `CLP-2026-XXXX` |
| **Supabase PostgreSQL / DataStore Storage** | Verified | Handled in `DataStore.createPatient()` |
| **Facility-Level Authorization** | Verified | Enforced via `facility_id` & RBAC |
| **Record Registering Staff Member** | Verified | Recorded in `registered_by_staff_id` & audit trail |
| **Printable Patient Card with QR Code** | Verified | Interactive print card in `PatientFormModal.tsx` |
| **Optional Patient Self-Registration** | Verified | Public intake form in `PatientPortalView.tsx` |
| **Assisted Caregiver Registration** | Verified | Intake mode selector in modal and portal |
| **Duplicate Patient Detection** | Verified | `/api/patients/check-duplicate` with visual warning |
| **Offline Registration Queue** | Verified | `queueOfflineOperation` (`REGISTER_OFFLINE_PATIENT`) |
| **No Forced Account Creation** | Verified | Verified lookup by Reference ID + phone/DOB |
| **Multilingual Support (8 Indian Languages)** | Verified | Integrated preferred language selector |
| **Build & Type Safety** | Verified | Server `tsc --noEmit` and Client `vite build` 0 errors |

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_4_CARE_JOURNEY_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Phase 4: Patient Care Journey Engine Verification

**Date:** November 24, 2026  
**Status:** ✅ Fully Implemented and Verified  
**Project:** CarePath AI - AI-Powered Predictive Healthcare Continuity and Patient Recovery Network  
**Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*  

---

## 1. Overview of Delivered Features

Phase 4 delivers the complete **Patient Care Journey Engine**, tracking each patient's healthcare trajectory from intake through final journey completion. In strict compliance with healthcare safety rules, this engine is non-diagnostic and focuses on continuity coordination, milestone tracking, human follow-up, and overdue activity detection.

### Core Capabilities Built:
1. **8 Standardized Healthcare Journey Stages:**
   - `patient_registration` (Patient Intake & Registration)
   - `consultation` (Physician Initial / Post-Discharge Consultation)
   - `investigation_lab` (Diagnostic Investigation / Laboratory Tests)
   - `referral` (Specialty or Outpatient Clinic Referral)
   - `medicine_collection` (Pharmacy Verification & Medication Collection)
   - `followup_appointment` (Follow-up Clinical Appointment)
   - `recovery_followup` (Home Health & Recovery Liaison Outreach)
   - `journey_completion` (Continuity Protocol Completion & Discharge)

2. **6 Standard Activity Statuses:**
   - `not_started`
   - `in_progress`
   - `pending`
   - `completed` (with automatically or manually recorded completion date)
   - `overdue` (auto-evaluated based on scheduled due date and real-time clock)
   - `cancelled`

3. **Dynamic Journey Customization:**
   - Care journeys do not force unnecessary stages on patients.
   - The `CreateJourneyModal` allows clinicians and care coordinators to customize stage titles, day offsets from journey start, and add/remove custom stages according to clinical need.

4. **Visual Patient Journey Timeline:**
   - Interactive, accessible timeline component with status color badges:
     - 🟢 Completed (`emerald-500` with check icon)
     - 🔴 Overdue (`red-500` with alert indicator)
     - 🔵 In Progress (`blue-500`)
     - 🟡 Pending (`amber-500`)
     - ⚪ Not Started / Cancelled (`slate-400`)
   - Displays scheduled due dates, completed dates, responsible healthcare worker, clinical notes, and document badges.

5. **Activity Detail Modal & Supporting Documents:**
   - Dedicated modal (`ActivityDetailModal`) to:
     - Update activity status.
     - Record or edit clinical and continuity notes.
     - Assign responsible healthcare worker.
     - Record verified date of completion.
     - Upload/attach supporting documents (lab requisitions, discharge summaries, rehab intake forms).

6. **Care Activities Central Queue (`CareActivitiesView`):**
   - High-level metric cards for Overdue, Active/Pending, and Completed activities.
   - Search by activity title, type, and assigned worker.
   - Status filters (`all`, `overdue`, `in_progress`, `pending`, `completed`).

7. **Integration with Patient Management:**
   - Seamlessly embedded into `PatientProfileView.tsx` under the **Care Journey** tab and **Activities** tab, allowing clinicians to review timelines directly within a patient's chart.

8. **Audit Trail Logging:**
   - All journey creations, activity status transitions, notes updates, and document attachments are logged into the audit trail with timestamps, entity IDs, and user roles.

---

## 2. API Endpoints Verified

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/pathways` | List all patient care journeys (optionally filtered by facility) |
| `GET` | `/api/pathways/:id` | Get specific care journey with enriched stages and patient details |
| `POST` | `/api/pathways` | Create a new care journey with custom stages and offset dates |
| `POST` | `/api/pathways/:id/activities` | Append a new custom care activity to an existing pathway |
| `PATCH` | `/api/activities/:id` | Update status, completion date, notes, or assigned worker |
| `POST` | `/api/activities/:id/documents` | Upload/attach supporting clinical document to milestone |

---

## 3. Automated Test Verification Results

### Server TypeScript Compilation:
```bash
Set-Location E:\CarePathAI\server; npx tsc --noEmit
# Exit code: 0 (No compilation errors)
```

### Client TypeScript & Vite Production Build:
```bash
Set-Location E:\CarePathAI\client; npm run build
# Exit code: 0
# ✓ built in 616ms
# dist/index.html                     0.45 kB │ gzip:   0.29 kB
# dist/assets/index-CcOdzlEV.css     73.36 kB │ gzip:  11.39 kB
# dist/assets/index-Dk_JJsGf.js   1,080.65 kB │ gzip: 293.05 kB
```

### DataStore Unit Verification:
- Pathways count: `3`
- Default steps per standard pathway: `8` (covering all 8 defined stages)
- Initial overdue step correctly evaluated: `"Phase II Supervised Cardiac Rehabilitation Intake Session"`
- Status transition: `overdue` ➔ `completed` recorded completion date `2026-11-24`
- Pathway overall completion progress automatically recomputed from `40%` ➔ `63%`

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_5_AI_CARE_GAP_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Phase 5: AI Care-Gap Intelligence Verification

**Date:** November 24, 2026  
**Status:** ✅ Fully Implemented and Verified  
**Project:** CarePath AI - AI-Powered Predictive Healthcare Continuity and Patient Recovery Network  
**Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*  

---

## 1. Overview of Delivered Features

Phase 5 delivers the complete **AI-Powered Care-Gap Intelligence Module**, operating as a hybrid intelligence system combining transparent deterministic rule-based operational scoring, a Scikit-learn Random Forest predictive model for 7-day care-gap probability, Google Gemini natural language explainability, and a Human-in-the-Loop review workflow for healthcare coordinators.

### Safety Directives strictly enforced:
- **Zero Medical Diagnosis:** AI analyzes care journey milestones, appointment attendance, lab panel collection, referral delays, and transportation barriers.
- **Zero Prescription or Drug Recommendations:** AI never suggests medications, dosages, or clinical treatments.
- **Human-in-the-Loop:** Every AI output must be reviewed, accepted, modified, or dismissed by an authorized healthcare worker before tasks enter the coordinator queue.

---

## 2. Architecture & Components

### A. Rule-Based Operational Care-Gap Scoring Engine (`server/src/careGapEngine.ts`)
- Implements transparent operational weights:
  - **Missed Appointment:** `+20 points` (consultation or follow-up missed/overdue)
  - **Overdue Pending Referral:** `+25 points` (specialist referral pending past threshold)
  - **Overdue Follow-up Task:** `+20 points` (coordinator task pending past deadline)
  - **Recorded Transportation Barrier:** `+15 points` (documented transit limitation)
  - **Overdue Medicine Collection:** `+10 points` (pharmacy refill / adherence unverified)
  - **Repeated Incomplete Activities:** `+10 points` (>=3 activities incomplete or overdue)
- Capped at `100 points`.
- Categorization:
  - `0–29`: Low
  - `30–59`: Medium
  - `60–100`: High
- Clear disclaimer: *Prototype operational weights for continuity prioritization. Not a clinically validated diagnostic score.*

### B. Machine Learning Service (`ml-service/main.py`)
- **Technology:** Python FastAPI + Scikit-learn `RandomForestClassifier`.
- **Target:** Predict whether a care-process gap may occur within the next 7 days (`predicted_gap_7d: bool`).
- **Prediction-Time Features:**
  - `pending_activities_count`
  - `overdue_activities_count`
  - `missed_appointment_count`
  - `referral_delay_days`
  - `previous_incomplete_count`
  - `recorded_access_barriers`
  - `days_since_last_activity`
- **Data Leakage Prevention:**
  - Synthetic dataset generated with unique `patient_id` groups.
  - Evaluation split performed strictly by unique patients (`train_test_split(unique_patients, test_size=0.25)`).
- **Model Evaluation Metrics (`GET /model/metrics` & `/api/ai/model-metrics`):**
  - **Precision:** `67.0%`
  - **Recall:** `65.5%`
  - **F1 Score:** `66.2%`
  - **Confusion Matrix (N=448):**
    - True Negative: `149` | False Positive: `73`
    - False Negative: `78`  | True Positive: `148`
- Non-diagnostic disclaimer included in every response.

### C. Gemini API & Dual AI Provider Service (`server/src/geminiService.ts`)
- Secure Node.js backend integration with Google Gemini (`gemini-1.5-flash`), Anthropic Claude fallback, and a robust deterministic fallback explainer.
- Generates:
  - Simple plain-language explanation of the care gap.
  - Summary of contributing operational factors.
  - Suggested administrative follow-up action.
  - Follow-up task title and coordinator priority (`low`, `moderate`, `high`, `critical`).

### D. AI Dashboard (`client/src/components/dashboards/AICareGapIntelligenceView.tsx`)
- Displays side-by-side:
  - **Rule-based score (0–100)** with category badge and point breakdown.
  - **ML Random Forest prediction** with 7-day probability percentage.
  - **Identified contributing factors** with itemized points.
  - **Google Gemini plain-language explanation** with assessment timestamp.
  - **Suggested administrative follow-up action**.
- **Human-in-the-Loop Review Actions:**
  - **Accept & Schedule Task:** Automatically schedules an authorized task on the coordinator queue.
  - **Modify Action:** Allows the clinician to customize or edit instructions and record reasoning before scheduling.
  - **Dismiss Gap:** Marks the alert as dismissed with clinical review notes.
- **Inspect ML Model Metrics Modal:** Displays live Precision, Recall, F1 score, and 2x2 confusion matrix.

---

## 3. Endpoints Implemented & Verified

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/care-gaps` | List care gaps with rule scores and ML predictions |
| `POST` | `/api/care-gaps/:id/explain` | Re-run hybrid Rule + ML + Gemini analysis on selected gap |
| `POST` | `/api/care-gaps/:id/review` | Human review: accept, modify, or dismiss suggestion |
| `GET` | `/api/ai/model-metrics` | Retrieve Random Forest evaluation metrics & confusion matrix |
| `POST` | `/api/care-gaps/:id/resolve` | Mark care gap resolved with coordinator notes |

---

## 4. Build & Unit Test Verification Results

### Server TypeScript Compilation & Build:
```bash
Set-Location E:\CarePathAI\server; npx tsc --noEmit; npm run build
# Exit code: 0
```

### Client TypeScript & Vite Production Build:
```bash
Set-Location E:\CarePathAI\client; npm run build
# Exit code: 0
# ✓ built in 557ms
# dist/index.html                     0.45 kB │ gzip:   0.29 kB
# dist/assets/index-B0-Zp2qc.css     75.84 kB │ gzip:  11.68 kB
# dist/assets/index-B0pOyPn7.js   1,096.44 kB │ gzip: 295.70 kB
```

### Python ML Engine Unit Verification:
- Model trained with patient-stratified split: **Verified** (1,352 train / 448 test cases).
- Evaluation: **Precision: 67.0%, Recall: 65.5%, F1 Score: 66.2%**.
- Prediction test: Output 7-day care-gap probability `90.6%` for high-risk test features.

### Rule-Based Scoring Engine Verification:
- Calculated prototype weights:
  - Missed appointment (20) + Referral (25) + Follow-up (20) + Transit barrier (15) + Meds (10) + Incomplete (10) = 100 points (Category: High).

### Human-in-the-Loop Review Verification:
- `POST /api/care-gaps/:id/review` transitions review status (`pending_review` ➔ `accepted`), logs audit entry, and automatically creates an authorized follow-up task on the coordinator queue.

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_6_FOLLOWUP_REFERRAL_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Phase 6: Follow-up and Referral Management Verification

**Date:** November 24, 2026  
**Status:** ✅ Fully Implemented and Verified  
**Project:** CarePath AI - AI-Powered Predictive Healthcare Continuity and Patient Recovery Network  
**Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*  

---

## 1. Overview of Delivered Features

Phase 6 implements the complete **Healthcare Follow-up and Referral Management Workflow**, establishing an end-to-end closed-loop care continuity system:
```
Care Gap Detected ➔ AI Explanation Generated ➔ Human Review ➔ Follow-up Task Assigned ➔ Contact Attempt Logged & Barriers Recorded ➔ Intervention Executed ➔ Verified Closed-Loop Completion
```

---

## 2. Follow-Up Task Management Capabilities

1. **Task Creation Modes:**
   - **From AI Suggestions:** Clinicians accept or modify an AI care-gap recommendation, which immediately queues an authorized task with priority, due date, and instructions.
   - **Manual Creation:** Coordinators can create tasks manually (`CreateTaskModal.tsx`) choosing target patient, assigned worker, due date, priority, and outreach channel.

2. **Standard 7 Task Statuses:**
   - `new`: Task initialized on queue.
   - `assigned`: Specific healthcare worker designated.
   - `in_progress`: Contact attempt actively conducted / patient reached.
   - `waiting_for_response`: Voicemail left or awaiting family call-back.
   - `completed`: Intervention executed and verified.
   - `escalated`: Task flagged for supervisor or liaison escalation.
   - `cancelled`: Task voided with administrative rationale.

3. **Contact Attempt Logging & Audit History:**
   - Channels: `phone`, `sms`, `home_visit`, `portal`.
   - Contact Outcomes: `reached`, `family_contacted`, `voicemail`, `no_answer`, `number_disconnected`.
   - Each attempt records timestamp, worker ID, notes, and automatically increments attempt counter.

4. **Patient Barrier Tracking:**
   - Structured barrier categories:
     - `transportation` (Transit deficit / distance barrier)
     - `appointment_availability` (Clinic capacity / scheduling delay)
     - `communication_difficulty` (Language or digital access barrier)
     - `financial_access` (Coverage or co-pay hardship)
     - `other`
   - Barrier mitigation notes captured (e.g. transit voucher dispatch, interpreter booking).

5. **Intervention Metrics & Clinical Safety Rule:**
   - Tracks intervention duration (`completion_time_minutes`).
   - **AI Safety Directive Enforced:** *Completion of an administrative follow-up task does NOT automatically mark a patient as recovered. Clinical recovery requires protocol milestone verification.*

---

## 3. Closed-Loop Referral Management Capabilities

1. **Referral Creation (`CreateReferralModal.tsx`):**
   - Referring facility (origin).
   - Receiving facility (destination e.g. Regional Medical Center, Rehab Hub).
   - Clinical specialty and detailed referral reason.
   - Target completion date and special instructions.

2. **Standard Referral Lifecycle:**
   - `pending`: Dispatched to receiving facility.
   - `acknowledged`: Receiving facility verifies intake packet receipt.
   - `accepted` / `scheduled`: Appointment booked at receiving center.
   - `overdue`: Auto-flagged if target completion date lapses.
   - `escalated`: Care coordinator triggers urgent referral liaison inquiry.
   - `completed`: Verified with clinical discharge and attendance documentation.

3. **Delayed Referral Escalation:**
   - Triggering escalation automatically logs audit record and schedules a high-priority outreach task on the coordinator queue.

---

## 4. Endpoints Implemented & Verified

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/followups` | List follow-up tasks with facility and status filters |
| `POST` | `/api/followups` | Create follow-up task manually |
| `POST` | `/api/followups/:id/attempts` | Log contact attempt with channel, outcome, and barrier |
| `PATCH` | `/api/followups/:id` | Update status, outcome notes, and completion duration |
| `GET` | `/api/referrals` | List referrals with facility and status filters |
| `POST` | `/api/referrals` | Create inter-facility specialty referral |
| `POST` | `/api/referrals/:id/acknowledge`| Receiving facility intake acknowledgment |
| `POST` | `/api/referrals/:id/escalate` | Escalate delayed referral with reason and auto-task |
| `POST` | `/api/referrals/:id/verify` | Verify completed referral with clinical notes |

---

## 5. Build & Test Verification

### Server Compilation & Build:
```bash
Set-Location E:\CarePathAI\server; npx tsc --noEmit; npm run build
# Exit code: 0
```

### Client Production Build:
```bash
Set-Location E:\CarePathAI\client; npm run build
# Exit code: 0
# ✓ built in 553ms
# dist/index.html                     0.45 kB │ gzip:   0.29 kB
# dist/assets/index-CUpll1Re.css     78.14 kB │ gzip:  11.91 kB
# dist/assets/index-BSwMs53j.js   1,137.83 kB │ gzip: 301.24 kB
```

### Automated Unit Verification:
- **Task Workflow:** Created `task-1795527410998-85x0` ➔ logged attempt (`reached`, barrier: `transportation`) ➔ transitioned to `in_progress` ➔ resolved as `completed` with duration `25 mins`.
- **Referral Workflow:** Selected `ref-001` ➔ `acknowledged` ➔ `escalated` (`Delayed booking past 14 days`) ➔ `completed` (`verified_completion_date` recorded).

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_7_NOTIFICATIONS_MULTILINGUAL_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Phase 7: Notifications & Multilingual Support Verification

**Date:** November 24, 2026  
**Status:** ✅ Fully Implemented and Verified  
**Project:** CarePath AI - AI-Powered Predictive Healthcare Continuity and Patient Recovery Network  
**Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*  

---

## 1. Overview of Delivered Features

Phase 7 delivers a comprehensive **Notifications and Multilingual Continuity Experience** supporting 8 major Indian languages:
1. **English (`en`)**
2. **Tamil (`ta` - தமிழ்)**
3. **Hindi (`hi` - हिन्दी)**
4. **Telugu (`te` - తెలుగు)**
5. **Malayalam (`ml` - മലയാളം)**
6. **Kannada (`kn` - ಕನ್ನಡ)**
7. **Bengali (`bn` - বাংলা)**
8. **Marathi (`mr` - मराठी)**

### Key Requirements Enforced:
1. **Complete Multilingual Dictionary:** All navigation items, stat cards, alerts, auth headers, and modal text translated into all 8 languages in `client/src/translations.ts`.
2. **Dynamic Language Switch Without Logout:** Switching language instantly re-renders the app with zero session drop or token invalidation.
3. **User Profile Persistence:** Preferred language is saved directly in the user profile state and synced to Supabase `user_profiles` table.
4. **Regional Fonts & Unicode Support:** Native Indian script typography supported across all interfaces with UTF-8 encoding.
5. **Locale-Aware Formatting:** `localeUtils.ts` formats dates and numbers using regional Intl formatters (`ta-IN`, `hi-IN`, `te-IN`, `ml-IN`, `kn-IN`, `bn-IN`, `mr-IN`).
6. **Bilingual Text & Safety Guarantee:**
   - Patient-entered notes and clinical notifications provide an optional **View English Original / View Translated** toggle button.
   - **Critical Clinical Safety Rule Enforced:** *Original clinical records are NEVER overwritten or replaced with machine translations. Clinical medical terminology is preserved intact.*
7. **Event-Driven Notifications:**
   - In-app notification center connected to actual application events:
     - New task assigned
     - Follow-up approaching / overdue
     - Activity overdue
     - Referral delayed
     - Referral acknowledged
     - Referral completed
     - High-priority care-gap alert
     - Task escalated
8. **HIPAA Data Minimization:** Notification messages contain operational alerts without transmitting unencrypted Protected Health Information (PHI).

---

## 2. Notification Center Capabilities (`NotificationsView.tsx`)

- **Categorized Tabs & Filter:** All alerts, Unread Only, Critical, Care Gaps, Referrals.
- **Unread Counter & Read Toggle:** Clear visual badges for unread status, with instant `markRead` trigger.
- **Role-Based Notification Delivery Preferences:**
  - Toggle High-Priority Care Gaps
  - Toggle Referral Status Updates
  - Toggle Coordinator Task Queue
- **Bilingual Switcher:** Each alert features a one-click button to view the English original or localized regional translation.

---

## 3. Build & Test Verification

### Server TypeScript Compilation & Build:
```bash
Set-Location E:\CarePathAI\server; npx tsc --noEmit; npm run build
# Exit code: 0
```

### Client TypeScript & Vite Production Build:
```bash
Set-Location E:\CarePathAI\client; npm run build
# Exit code: 0
# ✓ built in 556ms
# dist/index.html                     0.45 kB │ gzip:   0.29 kB
# dist/assets/index-BnvrK3rE.css     78.19 kB │ gzip:  11.93 kB
# dist/assets/index-C5mjwwRu.js   1,159.12 kB │ gzip: 306.85 kB
```

### Multi-Language Verification Summary:
- Verified translation keys present and consistent across all 8 languages in `client/src/translations.ts`.
- Verified `formatLocalizedDate` handles ISO timestamps for all Indian regional locales (`ta-IN`, `hi-IN`, etc.).
- Verified `getTranslatedNotification` maps event templates into regional titles and prefixes while preserving patient names and record identifiers.

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_8_PWA_OFFLINE_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Phase 8 Offline-First Progressive Web Application (PWA) Verification

## Overview
Phase 8 equips **CarePath AI** with an offline-first architecture for community health workers and clinicians operating in low-connectivity or intermittent network environments.

---

## 1. Core Implemented Architecture

### A. Progressive Web App (PWA) Core
- **Web App Manifest (`client/public/manifest.json`)**:
  - `name`: "CarePath AI - Predictive Patient Care Continuity & Recovery Network"
  - `short_name`: "CarePath AI"
  - `display`: `standalone`
  - `theme_color`: `#0891b2` (Cyan 600)
  - `background_color`: `#ffffff`
  - Shortcuts: Quick navigation to Patients (`/patients`) and Follow-up Tasks (`/tasks`).
  - Icons: Responsive 192x192 and 512x512 maskable SVG/PNG assets.
- **Service Worker (`client/public/sw.js`)**:
  - Cache name: `CarePath-v1-static`.
  - Strategy:
    - **Cache-First** with background stale-while-revalidate for static shell assets (`/`, `/index.html`, `/manifest.json`, styles, fonts).
    - **Network-First** for dynamic API requests (`/api/*`), failing gracefully to let IndexedDB capture offline mutations when connectivity is severed.
- **HTML & Mobile Meta Tags (`client/index.html`)**:
  - `apple-mobile-web-app-capable`: `yes`
  - `apple-mobile-web-app-status-bar-style`: `default`
  - `theme-color`: `#0891b2`
  - Automated service worker registration upon `window.load`.

---

### B. Client-Side Offline Storage & Sync Queue
- **IndexedDB Storage Service (`client/src/services/offlineQueue.ts`)**:
  - Database: `CarePath_offline_db` (Version 1).
  - Object Stores:
    - `sync_queue`: Captures outgoing operations with structure:
      - `operation_id`: Cryptographic UUID (v4).
      - `idempotency_key`: Unique key formatted as `entity_id-action_type-timestamp`.
      - `entity_type`: `'pathway_step'` | `'followup_task'` | `'patient_note'`.
      - `entity_id`: UUID of the target resource.
      - `action_type`: `'UPDATE_ACTIVITY_STATUS'`, `'LOG_CONTACT_ATTEMPT'`, `'UPDATE_FOLLOWUP_TASK'`.
      - `base_version`: Integer tracking the base revision known to the client.
      - `operation_timestamp`: ISO 8601 string.
      - `payload`: Exact mutation parameters.
      - `status`: `'pending'` | `'syncing'` | `'synced'` | `'failed'` | `'conflict'`.
      - `retry_count`: Incremented on network failures.
    - `local_mutations`: Ephemeral client cache for offline display.
  - Safe Caching Constraint: Never indiscriminately caches full sensitive patient medical records or PHI in raw local storage.

---

### C. Backend Batch Synchronization & Conflict Engine
- **Endpoint**: `POST /api/sync/batch` (`server/src/index.ts`):
  - **Permission & Facility Authorization Check**:
    - Validates caller authentication token and permissions (`activity:update` or `followup:write`).
    - Enforces facility-level boundary rules ensuring operations only affect entities belonging to the user's facility.
  - **Idempotency Deduplication**:
    - Deduplicates redundant re-transmissions using `idempotency_key`. If an operation was already committed, the server safely responds with `success: true, duplicate: true` without re-executing.
  - **Version Conflict Detection**:
    - Compares `base_version` and operation timestamp against the server-side `updated_at` / `last_modified` timestamp.
    - **Non-Silent Resolution**: If newer server data exists (`server_updated_at > op.operation_timestamp`), returns a clear structured conflict error (`CONFLICT_NEWER_DATA_EXISTS`) along with current server state. Never silently overwrites newer server changes.
  - **Audit Logging**:
    - Each applied batch operation appends to the immutable audit trail with `actor_id`, `offline_operation_id`, and `operation_type`.

---

### D. Offline Modals & Status Indicators
- **Real-Time Sync Indicator (`client/src/components/pwa/SyncIndicator.tsx`)**:
  - Embedded in top navbar (`TopNavbar.tsx`).
  - Displays live states:
    - **Online**: Green indicator badge.
    - **Offline**: Amber offline banner notifying user that changes are queued locally.
    - **Synchronizing**: Animated spinner indicating batch sync in progress.
    - **Sync Completed**: Green badge notifying that all pending records synced.
    - **Sync Failed**: Red indicator with retry button.
    - **Conflict Requiring Review**: Warning badge opening the Conflict Resolution dialog.
  - Modal details:
    - Inspect pending queue items.
    - View conflict details (server state vs. offline state).
    - Manual "Sync Now" button.
    - Safe option to dismiss resolved operations.
- **Offline Fallbacks in Action Modals**:
  - `ActivityDetailModal.tsx`:
    - Checks `navigator.onLine`. If offline or on network failure, enqueues `UPDATE_ACTIVITY_STATUS` to IndexedDB and notifies user with an offline confirmation badge.
  - `FollowupTaskModal.tsx`:
    - Checks `navigator.onLine`. If offline or on network failure, enqueues `LOG_CONTACT_ATTEMPT` or `UPDATE_FOLLOWUP_TASK` to IndexedDB without blocking healthcare worker workflow.

---

## 2. Verification Checklist

| Requirement | Implementation Status | Evidence / Location |
| :--- | :---: | :--- |
| **PWA Manifest** | Verified | `client/public/manifest.json` |
| **Service Worker** | Verified | `client/public/sw.js` (Cache-first static, Network-first API) |
| **Installable Mobile Experience** | Verified | `client/index.html` meta tags & standalone display |
| **IndexedDB Offline Queue** | Verified | `client/src/services/offlineQueue.ts` |
| **Offline Task & Activity Updates** | Verified | `ActivityDetailModal.tsx` & `FollowupTaskModal.tsx` |
| **Unique Operation & Idempotency Keys** | Verified | UUID generation + `entity_id-action_type-timestamp` |
| **Automatic & Manual Synchronization** | Verified | Auto on `window.online` + "Sync Now" in `SyncIndicator.tsx` |
| **Backend Permission & Facility Check** | Verified | `POST /api/sync/batch` in `server/src/index.ts` |
| **Version Conflict Detection** | Verified | Non-silent conflict rejection if server has newer data |
| **Sync Status Indicators** | Verified | Online, Offline, Synchronizing, Completed, Failed, Conflict |
| **Preserve Clinical Privacy** | Verified | Only approved minimal task/status payloads in IndexedDB |
| **Build Integrity** | Verified | TypeScript 0 errors; Vite bundle output verified |

---


<!-- ========================================== -->
<!-- SOURCE FILE: PHASE_9_REPORTS_ANALYTICS_VERIFICATION.md -->
<!-- ========================================== -->

# CarePath AI - Phase 9 Reports & Administrator Analytics Verification

## Overview
Phase 9 delivers a comprehensive healthcare analytics and institutional administration system for **CarePath AI**. It aggregates real database information across facilities, calculates operational care continuity and referral quality metrics, allows exporting CSV/PDF reports, and provides an administrator portal for user management, facility management, and regulatory audit trail inspection.

---

## 1. Core Implemented Modules

### A. Admin Dashboard Metrics
The administrative dashboard aggregates live database state:
- **Total Facilities**: Registered hospital and regional centers.
- **Total Registered Patients**: Filtered by active facility or aggregated across the network for administrators.
- **Active Care Journeys**: Count of non-completed patient pathways.
- **Completed Journeys**: Full longitudinal pathway completions.
- **Pending Activities**: Clinical steps in `pending` or `in_progress` status.
- **Overdue Referrals**: Cross-facility referrals exceeding target completion dates or marked overdue.
- **Follow-up Completion Rate**: Percentage of scheduled follow-up tasks completed.
- **Open Care-Gap Alerts**: Real-time unresolved risk alerts generated by rules and predictive models.

---

### B. Interactive Healthcare Analytics & Charts (`ReportsView.tsx`)
- **Patient Registration Trends**: Monthly enrollment growth curve with KaTeX/Recharts area visualization.
- **Daily Operational Activity Performance**: Interactive stacked bar chart displaying `Completed`, `Pending`, and `Overdue` activities by day.
- **Activity Status Breakdown**: Donut chart detailing operational progression through workflow stages.
- **Care-Gap Category Distribution**: Progress bars and proportional breakdown of continuity barriers (missed appointments, transportation, medicine collection delays).
- **Referral Liaison Performance**: Status cards displaying total, completed, acknowledged, overdue, and escalated inquiries.
- **Facility-Level Comparisons**: Dynamic benchmarking table comparing:
  - Facility Name and Facility Code
  - Patient Load
  - Active Care Journeys
  - Follow-up Performance Rate (%)
  - Open Care Gaps

---

### C. Multiformat Report Export Engine
Users can select and export verified reports:
- **Report Types**:
  1. Patient Journey Report
  2. Referral Status Report
  3. Follow-up Performance Report
  4. Facility Performance Report
  5. AI Care-Gap Report
- **CSV Export**: Clean downloadable CSV formatting using client-side blob generation.
- **PDF Export**: Print-ready formatted clinical audit documents.

---

### D. Institutional Administration & Governance (`SettingsView.tsx`)
- **User & Role Management**:
  - View authorized personnel and their assigned facility.
  - Register new clinical staff with roles: `Doctor`, `Healthcare Worker`, `Facility Administrator`, `System Administrator`.
  - Assign staff to institutional facilities.
- **Facility Management**:
  - Register new hospital networks and community care centers.
  - Track facility codes (`SJM-CENTRAL`, `HVC-NORTH`), addresses, and contact info.
- **Audit Logs View**:
  - Immutable trace of all events (`created_at`, `action`, `entity_name`, `entity_id`, `user_id`).
  - Facility-level access isolation: Facility admins view only their own facility logs; System Admins view network logs.
- **Notification Settings**:
  - Toggle dispatch rules for high-priority care gaps, delayed referrals, overdue tasks, and supervisor escalations.
- **Preferences**:
  - Theme toggling (Light / Dark).
  - RBAC status verification.

---

## 2. API Endpoints Created / Extended

| Endpoint | Method | Role Permissions | Description |
| :--- | :---: | :---: | :--- |
| `/api/analytics` | `GET` | Authenticated | Aggregates stats, registration trend, activity trend, gap categories, referral status, and facility benchmarks with facility boundary filtering |
| `/api/admin/users` | `GET`, `POST` | `administrator`, `facility_administrator` | List and register clinical users within facility scope |
| `/api/admin/users/:id` | `PATCH` | `administrator`, `facility_administrator` | Update user roles and status |
| `/api/admin/facilities` | `GET` | Authenticated | List authorized facilities |
| `/api/admin/facilities` | `POST` | `administrator` | Register new hospital or clinic |
| `/api/admin/facilities/:id` | `PATCH` | `administrator`, `facility_administrator` | Update facility details |
| `/api/audit-logs` | `GET` | Admins & Coordinators | Read regulatory audit trail with facility filtering |

---

## 3. Verification Checklist

| Requirement | Implementation Status | Evidence / Location |
| :--- | :---: | :--- |
| **Total facilities & registered patients** | Verified | `DataStore.getAnalyticsData()` & `ReportsView.tsx` |
| **Active/Completed care journeys** | Verified | Live query on `this.pathways` |
| **Pending & overdue activities** | Verified | Live query on `this.steps` with overdue time math |
| **Overdue referrals & follow-up rate** | Verified | Calculated from `this.referrals` & `this.followups` |
| **Interactive Registration Trend Chart** | Verified | Recharts `AreaChart` in `ReportsView.tsx` |
| **Daily/Monthly Activity Chart** | Verified | Recharts `BarChart` (completed vs pending vs overdue) |
| **Care-gap category distribution** | Verified | Progress bars & categorization in `ReportsView.tsx` |
| **Facility-level comparisons** | Verified | Benchmark comparison table in `ReportsView.tsx` |
| **Date & Facility Filters** | Verified | Wired to TopNavbar `selectedFacility` & `selectedDateRange` |
| **CSV & PDF Export** | Verified | `handleExportCSV` & `handleExportPDF` in `ReportsView.tsx` |
| **User & Role Administration** | Verified | `SettingsView.tsx` subtab with user creation modal |
| **Facility Administration** | Verified | `SettingsView.tsx` subtab with facility registration modal |
| **Audit Log Trace** | Verified | `SettingsView.tsx` table querying `/api/audit-logs` |
| **Notification Dispatch Rules** | Verified | Interactive toggles in `SettingsView.tsx` |
| **Cross-facility Data Isolation** | Verified | Enforced in `/api/analytics`, `/api/admin/users`, `/api/audit-logs` |
| **Compilation & Build** | Verified | TypeScript 0 errors, Vite bundle builds successfully |

---
