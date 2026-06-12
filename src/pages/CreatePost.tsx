import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"
import { useCategories } from "@/hooks/useCategories"
import { useCreatePost } from "@/hooks/usePosts"
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor"
import { TagInput } from "@/components/posts/TagInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function CreatePost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const createPost = useCreatePost()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState<string>("")

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Sign in to create a post</h2>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    await createPost.mutateAsync(
      {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        tags,
      },
      {
        onSuccess: () => navigate("/"),
      }
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>

        <TagInput tags={tags} onChange={setTags} />

        <div className="relative">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <MarkdownEditor value={content} onChange={setContent} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || !content.trim() || createPost.isPending}>
            {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Publish
          </Button>
        </div>
      </form>
    </div>
  )
}
