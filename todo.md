# SegFault Forum — Implementation Plan

## ✅ Phase 0: Project Scaffolding (DONE)
- [x] Vite + React 19 + TypeScript project initialized
- [x] All dependencies installed (React Router v7, TanStack Query, Supabase JS Client, Tailwind v3, react-markdown, lucide-react, date-fns, clsx, tailwind-merge)
- [x] Tailwind + PostCSS + shadcn theme configured
- [x] Path alias `@/` configured in vite + tsconfig
- [x] GitHub Actions deploy workflow (`.github/workflows/deploy.yml`)
- [x] Full directory structure created (components, pages, hooks, lib, types, providers, router)
- [x] Core files: supabase client, types (auto-generated from DB), utils, all providers (Auth, Query)
- [x] Router with all routes (/, /post/:id, /create, /profile/:username, /search)
- [x] Layout shell: Header with nav + search + auth, page stubs
- [x] Shadcn-style UI primitives: Button, Input
- [x] TypeScript ✅ | Vite build ✅

## ✅ Phase 1: Database & Supabase Setup (DONE)
- [x] Supabase project created: `dqvhqppjjyjrivnvxfsb`
- [x] Migration `00001_init.sql` pushed (profiles, categories, posts, comments, votes + triggers + RLS + seed data)
- [x] TypeScript types generated (`src/types/database.ts`) — 100% type-safe Supabase client
- [x] `.env` configured with live Supabase URL + anon key

## Phase 2: Auth UI + Profile Creation
- [ ] Create auto-profile trigger in Supabase (edge function or DB trigger on auth.users)
- [ ] Build `SignInButton.tsx` — GitHub OAuth button with loading state
- [ ] Show user avatar + username in Header after sign-in
- [ ] Build `src/hooks/useProfile.ts` — fetch/update profile queries

## Phase 3: Posts — CRUD + Markdown + Sorting
- [ ] Build `MarkdownRenderer.tsx` — react-markdown + syntax highlighting
- [ ] Build `MarkdownEditor.tsx` — textarea + live preview split pane
- [ ] Build `PostEditor.tsx` — title, category selector, markdown body, image upload
- [ ] Build `PostCard.tsx` — card with vote count, comments, author, timestamp
- [ ] Build `PostList.tsx` — feed with sort tabs (Hot / Top / New)
- [ ] Build `VoteButton.tsx` — upvote/downvote with optimistic updates
- [ ] Build `PostDetail.tsx` — full post + votes + comments section
- [ ] Build hooks: `usePosts.ts`, `useVotes.ts`

## Phase 4: Comments — Nested Threading + Realtime
- [ ] Build `CommentForm.tsx`, `CommentItem.tsx`, `CommentThread.tsx`
- [ ] Build `useComments.ts` — fetch, create, real-time subscription

## Phase 5: Search
- [ ] Build `SearchResults.tsx` — full results page
- [ ] Build `useSearch.ts` — Supabase full-text search hook

## Phase 6: User Profiles
- [ ] Build `ProfileCard.tsx`, `ProfileActivity.tsx`
- [ ] Build `useProfile.ts` — profile queries + mutations

## Phase 7: Polish & Deployment
- [ ] Loading skeletons, empty states, error boundaries
- [ ] Responsive mobile pass
- [ ] GitHub Actions deploy
