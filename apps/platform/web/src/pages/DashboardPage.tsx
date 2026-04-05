import { useQuery } from "@tanstack/react-query"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { getDashboard, getTransactions } from "@/lib/api"
import { cn, formatIDR, formatShortIDR } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Envelope {
  id: number
  name: string
  icon: string | null
  group_name: string
  assigned: number
  carryover: number
  activity: number
  available: number
  pct: number
  overspent: boolean
}

interface DashboardData {
  period: string
  accounts: { name: string; type: string; balance: number }[]
  accounts_total: number
  envelopes: Envelope[]
  summary: { income: number; expense: number; surplus: number }
  trend: { labels: string[]; incomes: number[]; expenses: number[] }
}

interface Transaction {
  id: number
  date: string
  type: string
  amount: number
  payee: string
  memo: string | null
  account_name: string
  envelope_name: string | null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = "default",
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  variant?: "default" | "positive" | "negative" | "warning"
}) {
  const iconColors = {
    default: "text-muted-foreground",
    positive: "text-chart-1",
    negative: "text-chart-5",
    warning: "text-chart-3",
  }
  return (
    <div className="bg-card rounded-xl border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon size={16} className={iconColors[variant]} />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function EnvelopeRow({ envelope }: { envelope: Envelope }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={cn("flex items-center gap-1.5", envelope.overspent && "text-destructive font-medium")}>
          {envelope.overspent && <AlertTriangle size={12} />}
          {envelope.icon && <span>{envelope.icon}</span>}
          {envelope.name}
        </span>
        <span className={cn("tabular-nums", envelope.overspent ? "text-destructive" : "text-muted-foreground")}>
          {formatShortIDR(envelope.available)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            envelope.overspent
              ? "bg-destructive"
              : envelope.pct >= 80
              ? "bg-chart-3"
              : "bg-chart-1"
          )}
          style={{ width: `${Math.min(100, envelope.pct)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{formatShortIDR(envelope.activity)} spent</span>
        <span>of {formatShortIDR(envelope.assigned)}</span>
      </div>
    </div>
  )
}

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: dash, isLoading: dashLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard().then((r) => r.data),
  })

  const { data: recentTx } = useQuery<Transaction[]>({
    queryKey: ["transactions", "recent"],
    queryFn: () => getTransactions({ limit: 5 }).then((r) => r.data),
  })

  if (dashLoading || !dash) {
    return (
      <div className="space-y-6">
        {/* Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-5 h-28 animate-pulse bg-muted" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-xl border h-64 animate-pulse bg-muted" />
          <div className="bg-card rounded-xl border h-64 animate-pulse bg-muted" />
        </div>
      </div>
    )
  }

  const { summary, trend, envelopes, accounts_total, period } = dash

  // Ready to Assign = total balance - total assigned in envelopes
  const totalAssigned = envelopes.reduce((s, e) => s + e.assigned + e.carryover, 0)
  const readyToAssign = accounts_total - totalAssigned

  // Trend chart data
  const trendData = trend.labels.map((label, i) => ({
    month: label.slice(5), // "2026-01" → "01"
    income: trend.incomes[i],
    expense: trend.expenses[i],
  }))

  // Spending by category (top 5 by activity)
  const topEnvelopes = [...envelopes]
    .filter((e) => e.activity > 0)
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 5)

  const pieData = topEnvelopes.map((e) => ({ name: e.name, value: e.activity }))

  // Overspent envelopes
  const overspentList = envelopes.filter((e) => e.overspent)

  // Period label
  const [year, month] = period.split("-")
  const periodLabel = new Date(Number(year), Number(month) - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{periodLabel}</h2>
        {overspentList.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
            <AlertTriangle size={11} />
            {overspentList.length} envelope{overspentList.length > 1 ? "s" : ""} overspent
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={formatShortIDR(accounts_total)}
          sub={`${dash.accounts.length} accounts`}
          icon={Wallet}
        />
        <StatCard
          label="Income"
          value={formatShortIDR(summary.income)}
          sub={periodLabel}
          icon={TrendingUp}
          variant="positive"
        />
        <StatCard
          label="Expenses"
          value={formatShortIDR(summary.expense)}
          sub={periodLabel}
          icon={TrendingDown}
          variant="negative"
        />
        <StatCard
          label="Ready to Assign"
          value={formatShortIDR(readyToAssign)}
          sub={readyToAssign < 0 ? "Over-assigned!" : "Available to budget"}
          icon={Wallet}
          variant={readyToAssign < 0 ? "negative" : readyToAssign < 100_000 ? "warning" : "positive"}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-medium">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatShortIDR(v)} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip
                formatter={(v) => formatIDR(Number(v))}
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="income" stroke="var(--color-chart-1)" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="var(--color-chart-5)" fill="url(#expenseGrad)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by category */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-medium">Spending Breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <div className="flex justify-center">
                <PieChart width={140} height={140}>
                  <Pie data={pieData} cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <ul className="space-y-2">
                {pieData.map((item, i) => (
                  <li key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                    </span>
                    <span className="tabular-nums font-medium">{formatShortIDR(item.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No spending this month.</p>
          )}
        </div>
      </div>

      {/* Envelopes + Recent transactions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Envelope progress */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 space-y-5">
          <h3 className="text-sm font-medium">Budget Progress</h3>
          {envelopes.length > 0 ? (
            <div className="space-y-5">
              {envelopes.map((e) => (
                <EnvelopeRow key={e.id} envelope={e} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No envelopes set up yet.</p>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="text-sm font-medium">Recent Transactions</h3>
          {recentTx && recentTx.length > 0 ? (
            <ul className="space-y-3">
              {recentTx.map((tx) => (
                <li key={tx.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.payee}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.envelope_name ?? tx.account_name}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm tabular-nums shrink-0 font-medium",
                      tx.type === "income" ? "text-chart-1" : tx.type === "expense" ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                    {formatShortIDR(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No recent transactions.</p>
          )}
        </div>
      </div>
    </div>
  )
}
