import React from 'react';
import { 
  Rocket, 
  Trash2, 
  Code2, 
  Globe, 
  Image, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { ScanResult, ScanCategory } from '../types';
import { formatBytes } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface SmartScanViewProps {
  isScanning: boolean;
  onStartScan: () => void;
  onCleanAll: () => void;
  onNavigateCategory: (category: ScanCategory) => void;
  systemResult: ScanResult | null;
  devResult: ScanResult | null;
  browserResult: ScanResult | null;
  photosResult: ScanResult | null;
  lastCleanSummary: { freedBytes: number; count: number } | null;
}

export const SmartScanView: React.FC<SmartScanViewProps> = ({
  isScanning,
  onStartScan,
  onCleanAll,
  onNavigateCategory,
  systemResult,
  devResult,
  browserResult,
  photosResult,
  lastCleanSummary,
}) => {
  const { t, isRTL } = useLanguage();

  const systemSize = systemResult?.totalSize || 0;
  const devSize = devResult?.totalSize || 0;
  const browserSize = browserResult?.totalSize || 0;
  const photosSize = photosResult?.totalSize || 0;
  const totalCleanable = systemSize + devSize + browserSize + photosSize;

  const hasScanned = systemResult || devResult || browserResult || photosResult;

  const modules = [
    {
      id: 'system' as ScanCategory,
      title: t('systemJunk'),
      desc: isRTL ? 'سجلات المستخدم، ملفات الكاش، تقارير الأعطال وسلة المهملات' : 'User logs, cache files, crash reports & trash',
      size: systemSize,
      items: systemResult?.itemCount || 0,
      icon: Trash2,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      id: 'developer' as ScanCategory,
      title: t('developerJunk'),
      desc: isRTL ? 'مخرجات Xcode وHomebrew وحزم npm/yarn ومخلفات البناء' : 'Xcode DerivedData, Homebrew, npm/yarn packages',
      size: devSize,
      items: devResult?.itemCount || 0,
      icon: Code2,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      id: 'browsers' as ScanCategory,
      title: t('browsersPrivacy'),
      desc: isRTL ? 'كاش ملفات الويب لمتصفحات Chrome وSafari وArc وFirefox وEdge' : 'Chrome, Safari, Arc, Firefox & Edge cached web assets',
      size: browserSize,
      items: browserResult?.itemCount || 0,
      icon: Globe,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      id: 'photos' as ScanCategory,
      title: t('photosMedia'),
      desc: isRTL ? 'الصور المصغرة، مخرجات المعالجة، ولقطات الشاشة المؤقتة' : 'Derivative renders, streaming buffers & screenshot junk',
      size: photosSize,
      items: photosResult?.itemCount || 0,
      icon: Image,
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Clean Success Toast Banner */}
      {lastCleanSummary && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t('cleaningSuccess')}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isRTL ? (
                  <>تمت استعادة <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBytes(lastCleanSummary.freedBytes)}</span> من مساحة القرص بأمان.</>
                ) : (
                  <>Safely recovered <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatBytes(lastCleanSummary.freedBytes)}</span> of disk space.</>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{isRTL ? 'الآن' : 'Just now'}</span>
        </div>
      )}

      {/* Main Hero Radar / Scan Action */}
      <div className="relative overflow-hidden rounded-3xl mac-glass p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-mac-border">
        <div className="space-y-4 max-w-md text-start z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {t('smartScanTitle')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isScanning ? t('scanningSystem') : hasScanned ? t('smartScanReady') : t('startSmartScan')}
          </h1>
          <p className="text-xs leading-relaxed text-mac-subtext">
            {t('smartScanDesc')}
          </p>

          <div className="pt-2 flex items-center gap-3">
            {!hasScanned || isScanning ? (
              <button
                onClick={onStartScan}
                disabled={isScanning}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow-blue transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 btn-solid cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('scanningSystem')}</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>{t('startSmartScan')}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onCleanAll}
                  disabled={totalCleanable === 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-glow-emerald transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 btn-solid cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('cleanSelected')} ({formatBytes(totalCleanable)})</span>
                </button>
                <button
                  onClick={onStartScan}
                  className="px-4 py-3 rounded-xl rescan-btn text-sm font-medium transition-all cursor-pointer"
                >
                  {t('rescan')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Glowing Orb / Counter */}
        <div className="relative flex items-center justify-center p-6">
          <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center relative transition-all duration-300 ${
            isScanning 
              ? 'border-2 border-blue-500/50 animate-pulse-subtle shadow-glow-blue bg-blue-500/10' 
              : 'smart-scan-orb'
          }`}>
            {isScanning ? (
              <div className="flex flex-col items-center justify-center text-center space-y-2 p-4">
                <Loader2 className="w-9 h-9 text-blue-500 dark:text-blue-400 animate-spin" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">{t('scanningSystem')}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-4 py-2 space-y-1 select-none">
                <div className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full smart-scan-badge mb-1">
                  {t('totalSizeToFree')}
                </div>
                <div className="text-3xl md:text-4xl font-black tracking-tight font-mono smart-scan-total-number my-0.5">
                  {formatBytes(totalCleanable)}
                </div>
                <div className="text-[11px] font-medium smart-scan-status-text">
                  {hasScanned ? t('itemsFoundText') : t('systemCleanBadge')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => onNavigateCategory(mod.id)}
              className={`p-5 rounded-2xl mac-card cursor-pointer group flex items-center justify-between border ${mod.border}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${mod.bg} ${mod.color} transition-transform group-hover:scale-110 shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-mac-subtext">{mod.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-end">
                  <span className="text-sm font-bold metric-card-size block font-mono">
                    {formatBytes(mod.size)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {mod.items} {isRTL ? 'عنصر' : 'items'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

