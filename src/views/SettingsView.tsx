import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Palette,
  Type,
  Globe,
  Settings2,
  Sparkles,
  Bell,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
  Sliders,
  Info,
} from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';
import { FontSelector } from '../components/FontSelector';
import { LanguageToggle } from '../components/LanguageToggle';
import { SoftwareUpdateCard } from '../components/SoftwareUpdateCard';
import { useLanguage } from '../context/LanguageContext';
import { NotificationSettings } from '../types';

// ─── Reusable Accessible Toggle Switch ─────────────────────────────────────────
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  isRTL?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  isRTL = false,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
      disabled ? 'opacity-40 cursor-not-allowed' : ''
    } ${checked ? 'bg-[#805D93] dark:bg-[#F49FBC]' : 'bg-slate-300 dark:bg-slate-700'}`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        isRTL
          ? checked
            ? '-translate-x-5'
            : 'translate-x-0'
          : checked
          ? 'translate-x-5'
          : 'translate-x-0'
      }`}
    />
  </button>
);

// ─── Theme Option Card ────────────────────────────────────────────────────────
interface ThemeOptionProps {
  id: Theme;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: React.ReactNode;
  selected: boolean;
  onSelect: (id: Theme) => void;
}

const ThemeOptionCard: React.FC<ThemeOptionProps> = ({
  id,
  label,
  sublabel,
  icon: Icon,
  preview,
  selected,
  onSelect,
}) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer group w-full ${
      selected
        ? 'border-[#805D93] bg-[#805D93]/10 shadow-lg shadow-[#805D93]/15 ring-1 ring-[#805D93]/30'
        : 'border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/3 hover:bg-black/6 dark:hover:bg-white/6 hover:border-black/15 dark:hover:border-white/15'
    }`}
  >
    {/* Mini UI Preview */}
    <div className="w-full aspect-video rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-xs shrink-0">
      {preview}
    </div>

    {/* Icon + Label */}
    <div className="flex flex-col items-center gap-1">
      <div
        className={`p-1.5 rounded-lg transition-all ${
          selected
            ? 'bg-[#805D93]/20 text-[#805D93] dark:text-[#F49FBC]'
            : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span
        className={`text-xs font-bold ${
          selected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {label}
      </span>
      <span className="text-[10px] text-slate-500 dark:text-mac-subtext">{sublabel}</span>
    </div>

    {/* Selection checkmark */}
    {selected && (
      <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-[#805D93] dark:bg-[#F49FBC] flex items-center justify-center shadow-xs">
        <Check className="w-3 h-3 text-white dark:text-[#130D1A] stroke-[3]" />
      </div>
    )}
  </button>
);

// ─── Mini UI Previews (embedded SVG-like divs) ─────────────────────────────────
const DarkPreview = () => (
  <div className="w-full h-full bg-[#130D1A] p-2 flex gap-1.5">
    <div className="w-1/4 bg-[#0E0912] rounded-lg h-full" />
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="h-2.5 bg-[#1E1228] rounded-md w-3/4" />
      <div className="h-2 bg-[#1E1228] rounded-md w-full" />
      <div className="h-2 bg-[#1E1228] rounded-md w-2/3" />
      <div className="mt-auto h-3 bg-[#805D93]/50 rounded-md w-1/2" />
    </div>
  </div>
);

const LightPreview = () => (
  <div className="w-full h-full bg-[#FFF8FC] p-2 flex gap-1.5">
    <div className="w-1/4 bg-[#F9F0FF] rounded-lg h-full border border-[#E8D8F8]" />
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="h-2.5 bg-[#F0E8F8] rounded-md w-3/4 border border-[#E8D8F8]" />
      <div className="h-2 bg-[#F5EEFF] rounded-md w-full" />
      <div className="h-2 bg-[#F5EEFF] rounded-md w-2/3" />
      <div className="mt-auto h-3 bg-[#805D93]/30 rounded-md w-1/2" />
    </div>
  </div>
);

const SystemPreview = () => (
  <div className="w-full h-full flex">
    <div className="w-1/2 bg-[#130D1A] p-2 flex flex-col gap-1.5">
      <div className="h-2 bg-[#1E1228] rounded-xs w-3/4" />
      <div className="h-1.5 bg-[#1E1228] rounded-xs w-full" />
      <div className="h-1.5 bg-[#805D93]/40 rounded-xs w-1/2 mt-auto" />
    </div>
    <div className="w-1/2 bg-[#FFF8FC] p-2 flex flex-col gap-1.5 border-s border-black/10">
      <div className="h-2 bg-[#F0E8F8] rounded-xs w-3/4" />
      <div className="h-1.5 bg-[#F5EEFF] rounded-xs w-full" />
      <div className="h-1.5 bg-[#805D93]/30 rounded-xs w-1/2 mt-auto" />
    </div>
  </div>
);

// ─── Section Card Wrapper ──────────────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, iconBg, iconColor, children, headerAction }) => (
  <div className="p-6 rounded-3xl cputy-card border border-mac-border space-y-5 shadow-xs">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-mac-subtext mt-0.5">{subtitle}</p>
        </div>
      </div>
      {headerAction && <div className="shrink-0">{headerAction}</div>}
    </div>
    {children}
  </div>
);

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

// ─── Main Settings View ────────────────────────────────────────────────────────
export const SettingsView: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t, isRTL } = useLanguage();

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

  const themeOptions: Array<{
    id: Theme;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    preview: React.ReactNode;
  }> = [
    {
      id: 'dark',
      label: t('darkMode'),
      sublabel: isRTL ? 'الوضع المظلم المريح للعين' : 'Always dark theme',
      icon: Moon,
      preview: <DarkPreview />,
    },
    {
      id: 'light',
      label: t('lightMode'),
      sublabel: isRTL ? 'مظهر نهاري ساطع ومشرق' : 'Always light theme',
      icon: Sun,
      preview: <LightPreview />,
    },
    {
      id: 'system',
      label: t('systemMode'),
      sublabel: isRTL ? 'مطابقة نمط نظام التشغيل' : 'Follows macOS theme',
      icon: Monitor,
      preview: <SystemPreview />,
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Page Header */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-2xl bg-[#805D93]/15 text-[#805D93] dark:text-[#F49FBC] shadow-xs">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('settingsTitle')}
            </h1>
            <p className="text-xs text-mac-subtext font-medium">
              {t('settingsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-6 custom-scrollbar">

        {/* ── Appearance (Theme) ── */}
        <SectionCard
          icon={Palette}
          title={t('appearanceTitle')}
          subtitle={t('appearanceDesc')}
          iconBg="bg-[#805D93]/15"
          iconColor="text-[#805D93] dark:text-[#F49FBC]"
        >
          {/* Theme Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {themeOptions.map((opt) => (
              <ThemeOptionCard
                key={opt.id}
                id={opt.id}
                label={opt.label}
                sublabel={opt.sublabel}
                icon={opt.icon}
                preview={opt.preview}
                selected={theme === opt.id}
                onSelect={setTheme}
              />
            ))}
          </div>

          {/* Active state pill */}
          <div className="flex items-center gap-2 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#805D93] dark:text-[#F49FBC]" />
            <span className="text-[11px] text-slate-500 dark:text-mac-subtext">
              {isRTL ? 'النمط النشط حالياً: ' : 'Currently using '}
              <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                {theme === 'system' 
                  ? `${t('systemMode')} (${resolvedTheme === 'dark' ? t('darkMode') : t('lightMode')})` 
                  : theme === 'dark' ? t('darkMode') : t('lightMode')}
              </span>
            </span>
          </div>

          {theme === 'system' && (
            <p className="text-[11px] text-mac-subtext flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              {t('systemThemeNote')}
            </p>
          )}
        </SectionCard>

        {/* ── Typography (Font) ── */}
        <FontSelector />

        {/* ── Language ── */}
        <SectionCard
          icon={Globe}
          title={t('languageTitle')}
          subtitle={t('languageDesc')}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        >
          <LanguageToggle variant="cards" />
        </SectionCard>

        {/* ── Desktop Notifications ── */}
        <SectionCard
          icon={Bell}
          title={t('notificationsTitle')}
          subtitle={t('notificationsDesc')}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          headerAction={
            <button
              onClick={handleSendTestNotification}
              className="px-3.5 py-1.5 rounded-xl cputy-btn-secondary text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('testNotificationBtn')}</span>
            </button>
          }
        >
          {testSentMsg && (
            <div className="p-3.5 rounded-2xl bg-[#169873]/10 border border-[#169873]/30 text-[#169873] dark:text-[#9EBD6E] text-xs flex items-center gap-2 shadow-[0_0_20px_-3px_rgba(22,152,115,0.35)]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#169873] dark:text-[#9EBD6E]" />
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
              <ToggleSwitch
                checked={notifSettings.enabled}
                onChange={(checked) => handleUpdateNotifSetting('enabled', checked)}
                isRTL={isRTL}
              />
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
              <ToggleSwitch
                checked={notifSettings.sound}
                disabled={!notifSettings.enabled}
                onChange={(checked) => handleUpdateNotifSetting('sound', checked)}
                isRTL={isRTL}
              />
            </div>
          </div>

          {/* Individual Event Triggers & Thresholds */}
          <div className={`space-y-3 pt-2 transition-opacity ${notifSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <h4 className="text-[11px] font-black text-slate-700 dark:text-mac-subtext uppercase tracking-wider">
              {isRTL ? 'إشارات الأحداث والتنبيهات المخصصة' : 'Event Triggers & Automated Alerts'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* RAM Purge Alert */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/40 cursor-pointer hover:border-[#805D93]/40 transition-colors">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('notifyPurgeLabel')}</span>
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnPurge}
                  onChange={(e) => handleUpdateNotifSetting('notifyOnPurge', e.target.checked)}
                  className="rounded accent-[#805D93] dark:accent-[#F49FBC] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Clean Completion Alert */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/40 cursor-pointer hover:border-[#805D93]/40 transition-colors">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{t('notifyCleanLabel')}</span>
                <input
                  type="checkbox"
                  checked={notifSettings.notifyOnCleanComplete}
                  onChange={(e) => handleUpdateNotifSetting('notifyOnCleanComplete', e.target.checked)}
                  className="rounded accent-[#805D93] dark:accent-[#F49FBC] focus:ring-0 w-4 h-4 cursor-pointer"
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
                    className="rounded accent-[#805D93] dark:accent-[#F49FBC] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>
                {notifSettings.notifyOnHighCpu && (
                  <div className="pt-1 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-mac-subtext font-mono font-semibold">
                      <span>{t('cpuThresholdLabel')}</span>
                      <span className="font-bold text-slate-900 dark:text-[#F49FBC]">{notifSettings.cpuThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={notifSettings.cpuThreshold}
                      onChange={(e) => handleUpdateNotifSetting('cpuThreshold', parseInt(e.target.value, 10))}
                      className="w-full accent-[#805D93] dark:accent-[#F49FBC] h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
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
                    className="rounded accent-[#805D93] dark:accent-[#F49FBC] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>
                {notifSettings.notifyOnHighRam && (
                  <div className="pt-1 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-mac-subtext font-mono font-semibold">
                      <span>{t('ramThresholdLabel')}</span>
                      <span className="font-bold text-slate-900 dark:text-[#F49FBC]">{notifSettings.ramThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={notifSettings.ramThreshold}
                      onChange={(e) => handleUpdateNotifSetting('ramThreshold', parseInt(e.target.value, 10))}
                      className="w-full accent-[#805D93] dark:accent-[#F49FBC] h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Software Updates ── */}
        <SoftwareUpdateCard />

      </div>
    </div>
  );
};
