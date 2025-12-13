import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ElectricBorder from "@/components/ui/ElectricBorder";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import logoImage from "@/assets/logo-caja-los-andes.png";
import { WeekActivityGrid, WeekNavigation, ActivityType, TipCard, ChangePlanDialog } from "@/components/dashboard";
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
  zone?: string | null;
  terrain?: string | null;
  training_type?: string | null;
  total_daily_km?: number | null;
  phase?: string | null;
  warmup_duration_min?: number | null;
  main_work_type?: string | null;
  main_work_distance_km?: number | null;
  main_work_duration_min?: number | null;
  repetitions?: number | null;
  rep_distance_meters?: number | null;
  rest_between_reps_min?: number | null;
  stretch_before_after?: boolean | null;
  notes?: string | null;
  media_url?: string | null;
}
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [currentWeekTips, setCurrentWeekTips] = useState<{
    tip_week: Tip | null;
    tip_month: Tip | null;
  }>({
    tip_week: null,
    tip_month: null
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch user profile
      const {
        data: profileData
      } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (profileData) {
        setProfile(profileData);

        // Fetch plan if user has one
        if (profileData.current_plan_id) {
          const {
            data: planData
          } = await supabase.from("plans").select("id, name, total_weeks").eq("id", profileData.current_plan_id).maybeSingle();
          if (planData) {
            setPlan(planData);
          }
        }
      }
      setIsLoading(false);
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
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
      const {
        data: weekData
      } = await supabase.from("weeks").select("id, week_number, tip_week, tip_month").eq("plan_id", plan.id).eq("week_number", currentWeekNumber).maybeSingle();
      if (!weekData) {
        setActivities([]);
        setCurrentWeekTips({
          tip_week: null,
          tip_month: null
        });
        return;
      }

      // Set tips for this week
      setCurrentWeekTips({
        tip_week: weekData.tip_week as Tip | null,
        tip_month: weekData.tip_month as Tip | null
      });

      // Get activities for this week with all fields
      const {
        data: activitiesData
      } = await supabase.from("activities").select("id, day_of_week, title, description, activity_type, distance_km, duration_min, intensity, zone, terrain, training_type, total_daily_km, phase, warmup_duration_min, main_work_type, main_work_distance_km, main_work_duration_min, repetitions, rep_distance_meters, rest_between_reps_min, stretch_before_after, notes, media_url").eq("week_id", weekData.id).order("day_of_week");
      if (activitiesData) {
        setActivities(activitiesData as Activity[]);
      }

      // Get completed activities for this user
      if (user) {
        const {
          data: logsData
        } = await supabase.from("activity_logs").select("activity_id").eq("user_id", user.id).eq("completed", true);
        if (logsData) {
          setCompletedActivityIds(logsData.map(log => log.activity_id));
        }
      }
    };
    fetchWeekActivities();
  }, [plan, currentWeekNumber, user]);

  // Fetch completed weeks
  useEffect(() => {
    const fetchCompletedWeeks = async () => {
      if (!plan || !user) return;

      // Get all weeks for this plan
      const {
        data: weeksData
      } = await supabase.from("weeks").select("id, week_number").eq("plan_id", plan.id);
      if (!weeksData) return;

      // Get all completed activity logs
      const {
        data: logsData
      } = await supabase.from("activity_logs").select("activity_id").eq("user_id", user.id).eq("completed", true);
      if (!logsData) return;
      const completedActivitySet = new Set(logsData.map(log => log.activity_id));

      // Check each week for completion
      const completedWeekNumbers: number[] = [];
      for (const week of weeksData) {
        const {
          data: weekActivities
        } = await supabase.from("activities").select("id, activity_type").eq("week_id", week.id);
        if (weekActivities) {
          const nonRestActivities = weekActivities.filter(a => a.activity_type !== 'rest');
          const allCompleted = nonRestActivities.length > 0 && nonRestActivities.every(a => completedActivitySet.has(a.id));
          if (allCompleted) {
            completedWeekNumbers.push(week.week_number);
          }
        }
      }
      setCompletedWeeks(completedWeekNumbers);
    };
    fetchCompletedWeeks();
  }, [plan, user, completedActivityIds]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const handleMarkComplete = async (activityId: string) => {
    if (!user) return;
    const {
      error
    } = await supabase.from("activity_logs").insert({
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
  const handleCompleteWeek = async () => {
    if (!user) return;

    // Get all non-rest activities that aren't completed
    const uncompletedActivities = activities.filter(a => a.activity_type !== 'rest' && !completedActivityIds.includes(a.id));
    if (uncompletedActivities.length === 0) {
      toast({
        title: "¡Semana ya completada!",
        description: "Todas las actividades ya están marcadas"
      });
      return;
    }

    // Mark all as completed
    const insertData = uncompletedActivities.map(activity => ({
      user_id: user.id,
      activity_id: activity.id,
      completed: true
    }));
    const {
      error
    } = await supabase.from("activity_logs").insert(insertData);
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la semana",
        variant: "destructive"
      });
      return;
    }
    setCompletedActivityIds(prev => [...prev, ...uncompletedActivities.map(a => a.id)]);
    toast({
      title: "🎉 ¡SEMANA COMPLETADA!",
      description: `${uncompletedActivities.length} actividades marcadas como completadas`
    });
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  const getDifficultyName = (difficulty: number | null) => {
    switch (difficulty) {
      case 1:
        return "Principiante";
      case 2:
        return "Intermedio";
      default:
        return "No seleccionado";
    }
  };
  const hasPlan = plan && plan.total_weeks > 0;
  return <div className="min-h-screen bg-background">
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

        {/* Profile Card - Collapsible */}
        <Collapsible className="mb-8">
          <ElectricBorder color="hsl(var(--primary))" speed={1.5} chaos={0.8} thickness={2} className="rounded-2xl">
          <div className="bg-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <CollapsibleTrigger className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-foreground font-sans">
                      Tu Plan
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary/10 text-primary text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-full">
                        {profile?.distance || "—"}
                      </span>
                      <span className="bg-muted text-muted-foreground text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full">
                        {getDifficultyName(profile?.difficulty)}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Maratón de Santiago 2026
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <div className="shrink-0">
                <ChangePlanDialog currentPlanId={profile?.current_plan_id || null} onPlanChanged={() => window.location.reload()} />
              </div>
            </div>

            <CollapsibleContent className="mt-4">
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
                    {profile?.start_date ? new Date(profile.start_date).toLocaleDateString("es-CL") : "No iniciado"}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </div>
          </ElectricBorder>
        </Collapsible>

        {/* Week View or Coming Soon */}
        {hasPlan ? <div className="space-y-6">
            {/* Week Navigation */}
            <WeekNavigation currentWeek={currentWeekNumber} totalWeeks={plan.total_weeks} completedWeeks={completedWeeks} onWeekChange={setCurrentWeekNumber} />

            {/* Week Activities */}
            <ElectricBorder color="hsl(var(--primary))" speed={1.5} chaos={0.8} thickness={2} className="rounded-2xl">
            <div className="bg-card rounded-2xl p-6 px-[7px]">
              {activities.length > 0 ? <WeekActivityGrid weekNumber={currentWeekNumber} activities={activities} completedActivityIds={completedActivityIds} onMarkComplete={handleMarkComplete} onCompleteWeek={handleCompleteWeek} /> : <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay actividades programadas para esta semana.
                  </p>
                </div>}
            </div>
            </ElectricBorder>

            {/* Tips Section - Below week activities */}
            {/* Tips Section - Below week activities */}
            {(currentWeekTips.tip_week || currentWeekTips.tip_month) && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TipCard tip={currentWeekTips.tip_week} type="week" weekNumber={currentWeekNumber} />
                <TipCard tip={currentWeekTips.tip_month} type="month" />
              </div>}
          </div> : <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              🚧 En construcción
            </h3>
            <p className="text-muted-foreground">
              Tu plan de entrenamiento personalizado estará disponible muy pronto.
              <br />
              ¡Prepárate para conquistar el Maratón de Santiago 2026!
            </p>
          </div>}
      </main>
    </div>;
}