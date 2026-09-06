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
  const possiblePaths = [
    path.join(__dirname, '../build/trayTemplate.png'),
    path.join(__dirname, '../../build/trayTemplate.png'),
    path.join(process.resourcesPath, 'build/trayTemplate.png'),
    path.join(process.resourcesPath, 'app.asar.unpacked/build/trayTemplate.png'),
    path.join(app.getAppPath(), 'build/trayTemplate.png'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const rawIcon = nativeImage.createFromPath(p);
      const icon = rawIcon.resize({ width: 16, height: 16 });
      icon.setTemplateImage(true);
      return icon;
    }
  }

  // Fallback programmatic 16x16 template icon if file not found
  const icon = nativeImage.createEmpty();
  icon.setTemplateImage(true);
  return icon;
}

function showAppWindow(getWin: () => BrowserWindow | null) {
  const win = getWin();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
}

export function setupTray(getMainWindow: () => BrowserWindow | null): Tray {
  if (tray) return tray;

  startSystemMonitor();

  const icon = getTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('CPUTY - Real-time System Health & RAM Cleaner');

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
        tray.setTitle(` ${lastCpuUsage}%`, { fontType: 'monospacedDigit' });
        tray.setToolTip(`CPUTY - CPU: ${lastCpuUsage}% | RAM: ${lastMemUsedStr} / ${lastMemTotalStr} (${lastMemUsage}%) | Free Disk: ${lastStorageFreeStr}`);
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

