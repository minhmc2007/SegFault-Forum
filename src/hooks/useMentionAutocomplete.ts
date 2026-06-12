import { useState, useCallback, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface MentionUser {
  username: string
  name: string | null
}

export function useMentionAutocomplete() {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState(0)
  const [results, setResults] = useState<MentionUser[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!mentionQuery) {
      setResults([])
      return
    }
    clearTimeout(fetchTimer.current)
    fetchTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, name")
        .ilike("username", `${mentionQuery}%`)
        .limit(8)
      setResults(data ?? [])
      setSelectedIndex(0)
    }, 150)
    return () => clearTimeout(fetchTimer.current)
  }, [mentionQuery])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!mentionQuery || results.length === 0) return false

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        return true
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return true
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertMention(results[selectedIndex].username)
        return true
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setMentionQuery(null)
        return true
      }
      return false
    },
    [mentionQuery, results, selectedIndex]
  )

  const insertMention = useCallback(
    (username: string) => {
      if (!textareaRef.current || mentionQuery === null) return
      const ta = textareaRef.current
      const start = cursorPos - mentionQuery.length - 1
      const before = ta.value.slice(0, start)
      const after = ta.value.slice(cursorPos)
      const newValue = before + `@${username} ` + after
      const newCursor = start + username.length + 2

      // Use native input event to trigger React onChange
      const nativeInputValue = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      )
      const nativeSetter = nativeInputValue?.set
      nativeSetter?.call(ta, newValue)
      ta.dispatchEvent(new Event("input", { bubbles: true }))
      ta.setSelectionRange(newCursor, newCursor)
      ta.focus()
      setMentionQuery(null)
    },
    [mentionQuery, cursorPos]
  )

  const handleChange = useCallback(
    (value: string, cursor: number, ta: HTMLTextAreaElement) => {
      textareaRef.current = ta
      setCursorPos(cursor)
      const textBefore = value.slice(0, cursor)
      const atIndex = textBefore.lastIndexOf("@")
      if (atIndex === -1 || (atIndex > 0 && textBefore[atIndex - 1] === "/")) {
        setMentionQuery(null)
        return
      }
      // Check there's no space between @ and cursor
      const afterAt = textBefore.slice(atIndex + 1)
      if (afterAt.includes(" ") || afterAt.includes("\n")) {
        setMentionQuery(null)
        return
      }
      setMentionQuery(afterAt)
      // Compute anchor position for dropdown
      const rect = ta.getBoundingClientRect()
      const lineHeight = parseInt(getComputedStyle(ta).lineHeight) || 20
      const textBeforeLines = textBefore.slice(0, atIndex).split("\n")
      const line = textBeforeLines.length - 1
      const col = textBeforeLines[line].length
      const scrollTop = ta.scrollTop
      setAnchorRect(
        new DOMRect(
          rect.left + col * 8,
          rect.top + (line + 1) * lineHeight - scrollTop,
          0,
          0
        )
      )
    },
    []
  )

  return {
    mentionQuery,
    results,
    selectedIndex,
    anchorRect,
    handleChange,
    handleKeyDown,
    insertMention,
  }
}
