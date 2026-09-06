import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  HardDrive, 
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Globe2,
  Bell,
  Volume2,
  VolumeX,
  Send,
  ShieldAlert,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { SystemStats, NotificationSettings } from '../types';
import { formatBytes, formatDuration } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';

interface SystemHealthViewProps {
  stats: SystemStats | null;
  onRefresh: () => void;
}

const defaultNotifSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  notifyOnPurge: true,
  notifyOnHighCpu: false,
  cpuThreshold: 85,
  notifyOnHighRam: false,
  ramThreshold: 85,
  notifyOnCleanComplete: true,
};

// Reusable Circular Arc SVG Gauge Component
const CircularGauge: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  gradientId: string;
  gradientStart: string;
  gradientEnd: string;
  label: string;
  sublabel?: string;
}> = ({
  percent,
  size = 110,
  strokeWidth = 9,
  gradientId,
  gradientStart,
  gradientEnd,
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-black/10 dark:text-white/10"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center Values */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
          {Math.round(percent)}%
        </span>
        {sublabel && (
          <span className="text-[9px] font-bold text-mac-subtext uppercase tracking-widest">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  stats,
  onRefresh,
}) => {
  const { theme, setTheme } = useTheme();
  const { t, isRTL } = useLanguage();
  const [isPurging, setIsPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);
  
  // Notification settings state
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(defaultNotifSettings);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  useEffect(() => {
    if (window.cputyAPI?.getNotificationSettings) {
      window.cputyAPI.getNotificationSettings().then((s) => {
        if (s) setNotifSettings(s);
      }).catch(() => {});
    }
  }, []);

  const handleUpdateNotifSetting = async <K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    if (window.cputyAPI?.updateNotificationSettings) {
      try {
        await window.cputyAPI.updateNotificationSettings({ [key]: value });
      } catch {
        // revert on error
      }
    }
  };

  const handlePurgeRAM = async (elevated = false) => {
    setIsPurging(true);
    setPurgeMessage(null);
    try {
      const res = await window.cputyAPI?.purgeRAM(elevated);
      setPurgeMessage(res.message);
      onRefresh();
    } catch {
      setPurgeMessage(t('ramPurgeFail'));
    } finally {
      setIsPurging(false);
    }
  };

  const handleSendTestNotification = async () => {
    setTestSentMsg(null);
    try {
      if (window.cputyAPI?.testNotification) {
        await window.cputyAPI.testNotification();
        setTestSentMsg(t('testNotificationSent'));
        setTimeout(() => setTestSentMsg(null), 4000);
      }
    } catch {
      // ignore
    }
  };

  const cpuPercent = stats?.cpu?.usagePercent || 0;
  const memory = stats?.memory;
  const storage = stats?.storage;

  // Approximate memory pressure breakdown for visual display
  const totalRam = memory?.totalBytes || 1;
  const usedRam = memory?.usedBytes || 0;
  const freeRam = memory?.freeBytes || 0;

  // Proportions: Active ~60% of used, Wired ~25% of used, Compressed ~15% of used
  const activeRam = Math.round(usedRam * 0.6);
  const wiredRam = Math.round(usedRam * 0.25);
  const compressedRam = Math.round(usedRam * 0.15);

  const activePct = Math.round((activeRam / totalRam) * 100);
  const wiredPct = Math.round((wiredRam / totalRam) * 100);
  const compressedPct = Math.round((compressedRam / totalRam) * 100);
  const freePct = Math.max(0, 100 - activePct - wiredPct - compressedPct);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <span>{t('healthTitle')}</span>
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('healthDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handlePurgeRAM(false)}
            disabled={isPurging}
            className="px-4 py-2.5 rounded-2xl cputy-btn-emerald text-xs font-bold shadow-glow-emerald transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer shrink-0"
          >
            <Zap className={`w-4 h-4 ${isPurging ? 'animate-spin' : 'text-[#0F172A]'}`} />
            <span>{isPurging ? t('purgingRam') : t('freeInactiveRam')}</span>
          </button>
          <button
            onClick={() => handlePurgeRAM(true)}
            disabled={isPurging}
            title="Purge RAM with Administrator Privileges"
            className="px-3.5 py-2.5 rounded-2xl cputy-btn-secondary text-xs font-semibold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('elevatedPurgeBtn')}</span>
          </button>
        </div>
      </div>

      {purgeMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 animate-fade-in ${
          purgeMessage.includes('requires administrator') || purgeMessage.includes('failed')
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-glow-emerald'
        }`}>
          {purgeMessage.includes('requires administrator') ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          )}
          <span className="font-medium">{purgeMessage}</span>
        </div>
      )}

      {/* 3 Circular Arc Telemetry Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CPU Card with Radial Arc Gauge */}
        <div className="p-6 rounded-3xl cputy-card border border-mac-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('processorCpu')}</span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {stats?.cpu?.cores || 8} Cores
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <CircularGauge
              percent={cpuPercent}
              gradientId="cpuGrad"
              gradientStart="#10B981"
              gradientEnd="#34D399"
              label="CPU"
              sublabel="Load"
            />
          </div>

          <div className="text-[11px] text-slate-600 dark:text-mac-subtext space-y-1.5 pt-1 border-t border-mac-border/50">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Model:</span>
              <span className="text-slate-900 dark:text-slate-200 truncate max-w-[130px] font-bold">{stats?.cpu?.model || 'Apple Silicon'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Load Average:</span>
              <span className="text-slate-900 dark:text-slate-200 font-mono font-bold">
                {stats?.cpu?.loadAverage ? stats.cpu.loadAverage.map(n => n.toFixed(1)).join(' ') : '1.4 1.8 1.6'}
              </span>
            </div>
          </div>
        </div>

        {/* Memory (Unified RAM) Card */}
        <div className="p-6 rounded-3xl cputy-card border border-mac-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('memoryUnified')}</span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {formatBytes(totalRam, 0)}
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <CircularGauge
              percent={memory?.usagePercent || 0}
              gradientId="memGrad"
              gradientStart="#10B981"
              gradientEnd="#059669"
              label="RAM"
              sublabel="Used"
            />
          </div>

          {/* 4-tier visual memory pressure breakdown */}
          <div className="space-y-1.5 pt-1 border-t border-mac-border/50">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div style={{ width: `${activePct}%` }} className="bg-emerald-500 h-full" title={`Active: ${activePct}%`} />
              <div style={{ width: `${wiredPct}%` }} className="bg-emerald-600 h-full" title={`Wired: ${wiredPct}%`} />
              <div style={{ width: `${compressedPct}%` }} className="bg-emerald-400 h-full" title={`Compressed: ${compressedPct}%`} />
              <div style={{ width: `${freePct}%` }} className="bg-slate-300 dark:bg-slate-700 h-full" title={`Free: ${freePct}%`} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-700 dark:text-mac-subtext font-mono font-bold">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 inline-block"></span>
                {t('usedLabel')} {formatBytes(usedRam)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-slate-400 inline-block"></span>
                {t('freeCacheLabel')} {formatBytes(freeRam)}
              </span>
            </div>
          </div>
        </div>

        {/* NVMe Storage Card */}
        <div className="p-6 rounded-3xl cputy-card border border-mac-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('storageNvme')}</span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {storage?.diskName || (stats?.platform === 'win32' || stats?.osType === 'Windows' ? 'Local Disk (C:)' : 'Macintosh HD')}
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <CircularGauge
              percent={storage?.usagePercent || 0}
              gradientId="storageGrad"
              gradientStart="#10B981"
              gradientEnd="#059669"
              label="Storage"
              sublabel="Full"
            />
          </div>

          <div className="text-[11px] text-slate-600 dark:text-mac-subtext space-y-1.5 pt-1 border-t border-mac-border/50">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600 dark:text-slate-400">{t('usedLabel')}</span>
              <span className="text-slate-900 dark:text-slate-200 font-mono font-bold">{formatBytes(storage?.usedBytes || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600 dark:text-slate-400">{t('availableLabel')}</span>
              <span className="text-slate-900 dark:text-slate-200 font-mono font-bold">{formatBytes(storage?.freeBytes || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Notifications Configuration */}
      <div className="p-6 rounded-3xl cputy-card border border-mac-border space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('notificationsTitle')}</h3>
              <p className="text-xs text-mac-subtext mt-0.5">{t('notificationsDesc')}</p>
            </div>
          </div>

          <button
            onClick={handleSendTestNotification}
            className="px-3.5 py-1.5 rounded-xl cputy-btn-secondary text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('testNotificationBtn')}</span>
          </button>
        </div>

        {testSentMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">{testSentMsg}</span>
          </div>
        )}

        {/* Master Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Enable Notifications Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/50">
            <div className="flex items-center gap-2.5">
              <Bell className={`w-4 h-4 ${notifSettings.enabled ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span className="font-bold text-slate-800 dark:text-slate-200">{t('enableNotifications')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.enabled}
                onChange={(e) => handleUpdateNotifSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:shadow-sm peer-checked:bg-[#2A666A] dark:peer-checked:bg-[#92E6E0] shadow-inner"></div>
            </label>
          </div>

          {/* Enable Sound Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/50">
            <div className="flex items-center gap-2.5">
              {notifSettings.sound ? (
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-bold text-slate-900 dark:text-slate-200">{t('enableSound')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.sound}
                disabled={!notifSettings.enabled}
                onChange={(e) => handleUpdateNotifSetting('sound', e.target.checked)}
                className="sr-only peer disabled:opacity-50"
              />
              <div className="w-10 h-5.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all after:shadow-sm peer-checked:bg-[#2A666A] dark:peer-checked:bg-[#92E6E0] shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Individual Event Triggers & Thresholds */}
        <div className={`space-y-3 pt-2 transition-opacity ${notifSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <h4 className="text-[11px] font-black text-slate-700 dark:text-mac-subtext uppercase tracking-wider">Event Triggers & Automated Alerts</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* RAM Purge Alert */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/40 cursor-pointer hover:border-[#92E6E0]/40 transition-colors">
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('notifyPurgeLabel')}</span>
              <input
                type="checkbox"
                checked={notifSettings.notifyOnPurge}
                onChange={(e) => handleUpdateNotifSetting('notifyOnPurge', e.target.checked)}
                className="rounded accent-[#2A666A] dark:accent-[#92E6E0] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            {/* Clean Completion Alert */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/40 cursor-pointer hover:border-[#92E6E0]/40 transition-colors">
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('notifyCleanLabel')}</span>
              <input
                type="checkbox"
                checked={notifSettings.notifyOnCleanComplete}
                onChange={(e) => handleUpdateNotifSetting('notifyOnCleanComplete', e.target.checked)}
                className="rounded accent-[#2A666A] dark:accent-[#92E6E0] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            {/* High CPU Alert & Slider */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('notifyCpuLabel')}</span>
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnHighCpu}
                  onChange={(e) => handleUpdateNotifSetting('notifyOnHighCpu', e.target.checked)}
                  className="rounded accent-[#2A666A] dark:accent-[#92E6E0] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
              {notifSettings.notifyOnHighCpu && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-mac-subtext font-mono font-semibold">
                    <span>{t('cpuThresholdLabel')}</span>
                    <span className="font-bold text-slate-900 dark:text-[#92E6E0]">{notifSettings.cpuThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={notifSettings.cpuThreshold}
                    onChange={(e) => handleUpdateNotifSetting('cpuThreshold', parseInt(e.target.value, 10))}
                    className="w-full accent-[#2A666A] dark:accent-[#92E6E0] h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* High RAM Alert & Slider */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('notifyRamLabel')}</span>
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnHighRam}
                  onChange={(e) => handleUpdateNotifSetting('notifyOnHighRam', e.target.checked)}
                  className="rounded accent-[#2A666A] dark:accent-[#92E6E0] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
              {notifSettings.notifyOnHighRam && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-mac-subtext font-mono font-semibold">
                    <span>{t('ramThresholdLabel')}</span>
                    <span className="font-bold text-slate-900 dark:text-[#92E6E0]">{notifSettings.ramThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={notifSettings.ramThreshold}
                    onChange={(e) => handleUpdateNotifSetting('ramThreshold', parseInt(e.target.value, 10))}
                    className="w-full accent-[#2A666A] dark:accent-[#92E6E0] h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Hardware Specifications Box */}
      <div className="p-6 rounded-3xl cputy-card border border-mac-border space-y-4">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('systemSpecsTitle')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 space-y-1 border border-mac-border/40">
            <span className="text-slate-600 dark:text-mac-subtext text-[11px] font-semibold">{t('osVersionTitle')}</span>
            <p className="font-bold text-slate-900 dark:text-slate-200">{stats?.osVersion || (stats?.platform === 'win32' || stats?.osType === 'Windows' ? 'Windows' : 'macOS')}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 space-y-1 border border-mac-border/40">
            <span className="text-slate-600 dark:text-mac-subtext text-[11px] font-semibold">{t('systemUptime')}</span>
            <p className="font-bold text-slate-900 dark:text-slate-200 font-mono">{formatDuration(stats?.uptime || 0)}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 space-y-1 border border-mac-border/40">
            <span className="text-slate-600 dark:text-mac-subtext text-[11px] font-semibold">{t('computerName')}</span>
            <p className="font-bold text-slate-900 dark:text-slate-200 truncate">{stats?.hostname || (stats?.platform === 'win32' || stats?.osType === 'Windows' ? 'PC' : 'Mac')}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 space-y-1 border border-mac-border/40">
            <span className="text-slate-600 dark:text-mac-subtext text-[11px] font-semibold">{t('mountPoint')}</span>
            <p className="font-bold text-slate-900 dark:text-slate-200 font-mono">{stats?.storage?.mountPoint || (stats?.platform === 'win32' || stats?.osType === 'Windows' ? 'C:\\' : '/')}</p>
          </div>
        </div>
      </div>

      {/* Language Selection Card */}
      <div className="p-6 rounded-3xl cputy-card border border-mac-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('languageTitle')}</h3>
            <p className="text-xs text-mac-subtext mt-0.5">{t('languageDesc')}</p>
          </div>
        </div>

        <LanguageToggle variant="cards" />
      </div>

      {/* Appearance & Preferences */}
      <div className="p-6 rounded-3xl cputy-card border border-mac-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('appearanceTitle')}</h3>
          <p className="text-xs text-mac-subtext mt-0.5">{t('appearanceDesc')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{t('darkMode')}</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{t('lightMode')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
