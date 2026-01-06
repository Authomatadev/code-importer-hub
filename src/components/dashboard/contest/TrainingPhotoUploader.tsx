import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaPreview } from './MediaPreview';

interface TrainingPhotoUploaderProps {
  photoUrl: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onDelete: () => Promise<void>;
  isUploading: boolean;
  disabled?: boolean;
}

export function TrainingPhotoUploader({
  photoUrl,
  onUpload,
  onDelete,
  isUploading,
  disabled = false,
}: TrainingPhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Create preview immediately
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Upload
    await onUpload(file);
    setPreview(null); // Clear preview after upload (photoUrl will update)
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // Reset input
  };

  // Show uploaded photo
  if (photoUrl && !preview) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <MediaPreview
            src={photoUrl}
            type="image"
            className="w-20 h-20 rounded-lg"
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Foto subida
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading || disabled}
                className="h-7 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Cambiar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isUploading || disabled}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  // Show preview while uploading
  if (preview) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
        <span className="text-sm text-muted-foreground">Subiendo foto...</span>
      </div>
    );
  }

  // Show upload dropzone
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        flex items-center gap-3 p-3 border border-dashed rounded-lg transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
      `}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
        <Camera className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">Subir foto del entrenamiento</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Upload className="w-3 h-3" />
          Arrastra o haz clic
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
