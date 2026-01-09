import { Trophy, Medal, TrendingUp, Camera, CheckCircle2, Crown, Loader2 } from 'lucide-react';
import { useContest } from '@/hooks/useContest';
import { useContestLeaderboard, LeaderboardEntry } from '@/hooks/useContestLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

function PodiumPosition({ entry, position, currentUserId }: { 
  entry: LeaderboardEntry; 
  position: 1 | 2 | 3;
  currentUserId?: string | null;
}) {
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

function LeaderboardRow({ entry, currentUserId }: { 
  entry: LeaderboardEntry; 
  currentUserId?: string | null;
}) {
  const isCurrentUser = entry.user_id === currentUserId;
  const isTopThirty = entry.rank && entry.rank <= 30;

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
      isCurrentUser 
        ? "bg-primary/10 border border-primary/30" 
        : "bg-muted/30 hover:bg-muted/50"
    )}>
      {/* Rank */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
        isTopThirty 
          ? "bg-green-500/20 text-green-500" 
          : "bg-muted text-muted-foreground"
      )}>
        {entry.rank || '—'}
      </div>

      {/* Avatar */}
      <Avatar className="w-10 h-10 border border-border">
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {getInitials(entry.user_name)}
        </AvatarFallback>
      </Avatar>

      {/* Name and stats */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          isCurrentUser ? "text-primary" : "text-foreground"
        )}>
          {entry.user_name}
          {isCurrentUser && <span className="ml-1 text-xs text-muted-foreground">(Tú)</span>}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {(entry.completion_percent || 0).toFixed(0)}%
          </span>
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {(entry.photo_percent || 0).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className={cn(
          "font-bold",
          isTopThirty ? "text-green-500" : "text-foreground"
        )}>
          {(entry.score || 0).toFixed(0)}%
        </p>
        {isTopThirty && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/30 text-green-500">
            Top 30
          </Badge>
        )}
      </div>
    </div>
  );
}

export function ContestLeaderboard({ currentUserId }: ContestLeaderboardProps) {
  const { contest, isOpen } = useContest();
  const { entries, isLoading, topThree, restOfList } = useContestLeaderboard({
    contestId: contest?.id || null,
  });

  if (!contest) return null;

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard del Concurso
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {entries.length} participantes • Top 30 ganan premios
        </p>
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
            {/* Podium for top 3 */}
            {topThree.length > 0 && (
              <div className="flex justify-center items-end gap-2 mb-6 pt-4">
                {topThree[1] && (
                  <PodiumPosition 
                    entry={topThree[1]} 
                    position={2} 
                    currentUserId={currentUserId}
                  />
                )}
                {topThree[0] && (
                  <PodiumPosition 
                    entry={topThree[0]} 
                    position={1} 
                    currentUserId={currentUserId}
                  />
                )}
                {topThree[2] && (
                  <PodiumPosition 
                    entry={topThree[2]} 
                    position={3} 
                    currentUserId={currentUserId}
                  />
                )}
              </div>
            )}

            {/* Rest of the leaderboard */}
            {restOfList.length > 0 && (
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-2">
                  {restOfList.map((entry) => (
                    <LeaderboardRow 
                      key={entry.id} 
                      entry={entry} 
                      currentUserId={currentUserId}
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
