-- Create contests table for multiple contests support
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  terms_and_conditions TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_winners INTEGER DEFAULT 30,
  requires_video BOOLEAN DEFAULT true,
  requires_photos BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on contests
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Anyone can view active contests
CREATE POLICY "Anyone can view contests"
ON public.contests FOR SELECT
USING (true);

-- Admins can insert contests
CREATE POLICY "Admins can insert contests"
ON public.contests FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update contests
CREATE POLICY "Admins can update contests"
ON public.contests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete contests
CREATE POLICY "Admins can delete contests"
ON public.contests FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create contest_entries table for user participation
CREATE TABLE public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  video_url TEXT,
  video_uploaded_at TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  completion_percent NUMERIC(5,2) DEFAULT 0,
  photo_percent NUMERIC(5,2) DEFAULT 0,
  score NUMERIC(5,2) DEFAULT 0,
  rank INTEGER,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- Enable RLS on contest_entries
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own entries
CREATE POLICY "Users can view own contest entries"
ON public.contest_entries FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all entries
CREATE POLICY "Admins can view all contest entries"
ON public.contest_entries FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own entries
CREATE POLICY "Users can insert own contest entries"
ON public.contest_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own contest entries"
ON public.contest_entries FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can update all entries
CREATE POLICY "Admins can update all contest entries"
ON public.contest_entries FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete entries
CREATE POLICY "Admins can delete contest entries"
ON public.contest_entries FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add photo_url column to activity_logs
ALTER TABLE public.activity_logs
ADD COLUMN photo_url TEXT;

-- Insert initial contest MARATON-2026
INSERT INTO public.contests (code, name, description, terms_and_conditions, start_date, end_date, max_winners)
VALUES (
  'MARATON-2026',
  'Concurso Maratón Santiago 2026',
  '¡Participa y gana 1 de 30 cupos para la Maratón de Santiago 2026! Sube tu video de presentación y documenta tu entrenamiento con fotos.',
  'Términos y condiciones del concurso:

1. PARTICIPACIÓN: Para participar debes subir un video de presentación y completar tu plan de entrenamiento subiendo fotos de tus sesiones.

2. PUNTUACIÓN: Tu puntaje se calcula como el promedio entre tu porcentaje de completitud de sesiones y tu porcentaje de sesiones con foto subida.

3. RANKING: Los 30 participantes con mayor puntaje al cierre del concurso (1 de marzo 2026) serán los ganadores.

4. DESEMPATE: En caso de empate, se priorizará a quien haya subido su video de presentación primero.

5. PREMIOS: Los ganadores recibirán un cupo para participar en la Maratón de Santiago 2026.

6. REQUISITOS: Debes ser mayor de 18 años y completar tu registro en la plataforma.

7. Al participar, autorizas el uso de tu video e imágenes con fines promocionales.',
  '2026-01-06',
  '2026-03-01',
  30
);

-- Create indexes for performance
CREATE INDEX idx_contest_entries_contest_id ON public.contest_entries(contest_id);
CREATE INDEX idx_contest_entries_user_id ON public.contest_entries(user_id);
CREATE INDEX idx_contest_entries_score ON public.contest_entries(score DESC);
CREATE INDEX idx_contests_code ON public.contests(code);
CREATE INDEX idx_contests_is_active ON public.contests(is_active);