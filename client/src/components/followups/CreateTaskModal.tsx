import React, { useState } from 'react';
import type { Patient } from '../../types';
import { X } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  facilityId: string;
  token?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  facilityId,
  token
}) => {
  if (!isOpen) return null;

  const [patientId, setPatientId] = useState(patients.length > 0 ? patients[0].id : '');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [priority, setPriority] = useState<'low' | 'moderate' | 'high' | 'critical'>('high');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [contactMethod, setContactMethod] = useState('Phone Outreach');
  const [assignedToName, setAssignedToName] = useState('Elena Rostova, RN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !title.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          facility_id: facilityId,
          patient_id: patientId,
          title,
          instructions,
          priority,
          due_date: dueDate,
          contact_method: contactMethod,
          assigned_to_name: assignedToName
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h4 className="font-bold text-base">Create Follow-Up Outreach Task</h4>
            <p className="text-xs text-blue-100">Manual administrative coordination assignment</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1.5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Schedule Specialized Transport for Rehab"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="low">Low Priority</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Contact Method</label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Phone Outreach">Phone Outreach</option>
                <option value="SMS Message">SMS Message</option>
                <option value="Home Visit">In-Person Home Visit</option>
                <option value="Family Liaison">Family Liaison Outreach</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Worker</label>
              <input
                type="text"
                value={assignedToName}
                onChange={(e) => setAssignedToName(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Instructions & Objectives</label>
            <textarea
              rows={3}
              placeholder="Detailed follow-up protocol instructions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
