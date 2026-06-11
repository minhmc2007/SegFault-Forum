import { Link } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@/components/auth/SignInButton"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { SearchBar } from "@/components/search/SearchBar"
import { Terminal } from "lucide-react"

export function Header() {
  const { user, profile } = useAuth()

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto max-w-5xl flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
          <Terminal className="h-5 w-5" />
          SegFault
        </Link>

        <div className="flex items-center gap-3">
          <SearchBar />

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/create">
                <Button size="sm">New Post</Button>
              </Link>

              <Link
                to={`/profile/${profile?.username}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <UserAvatar
                  username={profile?.username ?? "?"}
                  avatarUrl={profile?.avatar_url ?? null}
                  size="sm"
                />
                <span className="text-sm font-medium hidden sm:inline">
                  {profile?.username}
                </span>
              </Link>
            </div>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  )
}
