import { useState, useRef, useCallback } from 'react';
import { Upload, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MediaPreview } from './MediaPreview';

interface VideoUploaderProps {
  onUpload: (file: File) => Promise<void>;
  existingUrl?: string | null;
  isUploading?: boolean;
  maxSizeMB?: number;
  accept?: string;
}

export function VideoUploader({
  onUpload,
  existingUrl,
  isUploading = false,
  maxSizeMB = 50,
  accept = 'video/mp4,video/mov,video/webm,video/quicktime',
}: VideoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El video no puede superar ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      await onUpload(file);
      setProgress(100);
    } catch {
      setError('Error al subir el video');
      setPreview(null);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [maxSizeMB, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  if (existingUrl || preview) {
    return (
      <div className="space-y-2">
        <MediaPreview
          src={existingUrl || preview!}
          type="video"
          className="aspect-video w-full max-w-sm"
        />
        {!existingUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            Cambiar video
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-6
          border-2 border-dashed rounded-lg transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
        `}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Subiendo video...</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Arrastra tu video aquí</p>
              <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
            </div>
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Máx. {maxSizeMB}MB</span>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {progress > 0 && (
        <Progress value={progress} className="h-2" />
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
