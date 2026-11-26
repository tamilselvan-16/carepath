import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { getPendingOperations, updateOperationStatus, dismissOperation, type OfflineOperation } from '../../services/offlineQueue';

interface SyncIndicatorProps {
  token?: string;
  onSyncCompleted: () => void;
}

export type SyncState = 'online' | 'offline' | 'synchronizing' | 'completed' | 'failed' | 'conflict';

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ token, onSyncCompleted }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>(navigator.onLine ? 'online' : 'offline');
  const [pendingOps, setPendingOps] = useState<OfflineOperation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Poll IndexedDB for pending offline operations
  const refreshPending = async () => {
    try {
      const ops = await getPendingOperations();
      setPendingOps(ops);
      if (ops.some((o: OfflineOperation) => o.status === 'conflict')) {
        setSyncState('conflict');
      }
    } catch (e) {
      console.warn('IndexedDB check note:', e);
    }
  };

  useEffect(() => {
    refreshPending();
    const interval = setInterval(refreshPending, 5000);
    return () => clearInterval(interval);
  }, []);

  // Monitor network online/offline transitions
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('online');
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  // Execute batch sync with backend
  const triggerSync = async () => {
    if (!navigator.onLine) return;
    try {
      const ops = await getPendingOperations();
      if (ops.length === 0) {
        setSyncState('online');
        return;
      }

      setSyncState('synchronizing');

      const res = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({ operations: ops })
      });

      if (res.ok) {
        const data = await res.json();
        let hasConflict = false;

        for (const r of data.results) {
          if (r.status === 'synced' || r.status === 'duplicate') {
            await updateOperationStatus(r.operation_id, 'synced');
          } else if (r.status === 'conflict') {
            await updateOperationStatus(r.operation_id, 'conflict', r.message);
            hasConflict = true;
          } else {
            await updateOperationStatus(r.operation_id, 'failed', r.message);
          }
        }

        setLastSyncTime(new Date().toLocaleTimeString());
        await refreshPending();

        if (hasConflict) {
          setSyncState('conflict');
        } else {
          setSyncState('completed');
          setTimeout(() => setSyncState('online'), 4000);
          onSyncCompleted();
        }
      } else {
        setSyncState('failed');
      }
    } catch (e) {
      console.warn('Sync attempt failed (network error):', e);
      setSyncState('failed');
    }
  };

  const handleDismiss = async (opId: string) => {
    await dismissOperation(opId);
    await refreshPending();
  };

  // Status visual configurations
  const getStatusBadge = () => {
    switch (syncState) {
      case 'offline':
        return {
          icon: <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
          label: 'Offline Mode',
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
        };
      case 'synchronizing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-cyan-500 animate-spin" />,
          label: `Synchronizing (${pendingOps.length})...`,
          bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-800'
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          label: 'Sync Completed',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
        };
      case 'conflict':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />,
          label: 'Conflict Review Needed',
          bg: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
        };
      case 'failed':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
          label: 'Sync Failed',
          bg: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
        };
      case 'online':
      default:
        return {
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-500" />,
          label: pendingOps.length > 0 ? `${pendingOps.length} Queued` : 'Online',
          bg: 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <>
      {/* Clickable Header Status Pill */}
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${badge.bg}`}
      >
        {badge.icon}
        <span className="hidden sm:inline">{badge.label}</span>
      </button>

      {/* Manual Sync & Conflict Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="p-5 bg-linear-to-r from-cyan-700 to-blue-700 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-cyan-200" />
                  <h4 className="font-bold text-base">Offline Sync & Storage Engine</h4>
                </div>
                <p className="text-xs text-cyan-100 mt-0.5">
                  IndexedDB local operation queue with idempotency keys and version conflict prevention
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Connection Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Network State</span>
                  <div className="flex items-center space-x-1.5 font-extrabold text-sm mt-0.5 text-slate-800 dark:text-slate-100">
                    {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-amber-500" />}
                    <span>{isOnline ? 'Online (Connected)' : 'Offline (Local IndexedDB Active)'}</span>
                  </div>
                  {lastSyncTime && (
                    <span className="text-slate-400 text-[10px]">Last verified sync: {lastSyncTime}</span>
                  )}
                </div>

                <button
                  onClick={triggerSync}
                  disabled={!isOnline || syncState === 'synchronizing'}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold disabled:opacity-40 flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'synchronizing' ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>

              {/* Pending Operations List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Queued Offline Operations ({pendingOps.length})
                  </h5>
                  <span className="text-[10px] text-slate-400">Idempotent Keys</span>
                </div>

                {pendingOps.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    No pending mutations. Local data is fully synchronized with server.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingOps.map((op) => (
                      <div
                        key={op.operation_id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${op.status === 'conflict'
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                            {op.action_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${op.status === 'conflict' ? 'bg-red-200 text-red-900' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {op.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500">
                          Entity: <span className="font-mono">{op.entity_id}</span> &bull; {new Date(op.operation_timestamp).toLocaleTimeString()}
                        </p>

                        {op.error_message && (
                          <div className="p-2 rounded-lg bg-red-100/70 dark:bg-red-950 text-red-900 dark:text-red-200 text-[10px] flex items-start justify-between gap-2">
                            <span>{op.error_message}</span>
                            <button
                              onClick={() => handleDismiss(op.operation_id)}
                              className="text-red-700 hover:text-red-900 shrink-0 font-bold"
                              title="Dismiss conflict"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Protection Notice */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center space-x-1 font-bold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Clinical Data Protection Protocol</span>
                </div>
                <p>
                  CarePath AI does not indiscriminately cache patient EHR records in local browser stores. Only authorized task statuses, outreach notes, and timestamps are held temporarily until server receipt is confirmed.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
