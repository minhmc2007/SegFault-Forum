import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Terminal className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
