import { Link } from "@tanstack/react-router";

export const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_132544_b6ef0174-ed95-45ad-9a2f-ccb8acfbdce8.mp4";

export function VideoBg({ dim }: { dim?: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center-top"
        autoPlay 
        muted 
        loop 
        playsInline
        style={{ filter: 'grayscale(20%) contrast(1.1)' }}
      >
        <source src={VIDEO} type="video/mp4" />
      </video>
      {dim && <div className="absolute inset-0 bg-black/60" />}
    </div>
  );
}

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Documentation", to: "/docs" },
] as const;

export function Header({ active }: { active: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4" style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(40px)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'var(--cta)', borderRadius: '50%' }}>
          <svg viewBox="0 0 46 46" fill="none" className="w-6 h-6">
            <path d="M23 0V19.5" stroke="white" strokeWidth="3" strokeLinecap="butt"/>
            <path d="M14 10.2L23 19.2L32 10.2" stroke="white" strokeWidth="3" strokeLinecap="butt"/>
            <path d="M23 46V26.5" stroke="white" strokeWidth="3" strokeLinecap="butt" transform="rotate(90 23 23)"/>
            <path d="M14 35.8L23 26.8L32 35.8" stroke="white" strokeWidth="3" strokeLinecap="butt" transform="rotate(90 23 23)"/>
            <path d="M23 46V26.5" stroke="white" strokeWidth="3" strokeLinecap="butt" transform="rotate(180 23 23)"/>
            <path d="M14 35.8L23 26.8L32 35.8" stroke="white" strokeWidth="3" strokeLinecap="butt" transform="rotate(180 23 23)"/>
            <path d="M23 46V26.5" stroke="white" strokeWidth="3" strokeLinecap="butt" transform="rotate(270 23 23)"/>
            <path d="M14 35.8L23 26.8L32 35.8" stroke="white" strokeWidth="3" strokeLinecap="butt" transform="rotate(270 23 23)"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>AISS</span>
      </div>
      <nav className="ml-auto flex items-center gap-8">
        {LINKS.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            className={`text-sm font-medium transition-colors ${active === l.label ? '' : ''}`}
            style={{ 
              color: active === l.label ? 'var(--ink)' : 'var(--muted)',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
