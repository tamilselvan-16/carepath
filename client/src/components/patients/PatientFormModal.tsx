import React, { useState, useEffect } from 'react';
import type { Patient } from '../../types';
import {
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Printer,
  HeartHandshake
} from 'lucide-react';
import { PatientQRCode } from './PatientQRCode';
import { queueOfflineOperation } from '../../services/offlineQueue';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  patientToEdit?: Patient | null;
  defaultFacilityId: string;
  token?: string;
}

export const PatientFormModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patientToEdit,
  defaultFacilityId,
  token
}) => {
  const isEditing = Boolean(patientToEdit);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1980-01-01');
  const [gender, setGender] = useState('Unspecified');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('English');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high' | 'critical'>('low');
  const [facilityId, setFacilityId] = useState(defaultFacilityId);
  const [consentStatus, setConsentStatus] = useState<'granted' | 'revoked' | 'pending'>('granted');
  const [careStatus, setCareStatus] = useState<'active' | 'in_recovery' | 'completed' | 'paused'>('active');
  const [registrationPurpose, setRegistrationPurpose] = useState('Chronic Illness Continuity & Clinical Recovery');
  const [registrationChannel, setRegistrationChannel] = useState<'staff_dashboard' | 'assisted_caregiver'>('staff_dashboard');

  // Duplicate Detection State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    mrn: string;
    full_name: string;
    phone: string;
  } | null>(null);

  // Success & Printable Card State
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [showPrintCard, setShowPrintCard] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (patientToEdit) {
      setFirstName(patientToEdit.first_name);
      setLastName(patientToEdit.last_name);
      setDob(patientToEdit.date_of_birth);
      setGender(patientToEdit.gender);
      setPhone(patientToEdit.phone);
      setEmail(patientToEdit.email || '');
      setAddress(patientToEdit.address || '');
      setLanguage(patientToEdit.primary_language || 'English');
      setEmergencyName(patientToEdit.emergency_contact_name || '');
      setEmergencyPhone(patientToEdit.emergency_contact_phone || '');
      setRiskLevel(patientToEdit.risk_level);
      setFacilityId(patientToEdit.facility_id);
      setConsentStatus(patientToEdit.consent_status || 'granted');
      setCareStatus(patientToEdit.care_status || 'active');
      setRegistrationPurpose(patientToEdit.registration_purpose || 'Clinical Recovery Pathway');
    } else {
      setFirstName('');
      setLastName('');
      setDob('1980-01-01');
      setGender('Unspecified');
      setPhone('');
      setEmail('');
      setAddress('');
      setLanguage('English');
      setEmergencyName('');
      setEmergencyPhone('');
      setRiskLevel('low');
      setFacilityId(defaultFacilityId);
      setConsentStatus('granted');
      setCareStatus('active');
      setRegistrationPurpose('Chronic Illness Continuity & Clinical Recovery');
      setRegistrationChannel('staff_dashboard');
    }
    setDuplicateWarning(null);
    setRegisteredPatient(null);
    setShowPrintCard(false);
    setErrorMsg(null);
  }, [patientToEdit, isOpen, defaultFacilityId]);

  // Real-time Duplicate Check on Phone/Name Blur
  const handleCheckDuplicate = async () => {
    if (isEditing || !phone.trim() || phone.length < 7) return;

    try {
      const res = await fetch('/api/patients/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify({
          phone: phone.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          date_of_birth: dob
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.duplicate && data.existingPatient) {
          setDuplicateWarning(data.existingPatient);
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (e) {
      console.warn('Duplicate check check failed:', e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim() || !dob) {
      setErrorMsg('Please complete mandatory fields: First Name, Last Name, and Date of Birth.');
      return;
    }

    try {
      setIsLoading(true);
      const url = isEditing ? `/api/patients/${patientToEdit!.id}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dob,
        gender,
        phone: phone.trim() || 'Unspecified / No Phone',
        email: email.trim(),
        address: address.trim() || 'Registered Clinic Area',
        primary_language: language,
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        risk_level: riskLevel,
        facility_id: facilityId,
        consent_status: consentStatus,
        care_status: careStatus,
        registration_purpose: registrationPurpose,
        registration_channel: registrationChannel
      };

      // Offline First Check
      if (!navigator.onLine && !isEditing) {
        const tempId = `offline-pat-${Date.now()}`;
        await queueOfflineOperation({
          entity_id: tempId,
          entity_type: 'patient',
          action_type: 'REGISTER_OFFLINE_PATIENT',
          base_version: 1,
          payload
        });

        const syntheticOfflinePatient: Patient = {
          id: tempId,
          mrn: `CLP-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`,
          continuity_score: 100,
          registration_date: new Date().toISOString().split('T')[0],
          ...payload
        };

        setRegisteredPatient(syntheticOfflinePatient);
        setShowPrintCard(true);
        onSuccess(syntheticOfflinePatient);
        setIsLoading(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'dev-token'}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save patient record');
      }

      const saved = await res.json();
      setRegisteredPatient(saved);
      onSuccess(saved);

      if (!isEditing) {
        setShowPrintCard(true);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while saving patient.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">

        {/* Modal Header */}
        <div className="bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
              {isEditing ? 'Patient Reference Update' : 'Institutional Registration & Onboarding'}
            </span>
            <h3 className="text-xl font-black mt-1">
              {isEditing ? `Edit: ${patientToEdit?.first_name} ${patientToEdit?.last_name}` : 'Register Patient into Care Continuity Network'}
            </h3>
            {isEditing && (
              <p className="text-xs text-cyan-100 font-mono mt-0.5">Reference ID: {patientToEdit?.mrn}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POST-REGISTRATION SUCCESS & PRINTABLE CARD VIEW */}
        {showPrintCard && registeredPatient && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Patient Onboarded Successfully</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Patient Reference ID: <span className="font-mono font-bold">{registeredPatient.mrn}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Patient Card</span>
              </button>
            </div>

            {/* PRINTABLE PATIENT CARD */}
            <div className="printable-patient-card border-2 border-dashed border-cyan-500/40 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <div className="flex items-center space-x-1 text-cyan-600 font-bold text-xs uppercase tracking-wider">
                    <HeartHandshake className="w-4 h-4" />
                    <span>CarePath AI • Patient Continuity Card</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {registeredPatient.first_name} {registeredPatient.last_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    DOB: {registeredPatient.date_of_birth} • Gender: {registeredPatient.gender}
                  </p>
                </div>

                <div className="text-right">
                  <div className="px-3 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 font-mono text-sm font-black text-cyan-700 dark:text-cyan-300">
                    {registeredPatient.mrn}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Official Reference ID</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{registeredPatient.phone || 'No Phone (Staff Assisted)'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Preferred Language</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{registeredPatient.primary_language}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Registration Purpose</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{registeredPatient.registration_purpose || 'General Care Continuity'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Facility</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {registeredPatient.facility_id === 'a0000000-0000-0000-0000-000000000001' ? 'St. Jude Metropolitan' : 'Highland Valley'}
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PatientQRCode 
                    value={`https://CarePath.internal/portal?mrn=${registeredPatient.mrn}&dob=${registeredPatient.date_of_birth}`}
                    size={90}
                  />
                  <div className="text-[10px] text-slate-500">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Scan at any participating clinic counter</p>
                    <p>Instant care continuity lookup without mobile app or passwords</p>
                    <p className="font-mono text-[9px] text-slate-400 mt-0.5">Payload: {registeredPatient.mrn}</p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400">
                  <span>Issued: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* REGISTRATION FORM (WHEN NOT SHOWING PRINT CARD) */}
        {!showPrintCard && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">

            {/* DUPLICATE DETECTION WARNING */}
            {duplicateWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block">Possible Existing Patient Detected</span>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    A patient with matching details already exists: <strong>{duplicateWarning.full_name}</strong> ({duplicateWarning.mrn}).
                    Verify before submitting to prevent fragmented continuity records.
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Assistance / Channel Selector */}
            {!isEditing && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Registration Intake Mode</span>
                  <span className="text-[11px] text-slate-500">Supports patients without smartphones or internet</span>
                </div>
                <select
                  value={registrationChannel}
                  onChange={(e) => setRegistrationChannel(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs"
                >
                  <option value="staff_dashboard">Staff Clinical Intake</option>
                  <option value="assisted_caregiver">Assisted Caregiver / Relative</option>
                </select>
              </div>
            )}

            {/* Registration Purpose */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registration Purpose</label>
              <input
                type="text"
                value={registrationPurpose}
                onChange={e => setRegistrationPurpose(e.target.value)}
                placeholder="e.g. Post-operative cardiology continuity, TB DOTS protocol, Maternity monitoring"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
              />
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onBlur={handleCheckDuplicate}
                  placeholder="e.g. Anand"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onBlur={handleCheckDuplicate}
                  placeholder="e.g. Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-Binary</option>
                  <option value="Unspecified">Prefer Not to Say</option>
                </select>
              </div>
            </div>

            {/* Contact: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone (Optional if none)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onBlur={handleCheckDuplicate}
                  placeholder="+91-98765-43210"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patient@CarePath.local"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Address & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Village / Town, District, State"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white cursor-pointer"
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

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  placeholder="Spouse / Parent / Community Leader"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Phone Number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  placeholder="+91-98765-00000"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Facility, Consent & Initial Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Facility</label>
                <select
                  value={facilityId}
                  onChange={e => setFacilityId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="a0000000-0000-0000-0000-000000000001">St. Jude Metropolitan Center</option>
                  <option value="a0000000-0000-0000-0000-000000000002">Highland Valley Hospital</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Informed Consent Status</label>
                <select
                  value={consentStatus}
                  onChange={e => setConsentStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="granted">Consent Granted (Active)</option>
                  <option value="pending">Pending Written Form</option>
                  <option value="revoked">Consent Revoked</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Risk Category</label>
                <select
                  value={riskLevel}
                  onChange={e => setRiskLevel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="low">Low Risk</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold flex items-center space-x-2 disabled:opacity-50 shadow-md shadow-cyan-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Registration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes' : 'Generate ID & Onboard Patient'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
