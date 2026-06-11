import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Post } from "@/types"

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return []

      const { data } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(username, avatar_url),
          category:categories(name, slug, color)
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("vote_count", { ascending: false })

      return (data ?? []) as unknown as Post[]
    },
    enabled: query.trim().length > 0,
  })
}
