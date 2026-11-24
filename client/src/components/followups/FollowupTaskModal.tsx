import React, { useState } from 'react';
import type { FollowupTask, FollowupTaskStatus, BarrierCategory } from '../../types';
import { queueOfflineOperation } from '../../services/offlineQueue';
import { 
  X, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  History
} from 'lucide-react';

interface FollowupTaskModalProps {
  task: FollowupTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  token?: string;
}

export const FollowupTaskModal: React.FC<FollowupTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdated,
  token
}) => {
  if (!isOpen || !task) return null;

  // Attempt Log Form State
  const [channel, setChannel] = useState<'phone' | 'sms' | 'home_visit' | 'portal'>('phone');
  const [outcome, setOutcome] = useState<'reached' | 'voicemail' | 'no_answer' | 'number_disconnected' | 'family_contacted'>('reached');
  const [attemptNotes, setAttemptNotes] = useState('');
  const [selectedBarrier, setSelectedBarrier] = useState<BarrierCategory | ''>('');
  const [barrierDetails, setBarrierDetails] = useState('');
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);

  // Status & Resolution Form State
  const [taskStatus, setTaskStatus] = useState<FollowupTaskStatus>(task.status);
  const [outcomeNotes, setOutcomeNotes] = useState(task.outcome_notes || '');
  const [completionMinutes, setCompletionMinutes] = useState<number>(task.completion_time_minutes || 15);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Log Contact Attempt
  const handleLogAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingAttempt(true);

      if (!navigator.onLine) {
        await queueOfflineOperation({
          entity_id: task.id,
          entity_type: 'followup_task',
          action_type: 'LOG_CONTACT_ATTEMPT',
          base_version: 1,
          payload: {
            channel,
            outcome,
            notes: attemptNotes,
            recorded_barrier: selectedBarrier || undefined,
            barrier_details: barrierDetails || undefined
          }
        });
        setAttemptNotes('');
        setSelectedBarrier('');
        setBarrierDetails('');
        onUpdated();
        onClose();
        return;
      }

      const res = await fetch(`/api/followups/${task.id}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          channel,
          outcome,
          notes: attemptNotes,
          recorded_barrier: selectedBarrier || undefined,
          barrier_details: barrierDetails || undefined
        })
      });

      if (res.ok) {
        setAttemptNotes('');
        setSelectedBarrier('');
        setBarrierDetails('');
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.warn('Network issue logging attempt, enqueuing offline operation:', err);
      await queueOfflineOperation({
        entity_id: task.id,
        entity_type: 'followup_task',
        action_type: 'LOG_CONTACT_ATTEMPT',
        base_version: 1,
        payload: {
          channel,
          outcome,
          notes: attemptNotes,
          recorded_barrier: selectedBarrier || undefined,
          barrier_details: barrierDetails || undefined
        }
      });
      setAttemptNotes('');
      setSelectedBarrier('');
      setBarrierDetails('');
      onUpdated();
      onClose();
    } finally {
      setIsSubmittingAttempt(false);
    }
  };

  // Update Status & Completion
  const handleUpdateStatus = async () => {
    try {
      setIsUpdatingStatus(true);

      if (!navigator.onLine) {
        await queueOfflineOperation({
          entity_id: task.id,
          entity_type: 'followup_task',
          action_type: 'UPDATE_FOLLOWUP_TASK',
          base_version: 1,
          payload: {
            status: taskStatus,
            outcomeNotes,
            completionTimeMinutes: taskStatus === 'completed' ? completionMinutes : undefined
          }
        });
        onUpdated();
        onClose();
        return;
      }

      const res = await fetch(`/api/followups/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          status: taskStatus,
          outcomeNotes,
          completionTimeMinutes: taskStatus === 'completed' ? completionMinutes : undefined
        })
      });

      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.warn('Network issue updating task status, enqueuing offline operation:', err);
      await queueOfflineOperation({
        entity_id: task.id,
        entity_type: 'followup_task',
        action_type: 'UPDATE_FOLLOWUP_TASK',
        base_version: 1,
        payload: {
          status: taskStatus,
          outcomeNotes,
          completionTimeMinutes: taskStatus === 'completed' ? completionMinutes : undefined
        }
      });
      onUpdated();
      onClose();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                task.priority === 'critical' ? 'bg-red-500 text-white' :
                task.priority === 'high' ? 'bg-amber-400 text-slate-950' : 'bg-white/20 text-white'
              }`}>
                {task.priority} Priority
              </span>
              <span className="text-xs text-blue-100">Patient: {task.patient_name}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1.5">{task.title}</h3>
            <p className="text-xs text-blue-100/90">{task.instructions}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Worker</span>
              <strong className="text-slate-800 dark:text-slate-200">{task.assigned_to_name || 'Unassigned'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
              <strong className="text-slate-800 dark:text-slate-200">{task.due_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Channel</span>
              <strong className="text-slate-800 dark:text-slate-200">{task.contact_method}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Attempts</span>
              <strong className="text-slate-800 dark:text-slate-200">{task.attempt_count} recorded</strong>
            </div>
          </div>

          {/* SECTION 1: LOG NEW CONTACT ATTEMPT */}
          <form onSubmit={handleLogAttempt} className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 space-y-4">
            <div className="flex items-center space-x-2 text-cyan-900 dark:text-cyan-300 font-bold text-xs uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-cyan-600" />
              <span>Record Contact Attempt & Identify Barriers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Outreach Channel</label>
                <select
                  value={channel}
                  onChange={(e: any) => setChannel(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="phone">Telephone Outreach</option>
                  <option value="sms">SMS Text Message</option>
                  <option value="home_visit">In-Person Home Visit</option>
                  <option value="portal">Patient Portal Message</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Contact Outcome</label>
                <select
                  value={outcome}
                  onChange={(e: any) => setOutcome(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="reached">Patient Reached Directly</option>
                  <option value="family_contacted">Family Liaison Contacted</option>
                  <option value="voicemail">Left Detailed Voicemail</option>
                  <option value="no_answer">Ringing / No Answer</option>
                  <option value="number_disconnected">Disconnected / Wrong Number</option>
                </select>
              </div>
            </div>

            {/* Identified Barrier Dropdown */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Recorded Patient Barrier (Optional)</span>
              </label>
              <select
                value={selectedBarrier}
                onChange={(e: any) => setSelectedBarrier(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="">No barrier identified</option>
                <option value="transportation">Transportation / Distance Barrier</option>
                <option value="appointment_availability">Appointment Availability / Clinic Full</option>
                <option value="communication_difficulty">Communication / Language Barrier</option>
                <option value="financial_access">Financial or Health Coverage Difficulty</option>
                <option value="other">Other Operational Barrier</option>
              </select>
            </div>

            {selectedBarrier && (
              <div className="space-y-1 animate-in fade-in">
                <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  Barrier Mitigation Plan / Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched suburban transit voucher #V-401 or arranged Spanish liaison"
                  value={barrierDetails}
                  onChange={(e) => setBarrierDetails(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Attempt Notes</label>
              <textarea
                rows={2}
                value={attemptNotes}
                onChange={(e) => setAttemptNotes(e.target.value)}
                placeholder="Spoke with patient; reviewed transport arrangements..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingAttempt}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isSubmittingAttempt ? 'Saving...' : 'Log Contact Attempt'}
              </button>
            </div>
          </form>

          {/* SECTION 2: UPDATE TASK STATUS & OUTCOME */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Update Task Status & Record Outcomes</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'new', label: 'New' },
                { val: 'assigned', label: 'Assigned' },
                { val: 'in_progress', label: 'In Progress' },
                { val: 'waiting_for_response', label: 'Waiting' },
                { val: 'completed', label: 'Completed' },
                { val: 'escalated', label: 'Escalated' },
                { val: 'cancelled', label: 'Cancelled' }
              ].map(st => (
                <button
                  key={st.val}
                  type="button"
                  onClick={() => setTaskStatus(st.val as FollowupTaskStatus)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                    taskStatus === st.val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {taskStatus === 'completed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Intervention Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={completionMinutes}
                    onChange={(e) => setCompletionMinutes(parseInt(e.target.value) || 15)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-200 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Completion of task does not automatically mark clinical recovery.</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Intervention & Outcome Notes
              </label>
              <textarea
                rows={2}
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Record final resolution, appointment rescheduled date, or reason for escalation..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving...' : 'Update Task Status'}
              </button>
            </div>
          </div>

          {/* SECTION 3: CONTACT ATTEMPT AUDIT HISTORY */}
          {task.contact_attempts && task.contact_attempts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-cyan-600" />
                <span>Contact Attempt Audit Trail ({task.contact_attempts.length})</span>
              </h4>
              <div className="space-y-2">
                {task.contact_attempts.map((att) => (
                  <div key={att.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{att.channel}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-cyan-600 font-semibold capitalize">{att.outcome.replace('_', ' ')}</span>
                        {att.recorded_barrier && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Barrier: {att.recorded_barrier.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {att.notes && <p className="text-[11px] text-slate-500 mt-1">"{att.notes}"</p>}
                      {att.barrier_details && <p className="text-[10px] text-amber-600 mt-0.5 font-medium">Mitigation: {att.barrier_details}</p>}
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(att.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
