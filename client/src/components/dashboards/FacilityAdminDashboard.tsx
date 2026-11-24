import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';

export const FacilityAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Facility Admin Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-800 via-cyan-800 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">Facility Resource & Protocol Management</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  St. Jude Metro Central
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-1">
                Continuity protocol compliance, care coordinator workloads, and recovery retention analytics.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-teal-200">Facility Administrator</div>
            <div className="text-sm font-bold text-white">{user?.full_name}</div>
          </div>
        </div>
      </div>

      {/* Facility KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Protocols</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">3 Pathways</p>
          <div className="mt-2 text-xs text-slate-500">PCI, Diabetes & Ortho TKA</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovery Retention</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">92.6%</p>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            <span>Above national benchmark</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coordinator Workload</p>
          <p className="text-3xl font-extrabold text-cyan-600 mt-1">14.2</p>
          <div className="mt-2 text-xs text-slate-500">Patients / active coordinator</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transit Barrier Resolution</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">88%</p>
          <div className="mt-2 text-xs text-slate-500">Community vouchers granted</div>
        </div>
      </div>

      {/* Protocol Performance Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-600" />
          <span>Care Protocol Milestones & Pathway Performance</span>
        </h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-xs">Post-Percutaneous Coronary Intervention (PCI) 90-Day Recovery</span>
              <span className="text-xs font-bold text-cyan-700">84.5% on-track</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-cyan-600 rounded-full" style={{ width: '84.5%' }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-xs">Type 2 Diabetes Mellitus Intensive Continuity (180-Day)</span>
              <span className="text-xs font-bold text-emerald-700">91.0% on-track</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '91%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
