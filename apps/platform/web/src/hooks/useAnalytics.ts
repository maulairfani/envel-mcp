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

function transformDaily(rows: DailyExpenseRow[]): DailyExpenseData {
  // Collect unique envelopes
  const envMap = new Map<number, string>()
  for (const r of rows) envMap.set(r.envelope_id, r.envelope_name)
  const envelopes: EnvelopeSeries[] = Array.from(envMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Group by day
  const dayMap = new Map<string, Record<string, number>>()
  for (const r of rows) {
    if (!dayMap.has(r.day)) dayMap.set(r.day, {})
    const entry = dayMap.get(r.day)!
    entry[r.envelope_name] = (entry[r.envelope_name] ?? 0) + r.amount
  }

  const chartData: ChartDay[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([iso, byEnvelope]) => {
      const [, m, d] = iso.split("-")
      const label = `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}`
      let total = 0
      const row: ChartDay = { date: label, dateRaw: iso, total: 0 }
      for (const env of envelopes) {
        const val = byEnvelope[env.name] ?? 0
        row[env.name] = val
        total += val
      }
      row.total = total
      return row
    })

  return { chartData, envelopes }
}

// ── Hook ────────────────────────────────────────────────

export function useDailyExpenses(days = 30): {
  data: DailyExpenseData | null
  loading: boolean
  error: string | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", "daily-expenses", days],
    queryFn: () =>
      api<DailyExpenseRow[]>(`/api/analytics/daily-expenses?days=${days}`),
  })

  return {
    data: data ? transformDaily(data) : null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  }
}
