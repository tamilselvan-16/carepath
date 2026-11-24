import React from 'react';
import type { PathwayStep, ActivityStatus, JourneyStageType } from '../../types';
import { 
  UserCheck, 
  Stethoscope, 
  FlaskConical, 
  Share2, 
  Pill, 
  CalendarClock, 
  HeartHandshake, 
  CheckCircle, 
  Clock, 
  FileText, 
  Edit3, 
  Plus, 
  Paperclip,
  CheckCircle2
} from 'lucide-react';

interface CareJourneyTimelineProps {
  steps: PathwayStep[];
  onSelectStep?: (step: PathwayStep) => void;
  onAddActivity?: () => void;
  canEdit?: boolean;
}

export const stageIconMap: Record<JourneyStageType, React.ReactNode> = {
  patient_registration: <UserCheck className="w-4 h-4" />,
  consultation: <Stethoscope className="w-4 h-4" />,
  investigation_lab: <FlaskConical className="w-4 h-4" />,
  referral: <Share2 className="w-4 h-4" />,
  medicine_collection: <Pill className="w-4 h-4" />,
  followup_appointment: <CalendarClock className="w-4 h-4" />,
  recovery_followup: <HeartHandshake className="w-4 h-4" />,
  journey_completion: <CheckCircle className="w-4 h-4" />
};

export const stageLabelMap: Record<JourneyStageType, string> = {
  patient_registration: 'Patient Registration',
  consultation: 'Consultation',
  investigation_lab: 'Investigation / Lab Test',
  referral: 'Referral',
  medicine_collection: 'Medicine Collection',
  followup_appointment: 'Follow-up Appointment',
  recovery_followup: 'Recovery Follow-up',
  journey_completion: 'Journey Completion'
};

export const getStatusBadge = (status: ActivityStatus) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        label: 'Completed'
      };
    case 'overdue':
      return {
        bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse',
        dot: 'bg-red-500',
        label: 'Overdue'
      };
    case 'in_progress':
      return {
        bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500',
        label: 'In Progress'
      };
    case 'pending':
      return {
        bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        label: 'Pending'
      };
    case 'cancelled':
      return {
        bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
        label: 'Cancelled'
      };
    case 'not_started':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
        label: 'Not Started'
      };
  }
};

export const CareJourneyTimeline: React.FC<CareJourneyTimelineProps> = ({
  steps,
  onSelectStep,
  onAddActivity,
  canEdit = true
}) => {
  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Visual Journey Timeline</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-semibold">
              {steps.length} Stages / Activities
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological continuum of care from registration through recovery completion
          </p>
        </div>
        {canEdit && onAddActivity && (
          <button
            onClick={onAddActivity}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Activity</span>
          </button>
        )}
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {steps.map((step, idx) => {
          const badge = getStatusBadge(step.status);
          const icon = stageIconMap[step.stage_type] || <FileText className="w-4 h-4" />;
          const stageName = stageLabelMap[step.stage_type] || step.stage_type;

          return (
            <div key={step.id || idx} className="relative group">
              {/* Timeline Node Dot */}
              <div 
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs transition-all ${
                  step.status === 'completed'
                    ? 'bg-emerald-500 text-white'
                    : step.status === 'overdue'
                    ? 'bg-red-500 text-white animate-bounce'
                    : step.status === 'in_progress'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <span className="text-[10px] font-black">{idx + 1}</span>
                )}
              </div>

              {/* Step Card */}
              <div 
                onClick={() => onSelectStep?.(step)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  step.status === 'overdue'
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 hover:border-red-400'
                    : step.status === 'completed'
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center space-x-1">
                        {icon}
                        <span>{stageName}</span>
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </span>
                      {step.is_mandatory && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          &bull; Mandatory
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm pt-0.5">
                      {step.title}
                    </h5>
                  </div>

                  <div className="text-left sm:text-right text-xs shrink-0">
                    <div className="text-slate-500 dark:text-slate-400 flex items-center sm:justify-end space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: <strong className="text-slate-800 dark:text-slate-200">{step.due_date}</strong></span>
                    </div>
                    {step.completed_date && (
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-0.5">
                        Completed: {step.completed_date}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes and Assigned Worker Details */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
                  <div className="flex-1">
                    {step.notes ? (
                      <p className="line-clamp-2 italic text-slate-500 dark:text-slate-400">"{step.notes}"</p>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No clinical notes recorded yet.</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 shrink-0 text-[11px]">
                    {step.assigned_worker_name && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        Assigned: <strong>{step.assigned_worker_name}</strong>
                      </span>
                    )}
                    {step.supporting_documents && step.supporting_documents.length > 0 && (
                      <span className="inline-flex items-center space-x-1 text-cyan-600 font-semibold">
                        <Paperclip className="w-3 h-3" />
                        <span>{step.supporting_documents.length} doc{step.supporting_documents.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                    {canEdit && (
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold inline-flex items-center space-x-0.5 group-hover:underline">
                        <Edit3 className="w-3 h-3" />
                        <span>Update</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
