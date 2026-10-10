#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { load, HOME, save } from "../src/store.js";

const PORT = Number(process.env.AISS_PORT || 8179);
const PID = path.join(HOME, "aiss.pid");
const TOKEN_FILE = path.join(HOME, "token");
const LOG = path.join(HOME, "aiss.log");
const cmd = process.argv[2] || "start";

const c = (n) => (s) => `\x1b[${n}m${s}\x1b[0m`;
const cyan = c(36), green = c(32), dim = c(2), red = c(31), bold = c(1);

function banner() {
  const art = [
    "     _    ___ ____ ____  ",
    "    / \\  |_ _/ ___/ ___| ",
    "   / _ \\  | |\\___ \\___ \\ ",
    "  / ___ \\ | | ___) |__) |",
    " /_/   \\_\\___|____/____/ ",
  ];
  console.log("");
  art.forEach((l) => console.log(cyan(l)));
  console.log(dim("  Agentic AI Security System · v1.0.0\n"));
}

function token() {
  fs.mkdirSync(HOME, { recursive: true });
  if (!fs.existsSync(TOKEN_FILE)) fs.writeFileSync(TOKEN_FILE, crypto.randomBytes(24).toString("hex"), { mode: 0o600 });
  return fs.readFileSync(TOKEN_FILE, "utf8").trim();
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function runningPid() {
  try {
    const pid = Number(fs.readFileSync(PID, "utf8"));
    return pid && alive(pid) ? pid : null;
  } catch {
    return null;
  }
}

function openBrowser(url) {
  const p = process.platform;
  const args = p === "win32" ? ["cmd", ["/c", "start", "", url]] : p === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  try {
    spawn(args[0], args[1], { detached: true, stdio: "ignore" }).unref();
  } catch {
    /* no browser */
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function step(label, fn) {
  process.stdout.write(`  ${dim("[....]")} ${label}`);
  const out = await fn();
  process.stdout.write(`\r  [${green(" OK ")}] ${label}\n`);
  return out;
}

async function daemon() {
  load();
  const { serve } = await import("../src/server.js");
  const E = await import("../src/engine.js");
  fs.writeFileSync(PID, String(process.pid));
  serve(PORT, token());
  E.start();
  const bye = () => {
    save();
    try { fs.unlinkSync(PID); } catch {}
    process.exit(0);
  };
  process.on("SIGINT", bye);
  process.on("SIGTERM", bye);
}

async function start(foreground) {
  banner();
  const url = `http://127.0.0.1:${PORT}/`;
  if (runningPid()) {
    console.log(green(`  AISS already running → ${url}\n`));
    openBrowser(url);
    return;
  }
  await step("Loading active-inference kernel", () => sleep(300));
  await step("Generating local access token", () => token());
  if (foreground) {
    await step("Starting sensors & engine", () => daemon());
  } else {
    await step("Starting background engine", async () => {
      const out = fs.openSync(LOG, "a");
      spawn(process.execPath, [new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "__daemon"], {
        detached: true,
        stdio: ["ignore", out, out],
        windowsHide: true,
      }).unref();
      for (let i = 0; i < 40; i++) {
        await sleep(150);
        if (runningPid()) return;
      }
      throw new Error("engine failed to start — see " + LOG);
    });
  }
  await step(`Serving live dashboard on ${url}`, async () => {
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch(url);
        if (r.ok) return;
      } catch {}
      await sleep(200);
    }
  });
  openBrowser(url);
  console.log(`\n  ${green("●")} ${bold("AISS is monitoring this computer.")}`);
  console.log(dim(`    Dashboard: ${url}`));
  console.log(dim("    Stop with: aiss stop    Status: aiss status\n"));
}

switch (cmd) {
  case "__daemon":
    await daemon();
    break;
  case "start":
  case "run":
    await start(process.argv.includes("--foreground"));
    break;
  case "stop": {
    const pid = runningPid();
    if (pid) {
      process.kill(pid);
      console.log(green("  AISS stopped."));
    } else console.log(dim("  AISS is not running."));
    break;
  }
  case "status": {
    const pid = runningPid();
    console.log(pid ? green(`  ● running (pid ${pid}) → http://127.0.0.1:${PORT}/`) : red("  ○ stopped"));
    break;
  }
  case "open":
    openBrowser(`http://127.0.0.1:${PORT}/`);
    break;
  case "logs":
    try {
      console.log(fs.readFileSync(LOG, "utf8").split("\n").slice(-60).join("\n"));
    } catch {
      console.log(dim("  No logs yet."));
    }
    break;
  default:
    banner();
    console.log("  Usage: aiss [start|stop|status|open|logs]\n");
}
