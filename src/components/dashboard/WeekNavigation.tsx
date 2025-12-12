import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigationProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
}

export function WeekNavigation({ 
  currentWeek, 
  totalWeeks, 
  onWeekChange 
}: WeekNavigationProps) {
  const canGoPrev = currentWeek > 1;
  const canGoNext = currentWeek < totalWeeks;

  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onWeekChange(currentWeek - 1)}
        disabled={!canGoPrev}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Anterior
      </Button>

      <div className="text-center flex-1">
        <p className="text-sm font-medium text-foreground">
          Semana {currentWeek} de {totalWeeks}
        </p>
        {/* Hide indicators on mobile when too many weeks */}
        <div className="hidden sm:flex gap-1 mt-1 justify-center flex-wrap max-w-xs mx-auto">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => onWeekChange(week)}
              className={`w-2 h-2 rounded-full transition-all ${
                week === currentWeek 
                  ? "bg-primary w-4" 
                  : "bg-muted hover:bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onWeekChange(currentWeek + 1)}
        disabled={!canGoNext}
      >
        Siguiente
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
