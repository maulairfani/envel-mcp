import type { ReactNode } from "react"

interface MethodCardProps {
  icon: ReactNode
  title: string
  body: string
  num: number
}

export function MethodCard({ icon, title, body, num }: MethodCardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--brand-light)",
            color: "var(--brand-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink-4)",
            letterSpacing: "0.04em",
          }}
        >
          0{num}
        </span>
      </div>
      <h3 className="h3">{title}</h3>
      <p className="body">{body}</p>
    </div>
  )
}
