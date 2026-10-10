# Building AISS Standalone EXE

This guide explains how to build AISS into a standalone Windows EXE that users can download and run without any separate Node.js installation.

## Option 1: Using pkg (Recommended for Simple EXE)

pkg bundles Node.js and your application into a single executable file.

### Prerequisites

```bash
cd agent
npm install
```

### Build Commands

```bash
# Build for Windows 64-bit
npm run build:pkg

# The output will be in: dist/aiss-win.exe
```

### Output

- Single EXE file (~80-100MB)
- Includes Node.js runtime
- Includes all dependencies
- No separate installation needed

### Testing

```bash
# Test the built EXE
.\dist\aiss-win.exe
```

## Option 2: Using Electron (Recommended for Desktop App)

Electron creates a full desktop application with installer.

### Prerequisites

```bash
cd agent
npm install
```

### Build Commands

```bash
# Build Electron app
npm run build:electron

# The output will be in: electron-dist/
```

### Output

- Windows installer (NSIS) (~150MB)
- Portable EXE (~150MB)
- Native desktop application
- System tray integration
- Auto-start capability

### Testing

```bash
# Test in development mode
npm run electron:dev
```

## Option 3: Using PowerShell Installer (Current)

The existing PowerShell installer (`installer/AISS-Setup.ps1`) already handles:

1. Checking for Node.js
2. Downloading Node.js if not found
3. Copying agent files
4. Installing dependencies
5. Creating shortcuts
6. Registering uninstaller

### Building the Installer Package

```bash
# Create a ZIP file with:
# - installer/ folder
# - agent/ folder
# - README.txt

# Users extract and run Setup.cmd
```

## Distribution

### For Public Release

1. **Build with pkg** (simpler, smaller):
   ```bash
   cd agent
   npm run build:pkg
   ```
   Upload `dist/aiss-win.exe` to your website

2. **Update download link** in `src/routes/index.tsx`:
   ```tsx
   <a href="/downloads/aiss-win.exe" download>
   ```

3. **Create digital signature** (recommended):
   ```bash
   signtool sign /f your-cert.pfx dist\aiss-win.exe
   ```

### For Enterprise Distribution

1. **Build with Electron** (full desktop app):
   ```bash
   cd agent
   npm run build:electron
   ```
   Upload `electron-dist/AISS Setup 1.0.0.exe` to your download server

2. **Customize branding** in `agent/package.json`:
   ```json
   "build": {
     "appId": "com.yourcompany.aiss",
     "productName": "YourAISS",
     ...
   }
   ```

## Important Notes

### pkg Build Limitations

- **SQLite limitation**: `better-sqlite3` is a native module and may not work correctly with pkg
- **Workaround**: Use pure JavaScript alternatives or pre-compile native modules
- **Current status**: The agent uses `better-sqlite3` - test thoroughly with pkg build

### Electron Advantages

- Better native module support
- Full desktop app experience
- System tray integration
- Native notifications
- Auto-start on boot

### Current Recommendation

For now, use the **PowerShell installer** approach (Option 3) which:
- Works reliably with native modules
- Doesn't require bundling
- Can be easily distributed as a ZIP file
- Users run `Setup.cmd` to install

## Quick Start for Testing

```bash
# Navigate to agent folder
cd agent

# Install dependencies
npm install

# Test CLI
node bin\aiss.js

# Test if it works
# Then build for distribution
npm run build:pkg
```

## File Size Estimates

- **pkg EXE**: ~80-100 MB (includes Node.js runtime)
- **Electron EXE**: ~150-200 MB (includes Chromium)
- **PowerShell installer**: ~50 KB (installer script, downloads Node.js)
- **Full ZIP (installer + agent)**: ~5-10 MB (Node.js downloaded during install)

## Verification Checklist

Before distributing:

- [ ] Test the EXE on a clean Windows machine
- [ ] Verify dashboard opens at http://127.0.0.1:8179
- [ ] Test all CLI commands work
- [ ] Verify quarantine/restore functionality
- [ ] Check that sensors work (processes, network, files)
- [ ] Test that AI analysis functions (local and cloud fallback)
- [ ] Verify logs are written correctly
- [ ] Test service installation (Windows)
- [ ] Check uninstaller removes all files
