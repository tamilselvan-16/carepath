import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Database,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">System Administrator Control Center</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  Global Tenant Authority
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Overseeing multi-facility security posture, user permissions, audit logs, and non-diagnostic ML models.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Signed in Administrator</div>
            <div className="text-sm font-bold text-white">{user?.full_name}</div>
          </div>
        </div>
      </div>

      {/* Admin KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Facilities</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">2 Hospitals</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            <span>100% HIPAA audit compliant</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Personnel</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">42 Users</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Across 4 validated clinical roles
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ML Prediction Engine</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">Operational</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Latency &lt; 28ms &bull; Non-diagnostic
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Log Trace</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">1,840 Events</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Real-time access logging enabled
          </div>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-600" />
            <span>Role-Based Access Control (RBAC) Governance</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure system permissions, enforce multi-factor authentication requirements, and audit clinical data access across all hospital units.
          </p>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Doctor / Physician Role</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Clinical Review</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Healthcare Worker Role</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Care Outreach</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-800">Facility Administrator Role</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Protocol Oversight</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Database & Supabase Connection Status</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dual-mode persistence active. Multi-tenant partitioning ensures facility data isolation according to healthcare compliance mandates.
          </p>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Database Integrity Verified</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Row Level Security (RLS) rules initialized across 11 relational entities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
