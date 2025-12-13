import { useState } from "react";
import { DayCard, getDayName } from "./DayCard";
import { ActivityDetail } from "./ActivityDetail";
import { ActivityType } from "./ActivityIcon";

interface Activity {
  id: string;
  day_of_week: number;
  title: string;
  description: string | null;
  activity_type: ActivityType;
  distance_km: number | null;
  duration_min: number | null;
  intensity: number | null;
}

interface WeekViewProps {
  weekNumber: number;
  activities: Activity[];
  completedActivityIds: string[];
  onMarkComplete?: (activityId: string) => void;
}

export function WeekView({ 
  weekNumber, 
  activities, 
  completedActivityIds,
  onMarkComplete 
}: WeekViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Get current day of week in DB format (1 = Monday, 7 = Sunday)
  const jsDay = new Date().getDay();
  const today = jsDay === 0 ? 7 : jsDay; // Convertir 0 (Domingo JS) a 7 (Domingo BD)

  // Create a map of day_of_week to activity
  const activityByDay: Record<number, Activity> = {};
  activities.forEach(activity => {
    activityByDay[activity.day_of_week] = activity;
  });

  // Days ordered starting from Monday (1) to Sunday (7) - formato BD
  const daysOrder = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      {/* Week header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          Semana {weekNumber}
        </h3>
        <span className="text-sm text-muted-foreground">
          {activities.length} actividades
        </span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {daysOrder.map((dayOfWeek) => {
          const activity = activityByDay[dayOfWeek];
          const isCompleted = activity ? completedActivityIds.includes(activity.id) : false;
          
          return (
            <DayCard
              key={dayOfWeek}
              dayNumber={dayOfWeek}
              dayName={getDayName(dayOfWeek)}
              activity={activity || null}
              isToday={dayOfWeek === today}
              isCompleted={isCompleted}
              onClick={() => activity && setSelectedActivity(activity)}
              onToggleComplete={onMarkComplete}
            />
          );
        })}
      </div>

      {/* Activity detail modal/drawer */}
      <ActivityDetail
        activity={selectedActivity}
        isCompleted={selectedActivity ? completedActivityIds.includes(selectedActivity.id) : false}
        onClose={() => setSelectedActivity(null)}
        onMarkComplete={onMarkComplete}
      />
    </div>
  );
}
