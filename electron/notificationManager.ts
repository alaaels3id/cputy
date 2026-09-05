import { app, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { purgeRAM } from './scanners/systemMonitor';

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
  return path.join(app.getPath('userData'), 'notification-settings.json');
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

  if (!Notification.isSupported()) return false;

  try {
    const notification = new Notification({
      title: options.title,
      body: options.body,
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
    return true;
  } catch (err) {
    console.error('Failed to dispatch desktop notification:', err);
    return false;
  }
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

