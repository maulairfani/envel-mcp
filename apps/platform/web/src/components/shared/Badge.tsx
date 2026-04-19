import type { ReactNode } from "react"

export type BadgeColor = "brand" | "danger" | "warning" | "success" | "muted"
export type BadgeSize = "xs" | "sm"

interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  size?: BadgeSize
  className?: string
}

const COLOR_CLASSES: Record<BadgeColor, string> = {
  brand: "bg-brand-light text-brand-text",
  danger: "bg-danger-light text-[color:var(--danger)]",
  warning: "bg-warning-light text-[color:var(--warning)]",
  success: "bg-success-light text-[color:var(--success)]",
  muted: "bg-bg-muted text-text-muted",
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: "px-1.5 py-px text-[10px]",
  sm: "px-2 py-0.5 text-[11px]",
}

export function Badge({
  children,
  color = "muted",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-semibold tracking-wide",
        COLOR_CLASSES[color],
        SIZE_CLASSES[size],
        className ?? "",
      ].join(" ")}
    >
      {children}
    </span>
  )
}
