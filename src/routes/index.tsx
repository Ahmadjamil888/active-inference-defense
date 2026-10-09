import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Header, VideoBg } from "@/components/Shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AISS — Intelligence Designed To Defend" },
      { name: "description", content: "AISS is an agentic AI cyber security platform that monitors a live virtual machine 24/7 using active inference." },
      { property: "og:title", content: "AISS — Intelligence Designed To Defend" },
      { property: "og:description", content: "Autonomous, agentic AI threat detection with active inference." },
    ],
  }),
  component: Index,
});

function useCount(target: number, decimals: number, delay: number, duration: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      setV(target * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay, duration]);
  return v.toFixed(decimals);
}

function Stat({ icon, target, suffix, decimals, label, i }: { icon: string; target: number; suffix: string; decimals: number; label: string; i: number }) {
  const v = useCount(target, decimals, 480 + i * 90, 1500 + i * 80);
  return (
    <div className="anim flex flex-col items-center gap-1" style={{ ["--d" as string]: `${0.5 + i * 0.08}s` }}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{v}{suffix}</span>
      <span className="text-[clamp(11px,1.2vw,12.5px)] text-muted-foreground">{label}</span>
    </div>
  );
}

function Index() {
  const { data } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [t, s, e] = await Promise.all([
        supabase.from("threats").select("*", { count: "exact", head: true }),
        supabase.from("scans").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
      ]);
      return { threats: t.count ?? 0, scans: s.count ?? 0, events: e.count ?? 0 };
    },
  });
  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <VideoBg />
      <div className="relative z-[1] flex h-full flex-col items-center px-[clamp(14px,3vw,32px)] py-[clamp(16px,2.4vh,28px)]">
        <Header active="Home" />
        <main className="flex max-w-[900px] flex-1 flex-col items-center justify-center text-center">
          <div className="anim mb-[clamp(16px,2.5vh,26px)] inline-flex items-center" style={{ ["--d" as string]: "0.05s" }}>
            <div className="trust-ring relative z-[1]"><span><i className="fa-solid fa-shield-halved" /></span></div>
            <div className="trust-ring relative z-[2] -ml-4"><span><i className="fa-solid fa-brain" /></span></div>
            <div className="trust-ring relative z-[4] -ml-4"><span><i className="fa-solid fa-microchip" /></span></div>
            <div className="trust-pill -ml-4 pl-7">
              {data ? `${data.threats} threats contained · live` : "Autonomous defense · live"}
            </div>
          </div>
          <h1 className="headline">
            <span style={{ animationDelay: "0.12s" }}>Intelligence</span>
            <span style={{ animationDelay: "0.3s" }}>Designed To Defend</span>
          </h1>
          <p className="subhead anim mt-5" style={{ ["--d" as string]: "0.28s" }}>
            AISS is an agentic security platform that watches a live virtual machine, reasons with active inference and contains threats before they spread.
          </p>
          <div className="anim anim-pulse mt-7" style={{ ["--d" as string]: "0.4s" }}>
            <Link to="/dashboard" search={{ tab: "overview" }} className="cta">Open Dashboard</Link>
          </div>
        </main>
        <footer className="grid w-full max-w-[920px] grid-cols-4 gap-4 max-md:grid-cols-2">
          <Stat i={0} icon="<" target={data?.events ?? 0} suffix="" decimals={0} label="Events Logged" />
          <Stat i={1} icon="%" target={data?.threats ?? 0} suffix="" decimals={0} label="Threats Contained" />
          <Stat i={2} icon="*" target={24} suffix="/7" decimals={0} label="Autonomous Runtime" />
          <Stat i={3} icon="#" target={data?.scans ?? 0} suffix="" decimals={0} label="Scans Completed" />
        </footer>
      </div>
    </div>
  );
}
