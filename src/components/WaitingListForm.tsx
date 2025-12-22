import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateRut, formatRut, cleanRut } from "@/lib/rut-validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registrationSchema = z.object({
  rut: z.string()
    .min(1, "RUT es requerido")
    .refine((val) => validateRut(val), {
      message: "RUT inválido. Verifica el dígito verificador.",
    }),
  firstName: z.string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre muy largo"),
  lastName: z.string()
    .min(2, "Apellido debe tener al menos 2 caracteres")
    .max(100, "Apellido muy largo"),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muy largo"),
  selectedDistance: z.string().min(1, "Selecciona una distancia"),
  selectedDifficulty: z.string().min(1, "Selecciona un nivel"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const distances = [
  { value: "10k", label: "10K", description: "Ideal para comenzar" },
  { value: "21k", label: "21K Media Maratón", description: "El siguiente desafío" },
  { value: "42k", label: "42K Maratón", description: "El desafío máximo" },
];

const difficulties = [
  { value: "1", label: "Principiante", description: "Poca o ninguna experiencia corriendo" },
  { value: "2", label: "Intermedio", description: "Corro regularmente, busco mejorar" },
];

export function WaitingListForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      rut: "",
      firstName: "",
      lastName: "",
      email: "",
      selectedDistance: "",
      selectedDifficulty: "",
    },
  });

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value;
    const cleaned = cleanRut(value);
    
    // Only format if we have enough characters
    if (cleaned.length >= 2) {
      onChange(formatRut(value));
    } else {
      onChange(value.toUpperCase());
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    
    try {
      const cleanedRut = cleanRut(data.rut);
      
      const { error } = await supabase
        .from("waiting_list")
        .insert({
          rut: cleanedRut,
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          selected_distance: data.selectedDistance,
          selected_difficulty: parseInt(data.selectedDifficulty),
          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          if (error.message.includes("rut")) {
            toast({
              title: "RUT ya registrado",
              description: "Este RUT ya tiene una solicitud en proceso.",
              variant: "destructive",
            });
          } else if (error.message.includes("email")) {
            toast({
              title: "Email ya registrado",
              description: "Este email ya tiene una solicitud en proceso.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Ya estás registrado",
              description: "Ya tienes una solicitud en nuestra lista.",
              variant: "destructive",
            });
          }
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      form.reset();
      
      toast({
        title: "¡Solicitud enviada! 🎉",
        description: "Revisaremos tu solicitud y te contactaremos pronto.",
      });
    } catch (error) {
      console.error("Error al registrar:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl glass-card animate-scale-in">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary/30" />
          <CheckCircle className="w-16 h-16 text-secondary relative z-10" />
        </div>
        <h3 className="text-xl font-bold">¡Solicitud enviada!</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Revisaremos tu información y te enviaremos un correo con tus credenciales de acceso una vez aprobada tu solicitud.
        </p>
        <Button 
          variant="glass" 
          onClick={() => setIsSuccess(false)}
          className="mt-2"
        >
          Enviar otra solicitud
        </Button>
      </div>
    );
  }

  const canProceedToStep2 = form.watch("selectedDistance") && form.watch("selectedDifficulty");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto">
        {step === 1 ? (
          <div className="space-y-6 animate-fade-in p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                Paso 1
              </div>
              <h3 className="text-xl font-bold text-foreground">Elige tu plan</h3>
              <p className="text-sm text-muted-foreground mt-1">Selecciona la distancia y nivel que deseas entrenar</p>
            </div>
            
            {/* Distance Selection */}
            <FormField
              control={form.control}
              name="selectedDistance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distancia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14">
                        <SelectValue placeholder="Selecciona una distancia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {distances.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">{d.label}</span>
                            <span className="text-xs text-muted-foreground">{d.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Selection */}
            <FormField
              control={form.control}
              name="selectedDifficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de experiencia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14">
                        <SelectValue placeholder="Selecciona tu nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficulties.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-semibold">{d.label}</span>
                            <span className="text-xs text-muted-foreground">{d.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={!canProceedToStep2}
              onClick={() => setStep(2)}
            >
              Continuar
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Paso 2: Tus datos</h3>
              <p className="text-sm text-muted-foreground">Completa tu información para registrarte</p>
            </div>

            {/* Plan Summary */}
            <div className="p-4 bg-muted rounded-xl mb-4">
              <p className="text-sm text-muted-foreground">Plan seleccionado:</p>
              <p className="font-bold text-foreground">
                {distances.find(d => d.value === form.watch("selectedDistance"))?.label} - {" "}
                {difficulties.find(d => d.value === form.watch("selectedDifficulty"))?.label}
              </p>
            </div>

            {/* RUT Field */}
            <FormField
              control={form.control}
              name="rut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUT</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12.345.678-9"
                      {...field}
                      onChange={(e) => handleRutChange(e, field.onChange)}
                      className="h-12"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        {...field}
                        className="h-12"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        {...field}
                        className="h-12"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      {...field}
                      className="h-12"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Atrás
              </Button>
              <Button 
                type="submit" 
                variant="hero" 
                size="xl"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "SOLICITAR ACCESO"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Tu solicitud será revisada y recibirás un correo con tus credenciales de acceso.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
