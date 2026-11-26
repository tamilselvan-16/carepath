import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { translations } from './translations';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { BottomNavigation } from './components/BottomNavigation';
import { HealthcareIllustration } from './components/HealthcareIllustration';
import { AuthModal } from './components/AuthModal';
import { OverviewView } from './components/sections/OverviewView';
import { NotificationsView } from './components/sections/NotificationsView';
import { ReportsView } from './components/sections/ReportsView';
import { SettingsView } from './components/sections/SettingsView';
import { PatientManagementView } from './components/patients/PatientManagementView';
import { PatientProfileView } from './components/patients/PatientProfileView';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { PatientPortalView } from './components/patients/PatientPortalView';
import { CareJourneysView } from './components/journeys/CareJourneysView';
import { CareActivitiesView } from './components/journeys/CareActivitiesView';
import { AICareGapIntelligenceView } from './components/dashboards/AICareGapIntelligenceView';
import { FollowupTasksView } from './components/followups/FollowupTasksView';
import { ReferralsManagementView } from './components/referrals/ReferralsManagementView';
import { OutreachScriptCopilot } from './components/innovations/OutreachScriptCopilot';
import { DoctorClinicalCopilot } from './components/innovations/DoctorClinicalCopilot';
import { BottleneckHeatmap } from './components/innovations/BottleneckHeatmap';
import { ComplianceSentinel } from './components/innovations/ComplianceSentinel';
import {
  HeartPulse,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import type { DashboardTab, OverviewStats, UserNotification } from './types/dashboard';
import type { Patient, CareGap, FollowupTask, PatientPathway, PathwayStep, CareReferral } from './types';

export default function App() {
  const { user, token, language } = useAuth();
  const t = translations[language] || translations.en;

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters & Global Search
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPatientPortal, setShowPatientPortal] = useState(false);

  // Phase 3 Patient Management States
  const [selectedProfilePatientId, setSelectedProfilePatientId] = useState<string | null>(null);
  const [patientFormModalOpen, setPatientFormModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  // Phase 2 Live Data
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [referrals, setReferrals] = useState<CareReferral[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [gaps, setGaps] = useState<CareGap[]>([]);
  const [followups, setFollowups] = useState<FollowupTask[]>([]);
  const [pathways, setPathways] = useState<PatientPathway[]>([]);
  const [allActivities, setAllActivities] = useState<PathwayStep[]>([]);
  const [selectedGap, setSelectedGap] = useState<CareGap | null>(null);

  // Fetch all Phase 2 Dashboard Data
  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const headers = {
        'Authorization': `Bearer ${token || 'dev-token'}`,
        'x-dev-user-id': user.id,
      };

      const facilityParam = selectedFacility !== 'all' ? `?facilityId=${selectedFacility}` : '';

      const [statsRes, refsRes, notifsRes, ptsRes, gapsRes, tasksRes, pwRes] = await Promise.all([
        fetch(`/api/dashboard/overview${facilityParam}`, { headers }),
        fetch(`/api/referrals${facilityParam}`, { headers }),
        fetch(`/api/notifications${facilityParam}`, { headers }),
        fetch(`/api/patients${facilityParam}`, { headers }),
        fetch(`/api/care-gaps${facilityParam}`, { headers }),
        fetch(`/api/followups${facilityParam}`, { headers }),
        fetch(`/api/pathways${facilityParam}`, { headers })
      ]);

      if (statsRes.ok) setOverviewStats(await statsRes.json());
      if (refsRes.ok) setReferrals(await refsRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (ptsRes.ok) setPatients(await ptsRes.json());
      if (pwRes.ok) {
        const pwData: PatientPathway[] = await pwRes.json();
        setPathways(pwData);
        // Flatten activities
        const steps = pwData.flatMap(pw => pw.steps || []);
        setAllActivities(steps);
      }
      if (gapsRes.ok) {
        const gapData = await gapsRes.json();
        setGaps(gapData);
        if (gapData.length > 0 && !selectedGap) setSelectedGap(gapData[0]);
      }
      if (tasksRes.ok) setFollowups(await tasksRes.json());
    } catch (err) {
      console.warn('Dashboard sync note:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedFacility, selectedDateRange]);

  // Mark notification read
  const handleMarkNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token || 'dev-token'}` }
      });
    } catch (e) {
      // offline silent
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Filtered lists for global search
  const filteredPatients = patients.filter(p =>
    searchQuery === '' ||
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">

      {/* PATIENT PORTAL ACCESSIBILITY (WHEN USER CHOOSES PATIENT PORTAL) */}
      {showPatientPortal && (
        <PatientPortalView onBackToApp={() => setShowPatientPortal(false)} />
      )}

      {/* CASE 1: UN-AUTHENTICATED LANDING & WELCOME */}
      {!user && !showPatientPortal && (
        <div className="min-h-screen flex flex-col">
          {/* Landing Header */}
          <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight">CarePath AI</span>
                <p className="text-[10px] text-slate-500 hidden sm:block">{t.tagline}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600"
              >
                {t.login}
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                className="px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-cyan-600 to-blue-600 rounded-xl shadow-xs hover:shadow transition-all"
              >
                {t.getStarted}
              </button>
            </div>
          </header>

          {/* Landing Hero */}
          <main className="max-w-7xl mx-auto px-6 sm:px-8 py-12 flex-1 w-full flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>AI-Powered Predictive Continuity Network</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {t.welcomeStatement}
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
                  {t.welcomeSub}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                    className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center space-x-2"
                  >
                    <span>{t.getStarted}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                    className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => setShowPatientPortal(true)}
                    className="px-6 py-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800 font-bold text-xs hover:bg-cyan-100"
                  >
                    Patient & Family Portal
                  </button>
                </div>
              </div>
              <div className="lg:col-span-5">
                <HealthcareIllustration />
              </div>
            </div>
          </main>
        </div>
      )}

      {/* CASE 2: AUTHENTICATED DASHBOARD APPLICATION (PHASE 2) */}
      {user && (
        <div className="min-h-screen flex">
          {/* Responsive Desktop Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            unreadNotifsCount={unreadCount}
          />

          {/* Main App Workspace Layout */}
          <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all">

            {/* Top Navbar with Date, Facility Filters, and Global Search */}
            <TopNavbar
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              selectedFacility={selectedFacility}
              onFacilityChange={setSelectedFacility}
              selectedDateRange={selectedDateRange}
              onDateRangeChange={setSelectedDateRange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              unreadCount={unreadCount}
              onNotificationClick={() => setCurrentTab('notifications')}
              token={token || undefined}
              onSyncCompleted={loadDashboardData}
            />

            {/* Dashboard Content Container */}
            <main className="p-4 sm:p-6 lg:p-8 flex-1 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">

              {/* TAB 1: OVERVIEW */}
              {currentTab === 'overview' && (
                <OverviewView
                  stats={overviewStats}
                  onNavigateTab={setCurrentTab}
                  patients={patients}
                  pathways={pathways}
                />
              )}

              {/* TAB: PERSONA INNOVATIONS */}
              {currentTab === 'innovations' && (
                user?.role === 'healthcare_worker' ? (
                  <OutreachScriptCopilot
                    patients={patients}
                    onLogOutreach={() => loadDashboardData()}
                  />
                ) : user?.role === 'doctor' ? (
                  <DoctorClinicalCopilot
                    patients={patients}
                    pathways={pathways}
                  />
                ) : user?.role === 'facility_administrator' ? (
                  <BottleneckHeatmap />
                ) : (
                  <ComplianceSentinel />
                )
              )}

              {/* TAB 2: PATIENTS (PHASE 3 COMPLETE MANAGEMENT) */}
              {currentTab === 'patients' && (
                selectedProfilePatientId ? (
                  <PatientProfileView
                    patientId={selectedProfilePatientId}
                    onClose={() => setSelectedProfilePatientId(null)}
                    onEditPatient={(patient) => {
                      setPatientToEdit(patient);
                      setPatientFormModalOpen(true);
                    }}
                  />
                ) : (
                  <PatientManagementView
                    patients={filteredPatients}
                    onSelectPatient={(id) => setSelectedProfilePatientId(id)}
                    onOpenRegisterModal={() => {
                      setPatientToEdit(null);
                      setPatientFormModalOpen(true);
                    }}
                    onOpenEditModal={(patient) => {
                      setPatientToEdit(patient);
                      setPatientFormModalOpen(true);
                    }}
                  />
                )
              )}

              {/* TAB 3: CARE JOURNEYS */}
              {currentTab === 'care_journeys' && (
                <CareJourneysView
                  pathways={pathways}
                  patients={patients}
                  onRefresh={loadDashboardData}
                  token={token || undefined}
                  selectedFacility={selectedFacility}
                />
              )}

              {/* TAB 4: CARE ACTIVITIES */}
              {currentTab === 'care_activities' && (
                <CareActivitiesView
                  steps={allActivities}
                  onRefresh={loadDashboardData}
                  token={token || undefined}
                />
              )}

              {/* TAB 5: REFERRALS */}
              {currentTab === 'referrals' && (
                <ReferralsManagementView
                  referrals={referrals}
                  patients={patients}
                  onRefresh={loadDashboardData}
                  token={token || undefined}
                  facilityId={selectedFacility !== 'all' ? selectedFacility : 'a0000000-0000-0000-0000-000000000001'}
                />
              )}

              {/* TAB 6: AI CARE-GAP INTELLIGENCE */}
              {currentTab === 'ai_care_gaps' && (
                <AICareGapIntelligenceView
                  gaps={gaps}
                  onRefresh={loadDashboardData}
                  token={token || undefined}
                />
              )}

              {/* TAB 7: FOLLOW-UP TASKS */}
              {currentTab === 'followup_tasks' && (
                <FollowupTasksView
                  tasks={followups}
                  patients={patients}
                  onRefresh={loadDashboardData}
                  token={token || undefined}
                  facilityId={selectedFacility !== 'all' ? selectedFacility : 'a0000000-0000-0000-0000-000000000001'}
                />
              )}

              {/* TAB 8: NOTIFICATIONS */}
              {currentTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onMarkRead={handleMarkNotificationRead}
                />
              )}

              {/* TAB 9: REPORTS & ANALYTICS */}
              {currentTab === 'reports' && (
                <ReportsView
                  stats={overviewStats}
                  token={token || undefined}
                  selectedFacility={selectedFacility}
                  selectedDateRange={selectedDateRange}
                />
              )}

              {/* TAB 10: SETTINGS */}
              {currentTab === 'settings' && (
                <SettingsView />
              )}

            </main>

            {/* Mobile Bottom Navigation Bar */}
            <BottomNavigation
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              unreadCount={unreadCount}
            />

          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Patient Registration & Edit Modal (Phase 3 & Onboarding) */}
      <PatientFormModal
        isOpen={patientFormModalOpen}
        onClose={() => {
          setPatientFormModalOpen(false);
          setPatientToEdit(null);
        }}
        onSuccess={() => {
          loadDashboardData();
        }}
        patientToEdit={patientToEdit}
        defaultFacilityId={selectedFacility !== 'all' ? selectedFacility : (user?.facility_id || 'a0000000-0000-0000-0000-000000000001')}
        token={token || undefined}
      />

    </div>
  );
}