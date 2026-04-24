import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface ChartDay {
  date: string
  dateRaw: string
  total: number
  [envelope: string]: number | string
}

export interface EnvelopeSeries {
  id: number
  name: string
}

export interface DailyExpenseData {
  chartData: ChartDay[]
  envelopes: EnvelopeSeries[]
}

// ── API response row ────────────────────────────────────

interface DailyExpenseRow {
  day: string
  envelope_id: number
  envelope_name: string
  amount: number
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function transformDaily(rows: DailyExpenseRow[], period: string): DailyExpenseData {
  const [yearStr, monthStr] = period.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const totalDays = daysInMonth(year, month)

  // Collect unique envelopes
  const envMap = new Map<number, string>()
  for (const r of rows) envMap.set(r.envelope_id, r.envelope_name)
  const envelopes: EnvelopeSeries[] = Array.from(envMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Aggregate rows by day + envelope
  const dayMap = new Map<string, Record<string, number>>()
  for (const r of rows) {
    if (!dayMap.has(r.day)) dayMap.set(r.day, {})
    const entry = dayMap.get(r.day)!
    entry[r.envelope_name] = (entry[r.envelope_name] ?? 0) + r.amount
  }

  // Emit one row per day in the period (zero-fill empty days)
  const chartData: ChartDay[] = []
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const byEnvelope = dayMap.get(iso) ?? {}
    const label = `${MONTHS[month - 1]} ${d}`
    let total = 0
    const row: ChartDay = { date: label, dateRaw: iso, total: 0 }
    for (const env of envelopes) {
      const val = byEnvelope[env.name] ?? 0
      row[env.name] = val
      total += val
    }
    row.total = total
    chartData.push(row)
  }

  return { chartData, envelopes }
}

// ── Hook ────────────────────────────────────────────────

export function useDailyExpenses(period: string): {
  data: DailyExpenseData | null
  loading: boolean
  error: string | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", "daily-expenses", period],
    queryFn: () =>
      api<DailyExpenseRow[]>(`/api/analytics/daily-expenses?period=${period}`),
  })

  return {
    data: data ? transformDaily(data, period) : null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  }
}
