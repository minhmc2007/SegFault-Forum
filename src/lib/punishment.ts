import { supabase } from "@/lib/supabase"

export async function isPunished(userId: string, type: "mute" | "ban"): Promise<boolean> {
  const { data } = await supabase
    .rpc("is_user_punished", { uid: userId, ptype: type })
    .single()
  return data ?? false
}
