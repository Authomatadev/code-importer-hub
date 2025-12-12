import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  distance: string | null;
  difficulty: number;
  total_weeks: number;
}

interface ChangePlanDialogProps {
  currentPlanId: string | null;
  onPlanChanged: () => void;
}

const difficultyLabels: Record<number, string> = {
  1: 'Principiante',
  2: 'Intermedio',
};

const distanceDescriptions: Record<string, string> = {
  '10K': 'Tu Primera Meta',
  '21K': 'El Gran Salto',
  '42K': 'La Leyenda',
};

export function ChangePlanDialog({ currentPlanId, onPlanChanged }: ChangePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('id, name, distance, difficulty, total_weeks')
      .order('distance')
      .order('difficulty');

    if (data) {
      setPlans(data);
    }
    setLoading(false);
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'No se pudo obtener el usuario',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        current_plan_id: selectedPlanId,
        distance: selectedPlan?.distance,
        difficulty: selectedPlan?.difficulty,
        start_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el plan',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    // Clear activity logs for the user (reset progress)
    await supabase
      .from('activity_logs')
      .delete()
      .eq('user_id', user.id);

    toast({
      title: '¡Plan actualizado! 🎯',
      description: `Ahora estás en el plan ${selectedPlan?.distance} - ${difficultyLabels[selectedPlan?.difficulty || 1]}`,
    });

    setSaving(false);
    setOpen(false);
    onPlanChanged();
  };

  // Group plans by distance
  const plansByDistance = plans.reduce((acc, plan) => {
    const distance = plan.distance || 'Otro';
    if (!acc[distance]) acc[distance] = [];
    acc[distance].push(plan);
    return acc;
  }, {} as Record<string, Plan[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Cambiar plan
        </Button>
      </DialogTrigger>
      <DialogPortal container={document.body}>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[9999] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
          )}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Cambiar Plan de Entrenamiento</DialogTitle>
            <DialogDescription>
              Selecciona un nuevo plan. Tu progreso actual será reiniciado.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(plansByDistance).map(([distance, distancePlans]) => (
                <div key={distance}>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                    {distance} - {distanceDescriptions[distance] || ''}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {distancePlans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      const isCurrent = currentPlanId === plan.id;
                      
                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          disabled={isCurrent}
                          className={`
                            relative p-4 rounded-xl border-2 text-left transition-all
                            ${isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border bg-card hover:border-primary/50'}
                            ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {isCurrent && (
                            <span className="absolute top-2 right-2 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                              Actual
                            </span>
                          )}
                          <p className="font-semibold text-foreground">
                            {difficultyLabels[plan.difficulty]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {plan.total_weeks} semanas
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleChangePlan} 
              disabled={!selectedPlanId || saving || selectedPlanId === currentPlanId}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar cambio
            </Button>
          </div>
          
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
