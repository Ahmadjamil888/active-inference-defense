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
