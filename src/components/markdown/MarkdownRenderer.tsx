import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { renderMentions } from "@/lib/mentions"
import type { Components } from "react-markdown"

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "")
    const code = String(children).replace(/\n$/, "")

    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      )
    }

    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  pre({ children }) {
    return <div className="my-4">{children}</div>
  },
  img({ src, alt }) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className="max-w-full rounded-lg border my-4"
      />
    )
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    )
  },
}

function VideoEmbed({ src }: { src?: string }) {
  if (!src) return null
  return (
    <video
      src={src}
      controls
      className="max-w-full rounded-lg border my-4"
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{ ...components, video: VideoEmbed }}
      >
        {renderMentions(content)}
      </Markdown>
    </div>
  )
}
