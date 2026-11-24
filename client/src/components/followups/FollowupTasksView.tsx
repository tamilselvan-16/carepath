import React, { useState } from 'react';
import type { FollowupTask, Patient } from '../../types';
import { FollowupTaskModal } from './FollowupTaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { 
  PhoneCall, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  ShieldAlert
} from 'lucide-react';

interface FollowupTasksViewProps {
  tasks: FollowupTask[];
  patients: Patient[];
  onRefresh: () => void;
  token?: string;
  facilityId: string;
}

export const FollowupTasksView: React.FC<FollowupTasksViewProps> = ({
  tasks,
  patients,
  onRefresh,
  token,
  facilityId
}) => {
  const [selectedTask, setSelectedTask] = useState<FollowupTask | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assigned_to_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
  const criticalCount = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <PhoneCall className="w-6 h-6 text-cyan-300" />
            <h2 className="text-xl font-bold tracking-tight">Coordinator Human Outreach Queue</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Proactive human follow-up workflow: record contact attempts, log patient barriers (transportation, coverage), update status, and close the loop.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up Task</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Queue</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{pendingCount}</p>
            <span className="text-[11px] text-slate-500">Scheduled outreach assignments</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Critical Priority</span>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{criticalCount}</p>
            <span className="text-[11px] text-red-500 font-semibold">Immediate liaison required</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Interventions Completed</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
            <span className="text-[11px] text-emerald-500 font-semibold">Resolved human outreach</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Task List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by task title, patient or worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'All Tasks' },
                { id: 'assigned', label: 'Assigned' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'waiting_for_response', label: 'Waiting' },
                { id: 'completed', label: 'Completed' },
                { id: 'escalated', label: 'Escalated' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Tasks */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No follow-up tasks found matching your filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                      task.priority === 'high' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'escalated' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                    {task.recorded_barriers && task.recorded_barriers.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Barrier: {task.recorded_barriers[0].replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {task.instructions}
                  </p>
                  <div className="text-[11px] text-cyan-600 font-semibold">
                    Patient: {task.patient_name} ({task.patient_mrn || 'CLP-2026-UNKN'})
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col sm:items-end justify-between items-center text-xs text-slate-500 shrink-0 gap-1.5">
                  <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: <strong>{task.due_date}</strong></span>
                  </div>
                  {task.assigned_to_name && (
                    <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{task.assigned_to_name}</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {task.attempt_count} attempt{task.attempt_count !== 1 ? 's' : ''} logged
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Task Detail & Contact Log Modal */}
      <FollowupTaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdated={onRefresh}
        token={token}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={onRefresh}
        patients={patients}
        facilityId={facilityId}
        token={token}
      />

    </div>
  );
};
