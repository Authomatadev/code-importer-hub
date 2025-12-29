import { cn } from "@/lib/utils";
import { Check, Leaf, Flame, Zap } from "lucide-react";

interface DifficultySelectorProps {
  selected: number | null;
  onSelect: (difficulty: number) => void;
}

const difficulties = [
  {
    level: 1,
    name: "Principiante",
    icon: Leaf,
    description: "Ideal si estás comenzando o retomando el running",
    details: "3-4 días de entrenamiento por semana",
  },
  {
    level: 2,
    name: "Intermedio",
    icon: Flame,
    description: "Para quienes ya corren regularmente",
    details: "4-5 días de entrenamiento por semana",
  },
  {
    level: 3,
    name: "Avanzado",
    icon: Zap,
    description: "Para corredores experimentados con alta exigencia",
    details: "5-6 días de entrenamiento por semana",
  },
];

export function DifficultySelector({ selected, onSelect }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {difficulties.map((difficulty) => {
        const Icon = difficulty.icon;
        const isSelected = selected === difficulty.level;
        
        return (
          <button
            key={difficulty.level}
            onClick={() => onSelect(difficulty.level)}
            className={cn(
              "relative p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]",
              isSelected
                ? "bg-primary/10 border-2 border-primary ring-4 ring-primary/20"
                : "bg-card border-2 border-border hover:border-primary/50"
            )}
          >
            {isSelected && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                isSelected ? "bg-primary" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-8 h-8 transition-colors",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )} />
              </div>

              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      i < difficulty.level ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                {difficulty.name}
              </h3>

              <p className="text-sm text-muted-foreground mb-3">
                {difficulty.description}
              </p>

              <span className="text-xs font-medium text-primary">
                {difficulty.details}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
