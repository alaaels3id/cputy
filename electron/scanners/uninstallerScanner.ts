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

/**
 * Scan macOS Applications directory and hidden Library preferences/caches
 */
async function scanMacInstalledApps(): Promise<InstalledApp[]> {
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

  apps.sort((a, b) => b.totalSize - a.totalSize);
  return apps;
}

/**
 * Scan Windows installed applications from Registry (64-bit, 32-bit, and HKCU)
 * and search for associated leftovers in AppData (Local, Roaming, LocalLow) and ProgramData.
 */
async function scanWindowsInstalledApps(): Promise<InstalledApp[]> {
  const home = os.homedir();
  const apps: InstalledApp[] = [];

  const psScript = `
    $ErrorActionPreference = 'SilentlyContinue'
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

    $regRoots = @(
      'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
    )

    $results = [System.Collections.Generic.List[PSObject]]::new()

    foreach ($root in $regRoots) {
      try {
        $keys = Get-ChildItem -Path $root -ErrorAction SilentlyContinue
        if ($keys) {
          foreach ($key in $keys) {
            try {
              $p = Get-ItemProperty -Path $key.PSPath -ErrorAction SilentlyContinue
              if ($p -and $p.DisplayName) {
                $name = [string]$p.DisplayName
                if ($p.SystemComponent -eq 1 -or $p.ParentKeyName) { continue }
                if ($name -match '^(Security Update|Update for Windows|Hotfix for|KB\\d+)') { continue }

                $results.Add([PSCustomObject]@{
                  DisplayName = $name
                  DisplayVersion = [string]$p.DisplayVersion
                  Publisher = [string]$p.Publisher
                  InstallLocation = [string]$p.InstallLocation
                  UninstallString = [string]$p.UninstallString
                  QuietUninstallString = [string]$p.QuietUninstallString
                  EstimatedSize = [int64]($p.EstimatedSize -as [int64])
                  DisplayIcon = [string]$p.DisplayIcon
                  InstallDate = [string]$p.InstallDate
                  KeyName = [string]$key.PSChildName
                })
              }
            } catch {}
          }
        }
      } catch {}
    }

    $results | ConvertTo-Json -Compress
  `;

  let rawList: any[] = [];
  try {
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    const { stdout } = await execAsync(
      `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ${encoded}`,
      { maxBuffer: 25 * 1024 * 1024 }
    );
    if (stdout && stdout.trim()) {
      const parsed = JSON.parse(stdout.trim());
      rawList = Array.isArray(parsed) ? parsed : [parsed];
    }
  } catch (err) {
    console.error('[CPUTY] Error querying Windows registry for installed applications:', err);
  }

  const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
  const roamingAppData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const programData = process.env.ProgramData || 'C:\\ProgramData';
  const localLowAppData = path.join(home, 'AppData', 'LocalLow');

  const getSubdirMap = async (dir: string): Promise<Map<string, string>> => {
    try {
      const items = await fs.promises.readdir(dir);
      const map = new Map<string, string>();
      for (const item of items) {
        map.set(item.toLowerCase(), item);
      }
      return map;
    } catch {
      return new Map();
    }
  };

  const [localMap, roamingMap, localLowMap, progDataMap] = await Promise.all([
    getSubdirMap(localAppData),
    getSubdirMap(roamingAppData),
    getSubdirMap(localLowAppData),
    getSubdirMap(programData),
  ]);

  const leftoverRoots: { root: string; map: Map<string, string>; type: 'cache' | 'support' | 'preference' | 'other' }[] = [
    { root: localAppData, map: localMap, type: 'cache' },
    { root: roamingAppData, map: roamingMap, type: 'support' },
    { root: localLowAppData, map: localLowMap, type: 'other' },
    { root: programData, map: progDataMap, type: 'support' },
  ];

  const cleanAppName = (str: string) => {
    return str
      .replace(/\s*\((?:64-bit|32-bit|x64|x86|ARM64)\)/gi, '')
      .replace(/\s*version\s*[\d\.]+/gi, '')
      .replace(/[\d\.]+\s*(?:bit|x64|x86)?$/gi, '')
      .trim();
  };

  const seenKeys = new Set<string>();

  for (const raw of rawList) {
    if (!raw.DisplayName || typeof raw.DisplayName !== 'string') continue;
    const name = raw.DisplayName.trim();
    if (!name) continue;

    const dedupKey = `${name.toLowerCase()}__${(raw.DisplayVersion || '').toLowerCase()}`;
    if (seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);

    // Resolve app directory
    let appPath = '';
    if (raw.InstallLocation && typeof raw.InstallLocation === 'string' && raw.InstallLocation.trim()) {
      const trimmedLoc = raw.InstallLocation.replace(/^["']|["']$/g, '').trim();
      if (await pathExists(trimmedLoc)) {
        appPath = trimmedLoc;
      }
    }

    if (!appPath && raw.DisplayIcon && typeof raw.DisplayIcon === 'string') {
      const iconCandidate = raw.DisplayIcon.split(',')[0].replace(/^["']|["']$/g, '').trim();
      if (iconCandidate) {
        const iconDir = path.dirname(iconCandidate);
        const iconDirLower = iconDir.toLowerCase();
        if (
          !iconDirLower.endsWith('system32') &&
          !iconDirLower.endsWith('syswow64') &&
          (await pathExists(iconDir))
        ) {
          appPath = iconDir;
        }
      }
    }

    if (!appPath && raw.UninstallString && typeof raw.UninstallString === 'string') {
      const match = raw.UninstallString.match(/^"([^"]+)"/) || raw.UninstallString.match(/^([^\s]+)/);
      if (match && match[1]) {
        const exePath = match[1];
        const uninstDir = path.dirname(exePath);
        const uninstDirLower = uninstDir.toLowerCase();
        if (
          !uninstDirLower.endsWith('system32') &&
          !uninstDirLower.endsWith('syswow64') &&
          (await pathExists(uninstDir))
        ) {
          appPath = uninstDir;
        }
      }
    }

    if (!appPath) {
      const baseName = cleanAppName(name);
      const candidates = [
        path.join(process.env.ProgramFiles || 'C:\\Program Files', baseName),
        path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', baseName),
        path.join(localAppData, 'Programs', baseName),
        path.join(localAppData, baseName),
        path.join(roamingAppData, baseName),
      ];
      for (const cand of candidates) {
        if (await pathExists(cand)) {
          appPath = cand;
          break;
        }
      }
    }

    if (!appPath) {
      appPath = raw.InstallLocation || (raw.UninstallString ? raw.UninstallString.split(' ')[0].replace(/^["']|["']$/g, '') : 'Windows Program');
    }

    let appSize = 0;
    if (typeof raw.EstimatedSize === 'number' && raw.EstimatedSize > 0) {
      appSize = raw.EstimatedSize * 1024;
    } else if (appPath && (await pathExists(appPath))) {
      try {
        appSize = await getPathSize(appPath, 2);
      } catch {
        appSize = 0;
      }
    }

    // Residual leftover detection
    const GENERIC_EXCLUDED_KEYWORDS = new Set([
      'microsoft', 'microsoft corporation', 'google', 'google llc', 'adobe', 'adobe inc.', 'adobe systems',
      'apple', 'apple inc.', 'intel', 'nvidia', 'windows', 'system', 'common files', 'packages', 'temp',
      'cache', 'install', 'installer', 'setup', 'update', 'updater', 'program files', 'local', 'roaming',
      'mozilla', 'firefox', 'chrome', 'edge'
    ]);

    const associatedFiles: InstalledApp['associatedFiles'] = [];
    const baseName = cleanAppName(name);
    const keywords = [baseName, name]
      .filter(k => k && k.length >= 3 && !GENERIC_EXCLUDED_KEYWORDS.has(k.toLowerCase()));

    const normalizedAppPath = appPath ? path.resolve(appPath).toLowerCase() : '';

    for (const { root, map, type } of leftoverRoots) {
      for (const kw of keywords) {
        const exactFolderName = map.get(kw.toLowerCase());
        if (!exactFolderName) continue;
        const candidate = path.join(root, exactFolderName);
        const normCand = path.resolve(candidate).toLowerCase();

        if (normCand === normalizedAppPath) continue;
        if (associatedFiles.some(f => path.resolve(f.path).toLowerCase() === normCand)) continue;

        try {
          const sz = await getPathSize(candidate, 2);
          if (sz > 0) {
            associatedFiles.push({
              path: candidate,
              type,
              size: sz
            });
          }
        } catch {}
      }
    }

    const associatedTotal = associatedFiles.reduce((acc, curr) => acc + curr.size, 0);

    let lastOpened = 0;
    if (raw.InstallDate && typeof raw.InstallDate === 'string' && raw.InstallDate.length === 8) {
      const year = parseInt(raw.InstallDate.slice(0, 4), 10);
      const month = parseInt(raw.InstallDate.slice(4, 6), 10) - 1;
      const day = parseInt(raw.InstallDate.slice(6, 8), 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) lastOpened = d.getTime();
    }

    const uniqueId = `win_${crypto.createHash('sha256').update(name + (raw.DisplayVersion || '') + (raw.KeyName || '')).digest('hex').slice(0, 16)}`;

    apps.push({
      id: uniqueId,
      name,
      bundleId: raw.Publisher || undefined,
      version: raw.DisplayVersion || undefined,
      appPath,
      appSize,
      totalSize: appSize + associatedTotal,
      associatedFiles,
      lastOpened: lastOpened || undefined,
      publisher: raw.Publisher || undefined,
      uninstallString: raw.UninstallString || undefined,
      quietUninstallString: raw.QuietUninstallString || undefined,
    });
  }

  apps.sort((a, b) => b.totalSize - a.totalSize);
  return apps;
}

export async function scanInstalledApps(): Promise<InstalledApp[]> {
  if (process.platform === 'win32') {
    return await scanWindowsInstalledApps();
  }
  return await scanMacInstalledApps();
}
