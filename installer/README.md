# AISS Installation Guide

## Quick Installation

1. **Extract the ZIP file** to any location on your computer
2. **Double-click `Setup.cmd`** to launch the AISS Setup Wizard
3. **Follow the installation wizard**:
   - Accept the license agreement
   - Choose installation location (default recommended)
   - Select tasks:
     - ✅ Add 'aiss' command to PATH (HIGHLY RECOMMENDED)
     - ✅ Create desktop shortcut
     - ✅ Create Start Menu shortcut
     - ✅ Install as Windows Service (auto-start)
4. **Click Install** and wait for completion
5. **Click Finish** to launch AISS (optional)

## After Installation

Open a NEW Command Prompt or PowerShell and simply type:

```bash
aiss
```

The dashboard will automatically open at http://127.0.0.1:8179

## System Requirements

- Windows 10 or 11 (64-bit)
- 4 GB RAM minimum
- 500 MB disk space
- Administrator rights for installation

## What's Included

- AISS security engine with real-time monitoring
- AI-powered threat detection (local + optional cloud)
- Process and network monitoring
- File quarantine system
- Web dashboard at localhost:8179
- Command-line interface with 15+ commands

## Common Commands

```bash
aiss              # Start AISS and open dashboard
aiss stop         # Stop AISS
aiss status       # Check status
aiss logs         # View logs
aiss scan [path]  # Scan a directory
aiss --help       # Show all commands
```

## Troubleshooting

### 'aiss' command not found
- Restart your Command Prompt or PowerShell
- PATH changes require a new terminal session

### Dashboard doesn't open
- Check if AISS is running: `aiss status`
- Check logs: `aiss logs`
- Ensure port 8179 is not in use

### Installation fails
- Run as Administrator
- Check that you have enough disk space
- Temporarily disable antivirus during installation

## Uninstallation

1. Open "Apps & Features" in Windows Settings
2. Find "AISS" and click Uninstall
3. Or run: `aiss uninstall` from Command Prompt

## Data Privacy

- AISS runs entirely on your local machine
- All data stays on your computer
- No telemetry or data collection
- No data is sent to external servers (except optional AI cloud features)

## Support

For issues or questions, visit: https://github.com/your-repo/aiss

---

**AISS - Agentic AI Security System v1.0.0**
Your data never leaves your computer.
