export interface Facility {
  id: string;
  name: string;
  facility_code: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
}

export type UserRole = 
  | 'system_admin'
  | 'facility_admin'
  | 'care_coordinator'
  | 'physician'
  | 'nurse'
  | 'navigator';

export interface UserProfile {
  id: string;
  facility_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  is_active: boolean;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Patient {
  id: string;
  facility_id: string;
  mrn: string; // Unique Patient Reference ID e.g. CLP-2026-XXXX
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  primary_language: string;
  risk_level: RiskLevel;
  continuity_score: number;
  consent_status: 'granted' | 'revoked' | 'pending';
  registration_date: string;
  care_status: 'active' | 'in_recovery' | 'completed' | 'paused';
  registration_purpose?: string;
  registered_by_staff_id?: string;
  registered_by_staff_name?: string;
  registration_channel?: 'staff_dashboard' | 'assisted_caregiver' | 'patient_self_portal' | 'offline_sync';
}

export interface CareProtocol {
  id: string;
  facility_id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  target_duration_days: number;
  is_active: boolean;
}

export type JourneyStageType =
  | 'patient_registration'
  | 'consultation'
  | 'investigation_lab'
  | 'referral'
  | 'medicine_collection'
  | 'followup_appointment'
  | 'recovery_followup'
  | 'journey_completion';

export type ActivityStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'pending' 
  | 'completed' 
  | 'overdue' 
  | 'cancelled';

export interface SupportingDocument {
  id: string;
  name: string;
  url: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface PathwayStep {
  id: string;
  pathway_id: string;
  milestone_id?: string;
  stage_type: JourneyStageType;
  title: string;
  activity_type: string;
  due_date: string;
  completed_date?: string;
  status: ActivityStatus;
  is_mandatory: boolean;
  notes?: string;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  supporting_documents?: SupportingDocument[];
  verification_source?: string;
  updated_at?: string;
}

export interface PatientPathway {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_mrn?: string;
  protocol_id: string;
  protocol_name?: string;
  title?: string;
  assigned_coordinator_id?: string;
  primary_physician_id?: string;
  facility_id: string;
  status: 'active' | 'paused' | 'completed' | 'discontinued' | 'lost_to_followup';
  start_date: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  overall_progress_pct: number;
  current_continuity_score: number;
  steps?: PathwayStep[];
}

export interface CareGap {
  id: string;
  facility_id: string;
  patient_id: string;
  patient_name?: string;
  patient_mrn?: string;
  pathway_id?: string;
  step_id?: string;
  title: string;
  description: string;
  gap_type: string;
  severity: RiskLevel;
  ml_confidence_score: number;
  risk_factors: string[];
  ai_generated_explanation?: string;
  suggested_action?: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;

  // Phase 5 Additions:
  rule_based_score?: number; // 0-100
  rule_category?: 'low' | 'medium' | 'high';
  rule_contributing_factors?: { factor: string; points: number; description: string }[];
  ml_predicted_gap_7d?: boolean;
  ml_gap_probability?: number; // 0.0 - 1.0
  assessment_timestamp?: string;
  review_status?: 'pending_review' | 'accepted' | 'modified' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

export type FollowupTaskStatus = 
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'waiting_for_response'
  | 'completed'
  | 'escalated'
  | 'cancelled';

export type BarrierCategory = 
  | 'transportation'
  | 'appointment_availability'
  | 'communication_difficulty'
  | 'financial_access'
  | 'other';

export interface ContactAttempt {
  id: string;
  timestamp: string;
  worker_id: string;
  worker_name: string;
  channel: 'phone' | 'sms' | 'home_visit' | 'portal';
  outcome: 'reached' | 'voicemail' | 'no_answer' | 'number_disconnected' | 'family_contacted';
  notes?: string;
  recorded_barrier?: BarrierCategory;
  barrier_details?: string;
}

export interface FollowupTask {
  id: string;
  facility_id: string;
  patient_id: string;
  patient_name?: string;
  patient_mrn?: string;
  gap_id?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  title: string;
  instructions: string;
  priority: RiskLevel;
  status: FollowupTaskStatus;
  due_date: string;
  completed_at?: string;
  completion_time_minutes?: number;
  outcome_notes?: string;
  contact_method: string;
  attempt_count: number;
  contact_attempts?: ContactAttempt[];
  recorded_barriers?: BarrierCategory[];
  barrier_notes?: string;
  created_at: string;
  updated_at?: string;
}

export type ReferralStatus =
  | 'pending'
  | 'acknowledged'
  | 'accepted'
  | 'scheduled'
  | 'completed'
  | 'overdue'
  | 'escalated'
  | 'cancelled';

export interface CareReferral {
  id: string;
  facility_id: string; // referring facility
  referring_facility_name?: string;
  receiving_facility_id: string;
  referred_to_facility: string; // receiving facility name
  patient_id: string;
  patient_name?: string;
  patient_mrn?: string;
  specialty: string;
  referral_reason: string;
  referral_date: string;
  target_completion_date: string;
  acknowledged_date?: string;
  acknowledged_by?: string;
  status: ReferralStatus;
  notes?: string;
  is_overdue: boolean;
  is_escalated?: boolean;
  escalated_date?: string;
  escalation_reason?: string;
  verified_completion_date?: string;
  verified_by?: string;
  recorded_barriers?: BarrierCategory[];
  created_at?: string;
}

export interface AuditLog {
  id: string;
  facility_id?: string;
  user_id?: string;
  action: string;
  entity_name: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
