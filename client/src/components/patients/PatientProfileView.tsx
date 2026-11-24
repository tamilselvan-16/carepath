import React, { useState, useEffect } from 'react';
import type { Patient, PathwayStep } from '../../types';
import { CareJourneyTimeline } from '../journeys/CareJourneyTimeline';
import { ActivityDetailModal } from '../journeys/ActivityDetailModal';
import { PatientQRCode } from './PatientQRCode';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Route,
  CalendarCheck,
  Share2,
  CheckSquare,
  History,
  Edit3,
  AlertTriangle,
  ShieldCheck,
  Printer
} from 'lucide-react';

interface PatientProfileViewProps {
  patientId: string;
  onClose: () => void;
  onEditPatient: (patient: Patient) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onClose,
  onEditPatient
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'activities' | 'referrals' | 'followups' | 'history'>('overview');
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consentUpdating, setConsentUpdating] = useState(false);
  const [activeStepForEdit, setActiveStepForEdit] = useState<PathwayStep | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/patients/${patientId}/history`, {
        headers: { 'Authorization': 'Bearer dev-token' }
      });
      if (res.ok) {
        setHistoryData(await res.json());
      }
    } catch (e) {
      console.warn('History fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const handleConsentToggle = async (newConsent: 'granted' | 'revoked' | 'pending') => {
    try {
      setConsentUpdating(true);
      const res = await fetch(`/api/patients/${patientId}/consent`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({ consent_status: newConsent, notes: `Consent status transitioned to ${newConsent}` })
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConsentUpdating(false);
    }
  };

  if (isLoading || !historyData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 animate-pulse">
        Loading complete clinical continuity profile...
      </div>
    );
  }

  const { patient, careJourneys, activities, referrals, followups, careGaps, auditHistory } = historyData;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-6">

      {/* Profile Header Banner */}
      <div className="p-6 bg-linear-to-r from-cyan-700 via-blue-700 to-indigo-800 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shrink-0">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black">{patient.first_name} {patient.last_name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-cyan-100 mt-1 flex flex-wrap items-center gap-2">
                <span>DOB: {patient.date_of_birth}</span>
                <span>&bull;</span>
                <span>Gender: {patient.gender}</span>
                <span>&bull;</span>
                <span>Language: {patient.primary_language}</span>
                <span>&bull;</span>
                <span>Registered: {patient.registration_date}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEditPatient(patient)}
              className="px-4 py-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs flex items-center space-x-2 transition-all shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-cyan-600" />
              <span>Edit Patient Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Navigation Tabs */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex space-x-6 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'journey', label: `Care Journey (${careJourneys.length})`, icon: Route },
          { id: 'activities', label: `Activities (${activities.total})`, icon: CalendarCheck },
          { id: 'referrals', label: `Referrals (${referrals.length})`, icon: Share2 },
          { id: 'followups', label: `Follow-ups (${followups.length})`, icon: CheckSquare },
          { id: 'history', label: `History & Audit (${auditHistory.length})`, icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${isActive
                  ? 'border-cyan-600 text-cyan-700 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6 pt-0 space-y-6 text-xs">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1 & 2: Vitals & Identifiers */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Contact & Clinical Identifiers
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-cyan-600" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-cyan-600" />
                    <span>{patient.email || 'No email recorded'}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span>{patient.address || 'Address unlisted'}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Emergency Liaison: {patient.emergency_contact_name} ({patient.emergency_contact_phone})</span>
                  </div>
                </div>
              </div>

              {/* Active Care Gaps if any */}
              {careGaps.length > 0 && (
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2">
                  <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Active Predictive Care Gaps Detected</span>
                  </div>
                  {careGaps.map((g: any) => (
                    <div key={g.id} className="text-red-700 dark:text-red-300 text-xs">
                      <strong>{g.title}</strong> &bull; {g.description}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Consent & Continuity Metrics */}
            <div className="space-y-4">
              {/* Digital Continuity Card & Scannable QR Code */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Physical Clinic Check-in QR</span>
                <div className="flex justify-center pt-1">
                  <PatientQRCode 
                    value={`https://CarePath.internal/portal?mrn=${patient.mrn}&dob=${patient.date_of_birth}`}
                    size={95}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Payload: {patient.mrn}</div>
                <button
                  onClick={() => window.print()}
                  className="w-full mt-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Print Patient QR Card</span>
                </button>
              </div>

              {/* Continuity Score */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Patient Continuity Score</span>
                <p className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{patient.continuity_score}%</p>
                <div className="mt-2 text-[11px] text-slate-500">
                  Risk Level: <strong className="uppercase text-slate-800 dark:text-slate-200">{patient.risk_level}</strong>
                </div>
              </div>

              {/* Consent Management Widget */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Consent Management</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${patient.consent_status === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {patient.consent_status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  HIPAA-compliant authorization for phone outreach & digital continuity tracking.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConsentToggle('granted')}
                    disabled={consentUpdating || patient.consent_status === 'granted'}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] disabled:opacity-40"
                  >
                    Grant
                  </button>
                  <button
                    onClick={() => handleConsentToggle('revoked')}
                    disabled={consentUpdating || patient.consent_status === 'revoked'}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] disabled:opacity-40"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CARE JOURNEYS */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {careJourneys.length === 0 ? (
              <p className="text-slate-400 py-8 text-center text-xs">No active care journeys assigned yet.</p>
            ) : (
              careJourneys.map((pw: any) => (
                <div key={pw.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pw.title || pw.protocol_name}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Start: {pw.start_date} &bull; Target Completion: {pw.expected_completion_date}</p>
                    </div>
                    <span className="font-bold text-cyan-600 text-sm">{pw.overall_progress_pct}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${pw.overall_progress_pct}%` }} />
                  </div>

                  {/* Embedded Visual Timeline */}
                  {pw.steps && pw.steps.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <CareJourneyTimeline
                        steps={pw.steps}
                        onSelectStep={(step) => setActiveStepForEdit(step)}
                        canEdit={true}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITIES */}
        {activeTab === 'activities' && (
          <div className="space-y-3">
            {activities.all.map((step: any) => (
              <div key={step.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${step.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        step.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {step.status}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white">{step.title}</h5>
                  </div>
                  <p className="text-slate-500 mt-1">{step.notes || 'Routine protocol milestone'}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Due: {step.due_date}</span>
                  <div className="font-bold text-cyan-600">{step.activity_type}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: REFERRALS */}
        {activeTab === 'referrals' && (
          <div className="space-y-3">
            {referrals.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No external or outpatient referrals recorded.</p>
            ) : (
              referrals.map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{r.specialty}</h5>
                    <p className="text-slate-500 mt-0.5">Destination: {r.referred_to_facility}</p>
                    <p className="text-slate-400 text-[11px] mt-1">{r.notes}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {r.status}
                    </span>
                    <div className="text-slate-400 mt-1">Target: {r.target_completion_date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: FOLLOW-UPS */}
        {activeTab === 'followups' && (
          <div className="space-y-3">
            {followups.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No coordinator follow-ups on queue.</p>
            ) : (
              followups.map((f: any) => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {f.priority}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white">{f.title}</h5>
                    </div>
                    <p className="text-slate-500 mt-1">{f.instructions}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{f.status}</span>
                    <div className="text-slate-400">{f.due_date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 6: HISTORY & AUDIT */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {auditHistory.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No audit trail records logged yet.</p>
            ) : (
              auditHistory.map((a: any) => (
                <div key={a.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{a.action}</span>
                    <p className="text-slate-400 text-[11px]">{JSON.stringify(a.details)}</p>
                  </div>
                  <span className="text-slate-400 text-[11px]">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Activity Edit Modal */}
      <ActivityDetailModal
        step={activeStepForEdit}
        isOpen={!!activeStepForEdit}
        onClose={() => setActiveStepForEdit(null)}
        onUpdated={() => {
          fetchHistory();
        }}
      />
    </div>
  );
};
