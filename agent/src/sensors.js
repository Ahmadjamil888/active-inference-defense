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
