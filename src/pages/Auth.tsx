import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import logoImage from "@/assets/logo-caja-los-andes.png";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login")) {
          toast({
            title: "Credenciales incorrectas",
            description: "Verifica tu correo y contraseña",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Correo no confirmado",
            description: "Revisa tu bandeja de entrada y confirma tu correo",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "¡Bienvenido!",
        description: "Iniciando tu entrenamiento...",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignUp = () => {
    // Redirect to landing page with waiting list form
    navigate("/");
    toast({
      title: "Solicita acceso",
      description: "Completa el formulario en la página principal para solicitar acceso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={logoImage} alt="Caja Los Andes" className="h-8" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="animate-fade-in max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2">
              BIENVENIDO DE VUELTA
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión para continuar tu entrenamiento
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              onSwitchToSignUp={handleSwitchToSignUp}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={handleSwitchToSignUp}>
                Solicita acceso aquí
              </Button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
