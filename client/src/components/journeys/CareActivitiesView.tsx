import React, { useState } from 'react';
import type { PathwayStep } from '../../types';
import { ActivityDetailModal } from './ActivityDetailModal';
import { getStatusBadge, stageIconMap, stageLabelMap } from './CareJourneyTimeline';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Paperclip, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface CareActivitiesViewProps {
  steps: PathwayStep[];
  onRefresh: () => void;
  token?: string;
}

export const CareActivitiesView: React.FC<CareActivitiesViewProps> = ({
  steps,
  onRefresh,
  token
}) => {
  const [selectedStep, setSelectedStep] = useState<PathwayStep | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSteps = steps.filter(step => {
    const matchesStatus = statusFilter === 'all' || step.status === statusFilter;
    const matchesSearch = 
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (step.activity_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (step.assigned_worker_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const overdueCount = steps.filter(s => s.status === 'overdue').length;
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const pendingCount = steps.filter(s => s.status === 'pending' || s.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      
      {/* Header Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Overdue Activities</span>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{overdueCount}</p>
            <span className="text-[11px] text-red-500 font-semibold">Immediate attention needed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Active & Pending</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{pendingCount}</p>
            <span className="text-[11px] text-blue-500 font-semibold">In scheduled care cycle</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Completed Milestones</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
            <span className="text-[11px] text-emerald-500 font-semibold">Verified clinical steps</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Filter bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by activity, type or assigned worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'All Activities' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'pending', label: 'Pending' },
                { id: 'completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Activities */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredSteps.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No care activities found matching your filters.
            </div>
          ) : (
            filteredSteps.map((step) => {
              const badge = getStatusBadge(step.status);
              const icon = stageIconMap[step.stage_type] || <FileText className="w-4 h-4" />;
              const stageName = stageLabelMap[step.stage_type] || step.stage_type;

              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase flex items-center space-x-1">
                        {icon}
                        <span>{stageName}</span>
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </span>
                      {step.is_mandatory && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {step.title}
                    </h4>
                    {step.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                        "{step.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-col sm:items-end justify-between items-center text-xs text-slate-500 shrink-0 gap-2">
                    <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: <strong>{step.due_date}</strong></span>
                    </div>
                    {step.assigned_worker_name && (
                      <div className="flex items-center space-x-1 text-slate-500">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{step.assigned_worker_name}</span>
                      </div>
                    )}
                    {step.supporting_documents && step.supporting_documents.length > 0 && (
                      <span className="text-[11px] text-cyan-600 font-semibold flex items-center space-x-1">
                        <Paperclip className="w-3 h-3" />
                        <span>{step.supporting_documents.length} Attachment(s)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail / Update Modal */}
      <ActivityDetailModal
        step={selectedStep}
        isOpen={!!selectedStep}
        onClose={() => setSelectedStep(null)}
        onUpdated={onRefresh}
        token={token}
      />

    </div>
  );
};
