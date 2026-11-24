import React, { useState } from 'react';
import type { Patient, JourneyStageType } from '../../types';
import { X, Route, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CreateJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  defaultPatientId?: string;
  facilityId: string;
  token?: string;
}

const DEFAULT_STAGES: { stage_type: JourneyStageType; title: string; offsetDays: number; is_mandatory: boolean }[] = [
  { stage_type: 'patient_registration', title: 'Intake & Care Coordination Onboarding', offsetDays: 0, is_mandatory: true },
  { stage_type: 'consultation', title: 'Initial Physician Post-Discharge Consultation', offsetDays: 3, is_mandatory: true },
  { stage_type: 'investigation_lab', title: 'Diagnostic Requisition & Lab Panel', offsetDays: 14, is_mandatory: true },
  { stage_type: 'referral', title: 'Specialty Rehabilitation or Clinic Referral', offsetDays: 21, is_mandatory: false },
  { stage_type: 'medicine_collection', title: 'Medication Adherence & Pharmacy Verification', offsetDays: 30, is_mandatory: true },
  { stage_type: 'followup_appointment', title: 'Mid-Journey Physician Assessment', offsetDays: 60, is_mandatory: true },
  { stage_type: 'recovery_followup', title: 'Home Health & Liaison Recovery Check', offsetDays: 75, is_mandatory: false },
  { stage_type: 'journey_completion', title: 'Continuity Verification & Protocol Discharge', offsetDays: 90, is_mandatory: true },
];

export const CreateJourneyModal: React.FC<CreateJourneyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  defaultPatientId,
  facilityId,
  token
}) => {
  if (!isOpen) return null;

  const [patientId, setPatientId] = useState(defaultPatientId || (patients.length > 0 ? patients[0].id : ''));
  const [title, setTitle] = useState('Post-Acute Recovery Pathway');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedCoordinator, setAssignedCoordinator] = useState('Elena Rostova, RN');
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toggle or modify custom stages
  const handleRemoveStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomStage = () => {
    setStages(prev => [
      ...prev,
      {
        stage_type: 'recovery_followup',
        title: 'Custom Recovery Milestone',
        offsetDays: 45,
        is_mandatory: false
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setErrorMsg('Please select a patient.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Calculate stage dates relative to startDate
      const baseDate = new Date(startDate);
      const computedStages = stages.map(st => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + st.offsetDays);
        return {
          stage_type: st.stage_type,
          title: st.title,
          activity_type: st.stage_type.replace(/_/g, ' '),
          due_date: d.toISOString().split('T')[0],
          is_mandatory: st.is_mandatory,
          assigned_worker_name: assignedCoordinator
        };
      });

      const payload = {
        patient_id: patientId,
        facility_id: facilityId,
        title,
        assigned_coordinator_id: assignedCoordinator,
        start_date: startDate,
        stages: computedStages
      };

      const res = await fetch('/api/pathways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to initialize patient care journey');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-cyan-200" />
              <h3 className="text-lg font-bold text-white">Initiate Patient Care Journey</h3>
            </div>
            <p className="text-xs text-cyan-100 mt-1">
              Configure standardized 8-stage care continuum customized to patient's condition
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Select */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Patient *
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>

            {/* Journey Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pathway Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cardiac Recovery Protocol"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Journey Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Assigned Coordinator */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Responsible Care Coordinator
              </label>
              <input
                type="text"
                value={assignedCoordinator}
                onChange={(e) => setAssignedCoordinator(e.target.value)}
                placeholder="Elena Rostova, RN"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Customizable Care Stages */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Care Journey Stages ({stages.length})
                </label>
                <p className="text-[11px] text-slate-400">
                  Customizable stages based on actual clinical treatment pathway
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomStage}
                className="inline-flex items-center space-x-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stages.map((st, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStages(prev => prev.map((s, i) => i === idx ? { ...s, title: val } : s));
                      }}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] text-slate-400">+</span>
                    <input
                      type="number"
                      min={0}
                      max={365}
                      value={st.offsetDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setStages(prev => prev.map((s, i) => i === idx ? { ...s, offsetDays: val } : s));
                      }}
                      className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-center text-slate-800 dark:text-slate-200"
                    />
                    <span className="text-[11px] text-slate-400">days</span>

                    {stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Initializing...' : 'Launch Care Journey'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
