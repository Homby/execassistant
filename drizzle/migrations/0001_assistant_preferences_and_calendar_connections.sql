CREATE TABLE public.assistant_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_name text NOT NULL DEFAULT 'Ava',
  tone text NOT NULL DEFAULT 'Direct',
  summary_length text NOT NULL DEFAULT 'Concise',
  briefing_delivery text NOT NULL DEFAULT 'On demand',
  working_hours text NOT NULL DEFAULT '08:00 - 18:30',
  timezone text NOT NULL DEFAULT 'Europe/London',
  focus_areas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_preferences TO authenticated;
GRANT ALL ON public.assistant_preferences TO service_role;

ALTER TABLE public.assistant_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own assistant preferences" ON public.assistant_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own assistant preferences" ON public.assistant_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own assistant preferences" ON public.assistant_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER assistant_preferences_set_updated_at
  BEFORE UPDATE ON public.assistant_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  account_email text NOT NULL,
  calendar_url text,
  sync_mode text NOT NULL DEFAULT 'two-way',
  status text NOT NULL DEFAULT 'connected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, account_email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_connections TO authenticated;
GRANT ALL ON public.calendar_connections TO service_role;

ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own calendar connections" ON public.calendar_connections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own calendar connections" ON public.calendar_connections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own calendar connections" ON public.calendar_connections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own calendar connections" ON public.calendar_connections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER calendar_connections_set_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
