import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MediaPreviewProps {
  src: string;
  type: 'image' | 'video';
  alt?: string;
  className?: string;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function MediaPreview({
  src,
  type,
  alt = 'Preview',
  className = '',
  onRemove,
  showRemove = false,
}: MediaPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`relative group rounded-lg overflow-hidden ${className}`}>
        {type === 'image' ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
            onClick={() => setIsOpen(true)}
          />
        ) : (
          <div className="relative w-full h-full bg-muted cursor-pointer" onClick={() => setIsOpen(true)}>
            <video
              src={src}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {showRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {type === 'image' ? (
            <img src={src} alt={alt} className="w-full h-auto" />
          ) : (
            <video src={src} controls autoPlay className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
