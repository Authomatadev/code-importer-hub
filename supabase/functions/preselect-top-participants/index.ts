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

    // Parse optional contest_id from request body
    let contestId: string | null = null;
    try {
      const body = await req.json();
      contestId = body?.contest_id || null;
    } catch {
      // No body provided, will process all eligible contests
    }

    console.log('Starting preselection process...', contestId ? `for contest: ${contestId}` : 'for all eligible contests');

    // Find contests that need preselection:
    // - Active contests in "accumulation" phase
    // - Where end_date has passed (accumulation period ended)
    let contestQuery = supabase
      .from('contests')
      .select('*')
      .eq('is_active', true)
      .eq('current_phase', 'accumulation')
      .lte('end_date', new Date().toISOString());

    if (contestId) {
      contestQuery = contestQuery.eq('id', contestId);
    }

    const { data: contests, error: contestsError } = await contestQuery;

    if (contestsError) {
      console.error('Error fetching contests:', contestsError);
      throw contestsError;
    }

    if (!contests || contests.length === 0) {
      console.log('No contests ready for preselection');
      return new Response(
        JSON.stringify({ message: 'No contests ready for preselection' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const contest of contests) {
      console.log(`Processing contest: ${contest.name} (${contest.id})`);
      
      const preselectionCount = contest.preselection_count || 100;

      // First, recalculate all rankings for this contest
      console.log('Recalculating rankings...');
      
      // Get all entries for this contest
      const { data: entries, error: entriesError } = await supabase
        .from('contest_entries')
        .select('*')
        .eq('contest_id', contest.id);

      if (entriesError) {
        console.error(`Error fetching entries for contest ${contest.id}:`, entriesError);
        continue;
      }

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

      // Now get the top N entries by score
      const { data: topEntries, error: topError } = await supabase
        .from('contest_entries')
        .select('id, user_id, score')
        .eq('contest_id', contest.id)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(preselectionCount);

      if (topError) {
        console.error(`Error fetching top entries for contest ${contest.id}:`, topError);
        continue;
      }

      console.log(`Found ${topEntries?.length || 0} entries to preselect`);

      // Mark top entries as preselected
      const preselectedIds = topEntries?.map(e => e.id) || [];
      const now = new Date().toISOString();

      if (preselectedIds.length > 0) {
        // Reset all entries first
        await supabase
          .from('contest_entries')
          .update({ 
            is_preselected: false, 
            preselected_at: null,
            rank: null 
          })
          .eq('contest_id', contest.id);

        // Update ranks and preselection for all entries
        const { data: allEntriesRanked } = await supabase
          .from('contest_entries')
          .select('id, score, created_at')
          .eq('contest_id', contest.id)
          .order('score', { ascending: false })
          .order('created_at', { ascending: true });

        for (let i = 0; i < (allEntriesRanked?.length || 0); i++) {
          const entry = allEntriesRanked![i];
          const rank = i + 1;
          const isPreselected = rank <= preselectionCount;

          await supabase
            .from('contest_entries')
            .update({
              rank,
              is_preselected: isPreselected,
              preselected_at: isPreselected ? now : null
            })
            .eq('id', entry.id);
        }

        console.log(`Preselected ${Math.min(preselectedIds.length, preselectionCount)} participants`);
      }

      // Update contest phase to video_submission
      const { error: updateError } = await supabase
        .from('contests')
        .update({ current_phase: 'video_submission' })
        .eq('id', contest.id);

      if (updateError) {
        console.error(`Error updating contest phase:`, updateError);
        continue;
      }

      console.log(`Contest ${contest.name} moved to video_submission phase`);

      results.push({
        contest_id: contest.id,
        contest_name: contest.name,
        preselected_count: Math.min(topEntries?.length || 0, preselectionCount),
        new_phase: 'video_submission'
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${results.length} contest(s)`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in preselection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
