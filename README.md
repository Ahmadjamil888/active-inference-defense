# AISS - Agentic AI Security System

AISS is a local-first, agentic AI security system that monitors your computer in real-time. It watches processes, network connections, and files, detecting threats before they spread using active inference and deterministic security rules.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Component Documentation](#component-documentation)
   - [CLI Module (aiss.js)](#cli-module-aissjs)
   - [Engine Module (engine.js)](#engine-module-enginejs)
   - [Sensors Module (sensors.js)](#sensors-module-sensorsjs)
   - [Server Module (server.js)](#server-module-serverjs)
   - [Store Module (store.js)](#store-module-storejs)
   - [Scanner Module (scanner.js)](#scanner-module-scannerjs)
   - [AI Module (ai.js)](#ai-module-aijs)
   - [Server Attacks Module (server-attacks.js)](#server-attacks-module-server-attacksjs)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Security Model](#security-model)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

AISS operates as a daemon process that continuously monitors system state, applies active inference to detect anomalies, and enforces security decisions through a configurable gate mechanism. The system is designed with the following principles:

- Local-first architecture: All data processing and storage occurs on the local machine
- Privacy-preserving: No telemetry, cloud uploads, or data collection
- Active inference: Uses probabilistic models to learn normal system behavior
- Deterministic rules: Employs signature-based detection for known threats
- Incident lifecycle: Full threat management from detection through remediation

### Core Capabilities

- Real-time process monitoring with CPU and memory tracking
- Network connection analysis and listening port detection
- File system scanning with signature and content-based detection
- USB/removable media detection and automatic scanning
- Active inference-based anomaly detection
- Configurable security gate with risk scoring (0-100)
- File quarantine with XOR-encoding neutralization
- WebSocket-based real-time dashboard updates
- Comprehensive logging and event tracking

### Limitations

- Pre-execution blocking: True pre-execution blocking requires OS-level kernel drivers. AISS acts within seconds of execution.
- Network firewall control: AISS can detect but cannot directly modify system firewall rules (requires elevated privileges).
- Memory scanning: AISS does not scan memory for injected code (requires kernel-level access).
- Cloud sync: All data is local. Optional cloud sync requires manual configuration.

---

## Architecture

AISS consists of a layered architecture with clear separation of concerns:

### Layer 1: CLI Interface (aiss.js)
- Entry point for all user interactions
- Process lifecycle management (start, stop, status)
- Browser launch control with lock mechanism
- Windows Service installation/uninstallation
- Daemon process spawning with proper signal handling

### Layer 2: Engine (engine.js)
- Core orchestration layer
- Active inference belief maintenance
- Security gate decision logic
- Incident lifecycle management
- Health check coordination
- Event emission to dashboard clients

### Layer 3: Sensors (sensors.js)
- Platform-specific system data collection
- CPU, memory, disk usage monitoring
- Process and network connection enumeration
- USB/removable volume detection
- WiFi and network device discovery
- Hardware enumeration
- System log collection

### Layer 4: Scanner (scanner.js)
- File system traversal with depth-first search
- SHA-256 hash computation
- Signature-based detection (EICAR test file)
- Content-based rule matching (PowerShell obfuscation, reverse shells, etc.)
- Double-extension detection
- Quarantine implementation with XOR-encoding

### Layer 5: Store (store.js)
- Append-only JSON database
- In-memory caching with periodic persistence
- Automatic data retention (trimming of old records)
- Settings management
- Transaction-like dirty flag pattern

### Layer 6: Server (server.js)
- HTTP server with SSE (Server-Sent Events) support
- RESTful API for dashboard communication
- Token-based authentication
- WebSocket-like event streaming
- Attack simulation endpoints
- Export functionality

### Layer 7: AI Module (ai.js)
- Cloud-based threat analysis
- Timeout-controlled HTTP requests
- Graceful degradation on failure
- Integration with Lovable AI gateway

### Layer 8: Server Attacks (server-attacks.js)
- Attack simulation framework
- Port scanning simulation
- Process injection simulation
- Network reconnaissance simulation
- Service enumeration simulation
- Vulnerability scanning simulation

---

## Component Documentation

### CLI Module (aiss.js)

**File Path:** `agent/bin/aiss.js`

**Purpose:** Command-line interface for AISS, handling user commands, process lifecycle, daemon spawning, and browser management.

#### Global Constants

```javascript
const PORT = Number(process.env.AISS_PORT || 8179);
```
- Default port 8179 for the dashboard server
- Configurable via AISS_PORT environment variable
- Binds exclusively to 127.0.0.1 for security

```javascript
const PID = path.join(HOME, "aiss.pid");
```
- Path to the process ID file
- Used to detect if AISS is already running
- Stores the daemon process PID

```javascript
const TOKEN_FILE = path.join(HOME, "token");
```
- Path to the access token file
- Contains randomly generated 24-byte hex token
- Used for dashboard authentication

```javascript
const LOG = path.join(HOME, "aiss.log");
```
- Path to the log file
- Contains daemon output when running in background
- Used for troubleshooting

```javascript
const BROWSER_LOCK = path.join(HOME, "browser.lock");
```
- Path to the browser lock file
- Contains timestamp of last browser open
- Prevents multiple browser windows within 3-second window

```javascript
const cmd = process.argv[2] || "start";
```
- Extracts command from command-line arguments
- Defaults to "start" if no command provided
- Supports: start, stop, status, open, logs, help, install, uninstall

#### Color Utility Functions

```javascript
const c = (n) => (s) => `\x1b[${n}m${s}\x1b[0m`;
```
- ANSI color code generator
- Takes color code number and returns formatting function
- Common codes: 31 (red), 32 (green), 33 (yellow), 34 (blue), 35 (magenta), 36 (cyan), 97 (white), 2 (dim), 1 (bold)

#### banner() Function

**Purpose:** Displays ASCII art banner with AISS branding

**Execution Flow:**
1. Defines array of 6 ASCII art lines in cyan color
2. Prints each line to console
3. Prints version information and tagline
4. Uses color utility functions for formatting

**Output:**
```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝

    ◆ Agentic AI Security System v1.0.0
    ◆ Intelligence Designed To Defend
```

#### token() Function

**Purpose:** Generates or retrieves secure access token

**Execution Flow:**
1. Creates HOME directory if it does not exist
2. Checks if TOKEN_FILE exists
3. If not, generates 24 random bytes using crypto.randomBytes()
4. Converts to hex string and writes to file with mode 0o600 (owner read/write only)
5. Reads and returns token from file

**Security Considerations:**
- Uses cryptographically secure random number generator
- File permissions restricted to owner only
- Token persists across restarts for dashboard authentication

#### alive(pid) Function

**Purpose:** Checks if a process with given PID is running

**Parameters:**
- `pid`: Process ID to check

**Execution Flow:**
1. Attempts to send signal 0 to the process (no-op signal)
2. If successful, process is alive, returns true
3. If exception thrown (ESRCH - no such process), returns false

**Implementation Detail:**
- Uses process.kill(pid, 0) which does not actually kill the process
- Signal 0 is used for existence checking only
- Throws exception if process does not exist

#### runningPid() Function

**Purpose:** Retrieves PID of running AISS daemon if active

**Execution Flow:**
1. Attempts to read PID file
2. Parses content as number
3. If PID exists and process is alive (via alive() check), returns PID
4. If file missing, corrupt, or process dead, returns null

**Return Value:**
- `number`: PID of running daemon if active
- `null`: No daemon running

#### openBrowser(url) Function

**Purpose:** Opens URL in default browser with rate limiting

**Parameters:**
- `url`: URL to open

**Execution Flow:**
1. Attempts to read BROWSER_LOCK file
2. If lock exists and timestamp is within 3000ms (3 seconds) of current time, returns immediately
3. Determines platform-specific browser launch command:
   - Windows: `cmd /c start /b url` (background mode, no new window)
   - macOS: `open url`
   - Linux: `xdg-open url`
4. Spawns process with detached flag, ignoring all stdio streams
5. Sets windowsHide: true on Windows to prevent console window
6. Sets shell: false to prevent shell spawning
7. Writes current timestamp to BROWSER_LOCK file
8. Unrefs child process to allow parent to exit

**Security Fix:**
- Uses `/b` flag on Windows to prevent new CMD window
- Sets windowsHide: true to suppress any console windows
- Sets shell: false to prevent shell spawning
- Ignores all stdio streams to prevent output capture

**Rate Limiting:**
- Prevents multiple browser opens within 3-second window
- Timestamp-based lock file mechanism
- Persists across invocations

#### sleep() Function

**Purpose:** Promise-based delay utility

**Parameters:**
- `ms`: Milliseconds to delay

**Implementation:**
```javascript
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
```

#### step() Function

**Purpose:** Async function with spinner animation for progress feedback

**Parameters:**
- `label`: Text description of the step
- `fn`: Async function to execute

**Execution Flow:**
1. Defines spinner characters array: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
2. Sets up interval that fires every 80ms
3. On each tick, writes carriage return + spinner character + dimmed label
4. Increments spinner index with modulo to cycle through characters
5. Attempts to execute the async function
6. On success: clears interval, writes green checkmark + white label
7. On failure: clears interval, writes red X + red label, throws error

**Visual Output:**
- During execution: `⠋ Loading active-inference kernel` (spinning)
- On success: `✓ Loading active-inference kernel`
- On failure: `✗ Loading active-inference kernel`

#### box() Function

**Purpose:** Displays text in a bordered ASCII box

**Parameters:**
- `text`: Content to display (supports newlines)
- `title`: Optional title for top border

**Execution Flow:**
1. Splits text into lines
2. Calculates width as max line length + 4 (for padding and borders)
3. Generates border string of dashes
4. Prints top border
5. If title provided, prints title row with padding
6. For each line, prints left border, padded content, right border
7. Prints bottom border

**Visual Output:**
```
┌─────────────────────────────────┐
│ Quick Commands                   │
├─────────────────────────────────┤
│ Dashboard: http://127.0.0.1:8179│
│ Logs:      aiss logs             │
│ Stop:      aiss stop             │
│ Status:   aiss status            │
└─────────────────────────────────┘
```

#### daemon() Function

**Purpose:** Main daemon process that runs AISS engine

**Execution Flow:**
1. Loads database from store
2. Dynamically imports server.js to get serve function
3. Dynamically imports engine.js to get start function
4. Writes current process PID to PID file
5. Starts HTTP server on configured port with token
6. Starts active inference engine
7. Sets up cleanup function:
   - Saves database to disk
   - Deletes PID file
   - Deletes browser lock file
   - Exits process with code 0
8. Registers cleanup function for SIGINT (Ctrl+C)
9. Registers cleanup function for SIGTERM (termination signal)

**Signal Handling:**
- SIGINT: User-initiated interrupt (Ctrl+C)
- SIGTERM: System-initiated termination
- Both trigger graceful shutdown with cleanup

#### start() Function

**Purpose:** Starts AISS daemon (either foreground or background)

**Parameters:**
- `foreground`: Boolean flag to run in foreground mode

**Execution Flow:**
1. Displays banner
2. Constructs dashboard URL
3. Checks if daemon already running via runningPid()
4. If already running:
   - Displays success message with URL
   - Shows available commands (stop, logs, open)
   - Waits for dashboard to become available (up to 3 seconds)
   - Opens browser
   - Returns immediately
5. If not running:
   - Displays initialization steps with spinners:
     - "Loading active-inference kernel" (300ms delay)
     - "Generating secure access token" (generates token)
     - "Initializing sensors" (200ms delay)
     - "Configuring security gate" (150ms delay)
   - If foreground:
     - Starts daemon in foreground via step()
   - If background:
     - Spawns detached child process with __daemon argument
     - Redirects stdout/stderr to log file
     - Sets windowsHide: true on Windows
     - Waits up to 6 seconds for daemon to start
     - Checks runningPid() repeatedly every 150ms
     - If daemon fails to start, throws error with log file path
   - Waits for dashboard to become available (up to 6 seconds)
   - Fetches URL repeatedly every 200ms until HTTP 200 response
   - Opens browser
   - Displays success message with quick command reference
   - Shows tip about background operation

**Background Spawning Details:**
- Uses spawn() with detached: true
- Child process becomes independent of parent
- Stdio ignored for stdin, redirected to log file for stdout/stderr
- windowsHide: true prevents console window on Windows
- Parent unrefs child to allow it to continue running

#### installService() Function

**Purpose:** Installs AISS as Windows Service for auto-start on boot

**Execution Flow:**
1. Displays banner
2. Checks if platform is Windows (win32)
3. If not Windows, displays error and exits
4. Dynamically imports node-windows module
5. Creates Service instance with:
   - Name: "AISS Security"
   - Description: "AISS - Agentic AI Security System"
   - Script: Path to aiss.js (converted from file:// URL)
   - Node options: --max-old-space-size=4096 (4GB heap)
6. Sets up event handlers:
   - "install": Logs success, starts service
   - "start": Logs success with auto-start message
   - "error": Logs error message
7. Executes service installation via step()
8. Waits for install event to resolve
9. On error, displays installation failure message

**Requirements:**
- Windows operating system
- Administrator privileges
- node-windows npm package installed

#### uninstallService() Function

**Purpose:** Removes AISS Windows Service

**Execution Flow:**
1. Displays banner
2. Checks if platform is Windows
3. If not Windows, displays error and exits
4. Dynamically imports node-windows module
5. Creates Service instance with same configuration as install
6. Stops service via step() (waits for stop event)
7. Unregisters service via step() (waits for uninstall event)
8. Displays success message

**Cleanup:**
- Service is stopped before uninstallation
- Service registration is removed from Windows Service Control Manager
- Auto-start on boot is disabled

#### Command Switch Statement

**Purpose:** Dispatches CLI commands to appropriate handlers

**Commands:**

1. `__daemon`: Internal command for daemon process
   - Calls daemon() function
   - Never invoked by user directly

2. `start` or `run`: Start AISS
   - Calls start(process.argv.includes("--foreground"))
   - Checks for --foreground flag to determine mode

3. `stop`: Stop AISS daemon
   - Retrieves running PID via runningPid()
   - If PID exists, sends SIGTERM to process
   - Displays success message
   - If no PID, displays "not running" message

4. `status`: Check AISS status
   - Displays banner
   - Retrieves running PID via runningPid()
   - If running:
     - Displays success message
     - Shows PID, port, dashboard URL
     - Shows operational status
   - If not running:
     - Displays error message
     - Shows start command

5. `open`: Open dashboard in browser
   - Checks if AISS is running via runningPid()
   - If not running, displays error and exit
   - Waits for dashboard availability (up to 3 seconds)
   - Opens browser via openBrowser()

6. `logs`: View recent logs
   - Reads log file
   - Displays last 60 lines
   - If no log file, displays "No logs yet"

7. `help`, `--help`, `-h`: Display help
   - Displays banner
   - Shows comprehensive command reference
   - Shows options
   - Shows data locations

8. `install`: Install as Windows Service
   - Calls installService()

9. `uninstall`: Remove Windows Service
   - Calls uninstallService()

10. Default: Unknown command
    - Displays banner
    - Shows usage syntax
    - Lists available commands
    - Shows available options
    - Shows help command reference

---

### Engine Module (engine.js)

**File Path:** `agent/src/engine.js`

**Purpose:** Core orchestration layer implementing active inference, security gate decision logic, incident lifecycle management, and health monitoring.

#### Global Constants

```javascript
const QUARANTINE = path.join(HOME, "quarantine");
```
- Path to quarantine directory
- Stores neutralized malicious files
- Files are XOR-encoded to prevent execution

```javascript
const belief = {
  cpu: { mu: 15, sigma: 12 },
  mem: { mu: 50, sigma: 15 },
  procs: { mu: 150, sigma: 30 },
  conns: { mu: 40, sigma: 20 },
};
```
- Initial beliefs for active inference
- mu: mean (expected value)
- sigma: standard deviation (uncertainty)
- Used for anomaly detection via z-score calculation

```javascript
const LR = 0.08;
```
- Learning rate for belief updates
- Controls how quickly beliefs adapt to new data
- Lower = slower adaptation, higher = faster adaptation
- Value 0.08 balances stability and responsiveness

```javascript
const GATE_THRESHOLDS = {
  low: 20,
  medium: 45,
  high: 70,
};
```
- Default security gate thresholds
- low: Score below 20 = ALLOW
- medium: Score 20-45 = HOLD
- high: Score 45-70 = QUARANTINE
- above high: Score 70+ = BLOCK

#### Global State Variables

```javascript
let knownVolumes = new Set();
```
- Set of previously seen removable volume mount points
- Used to detect newly inserted USB drives
- Prevents repeated scanning of same volume

```javascript
let listeners = [];
```
- Array of event listener functions
- Called via emit() to broadcast engine events
- Used by server to push updates to dashboard

```javascript
let running = false;
```
- Boolean flag indicating if engine is running
- Prevents multiple start() calls
- Returned in state() for dashboard display

```javascript
let ticks = 0;
```
- Counter for engine cycles
- Incremented each tick() execution
- Used for timing periodic operations

```javascript
let startedAt = null;
```
- Timestamp when engine started
- Set on first start() call
- Used for uptime calculation

```javascript
let healthChecks = {
  sensors: { status: "ok", lastCheck: null, errorCount: 0 },
  scanner: { status: "ok", lastCheck: null, errorCount: 0 },
  database: { status: "ok", lastCheck: null, errorCount: 0 },
  network: { status: "ok", lastCheck: null, errorCount: 0 },
};
```
- Health status for each service
- status: "ok" or "error"
- lastCheck: ISO timestamp of last check
- errorCount: Consecutive error count for auto-recovery

#### surprise() Function

**Purpose:** Calculates surprise (free energy) for a metric value

**Parameters:**
- `key`: Metric key (cpu, mem, procs, conns)
- `x`: Observed value

**Execution Flow:**
1. Retrieves belief object for the key
2. Calculates z-score: |x - mu| / max(sigma, 1)
   - Absolute deviation from mean
   - Normalized by standard deviation
   - Minimum sigma of 1 prevents division by zero
3. Calculates free energy bits: 0.5 * z^2
   - Squared prediction error over variance
   - Represents information-theoretic surprise
4. Returns object with z-score and bits

**Mathematical Background:**
- Based on active inference / free energy principle
- Higher z-score = more anomalous
- Squared relationship amplifies large deviations

**Return Value:**
```javascript
{ z: number, bits: number }
```

#### learn() Function

**Purpose:** Updates belief parameters with new observation

**Parameters:**
- `key`: Metric key to update
- `x`: Observed value

**Execution Flow:**
1. Retrieves belief object for the key
2. Updates mean: mu += LR * (x - mu)
   - Exponential moving average
   - Moves mean toward observation
   - Learning rate controls step size
3. Updates standard deviation: sigma = max(3, sigma + LR * (|x - mu| - sigma))
   - Moves sigma toward absolute deviation
   - Minimum sigma of 3 prevents overconfidence
   - Allows belief to expand when variability increases

**Learning Dynamics:**
- Small LR: beliefs change slowly, stable
- Large LR: beliefs adapt quickly, noisy
- Minimum sigma: maintains baseline uncertainty

#### onEvent() Function

**Purpose:** Registers event listener for engine events

**Parameters:**
- `fn`: Function to call on events

**Signature:**
```javascript
fn(type, payload)
```

**Execution Flow:**
1. Pushes listener function to listeners array
2. Returns unsubscribe function
3. Unsubscribe function removes listener from array

**Usage Pattern:**
```javascript
const unsubscribe = E.onEvent((type, payload) => {
  console.log(type, payload);
});
// Later:
unsubscribe();
```

#### emit() Function

**Purpose:** Broadcasts event to all registered listeners

**Parameters:**
- `type`: Event type string
- `payload`: Event data object

**Execution Flow:**
1. Iterates over all listeners in array
2. For each listener:
   - Attempts to call with type and payload
   - Catches and ignores exceptions (listener may be invalid)
3. No return value

**Error Handling:**
- Individual listener failures do not affect others
- Failed listeners remain in array (cleaned on unsubscribe)

#### performHealthCheck() Function

**Purpose:** Performs health check on specified service with auto-recovery

**Parameters:**
- `service`: Service name ("sensors", "scanner", "database", "network")

**Execution Flow:**
1. Records current timestamp in ISO format
2. Attempts service-specific test:
   - sensors: Calls S.cpuUsage() for quick sensor test
   - scanner: Placeholder test (no actual check)
   - database: Calls data() for quick DB test
   - network: Placeholder test (no actual check)
3. On success:
   - Sets status to "ok"
   - Updates lastCheck timestamp
   - Resets errorCount to 0
4. On failure:
   - Sets status to "error"
   - Updates lastCheck timestamp
   - Increments errorCount
   - Stores error message
   - Logs error event
   - If errorCount >= 3:
     - Logs warning about recovery attempt
     - Attempts service-specific recovery:
       - database: Reloads via load() from store.js
     - On recovery success: resets status to "ok", resets errorCount
     - On recovery failure: logs error

**Auto-Recovery Logic:**
- Attempts recovery after 3 consecutive failures
- Database: Reloads entire database file
- Other services: No recovery implemented (placeholder)

#### getHealthStatus() Function

**Purpose:** Returns current health status of all services

**Return Value:**
```javascript
{
  sensors: { status, lastCheck, errorCount },
  scanner: { status, lastCheck, errorCount },
  database: { status, lastCheck, errorCount },
  network: { status, lastCheck, errorCount }
}
```

#### log() Function

**Purpose:** Records event to database and broadcasts to listeners

**Parameters:**
- `level`: Log level ("info", "warn", "error", "critical")
- `source`: Source component ("engine", "sensor", "gate", etc.)
- `message`: Human-readable message
- `meta`: Optional metadata object

**Execution Flow:**
1. Calls push("events", { level, source, message, meta })
   - Creates event record with ID and timestamp
   - Adds to events array in database
   - Trims to 500 most recent events
2. Emits "event" to all listeners with full event row
3. Returns event row

**Return Value:**
```javascript
{
  id: string,
  at: string (ISO timestamp),
  level: string,
  source: string,
  message: string,
  meta: object | null
}
```

#### calculateRiskScore() Function

**Purpose:** Calculates risk score (0-100) from findings and baseline anomaly

**Parameters:**
- `findings`: Array of finding objects with severity field
- `baselineAnomaly`: Optional baseline anomaly score

**Execution Flow:**
1. Initializes score to 0
2. Iterates over findings:
   - critical severity: adds 30 points
   - high severity: adds 20 points
   - medium severity: adds 10 points
   - low severity: adds 5 points
3. Adds baselineAnomaly * 2 to score
4. Caps score at maximum of 100
5. Returns final score

**Scoring Rationale:**
- Critical findings heavily weighted (30 points)
- Baseline anomaly multiplied by 2 for emphasis
- Multiple findings accumulate score
- Cap at 100 prevents overflow

#### getGateDecision() Function

**Purpose:** Determines security gate action based on risk score

**Parameters:**
- `score`: Risk score (0-100)
- `settings`: Optional settings object with custom thresholds

**Execution Flow:**
1. Extracts thresholds from settings or uses defaults:
   - thresh_low: default 20
   - thresh_medium: default 45
   - thresh_high: default 70
2. Compares score to thresholds:
   - score >= thresh_high: returns { action: "BLOCK", reason: "Score X >= Y" }
   - score >= thresh_medium: returns { action: "QUARANTINE", reason: "Score X >= Y" }
   - score >= thresh_low: returns { action: "HOLD", reason: "Score X >= Y" }
   - score < thresh_low: returns { action: "ALLOW", reason: "Score X < Y" }

**Decision Levels:**
- BLOCK (70+): Kill process, flag for firewall rule
- QUARANTINE (45-70): Move file to encrypted vault
- HOLD (20-45): Suspend and wait for approval
- ALLOW (0-20): Log only, no action

#### recordThreat() Function

**Purpose:** Records threat to database with risk scoring and AI analysis

**Parameters:**
- `t`: Threat object (name, rule, severity, file, hash, action, source)

**Execution Flow:**
1. Retrieves current settings from database
2. Calculates risk score using calculateRiskScore()
3. Determines gate decision using getGateDecision()
4. Creates threat record:
   - status: "flagged" if ALLOW, else decision.action.toLowerCase()
   - riskScore: calculated score
   - decision: action string
   - decisionReason: reason string
   - Merges in threat object properties
5. Pushes threat to database via push("threats", ...)
6. Emits "threat" event to all listeners
7. Logs threat event with appropriate level:
   - critical severity: "critical" level
   - other: "warn" level
8. Attempts AI analysis via analyze(threat)
   - 25-second timeout
   - On success: updates threat.ai field, re-emits threat event, logs completion
   - On failure: silently continues (AI not required)
9. Returns threat record

**AI Integration:**
- Non-blocking: threat recorded immediately
- Async analysis: AI verdict added later
- Graceful degradation: works without AI

#### createIncident() Function

**Purpose:** Creates new incident for threat tracking

**Parameters:**
- `threat`: Threat object

**Execution Flow:**
1. Creates incident record:
   - threatId: threat.id
   - stage: "detect"
   - status: "active"
   - timeline: [{ stage: "detect", at: ISO timestamp }]
2. Pushes incident to database via push("incidents", ...)
3. Emits "incident" event to all listeners
4. Logs critical event about incident creation
5. Returns incident record

**Incident Lifecycle Stages:**
- detect: Initial threat detection
- isolate: Suspend process, cut network
- analyze: Collect process tree, files, connections
- contain: Block hashes, quarantine files
- remediate: Remove persistence, delete/restore files
- verify: Re-scan to confirm threat gone
- learn: Update baseline and rule set

#### advanceIncident() Function

**Purpose:** Advances incident to next stage in lifecycle

**Parameters:**
- `incidentId`: Incident ID string
- `stage`: Next stage string

**Execution Flow:**
1. Retrieves current database state
2. Finds incident by ID in incidents array
3. If not found, returns null
4. Updates incident.stage to new stage
5. Pushes new timeline entry: { stage, at: ISO timestamp }
6. If stage is "verify":
   - Sets incident.status to "closed"
   - Logs incident closure
7. Emits "incident" event to all listeners
8. Logs incident advancement
9. Returns updated incident record

**Lifecycle Management:**
- Each stage transition is logged
- Timeline preserved for audit trail
- Closure on "verify" stage

#### tick() Function

**Purpose:** Main engine cycle - collects metrics, updates beliefs, detects anomalies, triggers periodic operations

**Execution Flow:**
1. Increments ticks counter
2. Collects real-time metrics:
   - CPU usage via S.cpuUsage()
   - Memory usage via S.memory()
   - Process list via S.processes()
   - Network connections via S.connections()
   - Volume list via S.volumes()
   - Disk usage via S.disks()
3. Constructs metric object:
   - cpu: CPU percentage (1 decimal place)
   - mem: Memory percentage (1 decimal place)
   - procs: Process count
   - conns: Connection count
4. Calculates surprise for CPU and connections:
   - sCpu: surprise("cpu", metric.cpu)
   - sConn: surprise("conns", metric.conns)
5. Calculates total surprise bits: sCpu.bits + sConn.bits
6. Pushes metric to database via push("metrics", ...)
7. Emits "metric" event with metric, belief, disks, host info
8. Updates beliefs for all metrics via learn():
   - learn("cpu", metric.cpu)
   - learn("mem", metric.mem)
   - learn("procs", metric.procs)
   - learn("conns", metric.conns)
9. Anomaly detection (after 6 ticks to allow baseline):
   - If CPU z-score > 4:
     - Logs warning with top process name
   - If connection z-score > 4:
     - Logs warning with connection count
10. Removable media detection:
    - Iterates over volumes
    - If volume is removable and not in knownVolumes:
      - Adds to knownVolumes
      - If ticks >= 2, logs mount event
      - Runs scan on volume (3000 file limit, "usb" kind)
    - Removes volumes from knownVolumes if no longer present
11. Periodic enhanced data collection (every 60 ticks ~ 4 minutes):
    - Collects WiFi networks via S.wifiNetworks()
    - Collects network devices via S.networkDevices()
    - Collects recent files via S.recentFiles(50)
    - Collects system logs via S.systemLogs()
    - Logs connected WiFi network
    - Logs network device count
    - Filters and logs suspicious executable files
    - Filters and logs system error logs
    - On error: logs collection failure
12. Periodic health checks (every 30 ticks ~ 2 minutes):
    - Performs health check on sensors
    - Performs health check on scanner
    - Performs health check on database
    - Performs health check on network

**Timing Details:**
- Base interval: 4 seconds (set in start())
- 60 ticks = 240 seconds = 4 minutes
- 30 ticks = 120 seconds = 2 minutes
- 6 ticks = 24 seconds (baseline warmup)

**Anomaly Detection Threshold:**
- z-score > 4: considered anomalous
- Corresponds to ~4 standard deviations from mean
- Represents ~0.003% probability under normal distribution

#### runScan() Function

**Purpose:** Executes file system scan with quarantine and threat recording

**Parameters:**
- `root`: Root directory to scan
- `limit`: Maximum files to scan (default 4000)
- `kind`: Scan kind ("manual", "usb", "baseline")

**Execution Flow:**
1. Logs scan start event
2. Calls scanPath(root, limit) to perform scan
3. Initializes contained counter to 0
4. Iterates over findings from scan:
   - Retrieves current settings
   - Calculates risk score for finding
   - Determines gate decision
   - If decision is BLOCK or QUARANTINE:
     - Calls quarantine(finding.file, QUARANTINE)
     - Sets action to "quarantined -> [destination]"
     - Increments contained counter
   - If decision is HOLD:
     - Sets action to "held for approval"
   - On quarantine error: sets action to error message
   - Calls recordThreat() with finding details
5. Creates scan record:
   - root: scanned directory
   - kind: scan kind
   - files: file count
   - findings: finding count
   - contained: contained count
   - ms: scan duration
6. Pushes scan to database via push("scans", ...)
7. Emits "scan" event to all listeners
8. Logs scan completion with severity based on findings
9. Returns scan record

**Quarantine Process:**
- BLOCK and QUARANTINE decisions trigger quarantine
- File moved to ~/.aiss/quarantine/
- XOR-encoded to prevent execution
- Original file deleted

#### checkFile() Function

**Purpose:** Inspects single file for threats

**Parameters:**
- `file`: File path to inspect

**Execution Flow:**
1. Calls inspect(file) from scanner.js
2. Returns findings array

**Use Case:**
- On-demand file inspection
- Right-click scan integration
- Upload scanning

#### state() Function

**Purpose:** Returns complete engine state for dashboard

**Return Value:**
```javascript
{
  host: { hostname, platform, arch, cpus, model, uptime, user, nets },
  belief: { cpu: { mu, sigma }, mem: { mu, sigma }, procs: { mu, sigma }, conns: { mu, sigma } },
  running: boolean,
  started: timestamp,
  counts: { threats: number, scans: number, events: number },
  metrics: array (last 120),
  threats: array (last 100, reversed),
  scans: array (last 50, reversed),
  events: array (last 200, reversed),
  incidents: array (last 20, reversed),
  settings: object,
  placeholder: boolean (true if no threats exist)
}
```

**Data Slicing:**
- Metrics: last 120 entries (8 minutes at 4s interval)
- Threats: last 100 entries
- Scans: last 50 entries
- Events: last 200 entries
- Incidents: last 20 entries
- All arrays reversed for chronological order (newest first)

#### start() Function

**Purpose:** Starts active inference engine with periodic tick loop

**Execution Flow:**
1. Checks if already running
2. If running, returns immediately (no-op)
3. Sets running flag to true
4. Records start timestamp
5. Saves start time to settings via setSetting("startedAt", ...)
6. Logs engine start event
7. Defines loop function:
   - Calls tick()
   - On error: logs sensor cycle failure
8. Calls loop() once immediately
9. Sets interval to call loop() every 4000ms (4 seconds)
10. Stores interval reference for cleanup
11. Schedules baseline scan after 3 seconds:
    - Gets home directory from environment
    - If home exists, runs scan on Downloads folder (1500 file limit, "baseline" kind)
    - Catches and ignores scan errors
12. Returns cleanup function that clears interval

**Baseline Scan:**
- Runs once 3 seconds after engine start
- Scans user's Downloads folder
- Limited to 1500 files for performance
- Establishes initial threat baseline

**Cleanup Function:**
```javascript
const stop = E.start();
// Later:
stop();
```

---

### Sensors Module (sensors.js)

**File Path:** `agent/src/sensors.js`

**Purpose:** Platform-specific system data collection providing real-time monitoring of CPU, memory, processes, network, hardware, and system state.

#### Global Constants

```javascript
const run = promisify(execFile);
```
- Promisified version of child_process.execFile
- Used for executing platform-specific commands
- Returns Promise with stdout and stderr

```javascript
const isWin = process.platform === "win32";
```
- Boolean flag for Windows detection
- Used for platform-specific command selection

```javascript
const isMac = process.platform === "darwin";
```
- Boolean flag for macOS detection
- Used for platform-specific command selection

```javascript
let prevCpu = os.cpus();
```
- Previous CPU state for delta calculation
- Updated each cpuUsage() call
- Used to calculate CPU percentage

#### cpuUsage() Function

**Purpose:** Calculates current CPU usage percentage

**Execution Flow:**
1. Gets current CPU state via os.cpus()
2. Initializes idle and total to 0
3. Iterates over CPU cores:
   - Gets previous times or uses current if first run
   - Gets current times
   - Calculates delta idle: current.idle - previous.idle
   - Calculates delta total: sum of all time deltas
   - Accumulates idle and total
4. Updates prevCpu to current state
5. If total <= 0, returns 0 (no change)
6. Calculates usage: (1 - idle / total) * 100
7. Clamps result to 0-100 range
8. Returns percentage

**CPU Time Types:**
- user: Time spent in user mode
- nice: Time spent in user mode with low priority
- sys: Time spent in kernel mode
- idle: Time spent idle
- irq: Time spent servicing interrupts
- (varies by platform)

**Mathematical Formula:**
```
usage = (total_time - idle_time) / total_time * 100
```

#### memory() Function

**Purpose:** Returns memory usage information

**Return Value:**
```javascript
{
  total: number (bytes),
  used: number (bytes),
  pct: number (percentage)
}
```

**Execution Flow:**
1. Gets total memory via os.totalmem()
2. Gets free memory via os.freemem()
3. Calculates used: total - free
4. Calculates percentage: (used / total) * 100
5. Returns object with all three values

#### disks() Function

**Purpose:** Returns disk usage information for all drives

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-PSDrive -PSProvider FileSystem | Select-Object Name,Used,Free | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Handles both array and single object
4. Filters entries with Used or Free values
5. Maps to standardized format:
   - name: Drive letter with colon (e.g., "C:")
   - used: Used bytes
   - free: Free bytes
6. Returns array (max 6 drives)

**Linux/macOS:**
1. Executes `df -kP` command
2. Parses output:
   - Splits by newlines
   - Skips header line
   - Filters lines starting with "/"
3. Splits each line by whitespace
4. Maps to standardized format:
   - name: mount point (column 5)
   - used: used kilobytes * 1024 = bytes
   - free: free kilobytes * 1024 = bytes
5. Returns array (max 6 drives)

**Error Handling:**
- On any error, returns empty array

#### processes() Function

**Purpose:** Returns list of top 40 processes by memory usage

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-Process | Sort-Object -Descending WS | Select-Object -First 40 Id,ProcessName,WS,Path | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Handles both array and single object
4. Maps to standardized format:
   - pid: Process ID
   - name: Process name
   - mem: Working set (bytes)
   - cpu: 0 (not collected)
   - path: Executable path or empty string
5. Returns array

**Linux/macOS:**
1. Executes `ps -eo pid,pcpu,rss,comm --sort=-rss` command
2. Increases maxBuffer to 4MB for large output
3. Parses output:
   - Splits by newlines
   - Skips header line
   - Takes first 40 lines
   - Splits each line by whitespace
4. Maps to standardized format:
   - pid: Column 0
   - cpu: Column 1 (percentage)
   - mem: Column 2 (kilobytes * 1024 = bytes)
   - name: Columns 3+ joined
   - path: empty string
5. Returns array

**Error Handling:**
- On any error, returns empty array

#### connections() Function

**Purpose:** Returns list of established network connections (max 60)

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-NetTCPConnection -State Established | Select-Object -First 60 LocalPort,RemoteAddress,RemotePort,OwningProcess | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Handles both array and single object
4. Maps to standardized format:
   - local: Local port number
   - remote: "remoteAddress:remotePort"
   - pid: Owning process ID
5. Returns array

**macOS:**
1. Executes `netstat -anp tcp` command
2. Parses output:
   - Splits by newlines
   - Filters lines containing "ESTAB" or "ESTABLISHED"
   - Takes first 60 lines
   - Splits by whitespace
3. Maps to standardized format:
   - local: Column 3
   - remote: Column 4
   - pid: null (not available)
4. Returns array

**Linux:**
1. Executes `ss -tnp` command
2. Same parsing as macOS
3. Returns array

**Error Handling:**
- On any error, returns empty array

#### listening() Function

**Purpose:** Returns list of listening ports

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to standardized format:
   - addr: Local address
   - port: Local port number
4. Returns array

**Linux:**
1. Executes `ss -tlnp` command
2. Parses output:
   - Splits by newlines
   - Skips header line
   - Filters non-empty lines
   - Splits by whitespace
   - Extracts column 3 (address:port)
3. Extracts port from address string
4. Maps to standardized format:
   - addr: Address without port
   - port: Port number
5. Returns array

**Error Handling:**
- On any error, returns empty array

#### volumes() Function

**Purpose:** Returns list of removable and newly mounted volumes

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter,DriveType,FileSystemLabel | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to standardized format:
   - mount: "DriveLetter:\"
   - label: File system label or empty
   - removable: true if DriveType === "Removable"
4. Returns array

**macOS:**
1. Checks /Volumes directory
2. Reads directory entries
3. Maps each subdirectory to volume:
   - mount: "/Volumes/name"
   - label: directory name
   - removable: true
4. Returns array

**Linux:**
1. Checks directories: /media, /run/media, /mnt
2. For each directory:
   - Reads entries
   - Maps each subdirectory to volume
   - mount: full path
   - label: directory name
   - removable: true
3. Returns combined array

**Error Handling:**
- On any error, returns empty array
- Individual directory read errors are skipped

#### host() Function

**Purpose:** Returns host system information

**Return Value:**
```javascript
{
  hostname: string,
  platform: string (e.g., "Windows_NT 10.0.19044"),
  arch: string (e.g., "x64"),
  cpus: number,
  model: string (CPU model),
  uptime: number (seconds),
  user: string (username),
  nets: array of network interfaces
}
```

**Execution Flow:**
1. Gets network interfaces via os.networkInterfaces()
2. Flattens to array of interface objects
3. Filters for non-internal IPv4 addresses
4. Constructs host object:
   - hostname: os.hostname()
   - platform: os.type() + " " + os.release()
   - arch: os.arch()
   - cpus: os.cpus().length
   - model: os.cpus()[0].model
   - uptime: os.uptime()
   - user: os.userInfo().username
   - nets: filtered network interfaces
5. Returns object

#### wifiNetworks() Function

**Purpose:** Returns list of WiFi networks with connection status

**Execution Flow:**

**Step 1: Get Connected Network**

**Windows:**
1. Executes `netsh wlan show interfaces`
2. Parses output for SSID using regex: /SSID\s*:\s*(.+)/i
3. Parses output for BSSID using regex: /BSSID\s*:\s*(.+)/i
4. Stores in connectedSsid and connectedBssid variables

**macOS:**
1. Executes airport tool: `/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I`
2. Parses output for SSID using regex: /SSID:\s*(.+)/i
3. Parses output for BSSID using regex: /BSSID:\s*(.+)/i
4. Stores in connectedSsid and connectedBssid variables

**Linux:**
1. Executes `nmcli -t -f active,ssid,bssid dev wifi`
2. Splits output by ":"
3. If first part is "yes", extracts SSID and BSSID
4. Stores in connectedSsid and connectedBssid variables

**Step 2: Get Nearby Networks**

**Windows:**
1. Executes `netsh wlan show networks mode=bssid`
2. Parses output line by line:
   - If line starts with "SSID": extracts SSID, creates network object with connected status
   - If line starts with "BSSID": extracts BSSID
   - If line contains "Signal": extracts signal percentage
3. Returns array of network objects

**macOS:**
1. Executes airport tool with scan: `airport -s`
2. Skips header line
3. Parses each line:
   - Splits by whitespace
   - Extracts SSID (column 0), BSSID (column 1), signal (column 2)
   - Sets connected if SSID and BSSID match connected network
4. Returns array of network objects

**Linux (nmcli):**
1. Executes `nmcli -t -f ssid,bssid,signal,active dev wifi`
2. Parses each line:
   - Splits by ":"
   - Extracts SSID, BSSID, signal, active status
3. Returns array of network objects

**Linux (iwlist fallback):**
1. If nmcli fails, executes `iwlist scan`
2. Parses output for "Cell X" sections
3. Extracts ESSID, Address, Signal level
4. Converts signal from dBm to percentage
5. Returns array of network objects

**Return Value:**
```javascript
[{ ssid, bssid, signal, connected }, ...]
```

**Error Handling:**
- On any error, returns { error: message }
- Individual command failures are handled gracefully

#### networkDevices() Function

**Purpose:** Returns list of network devices on LAN (ARP table)

**Execution Flow:**

**Windows:**
1. Executes `arp -a` command
2. Parses output:
   - Splits by newlines
   - Filters out lines containing "Interface"
   - Splits each line by whitespace
3. Maps to standardized format:
   - ip: Column 1
   - mac: Column 2
   - type: Column 3 or "dynamic"
4. Returns array

**Linux/macOS:**
1. Executes `arp -n` command
2. Parses output:
   - Splits by newlines
   - Filters lines containing "ether"
   - Splits each line by whitespace
3. Maps to standardized format:
   - ip: Column 0
   - mac: Column 2
   - type: Column 3 or "dynamic"
4. Returns array

**Error Handling:**
- On any error, returns empty array

#### hardware() Function

**Purpose:** Returns comprehensive hardware information

**Return Value:**
```javascript
{
  cpu: { model, cores, architecture, speed },
  memory: { total, free, used },
  platform: { type, release, hostname, uptime },
  storage: array of disk info,
  networkAdapters: array of adapter info,
  usb: array of USB devices,
  gpu: array of GPU info (Windows only)
}
```

**Execution Flow:**

**Step 1: Basic Hardware**
1. Constructs CPU info:
   - model: os.cpus()[0].model
   - cores: os.cpus().length
   - architecture: os.arch()
   - speed: os.cpus()[0].speed
2. Constructs memory info:
   - total: os.totalmem()
   - free: os.freemem()
   - used: total - free
3. Constructs platform info:
   - type: os.type()
   - release: os.release()
   - hostname: os.hostname()
   - uptime: os.uptime()
4. Gets storage via disks()
5. Constructs network adapters from os.networkInterfaces()

**Step 2: USB Devices**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-PnpDevice -Class USB | Where-Object Status -eq 'OK' | Select-Object FriendlyName,InstanceId | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to { name, id }
4. Returns array

**macOS:**
1. Executes `system_profiler SPUSBDataType -json`
2. Recursively extracts USB devices from _items
3. Maps to { name, id }
4. Returns array

**Linux:**
1. Executes `lsusb` command
2. Parses output line by line
3. Extracts device name from after colon
4. Maps to { name, id: "" }
5. Returns array

**Step 3: GPU (Windows only)**
1. Executes PowerShell command:
   ```
   Get-WmiObject Win32_VideoController | Select-Object Name,AdapterRAM | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to { name, memory }
4. Returns array

**Error Handling:**
- Each hardware category has independent error handling
- Missing categories return empty arrays
- Overall error returns { error: message }

#### networkLogs() Function

**Purpose:** Returns recent network-related system logs

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-EventLog -LogName System -EntryType Warning,Error -MaxEvents 20 -Source 'Net*,DHCP*' | Select-Object TimeGenerated,Message | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to { time, message, level: "warning" }
4. Returns array

**Linux:**
1. Executes `journalctl -u network -n 20 --no-pager`
2. Parses output line by line
3. Extracts time (first 15 chars) and message (rest)
4. Maps to { time, message, level: "info" }
5. Returns array

**Error Handling:**
- On any error, returns empty array

#### recentFiles() Function

**Purpose:** Returns list of recently modified files

**Parameters:**
- `limit`: Maximum files to return (default 50)

**Execution Flow:**

**Step 1: Determine Paths**
- Windows: Downloads, Desktop, Documents
- Linux/macOS: Downloads, Desktop

**Step 2: Collect Files**
1. Iterates over each directory
2. Attempts to read directory entries
3. For each file:
   - Gets full path
   - Gets file stats (size, modification time)
   - Extracts extension
   - Adds to array if under limit
4. Skips directories
5. Handles read errors gracefully

**Step 3: Sort and Limit**
1. Sorts by modification time (newest first)
2. Slices to limit
3. Returns array

**Return Value:**
```javascript
[{ name, path, size, modified, extension }, ...]
```

**Error Handling:**
- On any error, returns empty array
- Individual directory errors are skipped

#### systemLogs() Function

**Purpose:** Returns recent system error/warning logs

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-EventLog -LogName System -MaxEvents 30 -EntryType Error,Warning | Select-Object TimeGenerated,Source,Message | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to { time, source, message, level: "error" }
4. Returns array

**Linux:**
1. Executes `journalctl -n 30 --no-pager`
2. Parses output line by line
3. Extracts time (first 15 chars) and message (rest)
4. Maps to { time, source: "system", message, level: "info" }
5. Returns array

**Error Handling:**
- On any error, returns empty array

#### allProcesses() Function

**Purpose:** Returns complete list of all processes

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-Process | Select-Object Id,ProcessName,WS,CPU,Path,StartTime | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to { pid, name, mem, cpu, path, startTime }
4. Returns array

**Linux:**
1. Executes `ps -eo pid,pcpu,rss,etime,comm --sort=-pcpu`
2. Increases maxBuffer to 8MB
3. Parses output:
   - Skips header
   - Splits by whitespace
4. Maps to { pid, cpu, mem, time, name, path: "" }
5. Returns array

**Error Handling:**
- On any error, returns empty array

#### allConnections() Function

**Purpose:** Returns complete list of all network connections

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-NetTCPConnection | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,State,OwningProcess | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Maps to { localAddr, localPort, remoteAddr, remotePort, state, pid }
4. Returns array

**Linux:**
1. Executes `ss -tanp`
2. Increases maxBuffer to 8MB
3. Parses output:
   - Skips header
   - Splits by whitespace
4. Maps to { localAddr, localPort, remoteAddr, remotePort, state, pid }
5. Returns array

**Error Handling:**
- On any error, returns empty array

#### systemInfo() Function

**Purpose:** Returns detailed system information

**Execution Flow:**

**Windows:**
1. Executes PowerShell command:
   ```
   Get-ComputerInfo | Select-Object WindowsProductName,WindowsVersion,OsHardwareAbstractionLayer | ConvertTo-Json -Compress
   ```
2. Parses JSON output
3. Constructs object:
   - osName: WindowsProductName
   - osVersion: WindowsVersion
   - architecture: OsHardwareAbstractionLayer
   - platform: os.platform()
   - hostname: os.hostname()
   - arch: os.arch()
   - cpus: os.cpus().length
   - totalMem: os.totalmem()
   - freeMem: os.freemem()
   - uptime: os.uptime()
4. Returns object

**Linux/macOS:**
1. Constructs object from os module:
   - osName: os.type()
   - osVersion: os.release()
   - architecture: os.arch()
   - platform: os.platform()
   - hostname: os.hostname()
   - arch: os.arch()
   - cpus: os.cpus().length
   - totalMem: os.totalmem()
   - freeMem: os.freemem()
   - uptime: os.uptime()
2. Returns object

**Error Handling:**
- On any error, returns object with error field

---

### Server Module (server.js)

**File Path:** `agent/src/server.js`

**Purpose:** HTTP server providing REST API and SSE (Server-Sent Events) for dashboard communication, with token-based authentication and comprehensive endpoint coverage.

#### Global Constants

```javascript
const DIR = path.dirname(fileURLToPath(import.meta.url));
```
- Directory containing server.js
- Used for path resolution

```javascript
const DASH = path.join(DIR, "..", "public", "dashboard.html");
```
- Path to dashboard HTML file
- Served as root endpoint

```javascript
const EICAR = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
```
- EICAR test file string
- Used for antivirus testing
- Harmless industry-standard test pattern

#### json() Helper Function

**Purpose:** Sends JSON response with status code

**Parameters:**
- `res`: HTTP response object
- `code`: HTTP status code
- `body`: Response body object

**Execution Flow:**
1. Sets response headers:
   - content-type: application/json
   - cache-control: no-store
2. Stringifies body to JSON
3. Ends response

#### body() Helper Function

**Purpose:** Reads and parses request body as JSON

**Parameters:**
- `req`: HTTP request object

**Execution Flow:**
1. Initializes empty string buffer
2. Listens for "data" events:
   - Appends chunks to buffer
   - If buffer exceeds 100KB, destroys request (DoS protection)
3. Listens for "end" event:
   - Attempts to parse buffer as JSON
   - On parse error, returns empty object
   - Returns parsed object
4. Returns Promise

**Security:**
- 100KB size limit prevents memory exhaustion
- Parse errors handled gracefully

#### serve() Function

**Purpose:** Creates and starts HTTP server with SSE support

**Parameters:**
- `port`: Port number to listen on
- `token`: Authentication token

**Execution Flow:**

**Step 1: SSE Setup**
1. Creates Set to store SSE client connections
2. Registers event listener via E.onEvent():
   - Formats event as SSE message: `event: type\ndata: JSON\n\n`
   - Iterates over all clients
   - Writes formatted message to each client
   - Catches and ignores write errors (client may be disconnected)

**Step 2: HTTP Server Creation**
1. Creates http.createServer() with async request handler
2. Parses request URL
3. Extracts pathname from URL

**Step 3: Root Endpoint**
1. If path is "/" or "/index.html":
   - Sets content-type header
   - Reads dashboard HTML file
   - Replaces "__AISS_TOKEN__" placeholder with actual token
   - Sends HTML response

**Step 4: API Endpoint Validation**
1. If path does not start with "/api/":
   - Returns 404 error
2. Extracts token from header or query parameter
3. If token does not match:
   - Returns 401 unauthorized error

**Step 5: API Endpoint Routing**

**SSE Stream (/api/stream)**
1. Sets SSE headers:
   - content-type: text/event-stream
   - cache-control: no-store
   - connection: keep-alive
2. Writes initial ": ok\n\n" keepalive
3. Adds response to clients Set
4. Registers "close" event handler to remove client from Set
5. Returns (connection stays open)

**State Endpoint (/api/state)**
1. Calls E.state() to get engine state
2. Returns JSON response

**Processes Endpoint (/api/processes)**
1. Calls S.processes() to get process list
2. Returns JSON response

**Network Endpoint (/api/network)**
1. Calls S.connections() and S.listening() in parallel
2. Calculates exposed ports (0.0.0.0, ::, or *)
3. Returns JSON with conns, listen, exposed

**Volumes Endpoint (/api/volumes)**
1. Calls S.volumes() to get volume list
2. Returns JSON response

**Disks Endpoint (/api/disks)**
1. Calls S.disks() to get disk usage
2. Returns JSON response

**WiFi Endpoint (/api/wifi)**
1. Calls S.wifiNetworks() to get WiFi list
2. Returns JSON response

**Network Devices Endpoint (/api/network-devices)**
1. Calls S.networkDevices() to get LAN devices
2. Returns JSON response

**Network Logs Endpoint (/api/network-logs)**
1. Calls S.networkLogs() to get network logs
2. Returns JSON response

**Recent Files Endpoint (/api/recent-files)**
1. Calls S.recentFiles(100) to get file list
2. Returns JSON response

**System Logs Endpoint (/api/system-logs)**
1. Calls S.systemLogs() to get system logs
2. Returns JSON response

**All Processes Endpoint (/api/all-processes)**
1. Calls S.allProcesses() to get complete process list
2. Returns JSON response

**All Connections Endpoint (/api/all-connections)**
1. Calls S.allConnections() to get complete connection list
2. Returns JSON response

**System Info Endpoint (/api/system-info)**
1. Calls S.systemInfo() to get system details
2. Returns JSON response

**All Services Endpoint (/api/all-services)**
1. Calls S.allServices() to get service list
2. Returns JSON response

**Running Services Endpoint (/api/running-services)**
1. Calls S.runningServices() to get running services
2. Returns JSON response

**Installed Software Endpoint (/api/installed-software)**
1. Calls S.installedSoftware() to get software list
2. Returns JSON response

**Open Ports Endpoint (/api/open-ports)**
1. Calls S.openPorts() to get open ports
2. Returns JSON response

**Hardware Endpoint (/api/hardware)**
1. Calls S.hardware() to get hardware info
2. Returns JSON response

**Export Endpoint (/api/export)**
1. Calls E.state() to get engine state
2. In parallel collects:
   - System info
   - Hardware info
   - All processes
   - All connections
   - All services
   - WiFi networks
   - Network devices
   - Recent files (200)
   - System logs
3. Constructs export object with all data
4. Sets content-disposition header with filename
5. Returns JSON as file download

**EICAR Test Endpoint (/api/test/eicar)**
1. Requires POST method
2. Creates test directory in HOME
3. Writes EICAR test file
4. Logs test file creation
5. Returns success with file path

**Synthetic Threat Endpoint (/api/test/synthetic)**
1. Requires POST method
2. Reads request body
3. Generates random score (50-80)
4. Determines decision based on score
5. Logs synthetic threat
6. Returns success with score and decision

**Anomaly Test Endpoint (/api/test/anomaly)**
1. Requires POST method
2. Generates random z-score (5-8)
3. Logs anomaly simulation
4. Returns success with z-score

**Attack Simulation Endpoint (/api/simulate/attack)**
1. Requires POST method
2. Reads request body
3. Extracts attack type and params
4. Calls simulateAttack(type, params)
5. Logs simulation
6. Returns results

**Alerts Endpoint (/api/alerts)**
1. GET: Returns filtered events (warn, critical, error)
2. Maps to alert format with status "open"
3. PATCH: Updates alert status
4. Logs alert action
5. Returns success

**Incidents Endpoint (/api/incidents)**
1. GET: Returns incident list from threats
2. Maps threats to incident format
3. PATCH: Updates incident action
4. Logs incident action
5. Returns success

**Assets Endpoint (/api/assets)**
1. GET: Returns asset list (current machine)
2. PATCH: Updates asset status
3. Logs asset action
4. Returns success

**Settings Endpoint (/api/settings)**
1. GET: Returns settings from state
2. PATCH: Updates settings from body
3. Logs settings update
4. Returns updated settings

**Threat Actions Endpoint (/api/threats/:id)**
1. Requires PATCH method
2. Extracts threat ID from path
3. Reads request body
4. Logs threat action
5. Returns success

**Health Endpoint (/api/health)**
1. GET: Returns health status and uptime
2. POST: Triggers health check for specific service
3. Returns success

**Scan Endpoint (/api/scan)**
1. Requires POST method
2. Reads request body
3. Extracts path and limit
4. Defaults to Downloads folder if no path
5. Validates path exists
6. Calls E.runScan() with limit (max 20000)
7. Returns scan results

**USB Test Endpoint (/api/test-usb)**
1. Requires POST method
2. Creates test USB directory
3. Writes test files:
   - eicar.com (EICAR test)
   - autorun.inf (autorun launcher)
   - invoice.pdf.cmd (double extension)
   - update.ps1 (obfuscated PowerShell)
   - README.txt (ransom note)
   - photo.txt (clean file)
4. Logs USB mount
5. Runs scan on test directory
6. Returns scan results

**Step 6: Error Handling**
1. Wraps all endpoint logic in try-catch
2. On error, returns 500 with error message

**Step 7: Server Start**
1. Binds server to 127.0.0.1 on specified port
2. Returns server object

**Security Considerations:**
- Only binds to localhost (127.0.0.1)
- Token-based authentication on all API endpoints
- No CORS headers (local-only access)
- DoS protection via body size limit
- Path validation on scan endpoint

---

### Store Module (store.js)

**File Path:** `agent/src/store.js`

**Purpose:** Append-only JSON database with in-memory caching, automatic persistence, and data retention management.

#### Global Constants

```javascript
export const HOME = path.join(os.homedir(), ".aiss");
```
- Path to AISS home directory
- All data stored in this directory
- Exported for use by other modules

```javascript
const FILE = path.join(HOME, "db.json");
```
- Path to database file
- Stores all persistent data

```javascript
const EMPTY = { events: [], threats: [], scans: [], metrics: [], incidents: [], settings: {} };
```
- Empty database structure
- Used for initialization and error recovery

#### Global State Variables

```javascript
let db = { ...EMPTY };
```
- In-memory database copy
- Initially empty structure
- Updated by load() and push()

```javascript
let dirty = false;
```
- Dirty flag indicating unsaved changes
- Set to true by push() and setSetting()
- Checked by save() to avoid unnecessary writes

#### load() Function

**Purpose:** Loads database from disk or initializes empty

**Execution Flow:**
1. Creates HOME directory if it does not exist
2. Attempts to read FILE
3. On success:
   - Parses JSON
   - Merges with EMPTY structure (ensures all tables exist)
   - Stores in db variable
4. On failure:
   - Creates deep copy of EMPTY
   - Stores in db variable
5. Returns db

**Initialization Logic:**
- If file missing: creates empty db
- If file corrupt: creates empty db
- If file exists: loads and merges with structure
- Ensures backward compatibility (new tables added automatically)

#### data() Function

**Purpose:** Returns current in-memory database

**Return Value:**
- Current db object reference

**Usage:**
- Read-only access to database
- Does not trigger persistence
- Fast in-memory access

#### trim() Function

**Purpose:** Trims array to maximum size (internal helper)

**Parameters:**
- `arr`: Array to trim
- `max`: Maximum size

**Execution Flow:**
1. If array length exceeds max:
   - Removes elements from beginning
   - Keeps last max elements
2. No return value

**Trimming Strategy:**
- Removes oldest entries (from beginning)
- Keeps newest entries (at end)
- In-place modification

#### push() Function

**Purpose:** Adds row to table with automatic trimming and dirty flag

**Parameters:**
- `table`: Table name (events, threats, scans, metrics, incidents)
- `row`: Row data object

**Execution Flow:**
1. Generates unique ID: timestamp + random hex
2. Adds ISO timestamp to row
3. Merges row data into item object
4. Pushes item to db[table] array
5. Trims table to max size:
   - metrics: 720 entries
   - other tables: 500 entries
6. Sets dirty flag to true
7. Returns item

**ID Generation:**
```javascript
`${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
```
- Timestamp ensures chronological ordering
- Random hex prevents collisions
- Slice(2,8) gives 6 hex characters

**Retention Policy:**
- Metrics: 720 entries = 48 minutes at 4s interval
- Events: 500 entries
- Threats: 500 entries
- Scans: 500 entries
- Incidents: 500 entries

#### setSetting() Function

**Purpose:** Updates setting value

**Parameters:**
- `k`: Setting key
- `v`: Setting value

**Execution Flow:**
1. Sets db.settings[k] = v
2. Sets dirty flag to true
3. No return value

**Usage:**
- Stores configuration in database
- Persists across restarts
- Example: setSetting("startedAt", new Date().toISOString())

#### save() Function

**Purpose:** Persists database to disk if dirty

**Execution Flow:**
1. Checks dirty flag
2. If not dirty, returns immediately (no-op)
3. Sets dirty flag to false
4. Stringifies db to JSON
5. Writes to FILE synchronously
6. No return value

**Persistence Strategy:**
- Only writes if changes made
- Prevents unnecessary disk I/O
- Synchronous write ensures consistency

#### Auto-Save Interval

```javascript
setInterval(() => save(), 4000).unref?.();
```
- Triggers save() every 4 seconds
- unref() allows process to exit if only this timer remains
- Ensures data persisted regularly
- No explicit timer cleanup needed

**Persistence Guarantees:**
- Data saved every 4 seconds automatically
- Also saved on daemon shutdown
- Dirty flag prevents redundant writes
- Synchronous write ensures durability

---

### Scanner Module (scanner.js)

**File Path:** `agent/src/scanner.js`

**Purpose:** File system scanner with signature-based detection, content rule matching, and quarantine functionality.

#### Global Constants

```javascript
const EICAR_SHA256 = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f";
```
- SHA-256 hash of EICAR test file
- Industry-standard antivirus test signature
- Harmless but detected by all antivirus

```javascript
const SIGNATURES = [
  { id: "EICAR-TEST", severity: "critical", sha256: EICAR_SHA256, name: "EICAR antivirus test file" },
];
```
- Known bad file signatures
- Indexed by SHA-256 hash
- Includes severity and description

```javascript
const CONTENT_RULES = [
  { id: "PS-ENCODED", severity: "high", re: /powershell(\.exe)?\s+-(enc|encodedcommand)\s+[A-Za-z0-9+/=]{40,}/i, name: "Obfuscated PowerShell payload" },
  { id: "DOWNLOAD-EXEC", severity: "high", re: /(Invoke-WebRequest|curl|wget)[^\n]{0,120}(\|\s*(sh|bash)|;\s*\.\/|Start-Process)/i, name: "Download-and-execute chain" },
  { id: "AUTORUN", severity: "medium", re: /\[autorun\][\s\S]{0,200}open\s*=/i, name: "Autorun launcher" },
  { id: "REVERSE-SHELL", severity: "critical", re: /(nc|ncat|netcat)\s+-[a-z]*e\s+\/bin\/(ba)?sh|socket\.socket\([^)]*\)[\s\S]{0,120}dup2/i, name: "Reverse shell" },
  { id: "RANSOM-NOTE", severity: "high", re: /your files have been encrypted|send .{0,20}bitcoin .{0,30}to decrypt/i, name: "Ransomware note" },
  { id: "KEYLOGGER", severity: "high", re: /SetWindowsHookEx\s*\(\s*WH_KEYBOARD|pynput\.keyboard|keylog/i, name: "Keylogging routine" },
];
```
- Content-based detection rules
- Regular expressions match file contents
- Covers common attack patterns

```javascript
const RISKY_EXT = new Set([".exe", ".scr", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".jar", ".hta", ".dll"]);
```
- File extensions considered risky
- Executable and script extensions
- Used for prioritized scanning

```javascript
const TEXTY = new Set([".txt", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".py", ".sh", ".inf", ".ini", ".html", ".md", ""]);
```
- File extensions that are text-based
- Includes script extensions for content scanning
- Empty string for files without extension

```javascript
const MAX_BYTES = 8 * 1024 * 1024;
```
- Maximum file size to scan (8MB)
- Prevents memory exhaustion
- Large files skipped

#### sha256() Function

**Purpose:** Calculates SHA-256 hash of file

**Parameters:**
- `file`: File path

**Execution Flow:**
1. Creates SHA-256 hash object
2. Reads entire file synchronously
3. Updates hash with file contents
4. Returns hex digest

**Return Value:**
- 64-character hex string

#### inspect() Function

**Purpose:** Inspects single file for threats

**Parameters:**
- `file`: File path

**Execution Flow:**

**Step 1: File Validation**
1. Attempts to get file stats
2. On error, returns empty findings
3. Checks if file is regular file
4. Checks if file size <= MAX_BYTES
5. If checks fail, returns empty findings

**Step 2: File Reading**
1. Extracts file extension
2. Attempts to read file synchronously
3. On error, returns empty findings

**Step 3: Signature Detection**
1. Calculates SHA-256 hash
2. Iterates over SIGNATURES array
3. If hash matches signature:
   - Adds finding with rule, name, severity, file, hash

**Step 4: Content Analysis**
1. Checks if extension is text-based OR file is printable ASCII
2. Printable ASCII check: first 4096 bytes are tabs, newlines, or printable characters (32-126)
3. If text-based:
   - Converts first 512KB to UTF-8 string
   - Iterates over CONTENT_RULES
   - If regex matches:
     - Adds finding with rule, name, severity, file, hash

**Step 5: Double Extension Detection**
1. Checks if extension is risky
2. Checks if filename matches pattern: .(jpg|png|pdf|docx|txt).[a-z0-9]+$
3. If both true:
   - Adds finding with rule "DOUBLE-EXT", severity "high"

**Step 6: Return**
1. Returns findings array

**Detection Categories:**
- Signature-based: Known bad hashes
- Content-based: Malicious patterns in text
- Structural: Double extension masquerading

#### walk() Generator Function

**Purpose:** Depth-first traversal of directory tree

**Parameters:**
- `root`: Root directory to traverse
- `limit`: Maximum files to yield (default 4000)

**Execution Flow:**
1. Initializes file counter to 0
2. Initializes stack with root directory
3. While stack not empty:
   - Pops directory from stack
   - Attempts to read directory entries
   - On error, continues to next directory
   - For each entry:
     - Constructs full path
     - Skips symbolic links
     - If directory:
       - Skips excluded directories: node_modules, .git, System Volume Information, proc, sys, dev
       - Pushes to stack for traversal
     - If file:
       - Increments counter
       - If counter > limit, returns (stops traversal)
       - Yields file path
4. Returns when stack empty or limit reached

**Traversal Strategy:**
- Depth-first (stack-based)
- Excludes common non-user directories
- Symbolic links skipped (prevents loops)
- Limit prevents resource exhaustion

#### scanPath() Function

**Purpose:** Scans directory tree and returns findings

**Parameters:**
- `root`: Root directory to scan
- `limit`: Maximum files to scan

**Execution Flow:**
1. Records start timestamp
2. Initializes file counter to 0
3. Initializes findings array
4. Iterates over walk(root, limit):
   - Increments file counter
   - Calls inspect() on file
   - Merges findings into array
5. Calculates duration: now - start
6. Returns object:
   - root: scanned directory
   - files: file count
   - findings: finding count
   - ms: duration in milliseconds

**Return Value:**
```javascript
{
  root: string,
  files: number,
  findings: array,
  ms: number
}
```

#### quarantine() Function

**Purpose:** Moves file to quarantine with XOR-encoding

**Parameters:**
- `file`: Source file path
- `quarantineDir`: Quarantine directory path

**Execution Flow:**
1. Creates quarantine directory if it does not exist
2. Generates target path: timestamp-filename.quarantined
3. Reads source file synchronously
4. XOR-encodes each byte with 0x5a:
   - 0x5a = 90 decimal = 01011010 binary
   - Reversible encoding (XOR twice = original)
   - Prevents execution (invalid executable format)
5. Writes encoded data to target
6. Deletes source file
7. Returns target path

**XOR Encoding:**
```javascript
Buffer.from(data.map((b) => b ^ 0x5a))
```
- Each byte XORed with 0x5a
- Reversible: byte ^ 0x5a ^ 0x5a = byte
- Neutralizes executable headers
- Simple but effective for quarantine

**Security Considerations:**
- File cannot execute from quarantine
- Encoding is reversible for restoration
- Original file deleted to prevent access
- Timestamp prevents name collisions

---

### AI Module (ai.js)

**File Path:** `agent/src/ai.js`

**Purpose:** Cloud-based AI threat analysis with timeout control and graceful degradation.

#### Global Constants

```javascript
const BASE = process.env.AISS_CLOUD || "https://active-inference-defense.lovable.app";
```
- Base URL for AI analysis endpoint
- Configurable via AISS_CLOUD environment variable
- Defaults to Lovable AI gateway

#### analyze() Function

**Purpose:** Sends threat to cloud AI for analysis

**Parameters:**
- `threat`: Threat object (name, rule, severity, file, hash, action)

**Execution Flow:**
1. Creates AbortController for timeout
2. Sets timeout for 25 seconds
3. Attempts HTTP POST to `${BASE}/api/public/analyze`:
   - Headers: content-type: application/json
   - Body: JSON.stringify(threat data)
   - Signal: abort controller signal
4. On response:
   - If not OK, returns null
   - Parses JSON response
   - Returns analysis field or null
5. On error:
   - Returns null (graceful degradation)
6. Finally:
   - Clears timeout

**Timeout Handling:**
- 25-second timeout prevents hanging
- AbortController cancels request on timeout
- Timeout cleared in finally block

**Graceful Degradation:**
- Returns null on any error
- AI analysis not required for operation
- Engine continues without AI input

**Request Format:**
```javascript
{
  name: string,
  rule: string,
  severity: string,
  file: string,
  hash: string,
  action: string
}
```

**Response Format:**
```javascript
{
  analysis: object | null
}
```

---

### Server Attacks Module (server-attacks.js)

**File Path:** `agent/src/server-attacks.js`

**Purpose:** Attack simulation framework for security research and testing, providing safe simulation of various attack types.

#### simulateAttack() Function

**Purpose:** Simulates specified attack type and returns results

**Parameters:**
- `type`: Attack type string
- `params`: Optional parameters object

**Execution Flow:**

**Step 1: Initialize Results**
1. Creates results object:
   - type: attack type
   - success: false (default)
   - details: empty array
   - timestamp: current ISO timestamp

**Step 2: Switch on Attack Type**

**port_scan**
1. Calls S.openPorts()
2. Stores in details
3. Sets success to true
4. Sets summary to port count

**process_injection**
1. Calls S.allProcesses()
2. Stores in details
3. Sets success to true
4. Sets summary to process count

**network_recon**
1. Calls S.allConnections() and S.networkDevices() in parallel
2. Stores in details object
3. Sets success to true
4. Sets summary to connection and device counts

**service_enumeration**
1. Calls S.allServices()
2. Stores in details
3. Sets success to true
4. Sets summary to service count

**vulnerability_scan**
1. Calls S.installedSoftware()
2. Stores in details
3. Sets success to true
4. Sets summary to package count

**dns_spoof**
1. Creates mock DNS result
2. Sets success to true
3. Sets summary to "DNS resolution test completed"

**file_access**
1. Calls S.recentFiles(100)
2. Stores in details
3. Sets success to true
4. Sets summary to file count

**full_recon**
1. Calls multiple sensors in parallel:
   - S.systemInfo()
   - S.systemHardware()
   - S.allProcesses()
   - S.allConnections()
   - S.allServices()
   - S.recentFiles(100)
2. Stores in details object
3. Sets success to true
4. Sets summary to "Full reconnaissance completed"

**default**
1. Sets details to "Unknown attack type"

**Step 3: Error Handling**
1. Wraps switch in try-catch
2. On error:
   - Sets success to false
   - Stores error message
3. Returns results object

**Return Value:**
```javascript
{
  type: string,
  success: boolean,
  details: any,
  summary: string,
  timestamp: string,
  error?: string
}
```

**Simulation Notes:**
- No actual attacks performed
- Only enumerates system state
- Safe for production use
- Educational and testing purposes

---

## Installation

### Prerequisites

- Node.js 18 or higher
- Git
- Administrator/root access (for Windows Service installation)
- 500 MB free disk space
- 4 GB RAM minimum (8 GB recommended)

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone https://github.com/Ahmadjamil888/active-inference-defense.git
cd active-inference-defense
```

#### 2. Navigate to Agent Directory

```bash
cd agent
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Install Globally

```bash
npm install -g .
```

This installs the `aiss` command globally on your system.

#### 5. Start AISS

```bash
aiss
```

The dashboard will automatically open at http://127.0.0.1:8179

### Windows Service Installation (Optional)

To install AISS as a Windows Service for auto-start on boot:

```bash
aiss install
```

To uninstall:

```bash
aiss uninstall
```

### Verification

Verify installation by checking the version:

```bash
aiss --help
```

---

## Configuration

### Configuration Location

All configuration is stored in `~/.aiss/db.json` on the following platforms:

- Windows: `C:\Users\username\.aiss\db.json`
- macOS: `/Users/username/.aiss/db.json`
- Linux: `/home/username/.aiss/db.json`

### Settings Structure

```json
{
  "startedAt": "2024-01-01T00:00:00.000Z",
  "thresh_low": 20,
  "thresh_medium": 45,
  "thresh_high": 70,
  "enforcementMode": "monitor",
  "aiEnabled": true
}
```

### Available Settings

**Security Gate Thresholds**
- `thresh_low`: Score threshold for HOLD action (default: 20)
- `thresh_medium`: Score threshold for QUARANTINE action (default: 45)
- `thresh_high`: Score threshold for BLOCK action (default: 70)

**Enforcement Mode**
- `enforcementMode`: "monitor" or "enforce"
  - monitor: Log only, no automatic actions
  - enforce: Apply automatic quarantine/blocking

**AI Settings**
- `aiEnabled`: Enable/disable cloud AI analysis (default: true)

### Environment Variables

- `AISS_PORT`: Dashboard port (default: 8179)
- `AISS_CLOUD`: AI analysis endpoint URL

---

## API Reference

### Authentication

All API endpoints require authentication via the `X-Aiss-Token` header or `t` query parameter.

Example:
```bash
curl -H "X-Aiss-Token: YOUR_TOKEN" http://127.0.0.1:8179/api/state
```

### Endpoints

#### GET /

Returns the dashboard HTML page.

#### GET /api/stream

Server-Sent Events endpoint for real-time updates.

**Events:**
- `event`: Engine events
- `threat`: Threat records
- `incident`: Incident updates
- `metric`: System metrics
- `scan`: Scan results

#### GET /api/state

Returns complete engine state.

**Response:**
```json
{
  "host": { ... },
  "belief": { ... },
  "running": true,
  "started": 1234567890,
  "counts": { ... },
  "metrics": [ ... ],
  "threats": [ ... ],
  "scans": [ ... ],
  "events": [ ... ],
  "incidents": [ ... ],
  "settings": { ... }
}
```

#### GET /api/processes

Returns top 40 processes by memory usage.

#### GET /api/network

Returns network connections and listening ports.

**Response:**
```json
{
  "conns": [ ... ],
  "listen": [ ... ],
  "exposed": [ ... ]
}
```

#### GET /api/volumes

Returns removable and mounted volumes.

#### GET /api/disks

Returns disk usage information.

#### GET /api/wifi

Returns WiFi networks with connection status.

#### GET /api/network-devices

Returns LAN devices from ARP table.

#### GET /api/network-logs

Returns recent network-related system logs.

#### GET /api/recent-files

Returns recently modified files.

#### GET /api/system-logs

Returns recent system error/warning logs.

#### GET /api/all-processes

Returns complete list of all processes.

#### GET /api/all-connections

Returns complete list of all network connections.

#### GET /api/system-info

Returns detailed system information.

#### GET /api/hardware

Returns comprehensive hardware information.

#### POST /api/export

Exports all system data as JSON file download.

#### POST /api/test/eicar

Generates EICAR test file for antivirus testing.

#### POST /api/test/synthetic

Generates synthetic threat for testing.

#### POST /api/test/anomaly

Simulates anomaly for testing.

#### POST /api/simulate/attack

Simulates specified attack type.

**Request:**
```json
{
  "type": "port_scan",
  "params": { }
}
```

#### GET /api/alerts

Returns list of alerts (warn, critical, error events).

#### PATCH /api/alerts/:id

Updates alert status.

#### GET /api/incidents

Returns list of incidents.

#### PATCH /api/incidents/:id

Updates incident action.

#### GET /api/assets

Returns list of monitored assets.

#### PATCH /api/assets/:id

Updates asset status.

#### GET /api/settings

Returns current settings.

#### PATCH /api/settings

Updates settings.

**Request:**
```json
{
  "thresh_low": 20,
  "thresh_medium": 45,
  "thresh_high": 70
}
```

#### PATCH /api/threats/:id

Performs action on threat.

#### GET /api/health

Returns health status of all services.

#### POST /api/health/:service

Triggers health check for specific service.

#### POST /api/scan

Initiates file system scan.

**Request:**
```json
{
  "path": "/path/to/scan",
  "limit": 4000
}
```

#### POST /api/test-usb

Creates test USB directory with malicious samples and scans it.

---

## Security Model

### Data Privacy

- **Local Only**: All data processing and storage occurs on the local machine
- **No Telemetry**: No data collection, analytics, or usage tracking
- **No Cloud Uploads**: System data never uploaded to cloud (except optional AI analysis)
- **Localhost Only**: Dashboard binds exclusively to 127.0.0.1
- **Access Token**: Random token generated at install time for dashboard authentication

### Threat Detection

**Signature-Based Detection**
- SHA-256 hash matching against known bad signatures
- EICAR test file detection
- Fast, deterministic, zero false positives

**Content-Based Detection**
- Regular expression matching for malicious patterns
- PowerShell obfuscation detection
- Download-and-execute chain detection
- Reverse shell pattern detection
- Ransomware note detection
- Keylogger detection

**Active Inference**
- Probabilistic modeling of normal system behavior
- Z-score based anomaly detection
- Adaptive learning with configurable learning rate
- Free energy calculation for surprise measurement

### Security Gate

**Risk Scoring (0-100)**
- Critical findings: +30 points
- High findings: +20 points
- Medium findings: +10 points
- Low findings: +5 points
- Baseline anomaly: +2 points per anomaly unit

**Decision Levels**
- ALLOW (0-20): Log only
- HOLD (20-45): Suspend and wait for approval
- QUARANTINE (45-70): Move to encrypted vault
- BLOCK (70-100): Kill process and flag for firewall

### Quarantine

- Files moved to `~/.aiss/quarantine/`
- XOR-encoded (byte ^ 0x5a) to prevent execution
- Original file deleted
- Encoding is reversible for restoration
- Timestamp-based naming prevents collisions

### Incident Lifecycle

1. **Detect**: Sensor identifies suspicious activity
2. **Isolate**: Suspend process, cut network access
3. **Analyze**: Collect process tree, files, connections
4. **Contain**: Block hashes, quarantine files
5. **Remediate**: Remove persistence, delete/restore files (requires approval)
6. **Verify**: Re-scan to confirm threat is gone
7. **Learn**: Update baseline and rule set

### Access Control

- Dashboard authentication via random token
- Token stored in `~/.aiss/token`
- Token permissions: 0o600 (owner read/write only)
- No default credentials
- Token regenerated on reinstall

### Network Security

- Server binds to 127.0.0.1 only
- No external network exposure
- No CORS headers
- WebSocket-like SSE for real-time updates
- All API endpoints require authentication

---

## Troubleshooting

### 'aiss' command not found

**Cause:** CLI not installed or not in PATH

**Solutions:**
1. Restart terminal after installation
2. Verify installation: `npm list -g aiss`
3. Check PATH: `echo $PATH` (Linux/macOS) or `$env:PATH` (Windows)
4. Reinstall: `npm install -g .`

### Dashboard doesn't open

**Cause:** AISS not running or port conflict

**Solutions:**
1. Check status: `aiss status`
2. View logs: `aiss logs`
3. Check port: `netstat -an | grep 8179` (Linux/macOS) or `netstat -an | findstr 8179` (Windows)
4. Kill conflicting process if needed
5. Change port: `AISS_PORT=8180 aiss`

### High CPU usage

**Cause:** Initial baseline scan or large directory monitoring

**Solutions:**
1. Wait 2-3 minutes for baseline to complete
2. Check settings to reduce scan frequency
3. Exclude large directories from monitoring
4. Verify not in infinite loop via logs

### Installation fails

**Cause:** Insufficient permissions or dependencies

**Solutions:**
1. Run as Administrator (Windows) or with sudo (Linux/macOS)
2. Temporarily disable antivirus during installation
3. Check disk space: `df -h` (Linux/macOS) or `Get-PSDrive` (Windows)
4. Verify Node.js version: `node --version` (must be 18+)

### Service installation fails (Windows)

**Cause:** Insufficient privileges or node-windows not installed

**Solutions:**
1. Run PowerShell as Administrator
2. Install node-windows: `npm install -g node-windows`
3. Verify service not already installed
4. Check Windows Event Viewer for errors

### Scan stuck or slow

**Cause:** Large directory or many files

**Solutions:**
1. Reduce scan limit in settings
2. Exclude large directories (node_modules, .git)
3. Scan specific directory instead of full drive
4. Check logs for errors

### Browser opens multiple windows

**Cause:** Old version without browser lock

**Solutions:**
1. Update to latest version
2. Browser lock prevents multiple opens within 3 seconds
3. Check for multiple aiss processes: `aiss status`

### Database corruption

**Cause:** Improper shutdown or disk error

**Solutions:**
1. Stop AISS: `aiss stop`
2. Backup current database: `cp ~/.aiss/db.json ~/.aiss/db.json.backup`
3. Delete database: `rm ~/.aiss/db.json`
4. Restart AISS: `aiss`
5. Database will be reinitialized

### Permission denied errors

**Cause:** Insufficient file system permissions

**Solutions:**
1. Run as Administrator (Windows) or with sudo (Linux/macOS)
2. Check ~/.aiss directory permissions
3. Ensure HOME directory is writable
4. Check antivirus blocking file access

---

## Data Locations

### Home Directory

- Windows: `C:\Users\username\.aiss\`
- macOS: `/Users/username/.aiss/`
- Linux: `/home/username/.aiss/`

### Files

- `db.json`: Main database
- `aiss.log`: Daemon log file
- `token`: Access token
- `aiss.pid`: Process ID file
- `browser.lock`: Browser open lock file
- `quarantine/`: Quarantined files directory

### Retention

- Events: 500 most recent
- Threats: 500 most recent
- Scans: 500 most recent
- Metrics: 720 most recent (48 minutes)
- Incidents: 500 most recent

---

## CLI Commands Reference

### aiss (start)

Start AISS daemon and open dashboard.

**Options:**
- `--foreground`: Run in foreground (for debugging)

**Example:**
```bash
aiss
aiss start
aiss start --foreground
```

### aiss stop

Stop AISS daemon gracefully.

**Example:**
```bash
aiss stop
```

### aiss status

Check if AISS is running and show details.

**Example:**
```bash
aiss status
```

**Output:**
- PID
- Port
- Dashboard URL
- Operational status

### aiss open

Open dashboard in default browser.

**Example:**
```bash
aiss open
```

### aiss logs

View recent daemon logs (last 60 lines).

**Example:**
```bash
aiss logs
```

### aiss install

Install AISS as Windows Service (auto-start on boot).

**Requirements:**
- Windows operating system
- Administrator privileges

**Example:**
```bash
aiss install
```

### aiss uninstall

Remove AISS Windows Service.

**Example:**
```bash
aiss uninstall
```

### aiss help

Display detailed command reference.

**Example:**
```bash
aiss help
aiss --help
aiss -h
```

---

## Support

For issues, questions, or contributions:

- GitHub: https://github.com/Ahmadjamil888/active-inference-defense
- Documentation: This README.md

---

## License

MIT License - see LICENSE file for details.

---

## Acknowledgments

- EICAR test file for antivirus testing
- Node.js ecosystem for local monitoring
- Active inference research community
- Lovable AI gateway for cloud analysis

---

**AISS v1.0.0** - Your data never leaves your computer.
