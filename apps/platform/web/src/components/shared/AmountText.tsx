import { formatIDR } from "@/lib/format"

export type AmountSize = "sm" | "base" | "md" | "lg" | "xl" | "2xl"
export type AmountTone = "auto" | "positive" | "neutral"

interface AmountTextProps {
  /** Amount in rupiah. Negative values render with minus sign. */
  amount: number
  /** Show actual amount or masked dots */
  showNominal?: boolean
  size?: AmountSize
  /**
   * Color behavior:
   * - "auto" (default): negative → danger, positive → primary text (neutral)
   * - "positive": green-tinted success color (for income/available)
   * - "neutral": always primary text
   */
  tone?: AmountTone
  className?: string
}

const SIZE_CLASSES: Record<AmountSize, string> = {
  sm: "text-[12.5px]",
  base: "text-sm",
  md: "text-[15px]",
  lg: "text-[17px]",
  xl: "text-[22px]",
  "2xl": "text-[28px]",
}

export function AmountText({
  amount,
  showNominal = true,
  size = "base",
  tone = "auto",
  className,
}: AmountTextProps) {
  const isNeg = amount < 0

  const toneClass =
    tone === "positive"
      ? "text-[color:var(--success)]"
      : tone === "neutral"
        ? "text-text-primary"
        : isNeg
          ? "text-[color:var(--danger)]"
          : "text-text-primary"

  return (
    <span
      className={[
        "font-semibold tabular-nums",
        SIZE_CLASSES[size],
        toneClass,
        className ?? "",
      ].join(" ")}
    >
      {showNominal ? formatIDR(amount) : "••••••"}
    </span>
  )
}
