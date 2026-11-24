import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Users, 
  Activity, 
  Share2, 
  RefreshCw,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { OverviewStats } from '../../types/dashboard';

interface ReportsViewProps {
  stats: OverviewStats | null;
  token?: string;
  selectedFacility: string;
  selectedDateRange: string;
}

interface AnalyticsData {
  adminDashboard: {
    totalFacilities: number;
    totalRegisteredPatients: number;
    activeCareJourneys: number;
    completedJourneys: number;
    pendingActivities: number;
    overdueActivities: number;
    completedActivities: number;
    overdueReferrals: number;
    followupCompletionRate: number;
    openCareGapAlerts: number;
  };
  charts: {
    registrationTrend: { month: string; count: number }[];
    activityTrend: { day: string; completed: number; pending: number; overdue: number }[];
    activityBreakdown: { name: string; value: number; fill: string }[];
    careGapCategories: { type: string; count: number }[];
    referralStats: {
      total: number;
      completed: number;
      overdue: number;
      escalated: number;
      acknowledged: number;
    };
    facilityComparisons: {
      facilityId: string;
      facilityName: string;
      facilityCode: string;
      patientCount: number;
      activeJourneys: number;
      followupRate: number;
      openCareGaps: number;
    }[];
  };
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  token,
  selectedFacility,
  selectedDateRange
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'journeys' | 'referrals' | 'followups' | 'facility' | 'caregaps'>('journeys');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const facilityParam = selectedFacility !== 'all' ? `?facilityId=${selectedFacility}` : '';
      const dateParam = selectedDateRange ? `${facilityParam ? '&' : '?'}dateRange=${selectedDateRange}` : '';
      const res = await fetch(`/api/analytics${facilityParam}${dateParam}`, {
        headers: {
          'Authorization': `Bearer ${token || 'dev-token'}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedFacility, selectedDateRange]);

  // CSV Export Utility
  const handleExportCSV = (type: string) => {
    setIsExporting(true);
    let csvContent = "data:text/csv;charset=utf-8,";

    if (type === 'journeys') {
      csvContent += "Metric,Value\n";
      csvContent += `Active Care Journeys,${analytics?.adminDashboard.activeCareJourneys || 0}\n`;
      csvContent += `Completed Journeys,${analytics?.adminDashboard.completedJourneys || 0}\n`;
      csvContent += `Completed Activities,${analytics?.adminDashboard.completedActivities || 0}\n`;
      csvContent += `Pending Activities,${analytics?.adminDashboard.pendingActivities || 0}\n`;
      csvContent += `Overdue Activities,${analytics?.adminDashboard.overdueActivities || 0}\n`;
    } else if (type === 'referrals') {
      csvContent += "Status,Count\n";
      csvContent += `Total Referrals,${analytics?.charts.referralStats.total || 0}\n`;
      csvContent += `Acknowledged / Scheduled,${analytics?.charts.referralStats.acknowledged || 0}\n`;
      csvContent += `Completed,${analytics?.charts.referralStats.completed || 0}\n`;
      csvContent += `Overdue,${analytics?.charts.referralStats.overdue || 0}\n`;
      csvContent += `Escalated,${analytics?.charts.referralStats.escalated || 0}\n`;
    } else if (type === 'facility') {
      csvContent += "Facility Name,Code,Patients,Active Journeys,Followup Rate %,Open Gaps\n";
      analytics?.charts.facilityComparisons.forEach(f => {
        csvContent += `"${f.facilityName}",${f.facilityCode},${f.patientCount},${f.activeJourneys},${f.followupRate}%,${f.openCareGaps}\n`;
      });
    } else if (type === 'caregaps') {
      csvContent += "Gap Category,Active Occurrences\n";
      analytics?.charts.careGapCategories.forEach(c => {
        csvContent += `"${c.type}",${c.count}\n`;
      });
    } else {
      csvContent += "Metric,Performance\n";
      csvContent += `Follow-up Completion Rate,${analytics?.adminDashboard.followupCompletionRate || 0}%\n`;
      csvContent += `Open Care Gaps,${analytics?.adminDashboard.openCareGapAlerts || 0}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CarePath_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    setExportNotice(`Generated and downloaded ${type.toUpperCase()} CSV report.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // PDF Export Trigger (Print / PDF formatted output)
  const handleExportPDF = (type: string) => {
    setExportNotice(`Generating clinical audit document for ${type.toUpperCase()}...`);
    setTimeout(() => {
      window.print();
      setExportNotice(null);
    }, 500);
  };

  const ad = analytics?.adminDashboard;

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              Institutional Intelligence
            </span>
            <span className="text-xs text-slate-400">Phase 9 Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            <span>Healthcare Operational Analytics & Quality Reports</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time population continuity metrics, referral workflows, care gap distribution, and institutional compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="journeys">Patient Journey Report</option>
            <option value="referrals">Referral Status Report</option>
            <option value="followups">Follow-up Performance Report</option>
            <option value="facility">Facility Performance Report</option>
            <option value="caregaps">AI Care-Gap Report</option>
          </select>

          <button
            onClick={() => handleExportCSV(reportType)}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExportPDF(reportType)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-cyan-600/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ADMIN DASHBOARD SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Facilities</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{ad?.totalFacilities || 0}</div>
          <div className="text-[10px] text-slate-400">Institutional Sites</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Patients</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{ad?.totalRegisteredPatients || 0}</div>
          <div className="text-[10px] text-slate-400">Total Enrolled</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
          </div>
          <div className="text-xl font-black text-cyan-600">{ad?.activeCareJourneys || 0}</div>
          <div className="text-[10px] text-slate-400">Care Journeys</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{ad?.completedJourneys || 0}</div>
          <div className="text-[10px] text-slate-400">Full Pathways</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-xl font-black text-amber-500">{ad?.pendingActivities || 0}</div>
          <div className="text-[10px] text-slate-400">Care Activities</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <Share2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Overdue Ref</span>
          </div>
          <div className="text-xl font-black text-rose-500">{ad?.overdueReferrals || 0}</div>
          <div className="text-[10px] text-slate-400">Liaison Delay</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Follow-up</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{ad?.followupCompletionRate || 0}%</div>
          <div className="text-[10px] text-slate-400">Completion Rate</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Open Gaps</span>
          </div>
          <div className="text-xl font-black text-amber-600">{ad?.openCareGapAlerts || 0}</div>
          <div className="text-[10px] text-slate-400">Requires Review</div>
        </div>
      </div>

      {/* ANALYTICS SECTION 1: REGISTRATION & ACTIVITY TIMELINES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Registration Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                <span>Patient Registration Trends (2026)</span>
              </h3>
              <p className="text-[11px] text-slate-500">Monthly new patient enrollment rate</p>
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded">
              Active Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.charts.registrationTrend || []}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Enrolled Patients" stroke="#0891b2" fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily & Monthly Activity Charts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Weekly Operational Activity Performance</span>
              </h3>
              <p className="text-[11px] text-slate-500">Completed vs Pending vs Overdue clinical activities</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              Daily Distribution
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.charts.activityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION 2: BREAKDOWNS & PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completed vs Pending Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>Activity Status Breakdown</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Proportion of workflow stages</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.charts.activityBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.charts.activityBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Care-Gap Category Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Care-Gap Category Distribution</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Breakdown of flagged continuity risks</p>

          <div className="space-y-3 mt-2">
            {(analytics?.charts.careGapCategories || []).map((cat, idx) => {
              const total = analytics?.adminDashboard.openCareGapAlerts || 1;
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 capitalize">{cat.type.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral Completion & Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Referral Liaison Performance</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Specialty appointment verification</p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Referrals</span>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{analytics?.charts.referralStats.total || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Completed</span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{analytics?.charts.referralStats.completed || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
              <span className="text-[10px] uppercase font-bold text-cyan-600">Acknowledged</span>
              <p className="text-lg font-black text-cyan-700 dark:text-cyan-300">{analytics?.charts.referralStats.acknowledged || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <span className="text-[10px] uppercase font-bold text-rose-600">Overdue / Delayed</span>
              <p className="text-lg font-black text-rose-700 dark:text-rose-300">{analytics?.charts.referralStats.overdue || 0}</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-indigo-900 dark:text-indigo-200">Escalated Inquiries</span>
              <span className="text-indigo-700 dark:text-indigo-300 font-bold">{analytics?.charts.referralStats.escalated || 0} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION 3: FACILITY LEVEL COMPARISONS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-600" />
              <span>Institutional Facility Performance Comparison</span>
            </h3>
            <p className="text-[11px] text-slate-500">Cross-facility continuity benchmarks, patient load, and recovery follow-up rates</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Actual Database Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Facility Name</th>
                <th className="pb-3 font-semibold">Facility Code</th>
                <th className="pb-3 font-semibold">Registered Patients</th>
                <th className="pb-3 font-semibold">Active Care Journeys</th>
                <th className="pb-3 font-semibold">Follow-up Performance</th>
                <th className="pb-3 font-semibold">Open Care Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {(analytics?.charts.facilityComparisons || []).map(f => (
                <tr key={f.facilityId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{f.facilityName}</span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-500">{f.facilityCode}</td>
                  <td className="py-3 font-semibold">{f.patientCount} patients</td>
                  <td className="py-3 font-semibold text-cyan-600">{f.activeJourneys} active</td>
                  <td className="py-3 font-semibold">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {f.followupRate}%
                    </span>
                  </td>
                  <td className="py-3 font-semibold">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      f.openCareGaps > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {f.openCareGaps} Gaps
                    </span>
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
