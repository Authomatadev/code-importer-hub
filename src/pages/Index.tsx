import { Navbar } from "@/components/Navbar";
import { Countdown } from "@/components/Countdown";
import { WaitingListForm } from "@/components/WaitingListForm";
import { FeatureCard } from "@/components/FeatureCard";
import { DistanceCard } from "@/components/DistanceCard";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-marathon.jpg";
import { CalendarDays, TrendingUp, Video, Bell, Trophy, Users, ChevronDown } from "lucide-react";
import { useEffect } from "react";
const features = [{
  icon: CalendarDays,
  title: "Plan Personalizado",
  description: "Tu plan, tu ritmo. Entrenamientos 100% adaptados a tu nivel y tiempo disponible."
}, {
  icon: TrendingUp,
  title: "Progreso Visible",
  description: "Sigue tu avance. Monitorea tu evolución y celebra cada kilómetro recorrido."
}, {
  icon: Video,
  title: "Contenido Exclusivo",
  description: "Entrena como un pro. Videos y guías de expertos para mejorar tu técnica y evitar lesiones."
}, {
  icon: Bell,
  title: "Recordatorios Inteligentes",
  description: "Notificaciones que te mantienen motivado y en track con tu plan de entrenamiento."
}, {
  icon: Trophy,
  title: "Desafíos Semanales",
  description: "Completa desafíos, gana medallas virtuales y comparte tus logros con la comunidad."
}, {
  icon: Users,
  title: "Comunidad de Corredores",
  description: "Únete a miles de runners preparándose para cruzar juntos la línea de meta."
}];
const plans = [{
  distance: "10K",
  title: "Tu Primera Meta",
  weeks: 8,
  description: "Ideal para iniciar en el running competitivo."
}, {
  distance: "21K",
  title: "El Gran Salto",
  weeks: 12,
  description: "Prepárate para conquistar tu primera o mejor media maratón.",
  featured: true
}, {
  distance: "42K",
  title: "La Leyenda",
  weeks: 16,
  description: "El entrenamiento integral para el desafío máximo."
}];
const Index = () => {
  // Set dark mode by default on first load
  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="Corredores de maratón al amanecer con montañas de fondo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
        </div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] animate-float" style={{
          animationDelay: "3s"
        }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8 opacity-0 animate-fade-in py-[10px] my-[10px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">26 de Abril, 2026 • Santiago, Chile</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 opacity-0 animate-fade-in" style={{
            animationDelay: "0.1s"
          }}>
              TU META
              <br />
              <span className="text-gradient">TE ESPERA.</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 opacity-0 animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              Prepárate para el Maratón de Santiago 2026 con el plan de entrenamiento que te llevará a la meta.
            </p>
            
            {/* Destacado Caja Los Andes */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground backdrop-blur-sm mb-4 opacity-0 animate-fade-in" style={{
            animationDelay: "0.25s"
          }}>
              <span className="text-sm font-bold">Afiliados Caja Los Andes: ¡Entrenamiento SIN COSTO!</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-8 opacity-0 animate-fade-in" style={{
            animationDelay: "0.3s"
          }}>
              <span className="text-foreground font-medium italic">Keep pushing. You're built for this.</span>
            </p>
            
            {/* Countdown */}
            <div id="countdown" className="mb-12">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6 opacity-0 animate-fade-in" style={{
              animationDelay: "0.35s"
            }}>
                Faltan para la carrera
              </p>
              <Countdown />
            </div>
            
            {/* Waiting List Form */}
            <div className="opacity-0 animate-fade-in" style={{
            animationDelay: "0.4s"
          }}>
              <WaitingListForm />
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{
        animationDelay: "0.6s"
      }}>
          <a href="#features" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-xs uppercase tracking-widest">Descubre más</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </div>
      </section>

      {/* Alliance Banner Section */}
      <section className="py-12 bg-secondary/10 border-y border-secondary/20 my-[20px]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl font-black mb-4">
              ENTRENA SIN COSTO CON <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">CAJA LOS ANDES.</span>
            </h3>
            <p className="text-muted-foreground">
              Si eres afiliado a Caja Los Andes, tu plan de entrenamiento para el Maratón de Santiago 2026 es completamente SIN COSTO. Solo regístrate y desbloquea tus rutinas semana a semana.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Características</span>
            <h2 className="font-heading text-3xl lg:text-5xl font-black mt-4 mb-4 md:text-5xl">
              TU CAMINO AL ÉXITO.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas en una sola plataforma para cruzar la meta.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} delay={index * 0.1} />)}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Planes de Entrenamiento</span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black mt-4 mb-4">
              ELIGE TU DESAFÍO.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Planes diseñados por expertos para cada nivel, desde 10K hasta el Maratón completo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => <DistanceCard key={plan.distance} distance={plan.distance} title={plan.title} weeks={plan.weeks} description={plan.description} featured={plan.featured} delay={index * 0.15} />)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              LA LEYENDA <span className="text-gradient">TE ESPERA.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Más de 2,000 corredores ya están entrenando. Únete a la comunidad y transforma tu potencial hoy.
            </p>
            <WaitingListForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;