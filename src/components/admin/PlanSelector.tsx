import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Plan = Tables<'plans'>;

interface PlanSelectorProps {
  selectedPlanId: string | null;
  onSelect: (plan: Plan) => void;
}

const difficultyLabels: Record<number, string> = {
  1: 'Principiante',
  2: 'Intermedio',
  3: 'Avanzado',
};

export function PlanSelector({ selectedPlanId, onSelect }: PlanSelectorProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .order('distance')
        .order('difficulty');

      if (data) {
        setPlans(data);
      }
      setLoading(false);
    }

    fetchPlans();
  }, []);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select
      value={selectedPlanId || undefined}
      onValueChange={(value) => {
        const plan = plans.find((p) => p.id === value);
        if (plan) onSelect(plan);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccionar plan..." />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan.id} value={plan.id}>
            {plan.distance} - {difficultyLabels[plan.difficulty] || plan.difficulty} ({plan.total_weeks} semanas)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
