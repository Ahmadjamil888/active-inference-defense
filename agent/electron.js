import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
let tray = null;
let agentProcess = null;
const PORT = 8179;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'public', 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the local dashboard
  mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent external navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://127.0.0.1:')) {
      event.preventDefault();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public', 'icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Dashboard', click: () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createWindow();
      }
    }},
    { label: 'Status: Running', enabled: false },
    { type: 'separator' },
    { label: 'Start Agent', click: startAgent },
    { label: 'Stop Agent', click: stopAgent },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      stopAgent();
      app.quit();
    }}
  ]);

  tray.setToolTip('AISS - Security Monitoring');
  tray.setContextMenu(contextMenu);
}

function startAgent() {
  if (agentProcess) return;

  const agentPath = path.join(__dirname, 'bin', 'aiss.js');
  agentProcess = spawn('node', [agentPath, '__daemon'], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  agentProcess.stdout.on('data', (data) => {
    console.log(`Agent: ${data}`);
  });

  agentProcess.stderr.on('data', (data) => {
    console.error(`Agent Error: ${data}`);
  });

  agentProcess.on('close', (code) => {
    console.log(`Agent exited with code ${code}`);
    agentProcess = null;
  });

  // Wait for agent to start
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);
    }
  }, 2000);
}

function stopAgent() {
  if (agentProcess) {
    agentProcess.kill();
    agentProcess = null;
  }
}

app.whenReady().then(() => {
  createTray();
  startAgent();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on Windows when all windows closed - keep in tray
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
});

app.on('before-quit', () => {
  stopAgent();
});

// Auto-updater could be added here
// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
