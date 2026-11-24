export type DashboardTab = 
  | 'overview'
  | 'patients'
  | 'care_journeys'
  | 'care_activities'
  | 'referrals'
  | 'ai_care_gaps'
  | 'followup_tasks'
  | 'notifications'
  | 'reports'
  | 'settings';

export interface CareReferral {
  id: string;
  facility_id: string;
  patient_id: string;
  patient_name?: string;
  referred_to_facility: string;
  specialty: string;
  referral_date: string;
  target_completion_date: string;
  status: 'pending' | 'accepted' | 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  notes?: string;
  is_overdue: boolean;
}

export interface UserNotification {
  id: string;
  facility_id: string;
  user_id?: string;
  title: string;
  message: string;
  category: 'care_gap' | 'referral' | 'outreach' | 'system';
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}

export interface OverviewStats {
  totalRegisteredPatients: number;
  activeCareJourneys: number;
  pendingActivities: number;
  overdueReferrals: number;
  pendingFollowupTasks: number;
  completedFollowupTasks: number;
  highPriorityCareGaps: number;
  criticalCareGaps: number;
  facilityContinuityIndex: number;
  continuityTrend: { date: string; continuityScore: number; recoveredCount: number }[];
  gapTypeDistribution: { type: string; count: number }[];
  statusBreakdown: { status: string; count: number; color: string }[];
  recentActivities: {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    patientName: string;
    category: string;
    status: 'success' | 'warning' | 'alert';
  }[];
}
