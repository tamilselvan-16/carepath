import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Stethoscope, 
  HeartPulse 
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-700 to-teal-800 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">Clinical Continuity & Physician Oversight</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                  Physician Workspace
                </span>
              </div>
              <p className="text-xs text-cyan-100 mt-1">
                Supervising post-discharge clinical intervals, lab verification, and high-risk recovery journeys.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-cyan-200">Attending Physician</div>
            <div className="text-sm font-bold text-white">{user?.full_name}</div>
          </div>
        </div>
      </div>

      {/* Clinical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients Under Clinical Review</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">18</p>
          <div className="mt-2 text-xs text-slate-500">Post-PCI & Diabetic management cohorts</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Lab Milestones</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">5</p>
          <div className="mt-2 text-xs text-amber-700">Day 45 Lipid & Renal profiles pending</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Continuity Adherence Rate</p>
          <p className="text-3xl font-extrabold text-cyan-600 mt-1">87.4%</p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">&uarr; 3.1% protocol completion</div>
        </div>
      </div>

      {/* Urgent Clinical Pathway Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-red-600" />
            <span>Urgent Clinical Interventions Required</span>
          </h3>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            2 Alerts
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-900 uppercase">
                  Critical
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Arthur Pendleton (MRN-2026-7733)</h4>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Post-PCI Day 50. Missing scheduled renal blood draw; 2 consecutive missed coordinator contacts.
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shrink-0">
              Review Lab Orders & Escalate
            </button>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                  High Risk
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Robert Miller (MRN-2026-9102)</h4>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Post-PCI Day 35. Overdue cardiac rehab enrollment. Antiplatelet medication adherence verified.
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold transition-colors shrink-0">
              Sign Telehealth Protocol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
