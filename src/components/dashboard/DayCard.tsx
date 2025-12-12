import { cn } from "@/lib/utils";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getZoneByValue } from "@/lib/activity-constants";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_type: ActivityType;
  distance_km: number | null;
  duration_min: number | null;
  intensity: number | null;
  zone?: string | null;
  total_daily_km?: number | null;
  phase?: string | null;
}

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  activity: Activity | null;
  isToday?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  onToggleComplete?: (activityId: string) => void;
}

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function DayCard({ 
  dayNumber, 
  dayName, 
  activity, 
  isToday = false, 
  isCompleted = false,
  onClick,
  onToggleComplete
}: DayCardProps) {
  const hasActivity = activity !== null;
  const activityType = activity?.activity_type || 'rest';
  const zone = getZoneByValue(activity?.zone);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity && onToggleComplete) {
      onToggleComplete(activity.id);
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-3 md:p-4 rounded-xl border transition-all",
        "hover:scale-105 hover:shadow-lg group",
        isToday 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
          : "border-border bg-card hover:border-primary/50",
        isCompleted && "bg-muted/50"
      )}
    >
      {/* Checkbox for completion */}
      {hasActivity && (
        <div 
          className="absolute top-2 right-2 z-10"
          onClick={handleCheckboxClick}
        >
          <Checkbox 
            checked={isCompleted}
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isCompleted && "bg-green-500 border-green-500 data-[state=checked]:bg-green-500"
            )}
          />
        </div>
      )}

      {/* Day name */}
      <span className={cn(
        "text-xs font-medium mb-2 transition-all duration-300",
        isToday ? "text-primary" : "text-muted-foreground",
        isCompleted && "text-muted-foreground/60"
      )}>
        {dayName}
      </span>

      {/* Activity icon with completion effect */}
      <div className={cn(
        "relative transition-all duration-500",
        isCompleted && "opacity-50 scale-90"
      )}>
        <ActivityIcon 
          type={activityType} 
          size="lg" 
          showBackground 
        />
        {/* Strikethrough line animation */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-0.5 bg-green-500 rounded-full transition-all duration-500 ease-out",
          isCompleted ? "w-[120%] opacity-100" : "w-0 opacity-0"
        )} />
      </div>

      {/* Activity label with strikethrough */}
      <span className={cn(
        "text-xs mt-2 font-medium text-center line-clamp-1 relative transition-all duration-300",
        isToday ? "text-foreground" : "text-muted-foreground",
        isCompleted && "text-muted-foreground/60"
      )}>
        <span className={cn(
          "relative inline-block",
          isCompleted && "activity-strikethrough"
        )}>
          {hasActivity ? getActivityLabel(activityType) : "—"}
        </span>
      </span>

      {/* Zone badge */}
      {zone && (
        <Badge 
          className="text-label-sm mt-1 px-1.5 py-0 h-4 text-white"
          style={{ backgroundColor: zone.color }}
        >
          {zone.value}
        </Badge>
      )}

      {/* Distance/Duration badge */}
      {(activity?.total_daily_km || activity?.distance_km) && (
        <span className={cn(
          "text-label-sm font-bold mt-1 transition-all duration-300",
          isCompleted ? "text-green-500/60 line-through" : "text-primary"
        )}>
          {activity.total_daily_km || activity.distance_km} km
        </span>
      )}
      {!activity?.total_daily_km && !activity?.distance_km && activity?.duration_min && (
        <span className={cn(
          "text-label-sm font-bold mt-1 transition-all duration-300",
          isCompleted ? "text-green-500/60 line-through" : "text-primary"
        )}>
          {activity.duration_min} min
        </span>
      )}

      {/* Completion celebration effect */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent animate-pulse" />
        </div>
      )}
    </button>
  );
}

export function getDayName(dayOfWeek: number): string {
  return dayNames[dayOfWeek] || "—";
}
