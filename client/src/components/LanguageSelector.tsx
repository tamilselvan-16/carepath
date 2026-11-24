import React from 'react';
import { useAuth } from '../context/AuthContext';
import { supportedLanguages } from '../translations';
import type { SupportedLanguage } from '../translations';
import { Globe, Check } from 'lucide-react';

export const LanguageSelector: React.FC<{ variant?: 'navbar' | 'modal' | 'pill' }> = ({ variant = 'navbar' }) => {
  const { language, setLanguage } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`flex items-center space-x-2 text-xs font-semibold rounded-xl transition-all ${
          variant === 'pill'
            ? 'px-3 py-1.5 bg-white/90 text-slate-700 hover:bg-white shadow-sm border border-slate-200'
            : 'px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
        }`}
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-cyan-600" />
        <span className="font-medium">{currentLang.nativeName}</span>
        <span className="text-[10px] text-slate-400 font-mono">({currentLang.code.toUpperCase()})</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 py-2 border border-slate-100 divide-y divide-slate-50">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Language / மொழி
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {supportedLanguages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as SupportedLanguage);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-cyan-50/70 transition-colors ${
                      isSelected ? 'bg-cyan-50 text-cyan-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-slate-900 font-medium">{lang.nativeName}</div>
                      <div className="text-[11px] text-slate-400">{lang.name}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
