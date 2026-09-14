import React from 'react';
import { 
  Rocket, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  CheckCircle2, 
  Loader2,
  HardDrive,
  Activity,
  Layers,
  Flame,
  ArrowRight
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

const splitFormattedBytes = (bytes: number) => {
  const formatted = formatBytes(bytes);
  const parts = formatted.trim().split(' ');
  if (parts.length >= 2) {
    return { value: parts[0], unit: parts.slice(1).join(' ') };
  }
  return { value: formatted, unit: '' };
};

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
  const { value: cleanableValue, unit: cleanableUnit } = splitFormattedBytes(totalCleanable);

  const hasScanned = Boolean(systemResult || devResult || browserResult || photosResult);

  // Group into 3 signature CleanMyMac X pillars:
  // 1. CLEANUP (System Junk + Developer Build artifacts)
  // 2. PROTECTION & PRIVACY (Browser caches & tracking artifacts)
  // 3. SPEED & FILES (Photos thumbnails, media cache & clutter)
  const cleanupTotalSize = systemSize + devSize;
  const cleanupItemCount = (systemResult?.itemCount || 0) + (devResult?.itemCount || 0);

  const protectionTotalSize = browserSize;
  const protectionItemCount = browserResult?.itemCount || 0;

  const speedTotalSize = photosSize;
  const speedItemCount = photosResult?.itemCount || 0;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 flex flex-col items-center">
      {/* Clean Success Toast Banner */}
      {lastCleanSummary && (
        <div className="w-full p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-glow-emerald animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('cleaningSuccess')}</span>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono font-black">
                  {lastCleanSummary.count} {isRTL ? 'عنصر تم تنظيفه' : 'items purged'}
                </span>
              </h4>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                {isRTL ? (
                  <>تمت استعادة <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{formatBytes(lastCleanSummary.freedBytes)}</span> من مساحة القرص بأمان تام.</>
                ) : (
                  <>Safely reclaimed <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{formatBytes(lastCleanSummary.freedBytes)}</span> of high-speed NVMe storage.</>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5">
            {isRTL ? 'الآن' : 'Just now'}
          </span>
        </div>
      )}

      {/* Hero Header Typography */}
      <div className="text-center space-y-2.5 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wide uppercase shadow-xs">
          <Sparkles className="w-4 h-4 animate-pulse-subtle" />
          <span>{t('smartScanTitle')}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          {isScanning 
            ? t('scanningSystem') 
            : hasScanned 
              ? (totalCleanable > 0 
                  ? (isRTL ? `${formatBytes(totalCleanable)} جاهزة للتنظيف` : `${formatBytes(totalCleanable)} Found`) 
                  : t('smartScanReady'))
              : t('startSmartScan')
          }
        </h1>
        <p className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('smartScanDesc')}
        </p>
      </div>

      {/* Signature 3D Glass Morphism & Luminous Ring Gauge Centerpiece */}
      <div className="flex flex-col items-center justify-center relative py-4">
        <div className="cputy-gauge-stage">
          {/* Ambient Backlight Aura */}
          <div className="cputy-gauge-aura" />

          {/* Luminous Circular Ring Gauge SVG */}
          <svg className="cputy-gauge-svg" viewBox="0 0 280 280">
            <defs>
              <linearGradient id="cputyGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#169873" />
                <stop offset="26%" stopColor="#9EBD6E" />
                <stop offset="52%" stopColor="#FFD3BA" />
                <stop offset="78%" stopColor="#F49FBC" />
                <stop offset="100%" stopColor="#805D93" />
              </linearGradient>
              <linearGradient id="cputyEmeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#169873" />
                <stop offset="100%" stopColor="#9EBD6E" />
              </linearGradient>
              <filter id="cputyGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Fine Orbit Track (subtle dashed ring) */}
            <circle
              cx="140"
              cy="140"
              r="132"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 8"
              className="text-pink-400/25 dark:text-pink-300/15 cputy-orbit-track"
            />

            {/* Background Base Track */}
            <circle
              cx="140"
              cy="140"
              r="115"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-200/70 dark:text-slate-800/80"
            />

            {/* Active Luminous Progress Ring */}
            <circle
              cx="140"
              cy="140"
              r="115"
              fill="none"
              stroke={hasScanned && totalCleanable === 0 ? "url(#cputyEmeraldGradient)" : "url(#cputyGaugeGradient)"}
              strokeWidth="7.5"
              strokeLinecap="round"
              filter="url(#cputyGaugeGlow)"
              strokeDasharray={
                isScanning 
                  ? "180 542" 
                  : hasScanned 
                    ? (totalCleanable > 0 ? "722 0" : "722 0") 
                    : "380 342"
              }
              className={`transition-all duration-700 ${isScanning ? 'cputy-gauge-active-spin' : ''}`}
              style={{
                transformOrigin: 'center',
                transform: isScanning ? undefined : 'rotate(-90deg)'
              }}
            />

            {/* Secondary Accent Inner Halo Ring */}
            <circle
              cx="140"
              cy="140"
              r="104"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 6"
              className="text-emerald-500/30 dark:text-emerald-400/20"
            />
          </svg>

          {/* Sonar Ripple Pulse when Scanning */}
          {isScanning && <div className="cputy-gauge-ripple" />}

          {/* The 3D Glassmorphism Center Disc */}
          <div 
            onClick={!isScanning ? (hasScanned && totalCleanable > 0 ? onCleanAll : onStartScan) : undefined}
            className={`cputy-gauge-disc ${isScanning ? 'animate-pulse-subtle' : ''}`}
          >
            {/* Specular Crescent Reflection */}
            <div className="cputy-gauge-highlight" />

            {/* Inner Content */}
            <div className="cputy-gauge-core px-4 select-none">
              {isScanning ? (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 animate-spin" />
                    <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-300 absolute inset-0 m-auto" />
                  </div>
                  <span className="text-xs font-mono font-black tracking-wider text-emerald-600 dark:text-emerald-300 uppercase drop-shadow-xs">
                    {t('scanningSystem')}
                  </span>
                </div>
              ) : hasScanned ? (
                <div className="flex flex-col items-center gap-2">
                  {/* Status Capsule Badge */}
                  <span className={`text-[10.5px] font-bold font-mono tracking-wider uppercase px-3 py-0.5 rounded-full ${
                    totalCleanable > 0 
                      ? 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/30 shadow-xs' 
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
                  }`}>
                    {totalCleanable > 0 ? t('totalSizeToFree') : t('systemCleanBadge')}
                  </span>

                  {/* Cleanable Value & Unit (Guaranteed LTR order so RTL never flips it to GB 3.3) */}
                  <div className="flex items-baseline justify-center gap-1.5 font-mono select-none" dir="ltr">
                    <span className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
                      {cleanableValue}
                    </span>
                    <span className="text-lg md:text-xl font-bold text-slate-500 dark:text-slate-300">
                      {cleanableUnit}
                    </span>
                  </div>

                  {/* Subtitle / Item Count with live dot indicator */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${totalCleanable > 0 ? 'bg-pink-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span>{totalCleanable > 0 ? t('itemsFoundText') : t('noJunkFound')}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lavender-500/20 dark:from-emerald-500/25 dark:to-pink-500/25 border border-white/30 dark:border-white/15 text-emerald-600 dark:text-emerald-300 shadow-inner">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200 drop-shadow-xs">
                    {t('startSmartScan')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CleanMyMac X Large Action Button Pill */}
        <div className="mt-6 z-20 flex items-center gap-3">
          {isScanning ? (
            <button
              disabled
              className="cleanmymac-pill-btn opacity-80 cursor-wait font-black"
            >
              <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
              <span>{t('scanningSystem')}</span>
            </button>
          ) : !hasScanned ? (
            <button
              onClick={onStartScan}
              className="cleanmymac-pill-btn font-black text-base"
            >
              <Rocket className="w-5 h-5" />
              <span>{t('startSmartScan')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {totalCleanable > 0 ? (
                <button
                  onClick={onCleanAll}
                  className="cleanmymac-pill-btn cleanmymac-pill-btn-clean font-black text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{t('cleanAllNow')} ({formatBytes(totalCleanable)})</span>
                </button>
              ) : (
                <button
                  onClick={onStartScan}
                  className="cleanmymac-pill-btn font-black text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{t('rescan')}</span>
                </button>
              )}

              <button
                onClick={onStartScan}
                className="px-6 py-3.5 rounded-full cputy-btn-secondary text-xs font-black transition-all cursor-pointer shadow-xs hover:bg-black/10 dark:hover:bg-white/10"
              >
                {t('rescan')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CleanMyMac X 3-Module Breakdown Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 z-10">
        {/* Module 1: Cleanup (System Junk & Developer) */}
        <div 
          onClick={() => onNavigateCategory('system')}
          className="p-5 rounded-3xl cputy-card cursor-pointer group flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-500/60 shadow-glow-emerald transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-end">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">
                {formatBytes(cleanupTotalSize)}
              </span>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-mono">
                {cleanupItemCount} {isRTL ? 'عنصر' : 'items'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              {t('summaryCleanup')}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {isRTL 
                ? 'مخلفات النظام وكاش التطبيقات وسجلات التشخيص ومخرجات بناء المطورين'
                : 'System caches, logs, trash snapshots, and developer build artifacts'
              }
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-black group-hover:underline">
            <span>{t('reviewDetails')}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
          </div>
        </div>

        {/* Module 2: Protection (Browsers & Privacy) */}
        <div 
          onClick={() => onNavigateCategory('browsers')}
          className="p-5 rounded-3xl cputy-card cursor-pointer group flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-500/60 shadow-glow-emerald transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-end">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">
                {formatBytes(protectionTotalSize)}
              </span>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-mono">
                {protectionItemCount} {isRTL ? 'عنصر' : 'items'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              {t('summaryProtection')}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {isRTL 
                ? 'بيانات التصفح وملفات تعريف الارتباط المؤقتة وسجلات التتبع والتحميل'
                : 'Browser caches, tracking cookies, and local browsing privacy remnants'
              }
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-black group-hover:underline">
            <span>{t('reviewDetails')}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
          </div>
        </div>

        {/* Module 3: Speed & Files (Photos, Media & Large Files) */}
        <div 
          onClick={() => onNavigateCategory('photos')}
          className="p-5 rounded-3xl cputy-card cursor-pointer group flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-500/60 shadow-glow-emerald transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-end">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white block">
                {formatBytes(speedTotalSize)}
              </span>
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-mono">
                {speedItemCount} {isRTL ? 'عنصر' : 'items'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
              {t('summarySpeed')}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {isRTL 
                ? 'كاش الصور المصغرة، مخلفات Spotify، والملفات المكررة الضخمة'
                : 'Photo library renders, Spotify buffers, and large media duplicates'
              }
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-black group-hover:underline">
            <span>{t('reviewDetails')}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
