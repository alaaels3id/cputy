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
  Sparkles
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

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  stats,
  onRefresh,
}) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
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

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-500 dark:text-teal-400" />
            {t('healthTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('healthDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePurgeRAM(false)}
            disabled={isPurging}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-glow-blue transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
            <span>{isPurging ? t('purgingRam') : t('freeInactiveRam')}</span>
          </button>
          <button
            onClick={() => handlePurgeRAM(true)}
            disabled={isPurging}
            title="Purge RAM with macOS Administrator Privileges"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('elevatedPurgeBtn')}</span>
          </button>
        </div>
      </div>

      {purgeMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
          purgeMessage.includes('requires administrator') || purgeMessage.includes('failed')
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300'
            : 'bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300'
        }`}>
          {purgeMessage.includes('requires administrator') ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-500" />
          )}
          <span>{purgeMessage}</span>
        </div>
      )}

      {/* 3 Metric Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CPU Card */}
        <div className="p-5 rounded-2xl mac-card border border-mac-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{t('processorCpu')}</span>
            </div>
            <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">{cpuPercent}%</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${cpuPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-mac-subtext space-y-1">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-slate-800 dark:text-slate-300 truncate max-w-[140px] font-mono">{stats?.cpu?.model || 'Apple M-Series'}</span>
            </div>
            <div className="flex justify-between">
              <span>Cores:</span>
              <span className="text-slate-800 dark:text-slate-300 font-mono">{stats?.cpu?.cores || 8} cores</span>
            </div>
          </div>
        </div>

        {/* Memory (RAM) Card */}
        <div className="p-5 rounded-2xl mac-card border border-mac-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 dark:text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{t('memoryUnified')}</span>
            </div>
            <span className="text-sm font-bold font-mono text-teal-600 dark:text-teal-400">{memory?.usagePercent || 0}%</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${memory?.usagePercent || 0}%` }}
            />
          </div>

          <div className="text-[11px] text-mac-subtext space-y-1">
            <div className="flex justify-between">
              <span>{t('usedLabel')}</span>
              <span className="text-slate-800 dark:text-slate-300 font-mono">{formatBytes(memory?.usedBytes || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('freeCacheLabel')}</span>
              <span className="text-slate-800 dark:text-slate-300 font-mono">{formatBytes(memory?.freeBytes || 0)}</span>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="p-5 rounded-2xl mac-card border border-mac-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{t('storageNvme')}</span>
            </div>
            <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">{storage?.usagePercent || 0}%</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${storage?.usagePercent || 0}%` }}
            />
          </div>

          <div className="text-[11px] text-mac-subtext space-y-1">
            <div className="flex justify-between">
              <span>{t('usedLabel')}</span>
              <span className="text-slate-800 dark:text-slate-300 font-mono">{formatBytes(storage?.usedBytes || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('availableLabel')}</span>
              <span className="text-slate-800 dark:text-slate-300 font-mono">{formatBytes(storage?.freeBytes || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Notifications Settings Section */}
      <div className="p-5 rounded-2xl mac-card border border-mac-border space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t('notificationsTitle')}</h3>
              <p className="text-xs text-mac-subtext mt-0.5">{t('notificationsDesc')}</p>
            </div>
          </div>

          <button
            onClick={handleSendTestNotification}
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all border border-blue-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('testNotificationBtn')}</span>
          </button>
        </div>

        {testSentMsg && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testSentMsg}</span>
          </div>
        )}

        {/* Master Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Enable Notifications Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border/50">
            <div className="flex items-center gap-2.5">
              <Bell className={`w-4 h-4 ${notifSettings.enabled ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`} />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{t('enableNotifications')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.enabled}
                onChange={(e) => handleUpdateNotifSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Enable Sound Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border/50">
            <div className="flex items-center gap-2.5">
              {notifSettings.sound ? (
                <Volume2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{t('enableSound')}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.sound}
                disabled={!notifSettings.enabled}
                onChange={(e) => handleUpdateNotifSetting('sound', e.target.checked)}
                className="sr-only peer disabled:opacity-50"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Individual Event Preferences & Thresholds */}
        <div className={`space-y-3 pt-2 transition-opacity ${notifSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <h4 className="text-[11px] font-bold text-mac-subtext uppercase tracking-wider">Event Triggers & Thresholds</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* RAM Purge Alert */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border/40 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{t('notifyPurgeLabel')}</span>
              <input
                type="checkbox"
                checked={notifSettings.notifyOnPurge}
                onChange={(e) => handleUpdateNotifSetting('notifyOnPurge', e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            {/* Clean Completion Alert */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border/40 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{t('notifyCleanLabel')}</span>
              <input
                type="checkbox"
                checked={notifSettings.notifyOnCleanComplete}
                onChange={(e) => handleUpdateNotifSetting('notifyOnCleanComplete', e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            {/* High CPU Alert & Slider */}
            <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t('notifyCpuLabel')}</span>
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnHighCpu}
                  onChange={(e) => handleUpdateNotifSetting('notifyOnHighCpu', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
              {notifSettings.notifyOnHighCpu && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-mac-subtext font-mono">
                    <span>{t('cpuThresholdLabel')}</span>
                    <span className="font-bold text-blue-500">{notifSettings.cpuThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={notifSettings.cpuThreshold}
                    onChange={(e) => handleUpdateNotifSetting('cpuThreshold', parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* High RAM Alert & Slider */}
            <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t('notifyRamLabel')}</span>
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnHighRam}
                  onChange={(e) => handleUpdateNotifSetting('notifyOnHighRam', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
              {notifSettings.notifyOnHighRam && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-mac-subtext font-mono">
                    <span>{t('ramThresholdLabel')}</span>
                    <span className="font-bold text-teal-500">{notifSettings.ramThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={notifSettings.ramThreshold}
                    onChange={(e) => handleUpdateNotifSetting('ramThreshold', parseInt(e.target.value, 10))}
                    className="w-full accent-teal-500 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* System Details Box */}
      <div className="p-5 rounded-2xl mac-card border border-mac-border space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t('systemSpecsTitle')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 space-y-1">
            <span className="text-mac-subtext text-[11px]">{t('macosVersion')}</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{stats?.osVersion || 'macOS'}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 space-y-1">
            <span className="text-mac-subtext text-[11px]">{t('systemUptime')}</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{formatDuration(stats?.uptime || 0)}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 space-y-1">
            <span className="text-mac-subtext text-[11px]">{t('computerName')}</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{stats?.hostname || 'Mac'}</p>
          </div>
          <div className="p-3 rounded-xl bg-black/5 dark:bg-black/20 space-y-1">
            <span className="text-mac-subtext text-[11px]">{t('mountPoint')}</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{stats?.storage?.mountPoint || '/'}</p>
          </div>
        </div>
      </div>

      {/* Language Selection Card */}
      <div className="p-5 rounded-2xl mac-card border border-mac-border space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t('languageTitle')}</h3>
            <p className="text-xs text-mac-subtext mt-0.5">{t('languageDesc')}</p>
          </div>
        </div>

        <LanguageToggle variant="cards" />
      </div>

      {/* Appearance & Preferences */}
      <div className="p-5 rounded-2xl mac-card border border-mac-border flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t('appearanceTitle')}</h3>
          <p className="text-xs text-mac-subtext mt-0.5">{t('appearanceDesc')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{t('darkMode')}</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-500 border-amber-500/40 shadow-xs'
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
