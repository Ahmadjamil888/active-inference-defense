import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import * as E from "./engine.js";
import * as S from "./sensors.js";
import { HOME } from "./store.js";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DASH = path.join(DIR, "..", "public", "dashboard.html");
const EICAR = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

function json(res, code, body) {
  res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

function body(req) {
  return new Promise((resolve) => {
    let s = "";
    req.on("data", (c) => {
      s += c;
      if (s.length > 1e5) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(s || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

export function serve(port, token) {
  const clients = new Set();
  E.onEvent((type, payload) => {
    const line = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const c of clients) c.write(line);
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;
    if (p === "/" || p === "/index.html") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(fs.readFileSync(DASH, "utf8").replace("__AISS_TOKEN__", token));
    }
    if (!p.startsWith("/api/")) return json(res, 404, { error: "not found" });
    const auth = req.headers["x-aiss-token"] || url.searchParams.get("t");
    if (auth !== token) return json(res, 401, { error: "unauthorized" });

    try {
      if (p === "/api/stream") {
        res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
        res.write(": ok\n\n");
        clients.add(res);
        req.on("close", () => clients.delete(res));
        return;
      }
      if (p === "/api/state") return json(res, 200, E.state());
      if (p === "/api/processes") return json(res, 200, await S.processes());
      if (p === "/api/network") {
        const [conns, listen] = await Promise.all([S.connections(), S.listening()]);
        return json(res, 200, { conns, listen, exposed: listen.filter((l) => l.addr === "0.0.0.0" || l.addr === "::" || l.addr === "*") });
      }
      if (p === "/api/volumes") return json(res, 200, await S.volumes());
      if (p === "/api/disks") return json(res, 200, await S.disks());
      
      // Enhanced network APIs
      if (p === "/api/wifi") return json(res, 200, await S.wifiNetworks());
      if (p === "/api/network-devices") return json(res, 200, await S.networkDevices());
      if (p === "/api/network-logs") return json(res, 200, await S.networkLogs());
      if (p === "/api/recent-files") return json(res, 200, await S.recentFiles(100));
      if (p === "/api/system-logs") return json(res, 200, await S.systemLogs());
      
      // Enhanced system APIs
      if (p === "/api/all-processes") return json(res, 200, await S.allProcesses());
      if (p === "/api/all-connections") return json(res, 200, await S.allConnections());
      if (p === "/api/system-info") return json(res, 200, await S.systemInfo());
      if (p === "/api/all-services") return json(res, 200, await S.allServices());
      if (p === "/api/running-services") return json(res, 200, await S.runningServices());
      if (p === "/api/installed-software") return json(res, 200, await S.installedSoftware());
      if (p === "/api/open-ports") return json(res, 200, await S.openPorts());
      if (p === "/api/hardware") return json(res, 200, await S.systemHardware());
      
      // Export APIs
      if (p === "/api/export") {
        const d = E.state();
        const exportData = {
          system: await S.systemInfo(),
          hardware: await S.systemHardware(),
          processes: await S.allProcesses(),
          connections: await S.allConnections(),
          services: await S.allServices(),
          wifi: await S.wifiNetworks(),
          devices: await S.networkDevices(),
          files: await S.recentFiles(200),
          logs: await S.systemLogs(),
          threats: d.threats,
          incidents: d.incidents,
          scans: d.scans,
          metrics: d.metrics,
          exportedAt: new Date().toISOString()
        };
        res.setHeader("content-type", "application/json");
        res.setHeader("content-disposition", `attachment; filename="aiss-export-${Date.now()}.json"`);
        return res.end(JSON.stringify(exportData, null, 2));
      }
      
      // Attack simulation APIs
      if (p === "/api/simulate/attack" && req.method === "POST") {
        const b = await body(req);
        const attackType = b.type;
        const results = await simulateAttack(attackType, b.params);
        E.log("warn", "simulation", `Attack simulation: ${attackType}`, { results });
        return json(res, 200, results);
      }
      
      // Alerts API
      if (p === "/api/alerts") {
        const state = E.state();
        const alerts = (state.events || [])
          .filter((e) => e.level === "warn" || e.level === "critical" || e.level === "error")
          .map((e) => ({
            id: e.id,
            level: e.level,
            title: e.kind,
            message: e.message,
            at: e.at,
            status: "open",
          }));
        return json(res, 200, alerts);
      }
      if (p.startsWith("/api/alerts/") && req.method === "PATCH") {
        const id = p.split("/").pop();
        const b = await body(req);
        // Log the alert action
        E.log("info", "alert", `Alert ${id.slice(0, 8)} marked ${b.status}`, null);
        return json(res, 200, { ok: true });
      }

      // Incidents API
      if (p === "/api/incidents") {
        const state = E.state();
        const threats = state.threats || [];
        const incidents = threats.slice(0, 10).map((t) => ({
          id: t.id,
          status: t.status === "quarantined" ? "active" : "closed",
          stage: "contain",
          at: t.at,
          timeline: [{ stage: "detect", at: t.at }],
        }));
        return json(res, 200, incidents);
      }
      if (p.startsWith("/api/incidents/") && req.method === "PATCH") {
        const id = p.split("/").pop();
        const b = await body(req);
        E.log("info", "incident", `Incident ${id.slice(0, 8)} ${b.action}`, null);
        return json(res, 200, { ok: true });
      }

      // Assets API
      if (p === "/api/assets") {
        const state = E.state();
        const host = state.host;
        return json(res, 200, [
          {
            id: "this-machine",
            type: "machine",
            name: host?.hostname || "This Machine",
            status: "monitored",
            ip: host?.nets?.[0]?.address || null,
            lastSeen: new Date().toISOString(),
          },
        ]);
      }
      if (p.startsWith("/api/assets/") && req.method === "PATCH") {
        const id = p.split("/").pop();
        const b = await body(req);
        E.log("info", "asset", `Asset ${id.slice(0, 8)} ${b.status ? `marked ${b.status}` : "removed"}`, null);
        return json(res, 200, { ok: true });
      }

      // Settings API
      if (p === "/api/settings") {
        const state = E.state();
        return json(res, 200, state.settings || {});
      }
      if (p === "/api/settings" && req.method === "PATCH") {
        const b = await body(req);
        const state = E.state();
        Object.assign(state.settings, b);
        E.log("info", "settings", "Settings updated", null);
        return json(res, 200, state.settings);
      }

      // Threat actions API
      if (p.startsWith("/api/threats/") && req.method === "PATCH") {
        const id = p.split("/").pop();
        const b = await body(req);
        E.log("info", "threat", `Threat ${id.slice(0, 8)} action: ${b.action}`, null);
        return json(res, 200, { ok: true });
      }

      // Health API
      if (p === "/api/health") {
        const health = E.getHealthStatus();
        const state = E.state();
        return json(res, 200, {
          ...health,
          running: state.running,
          uptime: state.settings?.startedAt ? Math.floor((Date.now() - new Date(state.settings.startedAt).getTime()) / 1000) : 0,
        });
      }
      if (p.startsWith("/api/health/") && req.method === "POST") {
        const service = p.split("/").pop();
        E.performHealthCheck(service);
        return json(res, 200, { ok: true });
      }

      if (p === "/api/scan" && req.method === "POST") {
        const b = await body(req);
        const target = typeof b.path === "string" && b.path ? b.path : path.join(os.homedir(), "Downloads");
        if (!fs.existsSync(target)) return json(res, 400, { error: `Path not found: ${target}` });
        const scan = await E.runScan(target, Math.min(Number(b.limit) || 4000, 20000), "manual");
        return json(res, 200, scan);
      }
      if (p === "/api/test-usb" && req.method === "POST") {
        // Builds a real test volume folder with EICAR + malicious-pattern scripts, then scans it.
        const dir = path.join(HOME, "test-usb", `USB-${Date.now()}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "eicar.com"), EICAR);
        fs.writeFileSync(path.join(dir, "autorun.inf"), "[autorun]\nopen=setup.exe\nicon=setup.exe\n");
        fs.writeFileSync(path.join(dir, "invoice.pdf.cmd"), "@echo off\nrem harmless test sample\n");
        fs.writeFileSync(path.join(dir, "update.ps1"), "# test sample\npowershell -enc " + "QQB".repeat(30) + "\n");
        fs.writeFileSync(path.join(dir, "README.txt"), "Your files have been encrypted. Send 1 bitcoin to decrypt. (AISS test sample)\n");
        fs.writeFileSync(path.join(dir, "photo.txt"), "clean file\n");
        E.log("warn", "sensor", `Test USB mounted at ${dir}`, null);
        const scan = await E.runScan(dir, 100, "usb-test");
        return json(res, 200, scan);
      }
      return json(res, 404, { error: "unknown endpoint" });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  });
  server.listen(port, "127.0.0.1");
  return server;
}
