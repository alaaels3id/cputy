import React, { useState, useMemo } from 'react';
import { 
  Cloud, 
  HardDrive, 
  FileText, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Filter,
  Search,
  Clock,
  ChevronRight
} from 'lucide-react';
import { CleanableItem, ScanResult } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CloudAndLargeFilesViewProps {
  cloudResult: ScanResult | null;
  largeFilesResult: ScanResult | null;
  isScanning: boolean;
  onClean: (items: CleanableItem[]) => void;
  onRescan: (minSize?: number) => void;
}

export const CloudAndLargeFilesView: React.FC<CloudAndLargeFilesViewProps> = ({
  cloudResult,
  largeFilesResult,
  isScanning,
  onClean,
  onRescan,
}) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'large' | 'cloud'>('large');
  const [searchQuery, setSearchQuery] = useState('');
  const [minSizeFilter, setMinSizeFilter] = useState<number>(50 * 1024 * 1024); // 50MB default
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const toggleSelect = (item: CleanableItem) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const handleReveal = (path: string) => {
    window.cputyAPI?.revealInFinder(path);
  };

  const currentItems = activeTab === 'large' ? (largeFilesResult?.items || []) : (cloudResult?.items || []);

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSize = item.size >= minSizeFilter;
      return matchesSearch && matchesSize;
    });
  }, [currentItems, searchQuery, minSizeFilter]);

  const selectedItemsToClean = useMemo(() => {
    return currentItems.filter((item) => selectedItemIds.has(item.id));
  }, [currentItems, selectedItemIds]);

  const selectedTotalSize = selectedItemsToClean.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            {t('cloudHeaderTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('cloudHeaderDesc')}
          </p>
        </div>

        <button
          onClick={() => onClean(selectedItemsToClean)}
          disabled={selectedItemsToClean.length === 0 || isScanning}
          className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-glow-rose transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('cleanSelected')} ({formatBytes(selectedTotalSize)})</span>
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-xl bg-mac-card border border-mac-border gap-1">
          <button
            onClick={() => setActiveTab('large')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'large'
                ? 'bg-blue-600/30 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isRTL ? 'الملفات الكبيرة والقديمة' : 'Large & Old Files'} ({largeFilesResult?.itemCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-blue-600/30 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isRTL ? 'مزامنة التخزين السحابي' : 'Cloud Local Mirrors'} ({cloudResult?.itemCount || 0})
          </button>
        </div>

        {activeTab === 'large' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Size Preset Picker */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-mac-subtext font-medium mr-1">{t('minSizeLabel')}</span>
              {[
                { label: '>50MB', val: 50 * 1024 * 1024 },
                { label: '>100MB', val: 100 * 1024 * 1024 },
                { label: '>500MB', val: 500 * 1024 * 1024 },
                { label: '>1GB', val: 1024 * 1024 * 1024 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setMinSizeFilter(preset.val);
                    onRescan(preset.val);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    minSizeFilter === preset.val
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                      : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-black/5 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-mac-card border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-44"
              />
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl mac-glass border border-white/5 space-y-3">
          <HardDrive className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-white">No Matching Large Files</h3>
          <p className="text-xs text-mac-subtext">No files found matching the minimum size or search query.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.has(item.id);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl mac-card border border-white/5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => toggleSelect(item)}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <div className="p-2 rounded-lg bg-white/5 text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-medium text-white truncate max-w-lg">{item.name}</h4>
                    <p className="text-[10px] text-mac-subtext truncate max-w-md">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {item.lastModified && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatTimeAgo(item.lastModified)}
                      </span>
                    </div>
                  )}

                  <span className="text-xs font-mono font-bold text-amber-400">
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
            );
          })}
        </div>
      )}
    </div>
  );
};
