import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, AlertCircle, CheckCircle } from 'lucide-react';

interface WeekCardProps {
  weekNumber: number;
  weekId: string;
  activityCount: number;
  onEdit: () => void;
}

export function WeekCard({ weekNumber, weekId, activityCount, onEdit }: WeekCardProps) {
  const isComplete = activityCount >= 7;
  const hasActivities = activityCount > 0;

  return (
    <Card className={`transition-all hover:shadow-md ${isComplete ? 'border-green-500/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Semana {weekNumber}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isComplete ? 'default' : hasActivities ? 'secondary' : 'outline'}>
                  {activityCount}/7 días
                </Badge>
                {isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
