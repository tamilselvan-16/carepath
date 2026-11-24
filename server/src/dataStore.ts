import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { 
  initialFacilities, 
  initialUsers, 
  initialPatients, 
  initialProtocols, 
  initialPathways, 
  initialSteps, 
  initialCareGaps, 
  initialFollowups, 
  initialAuditLogs 
} from './mockData.js';
import { 
  Facility,
  Patient, 
  CareGap, 
  FollowupTask, 
  PatientPathway, 
  PathwayStep, 
  AuditLog, 
  RiskLevel,
  UserProfile, 
  JourneyStageType, 
  ActivityStatus, 
  SupportingDocument,
  FollowupTaskStatus,
  BarrierCategory,
  ContactAttempt,
  CareReferral,
  ReferralStatus
} from './types.js';

function maxSteps(count: number): number {
  return count > 0 ? count : 1;
}
import { UserNotification, DashboardOverviewStats } from './typesPhase2.js';
import { initialReferrals, initialNotifications } from './mockDataPhase2.js';

export class DataStore {
  private supabase: SupabaseClient | null = null;
  public isUsingSupabase = false;

  // In-memory collections
  public facilities = [...initialFacilities];
  public users = [...initialUsers];
  public patients = [...initialPatients];
  public protocols = [...initialProtocols];
  public pathways = [...initialPathways];
  public steps = [...initialSteps];
  public careGaps = [...initialCareGaps];
  public followups = [...initialFollowups];
  public auditLogs = [...initialAuditLogs];
  public referrals: CareReferral[] = [...initialReferrals];
  public notifications: UserNotification[] = [...initialNotifications];

  constructor() {
    if (config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)) {
      const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
      this.supabase = createClient(config.supabase.url, key);
      this.isUsingSupabase = true;
      console.log('✅ Connected to Supabase Data Layer');
    } else {
      console.log('ℹ️ Running in Local High-Fidelity Data Store mode (Supabase URL not set)');
    }
  }

  // Audit Log helper
  public logAudit(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      ...log
    };
    this.auditLogs.unshift(entry);
  }

  // Patients
  public getPatients(facilityId?: string, status?: string): Patient[] {
    let list = this.patients;
    if (facilityId && facilityId !== 'all') {
      list = list.filter(p => p.facility_id === facilityId);
    }
    if (status && status !== 'all') {
      list = list.filter(p => p.care_status === status);
    }
    return list;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id || p.mrn.toLowerCase() === id.toLowerCase());
  }

  // Duplicate Patient Check
  public checkDuplicatePatient(phone: string, firstName: string, lastName: string, dob?: string): Patient | undefined {
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanFirst = firstName.trim().toLowerCase();
    const cleanLast = lastName.trim().toLowerCase();

    return this.patients.find(p => {
      const pPhone = p.phone.replace(/\D/g, '');
      const matchPhone = cleanPhone && pPhone && (cleanPhone === pPhone || cleanPhone.endsWith(pPhone) || pPhone.endsWith(cleanPhone));
      const matchName = p.first_name.trim().toLowerCase() === cleanFirst && p.last_name.trim().toLowerCase() === cleanLast;
      const matchDob = dob && p.date_of_birth === dob;

      if (matchPhone && matchName) return true;
      if (matchDob && matchName) return true;
      if (matchPhone && cleanPhone.length >= 10) return true;
      return false;
    });
  }

  // Phase 3: Register New Patient with Unique CLP-2026-XXXX ID
  public createPatient(patientData: Omit<Patient, 'id' | 'mrn' | 'continuity_score' | 'registration_date'>, registeredBy: string, registeredByName?: string): Patient {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newMrn = `CLP-2026-${randomSuffix}`;
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      mrn: newMrn,
      continuity_score: 100.0,
      registration_date: new Date().toISOString().split('T')[0],
      registered_by_staff_id: registeredBy,
      registered_by_staff_name: registeredByName || 'Authorized Staff',
      registration_channel: patientData.registration_channel || 'staff_dashboard',
      ...patientData,
    };

    this.patients.unshift(newPatient);

    this.logAudit({
      facility_id: newPatient.facility_id,
      user_id: registeredBy,
      action: 'REGISTER_NEW_PATIENT',
      entity_name: 'patients',
      entity_id: newPatient.id,
      details: { 
        mrn: newMrn, 
        name: `${newPatient.first_name} ${newPatient.last_name}`, 
        facility: newPatient.facility_id,
        purpose: newPatient.registration_purpose,
        channel: newPatient.registration_channel
      }
    });

    return newPatient;
  }

  // Phase 3: Edit Patient Details
  public updatePatient(id: string, updates: Partial<Patient>, updatedBy: string): Patient | null {
    const idx = this.patients.findIndex(p => p.id === id);
    if (idx === -1) return null;

    this.patients[idx] = {
      ...this.patients[idx],
      ...updates,
      id: this.patients[idx].id, // preserve immutable ID
      mrn: this.patients[idx].mrn, // preserve immutable MRN
    };

    this.logAudit({
      facility_id: this.patients[idx].facility_id,
      user_id: updatedBy,
      action: 'UPDATE_PATIENT_RECORD',
      entity_name: 'patients',
      entity_id: id,
      details: updates
    });

    return this.patients[idx];
  }

  // Phase 3: Manage Patient Consent
  public updatePatientConsent(id: string, consentStatus: 'granted' | 'revoked' | 'pending', updatedBy: string, notes?: string): Patient | null {
    const patient = this.getPatientById(id);
    if (!patient) return null;

    patient.consent_status = consentStatus;

    this.logAudit({
      facility_id: patient.facility_id,
      user_id: updatedBy,
      action: 'UPDATE_PATIENT_CONSENT',
      entity_name: 'patient_consents',
      entity_id: patient.id,
      details: { consentStatus, notes }
    });

    return patient;
  }

  // Phase 3: Comprehensive Patient Care History Aggregation
  public getPatientCompleteHistory(patientId: string) {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    const pathways = this.getPathways().filter(pw => pw.patient_id === patient.id);
    const pathwayIds = pathways.map(pw => pw.id);
    const steps = this.steps.filter(s => pathwayIds.includes(s.pathway_id));
    const referrals = this.referrals.filter(r => r.patient_id === patient.id);
    const followups = this.followups.filter(f => f.patient_id === patient.id);
    const careGaps = this.careGaps.filter(g => g.patient_id === patient.id);
    const audits = this.auditLogs.filter(a => a.entity_id === patient.id || a.details?.patientId === patient.id);

    return {
      patient,
      careJourneys: pathways,
      activities: {
        total: steps.length,
        completed: steps.filter(s => s.status === 'completed'),
        pending: steps.filter(s => s.status === 'not_started' || s.status === 'pending' || s.status === 'in_progress'),
        overdue: steps.filter(s => s.status === 'overdue'),
        all: steps
      },
      referrals,
      followups,
      careGaps,
      auditHistory: audits
    };
  }

  // Phase 4: Create Care Journey with Customizable Stages
  public createCareJourney(journeyData: {
    patient_id: string;
    protocol_id?: string;
    title: string;
    assigned_coordinator_id?: string;
    primary_physician_id?: string;
    facility_id: string;
    start_date: string;
    expected_completion_date: string;
    stages?: {
      stage_type: JourneyStageType;
      title: string;
      activity_type: string;
      due_date: string;
      assigned_worker_id?: string;
      notes?: string;
    }[];
  }, createdBy: string): PatientPathway {
    const patient = this.getPatientById(journeyData.patient_id);
    const newPathwayId = `pw-${Date.now()}`;
    
    // Create Pathway
    const newPathway: PatientPathway = {
      id: newPathwayId,
      patient_id: journeyData.patient_id,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
      patient_mrn: patient?.mrn || 'CLP-2026-0000',
      protocol_id: journeyData.protocol_id || 'c0000000-0000-0000-0000-000000000001',
      protocol_name: journeyData.title,
      title: journeyData.title,
      assigned_coordinator_id: journeyData.assigned_coordinator_id,
      primary_physician_id: journeyData.primary_physician_id,
      facility_id: journeyData.facility_id,
      status: 'active',
      start_date: journeyData.start_date,
      expected_completion_date: journeyData.expected_completion_date,
      overall_progress_pct: 0,
      current_continuity_score: 100,
    };

    this.pathways.unshift(newPathway);

    // Create Stages / Steps if supplied, or default 8 standard stages
    const defaultStages: { stage_type: JourneyStageType; title: string; activity_type: string; offsetDays: number }[] = [
      { stage_type: 'patient_registration', title: 'Patient Registration & Onboarding', activity_type: 'Patient Registration', offsetDays: 0 },
      { stage_type: 'consultation', title: 'Initial Clinical Consultation', activity_type: 'Consultation', offsetDays: 1 },
      { stage_type: 'investigation_lab', title: 'Baseline Investigation & Lab Panels', activity_type: 'Investigation or Laboratory Test', offsetDays: 5 },
      { stage_type: 'referral', title: 'Specialist Referral & Outpatient Transfer', activity_type: 'Referral', offsetDays: 10 },
      { stage_type: 'medicine_collection', title: 'Prescription Dispensing & Adherence Check', activity_type: 'Medicine Collection', offsetDays: 12 },
      { stage_type: 'followup_appointment', title: 'Mid-Point Clinical Follow-up Visit', activity_type: 'Follow-up Appointment', offsetDays: 20 },
      { stage_type: 'recovery_followup', title: 'Recovery Milestones & Functional Assessment', activity_type: 'Recovery Follow-up', offsetDays: 45 },
      { stage_type: 'journey_completion', title: 'Care Journey Completion & Discharge Protocol', activity_type: 'Journey Completion', offsetDays: 90 },
    ];

    const todayMs = new Date(journeyData.start_date).getTime();

    const createdSteps: PathwayStep[] = (journeyData.stages && journeyData.stages.length > 0)
      ? journeyData.stages.map((st, i) => ({
          id: `step-${Date.now()}-${i}`,
          pathway_id: newPathwayId,
          stage_type: st.stage_type,
          title: st.title,
          activity_type: st.activity_type,
          due_date: st.due_date,
          status: 'not_started' as ActivityStatus,
          is_mandatory: true,
          notes: st.notes || '',
          assigned_worker_id: st.assigned_worker_id,
          assigned_worker_name: 'Elena Rostova, RN',
        }))
      : defaultStages.map((st, i) => {
          const stepDue = new Date(todayMs + st.offsetDays * 86400000).toISOString().split('T')[0];
          return {
            id: `step-${Date.now()}-${i}`,
            pathway_id: newPathwayId,
            stage_type: st.stage_type,
            title: st.title,
            activity_type: st.activity_type,
            due_date: stepDue,
            status: (i === 0 ? 'completed' : 'not_started') as ActivityStatus,
            completed_date: i === 0 ? journeyData.start_date : undefined,
            is_mandatory: true,
            notes: 'Initialized standard continuity journey stage',
            assigned_worker_name: 'Elena Rostova, RN',
          };
        });

    this.steps.push(...createdSteps);

    this.logAudit({
      facility_id: journeyData.facility_id,
      user_id: createdBy,
      action: 'CREATE_CARE_JOURNEY',
      entity_name: 'patient_pathways',
      entity_id: newPathwayId,
      details: { title: journeyData.title, patientId: journeyData.patient_id, stepCount: createdSteps.length }
    });

    return { ...newPathway, steps: createdSteps };
  }

  // Phase 4: Add Care Activity to Journey
  public addActivityToJourney(pathwayId: string, activityData: {
    stage_type: JourneyStageType;
    title: string;
    activity_type: string;
    due_date: string;
    assigned_worker_id?: string;
    assigned_worker_name?: string;
    notes?: string;
    is_mandatory?: boolean;
  }, addedBy: string): PathwayStep | null {
    const pathway = this.pathways.find(p => p.id === pathwayId);
    if (!pathway) return null;

    const newStep: PathwayStep = {
      id: `step-${Date.now()}`,
      pathway_id: pathwayId,
      stage_type: activityData.stage_type,
      title: activityData.title,
      activity_type: activityData.activity_type,
      due_date: activityData.due_date,
      status: 'not_started',
      is_mandatory: activityData.is_mandatory ?? true,
      notes: activityData.notes || '',
      assigned_worker_id: activityData.assigned_worker_id,
      assigned_worker_name: activityData.assigned_worker_name || 'Care Specialist',
    };

    this.steps.push(newStep);

    this.logAudit({
      facility_id: pathway.facility_id,
      user_id: addedBy,
      action: 'ADD_JOURNEY_ACTIVITY',
      entity_name: 'pathway_steps',
      entity_id: newStep.id,
      details: { pathwayId, title: newStep.title, due_date: newStep.due_date }
    });

    return newStep;
  }

  // Phase 4: Update Activity Status, Notes, Completion Date & Auto-overdue detection
  public updateActivityStatus(stepId: string, updates: {
    status: ActivityStatus;
    notes?: string;
    completed_date?: string;
    assigned_worker_name?: string;
  }, updatedBy: string): PathwayStep | null {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) return null;

    step.status = updates.status;
    if (updates.notes !== undefined) step.notes = updates.notes;
    if (updates.assigned_worker_name) step.assigned_worker_name = updates.assigned_worker_name;
    if (updates.status === 'completed') {
      step.completed_date = updates.completed_date || new Date().toISOString().split('T')[0];
    } else {
      step.completed_date = undefined;
    }
    step.updated_at = new Date().toISOString();

    // Recalculate pathway progress
    const pathway = this.pathways.find(p => p.id === step.pathway_id);
    if (pathway) {
      const pSteps = this.steps.filter(s => s.pathway_id === pathway.id);
      const completedCount = pSteps.filter(s => s.status === 'completed').length;
      pathway.overall_progress_pct = Math.round((completedCount / maxSteps(pSteps.length)) * 100);
      if (completedCount === pSteps.length) {
        pathway.status = 'completed';
        pathway.actual_completion_date = new Date().toISOString().split('T')[0];
      }
    }

    this.logAudit({
      facility_id: pathway?.facility_id,
      user_id: updatedBy,
      action: 'UPDATE_ACTIVITY_STATUS',
      entity_name: 'pathway_steps',
      entity_id: step.id,
      details: { status: updates.status, notes: updates.notes, completedDate: step.completed_date }
    });

    return step;
  }

  // Phase 4: Supporting Document Upload for Step
  public addDocumentToStep(stepId: string, doc: {
    name: string;
    url: string;
    file_type: string;
  }, uploadedBy: string): SupportingDocument | null {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) return null;

    if (!step.supporting_documents) {
      step.supporting_documents = [];
    }

    const newDoc: SupportingDocument = {
      id: `doc-${Date.now()}`,
      name: doc.name,
      url: doc.url,
      file_type: doc.file_type,
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
    };

    step.supporting_documents.push(newDoc);

    this.logAudit({
      user_id: uploadedBy,
      action: 'UPLOAD_SUPPORTING_DOCUMENT',
      entity_name: 'pathway_steps',
      entity_id: step.id,
      details: { docName: doc.name, stepId }
    });

    return newDoc;
  }

  // Phase 4: Automatic Overdue Detector
  public evaluateOverdueActivities(): number {
    const todayStr = new Date().toISOString().split('T')[0];
    let overdueCount = 0;

    for (const step of this.steps) {
      if (step.status !== 'completed' && step.status !== 'cancelled') {
        if (step.due_date < todayStr && step.status !== 'overdue') {
          step.status = 'overdue';
          overdueCount++;
        }
      }
    }
    return overdueCount;
  }

  // Pathways
  public getPathways(facilityId?: string): PatientPathway[] {
    this.evaluateOverdueActivities();
    const filtered = facilityId && facilityId !== 'all' ? this.pathways.filter(pw => pw.facility_id === facilityId) : this.pathways;
    return filtered.map(pw => {
      const pSteps = this.steps.filter(s => s.pathway_id === pw.id);
      const patient = this.getPatientById(pw.patient_id);
      return { 
        ...pw, 
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : pw.patient_name,
        patient_mrn: patient?.mrn || pw.patient_mrn,
        steps: pSteps 
      };
    });
  }

  public getPathwayById(id: string): PatientPathway | null {
    this.evaluateOverdueActivities();
    const pathway = this.pathways.find(p => p.id === id);
    if (!pathway) return null;
    const pSteps = this.steps.filter(s => s.pathway_id === pathway.id);
    const patient = this.getPatientById(pathway.patient_id);
    return {
      ...pathway,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : pathway.patient_name,
      patient_mrn: patient?.mrn || pathway.patient_mrn,
      steps: pSteps
    };
  }

  // Care Gaps
  public getCareGaps(facilityId?: string, isResolved?: boolean): CareGap[] {
    let gaps = this.careGaps;
    if (facilityId) gaps = gaps.filter(g => g.facility_id === facilityId);
    if (isResolved !== undefined) gaps = gaps.filter(g => g.is_resolved === isResolved);
    return gaps;
  }

  public getCareGapById(gapId: string): CareGap | null {
    return this.careGaps.find(g => g.id === gapId) || null;
  }

  public updateCareGapReview(
    gapId: string, 
    review: { 
      status: 'accepted' | 'modified' | 'dismissed'; 
      reviewedBy: string; 
      reviewNotes?: string; 
      modifiedAction?: string;
    }
  ): CareGap | null {
    const gap = this.careGaps.find(g => g.id === gapId);
    if (!gap) return null;

    gap.review_status = review.status;
    gap.reviewed_by = review.reviewedBy;
    gap.reviewed_at = new Date().toISOString();
    gap.review_notes = review.reviewNotes;
    if (review.modifiedAction) {
      gap.suggested_action = review.modifiedAction;
    }

    if (review.status === 'dismissed') {
      gap.is_resolved = true;
      gap.resolved_at = new Date().toISOString();
    } else if (review.status === 'accepted') {
      // Auto-schedule an authorized follow-up task on queue
      const newTask: FollowupTask = {
        id: `task-ai-${Date.now()}`,
        facility_id: gap.facility_id,
        patient_id: gap.patient_id,
        patient_name: gap.patient_name,
        gap_id: gap.id,
        assigned_to_name: review.reviewedBy,
        title: `Outreach: ${gap.title}`,
        instructions: gap.suggested_action || 'Coordinator follow-up on flagged care gap',
        priority: gap.severity,
        status: 'assigned',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        contact_method: 'Phone Outreach',
        attempt_count: 0,
        created_at: new Date().toISOString()
      };
      this.followups.unshift(newTask);
    }

    this.logAudit({
      facility_id: gap.facility_id,
      user_id: review.reviewedBy,
      action: 'HUMAN_REVIEW_CARE_GAP',
      entity_name: 'care_gaps',
      entity_id: gap.id,
      details: { reviewStatus: review.status, notes: review.reviewNotes }
    });

    return gap;
  }

  public resolveCareGap(gapId: string, resolvedBy: string, notes?: string): CareGap | null {
    const gap = this.careGaps.find(g => g.id === gapId);
    if (!gap) return null;
    gap.is_resolved = true;
    gap.resolved_at = new Date().toISOString();
    
    this.logAudit({
      facility_id: gap.facility_id,
      user_id: resolvedBy,
      action: 'RESOLVE_CARE_GAP',
      entity_name: 'care_gaps',
      entity_id: gap.id,
      details: { notes: notes || 'Care gap resolved through coordinator action' }
    });

    return gap;
  }

  // Phase 6: Follow-up Tasks Workflow
  public getFollowups(facilityId?: string, status?: string): FollowupTask[] {
    let tasks = this.followups;
    if (facilityId && facilityId !== 'all') tasks = tasks.filter(t => t.facility_id === facilityId);
    if (status && status !== 'all') tasks = tasks.filter(t => t.status === status);
    return tasks;
  }

  public getFollowupById(taskId: string): FollowupTask | null {
    return this.followups.find(t => t.id === taskId) || null;
  }

  public createFollowupTask(taskData: {
    facility_id: string;
    patient_id: string;
    gap_id?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    title: string;
    instructions: string;
    priority: RiskLevel;
    due_date: string;
    contact_method: string;
  }, createdBy: string): FollowupTask {
    const patient = this.getPatientById(taskData.patient_id);
    const newTask: FollowupTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      facility_id: taskData.facility_id,
      patient_id: taskData.patient_id,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
      patient_mrn: patient?.mrn || 'CLP-2026-UNKN',
      gap_id: taskData.gap_id,
      assigned_to: taskData.assigned_to,
      assigned_to_name: taskData.assigned_to_name || 'Care Coordinator',
      title: taskData.title,
      instructions: taskData.instructions,
      priority: taskData.priority,
      status: taskData.assigned_to_name ? 'assigned' : 'new',
      due_date: taskData.due_date,
      contact_method: taskData.contact_method,
      attempt_count: 0,
      contact_attempts: [],
      recorded_barriers: [],
      created_at: new Date().toISOString()
    };

    this.followups.unshift(newTask);

    this.logAudit({
      facility_id: newTask.facility_id,
      user_id: createdBy,
      action: 'CREATE_FOLLOWUP_TASK',
      entity_name: 'followup_tasks',
      entity_id: newTask.id,
      details: { title: newTask.title, patientId: newTask.patient_id, priority: newTask.priority }
    });

    return newTask;
  }

  public logContactAttempt(taskId: string, attempt: {
    worker_id: string;
    worker_name: string;
    channel: 'phone' | 'sms' | 'home_visit' | 'portal';
    outcome: 'reached' | 'voicemail' | 'no_answer' | 'number_disconnected' | 'family_contacted';
    notes?: string;
    recorded_barrier?: BarrierCategory;
    barrier_details?: string;
  }): FollowupTask | null {
    const task = this.followups.find(t => t.id === taskId);
    if (!task) return null;

    if (!task.contact_attempts) task.contact_attempts = [];
    const newAttempt: ContactAttempt = {
      id: `att-${Date.now()}`,
      timestamp: new Date().toISOString(),
      worker_id: attempt.worker_id,
      worker_name: attempt.worker_name,
      channel: attempt.channel,
      outcome: attempt.outcome,
      notes: attempt.notes,
      recorded_barrier: attempt.recorded_barrier,
      barrier_details: attempt.barrier_details
    };
    task.contact_attempts.push(newAttempt);
    task.attempt_count += 1;
    task.updated_at = new Date().toISOString();

    if (attempt.recorded_barrier) {
      if (!task.recorded_barriers) task.recorded_barriers = [];
      if (!task.recorded_barriers.includes(attempt.recorded_barrier)) {
        task.recorded_barriers.push(attempt.recorded_barrier);
      }
      if (attempt.barrier_details) {
        task.barrier_notes = attempt.barrier_details;
      }
    }

    if (attempt.outcome === 'reached' || attempt.outcome === 'family_contacted') {
      task.status = 'in_progress';
    } else if (attempt.outcome === 'voicemail' || attempt.outcome === 'no_answer') {
      task.status = 'waiting_for_response';
    }

    this.logAudit({
      facility_id: task.facility_id,
      user_id: attempt.worker_id,
      action: 'RECORD_CONTACT_ATTEMPT',
      entity_name: 'followup_tasks',
      entity_id: task.id,
      details: { outcome: attempt.outcome, channel: attempt.channel, barrier: attempt.recorded_barrier }
    });

    return task;
  }

  public updateFollowupStatus(taskId: string, status: FollowupTaskStatus, outcomeNotes?: string, userId?: string, completionTimeMinutes?: number): FollowupTask | null {
    const task = this.followups.find(t => t.id === taskId);
    if (!task) return null;
    task.status = status;
    if (outcomeNotes) task.outcome_notes = outcomeNotes;
    if (completionTimeMinutes) task.completion_time_minutes = completionTimeMinutes;
    task.updated_at = new Date().toISOString();

    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
      // NOTE AI Safety / Closed-loop rule: Do NOT automatically mark patient as recovered merely because a task is completed.
    }

    this.logAudit({
      facility_id: task.facility_id,
      user_id: userId,
      action: 'UPDATE_FOLLOWUP_TASK',
      entity_name: 'followup_tasks',
      entity_id: task.id,
      details: { status, outcomeNotes, completionTimeMinutes }
    });

    return task;
  }

  // Analytics summary for Continuity Dashboard
  public getContinuityMetrics(facilityId?: string) {
    const pts = this.getPatients(facilityId);
    const gaps = this.getCareGaps(facilityId);
    const unresolvedGaps = gaps.filter(g => !g.is_resolved);
    const followups = this.getFollowups(facilityId);
    const pendingFollowups = followups.filter(f => f.status === 'new' || f.status === 'assigned' || f.status === 'in_progress' || f.status === 'waiting_for_response');

    const totalScore = pts.reduce((sum, p) => sum + (p.continuity_score || 0), 0);
    const avgScore = pts.length > 0 ? (totalScore / pts.length).toFixed(1) : '100.0';

    return {
      totalActivePatients: pts.length,
      overallContinuityIndex: parseFloat(avgScore),
      activeCareGapsCount: unresolvedGaps.length,
      pendingOutreachCount: pendingFollowups.length,
      criticalGapsCount: unresolvedGaps.filter(g => g.severity === 'critical').length,
      highGapsCount: unresolvedGaps.filter(g => g.severity === 'high').length,
      recoveredWithinTargetCount: 28, // Monthly benchmark indicator
      gapDistributionByType: {
        'Overdue Appointment': unresolvedGaps.filter(g => g.gap_type === 'Overdue Appointment').length,
        'Lost Contact Risk': unresolvedGaps.filter(g => g.gap_type === 'Lost Contact Risk').length,
        'Missing Lab': unresolvedGaps.filter(g => g.gap_type === 'Missing Lab').length,
        'Medication Review': unresolvedGaps.filter(g => g.gap_type === 'Medication Review').length,
      }
    };
  }

  // Phase 2: Complete Dashboard Overview Stats
  public getDashboardOverview(facilityId?: string): DashboardOverviewStats {
    const pts = this.getPatients(facilityId);
    const pathways = this.getPathways(facilityId);
    const activePathways = pathways.filter(p => p.status === 'active');
    
    // Pending activities from active steps
    const pendingSteps = this.steps.filter(s => s.status === 'not_started' || s.status === 'pending' || s.status === 'in_progress' || s.status === 'overdue');
    
    // Referrals
    let refs = this.referrals;
    if (facilityId) refs = refs.filter(r => r.facility_id === facilityId);
    const overdueRefs = refs.filter(r => r.is_overdue || r.status === 'overdue');

    // Follow-ups
    const tasks = this.getFollowups(facilityId);
    const pendingTasks = tasks.filter(t => t.status === 'new' || t.status === 'assigned' || t.status === 'in_progress' || t.status === 'waiting_for_response');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Care Gaps
    const gaps = this.getCareGaps(facilityId).filter(g => !g.is_resolved);
    const highGaps = gaps.filter(g => g.severity === 'high');
    const criticalGaps = gaps.filter(g => g.severity === 'critical');

    // Total continuity score
    const totalScore = pts.reduce((sum, p) => sum + (p.continuity_score || 0), 0);
    const avgScore = pts.length > 0 ? parseFloat((totalScore / pts.length).toFixed(1)) : 92.4;

    return {
      totalRegisteredPatients: pts.length,
      activeCareJourneys: activePathways.length,
      pendingActivities: pendingSteps.length,
      overdueReferrals: overdueRefs.length,
      pendingFollowupTasks: pendingTasks.length,
      completedFollowupTasks: completedTasks.length,
      highPriorityCareGaps: highGaps.length,
      criticalCareGaps: criticalGaps.length,
      facilityContinuityIndex: avgScore,
      continuityTrend: [
        { date: 'Nov 1', continuityScore: 78.4, recoveredCount: 14 },
        { date: 'Nov 5', continuityScore: 81.2, recoveredCount: 18 },
        { date: 'Nov 10', continuityScore: 83.5, recoveredCount: 22 },
        { date: 'Nov 15', continuityScore: 85.0, recoveredCount: 25 },
        { date: 'Nov 20', continuityScore: 87.8, recoveredCount: 29 },
        { date: 'Nov 24', continuityScore: avgScore, recoveredCount: 34 }
      ],
      gapTypeDistribution: [
        { type: 'Overdue Appointment', count: gaps.filter(g => g.gap_type === 'Overdue Appointment').length || 1 },
        { type: 'Lost Contact Risk', count: gaps.filter(g => g.gap_type === 'Lost Contact Risk').length || 1 },
        { type: 'Missing Lab Panel', count: gaps.filter(g => g.gap_type === 'Missing Lab').length || 1 },
        { type: 'Transit / Barrier Risk', count: 1 }
      ],
      statusBreakdown: [
        { status: 'On-Track Recoveries', count: 28, color: '#10b981' },
        { status: 'At-Risk Journeys', count: 4, color: '#f59e0b' },
        { status: 'Critical Gaps', count: criticalGaps.length || 1, color: '#ef4444' },
        { status: 'Pending Intake', count: 6, color: '#06b6d4' }
      ],
      recentActivities: [
        {
          id: 'act-1',
          timestamp: '10 mins ago',
          action: 'Coordinator Phone Outreach Recorded',
          actor: 'Elena Rostova, RN',
          patientName: 'Robert Miller',
          category: 'Follow-up Call',
          status: 'success'
        },
        {
          id: 'act-2',
          timestamp: '45 mins ago',
          action: 'Care Gap Flagged: Overdue Nephrology Lab',
          actor: 'Predictive Continuity Engine',
          patientName: 'Arthur Pendleton',
          category: 'AI Gap Detection',
          status: 'alert'
        },
        {
          id: 'act-3',
          timestamp: '2 hours ago',
          action: 'Physical Therapy Intake Verified',
          actor: 'Amara Chen, BSN',
          patientName: 'Amina Khatib',
          category: 'EHR Milestone Sync',
          status: 'success'
        },
        {
          id: 'act-4',
          timestamp: '3 hours ago',
          action: 'Specialist Referral Dispatched to Highland Valley',
          actor: 'Dr. Sarah Jenkins, MD',
          patientName: 'Maria Santos',
          category: 'Referral Order',
          status: 'warning'
        }
      ]
    };
  }

  // Phase 6: Referrals Management & Closed-Loop Escalation
  public getReferrals(facilityId?: string, status?: string): CareReferral[] {
    let refs = this.referrals;
    if (facilityId && facilityId !== 'all') {
      refs = refs.filter(r => r.facility_id === facilityId || r.receiving_facility_id === facilityId);
    }
    if (status && status !== 'all') {
      refs = refs.filter(r => r.status === status);
    }
    return refs;
  }

  public getReferralById(refId: string): CareReferral | null {
    return this.referrals.find(r => r.id === refId) || null;
  }

  public createReferral(data: {
    facility_id: string; // referring
    receiving_facility_id: string;
    referred_to_facility: string;
    patient_id: string;
    specialty: string;
    referral_reason: string;
    target_completion_date: string;
    notes?: string;
  }, createdBy: string): CareReferral {
    const patient = this.getPatientById(data.patient_id);
    const referringFacility = this.facilities.find(f => f.id === data.facility_id);

    const newRef: CareReferral = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      facility_id: data.facility_id,
      referring_facility_name: referringFacility?.name || 'CarePath Central Hospital',
      receiving_facility_id: data.receiving_facility_id,
      referred_to_facility: data.referred_to_facility,
      patient_id: data.patient_id,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
      patient_mrn: patient?.mrn || 'CLP-2026-UNKN',
      specialty: data.specialty,
      referral_reason: data.referral_reason,
      referral_date: new Date().toISOString().split('T')[0],
      target_completion_date: data.target_completion_date,
      status: 'pending',
      notes: data.notes,
      is_overdue: false,
      created_at: new Date().toISOString()
    };

    this.referrals.unshift(newRef);

    this.logAudit({
      facility_id: newRef.facility_id,
      user_id: createdBy,
      action: 'CREATE_CARE_REFERRAL',
      entity_name: 'care_referrals',
      entity_id: newRef.id,
      details: { patientId: newRef.patient_id, toFacility: newRef.referred_to_facility, specialty: newRef.specialty }
    });

    return newRef;
  }

  public acknowledgeReferral(refId: string, acknowledgedBy: string): CareReferral | null {
    const ref = this.referrals.find(r => r.id === refId);
    if (!ref) return null;
    ref.status = 'acknowledged';
    ref.acknowledged_date = new Date().toISOString();
    ref.acknowledged_by = acknowledgedBy;

    this.logAudit({
      facility_id: ref.receiving_facility_id || ref.facility_id,
      user_id: acknowledgedBy,
      action: 'ACKNOWLEDGE_REFERRAL',
      entity_name: 'care_referrals',
      entity_id: ref.id,
      details: { acknowledgedBy }
    });

    return ref;
  }

  public escalateReferral(refId: string, reason: string, escalatedBy: string): CareReferral | null {
    const ref = this.referrals.find(r => r.id === refId);
    if (!ref) return null;
    ref.status = 'escalated';
    ref.is_escalated = true;
    ref.escalated_date = new Date().toISOString();
    ref.escalation_reason = reason;

    // Also auto-schedule high priority outreach task
    this.createFollowupTask({
      facility_id: ref.facility_id,
      patient_id: ref.patient_id,
      assigned_to_name: escalatedBy,
      title: `Escalated Referral: ${ref.specialty} to ${ref.referred_to_facility}`,
      instructions: `Urgent referral liaison inquiry. Delay reason: ${reason}. Expedite receiving facility booking.`,
      priority: 'high',
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      contact_method: 'Receiving Facility Liaison Call'
    }, escalatedBy);

    this.logAudit({
      facility_id: ref.facility_id,
      user_id: escalatedBy,
      action: 'ESCALATE_REFERRAL',
      entity_name: 'care_referrals',
      entity_id: ref.id,
      details: { reason }
    });

    return ref;
  }

  public verifyReferralCompletion(refId: string, verifiedBy: string, notes?: string): CareReferral | null {
    const ref = this.referrals.find(r => r.id === refId);
    if (!ref) return null;
    ref.status = 'completed';
    ref.verified_completion_date = new Date().toISOString();
    ref.verified_by = verifiedBy;
    if (notes) ref.notes = notes;

    this.logAudit({
      facility_id: ref.facility_id,
      user_id: verifiedBy,
      action: 'VERIFY_REFERRAL_COMPLETION',
      entity_name: 'care_referrals',
      entity_id: ref.id,
      details: { verifiedBy, notes }
    });

    return ref;
  }

  // Phase 2: Notifications
  public getNotifications(facilityId?: string) {
    if (facilityId) return this.notifications.filter(n => n.facility_id === facilityId);
    return this.notifications;
  }

  public markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
    return notif;
  }

  // Phase 9: Administration & Advanced Analytics
  public getFacilities(): Facility[] {
    return this.facilities;
  }

  public createFacility(data: Omit<Facility, 'id'>, actorId: string): Facility {
    const fac: Facility = {
      id: `a0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`,
      ...data
    };
    this.facilities.push(fac);
    this.logAudit({
      facility_id: fac.id,
      user_id: actorId,
      action: 'CREATE_FACILITY',
      entity_name: 'facilities',
      entity_id: fac.id,
      details: { name: fac.name, code: fac.facility_code }
    });
    return fac;
  }

  public updateFacility(id: string, data: Partial<Facility>, actorId: string): Facility | null {
    const fac = this.facilities.find(f => f.id === id);
    if (!fac) return null;
    Object.assign(fac, data);
    this.logAudit({
      facility_id: fac.id,
      user_id: actorId,
      action: 'UPDATE_FACILITY',
      entity_name: 'facilities',
      entity_id: fac.id,
      details: data
    });
    return fac;
  }

  public getUsers(facilityId?: string): UserProfile[] {
    if (facilityId && facilityId !== 'all') {
      return this.users.filter(u => u.facility_id === facilityId);
    }
    return this.users;
  }

  public createUser(data: Omit<UserProfile, 'id'>, actorId: string): UserProfile {
    const usr: UserProfile = {
      id: `b0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`,
      ...data
    };
    this.users.push(usr);
    this.logAudit({
      facility_id: usr.facility_id,
      user_id: actorId,
      action: 'CREATE_USER',
      entity_name: 'user_profiles',
      entity_id: usr.id,
      details: { email: usr.email, role: usr.role }
    });
    return usr;
  }

  public updateUser(id: string, data: Partial<UserProfile>, actorId: string): UserProfile | null {
    const usr = this.users.find(u => u.id === id);
    if (!usr) return null;
    Object.assign(usr, data);
    this.logAudit({
      facility_id: usr.facility_id,
      user_id: actorId,
      action: 'UPDATE_USER',
      entity_name: 'user_profiles',
      entity_id: usr.id,
      details: data
    });
    return usr;
  }

  public getAuditLogs(facilityId?: string, limit: number = 100): AuditLog[] {
    let logs = this.auditLogs;
    if (facilityId && facilityId !== 'all') {
      logs = logs.filter(l => l.facility_id === facilityId);
    }
    return logs.slice(0, limit);
  }

  // Phase 9 Comprehensive Analytics Aggregator
  public getAnalyticsData(facilityId?: string, dateRange?: string) {
    const isFiltered = facilityId && facilityId !== 'all';
    const targetFacilities = isFiltered ? this.facilities.filter(f => f.id === facilityId) : this.facilities;
    
    const patients = this.getPatients(isFiltered ? facilityId : undefined);
    const pathways = this.getPathways(isFiltered ? facilityId : undefined);
    const steps = isFiltered ? this.steps.filter(s => {
      const pw = this.pathways.find(p => p.id === s.pathway_id);
      return pw?.facility_id === facilityId;
    }) : this.steps;
    const referrals = this.getReferrals(isFiltered ? facilityId : undefined);
    const followups = this.getFollowups(isFiltered ? facilityId : undefined);
    const careGaps = this.getCareGaps(isFiltered ? facilityId : undefined);

    // Activity breakdown
    const completedActivities = steps.filter(s => s.status === 'completed').length;
    const pendingActivities = steps.filter(s => s.status === 'pending' || s.status === 'in_progress').length;
    const overdueActivities = steps.filter(s => s.status === 'overdue' || (s.due_date && new Date(s.due_date) < new Date() && s.status !== 'completed')).length;

    // Followup Performance
    const completedFollowups = followups.filter(f => f.status === 'completed').length;
    const totalFollowups = followups.length || 1;
    const followupCompletionRate = Math.round((completedFollowups / totalFollowups) * 100);

    // Care gaps by category
    const gapCategories: Record<string, number> = {};
    careGaps.forEach(g => {
      const cat = g.gap_type || 'General Process Gap';
      gapCategories[cat] = (gapCategories[cat] || 0) + 1;
    });

    // Registration trend by month (2026)
    const registrationTrend = [
      { month: 'Jan', count: 18 },
      { month: 'Feb', count: 24 },
      { month: 'Mar', count: 32 },
      { month: 'Apr', count: 28 },
      { month: 'May', count: 40 },
      { month: 'Jun', count: patients.length + 15 }
    ];

    // Activity trend
    const activityTrend = [
      { day: 'Mon', completed: 14, pending: 8, overdue: 2 },
      { day: 'Tue', completed: 22, pending: 11, overdue: 1 },
      { day: 'Wed', completed: 19, pending: 9, overdue: 3 },
      { day: 'Thu', completed: 28, pending: 14, overdue: 4 },
      { day: 'Fri', completed: 31, pending: 12, overdue: 2 },
      { day: 'Sat', completed: 16, pending: 6, overdue: 1 },
      { day: 'Sun', completed: 12, pending: 4, overdue: 0 }
    ];

    // Referral completion trend
    const referralStats = {
      total: referrals.length,
      completed: referrals.filter(r => r.status === 'completed').length,
      overdue: referrals.filter(r => r.is_overdue || r.status === 'overdue').length,
      escalated: referrals.filter(r => r.status === 'escalated').length,
      acknowledged: referrals.filter(r => r.status === 'acknowledged' || r.status === 'accepted' || r.status === 'scheduled').length
    };

    // Facility Level Comparison
    const facilityComparisons = targetFacilities.map(f => {
      const fPatients = this.patients.filter(p => p.facility_id === f.id);
      const fPathways = this.pathways.filter(p => p.facility_id === f.id);
      const fFollowups = this.followups.filter(fol => fol.facility_id === f.id);
      const fCompletedFollowups = fFollowups.filter(fol => fol.status === 'completed').length;
      const fGaps = this.careGaps.filter(g => g.facility_id === f.id && !g.is_resolved).length;
      return {
        facilityId: f.id,
        facilityName: f.name,
        facilityCode: f.facility_code,
        patientCount: fPatients.length,
        activeJourneys: fPathways.filter(p => p.status === 'active').length,
        followupRate: fFollowups.length > 0 ? Math.round((fCompletedFollowups / fFollowups.length) * 100) : 100,
        openCareGaps: fGaps
      };
    });

    return {
      adminDashboard: {
        totalFacilities: this.facilities.length,
        totalRegisteredPatients: patients.length,
        activeCareJourneys: pathways.filter(p => p.status === 'active').length,
        completedJourneys: pathways.filter(p => p.status === 'completed').length,
        pendingActivities,
        overdueActivities,
        completedActivities,
        overdueReferrals: referralStats.overdue,
        followupCompletionRate,
        openCareGapAlerts: careGaps.filter(g => !g.is_resolved).length,
      },
      charts: {
        registrationTrend,
        activityTrend,
        activityBreakdown: [
          { name: 'Completed', value: completedActivities, fill: '#10b981' },
          { name: 'Pending / In Progress', value: pendingActivities, fill: '#0891b2' },
          { name: 'Overdue', value: overdueActivities, fill: '#ef4444' }
        ],
        careGapCategories: Object.entries(gapCategories).map(([type, count]) => ({ type, count })),
        referralStats,
        facilityComparisons
      }
    };
  }
}

export const db = new DataStore();
