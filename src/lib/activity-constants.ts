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

export interface ZoneInfo {
  value: string;
  label: string;
  shortLabel: string;
  color: string;
  icon: string;
  fcmRange: string;
  intensity: string;
  rpe: string;
  trainingType: string;
  duration: string;
  characteristics: string[];
  benefits: string[];
  activitiesInPlan: number;
}

export const ZONES: ZoneInfo[] = [
  {
    value: 'Z1',
    label: 'Zona aeróbica - Regenerativa',
    shortLabel: 'Z1',
    color: 'hsl(var(--chart-2))',
    icon: '🟢',
    fcmRange: '50-60%',
    intensity: 'Regenerativo',
    rpe: '1-2',
    trainingType: 'Regenerativo',
    duration: 'Largos',
    characteristics: [
      'Intensidad muy baja y cómoda',
      'Ritmo de conversación fácil',
      'Ideal para entrenamientos de recuperación activa'
    ],
    benefits: [
      'Mejora la circulación y la recuperación',
      'Construye una base aeróbica sólida',
      'Reduce el riesgo de lesiones'
    ],
    activitiesInPlan: 19
  },
  {
    value: 'Z2',
    label: 'Zona aeróbica - Construcción',
    shortLabel: 'Z2',
    color: 'hsl(var(--chart-3))',
    icon: '🔵',
    fcmRange: '60-70%',
    intensity: 'Largos',
    rpe: '2-3',
    trainingType: 'Construcción aeróbica',
    duration: 'Largos',
    characteristics: [
      'Intensidad moderada',
      'Ritmo sostenible durante períodos prolongados',
      'El cuerpo utiliza principalmente grasas como combustible'
    ],
    benefits: [
      'Construcción de base aeróbica',
      'Mejora de la economía de carrera',
      'Aumento de mitocondrias en células musculares',
      'Ideal para rodajes y entrenamientos de volumen'
    ],
    activitiesInPlan: 55
  },
  {
    value: 'ZX',
    label: 'Zona aeróbica - Umbral Aeróbico',
    shortLabel: 'ZX',
    color: 'hsl(var(--primary))',
    icon: '💎',
    fcmRange: '70-75%',
    intensity: 'Ritmo de maratón',
    rpe: '3-4',
    trainingType: 'Umbral aeróbico',
    duration: 'Largos - Medios',
    characteristics: [
      'Ritmo de maratón',
      'Intensidad controlada y sostenible',
      'Punto de transición aeróbico'
    ],
    benefits: [
      'Mejora la resistencia aeróbica',
      'Desarrollo de ritmo de competencia',
      'Mejora de la economía de carrera'
    ],
    activitiesInPlan: 18
  },
  {
    value: 'Z3',
    label: 'Zona aeróbica - Sub Umbral',
    shortLabel: 'Z3',
    color: 'hsl(var(--chart-4))',
    icon: '🟡',
    fcmRange: '75-80%',
    intensity: 'Ritmo media maratón',
    rpe: '4-5',
    trainingType: 'Sub umbral',
    duration: 'Medios',
    characteristics: [
      'Intensidad moderada-alta',
      'Ritmo de media maratón',
      'Respiración más profunda y controlada',
      'Punto de transición entre aeróbico y anaeróbico'
    ],
    benefits: [
      'Mejora la resistencia aeróbica',
      'Aumenta la velocidad de crucero',
      'Desarrollo de capacidad cardiovascular',
      'Mejora la economía de carrera a ritmos más rápidos'
    ],
    activitiesInPlan: 2
  },
  {
    value: 'ZY',
    label: 'Zona aeróbica - Umbral Anaeróbico',
    shortLabel: 'ZY',
    color: 'hsl(var(--accent))',
    icon: '⚡',
    fcmRange: '80-85%',
    intensity: 'Trabajos de series',
    rpe: '6-7',
    trainingType: 'Umbral anaeróbico',
    duration: 'Medios - Cortos',
    characteristics: [
      'Intensidad alta y sostenida',
      'Corresponde al umbral de lactato',
      'Ideal para trabajos de series',
      'Punto donde el cuerpo comienza a acumular lactato'
    ],
    benefits: [
      'Mejora la velocidad de resistencia',
      'Aumenta el umbral de lactato',
      'Mejora la capacidad de mantener ritmos rápidos',
      'Desarrollo de potencia aeróbica'
    ],
    activitiesInPlan: 40
  },
  {
    value: 'Z4',
    label: 'Zona aeróbica - Supra Umbral Anaeróbico',
    shortLabel: 'Z4',
    color: 'hsl(var(--chart-5))',
    icon: '🟠',
    fcmRange: '85-90%',
    intensity: 'Ritmos aeróbicos rápidos',
    rpe: '7-8',
    trainingType: 'Supra umbral anaeróbico',
    duration: 'Cortos',
    characteristics: [
      'Intensidad alta',
      'Ritmos aeróbicos rápidos',
      'Requiere buena recuperación entre repeticiones',
      'Trabajo por encima del umbral de lactato'
    ],
    benefits: [
      'Mejora la velocidad de resistencia',
      'Aumenta la capacidad anaeróbica',
      'Mejora la capacidad de mantener ritmos rápidos',
      'Desarrollo de potencia aeróbica'
    ],
    activitiesInPlan: 5
  },
  {
    value: 'Z5',
    label: 'Zona aeróbica - VO2 Máx',
    shortLabel: 'Z5',
    color: 'hsl(var(--destructive))',
    icon: '🔴',
    fcmRange: '90-100%',
    intensity: 'Consumo máximo de oxígeno',
    rpe: '8-10',
    trainingType: 'VO2 máximo',
    duration: 'Cortos',
    characteristics: [
      'Intensidad muy alta',
      'Consumo máximo de oxígeno',
      'Requiere recuperación completa entre repeticiones',
      'Máxima captación de oxígeno'
    ],
    benefits: [
      'Aumenta el VO2 máximo',
      'Mejora la velocidad máxima',
      'Desarrollo de potencia anaeróbica',
      'Mejora del rendimiento en esfuerzos cortos intensos'
    ],
    activitiesInPlan: 3
  }
];

export interface IntensityLevel {
  level: number;
  label: string;
  description: string;
  effort: string;
}

export const INTENSITY_LEVELS: IntensityLevel[] = [
  { level: 1, label: 'Muy Suave', description: 'Esfuerzo mínimo, recuperación activa', effort: 'Puedes mantener una conversación fácilmente' },
  { level: 2, label: 'Suave', description: 'Esfuerzo ligero, ritmo cómodo', effort: 'Puedes hablar con frases completas' },
  { level: 3, label: 'Moderado', description: 'Esfuerzo considerable, ritmo de trabajo', effort: 'Hablar cuesta un poco más' },
  { level: 4, label: 'Intenso', description: 'Esfuerzo alto, ritmo exigente', effort: 'Solo puedes decir frases cortas' },
  { level: 5, label: 'Máximo', description: 'Esfuerzo total, al límite', effort: 'No puedes hablar' }
];

export function getIntensityByLevel(level: number | null | undefined): IntensityLevel | undefined {
  return INTENSITY_LEVELS.find(i => i.level === level);
}

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
