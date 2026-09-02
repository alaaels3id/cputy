import React, { useState } from 'react';
import { 
  Trash2, 
  Sparkles, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  CheckSquare, 
  Square,
  ShieldCheck 
} from 'lucide-react';
import { ScanResult, CleanableItem } from '../types';
import { formatBytes } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface SystemJunkViewProps {
  scanResult: ScanResult | null;
  isScanning: boolean;
  onClean: (items: CleanableItem[]) => void;
  onRescan: () => void;
}

export const SystemJunkView: React.FC<SystemJunkViewProps> = ({
  scanResult,
  isScanning,
  onClean,
  onRescan,
}) => {
  const { t, isRTL } = useLanguage();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    if (!scanResult) return new Set();
    const set = new Set<string>();
    scanResult.items.forEach((item) => {
      if (item.safeToDelete) {
        set.add(item.id);
        item.subItems?.forEach((sub) => set.add(sub.id));
      }
    });
    return set;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (item: CleanableItem) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      const isSelected = next.has(item.id);

      if (isSelected) {
        next.delete(item.id);
        item.subItems?.forEach((sub) => next.delete(sub.id));
      } else {
        next.add(item.id);
        item.subItems?.forEach((sub) => next.add(sub.id));
      }
      return next;
    });
  };

  const toggleSubSelect = (sub: CleanableItem, parent: CleanableItem) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(sub.id)) {
        next.delete(sub.id);
      } else {
        next.add(sub.id);
      }
      return next;
    });
  };

  const handleReveal = (path?: string) => {
    if (path) {
      window.cputyAPI?.revealInFinder(path);
    }
  };

  const getSelectedItemsToClean = (): CleanableItem[] => {
    if (!scanResult) return [];
    const result: CleanableItem[] = [];
    scanResult.items.forEach((item) => {
      if (selectedItemIds.has(item.id)) {
        result.push(item);
      } else if (item.subItems) {
        const selectedSub = item.subItems.filter((sub) => selectedItemIds.has(sub.id));
        result.push(...selectedSub);
      }
    });
    return result;
  };

  const selectedItems = getSelectedItemsToClean();
  const selectedTotalSize = selectedItems.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            {t('systemJunkHeaderTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('systemJunkHeaderDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onClean(selectedItems)}
            disabled={selectedItems.length === 0 || isScanning}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-glow-blue transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('cleanSelected')} ({formatBytes(selectedTotalSize)})</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {!scanResult || scanResult.items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl mac-glass border border-mac-border space-y-3">
          <ShieldCheck className="w-12 h-12 text-cyan-500 dark:text-cyan-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('noJunkFound')}</h3>
          <p className="text-xs text-mac-subtext">{isRTL ? 'ملفات كاش وسجلات النظام لديك نظيفة تماماً.' : 'Your macOS system caches and logs are completely clean.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scanResult.items.map((item) => {
            const isSelected = selectedItemIds.has(item.id) || (item.subItems && item.subItems.some((s) => selectedItemIds.has(s.id)));
            const isExpanded = expandedIds.has(item.id);
            const hasChildren = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id} className="rounded-2xl mac-card overflow-hidden border border-white/5">
                <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelect(item)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {hasChildren && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                        {item.safeToDelete && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Safe
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-mac-subtext truncate max-w-xl">
                        {item.description || item.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {formatBytes(item.size)}
                    </span>
                    <button
                      onClick={() => handleReveal(item.path)}
                      title="Reveal in Finder"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subitems Accordion */}
                {hasChildren && isExpanded && (
                  <div className="bg-black/20 border-t border-white/5 px-6 py-2 divide-y divide-white/5 space-y-1">
                    {item.subItems!.map((sub) => {
                      const isSubSelected = selectedItemIds.has(sub.id);
                      return (
                        <div key={sub.id} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => toggleSubSelect(sub, item)}
                              className="text-cyan-400"
                            >
                              {isSubSelected ? (
                                <CheckSquare className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                            <span className="text-slate-300 font-mono truncate max-w-md">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-slate-400">{formatBytes(sub.size)}</span>
                            <button
                              onClick={() => handleReveal(sub.path)}
                              title="Reveal in Finder"
                              className="text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
