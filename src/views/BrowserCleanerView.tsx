import React, { useState } from 'react';
import { 
  Globe, 
  Trash2, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import { CleanableItem, ScanResult } from '../types';
import { formatBytes } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface BrowserCleanerViewProps {
  scanResult: ScanResult | null;
  isScanning: boolean;
  onClean: (items: CleanableItem[]) => void;
  onRescan: () => void;
}

export const BrowserCleanerView: React.FC<BrowserCleanerViewProps> = ({
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
            <Globe className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            {t('browserHeaderTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('browserHeaderDesc')}
          </p>
        </div>

        <button
          onClick={() => onClean(selectedItems)}
          disabled={selectedItems.length === 0 || isScanning}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('cleanSelected')} ({formatBytes(selectedTotalSize)})</span>
        </button>
      </div>

      {!scanResult || scanResult.items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl mac-glass border border-mac-border space-y-3">
          <Compass className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isRTL ? 'كاش المتصفحات نظيف' : 'Browser Caches are Clean'}
          </h3>
          <p className="text-xs text-mac-subtext">
            {isRTL ? 'لم يتم العثور على ملفات كاش زائدة في المتصفحات.' : 'No excessive browser caches found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scanResult.items.map((browser) => {
            const isSelected = selectedItemIds.has(browser.id) || (browser.subItems && browser.subItems.some((s) => selectedItemIds.has(s.id)));

            return (
              <div key={browser.id} className="p-5 rounded-2xl mac-card border border-mac-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelect(browser)}
                      className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{browser.name}</h3>
                      <p className="text-[11px] text-mac-subtext">{browser.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBytes(browser.size)}
                  </span>
                </div>

                {browser.subItems && browser.subItems.length > 0 && (
                  <div className="bg-black/30 rounded-xl p-3 divide-y divide-white/5 space-y-2">
                    {browser.subItems.map((sub) => {
                      const isSubSelected = selectedItemIds.has(sub.id);
                      return (
                        <div key={sub.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <button
                              onClick={() => toggleSubSelect(sub)}
                              className="text-emerald-400"
                            >
                              {isSubSelected ? (
                                <CheckSquare className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                            <span className="text-slate-300 truncate">{sub.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{formatBytes(sub.size)}</span>
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
