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
  HardDrive,
  ShieldCheck,
  Zap,
  FolderArchive
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

interface NavItem {
  id: ScanCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
  badge?: number;
}

interface NavSection {
  header?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  systemStats,
  scannedSizes,
}) => {
  const { t } = useLanguage();

  const sections: NavSection[] = [
    {
      // Smart Scan as standalone hero at top
      items: [
        {
          id: 'smart',
          label: t('smartScan'),
          icon: Rocket,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.smart
        }
      ]
    },
    {
      header: t('sectionCleanup'),
      items: [
        {
          id: 'system',
          label: t('systemJunk'),
          icon: Trash2,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.system
        },
        {
          id: 'developer',
          label: t('developerJunk'),
          icon: Code2,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.developer
        }
      ]
    },
    {
      header: t('sectionProtection'),
      items: [
        {
          id: 'browsers',
          label: t('browsersPrivacy'),
          icon: Globe,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.browsers
        }
      ]
    },
    {
      header: t('sectionSpeed'),
      items: [
        {
          id: 'monitor',
          label: t('systemHealth'),
          icon: Activity,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
        }
      ]
    },
    {
      header: t('sectionFiles'),
      items: [
        {
          id: 'large_files',
          label: t('cloudLarge'),
          icon: Cloud,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.large_files
        },
        {
          id: 'photos',
          label: t('photosMedia'),
          icon: Image,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.photos
        },
        {
          id: 'duplicates',
          label: t('duplicateFinder'),
          icon: Copy,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.duplicates
        }
      ]
    },
    {
      header: t('sectionApplications'),
      items: [
        {
          id: 'uninstaller',
          label: t('appUninstaller'),
          icon: Package,
          color: 'text-emerald-500 dark:text-emerald-400',
          activeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          badge: scannedSizes.uninstaller
        }
      ]
    }
  ];

  const storageUsed = systemStats?.storage?.usedBytes || 0;
  const storageTotal = systemStats?.storage?.totalBytes || 1;
  const storageFree = systemStats?.storage?.freeBytes ?? Math.max(0, storageTotal - storageUsed);
  const storagePercent = systemStats?.storage?.usagePercent !== undefined && systemStats.storage.usagePercent > 0
    ? Math.round(systemStats.storage.usagePercent)
    : Math.min(100, Math.round((storageUsed / storageTotal) * 100));

  return (
    <aside className="w-72 bg-mac-sidebar/95 border-r border-mac-border flex flex-col justify-between select-none relative z-20 transition-colors backdrop-blur-xl shrink-0 h-screen overflow-hidden">
      {/* Top spacing for macOS traffic lights & Brand Logo */}
      <div className="pt-10 px-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center drop-shadow-md">
            <img src="/app-icon.png?v=7" alt="CPUTY" className="w-full h-full object-contain" />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="font-mono tracking-wider font-extrabold bg-gradient-to-r from-[#19353C] via-[#2F676B] to-[#14252E] dark:from-[#5F9C9F] dark:via-[#92E6E0] dark:to-white bg-clip-text text-transparent">
                {t('appName')}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#19353C]/10 text-[#19353C] dark:bg-[#92E6E0]/15 dark:text-[#92E6E0] font-mono font-bold uppercase tracking-wider border border-[#19353C]/20 dark:border-[#92E6E0]/25">
                {t('proBadge')}
              </span>
            </h1>
            <p className="text-[11px] text-slate-600 dark:text-mac-subtext font-semibold truncate">{t('suiteSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections with CleanMyMac X Category Headers */}
      <div className="flex-1 overflow-y-auto px-3 space-y-3 custom-scrollbar py-1">
        {sections.map((section, idx) => (
          <div key={section.header || `section-${idx}`} className="space-y-0.5">
            {section.header && (
              <div className="text-[11px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase px-3 pt-3 pb-1 select-none">
                {section.header}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold sidebar-nav-item group cursor-pointer transition-all duration-150 ${
                    isActive ? 'active shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2 rtl:mr-0 rtl:ml-2">
                    <div className={`p-1.5 rounded-lg transition-all shrink-0 ${
                      isActive 
                        ? 'bg-[#92E6E0]/20 text-[#92E6E0] scale-105 shadow-xs' 
                        : 'bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 nav-icon shrink-0 ${
                        isActive ? 'text-[#19353C] dark:text-[#92E6E0]' : `${item.color} opacity-95 group-hover:opacity-100`
                      }`} />
                    </div>
                    <span className="truncate nav-label whitespace-nowrap text-[13px] font-extrabold text-slate-800 dark:text-slate-100">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full font-mono font-black sidebar-nav-badge shrink-0 whitespace-nowrap">
                      {formatBytes(item.badge, 0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Macintosh HD Storage Gauge & Preferences */}
      <div className="p-3.5 space-y-2.5 border-t border-mac-border/60 shrink-0 bg-mac-sidebar/50">
        {/* Storage Quick Gauge */}
        <div className="p-2.5 rounded-2xl bg-mac-card/80 border border-mac-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-700 dark:text-mac-subtext flex items-center gap-1.5 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-[#92E6E0] shrink-0" />
              {systemStats?.storage?.diskName || t('macintoshHD')}
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
              {storagePercent}% {t('storageUsed')}
            </span>
          </div>

          {/* Segmented Gradient Distribution Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800/90 rounded-full h-1.5 overflow-hidden flex p-0.5">
            <div 
              className="bg-gradient-to-r from-[#19353C] via-[#5F9C9F] to-[#92E6E0] h-full rounded-full transition-all duration-700 shadow-sm" 
              style={{ width: `${storagePercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-600 dark:text-mac-subtext font-mono font-semibold">
            <span>{formatBytes(storageUsed)} {t('storageUsed')}</span>
            <span>{formatBytes(storageFree)} {t('storageFree')}</span>
          </div>
        </div>

        {/* Preferences Quick Button */}
        <button
          onClick={() => onSelectCategory('monitor')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold sidebar-nav-item cursor-pointer transition-all ${
            currentCategory === 'monitor' ? 'active' : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 nav-icon shrink-0 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200" />
            <span className="truncate nav-label text-[11.5px] font-bold">{t('preferencesLogs')}</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
