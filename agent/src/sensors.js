// Real host sensors. Everything here reads the actual machine.
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";

let prevCpu = os.cpus();

export function cpuUsage() {
  const now = os.cpus();
  let idle = 0;
  let total = 0;
  for (let i = 0; i < now.length; i++) {
    const a = prevCpu[i]?.times ?? now[i].times;
    const b = now[i].times;
    const dIdle = b.idle - a.idle;
    const dTotal = Object.keys(b).reduce((s, k) => s + (b[k] - a[k]), 0);
    idle += dIdle;
    total += dTotal;
  }
  prevCpu = now;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (1 - idle / total) * 100));
}

export function memory() {
  const total = os.totalmem();
  const free = os.freemem();
  return { total, used: total - free, pct: ((total - free) / total) * 100 };
}

export async function disks() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-PSDrive -PSProvider FileSystem | Select-Object Name,Used,Free | ConvertTo-Json -Compress",
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed])
        .filter((d) => d && (d.Used || d.Free))
        .map((d) => ({ name: `${d.Name}:`, used: Number(d.Used) || 0, free: Number(d.Free) || 0 }));
    }
    const { stdout } = await run("df", ["-kP"]);
    return stdout
      .trim()
      .split("\n")
      .slice(1)
      .filter((l) => l.startsWith("/"))
      .map((l) => l.split(/\s+/))
      .map((c) => ({ name: c[5], used: Number(c[2]) * 1024, free: Number(c[3]) * 1024 }))
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function processes() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-Process | Sort-Object -Descending WS | Select-Object -First 40 Id,ProcessName,WS,Path | ConvertTo-Json -Compress",
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((p) => ({
        pid: p.Id,
        name: p.ProcessName,
        mem: Number(p.WS) || 0,
        cpu: 0,
        path: p.Path || "",
      }));
    }
    const { stdout } = await run("ps", ["-eo", "pid,pcpu,rss,comm", "--sort=-rss"], { maxBuffer: 4e6 });
    return stdout
      .trim()
      .split("\n")
      .slice(1, 41)
      .map((l) => l.trim().split(/\s+/))
      .map((c) => ({ pid: Number(c[0]), cpu: Number(c[1]), mem: Number(c[2]) * 1024, name: c.slice(3).join(" "), path: "" }));
  } catch {
    return [];
  }
}

export async function connections() {
  try {
    const cmd = isWin
      ? ["powershell", ["-NoProfile", "-Command", "Get-NetTCPConnection -State Established | Select-Object -First 60 LocalPort,RemoteAddress,RemotePort,OwningProcess | ConvertTo-Json -Compress"]]
      : isMac
        ? ["netstat", ["-anp", "tcp"]]
        : ["ss", ["-tnp"]];
    const { stdout } = await run(cmd[0], cmd[1], { maxBuffer: 4e6 });
    if (isWin) {
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((c) => ({
        local: String(c.LocalPort),
        remote: `${c.RemoteAddress}:${c.RemotePort}`,
        pid: c.OwningProcess,
      }));
    }
    return stdout
      .split("\n")
      .filter((l) => /ESTAB|ESTABLISHED/.test(l))
      .slice(0, 60)
      .map((l) => l.trim().split(/\s+/))
      .map((c) => ({ local: c[3] ?? "", remote: c[4] ?? "", pid: null }));
  } catch {
    return [];
  }
}

export async function listening() {
  try {
    const cmd = isWin
      ? ["powershell", ["-NoProfile", "-Command", "Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json -Compress"]]
      : ["ss", ["-tlnp"]];
    const { stdout } = await run(cmd[0], cmd[1], { maxBuffer: 2e6 });
    if (isWin) {
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((c) => ({ addr: c.LocalAddress, port: c.LocalPort }));
    }
    return stdout
      .split("\n")
      .slice(1)
      .filter(Boolean)
      .map((l) => l.trim().split(/\s+/)[3])
      .filter(Boolean)
      .map((a) => ({ addr: a.replace(/:\d+$/, ""), port: Number(a.split(":").pop()) }));
  } catch {
    return [];
  }
}

/** Removable / newly mounted volumes — the real "USB inserted" signal. */
export async function volumes() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter,DriveType,FileSystemLabel | ConvertTo-Json -Compress",
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((v) => ({
        mount: `${v.DriveLetter}:\\`,
        label: v.FileSystemLabel || "",
        removable: v.DriveType === "Removable",
      }));
    }
    const roots = isMac ? ["/Volumes"] : ["/media", "/run/media", "/mnt"];
    const out = [];
    for (const root of roots) {
      let entries = [];
      try {
        entries = fs.readdirSync(root, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const e of entries) if (e.isDirectory()) out.push({ mount: path.join(root, e.name), label: e.name, removable: true });
    }
    return out;
  } catch {
    return [];
  }
}

export function host() {
  const nets = Object.entries(os.networkInterfaces())
    .flatMap(([name, list]) => (list ?? []).map((n) => ({ name, address: n.address, family: n.family, internal: n.internal })))
    .filter((n) => !n.internal && n.family === "IPv4");
  return {
    hostname: os.hostname(),
    platform: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    cpus: os.cpus().length,
    model: os.cpus()[0]?.model ?? "unknown",
    uptime: os.uptime(),
    user: os.userInfo().username,
    nets,
  };
}

export async function wifiNetworks() {
  try {
    let connectedSsid = null;
    let connectedBssid = null;

    // First, get the connected network
    if (isWin) {
      try {
        const { stdout: connStdout } = await run("netsh", ["wlan", "show", "interfaces"]);
        const match = connStdout.match(/SSID\s*:\s*(.+)/i);
        if (match) connectedSsid = match[1].trim();
        const bssidMatch = connStdout.match(/BSSID\s*:\s*(.+)/i);
        if (bssidMatch) connectedBssid = bssidMatch[1].trim();
      } catch {
        // Continue without connected info
      }
    } else if (isMac) {
      try {
        const { stdout: connStdout } = await run("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", ["-I"]);
        const ssidMatch = connStdout.match(/SSID:\s*(.+)/i);
        if (ssidMatch) connectedSsid = ssidMatch[1].trim();
        const bssidMatch = connStdout.match(/BSSID:\s*(.+)/i);
        if (bssidMatch) connectedBssid = bssidMatch[1].trim();
      } catch {
        // Continue without connected info
      }
    } else {
      try {
        const { stdout: connStdout } = await run("nmcli", ["-t", "-f", "active,ssid,bssid", "dev", "wifi"]);
        const parts = connStdout.split(":");
        if (parts[0] === "yes") {
          connectedSsid = parts[1];
          connectedBssid = parts[2];
        }
      } catch {
        // Continue without connected info
      }
    }

    // Then, get nearby networks
    if (isWin) {
      const { stdout } = await run("netsh", ["wlan", "show", "networks", "mode=bssid"]);
      const networks = [];
      let currentNetwork = null;
      stdout.split("\n").forEach(line => {
        line = line.trim();
        if (line.startsWith("SSID")) {
          const ssid = line.split(":").slice(1).join(":").trim();
          currentNetwork = { ssid, bssid: "", signal: 0, connected: ssid === connectedSsid };
          networks.push(currentNetwork);
        } else if (line.startsWith("BSSID") && currentNetwork) {
          currentNetwork.bssid = line.split(":").slice(1).join(":").trim();
        } else if (line.includes("Signal") && currentNetwork) {
          const signalMatch = line.match(/(\d+)/);
          if (signalMatch) currentNetwork.signal = parseInt(signalMatch[1]) || 0;
        }
      });
      return networks;
    } else if (isMac) {
      const { stdout } = await run("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", ["-s"]);
      return stdout.split("\n").slice(1).filter(Boolean).map(line => {
        const parts = line.trim().split(/\s+/);
        const ssid = parts[0];
        const bssid = parts[1];
        const signal = parseInt(parts[2]) || 0;
        return { ssid, bssid, signal, connected: ssid === connectedSsid && bssid === connectedBssid };
      });
    } else {
      try {
        const { stdout } = await run("nmcli", ["-t", "-f", "ssid,bssid,signal,active", "dev", "wifi"]);
        return stdout.split("\n").filter(Boolean).map(line => {
          const parts = line.split(":");
          const ssid = parts[0];
          const bssid = parts[1];
          const signal = parseInt(parts[2]) || 0;
          const connected = parts[3] === "yes";
          return { ssid, bssid, signal, connected };
        });
      } catch {
        // Fallback to iwlist if nmcli fails
        try {
          const { stdout } = await run("iwlist", ["scan"]);
          const networks = [];
          const cells = stdout.split(/Cell \d+/);
          for (const cell of cells) {
            const ssidMatch = cell.match(/ESSID:"([^"]+)"/);
            const bssidMatch = cell.match(/Address: ([0-9A-F:]+)/i);
            const signalMatch = cell.match(/Signal level=(-?\d+) dBm/);
            if (ssidMatch) {
              networks.push({
                ssid: ssidMatch[1],
                bssid: bssidMatch ? bssidMatch[1] : "",
                signal: signalMatch ? Math.max(0, 100 + parseInt(signalMatch[1])) : 0,
                connected: false
              });
            }
          }
          return networks;
        } catch {
          return [];
        }
      }
    }
  } catch (error) {
    return { error: error.message || "WiFi enumeration failed" };
  }
}

export async function networkDevices() {
  try {
    if (isWin) {
      const { stdout } = await run("arp", ["-a"]);
      return stdout.split("\n")
        .filter(line => line.trim() && !line.includes("Interface"))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return { ip: parts[1], mac: parts[2], type: parts[3] || "dynamic" };
        });
    } else {
      const { stdout } = await run("arp", ["-n"]);
      return stdout.split("\n")
        .filter(line => line.includes("ether"))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return { ip: parts[0], mac: parts[2], type: parts[3] || "dynamic" };
        });
    }
  } catch {
    return [];
  }
}

export async function hardware() {
  try {
    const info = {
      cpu: {
        model: os.cpus()[0]?.model || "unknown",
        cores: os.cpus().length,
        architecture: os.arch(),
        speed: os.cpus()[0]?.speed || 0
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      platform: {
        type: os.type(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime()
      },
      storage: await disks(),
      networkAdapters: Object.entries(os.networkInterfaces()).map(([name, addrs]) => ({
        name,
        addresses: addrs.map(a => ({
          address: a.address,
          netmask: a.netmask,
          family: a.family,
          internal: a.internal,
          mac: a.mac
        }))
      })),
      usb: []
    };

    // USB device detection
    if (isWin) {
      try {
        const { stdout } = await run("powershell", [
          "-NoProfile",
          "-Command",
          "Get-PnpDevice -Class USB | Where-Object Status -eq 'OK' | Select-Object FriendlyName,InstanceId | ConvertTo-Json -Compress"
        ]);
        const parsed = JSON.parse(stdout || "[]");
        info.usb = (Array.isArray(parsed) ? parsed : [parsed]).map(d => ({
          name: d.FriendlyName || "Unknown USB Device",
          id: d.InstanceId || ""
        }));
      } catch {
        info.usb = [];
      }
    } else if (isMac) {
      try {
        const { stdout } = await run("system_profiler", ["SPUSBDataType", "-json"]);
        const parsed = JSON.parse(stdout || "{}");
        const extractUsb = (obj) => {
          const devices = [];
          if (obj._items) {
            for (const item of obj._items) {
              if (item._name) {
                devices.push({ name: item._name, id: item._serial || "" });
              }
              if (item._items) {
                devices.push(...extractUsb(item));
              }
            }
          }
          return devices;
        };
        info.usb = extractUsb(parsed);
      } catch {
        info.usb = [];
      }
    } else {
      try {
        const { stdout } = await run("lsusb", []);
        info.usb = stdout.split("\n").filter(Boolean).map(line => {
          const match = line.match(/.*: (.*)$/);
          return { name: match ? match[1] : line, id: "" };
        });
      } catch {
        info.usb = [];
      }
    }

    // GPU detection (Windows only via WMI)
    if (isWin) {
      try {
        const { stdout } = await run("powershell", [
          "-NoProfile",
          "-Command",
          "Get-WmiObject Win32_VideoController | Select-Object Name,AdapterRAM | ConvertTo-Json -Compress"
        ]);
        const parsed = JSON.parse(stdout || "[]");
        info.gpu = (Array.isArray(parsed) ? parsed : [parsed]).map(g => ({
          name: g.Name || "Unknown GPU",
          memory: Number(g.AdapterRAM) || 0
        }));
      } catch {
        info.gpu = [];
      }
    }

    return info;
  } catch (error) {
    return { error: error.message || "Hardware enumeration failed" };
  }
}

export async function networkLogs() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-EventLog -LogName System -EntryType Warning,Error -MaxEvents 20 -Source 'Net*,DHCP*' | Select-Object TimeGenerated,Message | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map(e => ({
        time: e.TimeGenerated,
        message: e.Message,
        level: "warning"
      }));
    } else {
      const { stdout } = await run("journalctl", ["-u", "network", "-n", "20", "--no-pager"]);
      return stdout.split("\n").filter(Boolean).map(line => ({
        time: line.substring(0, 15),
        message: line.substring(16),
        level: "info"
      }));
    }
  } catch {
    return [];
  }
}

export async function recentFiles(limit = 50) {
  try {
    const paths = isWin 
      ? [path.join(os.homedir(), "Downloads"), path.join(os.homedir(), "Desktop"), path.join(os.homedir(), "Documents")]
      : [path.join(os.homedir(), "Downloads"), path.join(os.homedir(), "Desktop")];
    
    const files = [];
    for (const dir of paths) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile() && files.length < limit) {
            const fullPath = path.join(dir, entry.name);
            const stats = fs.statSync(fullPath);
            files.push({
              name: entry.name,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime,
              extension: path.extname(entry.name)
            });
          }
        }
      } catch {}
    }
    return files.sort((a, b) => b.modified - a.modified).slice(0, limit);
  } catch {
    return [];
  }
}

export async function systemLogs() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-EventLog -LogName System -MaxEvents 30 -EntryType Error,Warning | Select-Object TimeGenerated,Source,Message | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map(e => ({
        time: e.TimeGenerated,
        source: e.Source,
        message: e.Message,
        level: "error"
      }));
    } else {
      const { stdout } = await run("journalctl", ["-n", "30", "--no-pager"]);
      return stdout.split("\n").filter(Boolean).map(line => ({
        time: line.substring(0, 15),
        source: "system",
        message: line.substring(16),
        level: "info"
      }));
    }
  } catch {
    return [];
  }
}

export async function allProcesses() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-Process | Select-Object Id,ProcessName,WS,CPU,Path,StartTime | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((p) => ({
        pid: p.Id,
        name: p.ProcessName,
        mem: Number(p.WS) || 0,
        cpu: Number(p.CPU) || 0,
        path: p.Path || "",
        startTime: p.StartTime
      }));
    } else {
      const { stdout } = await run("ps", ["-eo", "pid,pcpu,rss,etime,comm", "--sort=-pcpu"], { maxBuffer: 8e6 });
      return stdout
        .trim()
        .split("\n")
        .slice(1)
        .map((l) => l.trim().split(/\s+/))
        .map((c) => ({ pid: Number(c[0]), cpu: Number(c[1]), mem: Number(c[2]) * 1024, time: c[3], name: c.slice(4).join(" "), path: "" }));
    }
  } catch {
    return [];
  }
}

export async function allConnections() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-NetTCPConnection | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,OwningProcess | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((c) => ({
        localAddr: c.LocalAddress,
        localPort: c.LocalPort,
        remoteAddr: c.RemoteAddress,
        remotePort: c.RemotePort,
        state: c.State,
        pid: c.OwningProcess
      }));
    } else {
      const { stdout } = await run("ss", ["-tanp"], { maxBuffer: 8e6 });
      return stdout
        .split("\n")
        .filter(Boolean)
        .slice(1)
        .map((l) => l.trim().split(/\s+/))
        .map((c) => ({
          localAddr: c[3],
          localPort: c[4],
          remoteAddr: c[5],
          remotePort: c[6],
          state: c[1],
          pid: c.slice(7).join(" ")
        }));
    }
  } catch {
    return [];
  }
}

export async function systemInfo() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-ComputerInfo | Select-Object WindowsProductName,WindowsVersion,OsHardwareAbstractionLayer | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "{}");
      return {
        osName: parsed.WindowsProductName,
        osVersion: parsed.WindowsVersion,
        architecture: parsed.OsHardwareAbstractionLayer,
        platform: os.platform(),
        hostname: os.hostname(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        uptime: os.uptime()
      };
    } else {
      return {
        osName: os.type(),
        osVersion: os.release(),
        architecture: os.arch(),
        platform: os.platform(),
        hostname: os.hostname(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        uptime: os.uptime()
      };
    }
  } catch {
    return {
      platform: os.platform(),
      hostname: os.hostname(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      uptime: os.uptime()
    };
  }
}

export async function allServices() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-Service | Select-Object Name,Status,DisplayName | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((s) => ({
        name: s.Name,
        status: s.Status,
        displayName: s.DisplayName
      }));
    } else {
      const { stdout } = await run("systemctl", ["list-units", "--type=service", "--no-pager"]);
      return stdout
        .split("\n")
        .filter(l => l.includes("service"))
        .map((l) => {
          const parts = l.trim().split(/\s+/);
          return { name: parts[0], status: parts[1] || "unknown", displayName: parts[0] };
        });
    }
  } catch {
    return [];
  }
}

export async function runningServices() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-Service | Where-Object Status -eq 'Running' | Select-Object Name,DisplayName | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((s) => ({
        name: s.Name,
        displayName: s.DisplayName
      }));
    } else {
      const { stdout } = await run("systemctl", ["list-units", "--type=service", "--state=running", "--no-pager"]);
      return stdout
        .split("\n")
        .filter(l => l.includes("service") && l.includes("running"))
        .map((l) => {
          const parts = l.trim().split(/\s+/);
          return { name: parts[0], displayName: parts[0] };
        });
    }
  } catch {
    return [];
  }
}

export async function installedSoftware() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-ItemProperty 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' | Select-Object DisplayName,DisplayVersion,InstallDate | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).filter(s => s.DisplayName).map((s) => ({
        name: s.DisplayName,
        version: s.DisplayVersion,
        installDate: s.InstallDate
      }));
    } else {
      // For Linux/macOS, try to get installed packages
      const packages = [];
      try {
        const { stdout } = await run("dpkg", ["-l"]);
        packages.push(...stdout.split("\n").filter(Boolean).map(line => {
          const parts = line.split(/\s+/);
          return { name: parts[1], version: parts[2], installDate: "unknown" };
        }));
      } catch {}
      try {
        const { stdout } = await run("rpm", ["-qa"]);
        packages.push(...stdout.split("\n").filter(Boolean).map(line => {
          const parts = line.split("-");
          return { name: parts[0], version: parts.slice(1).join("-"), installDate: "unknown" };
        }));
      } catch {}
      return packages.slice(0, 50);
    }
  } catch {
    return [];
  }
}

export async function openPorts() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "[]");
      return (Array.isArray(parsed) ? parsed : [parsed]).map((p) => ({
        address: p.LocalAddress,
        port: p.LocalPort,
        pid: p.OwningProcess
      }));
    } else {
      const { stdout } = await run("ss", ["-tlnp"], { maxBuffer: 4e6 });
      return stdout
        .split("\n")
        .filter(Boolean)
        .slice(1)
        .map((l) => l.trim().split(/\s+/))
        .map((c) => ({
          address: c[3],
          port: c[4],
          pid: c.slice(6).split("=")[1]
        }));
    }
  } catch {
    return [];
  }
}

export async function systemHardware() {
  try {
    if (isWin) {
      const { stdout } = await run("powershell", [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model,NumberOfProcessors,TotalPhysicalMemory | ConvertTo-Json -Compress"
      ]);
      const parsed = JSON.parse(stdout || "{}");
      return {
        manufacturer: parsed.Manufacturer,
        model: parsed.Model,
        processors: parsed.NumberOfProcessors,
        memory: parsed.TotalPhysicalMemory
      };
    } else {
      const { stdout } = await run("dmidecode", ["-t", "system", "-m", "processor", "-m", "memory"], { maxBuffer: 4e6 });
      return {
        manufacturer: "Unknown",
        model: os.cpus()[0]?.model || "Unknown",
        processors: os.cpus().length,
        memory: os.totalmem()
      };
    }
  } catch {
    return {
      manufacturer: "Unknown",
      model: os.cpus()[0]?.model || "Unknown",
      processors: os.cpus().length,
      memory: os.totalmem()
    };
  }
}
