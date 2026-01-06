import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseTrainingPhotoOptions {
  activityId: string;
  userId: string | null;
  initialPhotoUrl?: string | null;
  onLogCreated?: (logId: string) => void;
}

export function useTrainingPhoto({ activityId, userId, initialPhotoUrl, onLogCreated }: UseTrainingPhotoOptions) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Get or create activity log
  const getOrCreateActivityLog = async (): Promise<string | null> => {
    if (!userId) return null;

    // Check if log exists
    const { data: existingLog } = await supabase
      .from('activity_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_id', activityId)
      .maybeSingle();

    if (existingLog) {
      return existingLog.id;
    }

    // Create new log (not completed yet, just for photo)
    const { data: newLog, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        activity_id: activityId,
        completed: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating activity log:', error);
      return null;
    }

    if (newLog && onLogCreated) {
      onLogCreated(newLog.id);
    }

    return newLog?.id || null;
  };

  const uploadPhoto = useCallback(async (file: File) => {
    if (!userId) return null;

    try {
      setIsUploading(true);

      // Get or create activity log
      const logId = await getOrCreateActivityLog();
      if (!logId) {
        throw new Error('Could not create activity log');
      }

      // Compress image if needed (max 2MB)
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) {
        fileToUpload = await compressImage(file);
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `training-photos/${userId}/${logId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('activity-media')
        .upload(filePath, fileToUpload, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('activity-media')
        .getPublicUrl(filePath);

      // Update activity_log with photo URL
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ photo_url: urlData.publicUrl })
        .eq('id', logId);

      if (updateError) throw updateError;

      setPhotoUrl(urlData.publicUrl);

      toast({
        title: '📷 Foto subida',
        description: 'Tu foto de entrenamiento ha sido guardada.',
      });

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast({
        title: 'Error',
        description: 'No se pudo subir la foto.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [activityId, userId, toast]);

  const deletePhoto = useCallback(async () => {
    if (!userId) return;

    try {
      setIsUploading(true);

      // Get activity log
      const { data: log } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_id', activityId)
        .maybeSingle();

      if (!log) return;

      // Delete from storage (try common extensions)
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of extensions) {
        await supabase.storage
          .from('activity-media')
          .remove([`training-photos/${userId}/${log.id}.${ext}`]);
      }

      // Update activity_log to remove photo URL
      const { error: updateError } = await supabase
        .from('activity_logs')
        .update({ photo_url: null })
        .eq('id', log.id);

      if (updateError) throw updateError;

      setPhotoUrl(null);

      toast({
        title: 'Foto eliminada',
        description: 'La foto ha sido eliminada.',
      });
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la foto.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [activityId, userId, toast]);

  return {
    photoUrl,
    isUploading,
    uploadPhoto,
    deletePhoto,
    setPhotoUrl,
  };
}

// Helper function to compress images
async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Max dimensions
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
    };
  });
}
