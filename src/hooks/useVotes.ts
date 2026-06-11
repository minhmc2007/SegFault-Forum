import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"

export function useVote() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      postId,
      voteType,
    }: {
      postId: string
      voteType: 1 | -1
    }) => {
      if (!user) throw new Error("Not authenticated")

      const { data: existing } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single()

      if (existing) {
        if (existing.vote_type === voteType) {
          await supabase.from("votes").delete().eq("id", existing.id)
        } else {
          await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("id", existing.id)
        }
      } else {
        await supabase.from("votes").insert({
          user_id: user.id,
          post_id: postId,
          vote_type: voteType,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}
