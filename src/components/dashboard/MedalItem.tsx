import { cn } from "@/lib/utils";
import { Achievement, BADGE_COLORS, BADGE_GLOW_COLORS } from "@/lib/achievements";

interface MedalItemProps {
  achievement: Achievement;
  isUnlocked: boolean;
  isNew?: boolean;
  onClick: () => void;
}

export function MedalItem({ achievement, isUnlocked, isNew, onClick }: MedalItemProps) {
  const colorClass = BADGE_COLORS[achievement.badge_color] || BADGE_COLORS.primary;
  const glowClass = BADGE_GLOW_COLORS[achievement.badge_color] || BADGE_GLOW_COLORS.primary;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300",
        "border-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
        isUnlocked ? [
          "bg-gradient-to-br",
          colorClass,
          "border-white/30",
          "shadow-lg",
          glowClass,
          "hover:scale-110 cursor-pointer",
        ] : [
          "bg-muted/50",
          "border-dashed border-muted-foreground/30",
          "grayscale opacity-50",
          "hover:opacity-70 cursor-pointer",
        ]
      )}
    >
      <span className={cn(
        "text-xl sm:text-2xl",
        isUnlocked ? "drop-shadow-lg" : ""
      )}>
        {achievement.icon}
      </span>
      
      {/* New badge */}
      {isNew && isUnlocked && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
          ¡NUEVO!
        </span>
      )}
      
      {/* Lock indicator for locked achievements */}
      {!isUnlocked && (
        <span className="absolute -bottom-0.5 -right-0.5 text-xs">
          🔒
        </span>
      )}
    </button>
  );
}
