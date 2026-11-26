import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldAlert,
  Clock,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import type { Patient, PatientPathway } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DoctorClinicalCopilotProps {
  patients: Patient[];
  pathways: PatientPathway[];
}

export const DoctorClinicalCopilot: React.FC<DoctorClinicalCopilotProps> = ({
  patients,
  pathways
}) => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [signed, setSigned] = useState<boolean>(false);

  const [copilotData, setCopilotData] = useState<{
    trajectory_status: 'on_track' | 'at_risk' | 'critical_deviation';
    adherence_score: number;
    deviation_alerts: {
      severity: 'warning' | 'critical';
      title: string;
      detail: string;
      protocolWindow: string;
    }[];
    prognostic_continuity_summary: string;
    counter_referral_brief: {
      clinical_course_summary: string;
      interventions_rendered: string[];
      pending_investigations_and_labs: string[];
      red_flag_warning_symptoms: string[];
      recommended_counter_referral_plan: string;
      attending_physician_statement: string;
    };
    provider: string;
    safety_disclaimer: string;
  } | null>(null);

  // Set default selected patient
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientPathway = pathways.find(pw => pw.patient_id === selectedPatientId) || pathways[0];

  const handleFetchCopilot = async () => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setSigned(false);

    try {
      const res = await fetch('/api/innovations/clinical-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          pathwayId: patientPathway?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotData(data);
      }
    } catch (err) {
      console.error('Failed to load clinical copilot data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      handleFetchCopilot();
    }
  }, [selectedPatientId]);

  const handleCopyBrief = () => {
    if (!copilotData) return;
    const b = copilotData.counter_referral_brief;
    const text = `CLINICAL CONTINUITY & COUNTER-REFERRAL BRIEF
Patient: ${selectedPatient?.first_name} ${selectedPatient?.last_name} (MRN: ${selectedPatient?.mrn})
Attending Physician: ${user?.full_name || 'Dr. Sarah Jenkins, MD'}
Date: ${new Date().toLocaleDateString()}

1. CLINICAL COURSE:
${b.clinical_course_summary}

2. INTERVENTIONS RENDERED:
${b.interventions_rendered.map(i => `• ${i}`).join('\n')}

3. PENDING INVESTIGATIONS & LABS:
${b.pending_investigations_and_labs.map(i => `• ${i}`).join('\n')}

4. RED-FLAG SYMPTOMS FOR IMMEDIATE TRIAGE:
${b.red_flag_warning_symptoms.map(s => `⚠ ${s}`).join('\n')}

5. COUNTER-REFERRAL INSTRUCTIONS:
${b.recommended_counter_referral_plan}

SIGN-OFF:
${b.attending_physician_statement}
Verified: ${user?.full_name || 'Dr. Sarah Jenkins, MD'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Physician Header */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-800 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Stethoscope className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">AI Clinical Trajectory & Counter-Referral Copilot</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                  Physician Oversight
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Clinical protocol trajectory forecasting, protocol deviation detection, and automated counter-referral briefs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-xl bg-black/20 text-xs font-semibold backdrop-blur-sm border border-white/15 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-300" />
              <span>Attending Physician Review Required</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Patient Selection Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider shrink-0">
              Active Cohort Patient:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} — {p.mrn} ({p.risk_level.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFetchCopilot}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Synthesizing...' : 'Re-analyze Clinical Trajectory'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Synthesizing clinical recovery trajectory and protocol adherence...
            </p>
          </div>
        ) : copilotData ? (
          <div className="space-y-6">
            {/* Top Trajectory Gauge & Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Adherence Score */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Protocol Adherence Score
                  </p>
                  <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {copilotData.adherence_score}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Care interval compliance
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              {/* Trajectory Status */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Recovery Trajectory Status
                  </p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 ${
                      copilotData.trajectory_status === 'on_track'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : copilotData.trajectory_status === 'at_risk'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      <span>{copilotData.trajectory_status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Supervised secondary prevention
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-200 dark:border-indigo-800">
                  <HeartPulse className="w-6 h-6" />
                </div>
              </div>

              {/* Protocol Deviations Count */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Flagged Deviations
                  </p>
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {copilotData.deviation_alerts.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Requiring physician review
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Prognostic Continuity Summary */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 text-xs sm:text-sm text-blue-950 dark:text-blue-100 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Clinical Continuity Assessment: </span>
                <span>{copilotData.prognostic_continuity_summary}</span>
              </div>
            </div>

            {/* Protocol Deviation Alerts */}
            {copilotData.deviation_alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Protocol Deviation Flags & Window Audits</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {copilotData.deviation_alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          alert.severity === 'critical'
                            ? 'bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                            : 'bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {alert.protocolWindow}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {alert.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Counter-Referral / Discharge Brief */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Automated Counter-Referral & Clinical Continuity Brief
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standardized handover for primary care and community follow-up teams
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyBrief}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Brief'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Brief Content */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs mb-1">
                    1. Summary of Clinical Course
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {copilotData.counter_referral_brief.clinical_course_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs mb-2">
                      2. Interventions Completed
                    </h4>
                    <ul className="space-y-1.5">
                      {copilotData.counter_referral_brief.interventions_rendered.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs mb-2">
                      3. Pending Follow-up Labs
                    </h4>
                    <ul className="space-y-1.5">
                      {copilotData.counter_referral_brief.pending_investigations_and_labs.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-xs mb-2">
                    4. Red-Flag Warning Symptoms for Immediate Care Escalation
                  </h4>
                  <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                    {copilotData.counter_referral_brief.red_flag_warning_symptoms.map((symptom, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs font-medium text-rose-900 dark:text-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs mb-1">
                    5. Counter-Referral Plan for Primary Care / Community Navigator
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {copilotData.counter_referral_brief.recommended_counter_referral_plan}
                  </p>
                </div>

                {/* Digital Attending Sign-Off */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Attending Physician Oversight</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {user?.full_name || 'Dr. Sarah Jenkins, MD'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Cardiology & Interventional Care Continuity
                    </p>
                  </div>

                  <button
                    onClick={() => setSigned(true)}
                    disabled={signed}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                      signed
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{signed ? 'Brief Endorsed & Signed' : 'Sign & Endorse Brief'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
