import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater, UpdateInfo as ElectronUpdateInfo, ProgressInfo } from 'electron-updater';
import * as https from 'https';
import { AppUpdateStatus, AppUpdateInfo, AppUpdateProgress } from './types';
import { sendDesktopNotification } from './notificationManager';

class UpdateManager {
  private status: AppUpdateStatus = {
    state: 'idle',
    currentVersion: app.getVersion(),
  };

  private mainWindowGetter: () => BrowserWindow | null = () => null;
  private isChecking = false;

  constructor() {
    // Configure electron-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = false;

    this.setupAutoUpdaterEvents();
  }

  public init(getMainWindow: () => BrowserWindow | null) {
    this.mainWindowGetter = getMainWindow;
  }

  private setupAutoUpdaterEvents() {
    autoUpdater.on('checking-for-update', () => {
      this.updateState({ state: 'checking' });
    });

    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      const updateInfo: AppUpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined,
        releaseName: info.releaseName || `Version ${info.version}`,
      };

      this.updateState({
        state: 'available',
        updateInfo,
      });

      sendDesktopNotification({
        title: '🚀 CPUTY Update Available',
        body: `Version ${info.version} is now available for download.`,
        category: 'clean',
      });
    });

    autoUpdater.on('update-not-available', (info: ElectronUpdateInfo) => {
      this.updateState({
        state: 'not-available',
        updateInfo: {
          version: info.version || app.getVersion(),
        },
      });
    });

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      const progressInfo: AppUpdateProgress = {
        percent: Math.round(progress.percent),
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      };

      this.updateState({
        state: 'downloading',
        progress: progressInfo,
      });
    });

    autoUpdater.on('update-downloaded', (info: ElectronUpdateInfo) => {
      this.updateState({
        state: 'downloaded',
        updateInfo: {
          version: info.version,
          releaseDate: info.releaseDate,
        },
      });

      sendDesktopNotification({
        title: '✅ CPUTY Update Ready',
        body: `Version ${info.version} has been downloaded and is ready to install.`,
        category: 'clean',
      });
    });

    autoUpdater.on('error', (err) => {
      console.error('[CPUTY AutoUpdater Error]:', err?.message || err);
      // If error occurs, fall back to checking GitHub Releases API
      this.checkGitHubReleasesFallback(err?.message || 'Update check encountered an issue');
    });
  }

  private updateState(partial: Partial<AppUpdateStatus>) {
    this.status = {
      ...this.status,
      ...partial,
      currentVersion: app.getVersion(),
    };

    const win = this.mainWindowGetter();
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-status-changed', this.status);
    }
  }

  public getStatus(): AppUpdateStatus {
    return this.status;
  }

  public async checkForUpdates(): Promise<AppUpdateStatus> {
    if (this.isChecking) return this.status;
    this.isChecking = true;

    this.updateState({ state: 'checking', error: undefined });

    if (app.isPackaged) {
      try {
        await autoUpdater.checkForUpdates();
      } catch (err: any) {
        console.warn('[CPUTY] autoUpdater.checkForUpdates failed, falling back to GitHub API:', err.message);
        await this.checkGitHubReleasesFallback();
      } finally {
        this.isChecking = false;
      }
    } else {
      // In development mode, check real GitHub releases via API
      await this.checkGitHubReleasesFallback();
      this.isChecking = false;
    }

    return this.status;
  }

  private async checkGitHubReleasesFallback(initialError?: string): Promise<void> {
    try {
      const release = await this.fetchLatestGitHubRelease();
      if (!release) {
        this.updateState({
          state: 'not-available',
          error: initialError,
        });
        return;
      }

      const remoteTag = (release.tag_name || '').replace(/^v/, '');
      const currentVer = app.getVersion();

      const isNewer = this.compareSemver(remoteTag, currentVer) > 0;

      if (isNewer) {
        const updateInfo: AppUpdateInfo = {
          version: remoteTag,
          releaseDate: release.published_at,
          releaseNotes: release.body || undefined,
          releaseName: release.name || `Version ${remoteTag}`,
          downloadUrl: release.html_url,
        };

        this.updateState({
          state: 'available',
          updateInfo,
        });

        sendDesktopNotification({
          title: '🚀 CPUTY Update Available',
          body: `New version ${remoteTag} is available on GitHub.`,
          category: 'clean',
        });
      } else {
        this.updateState({
          state: 'not-available',
          updateInfo: { version: currentVer },
        });
      }
    } catch (err: any) {
      console.error('[CPUTY] GitHub release check error:', err?.message || err);
      this.updateState({
        state: 'error',
        error: err?.message || initialError || 'Failed to check for updates',
      });
    }
  }

  private fetchLatestGitHubRelease(): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/alaaels3id/cputy/releases/latest',
        headers: {
          'User-Agent': 'CPUTY-App',
          Accept: 'application/vnd.github.v3+json',
        },
      };

      https
        .get(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            } else if (res.statusCode === 404) {
              // No releases created yet on GitHub
              resolve(null);
            } else {
              reject(new Error(`GitHub API returned status ${res.statusCode}`));
            }
          });
        })
        .on('error', (e) => reject(e));
    });
  }

  private compareSemver(v1: string, v2: string): number {
    const parts1 = v1.split('.').map((p) => parseInt(p, 10) || 0);
    const parts2 = v2.split('.').map((p) => parseInt(p, 10) || 0);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const n1 = parts1[i] || 0;
      const n2 = parts2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }

  public async startDownload(): Promise<boolean> {
    if (this.status.state !== 'available') return false;

    if (app.isPackaged) {
      try {
        await autoUpdater.downloadUpdate();
        return true;
      } catch (err: any) {
        console.error('[CPUTY] Error downloading update:', err);
        this.updateState({ state: 'error', error: err?.message || 'Download failed' });
        return false;
      }
    } else {
      // In development mode, simulate progressive download for realistic UI testing
      this.updateState({
        state: 'downloading',
        progress: { percent: 5, bytesPerSecond: 2500000, transferred: 2500000, total: 50000000 },
      });

      let currentPct = 5;
      const totalBytes = 48 * 1024 * 1024;
      const interval = setInterval(() => {
        currentPct += 15;
        if (currentPct >= 100) {
          clearInterval(interval);
          this.updateState({
            state: 'downloaded',
            progress: { percent: 100, bytesPerSecond: 3200000, transferred: totalBytes, total: totalBytes },
          });
        } else {
          this.updateState({
            state: 'downloading',
            progress: {
              percent: currentPct,
              bytesPerSecond: 3200000,
              transferred: Math.round((currentPct / 100) * totalBytes),
              total: totalBytes,
            },
          });
        }
      }, 500);

      return true;
    }
  }

  public quitAndInstall(): void {
    if (app.isPackaged) {
      autoUpdater.quitAndInstall(false, true);
    } else {
      console.log('[CPUTY] quitAndInstall requested in dev mode. Simulating restart.');
      app.relaunch();
      app.exit(0);
    }
  }
}

export const updateManager = new UpdateManager();
