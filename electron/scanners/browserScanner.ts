import * as path from 'path';
import * as os from 'os';
import { CleanableItem, ScanResult } from '../types';
import { getPathSize, pathExists } from './fsUtils';

interface BrowserConfig {
  id: string;
  name: string;
  cachePaths: { id: string; name: string; path: string; type: string }[];
}

export async function scanBrowsers(): Promise<ScanResult> {
  const home = os.homedir();
  const items: CleanableItem[] = [];

  const browsers: BrowserConfig[] = [
    {
      id: 'safari',
      name: 'Apple Safari',
      cachePaths: [
        {
          id: 'safari_cache',
          name: 'Safari Web Cache',
          path: path.join(home, 'Library/Containers/com.apple.Safari/Data/Library/Caches'),
          type: 'Cache',
        },
        {
          id: 'safari_lib_cache',
          name: 'Safari Framework Cache',
          path: path.join(home, 'Library/Caches/com.apple.Safari'),
          type: 'Cache',
        },
      ],
    },
    {
      id: 'chrome',
      name: 'Google Chrome',
      cachePaths: [
        {
          id: 'chrome_disk_cache',
          name: 'Chrome Disk & Media Cache',
          path: path.join(home, 'Library/Caches/Google/Chrome'),
          type: 'Cache',
        },
        {
          id: 'chrome_service_worker',
          name: 'Chrome Service Worker & Code Cache',
          path: path.join(home, 'Library/Application Support/Google/Chrome/Default/Code Cache'),
          type: 'Code Cache',
        },
        {
          id: 'chrome_gpu_cache',
          name: 'Chrome GPU Shader Cache',
          path: path.join(home, 'Library/Application Support/Google/Chrome/Default/GPUCache'),
          type: 'GPU Cache',
        },
      ],
    },
    {
      id: 'arc',
      name: 'Arc Browser',
      cachePaths: [
        {
          id: 'arc_cache',
          name: 'Arc Web Cache',
          path: path.join(home, 'Library/Caches/company.thebrowser.Browser'),
          type: 'Cache',
        },
        {
          id: 'arc_code_cache',
          name: 'Arc Code Cache',
          path: path.join(home, 'Library/Application Support/Arc/User Data/Default/Code Cache'),
          type: 'Code Cache',
        },
      ],
    },
    {
      id: 'brave',
      name: 'Brave Browser',
      cachePaths: [
        {
          id: 'brave_cache',
          name: 'Brave Cache',
          path: path.join(home, 'Library/Caches/BraveSoftware/Brave-Browser'),
          type: 'Cache',
        },
      ],
    },
    {
      id: 'edge',
      name: 'Microsoft Edge',
      cachePaths: [
        {
          id: 'edge_cache',
          name: 'Edge Cache',
          path: path.join(home, 'Library/Caches/Microsoft Edge'),
          type: 'Cache',
        },
      ],
    },
    {
      id: 'firefox',
      name: 'Mozilla Firefox',
      cachePaths: [
        {
          id: 'firefox_cache',
          name: 'Firefox Cache & Profiles',
          path: path.join(home, 'Library/Caches/Firefox'),
          type: 'Cache',
        },
      ],
    },
  ];

  for (const browser of browsers) {
    const subItems: CleanableItem[] = [];
    let browserTotalSize = 0;

    for (const cp of browser.cachePaths) {
      if (await pathExists(cp.path)) {
        const size = await getPathSize(cp.path);
        if (size > 1024 * 50) {
          browserTotalSize += size;
          subItems.push({
            id: cp.id,
            name: cp.name,
            category: 'browsers',
            path: cp.path,
            size,
            selected: true,
            safeToDelete: true,
            description: `${cp.type} for ${browser.name}`,
          });
        }
      }
    }

    if (subItems.length > 0) {
      items.push({
        id: browser.id,
        name: browser.name,
        category: 'browsers',
        path: subItems[0].path,
        size: browserTotalSize,
        selected: true,
        safeToDelete: true,
        description: `Browsing data, page caches, and render state for ${browser.name}`,
        itemCount: subItems.length,
        subItems,
      });
    }
  }

  const totalSize = items.reduce((acc, curr) => acc + curr.size, 0);
  const itemCount = items.reduce((acc, curr) => acc + (curr.subItems?.length || 1), 0);

  return {
    category: 'browsers',
    title: 'Browser Junk & Privacy Caches',
    totalSize,
    itemCount,
    items,
    scannedAt: Date.now(),
  };
}
