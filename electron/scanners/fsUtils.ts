import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Calculates the size of a file or directory recursively
 */
export async function getPathSize(targetPath: string, maxDepth = 6, currentDepth = 0): Promise<number> {
  if (currentDepth > maxDepth) return 0;
  try {
    const stats = await fs.promises.lstat(targetPath);
    if (stats.isFile()) {
      return stats.size;
    }
    if (stats.isDirectory()) {
      let totalSize = 0;
      const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });
      for (const entry of entries) {
        // Skip symlinks or restricted sockets
        if (entry.isSymbolicLink()) continue;
        const fullPath = path.join(targetPath, entry.name);
        try {
          if (entry.isDirectory()) {
            totalSize += await getPathSize(fullPath, maxDepth, currentDepth + 1);
          } else if (entry.isFile()) {
            const fileStat = await fs.promises.stat(fullPath);
            totalSize += fileStat.size;
          }
        } catch {
          // ignore permission denied on individual sub-files
        }
      }
      return totalSize;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Checks if a path exists
 */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.promises.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Expands tilde ~ to user home directory
 */
export function expandHome(filePath: string): string {
  if (filePath.startsWith('~')) {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

/**
 * Human-readable size formatting (e.g. 2.4 GB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Safety check: Ensures paths are safe to touch and not critical macOS / Windows system root paths
 */
export function isPathSafe(targetPath: string): boolean {
  const normalized = path.resolve(targetPath);
  const home = os.homedir();
  const isWin = process.platform === 'win32';

  const dangerousRoots = [
    '/',
    '/System',
    '/System/Library',
    '/usr',
    '/usr/bin',
    '/usr/sbin',
    '/bin',
    '/sbin',
    '/private',
    '/private/etc',
    '/etc',
    '/var',
    '/dev',
    '/Library',
    '/Applications',
    home,
    path.join(home, 'Desktop'),
    path.join(home, 'Documents'),
    path.join(home, 'Library'),
    path.join(home, 'Pictures'),
    path.join(home, 'Movies'),
    path.join(home, 'Music'),
    path.join(home, 'Videos'),
  ];

  if (isWin) {
    const sysDrive = process.env.SystemDrive || 'C:';
    dangerousRoots.push(
      `${sysDrive}\\`,
      path.join(sysDrive, '\\Windows'),
      path.join(sysDrive, '\\Windows\\System32'),
      path.join(sysDrive, '\\Program Files'),
      path.join(sysDrive, '\\Program Files (x86)'),
      path.join(sysDrive, '\\Users'),
      path.join(home, 'AppData'),
      path.join(home, 'AppData', 'Roaming'),
      path.join(home, 'AppData', 'Local')
    );
  }

  if (dangerousRoots.includes(normalized)) {
    return false;
  }

  // Allowed cache and log sub-roots
  const allowedRoots = [
    path.join(home, 'Library/Caches'),
    path.join(home, 'Library/Logs'),
    path.join(home, 'Library/Application Support'),
    path.join(home, 'Library/Saved Application State'),
    path.join(home, 'Library/Containers'),
    path.join(home, 'Downloads'),
    path.join(home, '.Trash'),
    path.join(home, '.npm'),
    path.join(home, '.yarn'),
    path.join(home, '.pnpm-store'),
    path.join(home, '.cache'),
    path.join(home, '.gradle/caches'),
    path.join(home, '.cocoapods'),
    '/Library/Caches',
    '/Library/Logs',
    '/private/var/log',
    '/tmp',
    '/var/tmp',
  ];

  if (isWin) {
    if (process.env.TEMP) allowedRoots.push(process.env.TEMP);
    if (process.env.TMP) allowedRoots.push(process.env.TMP);
    allowedRoots.push(
      path.join(home, 'AppData/Local/Temp'),
      path.join(home, 'AppData/Local/CrashDumps'),
      path.join(home, 'AppData/Local/Microsoft/Windows/Explorer'),
      path.join(home, 'AppData/Local/Microsoft/Windows/INetCache'),
      path.join(home, 'AppData/Local/Google/Chrome/User Data'),
      path.join(home, 'AppData/Local/Microsoft/Edge/User Data'),
      path.join(home, 'AppData/Local/BraveSoftware'),
      path.join(home, 'AppData/Local/Mozilla/Firefox'),
      path.join(home, 'AppData/Local/Programs')
    );
  }

  // If it's a subpath in allowed roots, it is definitely safe
  const isInsideAllowed = allowedRoots.some(allowed => allowed && normalized.startsWith(path.resolve(allowed)) && normalized.length > path.resolve(allowed).length);
  if (isInsideAllowed) return true;

  // If it's an app bundle inside /Applications or ~/Applications (for macOS uninstaller), it is safe
  if (normalized.startsWith('/Applications/') || normalized.startsWith(path.join(home, 'Applications/'))) {
    return true;
  }

  // If it's an application directory inside Windows Program Files, ProgramData, or AppData Programs, it is safe
  if (isWin) {
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const programData = process.env.ProgramData || 'C:\\ProgramData';
    const winAppRoots = [
      path.resolve(programFiles),
      path.resolve(programFilesX86),
      path.resolve(programData),
    ];
    for (const appRoot of winAppRoots) {
      if (normalized.startsWith(appRoot + path.sep) && normalized.length > appRoot.length + 1) {
        return true;
      }
    }
  }

  // If it's inside user's home (excluding protected root folders), it can be cleaned if explicitly selected
  if (normalized.startsWith(home)) {
    return true;
  }

  return false;
}
