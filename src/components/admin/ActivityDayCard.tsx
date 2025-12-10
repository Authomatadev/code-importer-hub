import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { getZoneByValue, getPhaseByValue } from '@/lib/activity-constants';

type Activity = Tables<'activities'>;

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const activityIcons: Record<string, string> = {
  run: '🏃',
  walk: '🚶',
  strength: '💪',
  rest: '😴',
  stretch: '🧘',
  cross_training: '🚴',
};

interface ActivityDayCardProps {
  dayIndex: number;
  activity: Activity | null;
  onAdd: () => void;
  onEdit: (activity: Activity) => void;
}

export function ActivityDayCard({ dayIndex, activity, onAdd, onEdit }: ActivityDayCardProps) {
  const dayName = dayNames[dayIndex] || `Día ${dayIndex + 1}`;
  const zone = getZoneByValue(activity?.zone);
  const phase = getPhaseByValue(activity?.phase);

  return (
    <Card className={`min-h-[160px] transition-all hover:shadow-md ${activity ? 'border-primary/20' : 'border-dashed'}`}>
      <CardContent className="p-3 h-full flex flex-col">
        <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">
          {dayName}
        </div>
        
        {activity ? (
          <div className="flex-1 flex flex-col">
            <div className="text-2xl text-center mb-1">
              {activityIcons[activity.activity_type || 'run'] || '📋'}
            </div>
            <p className="text-xs font-medium text-center line-clamp-2 mb-1">
              {activity.title}
            </p>
            
            {/* Badges row */}
            <div className="flex flex-wrap justify-center gap-1 mb-1">
              {zone && (
                <Badge 
                  className="text-[9px] px-1.5 py-0 h-4 text-white"
                  style={{ backgroundColor: zone.color }}
                >
                  {zone.value}
                </Badge>
              )}
              {phase && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                  {phase.label}
                </Badge>
              )}
            </div>

            {(activity.total_daily_km || activity.distance_km || activity.duration_min) && (
              <p className="text-xs text-muted-foreground text-center">
                {(activity.total_daily_km || activity.distance_km) && `${activity.total_daily_km || activity.distance_km}km`}
                {(activity.total_daily_km || activity.distance_km) && activity.duration_min && ' · '}
                {activity.duration_min && `${activity.duration_min}min`}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-auto mx-auto"
              onClick={() => onEdit(activity)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Button variant="ghost" size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
