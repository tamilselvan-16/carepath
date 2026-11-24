import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Users, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { UserRole } from '../../types/auth';

interface FacilityItem {
  id: string;
  name: string;
  facility_code: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
}

interface UserItem {
  id: string;
  facility_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  is_active: boolean;
}

interface AuditLogItem {
  id: string;
  facility_id: string;
  user_id: string;
  action: string;
  entity_name: string;
  entity_id: string;
  details?: any;
  created_at: string;
}

export const SettingsView: React.FC = () => {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active Tab: Preferences, User Admin, Facility Admin, Audit Logs, Notification Config
  const [activeSubTab, setActiveSubTab] = useState<'preferences' | 'users' | 'facilities' | 'audit_logs' | 'notifications'>('preferences');

  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('healthcare_worker');
  const [newUserDept, setNewUserDept] = useState('Care Coordination');
  const [newUserFacility, setNewUserFacility] = useState(user?.facility_id || '');

  // New Facility Form State
  const [showAddFacModal, setShowAddFacModal] = useState(false);
  const [newFacName, setNewFacName] = useState('');
  const [newFacCode, setNewFacCode] = useState('');
  const [newFacAddress, setNewFacAddress] = useState('');
  const [newFacPhone, setNewFacPhone] = useState('');

  // Notification Preferences State
  const [notifyCareGaps, setNotifyCareGaps] = useState(true);
  const [notifyReferrals, setNotifyReferrals] = useState(true);
  const [notifyOutreach, setNotifyOutreach] = useState(true);
  const [notifyEscalations, setNotifyEscalations] = useState(true);

  const isAdmin = user?.role === 'administrator' || user?.role === 'facility_administrator';

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [facRes, usersRes, auditRes] = await Promise.all([
        fetch('/api/admin/facilities', { headers }),
        isAdmin ? fetch('/api/admin/users', { headers }) : Promise.resolve(null),
        fetch('/api/audit-logs', { headers })
      ]);

      if (facRes.ok) {
        const facData = await facRes.json();
        setFacilities(facData);
        if (!newUserFacility && facData.length > 0) setNewUserFacility(facData[0].id);
      }
      if (usersRes && usersRes.ok) {
        setUsers(await usersRes.json());
      }
      if (auditRes.ok) {
        setAuditLogs(await auditRes.json());
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeSubTab, token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          full_name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          department: newUserDept,
          facility_id: newUserFacility || user?.facility_id
        })
      });

      if (res.ok) {
        setStatusMsg('User registered and assigned successfully');
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName || !newFacCode) return;

    try {
      const res = await fetch('/api/admin/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          name: newFacName,
          facility_code: newFacCode,
          address: newFacAddress,
          contact_phone: newFacPhone
        })
      });

      if (res.ok) {
        setStatusMsg('New clinical facility registered successfully');
        setShowAddFacModal(false);
        setNewFacName('');
        setNewFacCode('');
        setNewFacAddress('');
        setNewFacPhone('');
        loadAdminData();
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              Institutional Governance
            </span>
            <span className="text-xs text-slate-400">Phase 9 Administration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-cyan-600" />
            <span>Institutional Settings & Administrator Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage authorized staff, clinical roles, institutional facilities, security notifications, and tamper-evident audit trails.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <button
            onClick={() => setActiveSubTab('preferences')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'preferences' 
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Preferences
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveSubTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === 'users' 
                    ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Users & Roles
              </button>

              <button
                onClick={() => setActiveSubTab('facilities')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === 'facilities' 
                    ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Facilities
              </button>
            </>
          )}

          <button
            onClick={() => setActiveSubTab('audit_logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'audit_logs' 
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>

          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'notifications' 
                ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: PREFERENCES & SECURITY */}
      {activeSubTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-600" />
            <span>Institutional Account & Security Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Interface Theme</div>
                <p className="text-[11px] text-slate-500">Toggle between Light and Dark modes</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white flex items-center space-x-2"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                <span className="capitalize">{theme} Mode</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Active RBAC Role</div>
                <p className="text-[11px] text-slate-500">Signed in as {user?.email}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 uppercase font-mono">
                {user?.role.replace('_', ' ')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Assigned Facility Code</div>
                <p className="text-[11px] text-slate-500">Primary operational hospital unit</p>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                {user?.facility_id || 'SJM-CENTRAL'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Facility Access Isolation</div>
                <p className="text-[11px] text-slate-500">Cross-facility strict data isolation</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enforced</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USER & ROLE MANAGEMENT (ADMIN) */}
      {activeSubTab === 'users' && isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Authorized Clinical & Administrative Personnel</span>
              </h3>
              <p className="text-[11px] text-slate-500">Manage healthcare staff, role privileges, and facility assignments</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Staff Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                    <td className="py-3 text-slate-500 font-mono">{u.email}</td>
                    <td className="py-3 font-semibold">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 uppercase">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{u.department}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FACILITY MANAGEMENT */}
      {activeSubTab === 'facilities' && isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-cyan-600" />
                <span>Institutional Healthcare Facilities</span>
              </h3>
              <p className="text-[11px] text-slate-500">Participating hospital centers and continuity networks</p>
            </div>
            {(user?.role === 'administrator' || user?.role === 'facility_administrator') && (
              <button
                onClick={() => setShowAddFacModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Facility</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map(f => (
              <div key={f.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{f.name}</h4>
                    <span className="font-mono text-[11px] text-cyan-600 font-semibold">{f.facility_code}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">{f.address}</p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700">
                  <span>{f.contact_phone}</span>
                  <span>{f.contact_email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AUDIT LOGS */}
      {activeSubTab === 'audit_logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>Immutable Regulatory Clinical Audit Trail</span>
              </h3>
              <p className="text-[11px] text-slate-500">Tamper-evident logs of all patient care, referrals, activities and coordinator actions</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
              {auditLogs.length} Logged Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Entity Type</th>
                  <th className="pb-3 font-semibold">Entity ID</th>
                  <th className="pb-3 font-semibold">User Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 font-bold text-cyan-600 dark:text-cyan-400">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {log.entity_name}
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {log.entity_id}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {log.user_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: NOTIFICATION PREFERENCES */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-cyan-600" />
            <span>Notification & Alert Dispatch Rules</span>
          </h3>
          <p className="text-[11px] text-slate-500">Configure role-based alerts for clinical care bottlenecks and delayed referrals</p>

          <div className="space-y-3 pt-2 max-w-2xl">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">High-Priority Care-Gap Alerts</span>
                <span className="text-[11px] text-slate-500">Dispatch immediate notifications when ML/Rule predicts continuity failure</span>
              </div>
              <input
                type="checkbox"
                checked={notifyCareGaps}
                onChange={(e) => setNotifyCareGaps(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Referral Acknowledgment & Delay Alerts</span>
                <span className="text-[11px] text-slate-500">Notify when receiving facility fails to acknowledge referral within 48 hours</span>
              </div>
              <input
                type="checkbox"
                checked={notifyReferrals}
                onChange={(e) => setNotifyReferrals(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Overdue Task & Outreach Escalation</span>
                <span className="text-[11px] text-slate-500">Send reminder notifications when outreach contact attempts exceed due dates</span>
              </div>
              <input
                type="checkbox"
                checked={notifyOutreach}
                onChange={(e) => setNotifyOutreach(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Institutional Supervisor Escalations</span>
                <span className="text-[11px] text-slate-500">Alert facility administrators when care coordinators record severe patient barriers</span>
              </div>
              <input
                type="checkbox"
                checked={notifyEscalations}
                onChange={(e) => setNotifyEscalations(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Add Authorized Staff Member</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  placeholder="e.g. Dr. Rajesh Kumar, MD"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  placeholder="rajesh.kumar@hospital.org"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Clinical Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="doctor">Doctor / Physician</option>
                    <option value="healthcare_worker">Healthcare Worker</option>
                    <option value="facility_administrator">Facility Administrator</option>
                    <option value="administrator">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assign to Facility</label>
                  <select
                    value={newUserFacility}
                    onChange={(e) => setNewUserFacility(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.facility_code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FACILITY */}
      {showAddFacModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Register New Facility</h3>
            <form onSubmit={handleCreateFacility} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Facility Name</label>
                <input
                  type="text"
                  required
                  value={newFacName}
                  onChange={(e) => setNewFacName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  placeholder="e.g. Apex Regional Specialty Hospital"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Facility Code</label>
                <input
                  type="text"
                  required
                  value={newFacCode}
                  onChange={(e) => setNewFacCode(e.target.value.toUpperCase())}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase"
                  placeholder="e.g. ARS-SOUTH"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Address</label>
                <input
                  type="text"
                  value={newFacAddress}
                  onChange={(e) => setNewFacAddress(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  placeholder="Hospital Road, Bangalore"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Contact Phone</label>
                <input
                  type="text"
                  value={newFacPhone}
                  onChange={(e) => setNewFacPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  placeholder="+91-80-555-0199"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFacModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
