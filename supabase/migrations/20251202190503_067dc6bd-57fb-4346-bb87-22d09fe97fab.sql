-- Drop the restrictive name check constraint
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_name_check;

-- Add distance column to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS distance TEXT;

-- Insert base training plans (3 distances x 3 difficulties)
-- 10K Plans (8 semanas)
INSERT INTO plans (name, description, total_weeks, difficulty, distance) VALUES
('10K Principiante', 'Plan ideal para iniciar en el running competitivo', 8, 1, '10K'),
('10K Intermedio', 'Plan para mejorar tu marca en 10K', 8, 2, '10K'),
('10K Avanzado', 'Plan intensivo para corredores experimentados', 8, 3, '10K');

-- 21K Plans (12 semanas)
INSERT INTO plans (name, description, total_weeks, difficulty, distance) VALUES
('21K Principiante', 'Prepárate para tu primera media maratón', 12, 1, '21K'),
('21K Intermedio', 'Mejora tu tiempo en media maratón', 12, 2, '21K'),
('21K Avanzado', 'Entrenamiento intensivo para media maratón', 12, 3, '21K');

-- 42K Plans (16 semanas)
INSERT INTO plans (name, description, total_weeks, difficulty, distance) VALUES
('42K Principiante', 'Tu primer maratón completo', 16, 1, '42K'),
('42K Intermedio', 'Mejora tu marca en maratón', 16, 2, '42K'),
('42K Avanzado', 'Entrenamiento de élite para maratón', 16, 3, '42K');