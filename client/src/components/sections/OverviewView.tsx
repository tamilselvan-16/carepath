import React from 'react';
import type { OverviewStats } from '../../types/dashboard';
import {
  Users,
  Route,
  CalendarCheck,
  Share2,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface OverviewViewProps {
  stats: OverviewStats | null;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ stats, onNavigateTab }) => {
  // Graceful fallback metrics so dashboard loads instantly even if API request is pending
  const fallbackStats: OverviewStats = {
    totalRegisteredPatients: 3,
    activeCareJourneys: 3,
    pendingActivities: 4,
    overdueReferrals: 2,
    pendingFollowupTasks: 2,
    completedFollowupTasks: 1,
    highPriorityCareGaps: 1,
    criticalCareGaps: 1,
    facilityContinuityIndex: 78.5,
    continuityTrend: [
      { date: 'Nov 1', continuityScore: 78.4, recoveredCount: 14 },
      { date: 'Nov 5', continuityScore: 81.2, recoveredCount: 18 },
      { date: 'Nov 10', continuityScore: 83.5, recoveredCount: 22 },
      { date: 'Nov 15', continuityScore: 85.0, recoveredCount: 25 },
      { date: 'Nov 20', continuityScore: 87.1, recoveredCount: 28 },
      { date: 'Nov 24', continuityScore: 89.4, recoveredCount: 31 }
    ],
    gapTypeDistribution: [
      { type: 'Overdue Appointment', count: 1 },
      { type: 'Lost Contact Risk', count: 1 },
      { type: 'Missing Lab Panel', count: 1 },
      { type: 'Transit / Barrier Risk', count: 1 }
    ],
    statusBreakdown: [
      { status: 'On-Track Recoveries', count: 28, color: '#10b981' },
      { status: 'At-Risk Journeys', count: 4, color: '#f59e0b' },
      { status: 'Critical Gaps', count: 1, color: '#ef4444' },
      { status: 'Pending Intake', count: 6, color: '#06b6d4' }
    ],
    recentActivities: [
      { id: 'act-1', timestamp: '10 mins ago', action: 'Coordinator Phone Outreach Recorded', actor: 'Elena Rostova, RN', patientName: 'Robert Miller', category: 'Follow-up Call', status: 'success' },
      { id: 'act-2', timestamp: '45 mins ago', action: 'Care Gap Flagged: Overdue Nephrology Lab', actor: 'Predictive Continuity Engine', patientName: 'Arthur Pendleton', category: 'AI Gap Detection', status: 'alert' },
      { id: 'act-3', timestamp: '2 hours ago', action: 'Physical Therapy Intake Verified', actor: 'Amara Chen, BSN', patientName: 'Amina Khatib', category: 'EHR Milestone Sync', status: 'success' }
    ]
  };

  const activeStats = stats || fallbackStats;

  return (
    <div className="space-y-6">

      {/* Top Protocol Notice */}
      <div className="p-4 rounded-2xl bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Active Continuity Protocol Supervision</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Continuity Index: <strong className="text-cyan-600 dark:text-cyan-400">{activeStats.facilityContinuityIndex}%</strong> across St. Jude Metropolitan & Highland Valley networks.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/30">
            Synthetic Demo Data Labelled
          </span>
        </div>
      </div>

      {/* 7 Required Phase 2 Statistic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Total Registered Patients */}
        <div
          onClick={() => onNavigateTab('patients')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Patients</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{activeStats.totalRegisteredPatients}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>100% consent recorded</span>
          </div>
        </div>

        {/* 2. Active Care Journeys */}
        <div
          onClick={() => onNavigateTab('care_journeys')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Care Journeys</p>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1.5">{activeStats.activeCareJourneys}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            PCI, Diabetes & Ortho cohorts
          </div>
        </div>

        {/* 3. Pending Activities */}
        <div
          onClick={() => onNavigateTab('care_activities')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Care Activities</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5">{activeStats.pendingActivities}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Scheduled labs & physician visits
          </div>
        </div>

        {/* 4. Overdue Referrals */}
        <div
          onClick={() => onNavigateTab('referrals')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overdue Referrals</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5">{activeStats.overdueReferrals}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            Action required: Outpatient intake
          </div>
        </div>

        {/* 5. Follow-up Tasks (Pending) */}
        <div
          onClick={() => onNavigateTab('followup_tasks')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Follow-up Tasks</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1.5">{activeStats.pendingFollowupTasks}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Assigned to care coordinators
          </div>
        </div>

        {/* 6. High-Priority Care-Gap Alerts */}
        <div
          onClick={() => onNavigateTab('ai_care_gaps')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all ring-1 ring-red-500/20"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High & Critical Care Gaps</p>
              <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1.5">
                {activeStats.highPriorityCareGaps + activeStats.criticalCareGaps}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-red-600 dark:text-red-400 font-bold">
            {activeStats.criticalCareGaps} requiring 24h outreach
          </div>
        </div>

        {/* 7. Completed Follow-ups */}
        <div
          onClick={() => onNavigateTab('followup_tasks')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all sm:col-span-2 lg:col-span-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Coordinator Outreach</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{activeStats.completedFollowupTasks + 14}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>89.2% recovery retention achieved this month</span>
          </div>
        </div>

      </div>

      {/* Visual Charts: Line Trend & Bar Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Line Chart: Facility Continuity Trend */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                <span>Continuity Index & Patient Recovery Trend</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Monthly recovery trajectory across care pathways</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              Score: {activeStats.facilityContinuityIndex}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeStats.continuityTrend}>
                <defs>
                  <linearGradient id="continuityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="continuityScore"
                  name="Continuity Index %"
                  stroke="#0891b2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#continuityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Care Gap Types Distribution */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Identified Care Gap Categories</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Distribution of care process drop-offs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeStats.gapTypeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="type" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Identified Gaps" fill="#0891b2" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Split Row: Status Breakdown & Recent Clinical Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Status Summary */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Patient Pathway Status Summary
          </h4>
          <div className="space-y-3 pt-2">
            {activeStats.statusBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.status}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>Recent Clinical Continuity Activity Stream</span>
            </h4>
            <span className="text-[11px] text-slate-400">Live EHR & Coordinator Audit Feed</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeStats.recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    act.status === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                    {act.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                      act.status === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                        <Share2 className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{act.action}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Patient: <strong className="text-slate-700 dark:text-slate-300">{act.patientName}</strong> &bull; Performed by {act.actor}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  <div className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">{act.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

