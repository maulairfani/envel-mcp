import { ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatIDR } from "@/lib/format"
import type { Transaction } from "@/hooks/useTransactions"

const TYPE_CONFIG = {
  expense: {
    icon: TrendingDown,
    color: "text-red-600 dark:text-red-400",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/15",
    sign: "-",
  },
  income: {
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/15",
    sign: "+",
  },
  transfer: {
    icon: ArrowRightLeft,
    color: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/15",
    sign: "",
  },
} as const

interface TransactionRowProps {
  transaction: Transaction
  showNominal: boolean
}

export function TransactionRow({ transaction, showNominal }: TransactionRowProps) {
  const cfg = TYPE_CONFIG[transaction.type]
  const Icon = cfg.icon

  const label =
    transaction.type === "transfer"
      ? `${transaction.account} → ${transaction.toAccount}`
      : transaction.payee ?? transaction.envelope ?? "—"

  const subtitle =
    transaction.type === "transfer"
      ? null
      : transaction.envelope

  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/50 rounded-md">
      {/* Icon */}
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 ${cfg.color}`}
      >
        <Icon className="size-4" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-[13px] font-medium">{label}</p>
        {subtitle && (
          <p className="truncate text-[11px] text-muted-foreground">
            {subtitle} · {transaction.account}
          </p>
        )}
      </div>

      {/* Badge + Amount */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Badge
          className={`text-[10px] font-medium h-[18px] ${cfg.badge}`}
        >
          {transaction.type}
        </Badge>
        <span
          className={`text-[13px] font-medium tabular-nums min-w-[80px] text-right ${cfg.color}`}
        >
          {showNominal
            ? `${cfg.sign}${formatIDR(transaction.amount)}`
            : "•••••"}
        </span>
      </div>
    </div>
  )
}
