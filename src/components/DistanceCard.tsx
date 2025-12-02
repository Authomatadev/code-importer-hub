import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface DistanceCardProps {
  distance: string;
  title: string;
  weeks: number;
  description: string;
  featured?: boolean;
  delay?: number;
}

export function DistanceCard({ distance, title, weeks, description, featured = false, delay = 0 }: DistanceCardProps) {
  return (
    <div 
      className={cn(
        "relative p-6 md:p-8 rounded-2xl transition-all duration-500 hover-lift opacity-0 animate-fade-in",
        featured 
          ? "bg-primary text-primary-foreground glow-lg" 
          : "glass-card"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
            Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <span className={cn(
          "font-heading text-6xl md:text-7xl font-black tracking-tighter",
          featured ? "text-primary-foreground" : "text-gradient"
        )}>
          {distance}
        </span>
        <h3 className={cn(
          "font-heading text-xl font-bold mt-2",
          featured ? "text-primary-foreground" : "text-card-foreground"
        )}>
          {title}
        </h3>
      </div>
      
      <div className={cn(
        "text-center py-4 border-y mb-6",
        featured ? "border-primary-foreground/20" : "border-border/50"
      )}>
        <span className={cn(
          "text-4xl font-bold",
          featured ? "text-primary-foreground" : "text-card-foreground"
        )}>
          {weeks}
        </span>
        <span className={cn(
          "text-sm ml-2",
          featured ? "text-primary-foreground/80" : "text-card-foreground/70"
        )}>
          semanas
        </span>
      </div>
      
      <p className={cn(
        "text-center mb-6",
        featured ? "text-primary-foreground/80" : "text-card-foreground/70"
      )}>
        {description}
      </p>

      {/* Badge Caja Los Andes */}
      <div className={cn(
        "text-center mb-4 px-3 py-2 rounded-lg text-xs font-bold tracking-wide",
        featured ? "bg-secondary text-secondary-foreground" : "bg-secondary/90 text-secondary-foreground"
      )}>
        ¡AFILIADO CAJA LOS ANDES: SIN COSTO!
      </div>
      
      <Button 
        variant={featured ? "glass" : "nike"} 
        className="w-full group"
      >
        ELEGIR PLAN
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}