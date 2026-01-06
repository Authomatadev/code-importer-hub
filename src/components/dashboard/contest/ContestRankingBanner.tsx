import { Trophy, TrendingUp } from 'lucide-react';
import { useContest } from '@/hooks/useContest';
import { useContestEntry } from '@/hooks/useContestEntry';

interface ContestRankingBannerProps {
  userId: string;
}

export function ContestRankingBanner({ userId }: ContestRankingBannerProps) {
  const { contest, isOpen } = useContest();
  const { entry, isEnrolled, totalParticipants } = useContestEntry({
    contestId: contest?.id || null,
    userId,
  });

  if (!contest || !isOpen || !isEnrolled || !entry) return null;

  const isInTop = entry.rank && entry.rank <= (contest.max_winners || 30);

  return (
    <div className={`
      flex items-center justify-between gap-4 px-4 py-2 rounded-lg mb-4
      ${isInTop 
        ? 'bg-green-500/10 border border-green-500/30' 
        : 'bg-muted/50 border border-border'
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-full
          ${isInTop ? 'bg-green-500/20 text-green-500' : 'bg-primary/10 text-primary'}
        `}>
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Ranking: #{entry.rank || '—'} de {totalParticipants}
          </p>
          <p className="text-xs text-muted-foreground">
            {isInTop ? '¡Estás en el Top 30!' : `Top 30 para ganar`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-right">
        <div>
          <p className="text-lg font-bold text-primary flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {(entry.score || 0).toFixed(0)}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            ({(entry.completion_percent || 0).toFixed(0)}% + {(entry.photo_percent || 0).toFixed(0)}%) / 2
          </p>
        </div>
      </div>
    </div>
  );
}
