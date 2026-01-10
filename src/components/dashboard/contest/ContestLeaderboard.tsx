import { Trophy, Medal, TrendingUp, Camera, CheckCircle2, Crown, Loader2, Users } from 'lucide-react';
import { useContest } from '@/hooks/useContest';
import { useContestLeaderboard, LeaderboardEntry } from '@/hooks/useContestLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ContestLeaderboardProps {
  currentUserId?: string | null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function EmptyPodiumPosition({ position }: { position: 1 | 2 | 3 }) {
  const podiumConfig = {
    1: {
      height: 'h-28',
      bgGradient: 'from-yellow-500/20 to-yellow-600/5',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400/40',
      icon: Crown,
      size: 'w-20 h-20',
      order: 'order-2',
    },
    2: {
      height: 'h-20',
      bgGradient: 'from-slate-400/20 to-slate-500/5',
      borderColor: 'border-slate-400/30',
      iconColor: 'text-slate-300/40',
      icon: Medal,
      size: 'w-16 h-16',
      order: 'order-1',
    },
    3: {
      height: 'h-16',
      bgGradient: 'from-amber-700/20 to-amber-800/5',
      borderColor: 'border-amber-600/30',
      iconColor: 'text-amber-600/40',
      icon: Medal,
      size: 'w-16 h-16',
      order: 'order-3',
    },
  };

  const config = podiumConfig[position];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center gap-2", config.order)}>
      {/* Empty avatar placeholder */}
      <div className="relative">
        <div className={cn(
          config.size,
          "rounded-full border-2 border-dashed flex items-center justify-center",
          config.borderColor,
          "bg-muted/20"
        )}>
          <span className={cn("text-2xl", config.iconColor)}>?</span>
        </div>
        
        {/* Position badge */}
        <div className={cn(
          "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
          "bg-background border-2",
          config.borderColor
        )}>
          <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
        </div>
      </div>

      {/* Empty name placeholder */}
      <p className="text-xs text-muted-foreground/50">
        —
      </p>

      {/* Empty score */}
      <div className={cn(
        "flex items-center gap-1 px-3 py-1 rounded-full",
        "bg-muted/20 border border-dashed",
        config.borderColor
      )}>
        <TrendingUp className={cn("w-3 h-3", config.iconColor)} />
        <span className={cn("font-bold text-xs", config.iconColor)}>
          —
        </span>
      </div>

      {/* Podium base */}
      <div className={cn(
        "w-20 rounded-t-lg flex items-end justify-center pb-2",
        "bg-gradient-to-t",
        config.bgGradient,
        "border-x border-t border-dashed",
        config.borderColor,
        config.height
      )}>
        <span className={cn("font-bold text-2xl", config.iconColor)}>
          {position}
        </span>
      </div>
    </div>
  );
}

function PodiumPosition({ entry, position, currentUserId }: { 
  entry: LeaderboardEntry | undefined; 
  position: 1 | 2 | 3;
  currentUserId?: string | null;
}) {
  if (!entry) {
    return <EmptyPodiumPosition position={position} />;
  }

  const isCurrentUser = entry.user_id === currentUserId;
  
  const podiumConfig = {
    1: {
      height: 'h-28',
      bgGradient: 'from-yellow-500/30 to-yellow-600/10',
      borderColor: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
      icon: Crown,
      size: 'w-20 h-20',
      textSize: 'text-lg',
      order: 'order-2',
    },
    2: {
      height: 'h-20',
      bgGradient: 'from-slate-400/30 to-slate-500/10',
      borderColor: 'border-slate-400/50',
      iconColor: 'text-slate-300',
      icon: Medal,
      size: 'w-16 h-16',
      textSize: 'text-base',
      order: 'order-1',
    },
    3: {
      height: 'h-16',
      bgGradient: 'from-amber-700/30 to-amber-800/10',
      borderColor: 'border-amber-600/50',
      iconColor: 'text-amber-600',
      icon: Medal,
      size: 'w-16 h-16',
      textSize: 'text-base',
      order: 'order-3',
    },
  };

  const config = podiumConfig[position];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center gap-2", config.order)}>
      {/* Avatar with medal indicator */}
      <div className="relative">
        <Avatar className={cn(
          config.size,
          "border-2",
          config.borderColor,
          isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}>
          <AvatarFallback className={cn(
            "bg-gradient-to-br text-foreground font-bold",
            config.bgGradient,
            config.textSize
          )}>
            {getInitials(entry.user_name)}
          </AvatarFallback>
        </Avatar>
        
        {/* Position badge */}
        <div className={cn(
          "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
          "bg-background border-2",
          config.borderColor
        )}>
          <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
        </div>
      </div>

      {/* Name */}
      <p className={cn(
        "font-medium text-center line-clamp-1 max-w-[80px]",
        isCurrentUser ? "text-primary" : "text-foreground",
        position === 1 ? "text-sm" : "text-xs"
      )}>
        {entry.user_name.split(' ')[0]}
      </p>

      {/* Score */}
      <div className={cn(
        "flex items-center gap-1 px-3 py-1 rounded-full",
        "bg-gradient-to-r",
        config.bgGradient,
        "border",
        config.borderColor
      )}>
        <TrendingUp className={cn("w-3 h-3", config.iconColor)} />
        <span className={cn("font-bold", config.iconColor, position === 1 ? "text-sm" : "text-xs")}>
          {(entry.score || 0).toFixed(0)}%
        </span>
      </div>

      {/* Podium base */}
      <div className={cn(
        "w-20 rounded-t-lg flex items-end justify-center pb-2",
        "bg-gradient-to-t",
        config.bgGradient,
        "border-x border-t",
        config.borderColor,
        config.height
      )}>
        <span className={cn("font-bold text-2xl", config.iconColor)}>
          {position}
        </span>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, currentUserId, preselectionCount }: { 
  entry: LeaderboardEntry; 
  currentUserId?: string | null;
  preselectionCount: number;
}) {
  const isCurrentUser = entry.user_id === currentUserId;
  const isPreselected = entry.rank && entry.rank <= preselectionCount;

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
      isCurrentUser 
        ? "bg-primary/10 border border-primary/30" 
        : "bg-muted/30 hover:bg-muted/50"
    )}>
      {/* Rank */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
        isPreselected 
          ? "bg-green-500/20 text-green-500" 
          : "bg-muted text-muted-foreground"
      )}>
        {entry.rank || '—'}
      </div>

      {/* Avatar */}
      <Avatar className="w-10 h-10 border border-border shrink-0">
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {getInitials(entry.user_name)}
        </AvatarFallback>
      </Avatar>

      {/* Name and progress bars */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate mb-1",
          isCurrentUser ? "text-primary" : "text-foreground"
        )}>
          {entry.user_name}
          {isCurrentUser && <span className="ml-1 text-xs text-muted-foreground">(Tú)</span>}
        </p>
        
        {/* Progress indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Completitud
              </span>
              <span className="font-medium text-foreground">{(entry.completion_percent || 0).toFixed(0)}%</span>
            </div>
            <Progress value={entry.completion_percent || 0} className="h-1.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Camera className="w-2.5 h-2.5" />
                Fotos
              </span>
              <span className="font-medium text-foreground">{(entry.photo_percent || 0).toFixed(0)}%</span>
            </div>
            <Progress value={entry.photo_percent || 0} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className={cn(
          "font-bold text-lg",
          isPreselected ? "text-green-500" : "text-foreground"
        )}>
          {(entry.score || 0).toFixed(0)}%
        </p>
        {isPreselected && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-500">
            Top {preselectionCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function ContestLeaderboard({ currentUserId }: ContestLeaderboardProps) {
  const { contest } = useContest();
  const { entries, isLoading, topThree, restOfList } = useContestLeaderboard({
    contestId: contest?.id || null,
  });

  const preselectionCount = (contest as any)?.preselection_count || 100;

  if (!contest) return null;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard del Concurso
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {entries.length} participantes
          </span>
          <span>•</span>
          <span>Top {preselectionCount} serán preseleccionados</span>
        </div>
        
        {/* Score formula explanation */}
        <div className="mt-2 p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong className="text-foreground">Puntaje</strong> = (% Completitud + % Fotos) / 2
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aún no hay participantes</p>
            <p className="text-sm">¡Sé el primero en inscribirte!</p>
          </div>
        ) : (
          <>
            {/* Podium always visible */}
            <div className="flex justify-center items-end gap-2 mb-6 pt-4">
              <PodiumPosition 
                entry={topThree[1]} 
                position={2} 
                currentUserId={currentUserId}
              />
              <PodiumPosition 
                entry={topThree[0]} 
                position={1} 
                currentUserId={currentUserId}
              />
              <PodiumPosition 
                entry={topThree[2]} 
                position={3} 
                currentUserId={currentUserId}
              />
            </div>

            {/* Rest of the leaderboard */}
            {restOfList.length > 0 && (
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-2">
                  {restOfList.map((entry) => (
                    <LeaderboardRow 
                      key={entry.id} 
                      entry={entry} 
                      currentUserId={currentUserId}
                      preselectionCount={preselectionCount}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
