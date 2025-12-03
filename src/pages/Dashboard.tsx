import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import logoImage from "@/assets/logo-caja-los-andes.png";
import { WeekView, WeekNavigation, ActivityType, TipCard } from "@/components/dashboard";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  distance: string | null;
  difficulty: number | null;
  start_date: string | null;
  current_plan_id: string | null;
}

interface Plan {
  id: string;
  name: string;
  total_weeks: number;
}

interface Tip {
  title?: string;
  content?: string;
  media_url?: string;
}

interface Week {
  id: string;
  week_number: number;
  plan_id: string;
  tip_week: Tip | null;
  tip_month: Tip | null;
}

interface Activity {
  id: string;
  day_of_week: number;
  title: string;
  description: string | null;
  activity_type: ActivityType;
  distance_km: number | null;
  duration_min: number | null;
  intensity: number | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [currentWeekTips, setCurrentWeekTips] = useState<{ tip_week: Tip | null; tip_month: Tip | null }>({ tip_week: null, tip_month: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);

        // Fetch plan if user has one
        if (profileData.current_plan_id) {
          const { data: planData } = await supabase
            .from("plans")
            .select("id, name, total_weeks")
            .eq("id", profileData.current_plan_id)
            .maybeSingle();

          if (planData) {
            setPlan(planData);
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch week activities when plan or week changes
  useEffect(() => {
    const fetchWeekActivities = async () => {
      if (!plan) return;

// Get the week for this plan and week number
      const { data: weekData } = await supabase
        .from("weeks")
        .select("id, week_number, tip_week, tip_month")
        .eq("plan_id", plan.id)
        .eq("week_number", currentWeekNumber)
        .maybeSingle();

      if (!weekData) {
        setActivities([]);
        setCurrentWeekTips({ tip_week: null, tip_month: null });
        return;
      }

      // Set tips for this week
      setCurrentWeekTips({
        tip_week: weekData.tip_week as Tip | null,
        tip_month: weekData.tip_month as Tip | null
      });

      // Get activities for this week
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("id, day_of_week, title, description, activity_type, distance_km, duration_min, intensity")
        .eq("week_id", weekData.id)
        .order("day_of_week");

      if (activitiesData) {
        setActivities(activitiesData as Activity[]);
      }

      // Get completed activities for this user
      if (user) {
        const { data: logsData } = await supabase
          .from("activity_logs")
          .select("activity_id")
          .eq("user_id", user.id)
          .eq("completed", true);

        if (logsData) {
          setCompletedActivityIds(logsData.map(log => log.activity_id));
        }
      }
    };

    fetchWeekActivities();
  }, [plan, currentWeekNumber, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleMarkComplete = async (activityId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("activity_logs")
      .insert({
        user_id: user.id,
        activity_id: activityId,
        completed: true
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la actividad como completada",
        variant: "destructive"
      });
      return;
    }

    setCompletedActivityIds(prev => [...prev, activityId]);
    toast({
      title: "¡Excelente! 💪",
      description: "Actividad completada"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getDifficultyName = (difficulty: number | null) => {
    switch (difficulty) {
      case 1: return "Principiante";
      case 2: return "Intermedio";
      default: return "No seleccionado";
    }
  };

  const hasPlan = plan && plan.total_weeks > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={logoImage} alt="Caja Los Andes" className="h-8" />
          </button>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2">
            ¡HOLA, ATLETA! 👋
          </h1>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Tu Plan de Entrenamiento
              </h2>
              <p className="text-muted-foreground text-sm">
                Maratón de Santiago 2026
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Distancia</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {profile?.distance || "No seleccionado"}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Nivel</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {getDifficultyName(profile?.difficulty)}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Fecha de inicio</p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {profile?.start_date 
                  ? new Date(profile.start_date).toLocaleDateString("es-CL")
                  : "No iniciado"}
              </p>
            </div>
          </div>
        </div>

        {/* Week View or Coming Soon */}
        {hasPlan ? (
          <div className="space-y-6">
            {/* Week Navigation */}
            <WeekNavigation
              currentWeek={currentWeekNumber}
              totalWeeks={plan.total_weeks}
              onWeekChange={setCurrentWeekNumber}
            />

{/* Tips Section */}
            {(currentWeekTips.tip_week || currentWeekTips.tip_month) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TipCard 
                  tip={currentWeekTips.tip_week} 
                  type="week" 
                  weekNumber={currentWeekNumber} 
                />
                <TipCard 
                  tip={currentWeekTips.tip_month} 
                  type="month" 
                />
              </div>
            )}

            {/* Week Activities */}
            <div className="bg-card border border-border rounded-2xl p-6">
              {activities.length > 0 ? (
                <WeekView
                  weekNumber={currentWeekNumber}
                  activities={activities}
                  completedActivityIds={completedActivityIds}
                  onMarkComplete={handleMarkComplete}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay actividades programadas para esta semana.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              🚧 En construcción
            </h3>
            <p className="text-muted-foreground">
              Tu plan de entrenamiento personalizado estará disponible muy pronto.
              <br />
              ¡Prepárate para conquistar el Maratón de Santiago 2026!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
