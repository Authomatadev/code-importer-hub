import { Lightbulb, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tip {
  title?: string;
  content?: string;
  media_url?: string;
}

interface TipCardProps {
  tip: Tip | null;
  type: "week" | "month";
  weekNumber?: number;
}

export function TipCard({ tip, type, weekNumber }: TipCardProps) {
  if (!tip || (!tip.title && !tip.content)) return null;

  const isWeekly = type === "week";
  const Icon = isWeekly ? Lightbulb : Calendar;

  return (
    <div 
      className={cn(
        "rounded-2xl border p-5 md:p-6 transition-all",
        isWeekly 
          ? "bg-primary/5 border-primary/20" 
          : "bg-secondary/10 border-secondary/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isWeekly ? "bg-primary/20" : "bg-secondary/20"
          )}
        >
          <Icon className={cn(
            "w-5 h-5",
            isWeekly ? "text-primary" : "text-secondary"
          )} />
        </div>
        <div>
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            isWeekly ? "text-primary" : "text-secondary"
          )}>
            {isWeekly ? `Tip Semana ${weekNumber}` : "Tip del Mes"}
          </span>
          {tip.title && (
            <h4 className="font-heading text-lg font-bold text-foreground">
              {tip.title}
            </h4>
          )}
        </div>
      </div>

      {/* Content */}
      {tip.content && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {tip.content}
        </p>
      )}

      {/* Media (YouTube embed or image) */}
      {tip.media_url && (
        <div className="mt-4">
          {tip.media_url.includes("youtube.com") || tip.media_url.includes("youtu.be") ? (
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={getYouTubeEmbedUrl(tip.media_url)}
                title={tip.title || "Video tip"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : tip.media_url.includes("vimeo.com") ? (
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                src={getVimeoEmbedUrl(tip.media_url)}
                title={tip.title || "Video tip"}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={tip.media_url}
              alt={tip.title || "Tip media"}
              className="w-full rounded-xl object-cover max-h-64"
            />
          )}
        </div>
      )}
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}
