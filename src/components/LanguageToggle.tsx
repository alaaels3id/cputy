import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FlagEN, FlagAR } from './FlagIcons';

interface LanguageToggleProps {
  variant?: 'header' | 'cards';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'header', className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
        {/* English Option */}
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center justify-between p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-emerald-600/15 border-emerald-500/50 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30'
              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-md bg-white/10 dark:bg-black/20 flex items-center justify-center">
              <FlagEN className="w-6 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <span>{t('englishLang')}</span>
                {language === 'en' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#92E6E0] animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-mac-subtext mt-0.5">{t('englishSub')}</p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
            language === 'en' ? 'border-[#92E6E0] bg-[#92E6E0] text-[#14252E]' : 'border-slate-400 dark:border-slate-600'
          }`}>
            {language === 'en' && <span className="text-[9px] font-bold">✓</span>}
          </div>
        </button>

        {/* Arabic Option */}
        <button
          type="button"
          onClick={() => setLanguage('ar')}
          className={`flex items-center justify-between p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
            language === 'ar'
              ? 'bg-[#92E6E0]/15 border-[#92E6E0]/50 text-slate-900 dark:text-white shadow-sm ring-1 ring-[#92E6E0]/30'
              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-md bg-white/10 dark:bg-black/20 flex items-center justify-center">
              <FlagAR className="w-6 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <span>{t('arabicLang')}</span>
                {language === 'ar' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#92E6E0] animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-mac-subtext mt-0.5">{t('arabicSub')}</p>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
            language === 'ar' ? 'border-[#92E6E0] bg-[#92E6E0] text-[#14252E]' : 'border-slate-400 dark:border-slate-600'
          }`}>
            {language === 'ar' && <span className="text-[9px] font-bold">✓</span>}
          </div>
        </button>
      </div>
    );
  }

  // Header compact pill style
  return (
    <div className={`flex items-center p-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        title="English"
        dir="ltr"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <FlagEN className="w-4 h-3 shrink-0" />
        <span className="font-medium">EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ar')}
        title="العربية"
        dir="ltr"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
          language === 'ar'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <FlagAR className="w-4 h-3 shrink-0" />
        <span className="font-medium">عربي</span>
      </button>
    </div>
  );
};
