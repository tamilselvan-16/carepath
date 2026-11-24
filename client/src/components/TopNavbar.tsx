import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../translations';
import { LanguageSelector } from './LanguageSelector';
import { SyncIndicator } from './pwa/SyncIndicator';
import {
  Menu,
  Search,
  Calendar,
  Building2,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
  selectedFacility: string;
  onFacilityChange: (facilityId: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  onNotificationClick: () => void;
  onSyncCompleted?: () => void;
  token?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileSidebar,
  selectedFacility,
  onFacilityChange,
  selectedDateRange,
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  unreadCount,
  onNotificationClick,
  onSyncCompleted,
  token,
}) => {
  const { user, logout, language } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const t = translations[language] || translations.en;

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 transition-colors">

      {/* Left Area: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Area: Facility Filter, Date Filter, Theme, Language, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">

        {/* Facility Filter Dropdown */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Building2 className="w-3.5 h-3.5 text-cyan-600" />
          <select
            value={selectedFacility}
            onChange={(e) => onFacilityChange(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Facilities</option>
            <option value="a0000000-0000-0000-0000-000000000001">St. Jude Metropolitan</option>
            <option value="a0000000-0000-0000-0000-000000000002">Highland Valley Hospital</option>
          </select>
        </div>

        {/* Date Filter Dropdown */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_quarter">Quarter to Date</option>
          </select>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Offline Sync State Indicator */}
        <SyncIndicator
          token={token}
          onSyncCompleted={onSyncCompleted || (() => { })}
        />

        {/* Multilingual Selector */}
        <LanguageSelector variant="navbar" />

        {/* Notifications Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          )}
        </button>

        {/* User Profile Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 pl-2 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 uppercase">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
