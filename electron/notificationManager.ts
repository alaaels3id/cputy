import { app, Notification, nativeImage, NativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { purgeRAM } from './scanners/systemMonitor';

export function getAppIconPath(): string {
  const possiblePaths: string[] = [
    path.join(__dirname, '../build/icon.png'),
    path.join(__dirname, '../../build/icon.png'),
  ];

  if (process.resourcesPath) {
    possiblePaths.push(
      path.join(process.resourcesPath, 'build/icon.png'),
      path.join(process.resourcesPath, 'icon.png'),
      path.join(process.resourcesPath, 'app.asar.unpacked/build/icon.png'),
      path.join(process.resourcesPath, 'icon.icns')
    );
  }

  try {
    if (app && typeof app.getAppPath === 'function') {
      const appPath = app.getAppPath();
      if (appPath) {
        possiblePaths.push(
          path.join(appPath, 'build/icon.png'),
          path.join(appPath, 'public/app-icon.png')
        );
      }
    }
  } catch {
    // ignore
  }

  possiblePaths.push(
    path.join(__dirname, '../public/app-icon.png'),
    path.join(process.cwd(), 'build/icon.png')
  );

  for (const p of possiblePaths) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return path.join(__dirname, '../build/icon.png');
}

export function getAppIcon(): NativeImage | undefined {
  const iconPath = getAppIconPath();
  try {
    if (fs.existsSync(iconPath)) {
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) return img;
    }
  } catch {
    // ignore
  }

  // Check for icns on macOS if resourcesPath exists
  if (process.resourcesPath) {
    const icnsPath = path.join(process.resourcesPath, 'icon.icns');
    try {
      if (fs.existsSync(icnsPath)) {
        const img = nativeImage.createFromPath(icnsPath);
        if (!img.isEmpty()) return img;
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}

function getNotifierAppPath(): string | null {
  const possiblePaths: string[] = [
    path.join(__dirname, '../build/CPUTYNotifier.app'),
    path.join(__dirname, '../../build/CPUTYNotifier.app'),
    path.join(process.cwd(), 'build/CPUTYNotifier.app'),
  ];

  if (process.resourcesPath) {
    possiblePaths.push(
      path.join(process.resourcesPath, 'build/CPUTYNotifier.app'),
      path.join(process.resourcesPath, 'CPUTYNotifier.app'),
      path.join(process.resourcesPath, 'app.asar.unpacked/build/CPUTYNotifier.app')
    );
  }

  try {
    if (app && typeof app.getAppPath === 'function') {
      const appPath = app.getAppPath();
      if (appPath) {
        possiblePaths.push(
          path.join(appPath, 'build/CPUTYNotifier.app'),
          path.join(appPath, '../build/CPUTYNotifier.app')
        );
      }
    }
  } catch {
    // ignore
  }

  for (const p of possiblePaths) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

function dispatchMacNotificationWithAppIcon(title: string, body: string, playSound = true) {
  try {
    const notifierApp = getNotifierAppPath();
    const cleanTitle = (title || 'CPUTY').replace(/["\\]/g, ' ');
    const cleanBody = (body || '').replace(/["\\]/g, ' ');

    if (notifierApp) {
      const execPath = path.join(notifierApp, 'Contents/MacOS/applet');
      const { execFile } = require('child_process');
      if (fs.existsSync(execPath)) {
        execFile(execPath, [cleanBody, cleanTitle]);
      } else {
        execFile('open', ['-a', notifierApp, '--args', cleanBody, cleanTitle]);
      }
    }
  } catch (err) {
    console.error('[CPUTY Notifications] dispatchMacNotificationWithAppIcon error:', err);
  }
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  notifyOnPurge: boolean;
  notifyOnHighCpu: boolean;
  cpuThreshold: number;
  notifyOnHighRam: boolean;
  ramThreshold: number;
  notifyOnCleanComplete: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  notifyOnPurge: true,
  notifyOnHighCpu: true,
  cpuThreshold: 100,
  notifyOnHighRam: true,
  ramThreshold: 90,
  notifyOnCleanComplete: true,
};

let currentSettings: NotificationSettings = { ...defaultSettings };
let settingsLoaded = false;
let lastCpuAlertTime = 0;
let lastRamAlertTime = 0;
const ALERT_THROTTLE_MS = 3 * 60 * 1000; // 3 minutes

function getSettingsFilePath(): string {
  try {
    if (app && typeof app.getPath === 'function') {
      return path.join(app.getPath('userData'), 'notification-settings.json');
    }
  } catch {
    // ignore
  }
  return path.join(process.cwd(), 'notification-settings.json');
}

export function loadNotificationSettings(): NotificationSettings {
  if (settingsLoaded) return currentSettings;
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      currentSettings = { ...defaultSettings, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load notification settings:', err);
    currentSettings = { ...defaultSettings };
  }
  settingsLoaded = true;
  return currentSettings;
}

export function saveNotificationSettings(newSettings: Partial<NotificationSettings>): NotificationSettings {
  currentSettings = { ...loadNotificationSettings(), ...newSettings };
  try {
    const filePath = getSettingsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(currentSettings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
  return currentSettings;
}

export function getNotificationSettings(): NotificationSettings {
  return loadNotificationSettings();
}

export interface SendNotificationOptions {
  title: string;
  body: string;
  category?: 'purge' | 'clean' | 'cpu' | 'ram' | 'general';
  force?: boolean;
  onClick?: () => void;
}

export function sendDesktopNotification(options: SendNotificationOptions): boolean {
  const settings = loadNotificationSettings();

  if (!options.force) {
    if (!settings.enabled) return false;

    if (options.category === 'purge' && !settings.notifyOnPurge) return false;
    if (options.category === 'clean' && !settings.notifyOnCleanComplete) return false;
    if (options.category === 'cpu' && !settings.notifyOnHighCpu) return false;
    if (options.category === 'ram' && !settings.notifyOnHighRam) return false;
  }

  const appIcon = getAppIcon();
  const iconPath = getAppIconPath();

  let nativeNotificationShown = false;

  // Dispatch via Electron native Notification.
  // In dev mode, patch-electron-icon.js (predev script) has already replaced Electron.app's icon
  // with the CPUTY icon and set CFBundleIdentifier to com.cputy.app, so macOS will correctly
  // attribute the notification to CPUTY with the proper icon in both dev and production.
  if (Notification && typeof Notification.isSupported === 'function' && Notification.isSupported()) {
    try {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: appIcon || iconPath,
        silent: !settings.sound,
      });

      if (options.onClick) {
        notification.on('click', () => {
          try {
            options.onClick?.();
          } catch {
            // ignore
          }
        });
      }

      notification.show();
      nativeNotificationShown = true;
    } catch (err) {
      console.error('[CPUTY Notifications] Native Notification error:', err);
    }
  }

  return nativeNotificationShown;
}

export function checkSystemThresholdAlerts(cpuPercent: number, ramPercent: number) {
  const settings = loadNotificationSettings();
  if (!settings.enabled) return;

  const now = Date.now();

  // High / 100% CPU Alert
  if (settings.notifyOnHighCpu && cpuPercent >= settings.cpuThreshold) {
    if (now - lastCpuAlertTime > ALERT_THROTTLE_MS) {
      lastCpuAlertTime = now;
      const isMaxCpu = cpuPercent >= 100;
      sendDesktopNotification({
        title: isMaxCpu ? '🔥 Processor is at 100% Peak Load!' : `⚡ High CPU Load Alert (${cpuPercent}%)`,
        body: isMaxCpu 
          ? 'Processor is running at 100% capacity. Heavy tasks detected.' 
          : `CPU usage has reached ${cpuPercent}% (Threshold: ${settings.cpuThreshold}%).`,
        category: 'cpu',
      });
    }
  }

  // Full / High RAM Alert with Interactive Memory Purge On Click
  if (settings.notifyOnHighRam && ramPercent >= settings.ramThreshold) {
    if (now - lastRamAlertTime > ALERT_THROTTLE_MS) {
      lastRamAlertTime = now;
      const isFullRam = ramPercent >= 95;
      sendDesktopNotification({
        title: isFullRam ? '🚨 RAM is Full! Memory Clean Recommended' : `🧠 Memory Pressure Alert (${ramPercent}%)`,
        body: `Unified Memory is ${ramPercent}% full. Click this notification to immediately purge inactive RAM.`,
        category: 'ram',
        onClick: async () => {
          const res = await purgeRAM();
          sendDesktopNotification({
            title: 'CPUTY Memory Cleaned',
            body: res.success ? 'Inactive RAM successfully purged!' : res.message,
            category: 'purge',
            force: true,
          });
        },
      });
    }
  }
}

export function sendTestDesktopNotification(): boolean {
  return sendDesktopNotification({
    title: '🔔 CPUTY Desktop Notification Test',
    body: 'Notifications are configured correctly! CPU load & RAM alerts will notify you automatically.',
    category: 'general',
    force: true,
  });
}

