import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, CheckCircle, Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekNavigationProps {
  currentWeek: number;
  totalWeeks: number;
  completedWeeks?: number[];
  onWeekChange: (week: number) => void;
}

export function WeekNavigation({ 
  currentWeek, 
  totalWeeks,
  completedWeeks = [],
  onWeekChange 
}: WeekNavigationProps) {
  const canGoPrev = currentWeek > 1;
  
  // User can navigate to next week if current week is completed or if it's already unlocked
  const isCurrentWeekCompleted = completedWeeks.includes(currentWeek);
  const maxUnlockedWeek = Math.max(1, ...completedWeeks.map(w => w + 1));
  const canGoNext = currentWeek < totalWeeks && currentWeek < maxUnlockedWeek;

  const isWeekUnlocked = (week: number) => {
    if (week === 1) return true;
    return completedWeeks.includes(week - 1);
  };

  return (
    <div className="space-y-3">
      {/* Week completed banner */}
      {isCurrentWeekCompleted && currentWeek < totalWeeks && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-emerald-400 text-sm sm:text-base">
                  🎉 ¡SEMANA {currentWeek} COMPLETADA!
                </p>
                <p className="text-emerald-300/80 text-xs sm:text-sm">
                  Has completado todas las actividades. ¡Sigue así, campeón!
                </p>
              </div>
            </div>
            <Button
              onClick={() => onWeekChange(currentWeek + 1)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shrink-0"
            >
              Avanzar a Semana {currentWeek + 1}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2 sm:p-3 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange(currentWeek - 1)}
          disabled={!canGoPrev}
          className="px-2 sm:px-3"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="text-center flex-1 min-w-0">
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              Semana {currentWeek} de {totalWeeks}
            </p>
            {isCurrentWeekCompleted && (
              <span className="bg-emerald-500 text-white text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                COMPLETADA
              </span>
            )}
          </div>
          {/* Hide indicators on mobile when too many weeks */}
          <div className="hidden sm:flex gap-1 mt-2 justify-center flex-wrap max-w-xs mx-auto">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const isCompleted = completedWeeks.includes(week);
              const isUnlocked = isWeekUnlocked(week);
              const isCurrent = week === currentWeek;
              
              return (
                <button
                  key={week}
                  onClick={() => isUnlocked && onWeekChange(week)}
                  disabled={!isUnlocked}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all flex items-center justify-center text-[11px] sm:text-xs font-bold",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isCompleted && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                    !isCompleted && isUnlocked && "bg-muted hover:bg-muted-foreground/30 text-muted-foreground",
                    !isUnlocked && "bg-muted/50 cursor-not-allowed opacity-50"
                  )}
                  title={isCompleted ? `Semana ${week} completada ✓` : isUnlocked ? `Ir a semana ${week}` : `Semana ${week} bloqueada`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    week
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange(currentWeek + 1)}
          disabled={!canGoNext}
          className="px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
