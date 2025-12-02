import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logoCajaLosAndes from "@/assets/logo-caja-los-andes.png";
export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 my-px">
          {/* Logos */}
          <div className="flex items-center gap-4">
            
            <div className="hidden sm:block h-8 w-px bg-border/50" />
            <img src={logoCajaLosAndes} alt="Caja Los Andes" className="h-12 hidden sm:block" />
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
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Admin
            </Link>
            <ThemeToggle />
            <Button variant="nike" size="lg">
              COMENZAR
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="/#features" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Características
              </a>
              <a href="/#plans" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Planes
              </a>
              <a href="/#countdown" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Countdown
              </a>
              <Link to="/admin" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <Settings className="w-4 h-4" />
                Admin
              </Link>
              <div className="px-4 pt-2">
                <Button variant="nike" className="w-full">
                  COMENZAR
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </nav>;
}