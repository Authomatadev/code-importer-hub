import { useState, useEffect, useRef } from "react";
import { Achievement, UserAchievement } from "@/lib/achievements";
import { MedalItem } from "./MedalItem";
import { MedalDetail } from "./MedalDetail";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedalBarProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  userName?: string;
  userStats?: {
    activitiesCount: number;
    weeksComplete: number;
    highZoneCount: number;
    intervalCount: number;
    longRunCount: number;
    totalDistance: number;
    highIntensityCount: number;
    currentStreak: number;
  };
}

export function MedalBar({ achievements, userAchievements, userName, userStats }: MedalBarProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
  
  // Check scroll position for arrow visibility
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [achievements]);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  
  const getProgress = (achievement: Achievement): { current: number; target: number } | null => {
    if (!userStats || !achievement.trigger_value) return null;
    
    const progressMap: Record<string, number> = {
      activities_count: userStats.activitiesCount,
      weeks_complete: userStats.weeksComplete,
      high_zone_count: userStats.highZoneCount,
      interval_count: userStats.intervalCount,
      long_run_count: userStats.longRunCount,
      total_distance: userStats.totalDistance,
      high_intensity_count: userStats.highIntensityCount,
      streak_days: userStats.currentStreak,
    };
    
    const current = progressMap[achievement.trigger_type] ?? 0;
    return { current, target: achievement.trigger_value };
  };
  
  const selectedUserAchievement = selectedAchievement 
    ? userAchievements.find(ua => ua.achievement_id === selectedAchievement.id) || null
    : null;
  
  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  
  // Sort: unlocked first, then by sort_order
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-lg font-bold text-foreground">
            TUS MEDALLAS
          </h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            {unlockedCount}/{totalCount}
          </span>
        </div>
      </div>
      
      {/* Medal bar container */}
      <div className="relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        
        {/* Scroll container */}
        <div 
          ref={scrollRef}
          className={cn(
            "flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1",
            "scroll-smooth snap-x snap-mandatory"
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedAchievements.map((achievement) => (
            <div key={achievement.id} className="snap-start">
              <MedalItem
                achievement={achievement}
                isUnlocked={unlockedIds.has(achievement.id)}
                onClick={() => setSelectedAchievement(achievement)}
              />
            </div>
          ))}
        </div>
        
        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}
        
        {/* Fade edges */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        )}
      </div>
      
      {/* Medal detail dialog */}
      <MedalDetail
        achievement={selectedAchievement}
        userAchievement={selectedUserAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        userName={userName}
        progress={selectedAchievement ? getProgress(selectedAchievement) : null}
      />
    </div>
  );
}
