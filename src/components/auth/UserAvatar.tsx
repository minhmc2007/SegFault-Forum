import { cn } from "@/lib/utils"

interface UserAvatarProps {
  username: string
  avatarUrl: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-xl",
}

export function UserAvatar({ username, avatarUrl, size = "md", className }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={cn("rounded-full border object-cover", sizeMap[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border",
        sizeMap[size],
        className
      )}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  )
}
