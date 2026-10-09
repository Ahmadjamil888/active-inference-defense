import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";

export const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4";

export function VideoBg({ dim }: { dim?: boolean }) {
  return (
    <div className="bg">
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src={VIDEO} type="video/mp4" />
      </video>
      {dim && <div className="bg-dim" />}
    </div>
  );
}

const LINKS = [
  { label: "Home", to: "/", tab: undefined },
  { label: "Dashboard", to: "/dashboard", tab: "overview" },
  { label: "Threats", to: "/dashboard", tab: "threats" },
  { label: "Agent", to: "/dashboard", tab: "agent" },
] as const;

export function Header({ active }: { active: string }) {
  return (
    <header className="slide-down relative z-10 mx-auto flex w-full max-w-[720px] items-center gap-[clamp(18px,2.8vw,28px)]">
      <Link to="/" className="logo-btn" aria-label="AISS home">
        <img src={logo} alt="" width={52} height={52} />
      </Link>
      <nav className="nav-pill">
        {LINKS.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            {...(l.tab ? { search: { tab: l.tab } } : {})}
            className={`nav-link ${active === l.label ? "active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <Link to="/dashboard" search={{ tab: "scans" }} className="pill-dark max-sm:hidden">
        <i className="fa-solid fa-shield-halved" /> Scan
      </Link>
    </header>
  );
}
