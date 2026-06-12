# Future Features (Postponed)

## AI Moderation (Gemini Flash Lite)
- [ ] Integrate Gemini Flash Lite API to check post/comment content for policy violations
- [ ] Auto-flag posts for admin review instead of publishing immediately (or flag after publish)

## Report System
- [ ] "Report" button on posts and comments
- [ ] Report flow: user submits report → Gemini validates if report is legitimate → admin dashboard to review
- [ ] Reports include: reason, reported content snapshot, link to content

## Notification System
- [ ] Notify users when: someone replies to their comment, @mentions them, their post gets reported, they get muted/banned
- [ ] In-app notification bell in header

## Punishment System
- [ ] **Ban**: Block the user's OAuth sign-in method (revoke access or flag account)
- [ ] **Mute**: Prevent posting/commenting for N days (configurable by admin)
- [ ] Admin dashboard to review reports, view evidence, apply punishments

## @ Mention System
- [ ] `@username` mentions in posts and comments (no spaces, emoji, or special chars)
- [ ] Display name shown instead of raw username in rendered content
- [ ] Mentioned user receives a notification
- [ ] Auto-complete dropdown when typing `@` in the editor

## SegFault Bot (AI Agent powered by Gemini Flash)
- [ ] Bot user account "SegFault BOT" that can post and comment like a normal user
- [ ] Listens to GitHub repo push events (via webhook or polling)
- [ ] When a new commit/PR/update is detected, Gemini decides: *Is this change important enough to warrant a forum post?*
- [ ] Strict system prompt to prevent AI slop:
  - Only post about meaningful changes (feature releases, breaking changes, major fixes)
  - Ignore trivial commits (typo fixes, dependency bumps, chore commits)
  - Posts must be concise, factual, and human-readable
  - No excessive enthusiasm, markdown fluff, or generic filler
  - Format: short title + 2-4 sentence summary of what changed and why it matters
- [ ] Bot can reply to comments on its posts with factual follow-ups
- [ ] Rate-limited to avoid spam
