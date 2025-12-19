import { forwardRef } from "react";
import { Achievement, BADGE_COLORS } from "@/lib/achievements";
import logoImage from "@/assets/logo-caja-los-andes.png";

interface AchievementCardProps {
  achievement: Achievement;
  userName?: string;
  unlockedAt?: string;
}

export const AchievementCard = forwardRef<HTMLDivElement, AchievementCardProps>(
  ({ achievement, userName, unlockedAt }, ref) => {
    const colorClass = BADGE_COLORS[achievement.badge_color] || BADGE_COLORS.primary;
    
    return (
      <div
        ref={ref}
        className="w-[400px] h-[500px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-8 flex flex-col items-center"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Logo */}
        <img 
          src={logoImage} 
          alt="Caja Los Andes" 
          className="h-10 mb-6"
        />
        
        {/* Medal */}
        <div 
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-2xl mb-6`}
          style={{
            boxShadow: '0 0 60px rgba(255, 200, 0, 0.3)',
          }}
        >
          <span className="text-6xl drop-shadow-lg">{achievement.icon}</span>
        </div>
        
        {/* Achievement name */}
        <h2 
          className="text-3xl font-black text-white text-center mb-2 tracking-tight"
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          {achievement.name.toUpperCase()}
        </h2>
        
        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4" />
        
        {/* Description */}
        <p className="text-zinc-300 text-center text-lg mb-auto px-4">
          {achievement.description}
        </p>
        
        {/* User info */}
        <div className="text-center mt-4">
          {userName && (
            <p className="text-white font-semibold text-lg flex items-center gap-2 justify-center">
              <span>👤</span> {userName}
            </p>
          )}
          {unlockedAt && (
            <p className="text-zinc-400 text-sm flex items-center gap-2 justify-center mt-1">
              <span>📅</span> {new Date(unlockedAt).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        
        {/* Hashtags */}
        <div className="mt-6 text-center">
          <p className="text-primary text-sm font-medium">
            #MaratonSantiago2026
          </p>
          <p className="text-zinc-500 text-xs">
            #CajaLosAndes #Running
          </p>
        </div>
      </div>
    );
  }
);

AchievementCard.displayName = "AchievementCard";
