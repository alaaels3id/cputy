import { app, Tray, Menu, nativeImage, NativeImage, BrowserWindow, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { getSystemStats, purgeRAM, startSystemMonitor, stopSystemMonitor } from './scanners/systemMonitor';

import { sendDesktopNotification, checkSystemThresholdAlerts } from './notificationManager';

let tray: Tray | null = null;
let updateInterval: NodeJS.Timeout | null = null;
let lastCpuUsage = 0;
let lastMemUsage = 0;
let lastMemUsedStr = '0 GB';
let lastMemTotalStr = '0 GB';
let lastStorageFreeStr = '0 GB';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getTrayIcon(): NativeImage {
  const isWin = process.platform === 'win32';
  const possiblePaths = [
    ...(isWin ? [
      path.join(process.resourcesPath || '', 'app.asar.unpacked/build/icon.ico'),
      path.join(process.resourcesPath || '', 'build/icon.ico'),
      path.join(__dirname, '../build/icon.ico'),
      path.join(process.cwd(), 'build/icon.ico'),
    ] : []),
    path.join(__dirname, '../build/trayTemplate.png'),
    path.join(__dirname, '../../build/trayTemplate.png'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked/build/trayTemplate.png'),
    path.join(process.resourcesPath || '', 'build/trayTemplate.png'),
    path.join(process.cwd(), 'build/trayTemplate.png'),
  ];

  try {
    if (app && typeof app.getAppPath === 'function') {
      const appPath = app.getAppPath();
      if (appPath) {
        if (isWin) possiblePaths.push(path.join(appPath, 'build/icon.ico'));
        possiblePaths.push(path.join(appPath, 'build/trayTemplate.png'));
      }
    }
  } catch {
    // ignore
  }

  for (const p of possiblePaths) {
    try {
      if (p && fs.existsSync(p)) {
        let rawIcon: NativeImage;
        if (p.endsWith('.ico')) {
          rawIcon = nativeImage.createFromPath(p);
        } else {
          const buf = fs.readFileSync(p);
          rawIcon = nativeImage.createFromBuffer(buf);
        }
        if (!rawIcon.isEmpty()) {
          const icon = rawIcon.resize({ width: 16, height: 16 });
          if (process.platform === 'darwin') {
            icon.setTemplateImage(true);
          }
          return icon;
        }
      }
    } catch {
      // continue
    }
  }

  // Fallback programmatic 16x16 template icon if file not found
  const icon = nativeImage.createEmpty();
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }
  return icon;
}

function showAppWindow(getWin: () => BrowserWindow | null) {
  const win = getWin();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.setAlwaysOnTop(true);
    win.focus();
    win.setAlwaysOnTop(false);
  }
}

export function setupTray(getMainWindow: () => BrowserWindow | null): Tray | null {
  if (tray) return tray;

  startSystemMonitor();

  try {
    if (process.platform === 'win32') {
      const icoCandidates = [
        path.join(process.resourcesPath || '', 'app.asar.unpacked/build/icon.ico'),
        path.join(process.resourcesPath || '', 'build/icon.ico'),
        path.join(__dirname, '../build/icon.ico'),
        path.join(process.cwd(), 'build/icon.ico'),
      ];
      const validIco = icoCandidates.find((p) => p && fs.existsSync(p));
      if (validIco) {
        tray = new Tray(validIco);
      } else {
        tray = new Tray(getTrayIcon());
      }
    } else {
      tray = new Tray(getTrayIcon());
    }

    try {
      tray.setToolTip('CPUTY - Real-time System Health & RAM Cleaner');
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('[CPUTY Tray] Failed to initialize tray:', err);
    return null;
  }

  const updateMenu = async () => {
    try {
      const stats = await getSystemStats();
      lastCpuUsage = stats.cpu.usagePercent;
      lastMemUsage = stats.memory.usagePercent;
      lastMemUsedStr = formatBytes(stats.memory.usedBytes);
      lastMemTotalStr = formatBytes(stats.memory.totalBytes);
      lastStorageFreeStr = formatBytes(stats.storage.freeBytes);

      // Check CPU & RAM threshold alerts
      checkSystemThresholdAlerts(lastCpuUsage, lastMemUsage);

      // Display live real-time CPU % directly on the macOS menu bar
      if (tray) {
        if (process.platform === 'darwin' && typeof tray.setTitle === 'function') {
          tray.setTitle(` ${lastCpuUsage}%`, { fontType: 'monospacedDigit' });
        }
        const tip = `CPUTY - CPU: ${lastCpuUsage}% | RAM: ${lastMemUsedStr} / ${lastMemTotalStr} (${lastMemUsage}%) | Disk: ${lastStorageFreeStr}`;
        try {
          tray.setToolTip(tip.slice(0, 120));
        } catch {
          // ignore
        }
      }

      buildContextMenu(getMainWindow);
    } catch {
      // ignore
    }
  };

  const buildContextMenu = (getWin: () => BrowserWindow | null) => {
    if (!tray) return;

    const suiteLabel = process.platform === 'darwin' ? 'CPUTY PRO  •  macOS Suite' : (process.platform === 'win32' ? 'CPUTY PRO  •  Windows Suite' : 'CPUTY PRO  •  Linux Suite');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: suiteLabel,
        click: () => showAppWindow(getWin),
      },
      { type: 'separator' },
      {
        label: `⚡ CPU Usage: ${lastCpuUsage}%`,
        click: () => showAppWindow(getWin),
      },
      {
        label: `🧠 Memory: ${lastMemUsedStr} / ${lastMemTotalStr} (${lastMemUsage}%)`,
        click: () => showAppWindow(getWin),
      },
      {
        label: `💾 Free Storage: ${lastStorageFreeStr}`,
        click: () => showAppWindow(getWin),
      },
      { type: 'separator' },
      {
        label: '🧹 Clean Inactive RAM',
        click: async () => {
          const res = await purgeRAM();
          sendDesktopNotification({
            title: 'CPUTY RAM Optimizer',
            body: res.success ? 'Inactive RAM successfully purged!' : res.message,
            category: 'purge',
          });
          await updateMenu();
        },
      },
      { type: 'separator' },
      {
        label: '🚀 Open CPUTY',
        click: () => showAppWindow(getWin),
      },
      { type: 'separator' },
      {
        label: '❌ Quit CPUTY',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
  };

  // Initial build
  buildContextMenu(getMainWindow);
  updateMenu();

  // 1-second real-time polling
  updateInterval = setInterval(updateMenu, 1000);

  tray.on('double-click', () => {
    showAppWindow(getMainWindow);
  });

  tray.on('click', () => {
    showAppWindow(getMainWindow);
  });

  return tray;
}

export function destroyTray() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  stopSystemMonitor();
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

