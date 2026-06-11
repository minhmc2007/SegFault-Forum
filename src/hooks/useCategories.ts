import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Category } from "@/types"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name")
      return (data ?? []) as Category[]
    },
    staleTime: Infinity,
  })
}
