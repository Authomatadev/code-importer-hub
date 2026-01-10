import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContestEntry {
  id: string;
  contest_id: string;
  user_id: string;
  video_url: string | null;
  video_uploaded_at: string | null;
  terms_accepted: boolean | null;
  terms_accepted_at: string | null;
  completion_percent: number | null;
  photo_percent: number | null;
  score: number | null;
  rank: number | null;
  is_winner: boolean | null;
  is_preselected: boolean | null;
  preselected_at: string | null;
  committee_selected: boolean | null;
  final_winner: boolean | null;
  notified_at: string | null;
  created_at: string | null;
}

interface UseContestEntryOptions {
  contestId: string | null;
  userId: string | null;
}

export function useContestEntry({ contestId, userId }: UseContestEntryOptions) {
  const [entry, setEntry] = useState<ContestEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const { toast } = useToast();

  const fetchEntry = useCallback(async () => {
    if (!contestId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contest_entries')
        .select('*')
        .eq('contest_id', contestId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setEntry(data as ContestEntry | null);

      // Get total participants count (all users with entries, not just with videos)
      const { count } = await supabase
        .from('contest_entries')
        .select('*', { count: 'exact', head: true })
        .eq('contest_id', contestId);

      setTotalParticipants(count || 0);
    } catch (err) {
      console.error('Error fetching contest entry:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contestId, userId]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  // Auto-enroll user when they load the page (if not already enrolled)
  const autoEnroll = async () => {
    if (!contestId || !userId || entry) return;

    try {
      const { data, error } = await supabase
        .from('contest_entries')
        .upsert({
          contest_id: contestId,
          user_id: userId,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        }, {
          onConflict: 'contest_id,user_id',
        })
        .select()
        .single();

      if (error) throw error;
      setEntry(data as ContestEntry);

      // Trigger initial ranking calculation
      await calculateRankings();
    } catch (err) {
      console.error('Error auto-enrolling user:', err);
    }
  };

  // Submit video (only for preselected users in video_submission phase)
  const submitVideo = async (file: File) => {
    if (!contestId || !userId || !entry) return;

    try {
      setIsSubmitting(true);

      // Upload video to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `contest-videos/${contestId}/${userId}/presentation.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('activity-media')
        .getPublicUrl(filePath);

      // Update entry with video URL
      const { data, error } = await supabase
        .from('contest_entries')
        .update({
          video_url: urlData.publicUrl,
          video_uploaded_at: new Date().toISOString(),
        })
        .eq('id', entry.id)
        .select()
        .single();

      if (error) throw error;
      setEntry(data as ContestEntry);

      toast({
        title: '¡Video subido!',
        description: 'Tu video de presentación ha sido recibido.',
      });
    } catch (err) {
      console.error('Error uploading video:', err);
      toast({
        title: 'Error',
        description: 'No se pudo subir el video.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRankings = async () => {
    try {
      await supabase.functions.invoke('calculate-contest-rankings', {
        body: { contest_id: contestId },
      });
      // Refresh entry after calculation
      await fetchEntry();
    } catch (err) {
      console.error('Error calculating rankings:', err);
    }
  };

  const refreshEntry = () => {
    fetchEntry();
  };

  return {
    entry,
    isLoading,
    isSubmitting,
    totalParticipants,
    autoEnroll,
    submitVideo,
    calculateRankings,
    refreshEntry,
    // New flow: enrolled = has entry (auto-enrolled when joining platform)
    isEnrolled: !!entry,
    // Preselected = top 100 after accumulation phase ends
    isPreselected: !!entry?.is_preselected,
    // Has submitted video (for preselected users)
    hasSubmittedVideo: !!entry?.video_url,
    // Final winner selected by committee
    isFinalWinner: !!entry?.final_winner,
  };
}
