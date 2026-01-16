-- =====================================================
-- SCRIPT DE MIGRACIÓN CONSOLIDADO - ANDES RUN
-- Ejecutar en un nuevo proyecto Lovable Cloud
-- =====================================================

-- =====================================================
-- PARTE 1: TIPOS ENUM
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.content_type AS ENUM ('video_embed', 'video_link', 'image', 'text_markdown', 'pdf');
CREATE TYPE public.activity_type AS ENUM ('run', 'walk', 'strength', 'rest', 'stretch', 'cross_training');
CREATE TYPE public.notification_status AS ENUM ('sent', 'delivered', 'failed', 'opened', 'clicked');
CREATE TYPE public.waiting_status AS ENUM ('pending', 'invited', 'joined', 'approved', 'rejected');

-- =====================================================
-- PARTE 2: TABLAS BASE (sin foreign keys circulares)
-- =====================================================

-- Tabla: plans
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  distance TEXT,
  difficulty INTEGER NOT NULL,
  total_weeks INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: weeks
CREATE TABLE public.weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  tip_week JSONB,
  tip_month JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  content_type public.content_type NOT NULL DEFAULT 'text_markdown',
  media_url TEXT,
  activity_type public.activity_type,
  duration_min INTEGER,
  distance_km NUMERIC,
  intensity INTEGER,
  zone TEXT,
  notes TEXT,
  phase TEXT,
  terrain TEXT,
  training_type TEXT,
  warmup_duration_min INTEGER,
  main_work_type TEXT,
  main_work_duration_min INTEGER,
  main_work_distance_km NUMERIC,
  repetitions INTEGER,
  rep_distance_meters INTEGER,
  rest_between_reps_min NUMERIC,
  total_daily_km NUMERIC,
  stretch_before_after BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: user_profiles
CREATE TABLE public.user_profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  rut TEXT,
  distance TEXT,
  difficulty INTEGER,
  current_plan_id UUID REFERENCES public.plans(id),
  current_week_id UUID REFERENCES public.weeks(id),
  start_date DATE,
  target_race_date DATE,
  is_first_login BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: user_roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabla: user_progress
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES public.weeks(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, week_id)
);

-- Tabla: activity_logs
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logged_duration_min INTEGER,
  logged_distance_km NUMERIC,
  notes TEXT,
  photo_url TEXT,
  UNIQUE(user_id, activity_id)
);

-- Tabla: waiting_list
CREATE TABLE public.waiting_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  rut TEXT,
  selected_distance TEXT,
  selected_difficulty INTEGER,
  status public.waiting_status DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: marathon_results
CREATE TABLE public.marathon_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_name TEXT,
  race_date DATE,
  distance TEXT,
  dorsal TEXT,
  first_name TEXT,
  last_name TEXT,
  nationality TEXT,
  category TEXT,
  position INTEGER,
  time_gross TEXT,
  time_net TEXT,
  time_net_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: notification_logs
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status public.notification_status DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: personalized_notifications
CREATE TABLE public.personalized_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  trigger_value TEXT,
  plan_distance TEXT,
  difficulty INTEGER,
  message_title TEXT NOT NULL,
  message_body TEXT NOT NULL,
  media_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- PARTE 3: TABLAS DE LOGROS
-- =====================================================

-- Tabla: achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  how_to_earn TEXT NOT NULL,
  icon TEXT NOT NULL,
  badge_color TEXT,
  category TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_value INTEGER,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: user_achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  shared_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- PARTE 4: TABLAS DE CONCURSO
-- =====================================================

-- Tabla: contests
CREATE TABLE public.contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  terms_and_conditions TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  video_deadline DATE,
  max_winners INTEGER,
  preselection_count INTEGER DEFAULT 100,
  requires_video BOOLEAN DEFAULT true,
  requires_photos BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  current_phase TEXT DEFAULT 'accumulation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: contest_entries
CREATE TABLE public.contest_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  completion_percent NUMERIC,
  photo_percent NUMERIC,
  score NUMERIC,
  rank INTEGER,
  is_preselected BOOLEAN DEFAULT false,
  preselected_at TIMESTAMP WITH TIME ZONE,
  video_url TEXT,
  video_uploaded_at TIMESTAMP WITH TIME ZONE,
  is_winner BOOLEAN DEFAULT false,
  final_winner BOOLEAN DEFAULT false,
  committee_selected BOOLEAN DEFAULT false,
  committee_notes TEXT,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- =====================================================
-- PARTE 5: FUNCIONES DE BASE DE DATOS
-- =====================================================

-- Función: has_role (verificar rol de usuario)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función: handle_new_user (crear perfil automático)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Función: calculate_time_seconds (calcular tiempo en segundos)
CREATE OR REPLACE FUNCTION public.calculate_time_seconds()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- =====================================================
-- PARTE 6: TRIGGERS
-- =====================================================

-- Trigger: crear perfil al registrar usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: calcular tiempo de maratón
CREATE TRIGGER calculate_marathon_time
  BEFORE INSERT OR UPDATE ON public.marathon_results
  FOR EACH ROW EXECUTE FUNCTION public.calculate_time_seconds();

-- =====================================================
-- PARTE 7: STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-media', 'activity-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Public read access for activity-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-media');

CREATE POLICY "Authenticated users can upload to activity-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'activity-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- PARTE 8: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marathon_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Políticas: PLANS (lectura pública)
-- =====================================================
CREATE POLICY "Plans are viewable by everyone"
ON public.plans FOR SELECT USING (true);

CREATE POLICY "Admins can insert plans"
ON public.plans FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plans"
ON public.plans FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plans"
ON public.plans FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: WEEKS (lectura pública)
-- =====================================================
CREATE POLICY "Weeks are viewable by everyone"
ON public.weeks FOR SELECT USING (true);

CREATE POLICY "Admins can insert weeks"
ON public.weeks FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update weeks"
ON public.weeks FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete weeks"
ON public.weeks FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: ACTIVITIES (lectura pública)
-- =====================================================
CREATE POLICY "Activities are viewable by everyone"
ON public.activities FOR SELECT USING (true);

CREATE POLICY "Admins can insert activities"
ON public.activities FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update activities"
ON public.activities FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete activities"
ON public.activities FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: USER_PROFILES
-- =====================================================
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (true);

-- =====================================================
-- Políticas: USER_ROLES
-- =====================================================
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (true);

-- =====================================================
-- Políticas: USER_PROGRESS
-- =====================================================
CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.user_progress FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: ACTIVITY_LOGS
-- =====================================================
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs"
ON public.activity_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: WAITING_LIST
-- =====================================================
CREATE POLICY "Anyone can insert to waiting list"
ON public.waiting_list FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own waiting entry"
ON public.waiting_list FOR SELECT
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all waiting list"
ON public.waiting_list FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update waiting list"
ON public.waiting_list FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete waiting list entries"
ON public.waiting_list FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: MARATHON_RESULTS (lectura pública)
-- =====================================================
CREATE POLICY "Marathon results are viewable by everyone"
ON public.marathon_results FOR SELECT USING (true);

CREATE POLICY "Admins can insert marathon results"
ON public.marathon_results FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update marathon results"
ON public.marathon_results FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete marathon results"
ON public.marathon_results FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: NOTIFICATION_LOGS
-- =====================================================
CREATE POLICY "Users can view their own notifications"
ON public.notification_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
ON public.notification_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert notifications"
ON public.notification_logs FOR INSERT
WITH CHECK (true);

-- =====================================================
-- Políticas: PERSONALIZED_NOTIFICATIONS
-- =====================================================
CREATE POLICY "Admins can manage personalized notifications"
ON public.personalized_notifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: ACHIEVEMENTS (lectura pública)
-- =====================================================
CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: USER_ACHIEVEMENTS
-- =====================================================
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user achievements"
ON public.user_achievements FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: CONTESTS (lectura pública para activos)
-- =====================================================
CREATE POLICY "Active contests are viewable by everyone"
ON public.contests FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage contests"
ON public.contests FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Políticas: CONTEST_ENTRIES
-- =====================================================
CREATE POLICY "Users can view their own contest entries"
ON public.contest_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contest entries"
ON public.contest_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contest entries"
ON public.contest_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contest entries"
ON public.contest_entries FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all contest entries"
ON public.contest_entries FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view leaderboard"
ON public.contest_entries FOR SELECT
USING (auth.role() = 'authenticated');

-- =====================================================
-- PARTE 9: DATOS SEMILLA - PLANES
-- =====================================================

-- 9 planes: 3 distancias × 3 dificultades
INSERT INTO public.plans (name, description, distance, difficulty, total_weeks) VALUES
-- 10K
('10K Principiante', 'Plan de entrenamiento 10K para principiantes', '10k', 1, 12),
('10K Intermedio', 'Plan de entrenamiento 10K nivel intermedio', '10k', 2, 12),
('10K Avanzado', 'Plan de entrenamiento 10K nivel avanzado', '10k', 3, 12),
-- 21K
('21K Principiante', 'Plan de entrenamiento media maratón para principiantes', '21k', 1, 16),
('21K Intermedio', 'Plan de entrenamiento media maratón nivel intermedio', '21k', 2, 16),
('21K Avanzado', 'Plan de entrenamiento media maratón nivel avanzado', '21k', 3, 16),
-- 42K
('42K Principiante', 'Plan de entrenamiento maratón para principiantes', '42k', 1, 20),
('42K Intermedio', 'Plan de entrenamiento maratón nivel intermedio', '42k', 2, 20),
('42K Avanzado', 'Plan de entrenamiento maratón nivel avanzado', '42k', 3, 20);

-- =====================================================
-- PARTE 10: DATOS SEMILLA - ACHIEVEMENTS
-- =====================================================

INSERT INTO public.achievements (name, description, how_to_earn, icon, badge_color, category, trigger_type, trigger_value, sort_order) VALUES
-- Logros de actividad
('Primera Carrera', '¡Completaste tu primera actividad de running!', 'Completa tu primera actividad de running', 'Trophy', '#FFD700', 'actividad', 'activities_completed', 1, 1),
('Semana Completa', '¡Completaste todas las actividades de una semana!', 'Completa todas las actividades de una semana', 'Calendar', '#4CAF50', 'consistencia', 'weeks_completed', 1, 2),
('Corredor Constante', '¡Has completado 10 actividades de running!', 'Completa 10 actividades de running', 'Flame', '#FF5722', 'actividad', 'activities_completed', 10, 3),
('Maratonista en Entrenamiento', '¡50 actividades completadas!', 'Completa 50 actividades de entrenamiento', 'Medal', '#9C27B0', 'actividad', 'activities_completed', 50, 4),
('Centurión', '¡100 actividades completadas!', 'Completa 100 actividades de entrenamiento', 'Award', '#E91E63', 'actividad', 'activities_completed', 100, 5),

-- Logros de distancia
('5K Club', '¡Acumulaste 5 kilómetros!', 'Acumula 5 km de distancia total', 'MapPin', '#2196F3', 'distancia', 'total_distance_km', 5, 6),
('10K Club', '¡Acumulaste 10 kilómetros!', 'Acumula 10 km de distancia total', 'Map', '#00BCD4', 'distancia', 'total_distance_km', 10, 7),
('Media Maratón', '¡Acumulaste 21 kilómetros!', 'Acumula 21 km de distancia total', 'Navigation', '#009688', 'distancia', 'total_distance_km', 21, 8),
('Maratonista', '¡Acumulaste 42 kilómetros!', 'Acumula 42 km de distancia total', 'Globe', '#4CAF50', 'distancia', 'total_distance_km', 42, 9),
('Ultra Runner', '¡Acumulaste 100 kilómetros!', 'Acumula 100 km de distancia total', 'Mountain', '#8BC34A', 'distancia', 'total_distance_km', 100, 10),

-- Logros de consistencia
('Racha de 3', '¡3 días consecutivos entrenando!', 'Entrena 3 días consecutivos', 'Zap', '#FFC107', 'consistencia', 'current_streak', 3, 11),
('Racha de 7', '¡Una semana entera sin faltar!', 'Entrena 7 días consecutivos', 'Star', '#FF9800', 'consistencia', 'current_streak', 7, 12),
('Racha de 14', '¡Dos semanas de constancia!', 'Entrena 14 días consecutivos', 'Crown', '#FF5722', 'consistencia', 'current_streak', 14, 13),
('Racha de 30', '¡Un mes completo entrenando!', 'Entrena 30 días consecutivos', 'Shield', '#F44336', 'consistencia', 'current_streak', 30, 14),

-- Logros de intensidad
('Zona Alta', '¡Primera actividad en zona alta!', 'Completa una actividad en zona 4 o 5', 'Activity', '#E91E63', 'intensidad', 'high_zone_activities', 1, 15),
('Intervalos Master', '¡5 entrenamientos de intervalos!', 'Completa 5 entrenamientos de intervalos', 'Repeat', '#9C27B0', 'intensidad', 'interval_sessions', 5, 16),
('Fondista', '¡Completaste tu primer fondo largo!', 'Completa una carrera de fondo largo (+15km)', 'Footprints', '#673AB7', 'intensidad', 'long_runs', 1, 17),

-- Logros especiales
('Fotógrafo Runner', '¡Subiste tu primera foto de entrenamiento!', 'Sube una foto de tu entrenamiento', 'Camera', '#3F51B5', 'especial', 'photos_uploaded', 1, 18),
('Álbum Completo', '¡10 fotos de entrenamiento!', 'Sube 10 fotos de tus entrenamientos', 'Image', '#2196F3', 'especial', 'photos_uploaded', 10, 19),
('Mes Completo', '¡Completaste 4 semanas seguidas!', 'Completa 4 semanas de entrenamiento', 'CalendarCheck', '#00BCD4', 'consistencia', 'weeks_completed', 4, 20);

-- =====================================================
-- PARTE 11: DATOS SEMILLA - CONTEST INICIAL
-- =====================================================

INSERT INTO public.contests (
  code, 
  name, 
  description, 
  start_date, 
  end_date, 
  video_deadline,
  max_winners, 
  preselection_count,
  requires_video, 
  requires_photos, 
  is_active,
  current_phase,
  terms_and_conditions
) VALUES (
  'MARATON-2026',
  'Concurso Maratón 2026',
  'Participa en el concurso oficial de la Maratón 2026. Completa tu entrenamiento, sube tus fotos y podrás ganar increíbles premios.',
  '2025-01-01',
  '2026-03-01',
  '2026-03-15',
  30,
  100,
  true,
  true,
  true,
  'accumulation',
  'Al participar en este concurso, acepto los términos y condiciones del programa de entrenamiento...'
);

-- =====================================================
-- PARTE 12: ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_weeks_plan_id ON public.weeks(plan_id);
CREATE INDEX idx_activities_week_id ON public.activities(week_id);
CREATE INDEX idx_activities_day_of_week ON public.activities(day_of_week);
CREATE INDEX idx_user_profiles_plan ON public.user_profiles(current_plan_id);
CREATE INDEX idx_user_profiles_week ON public.user_profiles(current_week_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_activity ON public.activity_logs(activity_id);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_contest_entries_contest ON public.contest_entries(contest_id);
CREATE INDEX idx_contest_entries_user ON public.contest_entries(user_id);
CREATE INDEX idx_contest_entries_rank ON public.contest_entries(rank);
CREATE INDEX idx_marathon_results_time ON public.marathon_results(time_net_seconds);
CREATE INDEX idx_waiting_list_status ON public.waiting_list(status);

-- =====================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- =====================================================

-- NOTAS POST-MIGRACIÓN:
-- 1. Crear primer usuario admin manualmente:
--    INSERT INTO user_roles (user_id, role) VALUES ('UUID-del-usuario', 'admin');
-- 
-- 2. Configurar RESEND_API_KEY en Secrets
-- 
-- 3. Las Edge Functions deben copiarse manualmente al proyecto nuevo
-- 
-- 4. Actualizar assets de marca (logos, imágenes hero)
