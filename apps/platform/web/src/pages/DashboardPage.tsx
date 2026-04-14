import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, Inbox } from "lucide-react"
import { useDailyExpenses } from "@/hooks/useAnalytics"

const MOCK_RTA = {
  ready_to_assign: 1_850_000,
}

const MOCK_OVERSPENT = [
  { id: 1, name: "Groceries", budgeted: 1_500_000, spent: 1_820_000 },
  { id: 2, name: "Transport", budgeted: 500_000, spent: 612_000 },
]

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#a78bfa",
  "#fb923c",
  "#34d399",
  "#f472b6",
  "#60a5fa",
]

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatIDRShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

function CustomTooltip({
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
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm min-w-40">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) =>
        entry.value > 0 ? (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono">{formatIDRShort(entry.value)}</span>
          </div>
        ) : null
      )}
      <div className="mt-1 pt-1 border-t flex justify-between gap-4 font-medium">
        <span>Total</span>
        <span className="font-mono">{formatIDRShort(total)}</span>
      </div>
    </div>
  )
}

export function DashboardPage({ showNominal }: { showNominal: boolean }) {
  const { ready_to_assign } = MOCK_RTA

  const { data, loading, error } = useDailyExpenses(30)
  const [excluded, setExcluded] = useState<Set<number>>(new Set())

  function toggleEnvelope(id: number) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visibleEnvelopes = data?.envelopes.filter((e) => !excluded.has(e.id)) ?? []
  const lastVisible = visibleEnvelopes.at(-1)

  return (
    <div className="flex flex-col gap-6">
      {/* Needs Attention */}
      {(ready_to_assign > 0 || MOCK_OVERSPENT.length > 0) && (
        <div className="rounded-xl border bg-card divide-y">
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Needs attention
            </span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {(ready_to_assign > 0 ? 1 : 0) + MOCK_OVERSPENT.length}
            </span>
          </div>

          {ready_to_assign > 0 && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Inbox className="size-4 shrink-0 text-blue-500" />
              <div className="flex-1 min-w-0">
                <span className="text-sm">Ready to assign</span>
                <span className="text-sm text-muted-foreground"> · assign it to your envelopes</span>
              </div>
              <span className="text-sm font-medium tabular-nums text-blue-600 dark:text-blue-400 shrink-0">
                {showNominal ? formatIDR(ready_to_assign) : "••••••"}
              </span>
            </div>
          )}

          {MOCK_OVERSPENT.map((env) => (
            <div key={env.id} className="flex items-center gap-3 px-4 py-3">
              <AlertTriangle className="size-4 shrink-0 text-red-500" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{env.name}</span>
                <span className="text-sm text-muted-foreground"> · overspent by{" "}
                  {showNominal ? formatIDR(env.spent - env.budgeted) : "••••••"}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-medium tabular-nums text-destructive">
                  {showNominal ? formatIDR(env.spent) : "••••••"}
                </span>
                <span className="text-xs text-muted-foreground block">
                  of {showNominal ? formatIDR(env.budgeted) : "••••••"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Expenses Chart */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Daily Expenses</h2>
          <p className="text-sm text-muted-foreground">
            Last 30 days · stacked by envelope
          </p>
        </div>

        {data && (
          <div className="flex flex-wrap gap-2 mb-4">
            {data.envelopes.map((env, i) => {
              const active = !excluded.has(env.id)
              const color = COLORS[i % COLORS.length]
              return (
                <button
                  key={env.id}
                  onClick={() => toggleEnvelope(env.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity ${
                    active ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  {env.name}
                </button>
              )
            })}
          </div>
        )}

        {error ? (
          <div className="flex items-center justify-center h-64 text-destructive text-sm">
            Failed to load data: {error}
          </div>
        ) : loading ? (
          <div className="h-72 w-full rounded-lg bg-muted/40 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data?.chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                className="fill-muted-foreground"
              />
              <YAxis
                tickFormatter={formatIDRShort}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={48}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={showNominal ? <CustomTooltip /> : <></>}
                cursor={{ fill: "rgba(0,0,0,0.06)" }}
              />
              {data?.envelopes.map((env, i) => {
                if (excluded.has(env.id)) return null
                return (
                  <Bar
                    key={env.id}
                    dataKey={env.name}
                    stackId="expenses"
                    fill={COLORS[i % COLORS.length]}
                    radius={
                      env.id === lastVisible?.id ? [4, 4, 0, 0] : [0, 0, 0, 0]
                    }
                  />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
