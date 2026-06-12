# Future Features (Postponed)

## AI Moderation (Gemini Flash Lite)
- [ ] Integrate Gemini Flash Lite API to check post/comment content for policy violations
- [ ] Auto-flag posts for admin review instead of publishing immediately (or flag after publish)

## Report System
- [x] "Report" button on posts and comments
- [x] Report flow: user submits report → admin dashboard to review
- [x] Reports include: reason, content type/id

## Notification System
- [x] In-app notification bell in header with unread count
- [x] Dropdown showing latest notifications

## Punishment System
- [x] **Ban**: Block access via flag check in middleware
- [x] **Mute**: Prevent posting/commenting with duration (configurable by admin)
- [x] Admin dashboard to review reports, apply/revoke punishments

## @ Mention System
- [x] `@username` mentions in posts and comments (no spaces, emoji, or special chars)
- [x] Display name shown instead of raw username in rendered content
- [x] Mentioned user receives a notification
- [x] Auto-complete dropdown when typing `@` in the editor

## SegFault BOT (AI Agent — Gemini 3 Flash Preview via Gemini API)
- [x] Bot user account "SegFault BOT" (UUID: `00000000-0000-0000-0000-000000000001`)
- [x] Model: `gemini-3-flash-preview`
- [x] Supabase Edge Function `gh-webhook` receives GitHub push events
- [x] Gemini evaluates commit importance and decides whether to post
- [x] Strict system prompt to prevent AI slop (only posts meaningful changes)
- [x] Function deployed: `https://dqvhqppjjyjrivnvxfsb.supabase.co/functions/v1/gh-webhook`
- [x] Gemini API key stored as Supabase secret `GEMINI_API_KEY`
- [ ] **Set up GitHub webhook** — go to repo → Settings → Webhooks → Add webhook
  - Payload URL: `https://dqvhqppjjyjrivnvxfsb.supabase.co/functions/v1/gh-webhook`
  - Content type: `application/json`
  - Events: `Pushes`
  - No secret needed
- [ ] Bot replying to comments (future)
- [ ] Rate-limiting (future)
