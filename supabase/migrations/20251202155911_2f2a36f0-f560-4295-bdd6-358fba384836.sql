-- =============================================
-- FASE 1: ENUMS Y TIPOS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.content_type AS ENUM ('video_embed', 'video_link', 'image', 'text_markdown', 'pdf');
CREATE TYPE public.notification_status AS ENUM ('sent', 'delivered', 'failed', 'opened', 'clicked');
CREATE TYPE public.waiting_status AS ENUM ('pending', 'invited', 'joined');

-- =============================================
-- FASE 2: TABLAS BASE (sin dependencias)
-- =============================================

-- Lista de espera
CREATE TABLE public.waiting_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status public.waiting_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Planes de entrenamiento
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (name IN ('42k', '21k', '10k')),
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  total_weeks SMALLINT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, difficulty)
);

-- Resultados de maratón
CREATE TABLE public.marathon_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position INTEGER,
  dorsal TEXT,
  first_name TEXT,
  last_name TEXT,
  nationality TEXT,
  category TEXT,
  time_gross TEXT,
  time_net TEXT,
  time_net_seconds INTEGER,
  distance TEXT CHECK (distance IN ('42k', '21k', '10k')),
  race_date DATE,
  race_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FASE 3: TABLAS CON DEPENDENCIAS
-- =============================================

-- Semanas del plan
CREATE TABLE public.weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  week_number SMALLINT NOT NULL,
  tip_week JSONB,
  tip_month JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, week_number)
);

-- Actividades diarias
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  title TEXT NOT NULL,
  description TEXT,
  distance_km NUMERIC(6,2),
  duration_min INTEGER,
  intensity SMALLINT CHECK (intensity BETWEEN 1 AND 5),
  content_type public.content_type NOT NULL DEFAULT 'text_markdown',
  media_url TEXT,
  order_index SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_id, day_of_week, order_index)
);

-- Perfiles de usuario
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  distance TEXT CHECK (distance IN ('42k', '21k', '10k')),
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 3),
  current_plan_id UUID REFERENCES public.plans(id),
  current_week_id UUID REFERENCES public.weeks(id),
  start_date DATE,
  target_race_date DATE,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Roles de usuario (CRÍTICO PARA SEGURIDAD)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Progreso por semana
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, week_id)
);

-- Log de actividades completadas
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT true,
  logged_at TIMESTAMPTZ DEFAULT now(),
  logged_distance_km NUMERIC(6,2),
  logged_duration_min INTEGER,
  notes TEXT,
  UNIQUE(user_id, activity_id)
);

-- Log de notificaciones
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status public.notification_status DEFAULT 'sent',
  error_message TEXT
);

-- Plantillas de notificaciones
CREATE TABLE public.personalized_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'activity_completed', 'week_completed', 'milestone_reached',
    'streak', 'reminder', 'welcome', 'plan_started'
  )),
  trigger_value TEXT,
  plan_distance TEXT CHECK (plan_distance IN ('42k', '21k', '10k') OR plan_distance IS NULL),
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 3 OR difficulty IS NULL),
  message_title TEXT NOT NULL,
  message_body TEXT NOT NULL,
  media_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FASE 4: ÍNDICES DE RENDIMIENTO
-- =============================================
CREATE INDEX ix_waiting_list_status ON public.waiting_list(status);
CREATE INDEX ix_waiting_list_created ON public.waiting_list(created_at DESC);
CREATE INDEX ix_weeks_plan_id ON public.weeks(plan_id);
CREATE INDEX ix_activities_week_id ON public.activities(week_id);
CREATE INDEX ix_activities_day ON public.activities(week_id, day_of_week);
CREATE INDEX ix_user_profiles_plan ON public.user_profiles(current_plan_id);
CREATE INDEX ix_user_profiles_last_activity ON public.user_profiles(last_activity_at);
CREATE INDEX ix_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX ix_user_progress_user ON public.user_progress(user_id);
CREATE INDEX ix_user_progress_week ON public.user_progress(week_id);
CREATE INDEX ix_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX ix_activity_logs_activity ON public.activity_logs(activity_id);
CREATE INDEX ix_activity_logs_logged ON public.activity_logs(logged_at DESC);
CREATE INDEX ix_marathon_results_distance ON public.marathon_results(distance);
CREATE INDEX ix_marathon_results_time ON public.marathon_results(time_net_seconds);
CREATE INDEX ix_marathon_results_dorsal ON public.marathon_results(dorsal);
CREATE INDEX ix_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX ix_notification_logs_email ON public.notification_logs(recipient_email);
CREATE INDEX ix_pers_notif_trigger ON public.personalized_notifications(trigger_type, is_active) WHERE is_active = true;

-- =============================================
-- FASE 5: FUNCIONES DE SEGURIDAD
-- =============================================

-- Función para verificar roles (SECURITY DEFINER evita recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Función para calcular tiempo en segundos
CREATE OR REPLACE FUNCTION public.calculate_time_seconds()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.time_net ~ '^\d+:\d{2}:\d{2}$' THEN
    NEW.time_net_seconds := (
      (split_part(NEW.time_net, ':', 1)::int * 3600) +
      (split_part(NEW.time_net, ':', 2)::int * 60) +
      split_part(NEW.time_net, ':', 3)::int
    );
  ELSE
    NEW.time_net_seconds := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- FASE 6: TRIGGERS
-- =============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER calculate_marathon_time
  BEFORE INSERT OR UPDATE ON public.marathon_results
  FOR EACH ROW EXECUTE FUNCTION public.calculate_time_seconds();

-- =============================================
-- FASE 7: ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marathon_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_notifications ENABLE ROW LEVEL SECURITY;

-- waiting_list policies
CREATE POLICY "Anyone can subscribe to waiting list" ON public.waiting_list FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view waiting list" ON public.waiting_list FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update waiting list" ON public.waiting_list FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete from waiting list" ON public.waiting_list FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- plans policies (public read)
CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins can insert plans" ON public.plans FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update plans" ON public.plans FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete plans" ON public.plans FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- weeks policies (public read)
CREATE POLICY "Anyone can view weeks" ON public.weeks FOR SELECT USING (true);
CREATE POLICY "Admins can insert weeks" ON public.weeks FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update weeks" ON public.weeks FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete weeks" ON public.weeks FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- activities policies (public read)
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Admins can insert activities" ON public.activities FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update activities" ON public.activities FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete activities" ON public.activities FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.user_profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- user_progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.user_progress FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- activity_logs policies
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity logs" ON public.activity_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activity logs" ON public.activity_logs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- marathon_results policies (public read)
CREATE POLICY "Anyone can view marathon results" ON public.marathon_results FOR SELECT USING (true);
CREATE POLICY "Admins can insert marathon results" ON public.marathon_results FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update marathon results" ON public.marathon_results FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete marathon results" ON public.marathon_results FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- notification_logs policies (admin only)
CREATE POLICY "Admins can view notification logs" ON public.notification_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert notification logs" ON public.notification_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update notification logs" ON public.notification_logs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete notification logs" ON public.notification_logs FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- personalized_notifications policies (admin only)
CREATE POLICY "Admins can view personalized notifications" ON public.personalized_notifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert personalized notifications" ON public.personalized_notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update personalized notifications" ON public.personalized_notifications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete personalized notifications" ON public.personalized_notifications FOR DELETE USING (public.has_role(auth.uid(), 'admin'));