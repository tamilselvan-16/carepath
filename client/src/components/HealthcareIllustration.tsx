import React from 'react';
import { HeartPulse, Activity, ShieldCheck, UserCheck, Stethoscope, Clock, Zap } from 'lucide-react';

export const HealthcareIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative Gradient Glow */}
      <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-cyan-400/20 via-blue-500/20 to-teal-400/20 blur-xl opacity-70" />

      {/* Main Glass Illustration Card */}
      <div className="relative bg-white/95 rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md overflow-hidden">
        {/* Background Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] bg-size-[16px_16px] opacity-[0.04]" />

        {/* Floating Header Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Care Continuity Engine</div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Monitoring Active Pathways</span>
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            Phase 1 Live
          </span>
        </div>

        {/* Visual Continuity Journey Path */}
        <div className="space-y-3.5 my-6 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-4.75 top-4 bottom-4 w-0.5 bg-linear-to-b from-emerald-400 via-cyan-400 to-amber-400" />

          {/* Step 1: Inpatient Discharge */}
          <div className="flex items-center space-x-3.5 relative z-10 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-slate-900">Hospital Discharge Protocol</h4>
                <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">Post-PCI Medication bundle & education confirmed</p>
            </div>
          </div>

          {/* Step 2: 48-Hour Virtual Check-in */}
          <div className="flex items-center space-x-3.5 relative z-10 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-slate-900">48h Nurse Phone Outreach</h4>
                <span className="text-[10px] text-cyan-600 font-semibold">Verified</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">Vital signs stable & antiplatelet adherence checked</p>
            </div>
          </div>

          {/* Step 3: Predictive Care Gap Warning (Intervention triggered) */}
          <div className="flex items-center space-x-3.5 relative z-10 bg-amber-50/90 p-3 rounded-2xl border border-amber-300 shadow-sm ring-2 ring-amber-400/20">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-amber-950">Cardiac Rehab Milestone (+7d)</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Care Gap Detected
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Transit barrier flagged &bull; Coordinator outreach dispatched
              </p>
            </div>
          </div>

          {/* Step 4: Coordinated Specialty Follow-up */}
          <div className="flex items-center space-x-3.5 relative z-10 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-xs font-bold text-slate-900">Cardiology Specialist Review</h4>
                <span className="text-[10px] text-slate-400 font-medium">Scheduled (Day 45)</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">Lipid panel & ECG verification scheduled</p>
            </div>
          </div>
        </div>

        {/* Metrics Footer Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Continuity Index</div>
            <div className="text-xl font-extrabold text-cyan-900 mt-0.5">94.8%</div>
            <div className="text-[10px] text-cyan-700 flex items-center space-x-1 mt-0.5">
              <Zap className="w-3 h-3" />
              <span>Predictive tracking active</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Gaps Mitigated</div>
            <div className="text-xl font-extrabold text-blue-900 mt-0.5">142</div>
            <div className="text-[10px] text-blue-700 flex items-center space-x-1 mt-0.5">
              <Activity className="w-3 h-3" />
              <span>Prior to readmission risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
