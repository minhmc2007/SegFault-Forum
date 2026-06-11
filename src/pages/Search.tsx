import { useSearchParams } from "react-router-dom"

export function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q")
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search: {query}</h1>
      <p className="text-muted-foreground">Search results coming soon...</p>
    </div>
  )
}
