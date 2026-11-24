import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  AlertTriangle, 
  Share2, 
  PhoneCall, 
  Settings2, 
  Languages
} from 'lucide-react';
import type { UserNotification } from '../../types/dashboard';
import { formatLocalizedDate, getTranslatedNotification } from '../../utils/localeUtils';

interface NotificationsViewProps {
  notifications: UserNotification[];
  onMarkRead: (id: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onMarkRead }) => {
  const { language } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  // Translation preview toggle state (per notification item)
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    care_gap_alerts: true,
    referral_updates: true,
    outreach_assignments: true,
    approaching_milestones: true,
    sound_alerts: false
  });

  const toggleShowOriginal = (id: string) => {
    setShowOriginalMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'unread') return !n.is_read;
    if (filterType === 'critical') return n.severity === 'critical';
    if (filterType === 'care_gap') return n.category === 'care_gap';
    if (filterType === 'referral') return n.category === 'referral';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-cyan-300" />
            <h2 className="text-xl font-bold tracking-tight">Clinical Continuity Notifications & Alerts</h2>
          </div>
          <p className="text-xs text-cyan-100 mt-1 max-w-xl">
            Real-time multi-lingual event triggers: new task assignments, overdue milestones, referral acknowledgements, and AI care-gap alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all"
          >
            <Settings2 className="w-4 h-4 text-cyan-300" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences Drawer / Card */}
      {showPreferences && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-cyan-600" />
              <span>Role-Based Notification Delivery Preferences</span>
            </h4>
            <span className="text-xs text-slate-400">HIPAA Protected: No PII transmitted via external channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.care_gap_alerts}
                onChange={(e) => setPreferences(p => ({ ...p, care_gap_alerts: e.target.checked }))}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">High-Priority Care Gaps</strong>
                <span className="text-slate-400 text-[11px]">Instant alerts for missed clinical milestones</span>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.referral_updates}
                onChange={(e) => setPreferences(p => ({ ...p, referral_updates: e.target.checked }))}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Referral Status Updates</strong>
                <span className="text-slate-400 text-[11px]">Acknowledgements, delays & verifications</span>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.outreach_assignments}
                onChange={(e) => setPreferences(p => ({ ...p, outreach_assignments: e.target.checked }))}
                className="rounded text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Coordinator Task Queue</strong>
                <span className="text-slate-400 text-[11px]">New outreach tasks & escalations</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Main List & Filter Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Filter Navigation */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Notification Center
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-bold text-xs">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'unread', label: 'Unread Only' },
              { id: 'critical', label: 'Critical' },
              { id: 'care_gap', label: 'Care Gaps' },
              { id: 'referral', label: 'Referrals' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                  filterType === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Stream */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No notifications matching your filter.
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const isShowingOriginal = showOriginalMap[notif.id] || false;
              // Get translated title & message for current selected language
              const localized = getTranslatedNotification(notif.title, notif.message, language);
              const displayTitle = isShowingOriginal ? notif.title : localized.title;
              const displayMessage = isShowingOriginal ? notif.message : localized.message;

              return (
                <div
                  key={notif.id}
                  className={`p-5 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    notif.is_read
                      ? 'bg-white dark:bg-slate-900 opacity-80'
                      : 'bg-cyan-50/20 dark:bg-cyan-950/20 border-l-4 border-l-cyan-600'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Severity Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                      notif.severity === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {notif.category === 'referral' ? <Share2 className="w-4 h-4" /> :
                       notif.category === 'outreach' ? <PhoneCall className="w-4 h-4" /> :
                       notif.severity === 'critical' ? <AlertTriangle className="w-4 h-4" /> :
                       <Bell className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          notif.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                          notif.severity === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {notif.severity}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {displayTitle}
                        </h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-600" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                        {displayMessage}
                      </p>

                      {/* Bilingual / Original text toggle */}
                      {language !== 'en' && (
                        <div className="pt-1 flex items-center space-x-2 text-[11px]">
                          <button
                            onClick={() => toggleShowOriginal(notif.id)}
                            className="inline-flex items-center space-x-1 text-cyan-600 hover:text-cyan-700 font-semibold"
                          >
                            <Languages className="w-3 h-3" />
                            <span>{isShowingOriginal ? 'View Translated' : 'View English Original'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2 text-xs text-slate-400">
                    <span className="text-[11px]">
                      {formatLocalizedDate(notif.created_at, language)}
                    </span>
                    {!notif.is_read && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
