import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/auth/StepIndicator";
import { DistanceSelector } from "@/components/auth/DistanceSelector";
import { DifficultySelector } from "@/components/auth/DifficultySelector";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logoImage from "@/assets/logo-caja-los-andes.png";

type AuthMode = "signup" | "login";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>("signup");
  const [step, setStep] = useState(1);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(
    searchParams.get("distance") || null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
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

  const handleSignUp = async (data: { email: string; password: string }) => {
    if (!selectedDistance || !selectedDifficulty) {
      toast({
        title: "Error",
        description: "Selecciona distancia y dificultad primero",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast({
            title: "Usuario ya registrado",
            description: "Este correo ya está registrado. Intenta iniciar sesión.",
            variant: "destructive",
          });
        } else {
          throw signUpError;
        }
        return;
      }

      if (authData.user) {
        // 2. Find the corresponding plan
        const { data: plan, error: planError } = await supabase
          .from("plans")
          .select("id")
          .eq("distance", selectedDistance)
          .eq("difficulty", selectedDifficulty)
          .maybeSingle();

        if (planError) {
          console.error("Error finding plan:", planError);
        }

        // 3. Update user profile with selected plan
        // Note: The handle_new_user trigger already creates the profile
        // We need to wait a moment for the trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            distance: selectedDistance,
            difficulty: selectedDifficulty,
            current_plan_id: plan?.id || null,
            start_date: new Date().toISOString().split("T")[0],
          })
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("Error updating profile:", updateError);
        }

        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu correo para confirmar tu cuenta.",
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Error al crear cuenta",
        description: error.message || "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const canProceedToStep2 = selectedDistance !== null;
  const canProceedToStep3 = selectedDifficulty !== null;

  const stepLabels = ["Distancia", "Nivel", "Cuenta"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={logoImage} alt="Caja Los Andes" className="h-8" />
          </button>
          {mode === "login" && (
            <Button variant="ghost" onClick={() => setMode("signup")}>
              Registrarse
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {mode === "signup" ? (
          <>
            {/* Step Indicator */}
            <StepIndicator currentStep={step} totalSteps={3} labels={stepLabels} />

            {/* Step Content */}
            <div className="max-w-4xl mx-auto">
              {/* Step 1: Distance Selection */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2">
                      ELIGE TU DESAFÍO
                    </h1>
                    <p className="text-muted-foreground">
                      Selecciona la distancia que quieres conquistar
                    </p>
                  </div>

                  <DistanceSelector
                    selected={selectedDistance}
                    onSelect={setSelectedDistance}
                  />

                  <div className="mt-8 flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => setStep(2)}
                      disabled={!canProceedToStep2}
                      className="min-w-[200px]"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Difficulty Selection */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2">
                      ELIGE TU NIVEL
                    </h1>
                    <p className="text-muted-foreground">
                      Selecciona tu nivel de experiencia actual
                    </p>
                  </div>

                  <DifficultySelector
                    selected={selectedDifficulty}
                    onSelect={setSelectedDifficulty}
                  />

                  <div className="mt-8 flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => setStep(3)}
                      disabled={!canProceedToStep3}
                      className="min-w-[200px]"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Sign Up Form */}
              {step === 3 && (
                <div className="animate-fade-in max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2">
                      CREA TU CUENTA
                    </h1>
                    <p className="text-muted-foreground">
                      Un paso más para comenzar tu entrenamiento
                    </p>
                    
                    {/* Selected Plan Summary */}
                    <div className="mt-4 p-4 bg-muted rounded-xl">
                      <p className="text-sm text-muted-foreground">Plan seleccionado:</p>
                      <p className="font-bold text-foreground">
                        {selectedDistance} - Nivel {selectedDifficulty === 1 ? "Principiante" : selectedDifficulty === 2 ? "Intermedio" : "Avanzado"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <SignUpForm
                      onSubmit={handleSignUp}
                      isLoading={isLoading}
                      onSwitchToLogin={() => setMode("login")}
                    />
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Cambiar nivel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Login Mode */
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
                onSwitchToSignUp={() => {
                  setMode("signup");
                  setStep(1);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
