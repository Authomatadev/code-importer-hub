import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { contest_id, user_id } = await req.json();

    console.log('Calculating rankings for contest:', contest_id, 'user:', user_id);

    // Get contest details
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('*')
      .eq('id', contest_id)
      .single();

    if (contestError || !contest) {
      console.error('Contest not found:', contestError);
      return new Response(
        JSON.stringify({ error: 'Contest not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ALL entries for this contest (not just those with videos)
    const { data: entries, error: entriesError } = await supabase
      .from('contest_entries')
      .select('*')
      .eq('contest_id', contest_id);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      throw entriesError;
    }

    console.log(`Found ${entries?.length || 0} entries`);

    // Calculate scores for each participant
    for (const entry of entries || []) {
      try {
        // Get user's plan
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('current_plan_id')
          .eq('id', entry.user_id)
          .single();

        if (!profile?.current_plan_id) {
          console.log(`User ${entry.user_id} has no plan assigned`);
          continue;
        }

        // Get all weeks for the plan
        const { data: weeks } = await supabase
          .from('weeks')
          .select('id')
          .eq('plan_id', profile.current_plan_id);

        if (!weeks?.length) continue;

        const weekIds = weeks.map(w => w.id);

        // Get all non-rest activities for the plan
        const { data: activities } = await supabase
          .from('activities')
          .select('id, activity_type')
          .in('week_id', weekIds)
          .neq('activity_type', 'rest');

        const totalActivities = activities?.length || 0;

        if (totalActivities === 0) {
          console.log(`No activities found for user ${entry.user_id}`);
          continue;
        }

        const activityIds = activities?.map(a => a.id) || [];

        // Get completed activity logs
        const { data: logs } = await supabase
          .from('activity_logs')
          .select('id, completed, photo_url, activity_id')
          .eq('user_id', entry.user_id)
          .eq('completed', true)
          .in('activity_id', activityIds);

        const completedCount = logs?.length || 0;
        const photosCount = logs?.filter(l => l.photo_url)?.length || 0;

        // Calculate percentages
        const completionPercent = (completedCount / totalActivities) * 100;
        const photoPercent = (photosCount / totalActivities) * 100;
        const score = (completionPercent + photoPercent) / 2;

        console.log(`User ${entry.user_id}: completion=${completionPercent.toFixed(1)}%, photos=${photoPercent.toFixed(1)}%, score=${score.toFixed(1)}%`);

        // Update entry with calculated scores
        await supabase
          .from('contest_entries')
          .update({
            completion_percent: completionPercent,
            photo_percent: photoPercent,
            score: score,
          })
          .eq('id', entry.id);

      } catch (err) {
        console.error(`Error calculating for user ${entry.user_id}:`, err);
      }
    }

    // Recalculate rankings (order by score DESC, then created_at ASC for tiebreaker)
    // Note: We rank ALL participants, not just those with videos
    const { data: rankedEntries } = await supabase
      .from('contest_entries')
      .select('id, score, created_at')
      .eq('contest_id', contest_id)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true });

    // Get preselection count from contest
    const preselectionCount = contest.preselection_count || 100;

    // Update ranks
    for (let i = 0; i < (rankedEntries?.length || 0); i++) {
      const entry = rankedEntries![i];
      const rank = i + 1;
      // is_winner is now determined by committee, but we track top N for preselection
      const isInTopN = rank <= preselectionCount;

      await supabase
        .from('contest_entries')
        .update({ rank })
        .eq('id', entry.id);
    }

    console.log(`Rankings updated for ${rankedEntries?.length || 0} entries`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Rankings calculated for ${rankedEntries?.length || 0} entries` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating rankings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
