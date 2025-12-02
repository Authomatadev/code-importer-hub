import { cn } from "@/lib/utils";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { Check } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_type: ActivityType;
  distance_km: number | null;
  duration_min: number | null;
  intensity: number | null;
}

interface DayCardProps {
  dayNumber: number;
  dayName: string;
  activity: Activity | null;
  isToday?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function DayCard({ 
  dayNumber, 
  dayName, 
  activity, 
  isToday = false, 
  isCompleted = false,
  onClick 
}: DayCardProps) {
  const hasActivity = activity !== null;
  const activityType = activity?.activity_type || 'rest';

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-3 md:p-4 rounded-xl border transition-all",
        "hover:scale-105 hover:shadow-lg",
        isToday 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
          : "border-border bg-card hover:border-primary/50",
        isCompleted && "opacity-75"
      )}
    >
      {/* Completed indicator */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Day name */}
      <span className={cn(
        "text-xs font-medium mb-2",
        isToday ? "text-primary" : "text-muted-foreground"
      )}>
        {dayName}
      </span>

      {/* Activity icon */}
      <ActivityIcon 
        type={activityType} 
        size="lg" 
        showBackground 
      />

      {/* Activity label */}
      <span className={cn(
        "text-xs mt-2 font-medium text-center line-clamp-1",
        isToday ? "text-foreground" : "text-muted-foreground"
      )}>
        {hasActivity ? getActivityLabel(activityType) : "—"}
      </span>

      {/* Distance/Duration badge */}
      {activity?.distance_km && (
        <span className="text-[10px] text-primary font-bold mt-1">
          {activity.distance_km} km
        </span>
      )}
      {!activity?.distance_km && activity?.duration_min && (
        <span className="text-[10px] text-primary font-bold mt-1">
          {activity.duration_min} min
        </span>
      )}
    </button>
  );
}

export function getDayName(dayOfWeek: number): string {
  return dayNames[dayOfWeek] || "—";
}
