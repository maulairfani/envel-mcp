import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { AmountText } from "@/components/shared/AmountText"
import { useDailyExpenses } from "@/hooks/useAnalytics"
import { formatIDRShort } from "@/lib/format"
import { CHART_COLORS } from "@/lib/chart-colors"

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="min-w-40 rounded-md border border-border bg-bg-elevated px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-text-primary">{label}</p>
      {payload.map((entry) =>
        entry.value > 0 ? (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="tabular-nums text-text-secondary">
              {formatIDRShort(entry.value)}
            </span>
          </div>
        ) : null
      )}
      <div className="mt-1 flex justify-between gap-4 border-t border-border-muted pt-1 font-semibold">
        <span className="text-text-primary">Total</span>
        <span className="tabular-nums text-text-primary">
          {formatIDRShort(total)}
        </span>
      </div>
    </div>
  )
}

export function DashboardPage({ showNominal }: { showNominal: boolean }) {
  const { data, loading, error } = useDailyExpenses(30)
  const [excluded, setExcluded] = useState<Set<number>>(new Set())

  const totalExpenses30d = useMemo(() => {
    if (!data) return 0
    return data.chartData.reduce((sum, day) => sum + day.total, 0)
  }, [data])

  // Per-envelope totals across 30 days (for breakdown section)
  const envelopeTotals = useMemo(() => {
    if (!data) return []
    return data.envelopes
      .map((env) => {
        const total = data.chartData.reduce(
          (s, d) => s + ((d[env.name] as number | undefined) ?? 0),
          0
        )
        return { id: env.id, name: env.name, total }
      })
      .sort((a, b) => b.total - a.total)
  }, [data])

  const maxEnvTotal = Math.max(1, ...envelopeTotals.map((e) => e.total))

  const visibleEnvelopes = data?.envelopes.filter((e) => !excluded.has(e.id)) ?? []
  const lastVisible = visibleEnvelopes.at(-1)

  function toggleEnvelope(id: number) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Analytics" />

      <div className="flex-1 overflow-y-auto px-7 py-6">
        {/* Summary */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="mb-0.5 font-heading text-[17px] font-bold text-text-primary">
              Daily Expenses
            </div>
            <div className="text-[12.5px] text-text-muted">
              Last 30 days · stacked by envelope
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-[11px] text-text-muted">Total · 30 days</div>
            <AmountText
              amount={totalExpenses30d}
              showNominal={showNominal}
              size="xl"
              tone="neutral"
            />
          </div>
        </div>

        {/* Legend */}
        {data && (
          <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5">
            {data.envelopes.map((env, i) => {
              const active = !excluded.has(env.id)
              const color = CHART_COLORS[i % CHART_COLORS.length]
              return (
                <button
                  key={env.id}
                  onClick={() => toggleEnvelope(env.id)}
                  aria-pressed={active}
                  aria-label={`${active ? "Hide" : "Show"} ${env.name}`}
                  className={`inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity ${
                    active ? "text-text-secondary" : "text-text-muted line-through opacity-60"
                  }`}
                >
                  <span
                    className="inline-block size-2 rounded-sm"
                    style={{ background: color }}
                  />
                  {env.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          {error ? (
            <div className="flex h-64 items-center justify-center text-sm text-[color:var(--danger)]">
              Failed to load data: {error}
            </div>
          ) : loading ? (
            <div className="h-[280px] w-full animate-pulse rounded-md bg-bg-muted" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data?.chartData}
                margin={{ top: 8, right: 8, left: -4, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={formatIDRShort}
                  tick={
                    showNominal
                      ? { fontSize: 10, fill: "var(--text-muted)" }
                      : false
                  }
                  tickLine={false}
                  axisLine={false}
                  width={showNominal ? 48 : 8}
                />
                <Tooltip
                  content={showNominal ? <ChartTooltip /> : <></>}
                  cursor={showNominal ? { fill: "var(--bg-muted)", opacity: 0.4 } : false}
                />
                {data?.envelopes.map((env, i) => {
                  if (excluded.has(env.id)) return null
                  return (
                    <Bar
                      key={env.id}
                      dataKey={env.name}
                      stackId="expenses"
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      radius={env.id === lastVisible?.id ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  )
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By category breakdown */}
        {data && envelopeTotals.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 font-heading text-[15px] font-bold text-text-primary">
              By Category
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {envelopeTotals.map((env, i) => {
                const color = CHART_COLORS[i % CHART_COLORS.length]
                return (
                  <div
                    key={env.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-xs"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="truncate text-[12.5px] font-semibold text-text-primary">
                        {env.name}
                      </span>
                      <span className="text-[12.5px] font-semibold tabular-nums text-text-secondary">
                        {showNominal ? `Rp ${(env.total / 1000).toFixed(0)}k` : "•••"}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-sm bg-bg-muted">
                      <div
                        className="h-full rounded-sm transition-[width] duration-700"
                        style={{
                          width: `${(env.total / maxEnvTotal) * 100}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  )
}
