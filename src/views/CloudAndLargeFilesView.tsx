import React, { useState, useMemo } from 'react';
import { 
  Cloud, 
  HardDrive, 
  FileText, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Search, 
  Clock,
  RotateCw,
  FolderArchive
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

  const selectedItems = currentItems.filter((i) => selectedItemIds.has(i.id));
  const selectedTotalSize = selectedItems.reduce((acc, curr) => acc + curr.size, 0);

  const sizeOptions = [
    { label: '> 50 MB', bytes: 50 * 1024 * 1024 },
    { label: '> 100 MB', bytes: 100 * 1024 * 1024 },
    { label: '> 500 MB', bytes: 500 * 1024 * 1024 },
    { label: '> 1 GB', bytes: 1024 * 1024 * 1024 },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <span>{t('cloudHeaderTitle')}</span>
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('cloudHeaderDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRescan(minSizeFilter)}
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

      {/* Segmented Tab Controls & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2.5 rounded-2xl cputy-glass border border-mac-border">
        {/* Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-black/30 border border-mac-border/50 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('large')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'large'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{t('tabLargeFiles')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
              {largeFilesResult?.items?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'cloud'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{t('tabCloudFiles')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
              {cloudResult?.items?.length || 0}
            </span>
          </button>
        </div>

        {/* Search & Size Filter Pills */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {activeTab === 'large' && (
            <div className="flex items-center gap-1.5">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.bytes}
                  onClick={() => setMinSizeFilter(opt.bytes)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                    minSizeFilter === opt.bytes
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-black/5 dark:border-white/5 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-black/5 dark:bg-black/20 border border-mac-border text-xs focus:outline-none focus:border-emerald-500/50 w-44 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl cputy-glass border border-mac-border space-y-3">
          <FolderArchive className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('noJunkFound')}</h3>
          <p className="text-xs text-mac-subtext">No files match the active size and name filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.has(item.id);
            const isHeavy = item.size >= 1024 * 1024 * 1024; // > 1GB

            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl cputy-card border border-mac-border flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
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

                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-slate-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                      {isHeavy && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          Heavy &gt;1GB
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-mac-subtext mt-0.5 font-mono">
                      <span className="truncate max-w-md">{item.path}</span>
                      {item.modifiedAt && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(item.modifiedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    isHeavy 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-black/5 dark:bg-white/5 text-slate-900 dark:text-slate-100 border-black/5 dark:border-white/5'
                  }`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
};
