import { useAuth } from "@/providers/AuthProvider"
import { useProfile, useUpdateProfile } from "@/hooks/useProfile"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Calendar, Globe, MapPin, Pencil, Save, X, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function Profile() {
  const { username } = useParams<{ username: string }>()
  const { data: profile, isLoading, error } = useProfile(username ?? "")
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const isOwner = user?.id === profile?.id

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "")
      setWebsite(profile.website ?? "")
      setLocation(profile.location ?? "")
    }
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Profile not found</h2>
        <p className="text-muted-foreground mt-2">User "{username}" does not exist.</p>
      </div>
    )
  }

  async function handleSave() {
    await updateProfile.mutateAsync({ bio, website, location })
    setEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start gap-6">
        <UserAvatar
          username={profile.username}
          avatarUrl={profile.avatar_url}
          size="xl"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-sm text-muted-foreground">
                {profile.karma} karma
              </p>
            </div>

            {isOwner && (
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : editing ? (
                  <Save className="h-4 w-4 mr-1" />
                ) : (
                  <Pencil className="h-4 w-4 mr-1" />
                )}
                {editing ? "Save" : "Edit"}
              </Button>
            )}
          </div>

          {editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="mt-1">
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          )}

          <div className="mt-4 space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                {profile.bio && <p className="text-sm">{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" /> {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Joined{" "}
                    {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Activity</h2>
        <p className="text-sm text-muted-foreground">Posts and comments will appear here.</p>
      </div>
    </div>
  )
}
