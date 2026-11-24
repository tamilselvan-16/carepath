import React from 'react';
import type { CareReferral } from '../../types/dashboard';
import { Share2 } from 'lucide-react';

interface ReferralsViewProps {
  referrals: CareReferral[];
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({ referrals }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-cyan-600" />
            <span>Specialty Referrals & Outpatient Transfers</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring transition of care and overdue clinical intake appointments
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {referrals.length} Tracked
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Specialty & Facility</th>
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Clinical Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {referrals.map((ref) => (
              <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {ref.patient_name}
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                  <div className="font-semibold">{ref.specialty}</div>
                  <div className="text-[11px] text-slate-400">{ref.referred_to_facility}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                  {ref.target_completion_date}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ref.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    ref.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {ref.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                  {ref.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
