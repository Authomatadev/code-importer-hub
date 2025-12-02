import { Instagram, Twitter, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">M</span>
              </div>
              <span className="font-bold text-lg">
                MARATÓN<span className="text-primary">SANTIAGO</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6">
              Prepárate para el Maratón de Santiago 2026 con planes de entrenamiento personalizados diseñados para llevarte a la línea de meta.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Planes</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">42K - Maratón</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">21K - Media Maratón</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">10K - Carrera</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hola@maratonsantiago.cl" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  hola@maratonsantiago.cl
                </a>
              </li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Maratón Santiago. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con ❤️ en Santiago, Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
