import { contextBridge, ipcRenderer } from 'electron';
import { CPUTYAPI } from './types';

const api: CPUTYAPI = {
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  scanSystemJunk: () => ipcRenderer.invoke('scan-system-junk'),
  scanDevJunk: () => ipcRenderer.invoke('scan-dev-junk'),
  scanBrowsers: () => ipcRenderer.invoke('scan-browsers'),
  scanPhotosJunk: () => ipcRenderer.invoke('scan-photos-junk'),
  scanCloudAndLarge: (minSizeBytes?: number) => ipcRenderer.invoke('scan-cloud-and-large', minSizeBytes),
  scanDuplicates: (targetDir?: string) => ipcRenderer.invoke('scan-duplicates', targetDir),
  scanInstalledApps: () => ipcRenderer.invoke('scan-installed-apps'),
  cleanItems: (paths: string[], permanently?: boolean) => ipcRenderer.invoke('clean-items', paths, permanently),
  purgeRAM: (elevated?: boolean) => ipcRenderer.invoke('purge-ram', elevated),
  revealInFinder: (filePath: string) => ipcRenderer.invoke('reveal-in-finder', filePath),
  selectFolderDialog: () => ipcRenderer.invoke('select-folder-dialog'),
  getNotificationSettings: () => ipcRenderer.invoke('get-notification-settings'),
  updateNotificationSettings: (settings) => ipcRenderer.invoke('update-notification-settings', settings),
  testNotification: () => ipcRenderer.invoke('test-notification'),
  onScanProgress: (callback) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('scan-progress', subscription);
    return () => {
      ipcRenderer.removeListener('scan-progress', subscription);
    };
  },
};

contextBridge.exposeInMainWorld('cputyAPI', api);

