import * as fs from 'fs';
import { shell } from 'electron';
import { getPathSize, isPathSafe, pathExists } from './fsUtils';

export async function cleanPaths(paths: string[], permanently = false): Promise<{ success: boolean; freedBytes: number; errors: string[] }> {
  let freedBytes = 0;
  const errors: string[] = [];

  for (const targetPath of paths) {
    try {
      if (!isPathSafe(targetPath)) {
        errors.push(`Skipped protected path: ${targetPath}`);
        continue;
      }

      if (!(await pathExists(targetPath))) {
        continue;
      }

      const size = await getPathSize(targetPath);

      if (permanently) {
        await fs.promises.rm(targetPath, { recursive: true, force: true });
        freedBytes += size;
      } else {
        await shell.trashItem(targetPath);
        freedBytes += size;
      }
    } catch (err: any) {
      errors.push(`Failed to remove ${targetPath}: ${err?.message || 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    freedBytes,
    errors,
  };
}
