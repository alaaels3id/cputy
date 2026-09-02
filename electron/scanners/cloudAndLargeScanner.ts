import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { CleanableItem, ScanResult } from '../types';
import { getPathSize, pathExists } from './fsUtils';

export async function scanCloudAndLarge(minSizeBytes = 50 * 1024 * 1024): Promise<{ cloud: ScanResult; largeFiles: ScanResult }> {
  const home = os.homedir();
  const cloudItems: CleanableItem[] = [];
  const largeFileItems: CleanableItem[] = [];

  // 1. Cloud Storage Providers
  const cloudTargets = [
    {
      id: 'icloud_drive',
      name: 'iCloud Drive Local Mirror',
      path: path.join(home, 'Library/Mobile Documents/com~apple~CloudDocs'),
      description: 'Locally cached files synced with iCloud Drive.',
    },
    {
      id: 'dropbox',
      name: 'Dropbox Local Storage',
      path: path.join(home, 'Dropbox'),
      description: 'Locally synchronized Dropbox files.',
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive Local Storage',
      path: path.join(home, 'OneDrive'),
      description: 'Locally cached OneDrive folders.',
    },
    {
      id: 'cloud_storage_lib',
      name: 'macOS CloudStorage Provider Caches',
      path: path.join(home, 'Library/CloudStorage'),
      description: 'macOS File Provider sync engine local caches (Google Drive, Dropbox, Box).',
    },
  ];

  for (const ct of cloudTargets) {
    if (await pathExists(ct.path)) {
      const size = await getPathSize(ct.path);
      if (size > 1024 * 1024 * 10) { // >10MB
        cloudItems.push({
          id: ct.id,
          name: ct.name,
          category: 'cloud',
          path: ct.path,
          size,
          selected: false, // Don't auto-select user cloud files
          safeToDelete: false,
          description: ct.description,
        });
      }
    }
  }

  // 2. Large and Old files scanner
  const scanFolders = [
    path.join(home, 'Downloads'),
    path.join(home, 'Documents'),
    path.join(home, 'Movies'),
    path.join(home, 'Music'),
    path.join(home, 'Desktop'),
    path.join(home, 'Library/Caches'),
  ];

  async function walkDir(dir: string, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return;
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.Trash') continue;
        if (entry.name === 'node_modules' || entry.name === '.git') continue;

        const fullPath = path.join(dir, entry.name);
        try {
          if (entry.isDirectory() && !entry.isSymbolicLink()) {
            await walkDir(fullPath, depth + 1, maxDepth);
          } else if (entry.isFile() && !entry.isSymbolicLink()) {
            const stat = await fs.promises.stat(fullPath);
            if (stat.size >= minSizeBytes) {
              largeFileItems.push({
                id: `large_${crypto.createHash('sha256').update(fullPath).digest('hex').slice(0, 16)}`,
                name: entry.name,
                category: 'large_files',
                path: fullPath,
                size: stat.size,
                selected: false,
                safeToDelete: false, // Require user manual verification
                description: `Large file in ${path.dirname(fullPath).replace(home, '~')}`,
                lastModified: stat.mtimeMs,
                metadata: {
                  ext: path.extname(entry.name).toLowerCase(),
                  mtime: stat.mtimeMs,
                  atime: stat.atimeMs,
                },
              });
            }
          }
        } catch {
          // Ignore individual permission errors
        }
      }
    } catch {
      // Ignore folder read error
    }
  }

  for (const folder of scanFolders) {
    if (await pathExists(folder)) {
      await walkDir(folder);
    }
  }

  // Sort large files descending by size
  largeFileItems.sort((a, b) => b.size - a.size);

  const cloudTotal = cloudItems.reduce((acc, curr) => acc + curr.size, 0);
  const largeTotal = largeFileItems.reduce((acc, curr) => acc + curr.size, 0);

  return {
    cloud: {
      category: 'cloud',
      title: 'Cloud Storage & Local Sync Mirrors',
      totalSize: cloudTotal,
      itemCount: cloudItems.length,
      items: cloudItems,
      scannedAt: Date.now(),
    },
    largeFiles: {
      category: 'large_files',
      title: 'Large & Hidden Files',
      totalSize: largeTotal,
      itemCount: largeFileItems.length,
      items: largeFileItems,
      scannedAt: Date.now(),
    },
  };
}
