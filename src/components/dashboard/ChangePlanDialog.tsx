import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      setSelectedPlanId(null);
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

  const getSelectedPlanLabel = () => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return null;
    return `${plan.distance} - ${difficultyLabels[plan.difficulty]} (${plan.total_weeks} semanas)`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Cambiar plan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl sm:text-2xl">Cambiar Plan</DialogTitle>
          <DialogDescription className="text-sm">
            Selecciona un nuevo plan. Tu progreso actual será reiniciado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Select
              value={selectedPlanId || undefined}
              onValueChange={(value) => setSelectedPlanId(value)}
            >
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Seleccionar plan..." />
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                {plans.map((plan) => {
                  const isCurrent = currentPlanId === plan.id;
                  return (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      disabled={isCurrent}
                      className="py-3"
                    >
                      {plan.distance} - {difficultyLabels[plan.difficulty]} ({plan.total_weeks} sem.)
                      {isCurrent && ' (Actual)'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePlan} 
            disabled={!selectedPlanId || saving}
            className="w-full sm:w-auto"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
