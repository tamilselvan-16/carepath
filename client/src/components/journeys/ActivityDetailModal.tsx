import React, { useState } from 'react';
import type { PathwayStep, ActivityStatus, SupportingDocument } from '../../types';
import { queueOfflineOperation } from '../../services/offlineQueue';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  FileText, 
  User, 
  ExternalLink 
} from 'lucide-react';

interface ActivityDetailModalProps {
  step: PathwayStep | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  token?: string;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  step,
  isOpen,
  onClose,
  onUpdated,
  token
}) => {
  if (!isOpen || !step) return null;

  const [status, setStatus] = useState<ActivityStatus>(step.status);
  const [completedDate, setCompletedDate] = useState<string>(
    step.completed_date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(step.notes || '');
  const [assignedWorkerName, setAssignedWorkerName] = useState<string>(
    step.assigned_worker_name || ''
  );
  const [documents, setDocuments] = useState<SupportingDocument[]>(
    step.supporting_documents || []
  );

  // New Document Input State
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docType, setDocType] = useState('Lab Report / PDF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveActivity = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Check if browser is offline or if network request fails
      if (!navigator.onLine) {
        await queueOfflineOperation({
          entity_id: step.id,
          entity_type: 'pathway_step',
          action_type: 'UPDATE_ACTIVITY_STATUS',
          base_version: 1,
          payload: {
            status,
            notes,
            assigned_worker_name: assignedWorkerName,
            completed_date: status === 'completed' ? completedDate : undefined
          }
        });
        onUpdated();
        onClose();
        return;
      }

      const res = await fetch(`/api/activities/${step.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          status,
          notes,
          assigned_worker_name: assignedWorkerName,
          completed_date: status === 'completed' ? completedDate : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update activity status');
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      // Graceful offline fallback if fetch failed due to network error
      if (!navigator.onLine || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        await queueOfflineOperation({
          entity_id: step.id,
          entity_type: 'pathway_step',
          action_type: 'UPDATE_ACTIVITY_STATUS',
          base_version: 1,
          payload: {
            status,
            notes,
            assigned_worker_name: assignedWorkerName,
            completed_date: status === 'completed' ? completedDate : undefined
          }
        });
        onUpdated();
        onClose();
      } else {
        setErrorMsg(err.message || 'Error updating activity');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMockDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    try {
      const newDoc = {
        name: docName,
        url: docUrl.trim() || 'https://CarePath-ehr-docs.internal/sample-discharge-slip.pdf',
        file_type: docType,
        uploaded_by: assignedWorkerName || 'Care Coordinator'
      };

      const res = await fetch(`/api/activities/${step.id}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify(newDoc)
      });

      if (res.ok) {
        const savedDoc = await res.json();
        setDocuments(prev => [...prev, savedDoc]);
        setDocName('');
        setDocUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
              Activity Milestone Update
            </span>
            <h3 className="text-lg font-bold mt-1 text-white">{step.title}</h3>
            <p className="text-xs text-cyan-100">Scheduled Due Date: {step.due_date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Activity Status Radios */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Care Activity Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: 'not_started', label: 'Not Started', color: 'border-slate-300' },
                { val: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
                { val: 'pending', label: 'Pending', color: 'border-amber-500' },
                { val: 'completed', label: 'Completed', color: 'border-emerald-500' },
                { val: 'overdue', label: 'Overdue', color: 'border-red-500' },
                { val: 'cancelled', label: 'Cancelled', color: 'border-slate-400' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setStatus(opt.val as ActivityStatus)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    status === opt.val
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-600 text-cyan-800 dark:text-cyan-200 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Completion Date (if status is completed) */}
          {status === 'completed' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Verified Date of Completion
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>
          )}

          {/* Responsible Healthcare Worker */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Assigned Healthcare Worker / Lead
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={assignedWorkerName}
                onChange={(e) => setAssignedWorkerName(e.target.value)}
                placeholder="e.g. Elena Rostova, RN or Dr. Marcus Brody"
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Milestone Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Clinical & Continuity Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record patient phone feedback, pharmacy delivery verification, lab requisition slips..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Supporting Documents Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Supporting Documents & Lab Slips
              </label>
              <span className="text-[11px] text-slate-400">{documents.length} Uploaded</span>
            </div>

            {/* Existing Documents List */}
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={doc.id || i} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({doc.file_type})</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Upload Form */}
            <form onSubmit={handleUploadMockDoc} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5 text-cyan-600" />
                <span>Attach New Clinical Document</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Quest Lipid Panel)"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  <option value="Lab Report / PDF">Lab Report / PDF</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Referral Slip">Referral Slip</option>
                  <option value="Rehab Intake Form">Rehab Intake Form</option>
                  <option value="Consent Form">Consent Form</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!docName.trim()}
                className="w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold disabled:opacity-50 transition-colors"
              >
                Upload Supporting File
              </button>
            </form>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveActivity}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Activity Changes'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
