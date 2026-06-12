import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"
import { censor } from "@/lib/profanity"
import { useEffect } from "react"
import type { Comment } from "@/types"

function nestComments(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>()
  const roots: Comment[] = []

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] })
  }

  for (const c of comments) {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id) && c.depth < 3) {
      map.get(c.parent_id)!.replies!.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export function useComments(postId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          author:profiles!comments_user_id_fkey(username, avatar_url, rank)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      return nestComments((data ?? []) as unknown as Comment[])
    },
    enabled: !!postId,
  })

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, queryClient])

  return query
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      postId,
      parentId,
      content,
      depth,
    }: {
      postId: string
      parentId?: string | null
      content: string
      depth: number
    }) => {
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        parent_id: parentId ?? null,
        content: censor(content),
        depth,
      })
      if (error) throw error
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] })
    },
  })
}
