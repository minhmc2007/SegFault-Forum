-- Lower rank thresholds: max rank at 100 posts
-- 0 → New Member, 5 → Member, 20 → Senior Member, 50 → Developer, 100 → Well-Known Developer
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
DECLARE
  post_count INT;
BEGIN
  SELECT COUNT(*) INTO post_count FROM posts WHERE user_id = NEW.user_id;

  UPDATE profiles SET rank =
    CASE
      WHEN post_count >= 100 THEN 'well_known_developer'
      WHEN post_count >= 50 THEN 'developer'
      WHEN post_count >= 20 THEN 'senior_member'
      WHEN post_count >= 5 THEN 'member'
      ELSE 'new_member'
    END
  WHERE id = NEW.user_id AND is_admin = FALSE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
