import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CleanableItem, ScanResult } from '../types';
import { getPathSize, pathExists } from './fsUtils';

export async function scanDevJunk(): Promise<ScanResult> {
  const home = os.homedir();
  const items: CleanableItem[] = [];

  const targets = [
    {
      id: 'xcode_derived_data',
      name: 'Xcode Derived Data',
      category: 'developer',
      path: path.join(home, 'Library/Developer/Xcode/DerivedData'),
      description: 'Intermediate build products, indexes, and logs from Xcode projects. Rebuilt automatically on demand.',
      safeToDelete: true,
      scanChildren: true,
    },
    {
      id: 'xcode_archives',
      name: 'Xcode Old Build Archives',
      category: 'developer',
      path: path.join(home, 'Library/Developer/Xcode/Archives'),
      description: 'Past app builds archived for distribution.',
      safeToDelete: true,
      scanChildren: true,
    },
    {
      id: 'xcode_device_support',
      name: 'Xcode iOS/watchOS Device Support',
      category: 'developer',
      path: path.join(home, 'Library/Developer/Xcode/iOS DeviceSupport'),
      description: 'Symbol files created when connecting physical devices to Xcode.',
      safeToDelete: true,
      scanChildren: true,
    },
    {
      id: 'core_simulator_caches',
      name: 'iOS Simulator Caches',
      category: 'developer',
      path: path.join(home, 'Library/Developer/CoreSimulator/Caches'),
      description: 'Temporary download and simulator runtime caches.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'homebrew_cache',
      name: 'Homebrew Download Cache',
      category: 'developer',
      path: path.join(home, 'Library/Caches/Homebrew'),
      description: 'Cached bottle archives and package tarballs downloaded by brew.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'npm_cache',
      name: 'npm Package Cache',
      category: 'developer',
      path: path.join(home, '.npm/_cacache'),
      description: 'Cached packages downloaded during npm install executions.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'pnpm_cache',
      name: 'pnpm Global Store',
      category: 'developer',
      path: path.join(home, 'Library/pnpm/store'),
      description: 'Unused pnpm hard-link packages cache.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'yarn_cache',
      name: 'Yarn Cache',
      category: 'developer',
      path: path.join(home, 'Library/Caches/Yarn'),
      description: 'Yarn dependency cache.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'pip_cache',
      name: 'Python Pip Cache',
      category: 'developer',
      path: path.join(home, 'Library/Caches/pip'),
      description: 'Python wheel and tarball download cache.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'cocoapods_cache',
      name: 'CocoaPods Cache',
      category: 'developer',
      path: path.join(home, 'Library/Caches/CocoaPods'),
      description: 'Downloaded pod repositories and specs.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'gradle_cache',
      name: 'Gradle Cache',
      category: 'developer',
      path: path.join(home, '.gradle/caches'),
      description: 'Cached Java/Kotlin/Android build jars and dependencies.',
      safeToDelete: true,
      scanChildren: false,
    },
    {
      id: 'rust_cargo_cache',
      name: 'Rust Cargo Registry Cache',
      category: 'developer',
      path: path.join(home, '.cargo/registry/cache'),
      description: 'Cached crates.io tarballs.',
      safeToDelete: true,
      scanChildren: false,
    },
  ];

  for (const target of targets) {
    if (!(await pathExists(target.path))) continue;

    if (target.scanChildren) {
      try {
        const entries = await fs.promises.readdir(target.path, { withFileTypes: true });
        const subItems: CleanableItem[] = [];
        let groupTotalSize = 0;

        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const entryPath = path.join(target.path, entry.name);
          const size = await getPathSize(entryPath);
          if (size > 1024 * 50) {
            groupTotalSize += size;
            subItems.push({
              id: `${target.id}_${entry.name}`,
              name: entry.name,
              category: 'developer',
              path: entryPath,
              size,
              selected: true,
              safeToDelete: target.safeToDelete,
              description: `Project in ${target.name}`,
            });
          }
        }

        subItems.sort((a, b) => b.size - a.size);

        if (subItems.length > 0) {
          items.push({
            id: target.id,
            name: target.name,
            category: 'developer',
            path: target.path,
            size: groupTotalSize,
            selected: true,
            safeToDelete: target.safeToDelete,
            description: target.description,
            itemCount: subItems.length,
            subItems,
          });
        }
      } catch {
        // Continue
      }
    } else {
      const size = await getPathSize(target.path);
      if (size > 1024 * 50) {
        items.push({
          id: target.id,
          name: target.name,
          category: 'developer',
          path: target.path,
          size,
          selected: true,
          safeToDelete: target.safeToDelete,
          description: target.description,
        });
      }
    }
  }

  const totalSize = items.reduce((acc, curr) => acc + curr.size, 0);
  const itemCount = items.reduce((acc, curr) => acc + (curr.subItems?.length || 1), 0);

  return {
    category: 'developer',
    title: 'Developer Build & Tooling Junk',
    totalSize,
    itemCount,
    items,
    scannedAt: Date.now(),
  };
}
