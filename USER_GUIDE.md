# CarePath AI - User Guide & Workflow Manual

> **Tagline:** *Every Patient Matters. Every Treatment Journey Counts.*

CarePath AI is an AI-powered predictive healthcare continuity and recovery platform designed for hospitals, care coordinators, community health workers, and patients.

---

## 🚀 1. How to Run the Project

Open **3 separate terminal windows** (PowerShell or Bash) in the project root:

### Terminal 1: Python ML Prediction Microservice (FastAPI + Scikit-Learn)
```powershell
Set-Location e:\CarePathAI\ml-service
python -m uvicorn main:app --reload --port 8000
```
- **Port:** `http://127.0.0.1:8000`
- **Interactive API Docs (Swagger):** `http://127.0.0.1:8000/docs`

### Terminal 2: Node.js Express Backend Service
```powershell
Set-Location e:\CarePathAI\server
npm run dev
```
- **Port:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

### Terminal 3: React Vite Client Application
```powershell
Set-Location e:\CarePathAI\client
npm run dev
```
- **Application URL:** `http://localhost:5173`

---

## 🔑 2. User Accounts & Persona Logins

When accessing `http://localhost:5173`, click **"Get Started"** or **"Login"**. You can use pre-configured institutional test credentials:

| Clinical Role | Email | Privileges |
| :--- | :--- | :--- |
| **Physician / Doctor** | `dr.sarah.jenkins@CarePath.local` | Clinical consultations, lab reviews, referral orders |
| **Care Coordinator** | `elena.rostova@CarePath.local` | Patient onboarding, outreach tasks, AI gap reviews |
| **Facility Administrator** | `marcus.admin@CarePath.local` | Multi-facility analytics, user RBAC, audit logs |
| **Nurse / Community Worker** | `amara.chen@CarePath.local` | Patient check-ins, offline activity logging |

*(In development mode, any password will authenticate the selected persona).*

---

## 📱 3. Step-by-Step Feature Walkthrough

### A. Patient Registration & Printable Card
1. Click **"Patients"** in the sidebar.
2. Click **"Register Patient"** in the top-right corner.
3. Fill in:
   - First Name & Last Name
   - Date of Birth & Gender
   - Contact Telephone (or note if patient has no phone)
   - Preferred Language (8 Indian regional languages supported)
   - Informed Consent Status (`granted`, `pending`, `revoked`)
   - Registration Purpose (e.g. *Post-operative Cardiac Care*, *DOTS protocol*)
4. **Duplicate Detection:** As you type, the system checks for existing records to prevent fragmented patient histories.
5. Click **"Generate ID & Onboard Patient"**:
   - An official Reference ID is generated (e.g., `CLP-2026-1001`).
   - A **Printable Patient Card with QR Code** is displayed.
   - Click **"Print Patient Card"** to print or save a PDF counter card.

---

### B. Patient Care Journeys & Activity Timelines
1. Open any patient profile (e.g. *Anand Sharma*) and select the **"Care Journey"** tab.
2. View the visual 8-stage pathway:
   *Registration → Consultation → Investigation → Referral → Medicine Collection → Follow-up → Recovery Check → Completion*.
3. Click on any activity card to:
   - Update status (`In Progress`, `Pending`, `Completed`, `Overdue`).
   - Log clinical notes.
   - Attach mock laboratory PDF reports or discharge slips.

---

### C. AI Care-Gap Intelligence & Review
1. Click **"AI Care-Gap Intelligence"** in the sidebar.
2. Review identified care bottlenecks combining:
   - **Deterministic Rule Score (0–100):** Transparent penalties for missed consultations (+20), overdue referrals (+25), or transit barriers (+15).
   - **Machine Learning 7-Day Gap Probability:** Random Forest prediction from the Python FastAPI microservice.
3. Click **"Explain Gap & Generate Plan"**:
   - Google Gemini translates clinical features into plain language.
   - Generates suggested administrative follow-up actions.
4. Clinicians click **"Accept & Create Follow-up Task"** or **"Modify / Dismiss"** (Human-in-the-Loop safety).

---

### D. Follow-up Tasks & Barrier Management
1. Click **"Follow-up Tasks"** in the sidebar.
2. Open any task and click **"Log Contact Attempt"**:
   - Select contact channel (*Phone call, SMS, Home visit*).
   - Record systemic barriers (*Transportation, Appointment availability, Language, Financial*).
   - Tasks with critical barriers are highlighted for supervisor escalation.

---

### E. Referrals & Inter-Facility Coordination
1. Click **"Referrals"** in the sidebar.
2. Track patient transfers between *St. Jude Metropolitan Health Center* and *Highland Valley Hospital*.
3. Receiving facilities click **"Acknowledge Referral"** to confirm intake.
4. Inquiries delayed past 48 hours can be escalated with one click.

---

### F. Multilingual & Theme Customization
- **Language Switcher:** In the top navigation bar, toggle between **English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളം), Kannada (ಕನ್ನಡ), Bengali (বাংলা), and Marathi (मराठी)** without logging out.
- **Theme Switcher:** Click the Sun/Moon icon for instant Light and Dark appearance modes.

---

### G. Offline-First Progressive Web App (PWA) Testing
1. In the top navbar, observe the live **Sync Indicator** (shows `Online`).
2. Disconnect your network or toggle `Offline` in browser DevTools (*F12 → Network → Offline*).
3. The badge turns amber (`Offline`).
4. Update an activity status or complete a follow-up task:
   - The operation is saved to IndexedDB (`CarePath_offline_db`).
5. Reconnect to the internet:
   - The sync badge displays `Synchronizing` and commits queued operations via `POST /api/sync/batch`.
   - Idempotency checks prevent duplicate server writes.

---

### H. Reports & Institutional Analytics
1. Click **"Reports and Analytics"** in the sidebar.
2. Inspect real-time charts:
   - Monthly Patient Registration Growth.
   - Weekly Operational Activities (Completed vs Pending vs Overdue).
   - Care-Gap Category Distribution.
   - Cross-Facility Performance Comparison Table.
3. Select a report (e.g. *Patient Journey Report*, *Referral Report*, *AI Care-Gap Report*):
   - Click **"Export CSV"** for spreadsheet analysis.
   - Click **"Export PDF"** for print-ready compliance documents.

---

### I. Patient & Family Public Portal (No Account Required)
1. Log out or open `http://localhost:5173` in a Private / Incognito browser tab.
2. Click the **"Patient & Family Portal"** button.
3. **Lookup Existing Records:**
   - Enter Reference ID (MRN): `CLP-2026-1001`
   - Enter Verification Phone or DOB: `1978-04-12` (or registered phone number).
   - Patients can view upcoming clinic appointments and hospital contact lines without passwords or smartphone apps.
4. **Self-Registration:** Patients or caregivers can self-register from home or kiosk computers.

---

## 🛠️ 4. Tech Stack Summary

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite PWA.
- **Backend:** Node.js, Express, TypeScript, Supabase / PostgreSQL.
- **Machine Learning:** Python 3.14, FastAPI, Scikit-learn (Random Forest), Pandas, NumPy.
- **AI Explainability:** Google Gemini API (structured administrative assistance only; strictly non-diagnostic).
- **Offline Storage:** IndexedDB with version conflict detection and idempotency key deduplication.
