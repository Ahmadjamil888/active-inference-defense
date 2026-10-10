// Local AI analysis module - provides threat analysis without external dependencies
// Uses rule-based reasoning and heuristics to assess threats

const MITRE_TACTICS = {
  "REVERSE-SHELL": { tactic: "Execution", technique: "T1059.001", confidence: 0.9 },
  "DLL-INJECTION": { tactic: "Defense Evasion", technique: "T1055", confidence: 0.85 },
  "PROCESS-HOLLOWING": { tactic: "Defense Evasion", technique: "T1055.012", confidence: 0.85 },
  "CREDENTIAL-THEFT": { tactic: "Credential Access", technique: "T1003", confidence: 0.9 },
  "AUTORUN": { tactic: "Persistence", technique: "T1547.001", confidence: 0.7 },
  "SUSPICIOUS-REG": { tactic: "Persistence", technique: "T1547.001", confidence: 0.75 },
  "DOWNLOAD-EXEC": { tactic: "Command and Control", technique: "T1105", confidence: 0.8 },
  "ENCRYPTION-LOOP": { tactic: "Impact", technique: "T1486", confidence: 0.95 },
  "WORM-PROPAGATION": { tactic: "Lateral Movement", technique: "T1021", confidence: 0.85 },
  "HIDDEN-PROCESS": { tactic: "Defense Evasion", technique: "T1564.003", confidence: 0.7 },
  "SUSPICIOUS-NET": { tactic: "Command and Control", technique: "T1071", confidence: 0.6 },
  "EICAR-TEST": { tactic: "Test", technique: "N/A", confidence: 1.0 },
};

const THREAT_CATEGORIES = {
  "REVERSE-SHELL": "Remote Access Trojan",
  "DLL-INJECTION": "Code Injection",
  "PROCESS-HOLLOWING": "Process Manipulation",
  "CREDENTIAL-THEFT": "Credential Harvester",
  "AUTORUN": "Persistence Mechanism",
  "SUSPICIOUS-REG": "Registry Modification",
  "DOWNLOAD-EXEC": "Downloader",
  "ENCRYPTION-LOOP": "Ransomware",
  "WORM-PROPAGATION": "Worm",
  "HIDDEN-PROCESS": "Stealth",
  "SUSPICIOUS-NET": "C2 Communication",
  "EICAR-TEST": "Test File",
  "PE-HEADER": "Executable",
  "PACKED-PE": "Packed Malware",
  "DOUBLE-EXT": "File Masquerading",
  "SUSPICIOUS-NAME": "Suspicious File",
  "PS-ENCODED": "Obfuscated Script",
  "KEYLOGGER": "Keylogger",
  "RANSOM-NOTE": "Ransomware Note",
};

export function analyzeThreat(threat) {
  const detections = threat.detections || [];
  if (!detections.length) {
    return {
      behavior_summary: "No specific threat patterns detected. File appears benign based on signature analysis.",
      origin: "Unknown",
      affected_assets: [threat.file || threat.name || "Unknown file"],
      severity: threat.severity || "low",
      confidence: 0.3,
      mitre_technique: "N/A",
      recommended_actions: ["Continue monitoring", "Periodic re-scan"],
      evidence: {
        rule: "No matches",
        score: threat.score || 0
      }
    };
  }

  // Determine primary threat
  const primaryDetection = detections.reduce((prev, curr) => 
    (curr.severity === "critical" || curr.severity === "high") ? curr : prev
  , detections[0]);

  const mitre = MITRE_TACTICS[primaryDetection.rule] || { tactic: "Unknown", technique: "TBD", confidence: 0.5 };
  const category = THREAT_CATEGORIES[primaryDetection.rule] || "Malicious";

  // Build behavior summary
  const behaviorSummary = `This file exhibits ${category} behavior patterns. ` +
    `Detected: ${detections.map(d => d.name).join(", ")}. ` +
    `The ${primaryDetection.rule} pattern suggests ${mitre.tactic.toLowerCase()} activities. ` +
    `Risk score: ${threat.score || 0}/100.`;

  // Generate recommended actions based on severity
  const actions = [];
  if (threat.severity === "critical") {
    actions.push("Immediate quarantine recommended");
    actions.push("Block network access for source process");
    actions.push("Scan related files in same directory");
    actions.push("Check for persistence mechanisms");
  } else if (threat.severity === "high") {
    actions.push("Quarantine file pending approval");
    actions.push("Investigate source and parent process");
    actions.push("Check system for related artifacts");
  } else {
    actions.push("Monitor file behavior");
    actions.push("Add to watchlist for changes");
  }

  return {
    behavior_summary: behaviorSummary,
    origin: threat.source || "Unknown",
    affected_assets: [threat.file || threat.name || "Unknown file"],
    severity: threat.severity || "medium",
    confidence: mitre.confidence,
    mitre_technique: `${mitre.tactic} (${mitre.technique})`,
    recommended_actions: actions,
    evidence: {
      matched_rules: detections.map(d => d.rule),
      primary_detection: primaryDetection.rule,
      detection_count: detections.length,
      file_hash: threat.hash || "N/A",
      entropy: threat.entropy || 0
    }
  };
}

export function analyzeProcess(process) {
  const suspicious = [];
  const isSystem = process.pid < 10 || ['system', 'idle', 'registry'].includes(process.name.toLowerCase());
  
  if (!isSystem) {
    // Check for suspicious process characteristics
    if (process.name.includes('powershell') || process.name.includes('cmd')) {
      suspicious.push('Script execution capability');
    }
    if (process.mem > 500 * 1024 * 1024) { // > 500MB
      suspicious.push('High memory usage');
    }
    if (process.children && process.children.length > 5) {
      suspicious.push('Multiple child processes');
    }
    if (process.chainLength > 3) {
      suspicious.push('Deep process chain');
    }
  }

  return {
    is_suspicious: suspicious.length > 0,
    indicators: suspicious,
    risk_level: suspicious.length >= 2 ? 'high' : suspicious.length === 1 ? 'medium' : 'low',
    recommendation: suspicious.length > 0 
      ? 'Monitor this process and its children closely' 
      : 'Process appears normal'
  };
}

export function analyzeConnection(conn) {
  const remote = conn.remote || "";
  const suspiciousIndicators = [];
  
  // Check for suspicious remote addresses
  if (/^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(remote)) {
    // Private IP - less suspicious
  } else if (/^0\.0\.0\.0|^127\.|^::1/.test(remote)) {
    // Local - not suspicious
  } else {
    // Public IP - check for common C2 ports
    const port = parseInt(remote.split(':')[1] || '0');
    const commonC2Ports = [4444, 8080, 8443, 9001, 9999];
    if (commonC2Ports.includes(port)) {
      suspiciousIndicators.push(`Connection to port ${port} (common C2 port)`);
    }
  }
  
  return {
    is_suspicious: suspiciousIndicators.length > 0,
    indicators: suspiciousIndicators,
    risk_level: suspiciousIndicators.length > 0 ? 'medium' : 'low'
  };
}