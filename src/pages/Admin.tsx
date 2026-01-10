import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminStats, PlanSelector, WeekManager, ActivityManager, PlanImporter, ResultsImporter, ContestCommitteeManager } from '@/components/admin';
import { WaitingListManager } from '@/components/admin/WaitingListManager';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Upload, 
  Trophy,
  Medal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Plan = Tables<'plans'>;

interface AdminSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const sections: AdminSection[] = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard, description: 'Estadísticas generales' },
  { id: 'users', label: 'Usuarios', icon: Users, description: 'Aprobación de solicitudes' },
  { id: 'content', label: 'Contenido', icon: BookOpen, description: 'Planes y actividades' },
  { id: 'import', label: 'Importación', icon: Upload, description: 'Carga masiva de datos' },
  { id: 'results', label: 'Resultados', icon: Medal, description: 'Tiempos de maratón' },
  { id: 'contest', label: 'Concurso', icon: Trophy, description: 'Comité de selección' },
];

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
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

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminStats />;
      case 'users':
        return <WaitingListManager />;
      case 'content':
        return (
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
        );
      case 'import':
        return <PlanImporter />;
      case 'results':
        return <ResultsImporter />;
      case 'contest':
        return <ContestCommitteeManager />;
      default:
        return null;
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card hidden md:block shrink-0">
          <div className="p-4 border-b">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Admin Panel
            </h1>
          </div>
          <nav className="p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{section.label}</p>
                    <p className={cn(
                      "text-xs truncate",
                      isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isActive && "rotate-90"
                  )} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-bottom">
          <nav className="flex justify-around p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[4rem]",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-24 md:pb-8">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{currentSection?.label}</h2>
              <p className="text-muted-foreground">{currentSection?.description}</p>
            </div>
            
            <Card>
              <CardContent className="p-4 md:p-6">
                {renderSection()}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
