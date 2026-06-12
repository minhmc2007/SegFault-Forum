import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/providers/AuthProvider"

export function useCreateReport() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      content_type,
      content_id,
      reason,
    }: {
      content_type: "post" | "comment" | "profile"
      content_id: string
      reason: string
    }) => {
      if (!user) throw new Error("Not authenticated")
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        content_type,
        content_id,
        reason,
      })
      if (error) throw error
    },
  })
}

export function useReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
      return (data ?? []) as unknown as any[]
    },
  })
}

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number
      status: "reviewed" | "dismissed"
    }) => {
      const { error } = await supabase
        .from("reports")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] })
    },
  })
}
