import { 
  Footprints, 
  PersonStanding, 
  Dumbbell, 
  Moon, 
  Activity, 
  Bike,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityType = 'run' | 'walk' | 'strength' | 'rest' | 'stretch' | 'cross_training';

interface ActivityIconProps {
  type: ActivityType;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
  className?: string;
}

const activityConfig: Record<ActivityType, { 
  icon: LucideIcon; 
  label: string;
  colorClass: string;
  bgClass: string;
}> = {
  run: { 
    icon: Footprints, 
    label: "Correr",
    colorClass: "text-primary",
    bgClass: "bg-primary/10"
  },
  walk: { 
    icon: PersonStanding, 
    label: "Caminar",
    colorClass: "text-green-500",
    bgClass: "bg-green-500/10"
  },
  strength: { 
    icon: Dumbbell, 
    label: "Fuerza",
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500/10"
  },
  rest: { 
    icon: Moon, 
    label: "Descanso",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted"
  },
  stretch: { 
    icon: Activity, 
    label: "Estiramiento",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10"
  },
  cross_training: { 
    icon: Bike, 
    label: "Cruzado",
    colorClass: "text-cyan-500",
    bgClass: "bg-cyan-500/10"
  }
};

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8"
};

const bgSizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14"
};

export function ActivityIcon({ type, size = 'md', showBackground = false, className }: ActivityIconProps) {
  const config = activityConfig[type] || activityConfig.run;
  const Icon = config.icon;

  if (showBackground) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center",
        bgSizeClasses[size],
        config.bgClass,
        className
      )}>
        <Icon className={cn(sizeClasses[size], config.colorClass)} />
      </div>
    );
  }

  return <Icon className={cn(sizeClasses[size], config.colorClass, className)} />;
}

export function getActivityLabel(type: ActivityType): string {
  return activityConfig[type]?.label || "Actividad";
}

export function getActivityColorClass(type: ActivityType): string {
  return activityConfig[type]?.colorClass || "text-primary";
}
