import React, { useState } from 'react';
import type { Patient } from '../../types';
import { X } from 'lucide-react';

interface CreateReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patients: Patient[];
  facilityId: string;
  token?: string;
}

export const CreateReferralModal: React.FC<CreateReferralModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  facilityId,
  token
}) => {
  if (!isOpen) return null;

  const [patientId, setPatientId] = useState(patients.length > 0 ? patients[0].id : '');
  const [receivingFacilityId, setReceivingFacilityId] = useState('a0000000-0000-0000-0000-000000000002');
  const [referredToFacility, setReferredToFacility] = useState('Highland Valley Regional Medical Center');
  const [specialty, setSpecialty] = useState('Cardiac Rehabilitation');
  const [referralReason, setReferralReason] = useState('Phase II supervised exercise and secondary risk management post-stent placement');
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !referralReason.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          facility_id: facilityId,
          receiving_facility_id: receivingFacilityId,
          referred_to_facility: referredToFacility,
          patient_id: patientId,
          specialty,
          referral_reason: referralReason,
          target_completion_date: targetCompletionDate,
          notes
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error creating referral:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-800 text-white flex justify-between items-center">
          <div>
            <h4 className="font-bold text-base">Issue Care Referral</h4>
            <p className="text-xs text-cyan-100">Inter-facility outpatient and specialty coordination</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Receiving Facility *</label>
              <select
                value={receivingFacilityId}
                onChange={(e) => {
                  setReceivingFacilityId(e.target.value);
                  setReferredToFacility(
                    e.target.value === 'a0000000-0000-0000-0000-000000000001'
                      ? 'CarePath Central Hospital'
                      : 'Highland Valley Regional Medical Center'
                  );
                }}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="a0000000-0000-0000-0000-000000000002">Highland Valley Regional</option>
                <option value="a0000000-0000-0000-0000-000000000001">CarePath Central Hospital</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Specialty *</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Cardiac Rehabilitation">Cardiac Rehabilitation</option>
                <option value="Nephrology Consult">Nephrology Consult</option>
                <option value="Endocrinology & Nutrition">Endocrinology & Nutrition</option>
                <option value="Physical Therapy">Physical Therapy</option>
                <option value="Pulmonary Rehabilitation">Pulmonary Rehabilitation</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target Completion Date *</label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Referral Reason & Clinical Objective *</label>
            <textarea
              rows={2}
              value={referralReason}
              onChange={(e) => setReferralReason(e.target.value)}
              placeholder="Clinical basis for outpatient specialty referral..."
              required
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Special Instructions / Liaison Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Transport requirements, language preference, or insurance prior-auth..."
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
              disabled={isSubmitting || !referralReason.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Transmitting...' : 'Issue Care Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
