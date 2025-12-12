import { useState } from "react";
import { ActivityAccordion, RestDayAccordion } from "./ActivityAccordion";
import { ActivityType } from "./ActivityIcon";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  day_of_week: number;
  title: string;
  description: string | null;
  activity_type: ActivityType;
  distance_km: number | null;
  duration_min: number | null;
  intensity: number | null;
  zone?: string | null;
  terrain?: string | null;
  training_type?: string | null;
  total_daily_km?: number | null;
  phase?: string | null;
  // Extended fields for detail view
  warmup_duration_min?: number | null;
  main_work_type?: string | null;
  main_work_distance_km?: number | null;
  main_work_duration_min?: number | null;
  repetitions?: number | null;
  rep_distance_meters?: number | null;
  rest_between_reps_min?: number | null;
  stretch_before_after?: boolean | null;
  notes?: string | null;
  media_url?: string | null;
}

interface WeekActivityGridProps {
  weekNumber: number;
  activities: Activity[];
  completedActivityIds: string[];
  onMarkComplete?: (activityId: string) => void;
  onCompleteWeek?: () => void;
}

const dayFullNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function WeekActivityGrid({
  weekNumber,
  activities,
  completedActivityIds,
  onMarkComplete,
  onCompleteWeek
}: WeekActivityGridProps) {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  
  const today = new Date().getDay();
  const daysOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

  // Create activity map by day
  const activityByDay: Record<number, Activity> = {};
  activities.forEach(activity => {
    activityByDay[activity.day_of_week] = activity;
  });

  // Calculate completion stats
  const totalActivities = activities.filter(a => a.activity_type !== 'rest').length;
  const completedCount = activities.filter(a => 
    a.activity_type !== 'rest' && completedActivityIds.includes(a.id)
  ).length;
  const isWeekComplete = totalActivities > 0 && completedCount === totalActivities;
  const progressPercent = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;

  const handleToggleActivity = (activityId: string) => {
    setExpandedActivityId(prev => prev === activityId ? null : activityId);
  };

  return (
    <div className="space-y-6">
      {/* Week Header with Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-2xl font-black text-foreground">
            SEMANA {weekNumber}
          </h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} de {totalActivities} entrenamientos completados
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-4 flex-1 w-full md:max-w-md">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                isWeekComplete ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-primary min-w-[3rem]">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Activity Accordion List */}
      <div className="space-y-3">
        {daysOrder.map((dayOfWeek, index) => {
          const activity = activityByDay[dayOfWeek];
          const isCompleted = activity ? completedActivityIds.includes(activity.id) : false;
          
          if (!activity || activity.activity_type === 'rest') {
            return (
              <RestDayAccordion 
                key={`rest-${dayOfWeek}`}
                dayName={dayFullNames[dayOfWeek]}
                animationDelay={index}
              />
            );
          }

          return (
            <ActivityAccordion
              key={activity.id}
              activity={activity}
              isToday={dayOfWeek === today}
              isCompleted={isCompleted}
              isExpanded={expandedActivityId === activity.id}
              onToggle={() => handleToggleActivity(activity.id)}
              onMarkComplete={onMarkComplete}
              animationDelay={index}
            />
          );
        })}
      </div>

      {/* Complete Week Button */}
      <div className={cn(
        "pt-4 transition-all duration-700 delay-500",
        activities.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <Button
          onClick={onCompleteWeek}
          disabled={isWeekComplete || totalActivities === 0}
          variant={isWeekComplete ? "secondary" : "default"}
          size="lg"
          className={cn(
            "w-full h-16 text-lg font-bold transition-all duration-300",
            isWeekComplete 
              ? "bg-green-500/20 text-green-500 border border-green-500/30" 
              : "hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-primary to-primary/80",
            !isWeekComplete && "animate-pulse-subtle"
          )}
        >
          {isWeekComplete ? (
            <>
              <Trophy className="w-6 h-6 mr-3" />
              ¡SEMANA COMPLETADA!
            </>
          ) : (
            <>
              <CheckCheck className="w-6 h-6 mr-3" />
              COMPLETAR TODA LA SEMANA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
