import React, { useState } from 'react';
import { 
  Image, 
  Trash2, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Film,
  Camera
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

  const handleReveal = (path: string) => {
    window.cputyAPI?.revealInFinder(path);
  };

  const getSelectedItemsToClean = (): CleanableItem[] => {
    if (!scanResult) return [];
    const result: CleanableItem[] = [];

    scanResult.items.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((sub) => {
          if (selectedItemIds.has(sub.id)) {
            result.push(sub);
          }
        });
      } else if (selectedItemIds.has(item.id)) {
        result.push(item);
      }
    });

    return result;
  };

  const selectedItems = getSelectedItemsToClean();
  const selectedTotalSize = selectedItems.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-pink-500 dark:text-pink-400" />
            {t('photosHeaderTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('photosHeaderDesc')}
          </p>
        </div>

        <button
          onClick={() => onClean(selectedItems)}
          disabled={selectedItems.length === 0 || isScanning}
          className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-glow-rose transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('cleanSelected')} ({formatBytes(selectedTotalSize)})</span>
        </button>
      </div>

      {!scanResult || scanResult.items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl mac-glass border border-mac-border space-y-3">
          <Camera className="w-12 h-12 text-pink-500 dark:text-pink-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isRTL ? 'مكتبة الصور والوسائط محسنة' : 'Photos & Media Storage Optimized'}
          </h3>
          <p className="text-xs text-mac-subtext">
            {isRTL ? 'لم يتم العثور على ملفات كاش صور أو لقطات شاشة زائدة.' : 'No media caches or screenshot clutter found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scanResult.items.map((item) => {
            const isSelected = selectedItemIds.has(item.id) || (item.subItems && item.subItems.some((s) => selectedItemIds.has(s.id)));
            const hasChildren = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id} className="rounded-2xl mac-card overflow-hidden border border-mac-border">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelect(item)}
                      className="text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                      <p className="text-[11px] text-mac-subtext truncate max-w-xl">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {formatBytes(item.size)}
                    </span>
                    <button
                      onClick={() => handleReveal(item.path)}
                      title="Reveal in Finder"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {hasChildren && (
                  <div className="bg-black/20 border-t border-white/5 px-6 py-3 divide-y divide-white/5 space-y-2">
                    {item.subItems!.map((sub) => {
                      const isSubSelected = selectedItemIds.has(sub.id);
                      return (
                        <div key={sub.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3 min-w-0">
                            <button
                              onClick={() => toggleSubSelect(sub)}
                              className="text-pink-400"
                            >
                              {isSubSelected ? (
                                <CheckSquare className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                            <span className="text-slate-300 font-mono truncate">{sub.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] font-mono text-slate-400">{formatBytes(sub.size)}</span>
                            <button
                              onClick={() => handleReveal(sub.path)}
                              title="Reveal in Finder"
                              className="text-slate-500 hover:text-slate-300"
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
