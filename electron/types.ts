export type ScanCategory = 
  | 'smart'
  | 'system'
  | 'developer'
  | 'browsers'
  | 'photos'
  | 'cloud'
  | 'large_files'
  | 'duplicates'
  | 'uninstaller'
  | 'monitor';

export interface CleanableItem {
  id: string;
  name: string;
  category: string;
  path: string;
  size: number; // in bytes
  selected: boolean;
  safeToDelete: boolean;
  description?: string;
  icon?: string;
  lastModified?: number;
  itemCount?: number;
  subItems?: CleanableItem[];
  metadata?: Record<string, any>;
}

export interface ScanResult {
  category: string;
  title: string;
  totalSize: number;
  itemCount: number;
  items: CleanableItem[];
  scannedAt: number;
}

export interface DuplicateGroup {
  hash: string;
  size: number;
  totalWastedSize: number;
  files: {
    path: string;
    name: string;
    lastModified: number;
    selectedForDeletion: boolean;
    isOriginal: boolean;
  }[];
}

export interface InstalledApp {
  id: string;
  name: string;
  bundleId?: string;
  version?: string;
  icon?: string;
  appPath: string;
  appSize: number;
  totalSize: number;
  associatedFiles: {
    path: string;
    type: 'cache' | 'support' | 'preference' | 'log' | 'container' | 'other';
    size: number;
  }[];
  lastOpened?: number;
}

export interface SystemStats {
  cpu: {
    usagePercent: number;
    model: string;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    wiredBytes?: number;
    activeBytes?: number;
    compressedBytes?: number;
    usagePercent: number;
  };
  storage: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    mountPoint: string;
    diskName: string;
  };
  uptime: number;
  osVersion: string;
  hostname: string;
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

export interface CleanProgress {
  currentFile: string;
  cleanedBytes: number;
  totalBytes: number;
  percent: number;
  status: 'scanning' | 'cleaning' | 'completed' | 'error';
  error?: string;
}

export interface CPUTYAPI {
  getSystemStats: () => Promise<SystemStats>;
  scanSystemJunk: () => Promise<ScanResult>;
  scanDevJunk: () => Promise<ScanResult>;
  scanBrowsers: () => Promise<ScanResult>;
  scanPhotosJunk: () => Promise<ScanResult>;
  scanCloudAndLarge: (minSizeBytes?: number) => Promise<{ cloud: ScanResult; largeFiles: ScanResult }>;
  scanDuplicates: (targetDir?: string) => Promise<DuplicateGroup[]>;
  scanInstalledApps: () => Promise<InstalledApp[]>;
  cleanItems: (paths: string[], permanently?: boolean) => Promise<{ success: boolean; freedBytes: number; errors: string[] }>;
  purgeRAM: (elevated?: boolean) => Promise<{ success: boolean; message: string }>;
  revealInFinder: (filePath: string) => Promise<void>;
  selectFolderDialog: () => Promise<string | null>;
  getNotificationSettings: () => Promise<NotificationSettings>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<NotificationSettings>;
  testNotification: () => Promise<boolean>;
  onScanProgress: (callback: (data: { category: string; progress: number; currentItem?: string }) => void) => () => void;
}

declare global {
  interface Window {
    cputyAPI: CPUTYAPI;
  }
}

