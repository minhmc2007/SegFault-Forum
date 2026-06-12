import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface MentionUser {
  username: string
  name: string | null
}

interface MentionAutocompleteProps {
  visible: boolean
  results: MentionUser[]
  selectedIndex: number
  anchorRect: DOMRect | null
  onSelect: (username: string) => void
}

export function MentionAutocomplete({
  visible,
  results,
  selectedIndex,
  anchorRect,
  onSelect,
}: MentionAutocompleteProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && ref.current) {
      ref.current.scrollTop = 0
    }
  }, [visible, results])

  if (!visible || results.length === 0 || !anchorRect) return null

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px] max-h-[200px] overflow-y-auto"
      style={{
        left: anchorRect.left,
        top: anchorRect.top + 4,
      }}
    >
      {results.map((user, i) => (
        <button
          key={user.username}
          type="button"
          className={cn(
            "w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex items-center gap-2",
            i === selectedIndex && "bg-accent"
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(user.username)
          }}
        >
          <span className="font-medium">@{user.username}</span>
          {user.name && (
            <span className="text-xs text-muted-foreground">
              {user.name}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
