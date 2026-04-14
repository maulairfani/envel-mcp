import { formatIDR } from "@/lib/format"
import type { DayGroup } from "@/hooks/useTransactions"
import { TransactionRow } from "./TransactionRow"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatDayHeader(iso: string): { label: string; relative: string | null } {
  const [y, m, d] = iso.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayOfWeek = WEEKDAYS[date.getDay()]
  const label = `${dayOfWeek}, ${MONTHS[m - 1]} ${d}`

  const diff = Math.round(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return { label, relative: "Today" }
  if (diff === 1) return { label, relative: "Yesterday" }
  return { label, relative: null }
}

interface TransactionDayGroupProps {
  group: DayGroup
  showNominal: boolean
}

export function TransactionDayGroup({
  group,
  showNominal,
}: TransactionDayGroupProps) {
  const { label, relative } = formatDayHeader(group.date)
  const net = group.income - group.expense

  return (
    <div>
      {/* Day header */}
      <div className="flex items-baseline justify-between px-3.5 py-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[13px] font-semibold font-heading">
            {label}
          </h3>
          {relative && (
            <span className="text-[11px] text-muted-foreground">
              {relative}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3 text-[12px] tabular-nums">
          {group.income > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {showNominal ? `+${formatIDR(group.income)}` : "•••"}
            </span>
          )}
          {group.expense > 0 && (
            <span className="text-red-600 dark:text-red-400 font-medium">
              {showNominal ? `-${formatIDR(group.expense)}` : "•••"}
            </span>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="flex flex-col">
        {group.transactions.map((txn) => (
          <TransactionRow
            key={txn.id}
            transaction={txn}
            showNominal={showNominal}
          />
        ))}
      </div>
    </div>
  )
}
