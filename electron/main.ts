import { app, BrowserWindow, ipcMain, shell, dialog, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { getSystemStats, purgeRAM } from './scanners/systemMonitor';
import { scanSystemJunk } from './scanners/systemJunkScanner';
import { scanDevJunk } from './scanners/devJunkScanner';
import { scanBrowsers } from './scanners/browserScanner';
import { scanPhotosJunk } from './scanners/photosScanner';
import { scanCloudAndLarge } from './scanners/cloudAndLargeScanner';
import { scanDuplicates } from './scanners/duplicateScanner';
import { scanInstalledApps } from './scanners/uninstallerScanner';
import { cleanPaths } from './scanners/cleanerEngine';
import { setupTray, destroyTray } from './trayManager';
import { getNotificationSettings, saveNotificationSettings, sendTestDesktopNotification, sendDesktopNotification, getAppIconPath } from './notificationManager';

app.setName('CPUTY');
if (process.platform === 'win32') {
  app.setAppUserModelId('com.cputy.app');
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createWindow() {
  const iconPath = getAppIconPath();
  if (process.platform === 'darwin' && app.dock && iconPath && fs.existsSync(iconPath)) {
    try {
      app.dock.setIcon(iconPath);
    } catch {
      // ignore
    }
  }

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 1000,
    minHeight: 650,
    title: 'CPUTY',
    icon: iconPath,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#090C15',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting && process.platform === 'darwin') {
      event.preventDefault();
      mainWindow?.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // IPC Handlers
  ipcMain.handle('get-system-stats', async () => {
    return await getSystemStats();
  });

  ipcMain.handle('scan-system-junk', async () => {
    return await scanSystemJunk();
  });

  ipcMain.handle('scan-dev-junk', async () => {
    return await scanDevJunk();
  });

  ipcMain.handle('scan-browsers', async () => {
    return await scanBrowsers();
  });

  ipcMain.handle('scan-photos-junk', async () => {
    return await scanPhotosJunk();
  });

  ipcMain.handle('scan-cloud-and-large', async (_event, minSizeBytes) => {
    return await scanCloudAndLarge(minSizeBytes);
  });

  ipcMain.handle('scan-duplicates', async (_event, targetDir) => {
    return await scanDuplicates(targetDir);
  });

  ipcMain.handle('scan-installed-apps', async () => {
    return await scanInstalledApps();
  });

  ipcMain.handle('clean-items', async (_event, paths: string[], permanently?: boolean) => {
    const res = await cleanPaths(paths, permanently);
    if (res.success) {
      sendDesktopNotification({
        title: '🧹 CPUTY Storage Cleaner',
        body: `Successfully cleaned ${paths.length} items from your Mac.`,
        category: 'clean',
      });
    }
    return res;
  });


  ipcMain.handle('purge-ram', async (_event, elevated?: boolean) => {
    return await purgeRAM(elevated);
  });

  ipcMain.handle('reveal-in-finder', async (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle('get-notification-settings', async () => {
    return getNotificationSettings();
  });

  ipcMain.handle('update-notification-settings', async (_event, settings) => {
    return saveNotificationSettings(settings);
  });

  ipcMain.handle('test-notification', async () => {
    return sendTestDesktopNotification();
  });

  ipcMain.handle('select-folder-dialog', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });


  createWindow();
  setupTray(() => mainWindow);

  app.on('activate', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  destroyTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

