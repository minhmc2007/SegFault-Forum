import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"
import { usePost, useUpdatePost } from "@/hooks/usePosts"
import { useCategories } from "@/hooks/useCategories"
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

export function EditPost() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: post, isLoading } = usePost(id ?? "")
  const { data: categories } = useCategories()
  const updatePost = useUpdatePost()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState("")

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
      setTags(post.tags?.map((t) => t.name) ?? [])
      setCategoryId(post.category_id ? String(post.category_id) : "")
    }
  }, [post])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Post not found</h2>
      </div>
    )
  }

  const editPostId = post.id

  if (!user || user.id !== post.user_id) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Unauthorized</h2>
        <p className="text-muted-foreground mt-2">You can only edit your own posts.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    await updatePost.mutateAsync(
      {
        postId: editPostId,
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        tags,
      },
      { onSuccess: () => navigate(`/post/${editPostId}`) }
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />

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

        <TagInput tags={tags} onChange={setTags} />

        <MarkdownEditor value={content} onChange={setContent} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || !content.trim() || updatePost.isPending}>
            {updatePost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
