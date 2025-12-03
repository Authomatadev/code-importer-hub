import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2, Upload, X, Link as LinkIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Tables } from '@/integrations/supabase/types';

type Activity = Tables<'activities'>;

const activitySchema = z.object({
  activity_type: z.enum(['run', 'walk', 'strength', 'rest', 'stretch', 'cross_training']),
  title: z.string().min(1, 'El título es requerido').max(100),
  description: z.string().max(1000).optional(),
  distance_km: z.coerce.number().min(0).max(100).optional().nullable(),
  duration_min: z.coerce.number().min(0).max(480).optional().nullable(),
  intensity: z.number().min(1).max(5).optional().nullable(),
  media_url: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof activitySchema>;

const activityTypes = [
  { value: 'run', label: '🏃 Correr', icon: '🏃' },
  { value: 'walk', label: '🚶 Caminar', icon: '🚶' },
  { value: 'strength', label: '💪 Fuerza', icon: '💪' },
  { value: 'rest', label: '😴 Descanso', icon: '😴' },
  { value: 'stretch', label: '🧘 Estiramiento', icon: '🧘' },
  { value: 'cross_training', label: '🚴 Cross Training', icon: '🚴' },
];

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  weekId: string;
  dayOfWeek: number;
  activity?: Activity | null;
  onSaved: () => void;
}

export function ActivityForm({ open, onClose, weekId, dayOfWeek, activity, onSaved }: ActivityFormProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaMode, setMediaMode] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!activity;

  const form = useForm<FormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: activity?.activity_type || 'run',
      title: activity?.title || '',
      description: activity?.description || '',
      distance_km: activity?.distance_km ? Number(activity.distance_km) : undefined,
      duration_min: activity?.duration_min || undefined,
      intensity: activity?.intensity || 3,
      media_url: activity?.media_url || '',
    },
  });

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const payload = {
        week_id: weekId,
        day_of_week: dayOfWeek,
        activity_type: data.activity_type,
        title: data.title,
        description: data.description || null,
        distance_km: data.distance_km || null,
        duration_min: data.duration_min || null,
        intensity: data.intensity || null,
        media_url: data.media_url || null,
      };

      if (isEditing && activity) {
        const { error } = await supabase
          .from('activities')
          .update(payload)
          .eq('id', activity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('activities').insert(payload);
        if (error) throw error;
      }

      toast({
        title: 'Éxito',
        description: isEditing ? 'Actividad actualizada.' : 'Actividad creada.',
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la actividad.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!activity) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('activities').delete().eq('id', activity.id);
      if (error) throw error;

      toast({
        title: 'Eliminado',
        description: 'Actividad eliminada.',
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la actividad.',
        variant: 'destructive',
      });
    }
    setDeleting(false);
  }

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar' : 'Nueva'} Actividad - {dayNames[dayOfWeek] || `Día ${dayOfWeek + 1}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Actividad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Carrera suave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instrucciones detalladas..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distance_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distancia (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ej: 3.5"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 30"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="intensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intensidad: {field.value}/5</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value || 3]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media Section */}
            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>🎬</span>
                  <span>Contenido Multimedia (opcional)</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={mediaMode === 'url' ? 'default' : 'outline'}
                    onClick={() => setMediaMode('url')}
                    className="h-7 text-xs"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={mediaMode === 'upload' ? 'default' : 'outline'}
                    onClick={() => setMediaMode('upload')}
                    className="h-7 text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Subir
                  </Button>
                </div>
              </div>

              {mediaMode === 'url' ? (
                <FormField
                  control={form.control}
                  name="media_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        URL de video o imagen
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://youtube.com/watch?v=..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setUploading(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${crypto.randomUUID()}.${fileExt}`;
                        const filePath = `activities/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                          .from('activity-media')
                          .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                          .from('activity-media')
                          .getPublicUrl(filePath);

                        form.setValue('media_url', publicUrl);
                        toast({ title: 'Archivo subido correctamente' });
                      } catch (error) {
                        console.error(error);
                        toast({
                          title: 'Error al subir archivo',
                          variant: 'destructive',
                        });
                      }
                      setUploading(false);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Formatos: JPG, PNG, GIF, MP4, WebM
                  </p>
                </div>
              )}

              {form.watch('media_url') && (
                <div className="mt-2 p-2 bg-background rounded border relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => form.setValue('media_url', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
                  {form.watch('media_url')?.includes('youtube.com') || form.watch('media_url')?.includes('youtu.be') ? (
                    <div className="text-xs text-primary truncate">
                      🎥 Video de YouTube: {form.watch('media_url')}
                    </div>
                  ) : form.watch('media_url')?.includes('vimeo.com') ? (
                    <div className="text-xs text-primary truncate">
                      🎥 Video de Vimeo: {form.watch('media_url')}
                    </div>
                  ) : form.watch('media_url')?.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video 
                      src={form.watch('media_url') || ''} 
                      className="max-h-24 rounded"
                      controls
                    />
                  ) : (
                    <img 
                      src={form.watch('media_url') || ''} 
                      alt="Preview" 
                      className="max-h-24 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
