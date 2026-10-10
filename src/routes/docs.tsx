import { createFileRoute } from "@tanstack/react-router";
import { Header, VideoBg } from "@/components/Shell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — AISS" },
      { name: "description", content: "Complete documentation for AISS Agentic AI Security System" },
    ],
  }),
  component: Docs,
});

function Docs() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <VideoBg />
      <div className="relative z-[1]">
        <Header active="Docs" />
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h1 className="text-5xl font-display font-bold mb-8">Documentation</h1>
          
          <div className="space-y-12">
            <section className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">Installation</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Node.js 18 or higher</li>
                    <li>Git</li>
                    <li>Administrator rights (for Windows Service installation)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Quick Install</h3>
                  <div className="bg-accent p-4 rounded-lg space-y-2">
                    <code className="block">git clone https://github.com/Ahmadjamil888/active-inference-defense.git</code>
                    <code className="block">cd active-inference-defense/agent</code>
                    <code className="block">npm install -g .</code>
                    <code className="block">aiss</code>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">CLI Commands</h2>
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-4">
                  <code className="text-primary font-mono">aiss</code>
                  <p className="text-muted-foreground mt-2">Start AISS and open the dashboard at http://127.0.0.1:8179</p>
                </div>
                <div className="border-b border-border/40 pb-4">
                  <code className="text-primary font-mono">aiss stop</code>
                  <p className="text-muted-foreground mt-2">Stop the AISS agent</p>
                </div>
                <div className="border-b border-border/40 pb-4">
                  <code className="text-primary font-mono">aiss status</code>
                  <p className="text-muted-foreground mt-2">Check if AISS is running</p>
                </div>
                <div className="border-b border-border/40 pb-4">
                  <code className="text-primary font-mono">aiss logs</code>
                  <p className="text-muted-foreground mt-2">View recent logs</p>
                </div>
                <div className="border-b border-border/40 pb-4">
                  <code className="text-primary font-mono">aiss install</code>
                  <p className="text-muted-foreground mt-2">Install as Windows Service (auto-start on boot)</p>
                </div>
                <div>
                  <code className="text-primary font-mono">aiss uninstall</code>
                  <p className="text-muted-foreground mt-2">Remove Windows Service</p>
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">Dashboard Features</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Overview</h3>
                  <p>Security score, active threats, system health charts, and recent alerts</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Threats</h3>
                  <p>Live feed of scored events with filters and decision badges</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Network</h3>
                  <p>Active connections, listening ports, and exposed services</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Incidents</h3>
                  <p>Full incident lifecycle with AI analysis and approval workflow</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Settings</h3>
                  <p>Configure gate thresholds, enforcement toggles, and allowlist</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Health</h3>
                  <p>Service status, uptime, and restart controls</p>
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">Security Gate</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Every event is risk-scored (0-100) based on:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Deterministic rules (EICAR, obfuscated PowerShell, etc.)</li>
                  <li>Baseline anomaly detection</li>
                  <li>Known-bad hash list</li>
                </ul>
                <div className="mt-4">
                  <h3 className="text-foreground font-semibold mb-2">Decisions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="text-green-500">ALLOW</span> (0-20): Log only</li>
                    <li><span className="text-amber-500">HOLD</span> (20-45): Suspend and wait for approval</li>
                    <li><span className="text-orange-500">QUARANTINE</span> (45-70): Move to encrypted vault</li>
                    <li><span className="text-red-500">BLOCK</span> (70-100): Kill process and flag for firewall</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-foreground font-semibold mb-2">'aiss' command not found</h3>
                  <p>Restart your terminal after installation. PATH changes require a new session.</p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">Dashboard doesn't open</h3>
                  <p>Check if AISS is running with <code className="bg-accent px-2 py-1 rounded">aiss status</code> and view logs with <code className="bg-accent px-2 py-1 rounded">aiss logs</code></p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-2">High CPU usage</h3>
                  <p>This is normal during initial baseline scan (first 2-3 minutes). Check settings to reduce scan frequency.</p>
                </div>
              </div>
            </section>

            <section className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-4">What AISS Can & Cannot Do</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-green-500 font-semibold mb-4">✓ What AISS Can Do</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Real-time process monitoring</li>
                    <li>Network connection tracking</li>
                    <li>File scanning with EICAR detection</li>
                    <li>File quarantine (XOR-encoded vault)</li>
                    <li>Incident lifecycle management</li>
                    <li>Local AI analysis</li>
                    <li>Health checks and auto-recovery</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-red-500 font-semibold mb-4">✗ What AISS Cannot Do</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Pre-execution blocking (requires OS kernel driver)</li>
                    <li>Direct firewall rule modification</li>
                    <li>Memory scanning (requires kernel access)</li>
                    <li>Cloud sync (optional, requires configuration)</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
