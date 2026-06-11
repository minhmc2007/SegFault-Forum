import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types"

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchProfileWithRetry(userId: string, maxRetries = 5): Promise<Profile | null> {
  for (let i = 0; i < maxRetries; i++) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (data) {
      return { ...data, karma: data.karma ?? 10 }
    }

    if (i < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async (userId: string) => {
    const p = await fetchProfileWithRetry(userId)
    setProfile(p)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) refreshProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) refreshProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [refreshProfile])

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, signInWithGithub, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
