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
