import type { PathwayStep, CareReferral, FollowupTask, RiskLevel } from './types';

export interface CareGapRuleWeights {
  missed_appointment: number; // +20
  overdue_pending_referral: number; // +25
  overdue_followup: number; // +20
  recorded_transportation_barrier: number; // +15
  overdue_medicine_collection: number; // +10
  repeated_incomplete_activities: number; // +10
}

export const DEFAULT_PROTOTYPE_WEIGHTS: CareGapRuleWeights = {
  missed_appointment: 20,
  overdue_pending_referral: 25,
  overdue_followup: 20,
  recorded_transportation_barrier: 15,
  overdue_medicine_collection: 10,
  repeated_incomplete_activities: 10
};

export interface RuleScoringBreakdown {
  score: number; // 0 to 100
  category: 'low' | 'medium' | 'high';
  factors: {
    factor: string;
    points: number;
    description: string;
  }[];
  is_capped: boolean;
  disclaimer: string;
}

/**
 * Calculates deterministic rule-based operational care-gap score.
 * Capped at 100.
 * Prototype categories: 0–29: Low, 30–59: Medium, 60–100: High.
 */
export function calculateRuleBasedCareGapScore(params: {
  activities: PathwayStep[];
  referrals: CareReferral[];
  followups: FollowupTask[];
  hasTransportationBarrier?: boolean;
  weights?: Partial<CareGapRuleWeights>;
}): RuleScoringBreakdown {
  const w = { ...DEFAULT_PROTOTYPE_WEIGHTS, ...params.weights };
  const factors: RuleScoringBreakdown['factors'] = [];
  let rawScore = 0;

  // 1. Missed appointment (+20)
  const missedAppointments = params.activities.filter(
    a => a.stage_type === 'consultation' || a.stage_type === 'followup_appointment'
  ).filter(a => a.status === 'overdue' || a.status === 'cancelled');

  if (missedAppointments.length > 0) {
    const pts = w.missed_appointment;
    rawScore += pts;
    factors.push({
      factor: 'Missed Appointment',
      points: pts,
      description: `${missedAppointments.length} scheduled clinical consultation or follow-up appointment missed or overdue`
    });
  }

  // 2. Overdue pending referral (+25)
  const overdueReferrals = params.referrals.filter(r => r.is_overdue || r.status === 'overdue');
  if (overdueReferrals.length > 0) {
    const pts = w.overdue_pending_referral;
    rawScore += pts;
    factors.push({
      factor: 'Overdue Pending Referral',
      points: pts,
      description: `${overdueReferrals.length} referral to specialty clinic overdue for verification`
    });
  }

  // 3. Overdue follow-up (+20)
  const overdueFollowups = params.followups.filter(
    f => (f.status === 'new' || f.status === 'assigned' || f.status === 'in_progress' || f.status === 'waiting_for_response') && new Date(f.due_date) < new Date()
  );
  if (overdueFollowups.length > 0) {
    const pts = w.overdue_followup;
    rawScore += pts;
    factors.push({
      factor: 'Overdue Follow-up Task',
      points: pts,
      description: `${overdueFollowups.length} outreach tasks pending past scheduled coordinator deadline`
    });
  }

  // 4. Recorded transportation barrier (+15)
  if (params.hasTransportationBarrier) {
    const pts = w.recorded_transportation_barrier;
    rawScore += pts;
    factors.push({
      factor: 'Recorded Transportation Barrier',
      points: pts,
      description: 'Documented transit deficit or vehicle access limitation'
    });
  }

  // 5. Overdue medicine collection (+10)
  const overdueMeds = params.activities.filter(
    a => a.stage_type === 'medicine_collection' && (a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date()))
  );
  if (overdueMeds.length > 0) {
    const pts = w.overdue_medicine_collection;
    rawScore += pts;
    factors.push({
      factor: 'Overdue Medicine Collection',
      points: pts,
      description: `${overdueMeds.length} pharmacy pickup or medication adherence verification pending past due date`
    });
  }

  // 6. Repeated incomplete activities (+10)
  const incompleteActivities = params.activities.filter(a => a.status === 'overdue' || a.status === 'cancelled' || a.status === 'pending');
  if (incompleteActivities.length >= 3) {
    const pts = w.repeated_incomplete_activities;
    rawScore += pts;
    factors.push({
      factor: 'Repeated Incomplete Activities',
      points: pts,
      description: `${incompleteActivities.length} total care journey activities currently incomplete or overdue`
    });
  }

  // Cap at 100
  const isCapped = rawScore > 100;
  const score = Math.min(100, rawScore);

  let category: 'low' | 'medium' | 'high' = 'low';
  if (score >= 60) category = 'high';
  else if (score >= 30) category = 'medium';

  return {
    score,
    category,
    factors,
    is_capped: isCapped,
    disclaimer: 'Prototype operational weights for continuity prioritization. Not a clinically validated diagnostic score.'
  };
}
