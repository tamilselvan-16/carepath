import React from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations';
import type { DashboardTab } from '../types/dashboard';
import {
  LayoutDashboard,
  Users,
  Route,
  CalendarCheck2,
  Share2,
  BrainCircuit,
  CheckSquare,
  Bell,
  BarChart3,
  Settings,
  HeartPulse,
  X,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadNotifsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  unreadNotifsCount
}) => {
  const { user, language } = useAuth();
  const t = translations[language] || translations.en;

  const navigationItems: {
    id: DashboardTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    roles?: string[];
  }[] = [
      { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
      { id: 'patients', label: t.navPatients, icon: Users },
      { id: 'care_journeys', label: t.navCareJourneys, icon: Route },
      { id: 'care_activities', label: t.navCareActivities, icon: CalendarCheck2 },
      { id: 'referrals', label: t.navReferrals, icon: Share2 },
      { id: 'ai_care_gaps', label: t.navCareGapIntelligence, icon: BrainCircuit, badge: 2 },
      { id: 'followup_tasks', label: t.navFollowupTasks, icon: CheckSquare },
      { id: 'notifications', label: t.navNotifications, icon: Bell, badge: unreadNotifsCount },
      { id: 'reports', label: t.navReports, icon: BarChart3, roles: ['administrator', 'facility_administrator', 'doctor'] },
      { id: 'settings', label: t.navSettings, icon: Settings },
    ];

  const permittedItems = navigationItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">CarePath AI</span>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold tracking-wide uppercase">Continuity Network</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user && (
          <div className="p-4 mx-4 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-500/20 shrink-0">
              {user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.full_name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                {user.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Clinical Operations
          </div>

          {permittedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                  ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-600/20 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyan-600" />
            <span className="truncate">RBAC Active: {user?.role.replace('_', ' ')}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            CarePath AI &bull; Production v2.0
          </div>
        </div>
      </aside>
    </>
  );
};
