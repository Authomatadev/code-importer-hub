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
      setEntry(data);

      // Get total participants count
      const { count } = await supabase
        .from('contest_entries')
        .select('*', { count: 'exact', head: true })
        .eq('contest_id', contestId)
        .not('video_url', 'is', null);

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

  const acceptTerms = async () => {
    if (!contestId || !userId) return;

    try {
      setIsSubmitting(true);

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
      setEntry(data);

      toast({
        title: '¡Términos aceptados!',
        description: 'Ahora puedes subir tu video de presentación.',
      });
    } catch (err) {
      console.error('Error accepting terms:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron aceptar los términos.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setEntry(data);

      toast({
        title: '¡Video subido!',
        description: 'Ya estás participando en el concurso.',
      });

      // Trigger ranking calculation
      await calculateRankings();
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
    acceptTerms,
    submitVideo,
    calculateRankings,
    refreshEntry,
    isEnrolled: !!entry?.video_url,
    hasAcceptedTerms: !!entry?.terms_accepted,
  };
}
