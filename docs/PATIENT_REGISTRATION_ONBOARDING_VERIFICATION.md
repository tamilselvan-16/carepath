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
