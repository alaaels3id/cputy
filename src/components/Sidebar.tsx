import React from 'react';
import { 
  Rocket, 
  Trash2, 
  Code2, 
  Globe, 
  Image, 
  Cloud, 
  Copy, 
  Package, 
  Activity, 
  Settings, 
  HardDrive 
} from 'lucide-react';
import { ScanCategory, SystemStats } from '../types';
import { formatBytes } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  currentCategory: ScanCategory;
  onSelectCategory: (category: ScanCategory) => void;
  systemStats: SystemStats | null;
  scannedSizes: Partial<Record<ScanCategory, number>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  systemStats,
  scannedSizes,
}) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'smart' as ScanCategory, label: t('smartScan'), icon: Rocket, color: 'text-blue-400', badge: scannedSizes.smart },
    { id: 'system' as ScanCategory, label: t('systemJunk'), icon: Trash2, color: 'text-cyan-400', badge: scannedSizes.system },
    { id: 'developer' as ScanCategory, label: t('developerJunk'), icon: Code2, color: 'text-purple-400', badge: scannedSizes.developer },
    { id: 'browsers' as ScanCategory, label: t('browsersPrivacy'), icon: Globe, color: 'text-emerald-400', badge: scannedSizes.browsers },
    { id: 'photos' as ScanCategory, label: t('photosMedia'), icon: Image, color: 'text-pink-400', badge: scannedSizes.photos },
    { id: 'large_files' as ScanCategory, label: t('cloudLarge'), icon: Cloud, color: 'text-amber-400', badge: scannedSizes.large_files },
    { id: 'duplicates' as ScanCategory, label: t('duplicateFinder'), icon: Copy, color: 'text-indigo-400', badge: scannedSizes.duplicates },
    { id: 'uninstaller' as ScanCategory, label: t('appUninstaller'), icon: Package, color: 'text-rose-400', badge: scannedSizes.uninstaller },
    { id: 'monitor' as ScanCategory, label: t('systemHealth'), icon: Activity, color: 'text-teal-400' },
  ];

  const storageUsed = systemStats?.storage?.usedBytes || 0;
  const storageTotal = systemStats?.storage?.totalBytes || 1;
  const storagePercent = Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  return (
    <aside className="w-64 bg-mac-sidebar/95 border-r border-mac-border flex flex-col justify-between select-none relative z-20 transition-colors">
      {/* Top spacing for macOS traffic lights */}
      <div className="pt-10 px-4 pb-3">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow-blue shrink-0">
            <span className="font-extrabold text-white tracking-wider text-sm">C</span>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t('appName')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 font-bold">{t('proBadge')}</span>
            </h1>
            <p className="text-[11px] text-mac-subtext font-semibold">{t('suiteSubtitle')}</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold sidebar-nav-item group cursor-pointer ${
                  isActive ? 'active' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 nav-icon shrink-0 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : `${item.color} opacity-80 group-hover:opacity-100`
                  }`} />
                  <span className="truncate nav-label font-semibold">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold sidebar-nav-badge">
                    {formatBytes(item.badge, 0)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Hardware Gauge & Settings */}
      <div className="p-4 space-y-3 border-t border-mac-border/60">
        {/* Storage Quick Gauge */}
        <div className="p-2.5 rounded-xl bg-mac-card/80 border border-mac-border space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-mac-subtext flex items-center gap-2 font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              {t('macintoshHD')}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{storagePercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-mac-subtext font-semibold">
            <span>{formatBytes(systemStats?.storage?.freeBytes || 0)} {t('storageFree')}</span>
            <span>{formatBytes(systemStats?.storage?.totalBytes || 0)} {t('storageTotal')}</span>
          </div>
        </div>

        {/* Settings and Theme Row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectCategory('monitor')}
            className={`flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold sidebar-nav-item cursor-pointer ${
              currentCategory === 'monitor' ? 'active' : ''
            }`}
          >
            <Settings className="w-3.5 h-3.5 nav-icon shrink-0" />
            <span className="truncate nav-label font-semibold">{t('preferencesLogs')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

