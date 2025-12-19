import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Achievement, UserAchievement } from "@/lib/achievements";

interface UserStats {
  activitiesCount: number;
  weeksComplete: number;
  highZoneCount: number;
  intervalCount: number;
  longRunCount: number;
  totalDistance: number;
  highIntensityCount: number;
  currentStreak: number;
}

export function useAchievements(userId: string | null) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .order("sort_order");
    
    if (data) {
      setAchievements(data as Achievement[]);
    }
  }, []);
  
  // Fetch user's unlocked achievements
  const fetchUserAchievements = useCallback(async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId);
    
    if (data) {
      setUserAchievements(data as UserAchievement[]);
    }
  }, [userId]);
  
  // Calculate user stats from activity logs
  const fetchUserStats = useCallback(async () => {
    if (!userId) return;
    
    // Get all activity logs with activity details
    const { data: logs } = await supabase
      .from("activity_logs")
      .select(`
        id,
        activity_id,
        logged_at,
        completed
      `)
      .eq("user_id", userId)
      .eq("completed", true);
    
    if (!logs || logs.length === 0) {
      setUserStats({
        activitiesCount: 0,
        weeksComplete: 0,
        highZoneCount: 0,
        intervalCount: 0,
        longRunCount: 0,
        totalDistance: 0,
        highIntensityCount: 0,
        currentStreak: 0,
      });
      return;
    }
    
    // Get activity details for completed activities
    const activityIds = logs.map(l => l.activity_id);
    const { data: activities } = await supabase
      .from("activities")
      .select("id, zone, training_type, intensity, total_daily_km, activity_type")
      .in("id", activityIds);
    
    if (!activities) return;
    
    // Calculate stats
    const activitiesCount = logs.length;
    
    // High zone count (ZY, Z4, Z5)
    const highZoneCount = activities.filter(a => 
      ['ZY', 'Z4', 'Z5'].includes(a.zone || '')
    ).length;
    
    // Interval count
    const intervalCount = activities.filter(a => 
      a.training_type === 'intervalo'
    ).length;
    
    // Long run count
    const longRunCount = activities.filter(a => 
      a.training_type === 'trote_largo'
    ).length;
    
    // Total distance
    const totalDistance = activities.reduce((sum, a) => 
      sum + (a.total_daily_km || 0), 0
    );
    
    // High intensity count (4-5)
    const highIntensityCount = activities.filter(a => 
      (a.intensity || 0) >= 4
    ).length;
    
    // Calculate streak (consecutive days)
    const logDates = logs
      .map(l => new Date(l.logged_at!).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // unique dates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // newest first
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < logDates.length; i++) {
      const logDate = new Date(logDates[i]);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else if (i === 0 && logDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow yesterday as start of streak
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Weeks complete - get from user_progress or calculate
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("completed", true);
    
    const weeksComplete = progressData?.length || 0;
    
    setUserStats({
      activitiesCount,
      weeksComplete,
      highZoneCount,
      intervalCount,
      longRunCount,
      totalDistance: Math.round(totalDistance),
      highIntensityCount,
      currentStreak,
    });
  }, [userId]);
  
  // Check and unlock achievements
  const checkAchievements = useCallback(async () => {
    if (!userId || !userStats || achievements.length === 0) return;
    
    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
    
    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;
      
      let shouldUnlock = false;
      const triggerValue = achievement.trigger_value || 0;
      
      switch (achievement.trigger_type) {
        case 'activities_count':
          shouldUnlock = userStats.activitiesCount >= triggerValue;
          break;
        case 'weeks_complete':
          shouldUnlock = userStats.weeksComplete >= triggerValue;
          break;
        case 'high_zone_count':
          shouldUnlock = userStats.highZoneCount >= triggerValue;
          break;
        case 'interval_count':
          shouldUnlock = userStats.intervalCount >= triggerValue;
          break;
        case 'long_run_count':
          shouldUnlock = userStats.longRunCount >= triggerValue;
          break;
        case 'total_distance':
          shouldUnlock = userStats.totalDistance >= triggerValue;
          break;
        case 'high_intensity_count':
          shouldUnlock = userStats.highIntensityCount >= triggerValue;
          break;
        case 'streak_days':
          shouldUnlock = userStats.currentStreak >= triggerValue;
          break;
      }
      
      if (shouldUnlock) {
        // Unlock the achievement
        const { error } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });
        
        if (!error) {
          // Show celebration
          setNewAchievement(achievement);
          
          // Add to local state
          setUserAchievements(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              user_id: userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
              shared_at: null,
            },
          ]);
        }
      }
    }
  }, [userId, userStats, achievements, userAchievements]);
  
  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchAchievements();
      if (userId) {
        await fetchUserAchievements();
        await fetchUserStats();
      }
      setIsLoading(false);
    };
    load();
  }, [userId, fetchAchievements, fetchUserAchievements, fetchUserStats]);
  
  // Check achievements when stats update
  useEffect(() => {
    if (userStats && achievements.length > 0) {
      checkAchievements();
    }
  }, [userStats, achievements, checkAchievements]);
  
  // Function to refresh stats (call after completing activity)
  const refreshStats = useCallback(async () => {
    await fetchUserStats();
    await fetchUserAchievements();
  }, [fetchUserStats, fetchUserAchievements]);
  
  const clearNewAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);
  
  return {
    achievements,
    userAchievements,
    userStats,
    newAchievement,
    clearNewAchievement,
    refreshStats,
    isLoading,
  };
}
