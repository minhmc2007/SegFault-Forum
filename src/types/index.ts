export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  karma: number
  bio: string | null
  website: string | null
  location: string | null
  is_admin: boolean
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

export interface Post {
  id: string
  title: string
  content: string
  category_id: number | null
  user_id: string
  vote_count: number
  comment_count: number
  created_at: string
  author?: { username: string; avatar_url: string | null }
  category?: { name: string; slug: string; color: string }
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
  author?: { username: string; avatar_url: string | null }
  replies?: Comment[]
}

export interface Vote {
  id: number
  user_id: string
  post_id: string
  vote_type: number
}

export type SortOption = "hot" | "top" | "new"
