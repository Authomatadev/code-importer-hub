-- Create achievements table (catalog of available achievements)
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  how_to_earn TEXT NOT NULL,
  icon TEXT NOT NULL,
  badge_color TEXT DEFAULT 'gold',
  category TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_value INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_achievements table (unlocked achievements per user)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  shared_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (everyone can view)
CREATE POLICY "Anyone can view achievements" ON public.achievements
FOR SELECT USING (true);

CREATE POLICY "Admins can insert achievements" ON public.achievements
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update achievements" ON public.achievements
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete achievements" ON public.achievements
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user achievements" ON public.user_achievements
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Seed achievements data
INSERT INTO public.achievements (name, description, how_to_earn, icon, badge_color, category, trigger_type, trigger_value, sort_order) VALUES
-- Streak achievements
('Chispa Inicial', '¡Tu racha está encendida!', 'Completa actividades 3 días consecutivos', '🔥', 'orange', 'streak', 'streak_days', 3, 1),
('En Racha', '¡Una semana sin parar!', 'Completa actividades 7 días consecutivos', '⚡', 'yellow', 'streak', 'streak_days', 7, 2),
('Imparable', '¡Dos semanas de puro fuego!', 'Completa actividades 14 días consecutivos', '💥', 'red', 'streak', 'streak_days', 14, 3),
('Leyenda del Streak', '¡Un mes completo entrenando!', 'Completa actividades 30 días consecutivos', '🌟', 'gold', 'streak', 'streak_days', 30, 4),

-- Milestone achievements
('Primera Zancada', '¡Tu viaje ha comenzado!', 'Completa tu primera actividad', '🎯', 'primary', 'milestone', 'activities_count', 1, 10),
('Semana en Llamas', '¡Primera semana completada!', 'Completa tu primera semana de entrenamiento', '🔥', 'orange', 'milestone', 'weeks_complete', 1, 11),

-- High intensity zone achievements
('Velocista Novato', '¡Empezando a acelerar!', 'Completa 5 actividades en zonas ZY/Z4/Z5', '⚡', 'yellow', 'intensity_zone', 'high_zone_count', 5, 20),
('Cohete Humano', '¡Velocidad imparable!', 'Completa 15 actividades en zonas ZY/Z4/Z5', '🚀', 'orange', 'intensity_zone', 'high_zone_count', 15, 21),
('Destructor de Umbrales', '¡Dominas la velocidad!', 'Completa 30 actividades en zonas ZY/Z4/Z5', '💀', 'red', 'intensity_zone', 'high_zone_count', 30, 22),

-- Interval achievements
('Primer Intervalo', '¡Intervalos dominados!', 'Completa 3 entrenamientos de intervalos', '🔄', 'primary', 'interval', 'interval_count', 3, 30),
('Rey del Tempo', '¡Maestro del tempo!', 'Completa 10 entrenamientos de intervalos', '⏱️', 'yellow', 'interval', 'interval_count', 10, 31),
('Máquina de Intervalos', '¡Intervalos son tu especialidad!', 'Completa 25 entrenamientos de intervalos', '🏎️', 'gold', 'interval', 'interval_count', 25, 32),

-- Long run achievements
('Kilómetro Cero', '¡Primeros trotes largos!', 'Completa 3 trotes largos', '🛣️', 'primary', 'long_run', 'long_run_count', 3, 40),
('Corredor de Fondo', '¡Resistencia en desarrollo!', 'Completa 10 trotes largos', '🌄', 'orange', 'long_run', 'long_run_count', 10, 41),
('Ultra Resistente', '¡Fondo es tu fortaleza!', 'Completa 20 trotes largos', '🏔️', 'gold', 'long_run', 'long_run_count', 20, 42),

-- Distance achievements
('Primeros 50K', '¡50 kilómetros acumulados!', 'Acumula 50 km de entrenamiento', '📏', 'primary', 'distance', 'total_distance', 50, 50),
('Club de los 100', '¡100 kilómetros logrados!', 'Acumula 100 km de entrenamiento', '🎖️', 'yellow', 'distance', 'total_distance', 100, 51),
('Devorador de Kilómetros', '¡200 km bajo tus pies!', 'Acumula 200 km de entrenamiento', '🏆', 'orange', 'distance', 'total_distance', 200, 52),
('Leyenda 500K', '¡Medio millar de kilómetros!', 'Acumula 500 km de entrenamiento', '👑', 'gold', 'distance', 'total_distance', 500, 53),

-- High intensity achievements
('Sudor y Gloria', '¡Intensidad al máximo!', 'Completa 5 actividades con intensidad 4-5', '💪', 'primary', 'high_intensity', 'high_intensity_count', 5, 60),
('Forjado en Fuego', '¡El esfuerzo te define!', 'Completa 15 actividades con intensidad 4-5', '🔥', 'orange', 'high_intensity', 'high_intensity_count', 15, 61),
('Guerrero del Dolor', '¡La intensidad es tu aliada!', 'Completa 30 actividades con intensidad 4-5', '⚔️', 'red', 'high_intensity', 'high_intensity_count', 30, 62),

-- Special plan completion achievements
('10K Legend', '¡Plan 10K completado!', 'Completa el plan de entrenamiento 10K', '⚡', 'gold', 'special', 'plan_complete_10k', 1, 70),
('Media Maratón', '¡Plan 21K completado!', 'Completa el plan de entrenamiento 21K', '🚀', 'gold', 'special', 'plan_complete_21k', 1, 71),
('Maratonista', '¡Plan 42K completado!', 'Completa el plan de entrenamiento 42K', '⭐', 'gold', 'special', 'plan_complete_42k', 1, 72);

-- Create index for better performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_sort_order ON public.achievements(sort_order);