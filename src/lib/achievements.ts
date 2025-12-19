// Achievement types and helpers

export interface Achievement {
  id: string;
  name: string;
  description: string;
  how_to_earn: string;
  icon: string;
  badge_color: string;
  category: string;
  trigger_type: string;
  trigger_value: number | null;
  sort_order: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  shared_at: string | null;
}

export const BADGE_COLORS: Record<string, string> = {
  gold: 'from-yellow-400 to-amber-600',
  orange: 'from-orange-400 to-red-500',
  yellow: 'from-yellow-300 to-yellow-500',
  red: 'from-red-400 to-red-600',
  primary: 'from-primary to-primary/80',
};

export const BADGE_GLOW_COLORS: Record<string, string> = {
  gold: 'shadow-yellow-500/50',
  orange: 'shadow-orange-500/50',
  yellow: 'shadow-yellow-400/50',
  red: 'shadow-red-500/50',
  primary: 'shadow-primary/50',
};

export const CATEGORY_LABELS: Record<string, string> = {
  streak: 'Racha',
  milestone: 'Hito',
  intensity_zone: 'Zona Alta',
  interval: 'Intervalos',
  long_run: 'Trote Largo',
  distance: 'Distancia',
  high_intensity: 'Intensidad',
  special: 'Especial',
};
