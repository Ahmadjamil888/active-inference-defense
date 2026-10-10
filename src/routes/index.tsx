import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AISS — Smarter Security Starts Here" },
      { name: "description", content: "AISS - Agentic AI Security System. Local-first security monitoring with AI-driven threat detection and automated response." },
      { name: "theme-color", content: "#E6EDF6" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="page">
      <div className="hero-wrapper">
        <div className="card">
        <video className="bg" autoPlay muted loop playsInline preload="auto" disablePictureInPicture
          aria-hidden="true"
          poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_105822_bf7c2d53-9957-4521-bbbf-7c1ab7a70130.png"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_105953_21ad8049-9088-4a00-bad3-aee6b5575a2b.mp4"></video>
        <div className="tint"></div>
        
        <div className="stack">
          <div className="row">
            <a className="brand l t" style={{ "--x": 68, "--y": 47 }} href="#">
              <svg className="mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <defs><clipPath id="gclip"><circle cx="20" cy="20" r="18.2"/></clipPath></defs>
                <circle cx="20" cy="20" r="18.4" stroke="#0d1b30" strokeWidth="1.1"/>
                <g clipPath="url(#gclip)" stroke="#0d1b30" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.2 4.6c3-.9 6.2-1 9.2-.1" strokeWidth="1.7"/>
                  <path d="M5.6 9.2c3.8-1.9 8-2.4 11.7-1.2 2.5.8 4.3 2.1 6.6 2.3 2 .2 4.2-.4 6.4-1.5" strokeWidth="2.3"/>
                  <path d="M2.6 13.9c4.4-2.4 9.4-3 13.6-1.5 2.4.9 4.1 2.3 6.4 2.4 2.3.1 4.7-1 7.1-2.4 1.6-.9 3.4-1.4 5.3-1.4" strokeWidth="2.7"/>
                  <path d="M1.6 18.7c4.8-2.7 10.1-3.2 14.4-1.6 1.8.7 3.2 1.6 4.7 2.1-1.7 1.3-3.4 2.2-5.1 2.6 2.9.5 5.9-.1 8.8-1.5 1.5-.7 2.9-1.6 4.4-2.3 1.9-.9 3.9-1.3 5.9-1.1" strokeWidth="2.9"/>
                  <path d="M1.9 24.1c4.5-2.4 9.6-3 13.9-1.6 2.3.7 4 1.9 6.2 2 2.4.1 5-.9 7.5-2.3 1.6-.9 3.3-1.4 5-1.4" strokeWidth="2.8"/>
                  <path d="M3.7 28.8c4.1-2 8.7-2.5 12.6-1.3 2.2.7 3.8 1.8 5.9 1.8 2.3.1 4.8-.8 7.1-2.1 1.2-.7 2.5-1.1 3.8-1.2" strokeWidth="2.4"/>
                  <path d="M7.6 32.9c3.5-1.5 7.4-1.9 10.6-.9 1.9.6 3.3 1.4 5 1.5 1.6.1 3.3-.3 5-1.1" strokeWidth="1.9"/>
                  <path d="M13.6 35.8c2.8-.9 5.8-1 8.6-.2" strokeWidth="1.5"/>
                </g>
              </svg>
              <b className="sx" style={{ "--sx": 0.894 }}>AISS</b>
            </a>
            
            <button className="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-menu">
              <i></i><i></i>
            </button>
            
            <div className="menu" id="site-menu">
              <nav className="nav">
                <div className="n-home">
                  <svg viewBox="0 0 20 21">
                    <path d="M2 8.4 10 2l8 6.4V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" stroke="#202940" strokeWidth="1.7" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Home</span>
                <span className="n-explore">Explore</span>
                <div className="n-div"></div>
                <div className="n-grid">
                  <svg viewBox="0 0 20 20">
                    <rect x="1" y="1" width="7.4" height="7.4" rx="1.7" stroke="#202940" strokeWidth="1.7" fill="none"/>
                    <rect x="11.6" y="1" width="7.4" height="7.4" rx="1.7" stroke="#202940" strokeWidth="1.7" fill="none"/>
                    <rect x="1" y="11.6" width="7.4" height="7.4" rx="1.7" stroke="#202940" strokeWidth="1.7" fill="none"/>
                    <rect x="11.6" y="11.6" width="7.4" height="7.4" rx="1.7" stroke="#202940" strokeWidth="1.7" fill="none"/>
                  </svg>
                </div>
                <span className="n-product">Product</span>
                <a className="cta" href="#install">
                  <span>Get free plan</span>
                  <div className="knob">
                    <svg viewBox="0 0 18 18">
                      <path d="m6.6 3.6 6 5.4-6 5.4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </a>
              </nav>
            </div>
          </div>
          
          <div className="hero-blk">
            <p className="eyebrow l c sx" style={{ "--x": 65.7, "--y": -209.2, "--sx": 0.9293 }}>Your digital infrastructure</p>
            <h1 className="l c" style={{ "--x": 62.6, "--y": -167.3 }}>
              <span className="sx" style={{ "--sx": 0.9431 }}>Smarter Security</span><br/>
              <span className="sx" style={{ "--sx": 0.9792 }}>Starts Here</span>
            </h1>
            <div className="tagrow">
              <span className="play l c" style={{ "--x": 66, "--y": 34 }}>
                <svg viewBox="0 0 13 14">
                  <path d="M1.4 1.3 11.6 7 1.4 12.7z" fill="#0b1526"/>
                </svg>
              </span>
              <span className="tag l c sx" style={{ "--x": 131, "--y": 48.7, "--sx": 0.8973 }}>Secure the Sphere. Protect What Matters.</span>
            </div>
            
            <aside className="panel l c r" style={{ "--x": 58, "--y": -165 }}>
              <span className="p-title sx" style={{ "--sx": 0.8707 }}>AI-Driven</span>
              <div className="dot"></div>
              <div className="shield">
                <svg viewBox="0 0 30 39">
                  <path d="M15 1.2 1.6 6.6v13.1c0 6.6 5.1 12.6 13.4 17.9 8.3-5.3 13.4-11.3 13.4-17.9V6.6z" stroke="#101c33" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2.1 18.9c4.6-1.1 8.9-1.6 12.9-1.6s8.3.5 12.9 1.6" stroke="#101c33" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="p-sub sx" style={{ "--sx": 0.8899 }}>Cloud<br/>Infrastructure<br/>Protection</p>
              <div className="scale">
                <span>1K</span>
                <span>10K</span>
                <span>50K</span>
                <span>100K</span>
              </div>
              <div className="track">
                <i></i>
              </div>
            </aside>
          </div>
          
          <div className="row">
            <div className="stats">
              <div className="stat">
                <span className="num l b sx" style={{ "--x": 64, "--y": 60.4, "--sx": 1 }}>112+</span>
                <span className="lbl l b sx" style={{ "--x": 295, "--y": 73.2, "--sx": 0.9634 }}>Countries<br/>Protected<br/>Globally</span>
              </div>
              <span className="slash l b" style={{ "--x": 418, "--y": 76 }}></span>
              <div className="stat">
                <span className="num l b sx" style={{ "--x": 480, "--y": 60.4, "--sx": 0.9858 }}>55K+</span>
                <span className="lbl l b sx" style={{ "--x": 716, "--y": 96.7, "--sx": 0.9209 }}>Clients<br/>Secured</span>
              </div>
            </div>
            <a className="meet l b r" style={{ "--x": 59, "--y": 66 }} href="#install">
              <span className="thumb">
                <img alt="" style={{ objectPosition: "60% 50%" }} src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_105822_bf7c2d53-9957-4521-bbbf-7c1ab7a70130.png"/>
              </span>
              <b>Meet AISS</b>
              <div className="knob">
                <svg viewBox="0 0 18 18">
                  <path d="m6.6 3.6 6 5.4-6 5.4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
      </div>
      
      {/* Installation Section */}
      <div className="content-section" id="install">
        <h2 className="section-title">Installation</h2>
        <p className="section-subtitle">Install AISS from GitHub. Works on Windows, macOS, and Linux.</p>
        <div className="install-block">
          <div className="install-label">Clone the repository</div>
          <div className="install-command">
            git clone https://github.com/Ahmadjamil888/active-inference-defense.git
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('git clone https://github.com/Ahmadjamil888/active-inference-defense.git')}>Copy</button>
          </div>
        </div>
        <div className="install-block">
          <div className="install-label">Install the CLI globally</div>
          <div className="install-command">
            cd active-inference-defense/agent
            npm install -g .
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('cd active-inference-defense/agent\nnpm install -g .')}>Copy</button>
          </div>
        </div>
        <div className="install-block">
          <div className="install-label">Start AISS</div>
          <div className="install-command">
            aiss
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('aiss')}>Copy</button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="content-section" id="features">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Real-Time Monitoring</h3>
            <p className="feature-desc">Continuous observation of processes, network connections, files, and hardware events with active inference detection.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Security Gate</h3>
            <p className="feature-desc">Automated decisions on suspicious activity: ALLOW, HOLD, QUARANTINE, or BLOCK based on configurable rules and baselines.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Incident Response</h3>
            <p className="feature-desc">Track security events, manage approvals, quarantine suspicious files, and maintain an audit trail of all actions.</p>
          </div>
        </div>
      </div>
      
      {/* Documentation Section */}
      <div className="content-section" id="docs">
        <h2 className="section-title">Documentation</h2>
        <p className="section-subtitle">Comprehensive guides for installation, CLI commands, dashboard usage, and security operations.</p>
        <a href="/docs" className="documentation-link">View Full Documentation →</a>
      </div>
    </div>
  );
}
