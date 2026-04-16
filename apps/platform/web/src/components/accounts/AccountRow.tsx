import { formatIDR } from "@/lib/format"
import type { Account } from "@/hooks/useAccounts"

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Cash",
}

const TYPE_ICONS: Record<string, string> = {
  bank: "🏦",
  ewallet: "📱",
  cash: "💵",
}

interface AccountRowProps {
  account: Account
  showNominal: boolean
  onClick: () => void
}

export function AccountRow({ account, showNominal, onClick }: AccountRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-muted/50 cursor-pointer"
    >
      {/* Icon */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-lg leading-none">
        {TYPE_ICONS[account.type] ?? "💰"}
      </div>

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{account.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {TYPE_LABELS[account.type]}
        </p>
      </div>

      {/* Balance */}
      <div className="shrink-0 text-right">
        <p
          className={`text-[13px] font-medium tabular-nums ${
            account.balance < 0
              ? "text-red-600 dark:text-red-400"
              : "text-foreground"
          }`}
        >
          {showNominal ? formatIDR(account.balance) : "•••••"}
        </p>
      </div>
    </button>
  )
}
