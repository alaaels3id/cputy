import React from 'react';
import { RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { ScanCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatBytes } from '../utils/formatters';

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
    <header className="h-14 border-b border-mac-border flex items-center justify-between px-6 titlebar-drag-region bg-mac-bg/85 backdrop-blur-xl select-none relative z-10 transition-colors">
      <div className="flex items-center gap-3 no-drag">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          {getCategoryTitle(currentCategory)}
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3 h-3" />
          <span>{t('protectedTag')}</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5 no-drag">
        {totalCleanableSize > 0 && onQuickClean && (
          <button
            onClick={onQuickClean}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl cputy-btn-primary text-xs font-semibold shadow-glow-emerald transition-all disabled:opacity-50 btn-solid cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse-subtle" />
            <span>{t('cleanSelected')} ({formatBytes(totalCleanableSize)})</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={isScanning}
          title={t('rescan')}
          className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all disabled:opacity-50 border border-black/5 dark:border-white/5 cursor-pointer hover:border-black/10 dark:hover:border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-500 dark:text-emerald-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
