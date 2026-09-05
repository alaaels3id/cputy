import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SystemStats } from '../types';

const execAsync = promisify(exec);

let lastCpuInfo = os.cpus();
let cachedOsVersion: string | null = null;
let monitorInterval: NodeJS.Timeout | null = null;
let tickCount = 0;

let currentStats: SystemStats = {
  cpu: {
    usagePercent: 0,
    model: os.cpus()[0]?.model || 'Apple Silicon / Intel',
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
    mountPoint: '/',
    diskName: 'Macintosh HD',
  },
  uptime: os.uptime(),
  osVersion: 'macOS',
  hostname: os.hostname(),
};

async function getOsVersion(): Promise<string> {
  if (cachedOsVersion) return cachedOsVersion;
  try {
    const { stdout } = await execAsync('sw_vers -productVersion');
    cachedOsVersion = `macOS ${stdout.trim()}`;
  } catch {
    cachedOsVersion = `macOS ${os.release()}`;
  }
  return cachedOsVersion;
}

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
    let stdout = '';
    try {
      const res = await execAsync('df -k /System/Volumes/Data');
      stdout = res.stdout;
    } catch {
      const res = await execAsync('df -k /');
      stdout = res.stdout;
    }

    const lines = stdout.trim().split('\n');
    if (lines.length >= 2) {
      const parts = lines[1].split(/\s+/);
      if (parts.length >= 6) {
        const diskTotal = parseInt(parts[1], 10) * 1024;
        const diskFree = parseInt(parts[3], 10) * 1024;
        // In macOS APFS containers, diskUsed is total minus available free space
        const diskUsed = diskTotal > diskFree ? diskTotal - diskFree : parseInt(parts[2], 10) * 1024;
        const mountPoint = parts[8] || '/';
        const storageUsagePercent = diskTotal > 0 ? parseFloat(((diskUsed / diskTotal) * 100).toFixed(1)) : 0;

        currentStats.storage = {
          totalBytes: diskTotal,
          usedBytes: diskUsed,
          freeBytes: diskFree,
          usagePercent: storageUsagePercent,
          mountPoint,
          diskName: 'Macintosh HD',
        };
      }
    }
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

  currentStats.cpu = {
    usagePercent: cpuPercent,
    model: cpus[0]?.model || 'Apple Silicon / Intel',
    cores: cpus.length,
    loadAverage: os.loadavg(),
  };

  currentStats.uptime = os.uptime();
  currentStats.hostname = os.hostname();
  currentStats.osVersion = await getOsVersion();

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
  try {
    if (elevated) {
      await execAsync(`osascript -e 'do shell script "purge" with administrator privileges'`);
    } else {
      await execAsync('purge');
    }
    await updateMemoryStats();
    return { success: true, message: 'Inactive memory buffers successfully purged.' };
  } catch (err: any) {
    const errMsg = err?.message || '';
    if (errMsg.includes('Operation not permitted') || errMsg.includes('Permission denied') || errMsg.includes('sudo')) {
      return { 
        success: false, 
        message: 'macOS requires administrator permissions to purge kernel RAM disk buffers. Try elevated purge or run "sudo purge" in Terminal.' 
      };
    }
    return { success: false, message: `RAM Purge status: ${errMsg || 'Unable to purge inactive memory'}` };
  }
}


