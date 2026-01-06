import { useState } from 'react';
import { Trophy, Calendar, Users, CheckCircle2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    acceptTerms,
    submitVideo,
    hasAcceptedTerms,
    isEnrolled,
  } = useContestEntry({ contestId: contest?.id || null, userId });

  const [termsChecked, setTermsChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (contestLoading || entryLoading) return null;
  if (!contest || !isOpen) return null;

  // User is enrolled - show stats
  if (isEnrolled && entry) {
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
            <p className="text-sm text-muted-foreground flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Participando
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {daysRemaining} días restantes
              </span>
            </p>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Video preview */}
              {entry.video_url && (
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

              {/* Score breakdown */}
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

              {/* Top 30 indicator */}
              {entry.rank && entry.rank <= (contest.max_winners || 30) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Trophy className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ¡Estás en el Top {contest.max_winners || 30}!
                  </span>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  // User has accepted terms but hasn't uploaded video
  if (hasAcceptedTerms && !isEnrolled) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {contest.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Cierre: {new Date(contest.end_date).toLocaleDateString('es-CL')} ({daysRemaining} días)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sube tu video de presentación para participar en el concurso.
          </p>
          <VideoUploader
            onUpload={submitVideo}
            isUploading={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

  // User hasn't enrolled yet
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {contest.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Código: <span className="font-mono font-medium">{contest.code}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{contest.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            {contest.max_winners} cupos
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {daysRemaining} días restantes
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {totalParticipants} participantes
          </span>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={termsChecked}
            onCheckedChange={(checked) => setTermsChecked(checked === true)}
            disabled={isSubmitting}
          />
          <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
            Acepto los{' '}
            <Dialog open={showTerms} onOpenChange={setShowTerms}>
              <DialogTrigger asChild>
                <button className="text-primary underline">términos y condiciones</button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Términos y Condiciones</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {contest.terms_and_conditions}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </label>
        </div>

        <Button
          onClick={acceptTerms}
          disabled={!termsChecked || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Procesando...' : 'Continuar con video de presentación'}
        </Button>
      </CardContent>
    </Card>
  );
}
