import type { DashboardTab } from '../types/dashboard';
import { 
  LayoutDashboard, 
  Users, 
  Route, 
  BrainCircuit, 
  Bell 
} from 'lucide-react';

interface BottomNavigationProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  unreadCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadCount,
}) => {
  const quickNav = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'patients' as DashboardTab, label: 'Patients', icon: Users },
    { id: 'care_journeys' as DashboardTab, label: 'Journeys', icon: Route },
    { id: 'ai_care_gaps' as DashboardTab, label: 'Care Gaps', icon: BrainCircuit, badge: 2 },
    { id: 'notifications' as DashboardTab, label: 'Alerts', icon: Bell, badge: unreadCount },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
      {quickNav.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
              isActive 
                ? 'text-cyan-700 dark:text-cyan-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-600" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
