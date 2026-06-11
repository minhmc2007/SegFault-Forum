-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  raw_username TEXT;
BEGIN
  raw_username := COALESCE(
    NEW.raw_user_meta_data ->> 'user_name',
    NEW.raw_user_meta_data ->> 'preferred_username',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    raw_username,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
