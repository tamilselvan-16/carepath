import React, { useState } from 'react';
import type { CareReferral, Patient } from '../../types';
import { CreateReferralModal } from './CreateReferralModal';
import { 
  X,
  Share2, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  Send,
  CheckSquare
} from 'lucide-react';

interface ReferralsManagementViewProps {
  referrals: CareReferral[];
  patients: Patient[];
  onRefresh: () => void;
  token?: string;
  facilityId: string;
}

export const ReferralsManagementView: React.FC<ReferralsManagementViewProps> = ({
  referrals,
  patients,
  onRefresh,
  token,
  facilityId
}) => {
  const [selectedRef, setSelectedRef] = useState<CareReferral | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Escalation / Verification action state
  const [actionReason, setActionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const filteredReferrals = referrals.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = 
      r.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referred_to_facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const overdueCount = referrals.filter(r => r.is_overdue || r.status === 'overdue').length;
  const escalatedCount = referrals.filter(r => r.status === 'escalated' || r.is_escalated).length;
  const completedCount = referrals.filter(r => r.status === 'completed').length;

  // Acknowledge Referral
  const handleAcknowledge = async (refId: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch(`/api/referrals/${refId}/acknowledge`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || 'dev-token'}` }
      });
      if (res.ok) {
        onRefresh();
        setSelectedRef(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Escalate Delayed Referral
  const handleEscalate = async (refId: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch(`/api/referrals/${refId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({ reason: actionReason || 'Outpatient delay exceeding standard timeline' })
      });
      if (res.ok) {
        setActionReason('');
        onRefresh();
        setSelectedRef(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Verify Completion
  const handleVerify = async (refId: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch(`/api/referrals/${refId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({ notes: actionReason || 'Receiving facility verified completion with clinical discharge documentation.' })
      });
      if (res.ok) {
        setActionReason('');
        onRefresh();
        setSelectedRef(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Share2 className="w-6 h-6 text-cyan-200" />
            <h2 className="text-xl font-bold tracking-tight">Closed-Loop Referral Management</h2>
          </div>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            Track external specialty & rehab referrals: dispatch, receiving facility acknowledgement, target completion dates, delay escalation, and verified completion.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Referral</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Overdue Referrals</span>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{overdueCount}</p>
            <span className="text-[11px] text-red-500 font-semibold">Exceeded completion target</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Escalated Referrals</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{escalatedCount}</p>
            <span className="text-[11px] text-amber-600 font-semibold">Liaison outreach active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Verified Completed</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
            <span className="text-[11px] text-emerald-500 font-semibold">Closed-loop confirmed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search specialty, receiving facility or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'All Referrals' },
                { id: 'pending', label: 'Pending' },
                { id: 'acknowledged', label: 'Acknowledged' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'escalated', label: 'Escalated' },
                { id: 'completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Referrals */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredReferrals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No referrals found matching your filter criteria.
            </div>
          ) : (
            filteredReferrals.map((ref) => (
              <div
                key={ref.id}
                onClick={() => setSelectedRef(ref)}
                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      ref.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      ref.status === 'escalated' ? 'bg-red-100 text-red-800' :
                      ref.is_overdue || ref.status === 'overdue' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ref.status}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {ref.specialty}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Destination: <strong className="text-slate-800 dark:text-slate-100">{ref.referred_to_facility}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Reason: {ref.referral_reason}
                  </p>
                  <div className="text-[11px] text-teal-600 font-semibold">
                    Patient: {ref.patient_name} ({ref.patient_mrn || 'CLP-2026-UNKN'})
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col sm:items-end justify-between items-center text-xs text-slate-500 shrink-0 gap-1.5">
                  <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: <strong>{ref.target_completion_date}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Issued: {ref.referral_date}
                  </div>
                  {ref.acknowledged_date ? (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Awaiting Intake Acknowledgment</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Selected Referral Closed-Loop Action Modal */}
      {selectedRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-teal-700 to-cyan-700 text-white flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20">
                  {selectedRef.status}
                </span>
                <h4 className="font-bold text-base mt-1 text-white">{selectedRef.specialty}</h4>
                <p className="text-xs text-teal-100">Patient: {selectedRef.patient_name}</p>
              </div>
              <button onClick={() => setSelectedRef(null)} className="p-1.5 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedRef.referred_to_facility}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Date:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedRef.target_completion_date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Clinical Reason:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{selectedRef.referral_reason}</p>
                </div>
                {selectedRef.notes && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Liaison Notes:</span>
                    <p className="text-slate-600 dark:text-slate-400 italic">"{selectedRef.notes}"</p>
                  </div>
                )}
              </div>

              {/* Action Notes Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Closed-Loop Resolution / Escalation Note
                </label>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Record receiving facility confirmation, delay cause, or discharge note..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                {!selectedRef.acknowledged_date && selectedRef.status !== 'completed' && (
                  <button
                    onClick={() => handleAcknowledge(selectedRef.id)}
                    disabled={isProcessingAction}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Acknowledge Intake</span>
                  </button>
                )}

                {selectedRef.status !== 'completed' && (
                  <button
                    onClick={() => handleEscalate(selectedRef.id)}
                    disabled={isProcessingAction}
                    className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Escalate Delay</span>
                  </button>
                )}

                {selectedRef.status !== 'completed' && (
                  <button
                    onClick={() => handleVerify(selectedRef.id)}
                    disabled={isProcessingAction}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Verify Completion</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRef(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Referral Modal */}
      <CreateReferralModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={onRefresh}
        patients={patients}
        facilityId={facilityId}
        token={token}
      />

    </div>
  );
};
