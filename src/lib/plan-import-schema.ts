import { z } from 'zod';

// Activity import schema matching database structure
export const ActivityImportSchema = z.object({
  // Database constraint requires 1-7 (Monday=1, Sunday=7)
  // Auto-transform: if value is 0-6, convert to 1-7
  day_of_week: z.number().min(0).max(7).transform((val) => val === 0 ? 7 : (val <= 6 ? val : val)),
  title: z.string().min(1, 'Título es requerido'),
  activity_type: z.enum(['run', 'walk', 'strength', 'rest', 'stretch', 'cross_training']).optional().default('run'),
  order_index: z.number().optional().default(1),
  
  // Phase and training
  phase: z.string().optional(),
  training_type: z.string().optional(),
  
  // Main work
  zone: z.string().optional(),
  terrain: z.string().optional(),
  main_work_type: z.string().optional(),
  main_work_distance_km: z.number().optional(),
  main_work_duration_min: z.number().optional(),
  
  // Warmup
  warmup_duration_min: z.number().optional(),
  
  // Intervals
  repetitions: z.number().optional(),
  rep_distance_meters: z.number().optional(),
  rest_between_reps_min: z.number().optional(),
  stretch_before_after: z.boolean().optional().default(true),
  
  // Totals
  distance_km: z.number().optional(),
  duration_min: z.number().optional(),
  total_daily_km: z.number().optional(),
  intensity: z.number().min(1).max(5).optional(),
  
  // Content
  description: z.string().optional(),
  notes: z.string().optional(),
  media_url: z.string().optional(),
});

// Tip schema for weekly/monthly tips
export const TipSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  media_url: z.string().optional(),
}).optional();

// Week import schema
export const WeekImportSchema = z.object({
  week_number: z.number().min(1).max(52),
  tip_week: TipSchema,
  tip_month: TipSchema,
  activities: z.array(ActivityImportSchema).min(1),
});

// Full plan import schema
export const PlanImportSchema = z.object({
  weeks: z.array(WeekImportSchema).min(1),
});

// Types derived from schemas
export type ActivityImport = z.infer<typeof ActivityImportSchema>;
export type WeekImport = z.infer<typeof WeekImportSchema>;
export type PlanImport = z.infer<typeof PlanImportSchema>;

// Validation result type
export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  summary: {
    totalWeeks: number;
    totalActivities: number;
    weekNumbers: number[];
  };
}

// Validate JSON data against schema
export function validatePlanImport(data: unknown): ImportValidationResult {
  const result = PlanImportSchema.safeParse(data);
  
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      summary: { totalWeeks: 0, totalActivities: 0, weekNumbers: [] },
    };
  }
  
  const totalActivities = result.data.weeks.reduce((sum, w) => sum + w.activities.length, 0);
  const weekNumbers = result.data.weeks.map(w => w.week_number).sort((a, b) => a - b);
  
  return {
    valid: true,
    errors: [],
    summary: {
      totalWeeks: result.data.weeks.length,
      totalActivities,
      weekNumbers,
    },
  };
}
