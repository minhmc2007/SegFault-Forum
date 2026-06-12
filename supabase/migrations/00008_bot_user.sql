-- Create SegFault BOT auth user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'bot@segfault-forum.local',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Create bot profile
INSERT INTO public.profiles (id, username, name, karma, is_admin)
VALUES ('00000000-0000-0000-0000-000000000001', 'SegFault-BOT', 'SegFault BOT', 0, false)
ON CONFLICT (id) DO NOTHING;
