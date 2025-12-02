import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Bell, 
  BarChart3, 
  Plus, 
  Search, 
  Users, 
  Calendar,
  Activity,
  Mail,
  TrendingUp,
  Eye
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              Panel de <span className="text-gradient">Administración</span>
            </h1>
            <p className="text-muted-foreground">
              Gestiona contenidos, notificaciones y visualiza analytics
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid gap-1 bg-card border border-border p-1 rounded-xl">
              <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Contenidos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Content Management Tab */}
            <TabsContent value="content" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Planes</p>
                        <p className="text-2xl font-bold">9</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Semanas</p>
                        <p className="text-2xl font-bold">144</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Actividades</p>
                        <p className="text-2xl font-bold">1,008</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tips</p>
                        <p className="text-2xl font-bold">48</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content Management Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass-card hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Gestión de Planes
                    </CardTitle>
                    <CardDescription>
                      Administra los planes de entrenamiento (42K, 21K, 10K)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">42K</Badge>
                      <Badge variant="secondary">21K</Badge>
                      <Badge variant="secondary">10K</Badge>
                    </div>
                    <Button variant="nike" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Gestionar Planes
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Gestión de Semanas
                    </CardTitle>
                    <CardDescription>
                      Configura las semanas y tips de cada plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      16 semanas por plan • 3 niveles de dificultad
                    </div>
                    <Button variant="nike" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Gestionar Semanas
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Gestión de Actividades
                    </CardTitle>
                    <CardDescription>
                      Edita las actividades diarias con contenido multimedia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Video • Imágenes • PDF • Markdown
                    </div>
                    <Button variant="nike" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Gestionar Actividades
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Import Results */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Importar Resultados del Maratón
                  </CardTitle>
                  <CardDescription>
                    Carga masiva de resultados desde archivo CSV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input type="file" accept=".csv" className="flex-1" />
                    <Button variant="nikeOutline">
                      Importar CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              {/* Notification Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Enviados hoy</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Mail className="w-5 h-5 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pendientes</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <Bell className="w-5 h-5 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tasa apertura</p>
                        <p className="text-2xl font-bold">68%</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Usuarios inactivos</p>
                        <p className="text-2xl font-bold">89</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notification Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" />
                      Recordatorios Automáticos
                    </CardTitle>
                    <CardDescription>
                      Configura emails para usuarios con semanas pendientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Usuarios inactivos +7 días</span>
                      <Badge>89 usuarios</Badge>
                    </div>
                    <Button variant="nike" className="w-full">
                      Enviar Recordatorios
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Notificaciones Push
                    </CardTitle>
                    <CardDescription>
                      Envía notificaciones in-app a todos los usuarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Título de la notificación" />
                    <Input placeholder="Mensaje" />
                    <Button variant="nikeOutline" className="w-full">
                      Enviar Notificación
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Notifications Log */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Historial de Notificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "email", message: "Recordatorio semana 4", sent: "Hace 2 horas", count: 45 },
                      { type: "push", message: "¡Nueva semana disponible!", sent: "Hace 1 día", count: 2034 },
                      { type: "email", message: "Bienvenida a nuevos usuarios", sent: "Hace 2 días", count: 89 },
                    ].map((notif, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {notif.type === "email" ? (
                            <Mail className="w-4 h-4 text-primary" />
                          ) : (
                            <Bell className="w-4 h-4 text-secondary" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{notif.message}</p>
                            <p className="text-xs text-muted-foreground">{notif.sent}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{notif.count} enviados</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Usuarios</p>
                        <p className="text-2xl font-bold">2,847</p>
                        <p className="text-xs text-secondary">+12% este mes</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                        <p className="text-2xl font-bold">1,923</p>
                        <p className="text-xs text-secondary">67% del total</p>
                      </div>
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Activity className="w-5 h-5 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Semanas Completadas</p>
                        <p className="text-2xl font-bold">8,456</p>
                        <p className="text-xs text-muted-foreground">Promedio: 4.4/usuario</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Lista de Espera</p>
                        <p className="text-2xl font-bold">4,521</p>
                        <p className="text-xs text-secondary">+234 esta semana</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Placeholder */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Distribución por Distancia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>42K - Maratón</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>21K - Media Maratón</span>
                          <span className="font-medium">35%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/70 rounded-full" style={{ width: "35%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>10K</span>
                          <span className="font-medium">20%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/50 rounded-full" style={{ width: "20%" }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Progreso General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Semana 1-4</span>
                          <span className="font-medium">892 usuarios</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: "85%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Semana 5-8</span>
                          <span className="font-medium">645 usuarios</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary/70 rounded-full" style={{ width: "62%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Semana 9-12</span>
                          <span className="font-medium">386 usuarios</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary/50 rounded-full" style={{ width: "37%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Semana 13-16</span>
                          <span className="font-medium">124 usuarios</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-secondary/30 rounded-full" style={{ width: "12%" }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Options */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Exportar Datos</CardTitle>
                  <CardDescription>Descarga reportes detallados de analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="nikeOutline">
                      Exportar Usuarios (CSV)
                    </Button>
                    <Button variant="nikeOutline">
                      Exportar Progreso (CSV)
                    </Button>
                    <Button variant="nikeOutline">
                      Reporte Completo (PDF)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
