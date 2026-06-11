import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    },
    [query, navigate]
  )

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-8 w-48"
      />
    </form>
  )
}
