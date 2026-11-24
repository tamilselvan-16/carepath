import React, { useState } from 'react';
import type { Patient } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit3,
  Sparkles
} from 'lucide-react';

interface PatientManagementViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onOpenRegisterModal: () => void;
  onOpenEditModal: (patient: Patient) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({
  patients,
  onSelectPatient,
  onOpenRegisterModal,
  onOpenEditModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_recovery' | 'completed' | 'paused'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('all');
  const [showSyntheticNotice, setShowSyntheticNotice] = useState(true);

  // Filter logic
  const filtered = patients.filter(p => {
    const matchesSearch =
      searchTerm === '' ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.care_status === statusFilter;
    const matchesRisk = riskFilter === 'all' || p.risk_level === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">

      {/* Optional Synthetic Dataset Banner */}
      {showSyntheticNotice && (
        <div className="p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-950 dark:text-cyan-200">
                Hackathon Synthetic Patient Dataset Active
              </span>
              <p className="text-cyan-800 dark:text-cyan-300 mt-0.5 leading-relaxed">
                De-identified synthetic patient cohorts with unique reference IDs (CLP-2026-XXXX),
                consent compliance tracking, and facility multi-tenant boundary checks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSyntheticNotice(false)}
            className="text-[11px] text-cyan-700 hover:text-cyan-900 font-bold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Header & Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-600" />
              <span>Patient Continuity Management Directory</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Register patients, generate reference IDs, inspect care journeys, and track consent
            </p>
          </div>

          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-xs hover:shadow flex items-center space-x-2 shrink-0 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">

          {/* Patient Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Patient Name, ID (CLP-2026-XXXX), Phone or Email..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Care Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="all">All Care Statuses</option>
              <option value="active">Active Recovery</option>
              <option value="in_recovery">In Recovery Protocol</option>
              <option value="completed">Completed Journey</option>
              <option value="paused">Paused Care</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="sm:col-span-3">
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
            >
              <option value="all">All Risk Tiers</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>

        </div>
      </div>

      {/* Patients Table & Responsive Card View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            Matching Patients ({filtered.length})
          </span>
          <span className="text-slate-400">Click a record to open full profile & history</span>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Patient Reference ID / Name</th>
                <th className="py-3 px-4">DOB & Contact</th>
                <th className="py-3 px-4">Consent Status</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Continuity Index</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="group-hover:text-cyan-600 transition-colors">
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400">
                      {patient.mrn}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    <div>{patient.phone}</div>
                    <div className="text-[11px] text-slate-400">DOB: {patient.date_of_birth} ({patient.primary_language})</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${patient.consent_status === 'granted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                      {patient.consent_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${patient.risk_level === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                        patient.risk_level === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                      {patient.risk_level}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">{patient.continuity_score}%</span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-600 h-full rounded-full"
                          style={{ width: `${patient.continuity_score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-cyan-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="View Full Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(patient);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit Patient"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
