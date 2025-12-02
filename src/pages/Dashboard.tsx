import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import logoImage from "@/assets/logo-caja-los-andes.png";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  distance: string | null;
  difficulty: number | null;
  start_date: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
      case 3: return "Avanzado";
      default: return "No seleccionado";
    }
  };

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

        {/* Coming Soon */}
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
      </main>
    </div>
  );
}
