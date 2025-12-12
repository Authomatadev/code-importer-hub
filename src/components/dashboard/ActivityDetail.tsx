import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityIcon, ActivityType, getActivityLabel } from "./ActivityIcon";
import { Check, Clock, MapPin, Zap, Mountain, Repeat, Timer, Watch, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getZoneByValue,
  getPhaseByValue,
  getTrainingTypeByValue,
  getTerrainByValue,
  getMainWorkTypeByValue,
  GARMIN_INSTRUCTIONS,
  WARMUP_INFO,
  STRETCH_REMINDER,
} from "@/lib/activity-constants";
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
  // New fields
  phase?: string | null;
  training_type?: string | null;
  warmup_duration_min?: number | null;
  main_work_type?: string | null;
  zone?: string | null;
  terrain?: string | null;
  main_work_distance_km?: number | null;
  main_work_duration_min?: number | null;
  repetitions?: number | null;
  rep_distance_meters?: number | null;
  rest_between_reps_min?: number | null;
  stretch_before_after?: boolean | null;
  total_daily_km?: number | null;
  notes?: string | null;
  media_url?: string | null;
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
  
  const zone = getZoneByValue(activity.zone);
  const phase = getPhaseByValue(activity.phase);
  const trainingType = getTrainingTypeByValue(activity.training_type);
  const terrain = getTerrainByValue(activity.terrain);
  const mainWorkType = getMainWorkTypeByValue(activity.main_work_type);

  const hasWarmup = activity.warmup_duration_min;
  const hasMainWork = activity.main_work_type || activity.main_work_distance_km || activity.main_work_duration_min;
  const hasIntervals = activity.repetitions && activity.rep_distance_meters;
  const hasNotes = activity.description || activity.notes;

  return (
    <Dialog open={!!activity} onOpenChange={() => onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col p-0 mx-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <ActivityIcon 
              type={activity.activity_type} 
              size="lg" 
              showBackground 
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="font-heading text-xl leading-tight">
                {activity.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">
                  {dayFullNames[activity.day_of_week]}
                </span>
                {phase && (
                  <Badge variant="secondary" className="text-xs">
                    {phase.label}
                  </Badge>
                )}
                {zone && (
                  <Badge 
                    className="text-xs text-white"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.label}
                  </Badge>
                )}
                {trainingType && (
                  <Badge variant="outline" className="text-xs">
                    {trainingType.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Quick Stats Row */}
            <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg">
              {(activity.total_daily_km || activity.distance_km) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {formatDistance(activity.total_daily_km || activity.distance_km)}
                  </span>
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
              {terrain && (
                <div className="flex items-center gap-2 text-sm">
                  <Mountain className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{terrain.label}</span>
                </div>
              )}
            </div>

            <Accordion type="multiple" defaultValue={['warmup', 'main-work', 'intervals']} className="space-y-2">
              {/* Warmup Section */}
              {hasWarmup && (
                <AccordionItem value="warmup" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <span className="font-semibold text-sm">Calentamiento</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activity.warmup_duration_min} min
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="bg-muted/30 rounded-lg p-3 flex gap-3">
                      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {WARMUP_INFO}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Main Work Section */}
              {hasMainWork && (
                <AccordionItem value="main-work" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💪</span>
                      <span className="font-semibold text-sm">Trabajo Principal</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    {mainWorkType && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Tipo:</span>
                        <span className="text-sm font-medium">{mainWorkType.label}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      {activity.main_work_distance_km && (
                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Distancia</p>
                          <p className="text-lg font-bold text-primary">
                            {formatDistance(activity.main_work_distance_km)}
                          </p>
                        </div>
                      )}
                      {activity.main_work_duration_min && (
                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Duración</p>
                          <p className="text-lg font-bold text-primary">
                            {activity.main_work_duration_min} min
                          </p>
                        </div>
                      )}
                    </div>

                    {zone && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Zona cardíaca:</span>
                        <Badge style={{ backgroundColor: zone.color }} className="text-white text-xs">
                          {zone.label}
                        </Badge>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Intervals Section */}
              {hasIntervals && (
                <AccordionItem value="intervals" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔁</span>
                      <span className="font-semibold text-sm">Intervalos</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activity.repetitions} × {activity.rep_distance_meters}m
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <Repeat className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Repeticiones</p>
                        <p className="text-lg font-bold">{activity.repetitions}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <MapPin className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Distancia</p>
                        <p className="text-lg font-bold">{activity.rep_distance_meters}m</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <Timer className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Pausa</p>
                        <p className="text-lg font-bold">{activity.rest_between_reps_min || 2} min</p>
                      </div>
                    </div>

                    {activity.stretch_before_after && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-2">
                        <span className="text-lg">🧘</span>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          {STRETCH_REMINDER}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Notes Section */}
              {hasNotes && (
                <AccordionItem value="notes" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      <span className="font-semibold text-sm">Instrucciones</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    {activity.description && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {activity.description}
                        </p>
                      </div>
                    )}
                    {activity.notes && (
                      <div className="border-l-2 border-primary pl-3">
                        <p className="text-xs text-muted-foreground mb-1">Notas adicionales:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {activity.notes}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Garmin Instructions */}
              <AccordionItem value="garmin" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Watch className="h-4 w-4" />
                    <span className="font-semibold text-sm">Instrucciones Garmin</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {GARMIN_INSTRUCTIONS}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Intensity bars */}
            {activity.intensity && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground font-medium">INTENSIDAD</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        level <= activity.intensity! 
                          ? "bg-primary" 
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with action button */}
        <div className="px-6 py-4 border-t bg-background">
          <Button
            onClick={() => onMarkComplete?.(activity.id)}
            disabled={isCompleted}
            className="w-full"
            variant={isCompleted ? "secondary" : "default"}
            size="lg"
          >
            {isCompleted ? (
              <>
                <Check className="w-5 h-5 mr-2" />
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
