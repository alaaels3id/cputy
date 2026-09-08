import React, { useState, useEffect } from 'react';
import { 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  Package,
  RotateCcw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AppUpdateStatus } from '../types';

export const SoftwareUpdateCard: React.FC = () => {
  const { t, isRTL } = useLanguage();

  const [currentVersion, setCurrentVersion] = useState<string>('1.2.0');
  const [status, setStatus] = useState<AppUpdateStatus>({
    state: 'idle',
    currentVersion: '1.2.0',
  });
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Initialize and listen for updates
  useEffect(() => {
    if (window.cputyAPI?.getAppVersion) {
      window.cputyAPI.getAppVersion().then((v) => {
        if (v) {
          setCurrentVersion(v);
          setStatus((prev) => ({ ...prev, currentVersion: v }));
        }
      }).catch(() => {});
    }

    if (window.cputyAPI?.getUpdateStatus) {
      window.cputyAPI.getUpdateStatus().then((s) => {
        if (s) setStatus(s);
      }).catch(() => {});
    }

    if (window.cputyAPI?.onUpdateStatusChange) {
      const unsubscribe = window.cputyAPI.onUpdateStatusChange((newStatus) => {
        setStatus(newStatus);
        if (newStatus.state !== 'checking') {
          setIsChecking(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      if (window.cputyAPI?.checkForUpdates) {
        const res = await window.cputyAPI.checkForUpdates();
        setStatus(res);
      } else {
        // Fallback simulation for web browser preview
        setStatus((prev) => ({ ...prev, state: 'checking' }));
        await new Promise((r) => setTimeout(r, 1200));
        setStatus((prev) => ({
          ...prev,
          state: 'not-available',
          currentVersion,
        }));
      }
    } catch (err: any) {
      console.error('Failed to check for updates:', err);
      setStatus((prev) => ({
        ...prev,
        state: 'error',
        error: err?.message || 'Check failed',
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartDownload = async () => {
    try {
      if (window.cputyAPI?.startDownloadUpdate) {
        await window.cputyAPI.startDownloadUpdate();
      }
    } catch (err) {
      console.error('Failed to start update download:', err);
    }
  };

  const handleQuitAndInstall = () => {
    if (window.cputyAPI?.quitAndInstallUpdate) {
      window.cputyAPI.quitAndInstallUpdate();
    }
  };

  const openGitHubReleases = () => {
    const url = status.updateInfo?.downloadUrl || 'https://github.com/alaaels3id/cputy/releases';
    if (window.cputyAPI?.revealInFinder) {
      // In electron or browser, open external URL
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  const formatSpeed = (bytesPerSec?: number) => {
    if (!bytesPerSec) return '';
    const mb = bytesPerSec / (1024 * 1024);
    return `${mb.toFixed(1)} MB/s`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 rounded-3xl cputy-card border border-mac-border space-y-4 shadow-xs relative z-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-[#92E6E0]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('updateTitle')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#92E6E0] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#92E6E0] animate-pulse" />
                <span>v{currentVersion}</span>
              </span>
            </h3>
            <p className="text-xs text-mac-subtext mt-0.5">{t('updateDesc')}</p>
          </div>
        </div>

        {/* Action Button for Checking */}
        {status.state !== 'downloading' && status.state !== 'downloaded' && status.state !== 'available' && (
          <button
            type="button"
            onClick={handleCheckForUpdates}
            disabled={isChecking || status.state === 'checking'}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#92E6E0] ${isChecking || status.state === 'checking' ? 'animate-spin' : ''}`} />
            <span>{isChecking || status.state === 'checking' ? t('checkingForUpdatesText') : t('checkForUpdatesBtn')}</span>
          </button>
        )}
      </div>

      {/* State 1: Up to Date Banner */}
      {status.state === 'not-available' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#92E6E0] text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <div>
              <span className="font-bold">{t('upToDateTitle')} (v{currentVersion})</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{t('upToDateDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openGitHubReleases}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer"
          >
            <span>{t('viewOnGithubBtn')}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* State 2: Update Available Card */}
      {status.state === 'available' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-3 animate-fade-in shadow-glow-emerald">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#92E6E0] animate-pulse" />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {t('updateAvailableTitle')}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-[#92E6E0] font-mono font-bold">
                v{status.updateInfo?.version}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl cputy-btn-primary text-xs font-bold shadow-glow-emerald cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('downloadUpdateBtn')}</span>
            </button>
          </div>

          {/* Release Notes Preview */}
          {status.updateInfo?.releaseNotes && (
            <div className="p-3 rounded-xl bg-black/10 dark:bg-black/30 border border-mac-border/40 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                {t('releaseNotesTitle')}:
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-3 leading-relaxed whitespace-pre-line font-mono">
                {status.updateInfo.releaseNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* State 3: Downloading Progress */}
      {status.state === 'downloading' && (
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/20 border border-mac-border/50 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-slate-900 dark:text-white">
              <RefreshCw className="w-3.5 h-3.5 text-[#92E6E0] animate-spin" />
              <span>{t('downloadingUpdateText')} (v{status.updateInfo?.version || 'Latest'})</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-[#92E6E0]">
              {status.progress?.percent || 0}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-[#19353C] via-[#5F9C9F] to-[#92E6E0] h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${status.progress?.percent || 0}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-600 dark:text-mac-subtext font-mono font-semibold">
            <span>{formatBytes(status.progress?.transferred)} / {formatBytes(status.progress?.total)}</span>
            <span>{formatSpeed(status.progress?.bytesPerSecond)}</span>
          </div>
        </div>
      )}

      {/* State 4: Update Downloaded and Ready to Install */}
      {status.state === 'downloaded' && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3 animate-fade-in shadow-glow-emerald">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {t('updateDownloadedTitle')} (v{status.updateInfo?.version || 'Latest'})
                </h4>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                  The update is ready. Click restart to apply the new version immediately.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuitAndInstall}
              className="flex items-center gap-2 px-4 py-2 rounded-xl cputy-btn-primary text-xs font-bold shadow-glow-emerald cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('restartAndInstallBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* State 5: Error Banner */}
      {status.state === 'error' && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{status.error || t('updateErrorText')}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckForUpdates}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
};
