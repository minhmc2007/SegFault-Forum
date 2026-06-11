import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"
import type { Profile, Post } from "@/types"

export function useProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single()
      if (!data) throw new Error("Profile not found")
      return { ...data, karma: data.karma ?? 10, is_admin: data.is_admin ?? false } as Profile
    },
    enabled: !!username,
  })
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select(`
          *,
          category:categories(name, slug, color)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      return (data ?? []) as unknown as Post[]
    },
    enabled: !!userId,
  })
}

export function useUserComments(userId: string) {
  return useQuery({
    queryKey: ["user-comments", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          post:posts!comments_post_id_fkey(id, title)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      return (data ?? []) as unknown as { id: string; content: string; created_at: string; post: { id: string; title: string } | null }[]
    },
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, "bio" | "website" | "location" | "avatar_url">>) => {
      if (!user) throw new Error("Not authenticated")
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
