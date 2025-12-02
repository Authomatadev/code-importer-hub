import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { getDayName } from "./DayCard";
import { Check, Clock, MapPin, Zap } from "lucide-react";
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
}

interface ActivityDetailProps {
  activity: Activity | null;
  isCompleted: boolean;
  onClose: () => void;
  onMarkComplete?: (activityId: string) => void;
}

export function ActivityDetail({ 
  activity, 
  isCompleted,
  onClose, 
  onMarkComplete 
}: ActivityDetailProps) {
  if (!activity) return null;

  const dayFullNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  return (
    <Dialog open={!!activity} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <ActivityIcon 
              type={activity.activity_type} 
              size="lg" 
              showBackground 
            />
            <div>
              <DialogTitle className="font-heading text-xl">
                {activity.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {dayFullNames[activity.day_of_week]} • {getActivityLabel(activity.activity_type)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Stats row */}
          <div className="flex gap-4">
            {activity.distance_km && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{activity.distance_km} km</span>
              </div>
            )}
            {activity.duration_min && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{activity.duration_min} min</span>
              </div>
            )}
            {activity.intensity && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Intensidad {activity.intensity}/5</span>
              </div>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}

          {/* Intensity bars */}
          {activity.intensity && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">INTENSIDAD</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-2 flex-1 rounded-full",
                      level <= activity.intensity! 
                        ? "bg-primary" 
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Complete button */}
          <Button
            onClick={() => onMarkComplete?.(activity.id)}
            disabled={isCompleted}
            className="w-full"
            variant={isCompleted ? "secondary" : "default"}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Completado
              </>
            ) : (
              "Marcar como completado"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
