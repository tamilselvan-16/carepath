import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations';
import type { UserRole } from '../types/auth';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  HeartPulse
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const { language, login, register, resetPassword, updatePassword } = useAuth();
  const t = translations[language] || translations.en;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('healthcare_worker');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Role selections with descriptions
  const rolesList: { value: UserRole; label: string; desc: string }[] = [
    { value: 'doctor', label: t.doctorRole, desc: 'Review clinical recovery milestones, order laboratory follow-ups, and review gaps.' },
    { value: 'healthcare_worker', label: t.healthcareWorkerRole, desc: 'Conduct patient outreach calls, address transit barriers, and update care logs.' },
    { value: 'facility_administrator', label: t.facilityAdminRole, desc: 'Manage facility-wide care pathways, protocol compliance, and staff allocations.' },
    { value: 'administrator', label: t.adminRole, desc: 'Enterprise system configuration, multi-facility oversight, and audit logs.' },
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage(t.invalidEmail);
      return;
    }

    if (mode === 'login') {
      if (!password) {
        setErrorMessage(t.fillAllFields);
        return;
      }
      setIsLoading(true);
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(t.authSuccess);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } else if (mode === 'register') {
      if (!fullName.trim() || !phone.trim() || !password) {
        setErrorMessage(t.fillAllFields);
        return;
      }
      if (password.length < 6) {
        setErrorMessage(t.shortPassword);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t.passwordMismatch);
        return;
      }

      setIsLoading(true);
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        preferredLanguage: language,
      });
      setIsLoading(false);

      if (res.success) {
        setSuccessMessage(t.registrationSuccess);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Registration could not be completed.');
      }
    } else if (mode === 'forgot') {
      setIsLoading(true);
      const res = await resetPassword(email);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(t.resetEmailSent);
      } else {
        setErrorMessage(res.error || 'Unable to process reset request.');
      }
    } else if (mode === 'reset') {
      if (!password || password.length < 6) {
        setErrorMessage(t.shortPassword);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t.passwordMismatch);
        return;
      }
      setIsLoading(true);
      const res = await updatePassword(password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Password has been successfully updated. You may now sign in.');
        setTimeout(() => setMode('login'), 1200);
      } else {
        setErrorMessage(res.error || 'Password update failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Decor */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">CarePath AI</h2>
              <p className="text-xs text-cyan-100 font-medium">Healthcare Continuity & Recovery Network</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mt-3">
            {mode === 'login' && t.login}
            {mode === 'register' && t.register}
            {mode === 'forgot' && t.forgotPassword}
            {mode === 'reset' && t.resetPassword}
          </h3>
          <p className="text-xs text-cyan-100/90 mt-0.5">
            {mode === 'login' && 'Sign in to access your assigned patients and care-gap coordination queue.'}
            {mode === 'register' && 'Join your hospital facility team to participate in coordinated patient follow-ups.'}
            {mode === 'forgot' && 'Enter your verified institutional email to receive recovery instructions.'}
            {mode === 'reset' && 'Define a new secure password for your clinical user account.'}
          </p>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
          
          {/* Notification Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fullName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins or Elena Rostova, RN"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phone} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.role} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {rolesList.map((r) => {
                    const isSelected = role === r.value;
                    return (
                      <div
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-50/80 border-cyan-600 text-cyan-950 ring-2 ring-cyan-500/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-700' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">{r.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Email field (for Login, Register, Forgot) */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.email} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
              </div>
            </div>
          )}

          {/* Password field (for Login, Register, Reset) */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {mode === 'reset' ? 'New Password' : t.password} *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (for Register, Reset) */}
          {(mode === 'register' || mode === 'reset') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.confirmPassword} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Authorization...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && t.login}
                  {mode === 'register' && t.register}
                  {mode === 'forgot' && t.sendResetLink}
                  {mode === 'reset' && t.resetPassword}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Mode Switching Footer */}
          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-600">
            {mode === 'login' && (
              <div>
                Don't have an institutional profile?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode('register');
                  }}
                  className="font-bold text-cyan-700 hover:underline"
                >
                  {t.register}
                </button>
              </div>
            )}

            {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
              <div>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode('login');
                  }}
                  className="font-bold text-cyan-700 hover:underline"
                >
                  {t.backToLogin}
                </button>
              </div>
            )}
          </div>

          {/* AI Safety Assurance */}
          <div className="text-center pt-1">
            <p className="text-[10px] text-slate-400 italic">
              CarePath AI operates under strict multi-tenant HIPAA-aligned privacy. 
              Non-diagnostic clinical continuity tracking only.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
