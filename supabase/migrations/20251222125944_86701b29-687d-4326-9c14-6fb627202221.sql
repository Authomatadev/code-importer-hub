-- Agregar nuevos estados al enum waiting_status
ALTER TYPE waiting_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE waiting_status ADD VALUE IF NOT EXISTS 'rejected';

-- Modificar tabla waiting_list para el flujo de aprobación
ALTER TABLE waiting_list 
ADD COLUMN IF NOT EXISTS rut TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS selected_distance TEXT,
ADD COLUMN IF NOT EXISTS selected_difficulty SMALLINT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Hacer first_name y last_name NOT NULL para nuevos registros (con default temporal)
ALTER TABLE waiting_list ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE waiting_list ALTER COLUMN last_name SET DEFAULT '';

-- Constraint único para RUT (evitar duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS waiting_list_rut_unique ON waiting_list(rut) WHERE rut IS NOT NULL;

-- Constraint único para email (evitar duplicados)  
CREATE UNIQUE INDEX IF NOT EXISTS waiting_list_email_unique ON waiting_list(email);

-- Modificar tabla user_profiles para first login y RUT
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS rut TEXT,
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- Índice para búsqueda rápida de pendientes en admin
CREATE INDEX IF NOT EXISTS waiting_list_status_idx ON waiting_list(status);