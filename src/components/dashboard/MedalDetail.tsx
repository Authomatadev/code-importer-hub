import { Achievement, UserAchievement, BADGE_COLORS, CATEGORY_LABELS } from "@/lib/achievements";
import { Button } from "@/components/ui/button";
import { Download, Share2, Check, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { AchievementCard } from "./AchievementCard";
import { createPortal } from "react-dom";

interface MedalDetailProps {
  achievement: Achievement | null;
  userAchievement: UserAchievement | null;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  progress?: { current: number; target: number } | null;
}

export function MedalDetail({ 
  achievement, 
  userAchievement, 
  isOpen, 
  onClose, 
  userName,
  progress 
}: MedalDetailProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isUnlocked = !!userAchievement;
  
  if (!achievement || !isOpen) return null;
  
  const colorClass = BADGE_COLORS[achievement.badge_color] || BADGE_COLORS.primary;
  
  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0F0F0F',
      });
      
      const link = document.createElement('a');
      link.download = `logro-${achievement.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };
  
  const handleShare = async () => {
    if (!cardRef.current) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0F0F0F',
      });
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'logro.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `¡Logro desbloqueado! ${achievement.name}`,
          text: '#MaratonSantiago2026 #CajaLosAndes #Running',
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      handleDownload();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Modal content */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>
        
        {/* Header */}
        <div className="pt-6 pb-4 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{achievement.icon}</span>
            <h2 className="text-xl font-bold text-foreground pr-8">{achievement.name}</h2>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Medal visual */}
          <div className="flex justify-center">
            <div className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center",
              isUnlocked ? [
                "bg-gradient-to-br",
                colorClass,
                "shadow-xl",
              ] : [
                "bg-muted/50",
                "border-2 border-dashed border-muted-foreground/30",
                "grayscale",
              ]
            )}>
              <span className="text-3xl sm:text-4xl">{achievement.icon}</span>
            </div>
          </div>
          
          {/* Status */}
          <div className="text-center">
            {isUnlocked ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Check className="w-5 h-5" />
                <span className="font-semibold">¡Desbloqueado!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="w-5 h-5" />
                <span>Bloqueado</span>
              </div>
            )}
            {userAchievement && (
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(userAchievement.unlocked_at).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-3">
            <p className="text-foreground text-center font-medium text-sm sm:text-base">
              {achievement.description}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-semibold text-foreground">¿Cómo ganarla?</span>
                <br />
                {achievement.how_to_earn}
              </p>
            </div>
            
            {/* Progress bar for locked achievements */}
            {!isUnlocked && progress && progress.target > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>{progress.current} / {progress.target}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${Math.min((progress.current / progress.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Category badge */}
          <div className="flex justify-center">
            <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
              {CATEGORY_LABELS[achievement.category] || achievement.category}
            </span>
          </div>
          
          {/* Share buttons - only for unlocked */}
          {isUnlocked && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 h-11" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button className="flex-1 h-11" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden card for image generation */}
      {isUnlocked && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <AchievementCard 
            ref={cardRef}
            achievement={achievement}
            userName={userName}
            unlockedAt={userAchievement?.unlocked_at}
          />
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
