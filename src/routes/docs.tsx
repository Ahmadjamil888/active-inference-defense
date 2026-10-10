import { createFileRoute } from "@tanstack/react-router";
import { Header, VideoBg } from "@/components/Shell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — AISS" },
      { name: "description", content: "Complete documentation for AISS Agentic AI Security System" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  component: Docs,
});

function Docs() {
  return (
    <div className="relative min-h-screen bg-black">
      <VideoBg dim />
      <div className="relative z-[1]">
        <Header active="Documentation" />
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
          <h1 className="text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            Documentation
          </h1>
          <p className="text-lg text-gray-400 mb-12" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Complete guide to installing and using AISS
          </p>
          
          <div className="space-y-8">
            <section className="border-l-2 border-red-600 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Installation</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <li>Node.js 18 or higher</li>
                    <li>Git</li>
                    <li>Administrator rights (for Windows Service installation)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Quick Install</h3>
                  <div className="bg-gray-900 p-4 space-y-2 border border-gray-800">
                    <code className="block text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>git clone https://github.com/Ahmadjamil888/active-inference-defense.git</code>
                    <code className="block text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>cd active-inference-defense/agent</code>
                    <code className="block text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>npm install -g .</code>
                    <code className="block text-green-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss</code>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CLI Commands</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-800 pb-4">
                  <code className="text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss</code>
                  <p className="text-gray-400 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Start AISS and open the dashboard at http://127.0.0.1:8179</p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <code className="text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss stop</code>
                  <p className="text-gray-400 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Stop the AISS agent</p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <code className="text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss status</code>
                  <p className="text-gray-400 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Check if AISS is running</p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <code className="text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss logs</code>
                  <p className="text-gray-400 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>View recent logs</p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <code className="text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss install</code>
                  <p className="text-gray-400 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Install as Windows Service (auto-start on boot)</p>
                </div>
                <div>
                  <code className="text-red-500 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>aiss uninstall</code>
                  <p className="text-gray-400 mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Remove Windows Service</p>
                </div>
              </div>
            </section>

            <section className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard Features</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Overview</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Security score, active threats, system health charts, and recent alerts</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Threats</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Live feed of scored events with filters and decision badges</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Network</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Active connections, listening ports, and exposed services</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Incidents</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Full incident lifecycle with AI analysis and approval workflow</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Settings</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Configure gate thresholds, enforcement toggles, and allowlist</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Health</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Service status, uptime, and restart controls</p>
                </div>
              </div>
            </section>

            <section className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Security Gate</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Every event is risk-scored (0-100) based on:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li>Deterministic rules (EICAR, obfuscated PowerShell, etc.)</li>
                  <li>Baseline anomaly detection</li>
                  <li>Known-bad hash list</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Decisions</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <li><span className="text-green-400">ALLOW</span> (0-20): Log only</li>
                    <li><span className="text-yellow-400">HOLD</span> (20-45): Suspend and wait for approval</li>
                    <li><span className="text-orange-400">QUARANTINE</span> (45-70): Move to encrypted vault</li>
                    <li><span className="text-red-500">BLOCK</span> (70-100): Kill process and flag for firewall</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Troubleshooting</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>'aiss' command not found</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Restart your terminal after installation. PATH changes require a new session.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard doesn't open</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Check if AISS is running with <code className="bg-gray-900 px-2 py-1 border border-gray-800">aiss status</code> and view logs with <code className="bg-gray-900 px-2 py-1 border border-gray-800">aiss logs</code></p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>High CPU usage</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>This is normal during initial baseline scan (first 2-3 minutes). Check settings to reduce scan frequency.</p>
                </div>
              </div>
            </section>

            <section className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What AISS Can & Cannot Do</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-green-400 font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>✓ What AISS Can Do</h3>
                  <ul className="space-y-2 text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  <h3 className="text-red-500 font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>✗ What AISS Cannot Do</h3>
                  <ul className="space-y-2 text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
