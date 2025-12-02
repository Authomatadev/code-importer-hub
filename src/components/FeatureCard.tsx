import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, className, delay = 0 }: FeatureCardProps) {
  return (
    <div 
      className={cn(
        "group relative p-6 md:p-8 rounded-2xl glass-card hover-lift cursor-pointer opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-nike" />
      </div>
      
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-gradient transition-all duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
