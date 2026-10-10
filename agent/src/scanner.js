// Real file scanner: walks a directory, hashes files and matches signatures.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// EICAR standard antivirus test string (harmless, industry standard).
const EICAR_SHA256 = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f";

const SIGNATURES = [
  { id: "EICAR-TEST", severity: "critical", sha256: EICAR_SHA256, name: "EICAR antivirus test file" },
];

const CONTENT_RULES = [
  { id: "PS-ENCODED", severity: "high", re: /powershell(\.exe)?\s+-(enc|encodedcommand)\s+[A-Za-z0-9+/=]{40,}/i, name: "Obfuscated PowerShell payload" },
  { id: "DOWNLOAD-EXEC", severity: "high", re: /(Invoke-WebRequest|curl|wget)[^\n]{0,120}(\|\s*(sh|bash)|;\s*\.\/|Start-Process)/i, name: "Download-and-execute chain" },
  { id: "AUTORUN", severity: "medium", re: /\[autorun\][\s\S]{0,200}open\s*=/i, name: "Autorun launcher" },
  { id: "REVERSE-SHELL", severity: "critical", re: /(nc|ncat|netcat)\s+-[a-z]*e\s+\/bin\/(ba)?sh|socket\.socket\([^)]*\)[\s\S]{0,120}dup2/i, name: "Reverse shell" },
  { id: "RANSOM-NOTE", severity: "high", re: /your files have been encrypted|send .{0,20}bitcoin .{0,30}to decrypt/i, name: "Ransomware note" },
  { id: "KEYLOGGER", severity: "high", re: /SetWindowsHookEx\s*\(\s*WH_KEYBOARD|pynput\.keyboard|keylog/i, name: "Keylogging routine" },
];

const RISKY_EXT = new Set([".exe", ".scr", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".jar", ".hta", ".dll"]);
const TEXTY = new Set([".txt", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".py", ".sh", ".inf", ".ini", ".html", ".md", ""]);
const MAX_BYTES = 8 * 1024 * 1024;

export function sha256(file) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(file));
  return h.digest("hex");
}

export function inspect(file) {
  const findings = [];
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return findings;
  }
  if (!stat.isFile() || stat.size > MAX_BYTES) return findings;
  const ext = path.extname(file).toLowerCase();
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch {
    return findings;
  }
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  for (const s of SIGNATURES) if (s.sha256 === hash) findings.push({ rule: s.id, name: s.name, severity: s.severity, file, hash });
  if (TEXTY.has(ext) || buf.subarray(0, 4096).every((b) => b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127))) {
    const text = buf.toString("utf8", 0, Math.min(buf.length, 512 * 1024));
    for (const r of CONTENT_RULES) if (r.re.test(text)) findings.push({ rule: r.id, name: r.name, severity: r.severity, file, hash });
  }
  if (RISKY_EXT.has(ext) && /\.(jpg|png|pdf|docx?|txt)\.[a-z0-9]+$/i.test(path.basename(file))) {
    findings.push({ rule: "DOUBLE-EXT", name: "Double extension masquerade", severity: "high", file, hash });
  }
  return findings;
}

export function* walk(root, limit = 4000) {
  let count = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (/^(node_modules|\.git|System Volume Information|proc|sys|dev)$/i.test(e.name)) continue;
        stack.push(full);
      } else if (e.isFile()) {
        if (++count > limit) return;
        yield full;
      }
    }
  }
}

export function scanPath(root, limit) {
  const started = Date.now();
  let files = 0;
  const findings = [];
  for (const f of walk(root, limit)) {
    files++;
    findings.push(...inspect(f));
  }
  return { root, files, findings, ms: Date.now() - started };
}

export function quarantine(file, quarantineDir) {
  fs.mkdirSync(quarantineDir, { recursive: true });
  const target = path.join(quarantineDir, `${Date.now()}-${path.basename(file)}.quarantined`);
  const data = fs.readFileSync(file);
  // Neutralise by XOR-encoding so the file can never execute from quarantine.
  const enc = Buffer.from(data.map((b) => b ^ 0x5a));
  fs.writeFileSync(target, enc);
  fs.unlinkSync(file);
  return target;
}
