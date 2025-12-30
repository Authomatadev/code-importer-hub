import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityDayCard } from './ActivityDayCard';
import { ActivityForm } from './ActivityForm';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Activity = Tables<'activities'>;

interface ActivityManagerProps {
  weekId: string;
  weekNumber: number;
  planName: string;
  onBack: () => void;
}

export function ActivityManager({ weekId, weekNumber, planName, onBack }: ActivityManagerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [weekId]);

  async function fetchActivities() {
    setLoading(true);
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('week_id', weekId)
      .order('day_of_week');

    if (data) {
      setActivities(data);
    }
    setLoading(false);
  }

  function getActivityForDay(dayNumber: number): Activity | null {
    return activities.find((a) => a.day_of_week === dayNumber) || null;
  }

  function handleAddActivity(dayIndex: number) {
    setSelectedDay(dayIndex);
    setEditingActivity(null);
    setFormOpen(true);
  }

  function handleEditActivity(activity: Activity) {
    setSelectedDay(activity.day_of_week);
    setEditingActivity(activity);
    setFormOpen(true);
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>
            Semana {weekNumber} - {planName}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 min-w-0">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => (
              <ActivityDayCard
                key={dayNumber}
                dayNumber={dayNumber}
                activity={getActivityForDay(dayNumber)}
                onAdd={() => handleAddActivity(dayNumber)}
                onEdit={handleEditActivity}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        weekId={weekId}
        dayOfWeek={selectedDay}
        activity={editingActivity}
        onSaved={fetchActivities}
      />
    </>
  );
}
