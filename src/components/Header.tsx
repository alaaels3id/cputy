import React from 'react';
import { RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { ScanCategory } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentCategory: ScanCategory;
  isScanning: boolean;
  onRefresh: () => void;
  onQuickClean?: () => void;
  totalCleanableSize?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  isScanning,
  onRefresh,
  onQuickClean,
  totalCleanableSize = 0,
}) => {
  const { t } = useLanguage();

  const getCategoryTitle = (cat: ScanCategory) => {
    switch (cat) {
      case 'smart': return t('smartTitle');
      case 'system': return t('systemTitle');
      case 'developer': return t('developerTitle');
      case 'browsers': return t('browsersTitle');
      case 'photos': return t('photosTitle');
      case 'cloud': return t('cloudTitle');
      case 'large_files': return t('largeFilesTitle');
      case 'duplicates': return t('duplicatesTitle');
      case 'uninstaller': return t('uninstallerTitle');
      case 'monitor': return t('monitorTitle');
      default: return 'CPUTY';
    }
  };

  return (
    <header className="h-14 border-b border-mac-border flex items-center justify-between px-6 titlebar-drag-region bg-mac-bg/80 backdrop-blur-md select-none relative z-10 transition-colors">
      <div className="flex items-center gap-3 no-drag">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {getCategoryTitle(currentCategory)}
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
          <ShieldCheck className="w-3 h-3" />
          {t('protectedTag')}
        </span>
      </div>

      <div className="flex items-center gap-2.5 no-drag">
        {totalCleanableSize > 0 && onQuickClean && (
          <button
            onClick={onQuickClean}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-glow-blue transition-all disabled:opacity-50 btn-solid cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('cleanSelected')}</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={isScanning}
          title={t('rescan')}
          className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-50 border border-black/5 dark:border-white/5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-500 dark:text-blue-400' : ''}`} />
        </button>

        <LanguageToggle variant="header" />
        <ThemeToggle />
      </div>
    </header>
  );
};

