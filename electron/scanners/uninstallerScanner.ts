import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { InstalledApp } from '../types';
import { getPathSize, pathExists } from './fsUtils';

const execAsync = promisify(exec);

/**
 * Extracts bundle id and version from Info.plist using macOS defaults command or plist inspection
 */
async function getAppPlistInfo(appPath: string): Promise<{ bundleId: string; version: string; name: string }> {
  const plistPath = path.join(appPath, 'Contents/Info.plist');
  let bundleId = '';
  let version = '';
  let name = path.basename(appPath, '.app');

  if (await pathExists(plistPath)) {
    try {
      const { stdout } = await execAsync(`/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "${plistPath}"`);
      bundleId = stdout.trim();
    } catch {
      // ignore
    }

    try {
      const { stdout } = await execAsync(`/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "${plistPath}"`);
      version = stdout.trim();
    } catch {
      // ignore
    }

    try {
      const { stdout } = await execAsync(`/usr/libexec/PlistBuddy -c "Print :CFBundleName" "${plistPath}"`);
      if (stdout.trim()) name = stdout.trim();
    } catch {
      // ignore
    }
  }

  return { bundleId, version, name };
}

export async function scanInstalledApps(): Promise<InstalledApp[]> {
  const home = os.homedir();
  const appDirs = ['/Applications', path.join(home, 'Applications')];
  const apps: InstalledApp[] = [];

  for (const appDir of appDirs) {
    if (!(await pathExists(appDir))) continue;

    try {
      const entries = await fs.promises.readdir(appDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.endsWith('.app')) {
          const appPath = path.join(appDir, entry.name);
          const rawName = entry.name.replace('.app', '');

          // Ignore default Apple core system apps if desired or mark them
          const isSystemApple = appPath.startsWith('/System') || 
            ['Safari.app', 'Finder.app', 'System Settings.app', 'App Store.app', 'Utilities'].includes(entry.name);

          const { bundleId, version, name } = await getAppPlistInfo(appPath);
          const appSize = await getPathSize(appPath);

          // Find associated files
          const associatedFiles: InstalledApp['associatedFiles'] = [];
          const searchKeywords = [bundleId, rawName, name].filter(Boolean);

          // 1. Application Support
          const appSupportDir = path.join(home, 'Library/Application Support');
          for (const kw of searchKeywords) {
            const spPath = path.join(appSupportDir, kw);
            if (await pathExists(spPath)) {
              const sz = await getPathSize(spPath);
              if (sz > 0 && !associatedFiles.some(f => f.path === spPath)) {
                associatedFiles.push({ path: spPath, type: 'support', size: sz });
              }
            }
          }

          // 2. Caches
          const cachesDir = path.join(home, 'Library/Caches');
          for (const kw of searchKeywords) {
            const cpPath = path.join(cachesDir, kw);
            if (await pathExists(cpPath)) {
              const sz = await getPathSize(cpPath);
              if (sz > 0 && !associatedFiles.some(f => f.path === cpPath)) {
                associatedFiles.push({ path: cpPath, type: 'cache', size: sz });
              }
            }
          }

          // 3. Preferences
          const prefsDir = path.join(home, 'Library/Preferences');
          if (bundleId) {
            const prefPath = path.join(prefsDir, `${bundleId}.plist`);
            if (await pathExists(prefPath)) {
              const sz = await getPathSize(prefPath);
              if (!associatedFiles.some(f => f.path === prefPath)) {
                associatedFiles.push({ path: prefPath, type: 'preference', size: sz });
              }
            }
          }

          // 4. Saved Application State
          const stateDir = path.join(home, 'Library/Saved Application State');
          if (bundleId) {
            const statePath = path.join(stateDir, `${bundleId}.savedState`);
            if (await pathExists(statePath)) {
              const sz = await getPathSize(statePath);
              if (!associatedFiles.some(f => f.path === statePath)) {
                associatedFiles.push({ path: statePath, type: 'container', size: sz });
              }
            }
          }

          // 5. Containers
          const containersDir = path.join(home, 'Library/Containers');
          if (bundleId) {
            const contPath = path.join(containersDir, bundleId);
            if (await pathExists(contPath)) {
              const sz = await getPathSize(contPath);
              if (!associatedFiles.some(f => f.path === contPath)) {
                associatedFiles.push({ path: contPath, type: 'container', size: sz });
              }
            }
          }

          const associatedTotal = associatedFiles.reduce((acc, curr) => acc + curr.size, 0);

          // Get last opened timestamp from stat or mdls
          let lastOpened = 0;
          try {
            const stat = await fs.promises.stat(appPath);
            lastOpened = stat.mtimeMs;
          } catch {
            // ignore
          }

          apps.push({
            id: `app_${crypto.createHash('sha256').update(appPath).digest('hex').slice(0, 16)}`,
            name: name || rawName,
            bundleId: bundleId || undefined,
            version: version || undefined,
            appPath,
            appSize,
            totalSize: appSize + associatedTotal,
            associatedFiles,
            lastOpened,
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  // Sort apps descending by total size
  apps.sort((a, b) => b.totalSize - a.totalSize);

  return apps;
}
