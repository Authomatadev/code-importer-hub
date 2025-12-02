import { useState, useEffect, useRef } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MARATHON_DATE = new Date("2026-04-26T07:00:00-04:00"); // Santiago, Chile timezone

function FlipCard({ value, label }: { value: number; label: string }) {
  const [flip, setFlip] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setFlip(true);
      
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlip(false);
        prevValueRef.current = value;
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [value]);

  const formattedValue = String(displayValue).padStart(2, "0");
  const formattedNextValue = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28"
        style={{ perspective: "400px" }}
      >
        {/* Card container */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Top half (static - shows current value) */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-card overflow-hidden rounded-t-lg border-b border-background/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground translate-y-1/2">
                {formattedNextValue}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent" />
          </div>
          
          {/* Bottom half (static - shows current value) */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-card/95 overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground -translate-y-1/2">
                {formattedValue}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent" />
          </div>
          
          {/* Flip animation - top flap (flips down) */}
          <div 
            className="absolute inset-x-0 top-0 h-1/2 bg-card overflow-hidden rounded-t-lg border-b border-background/10 z-10"
            style={{ 
              transformOrigin: "bottom",
              transform: flip ? "rotateX(-90deg)" : "rotateX(0deg)",
              transition: "transform 0.3s ease-in-out",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground translate-y-1/2">
                {formattedValue}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent" />
          </div>
          
          {/* Flip animation - bottom flap (appears from top) */}
          <div 
            className="absolute inset-x-0 bottom-0 h-1/2 bg-card/95 overflow-hidden rounded-b-lg z-10"
            style={{ 
              transformOrigin: "top",
              transform: flip ? "rotateX(0deg)" : "rotateX(90deg)",
              transition: "transform 0.3s ease-in-out",
              transitionDelay: flip ? "0.15s" : "0s",
              backfaceVisibility: "hidden"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground -translate-y-1/2">
                {formattedNextValue}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent" />
          </div>
          
          {/* Center line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-background/40 z-20" />
          
          {/* Side notches */}
          <div className="absolute left-0 top-1/2 w-1.5 h-3 bg-background rounded-r-full -translate-y-1/2 z-20" />
          <div className="absolute right-0 top-1/2 w-1.5 h-3 bg-background rounded-l-full -translate-y-1/2 z-20" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-primary/15 rounded-xl blur-xl opacity-60 -z-10" />
        
        {/* Shadow */}
        <div className="absolute inset-x-2 -bottom-2 h-4 bg-background/50 blur-md rounded-full -z-10" />
      </div>
      
      <span className="mt-4 text-xs sm:text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  function calculateTimeLeft(): TimeLeft {
    const difference = +MARATHON_DATE - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
        {["Días", "Horas", "Min", "Seg"].map((label) => (
          <FlipCard key={label} value={0} label={label} />
        ))}
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Días" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      {units.map((unit) => (
        <FlipCard key={unit.label} value={unit.value} label={unit.label} />
      ))}
    </div>
  );
}
