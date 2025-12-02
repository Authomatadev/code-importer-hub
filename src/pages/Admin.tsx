import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminStats, PlanSelector, WeekManager, ActivityManager } from '@/components/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ShieldAlert } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Plan = Tables<'plans'>;

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editingWeek, setEditingWeek] = useState<{ id: string; number: number } | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/auth?mode=login');
      return;
    }

    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (!hasAdminRole) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 pt-24 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
              <p className="text-muted-foreground">
                No tienes permisos de administrador para acceder a esta sección.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

        <div className="space-y-8">
          {/* Stats Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
            <AdminStats />
          </section>

          {/* Content Management Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Gestión de Contenido</h2>
            
            <div className="space-y-4">
              <div className="max-w-md">
                <label className="text-sm font-medium mb-2 block">Seleccionar Plan</label>
                <PlanSelector
                  selectedPlanId={selectedPlan?.id || null}
                  onSelect={(plan) => {
                    setSelectedPlan(plan);
                    setEditingWeek(null);
                  }}
                />
              </div>

              {selectedPlan && !editingWeek && (
                <WeekManager
                  plan={selectedPlan}
                  onEditWeek={(weekId, weekNumber) => setEditingWeek({ id: weekId, number: weekNumber })}
                />
              )}

              {selectedPlan && editingWeek && (
                <ActivityManager
                  weekId={editingWeek.id}
                  weekNumber={editingWeek.number}
                  planName={`${selectedPlan.distance}`}
                  onBack={() => setEditingWeek(null)}
                />
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
