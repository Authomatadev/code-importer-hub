# Checklist de Migración - Andes Run

## Pre-requisitos
- [ ] Cuenta de Lovable activa
- [ ] Acceso al proyecto original
- [ ] RESEND_API_KEY del cliente original (o nueva)

---

## Paso 1: Crear Proyecto Nuevo
- [ ] Ir a [lovable.dev](https://lovable.dev)
- [ ] Click en "Create new project"
- [ ] **NO usar Remix** - crear proyecto vacío
- [ ] Nombrar el proyecto (ej: "Cliente-Nuevo-Run")

## Paso 2: Activar Lovable Cloud
- [ ] Ir a **Settings > Cloud**
- [ ] Click en "Enable Lovable Cloud"
- [ ] Esperar confirmación (puede tomar 1-2 minutos)
- [ ] Verificar que aparezca la sección "Database"

## Paso 3: Ejecutar Migración SQL
- [ ] Ir a **Cloud > Database > SQL Editor**
- [ ] Copiar contenido completo de `docs/migration-script.sql`
- [ ] Pegar en el editor SQL
- [ ] Ejecutar el script
- [ ] Verificar que no haya errores

### Verificación post-migración:
- [ ] Tabla `plans` tiene 9 registros
- [ ] Tabla `achievements` tiene 20 registros
- [ ] Tabla `contests` tiene 1 registro
- [ ] Storage bucket `activity-media` existe

## Paso 4: Configurar Secrets
- [ ] Ir a **Settings > Secrets**
- [ ] Agregar `RESEND_API_KEY` con el valor del API key

## Paso 5: Copiar Código Fuente

### Opción A: Via GitHub (Recomendado)
1. En proyecto original:
   - [ ] Ir a **Settings > GitHub**
   - [ ] Conectar repositorio (o crear nuevo)
   - [ ] Push del código

2. En proyecto nuevo:
   - [ ] Ir a **Settings > GitHub**
   - [ ] Importar desde el mismo repositorio

### Opción B: Copiar Archivos Manualmente
Copiar estas carpetas/archivos:
- [ ] `src/` (todo el directorio)
- [ ] `supabase/functions/` (todas las Edge Functions)
- [ ] `supabase/config.toml`
- [ ] `public/` (excepto archivos de branding)
- [ ] `index.html`
- [ ] `tailwind.config.ts`
- [ ] `vite.config.ts`

## Paso 6: Actualizar Referencias

### En `supabase/config.toml`:
- [ ] Actualizar `project_id` con el ID del nuevo proyecto Lovable Cloud

### Archivos a modificar para rebranding:
- [ ] `src/assets/logo-caja-los-andes.png` → nuevo logo
- [ ] `src/assets/hero-marathon.jpg` → nueva imagen
- [ ] `index.html` → título y meta tags
- [ ] `src/pages/Index.tsx` → textos de landing
- [ ] `src/components/WaitingListForm.tsx` → textos
- [ ] `src/components/Navbar.tsx` → logo y links
- [ ] `src/components/Footer.tsx` → información de contacto

## Paso 7: Verificar Edge Functions
- [ ] `approve-user` desplegada
- [ ] `calculate-contest-rankings` desplegada
- [ ] `check-achievements` desplegada
- [ ] `preselect-top-participants` desplegada
- [ ] `send-weekly-notification` desplegada

## Paso 8: Crear Usuario Admin
1. [ ] Registrar cuenta normal en la app
2. [ ] Obtener el UUID del usuario desde Cloud > Database
3. [ ] Ejecutar en SQL Editor:
```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('UUID-DEL-USUARIO', 'admin');
```

## Paso 9: Pruebas Finales

### Landing Page:
- [ ] Countdown funciona
- [ ] Formulario de waiting list envía datos
- [ ] Logo y branding correcto

### Admin Panel (`/admin`):
- [ ] Login funciona
- [ ] Dashboard carga estadísticas
- [ ] Lista de espera visible
- [ ] Aprobar usuario funciona

### Dashboard Usuario:
- [ ] Plan asignado correctamente
- [ ] Semanas y actividades cargan
- [ ] Marcar actividad como completada
- [ ] Subir foto de entrenamiento
- [ ] Achievements funcionan

### Concurso:
- [ ] Leaderboard carga
- [ ] Entry card visible
- [ ] Rankings calculan correctamente

---

## Troubleshooting

### Error: "relation does not exist"
- El script SQL no se ejecutó completo
- Revisar errores en la consola SQL
- Ejecutar secciones faltantes individualmente

### Error: "permission denied"
- RLS no está correctamente configurado
- Verificar que las políticas se crearon

### Edge Functions no responden
- Verificar que el `project_id` en config.toml es correcto
- Re-desplegar las funciones

### Usuarios no pueden registrarse
- El trigger `on_auth_user_created` no existe
- Ejecutar la sección de triggers del script SQL

---

## Archivos NO copiar (específicos del proyecto original)
- `.env` (contiene URLs del proyecto anterior)
- `supabase/migrations/` (ya están consolidadas en el script)
- Cualquier archivo con datos de usuarios específicos
