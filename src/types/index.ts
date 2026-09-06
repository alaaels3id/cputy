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
  size: number; // size per file
  totalWastedSize: number; // (count - 1) * size
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
  publisher?: string;
  uninstallString?: string;
  quietUninstallString?: string;
}

export interface OSInfo {
  platform: 'win32' | 'darwin' | 'linux';
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  osType: 'Windows' | 'macOS' | 'Linux';
  osName: string;
  osVersion: string;
  arch: string;
  hostname: string;
  defaultDiskName: string;
  defaultMountPoint: string;
  deviceType: 'PC' | 'Mac';
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
  uptime: number; // in seconds
  osVersion: string;
  hostname: string;
  osInfo?: OSInfo;
  platform?: 'win32' | 'darwin' | 'linux';
  osType?: 'Windows' | 'macOS' | 'Linux';
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
  getOSInfo?: () => Promise<OSInfo>;
  platform?: string;
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
  launchUninstaller?: (uninstallString: string) => Promise<{ success: boolean; error?: string }>;
  selectFolderDialog: () => Promise<string | null>;
  onScanProgress: (callback: (data: { category: string; progress: number; currentItem?: string }) => void) => () => void;
}

declare global {
  interface Window {
    cputyAPI: CPUTYAPI;
  }
}
