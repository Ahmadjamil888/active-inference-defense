import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Shell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — AISS" },
      { name: "description", content: "Complete documentation for AISS Agentic AI Security System" },
      { name: "theme-color", content: "#E6EDF6" },
    ],
  }),
  component: Docs,
});

function Docs() {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--frame)' }}>
      <div className="relative z-[1]">
        <Header active="Documentation" />
        <div className="flex pt-24 pb-20">
          <aside className="w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto px-6 border-r" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold mb-6 tracking-widest" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
              CONTENTS
            </h2>
            <nav className="space-y-3">
              <a href="#installation" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Installation
              </a>
              <a href="#cli" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                CLI Commands
              </a>
              <a href="#dashboard" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Dashboard Features
              </a>
              <a href="#security-gate" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Security Gate
              </a>
              <a href="#incidents" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Incident Management
              </a>
              <a href="#quarantine" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Quarantine System
              </a>
              <a href="#hardware" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Hardware Detection
              </a>
              <a href="#network" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Network Monitoring
              </a>
              <a href="#wifi" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Wi-Fi Discovery
              </a>
              <a href="#testing" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Authorized Testing
              </a>
              <a href="#data" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Data & Logs
              </a>
              <a href="#troubleshooting" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Troubleshooting
              </a>
              <a href="#limitations" className="block transition-colors text-sm" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
                Limitations
              </a>
            </nav>
          </aside>
          <div className="flex-1 max-w-4xl px-6">
            <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
              Documentation
            </h1>
            <p className="text-lg mb-12" style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
              Complete guide to installing and using AISS
            </p>

            <div className="space-y-12">
            <section id="installation" style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Installation</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li>Node.js 18 or higher</li>
                    <li>Git</li>
                    <li>Administrator rights (for Windows Service installation)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Quick Install</h3>
                  <div className="p-4 space-y-2 border" style={{ background: 'rgba(255,255,255,0.5)', borderColor: 'var(--border)' }}>
                    <code className="block" style={{ color: 'var(--ink)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>git clone https://github.com/Ahmadjamil888/active-inference-defense.git</code>
                    <code className="block" style={{ color: 'var(--ink)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>cd active-inference-defense/agent</code>
                    <code className="block" style={{ color: 'var(--ink)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>npm install -g .</code>
                    <code className="block" style={{ color: 'var(--ink)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss</code>
                  </div>
                </div>
              </div>
            </section>

            <section id="cli" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>CLI Commands</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <code style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss</code>
                  <p style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>Start AISS and open the dashboard at http://127.0.0.1:8179</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <code style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss stop</code>
                  <p style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>Stop the AISS agent</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <code style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss status</code>
                  <p style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>Check if AISS is running</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <code style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss logs</code>
                  <p style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>View recent logs</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                  <code style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss install</code>
                  <p style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>Install as Windows Service (auto-start on boot)</p>
                </div>
                <div>
                  <code style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss uninstall</code>
                  <p style={{ marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>Remove Windows Service</p>
                </div>
              </div>
            </section>

            <section id="dashboard" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Dashboard Features</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Overview</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Security score, active threats, system health charts, and recent alerts</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Threats</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Live feed of scored events with filters and decision badges</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Network</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Active connections, listening ports, and exposed services</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Incidents</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Full incident lifecycle with AI analysis and approval workflow</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Settings</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Configure gate thresholds, enforcement toggles, and allowlist</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Health</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Service status, uptime, and restart controls</p>
                </div>
              </div>
            </section>

            <section id="security-gate" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Security Gate</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>Every event is risk-scored (0-100) based on:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li>Deterministic rules (EICAR, obfuscated PowerShell, etc.)</li>
                  <li>Baseline anomaly detection</li>
                  <li>Known-bad hash list</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Decisions</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li><span style={{ color: 'var(--success)' }}>ALLOW</span> (0-20): Log only</li>
                    <li><span style={{ color: 'var(--warning)' }}>HOLD</span> (20-45): Suspend and wait for approval</li>
                    <li><span style={{ color: '#ff7700' }}>QUARANTINE</span> (45-70): Move to encrypted vault</li>
                    <li><span style={{ color: 'var(--destructive)' }}>BLOCK</span> (70-100): Kill process and flag for firewall</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="incidents" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Incident Management</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>AISS maintains a complete incident lifecycle:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li><strong>Detection:</strong> Events are scored and classified by the Security Gate</li>
                  <li><strong>Triage:</strong> High-risk events are flagged for review with AI analysis</li>
                  <li><strong>Approval:</strong> Hold states require explicit user approval or auto-rejection timeout</li>
                  <li><strong>Resolution:</strong> Actions are executed (quarantine, block, allow) and logged</li>
                  <li><strong>Audit:</strong> All decisions and actions are persisted in the audit log</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Incident States</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li><span style={{ color: 'var(--warning)' }}>PENDING</span> - Awaiting user decision</li>
                    <li><span style={{ color: 'var(--success)' }}>APPROVED</span> - Action allowed to proceed</li>
                    <li><span style={{ color: 'var(--destructive)' }}>REJECTED</span> - Action blocked/quarantined</li>
                    <li><span style={{ color: 'var(--muted)' }}>RESOLVED</span> - Incident closed after action</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="quarantine" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Quarantine System</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>Suspicious files are moved to an encrypted quarantine vault:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li>Location: <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>~/.aiss/quarantine/</code></li>
                  <li>Files are XOR-encoded to prevent execution</li>
                  <li>Metadata preserved: original path, timestamp, hash</li>
                  <li>Restore available through dashboard or CLI</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Restoring Files</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Use the dashboard quarantine page to review and restore files. Each restore requires confirmation and is logged to the audit trail.</p>
                </div>
              </div>
            </section>

            <section id="hardware" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Hardware Detection</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>AISS enumerates and monitors hardware devices:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li>CPU: Cores, model, utilization</li>
                  <li>Memory: Total, available, usage percentage</li>
                  <li>Storage: Disks, volumes, usage, filesystem type</li>
                  <li>Removable Media: USB drives, external disks (change detection)</li>
                  <li>Network Adapters: Interfaces, MAC addresses, IP configuration</li>
                  <li>Display/GPU: Where available via system queries</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Removable Media Response</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>When suspicious removable media is detected:</p>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li>Volume is scanned for known threat patterns (EICAR, suspicious extensions)</li>
                    <li>Suspicious files are quarantined</li>
                    <li>Volume access may be restricted where OS permissions allow</li>
                    <li>Event is logged with hardware identifiers (serial, vendor)</li>
                  </ul>
                  <p className="mt-2" style={{ fontSize: '12px', color: 'var(--warning)', fontFamily: 'Inter, sans-serif' }}>Note: Physical hardware blocking requires kernel drivers. AISS can only detect and quarantine at the file/process level.</p>
                </div>
              </div>
            </section>

            <section id="network" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Network Monitoring</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>Real-time network visibility:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li><strong>Active Connections:</strong> Established TCP/UDP connections with remote endpoints</li>
                  <li><strong>Listening Ports:</strong> Services accepting inbound connections</li>
                  <li><strong>Exposed Interfaces:</strong> Network interfaces with public IPs</li>
                  <li><strong>Network Devices:</strong> ARP/neighbour table enumeration (local devices)</li>
                  <li><strong>Connection Logs:</strong> Historical connection events and anomalies</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Anomaly Detection</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Baseline monitoring detects:</p>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li>New remote endpoints not seen before</li>
                    <li>Unusual port usage</li>
                    <li>Sudden connection spikes</li>
                    <li>Connections to known-malicious IPs (if threat feed configured)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="wifi" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Wi-Fi Discovery</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>Wi-Fi network enumeration (platform-dependent):</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li><strong>Windows:</strong> Uses <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>netsh wlan show networks</code></li>
                  <li><strong>macOS:</strong> Uses <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s</code></li>
                  <li><strong>Linux:</strong> Uses <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>nmcli device wifi list</code> or <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>iwlist scan</code></li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Data Shown</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li>Connected SSID and BSSID</li>
                    <li>Nearby networks (SSID, signal strength, channel where available)</li>
                    <li>Connection security type (WPA2, WPA3, Open)</li>
                  </ul>
                </div>
                <p className="mt-2" style={{ fontSize: '12px', color: 'var(--warning)', fontFamily: 'Inter, sans-serif' }}>Note: Some platforms require elevated permissions for full Wi-Fi enumeration. If unavailable, the dashboard will show a clear error message.</p>
              </div>
            </section>

            <section id="testing" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Authorized Testing</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>AISS includes safe, authorized security testing capabilities:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li><strong>EICAR Test File:</strong> Standard antivirus test string to verify detection</li>
                  <li><strong>Synthetic Events:</strong> Generate scored events to test Security Gate decisions</li>
                  <li><strong>Baseline Simulation:</strong> Simulate anomaly conditions to test alerts</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Running Tests</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Use the dashboard testing page or CLI to run authorized simulations. These are harmless, local-only tests designed to verify detection and response mechanisms.</p>
                </div>
                <p className="mt-2" style={{ fontSize: '12px', color: 'var(--destructive)', fontFamily: 'Inter, sans-serif' }}>Warning: Never use AISS for unauthorized offensive activity against third-party systems.</p>
              </div>
            </section>

            <section id="data" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Data & Logs</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif' }}>All AISS data is stored locally:</p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li><strong>Database:</strong> <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>~/.aiss/db.json</code> (metrics, incidents, alerts, settings)</li>
                  <li><strong>Logs:</strong> <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>~/.aiss/aiss.log</code> (agent runtime logs)</li>
                  <li><strong>Quarantine:</strong> <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>~/.aiss/quarantine/</code> (XOR-encoded suspicious files)</li>
                  <li><strong>Token:</strong> <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>~/.aiss/token</code> (local access token for API authentication)</li>
                </ul>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Exporting Data</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Use the dashboard export functionality or directly access <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>~/.aiss/db.json</code> to backup or analyze collected data. The JSON format is human-readable and can be imported into other tools.</p>
                </div>
              </div>
            </section>

            <section id="troubleshooting" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Troubleshooting</h2>
              <div className="space-y-4" style={{ color: 'var(--muted2)' }}>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>'aiss' command not found</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Restart your terminal after installation. PATH changes require a new session.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>Dashboard doesn't open</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>Check if AISS is running with <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>aiss status</code> and view logs with <code style={{ background: 'rgba(255,255,255,0.5)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'ui-monospace, "SF Mono, Menlo, monospace' }}>aiss logs</code></p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>High CPU usage</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif' }}>This is normal during initial baseline scan (first 2-3 minutes). Check settings to reduce scan frequency.</p>
                </div>
              </div>
            </section>

            <section id="limitations" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>What AISS Can & Cannot Do</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--success)', fontFamily: 'Inter, sans-serif' }}>✓ What AISS Can Do</h3>
                  <ul className="space-y-2" style={{ color: 'var(--muted2)', fontFamily: 'Inter, sans-serif' }}>
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
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--destructive)', fontFamily: 'Inter, sans-serif' }}>✗ What AISS Cannot Do</h3>
                  <ul className="space-y-2" style={{ color: 'var(--muted2)', fontFamily: 'Inter, sans-serif' }}>
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

