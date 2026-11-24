import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import type { Patient, PathwayStep, CareReferral, FollowupTask } from '../../types';

interface PatientPortalViewProps {
  onBackToApp: () => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'lookup' | 'register'>('lookup');

  // Lookup state
  const [mrn, setMrn] = useState('');
  const [phoneOrDob, setPhoneOrDob] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Loaded Patient Record state
  const [portalData, setPortalData] = useState<{
    patient: Partial<Patient>;
    journeys: any[];
    activities: PathwayStep[];
    referrals: CareReferral[];
    followups: FollowupTask[];
  } | null>(null);

  // Self-Registration Form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDob, setRegDob] = useState('1990-01-01');
  const [regGender, setRegGender] = useState('Male');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLang, setRegLang] = useState('English');
  const [regPurpose, setRegPurpose] = useState('Outpatient Continuity Care');
  const [regConsent, setRegConsent] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccessPatient, setRegSuccessPatient] = useState<Patient | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!mrn.trim() || !phoneOrDob.trim()) {
      setLookupError('Please enter your Patient Reference ID (MRN) and your Phone or Date of Birth.');
      return;
    }

    try {
      setIsSearching(true);
      const isDate = phoneOrDob.includes('-');
      const payload: any = { mrn: mrn.trim() };
      if (isDate) payload.date_of_birth = phoneOrDob.trim();
      else payload.phone = phoneOrDob.trim();

      const res = await fetch('/api/patient-portal/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Verification failed. Please check your credentials.');
      }

      const data = await res.json();
      setPortalData(data);
    } catch (err: any) {
      setLookupError(err.message || 'Unable to access patient portal');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelfRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regFirstName.trim() || !regLastName.trim() || !regPhone.trim()) {
      setRegError('Please provide your name and phone number.');
      return;
    }
    if (!regConsent) {
      setRegError('Informed consent is required to participate in the care continuity network.');
      return;
    }

    try {
      setIsRegistering(true);
      const res = await fetch('/api/patients/self-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: regFirstName.trim(),
          last_name: regLastName.trim(),
          date_of_birth: regDob,
          gender: regGender,
          phone: regPhone.trim(),
          email: regEmail.trim(),
          address: regAddress.trim(),
          primary_language: regLang,
          registration_purpose: regPurpose,
          consent_status: 'granted',
          registration_channel: 'patient_self_portal'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }

      const created = await res.json();
      setRegSuccessPatient(created);
    } catch (err: any) {
      setRegError(err.message || 'Error occurred during registration');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black">CarePath AI • Patient Care Portal</h1>
              <p className="text-[11px] text-slate-500">Every Patient Matters. Every Treatment Journey Counts.</p>
            </div>
          </div>

          <button
            onClick={onBackToApp}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Clinical Staff Login
          </button>
        </div>

        {/* View Switcher: Lookup Care Journey vs. Self Register */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => { setActiveTab('lookup'); setPortalData(null); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'lookup'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Access My Care Journey
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegSuccessPatient(null); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Patient / Caregiver Self-Registration
            </button>
          </div>
        </div>

        {/* CASE 1: PATIENT LOOKUP FORM (NO ACCOUNT FORCED) */}
        {activeTab === 'lookup' && !portalData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 mb-2">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black">View Your Appointments & Reminders</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No password or account creation required. Simply enter your Reference ID from your patient card.
              </p>
            </div>

            {lookupError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Reference ID (MRN) *
                </label>
                <input
                  type="text"
                  required
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value.toUpperCase())}
                  placeholder="e.g. CLP-2026-1001"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Factor (Phone Number or Date of Birth) *
                </label>
                <input
                  type="text"
                  required
                  value={phoneOrDob}
                  onChange={(e) => setPhoneOrDob(e.target.value)}
                  placeholder="e.g. +1-617-555-0101 or 1978-04-12"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSearching ? <span>Verifying Identity...</span> : <span>Access Care Records</span>}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* CASE 2: PATIENT PORTAL CARE JOURNEY DASHBOARD */}
        {activeTab === 'lookup' && portalData && (
          <div className="space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Verified Patient Record
                  </span>
                  <span className="text-xs font-mono text-cyan-600 font-bold">{portalData.patient.mrn}</span>
                </div>
                <h2 className="text-2xl font-black mt-1">
                  {portalData.patient.first_name} {portalData.patient.last_name}
                </h2>
                <p className="text-xs text-slate-500">
                  DOB: {portalData.patient.date_of_birth} • Preferred Language: {portalData.patient.primary_language}
                </p>
              </div>

              <button
                onClick={() => setPortalData(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign Out of Portal
              </button>
            </div>

            {/* Upcoming Activities & Recovery Appointments */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <span>Your Care Journey Milestones & Appointments</span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {portalData.activities.map((step) => (
                  <div key={step.id} className="py-3.5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{step.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-2">
                        <span>Due: {step.due_date}</span>
                        {step.assigned_worker_name && <span>• Assigned: {step.assigned_worker_name}</span>}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                      step.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : step.status === 'overdue'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach & Referrals Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Referrals & Special Inquiries</span>
                </h4>
                {portalData.referrals.length === 0 ? (
                  <p className="text-xs text-slate-400">No active external referrals</p>
                ) : (
                  portalData.referrals.map(r => (
                    <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{r.specialty}</div>
                      <p className="text-slate-500">Referred to: {r.referred_to_facility}</p>
                      <span className="text-[10px] uppercase font-bold text-cyan-600 mt-1 block">Status: {r.status}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Support & Community Coordinator Contact</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  If you face transportation difficulty or need an appointment rescheduled, please contact your care team at your assigned facility.
                </p>
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                  <strong>St. Jude Metropolitan Health Center</strong>
                  <p>Continuity Hotline: +1-617-555-0190</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: PATIENT SELF REGISTRATION FORM */}
        {activeTab === 'register' && !regSuccessPatient && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 uppercase">
                Care Continuity Intake
              </span>
              <h2 className="text-xl font-black mt-1">Patient & Caregiver Self-Registration</h2>
              <p className="text-xs text-slate-500">
                Register to receive automated clinic appointment reminders, recovery follow-ups, and coordinated specialist care.
              </p>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleSelfRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={e => setRegFirstName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={e => setRegLastName(e.target.value)}
                    placeholder="e.g. Patel"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={regDob}
                    onChange={e => setRegDob(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={e => setRegGender(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unspecified">Prefer Not to Say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+91-98765-43210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address / Locality</label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={e => setRegAddress(e.target.value)}
                    placeholder="City, District"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Language</label>
                  <select
                    value={regLang}
                    onChange={e => setRegLang(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Registration</label>
                <input
                  type="text"
                  value={regPurpose}
                  onChange={e => setRegPurpose(e.target.value)}
                  placeholder="e.g. Regular health checkup, Diabetes management, Doctor referral"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regConsent}
                  onChange={e => setRegConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  I grant voluntary consent for healthcare continuity notifications, follow-up scheduling, and authorized provider communication under HIPAA and institutional privacy rules.
                </span>
              </label>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                {isRegistering ? 'Registering...' : 'Register & Generate Care Continuity Card'}
              </button>
            </form>
          </div>
        )}

        {/* CASE 4: REGISTRATION SUCCESS CARD */}
        {activeTab === 'register' && regSuccessPatient && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-5 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black">Registration Successful!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please save or print your Patient Reference ID. Bring it to any participating hospital or clinic.
            </p>

            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800">
              <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block">Your Patient Reference ID</span>
              <span className="font-mono text-2xl font-black text-cyan-800 dark:text-cyan-200">{regSuccessPatient.mrn}</span>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Card</span>
              </button>
              <button
                onClick={() => {
                  setMrn(regSuccessPatient.mrn);
                  setPhoneOrDob(regSuccessPatient.phone);
                  setActiveTab('lookup');
                  setRegSuccessPatient(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
              >
                Go to My Portal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
