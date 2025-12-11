import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPortal } from 'react-dom';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2, Trash2, Upload, X, Link as LinkIcon, Info, Watch } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import {
  PHASES,
  TRAINING_TYPES,
  ZONES,
  TERRAINS,
  REP_DISTANCES,
  MAIN_WORK_TYPES,
  GARMIN_INSTRUCTIONS,
  WARMUP_INFO,
  STRETCH_REMINDER,
} from '@/lib/activity-constants';

type Activity = Tables<'activities'>;

const activitySchema = z.object({
  activity_type: z.enum(['run', 'walk', 'strength', 'rest', 'stretch', 'cross_training']),
  title: z.string().min(1, 'El título es requerido').max(100),
  description: z.string().max(2000).optional(),
  distance_km: z.coerce.number().min(0).max(100).optional().nullable(),
  duration_min: z.coerce.number().min(0).max(480).optional().nullable(),
  intensity: z.number().min(1).max(5).optional().nullable(),
  media_url: z.string().url().optional().or(z.literal('')),
  phase: z.string().optional().nullable(),
  training_type: z.string().optional().nullable(),
  warmup_duration_min: z.coerce.number().min(0).max(60).optional().nullable(),
  main_work_type: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  terrain: z.string().optional().nullable(),
  main_work_distance_km: z.coerce.number().min(0).max(100).optional().nullable(),
  main_work_duration_min: z.coerce.number().min(0).max(480).optional().nullable(),
  repetitions: z.coerce.number().min(0).max(50).optional().nullable(),
  rep_distance_meters: z.coerce.number().optional().nullable(),
  rest_between_reps_min: z.coerce.number().min(0).max(30).optional().nullable(),
  stretch_before_after: z.boolean().optional().nullable(),
  total_daily_km: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
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
      phase: activity?.phase || undefined,
      training_type: activity?.training_type || undefined,
      warmup_duration_min: activity?.warmup_duration_min || undefined,
      main_work_type: activity?.main_work_type || undefined,
      zone: activity?.zone || undefined,
      terrain: activity?.terrain || undefined,
      main_work_distance_km: activity?.main_work_distance_km ? Number(activity.main_work_distance_km) : undefined,
      main_work_duration_min: activity?.main_work_duration_min || undefined,
      repetitions: activity?.repetitions || undefined,
      rep_distance_meters: activity?.rep_distance_meters || undefined,
      rest_between_reps_min: activity?.rest_between_reps_min || undefined,
      stretch_before_after: activity?.stretch_before_after ?? true,
      total_daily_km: activity?.total_daily_km ? Number(activity.total_daily_km) : undefined,
      notes: activity?.notes || undefined,
    },
  });

  // Reset form when activity changes
  useEffect(() => {
    if (open) {
      form.reset({
        activity_type: activity?.activity_type || 'run',
        title: activity?.title || '',
        description: activity?.description || '',
        distance_km: activity?.distance_km ? Number(activity.distance_km) : undefined,
        duration_min: activity?.duration_min || undefined,
        intensity: activity?.intensity || 3,
        media_url: activity?.media_url || '',
        phase: activity?.phase || undefined,
        training_type: activity?.training_type || undefined,
        warmup_duration_min: activity?.warmup_duration_min || undefined,
        main_work_type: activity?.main_work_type || undefined,
        zone: activity?.zone || undefined,
        terrain: activity?.terrain || undefined,
        main_work_distance_km: activity?.main_work_distance_km ? Number(activity.main_work_distance_km) : undefined,
        main_work_duration_min: activity?.main_work_duration_min || undefined,
        repetitions: activity?.repetitions || undefined,
        rep_distance_meters: activity?.rep_distance_meters || undefined,
        rest_between_reps_min: activity?.rest_between_reps_min || undefined,
        stretch_before_after: activity?.stretch_before_after ?? true,
        total_daily_km: activity?.total_daily_km ? Number(activity.total_daily_km) : undefined,
        notes: activity?.notes || undefined,
      });
    }
  }, [open, activity, form]);

  const trainingType = form.watch('training_type');
  const isIntervalTraining = trainingType === 'intervalo';

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
        phase: data.phase || null,
        training_type: data.training_type || null,
        warmup_duration_min: data.warmup_duration_min || null,
        main_work_type: data.main_work_type || null,
        zone: data.zone || null,
        terrain: data.terrain || null,
        main_work_distance_km: data.main_work_distance_km || null,
        main_work_duration_min: data.main_work_duration_min || null,
        repetitions: data.repetitions || null,
        rep_distance_meters: data.rep_distance_meters || null,
        rest_between_reps_min: data.rest_between_reps_min || null,
        stretch_before_after: data.stretch_before_after ?? true,
        total_daily_km: data.total_daily_km || null,
        notes: data.notes || null,
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

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `activities/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('activity-media')
        .getPublicUrl(fileName);

      form.setValue('media_url', urlData.publicUrl);
      toast({ title: 'Archivo subido correctamente' });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error al subir archivo',
        variant: 'destructive',
      });
    }
    setUploading(false);
  }

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const mediaUrl = form.watch('media_url');

  // Don't render if not open
  if (!open) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-background border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar' : 'Nueva'} Actividad - {dayNames[dayOfWeek] || `Día ${dayOfWeek + 1}`}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 overflow-y-auto flex-1 py-4">
              <Accordion type="multiple" defaultValue={['identification', 'warmup', 'main-work', 'intervals', 'summary']} className="space-y-2">
                
                {/* 1. IDENTIFICACIÓN */}
                <AccordionItem value="identification" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📋</span>
                      <span className="font-semibold">Identificación</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="phase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fase</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar fase..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {PHASES.map((phase) => (
                                  <SelectItem key={phase.value} value={phase.value}>
                                    {phase.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="training_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Entrenamiento</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {TRAINING_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="activity_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {activityTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Trote Largo Z2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* 2. CALENTAMIENTO */}
                <AccordionItem value="warmup" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <span className="font-semibold">Calentamiento</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="warmup_duration_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duración del Calentamiento (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 10"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        {WARMUP_INFO}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 3. TRABAJO PRINCIPAL */}
                <AccordionItem value="main-work" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💪</span>
                      <span className="font-semibold">Trabajo Principal</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="main_work_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Trabajo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {MAIN_WORK_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zona Cardíaca</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar zona..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {ZONES.map((zone) => (
                                  <SelectItem key={zone.value} value={zone.value}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: zone.color }}
                                      />
                                      {zone.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="terrain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Terreno</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {TERRAINS.map((terrain) => (
                                  <SelectItem key={terrain.value} value={terrain.value}>
                                    {terrain.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="main_work_distance_km"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distancia (km)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Ej: 8"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="main_work_duration_min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración (min)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 45"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 4. INTERVALOS (Condicional) */}
                {isIntervalTraining && (
                  <AccordionItem value="intervals" className="border rounded-lg px-4 border-primary/50">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="font-semibold">Intervalos</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="repetitions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Repeticiones</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ej: 6"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rep_distance_meters"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distancia por Rep (m)</FormLabel>
                              <Select 
                                onValueChange={(v) => field.onChange(Number(v))} 
                                value={field.value?.toString() || ''}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                  </SelectTrigger>
                                </FormControl>
                              <SelectContent className="z-[10000]">
                                  {REP_DISTANCES.map((dist) => (
                                    <SelectItem key={dist} value={dist.toString()}>
                                      {dist}m
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rest_between_reps_min"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descanso entre Reps (min)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.5"
                                  placeholder="Ej: 2"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="stretch_before_after"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value ?? true}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Elongación antes y después
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {STRETCH_REMINDER}
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 5. RESUMEN DEL DÍA */}
                <AccordionItem value="summary" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      <span className="font-semibold">Resumen del Día</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="total_daily_km"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distancia Total del Día (km)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Ej: 10"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration_min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración Total (min)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 60"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="intensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensidad General: {field.value || 3}/5</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value || 3]}
                              onValueChange={(v) => field.onChange(v[0])}
                              className="py-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* 6. OBSERVACIONES */}
                <AccordionItem value="notes" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      <span className="font-semibold">Observaciones</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción (Markdown)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Instrucciones detalladas..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas para el corredor..."
                              className="min-h-[80px]"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* 7. INSTRUCCIONES GARMIN */}
                <AccordionItem value="garmin" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Watch className="h-5 w-5" />
                      <span className="font-semibold">Instrucciones Garmin</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {GARMIN_INSTRUCTIONS}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 8. MULTIMEDIA */}
                <AccordionItem value="media" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎬</span>
                      <span className="font-semibold">Multimedia</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="flex gap-2 mb-4">
                      <Button
                        type="button"
                        variant={mediaMode === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMediaMode('url')}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={mediaMode === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMediaMode('upload')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir
                      </Button>
                    </div>

                    {mediaMode === 'url' ? (
                      <FormField
                        control={form.control}
                        name="media_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL del Media</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="https://youtube.com/... o URL de imagen"
                                  {...field}
                                />
                              </FormControl>
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => form.setValue('media_url', '')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="space-y-2">
                        <FormLabel>Subir Archivo</FormLabel>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Seleccionar archivo
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Preview */}
                    {mediaUrl && (
                      <div className="mt-4 rounded-lg overflow-hidden border">
                        {mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? (
                          <iframe
                            src={mediaUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="w-full aspect-video"
                            allowFullScreen
                          />
                        ) : mediaUrl.includes('vimeo.com') ? (
                          <iframe
                            src={mediaUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                            className="w-full aspect-video"
                            allowFullScreen
                          />
                        ) : mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={mediaUrl} controls className="w-full" />
                        ) : (
                          <img src={mediaUrl} alt="Preview" className="w-full max-h-[300px] object-contain" />
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30 shrink-0">
              {isEditing ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Eliminar
                </Button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEditing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );

  // Render using portal to body
  return createPortal(modalContent, document.body);
}
