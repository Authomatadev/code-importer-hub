import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
        "relative p-6 md:p-8 rounded-2xl opacity-0 animate-fade-in",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:-translate-y-2 hover:shadow-2xl",
        featured 
          ? "bg-card border-2 border-primary glow-lg hover:border-primary/80 hover:shadow-primary/20" 
          : "glass-card hover:border-primary/30 hover:shadow-primary/10"
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
          "text-foreground"
        )}>
          {distance}
        </span>
        <h3 className="font-heading text-xl font-bold mt-2 text-foreground">
          {title}
        </h3>
      </div>
      
      <div className={cn(
        "text-center py-4 border-y mb-6",
        featured ? "border-primary/30" : "border-border/50"
      )}>
        <span className="text-4xl font-bold text-foreground">
          {weeks}
        </span>
        <span className="text-sm ml-2 text-muted-foreground">
          semanas
        </span>
      </div>
      
      <p className="text-center mb-6 text-muted-foreground">
        {description}
      </p>

      {/* Badge Caja Los Andes */}
      <div className="text-center mb-4 px-3 py-2 rounded-lg text-xs font-bold tracking-wide bg-secondary text-secondary-foreground">
        ¡AFILIADO CAJA LOS ANDES: SIN COSTO!
      </div>
      
      <Link to={`/auth?distance=${distance}`} className="w-full">
        <Button 
          variant={featured ? "default" : "nike"} 
          className="w-full group"
        >
          ELEGIR PLAN
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}
