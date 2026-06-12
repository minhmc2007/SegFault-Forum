export type UserRank = "new_member" | "member" | "senior_member" | "developer" | "well_known_developer" | "admin" | "bot"

export const rankLabels: Record<UserRank, string> = {
  new_member: "New Member",
  member: "Member",
  senior_member: "Senior Member",
  developer: "Developer",
  well_known_developer: "Well-Known Developer",
  admin: "Admin",
  bot: "BOT",
}

export const rankColors: Record<UserRank, string> = {
  new_member: "#6B7280",
  member: "#3B82F6",
  senior_member: "#8B5CF6",
  developer: "#F59E0B",
  well_known_developer: "#EF4444",
  admin: "#10B981",
  bot: "#8B5CF6",
}

export interface Profile {
  id: string
  username: string
  name: string | null
  avatar_url: string | null
  karma: number
  bio: string | null
  website: string | null
  location: string | null
  is_admin: boolean
  rank: UserRank
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Post {
  id: string
  title: string
  content: string
  category_id: number | null
  user_id: string
  vote_count: number
  comment_count: number
  created_at: string
  author?: { username: string; avatar_url: string | null; rank: UserRank }
  category?: { name: string; slug: string; color: string }
  tags?: Tag[]
  user_vote?: number | null
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  depth: number
  created_at: string
  author?: { username: string; avatar_url: string | null; rank: UserRank }
  replies?: Comment[]
}

export interface Vote {
  id: number
  user_id: string
  post_id: string
  vote_type: number
}

export interface Report {
  id: number
  reporter_id: string
  content_type: "post" | "comment" | "profile"
  content_id: string
  reason: string
  status: "pending" | "reviewed" | "dismissed"
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface Notification {
  id: number
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export interface Punishment {
  id: number
  user_id: string
  type: "mute" | "ban"
  reason: string
  expires_at: string | null
  created_by: string
  created_at: string
  active: boolean
}

export type SortOption = "hot" | "top" | "new"
