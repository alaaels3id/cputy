import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { DuplicateGroup } from '../types';
import { pathExists } from './fsUtils';

interface FileInfo {
  path: string;
  name: string;
  size: number;
  lastModified: number;
}

/**
 * Computes partial hash (sample) of a file for fast duplicate candidate filtering
 */
async function computeSampleHash(filePath: string, size: number): Promise<string> {
  const SAMPLE_SIZE = 4096;
  const hash = crypto.createHash('md5');
  const buffer = Buffer.alloc(SAMPLE_SIZE);
  let fd: fs.promises.FileHandle | null = null;

  try {
    fd = await fs.promises.open(filePath, 'r');

    // Read head
    const headBytes = await fd.read(buffer, 0, Math.min(SAMPLE_SIZE, size), 0);
    hash.update(buffer.subarray(0, headBytes.bytesRead));

    // Read middle if file is large enough
    if (size > SAMPLE_SIZE * 3) {
      const midPos = Math.floor(size / 2);
      const midBytes = await fd.read(buffer, 0, SAMPLE_SIZE, midPos);
      hash.update(buffer.subarray(0, midBytes.bytesRead));

      // Read tail
      const tailPos = size - SAMPLE_SIZE;
      const tailBytes = await fd.read(buffer, 0, SAMPLE_SIZE, tailPos);
      hash.update(buffer.subarray(0, tailBytes.bytesRead));
    }
  } catch {
    return '';
  } finally {
    if (fd) await fd.close();
  }

  return hash.digest('hex');
}

/**
 * Computes full MD5 hash of a file
 */
async function computeFullHash(filePath: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', () => resolve(''));
    } catch {
      resolve('');
    }
  });
}

export async function scanDuplicates(targetDir?: string): Promise<DuplicateGroup[]> {
  const home = os.homedir();
  const dirsToScan = targetDir 
    ? [targetDir] 
    : [
        path.join(home, 'Downloads'),
        path.join(home, 'Documents'),
        path.join(home, 'Desktop'),
        path.join(home, 'Pictures'),
      ];

  const filesBySize = new Map<number, FileInfo[]>();

  async function walk(dir: string, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return;
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'Photos Library.photoslibrary') continue;

        const fullPath = path.join(dir, entry.name);
        try {
          if (entry.isDirectory() && !entry.isSymbolicLink()) {
            await walk(fullPath, depth + 1, maxDepth);
          } else if (entry.isFile() && !entry.isSymbolicLink()) {
            const stat = await fs.promises.stat(fullPath);
            if (stat.size >= 1024 * 10) { // filter out files smaller than 10KB
              const list = filesBySize.get(stat.size) || [];
              list.push({
                path: fullPath,
                name: entry.name,
                size: stat.size,
                lastModified: stat.mtimeMs,
              });
              filesBySize.set(stat.size, list);
            }
          }
        } catch {
          // ignore error
        }
      }
    } catch {
      // ignore folder read error
    }
  }

  for (const dir of dirsToScan) {
    if (await pathExists(dir)) {
      await walk(dir);
    }
  }

  // Filter only sizes with 2 or more files
  const candidateGroups: FileInfo[][] = [];
  for (const [, fileList] of filesBySize) {
    if (fileList.length >= 2) {
      candidateGroups.push(fileList);
    }
  }

  // Phase 2 & 3: Hash checks
  const duplicateGroups: DuplicateGroup[] = [];

  for (const group of candidateGroups) {
    const sampleHashMap = new Map<string, FileInfo[]>();

    for (const file of group) {
      const sampleHash = await computeSampleHash(file.path, file.size);
      if (!sampleHash) continue;
      const list = sampleHashMap.get(sampleHash) || [];
      list.push(file);
      sampleHashMap.set(sampleHash, list);
    }

    for (const [, sampleMatches] of sampleHashMap) {
      if (sampleMatches.length < 2) continue;

      // Full hash check
      const fullHashMap = new Map<string, FileInfo[]>();
      for (const file of sampleMatches) {
        const fullHash = await computeFullHash(file.path);
        if (!fullHash) continue;
        const list = fullHashMap.get(fullHash) || [];
        list.push(file);
        fullHashMap.set(fullHash, list);
      }

      for (const [hash, confirmedDuplicates] of fullHashMap) {
        if (confirmedDuplicates.length >= 2) {
          // Sort oldest first so original is preserved
          confirmedDuplicates.sort((a, b) => a.lastModified - b.lastModified);
          const fileSize = confirmedDuplicates[0].size;

          duplicateGroups.push({
            hash,
            size: fileSize,
            totalWastedSize: fileSize * (confirmedDuplicates.length - 1),
            files: confirmedDuplicates.map((f, idx) => ({
              path: f.path,
              name: f.name,
              lastModified: f.lastModified,
              isOriginal: idx === 0, // original oldest file
              selectedForDeletion: idx > 0, // mark duplicates for deletion
            })),
          });
        }
      }
    }
  }

  // Sort groups by total wasted space descending
  duplicateGroups.sort((a, b) => b.totalWastedSize - a.totalWastedSize);

  return duplicateGroups;
}
