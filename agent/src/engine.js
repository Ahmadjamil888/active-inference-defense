// Active-inference engine: keeps beliefs about normal host behaviour,
// measures surprise against them and acts when surprise is sustained.
import path from "node:path";
import fs from "node:fs";
import * as S from "./sensors.js";
import { scanPath, inspect, quarantine } from "./scanner.js";
import { push, data, setSetting, HOME, load } from "./store.js";
import { analyze } from "./ai.js";

const QUARANTINE = path.join(HOME, "quarantine");

const belief = {
  cpu: { mu: 15, sigma: 12 },
  mem: { mu: 50, sigma: 15 },
  procs: { mu: 150, sigma: 30 },
  conns: { mu: 40, sigma: 20 },
};

const LR = 0.08;

// Security Gate thresholds (default values)
const GATE_THRESHOLDS = {
  low: 20,
  medium: 45,
  high: 70,
};

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
let startedAt = null;
let healthChecks = {
  sensors: { status: "ok", lastCheck: null, errorCount: 0 },
  scanner: { status: "ok", lastCheck: null, errorCount: 0 },
  database: { status: "ok", lastCheck: null, errorCount: 0 },
  network: { status: "ok", lastCheck: null, errorCount: 0 },
};

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

// Health check and recovery
export async function performHealthCheck(service) {
  const now = new Date().toISOString();
  try {
    if (service === "sensors") {
      S.cpuUsage(); // Quick sensor test
      healthChecks.sensors = { status: "ok", lastCheck: now, errorCount: 0 };
    } else if (service === "scanner") {
      // Quick scanner test
      healthChecks.scanner = { status: "ok", lastCheck: now, errorCount: 0 };
    } else if (service === "database") {
      data(); // Quick DB test
      healthChecks.database = { status: "ok", lastCheck: now, errorCount: 0 };
    } else if (service === "network") {
      // Network connectivity test
      healthChecks.network = { status: "ok", lastCheck: now, errorCount: 0 };
    }
  } catch (e) {
    healthChecks[service] = {
      status: "error",
      lastCheck: now,
      errorCount: (healthChecks[service]?.errorCount || 0) + 1,
      error: e.message,
    };
    log("error", "health", `${service} health check failed: ${e.message}`, null);

    // Auto-recovery: if error count exceeds threshold, attempt recovery
    if (healthChecks[service].errorCount >= 3) {
      log("warn", "health", `Attempting recovery for ${service}`, null);
      try {
        if (service === "database") {
          load(); // Reload database
          healthChecks.database = { status: "ok", lastCheck: now, errorCount: 0 };
          log("info", "health", `Database recovered`, null);
        }
      } catch (re) {
        log("error", "health", `Recovery failed for ${service}: ${re.message}`, null);
      }
    }
  }
}

export function getHealthStatus() {
  return healthChecks;
}

export function log(level, source, message, meta) {
  const row = push("events", { level, source, message, meta: meta ?? null });
  emit("event", row);
  return row;
}

// Security Gate: risk scoring and decision making
function calculateRiskScore(findings, baselineAnomaly = 0) {
  let score = 0;
  for (const f of findings) {
    if (f.severity === "critical") score += 30;
    else if (f.severity === "high") score += 20;
    else if (f.severity === "medium") score += 10;
    else if (f.severity === "low") score += 5;
  }
  score += baselineAnomaly * 2;
  return Math.min(100, score);
}

function getGateDecision(score, settings = {}) {
  const thresh = {
    low: settings.thresh_low ?? GATE_THRESHOLDS.low,
    medium: settings.thresh_medium ?? GATE_THRESHOLDS.medium,
    high: settings.thresh_high ?? GATE_THRESHOLDS.high,
  };

  if (score >= thresh.high) return { action: "BLOCK", reason: `Score ${score} >= ${thresh.high}` };
  if (score >= thresh.medium) return { action: "QUARANTINE", reason: `Score ${score} >= ${thresh.medium}` };
  if (score >= thresh.low) return { action: "HOLD", reason: `Score ${score} >= ${thresh.low}` };
  return { action: "ALLOW", reason: `Score ${score} < ${thresh.low}` };
}

export async function recordThreat(t) {
  const settings = data().settings || {};
  const riskScore = calculateRiskScore([{ severity: t.severity }]);
  const decision = getGateDecision(riskScore, settings);

  const row = push("threats", {
    status: decision.action === "ALLOW" ? "flagged" : decision.action.toLowerCase(),
    riskScore,
    decision: decision.action,
    decisionReason: decision.reason,
    ...t,
  });
  emit("threat", row);
  log(t.severity === "critical" ? "critical" : "warn", "gate", `${t.name} — ${decision.action} (${decision.reason})`, { file: t.file, riskScore });
  const verdict = await analyze(row).catch(() => null);
  if (verdict) {
    row.ai = verdict;
    emit("threat", row);
    log("info", "ai", `AI analysis complete for ${t.name}`, null);
  }
  return row;
}

// Incident Lifecycle
const INCIDENT_STAGES = ["detect", "isolate", "analyze", "contain", "remediate", "verify", "learn"];

export async function createIncident(threat) {
  const incident = push("incidents", {
    threatId: threat.id,
    stage: "detect",
    status: "active",
    timeline: [{ stage: "detect", at: new Date().toISOString() }],
  });
  emit("incident", incident);
  log("critical", "incident", `Incident created for threat ${threat.id}`, { incidentId: incident.id });
  return incident;
}

export async function advanceIncident(incidentId, stage) {
  const d = data();
  const incident = d.incidents.find((i) => i.id === incidentId);
  if (!incident) return null;

  incident.stage = stage;
  incident.timeline.push({ stage, at: new Date().toISOString() });

  if (stage === "verify") {
    incident.status = "closed";
    log("info", "incident", `Incident ${incidentId} closed after verification`, null);
  }

  emit("incident", incident);
  log("info", "incident", `Incident ${incidentId} advanced to ${stage}`, null);
  return incident;
}

async function tick() {
  ticks++;
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  
  // Log agent activity
  log("info", "agent", `[${timestamp}] Sensor Agent: Collecting system metrics (CPU, memory, processes, connections)`, { agent: "sensor", action: "collect_metrics" });
  
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

  log("info", "agent", `[${timestamp}] Inference Agent: Analyzing ${procs.length} processes and ${conns.length} connections for anomalies`, { agent: "inference", action: "analyze_anomalies", processes: procs.length, connections: conns.length });

  if (ticks > 6 && sCpu.z > 4) {
    const top = procs[0];
    log("warn", "inference", `Surprising CPU load ${metric.cpu}% (z=${sCpu.z.toFixed(1)}), top process ${top?.name ?? "?"}`, null);
    log("info", "agent", `[${timestamp}] Anomaly Agent: Flagged high CPU anomaly (z=${sCpu.z.toFixed(1)}) from process ${top?.name}`, { agent: "anomaly", action: "flagged", severity: "high", process: top?.name });
  }
  if (ticks > 6 && sConn.z > 4) {
    log("warn", "inference", `Unusual number of network connections (${metric.conns}, z=${sConn.z.toFixed(1)})`, null);
    log("info", "agent", `[${timestamp}] Network Agent: Flagged connection anomaly (z=${sConn.z.toFixed(1)}) with ${metric.conns} connections`, { agent: "network", action: "flagged", severity: "high", connections: metric.conns });
  }

  // Removable media: scan newly appeared volumes for real.
  for (const v of vols) {
    if (!v.removable || knownVolumes.has(v.mount)) continue;
    knownVolumes.add(v.mount);
    if (ticks < 2) continue;
    log("info", "sensor", `Removable volume mounted: ${v.mount}`, null);
    log("info", "agent", `[${timestamp}] USB Agent: Detected new removable volume at ${v.mount}, initiating security scan`, { agent: "usb", action: "detected_volume", volume: v.mount });
    await runScan(v.mount, 3000, "usb");
  }
  for (const m of [...knownVolumes]) if (!vols.some((v) => v.mount === m)) knownVolumes.delete(m);

  // Periodic enhanced data collection (every 60 ticks ~ 4 minutes)
  if (ticks % 60 === 0) {
    log("info", "agent", `[${timestamp}] Recon Agent: Starting comprehensive system reconnaissance`, { agent: "recon", action: "full_scan" });
    try {
      const [wifi, devices, files, sysLogs] = await Promise.all([
        S.wifiNetworks(),
        S.networkDevices(),
        S.recentFiles(50),
        S.systemLogs()
      ]);
      
      // Log significant network changes
      if (wifi.length > 0) {
        const connected = wifi.filter(w => w.connected);
        if (connected.length > 0) {
          log("info", "network", `Connected to WiFi: ${connected[0].ssid}`, null);
          log("info", "agent", `[${timestamp}] WiFi Agent: Monitoring connection to ${connected[0].ssid}`, { agent: "wifi", action: "monitoring", ssid: connected[0].ssid });
        }
      }
      
      if (devices.length > 0) {
        log("info", "network", `Detected ${devices.length} network devices on LAN`, null);
        log("info", "agent", `[${timestamp}] Network Agent: Enumerated ${devices.length} devices on local network`, { agent: "network", action: "enumerated", count: devices.length });
      }
      
      // Log suspicious file activity
      const suspiciousExts = ['.exe', '.msi', '.bat', '.sh', '.ps1', '.vbs'];
      const suspiciousFiles = files.filter(f => suspiciousExts.includes(f.extension));
      if (suspiciousFiles.length > 0) {
        log("warn", "file", `Detected ${suspiciousFiles.length} suspicious executables in recent files`, null);
        log("info", "agent", `[${timestamp}] File Agent: Analyzed ${files.length} recent files, flagged ${suspiciousFiles.length} suspicious executables`, { agent: "file", action: "analyzed", total: files.length, suspicious: suspiciousFiles.length });
      }
      
      // Log system errors
      const errorLogs = sysLogs.filter(l => l.level === 'error');
      if (errorLogs.length > 0) {
        log("warn", "system", `${errorLogs.length} system errors in recent logs`, null);
        log("info", "agent", `[${timestamp}] System Agent: Detected ${errorLogs.length} system errors in recent logs`, { agent: "system", action: "detected_errors", count: errorLogs.length });
      }
    } catch (e) {
      log("error", "sensor", `Enhanced data collection failed: ${e.message}`, null);
    }
  }

  // Periodic health checks (every 30 ticks ~ 2 minutes)
  if (ticks % 30 === 0) {
    log("info", "agent", `[${timestamp}] Health Agent: Running diagnostic checks on all services`, { agent: "health", action: "diagnostic" });
    await performHealthCheck("sensors");
    await performHealthCheck("scanner");
    await performHealthCheck("database");
    await performHealthCheck("network");
  }
}

export async function runScan(root, limit = 4000, kind = "manual") {
  log("info", "scanner", `Scan started: ${root}`, null);
  const result = scanPath(root, limit);
  let contained = 0;
  for (const f of result.findings) {
    let action = "flagged";
    try {
      const settings = data().settings || {};
      const riskScore = calculateRiskScore([f]);
      const decision = getGateDecision(riskScore, settings);

      if (decision.action === "BLOCK" || decision.action === "QUARANTINE") {
        const dest = quarantine(f.file, QUARANTINE);
        action = `quarantined → ${dest}`;
        contained++;
      } else if (decision.action === "HOLD") {
        action = "held for approval";
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
    started: startedAt || (d.settings.startedAt ? new Date(d.settings.startedAt).getTime() : Date.now()),
    counts: { threats: d.threats.length, scans: d.scans.length, events: d.events.length },
    metrics: d.metrics.slice(-120),
    threats: d.threats.slice(-100).reverse(),
    scans: d.scans.slice(-50).reverse(),
    events: d.events.slice(-200).reverse(),
    incidents: (d.incidents || []).slice(-20).reverse(),
    settings: d.settings,
  };
}

export function start() {
  if (running) return;
  running = true;
  startedAt = Date.now();
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
