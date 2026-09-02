import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SmartScanView } from './views/SmartScanView';
import { SystemJunkView } from './views/SystemJunkView';
import { DeveloperJunkView } from './views/DeveloperJunkView';
import { BrowserCleanerView } from './views/BrowserCleanerView';
import { PhotosCleanerView } from './views/PhotosCleanerView';
import { CloudAndLargeFilesView } from './views/CloudAndLargeFilesView';
import { DuplicateFinderView } from './views/DuplicateFinderView';
import { UninstallerView } from './views/UninstallerView';
import { SystemHealthView } from './views/SystemHealthView';
import { CleanModal } from './components/CleanModal';
import { useLanguage } from './context/LanguageContext';
import { 
  ScanCategory, 
  ScanResult, 
  SystemStats, 
  DuplicateGroup, 
  InstalledApp, 
  CleanableItem 
} from './types';

// Mock fallback for browser preview mode when Electron IPC is not attached
const createMockStats = (): SystemStats => ({
  cpu: { usagePercent: 18.4, model: 'Apple M3 Pro (12 Cores)', cores: 12, loadAverage: [1.8, 2.1, 1.9] },
  memory: {
    totalBytes: 36 * 1024 * 1024 * 1024,
    usedBytes: 19.5 * 1024 * 1024 * 1024,
    freeBytes: 16.5 * 1024 * 1024 * 1024,
    usagePercent: 54.2,
  },
  storage: {
    totalBytes: 512 * 1024 * 1024 * 1024,
    usedBytes: 312 * 1024 * 1024 * 1024,
    freeBytes: 200 * 1024 * 1024 * 1024,
    usagePercent: 60.9,
    mountPoint: '/',
    diskName: 'Macintosh HD',
  },
  uptime: 432000,
  osVersion: 'macOS 15.0 Sequoia',
  hostname: 'MacBook-Pro.local',
});

export const App: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<ScanCategory>('smart');
  const [isScanning, setIsScanning] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  // Scanned Results
  const [systemResult, setSystemResult] = useState<ScanResult | null>(null);
  const [devResult, setDevResult] = useState<ScanResult | null>(null);
  const [browserResult, setBrowserResult] = useState<ScanResult | null>(null);
  const [photosResult, setPhotosResult] = useState<ScanResult | null>(null);
  const [cloudResult, setCloudResult] = useState<ScanResult | null>(null);
  const [largeFilesResult, setLargeFilesResult] = useState<ScanResult | null>(null);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);

  // Modal and summary state
  const [cleanModalOpen, setCleanModalOpen] = useState(false);
  const [pendingCleanData, setPendingCleanData] = useState<{ 
    paths: string[]; 
    size: number; 
    count: number;
    title?: string;
    subtitle?: string;
    confirmText?: string;
    theme?: 'blue' | 'rose';
  } | null>(null);
  const [lastCleanSummary, setLastCleanSummary] = useState<{ freedBytes: number; count: number } | null>(null);

  // Fetch System Stats
  const fetchStats = useCallback(async () => {
    try {
      if (window.cputyAPI?.getSystemStats) {
        const stats = await window.cputyAPI.getSystemStats();
        setSystemStats(stats);
      } else {
        setSystemStats(createMockStats());
      }
    } catch {
      setSystemStats(createMockStats());
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 1500);
    return () => clearInterval(timer);
  }, [fetchStats]);

  // Comprehensive Smart Scan
  const runSmartScan = useCallback(async () => {
    setIsScanning(true);
    setLastCleanSummary(null);

    try {
      if (window.cputyAPI) {
        const [sys, dev, brow, pho, cloudLarge, dups, apps] = await Promise.all([
          window.cputyAPI.scanSystemJunk().catch(() => null),
          window.cputyAPI.scanDevJunk().catch(() => null),
          window.cputyAPI.scanBrowsers().catch(() => null),
          window.cputyAPI.scanPhotosJunk().catch(() => null),
          window.cputyAPI.scanCloudAndLarge().catch(() => null),
          window.cputyAPI.scanDuplicates().catch(() => []),
          window.cputyAPI.scanInstalledApps().catch(() => []),
        ]);

        if (sys) setSystemResult(sys);
        if (dev) setDevResult(dev);
        if (brow) setBrowserResult(brow);
        if (pho) setPhotosResult(pho);
        if (cloudLarge) {
          setCloudResult(cloudLarge.cloud);
          setLargeFilesResult(cloudLarge.largeFiles);
        }
        if (dups) setDuplicateGroups(dups);
        if (apps) setInstalledApps(apps);
      } else {
        // Fallback for standalone browser preview
        await new Promise((r) => setTimeout(r, 1200));
        setSystemResult({
          category: 'system',
          title: 'System Junk & Caches',
          totalSize: 4.8 * 1024 * 1024 * 1024,
          itemCount: 1420,
          items: [
            { id: '1', name: 'User Application Caches', category: 'system', path: '~/Library/Caches', size: 3.2 * 1024 * 1024 * 1024, selected: true, safeToDelete: true },
            { id: '2', name: 'macOS Trash Bin', category: 'system', path: '~/.Trash', size: 1.1 * 1024 * 1024 * 1024, selected: true, safeToDelete: true },
            { id: '3', name: 'Crash & Diagnostic Logs', category: 'system', path: '~/Library/Logs', size: 500 * 1024 * 1024, selected: true, safeToDelete: true },
          ],
          scannedAt: Date.now(),
        });
        setDevResult({
          category: 'developer',
          title: 'Developer Junk',
          totalSize: 12.4 * 1024 * 1024 * 1024,
          itemCount: 42,
          items: [
            { id: 'dev1', name: 'Xcode Derived Data', category: 'developer', path: '~/Library/Developer/Xcode/DerivedData', size: 9.8 * 1024 * 1024 * 1024, selected: true, safeToDelete: true },
            { id: 'dev2', name: 'Homebrew Download Cache', category: 'developer', path: '~/Library/Caches/Homebrew', size: 1.8 * 1024 * 1024 * 1024, selected: true, safeToDelete: true },
            { id: 'dev3', name: 'npm Global Cache', category: 'developer', path: '~/.npm/_cacache', size: 800 * 1024 * 1024, selected: true, safeToDelete: true },
          ],
          scannedAt: Date.now(),
        });
        setBrowserResult({
          category: 'browsers',
          title: 'Browser Junk',
          totalSize: 2.1 * 1024 * 1024 * 1024,
          itemCount: 18,
          items: [
            { id: 'b1', name: 'Google Chrome Cache', category: 'browsers', path: '~/Library/Caches/Google/Chrome', size: 1.4 * 1024 * 1024 * 1024, selected: true, safeToDelete: true },
            { id: 'b2', name: 'Safari Web Cache', category: 'browsers', path: '~/Library/Caches/com.apple.Safari', size: 700 * 1024 * 1024, selected: true, safeToDelete: true },
          ],
          scannedAt: Date.now(),
        });
        setPhotosResult({
          category: 'photos',
          title: 'Photos & Media',
          totalSize: 1.6 * 1024 * 1024 * 1024,
          itemCount: 8,
          items: [
            { id: 'p1', name: 'Photos Thumbnail Renders', category: 'photos', path: '~/Pictures/Photos Library', size: 1.2 * 1024 * 1024 * 1024, selected: true, safeToDelete: true },
            { id: 'p2', name: 'Spotify Cache', category: 'photos', path: '~/Library/Caches/com.spotify.client', size: 400 * 1024 * 1024, selected: true, safeToDelete: true },
          ],
          scannedAt: Date.now(),
        });
      }
    } finally {
      setIsScanning(false);
      fetchStats();
    }
  }, [fetchStats]);

  // Initial Scan on load
  useEffect(() => {
    runSmartScan();
  }, [runSmartScan]);

  // Quick Clean All from Smart Scan
  const handleCleanAll = () => {
    const pathsToClean: string[] = [];
    let totalSize = 0;

    const extract = (res: ScanResult | null) => {
      if (!res) return;
      res.items.forEach((item) => {
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach((sub) => {
            if (sub.selected) {
              pathsToClean.push(sub.path);
              totalSize += sub.size;
            }
          });
        } else if (item.selected) {
          pathsToClean.push(item.path);
          totalSize += item.size;
        }
      });
    };

    extract(systemResult);
    extract(devResult);
    extract(browserResult);
    extract(photosResult);

    if (pathsToClean.length > 0) {
      setPendingCleanData({
        paths: pathsToClean,
        size: totalSize,
        count: pathsToClean.length,
      });
      setCleanModalOpen(true);
    }
  };

  // Generic Clean handler for subviews
  const handleCleanItems = (items: CleanableItem[]) => {
    const paths = items.map((i) => i.path);
    const size = items.reduce((acc, curr) => acc + curr.size, 0);
    if (paths.length > 0) {
      setPendingCleanData({
        paths,
        size,
        count: paths.length,
      });
      setCleanModalOpen(true);
    }
  };

  // Duplicate Clean handler
  const handleCleanDuplicateFiles = (paths: string[]) => {
    let size = 0;
    duplicateGroups.forEach((g) => {
      const matchCount = g.files.filter((f) => paths.includes(f.path)).length;
      size += matchCount * g.size;
    });

    setPendingCleanData({
      paths,
      size,
      count: paths.length,
    });
    setCleanModalOpen(true);
  };

  // App Uninstaller Clean handler
  const handleUninstallApps = (appsData: { app: InstalledApp; paths: string[] }[]) => {
    const allPaths: string[] = [];
    let size = 0;
    appsData.forEach((a) => {
      allPaths.push(...a.paths);
      size += a.app.totalSize;
    });

    setPendingCleanData({
      paths: allPaths,
      size,
      count: appsData.length,
      title: `Uninstall ${appsData.length === 1 ? appsData[0].app.name : `${appsData.length} Applications`}`,
      subtitle: 'Completely remove application bundles, preferences, caches, and leftover files',
      confirmText: `Uninstall ${appsData.length === 1 ? 'App' : 'Selected'}`,
      theme: 'rose',
    });
    setCleanModalOpen(true);
  };

  // Perform clean via Electron IPC
  const executeClean = async (permanently: boolean) => {
    if (!pendingCleanData) return;
    setCleanModalOpen(false);

    try {
      if (window.cputyAPI) {
        const res = await window.cputyAPI.cleanItems(pendingCleanData.paths, permanently);
        setLastCleanSummary({
          freedBytes: res.freedBytes > 0 ? res.freedBytes : pendingCleanData.size,
          count: pendingCleanData.count,
        });
      } else {
        setLastCleanSummary({
          freedBytes: pendingCleanData.size,
          count: pendingCleanData.count,
        });
      }
      // Re-run scan to refresh drive state
      runSmartScan();
    } catch {
      // ignore
    } finally {
      setPendingCleanData(null);
    }
  };

  // Badge Sizes for Sidebar
  const scannedSizes: Partial<Record<ScanCategory, number>> = {
    smart: (systemResult?.totalSize || 0) + (devResult?.totalSize || 0) + (browserResult?.totalSize || 0) + (photosResult?.totalSize || 0),
    system: systemResult?.totalSize,
    developer: devResult?.totalSize,
    browsers: browserResult?.totalSize,
    photos: photosResult?.totalSize,
    large_files: (largeFilesResult?.totalSize || 0) + (cloudResult?.totalSize || 0),
    duplicates: duplicateGroups.reduce((acc, curr) => acc + curr.totalWastedSize, 0),
    uninstaller: installedApps.reduce((acc, curr) => acc + curr.totalSize, 0),
  };

  const { dir } = useLanguage();

  return (
    <div className="flex flex-row h-screen w-screen bg-mac-bg text-slate-100 dark:text-slate-100 light:text-slate-800 font-sans overflow-hidden transition-colors duration-200" dir="ltr">
      {/* Sidebar - Anchored on the left under macOS traffic lights */}
      <Sidebar
        currentCategory={currentCategory}
        onSelectCategory={(cat) => setCurrentCategory(cat)}
        systemStats={systemStats}
        scannedSizes={scannedSizes}
      />

      {/* Main Content Area - Fully localized with RTL in Arabic */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative" dir={dir}>
        <Header
          currentCategory={currentCategory}
          isScanning={isScanning}
          onRefresh={runSmartScan}
          onQuickClean={scannedSizes.smart && scannedSizes.smart > 0 ? handleCleanAll : undefined}
          totalCleanableSize={scannedSizes.smart}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {currentCategory === 'smart' && (
            <SmartScanView
              isScanning={isScanning}
              onStartScan={runSmartScan}
              onCleanAll={handleCleanAll}
              onNavigateCategory={(cat) => setCurrentCategory(cat)}
              systemResult={systemResult}
              devResult={devResult}
              browserResult={browserResult}
              photosResult={photosResult}
              lastCleanSummary={lastCleanSummary}
            />
          )}

          {currentCategory === 'system' && (
            <SystemJunkView
              scanResult={systemResult}
              isScanning={isScanning}
              onClean={handleCleanItems}
              onRescan={runSmartScan}
            />
          )}

          {currentCategory === 'developer' && (
            <DeveloperJunkView
              scanResult={devResult}
              isScanning={isScanning}
              onClean={handleCleanItems}
              onRescan={runSmartScan}
            />
          )}

          {currentCategory === 'browsers' && (
            <BrowserCleanerView
              scanResult={browserResult}
              isScanning={isScanning}
              onClean={handleCleanItems}
              onRescan={runSmartScan}
            />
          )}

          {currentCategory === 'photos' && (
            <PhotosCleanerView
              scanResult={photosResult}
              isScanning={isScanning}
              onClean={handleCleanItems}
              onRescan={runSmartScan}
            />
          )}

          {currentCategory === 'large_files' && (
            <CloudAndLargeFilesView
              cloudResult={cloudResult}
              largeFilesResult={largeFilesResult}
              isScanning={isScanning}
              onClean={handleCleanItems}
              onRescan={(min) => window.cputyAPI?.scanCloudAndLarge(min).then((res) => {
                setCloudResult(res.cloud);
                setLargeFilesResult(res.largeFiles);
              })}
            />
          )}

          {currentCategory === 'duplicates' && (
            <DuplicateFinderView
              duplicateGroups={duplicateGroups}
              isScanning={isScanning}
              onScan={(dir) => {
                setIsScanning(true);
                window.cputyAPI?.scanDuplicates(dir).then((d) => {
                  setDuplicateGroups(d);
                  setIsScanning(false);
                });
              }}
              onCleanFiles={handleCleanDuplicateFiles}
            />
          )}

          {currentCategory === 'uninstaller' && (
            <UninstallerView
              apps={installedApps}
              isScanning={isScanning}
              onUninstall={handleUninstallApps}
              onRescan={runSmartScan}
            />
          )}

          {currentCategory === 'monitor' && (
            <SystemHealthView
              stats={systemStats}
              onRefresh={fetchStats}
            />
          )}
        </main>
      </div>

      {/* Confirmation Clean Modal */}
      <CleanModal
        isOpen={cleanModalOpen}
        itemCount={pendingCleanData?.count || 0}
        totalSize={pendingCleanData?.size || 0}
        title={pendingCleanData?.title}
        subtitle={pendingCleanData?.subtitle}
        confirmText={pendingCleanData?.confirmText}
        theme={pendingCleanData?.theme}
        onConfirm={executeClean}
        onClose={() => setCleanModalOpen(false)}
      />
    </div>
  );
};
