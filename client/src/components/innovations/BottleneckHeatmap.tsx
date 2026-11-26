import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sliders,
  Send,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

interface DepartmentLoad {
  id: string;
  name: string;
  activePatients: number;
  capacityLimit: number;
  currentLoadPercent: number;
  projected14DayLoadPercent: number;
  bottleneckRisk: 'low' | 'moderate' | 'critical';
  avgWaitDays: number;
  pendingReferrals: number;
  escalationActive: boolean;
  suggestedAction: string;
}

export const BottleneckHeatmap: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentLoad[]>([]);
  const [leakageRate, setLeakageRate] = useState<number>(18);
  const [leakageTopCause, setLeakageTopCause] = useState<string>('');
  const [horizon, setHorizon] = useState<'7' | '14' | '30'>('14');

  // Simulation Sliders
  const [echoHoursAdd, setEchoHoursAdd] = useState<number>(4);
  const [coordinatorFTEAdd, setCoordinatorFTEAdd] = useState<number>(1);
  const [cardioSlotsAdd, setCardioSlotsAdd] = useState<number>(3);
  const [fastTrackLabs, setFastTrackLabs] = useState<boolean>(true);

  // Simulation Results
  const [simulationResult, setSimulationResult] = useState<{
    cardiologyProjectedLoad: number;
    orthoProjectedLoad: number;
    imagingProjectedLoad: number;
    projectedAvgWaitDays: number;
    predictedMonthlyGapsPrevented: number;
    projectedContinuityScoreIncrease: number;
    bottleneckStatus: string;
  } | null>(null);

  const [escalatedDepts, setEscalatedDepts] = useState<Record<string, boolean>>({});

  // Fetch Forecast Data
  const loadForecast = async () => {
    try {
      const res = await fetch('/api/innovations/capacity-forecast');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
        setLeakageRate(data.referralLeakageRate || 18);
        setLeakageTopCause(data.leakageTopCause || '');
      }
    } catch (err) {
      console.error('Failed to load capacity forecast:', err);
    }
  };

  // Run Simulation
  const runSimulation = async () => {
    try {
      const res = await fetch('/api/innovations/simulate-capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echoHoursAdd,
          coordinatorFTEAdd,
          cardioSlotsAdd,
          fastTrackLabs
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data.simulatedMetrics);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  useEffect(() => {
    runSimulation();
  }, [echoHoursAdd, coordinatorFTEAdd, cardioSlotsAdd, fastTrackLabs]);

  const handleEscalate = (deptId: string) => {
    setEscalatedDepts(prev => ({ ...prev, [deptId]: true }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-6 bg-linear-to-r from-teal-800 via-cyan-800 to-slate-900 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-200 shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">Predictive Capacity & Bottleneck Simulator</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30 uppercase tracking-wider">
                  Facility Admin Operations
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-1">
                Forecast department load crunches 7–30 days in advance and simulate resource reallocations to prevent care gap disruptions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-black/20 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center space-x-2">
              <span className="text-xs font-semibold text-teal-200">Horizon:</span>
              {(['7', '14', '30'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setHorizon(d)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${horizon === d
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'text-teal-200 hover:text-white'
                    }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Referral Leakage Rate
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{leakageRate}%</p>
              <span className="text-xs text-slate-500">of outgoing referrals</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate" title={leakageTopCause}>
              Top: {leakageTopCause || 'Wait times exceeding 14d'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Critical Bottleneck Depts
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {departments.filter(d => d.bottleneckRisk === 'critical').length}
              </p>
              <span className="text-xs text-slate-500">exceeding 90% capacity</span>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
              Cardiology & Cardiac Echo
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Simulated Gaps Prevented
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                +{simulationResult?.predictedMonthlyGapsPrevented || 12}
              </p>
              <span className="text-xs text-slate-500">gaps / month</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              With current slider parameters
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Forecast Continuity Gain
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
                +{simulationResult?.projectedContinuityScoreIncrease || 3.4}%
              </p>
              <span className="text-xs text-slate-500">continuity index</span>
            </div>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1">
              Projected 30-day impact
            </p>
          </div>
        </div>

        {/* Predictive Department Load Heatmap */}
        <div>
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            {horizon}-Day Projected Department Pressure Matrix
          </h3>

          <div className="space-y-3">
            {departments.map(dept => {
              const isCrit = dept.bottleneckRisk === 'critical';
              const isMod = dept.bottleneckRisk === 'moderate';
              const isEscalated = escalatedDepts[dept.id];

              return (
                <div
                  key={dept.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-50">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-rose-500 animate-pulse' : isMod ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dept.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dept.activePatients} active / {dept.capacityLimit} capacity slots • Avg wait: {dept.avgWaitDays} days
                    </p>
                  </div>

                  {/* Progress Bar & Load Percent */}
                  <div className="flex-1 max-w-md space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Current: {dept.currentLoadPercent}%</span>
                      <span className={isCrit ? 'text-rose-600 font-bold' : isMod ? 'text-amber-600' : 'text-emerald-600'}>
                        {horizon}d Forecast: {dept.projected14DayLoadPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${dept.projected14DayLoadPercent >= 95
                            ? 'bg-rose-500'
                            : dept.projected14DayLoadPercent >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        style={{ width: `${Math.min(100, dept.projected14DayLoadPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Suggested Operational Action & Escalation */}
                  <div className="flex items-center space-x-3 justify-between md:justify-end">
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block max-w-xs truncate" title={dept.suggestedAction}>
                        {dept.suggestedAction}
                      </span>
                    </div>

                    {isCrit && (
                      <button
                        onClick={() => handleEscalate(dept.id)}
                        disabled={isEscalated}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${isEscalated
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                          }`}
                      >
                        {isEscalated ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Escalated</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch Escalation</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Resource Allocation Simulator */}
        <div className="p-6 rounded-2xl bg-linear-to-br from-slate-900 to-indigo-950 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold border border-teal-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Interactive Resource Allocation Simulator
                </h3>
                <p className="text-xs text-slate-300">
                  Simulate operational changes to eliminate projected referral delays
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-teal-300 bg-teal-950/50 px-3 py-1 rounded-xl border border-teal-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time Model Projection</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Slider 1: Echo Hours */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Echo Diagnostic Slots:</span>
                <span className="font-bold text-teal-300">+{echoHoursAdd} hrs/week</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="2"
                value={echoHoursAdd}
                onChange={(e) => setEchoHoursAdd(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Reduces Cardiac Imaging wait time</p>
            </div>

            {/* Slider 2: Coordinator FTE */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Coordinator Field FTE:</span>
                <span className="font-bold text-teal-300">+{coordinatorFTEAdd} FTE</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={coordinatorFTEAdd}
                onChange={(e) => setCoordinatorFTEAdd(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Resolves overdue follow-up tasks</p>
            </div>

            {/* Slider 3: Cardiology Slots */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Cardiology Slots:</span>
                <span className="font-bold text-teal-300">+{cardioSlotsAdd} slots/wk</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={cardioSlotsAdd}
                onChange={(e) => setCardioSlotsAdd(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Clears post-PCI referral queues</p>
            </div>

            {/* Toggle: Fast Track Labs */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Fast-Track Lab Panel:</span>
                <span className="font-bold text-teal-300">{fastTrackLabs ? 'Enabled' : 'Disabled'}</span>
              </div>
              <button
                type="button"
                onClick={() => setFastTrackLabs(!fastTrackLabs)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all ${fastTrackLabs
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                    : 'bg-white/5 border-white/20 text-slate-400'
                  }`}
              >
                {fastTrackLabs ? '✓ Subsidized 24h Lab TAT' : 'Standard 72h Lab TAT'}
              </button>
              <p className="text-[10px] text-slate-400">Guarantees 24h Day 45 Lipid Profile</p>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-teal-300 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-teal-200 uppercase tracking-wider block">
                    Simulation Outcome: {simulationResult.bottleneckStatus.replace('_', ' ').toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Imaging load drops to <strong className="text-white">{simulationResult.imagingProjectedLoad}%</strong>, Cardiology to <strong className="text-white">{simulationResult.cardiologyProjectedLoad}%</strong>. Wait times decrease to <strong className="text-white">{simulationResult.projectedAvgWaitDays} days</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-xs text-teal-300 font-bold block">
                    +{simulationResult.predictedMonthlyGapsPrevented} Gaps Prevented
                  </span>
                  <span className="text-[11px] text-slate-400">
                    +{simulationResult.projectedContinuityScoreIncrease}% Continuity Index
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
