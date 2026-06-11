-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set minhmc2007 as admin
UPDATE profiles SET is_admin = TRUE WHERE username = 'minhmc2007';

-- Admin can delete any post
CREATE POLICY "Admins can delete any post"
  ON posts FOR DELETE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

-- Admin can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

-- Admin can update any post
CREATE POLICY "Admins can update any post"
  ON posts FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));
