// Active-inference engine: keeps beliefs about normal host behaviour,
// measures surprise against them and acts when surprise is sustained.
import path from "node:path";
import fs from "node:fs";
import * as S from "./sensors.js";
import { scanPath, inspect, quarantine } from "./scanner.js";
import { push, data, setSetting, HOME } from "./store.js";
import { analyze } from "./ai.js";

const QUARANTINE = path.join(HOME, "quarantine");

const belief = {
  cpu: { mu: 15, sigma: 12 },
  mem: { mu: 50, sigma: 15 },
  procs: { mu: 150, sigma: 30 },
  conns: { mu: 40, sigma: 20 },
};

const LR = 0.08;

function surprise(key, x) {
  const b = belief[key];
  const z = Math.abs(x - b.mu) / Math.max(b.sigma, 1);
  // Free-energy style surprise: squared prediction error over variance.
  return { z, bits: 0.5 * z * z };
}

function learn(key, x) {
  const b = belief[key];
  b.mu += LR * (x - b.mu);
  b.sigma = Math.max(3, b.sigma + LR * (Math.abs(x - b.mu) - b.sigma));
}

let knownVolumes = new Set();
let listeners = [];
let running = false;
let ticks = 0;

export function onEvent(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function emit(type, payload) {
  for (const l of listeners) {
    try {
      l(type, payload);
    } catch {
      /* listener gone */
    }
  }
}

export function log(level, source, message, meta) {
  const row = push("events", { level, source, message, meta: meta ?? null });
  emit("event", row);
  return row;
}

export async function recordThreat(t) {
  const row = push("threats", { status: "contained", ...t });
  emit("threat", row);
  log(t.severity === "critical" ? "critical" : "warn", "response", `${t.name} — ${t.action}`, { file: t.file });
  const verdict = await analyze(row).catch(() => null);
  if (verdict) {
    row.ai = verdict;
    emit("threat", row);
    log("info", "ai", `AI analysis complete for ${t.name}`, null);
  }
  return row;
}

async function tick() {
  ticks++;
  const cpu = S.cpuUsage();
  const mem = S.memory();
  const [procs, conns, vols, dsk] = await Promise.all([S.processes(), S.connections(), S.volumes(), S.disks()]);

  const metric = {
    cpu: Number(cpu.toFixed(1)),
    mem: Number(mem.pct.toFixed(1)),
    procs: procs.length,
    conns: conns.length,
  };
  const sCpu = surprise("cpu", metric.cpu);
  const sConn = surprise("conns", metric.conns);
  const totalBits = Number((sCpu.bits + sConn.bits).toFixed(2));
  const row = push("metrics", { ...metric, surprise: totalBits });
  emit("metric", { ...row, belief, disks: dsk, host: S.host() });

  learn("cpu", metric.cpu);
  learn("mem", metric.mem);
  learn("procs", metric.procs);
  learn("conns", metric.conns);

  if (ticks > 6 && sCpu.z > 4) {
    const top = procs[0];
    log("warn", "inference", `Surprising CPU load ${metric.cpu}% (z=${sCpu.z.toFixed(1)}), top process ${top?.name ?? "?"}`, null);
  }
  if (ticks > 6 && sConn.z > 4) {
    log("warn", "inference", `Unusual number of network connections (${metric.conns}, z=${sConn.z.toFixed(1)})`, null);
  }

  // Removable media: scan newly appeared volumes for real.
  for (const v of vols) {
    if (!v.removable || knownVolumes.has(v.mount)) continue;
    knownVolumes.add(v.mount);
    if (ticks < 2) continue;
    log("info", "sensor", `Removable volume mounted: ${v.mount}`, null);
    await runScan(v.mount, 3000, "usb");
  }
  for (const m of [...knownVolumes]) if (!vols.some((v) => v.mount === m)) knownVolumes.delete(m);
}

export async function runScan(root, limit = 4000, kind = "manual") {
  log("info", "scanner", `Scan started: ${root}`, null);
  const result = scanPath(root, limit);
  let contained = 0;
  for (const f of result.findings) {
    let action = "flagged";
    try {
      if (f.severity === "critical" || f.severity === "high") {
        const dest = quarantine(f.file, QUARANTINE);
        action = `quarantined → ${dest}`;
        contained++;
      }
    } catch (e) {
      action = `quarantine failed: ${e.message}`;
    }
    await recordThreat({ name: f.name, rule: f.rule, severity: f.severity, file: f.file, hash: f.hash, action, source: kind });
  }
  const scan = push("scans", {
    root,
    kind,
    files: result.findings.length ? result.files : result.files,
    findings: result.findings.length,
    contained,
    ms: result.ms,
  });
  emit("scan", scan);
  log(result.findings.length ? "warn" : "info", "scanner", `Scan finished: ${result.files} files, ${result.findings.length} findings`, null);
  return scan;
}

export function checkFile(file) {
  return inspect(file);
}

export function state() {
  const d = data();
  return {
    host: S.host(),
    belief,
    running,
    counts: { threats: d.threats.length, scans: d.scans.length, events: d.events.length },
    metrics: d.metrics.slice(-120),
    threats: d.threats.slice(-100).reverse(),
    scans: d.scans.slice(-50).reverse(),
    events: d.events.slice(-200).reverse(),
    settings: d.settings,
  };
}

export function start() {
  if (running) return;
  running = true;
  setSetting("startedAt", new Date().toISOString());
  log("info", "engine", "Active-inference engine online", null);
  const loop = async () => {
    try {
      await tick();
    } catch (e) {
      log("error", "engine", `Sensor cycle failed: ${e.message}`, null);
    }
  };
  loop();
  const timer = setInterval(loop, 4000);
  // Baseline scan of the user profile (bounded) once at start.
  setTimeout(() => {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home && fs.existsSync(home)) runScan(path.join(home, "Downloads"), 1500, "baseline").catch(() => {});
  }, 3000);
  return () => clearInterval(timer);
}
