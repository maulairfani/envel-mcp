import { ChevronLeft, ChevronRight } from "lucide-react"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
  const yearOptions = Array.from({ length: 11 }, (_, idx) => year - 5 + idx)

  function shift(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    onChange(formatPeriod(y, m))
  }

  function selectMonth(nextMonth: string) {
    onChange(formatPeriod(year, Number(nextMonth)))
  }

  function selectYear(nextYear: string) {
    onChange(formatPeriod(Number(nextYear), month))
  }

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        onClick={() => shift(-1)}
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-8"
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="flex h-8 items-center rounded-lg border border-border bg-bg-muted px-1">
        <select
          value={month}
          onChange={(e) => selectMonth(e.target.value)}
          aria-label="Select month"
          className="h-7 w-[58px] rounded-md bg-transparent px-1 text-center text-xs font-heading font-semibold text-text-primary outline-none transition-colors hover:bg-card sm:w-[92px] sm:text-sm"
        >
          {MONTHS.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {MONTHS_SHORT[idx]}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => selectYear(e.target.value)}
          aria-label="Select year"
          className="h-7 w-[66px] rounded-md bg-transparent px-1 text-center text-xs font-heading font-semibold text-text-primary outline-none transition-colors hover:bg-card sm:w-[78px] sm:text-sm"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => shift(1)}
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-8"
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
