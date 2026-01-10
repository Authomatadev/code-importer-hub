import { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, CheckCircle2, Award, ChevronDown, ChevronUp, Clock, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useContest } from '@/hooks/useContest';
import { useContestEntry } from '@/hooks/useContestEntry';
import { VideoUploader } from './VideoUploader';
import { MediaPreview } from './MediaPreview';

interface ContestEntryCardProps {
  userId: string;
}

export function ContestEntryCard({ userId }: ContestEntryCardProps) {
  const { contest, isLoading: contestLoading, daysRemaining, isOpen } = useContest();
  const {
    entry,
    isLoading: entryLoading,
    isSubmitting,
    totalParticipants,
    autoEnroll,
    submitVideo,
    isEnrolled,
    isPreselected,
    hasSubmittedVideo,
    isFinalWinner,
  } = useContestEntry({ contestId: contest?.id || null, userId });

  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-enroll user when component loads
  useEffect(() => {
    if (!entryLoading && !isEnrolled && contest?.id && userId) {
      autoEnroll();
    }
  }, [entryLoading, isEnrolled, contest?.id, userId, autoEnroll]);

  if (contestLoading || entryLoading) return null;
  if (!contest || !isOpen) return null;

  // Get current phase from contest
  const currentPhase = (contest as any).current_phase || 'accumulation';
  const videoDeadline = (contest as any).video_deadline;
  const preselectionCount = (contest as any).preselection_count || 100;

  // Phase labels
  const phaseLabels: Record<string, string> = {
    accumulation: 'Fase de Acumulación',
    video_submission: 'Fase de Videos',
    committee_review: 'Revisión del Comité',
    winners_announced: 'Ganadores Anunciados',
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-primary" />
                {contest.name}
              </CardTitle>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {phaseLabels[currentPhase]}
            </Badge>
            {currentPhase === 'accumulation' && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {daysRemaining} días restantes
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalParticipants} participantes
            </span>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Show different content based on phase */}
            
            {/* PHASE: ACCUMULATION - Everyone trains and uploads photos */}
            {currentPhase === 'accumulation' && (
              <>
                <p className="text-sm text-muted-foreground">
                  ¡Estás participando automáticamente! Completa tus entrenamientos y sube fotos para acumular puntos.
                </p>

                {/* Score display */}
                {entry && (
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {(entry.score || 0).toFixed(1)}%
                      </span>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Ranking: #{entry.rank || '—'} de {totalParticipants}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completitud</span>
                        <span className="font-medium">{(entry.completion_percent || 0).toFixed(0)}%</span>
                      </div>
                      <Progress value={entry.completion_percent || 0} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Fotos subidas</span>
                        <span className="font-medium">{(entry.photo_percent || 0).toFixed(0)}%</span>
                      </div>
                      <Progress value={entry.photo_percent || 0} className="h-2" />
                    </div>

                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Score = (Completitud + Fotos) / 2
                    </p>
                  </div>
                )}

                {/* Top 100 indicator */}
                {entry?.rank && entry.rank <= preselectionCount && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <Trophy className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      ¡Estás en el Top {preselectionCount}! Si mantienes tu posición, serás preseleccionado.
                    </span>
                  </div>
                )}
              </>
            )}

            {/* PHASE: VIDEO_SUBMISSION - Only preselected users can upload video */}
            {currentPhase === 'video_submission' && (
              <>
                {isPreselected ? (
                  <>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        ¡Felicidades! Has sido preseleccionado en el Top {preselectionCount}.
                      </span>
                    </div>

                    {hasSubmittedVideo ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Tu video ha sido recibido. El comité lo revisará pronto.
                        </p>
                        {entry?.video_url && (
                          <div className="flex items-start gap-3">
                            <MediaPreview
                              src={entry.video_url}
                              type="video"
                              className="w-24 h-16"
                            />
                            <div className="text-sm text-muted-foreground">
                              <p>Video de presentación</p>
                              <p className="text-xs">
                                Subido el {new Date(entry.video_uploaded_at!).toLocaleDateString('es-CL')}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Sube tu video contando por qué quieres ser parte de los ganadores.
                        </p>
                        {videoDeadline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Fecha límite: {new Date(videoDeadline).toLocaleDateString('es-CL')}
                          </div>
                        )}
                        <VideoUploader
                          onUpload={submitVideo}
                          isUploading={isSubmitting}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">
                      La fase de acumulación ha terminado. No alcanzaste el Top {preselectionCount} esta vez.
                    </p>
                    <p className="text-xs mt-2">
                      Tu puntaje final: {(entry?.score || 0).toFixed(1)}% (Posición #{entry?.rank || '—'})
                    </p>
                  </div>
                )}
              </>
            )}

            {/* PHASE: COMMITTEE_REVIEW */}
            {currentPhase === 'committee_review' && (
              <div className="text-center py-4">
                {isPreselected ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                    <p className="text-sm font-medium">El comité está revisando los videos</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pronto anunciaremos a los ganadores
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    El comité está seleccionando a los ganadores finales.
                  </p>
                )}
              </div>
            )}

            {/* PHASE: WINNERS_ANNOUNCED */}
            {currentPhase === 'winners_announced' && (
              <div className="text-center py-4">
                {isFinalWinner ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <span className="text-2xl">🎉</span>
                    </div>
                    <p className="text-lg font-bold text-primary">¡Felicidades, eres ganador!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Te contactaremos pronto con los detalles de tu premio.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Los ganadores han sido anunciados.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Tu puntaje final: {(entry?.score || 0).toFixed(1)}% (Posición #{entry?.rank || '—'})
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
