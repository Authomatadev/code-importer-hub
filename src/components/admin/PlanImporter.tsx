import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlanSelector } from './PlanSelector';
import { supabase } from '@/integrations/supabase/client';
import { validatePlanImport, PlanImport, PlanImportSchema, getWeeksFromPlanImport, WeekImport } from '@/lib/plan-import-schema';
import { toast } from 'sonner';
import {
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  X,
  FileText,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Plan = Tables<'plans'>;

type ImportMode = 'replace' | 'merge';

interface ImportProgress {
  current: number;
  total: number;
  currentStep: string;
}

export function PlanImporter() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [parsedData, setParsedData] = useState<PlanImport | null>(null);
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validatePlanImport> | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);
      validateJson(content);
    };
    reader.readAsText(file);
  };

  const validateJson = (content: string) => {
    try {
      const data = JSON.parse(content);
      const result = validatePlanImport(data);
      setValidationResult(result);
      
      if (result.valid) {
        setParsedData(PlanImportSchema.parse(data));
      } else {
        setParsedData(null);
      }
    } catch (error: any) {
      const errorMessage = error instanceof SyntaxError 
        ? `JSON inválido: ${error.message}` 
        : `Error de validación: ${error.message}`;
      setValidationResult({
        valid: false,
        errors: [errorMessage],
        summary: { totalWeeks: 0, totalActivities: 0, weekNumbers: [] },
      });
      setParsedData(null);
    }
  };

  const clearFile = () => {
    setJsonContent('');
    setParsedData(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!selectedPlan || !parsedData) return;

    setImporting(true);
    const weeks = getWeeksFromPlanImport(parsedData);
    const totalSteps = weeks.length * 2; // weeks + activities per week
    let currentStep = 0;

    try {
      // If replace mode, delete existing weeks
      if (importMode === 'replace') {
        setProgress({ current: 0, total: totalSteps, currentStep: 'Eliminando semanas existentes...' });
        
        const { error: deleteError } = await supabase
          .from('weeks')
          .delete()
          .eq('plan_id', selectedPlan.id);

        if (deleteError) throw deleteError;
      }

      // Import each week
      for (const week of weeks) {
        currentStep++;
        setProgress({
          current: currentStep,
          total: totalSteps,
          currentStep: `Importando semana ${week.week_number}...`,
        });

        // Check if week exists
        const { data: existingWeek } = await supabase
          .from('weeks')
          .select('id')
          .eq('plan_id', selectedPlan.id)
          .eq('week_number', week.week_number)
          .maybeSingle();

        let weekId: string;

        if (existingWeek && importMode === 'merge') {
          // Update existing week
          const { error: updateError } = await supabase
            .from('weeks')
            .update({
              tip_week: week.tip_week || null,
              tip_month: week.tip_month || null,
            })
            .eq('id', existingWeek.id);

          if (updateError) throw updateError;
          weekId = existingWeek.id;

          // Delete existing activities for this week (to replace them)
          await supabase.from('activities').delete().eq('week_id', weekId);
        } else {
          // Insert new week
          const { data: newWeek, error: insertError } = await supabase
            .from('weeks')
            .insert({
              plan_id: selectedPlan.id,
              week_number: week.week_number,
              tip_week: week.tip_week || null,
              tip_month: week.tip_month || null,
            })
            .select('id')
            .single();

          if (insertError) throw insertError;
          weekId = newWeek.id;
        }

        // Import activities for this week
        currentStep++;
        setProgress({
          current: currentStep,
          total: totalSteps,
          currentStep: `Importando actividades de semana ${week.week_number}...`,
        });

        const activitiesData = week.activities.map((activity) => ({
          week_id: weekId,
          day_of_week: activity.day_of_week,
          title: activity.title,
          activity_type: activity.activity_type || 'run',
          order_index: activity.order_index || 1,
          phase: activity.phase || null,
          training_type: activity.training_type || null,
          zone: activity.zone || null,
          terrain: activity.terrain || null,
          main_work_type: activity.main_work_type || null,
          main_work_distance_km: activity.main_work_distance_km || null,
          main_work_duration_min: activity.main_work_duration_min || null,
          warmup_duration_min: activity.warmup_duration_min || null,
          repetitions: activity.repetitions || null,
          rep_distance_meters: activity.rep_distance_meters || null,
          rest_between_reps_min: activity.rest_between_reps_min || null,
          stretch_before_after: activity.stretch_before_after ?? true,
          distance_km: activity.distance_km || null,
          duration_min: activity.duration_min || null,
          total_daily_km: activity.total_daily_km || null,
          intensity: activity.intensity || null,
          description: activity.description || null,
          notes: activity.notes || null,
          media_url: activity.media_url || null,
        }));

        const { error: activitiesError } = await supabase
          .from('activities')
          .insert(activitiesData);

        if (activitiesError) throw activitiesError;
      }

      toast.success(
        `Plan importado exitosamente: ${weeks.length} semanas, ${validationResult?.summary.totalActivities} actividades`
      );
      clearFile();
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Error al importar: ${error.message}`);
    } finally {
      setImporting(false);
      setProgress(null);
    }
  };

  const downloadTemplate = () => {
    window.open('/templates/plan-import-template.json', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Plan de Entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Selector */}
        <div className="space-y-2">
          <Label>Plan destino</Label>
          <PlanSelector
            selectedPlanId={selectedPlan?.id || null}
            onSelect={setSelectedPlan}
          />
        </div>

        {/* Import Mode */}
        <div className="space-y-2">
          <Label>Modo de importación</Label>
          <RadioGroup
            value={importMode}
            onValueChange={(v) => setImportMode(v as ImportMode)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="merge" id="merge" />
              <Label htmlFor="merge" className="cursor-pointer">
                Agregar/Actualizar
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="replace" id="replace" />
              <Label htmlFor="replace" className="cursor-pointer text-destructive">
                Reemplazar todo
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            {importMode === 'merge'
              ? 'Agrega nuevas semanas o actualiza las existentes por número de semana.'
              : '⚠️ Elimina TODAS las semanas y actividades existentes antes de importar.'}
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Archivo JSON</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {jsonContent ? 'Archivo cargado' : 'Arrastra o haz clic para subir JSON'}
                </span>
              </div>
            </div>
            {jsonContent && (
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
            {validationResult.valid ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {validationResult.valid ? (
                <div className="space-y-1">
                  <p className="font-medium">✓ Estructura válida</p>
                  <p className="text-sm">
                    {validationResult.summary.totalWeeks} semanas detectadas •{' '}
                    {validationResult.summary.totalActivities} actividades en total
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Semanas: {validationResult.summary.weekNumbers.join(', ')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">Errores de validación:</p>
                  <ul className="text-sm list-disc list-inside">
                    {validationResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li>...y {validationResult.errors.length - 5} errores más</li>
                    )}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{progress.currentStep}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={downloadTemplate} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Descargar</span> Plantilla
          </Button>

          <Button
            onClick={handleImport}
            disabled={!selectedPlan || !parsedData || importing}
            className="w-full sm:w-auto"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Importar Plan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
