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
// Database uses 1-7 format (Monday=1, Sunday=7)
const dayFullNames: Record<number, string> = {
  1: "Lunes",
  2: "Martes", 
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo"
};

export function WeekActivityGrid({
  weekNumber,
  activities,
  completedActivityIds,
  onMarkComplete,
  onCompleteWeek
}: WeekActivityGridProps) {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  
  // Convert JS day (0=Sunday) to DB format (1=Monday, 7=Sunday)
  const jsDay = new Date().getDay();
  const today = jsDay === 0 ? 7 : jsDay;
  
  // Days in DB format: Monday=1 through Sunday=7
  const daysOrder = [1, 2, 3, 4, 5, 6, 7];

  // Create activity map by day (using DB format 1-7)
  const activityByDay: Record<number, Activity> = {};
  activities.forEach(activity => {
    activityByDay[activity.day_of_week] = activity;
  });

  // Calculate completion stats
  const totalActivities = activities.filter(a => a.activity_type !== 'rest').length;
  const completedCount = activities.filter(a => a.activity_type !== 'rest' && completedActivityIds.includes(a.id)).length;
  const isWeekComplete = totalActivities > 0 && completedCount === totalActivities;
  const progressPercent = totalActivities > 0 ? completedCount / totalActivities * 100 : 0;
  const handleToggleActivity = (activityId: string) => {
    setExpandedActivityId(prev => prev === activityId ? null : activityId);
  };
  return <div className="space-y-4">
      {/* Week Header with Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mx-0 px-[10px]">
        <div>
          <h3 className="text-foreground font-sans font-extralight text-xl">
            SEMANA {weekNumber}
          </h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} de {totalActivities} entrenamientos completados
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-4 flex-1 w-full md:max-w-md">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", isWeekComplete ? "bg-green-500" : "bg-primary")} style={{
            width: `${progressPercent}%`
          }} />
          </div>
          <span className="text-sm font-bold text-primary min-w-[3rem]">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Activity Accordion List */}
      <div className="space-y-2">
        {daysOrder.map((dayOfWeek, index) => {
        const activity = activityByDay[dayOfWeek];
        const isCompleted = activity ? completedActivityIds.includes(activity.id) : false;
        if (!activity || activity.activity_type === 'rest') {
          return <RestDayAccordion key={`rest-${dayOfWeek}`} dayName={dayFullNames[dayOfWeek]} animationDelay={index} />;
        }
        return <ActivityAccordion key={activity.id} activity={activity} isToday={dayOfWeek === today} isCompleted={isCompleted} isExpanded={expandedActivityId === activity.id} onToggle={() => handleToggleActivity(activity.id)} onMarkComplete={onMarkComplete} animationDelay={index} />;
      })}
      </div>

      {/* Complete Week Button */}
      <div className={cn("pt-4 transition-all duration-700 delay-500", activities.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
        <Button onClick={onCompleteWeek} disabled={isWeekComplete || totalActivities === 0} variant={isWeekComplete ? "secondary" : "default"} size="lg" className={cn("w-full h-14 sm:h-16 text-sm sm:text-lg font-bold transition-all duration-300", isWeekComplete ? "bg-green-500/20 text-green-500 border border-green-500/30" : "hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-primary to-primary/80", !isWeekComplete && "animate-pulse-subtle")}>
          {isWeekComplete ? <>
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 shrink-0" />
              <span className="truncate">¡SEMANA COMPLETADA!</span>
            </> : <>
              <CheckCheck className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 shrink-0" />
              <span className="truncate">COMPLETAR SEMANA</span>
            </>}
        </Button>
      </div>
    </div>;
}