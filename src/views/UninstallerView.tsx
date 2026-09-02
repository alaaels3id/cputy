import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Trash2, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  MinusSquare,
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  AlertTriangle, 
  Folder, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { InstalledApp } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface UninstallerViewProps {
  apps: InstalledApp[];
  isScanning: boolean;
  onUninstall: (appsToUninstall: { app: InstalledApp; paths: string[] }[]) => void;
  onRescan: () => void;
}

export const UninstallerView: React.FC<UninstallerViewProps> = ({
  apps,
  isScanning,
  onUninstall,
  onRescan,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [expandedAppIds, setExpandedAppIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const next = new Set<string>();
    filteredApps.forEach((app) => next.add(app.id));
    setSelectedAppIds(next);
  };

  const unselectAll = () => {
    setSelectedAppIds(new Set());
  };

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      unselectAll();
    } else {
      selectAll();
    }
  };

  const handleReveal = (path: string) => {
    window.cputyAPI?.revealInFinder(path);
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      return (
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.bundleId && app.bundleId.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [apps, searchQuery]);

  const selectedAppsList = useMemo(() => {
    return apps.filter((app) => selectedAppIds.has(app.id));
  }, [apps, selectedAppIds]);

  const selectedTotalSize = selectedAppsList.reduce((acc, curr) => acc + curr.totalSize, 0);

  const isAllFilteredSelected = filteredApps.length > 0 && filteredApps.every((app) => selectedAppIds.has(app.id));
  const isSomeFilteredSelected = filteredApps.some((app) => selectedAppIds.has(app.id)) && !isAllFilteredSelected;

  const handleConfirmUninstall = () => {
    if (selectedAppsList.length === 0) return;
    const uninstallData = selectedAppsList.map((app) => {
      const paths = [app.appPath, ...app.associatedFiles.map((f) => f.path)];
      return { app, paths };
    });
    onUninstall(uninstallData);
  };

  const handleSingleAppUninstall = (app: InstalledApp, e: React.MouseEvent) => {
    e.stopPropagation();
    const paths = [app.appPath, ...app.associatedFiles.map((f) => f.path)];
    onUninstall([{ app, paths }]);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-500 dark:text-rose-400" />
            {t('uninstallerHeaderTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('uninstallerHeaderDesc')}
          </p>
        </div>

        <button
          onClick={handleConfirmUninstall}
          disabled={selectedAppsList.length === 0 || isScanning}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-glow-rose transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 btn-solid cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>
            {t('uninstallSelectedBtn')} {selectedAppsList.length > 0 ? `(${selectedAppsList.length} • ${formatBytes(selectedTotalSize)})` : ''}
          </span>
        </button>
      </div>

      {/* Filter & Selection Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl mac-card border border-mac-border">
        <div className="flex items-center gap-3">
          {/* Master Select/Unselect All Checkbox */}
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group cursor-pointer"
            title={isAllFilteredSelected ? t('unselectAll') : t('selectAll')}
          >
            {isAllFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            ) : isSomeFilteredSelected ? (
              <MinusSquare className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
            )}
            <span>
              {isAllFilteredSelected ? t('unselectAll') : t('selectAll')}
            </span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-white/10" />

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-[11px] font-medium cursor-pointer"
            >
              {t('selectAll')} ({filteredApps.length})
            </button>
            <button
              onClick={unselectAll}
              disabled={selectedAppIds.size === 0}
              className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-black/5 dark:disabled:hover:bg-white/5 transition-colors text-[11px] font-medium cursor-pointer"
            >
              {t('unselectAll')}
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isRTL ? (
              <>• تم تحديد <strong className="text-rose-600 dark:text-rose-400">{selectedAppIds.size}</strong> من {filteredApps.length}</>
            ) : (
              <>• <strong className="text-rose-600 dark:text-rose-400">{selectedAppIds.size}</strong> of {filteredApps.length} {t('selectedCountText')}</>
            )}
          </span>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-2.5 ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={t('searchAppsPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`py-1.5 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500/50 w-60 ${
              isRTL ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'
            }`}
          />
        </div>
      </div>

      {/* App List */}
      {filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-2xl mac-glass border border-mac-border space-y-3">
          <Package className="w-12 h-12 text-rose-500 dark:text-rose-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isRTL ? 'لم يتم العثور على تطبيقات' : 'No Applications Found'}
          </h3>
          <p className="text-xs text-mac-subtext">
            {isRTL ? 'لا توجد تطبيقات تطابق نص البحث الحالي.' : 'No applications match your search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const isSelected = selectedAppIds.has(app.id);
            const isExpanded = expandedAppIds.has(app.id);
            const hasLeftovers = app.associatedFiles.length > 0;

            return (
              <div 
                key={app.id} 
                className={`rounded-2xl mac-card border transition-all duration-200 overflow-hidden ${
                  isSelected ? 'border-rose-500/40 bg-rose-950/10' : 'border-mac-border hover:border-black/15 dark:hover:border-white/10'
                }`}
              >
                <div className="p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelect(app.id)}
                      className="text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 focus:outline-none cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>

                    {hasLeftovers && (
                      <button
                        onClick={() => toggleExpand(app.id)}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title={isExpanded ? (isRTL ? 'طي المتبقيات' : 'Collapse leftovers') : (isRTL ? 'عرض المتبقيات' : 'Expand leftovers')}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{app.name}</h4>
                        {app.version && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
                            v{app.version}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-mac-subtext truncate max-w-md">
                        {app.bundleId || app.appPath}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-end">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 block">
                        {formatBytes(app.totalSize)}
                      </span>
                      {hasLeftovers && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          +{formatBytes(app.totalSize - app.appSize)} {t('leftoversText')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleSingleAppUninstall(app, e)}
                      title={`${t('uninstallSingleApp')}: ${app.name}`}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleReveal(app.appPath)}
                      title={t('revealInFinder')}
                      className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Leftovers Accordion */}
                {hasLeftovers && isExpanded && (
                  <div className="bg-black/30 border-t border-white/5 p-4 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-rose-400" />
                      Associated Application Data & Leftovers:
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300 pl-4">
                        <span className="truncate max-w-md">📦 Application Binary ({app.appPath})</span>
                        <span className="font-mono text-[11px] text-slate-400">{formatBytes(app.appSize)}</span>
                      </div>
                      {app.associatedFiles.map((file) => (
                        <div key={file.path} className="flex items-center justify-between text-xs text-slate-300 pl-4">
                          <span className="truncate max-w-md">📁 [{file.type.toUpperCase()}] {file.path}</span>
                          <span className="font-mono text-[11px] text-slate-400">{formatBytes(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
