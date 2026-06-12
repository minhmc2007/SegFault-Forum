import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"
import { censor } from "@/lib/profanity"
import type { Post, SortOption, Tag } from "@/types"

async function attachTags(post: Post): Promise<Post> {
  const { data: tags } = await supabase
    .from("post_tags")
    .select("tag:tags(id, name, slug)")
    .eq("post_id", post.id)

  return {
    ...post,
    tags: (tags ?? []).map((t: any) => t.tag).filter(Boolean) as Tag[],
  }
}

async function saveTags(postId: string, tagNames: string[]) {
  for (const name of tagNames) {
    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("name", name)
      .maybeSingle()

    let tagId: number
    if (existing) {
      tagId = existing.id
    } else {
      const { data: newTag } = await supabase
        .from("tags")
        .insert({ name, slug: name })
        .select("id")
        .single()
      tagId = newTag!.id
    }

    await supabase.from("post_tags").insert({ post_id: postId, tag_id: tagId })
  }
}

const postQuery = `
  *,
  author:profiles!posts_user_id_fkey(username, avatar_url, rank),
  category:categories(name, slug, color)
`

export function usePosts(sort: SortOption = "new") {
  return useQuery({
    queryKey: ["posts", sort],
    queryFn: async () => {
      let query = supabase.from("posts").select(postQuery)

      if (sort === "new") query = query.order("created_at", { ascending: false })
      else if (sort === "top") query = query.order("vote_count", { ascending: false })
      else query = query.order("created_at", { ascending: false })

      const { data } = await query
      const posts = (data ?? []) as unknown as Post[]
      return Promise.all(posts.map(attachTags))
    },
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select(postQuery)
        .eq("id", id)
        .single()

      if (!data) throw new Error("Post not found")
      return attachTags(data as unknown as Post)
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
      tags,
    }: {
      title: string
      content: string
      category_id: number | null
      tags: string[]
    }) => {
      if (!user) throw new Error("Not authenticated")
      const { data, error } = await supabase
        .from("posts")
        .insert({ title: censor(title), content: censor(content), category_id, user_id: user.id })
        .select("id")
        .single()
      if (error) throw error

      if (tags.length > 0) {
        await saveTags(data!.id, tags)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      postId,
      title,
      content,
      category_id,
      tags,
    }: {
      postId: string
      title: string
      content: string
      category_id: number | null
      tags?: string[]
    }) => {
      await supabase.from("posts").update({ title: censor(title), content: censor(content), category_id }).eq("id", postId)

      if (tags !== undefined) {
        await supabase.from("post_tags").delete().eq("post_id", postId)
        if (tags.length > 0) {
          await saveTags(postId, tags)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["post"] })
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
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
