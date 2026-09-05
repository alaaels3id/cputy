import React, { useState } from 'react';
import { 
  Image, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  RotateCw,
  Film
} from 'lucide-react';
import { CleanableItem, ScanResult } from '../types';
import { formatBytes } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface PhotosCleanerViewProps {
  scanResult: ScanResult | null;
  isScanning: boolean;
  onClean: (items: CleanableItem[]) => void;
  onRescan: () => void;
}

export const PhotosCleanerView: React.FC<PhotosCleanerViewProps> = ({
  scanResult,
  isScanning,
  onClean,
  onRescan,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    scanResult?.items.forEach((item) => {
      if (item.selected) ids.add(item.id);
      item.subItems?.forEach((sub) => {
        if (sub.selected) ids.add(sub.id);
      });
    });
    return ids;
  });

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

  const toggleSubSelect = (subItem: CleanableItem) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(subItem.id)) {
        next.delete(subItem.id);
      } else {
        next.add(subItem.id);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-xs">
              <Image className="w-5 h-5" />
            </div>
            <span>{t('photosHeaderTitle')}</span>
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('photosHeaderDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRescan}
            disabled={isScanning}
            className="px-3.5 py-2.5 rounded-2xl cputy-btn-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{t('rescan')}</span>
          </button>

          <button
            onClick={() => onClean(selectedItems)}
            disabled={selectedItems.length === 0 || isScanning}
            className="px-5 py-2.5 rounded-2xl cputy-btn-primary text-xs font-bold shadow-glow-emerald transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('cleanSelected')} ({formatBytes(selectedTotalSize)})</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {!scanResult || scanResult.items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl cputy-glass border border-mac-border space-y-3">
          <Film className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('noJunkFound')}</h3>
          <p className="text-xs text-mac-subtext">{isRTL ? 'مخرجات الصور والوسائط المؤقتة نظيفة ومحسنة.' : 'No unnecessary photo renders or media scratch buffers found.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scanResult.items.map((item) => {
            const isSelected = selectedItemIds.has(item.id);
            return (
              <div key={item.id} className="rounded-3xl cputy-card overflow-hidden border border-mac-border">
                <div className="p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleSelect(item)}
                      className="text-emerald-500 hover:text-emerald-400 cursor-pointer transition-transform active:scale-90"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4.5 h-4.5" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Media Cache
                        </span>
                      </div>
                      <p className="text-[11px] text-mac-subtext truncate max-w-xl font-mono mt-0.5">
                        {item.description || item.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      {formatBytes(item.size)}
                    </span>
                    <button
                      onClick={() => handleReveal(item.path)}
                      title="Reveal in Finder"
                      className="p-2 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-items */}
                {item.subItems && item.subItems.length > 0 && (
                  <div className="bg-black/5 dark:bg-black/30 border-t border-mac-border/60 px-6 py-2 divide-y divide-black/5 dark:divide-white/5 space-y-1">
                    {item.subItems.map((sub) => {
                      const isSubSelected = selectedItemIds.has(sub.id);
                      return (
                        <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => toggleSubSelect(sub)}
                              className="text-emerald-500 cursor-pointer"
                            >
                              {isSubSelected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <span className="text-slate-800 dark:text-slate-300 font-mono truncate max-w-md">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{formatBytes(sub.size)}</span>
                            <button
                              onClick={() => handleReveal(sub.path)}
                              title="Reveal in Finder"
                              className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer p-1"
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
