# AISS - Agentic AI Security System

AISS is a local-first, agentic AI security system that monitors your computer in real-time. It watches processes, network connections, and files—detecting threats before they spread using active inference and deterministic security rules.

## 🛡️ What AISS Can Do

- **Real-Time Monitoring**: Watch processes, network connections, and files as they happen
- **AI-Powered Analysis**: Active inference engine learns your system's normal behavior and flags suspicious activity
- **Security Gate**: Risk-scoring engine (0-100) with ALLOW/HOLD/QUARANTINE/BLOCK decisions
- **File Quarantine**: Automatically quarantine suspicious files in an encrypted vault
- **Incident Lifecycle**: Full threat management from detection through remediation
- **Privacy First**: All data stays on your machine. No telemetry, no cloud uploads, no data collection

## ⚠️ What AISS Cannot Do

- **Pre-execution blocking**: True pre-execution blocking requires OS-level kernel drivers. AISS acts within seconds of execution.
- **Network firewall control**: AISS can detect but cannot directly modify system firewall rules (requires elevated privileges).
- **Memory scanning**: AISS does not scan memory for injected code (requires kernel-level access).
- **Cloud sync**: All data is local. Optional cloud sync requires manual configuration.

## 📋 System Requirements

- **OS**: Windows 10/11 (64-bit), macOS 12+, or Linux (Ubuntu 20.04+)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk**: 500 MB free space
- **Node.js**: 18+ (for development only)
- **Privileges**: Administrator/root required for installation and enforcement features

## 🚀 Installation

### Windows

1. Download `AISS-Setup.exe` from the website
2. Run the installer as Administrator
3. Follow the wizard:
   - Accept the license agreement
   - Choose installation location (default: `%LOCALAPPDATA%\Programs\AISS`)
   - Select tasks:
     - ✅ Add 'aiss' command to PATH (recommended)
     - ✅ Create desktop shortcut
     - ✅ Install as Windows Service (auto-start on boot)
4. Click Install and wait for completion
5. Open a NEW Command Prompt and type:
   ```bash
   aiss
   ```

The dashboard will automatically open at http://127.0.0.1:8179

### macOS / Linux

```bash
# Clone the repository
git clone https://github.com/your-repo/aiss.git
cd aiss/agent

# Install globally
npm install -g .

# Start AISS
aiss
```

## 💻 CLI Commands

```bash
aiss              # Start AISS and open dashboard
aiss start         # Start AISS in background
aiss stop          # Stop AISS
aiss status        # Check if AISS is running
aiss open          # Open the dashboard in browser
aiss logs          # View recent logs
aiss install       # Install as Windows/macOS/Linux service
aiss uninstall     # Remove service installation
aiss --help        # Show all commands
```

## 🎯 How It Works

### Architecture

AISS has two main components:

1. **Local Agent** (Node.js, runs on your machine)
   - Monitors processes, network, files in real-time
   - Stores data locally in SQLite
   - Serves the dashboard at http://127.0.0.1:8179
   - Binds ONLY to 127.0.0.1 (localhost) for security

2. **Dashboard** (HTML/JS, served by local agent)
   - Single-page application
   - Connects to local agent via WebSocket
   - No external dependencies after installation

### Security Gate

Every event is risk-scored (0-100) based on:

- **Deterministic rules**: Known bad patterns (EICAR, obfuscated PowerShell, etc.)
- **Baseline anomaly detection**: Deviations from learned normal behavior
- **Known-bad hash list**: SHA-256 signatures of known malware

**Decisions**:
- **ALLOW** (0-20): Log only
- **HOLD** (20-45): Suspend and wait for approval
- **QUARANTINE** (45-70): Move to encrypted vault
- **BLOCK** (70-100): Kill process and flag for firewall rule

### Incident Lifecycle

Threats follow this pipeline:

1. **Detect**: Sensor identifies suspicious activity
2. **Isolate**: Suspend process, cut network access
3. **Analyze**: Collect process tree, files, connections
4. **Contain**: Block hashes, quarantine files
5. **Remediate**: Remove persistence, delete/restore files (requires approval)
6. **Verify**: Re-scan to confirm threat is gone
7. **Learn**: Update baseline and rule set

All destructive actions (file deletion, service stop, network cutoff) require your approval in the dashboard.

## 🔧 Configuration

Settings are stored in `~/.aiss/db.json` and can be configured via the dashboard:

- **Gate Thresholds**: Adjust risk score thresholds for ALLOW/HOLD/QUARANTINE/BLOCK
- **Enforcement Mode**: Toggle automatic quarantine/blocking vs. monitor-only
- **Allowlist**: Add trusted paths, hashes, or process names
- **AI Reasoning**: Enable/disable AI analysis (local only by default)
- **Scan Schedule**: Configure automatic scan intervals
- **Data Retention**: Set how long to keep logs and events

## 📊 Dashboard Pages

- **Overview**: Security score, active threats, system health charts
- **Threats**: Live feed of scored events with filters
- **Alerts**: Alert triage with acknowledge/dismiss/escalate
- **Network**: Active connections, listening ports, exposed services
- **Vulnerabilities**: Local exposure scan results
- **Assets**: Monitored machines and devices
- **Incidents**: Full incident lifecycle with approval workflow
- **Reports**: Export data as CSV/JSON
- **Settings**: Configure gate thresholds, enforcement, allowlist
- **Health**: Service status, uptime, and restart controls

## 🔒 Security & Privacy

- **Local Only**: All data stays on your machine
- **No Telemetry**: No data collection or analytics
- **Localhost Only**: Dashboard binds to 127.0.0.1 only
- **Access Token**: Random token generated at install time
- **Encrypted Quarantine**: Files are XOR-encoded in quarantine
- **Append-Only Logs**: Audit log cannot be modified
- **Open Source**: Full code transparency

## 🧪 Testing

Run the test USB simulation:

```bash
aiss
# Then in the dashboard, click "Inject Corrupted USB"
```

This creates a test folder with EICAR test file and malicious patterns to demonstrate detection.

## 🐛 Troubleshooting

### 'aiss' command not found
- Restart your terminal after installation
- Check that installation directory is in PATH
- Try running from the installation directory directly

### Dashboard doesn't open
- Check if AISS is running: `aiss status`
- Check logs: `aiss logs`
- Ensure port 8179 is not in use by another application

### High CPU usage
- This is normal during initial baseline scan (first 2-3 minutes)
- Check settings to reduce scan frequency
- Exclude large directories from monitoring

### Installation fails
- Run installer as Administrator
- Temporarily disable antivirus during installation
- Check for sufficient disk space

## 📁 File Locations

- **Windows**: `%LOCALAPPDATA%\Programs\AISS`
- **macOS/Linux**: `~/.aiss`
- **Database**: `~/.aiss/db.json`
- **Logs**: `~/.aiss/aiss.log`
- **Quarantine**: `~/.aiss/quarantine/`
- **Access Token**: `~/.aiss/token`

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- EICAR test file for antivirus testing
- Node.js ecosystem for local monitoring
- Active inference research community

---

**AISS v1.0.0** - Your data never leaves your computer.
