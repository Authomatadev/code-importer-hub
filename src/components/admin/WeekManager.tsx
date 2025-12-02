import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WeekCard } from './WeekCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Plan = Tables<'plans'>;

interface WeekWithCount {
  id: string;
  week_number: number;
  activity_count: number;
}

interface WeekManagerProps {
  plan: Plan;
  onEditWeek: (weekId: string, weekNumber: number) => void;
}

export function WeekManager({ plan, onEditWeek }: WeekManagerProps) {
  const [weeks, setWeeks] = useState<WeekWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWeeks();
  }, [plan.id]);

  async function fetchWeeks() {
    setLoading(true);
    const { data: weeksData } = await supabase
      .from('weeks')
      .select('id, week_number')
      .eq('plan_id', plan.id)
      .order('week_number');

    if (weeksData) {
      // Get activity counts for each week
      const weeksWithCounts = await Promise.all(
        weeksData.map(async (week) => {
          const { count } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('week_id', week.id);
          return {
            ...week,
            activity_count: count || 0,
          };
        })
      );
      setWeeks(weeksWithCounts);
    }
    setLoading(false);
  }

  async function createAllWeeks() {
    setCreating(true);
    try {
      const weeksToCreate = [];
      for (let i = 1; i <= plan.total_weeks; i++) {
        const exists = weeks.find((w) => w.week_number === i);
        if (!exists) {
          weeksToCreate.push({
            plan_id: plan.id,
            week_number: i,
          });
        }
      }

      if (weeksToCreate.length === 0) {
        toast({
          title: 'Info',
          description: 'Todas las semanas ya están creadas.',
        });
        setCreating(false);
        return;
      }

      const { error } = await supabase.from('weeks').insert(weeksToCreate);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: `Se crearon ${weeksToCreate.length} semanas.`,
      });

      fetchWeeks();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron crear las semanas.',
        variant: 'destructive',
      });
    }
    setCreating(false);
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const missingWeeks = plan.total_weeks - weeks.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Semanas de {plan.distance} ({plan.total_weeks} total)
        </CardTitle>
        {missingWeeks > 0 && (
          <Button onClick={createAllWeeks} disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Crear {missingWeeks} semanas faltantes
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {weeks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay semanas creadas para este plan.</p>
            <Button className="mt-4" onClick={createAllWeeks} disabled={creating}>
              {creating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Crear todas las semanas
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {weeks.map((week) => (
              <WeekCard
                key={week.id}
                weekId={week.id}
                weekNumber={week.week_number}
                activityCount={week.activity_count}
                onEdit={() => onEditWeek(week.id, week.week_number)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
