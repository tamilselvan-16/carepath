import React, { useState } from 'react';
import type { PatientPathway, PathwayStep, Patient } from '../../types';
import { CareJourneyTimeline } from './CareJourneyTimeline';
import { ActivityDetailModal } from './ActivityDetailModal';
import { CreateJourneyModal } from './CreateJourneyModal';
import { 
  Route, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight
} from 'lucide-react';

interface CareJourneysViewProps {
  pathways: PatientPathway[];
  patients: Patient[];
  onRefresh: () => void;
  token?: string;
  selectedFacility: string;
}

export const CareJourneysView: React.FC<CareJourneysViewProps> = ({
  pathways,
  patients,
  onRefresh,
  token,
  selectedFacility
}) => {
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(
    pathways.length > 0 ? pathways[0].id : null
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeStepForEdit, setActiveStepForEdit] = useState<PathwayStep | null>(null);
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false);

  // New Custom Activity Input State
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityType, setNewActivityType] = useState('Diagnostic Lab');
  const [newActivityDueDate, setNewActivityDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [newActivityWorker, setNewActivityWorker] = useState('Elena Rostova, RN');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Filter pathways
  const filteredPathways = pathways.filter(pw => {
    const matchesStatus = statusFilter === 'all' || pw.status === statusFilter;
    const matchesSearch = 
      (pw.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pw.patient_mrn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pw.title || pw.protocol_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedPathway = pathways.find(p => p.id === selectedPathwayId) || filteredPathways[0] || null;

  // Add custom activity to selected pathway
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPathway || !newActivityTitle.trim()) return;

    try {
      setIsAddingActivity(true);
      const res = await fetch(`/api/pathways/${selectedPathway.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          title: newActivityTitle,
          stage_type: 'recovery_followup',
          activity_type: newActivityType,
          due_date: newActivityDueDate,
          assigned_worker_name: newActivityWorker,
          is_mandatory: false
        })
      });

      if (res.ok) {
        setIsNewActivityModalOpen(false);
        setNewActivityTitle('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error creating activity:', err);
    } finally {
      setIsAddingActivity(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Route className="w-6 h-6 text-cyan-200" />
            <h2 className="text-xl font-bold tracking-tight">Patient Care Journey Engine</h2>
          </div>
          <p className="text-xs text-cyan-100 mt-1 max-w-xl">
            End-to-end clinical recovery coordination across 8 distinct continuum stages with auto-detection of overdue milestones.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-cyan-800 hover:bg-cyan-50 font-bold text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Care Journey</span>
        </button>
      </div>

      {/* Main Grid: Left List + Right Timeline Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Pathways List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient, MRN or protocol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] w-full">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'paused', label: 'Paused' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
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

          {/* Pathways Cards List */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {filteredPathways.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
                No care journeys matched your query.
              </div>
            ) : (
              filteredPathways.map(pw => {
                const isSelected = selectedPathway?.id === pw.id;
                const overdueCount = (pw.steps || []).filter(s => s.status === 'overdue').length;

                return (
                  <div
                    key={pw.id}
                    onClick={() => setSelectedPathwayId(pw.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          pw.status === 'active' 
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pw.status}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                          {pw.title || pw.protocol_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {pw.patient_name} &bull; <span className="font-mono">{pw.patient_mrn}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                          {pw.overall_progress_pct}%
                        </span>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Progress</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          overdueCount > 0 ? 'bg-amber-500' : 'bg-cyan-600'
                        }`}
                        style={{ width: `${pw.overall_progress_pct}%` }} 
                      />
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Target: {pw.expected_completion_date}</span>
                      </span>

                      {overdueCount > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-bold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{overdueCount} Overdue</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>On-Track</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Visual Journey Timeline & Activities Detail (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedPathway ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              
              {/* Selected Pathway Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-xs font-bold uppercase">
                      Continuity Score: {selectedPathway.current_continuity_score}%
                    </span>
                    <span className="text-xs text-slate-400">
                      Coordinator: <strong>{selectedPathway.assigned_coordinator_id || 'Elena Rostova, RN'}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                    {selectedPathway.title || selectedPathway.protocol_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-800 dark:text-slate-200">{selectedPathway.patient_name}</strong> ({selectedPathway.patient_mrn}) &bull; Started: {selectedPathway.start_date}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Milestones</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {(selectedPathway.steps || []).filter(s => s.status === 'completed').length} / {(selectedPathway.steps || []).length}
                    </span>
                  </div>
                  <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Completion</span>
                    <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                      {selectedPathway.overall_progress_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Timeline Component */}
              <CareJourneyTimeline
                steps={selectedPathway.steps || []}
                onSelectStep={(step) => setActiveStepForEdit(step)}
                onAddActivity={() => setIsNewActivityModalOpen(true)}
                canEdit={true}
              />

            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400 space-y-2">
              <Route className="w-8 h-8 text-slate-300" />
              <p className="text-xs">Select or launch a care journey to inspect the visual timeline</p>
            </div>
          )}
        </div>

      </div>

      {/* Activity Status / Notes / Documents Modal */}
      <ActivityDetailModal
        step={activeStepForEdit}
        isOpen={!!activeStepForEdit}
        onClose={() => setActiveStepForEdit(null)}
        onUpdated={() => {
          onRefresh();
        }}
        token={token}
      />

      {/* Create Care Journey Modal */}
      <CreateJourneyModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          onRefresh();
        }}
        patients={patients}
        facilityId={selectedFacility !== 'all' ? selectedFacility : 'a0000000-0000-0000-0000-000000000001'}
        token={token}
      />

      {/* Quick Add Custom Activity Modal */}
      {isNewActivityModalOpen && selectedPathway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">Add Custom Activity to Journey</h4>
                <p className="text-[11px] text-cyan-100">{selectedPathway.patient_name}</p>
              </div>
              <button onClick={() => setIsNewActivityModalOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-full">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Activity Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 30-Day Medication Review Phone Call"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Activity Type</label>
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Diagnostic Lab">Diagnostic Lab</option>
                    <option value="Phone Outreach">Phone Outreach</option>
                    <option value="Clinic Visit">Clinic Visit</option>
                    <option value="Specialist Referral">Specialist Referral</option>
                    <option value="Pharmacy Adherence">Pharmacy Adherence</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Due Date *</label>
                  <input
                    type="date"
                    value={newActivityDueDate}
                    onChange={(e) => setNewActivityDueDate(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Responsible Worker</label>
                <input
                  type="text"
                  value={newActivityWorker}
                  onChange={(e) => setNewActivityWorker(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewActivityModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingActivity || !newActivityTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isAddingActivity ? 'Saving...' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
