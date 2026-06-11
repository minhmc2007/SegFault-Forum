import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"
import type { Profile } from "@/types"

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
      return { ...data, karma: data.karma ?? 10 } as Profile
    },
    enabled: !!username,
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
