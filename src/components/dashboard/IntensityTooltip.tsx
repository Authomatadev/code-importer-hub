import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getIntensityByLevel, INTENSITY_LEVELS } from "@/lib/activity-constants";

interface IntensityTooltipProps {
  level: number;
  children: ReactNode;
}

export function IntensityTooltip({ level, children }: IntensityTooltipProps) {
  const intensity = getIntensityByLevel(level);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{children}</div>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-4 space-y-3 bg-popover border border-border shadow-xl"
          side="top"
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {Array(level).fill('⚡').join('')}
            </span>
            <div>
              <p className="font-bold text-foreground">
                Intensidad {level}/5
                {intensity && <span className="ml-1 text-muted-foreground font-normal">({intensity.label})</span>}
              </p>
              {intensity && (
                <p className="text-xs text-muted-foreground">{intensity.description}</p>
              )}
            </div>
          </div>

          {/* Effort indicator */}
          {intensity && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">
                💬 {intensity.effort}
              </p>
            </div>
          )}

          {/* Scale visualization */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Escala de intensidad:</p>
            <div className="space-y-1">
              {INTENSITY_LEVELS.map((i) => (
                <div 
                  key={i.level}
                  className={cn(
                    "flex items-center gap-2 text-xs px-2 py-1 rounded",
                    i.level === level 
                      ? "bg-primary/20 text-primary font-medium" 
                      : "text-muted-foreground"
                  )}
                >
                  <span className="w-12">{'⚡'.repeat(i.level)}</span>
                  <span>{i.label}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
