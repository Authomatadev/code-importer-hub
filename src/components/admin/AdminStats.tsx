import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, Activity, Users, Clock } from 'lucide-react';

interface Stats {
  plans: number;
  weeks: number;
  activities: number;
  users: number;
  waiting: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [plansRes, weeksRes, activitiesRes, usersRes, waitingRes] = await Promise.all([
        supabase.from('plans').select('*', { count: 'exact', head: true }),
        supabase.from('weeks').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('waiting_list').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        plans: plansRes.count || 0,
        weeks: weeksRes.count || 0,
        activities: activitiesRes.count || 0,
        users: usersRes.count || 0,
        waiting: waitingRes.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statItems = [
    { label: 'Planes', value: stats?.plans, icon: FileText, color: 'text-primary' },
    { label: 'Semanas', value: stats?.weeks, icon: Calendar, color: 'text-blue-500' },
    { label: 'Actividades', value: stats?.activities, icon: Activity, color: 'text-green-500' },
    { label: 'Usuarios', value: stats?.users, icon: Users, color: 'text-purple-500' },
    { label: 'Lista de espera', value: stats?.waiting, icon: Clock, color: 'text-amber-500' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-sm">{item.label}</span>
            </div>
            <p className="text-2xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
