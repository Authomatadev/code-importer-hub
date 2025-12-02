import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export function WaitingListForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - will be replaced with Supabase
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    setEmail("");
    
    toast({
      title: "¡Estás en la lista! 🎉",
      description: "Te notificaremos cuando el entrenamiento esté disponible.",
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl glass-card animate-scale-in">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary/30" />
          <CheckCircle className="w-16 h-16 text-secondary relative z-10" />
        </div>
        <h3 className="text-xl font-bold">¡Estás en la lista!</h3>
        <p className="text-muted-foreground text-center">
          Te enviaremos un email cuando el programa de entrenamiento esté listo.
        </p>
        <Button 
          variant="glass" 
          onClick={() => setIsSuccess(false)}
          className="mt-2"
        >
          Agregar otro email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 h-14 rounded-xl bg-card border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          variant="hero" 
          size="xl"
          disabled={isLoading}
          className="min-w-[160px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "UNIRME"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-4">
        Únete a más de 2,000 corredores preparándose para el maratón
      </p>
    </form>
  );
}
