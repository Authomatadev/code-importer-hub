import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking achievements for user: ${userId}`);

    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');

    if (achievementsError) {
      throw achievementsError;
    }

    // Get user's existing achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    // Get activity logs
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('id, activity_id, logged_at, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    if (!logs || logs.length === 0) {
      console.log('No activity logs found for user');
      return new Response(
        JSON.stringify({ newAchievements: [], stats: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get activity details
    const activityIds = logs.map(l => l.activity_id);
    const { data: activities } = await supabase
      .from('activities')
      .select('id, zone, training_type, intensity, total_daily_km, activity_type')
      .in('id', activityIds);

    // Calculate stats
    const activitiesCount = logs.length;
    
    const highZoneCount = activities?.filter(a => 
      ['ZY', 'Z4', 'Z5'].includes(a.zone || '')
    ).length || 0;
    
    const intervalCount = activities?.filter(a => 
      a.training_type === 'intervalo'
    ).length || 0;
    
    const longRunCount = activities?.filter(a => 
      a.training_type === 'trote_largo'
    ).length || 0;
    
    const totalDistance = activities?.reduce((sum, a) => 
      sum + (a.total_daily_km || 0), 0
    ) || 0;
    
    const highIntensityCount = activities?.filter(a => 
      (a.intensity || 0) >= 4
    ).length || 0;

    // Calculate streak
    const logDates = logs
      .map(l => new Date(l.logged_at!).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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
        currentStreak++;
      } else {
        break;
      }
    }

    // Get weeks complete
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true);

    const weeksComplete = progressData?.length || 0;

    const stats: UserStats = {
      activitiesCount,
      weeksComplete,
      highZoneCount,
      intervalCount,
      longRunCount,
      totalDistance: Math.round(totalDistance),
      highIntensityCount,
      currentStreak,
    };

    console.log('User stats:', stats);

    // Check which achievements to unlock
    const newAchievements: typeof achievements = [];

    for (const achievement of achievements!) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      const triggerValue = achievement.trigger_value || 0;

      switch (achievement.trigger_type) {
        case 'activities_count':
          shouldUnlock = stats.activitiesCount >= triggerValue;
          break;
        case 'weeks_complete':
          shouldUnlock = stats.weeksComplete >= triggerValue;
          break;
        case 'high_zone_count':
          shouldUnlock = stats.highZoneCount >= triggerValue;
          break;
        case 'interval_count':
          shouldUnlock = stats.intervalCount >= triggerValue;
          break;
        case 'long_run_count':
          shouldUnlock = stats.longRunCount >= triggerValue;
          break;
        case 'total_distance':
          shouldUnlock = stats.totalDistance >= triggerValue;
          break;
        case 'high_intensity_count':
          shouldUnlock = stats.highIntensityCount >= triggerValue;
          break;
        case 'streak_days':
          shouldUnlock = stats.currentStreak >= triggerValue;
          break;
      }

      if (shouldUnlock) {
        console.log(`Unlocking achievement: ${achievement.name}`);
        
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });

        if (!error) {
          newAchievements.push(achievement);
        } else {
          console.error(`Error unlocking achievement ${achievement.name}:`, error);
        }
      }
    }

    console.log(`Unlocked ${newAchievements.length} new achievements`);

    return new Response(
      JSON.stringify({ 
        newAchievements, 
        stats,
        totalUnlocked: unlockedIds.size + newAchievements.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in check-achievements:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
