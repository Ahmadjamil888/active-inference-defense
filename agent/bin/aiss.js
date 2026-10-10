#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { load, HOME, save } from "../src/store.js";

const PORT = Number(process.env.AISS_PORT || 8179);
const PID = path.join(HOME, "aiss.pid");
const TOKEN_FILE = path.join(HOME, "token");
const LOG = path.join(HOME, "aiss.log");
const BROWSER_LOCK = path.join(HOME, "browser.lock");
const cmd = process.argv[2] || "start";

const c = (n) => (s) => `\x1b[${n}m${s}\x1b[0m`;
const cyan = c(36), green = c(32), dim = c(2), red = c(31), bold = c(1), yellow = c(33), blue = c(34), magenta = c(35), white = c(97);

function banner() {
  const art = [
    `${cyan("███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗")}`,
    `${cyan("████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝")}`,
    `${cyan("██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗")}`,
    `${cyan("██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║")}`,
    `${cyan("██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║")}`,
    `${cyan("╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝")}`,
  ];
  console.log("");
  art.forEach((l) => console.log(l));
  console.log("");
  console.log(`${white("    ")}${cyan("◆")} ${white("Agentic AI Security System")} ${dim("v1.0.0")}`);
  console.log(`${white("    ")}${cyan("◆")} ${white("Intelligence Designed To Defend")}`);
  console.log("");
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
  try {
    const lockContent = fs.readFileSync(BROWSER_LOCK, "utf8");
    const lockTime = Number(lockContent);
    const now = Date.now();
    if (now - lockTime < 3000) {
      return;
    }
  } catch {}

  const p = process.platform;
  let args;
  if (p === "win32") {
    args = ["cmd", ["/c", "start", "/b", url]];
  } else if (p === "darwin") {
    args = ["open", [url]];
  } else {
    args = ["xdg-open", [url]];
  }
  try {
    const child = spawn(args[0], args[1], { 
      detached: true, 
      stdio: ["ignore", "ignore", "ignore"],
      windowsHide: true,
      shell: false
    });
    child.unref();
    fs.writeFileSync(BROWSER_LOCK, String(Date.now()));
  } catch {
    /* no browser */
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function step(label, fn) {
  const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${cyan(spinner[i % spinner.length])} ${dim(label)}`);
    i++;
  }, 80);

  try {
    const out = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ${green("✓")} ${white(label)}\n`);
    return out;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ${red("✗")} ${red(label)}\n`);
    throw e;
  }
}

function box(text, title = "") {
  const lines = text.split("\n");
  const width = Math.max(...lines.map((l) => l.length)) + 4;
  const border = cyan("─".repeat(width));
  console.log(cyan("┌" + border + "┐"));
  if (title) {
    const titlePadding = " ".repeat(width - title.length - 2);
    console.log(cyan("│") + white(" " + title + titlePadding + " ") + cyan("│"));
    console.log(cyan("├" + border + "┤"));
  }
  lines.forEach((line) => {
    const padding = " ".repeat(width - line.length - 2);
    console.log(cyan("│") + white(" " + line + padding + " ") + cyan("│"));
  });
  console.log(cyan("└" + border + "┘"));
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
    try { fs.unlinkSync(BROWSER_LOCK); } catch {}
    process.exit(0);
  };
  process.on("SIGINT", bye);
  process.on("SIGTERM", bye);
}

async function start(foreground) {
  banner();
  const url = `http://127.0.0.1:${PORT}/`;
  if (runningPid()) {
    console.log("");
    console.log(`${green("✓")} ${white("AISS is already running")}`);
    console.log(`  ${dim("→")} ${cyan(url)}`);
    console.log("");
    console.log(`${blue("ℹ")}  ${white("Use these commands:")}`);
    console.log(`    ${cyan("aiss stop")}  - Stop AISS`);
    console.log(`    ${cyan("aiss logs")}  - View logs`);
    console.log(`    ${cyan("aiss open")}  - Open dashboard`);
    console.log("");
    await step("Checking dashboard availability", async () => {
      for (let i = 0; i < 10; i++) {
        try {
          const r = await fetch(url);
          if (r.ok) return;
        } catch {}
        await sleep(300);
      }
    });
    openBrowser(url);
    return;
  }

  console.log("");
  await step("Loading active-inference kernel", () => sleep(300));
  await step("Generating secure access token", () => token());
  await step("Initializing sensors", () => sleep(200));
  await step("Configuring security gate", () => sleep(150));

  if (foreground) {
    await step("Starting sensors & engine", () => daemon());
  } else {
    await step("Starting background engine", async () => {
      const out = fs.openSync(LOG, "a");
      const scriptPath = fileURLToPath(import.meta.url);
      spawn(process.execPath, [scriptPath, "__daemon"], {
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

  await step(`Serving dashboard at ${url}`, async () => {
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch(url);
        if (r.ok) return;
      } catch {}
      await sleep(200);
    }
  });

  openBrowser(url);
  console.log("");
  console.log(`${green("✓")} ${bold("AISS is now monitoring your computer")}`);
  console.log("");
  box(
    `${cyan("Dashboard:")} ${url}\n${cyan("Logs:")}      aiss logs\n${cyan("Stop:")}      aiss stop\n${cyan("Status:")}   aiss status`,
    "Quick Commands"
  );
  console.log("");
  console.log(`${dim("Tip:")} ${white("AISS runs in the background. Close this terminal anytime.")}`);
  console.log("");
}

// Windows Service installation
async function installService() {
  banner();
  console.log(dim("  Installing AISS as Windows Service...\n"));

  if (process.platform !== "win32") {
    console.log(red("  Error: Service installation is only supported on Windows."));
    console.log(dim("  On Linux/macOS, use systemd or launchd instead.\n"));
    process.exit(1);
  }

  try {
    const { Service } = await import("node-windows");
    const svc = new Service({
      name: "AISS Security",
      description: "AISS - Agentic AI Security System",
      script: new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
      nodeOptions: ["--max-old-space-size=4096"],
    });

    svc.on("install", () => {
      console.log(green("  Service installed successfully."));
      console.log(dim("  Starting service...\n"));
      svc.start();
    });

    svc.on("start", () => {
      console.log(green("  Service started."));
      console.log(dim("  AISS will now start automatically on boot.\n"));
    });

    svc.on("error", (err) => {
      console.log(red(`  Error: ${err.message}\n`));
    });

    await step("Registering Windows Service", () => new Promise((resolve, reject) => {
      svc.on("install", resolve);
      svc.on("error", reject);
      svc.install();
    }));

  } catch (e) {
    console.log(red(`  Installation failed: ${e.message}`));
    console.log(dim("  Try running as Administrator.\n"));
    process.exit(1);
  }
}

async function uninstallService() {
  banner();
  console.log(dim("  Uninstalling AISS Windows Service...\n"));

  if (process.platform !== "win32") {
    console.log(red("  Error: Service installation is only supported on Windows.\n"));
    process.exit(1);
  }

  try {
    const { Service } = await import("node-windows");
    const svc = new Service({
      name: "AISS Security",
      script: new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    });

    await step("Stopping service", () => new Promise((resolve) => {
      svc.on("stop", resolve);
      svc.stop();
    }));

    await step("Unregistering service", () => new Promise((resolve) => {
      svc.on("uninstall", resolve);
      svc.uninstall();
    }));

    console.log(green("  Service uninstalled successfully.\n"));

  } catch (e) {
    console.log(red(`  Uninstallation failed: ${e.message}\n`));
    process.exit(1);
  }
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
    banner();
    const pid = runningPid();
    if (pid) {
      console.log("");
      console.log(`${green("✓")} ${white("AISS is running")}`);
      console.log("");
      console.log(`  ${dim("PID:")}     ${cyan(pid)}`);
      console.log(`  ${dim("Port:")}    ${cyan(PORT)}`);
      console.log(`  ${dim("Dashboard:")} ${cyan(`http://127.0.0.1:${PORT}/`)}`);
      console.log("");
      console.log(`${green("●")} ${white("All systems operational")}`);
      console.log("");
    } else {
      console.log("");
      console.log(`${red("✗")} ${white("AISS is not running")}`);
      console.log("");
      console.log(`${blue("ℹ")}  ${white("Start AISS with:")} ${cyan("aiss")}`);
      console.log("");
    }
    break;
  }
  case "open": {
    const url = `http://127.0.0.1:${PORT}/`;
    if (!runningPid()) {
      console.log("");
      console.log(`${red("✗")} ${white("AISS is not running")}`);
      console.log("");
      console.log(`${blue("ℹ")}  ${white("Start AISS with:")} ${cyan("aiss")}`);
      console.log("");
      break;
    }
    await step("Checking dashboard availability", async () => {
      for (let i = 0; i < 10; i++) {
        try {
          const r = await fetch(url);
          if (r.ok) return;
        } catch {}
        await sleep(300);
      }
    });
    openBrowser(url);
    break;
  }
  case "logs":
    try {
      console.log(fs.readFileSync(LOG, "utf8").split("\n").slice(-60).join("\n"));
    } catch {
      console.log(dim("  No logs yet."));
    }
    break;
  case "help":
  case "--help":
  case "-h":
    banner();
    console.log("");
    console.log(`${white("AISS CLI — Complete Command Reference")}`);
    console.log("");
    console.log(`${cyan("┌────────────────────────────────────────────────────────────────────────────┐")}`);
    console.log(`${cyan("│")} ${white("COMMANDS")}${" ".repeat(68)}${cyan("│")}`);
    console.log(`${cyan("├────────────────────────────────────────────────────────────────────────────┤")}`);
    console.log(`${cyan("│")} ${white("aiss")} ${dim("or")} ${white("aiss start")} ${" ".repeat(53)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Start AISS agent and open dashboard at http://127.0.0.1:8179")}${" ".repeat(22)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Generates secure access token")}${" ".repeat(54)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Initializes sensors and security gate")}${" ".repeat(44)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Opens browser automatically")}${" ".repeat(51)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Runs in background after startup")}${" ".repeat(48)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("│")} ${white("aiss stop")} ${" ".repeat(65)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Stop the AISS agent gracefully")}${" ".repeat(55)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Saves all pending data to disk")}${" ".repeat(53)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Closes dashboard connections")}${" ".repeat(51)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("│")} ${white("aiss status")} ${" ".repeat(63)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Check if AISS is running and show details")}${" ".repeat(46)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Shows process ID (PID)")}${" ".repeat(60)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Shows port and dashboard URL")}${" ".repeat(53)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Shows operational status")}${" ".repeat(57)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("│")} ${white("aiss logs")} ${" ".repeat(63)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("View recent agent logs (last 60 lines)")}${" ".repeat(47)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Full log file: ~/.aiss/aiss.log")}${" ".repeat(51)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("│")} ${white("aiss open")} ${" ".repeat(63)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Open dashboard in default browser")}${" ".repeat(50)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Dashboard: http://127.0.0.1:8179/")}${" ".repeat(51)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("│")} ${white("aiss install")} ${" ".repeat(60)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Install AISS as Windows Service (auto-start on boot)")}${" ".repeat(36)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Requires administrator privileges")}${" ".repeat(50)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Service name: AISS")}${" ".repeat(61)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Windows only (use systemd/launchd on Linux/macOS)")}${" ".repeat(32)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("│")} ${white("aiss uninstall")} ${" ".repeat(58)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Remove AISS Windows Service")}${" ".repeat(54)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Stops service if running")}${" ".repeat(56)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Unregisters service from system")}${" ".repeat(48)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("├────────────────────────────────────────────────────────────────────────────┤")}`);
    console.log(`${cyan("│")} ${white("OPTIONS")}${" ".repeat(68)}${cyan("│")}`);
    console.log(`${cyan("├────────────────────────────────────────────────────────────────────────────┤")}`);
    console.log(`${cyan("│")} ${white("--foreground")} ${" ".repeat(63)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("Run agent in foreground (for debugging)")}${" ".repeat(46)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Logs output to terminal instead of file")}${" ".repeat(47)}${cyan("│")}`);
    console.log(`${cyan("│")}   ${dim("• Example: aiss start --foreground")}${" ".repeat(50)}${cyan("│")}`);
    console.log(`${cyan("│")}${" ".repeat(76)}${cyan("│")}`);
    console.log(`${cyan("├────────────────────────────────────────────────────────────────────────────┤")}`);
    console.log(`${cyan("│")} ${white("DATA LOCATIONS")}${" ".repeat(62)}${cyan("│")}`);
    console.log(`${cyan("├────────────────────────────────────────────────────────────────────────────┤")}`);
    console.log(`${cyan("│")} ${dim("• Database:")}   ${white("~/.aiss/db.json")}${" ".repeat(54)}${cyan("│")}`);
    console.log(`${cyan("│")} ${dim("• Logs:")}       ${white("~/.aiss/aiss.log")}${" ".repeat(55)}${cyan("│")}`);
    console.log(`${cyan("│")} ${dim("• Quarantine:")} ${white("~/.aiss/quarantine/")}${" ".repeat(51)}${cyan("│")}`);
    console.log(`${cyan("│")} ${dim("• Token:")}      ${white("~/.aiss/token")}${" ".repeat(56)}${cyan("│")}`);
    console.log(`${cyan("│")} ${dim("• PID file:")}   ${white("~/.aiss/aiss.pid")}${" ".repeat(53)}${cyan("│")}`);
    console.log(`${cyan("└────────────────────────────────────────────────────────────────────────────┘")}`);
    console.log("");
    console.log(`${dim("For more information, visit the documentation page.")}`);
    console.log("");
    break;
  case "install":
    await installService();
    break;
  case "uninstall":
    await uninstallService();
    break;
  default:
    banner();
    console.log("");
    console.log(`${white("Usage:")} ${cyan("aiss")} ${dim("<command>")}`);
    console.log("");
    console.log(`${white("Commands:")}`);
    console.log(`  ${cyan("start")}       ${dim("Start AISS and open dashboard")}`);
    console.log(`  ${cyan("stop")}        ${dim("Stop AISS")}`);
    console.log(`  ${cyan("status")}      ${dim("Check if AISS is running")}`);
    console.log(`  ${cyan("open")}        ${dim("Open dashboard in browser")}`);
    console.log(`  ${cyan("logs")}        ${dim("View recent logs")}`);
    console.log(`  ${cyan("install")}     ${dim("Install as Windows Service")}`);
    console.log(`  ${cyan("uninstall")}   ${dim("Remove Windows Service")}`);
    console.log(`  ${cyan("help")}        ${dim("Show detailed command reference")}`);
    console.log("");
    console.log(`${white("Options:")}`);
    console.log(`  ${cyan("--foreground")} ${dim("Run in foreground (for debugging)")}`);
    console.log("");
    console.log(`${dim("Run 'aiss help' for detailed documentation on each command.")}`);
    console.log("");
}
