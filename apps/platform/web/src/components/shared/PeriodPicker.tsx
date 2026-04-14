import { ChevronLeft, ChevronRight } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export interface PeriodPickerProps {
  /** YYYY-MM */
  period: string
  onChange: (period: string) => void
}

function parsePeriod(period: string): { year: number; month: number } {
  const [y, m] = period.split("-").map(Number)
  return { year: y, month: m }
}

function formatPeriod(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function PeriodPicker({ period, onChange }: PeriodPickerProps) {
  const { year, month } = parsePeriod(period)

  function shift(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    onChange(formatPeriod(y, m))
  }

  const label = `${MONTHS[month - 1]} ${year}`

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => shift(-1)}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="min-w-[140px] text-center text-sm font-heading font-semibold">
        {label}
      </span>
      <button
        onClick={() => shift(1)}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

/** Get current month as YYYY-MM */
export function currentPeriod(): string {
  const now = new Date()
  return formatPeriod(now.getFullYear(), now.getMonth() + 1)
}

/** Filter transactions to a YYYY-MM period */
export function filterByPeriod<T extends { date: string }>(
  items: T[],
  period: string
): T[] {
  return items.filter((item) => item.date.startsWith(period))
}
