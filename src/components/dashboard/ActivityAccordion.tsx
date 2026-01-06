import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/ui/ShinyText";
import ElectricBorder from "@/components/ui/ElectricBorder";
import StarBorder from "@/components/ui/StarBorder";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, MapPin, Clock, Mountain, Heart, ChevronDown, Repeat, Timer, Watch, Info, Zap } from "lucide-react";
import { getZoneByValue, getTerrainByValue, getTrainingTypeByValue, getPhaseByValue, getMainWorkTypeByValue, GARMIN_INSTRUCTIONS, WARMUP_INFO, STRETCH_REMINDER } from "@/lib/activity-constants";
import { formatDistance } from "@/lib/format-distance";
import { ZoneTooltip } from "./ZoneTooltip";
import { IntensityTooltip } from "./IntensityTooltip";
import { TrainingPhotoUploader } from "./contest/TrainingPhotoUploader";
import { useTrainingPhoto } from "@/hooks/useTrainingPhoto";
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
  userId?: string | null;
  activityLogId?: string | null;
  initialPhotoUrl?: string | null;
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
export function ActivityAccordion({
  activity,
  isToday = false,
  isCompleted = false,
  isExpanded = false,
  onToggle,
  onMarkComplete,
  animationDelay = 0,
  userId = null,
  activityLogId = null,
  initialPhotoUrl = null,
}: ActivityAccordionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Photo upload hook
  const { photoUrl, isUploading, uploadPhoto, deletePhoto, setPhotoUrl } = useTrainingPhoto({
    activityLogId,
    userId,
    initialPhotoUrl,
  });

  // Update photoUrl when initialPhotoUrl changes
  useEffect(() => {
    setPhotoUrl(initialPhotoUrl || null);
  }, [initialPhotoUrl, setPhotoUrl]);
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
      <StarBorder color="hsl(207, 55%, 48%)" speed="6s" thickness={1}>
      <div className={cn("w-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-5 shadow-2xl transition-all duration-500", isToday && "ring-2 ring-primary/50", isCompleted && "opacity-80", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
        {/* Header - Always visible */}
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            {/* Header Row */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center shrink-0">
                  <ActivityIcon type={activity.activity_type} size="sm" />
                </div>
                {/* Title Section */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-thin text-foreground ">{dayFullNames[activity.day_of_week]}</h2>
                    {isToday && <Badge variant="default" className="text-xs font-bold animate-pulse">
                        HOY
                      </Badge>}
                  </div>
                  <p className={cn("text-base text-muted-foreground", isCompleted && "opacity-60")}>
                    {activity.title}
                  </p>
                </div>
              </div>
              {/* Status Badge + Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                {isCompleted && <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                    <Check className="w-4 h-4" />
                  </div>}
                <ChevronDown className={cn("w-6 h-6 text-primary transition-transform duration-300", isExpanded && "rotate-180")} />
              </div>
            </div>

            {/* Metrics Row */}
            

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {distance && <div className="bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8 rounded-xl p-2.5 text-center">
                  <div className="text-base font-semibold text-cyan-400">{formatDistance(distance)}</div>
                  <div className="text-label-sm text-muted-foreground uppercase tracking-wider">Distancia</div>
                </div>}
              {zone && (
                <ZoneTooltip zone={zone}>
                  <div className="bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8 rounded-xl p-2.5 text-center">
                    <div className="text-base font-semibold text-cyan-400">{zone.icon} {zone.shortLabel}</div>
                    <div className="text-label-sm text-muted-foreground uppercase tracking-wider">Zona</div>
                  </div>
                </ZoneTooltip>
              )}
              {activity.duration_min && <div className="bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8 rounded-xl p-2.5 text-center">
                  <div className="text-base font-semibold text-cyan-400">{activity.duration_min} min</div>
                  <div className="text-label-sm text-muted-foreground uppercase tracking-wider">Tiempo</div>
                </div>}
              {activity.intensity && (
                <IntensityTooltip level={activity.intensity}>
                  <div className="bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8 rounded-xl p-2.5 text-center">
                    <div className="text-base font-semibold text-cyan-400">
                      {Array(activity.intensity).fill('⚡').join('')}
                    </div>
                    <div className="text-label-sm text-muted-foreground uppercase tracking-wider">Intensidad</div>
                  </div>
                </IntensityTooltip>
              )}
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

            {/* Photo Uploader - Show only for non-rest activities when completed */}
            {activity.activity_type !== 'rest' && isCompleted && userId && activityLogId && (
              <div className="pt-2 border-t border-border/30">
                <TrainingPhotoUploader
                  photoUrl={photoUrl}
                  onUpload={uploadPhoto}
                  onDelete={deletePhoto}
                  isUploading={isUploading}
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
      </StarBorder>
    </Collapsible>;
}

// Rest Day Card - matching design with ActivityAccordion
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
  return <StarBorder color="hsl(207, 55%, 48%)" speed="6s" thickness={1}>
    <div className={cn("w-full bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-5 shadow-2xl transition-all duration-500", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
      {/* Header Row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center shrink-0">
          <ActivityIcon type="rest" size="sm" />
        </div>
        {/* Title Section */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{dayName}</h2>
          <p className="text-sm text-muted-foreground">
            Día de descanso
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

      {/* Rest Info */}
      <div className="bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8 rounded-xl p-3 text-center">
        <div className="text-2xl mb-1">😴</div>
        <div className="text-sm text-muted-foreground">Recuperación activa</div>
      </div>
    </div>
  </StarBorder>;
}