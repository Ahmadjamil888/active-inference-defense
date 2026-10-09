import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const BOOT = Date.now();

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function logEvent(kind: string, level: string, message: string, meta: Record<string, unknown> = {}) {
  const sb = await db();
  await sb.from("events").insert({ kind, level, message, meta: meta as never });
}

async function hostTelemetry() {
  const req = getRequest();
  const h = req.headers;
  // Real CPU benchmark on this server isolate: SHA-256 over 1 MiB x 8
  const buf = new Uint8Array(1 << 20);
  crypto.getRandomValues(buf.subarray(0, 65536));
  const t0 = performance.now();
  for (let i = 0; i < 8; i++) await crypto.subtle.digest("SHA-256", buf);
  const ms = Math.max(0.01, performance.now() - t0);
  return {
    runtime: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    region: h.get("cf-ipcountry") ?? "edge",
    ray: h.get("cf-ray") ?? null,
    tls: h.get("cf-visitor") ?? null,
    clientUa: h.get("user-agent")?.slice(0, 120) ?? null,
    uptimeSec: Math.round((Date.now() - BOOT) / 1000),
    hashMBps: Math.round((8 / ms) * 1000),
    benchMs: Math.round(ms * 10) / 10,
    time: new Date().toISOString(),
  };
}

export const getHost = createServerFn({ method: "GET" }).handler(async () => hostTelemetry());

export const injectUsb = createServerFn({ method: "POST" }).handler(async () => {
  const { buildInfectedUsb, analyze } = await import("./engine.server");
  const { aiText } = await import("./ai.server");
  const sb = await db();
  const t0 = Date.now();
  await logEvent("usb", "warn", "USB mass-storage device mounted at /media/usb0 (6 files)");
  const files = buildInfectedUsb();
  const results = [];
  for (const f of files) results.push(await analyze(f));
  const bad = results.filter((r) => r.action !== "allow");
  let verdict = "";
  try {
    verdict = await aiText(
      "You are AISS, an autonomous SOC agent. Write a concise incident verdict (max 120 words): what the device attempted, the kill chain stage, and the containment you executed. Plain text.",
      JSON.stringify(results.map((r) => ({ name: r.name, p: r.pMalicious.toFixed(3), action: r.action, rules: r.detections.map((d) => d.rule) }))),
    );
  } catch (e) {
    verdict = `AI verdict unavailable: ${(e as Error).message}`;
  }
  for (const r of results) {
    const src = files.find((f) => f.name === r.name)!;
    if (r.action === "allow") {
      await logEvent("scan", "info", `${r.name} clean (p=${r.pMalicious.toFixed(3)})`);
      continue;
    }
    await sb.from("threats").insert({
      source: "usb0",
      name: r.name,
      severity: r.severity,
      status: r.action === "quarantine" ? "quarantined" : "monitoring",
      sha256: r.sha256,
      entropy: Number(r.entropy.toFixed(3)),
      free_energy: Number(r.freeEnergy.toFixed(3)),
      detections: r.detections as never,
      ai_verdict: verdict,
      payload_preview: src.content.replace(/[^\x20-\x7e\n]/g, ".").slice(0, 240),
    });
    await logEvent("defense", r.severity === "critical" ? "critical" : "warn", `${r.action.toUpperCase()} ${r.name} — ${r.detections.map((d) => d.rule).join(", ")}`, { p: r.pMalicious });
  }
  await sb.from("scans").insert({
    scan_type: "usb",
    items_scanned: files.length,
    findings: bad.length,
    duration_ms: Date.now() - t0,
    host: (await hostTelemetry()) as never,
    report: verdict,
  });
  await logEvent("usb", "info", `USB device ejected & blocked. ${bad.length}/${files.length} files contained.`);
  return { results, verdict };
});

export const runScan = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ type: z.enum(["quick", "deep"]) }).parse(d))
  .handler(async ({ data }) => {
    const { analyze } = await import("./engine.server");
    const { aiText } = await import("./ai.server");
    const sb = await db();
    const t0 = Date.now();
    const host = await hostTelemetry();
    const req = getRequest();
    // Scan the live runtime: request headers, environment surface, recent stored artifacts
    const samples = [...req.headers.entries()].map(([k, v]) => ({ name: `header:${k}`, content: v }));
    samples.push({ name: "runtime:globals", content: Object.keys(globalThis).join(",") });
    const { data: recent } = await sb.from("threats").select("name,payload_preview").order("created_at", { ascending: false }).limit(data.type === "deep" ? 50 : 10);
    for (const r of recent ?? []) samples.push({ name: `vault:${r.name}`, content: r.payload_preview ?? "" });
    const results = await Promise.all(samples.map(analyze));
    const findings = results.filter((r) => r.action !== "allow" && !r.name.startsWith("vault:"));
    let report = "";
    try {
      report = await aiText(
        "You are AISS. Summarize this host security scan in under 100 words: posture, anomalies, recommendations. Plain text.",
        JSON.stringify({ host, scanned: results.length, newFindings: findings.length, quarantinedVaultItems: (recent ?? []).length }),
      );
    } catch (e) {
      report = `AI summary unavailable: ${(e as Error).message}`;
    }
    const row = { scan_type: data.type, items_scanned: results.length, findings: findings.length, duration_ms: Date.now() - t0, host: host as never, report };
    await sb.from("scans").insert(row);
    await logEvent("scan", findings.length ? "warn" : "info", `${data.type} scan finished: ${results.length} items, ${findings.length} findings`);
    return row;
  });

export const agentChat = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ prompt: z.string().min(1).max(4000) }).parse(d))
  .handler(async ({ data }) => {
    const { aiText, AI_MODEL } = await import("./ai.server");
    const sb = await db();
    const [{ data: threats }, { data: events }] = await Promise.all([
      sb.from("threats").select("name,severity,status,detections,created_at").order("created_at", { ascending: false }).limit(15),
      sb.from("events").select("level,message,created_at").order("created_at", { ascending: false }).limit(25),
    ]);
    const host = await hostTelemetry();
    try {
      const response = await aiText(
        "You are AISS, an autonomous cybersecurity agent protecting a virtual machine (a server isolate). Use the live context JSON to answer precisely. Be concise, technical, actionable.",
        `LIVE CONTEXT:\n${JSON.stringify({ host, threats, events })}\n\nOPERATOR: ${data.prompt}`,
      );
      await sb.from("agent_runs").insert({ prompt: data.prompt, response, model: AI_MODEL });
      await logEvent("agent", "info", `Agent answered: "${data.prompt.slice(0, 60)}"`);
      return { response, error: null as string | null };
    } catch (e) {
      return { response: "", error: (e as Error).message };
    }
  });

export const monitorTick = createServerFn({ method: "POST" }).handler(async () => {
  const host = await hostTelemetry();
  const level = host.hashMBps < 50 ? "warn" : "info";
  await logEvent("monitor", level, `Heartbeat · ${host.hashMBps} MB/s hash throughput · uptime ${host.uptimeSec}s`, host);
  return host;
});

export const releaseThreat = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["quarantined", "deleted", "released"]) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await db();
    await sb.from("threats").update({ status: data.status }).eq("id", data.id);
    await logEvent("defense", "info", `Threat ${data.id.slice(0, 8)} marked ${data.status}`);
    return { ok: true };
  });
