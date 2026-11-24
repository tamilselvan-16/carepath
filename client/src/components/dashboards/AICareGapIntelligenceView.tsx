import React, { useState, useEffect } from 'react';
import type { CareGap } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Info,
  Scale,
  Cpu,
  UserCheck
} from 'lucide-react';

interface AICareGapIntelligenceViewProps {
  gaps: CareGap[];
  onRefresh: () => void;
  token?: string;
}

export const AICareGapIntelligenceView: React.FC<AICareGapIntelligenceViewProps> = ({
  gaps,
  onRefresh,
  token
}) => {
  const [selectedGap, setSelectedGap] = useState<CareGap | null>(
    gaps.length > 0 ? gaps[0] : null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Human Review State
  const [reviewMode, setReviewMode] = useState<'idle' | 'modify'>('idle');
  const [modifiedAction, setModifiedAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Model Evaluation Metrics State
  const [modelMetrics, setModelMetrics] = useState<any | null>(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);

  useEffect(() => {
    if (gaps.length > 0 && !selectedGap) {
      setSelectedGap(gaps[0]);
    }
  }, [gaps]);

  // Load Model Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/ai/model-metrics', {
          headers: { 'Authorization': `Bearer ${token || 'dev-token'}` }
        });
        if (res.ok) setModelMetrics(await res.json());
      } catch (e) {
        console.warn('Failed to load model metrics:', e);
      }
    };
    fetchMetrics();
  }, [token]);

  // Trigger Hybrid AI Re-Analysis for Selected Gap
  const handleRunAIAnalysis = async (gapId: string) => {
    try {
      setIsAnalyzing(true);
      const res = await fetch(`/api/care-gaps/${gapId}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedGap(data.gap);
        onRefresh();
      }
    } catch (e) {
      console.error('Error running AI gap analysis:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Human Review Actions: Accept, Modify, Dismiss
  const handleReviewAction = async (status: 'accepted' | 'modified' | 'dismissed') => {
    if (!selectedGap) return;
    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/care-gaps/${selectedGap.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotes || `Care Coordinator ${status} generated AI suggestion`,
          modifiedAction: status === 'modified' ? modifiedAction : undefined
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedGap(updated);
        setReviewMode('idle');
        setReviewNotes('');
        setModifiedAction('');
        onRefresh();
      }
    } catch (e) {
      console.error('Review action failed:', e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner / Intelligence Overview */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-cyan-700 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-cyan-300" />
            <h2 className="text-xl font-bold tracking-tight">AI Care-Gap Intelligence & Hybrid Scoring</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Combines transparent rule-based operational scoring (0–100) with a Python Scikit-learn Random Forest model (7-day care-gap probability) and Google Gemini administrative explainability. Non-diagnostic.
          </p>
        </div>

        <button
          onClick={() => setShowMetricsModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all shrink-0"
        >
          <Cpu className="w-4 h-4 text-cyan-300" />
          <span>Inspect ML Model Metrics</span>
        </button>
      </div>

      {/* Main Grid: Left List (5 cols) + Right AI Detail (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Care Gaps List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Identified Care-Process Gaps</h3>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-2.5 py-0.5 rounded-full">
              {gaps.length} Flagged Cases
            </span>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {gaps.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
                No active care-gap alerts detected.
              </div>
            ) : (
              gaps.map((gap) => {
                const isSelected = selectedGap?.id === gap.id;
                const ruleScore = gap.rule_based_score ?? (gap.severity === 'critical' ? 85 : 65);
                const mlProb = gap.ml_gap_probability ?? gap.ml_confidence_score;

                return (
                  <div
                    key={gap.id}
                    onClick={() => {
                      setSelectedGap(gap);
                      setReviewMode('idle');
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${isSelected
                        ? 'bg-white dark:bg-slate-800 border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${gap.severity === 'critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                          {gap.severity}
                        </span>
                        {gap.review_status && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${gap.review_status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                              gap.review_status === 'modified' ? 'bg-blue-100 text-blue-800' :
                                gap.review_status === 'dismissed' ? 'bg-slate-200 text-slate-700' : 'bg-purple-100 text-purple-800'
                            }`}>
                            {gap.review_status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(gap.created_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-2">
                      {gap.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {gap.description}
                    </p>

                    {/* DUAL METRIC PILLS */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600 dark:text-slate-300">
                          Rule: <strong className="text-blue-600 dark:text-blue-400 font-black">{ruleScore}/100</strong>
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          ML 7d: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{(mlProb * 100).toFixed(0)}%</strong>
                        </span>
                      </div>
                      <span className="text-slate-400 font-medium truncate max-w-30">
                        {gap.patient_name}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: AI Detail, Dual Explanations & Human Review */}
        <div className="lg:col-span-7">
          {selectedGap ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">

              {/* Header with Re-Run Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      {selectedGap.severity} Operational Severity
                    </span>
                    <span className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-800 dark:text-slate-200">{selectedGap.patient_name}</strong> ({selectedGap.patient_mrn})
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {selectedGap.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleRunAIAnalysis(selectedGap.id)}
                  disabled={isAnalyzing}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run AI Engine'}</span>
                </button>
              </div>

              {/* DUAL SCORING CARDS (RULE-BASED vs MACHINE LEARNING) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* 1. Rule-Based Scoring Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rule-Based Care Gap Score</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      {selectedGap.rule_category || 'High'}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      {selectedGap.rule_based_score ?? (selectedGap.severity === 'critical' ? 85 : 65)}
                    </span>
                    <span className="text-xs text-slate-400">/ 100 max</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Deterministic operational points: missed appointments (+20), overdue referrals (+25), transport barrier (+15).
                  </p>
                </div>

                {/* 2. Machine Learning Prediction Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Random Forest 7-Day ML Gap</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                      {selectedGap.ml_predicted_gap_7d !== false ? 'Gap Likely' : 'Low Risk'}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      {((selectedGap.ml_gap_probability ?? selectedGap.ml_confidence_score) * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400">probability</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Trained on multi-factor features available at prediction time. Patient-stratified cross-validation.
                  </p>
                </div>

              </div>

              {/* Identified Contributing Operational Factors */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Identified Contributing Operational Factors</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedGap.rule_contributing_factors && selectedGap.rule_contributing_factors.length > 0) ? (
                    selectedGap.rule_contributing_factors.map((f, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                          <span>{f.factor}</span>
                          <span className="text-blue-600">+{f.points} pts</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                      </div>
                    ))
                  ) : (
                    selectedGap.risk_factors.map((rf, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        &bull; {rf}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* GEMINI / AI GENERATED EXPLANATION (Plain English) */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-2">
                <div className="flex items-center space-x-1.5 font-bold text-cyan-900 dark:text-cyan-300 text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>Google Gemini Natural Language Explanation</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {selectedGap.ai_generated_explanation || 'Operational analysis indicates high probability of treatment journey gap without coordinator outreach.'}
                </p>
                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-cyan-100 dark:border-cyan-900/60">
                  Assessment Timestamp: {selectedGap.assessment_timestamp ? new Date(selectedGap.assessment_timestamp).toLocaleString() : 'Recent'} &bull; Non-diagnostic operational assistance only.
                </div>
              </div>

              {/* SUGGESTED ADMINISTRATIVE ACTION */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">
                  Suggested Administrative Action
                </span>
                <p className="text-xs text-amber-950 dark:text-amber-100 font-semibold">
                  {selectedGap.suggested_action}
                </p>
              </div>

              {/* HUMAN-IN-THE-LOOP REVIEW WORKFLOW */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Human Healthcare Worker Review
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${selectedGap.review_status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      selectedGap.review_status === 'modified' ? 'bg-blue-100 text-blue-800' :
                        selectedGap.review_status === 'dismissed' ? 'bg-slate-200 text-slate-700' : 'bg-purple-100 text-purple-800'
                    }`}>
                    Status: {selectedGap.review_status ? selectedGap.review_status.replace('_', ' ') : 'Pending Review'}
                  </span>
                </div>

                {/* If Modify Mode is Active */}
                {reviewMode === 'modify' ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Modify Suggested Administrative Action
                    </h5>
                    <textarea
                      rows={2}
                      value={modifiedAction}
                      onChange={(e) => setModifiedAction(e.target.value)}
                      placeholder="Customized coordinator instructions..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <textarea
                      rows={1}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Clinical reason for modification..."
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setReviewMode('idle')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReviewAction('modified')}
                        disabled={isSubmittingReview || !modifiedAction.trim()}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                      >
                        {isSubmittingReview ? 'Saving...' : 'Save Modified Action'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleReviewAction('accepted')}
                      disabled={isSubmittingReview}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Schedule Task</span>
                    </button>

                    <button
                      onClick={() => {
                        setReviewMode('modify');
                        setModifiedAction(selectedGap.suggested_action || '');
                      }}
                      disabled={isSubmittingReview}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify Action</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('dismissed')}
                      disabled={isSubmittingReview}
                      className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Dismiss Gap</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300" />
              <p className="text-xs">Select an identified care gap to inspect hybrid scoring & AI explanations</p>
            </div>
          )}
        </div>

      </div>

      {/* Model Evaluation Metrics Modal */}
      {showMetricsModal && modelMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-linear-to-r from-indigo-700 to-blue-700 text-white flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20">
                  Scikit-Learn Random Forest
                </span>
                <h4 className="font-bold text-base mt-1">7-Day Care-Gap Model Evaluation</h4>
              </div>
              <button onClick={() => setShowMetricsModal(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Precision</span>
                  <div className="text-xl font-black text-indigo-600">{(modelMetrics.precision * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recall</span>
                  <div className="text-xl font-black text-indigo-600">{(modelMetrics.recall * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">F1 Score</span>
                  <div className="text-xl font-black text-indigo-600">{(modelMetrics.f1_score * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Test Evaluation Confusion Matrix (N={modelMetrics.test_samples_count})
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-center font-mono font-bold">
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700">
                      True Negative: {modelMetrics.confusion_matrix[0][0]}
                    </div>
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700">
                      False Positive: {modelMetrics.confusion_matrix[0][1]}
                    </div>
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700">
                      False Negative: {modelMetrics.confusion_matrix[1][0]}
                    </div>
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700">
                      True Positive: {modelMetrics.confusion_matrix[1][1]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div><strong>Split Strategy:</strong> {modelMetrics.validation_strategy}</div>
                <div><strong>Training Set Size:</strong> {modelMetrics.train_samples_count} synthetic cases</div>
                <div className="text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                  Model probabilities are operational assistance indicators, not clinically validated diagnostic risks.
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowMetricsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                >
                  Close Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
