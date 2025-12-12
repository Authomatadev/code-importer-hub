import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, MapPin, Clock, Mountain, Heart } from "lucide-react";
import { getZoneByValue, getTerrainByValue, getTrainingTypeByValue } from "@/lib/activity-constants";
import { ZoneTooltip } from "./ZoneTooltip";

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
}

interface ActivityCardProps {
  activity: Activity;
  dayName: string;
  isToday?: boolean;
  isCompleted?: boolean;
  onMarkComplete?: (activityId: string) => void;
  onClick?: () => void;
  animationDelay?: number;
}

const dayFullNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function ActivityCard({
  activity,
  dayName,
  isToday = false,
  isCompleted = false,
  onMarkComplete,
  onClick,
  animationDelay = 0
}: ActivityCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showElements, setShowElements] = useState({
    type: false,
    zone: false,
    terrain: false,
    distance: false,
    button: false
  });

  const zone = getZoneByValue(activity.zone);
  const terrain = getTerrainByValue(activity.terrain);
  const trainingType = getTrainingTypeByValue(activity.training_type);
  const distance = activity.total_daily_km || activity.distance_km;

  // Staggered animation effect
  useEffect(() => {
    const baseDelay = animationDelay * 100;
    
    const timer1 = setTimeout(() => setIsLoaded(true), baseDelay);
    const timer2 = setTimeout(() => setShowElements(prev => ({ ...prev, type: true })), baseDelay + 150);
    const timer3 = setTimeout(() => setShowElements(prev => ({ ...prev, zone: true })), baseDelay + 300);
    const timer4 = setTimeout(() => setShowElements(prev => ({ ...prev, terrain: true })), baseDelay + 450);
    const timer5 = setTimeout(() => setShowElements(prev => ({ ...prev, distance: true })), baseDelay + 600);
    const timer6 = setTimeout(() => setShowElements(prev => ({ ...prev, button: true })), baseDelay + 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [animationDelay]);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkComplete && !isCompleted) {
      onMarkComplete(activity.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-card border rounded-xl p-4 cursor-pointer transition-all duration-500 group",
        "hover:shadow-lg hover:border-primary/50 hover:-translate-y-1",
        isToday && "ring-2 ring-primary/30 border-primary",
        isCompleted && "opacity-60",
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Header with day name and activity icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "transition-all duration-500",
            isLoaded ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}>
            <ActivityIcon 
              type={activity.activity_type} 
              size="lg" 
              showBackground 
            />
          </div>
          <div>
            <p className={cn(
              "text-xs font-medium transition-colors",
              isToday ? "text-primary" : "text-muted-foreground"
            )}>
              {dayFullNames[activity.day_of_week]}
            </p>
            <h3 className={cn(
              "font-heading font-bold text-foreground line-clamp-1",
              isCompleted && "line-through"
            )}>
              {activity.title}
            </h3>
          </div>
        </div>

        {/* Completion indicator */}
        {isCompleted && (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Activity stats with staggered animations */}
      <div className="space-y-3">
        {/* Training Type */}
        {trainingType && (
          <div className={cn(
            "flex items-center gap-2 transition-all duration-500",
            showElements.type ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-xs">{trainingType.icon}</span>
            </div>
            <span className="text-sm text-muted-foreground">Tipo:</span>
            <span className="text-sm font-medium text-foreground">{trainingType.label}</span>
          </div>
        )}

        {/* Zone */}
        {zone && (
          <div className={cn(
            "flex items-center gap-2 transition-all duration-500",
            showElements.zone ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <div 
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: `${zone.color}20` }}
            >
              <Heart className="w-3.5 h-3.5" style={{ color: zone.color }} />
            </div>
            <span className="text-sm text-muted-foreground">Zona:</span>
            <ZoneTooltip zone={zone}>
              <Badge 
                className="text-xs text-white font-bold"
                style={{ backgroundColor: zone.color }}
              >
                {zone.icon} {zone.label}
              </Badge>
            </ZoneTooltip>
          </div>
        )}

        {/* Terrain */}
        {terrain && (
          <div className={cn(
            "flex items-center gap-2 transition-all duration-500",
            showElements.terrain ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
              <Mountain className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Terreno:</span>
            <span className="text-sm font-medium text-foreground">{terrain.label}</span>
          </div>
        )}

        {/* Distance/Duration */}
        <div className={cn(
          "flex items-center gap-4 transition-all duration-500",
          showElements.distance ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        )}>
          {distance && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-lg font-bold text-primary">{distance} km</span>
            </div>
          )}
          {activity.duration_min && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{activity.duration_min} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className={cn(
        "mt-4 transition-all duration-500",
        showElements.button ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <Button
          onClick={handleComplete}
          disabled={isCompleted}
          variant={isCompleted ? "secondary" : "default"}
          size="lg"
          className={cn(
            "w-full font-bold text-base h-14 transition-all duration-300",
            !isCompleted && "hover:scale-[1.02] active:scale-[0.98]",
            isCompleted && "bg-green-500/20 text-green-500 border border-green-500/30"
          )}
        >
          {isCompleted ? (
            <>
              <Check className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              COMPLETADO
            </>
          ) : (
            <>
              <Check className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              <span className="sm:hidden">REALIZADO</span>
              <span className="hidden sm:inline">ENTRENAMIENTO REALIZADO</span>
            </>
          )}
        </Button>
      </div>

      {/* Today indicator */}
      {isToday && (
        <div className="absolute -top-2 left-4">
          <Badge variant="default" className="text-xs font-bold animate-pulse">
            HOY
          </Badge>
        </div>
      )}

      {/* Completion celebration effect */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
        </div>
      )}
    </div>
  );
}

// Rest Day Card
export function RestDayCard({ dayName, animationDelay = 0 }: { dayName: string; animationDelay?: number }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), animationDelay * 100);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  return (
    <div className={cn(
      "bg-muted/50 border border-border/50 rounded-xl p-4 text-center transition-all duration-500",
      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <ActivityIcon type="rest" size="lg" showBackground className="mx-auto mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{dayName}</p>
      <p className="text-xs text-muted-foreground/60">Descanso</p>
    </div>
  );
}
