import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  MessageSquare,
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Languages
} from 'lucide-react';
import type { Patient } from '../../types';

interface OutreachScriptCopilotProps {
  patients: Patient[];
  onLogOutreach?: (patientId: string, outcome: string) => void;
}

export const OutreachScriptCopilot: React.FC<OutreachScriptCopilotProps> = ({
  patients,
  onLogOutreach
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [channel, setChannel] = useState<'call' | 'whatsapp' | 'sms'>('call');
  const [language, setLanguage] = useState<string>('hi');
  const [barrier, setBarrier] = useState<'transit' | 'financial' | 'fear' | 'caregiver' | 'routine'>('transit');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [outreachLogged, setOutreachLogged] = useState<string | null>(null);

  const [result, setResult] = useState<{
    script_text: string;
    key_talking_points: string[];
    whatsapp_message: string;
    sms_message: string;
    suggested_action: string;
    pronunciation_guide?: string;
    provider: string;
    safety_disclaimer: string;
  } | null>(null);

  // Set default patient if available
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleGenerate = async () => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setResult(null);
    setOutreachLogged(null);

    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch('/api/innovations/outreach-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          phone: selectedPatient.phone,
          language,
          channel,
          barrier,
          overdueMilestones: ['Day 45 Post-PCI Secondary Prevention Lipid Panel', 'Follow-up Consultation'],
          nextAppointmentDate: 'this Thursday at 10:30 AM',
          clinicName: 'St. Jude Metro Care Center',
          clinicPhone: '+1-617-555-0200'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Failed to generate outreach script:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger initial generation once patient is loaded
  useEffect(() => {
    if (selectedPatient && !result && !isLoading) {
      handleGenerate();
    }
  }, [selectedPatientId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeechToggle = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      es: 'es-ES'
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.9; // natural conversational pacing

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleLogOutcome = (outcome: string) => {
    setOutreachLogged(outcome);
    if (onLogOutreach && selectedPatient) {
      onLogOutreach(selectedPatient.id, outcome);
    }
    setTimeout(() => setOutreachLogged(null), 4000);
  };

  const cleanPhone = (selectedPatient?.phone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-6 bg-linear-to-r from-teal-600 via-cyan-600 to-blue-700 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">AI Multilingual Outreach Copilot</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                  Field Navigator Tool
                </span>
              </div>
              <p className="text-xs text-cyan-100 mt-1">
                Culturally empathetic, barrier-aware talking points, WhatsApp messages, and voice pronunciation in 8 regional languages.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-xl bg-black/20 text-xs font-semibold backdrop-blur-sm border border-white/15 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Non-Diagnostic Patient Engagement</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Patient
            </label>
            <div className="relative">
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>
            {selectedPatient && (
              <div className="mt-2 p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-800/50 text-xs text-cyan-900 dark:text-cyan-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold">Phone:</span> {selectedPatient.phone || 'No phone recorded'}
                </div>
                <div className="font-semibold text-cyan-700 dark:text-cyan-300">
                  {selectedPatient.continuity_score}% Continuity
                </div>
              </div>
            )}
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Languages className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Patient Preferred Language</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'hi', label: 'Hindi (हिन्दी)' },
                { id: 'ta', label: 'Tamil (தமிழ்)' },
                { id: 'te', label: 'Telugu (తెలుగు)' },
                { id: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                { id: 'bn', label: 'Bengali (বাংলা)' },
                { id: 'mr', label: 'Marathi (मराठी)' },
                { id: 'es', label: 'Spanish (Español)' },
                { id: 'en', label: 'English (US)' }
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${language === lang.id
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outreach Channel */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Outreach Modality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'call', label: 'Phone Call', icon: PhoneCall },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'sms', label: 'SMS Text', icon: Send }
              ].map(ch => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setChannel(ch.id as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${channel === ch.id
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Access Barrier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Address Key Patient Barrier
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'transit', label: 'Transit & Distance (Offer ride assistance)' },
                { id: 'financial', label: 'Financial Anxiety (Explain coverage & subsidies)' },
                { id: 'fear', label: 'Procedural Anxiety (Provide reassurance)' },
                { id: 'caregiver', label: 'Caregiver Schedule (Flexible timing)' },
                { id: 'routine', label: 'Routine Reminder (Friendly calendar sync)' }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setBarrier(b.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${barrier === b.id
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                    }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-cyan-600/20 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Generating Script...' : 'Regenerate Tailored Script'}</span>
          </button>
        </div>

        {/* Right Column: AI Output & Active Channels */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {isLoading ? (
            <div className="flex-1 min-h-90 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Generating multilingual outreach script...
              </p>
              <p className="text-xs text-slate-400">
                Harmonizing tone, regional idioms, and barrier guidance
              </p>
            </div>
          ) : result ? (
            <>
              {/* Main Content Box */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      {channel === 'call' ? 'Spoken Phone Script' : channel === 'whatsapp' ? 'WhatsApp Template' : 'SMS Text'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-semibold">
                      Powered by {result.provider}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Speech Synthesis Button */}
                    <button
                      onClick={() => handleSpeechToggle(
                        channel === 'call' ? result.script_text : channel === 'whatsapp' ? result.whatsapp_message : result.sms_message
                      )}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${isSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500'
                        }`}
                      title="Listen to regional pronunciation"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Play Audio Voice'}</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(
                        channel === 'call' ? result.script_text : channel === 'whatsapp' ? result.whatsapp_message : result.sms_message
                      )}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 flex items-center space-x-1.5"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Script Display */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-normal whitespace-pre-line shadow-xs">
                  {channel === 'call' && result.script_text}
                  {channel === 'whatsapp' && result.whatsapp_message}
                  {channel === 'sms' && result.sms_message}
                </div>

                {/* Pronunciation & Phonetic Guide */}
                {result.pronunciation_guide && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                    <span className="font-bold shrink-0">Phonetic Tip:</span>
                    <span>{result.pronunciation_guide}</span>
                  </div>
                )}

                {/* Key Talking Points */}
                <div>
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Coordinator Checklist
                  </h4>
                  <ul className="space-y-1.5">
                    {result.key_talking_points.map((tp, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                        <span>{tp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Dispatch & Action Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {/* WhatsApp Direct Dispatch */}
                  {selectedPatient?.phone && (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(result.whatsapp_message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open WhatsApp Web</span>
                    </a>
                  )}

                  {/* Native SMS Dispatch */}
                  {selectedPatient?.phone && (
                    <a
                      href={`sms:${cleanPhone}?body=${encodeURIComponent(result.sms_message)}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Dispatch SMS</span>
                    </a>
                  )}
                </div>

                {/* Log Call Outcome */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">Log Outcome:</span>
                  <button
                    onClick={() => handleLogOutcome('Answered & Confirmed Rescheduled')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                  >
                    Rescheduled
                  </button>
                  <button
                    onClick={() => handleLogOutcome('Transit Barrier Flagged')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                  >
                    Transit Needed
                  </button>
                  <button
                    onClick={() => handleLogOutcome('No Answer - WhatsApp Sent')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  >
                    No Answer
                  </button>
                </div>
              </div>

              {outreachLogged && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Outreach logged successfully: "{outreachLogged}". Timeline updated.</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
