CREATE TABLE public.threats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  name text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  status text NOT NULL DEFAULT 'detected',
  sha256 text,
  entropy numeric,
  free_energy numeric,
  detections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_verdict text,
  payload_preview text
);
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  level text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  scan_type text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  items_scanned int NOT NULL DEFAULT 0,
  findings int NOT NULL DEFAULT 0,
  duration_ms int NOT NULL DEFAULT 0,
  host jsonb NOT NULL DEFAULT '{}'::jsonb,
  report text
);
CREATE TABLE public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  prompt text NOT NULL,
  response text NOT NULL,
  model text NOT NULL
);
GRANT SELECT, INSERT, UPDATE ON public.threats, public.events, public.scans, public.agent_runs TO anon, authenticated;
GRANT ALL ON public.threats, public.events, public.scans, public.agent_runs TO service_role;
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read threats" ON public.threats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read events" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read scans" ON public.scans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read runs" ON public.agent_runs FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.threats, public.events, public.scans;