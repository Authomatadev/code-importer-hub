import { Achievement, UserAchievement, BADGE_COLORS, CATEGORY_LABELS } from "@/lib/achievements";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { AchievementCard } from "./AchievementCard";

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
  
  if (!achievement) return null;
  
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
      
      // Convert data URL to blob
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
        // Fallback: download
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      handleDownload();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[9999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{achievement.icon}</span>
            {achievement.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Medal visual */}
          <div className="flex justify-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center",
              isUnlocked ? [
                "bg-gradient-to-br",
                colorClass,
                "shadow-xl animate-pulse",
              ] : [
                "bg-muted/50",
                "border-2 border-dashed border-muted-foreground/30",
                "grayscale",
              ]
            )}>
              <span className="text-4xl">{achievement.icon}</span>
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
          <div className="space-y-2">
            <p className="text-foreground text-center font-medium">
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
              <Button variant="outline" className="flex-1" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button className="flex-1" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          )}
        </div>
        
        {/* Hidden card for image generation */}
        {isUnlocked && (
          <div className="absolute -left-[9999px]">
            <AchievementCard 
              ref={cardRef}
              achievement={achievement}
              userName={userName}
              unlockedAt={userAchievement?.unlocked_at}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
