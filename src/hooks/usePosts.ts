import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"
import type { Post, SortOption } from "@/types"

export function usePosts(sort: SortOption = "new") {
  return useQuery({
    queryKey: ["posts", sort],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(username, avatar_url),
          category:categories(name, slug, color)
        `)

      if (sort === "new") query = query.order("created_at", { ascending: false })
      else if (sort === "top") query = query.order("vote_count", { ascending: false })
      else query = query.order("created_at", { ascending: false })

      const { data } = await query
      return (data ?? []) as unknown as Post[]
    },
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(username, avatar_url),
          category:categories(name, slug, color)
        `)
        .eq("id", id)
        .single()

      if (!data) throw new Error("Post not found")
      return data as unknown as Post
    },
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      title,
      content,
      category_id,
    }: {
      title: string
      content: string
      category_id: number | null
    }) => {
      if (!user) throw new Error("Not authenticated")
      const { error } = await supabase.from("posts").insert({
        title,
        content,
        category_id,
        user_id: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}
