import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Contest {
  id: string;
  code: string;
  name: string;
  description: string | null;
  terms_and_conditions: string | null;
  start_date: string;
  end_date: string;
  max_winners: number | null;
  requires_video: boolean | null;
  requires_photos: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useContest(code?: string) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContest() {
      try {
        setIsLoading(true);
        let query = supabase
          .from('contests')
          .select('*')
          .eq('is_active', true);

        if (code) {
          query = query.eq('code', code);
        } else {
          query = query.order('end_date', { ascending: true }).limit(1);
        }

        const { data, error: fetchError } = await query.maybeSingle();

        if (fetchError) throw fetchError;
        setContest(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching contest'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchContest();
  }, [code]);

  const daysRemaining = contest
    ? Math.max(0, Math.ceil((new Date(contest.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isOpen = contest
    ? new Date() >= new Date(contest.start_date) && new Date() <= new Date(contest.end_date)
    : false;

  return {
    contest,
    isLoading,
    error,
    daysRemaining,
    isOpen,
  };
}
