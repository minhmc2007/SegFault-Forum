import { supabase } from "@/lib/supabase"

const MENTION_REGEX = /@(\w+)/g

export function extractMentions(content: string): string[] {
  const matches = content.match(MENTION_REGEX)
  if (!matches) return []
  const usernames = matches.map((m) => m.slice(1))
  return [...new Set(usernames)]
}

export async function resolveMentionUsers(usernames: string[]): Promise<Map<string, string>> {
  if (usernames.length === 0) return new Map()
  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", usernames)
  const map = new Map<string, string>()
  if (data) {
    for (const p of data) {
      map.set(p.username, p.id)
    }
  }
  return map
}

export function renderMentions(content: string): string {
  return content.replace(MENTION_REGEX, (_match, username) => {
    return `[@${username}](#/profile/${username})`
  })
}
