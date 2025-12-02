import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DistanceSelectorProps {
  selected: string | null;
  onSelect: (distance: string) => void;
}

const distances = [
  {
    id: "10K",
    title: "Tu Primera Meta",
    weeks: 8,
    description: "Ideal para comenzar tu aventura en el running competitivo",
  },
  {
    id: "21K",
    title: "El Gran Salto",
    weeks: 12,
    description: "Da el siguiente paso y conquista la media maratón",
    featured: true,
  },
  {
    id: "42K",
    title: "La Leyenda",
    weeks: 16,
    description: "El desafío máximo para corredores determinados",
  },
];

export function DistanceSelector({ selected, onSelect }: DistanceSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {distances.map((distance) => (
        <button
          key={distance.id}
          onClick={() => onSelect(distance.id)}
          className={cn(
            "relative p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]",
            selected === distance.id
              ? "bg-primary/10 border-2 border-primary ring-4 ring-primary/20"
              : "bg-card border-2 border-border hover:border-primary/50",
            distance.featured && !selected && "border-secondary"
          )}
        >
          {distance.featured && !selected && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                Popular
              </span>
            </div>
          )}
          
          {selected === distance.id && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          )}

          <div className="text-center mb-4">
            <span className="font-heading text-5xl md:text-6xl font-black tracking-tighter text-foreground">
              {distance.id}
            </span>
            <h3 className="font-heading text-lg font-bold mt-2 text-foreground">
              {distance.title}
            </h3>
          </div>

          <div className="text-center py-3 border-y border-border mb-4">
            <span className="text-3xl font-bold text-foreground">{distance.weeks}</span>
            <span className="text-sm ml-2 text-muted-foreground">semanas</span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {distance.description}
          </p>

          <div className="mt-4 text-center px-3 py-2 rounded-lg text-xs font-bold tracking-wide bg-secondary/20 text-secondary-foreground">
            ¡AFILIADO CAJA LOS ANDES: SIN COSTO!
          </div>
        </button>
      ))}
    </div>
  );
}
