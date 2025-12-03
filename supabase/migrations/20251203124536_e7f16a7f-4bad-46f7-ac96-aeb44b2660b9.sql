-- Create storage bucket for activity media
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-media', 'activity-media', true);

-- Allow anyone to view files (public bucket)
CREATE POLICY "Anyone can view activity media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'activity-media');

-- Only admins can upload files
CREATE POLICY "Admins can upload activity media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'activity-media' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can update files
CREATE POLICY "Admins can update activity media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'activity-media' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can delete files
CREATE POLICY "Admins can delete activity media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'activity-media' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);