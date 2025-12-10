-- Add new fields to activities table for complete training sheet structure

-- Identification
ALTER TABLE activities ADD COLUMN IF NOT EXISTS phase TEXT;

-- Training type (separate from activity_type for more specific categorization)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS training_type TEXT;

-- Warmup section
ALTER TABLE activities ADD COLUMN IF NOT EXISTS warmup_duration_min INTEGER;

-- Main work section
ALTER TABLE activities ADD COLUMN IF NOT EXISTS main_work_type TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS terrain TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS main_work_distance_km NUMERIC;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS main_work_duration_min INTEGER;

-- Intervals section
ALTER TABLE activities ADD COLUMN IF NOT EXISTS repetitions INTEGER;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS rep_distance_meters INTEGER;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS rest_between_reps_min INTEGER;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS stretch_before_after BOOLEAN DEFAULT true;

-- Summary and observations
ALTER TABLE activities ADD COLUMN IF NOT EXISTS total_daily_km NUMERIC;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN activities.phase IS 'Training phase: Base 1, Base 2, Base 3, Build 1, Build 2, Peak';
COMMENT ON COLUMN activities.training_type IS 'Type: calentamiento, trote_largo, umbral, intervalo, descanso, competencia, elongaciones';
COMMENT ON COLUMN activities.warmup_duration_min IS 'Warmup duration in minutes';
COMMENT ON COLUMN activities.main_work_type IS 'Main work type: Trote Largo Z1, Intervalo ZY, etc.';
COMMENT ON COLUMN activities.zone IS 'Heart rate zone: Z1, Z2, Z3, Z4, Z5, ZX, ZY';
COMMENT ON COLUMN activities.terrain IS 'Terrain type: plano, cerro';
COMMENT ON COLUMN activities.main_work_distance_km IS 'Main work distance in kilometers';
COMMENT ON COLUMN activities.main_work_duration_min IS 'Main work duration in minutes';
COMMENT ON COLUMN activities.repetitions IS 'Number of interval repetitions';
COMMENT ON COLUMN activities.rep_distance_meters IS 'Distance per repetition in meters (400, 800, 1000, 1200, 1600, 2000)';
COMMENT ON COLUMN activities.rest_between_reps_min IS 'Rest time between repetitions in minutes';
COMMENT ON COLUMN activities.stretch_before_after IS 'Whether to stretch before and after';
COMMENT ON COLUMN activities.total_daily_km IS 'Total daily distance in kilometers';
COMMENT ON COLUMN activities.notes IS 'Additional observations and notes';