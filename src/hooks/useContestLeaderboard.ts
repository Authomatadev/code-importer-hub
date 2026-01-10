import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number | null;
  completion_percent: number | null;
  photo_percent: number | null;
  rank: number | null;
  is_winner: boolean | null;
  is_preselected: boolean | null;
  video_uploaded_at: string | null;
  user_name: string;
  user_avatar?: string;
}

interface UseContestLeaderboardOptions {
  contestId: string | null;
  limit?: number;
}

export function useContestLeaderboard({ contestId, limit = 50 }: UseContestLeaderboardOptions) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    if (!contestId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch ALL contest entries (not just those with videos)
      const { data: entriesData, error: entriesError } = await supabase
        .from('contest_entries')
        .select(`
          id,
          user_id,
          score,
          completion_percent,
          photo_percent,
          rank,
          is_winner,
          is_preselected,
          video_uploaded_at
        `)
        .eq('contest_id', contestId)
        .order('rank', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (entriesError) throw entriesError;

      // Fetch user profiles for all entries
      const userIds = entriesData?.map(e => e.user_id) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Map profiles to entries
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]));
      
      const leaderboard: LeaderboardEntry[] = (entriesData || []).map(entry => {
        const profile = profilesMap.get(entry.user_id);
        const userName = profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.full_name || 'Participante';
        
        return {
          ...entry,
          user_name: userName,
        };
      });

      setEntries(leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err : new Error('Error fetching leaderboard'));
    } finally {
      setIsLoading(false);
    }
  }, [contestId, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    isLoading,
    error,
    refresh: fetchLeaderboard,
    topThree: entries.slice(0, 3),
    restOfList: entries.slice(3),
  };
}
