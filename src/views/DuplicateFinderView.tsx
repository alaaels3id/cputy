import React, { useState } from 'react';
import { 
  Copy, 
  FolderOpen, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Layers, 
  CheckCheck,
  RotateCw
} from 'lucide-react';
import { DuplicateGroup } from '../types';
import { formatBytes, formatTimeAgo } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface DuplicateFinderViewProps {
  duplicateGroups: DuplicateGroup[];
  isScanning: boolean;
  onScan: (dir?: string) => void;
  onCleanFiles: (paths: string[]) => void;
}

export const DuplicateFinderView: React.FC<DuplicateFinderViewProps> = ({
  duplicateGroups,
  isScanning,
  onScan,
  onCleanFiles,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(() => {
    const set = new Set<string>();
    duplicateGroups.forEach((group) => {
      group.files.forEach((file) => {
        if (file.selectedForDeletion) set.add(file.path);
      });
    });
    return set;
  });

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    const selected = await window.cputyAPI?.selectFolderDialog();
    if (selected) {
      setCurrentFolder(selected);
      onScan(selected);
    }
  };

  const handleAutoSelectAll = () => {
    const set = new Set<string>();
    duplicateGroups.forEach((group) => {
      // mark all except the first original
      group.files.forEach((file, index) => {
        if (index > 0) set.add(file.path);
      });
    });
    setSelectedPaths(set);
  };

  const togglePath = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleReveal = (filePath: string) => {
    window.cputyAPI?.revealInFinder(filePath);
  };

  const totalWastedSize = duplicateGroups.reduce((acc, curr) => acc + curr.totalWastedSize, 0);
  
  const selectedPathsArray = Array.from(selectedPaths);
  const selectedBytesToFree = duplicateGroups.reduce((total, group) => {
    const countInGroup = group.files.filter((f) => selectedPaths.has(f.path)).length;
    return total + countInGroup * group.size;
  }, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shadow-xs">
              <Copy className="w-5 h-5" />
            </div>
            <span>{t('duplicateHeaderTitle')}</span>
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('duplicateHeaderDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectFolder}
            className="px-4 py-2.5 rounded-2xl cputy-btn-secondary text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>{currentFolder ? (isRTL ? 'تغيير المجلد' : 'Change Folder') : t('chooseFolderToScan')}</span>
          </button>

          <button
            onClick={() => onCleanFiles(selectedPathsArray)}
            disabled={selectedPathsArray.length === 0 || isScanning}
            className="px-5 py-2.5 rounded-2xl cputy-btn-primary text-xs font-bold shadow-glow-emerald transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('cleanSelected')} ({formatBytes(selectedBytesToFree)})</span>
          </button>
        </div>
      </div>

      {/* Auto Select Action Toolbar */}
      {duplicateGroups.length > 0 && (
        <div className="p-3.5 rounded-2xl cputy-card border border-mac-border flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">
              {isRTL ? (
                <>تم العثور على <strong>{duplicateGroups.length} مجموعات مكررة</strong> ({formatBytes(totalWastedSize)} مهدورة)</>
              ) : (
                <>Found <strong>{duplicateGroups.length} duplicate groups</strong> ({formatBytes(totalWastedSize)} wasted)</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoSelectAll}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center gap-1.5 font-bold transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t('keepOriginalAutoSelect')}</span>
            </button>
            <button
              onClick={() => setSelectedPaths(new Set())}
              className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer font-medium"
            >
              {t('unselectAll')}
            </button>
          </div>
        </div>
      )}

      {/* Duplicates List */}
      {duplicateGroups.length === 0 ? (
        <div className="p-12 text-center rounded-3xl cputy-glass border border-mac-border space-y-3">
          <Copy className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Duplicate Files Detected</h3>
          <p className="text-xs text-mac-subtext">No duplicate clones or matching checksum files found in selected folders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group, groupIdx) => (
            <div key={group.hash || groupIdx} className="rounded-3xl cputy-card border border-mac-border overflow-hidden">
              <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-mac-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">Group #{groupIdx + 1}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                    {group.files.length} copies
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-mac-subtext font-mono">{formatBytes(group.size)} each</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Wasting {formatBytes(group.totalWastedSize)}
                  </span>
                </div>
              </div>

              <div className="p-3 divide-y divide-black/5 dark:divide-white/5 space-y-2">
                {group.files.map((file, fileIdx) => {
                  const isSelected = selectedPaths.has(file.path);
                  const isOriginal = fileIdx === 0;

                  return (
                    <div key={file.path} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => togglePath(file.path)}
                          className="text-emerald-500 hover:text-emerald-400 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4.5 h-4.5" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-md">{file.name}</span>
                            {isOriginal && (
                              <span className="text-[9.5px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                                Original (Oldest)
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-mac-subtext font-mono truncate max-w-lg mt-0.5">{file.path}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400">{formatTimeAgo(file.lastModified)}</span>
                        <button
                          onClick={() => handleReveal(file.path)}
                          title="Reveal in Finder"
                          className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
