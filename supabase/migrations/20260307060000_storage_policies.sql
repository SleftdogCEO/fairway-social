-- Make the posts storage bucket public
UPDATE storage.buckets SET public = true WHERE id = 'posts';

-- Allow anyone to upload to the posts bucket
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posts');

-- Allow anyone to read from the posts bucket
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

-- Allow anyone to update their uploads
CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'posts');

-- Allow anyone to delete their uploads
CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'posts');
