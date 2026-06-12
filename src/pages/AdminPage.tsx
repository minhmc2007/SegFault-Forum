import { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useReports, useUpdateReport } from "@/hooks/useReports"
import { usePunishments, useCreatePunishment, useRevokePunishment } from "@/hooks/usePunishments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ShieldAlert } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export function AdminPage() {
  const { profile } = useAuth()
  const { data: reports } = useReports()
  const updateReport = useUpdateReport()
  const { data: punishments } = usePunishments()
  const createPunishment = useCreatePunishment()
  const revokePunishment = useRevokePunishment()

  const [tab, setTab] = useState<"reports" | "punishments">("reports")
  const [userId, setUserId] = useState("")
  const [pType, setPType] = useState<"mute" | "ban">("mute")
  const [pReason, setPReason] = useState("")
  const [pDuration, setPDuration] = useState("")

  if (!profile?.is_admin) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Admin only</h2>
      </div>
    )
  }

  async function handlePunish(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim() || !pReason.trim()) return
    let expires_at: string | null = null
    if (pType === "mute" && pDuration) {
      const hours = parseInt(pDuration)
      if (!isNaN(hours)) {
        expires_at = new Date(Date.now() + hours * 3600000).toISOString()
      }
    }
    await createPunishment.mutateAsync({
      user_id: userId.trim(),
      type: pType,
      reason: pReason.trim(),
      expires_at,
    })
    setPReason("")
    setPDuration("")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-6">
        <Button size="sm" variant={tab === "reports" ? "default" : "outline"} onClick={() => setTab("reports")}>
          Reports ({reports?.filter((r) => r.status === "pending").length ?? 0})
        </Button>
        <Button size="sm" variant={tab === "punishments" ? "default" : "outline"} onClick={() => setTab("punishments")}>
          Punishments
        </Button>
      </div>

      {tab === "reports" && (
        <div className="space-y-3">
          {!reports || reports.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reports</p>
          ) : (
            reports.map((r) => (
              <div key={r.id} className={cn("p-4 border rounded-lg bg-card", r.status !== "pending" && "opacity-60")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      r.status === "pending" && "bg-yellow-100 text-yellow-800",
                      r.status === "reviewed" && "bg-green-100 text-green-800",
                      r.status === "dismissed" && "bg-gray-100 text-gray-800",
                    )}>
                      {r.status}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {r.content_type} &middot; {r.content_id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-2">{r.reason}</p>
                {r.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="default" onClick={() => updateReport.mutate({ id: r.id, status: "reviewed" })}>
                      Reviewed
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateReport.mutate({ id: r.id, status: "dismissed" })}>
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "punishments" && (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-card">
            <h2 className="font-semibold mb-3">Apply Punishment</h2>
            <form onSubmit={handlePunish} className="space-y-3">
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID"
                required
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={pType === "mute" ? "default" : "outline"} onClick={() => setPType("mute")}>
                  Mute
                </Button>
                <Button type="button" size="sm" variant={pType === "ban" ? "default" : "outline"} onClick={() => setPType("ban")}>
                  Ban
                </Button>
              </div>
              <Textarea
                value={pReason}
                onChange={(e) => setPReason(e.target.value)}
                placeholder="Reason"
                required
              />
              {pType === "mute" && (
                <Input
                  value={pDuration}
                  onChange={(e) => setPDuration(e.target.value)}
                  placeholder="Duration in hours (leave empty for permanent)"
                  type="number"
                  min="1"
                />
              )}
              <Button type="submit" disabled={createPunishment.isPending}>
                {createPunishment.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Apply
              </Button>
            </form>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold">History</h2>
            {!punishments || punishments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No punishments</p>
            ) : (
              punishments.map((p) => (
                <div key={p.id} className={cn("p-3 border rounded-lg bg-card text-sm", !p.active && "opacity-50")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        p.type === "ban" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800",
                      )}>
                        {p.type}
                      </span>
                      <span className="font-medium">{p.profile?.username ?? p.user_id.slice(0, 8)}</span>
                      {!p.active && <span className="text-xs text-muted-foreground">(revoked)</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.reason}</p>
                  {p.expires_at && <p className="text-xs text-muted-foreground">Expires: {new Date(p.expires_at).toLocaleString()}</p>}
                  {p.active && (
                    <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => revokePunishment.mutate(p.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
