import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header, VideoBg } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AISS — Agentic AI Security System" },
      { name: "description", content: "AISS is a local agentic AI security system that monitors your computer in real-time. Download and install to protect your machine." },
      { property: "og:title", content: "AISS — Agentic AI Security System" },
      { property: "og:description", content: "Real-time threat detection, process monitoring, and AI-powered security analysis running entirely on your machine." },
    ],
  }),
  component: Index,
});

function Index() {
  const [os, setOs] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes("win")) setOs("Windows");
    else if (platform.includes("mac")) setOs("macOS");
    else if (platform.includes("linux")) setOs("Linux");
    else setOs("Unknown");
  }, []);

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <VideoBg />
      <div className="relative z-[1]">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-black font-bold text-lg">A</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">AISS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("features")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</button>
              <button onClick={() => scrollToSection("quick-start")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Quick Start</button>
              <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              <button onClick={() => scrollToSection("download")} className="cta text-sm px-6 py-2">Install</button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="anim mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm text-muted-foreground">Local First · Privacy Preserved</span>
            </div>
            <h1 className="headline text-5xl md:text-7xl mb-6">
              <span style={{ animationDelay: "0.12s" }}>Intelligence</span>
              <br />
              <span style={{ animationDelay: "0.3s" }}>Designed To Defend</span>
            </h1>
            <p className="subhead anim text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10" style={{ ["--d" as string]: "0.28s" }}>
              AISS is an agentic AI security system that monitors your computer in real-time. 
              It watches processes, network connections, and files—detecting threats before they spread.
              Everything runs locally on your machine.
            </p>
            <div className="anim flex flex-col sm:flex-row gap-4 justify-center" style={{ ["--d" as string]: "0.4s" }}>
              <button onClick={() => scrollToSection("download")} className="cta text-lg px-8 py-4 inline-flex items-center gap-3">
                <i className="fa-solid fa-download" />
                Get Started Free
              </button>
              <button onClick={() => scrollToSection("how-it-works")} className="pill-dark text-lg px-8 py-4 inline-flex items-center gap-3">
                <i className="fa-solid fa-play" />
                See How It Works
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to protect your computer, all in one place
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <i className="fa-solid fa-shield-halved text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
                <p className="text-muted-foreground">
                  Watch processes, network connections, and files as they happen. Detect anomalies in seconds, not hours.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <i className="fa-solid fa-brain text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
                <p className="text-muted-foreground">
                  Active inference engine learns your system's normal behavior and flags suspicious activity automatically.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <i className="fa-solid fa-lock text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
                <p className="text-muted-foreground">
                  All data stays on your machine. No telemetry, no cloud uploads, no data collection. Ever.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <i className="fa-solid fa-bolt text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Response</h3>
                <p className="text-muted-foreground">
                  Security gate with risk scoring (0-100) and automatic quarantine/blocking of threats.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <i className="fa-solid fa-microchip text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightweight</h3>
                <p className="text-muted-foreground">
                  Minimal resource usage. Runs in the background without slowing down your computer.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                  <i className="fa-solid fa-terminal text-2xl text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">Simple CLI</h3>
                <p className="text-muted-foreground">
                  Just type `aiss` anywhere in your terminal. Clean, intuitive command-line interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to complete protection
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Install</h3>
                <p className="text-muted-foreground">
                  Download the installer and run it. Takes less than 2 minutes.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Start</h3>
                <p className="text-muted-foreground">
                  Open a terminal and type `aiss`. The dashboard opens automatically.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Protect</h3>
                <p className="text-muted-foreground">
                  AISS monitors your computer 24/7. Threats are detected and contained automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section id="quick-start" className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold mb-4">Quick Start</h2>
              <p className="text-xl text-muted-foreground">
                Get up and running in under 5 minutes
              </p>
            </div>
            <div className="glass p-8 rounded-2xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-black font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Download the Installer</h3>
                    <p className="text-muted-foreground mb-3">
                      Click the download button below to get AISS-Setup.exe for Windows.
                    </p>
                    <code className="bg-accent px-3 py-1 rounded text-sm">AISS-Setup.exe (45 MB)</code>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-black font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Run as Administrator</h3>
                    <p className="text-muted-foreground mb-3">
                      Right-click the installer and select "Run as Administrator" to enable all features.
                    </p>
                    <code className="bg-accent px-3 py-1 rounded text-sm">Required for service installation</code>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-black font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Open Terminal and Run</h3>
                    <p className="text-muted-foreground mb-3">
                      Open a NEW Command Prompt and simply type `aiss`. The dashboard opens automatically.
                    </p>
                    <code className="bg-accent px-3 py-1 rounded text-sm">aiss</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-24 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-display font-bold mb-4">Install AISS</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Clone the repository and install using Node.js
            </p>
            
            <div className="glass p-8 rounded-2xl max-w-3xl mx-auto text-left">
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">Detected OS: <span className="text-foreground font-semibold">{os}</span></span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black text-sm font-bold">1</span>
                    Clone the Repository
                  </h3>
                  <div className="bg-accent p-4 rounded-lg">
                    <code className="text-sm">git clone https://github.com/Ahmadjamil888/active-inference-defense.git</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('git clone https://github.com/Ahmadjamil888/active-inference-defense.git')}
                      className="ml-3 text-xs pill-dark px-3 py-1"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black text-sm font-bold">2</span>
                    Navigate to Agent Directory
                  </h3>
                  <div className="bg-accent p-4 rounded-lg">
                    <code className="text-sm">cd active-inference-defense/agent</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('cd active-inference-defense/agent')}
                      className="ml-3 text-xs pill-dark px-3 py-1"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black text-sm font-bold">3</span>
                    Install Globally
                  </h3>
                  <div className="bg-accent p-4 rounded-lg">
                    <code className="text-sm">npm install -g .</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('npm install -g .')}
                      className="ml-3 text-xs pill-dark px-3 py-1"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-black text-sm font-bold">4</span>
                    Start AISS
                  </h3>
                  <div className="bg-accent p-4 rounded-lg">
                    <code className="text-sm">aiss</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText('aiss')}
                      className="ml-3 text-xs pill-dark px-3 py-1"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Requirements:</strong> Node.js 18+ · Administrator rights (for Windows Service)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-border/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-black font-bold text-lg">A</span>
                </div>
                <span className="font-display font-bold text-xl">AISS</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="https://github.com/Ahmadjamil888/active-inference-defense" className="hover:text-foreground transition-colors">GitHub</a>
                <a href="/docs" className="hover:text-foreground transition-colors">Documentation</a>
              </div>
              <div className="text-sm text-muted-foreground">
                AISS v1.0.0 · MIT License
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
