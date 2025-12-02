import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MARATHON_DATE = new Date("2026-04-26T07:00:00-04:00"); // Santiago, Chile timezone

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
      <div className="flex flex-wrap justify-center gap-3 md:gap-6">
        {["DÍAS", "HORAS", "MIN", "SEG"].map((label) => (
          <div key={label} className="countdown-unit">
            <span className="countdown-number text-gradient">--</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "DÍAS" },
    { value: timeLeft.hours, label: "HORAS" },
    { value: timeLeft.minutes, label: "MIN" },
    { value: timeLeft.seconds, label: "SEG" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-6">
      {units.map((unit, index) => (
        <div 
          key={unit.label} 
          className="countdown-unit opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className="countdown-number text-gradient">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
