import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SystemStats } from '../types';
import { getOSInfo, getDiskStats, purgeSystemRAM, isMac, isWindows } from '../osChecker';

const execAsync = promisify(exec);

let lastCpuInfo = os.cpus();
let monitorInterval: NodeJS.Timeout | null = null;
let tickCount = 0;

let currentStats: SystemStats = {
  cpu: {
    usagePercent: 0,
    model: os.cpus()[0]?.model || (isMac ? 'Apple Silicon / Intel' : 'Processor'),
    cores: os.cpus().length,
    loadAverage: [0, 0, 0],
  },
  memory: {
    totalBytes: os.totalmem(),
    usedBytes: 0,
    freeBytes: os.freemem(),
    wiredBytes: 0,
    activeBytes: 0,
    compressedBytes: 0,
    usagePercent: 0,
  },
  storage: {
    totalBytes: 512 * 1024 * 1024 * 1024,
    usedBytes: 0,
    freeBytes: 200 * 1024 * 1024 * 1024,
    usagePercent: 0,
    mountPoint: isWindows ? (process.env.SystemDrive ? `${process.env.SystemDrive}\\` : 'C:\\') : '/',
    diskName: isWindows ? (process.env.SystemDrive ? `Local Disk (${process.env.SystemDrive})` : 'Local Disk (C:)') : (isMac ? 'Macintosh HD' : 'Root Filesystem'),
  },
  uptime: os.uptime(),
  osVersion: isWindows ? 'Windows' : (isMac ? 'macOS' : 'Linux'),
  hostname: os.hostname(),
  platform: process.platform as 'win32' | 'darwin' | 'linux',
  osType: isWindows ? 'Windows' : (isMac ? 'macOS' : 'Linux'),
};

function calculateCpuDelta(): number {
  const currentCpuInfo = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (let i = 0; i < currentCpuInfo.length; i++) {
    const prev = lastCpuInfo[i]?.times || { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };
    const curr = currentCpuInfo[i].times;

    const idle = curr.idle - prev.idle;
    const total = (curr.user - prev.user) +
                  (curr.nice - prev.nice) +
                  (curr.sys - prev.sys) +
                  (curr.irq - prev.irq) +
                  idle;

    totalIdle += idle;
    totalTick += total;
  }

  lastCpuInfo = currentCpuInfo;
  if (totalTick <= 0) return currentStats.cpu.usagePercent;
  const usage = (1 - totalIdle / totalTick) * 100;
  return Math.max(0, Math.min(100, parseFloat(usage.toFixed(1))));
}

async function updateDiskStats() {
  try {
    const stats = await getDiskStats();
    currentStats.storage = stats;
  } catch {
    // Keep existing disk stats
  }
}

async function updateMemoryStats() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  let wiredBytes = 0;
  let activeBytes = 0;
  let compressedBytes = 0;
  let calculatedUsedMem = totalMemory - freeMemory;

  if (isMac) {
    try {
      const { stdout } = await execAsync('vm_stat');
      const lines = stdout.split('\n');
      const pageSize = 4096;

      for (const line of lines) {
        if (line.includes('Pages wired down:')) {
          const val = parseInt(line.replace(/[^0-9]/g, ''), 10);
          wiredBytes = val * pageSize;
        } else if (line.includes('Pages active:')) {
          const val = parseInt(line.replace(/[^0-9]/g, ''), 10);
          activeBytes = val * pageSize;
        } else if (line.includes('Pages occupied by compressor:')) {
          const val = parseInt(line.replace(/[^0-9]/g, ''), 10);
          compressedBytes = val * pageSize;
        }
      }
      if (wiredBytes + activeBytes + compressedBytes > 0) {
        calculatedUsedMem = wiredBytes + activeBytes + compressedBytes;
      }
    } catch {
      // Fallback to basic Node os memory
    }
  }

  const memUsagePercent = Math.min(100, parseFloat(((calculatedUsedMem / totalMemory) * 100).toFixed(1)));

  currentStats.memory = {
    totalBytes: totalMemory,
    usedBytes: calculatedUsedMem,
    freeBytes: Math.max(0, totalMemory - calculatedUsedMem),
    wiredBytes,
    activeBytes,
    compressedBytes,
    usagePercent: memUsagePercent,
  };
}

async function tickMonitor() {
  tickCount++;
  const cpus = os.cpus();
  const cpuPercent = calculateCpuDelta();

  const osInfo = await getOSInfo();
  currentStats.cpu = {
    usagePercent: cpuPercent,
    model: cpus[0]?.model || (isMac ? 'Apple Silicon / Intel' : 'Processor'),
    cores: cpus.length,
    loadAverage: os.loadavg(),
  };

  currentStats.uptime = os.uptime();
  currentStats.hostname = osInfo.hostname;
  currentStats.osVersion = osInfo.osVersion;
  currentStats.osInfo = osInfo;
  currentStats.platform = osInfo.platform;
  currentStats.osType = osInfo.osType;

  await updateMemoryStats();

  // Update disk every 5 seconds (5 ticks) to avoid unnecessary disk I/O spawns
  if (tickCount % 5 === 1) {
    await updateDiskStats();
  }
}

// Start continuous background monitoring
export function startSystemMonitor(): void {
  if (monitorInterval) return;
  tickMonitor();
  monitorInterval = setInterval(tickMonitor, 1000);
}

export function stopSystemMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

export async function getSystemStats(): Promise<SystemStats> {
  if (!monitorInterval) {
    startSystemMonitor();
    await tickMonitor();
  }
  return { ...currentStats };
}

export async function purgeRAM(elevated = false): Promise<{ success: boolean; message: string }> {
  const result = await purgeSystemRAM(elevated);
  await updateMemoryStats();
  return result;
}


