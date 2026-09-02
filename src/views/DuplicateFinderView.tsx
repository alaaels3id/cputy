import React, { useState } from 'react';
import { 
  Copy, 
  Trash2, 
  FolderOpen, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Layers, 
  CheckCheck,
  FileText
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Copy className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            {t('duplicateHeaderTitle')}
          </h1>
          <p className="text-xs text-mac-subtext mt-1">
            {t('duplicateHeaderDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectFolder}
            className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-black/10 dark:border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{currentFolder ? (isRTL ? 'تغيير المجلد' : 'Change Folder') : t('chooseFolderToScan')}</span>
          </button>

          <button
            onClick={() => onCleanFiles(selectedPathsArray)}
            disabled={selectedPathsArray.length === 0 || isScanning}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-blue transition-all disabled:opacity-40 flex items-center gap-2 btn-solid cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('cleanSelected')} ({formatBytes(selectedBytesToFree)})</span>
          </button>
        </div>
      </div>

      {/* Auto Select Action Toolbar */}
      {duplicateGroups.length > 0 && (
        <div className="p-3.5 rounded-2xl mac-card border border-mac-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>
              {isRTL ? (
                <>تم العثور على <strong>{duplicateGroups.length} مجموعات مكررة</strong> ({formatBytes(totalWastedSize)} ضائعة)</>
              ) : (
                <>Found <strong>{duplicateGroups.length} duplicate groups</strong> ({formatBytes(totalWastedSize)} wasted)</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoSelectAll}
              className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center gap-1 font-semibold transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t('keepOriginalAutoSelect')}</span>
            </button>
            <button
              onClick={() => setSelectedPaths(new Set())}
              className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              {t('unselectAll')}
            </button>
          </div>
        </div>
      )}

      {/* Duplicates List */}
      {duplicateGroups.length === 0 ? (
        <div className="p-12 text-center rounded-2xl mac-glass border border-white/5 space-y-3">
          <Copy className="w-12 h-12 text-indigo-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-white">No Duplicate Files Detected</h3>
          <p className="text-xs text-mac-subtext">No duplicate file copies found in scanned directories.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group, groupIdx) => (
            <div key={group.hash || groupIdx} className="rounded-2xl mac-card border border-white/5 overflow-hidden">
              <div className="p-3.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">Group #{groupIdx + 1}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                    {group.files.length} copies
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-mac-subtext">{formatBytes(group.size)} each</span>
                  <span className="font-bold text-indigo-400 font-mono">
                    Wasting {formatBytes(group.totalWastedSize)}
                  </span>
                </div>
              </div>

              <div className="p-3 divide-y divide-white/5 space-y-2">
                {group.files.map((file, fileIdx) => {
                  const isSelected = selectedPaths.has(file.path);
                  const isOriginal = fileIdx === 0;

                  return (
                    <div key={file.path} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <button
                          onClick={() => togglePath(file.path)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate max-w-md">{file.name}</span>
                            {isOriginal && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                                Original (Oldest)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-mac-subtext truncate max-w-lg">{file.path}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] text-slate-400">{formatTimeAgo(file.lastModified)}</span>
                        <button
                          onClick={() => handleReveal(file.path)}
                          title="Reveal in Finder"
                          className="p-1 text-slate-400 hover:text-white"
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
