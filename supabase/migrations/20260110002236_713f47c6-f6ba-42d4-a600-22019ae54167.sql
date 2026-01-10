-- Agregar campos de fases al concurso
ALTER TABLE public.contests 
ADD COLUMN IF NOT EXISTS preselection_count integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS video_deadline date,
ADD COLUMN IF NOT EXISTS current_phase text DEFAULT 'accumulation';

-- Comentario sobre las fases:
-- 'accumulation' = usuarios entrenan y suben fotos (todos participan automáticamente)
-- 'video_submission' = top 100 preseleccionados suben video
-- 'committee_review' = comité revisa videos
-- 'winners_announced' = ganadores anunciados

-- Agregar campos de preselección/ganadores a contest_entries
-- Esta tabla solo se usará para los preseleccionados (top 100), no para todos los usuarios
ALTER TABLE public.contest_entries
ADD COLUMN IF NOT EXISTS is_preselected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preselected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS committee_selected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS committee_notes text,
ADD COLUMN IF NOT EXISTS final_winner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notified_at timestamp with time zone;

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_contest_entries_preselected 
ON public.contest_entries(contest_id, is_preselected) 
WHERE is_preselected = true;

CREATE INDEX IF NOT EXISTS idx_contest_entries_winners 
ON public.contest_entries(contest_id, final_winner) 
WHERE final_winner = true;

CREATE INDEX IF NOT EXISTS idx_contests_phase 
ON public.contests(current_phase, is_active);