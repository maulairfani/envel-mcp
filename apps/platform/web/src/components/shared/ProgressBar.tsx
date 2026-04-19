interface ProgressBarProps {
  /** Current value (0..max, or negative for overspent) */
  value: number
  max: number
  /** Force danger color regardless of value */
  danger?: boolean
  /** Pixel height */
  height?: number
  className?: string
}

export function ProgressBar({
  value,
  max,
  danger,
  height = 5,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const overBudget = value > max && max > 0
  const isDanger = danger || overBudget

  return (
    <div
      className={["w-full overflow-hidden rounded-full bg-bg-muted", className ?? ""].join(" ")}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: isDanger ? "var(--danger)" : "var(--brand)",
        }}
      />
    </div>
  )
}
