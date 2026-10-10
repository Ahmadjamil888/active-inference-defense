import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Header, VideoBg } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { getHost, injectUsb, runScan, agentChat, monitorTick, releaseThreat } from "@/lib/aiss.functions";

const TABS = ["overview", "threats", "scans", "agent", "events"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/dashboard")({
  validateSearch: (s: Record<string, unknown>): { tab: Tab } => ({
    tab: TABS.includes(s["tab"] as Tab) ? (s["tab"] as Tab) : "overview",
  }),
  head: () => ({
    meta: [
      { title: "Live Defense Console — AISS" },
      { name: "description", content: "Monitor the AISS virtual machine in real time: threats, scans, autonomous agent and event stream." },
      { property: "og:title", content: "Live Defense Console — AISS" },
      { property: "og:description", content: "Real-time agentic threat monitoring and containment." },
    ],
  }),
  component: Dashboard,
});

type Threat = { id: string; created_at: string; name: string; source: string; severity: string; status: string; sha256: string | null; entropy: number | null; free_energy: number | null; detections: unknown; ai_verdict: string | null; payload_preview: string | null };
type Ev = { id: string; created_at: string; kind: string; level: string; message: string };
type Scan = { id: string; created_at: string; scan_type: string; items_scanned: number; findings: number; duration_ms: number; report: string | null };

function useRealtime(table: string, key: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`rt-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        qc.invalidateQueries({ queryKey: [key] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [table, key, qc]);
}

const fmt = (t: string) => new Date(t).toLocaleTimeString([], { hour12: false });

function Dashboard() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const tick = useServerFn(monitorTick);
  const inject = useServerFn(injectUsb);
  const scan = useServerFn(runScan);
  const ask = useServerFn(agentChat);
  const setStatus = useServerFn(releaseThreat);
  const [busy, setBusy] = useState<string | null>(null);

  useRealtime("threats", "threats");
  useRealtime("events", "events");
  useRealtime("scans", "scans");

  const host = useQuery({ queryKey: ["host"], queryFn: () => getHost(), refetchInterval: 15000 });
  const threats = useQuery({
    queryKey: ["threats"],
    queryFn: async () => (await supabase.from("threats").select("*").order("created_at", { ascending: false }).limit(60)).data as Threat[] | null,
  });
  const events = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(120)).data as Ev[] | null,
  });
  const scans = useQuery({
    queryKey: ["scans"],
    queryFn: async () => (await supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(30)).data as Scan[] | null,
  });

  // 24/7 autonomous heartbeat while the console is open
  useEffect(() => {
    let alive = true;
    const beat = () => {
      if (alive) void tick({}).catch(() => {});
    };
    beat();
    const id = setInterval(beat, 45000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [tick]);

  const onInject = async () => {
    setBusy("usb");
    try {
      const r = await inject({});
      const blocked = r.results.filter((x) => x.action !== "allow").length;
      toast.success(`USB contained: ${blocked} malicious artifacts neutralised`);
      qc.invalidateQueries();
      navigate({ search: { tab: "threats" } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const onScan = async (type: "quick" | "deep") => {
    setBusy(type);
    try {
      const r = await scan({ data: { type } });
      toast.success(`${type} scan: ${r.items_scanned} items, ${r.findings} findings`);
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const active = (threats.data ?? []).filter((t) => t.status === "quarantined").length;
  const crit = (threats.data ?? []).filter((t) => t.severity === "critical" || t.severity === "high").length;

  return (
    <div className="relative min-h-[100dvh]">
      <VideoBg dim />
      <div className="relative z-[1] mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-[clamp(14px,3vw,32px)] py-[clamp(16px,2.4vh,28px)]">
        <Header active="Dashboard" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(26px,4vw,44px)] leading-tight tracking-[-0.04em]">Defense Console</h1>
            <p className="text-sm text-muted-foreground">
              {host.data ? `VM online · ${host.data.region} · uptime ${host.data.uptimeSec}s · ${host.data.hashMBps} MB/s` : "Connecting to virtual machine…"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="pill-dark" disabled={busy === "quick"} onClick={() => onScan("quick")}>
              <i className="fa-solid fa-bolt" /> {busy === "quick" ? "Scanning…" : "Quick scan"}
            </button>
            <button className="pill-dark" disabled={busy === "deep"} onClick={() => onScan("deep")}>
              <i className="fa-solid fa-magnifying-glass-chart" /> {busy === "deep" ? "Scanning…" : "Deep scan"}
            </button>
            <button className="cta" disabled={busy === "usb"} onClick={onInject}>
              <i className="fa-solid fa-usb" /> {busy === "usb" ? "Containing…" : "Inject corrupted USB"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="glass h-fit p-3 lg:sticky lg:top-4">
          <nav className="flex gap-1 overflow-auto lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => navigate({ search: { tab: t } })}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-accent"}`}
            >
              <i className={`fa-solid ${ICONS[t]} w-4`} /> {t}
            </button>
          ))}
          </nav>
          <div className="mt-4 hidden border-t border-border/40 px-4 pt-4 text-xs text-muted-foreground lg:block">
            <p><span className="mr-2 inline-block size-2 rounded-full bg-[var(--success)]" />Agents live</p>
            <p className="mt-1">Heartbeat every 45s</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-6">

        {tab === "overview" && <LiveCharts threats={threats.data ?? []} events={events.data ?? []} scans={scans.data ?? []} />}

        {tab === "overview" && (
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="glass p-5 lg:col-span-2">
              <VmScreen host={host.data} events={events.data ?? []} />
            </div>
            <div className="flex flex-col gap-5">
              <div className="glass grid grid-cols-2 gap-4 p-5">
                <Metric label="Quarantined" value={active} />
                <Metric label="High / critical" value={crit} />
                <Metric label="Scans" value={scans.data?.length ?? 0} />
                <Metric label="Events" value={events.data?.length ?? 0} />
              </div>
              <div className="glass p-5">
                <h3 className="mb-3 text-sm font-semibold">Virtual machine</h3>
                <dl className="terminal space-y-1 text-muted-foreground">
                  {host.data &&
                    Object.entries(host.data).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <dt>{k}</dt>
                        <dd className="truncate text-right text-foreground">{String(v ?? "—").slice(0, 36)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>
          </section>
        )}

        {tab === "threats" && <Threats rows={threats.data ?? []} onStatus={async (id, status) => { await setStatus({ data: { id, status } }); qc.invalidateQueries(); toast.success(`Marked ${status}`); }} />}

        {tab === "scans" && (
          <section className="grid gap-4">
            {(scans.data ?? []).map((s) => (
              <article key={s.id} className="glass p-5">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <strong className="capitalize">{s.scan_type} scan</strong>
                  <span className="text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.items_scanned} items · {s.findings} findings · {s.duration_ms} ms</p>
                {s.report && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{s.report}</p>}
              </article>
            ))}
            {!scans.data?.length && <Empty text="No scans yet. Run a quick or deep scan." />}
          </section>
        )}

        {tab === "agent" && <Agent ask={ask} />}

        {tab === "events" && (
          <section className="glass terminal max-h-[62vh] overflow-auto p-5">
            {(events.data ?? []).map((e) => (
              <div key={e.id} className="flex gap-3 border-b border-border/40 py-1 last:border-0">
                <span className="text-muted-foreground">{fmt(e.created_at)}</span>
                <span className={e.level === "critical" ? "sev-critical" : e.level === "warn" ? "sev-medium" : "sev-low"}>[{e.level}]</span>
                <span className="text-muted-foreground">{e.kind}</span>
                <span className="flex-1">{e.message}</span>
              </div>
            ))}
            {!events.data?.length && <Empty text="Event stream empty." />}
          </section>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}

const ICONS: Record<Tab, string> = { overview: "fa-gauge-high", threats: "fa-biohazard", scans: "fa-magnifying-glass", agent: "fa-robot", events: "fa-list-ul" };

function LiveCharts({ threats, events, scans }: { threats: Threat[]; events: Ev[]; scans: Scan[] }) {
  // bucket events + threats per minute over the last 30 minutes (real DB rows)
  const now = Date.now();
  const buckets = Array.from({ length: 30 }, (_, i) => {
    const start = now - (30 - i) * 60000;
    const inB = (t: string) => { const x = new Date(t).getTime(); return x >= start && x < start + 60000; };
    return {
      t: new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      events: events.filter((e) => inB(e.created_at)).length,
      threats: threats.filter((e) => inB(e.created_at)).length,
    };
  });
  const sev = ["critical", "high", "medium", "low"].map((s) => ({ name: s, value: threats.filter((t) => t.severity === s).length }));
  const scanBars = [...scans].reverse().slice(-12).map((s) => ({ t: fmt(s.created_at), findings: s.findings, items: s.items_scanned }));
  const colors = ["var(--destructive)", "var(--warning)", "var(--primary)", "var(--success)"];
  const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 } };
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <div className="glass p-5 lg:col-span-2">
        <h3 className="mb-3 text-sm font-semibold">Live activity · last 30 min</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <AreaChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" fontSize={10} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} fontSize={10} stroke="var(--muted-foreground)" />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="events" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="threats" stroke="var(--destructive)" fill="var(--destructive)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass p-5">
        <h3 className="mb-3 text-sm font-semibold">Threat severity</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={sev} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {sev.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass p-5 lg:col-span-3">
        <h3 className="mb-3 text-sm font-semibold">Scan findings</h3>
        <div className="h-44">
          <ResponsiveContainer>
            <BarChart data={scanBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" fontSize={10} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} fontSize={10} stroke="var(--muted-foreground)" />
              <Tooltip {...tip} />
              <Bar dataKey="findings" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="items" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="stat-value font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>;
}

function VmScreen({ host, events }: { host: { benchMs: number; runtime: string; region: string; ray: string | null } | undefined; events: Ev[] }) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          <span className="mr-2 inline-block size-2 rounded-full bg-[var(--success)]" />
          aiss-vm-01 · live isolate
        </h3>
        <span className="terminal text-muted-foreground">{host ? `${host.benchMs}ms / MiB×8` : "…"}</span>
      </div>
      <div className="vm-screen terminal h-[48vh] overflow-auto p-4">
        <p className="text-[var(--success)]">AISS Secure Runtime · kernel active-inference v2 · monitoring 24/7</p>
        <p className="text-muted-foreground">host {String(host?.runtime ?? "…").slice(0, 60)}</p>
        <p className="mb-2 text-muted-foreground">region {String(host?.region ?? "…")} · ray {String(host?.ray ?? "—").slice(0, 18)}</p>
        {events.slice(0, 40).reverse().map((e) => (
          <p key={e.id} className={e.level === "critical" ? "sev-critical" : e.level === "warn" ? "sev-medium" : ""}>
            <span className="text-muted-foreground">{fmt(e.created_at)} </span>
            {e.message}
          </p>
        ))}
        <p className="text-[var(--success)]">aiss@vm:~$ <span className="caret">▊</span></p>
      </div>
    </>
  );
}

function Threats({ rows, onStatus }: { rows: Threat[]; onStatus: (id: string, status: "quarantined" | "deleted" | "released") => Promise<void> }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!rows.length) return <Empty text="No threats recorded. Try injecting the corrupted USB." />;
  return (
    <section className="grid gap-3">
      {rows.map((t) => (
        <article key={t.id} className="glass p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`font-semibold sev-${t.severity}`}>{t.name}</h3>
              <p className="terminal text-muted-foreground">
                {t.source} · {t.severity} · {t.status} · H={t.entropy} · F={t.free_energy} · {new Date(t.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => setOpen(open === t.id ? null : t.id)}>
                {open === t.id ? "Hide" : "Details"}
              </button>
              <button className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => onStatus(t.id, "deleted")}>Purge</button>
              <button className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => onStatus(t.id, "released")}>Release</button>
            </div>
          </div>
          {open === t.id && (
            <div className="mt-4 space-y-3 text-sm">
              <p className="terminal break-all text-muted-foreground">sha256 {t.sha256}</p>
              <ul className="space-y-1">
                {(t.detections as { rule: string; detail: string }[] | null)?.map((d) => (
                  <li key={d.rule}><strong>{d.rule}</strong> — <span className="text-muted-foreground">{d.detail}</span></li>
                ))}
              </ul>
              {t.payload_preview && <pre className="terminal max-h-40 overflow-auto rounded-lg bg-black/50 p-3">{t.payload_preview}</pre>}
              {t.ai_verdict && <p className="whitespace-pre-wrap leading-relaxed">{t.ai_verdict}</p>}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

function Agent({ ask }: { ask: (o: { data: { prompt: string } }) => Promise<{ response: string; error: string | null }> }) {
  const [msgs, setMsgs] = useState<{ role: "you" | "aiss"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || loading) return;
    setMsgs((m) => [...m, { role: "you", text: prompt }]);
    setInput("");
    setLoading(true);
    try {
      const r = await ask({ data: { prompt } });
      if (r.error) toast.error(r.error);
      setMsgs((m) => [...m, { role: "aiss", text: r.error ? `⚠ ${r.error}` : r.response }]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass flex h-[62vh] flex-col p-5">
      <div className="flex-1 space-y-4 overflow-auto pr-1">
        {!msgs.length && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Ask the AISS agent about the live machine. It reads real host telemetry, threats and events.</p>
            <div className="flex flex-wrap gap-2">
              {["Summarise current threat posture", "What did the USB device attempt?", "Recommend hardening steps"].map((q) => (
                <button key={q} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "you" ? "text-right" : ""}>
            <span className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "you" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.text}</span>
          </div>
        ))}
        {loading && <p className="text-sm text-muted-foreground">AISS is reasoning<span className="caret">…</span></p>}
        <div ref={end} />
      </div>
      <form
        className="mt-4 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the autonomous agent…"
          className="flex-1 rounded-full border border-input bg-black/40 px-5 py-3 text-sm outline-none focus:border-ring"
        />
        <button className="cta" type="submit" disabled={loading}>Send</button>
      </form>
    </section>
  );
}
