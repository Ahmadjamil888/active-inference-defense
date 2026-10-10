// Cloud AI reasoning via the AISS public endpoint (Lovable AI gateway behind it).
const BASE = process.env.AISS_CLOUD || "https://active-inference-defense.lovable.app";

export async function analyze(threat) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`${BASE}/api/public/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: threat.name,
        rule: threat.rule,
        severity: threat.severity,
        file: threat.file,
        hash: threat.hash,
        action: threat.action,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.analysis || null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
