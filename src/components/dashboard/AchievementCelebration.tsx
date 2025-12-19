import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Achievement, BADGE_COLORS } from "@/lib/achievements";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, X } from "lucide-react";
import { toPng } from "html-to-image";
import { AchievementCard } from "./AchievementCard";

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function AchievementCelebration({ 
  achievement, 
  isOpen, 
  onClose,
  userName 
}: AchievementCelebrationProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Trigger confetti when dialog opens
  useEffect(() => {
    if (isOpen && achievement) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;
      
      const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      
      // Big burst in the middle
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });
      }, 500);
    }
  }, [isOpen, achievement]);
  
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none bg-transparent shadow-none">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 p-2 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-6 py-8">
          {/* Celebration text */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold">
              ¡Logro Desbloqueado!
            </p>
            <h2 className="font-heading text-4xl font-black text-foreground">
              🎉 ¡FELICIDADES! 🎉
            </h2>
          </div>
          
          {/* Medal with glow */}
          <div 
            className={`w-28 h-28 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center animate-bounce`}
            style={{
              boxShadow: '0 0 60px rgba(255, 200, 0, 0.5)',
            }}
          >
            <span className="text-5xl drop-shadow-lg">{achievement.icon}</span>
          </div>
          
          {/* Achievement name */}
          <div>
            <h3 className="font-heading text-2xl font-bold text-foreground">
              {achievement.name}
            </h3>
            <p className="text-muted-foreground mt-1">
              {achievement.description}
            </p>
          </div>
          
          {/* Share buttons */}
          <div className="flex gap-3 w-full max-w-xs">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button className="flex-1" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
        
        {/* Hidden card for image generation */}
        <div className="absolute -left-[9999px]">
          <AchievementCard 
            ref={cardRef}
            achievement={achievement}
            userName={userName}
            unlockedAt={new Date().toISOString()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
