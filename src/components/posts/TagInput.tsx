import { useState } from "react"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("")

  function addTag(raw: string) {
    const name = raw.replace(/^#/, "").trim().toLowerCase()
    if (!name || tags.includes(name) || name.length > 30) return
    onChange([...tags, name])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
      setInput("")
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(name: string) {
    onChange(tags.filter((t) => t !== name))
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
        >
          #{tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Add tags (press Enter or comma)..." : ""}
        className="flex-1 min-w-[80px] bg-transparent outline-none text-sm py-0.5"
      />
    </div>
  )
}
