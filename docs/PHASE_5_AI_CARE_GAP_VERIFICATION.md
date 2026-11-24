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
