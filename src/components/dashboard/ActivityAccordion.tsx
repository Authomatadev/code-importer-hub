import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/ui/ShinyText";
import ElectricBorder from "@/components/ui/ElectricBorder";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, MapPin, Clock, Mountain, Heart, ChevronDown, Repeat, Timer, Watch, Info, Zap } from "lucide-react";
import { getZoneByValue, getTerrainByValue, getTrainingTypeByValue, getPhaseByValue, getMainWorkTypeByValue, GARMIN_INSTRUCTIONS, WARMUP_INFO, STRETCH_REMINDER } from "@/lib/activity-constants";
import { formatDistance } from "@/lib/format-distance";
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
interface ActivityAccordionProps {
  activity: Activity;
  isToday?: boolean;
  isCompleted?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onMarkComplete?: (activityId: string) => void;
  animationDelay?: number;
}
const dayFullNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export function ActivityAccordion({
  activity,
  isToday = false,
  isCompleted = false,
  isExpanded = false,
  onToggle,
  onMarkComplete,
  animationDelay = 0
}: ActivityAccordionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const zone = getZoneByValue(activity.zone);
  const terrain = getTerrainByValue(activity.terrain);
  const trainingType = getTrainingTypeByValue(activity.training_type);
  const phase = getPhaseByValue(activity.phase);
  const mainWorkType = getMainWorkTypeByValue(activity.main_work_type);
  const distance = activity.total_daily_km || activity.distance_km;
  const hasWarmup = activity.warmup_duration_min;
  const hasMainWork = activity.main_work_type || activity.main_work_distance_km || activity.main_work_duration_min;
  const hasIntervals = activity.repetitions && activity.rep_distance_meters;
  const hasNotes = activity.description || activity.notes;
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), animationDelay * 100);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  // Scroll to content when accordion opens
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  }, [isExpanded]);
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkComplete && !isCompleted) {
      onMarkComplete(activity.id);
    }
  };
  return <Collapsible open={isExpanded} onOpenChange={onToggle} ref={contentRef}>
      <ElectricBorder color="hsl(var(--primary))" speed={1.5} chaos={0.8} thickness={2} className="rounded-xl">
      <div className={cn("relative bg-card rounded-xl transition-all duration-500 overflow-hidden", isToday && "ring-2 ring-primary/30", isCompleted && "opacity-70", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", isExpanded && "shadow-lg")}>
        {/* Today indicator */}
        {isToday && <div className="absolute -top-4 left-12 z-[100]">
            <Badge variant="default" className="text-xs font-bold animate-pulse shadow-lg">
              HOY
            </Badge>
          </div>}

        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <div className="p-4 sm:p-5 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <ActivityIcon type={activity.activity_type} size="md" showBackground />
              
              {/* Title and Day - Flex column for better stacking */}
              <div className="flex-1 min-w-0">
                <ShinyText text={dayFullNames[activity.day_of_week]} className={cn("text-xl sm:text-2xl font-semibold", isToday ? "!text-primary" : "")} speed={4} />
                <h3 className={cn("font-heading font-medium text-base sm:text-lg text-muted-foreground leading-tight truncate", isCompleted && "line-through opacity-70")}>
                  {activity.title}
                </h3>
              </div>

              {/* Chevron + Check status */}
              <div className="flex items-center gap-2 shrink-0">
                {isCompleted && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>}
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")} />
              </div>
            </div>

            {/* Stats row - Below title for better spacing */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 ml-9 sm:ml-12">
              {distance && <Badge variant="secondary" className="text-[10px] sm:text-xs font-bold px-1.5 py-0">
                  {formatDistance(distance)}
                </Badge>}
              {zone && <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="text-[10px] sm:text-xs text-white cursor-help transition-transform hover:scale-105 gap-0.5 px-1.5 py-0" style={{
                      backgroundColor: zone.color
                    }}>
                        <span>{zone.icon}</span>
                        <span>{zone.shortLabel}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] text-center">
                      <p className="font-semibold">{zone.icon} {zone.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{zone.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>}
              {activity.intensity && <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[10px] sm:text-xs cursor-help gap-0 px-1 py-0">
                        {[1, 2, 3, 4, 5].map(level => <span key={level} className={cn("text-[8px] sm:text-[10px]", level <= activity.intensity! ? "opacity-100" : "opacity-20")}>
                            ⚡
                          </span>)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="font-semibold">Intensidad {activity.intensity}/5</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>}
              {activity.duration_min && <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                  {activity.duration_min} min
                </Badge>}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
            {/* Quick Stats Row */}
            <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg">
              {distance && <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{formatDistance(distance)}</span>
                </div>}
              {activity.duration_min && <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium">{activity.duration_min} min</span>
                </div>}
              {activity.intensity && <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Intensidad {activity.intensity}/5</span>
                </div>}
              {terrain && <div className="flex items-center gap-2 text-sm">
                  <Mountain className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{terrain.label}</span>
                </div>}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2">
              {phase && <Badge variant="secondary" className="text-xs">
                  {phase.label}
                </Badge>}
              {trainingType && <Badge variant="outline" className="text-xs">
                  {trainingType.icon} {trainingType.label}
                </Badge>}
            </div>

            {/* Warmup Section */}
            {hasWarmup && <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-semibold text-sm">Calentamiento</span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {activity.warmup_duration_min} min
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-2 flex gap-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {WARMUP_INFO}
                  </p>
                </div>
              </div>}

            {/* Main Work Section */}
            {hasMainWork && <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💪</span>
                  <span className="font-semibold text-sm">Trabajo Principal</span>
                </div>
                {mainWorkType && <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{mainWorkType.label}</span>
                  </div>}
                <div className="grid grid-cols-2 gap-2">
                  {activity.main_work_distance_km && <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Distancia</p>
                      <p className="text-lg font-bold text-primary">
                        {formatDistance(activity.main_work_distance_km)}
                      </p>
                    </div>}
                  {activity.main_work_duration_min && <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Duración</p>
                      <p className="text-lg font-bold text-primary">
                        {activity.main_work_duration_min} min
                      </p>
                    </div>}
                </div>
              </div>}

            {/* Intervals Section */}
            {hasIntervals && <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔁</span>
                  <span className="font-semibold text-sm">Intervalos</span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {activity.repetitions} × {activity.rep_distance_meters}m
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <Repeat className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Reps</p>
                    <p className="font-bold">{activity.repetitions}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <MapPin className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Distancia</p>
                    <p className="font-bold">{activity.rep_distance_meters}m</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <Timer className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Pausa</p>
                    <p className="font-bold">{activity.rest_between_reps_min || 2} min</p>
                  </div>
                </div>
                {activity.stretch_before_after && <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex gap-2">
                    <span className="text-sm">🧘</span>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {STRETCH_REMINDER}
                    </p>
                  </div>}
              </div>}

            {/* Notes Section */}
            {hasNotes && <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span className="font-semibold text-sm">Instrucciones</span>
                </div>
                {activity.description && <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 rounded-lg p-2">
                    {activity.description}
                  </p>}
                {activity.notes && <div className="border-l-2 border-primary pl-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Notas:</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {activity.notes}
                    </p>
                  </div>}
              </div>}

            {/* Intensity bars */}
            {activity.intensity && <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">INTENSIDAD</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(level => <div key={level} className={cn("h-2 flex-1 rounded-full transition-colors", level <= activity.intensity! ? "bg-primary" : "bg-muted")} />)}
                </div>
              </div>}

            {/* Action Button */}
            <Button onClick={handleComplete} disabled={isCompleted} variant={isCompleted ? "secondary" : "default"} size="lg" className={cn("w-full font-bold h-12 transition-all duration-300", !isCompleted && "hover:scale-[1.01] active:scale-[0.99]", isCompleted && "bg-green-500/20 text-green-500 border border-green-500/30")}>
              {isCompleted ? <>
                  <Check className="w-5 h-5 mr-2" />
                  COMPLETADO
                </> : <>
                  <Check className="w-5 h-5 mr-2" />
                  MARCAR COMO COMPLETADO
                </>}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
      </ElectricBorder>
    </Collapsible>;
}

// Rest Day Card - simplified
export function RestDayAccordion({
  dayName,
  animationDelay = 0
}: {
  dayName: string;
  animationDelay?: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), animationDelay * 100);
    return () => clearTimeout(timer);
  }, [animationDelay]);
  return <div className={cn("bg-muted/50 border border-border/50 rounded-xl p-3 sm:p-4 transition-all duration-500", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
      <div className="flex items-center gap-3">
        <ActivityIcon type="rest" size="lg" showBackground />
        <div>
          <p className="text-sm font-medium text-muted-foreground">{dayName}</p>
          <p className="text-xs text-muted-foreground/60">Día de descanso</p>
        </div>
      </div>
    </div>;
}