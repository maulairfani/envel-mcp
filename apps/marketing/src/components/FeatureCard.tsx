import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  body: string
  muted?: boolean
}

export function FeatureCard({ icon, title, body, muted }: FeatureCardProps) {
  return (
    <div className="card" style={{ opacity: muted ? 0.6 : 1 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: muted ? "var(--border)" : "var(--brand-light)",
          color: muted ? "var(--ink-3)" : "var(--brand-text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h3 className="h3" style={{ marginBottom: 8, color: muted ? "var(--ink-2)" : "var(--ink)" }}>
        {title}
      </h3>
      <p className="body" style={{ color: muted ? "var(--ink-3)" : undefined }}>
        {body}
      </p>
    </div>
  )
}
