import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Punishment } from "@/types"

export function usePunishments() {
  return useQuery({
    queryKey: ["admin-punishments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("punishments")
        .select("*, profile:profiles!punishments_user_id_fkey(username, avatar_url)")
        .order("created_at", { ascending: false })
      return (data ?? []) as unknown as (Punishment & { profile: { username: string; avatar_url: string | null } })[]
    },
  })
}

export function useCreatePunishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      user_id,
      type,
      reason,
      expires_at,
    }: {
      user_id: string
      type: "mute" | "ban"
      reason: string
      expires_at: string | null
    }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user_id)
        .single()
      if (!profile) throw new Error("User not found")

      // Deactivate old punishments of same type
      await supabase
        .from("punishments")
        .update({ active: false })
        .eq("user_id", user_id)
        .eq("type", type)
        .eq("active", true)

      const { error } = await supabase.from("punishments").insert({
        user_id,
        type,
        reason,
        expires_at,
        created_by: (await supabase.auth.getUser()).data.user!.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-punishments"] })
    },
  })
}

export function useRevokePunishment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await supabase.from("punishments").update({ active: false }).eq("id", id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-punishments"] })
    },
  })
}
