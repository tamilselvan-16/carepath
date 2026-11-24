-- CarePath AI: Synthetic Seed Data for Local Development & Demonstrations
-- All data is completely synthetic and adheres to HIPAA de-identification standards

-- Clear existing data if needed (cascade safe)
TRUNCATE audit_logs, followup_tasks, care_gaps, pathway_steps, patient_pathways, protocol_milestones, care_protocols, patient_consents, patients, user_profiles, facilities CASCADE;

-- 1. Facilities
INSERT INTO facilities (id, name, facility_code, address, contact_phone, contact_email)
VALUES
('a0000000-0000-0000-0000-000000000001', 'St. Jude Metropolitan Health Center', 'SJM-CENTRAL', '452 Medical Parkway, Boston, MA 02115', '+1-617-555-0190', 'continuity@stjudemetro.org'),
('a0000000-0000-0000-0000-000000000002', 'Highland Valley Community Hospital', 'HVC-NORTH', '108 Valley View Road, Denver, CO 80202', '+1-303-555-0144', 'careteam@highlandvalley.org');

-- 2. User Profiles
INSERT INTO user_profiles (id, facility_id, full_name, email, role, department, phone)
VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Dr. Sarah Jenkins, MD', 'dr.sarah.jenkins@CarePath.local', 'physician', 'Cardiology', '+1-617-555-0201'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Elena Rostova, RN', 'elena.rostova@CarePath.local', 'care_coordinator', 'Care Continuity Unit', '+1-617-555-0202'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Marcus Vance', 'marcus.vance@CarePath.local', 'facility_admin', 'Administration', '+1-617-555-0200')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (id, facility_id, full_name, email, role, department, phone)
VALUES
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Marcus Vance', 'marcus.admin@CarePath.local', 'facility_admin', 'Administration', '+1-617-555-0200'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Amara Chen, BSN', 'amara.chen@CarePath.local', 'navigator', 'Patient Navigation', '+1-617-555-0204');

-- 3. Care Protocols
INSERT INTO care_protocols (id, facility_id, name, code, category, description, target_duration_days)
VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Post-Percutaneous Coronary Intervention (PCI) Recovery', 'CARD-PCI-REC-90', 'Surgical Recovery', 'Comprehensive 90-day multi-stage recovery pathway for post-stent cardiac patients with medication adherence and cardiac rehab monitoring.', 90),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Type 2 Diabetes Mellitus Intensive Continuity', 'ENDO-T2D-INT-180', 'Chronic Disease', '180-day pathway targeting HbA1c control, quarterly microvascular checks, podiatry and diabetic education compliance.', 180),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Total Knee Arthroplasty (TKA) Post-Op Care', 'ORTHO-TKA-POST-60', 'Surgical Recovery', '60-day orthopedic recovery covering physical therapy milestones, wound assessment, and pain management tapering.', 60);

-- 4. Protocol Milestones for PCI Protocol
INSERT INTO protocol_milestones (id, protocol_id, step_order, title, description, offset_days, tolerance_days, activity_type, is_mandatory)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 1, 'Post-Discharge 48-Hour Phone Outreach', 'Coordinator checks dual-antiplatelet therapy, puncture site status, and vital signs.', 2, 1, 'Coordinator Call', true),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 2, '2-Week Clinical Follow-up & ECG', 'Cardiology outpatient visit, 12-lead ECG, and medication tolerance assessment.', 14, 3, 'Physician Followup', true),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 3, 'Cardiac Rehab Enrollment & First Session', 'Initiate Phase II outpatient supervised cardiac rehabilitation program.', 28, 7, 'Rehab Check-in', true),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 4, 'Day 45 Lipid Profile & Kidney Function Panel', 'Fasting lipid panel (LDL, HDL, Triglycerides), Serum Creatinine and eGFR.', 45, 5, 'Lab Test', true),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 5, 'Day 90 Comprehensive Cardiology Review', 'Final 90-day recovery evaluation, echo review if needed, ongoing prevention plan.', 90, 10, 'Physician Followup', true);

-- 5. Patients
INSERT INTO patients (id, facility_id, mrn, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, primary_language, risk_level, continuity_score)
VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'MRN-2026-9102', 'Robert', 'Miller', '1962-04-12', 'Male', '+1-617-555-7812', 'robert.miller@example.org', '74 Beacon Hill St, Boston, MA', 'Martha Miller (Spouse)', '+1-617-555-7813', 'English', 'high', 62.50),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'MRN-2026-8841', 'Maria', 'Santos', '1975-09-23', 'Female', '+1-617-555-4309', 'maria.santos@example.org', '120 Dorchester Ave, Boston, MA', 'Carlos Santos (Brother)', '+1-617-555-4310', 'Spanish', 'moderate', 78.00),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'MRN-2026-7733', 'Arthur', 'Pendleton', '1954-11-03', 'Male', '+1-617-555-9128', 'arthur.p@example.org', '33 Cambridge St, Cambridge, MA', 'Clara Pendleton (Daughter)', '+1-617-555-9129', 'English', 'critical', 41.20),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'MRN-2026-6190', 'Amina', 'Khatib', '1983-02-17', 'Female', '+1-617-555-6622', 'amina.k@example.org', '89 Somerville Ave, Somerville, MA', 'Tariq Khatib (Spouse)', '+1-617-555-6623', 'Arabic', 'low', 95.00);

-- 6. Patient Consents
INSERT INTO patient_consents (patient_id, consent_type, status, consent_notes)
VALUES
('e0000000-0000-0000-0000-000000000001', 'care_coordination', 'granted', 'Consented to automated reminders and phone coordination.'),
('e0000000-0000-0000-0000-000000000001', 'ai_assisted_continuity', 'granted', 'Consented to continuity tracking and predictive gap alerts.'),
('e0000000-0000-0000-0000-000000000002', 'care_coordination', 'granted', 'Prefers communications in Spanish when possible.'),
('e0000000-0000-0000-0000-000000000003', 'care_coordination', 'granted', 'Authorized daughter Clara to act as care liaison.');

-- 7. Patient Pathways
INSERT INTO patient_pathways (id, patient_id, protocol_id, assigned_coordinator_id, primary_physician_id, facility_id, status, start_date, expected_completion_date, overall_progress_pct, current_continuity_score)
VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'active', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE + INTERVAL '55 days', 40.00, 62.50),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'active', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '80 days', 20.00, 85.00),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'active', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE + INTERVAL '40 days', 25.00, 41.20);

-- 8. Pathway Steps for Robert Miller
INSERT INTO pathway_steps (pathway_id, milestone_id, title, activity_type, due_date, completed_date, status, is_mandatory, notes, verification_source)
VALUES
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Post-Discharge 48-Hour Phone Outreach', 'Coordinator Call', CURRENT_DATE - INTERVAL '33 days', CURRENT_DATE - INTERVAL '33 days', 'completed', true, 'Patient confirmed starting Ticagrelor and Aspirin.', 'Coordinator Call'),
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '2-Week Clinical Follow-up & ECG', 'Physician Followup', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days', 'completed', true, 'ECG normal sinus rhythm. No chest pain reported.', 'EHR Sync'),
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Cardiac Rehab Enrollment & First Session', 'Rehab Check-in', CURRENT_DATE - INTERVAL '7 days', NULL, 'overdue', true, 'Patient missed scheduled intake session. Transport issues noted.', 'Clinic Log'),
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Day 45 Lipid Profile & Kidney Function Panel', 'Lab Test', CURRENT_DATE + INTERVAL '10 days', NULL, 'scheduled', true, 'Requisition sent to Quest Diagnostics.', 'EHR Sync'),
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Day 90 Comprehensive Cardiology Review', 'Physician Followup', CURRENT_DATE + INTERVAL '55 days', NULL, 'scheduled', true, 'Pending completion of milestone labs.', 'EHR Sync');

-- 9. Care Gaps
INSERT INTO care_gaps (id, facility_id, patient_id, pathway_id, title, description, gap_type, severity, ml_confidence_score, risk_factors, ai_generated_explanation, suggested_action)
VALUES
('g0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001',
'Cardiac Rehab Session Overdue (>7 days)',
'Patient Robert Miller has not attended the required Phase II Cardiac Rehab intake session scheduled for 7 days ago.',
'Overdue Appointment',
'high',
0.87,
'["Missed intake appointment", "Patient lives 14 miles from rehab center", "Previous non-attendance on record"]'::jsonb,
'AI Continuity Analysis: Failure to engage in cardiac rehabilitation within 4 weeks post-PCI increases secondary readmission vulnerability by an estimated 34% within 180 days. A proactive transport coordination call is recommended.',
'Contact patient to arrange community transit voucher or reschedule to an affiliated suburban facility.'),

('g0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003',
'Critical Lost-to-Followup Risk & Overdue Multi-Step Care',
'Arthur Pendleton has missed 2 consecutive clinical check-ins and laboratory requests remain uncollected.',
'Lost Contact Risk',
'critical',
0.94,
'["Multiple consecutive missed milestones", "No response to automated SMS", "Advanced age (>70) with solitary living situation"]'::jsonb,
'AI Continuity Analysis: Pattern matches high-probability care journey breakdown. Patient is at critical risk of emergency readmission due to unmonitored antiplatelet therapy and renal indicators.',
'Initiate direct care coordinator phone outreach to designated family surrogate (Clara Pendleton) and dispatch community nurse.');

-- 10. Follow-up Tasks
INSERT INTO followup_tasks (id, facility_id, patient_id, gap_id, assigned_to, title, instructions, priority, status, due_date, contact_method, attempt_count)
VALUES
('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001',
'b0000000-0000-0000-0000-000000000002', 'Outreach: Reschedule Cardiac Rehab for Robert Miller',
'Call Mr. Miller. Assess if transit assistance or virtual home-monitored rehab option is needed. Log outcome.',
'high', 'pending', CURRENT_DATE, 'phone', 1),

('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000002',
'b0000000-0000-0000-0000-000000000004', 'Emergency Liaison Outreach: Arthur Pendleton Family Contact',
'Contact daughter Clara Pendleton (+1-617-555-9129). Confirm patient health status and coordinate urgent follow-up appointment.',
'critical', 'pending', CURRENT_DATE, 'phone', 0);
