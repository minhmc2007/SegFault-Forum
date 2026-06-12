import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@/components/auth/SignInButton"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { SearchBar } from "@/components/search/SearchBar"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Activity, GitCommit, LogOut, Terminal } from "lucide-react"
import { rankLabels, rankColors } from "@/types"
import type { UserRank } from "@/types"

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto max-w-5xl flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
          <Terminal className="h-5 w-5" />
          SegFault
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/changelog"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Changelog"
          >
            <GitCommit className="h-5 w-5" />
          </Link>
          <Link
            to="/status"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="System Status"
          >
            <Activity className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <SearchBar />

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/create">
                <Button size="sm">New Post</Button>
              </Link>

              <div ref={ref} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <UserAvatar
                    username={profile?.username ?? "?"}
                    avatarUrl={profile?.avatar_url ?? null}
                    size="sm"
                  />
                  <span className="text-sm font-medium hidden sm:inline">
                    {profile?.username}
                    {profile?.rank && (
                      <span
                        className="ml-1.5 text-[10px] font-semibold px-1 py-0.5 rounded"
                        style={{ backgroundColor: rankColors[profile.rank as UserRank] + "20", color: rankColors[profile.rank as UserRank] }}
                      >
                        {rankLabels[profile.rank as UserRank]}
                      </span>
                    )}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 p-1.5 rounded-lg border bg-card shadow-lg z-50">
                    <Link
                      to={`/profile/${profile?.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  )
}
