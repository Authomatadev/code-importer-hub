// Activity constants based on marathon training document

export const PHASES = [
  { value: 'base_1', label: 'Base 1' },
  { value: 'base_2', label: 'Base 2' },
  { value: 'base_3', label: 'Base 3' },
  { value: 'build_1', label: 'Build 1' },
  { value: 'build_2', label: 'Build 2' },
  { value: 'peak', label: 'Peak' },
] as const;

export const TRAINING_TYPES = [
  { value: 'calentamiento', label: 'Calentamiento', icon: 'Flame' },
  { value: 'trote_largo', label: 'Trote Largo', icon: 'Footprints' },
  { value: 'umbral', label: 'Umbral', icon: 'Zap' },
  { value: 'intervalo', label: 'Intervalo', icon: 'Repeat' },
  { value: 'descanso', label: 'Descanso', icon: 'Moon' },
  { value: 'competencia', label: 'Competencia', icon: 'Trophy' },
  { value: 'elongaciones', label: 'Elongaciones y Técnica', icon: 'Activity' },
] as const;

export const ZONES = [
  { value: 'Z1', label: 'Zona 1', shortLabel: 'Z1', color: 'hsl(var(--chart-2))', description: 'Recuperación activa - Ritmo muy suave, conversacional. 50-60% FC máx.' },
  { value: 'Z2', label: 'Zona 2', shortLabel: 'Z2', color: 'hsl(var(--chart-3))', description: 'Resistencia base - Ritmo cómodo, puedes hablar. 60-70% FC máx.' },
  { value: 'Z3', label: 'Zona 3', shortLabel: 'Z3', color: 'hsl(var(--chart-4))', description: 'Tempo - Ritmo moderado, hablar es difícil. 70-80% FC máx.' },
  { value: 'Z4', label: 'Zona 4', shortLabel: 'Z4', color: 'hsl(var(--chart-5))', description: 'Umbral - Ritmo intenso, frases cortas. 80-90% FC máx.' },
  { value: 'Z5', label: 'Zona 5', shortLabel: 'Z5', color: 'hsl(var(--destructive))', description: 'VO2 máx - Esfuerzo máximo, no puedes hablar. 90-100% FC máx.' },
  { value: 'ZX', label: 'Zona X', shortLabel: 'ZX', color: 'hsl(var(--primary))', description: 'Zona especial - Trabajo específico de técnica y forma.' },
  { value: 'ZY', label: 'Umbral', shortLabel: 'ZY', color: 'hsl(var(--accent))', description: 'Zona Umbral - Ritmo maratón, sostenible pero exigente. ~85% FC máx.' },
] as const;

export const TERRAINS = [
  { value: 'plano', label: 'Terreno Plano' },
  { value: 'cerro', label: 'Terreno de Cerro' },
] as const;

export const REP_DISTANCES = [400, 800, 1000, 1200, 1600, 2000] as const;

export const MAIN_WORK_TYPES = [
  { value: 'trote_largo_z1', label: 'Trote Largo Z1' },
  { value: 'trote_largo_z2', label: 'Trote Largo Z2' },
  { value: 'trote_largo_z3', label: 'Trote Largo Z3' },
  { value: 'trote_largo_zx', label: 'Trote Largo ZX' },
  { value: 'trote_largo_zy', label: 'Trote Largo ZY' },
  { value: 'intervalo_zy', label: 'Intervalo ZY' },
  { value: 'intervalo_z4', label: 'Intervalo Z4' },
  { value: 'intervalo_z5', label: 'Intervalo Z5' },
  { value: 'umbral', label: 'Umbral' },
  { value: 'recuperacion', label: 'Recuperación' },
] as const;

export const GARMIN_INSTRUCTIONS = `**Configuración de Objetivo en Garmin:**

1. Selecciona el deporte "Carrera"
2. Entra al menú del reloj
3. Elige "Entreno"
4. Selecciona "Establecer Objetivo"
5. Elige "Distancia y Tiempo"
6. Configura según el ejercicio del día
7. Inicia la actividad cuando estés listo`;

export const WARMUP_INFO = `El calentamiento debe iniciar muy suave y progresivo, a ritmo cómodo. No forzar velocidades. Sirve para oxigenar, lubricar articulaciones, tonificar musculatura y preparar para el esfuerzo principal. **Velocidad inicial: Zona 1.**`;

export const STRETCH_REMINDER = `**Importante:** Elongar y movilidad antes de iniciar y lo mismo al finalizar.`;

export function getZoneByValue(value: string | null | undefined) {
  return ZONES.find(z => z.value === value);
}

export function getPhaseByValue(value: string | null | undefined) {
  return PHASES.find(p => p.value === value);
}

export function getTrainingTypeByValue(value: string | null | undefined) {
  return TRAINING_TYPES.find(t => t.value === value);
}

export function getTerrainByValue(value: string | null | undefined) {
  return TERRAINS.find(t => t.value === value);
}

export function getMainWorkTypeByValue(value: string | null | undefined) {
  return MAIN_WORK_TYPES.find(m => m.value === value);
}
