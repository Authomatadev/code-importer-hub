import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, CheckCircle } from "lucide-react";
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
        <p className="text-sm font-medium text-foreground truncate">
          Semana {currentWeek} de {totalWeeks}
        </p>
        {/* Hide indicators on mobile when too many weeks */}
        <div className="hidden sm:flex gap-1 mt-1 justify-center flex-wrap max-w-xs mx-auto">
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
                  "w-5 h-5 rounded-full transition-all flex items-center justify-center text-[8px]",
                  isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  isCompleted && "bg-green-500 text-white",
                  !isCompleted && isUnlocked && "bg-muted hover:bg-muted-foreground/30",
                  !isUnlocked && "bg-muted/50 cursor-not-allowed opacity-50"
                )}
                title={isCompleted ? `Semana ${week} completada` : isUnlocked ? `Ir a semana ${week}` : `Semana ${week} bloqueada`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3" />
                ) : !isUnlocked ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : null}
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
  );
}
