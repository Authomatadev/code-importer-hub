import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ZoneInfo } from "@/lib/activity-constants";
import { cn } from "@/lib/utils";

interface ZoneTooltipProps {
  zone: ZoneInfo;
  children: ReactNode;
}

export function ZoneTooltip({ zone, children }: ZoneTooltipProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "cursor-help relative group",
              // Animación de pulso sutil para indicar interactividad
              "after:absolute after:inset-0 after:rounded-xl after:border-2 after:border-transparent",
              "hover:after:border-primary/50 hover:after:animate-pulse",
              "transition-all duration-300 hover:scale-[1.02]"
            )}
            onClick={handleClick}
            onMouseDown={handleClick}
          >
            {/* Indicador de info */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <span className="text-[10px] text-primary-foreground font-bold">i</span>
            </div>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-4 space-y-3 bg-popover border border-border shadow-xl z-[9999]"
          side="right"
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions={true}
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{zone.icon}</span>
            <div>
              <p className="font-bold text-foreground">{zone.label}</p>
              <p className="text-xs text-muted-foreground">{zone.fcmRange} FCM</p>
            </div>
          </div>

          {/* Características */}
          <div>
            <p className="text-xs font-semibold text-primary mb-1">Características:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {zone.characteristics.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>

          {/* Beneficios */}
          <div>
            <p className="text-xs font-semibold text-emerald-500 mb-1">Beneficios:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {zone.benefits.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </div>

          {/* Métricas */}
          <div className="flex flex-wrap gap-2 text-xs pt-1">
            <Badge variant="outline" className="text-xs">
              ⏱ {zone.duration}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              📊 {zone.activitiesInPlan} actividades
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
