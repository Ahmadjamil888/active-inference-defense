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
        <div className="flex pt-24 pb-20">
          <aside className="w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto px-6 border-r border-gray-800">
            <h2 className="text-sm font-bold mb-6 text-gray-500 tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              CONTENTS
            </h2>
            <nav className="space-y-3">
              <a href="#installation" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Installation
              </a>
              <a href="#cli" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                CLI Commands
              </a>
              <a href="#dashboard" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Dashboard Features
              </a>
              <a href="#security-gate" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Security Gate
              </a>
              <a href="#incidents" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Incident Management
              </a>
              <a href="#quarantine" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Quarantine System
              </a>
              <a href="#hardware" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Hardware Detection
              </a>
              <a href="#network" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Network Monitoring
              </a>
              <a href="#wifi" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Wi-Fi Discovery
              </a>
              <a href="#testing" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Authorized Testing
              </a>
              <a href="#data" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Data & Logs
              </a>
              <a href="#troubleshooting" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Troubleshooting
              </a>
              <a href="#limitations" className="block text-gray-400 hover:text-red-500 transition-colors text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Limitations
              </a>
            </nav>
          </aside>
          <div className="flex-1 max-w-4xl px-6">
            <h1 className="text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
              Documentation
            </h1>
            <p className="text-lg text-gray-400 mb-12" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Complete guide to installing and using AISS
            </p>

            <div className="space-y-12">
            <section id="installation" className="border-l-2 border-red-600 pl-6">
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

            <section id="cli" className="border-l-2 border-gray-700 pl-6">
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

            <section id="dashboard" className="border-l-2 border-gray-700 pl-6">
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

            <section id="security-gate" className="border-l-2 border-gray-700 pl-6">
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

            <section id="incidents" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Incident Management</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>AISS maintains a complete incident lifecycle:</p>
                <ul className="list-disc list-inside space-y-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li><strong>Detection:</strong> Events are scored and classified by the Security Gate</li>
                  <li><strong>Triage:</strong> High-risk events are flagged for review with AI analysis</li>
                  <li><strong>Approval:</strong> Hold states require explicit user approval or auto-rejection timeout</li>
                  <li><strong>Resolution:</strong> Actions are executed (quarantine, block, allow) and logged</li>
                  <li><strong>Audit:</strong> All decisions and actions are persisted in the audit log</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Incident States</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <li><span className="text-yellow-400">PENDING</span> - Awaiting user decision</li>
                    <li><span className="text-green-400">APPROVED</span> - Action allowed to proceed</li>
                    <li><span className="text-red-500">REJECTED</span> - Action blocked/quarantined</li>
                    <li><span className="text-gray-400">RESOLVED</span> - Incident closed after action</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="quarantine" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Quarantine System</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Suspicious files are moved to an encrypted quarantine vault:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li>Location: <code className="bg-gray-900 px-2 py-1 border border-gray-800">~/.aiss/quarantine/</code></li>
                  <li>Files are XOR-encoded to prevent execution</li>
                  <li>Metadata preserved: original path, timestamp, hash</li>
                  <li>Restore available through dashboard or CLI</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Restoring Files</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Use the dashboard quarantine page to review and restore files. Each restore requires confirmation and is logged to the audit trail.</p>
                </div>
              </div>
            </section>

            <section id="hardware" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Hardware Detection</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>AISS enumerates and monitors hardware devices:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li>CPU: Cores, model, utilization</li>
                  <li>Memory: Total, available, usage percentage</li>
                  <li>Storage: Disks, volumes, usage, filesystem type</li>
                  <li>Removable Media: USB drives, external disks (change detection)</li>
                  <li>Network Adapters: Interfaces, MAC addresses, IP configuration</li>
                  <li>Display/GPU: Where available via system queries</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Removable Media Response</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>When suspicious removable media is detected:</p>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <li>Volume is scanned for known threat patterns (EICAR, suspicious extensions)</li>
                    <li>Suspicious files are quarantined</li>
                    <li>Volume access may be restricted where OS permissions allow</li>
                    <li>Event is logged with hardware identifiers (serial, vendor)</li>
                  </ul>
                  <p className="mt-2 text-yellow-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Note: Physical hardware blocking requires kernel drivers. AISS can only detect and quarantine at the file/process level.</p>
                </div>
              </div>
            </section>

            <section id="network" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Network Monitoring</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Real-time network visibility:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li><strong>Active Connections:</strong> Established TCP/UDP connections with remote endpoints</li>
                  <li><strong>Listening Ports:</strong> Services accepting inbound connections</li>
                  <li><strong>Exposed Interfaces:</strong> Network interfaces with public IPs</li>
                  <li><strong>Network Devices:</strong> ARP/neighbour table enumeration (local devices)</li>
                  <li><strong>Connection Logs:</strong> Historical connection events and anomalies</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Anomaly Detection</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Baseline monitoring detects:</p>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <li>New remote endpoints not seen before</li>
                    <li>Unusual port usage</li>
                    <li>Sudden connection spikes</li>
                    <li>Connections to known-malicious IPs (if threat feed configured)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="wifi" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Wi-Fi Discovery</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Wi-Fi network enumeration (platform-dependent):</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li><strong>Windows:</strong> Uses <code className="bg-gray-900 px-2 py-1 border border-gray-800">netsh wlan show networks</code></li>
                  <li><strong>macOS:</strong> Uses <code className="bg-gray-900 px-2 py-1 border border-gray-800">/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s</code></li>
                  <li><strong>Linux:</strong> Uses <code className="bg-gray-900 px-2 py-1 border border-gray-800">nmcli device wifi list</code> or <code className="bg-gray-900 px-2 py-1 border border-gray-800">iwlist scan</code></li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Data Shown</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <li>Connected SSID and BSSID</li>
                    <li>Nearby networks (SSID, signal strength, channel where available)</li>
                    <li>Connection security type (WPA2, WPA3, Open)</li>
                  </ul>
                </div>
                <p className="mt-2 text-yellow-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Note: Some platforms require elevated permissions for full Wi-Fi enumeration. If unavailable, the dashboard will show a clear error message.</p>
              </div>
            </section>

            <section id="testing" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Authorized Testing</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>AISS includes safe, authorized security testing capabilities:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li><strong>EICAR Test File:</strong> Standard antivirus test string to verify detection</li>
                  <li><strong>Synthetic Events:</strong> Generate scored events to test Security Gate decisions</li>
                  <li><strong>Baseline Simulation:</strong> Simulate anomaly conditions to test alerts</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Running Tests</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Use the dashboard testing page or CLI to run authorized simulations. These are harmless, local-only tests designed to verify detection and response mechanisms.</p>
                </div>
                <p className="mt-2 text-red-400 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Warning: Never use AISS for unauthorized offensive activity against third-party systems.</p>
              </div>
            </section>

            <section id="data" className="border-l-2 border-gray-700 pl-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Data & Logs</h2>
              <div className="space-y-4 text-gray-300">
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>All AISS data is stored locally:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <li><strong>Database:</strong> <code className="bg-gray-900 px-2 py-1 border border-gray-800">~/.aiss/db.json</code> (metrics, incidents, alerts, settings)</li>
                  <li><strong>Logs:</strong> <code className="bg-gray-900 px-2 py-1 border border-gray-800">~/.aiss/aiss.log</code> (agent runtime logs)</li>
                  <li><strong>Quarantine:</strong> <code className="bg-gray-900 px-2 py-1 border border-gray-800">~/.aiss/quarantine/</code> (XOR-encoded suspicious files)</li>
                  <li><strong>Token:</strong> <code className="bg-gray-900 px-2 py-1 border border-gray-800">~/.aiss/token</code> (local access token for API authentication)</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Exporting Data</h3>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Use the dashboard export functionality or directly access <code className="bg-gray-900 px-2 py-1 border border-gray-800">~/.aiss/db.json</code> to backup or analyze collected data. The JSON format is human-readable and can be imported into other tools.</p>
                </div>
              </div>
            </section>

            <section id="troubleshooting" className="border-l-2 border-gray-700 pl-6">
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

            <section id="limitations" className="border-l-2 border-gray-700 pl-6">
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
    </div>
  );
}
