import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings, LogIn, Play, Trophy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logoCajaLosAndes from "@/assets/logo-caja-los-andes.png";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - siempre visible */}
          <div className="flex items-center gap-2 sm:gap-4">
            <img 
              src={logoCajaLosAndes} 
              alt="Caja Los Andes" 
              className="h-8 sm:h-12" 
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Características
            </a>
            <a href="/#plans" className="text-muted-foreground hover:text-foreground transition-colors">
              Planes
            </a>
            <a href="/#countdown" className="text-muted-foreground hover:text-foreground transition-colors">
              Countdown
            </a>
            <Link to="/results" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Resultados
            </Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Admin
            </Link>
            <ThemeToggle />
            <Link to="/auth?mode=login">
              <Button variant="outline" size="lg" className="gap-2">
                <LogIn className="w-4 h-4" />
                INGRESAR
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="nike" size="lg">
                COMENZAR
              </Button>
            </Link>
          </div>

          {/* Mobile - Botones siempre visibles + Menú */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="nike" size="sm" className="px-3 gap-1">
                <Play className="h-4 w-4" />
                IR
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Solo navegación */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a 
                href="/#features" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </a>
              <a 
                href="/#plans" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Planes
              </a>
              <a 
                href="/#countdown" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                Countdown
              </a>
              <Link 
                to="/results" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2" 
                onClick={() => setIsMenuOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                Resultados
              </Link>
              <Link 
                to="/admin" 
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2" 
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}