import React, { useState, useRef, useEffect } from 'react';
import { Type, Check, ChevronDown, Sparkles, Sliders } from 'lucide-react';
import { useFont, AppFont } from '../context/FontContext';
import { useLanguage } from '../context/LanguageContext';

export const FontSelector: React.FC = () => {
  const { currentFont, setFont, availableFonts, activeFontObject } = useFont();
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFont = (fontId: string) => {
    setFont(fontId);
    setIsOpen(false);
  };

  return (
    <div className={`p-6 rounded-3xl cputy-card border border-mac-border space-y-4 shadow-xs transition-all relative ${isOpen ? 'z-50' : 'z-10'}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-[#92E6E0]">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('fontTitle')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#92E6E0] font-mono font-bold">
                {activeFontObject.name}
              </span>
            </h3>
            <p className="text-xs text-mac-subtext mt-0.5">{t('fontDesc')}</p>
          </div>
        </div>

        {/* Dropdown Trigger */}
        <div className="relative z-50" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-xs min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#92E6E0] shrink-0" />
              <span className="truncate font-semibold">{activeFontObject.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu with Solid Opaque Background and Scroll */}
          {isOpen && (
            <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 w-72 md:w-80 rounded-2xl bg-white dark:bg-[#0E1B22] border border-slate-200 dark:border-[#5F9C9F]/40 shadow-2xl p-2 z-50 animate-fade-in space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('fontSelectLabel')}
              </div>

              {availableFonts.map((font) => {
                const isSelected = font.id === currentFont;
                const desc = t(font.descriptionKey as any) || '';

                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelectFont(font.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 text-slate-900 dark:text-white border border-emerald-500/30 shadow-xs'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                      <div className="text-xs font-bold flex items-center gap-1.5" style={{ fontFamily: font.family }}>
                        <span>{font.name}</span>
                        {font.id === 'Cairo' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#92E6E0]/20 text-[#92E6E0] font-mono">
                            {t('popularBadge')}
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-mac-subtext truncate mt-0.5 font-normal">
                        {desc}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-[#92E6E0] bg-[#92E6E0] text-[#14252E]'
                        : 'border-slate-400 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Live Typography Preview Box */}
      <div 
        className="p-4 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/50 space-y-2.5 transition-all duration-300"
        style={{ fontFamily: activeFontObject.family }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('fontPreviewTitle')} ({activeFontObject.name})</span>
          </span>
          <span className="font-mono text-[10px] text-[#92E6E0]">
            font-family: {activeFontObject.id}
          </span>
        </div>

        {/* English Sample */}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-wide">
          {t('fontPreviewSampleEn')}
        </p>

        {/* Arabic Sample */}
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed" dir="rtl">
          {t('fontPreviewSampleAr')}
        </p>
      </div>
    </div>
  );
};
